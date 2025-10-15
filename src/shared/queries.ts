import { syncedQuery } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "./schema.js";

export const queries = {
  users: syncedQuery("users", z.tuple([]), () => {
    return builder.user;
  }),
  messages: syncedQuery("messages", z.tuple([]), () => {
    return builder.message.related("sender").orderBy("timestamp", "desc");
  }),
};
