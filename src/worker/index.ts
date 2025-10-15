import { Hono } from "hono";
import { handleGetQueries } from "./get-queries.js";

const app = new Hono<{ Bindings: Env }>();

app.post("/api/get-queries", async (c) => {
  return c.json(await handleGetQueries(c.req.raw));
});

export default app;
