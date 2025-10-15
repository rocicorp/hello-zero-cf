# Hello Zero Cloudflare

This demo shows how to run [Zero](https://github.com/rocicorp/zero) in a Cloudflare Workers + Durable Objects environment. It demonstrates:

- A React web UI using Zero
- Using Hono to implement Zero's API requirements and auth
- A Durable Object running Zero as another client for live monitoring

## Why run Zero **Client** in a Durable Object!?

Imagine you're running collaboration sessions in DOs and need to reliably control their lifecycle. Instead of unreliably sending shutdown messages to every DO, you can write state to Postgres and have the DOs sync that state. The DO monitors what state it should be in and acts accordingly.

More generally, any time a DO needs some subset of Postgres data, it's useful to have a live-updated, consistent view rather than repeatedly querying.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (http://localhost:5173)                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  React UI + Zero Client                         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Zero Cache (http://localhost:4848)                     │
│  - Proxies queries to Worker endpoints                  │
│  - Manages replica state                                │
│  - Streams changes from Postgres                        │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  /api/       │  │  /api/       │  │  /api/       │
│  get-queries │  │  mutate      │  │  do/init     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Cloudflare Worker (via Vite Plugin)                    │
│  - Hono server handling API routes                      │
│  - Durable Object (ZeroDO)                              │
│    └─ Zero Client monitoring messages                   │
│       └─ Prints live table to console                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Postgres (localhost:5432)                              │
│  - Source of truth                                      │
│  - Logical replication enabled                          │
│  - User and Message tables                              │
└─────────────────────────────────────────────────────────┘
```

## Running the Demo

You'll need **3 terminals** to run this example!

### 1. Start Postgres

```bash
# Terminal 1
npm run dev:db-up
```

### 2. Start Zero Cache

```bash
# Terminal 2
npm run dev:zero-cache
```

### 3. Start UI

```bash
# Terminal 3
npm run dev:ui
```

The Vite dev server (with Cloudflare plugin) runs your Worker code locally, handling both the React UI and API endpoints.

Open a browser at **http://localhost:5173** to:

- Add/edit/delete messages
- Login/logout (randomly assigns you a user)
- Filter messages by sender or text content

### 3. Trigger the Durable Object

Once the UI is running, trigger the DO to start monitoring messages:

```bash
curl http://localhost:5173/api/do/init
```

Or open **http://localhost:5173/api/do/init** in your browser.

The DO will start printing a live-updating table of messages to **Terminal 3** (where `dev:ui` is running). As you add, edit, or delete messages in the web UI, you'll see the DO's console output update in real-time!

## Project Structure

```
hello-zero-cf/
├── src/
│   ├── shared/              # Code shared between client and server
│   │   ├── schema.ts        # Zero schema (User, Message tables)
│   │   ├── queries.ts       # Synced queries
│   │   ├── mutators.ts      # Custom mutators (create, delete, update)
│   │   ├── auth.ts          # Shared auth constants
│   │   └── must.ts          # Utility for null checking
│   ├── worker/              # Cloudflare Worker code
│   │   ├── index.ts         # Hono app with routes
│   │   ├── zero-do.ts       # Durable Object with Zero client
│   │   ├── login.ts         # Authentication handlers
│   │   ├── mutate.ts        # Mutation endpoint
│   │   └── get-queries.ts   # Query endpoint
│   └── react-app/           # React UI
│       ├── App.tsx          # Main app component
│       ├── main.tsx         # Entry point with ZeroProvider
│       └── ...
├── db/
│   ├── docker-compose.yml   # Postgres with replication config
│   └── seed.sql             # Database schema and seed data
├── wrangler.json            # Cloudflare Workers config
└── .env                     # Environment variables
```

## Key Features

### Synced Queries

The demo uses Zero's synced queries API (not legacy ad-hoc queries):

```typescript
// src/shared/queries.ts
export const queries = {
  users: syncedQuery("users", z.tuple([]), () => {
    return builder.user;
  }),
  messages: syncedQuery("messages", z.tuple([]), () => {
    return builder.message.related("sender").orderBy("timestamp", "desc");
  }),
  filteredMessages: syncedQuery(
    "filteredMessages",
    z.tuple([z.object({ senderID: z.string(), body: z.string() })]),
    ({ senderID, body }) => {
      let query = builder.message.related("sender");
      if (senderID) query = query.where("senderID", senderID);
      if (body) query = query.where("body", "LIKE", `%${escapeLike(body)}%`);
      return query.orderBy("timestamp", "desc");
    }
  ),
};
```

### Custom Mutators

Server-side mutators with authentication checks:

```typescript
// src/shared/mutators.ts
export function createMutators(userID?: string) {
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
        if (!prev) return;
        if (prev.senderID !== userID) {
          throw new Error("Must be sender of message to edit");
        }
        await tx.mutate.message.update(message);
      },
    },
  };
}
```

### Cookie-Based Auth

Uses Hono's signed cookies (no JWT library needed):

```typescript
// Server: src/worker/login.ts
await setSignedCookie(c, AUTH_COOKIE_NAME, userID, secretKey);

// Client: src/react-app/main.tsx
const signedCookie = Cookies.get(AUTH_COOKIE_NAME);
const userID = signedCookie && signedCookie.split(".")[0];
```

### Durable Object with Zero

The DO runs Zero's lower-level class API (not React hooks):

```typescript
// src/worker/zero-do.ts
export class ZeroDO extends DurableObject {
  #z: Zero<Schema> = new Zero({
    server: "http://localhost:4848",
    userID: "anon",
    schema,
    kvStore: "mem",
  });

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    const view = this.#z.materialize(queries.messages());
    view.addListener(this.#render);
  }

  #render = (messages) => {
    // Print live-updating table to console
  };
}
```

## Cleaning Up

To stop Postgres and remove volumes:

```bash
npm run dev:db-down
```

To completely clean the database and Zero replica files:

```bash
npm run dev:clean
```

## Deployment

This is a development demo. For production deployment to Cloudflare:

1. Create a production Postgres database with logical replication enabled
2. Set up environment variables in Cloudflare dashboard or via `wrangler secret`
3. Deploy: `npm run deploy`

Note: You'll need to host the Zero cache server somewhere accessible to your Worker (Cloudflare Workers can make outbound HTTP requests).

## Learn More

- [Zero Documentation](https://zero.rocicorp.dev)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Hono Framework](https://hono.dev/)
