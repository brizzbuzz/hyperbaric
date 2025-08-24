import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({
  connectionString:
    "postgres://hyperbaric_admin:hyperbaric_password@localhost:5432/chronicler?options=-c%20search_path%3Dauth%2Cpublic",
});

pool.on("connect", async (client) => {
  try {
    // Create the auth schema if it doesn't exist
    await client.query("CREATE SCHEMA IF NOT EXISTS auth");
  } catch (error) {
    console.error("Error setting up database schema:", error);
    throw error;
  }
});

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: ["http://localhost:3002"],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
