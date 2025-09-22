import { describe, it, expect } from "vitest";
import {
  getTestDb,
  getTestRepositories,
  getTestConnectionString,
} from "./setup.js";

describe("Basic Test Setup", () => {
  it("should have access to test database", () => {
    const db = getTestDb();
    expect(db).toBeDefined();
  });

  it("should have access to test repositories", () => {
    const repositories = getTestRepositories();
    expect(repositories).toBeDefined();
    expect(repositories.users).toBeDefined();
    expect(repositories.assets).toBeDefined();
  });

  it("should have valid connection string", () => {
    const connectionString = getTestConnectionString();
    expect(connectionString).toBeDefined();
    expect(connectionString).toMatch(/^postgres:\/\/test:test@/);
  });

  it("should be able to execute simple query", async () => {
    const db = getTestDb();
    const result = await db.selectFrom("auth.user").selectAll().execute();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("should have schemas created by Atlas", async () => {
    const db = getTestDb();

    // Test that we can query from auth schema
    const authResult = await db.selectFrom("auth.user").selectAll().execute();

    expect(Array.isArray(authResult)).toBe(true);
    expect(authResult).toHaveLength(0);

    // Test that we can insert and query from asset schema
    // Insert some test assets
    await db
      .insertInto("asset.assets")
      .values([
        { symbol: "BTC", name: "Bitcoin" },
        { symbol: "ETH", name: "Ethereum" },
        { symbol: "ADA", name: "Cardano" },
      ])
      .execute();

    const assetResult = await db
      .selectFrom("asset.assets")
      .selectAll()
      .execute();

    expect(Array.isArray(assetResult)).toBe(true);
    expect(assetResult).toHaveLength(3);
    expect(assetResult[0]).toHaveProperty("symbol");
    expect(assetResult[0]).toHaveProperty("name");
  });
});
