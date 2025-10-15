import { handleGetQueriesRequest } from "@rocicorp/zero/server";
import { type ReadonlyJSONValue, withValidation } from "@rocicorp/zero";
import { queries } from "../shared/queries.js";
import { schema } from "../shared/schema.js";

// Validate and wrap all queries
const validated = Object.fromEntries(
  Object.values(queries).map((q) => [q.queryName, withValidation(q)])
);

// Main handler for get-queries request
export async function handleGetQueries(request: Request) {
  return await handleGetQueriesRequest(getQuery, schema, request);
}

// Retrieve and execute specific query
function getQuery(name: string, args: readonly ReadonlyJSONValue[]) {
  const q = validated[name];
  if (!q) {
    throw new Error(`No such query: ${name}`);
  }
  return {
    query: q(undefined, ...args),
  };
}
