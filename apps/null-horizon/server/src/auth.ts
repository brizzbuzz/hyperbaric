import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgres://hyperbaric_admin:hyperbaric_password@localhost:5432/null_horizon",
});

pool.on("connect", async (client) => {
  try {
    // Create the auth schema if it doesn't exist
    await client.query("CREATE SCHEMA IF NOT EXISTS auth");

    // Set the search path to use the auth schema
    await client.query("SET search_path TO auth, public");
  } catch (error) {
    console.error("Error setting up database schema:", error);
    throw error;
  }
});

export const auth = betterAuth({
  database: pool,
});
