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

// Durable Object endpoint
app.get("/api/do/:action", async (c) => {
  const action = c.req.param("action");

  // Get or create a DO instance with a fixed ID
  const id = c.env.ZERO_DO.idFromName("singleton");
  const stub = c.env.ZERO_DO.get(id);

  // Forward the request to the DO
  const doUrl = new URL(c.req.url);
  doUrl.pathname = `/${action}`;

  const response = await stub.fetch(doUrl);

  // Ensure we return JSON with correct content type
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(response.headers),
    },
  });
});

export default app;

// Export the Durable Object class
export { ZeroDO } from "./zero-do.js";
