import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// For local development or when hosted in environments with proper DATABASE_URL
let pool: Pool;
let db: any;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    db = drizzle(pool, { schema });
  } else {
    // If no DATABASE_URL, create placeholder objects
    pool = {} as Pool;
    db = {};
  }
} catch (error) {
  console.error("Database connection failed:", error);
  // If connection fails, export empty objects
  // The storage.ts file will use memory storage instead
  pool = {} as Pool;
  db = {};
}

export { pool, db };
