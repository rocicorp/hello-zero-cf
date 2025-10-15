import { Transaction } from "@rocicorp/zero";
import { Schema, Message } from "./schema";

export function createMutators() {
  return {
    message: {
      async create(tx: Transaction<Schema>, message: Message) {
        await tx.mutate.message.insert(message);
      },
    },
  };
}

export type Mutators = ReturnType<typeof createMutators>;
