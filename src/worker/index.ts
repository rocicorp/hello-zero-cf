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

// Durable Object endpoint - trigger DO to start watching
app.get("/api/do/init", async (c) => {
  // Get or create a DO instance with a fixed ID
  const id = c.env.ZERO_DO.idFromName("/");
  const stub = c.env.ZERO_DO.get(id);

  // Call init to trigger the DO to start watching messages
  const doUrl = new URL(c.req.url);
  doUrl.pathname = "/init";

  return await stub.fetch(doUrl);
});

export default app;

// Export the Durable Object class
export { ZeroDO } from "./zero-do.js";
