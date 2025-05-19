import { users, stakingPools, storeItems, userStakes, miningOperations, dailyRewards, userInventory, userActivities, referrals } from "@shared/schema";
import type { User, InsertUser, StakingPool, InsertStakingPool, StoreItem, InsertStoreItem, UserStake, InsertUserStake, MiningOperation, InsertMiningOperation, DailyReward, InsertDailyReward, UserInventory, InsertUserInventory, UserActivity, InsertUserActivity, Referral, InsertReferral } from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and, lt, gt } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

import { Store } from 'express-session';

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Mining operations
  getMiningOperation(userId: number): Promise<MiningOperation | undefined>;
  createMiningOperation(operation: InsertMiningOperation): Promise<MiningOperation>;
  updateMiningOperation(id: number, data: Partial<MiningOperation>): Promise<MiningOperation | undefined>;
  
  // Staking pools
  getStakingPools(): Promise<StakingPool[]>;
  getStakingPool(id: number): Promise<StakingPool | undefined>;
  createStakingPool(pool: InsertStakingPool): Promise<StakingPool>;
  
  // User stakes
  getUserStakes(userId: number): Promise<UserStake[]>;
  getUserStake(id: number): Promise<UserStake | undefined>;
  createUserStake(stake: InsertUserStake): Promise<UserStake>;
  updateUserStake(id: number, data: Partial<UserStake>): Promise<UserStake | undefined>;
  deleteUserStake(id: number): Promise<boolean>;
  
  // Daily rewards
  getDailyRewards(userId: number): Promise<DailyReward[]>;
  createDailyReward(reward: InsertDailyReward): Promise<DailyReward>;
  
  // Store items
  getStoreItems(): Promise<StoreItem[]>;
  getStoreItem(id: number): Promise<StoreItem | undefined>;
  createStoreItem(item: InsertStoreItem): Promise<StoreItem>;
  
  // User inventory
  getUserInventory(userId: number): Promise<UserInventory[]>;
  createUserInventory(inventory: InsertUserInventory): Promise<UserInventory>;
  updateUserInventory(id: number, data: Partial<UserInventory>): Promise<UserInventory | undefined>;
  
  // User activities
  getUserActivities(userId: number, limit?: number): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  
  // Referrals
  getUserReferrals(userId: number): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined>;
  
  // Session store for auth
  sessionStore: Store;
  
  // Initialize default data
  initializeDefaultData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private miningOperations: Map<number, MiningOperation>;
  private stakingPools: Map<number, StakingPool>;
  private userStakes: Map<number, UserStake>;
  private dailyRewards: Map<number, DailyReward>;
  private storeItems: Map<number, StoreItem>;
  private userInventory: Map<number, UserInventory>;
  private userActivities: Map<number, UserActivity>;
  private referrals: Map<number, Referral>;
  
  private userCurrentId: number;
  private miningOperationCurrentId: number;
  private stakingPoolCurrentId: number;
  private userStakeCurrentId: number;
  private dailyRewardCurrentId: number;
  private storeItemCurrentId: number;
  private userInventoryCurrentId: number;
  private userActivityCurrentId: number;
  private referralCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.miningOperations = new Map();
    this.stakingPools = new Map();
    this.userStakes = new Map();
    this.dailyRewards = new Map();
    this.storeItems = new Map();
    this.userInventory = new Map();
    this.userActivities = new Map();
    this.referrals = new Map();
    
    this.userCurrentId = 1;
    this.miningOperationCurrentId = 1;
    this.stakingPoolCurrentId = 1;
    this.userStakeCurrentId = 1;
    this.dailyRewardCurrentId = 1;
    this.storeItemCurrentId = 1;
    this.userInventoryCurrentId = 1;
    this.userActivityCurrentId = 1;
    this.referralCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    // Generate unique referral code
    const referralCode = nanoid(8);
    
    const user: User = {
      ...insertUser,
      id,
      referralCode,
      points: 100, // Start with 100 points
      miningPower: 50, // Base mining power
      stakedPoints: 0,
      referralPoints: 0,
      lastDailyRewardClaim: null,
      lastMiningReward: null,
      dailyRewardsStreak: 0,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Mining Operations
  async getMiningOperation(userId: number): Promise<MiningOperation | undefined> {
    return Array.from(this.miningOperations.values()).find(
      (op) => op.userId === userId
    );
  }
  
  async createMiningOperation(operation: InsertMiningOperation): Promise<MiningOperation> {
    const id = this.miningOperationCurrentId++;
    
    const miningOperation: MiningOperation = {
      ...operation,
      id,
      startedAt: new Date(),
      lastRewardAt: null,
      sessionEarnings: 0
    };
    
    this.miningOperations.set(id, miningOperation);
    return miningOperation;
  }
  
  async updateMiningOperation(id: number, data: Partial<MiningOperation>): Promise<MiningOperation | undefined> {
    const operation = this.miningOperations.get(id);
    if (!operation) return undefined;
    
    const updatedOperation = { ...operation, ...data };
    this.miningOperations.set(id, updatedOperation);
    return updatedOperation;
  }
  
  // Staking Pools
  async getStakingPools(): Promise<StakingPool[]> {
    return Array.from(this.stakingPools.values());
  }
  
  async getStakingPool(id: number): Promise<StakingPool | undefined> {
    return this.stakingPools.get(id);
  }
  
  async createStakingPool(pool: InsertStakingPool): Promise<StakingPool> {
    const id = this.stakingPoolCurrentId++;
    
    const stakingPool: StakingPool = {
      ...pool,
      id
    };
    
    this.stakingPools.set(id, stakingPool);
    return stakingPool;
  }
  
  // User Stakes
  async getUserStakes(userId: number): Promise<UserStake[]> {
    return Array.from(this.userStakes.values()).filter(
      (stake) => stake.userId === userId
    );
  }
  
  async getUserStake(id: number): Promise<UserStake | undefined> {
    return this.userStakes.get(id);
  }
  
  async createUserStake(stake: InsertUserStake): Promise<UserStake> {
    const id = this.userStakeCurrentId++;
    
    const userStake: UserStake = {
      ...stake,
      id,
      startedAt: new Date(),
      endAt: null,
      lastRewardAt: null
    };
    
    this.userStakes.set(id, userStake);
    return userStake;
  }
  
  async updateUserStake(id: number, data: Partial<UserStake>): Promise<UserStake | undefined> {
    const stake = this.userStakes.get(id);
    if (!stake) return undefined;
    
    const updatedStake = { ...stake, ...data };
    this.userStakes.set(id, updatedStake);
    return updatedStake;
  }
  
  async deleteUserStake(id: number): Promise<boolean> {
    return this.userStakes.delete(id);
  }
  
  // Daily Rewards
  async getDailyRewards(userId: number): Promise<DailyReward[]> {
    return Array.from(this.dailyRewards.values()).filter(
      (reward) => reward.userId === userId
    );
  }
  
  async createDailyReward(reward: InsertDailyReward): Promise<DailyReward> {
    const id = this.dailyRewardCurrentId++;
    
    const dailyReward: DailyReward = {
      ...reward,
      id,
      claimedAt: new Date()
    };
    
    this.dailyRewards.set(id, dailyReward);
    return dailyReward;
  }
  
  // Store Items
  async getStoreItems(): Promise<StoreItem[]> {
    return Array.from(this.storeItems.values());
  }
  
  async getStoreItem(id: number): Promise<StoreItem | undefined> {
    return this.storeItems.get(id);
  }
  
  async createStoreItem(item: InsertStoreItem): Promise<StoreItem> {
    const id = this.storeItemCurrentId++;
    
    const storeItem: StoreItem = {
      ...item,
      id
    };
    
    this.storeItems.set(id, storeItem);
    return storeItem;
  }
  
  // User Inventory
  async getUserInventory(userId: number): Promise<UserInventory[]> {
    return Array.from(this.userInventory.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async createUserInventory(inventory: InsertUserInventory): Promise<UserInventory> {
    const id = this.userInventoryCurrentId++;
    
    const userInventory: UserInventory = {
      ...inventory,
      id,
      purchasedAt: new Date()
    };
    
    this.userInventory.set(id, userInventory);
    return userInventory;
  }
  
  async updateUserInventory(id: number, data: Partial<UserInventory>): Promise<UserInventory | undefined> {
    const inventory = this.userInventory.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory = { ...inventory, ...data };
    this.userInventory.set(id, updatedInventory);
    return updatedInventory;
  }
  
  // User Activities
  async getUserActivities(userId: number, limit: number = 10): Promise<UserActivity[]> {
    const activities = Array.from(this.userActivities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return activities.slice(0, limit);
  }
  
  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const id = this.userActivityCurrentId++;
    
    const userActivity: UserActivity = {
      ...activity,
      id,
      createdAt: new Date()
    };
    
    this.userActivities.set(id, userActivity);
    return userActivity;
  }
  
  // Referrals
  async getUserReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === userId
    );
  }
  
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = this.referralCurrentId++;
    
    const newReferral: Referral = {
      ...referral,
      id,
      pointsEarned: 0,
      createdAt: new Date()
    };
    
    this.referrals.set(id, newReferral);
    return newReferral;
  }
  
  async updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updatedReferral = { ...referral, ...data };
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }
  
  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Create default staking pools
    if (this.stakingPools.size === 0) {
      await this.createStakingPool({
        name: "Standard Pool",
        description: "Low risk, steady returns",
        apyRate: 200, // 2%
        lockPeriodDays: 0,
        minStake: 100,
        isActive: true
      });
      
      await this.createStakingPool({
        name: "Premium Pool",
        description: "Higher risk, better rewards",
        apyRate: 500, // 5%
        lockPeriodDays: 7,
        minStake: 500,
        isActive: true
      });
      
      await this.createStakingPool({
        name: "DeFi Pool",
        description: "Advanced simulation with DeFi mechanics",
        apyRate: 1000, // 10%
        lockPeriodDays: 30,
        minStake: 1000,
        isActive: false
      });
    }
    
    // Create default store items
    if (this.storeItems.size === 0) {
      await this.createStoreItem({
        name: "Advanced Processor",
        description: "Increases mining speed by 30%",
        price: 250,
        type: "mining",
        effect: { miningPowerBoost: 30 },
        imgUrl: "https://images.unsplash.com/photo-1562813733-b31f1c738a95?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
      
      await this.createStoreItem({
        name: "Liquid Cooling System",
        description: "Reduces energy usage by 20%",
        price: 350,
        type: "mining",
        effect: { miningEfficiencyBoost: 20 },
        imgUrl: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
      
      await this.createStoreItem({
        name: "Yield Optimizer",
        description: "+0.5% APY on all staking pools",
        price: 500,
        type: "staking",
        effect: { stakingApyBoost: 50 },
        imgUrl: "https://images.unsplash.com/photo-1591994843349-f415893b3a6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
      
      await this.createStoreItem({
        name: "Premium Badge",
        description: "Show off your status to other users",
        price: 150,
        type: "profile",
        effect: { badge: "premium" },
        imgUrl: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
      
      await this.createStoreItem({
        name: "Advanced Blockchain Course",
        description: "Unlock expert-level learning materials",
        price: 400,
        type: "learning",
        effect: { unlockContent: "advanced-blockchain" },
        imgUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
      
      await this.createStoreItem({
        name: "2X Earnings Booster",
        description: "Double all earnings for 24 hours",
        price: 300,
        type: "boost",
        effect: { earningsMultiplier: 2, duration: 86400000 },
        imgUrl: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      });
    }
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Mining operations
  async getMiningOperation(userId: number): Promise<MiningOperation | undefined> {
    const [operation] = await db
      .select()
      .from(miningOperations)
      .where(eq(miningOperations.userId, userId));
    return operation;
  }

  async createMiningOperation(operation: InsertMiningOperation): Promise<MiningOperation> {
    const [newOperation] = await db
      .insert(miningOperations)
      .values(operation)
      .returning();
    return newOperation;
  }

  async updateMiningOperation(id: number, data: Partial<MiningOperation>): Promise<MiningOperation | undefined> {
    const [updatedOperation] = await db
      .update(miningOperations)
      .set(data)
      .where(eq(miningOperations.id, id))
      .returning();
    return updatedOperation;
  }

  // Staking pools
  async getStakingPools(): Promise<StakingPool[]> {
    return db.select().from(stakingPools);
  }

  async getStakingPool(id: number): Promise<StakingPool | undefined> {
    const [pool] = await db.select().from(stakingPools).where(eq(stakingPools.id, id));
    return pool;
  }

  async createStakingPool(pool: InsertStakingPool): Promise<StakingPool> {
    const [newPool] = await db
      .insert(stakingPools)
      .values(pool)
      .returning();
    return newPool;
  }

  // User stakes
  async getUserStakes(userId: number): Promise<UserStake[]> {
    return db.select().from(userStakes).where(eq(userStakes.userId, userId));
  }

  async getUserStake(id: number): Promise<UserStake | undefined> {
    const [stake] = await db.select().from(userStakes).where(eq(userStakes.id, id));
    return stake;
  }

  async createUserStake(stake: InsertUserStake): Promise<UserStake> {
    const [newStake] = await db
      .insert(userStakes)
      .values(stake)
      .returning();
    return newStake;
  }

  async updateUserStake(id: number, data: Partial<UserStake>): Promise<UserStake | undefined> {
    const [updatedStake] = await db
      .update(userStakes)
      .set(data)
      .where(eq(userStakes.id, id))
      .returning();
    return updatedStake;
  }

  async deleteUserStake(id: number): Promise<boolean> {
    const result = await db
      .delete(userStakes)
      .where(eq(userStakes.id, id));
    return true; // In PostgreSQL with Drizzle, if no error is thrown, the operation was successful
  }

  // Daily rewards
  async getDailyRewards(userId: number): Promise<DailyReward[]> {
    return db.select().from(dailyRewards).where(eq(dailyRewards.userId, userId));
  }

  async createDailyReward(reward: InsertDailyReward): Promise<DailyReward> {
    const [newReward] = await db
      .insert(dailyRewards)
      .values(reward)
      .returning();
    return newReward;
  }

  // Store items
  async getStoreItems(): Promise<StoreItem[]> {
    return db.select().from(storeItems);
  }

  async getStoreItem(id: number): Promise<StoreItem | undefined> {
    const [item] = await db.select().from(storeItems).where(eq(storeItems.id, id));
    return item;
  }

  async createStoreItem(item: InsertStoreItem): Promise<StoreItem> {
    const [newItem] = await db
      .insert(storeItems)
      .values(item)
      .returning();
    return newItem;
  }

  // User inventory
  async getUserInventory(userId: number): Promise<UserInventory[]> {
    return db.select().from(userInventory).where(eq(userInventory.userId, userId));
  }

  async createUserInventory(inventory: InsertUserInventory): Promise<UserInventory> {
    const [newInventory] = await db
      .insert(userInventory)
      .values(inventory)
      .returning();
    return newInventory;
  }

  async updateUserInventory(id: number, data: Partial<UserInventory>): Promise<UserInventory | undefined> {
    const [updatedInventory] = await db
      .update(userInventory)
      .set(data)
      .where(eq(userInventory.id, id))
      .returning();
    return updatedInventory;
  }

  // User activities
  async getUserActivities(userId: number, limit: number = 10): Promise<UserActivity[]> {
    return db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db
      .insert(userActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Referrals
  async getUserReferrals(userId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db
      .insert(referrals)
      .values(referral)
      .returning();
    return newReferral;
  }

  async updateReferral(id: number, data: Partial<Referral>): Promise<Referral | undefined> {
    const [updatedReferral] = await db
      .update(referrals)
      .set(data)
      .where(eq(referrals.id, id))
      .returning();
    return updatedReferral;
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Check if staking pools exist
    const pools = await this.getStakingPools();
    if (pools.length === 0) {
      // Create default staking pools
      await this.createStakingPool({
        name: "Basic Staking",
        description: "Basic staking pool with low returns but no lock period",
        apyRate: 500, // 5%
        lockPeriodDays: 0,
        minStake: 100,
        isActive: true
      });

      await this.createStakingPool({
        name: "Standard Staking",
        description: "Medium returns with a 7-day lock period",
        apyRate: 1000, // 10%
        lockPeriodDays: 7,
        minStake: 500,
        isActive: true
      });

      await this.createStakingPool({
        name: "Premium Staking",
        description: "High returns with a 30-day lock period",
        apyRate: 2000, // 20%
        lockPeriodDays: 30,
        minStake: 1000,
        isActive: true
      });
    }

    // Check if store items exist
    const items = await this.getStoreItems();
    if (items.length === 0) {
      // Create default store items
      await this.createStoreItem({
        name: "Basic Miner",
        description: "Increases mining power by 10%",
        price: 500,
        type: "mining",
        effect: { miningPowerBoost: 10 },
        imgUrl: "/assets/basic-miner.svg"
      });

      await this.createStoreItem({
        name: "Advanced Miner",
        description: "Increases mining power by 25%",
        price: 1200,
        type: "mining",
        effect: { miningPowerBoost: 25 },
        imgUrl: "/assets/advanced-miner.svg"
      });

      await this.createStoreItem({
        name: "Staking Booster",
        description: "Increases staking returns by 5%",
        price: 800,
        type: "staking",
        effect: { stakingBoost: 5 },
        imgUrl: "/assets/staking-booster.svg"
      });

      await this.createStoreItem({
        name: "Premium Profile",
        description: "Unlocks premium profile features",
        price: 2000,
        type: "profile",
        effect: { premiumProfile: true },
        imgUrl: "/assets/premium-profile.svg"
      });
    }
  }
}

// Determine which storage to use
// We'll use in-memory storage if:
// 1. We're in development and no DATABASE_URL is available
// 2. The database connection fails

// Create storage instance based on environment
let storageInstance: IStorage;

// Check if we're in development or don't have a database URL
if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'development') {
  console.log("Using in-memory storage for development or missing DATABASE_URL");
  storageInstance = new MemStorage();
} else {
  try {
    // Use database storage in production environments
    storageInstance = new DatabaseStorage();
  } catch (error) {
    console.log("Database connection failed, using memory storage instead", error);
    storageInstance = new MemStorage();
  }
}

export const storage = storageInstance;
