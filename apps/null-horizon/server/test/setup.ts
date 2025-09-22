import { beforeAll, afterAll, beforeEach } from "vitest";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { execSync } from "child_process";
import { writeFileSync, rmSync } from "fs";
import { join } from "path";
import type { Database } from "../src/db/types.js";
import { createRepositoryFactory } from "../src/db/repositories/index.js";

let testContainer: StartedPostgreSqlContainer;
let testDb: Kysely<Database>;
let testRepositories: ReturnType<typeof createRepositoryFactory>;
let testConnectionString: string;

export async function setupTestDatabase() {
  console.log("🚀 Starting PostgreSQL container...");
  console.time("Container startup");

  // Enable debug logging
  process.env.TESTCONTAINERS_LOG_LEVEL = "debug";

  try {
    // Start PostgreSQL container with simplified setup
    console.log("📦 Creating container instance...");
    const container = new PostgreSqlContainer("postgres:17")
      .withDatabase("test")
      .withUsername("test")
      .withPassword("test")
      .withStartupTimeout(5000);

    console.log("🏃 Starting container...");
    testContainer = await container.start();
    console.timeEnd("Container startup");
  } catch (error) {
    console.error("❌ Container failed to start:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }

    // Try to clean up any partially started containers
    try {
      if (testContainer) {
        await testContainer.stop();
      }
    } catch (cleanupError) {
      console.warn("Failed to cleanup container:", cleanupError);
    }

    throw error;
  }

  console.log("✅ PostgreSQL container started");
  console.log("🐳 Container ID:", testContainer.getId());
  console.log("🌐 Container host:", testContainer.getHost());
  console.log("🔌 Container port:", testContainer.getPort());

  testConnectionString = testContainer.getConnectionUri() + "?sslmode=disable";
  console.log("🔗 Connection string:", testConnectionString);

  // Create temporary Atlas config for testing
  const testAtlasConfig = `
env "test" {
  url = "${testConnectionString}"
  dev = "docker://postgres/17/dev"

  schema {
    src = "file://schemas"
  }
  schemas = ["auth", "asset", "public"]
}`;

  const atlasConfigPath = join(process.cwd(), "atlas-test.hcl");
  writeFileSync(atlasConfigPath, testAtlasConfig);

  console.log("📄 Atlas config created, applying schema...");

  try {
    // Apply schema using Atlas
    execSync(
      `atlas schema apply --env test --config file://${atlasConfigPath} --auto-approve`,
      {
        stdio: "inherit",
        cwd: process.cwd(),
      },
    );
    console.log("✅ Schema applied successfully");
  } catch (error) {
    console.error("❌ Failed to apply schema with Atlas:", error);
    throw error;
  } finally {
    // Clean up temporary Atlas config
    rmSync(atlasConfigPath, { force: true });
  }

  // Create Kysely instance
  console.log("🔧 Creating Kysely instance...");
  const pool = new Pool({
    connectionString: testConnectionString,
    max: 10,
  });

  testDb = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  // Initialize repositories
  testRepositories = createRepositoryFactory(testDb);
  console.log("✅ Test database setup complete");

  return {
    container: testContainer,
    db: testDb,
    repositories: testRepositories,
    connectionString: testConnectionString,
  };
}

export async function teardownTestDatabase() {
  if (testDb) {
    await testDb.destroy();
  }
  if (testContainer) {
    await testContainer.stop();
  }
}

export function getTestDb() {
  if (!testDb) {
    throw new Error(
      "Test database not initialized. Call setupTestDatabase first.",
    );
  }
  return testDb;
}

export function getTestRepositories() {
  if (!testRepositories) {
    throw new Error(
      "Test repositories not initialized. Call setupTestDatabase first.",
    );
  }
  return testRepositories;
}

export function getTestConnectionString() {
  if (!testConnectionString) {
    throw new Error(
      "Test connection not initialized. Call setupTestDatabase first.",
    );
  }
  return testConnectionString;
}

// Global setup and teardown for Vitest
beforeAll(async () => {
  console.log("🧪 Starting test setup...");
  await setupTestDatabase();
}, 10000); // 10 second timeout for container startup

afterAll(async () => {
  await teardownTestDatabase();
});

// Clean database between tests
beforeEach(async () => {
  // Truncate all tables in reverse dependency order
  const tables = [
    "auth.session",
    "auth.account",
    "auth.verification",
    "auth.user",
    "asset.assets",
  ];

  for (const table of tables) {
    await testDb.deleteFrom(table as any).execute();
  }
});
