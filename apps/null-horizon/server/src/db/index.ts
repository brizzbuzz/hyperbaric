import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types.js";

// Database connection configuration
const connectionString =
  process.env["DATABASE_URL"] ||
  "postgres://hyperbaric_admin:hyperbaric_password@localhost:5432/null_horizon?sslmode=disable";

// Create connection pool
const pool = new Pool({
  connectionString,
  // Set search path to include all schemas
  options: "-c search_path=auth,asset,public",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Kysely instance
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

// Initialize repository factory
import { createRepositoryFactory } from "./repositories/index.js";

// Create repositories instance
export const repositories = createRepositoryFactory(db);

// Export types and repositories for convenience
export type { Database } from "./types.js";
export * from "./types.js";
export * from "./repositories/index.js";

// Health check function
export async function checkDatabaseConnection() {
  try {
    await db.selectFrom("auth.user").select("id").limit(1).execute();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  await pool.end();
}
