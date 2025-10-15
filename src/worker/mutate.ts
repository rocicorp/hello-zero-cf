import postgres from "postgres";
import { PushProcessor } from "@rocicorp/zero/pg";
import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import type { Context } from "hono";
import { must } from "../shared/must.js";
import { schema } from "../shared/schema.js";
import { createMutators } from "../shared/mutators.js";

export async function handleMutate(c: Context) {
  const processor = new PushProcessor(
    zeroPostgresJS(
      schema,
      postgres(
        must(c.env.ZERO_UPSTREAM_DB, "required env var ZERO_UPSTREAM_DB")
      )
    )
  );
  return await processor.process(createMutators(), c.req.raw);
}
