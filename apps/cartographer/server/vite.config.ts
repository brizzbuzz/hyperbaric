import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [
        devServer({
          entry: "src/index.ts",
        }),
      ],
      server: {
        port: 3005,
      },
    };
  } else {
    // build config
    return {
      build: {
        lib: {
          entry: "src/index.ts",
          name: "server",
          fileName: "index",
        },
        rollupOptions: {
          external: ["hono"],
        },
        outDir: "dist",
      },
    };
  }
});
