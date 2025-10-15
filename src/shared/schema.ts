import {
  createSchema,
  definePermissions,
  type Row,
  type UpdateValue,
  table,
  string,
  boolean,
  number,
  relationships,
  createBuilder,
} from "@rocicorp/zero";

const user = table("user")
  .columns({
    id: string(),
    name: string(),
    partner: boolean(),
  })
  .primaryKey("id");

const message = table("message")
  .columns({
    id: string(),
    senderID: string().from("sender_id"),
    body: string(),
    timestamp: number(),
  })
  .primaryKey("id");

const messageRelationships = relationships(message, ({ one }) => ({
  sender: one({
    sourceField: ["senderID"],
    destField: ["id"],
    destSchema: user,
  }),
}));

export const schema = createSchema({
  tables: [user, message],
  relationships: [messageRelationships],
  enableLegacyMutators: false,
  enableLegacyQueries: false,
});

export type Schema = typeof schema;
export type Message = Row<typeof schema.tables.message>;
export type MessageUpdate = UpdateValue<typeof schema.tables.message>;
export type User = Row<typeof schema.tables.user>;

export const permissions = definePermissions<unknown, Schema>(schema, () => {
  return {};
});

export const builder = createBuilder(schema);
