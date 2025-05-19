import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertMiningOperationSchema, 
  insertUserStakeSchema, 
  insertUserInventorySchema,
  insertUserActivitySchema
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default data (staking pools, store items)
  await storage.initializeDefaultData();
  
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Mining routes
  app.get("/api/mining", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const operation = await storage.getMiningOperation(userId);
    
    if (!operation) {
      // Create a new mining operation if none exists
      const newOperation = await storage.createMiningOperation({ 
        userId, 
        isActive: true
      });
      
      return res.status(200).json(newOperation);
    }
    
    return res.status(200).json(operation);
  });
  
  app.post("/api/mining/start", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    let operation = await storage.getMiningOperation(userId);
    
    if (operation) {
      // Update existing operation
      operation = await storage.updateMiningOperation(operation.id, { 
        isActive: true,
        startedAt: new Date(),
        sessionEarnings: 0
      });
    } else {
      // Create new operation
      operation = await storage.createMiningOperation({
        userId,
        isActive: true
      });
    }
    
    return res.status(200).json(operation);
  });
  
  app.post("/api/mining/stop", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const operation = await storage.getMiningOperation(userId);
    
    if (!operation) {
      return res.status(404).json({ message: "No active mining operation found" });
    }
    
    const updatedOperation = await storage.updateMiningOperation(operation.id, { isActive: false });
    return res.status(200).json(updatedOperation);
  });
  
  app.post("/api/mining/collect", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    const operation = await storage.getMiningOperation(userId);
    
    if (!user || !operation) {
      return res.status(404).json({ message: "User or mining operation not found" });
    }
    
    if (!operation.isActive) {
      return res.status(400).json({ message: "Mining operation is not active" });
    }
    
    // Calculate mining reward based on mining power and time since last reward
    const now = new Date();
    const lastRewardTime = operation.lastRewardAt || operation.startedAt;
    const hoursSinceLastReward = (now.getTime() - lastRewardTime.getTime()) / 3600000;
    
    // Base rate is 1 point per hour per 25 mining power
    const hourlyRate = user.miningPower / 25;
    let reward = Math.floor(hourlyRate * hoursSinceLastReward);
    
    // Minimum 1 point if any time has passed
    if (hoursSinceLastReward > 0 && reward === 0) {
      reward = 1;
    }
    
    if (reward <= 0) {
      return res.status(400).json({ message: "No rewards available yet" });
    }
    
    // Update user points
    const updatedUser = await storage.updateUser(userId, {
      points: user.points + reward,
      lastMiningReward: now
    });
    
    // Update mining operation
    const updatedOperation = await storage.updateMiningOperation(operation.id, {
      lastRewardAt: now,
      sessionEarnings: operation.sessionEarnings + reward
    });
    
    // Log activity
    await storage.createUserActivity({
      userId,
      type: "mining",
      amount: reward,
      description: "Mining Reward"
    });
    
    return res.status(200).json({
      reward,
      totalPoints: updatedUser?.points,
      miningOperation: updatedOperation
    });
  });
  
  // Staking routes
  app.get("/api/staking/pools", async (req, res) => {
    const pools = await storage.getStakingPools();
    return res.status(200).json(pools);
  });
  
  app.get("/api/staking/stakes", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const stakes = await storage.getUserStakes(userId);
    return res.status(200).json(stakes);
  });
  
  app.post("/api/staking/stake", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const userId = req.user!.id;
      const stakeData = insertUserStakeSchema.parse({
        userId,
        ...req.body
      });
      
      const user = await storage.getUser(userId);
      const pool = await storage.getStakingPool(stakeData.poolId);
      
      if (!user || !pool) {
        return res.status(404).json({ message: "User or staking pool not found" });
      }
      
      if (!pool.isActive) {
        return res.status(400).json({ message: "This staking pool is not active" });
      }
      
      if (stakeData.amount < pool.minStake) {
        return res.status(400).json({ message: `Minimum stake amount is ${pool.minStake}` });
      }
      
      if (user.points < stakeData.amount) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      
      // Create the stake
      const stake = await storage.createUserStake(stakeData);
      
      // Calculate end date if there's a lock period
      if (pool.lockPeriodDays > 0) {
        const endDate = new Date(stake.startedAt);
        endDate.setDate(endDate.getDate() + pool.lockPeriodDays);
        await storage.updateUserStake(stake.id, { endAt: endDate });
      }
      
      // Update user points and staked amount
      await storage.updateUser(userId, {
        points: user.points - stakeData.amount,
        stakedPoints: user.stakedPoints + stakeData.amount
      });
      
      // Log activity
      await storage.createUserActivity({
        userId,
        type: "staking",
        amount: -stakeData.amount,
        description: `Staked in ${pool.name}`
      });
      
      return res.status(201).json(stake);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Failed to create stake" });
    }
  });
  
  app.post("/api/staking/unstake/:stakeId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const stakeId = parseInt(req.params.stakeId);
    
    if (isNaN(stakeId)) {
      return res.status(400).json({ message: "Invalid stake ID" });
    }
    
    const stake = await storage.getUserStake(stakeId);
    
    if (!stake) {
      return res.status(404).json({ message: "Stake not found" });
    }
    
    if (stake.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to unstake this position" });
    }
    
    const pool = await storage.getStakingPool(stake.poolId);
    
    if (!pool) {
      return res.status(404).json({ message: "Staking pool not found" });
    }
    
    // Check if lock period has ended
    if (stake.endAt && new Date() < stake.endAt) {
      return res.status(400).json({ 
        message: `Cannot unstake until lock period ends on ${stake.endAt.toISOString().split('T')[0]}` 
      });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Calculate rewards
    const now = new Date();
    const startTime = stake.lastRewardAt || stake.startedAt;
    const daysSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate reward: stake amount * APY * (days / 365)
    const reward = Math.floor(stake.amount * (pool.apyRate / 10000) * (daysSinceStart / 365));
    
    // Update user
    await storage.updateUser(userId, {
      points: user.points + stake.amount + reward,
      stakedPoints: user.stakedPoints - stake.amount
    });
    
    // Log activity
    await storage.createUserActivity({
      userId,
      type: "staking",
      amount: stake.amount,
      description: `Unstaked from ${pool.name}`
    });
    
    if (reward > 0) {
      await storage.createUserActivity({
        userId,
        type: "staking",
        amount: reward,
        description: `Staking Reward from ${pool.name}`
      });
    }
    
    // Delete the stake
    await storage.deleteUserStake(stakeId);
    
    return res.status(200).json({
      unstaked: stake.amount,
      reward,
      totalReturned: stake.amount + reward
    });
  });
  
  app.post("/api/staking/collect/:stakeId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const stakeId = parseInt(req.params.stakeId);
    
    if (isNaN(stakeId)) {
      return res.status(400).json({ message: "Invalid stake ID" });
    }
    
    const stake = await storage.getUserStake(stakeId);
    
    if (!stake) {
      return res.status(404).json({ message: "Stake not found" });
    }
    
    if (stake.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to collect rewards for this stake" });
    }
    
    const pool = await storage.getStakingPool(stake.poolId);
    const user = await storage.getUser(userId);
    
    if (!pool || !user) {
      return res.status(404).json({ message: "Staking pool or user not found" });
    }
    
    // Calculate rewards
    const now = new Date();
    const startTime = stake.lastRewardAt || stake.startedAt;
    const daysSinceStart = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate reward: stake amount * APY * (days / 365)
    const reward = Math.floor(stake.amount * (pool.apyRate / 10000) * (daysSinceStart / 365));
    
    if (reward <= 0) {
      return res.status(400).json({ message: "No rewards available yet" });
    }
    
    // Update user points
    await storage.updateUser(userId, {
      points: user.points + reward
    });
    
    // Update stake last reward time
    await storage.updateUserStake(stakeId, {
      lastRewardAt: now
    });
    
    // Log activity
    await storage.createUserActivity({
      userId,
      type: "staking",
      amount: reward,
      description: `Staking Reward from ${pool.name}`
    });
    
    return res.status(200).json({
      reward,
      totalPoints: user.points + reward
    });
  });
  
  // Daily Rewards
  app.get("/api/daily-rewards", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const rewards = await storage.getDailyRewards(userId);
    
    // Check if user can claim today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastClaim = user.lastDailyRewardClaim ? 
      new Date(user.lastDailyRewardClaim.getFullYear(), user.lastDailyRewardClaim.getMonth(), user.lastDailyRewardClaim.getDate()).getTime() : 
      0;
    
    const canClaimToday = today > lastClaim;
    const currentStreak = user.dailyRewardsStreak || 0;
    const dayToday = canClaimToday ? currentStreak + 1 : currentStreak;
    
    // Calculate rewards for each day
    const rewardsByDay = {
      1: 50,
      2: 75,
      3: 100,
      4: 125,
      5: 150,
      6: 200,
      7: 500
    };
    
    // Calculate next reset time
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return res.status(200).json({
      rewards,
      currentStreak,
      canClaimToday,
      dayToday: dayToday > 7 ? 7 : dayToday,
      rewardsByDay,
      nextReset: tomorrow,
      claimedDays: rewards.map(reward => reward.day)
    });
  });
  
  app.post("/api/daily-rewards/claim", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user can claim today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const lastClaim = user.lastDailyRewardClaim ? 
      new Date(user.lastDailyRewardClaim.getFullYear(), user.lastDailyRewardClaim.getMonth(), user.lastDailyRewardClaim.getDate()).getTime() : 
      0;
    
    if (today <= lastClaim) {
      return res.status(400).json({ message: "Daily reward already claimed today" });
    }
    
    // Calculate streak
    let streak = user.dailyRewardsStreak || 0;
    
    // If more than 1 day has passed, reset streak
    if (lastClaim && today - lastClaim > 24 * 60 * 60 * 1000) {
      streak = 0;
    }
    
    // Increment streak
    streak++;
    // Cap at 7
    if (streak > 7) streak = 7;
    
    // Calculate reward amount
    const rewardsByDay = {
      1: 50,
      2: 75,
      3: 100,
      4: 125,
      5: 150,
      6: 200,
      7: 500
    };
    
    const amount = rewardsByDay[streak as keyof typeof rewardsByDay] || 50;
    
    // Create daily reward record
    await storage.createDailyReward({
      userId,
      day: streak,
      amount
    });
    
    // Update user
    await storage.updateUser(userId, {
      points: user.points + amount,
      lastDailyRewardClaim: now,
      dailyRewardsStreak: streak
    });
    
    // Log activity
    await storage.createUserActivity({
      userId,
      type: "daily",
      amount,
      description: `Day ${streak} Reward`
    });
    
    return res.status(200).json({
      day: streak,
      amount,
      totalPoints: user.points + amount
    });
  });
  
  // Store Routes
  app.get("/api/store", async (req, res) => {
    const items = await storage.getStoreItems();
    return res.status(200).json(items);
  });
  
  app.post("/api/store/purchase/:itemId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }
    
    const item = await storage.getStoreItem(itemId);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.points < item.price) {
      return res.status(400).json({ message: "Insufficient points" });
    }
    
    // Create inventory entry
    const inventoryItem = await storage.createUserInventory({
      userId,
      itemId,
      isActive: true,
      expiresAt: item.type === "boost" ? new Date(Date.now() + (item.effect as any).duration) : null
    });
    
    // Apply item effects to user
    let userUpdate: Partial<typeof user> = {
      points: user.points - item.price
    };
    
    if (item.type === "mining" && (item.effect as any).miningPowerBoost) {
      userUpdate.miningPower = user.miningPower + Math.floor(user.miningPower * ((item.effect as any).miningPowerBoost / 100));
    }
    
    // Update user
    await storage.updateUser(userId, userUpdate);
    
    // Log activity
    await storage.createUserActivity({
      userId,
      type: "purchase",
      amount: -item.price,
      description: `Purchased ${item.name}`
    });
    
    return res.status(200).json({
      item,
      inventoryItem,
      remainingPoints: user.points - item.price
    });
  });
  
  // Referral Routes
  app.get("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const referrals = await storage.getUserReferrals(userId);
    
    // Get details for each referral
    const referralDetails = await Promise.all(
      referrals.map(async (ref) => {
        const referredUser = await storage.getUser(ref.referredId);
        return {
          ...ref,
          referredUser: referredUser ? {
            id: referredUser.id,
            username: referredUser.username,
            createdAt: referredUser.createdAt
          } : null
        };
      })
    );
    
    return res.status(200).json(referralDetails);
  });
  
  app.get("/api/referral/:code", async (req, res) => {
    const code = req.params.code;
    const referrer = await storage.getUserByReferralCode(code);
    
    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }
    
    return res.status(200).json({
      referrerUsername: referrer.username,
      referralCode: code
    });
  });
  
  // User Activities
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const activities = await storage.getUserActivities(userId, limit);
    return res.status(200).json(activities);
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
