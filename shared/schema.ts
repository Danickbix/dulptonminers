import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  points: integer("points").notNull().default(0),
  miningPower: integer("mining_power").notNull().default(50),
  stakedPoints: integer("staked_points").notNull().default(0),
  referralPoints: integer("referral_points").notNull().default(0),
  lastDailyRewardClaim: timestamp("last_daily_reward_claim"),
  lastMiningReward: timestamp("last_mining_reward"),
  dailyRewardsStreak: integer("daily_rewards_streak").notNull().default(0),
  referralCode: text("referral_code").notNull(),
  referredBy: integer("referred_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const miningOperations = pgTable("mining_operations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  lastRewardAt: timestamp("last_reward_at"),
  sessionEarnings: integer("session_earnings").notNull().default(0)
});

export const stakingPools = pgTable("staking_pools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  apyRate: integer("apy_rate").notNull(), // Multiplied by 100 (2.5% = 250)
  lockPeriodDays: integer("lock_period_days").notNull().default(0),
  minStake: integer("min_stake").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true)
});

export const userStakes = pgTable("user_stakes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  poolId: integer("pool_id").notNull().references(() => stakingPools.id),
  amount: integer("amount").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endAt: timestamp("end_at"), // Only set if lock period
  lastRewardAt: timestamp("last_reward_at")
});

export const dailyRewards = pgTable("daily_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  day: integer("day").notNull(), // Day number in streak (1-7)
  amount: integer("amount").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow()
});

export const storeItems = pgTable("store_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(), // mining, staking, profile, etc.
  effect: json("effect").notNull(), // JSON object with effects
  imgUrl: text("img_url")
});

export const userInventory = pgTable("user_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => storeItems.id),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at")
});

export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // mining, staking, referral, purchase
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredId: integer("referred_id").notNull().references(() => users.id),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true, 
    referralCode: true, 
    lastDailyRewardClaim: true, 
    lastMiningReward: true,
    createdAt: true 
  });

export const insertMiningOperationSchema = createInsertSchema(miningOperations)
  .omit({ 
    id: true, 
    startedAt: true, 
    lastRewardAt: true, 
    sessionEarnings: true 
  });

export const insertStakingPoolSchema = createInsertSchema(stakingPools)
  .omit({ id: true });

export const insertUserStakeSchema = createInsertSchema(userStakes)
  .omit({ 
    id: true, 
    startedAt: true, 
    endAt: true, 
    lastRewardAt: true 
  });

export const insertDailyRewardSchema = createInsertSchema(dailyRewards)
  .omit({ 
    id: true, 
    claimedAt: true 
  });

export const insertStoreItemSchema = createInsertSchema(storeItems)
  .omit({ id: true });

export const insertUserInventorySchema = createInsertSchema(userInventory)
  .omit({ 
    id: true, 
    purchasedAt: true 
  });

export const insertUserActivitySchema = createInsertSchema(userActivities)
  .omit({ 
    id: true, 
    createdAt: true 
  });

export const insertReferralSchema = createInsertSchema(referrals)
  .omit({ 
    id: true, 
    pointsEarned: true,
    createdAt: true 
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMiningOperation = z.infer<typeof insertMiningOperationSchema>;
export type MiningOperation = typeof miningOperations.$inferSelect;

export type InsertStakingPool = z.infer<typeof insertStakingPoolSchema>;
export type StakingPool = typeof stakingPools.$inferSelect;

export type InsertUserStake = z.infer<typeof insertUserStakeSchema>;
export type UserStake = typeof userStakes.$inferSelect;

export type InsertDailyReward = z.infer<typeof insertDailyRewardSchema>;
export type DailyReward = typeof dailyRewards.$inferSelect;

export type InsertStoreItem = z.infer<typeof insertStoreItemSchema>;
export type StoreItem = typeof storeItems.$inferSelect;

export type InsertUserInventory = z.infer<typeof insertUserInventorySchema>;
export type UserInventory = typeof userInventory.$inferSelect;

export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivities.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
