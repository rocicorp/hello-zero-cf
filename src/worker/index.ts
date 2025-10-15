import { Hono } from "hono";
import { handleGetQueries } from "./get-queries.js";
import { handleLogin } from "./login.js";
import { handleMutate } from "./mutate.js";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/login", async (c) => {
  return await handleLogin(c);
});

app.post("/api/get-queries", async (c) => {
  return c.json(await handleGetQueries(c.req.raw));
});

app.post("/api/mutate", async (c) => {
  return c.json(await handleMutate(c));
});

export default app;
