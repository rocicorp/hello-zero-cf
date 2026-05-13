import postgres from "postgres";
import { handleMutateRequest } from "@rocicorp/zero/server";
import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import type { Context } from "hono";
import { must } from "../shared/must.js";
import { schema } from "../shared/schema.js";
import { mutators } from "../shared/mutators.js";
import { getUserID } from "./login.js";
import { mustGetMutator } from "@rocicorp/zero";

export async function handleMutate(c: Context) {
  const dbProvider = zeroPostgresJS(
    schema,
    postgres(must(c.env.ZERO_UPSTREAM_DB, "required env var ZERO_UPSTREAM_DB"))
  );

  const userID = await getUserID(c);
  const ctx = userID ? { userID } : undefined;

  return await handleMutateRequest({
    dbProvider,
    handler: async (transact) => {
      return await transact(async (tx, name, args) => {
        const mutator = mustGetMutator(mutators, name);
        return await mutator.fn({ tx, ctx, args });
      });
    },
    request: c.req.raw,
    userID: userID ?? null,
  });
}
