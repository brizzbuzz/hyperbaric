import { describe, it, expect } from "vitest";
import { getTestRepositories } from "../setup.js";

describe("UserRepository", () => {
  it("should create a new user", async () => {
    const repositories = getTestRepositories();

    const userData = {
      id: "test-user-123",
      name: "John Doe",
      email: "john@example.com",
      emailVerified: false,
      image: null,
    };

    const user = await repositories.users.create(userData);

    expect(user.id).toBe("test-user-123");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
    expect(user.emailVerified).toBe(false);
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});
