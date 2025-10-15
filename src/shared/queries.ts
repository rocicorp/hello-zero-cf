import { syncedQuery, escapeLike } from "@rocicorp/zero";
import { z } from "zod";
import { builder } from "./schema.js";

export const queries = {
  users: syncedQuery("users", z.tuple([]), () => {
    return builder.user;
  }),
  messages: syncedQuery("messages", z.tuple([]), () => {
    return builder.message.related("sender").orderBy("timestamp", "desc");
  }),
  filteredMessages: syncedQuery(
    "filteredMessages",
    z.tuple([
      z.object({
        senderID: z.string(),
        body: z.string(),
      }),
    ]),
    ({ senderID, body }) => {
      let query = builder.message.related("sender");

      if (senderID) {
        query = query.where("senderID", senderID);
      }

      if (body) {
        query = query.where("body", "LIKE", `%${escapeLike(body)}%`);
      }

      return query.orderBy("timestamp", "desc");
    }
  ),
};
