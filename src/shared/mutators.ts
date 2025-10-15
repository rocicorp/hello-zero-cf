import { Transaction } from "@rocicorp/zero";
import { Schema, Message, MessageUpdate } from "./schema";
import { must } from "./must";

export function createMutators(userID?: string | undefined) {
  return {
    message: {
      async create(tx: Transaction<Schema>, message: Message) {
        await tx.mutate.message.insert(message);
      },
      async delete(tx: Transaction<Schema>, id: string) {
        mustBeLoggedIn(userID);
        await tx.mutate.message.delete({ id });
      },
      async update(tx: Transaction<Schema>, message: MessageUpdate) {
        mustBeLoggedIn(userID);
        const prev = await tx.query.message.where("id", message.id).one().run();
        if (!prev) {
          return;
        }
        if (prev.senderID !== userID) {
          throw new Error("Must be sender of message to edit");
        }
        await tx.mutate.message.update(message);
      },
    },
  };
}

function mustBeLoggedIn(userID: string | undefined) {
  must(userID, "Must be logged in");
}

export type Mutators = ReturnType<typeof createMutators>;
