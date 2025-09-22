import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    include: ["test/**/*.test.ts", "test/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "build"],
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
