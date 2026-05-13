import { handleQueryRequest } from "@rocicorp/zero/server";
import { mustGetQuery } from "@rocicorp/zero";
import { queries } from "../shared/queries.js";
import { schema } from "../shared/schema.js";
import { getUserID } from "./login.js";
import { Context } from "hono";

// Main handler for get-queries request
export async function handleGetQueries(c: Context) {
  const userID = await getUserID(c);
  const ctx = userID ? { userID } : undefined;

  return await handleQueryRequest({
    handler: (name, args) => {
      const query = mustGetQuery(queries, name);
      return query.fn({ args, ctx });
    },
    schema,
    request: c.req.raw,
    userID: userID ?? null,
  });
}
