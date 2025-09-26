import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello from Cartographer server!" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "cartographer-server" });
});

export default app;
