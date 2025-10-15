import { Hono } from "hono";
import { handleGetQueries } from "./get-queries.js";
import { handleLogin } from "./login.js";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/login", async (c) => {
  return await handleLogin(c);
});

app.post("/api/get-queries", async (c) => {
  return c.json(await handleGetQueries(c.req.raw));
});

export default app;
