import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// SQL statement to create tables
const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  mining_power INTEGER NOT NULL DEFAULT 50,
  staked_points INTEGER NOT NULL DEFAULT 0,
  referral_points INTEGER NOT NULL DEFAULT 0,
  last_daily_reward_claim TIMESTAMP,
  last_mining_reward TIMESTAMP,
  daily_rewards_streak INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT NOT NULL,
  referred_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const createMiningOperationsTable = `
CREATE TABLE IF NOT EXISTS mining_operations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_reward_at TIMESTAMP,
  session_earnings INTEGER NOT NULL DEFAULT 0
);
`;

const createStakingPoolsTable = `
CREATE TABLE IF NOT EXISTS staking_pools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  apy_rate INTEGER NOT NULL,
  lock_period_days INTEGER NOT NULL DEFAULT 0,
  min_stake INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
`;

const createUserStakesTable = `
CREATE TABLE IF NOT EXISTS user_stakes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  pool_id INTEGER NOT NULL REFERENCES staking_pools(id),
  amount INTEGER NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  end_at TIMESTAMP,
  last_reward_at TIMESTAMP
);
`;

const createDailyRewardsTable = `
CREATE TABLE IF NOT EXISTS daily_rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  day INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  claimed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const createStoreItemsTable = `
CREATE TABLE IF NOT EXISTS store_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  type TEXT NOT NULL,
  effect JSONB NOT NULL,
  img_url TEXT
);
`;

const createUserInventoryTable = `
CREATE TABLE IF NOT EXISTS user_inventory (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  item_id INTEGER NOT NULL REFERENCES store_items(id),
  purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMP
);
`;

const createUserActivitiesTable = `
CREATE TABLE IF NOT EXISTS user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const createReferralsTable = `
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_id INTEGER NOT NULL REFERENCES users(id),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const createSessionTable = `
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
`;

// Execute all table creation statements
async function createTables() {
  try {
    await db.execute(sql.raw(createUserTable));
    console.log('Users table created');
    
    await db.execute(sql.raw(createMiningOperationsTable));
    console.log('Mining operations table created');
    
    await db.execute(sql.raw(createStakingPoolsTable));
    console.log('Staking pools table created');
    
    await db.execute(sql.raw(createUserStakesTable));
    console.log('User stakes table created');
    
    await db.execute(sql.raw(createDailyRewardsTable));
    console.log('Daily rewards table created');
    
    await db.execute(sql.raw(createStoreItemsTable));
    console.log('Store items table created');
    
    await db.execute(sql.raw(createUserInventoryTable));
    console.log('User inventory table created');
    
    await db.execute(sql.raw(createUserActivitiesTable));
    console.log('User activities table created');
    
    await db.execute(sql.raw(createReferralsTable));
    console.log('Referrals table created');
    
    await db.execute(sql.raw(createSessionTable));
    console.log('Session table created');
    
    console.log('All tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

// Run the migration
console.log('Starting migrations...');
createTables();
