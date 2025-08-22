import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));

const port = parseInt(process.env.PORT || "3001");

export default {
  port,
  fetch: app.fetch,
};
