import { Hono } from "hono";
import { auth } from "./auth";
import { cors } from "hono/cors";
import { db, checkDatabaseConnection, repositories } from "./db/index.js";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.get("/", (c) => c.text("Chronicler API - AI-Enhanced RSS Reader"));

app.get("/health", async (c) => {
  const dbHealthy = await checkDatabaseConnection();

  return c.json(
    {
      status: dbHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: dbHealthy ? "connected" : "disconnected",
      version: "1.0.0",
    },
    dbHealthy ? 200 : 503,
  );
});

app.use(
  "*",
  cors({
    origin: "http://localhost:3002",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API routes will be added here
app.route("/api/feeds", new Hono()); // Placeholder for feed routes
app.route("/api/articles", new Hono()); // Placeholder for article routes
app.route("/api/bookmarks", new Hono()); // Placeholder for bookmark routes
app.route("/api/preferences", new Hono()); // Placeholder for preference routes

export default app;
