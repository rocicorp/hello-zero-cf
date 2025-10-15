import { DurableObject } from "cloudflare:workers";
import { Zero } from "@rocicorp/zero";
import { clearTerminal, cursorTo } from "ansi-escapes";
import {
  schema,
  type Schema,
  type Message,
  type User,
} from "../shared/schema.js";
import { queries } from "../shared/queries.js";
import { formatDate } from "../react-app/date.js";

export class ZeroDO extends DurableObject {
  #z: Zero<Schema> = new Zero({
    server: "http://localhost:4848",
    userID: "anon",
    schema,
    kvStore: "mem",
  });

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    addEventListener("unhandledrejection", (e) => {
      console.log("unhandledrejection", e);
    });
    const view = this.#z.materialize(queries.messages());
    view.addListener(this.#render);
  }

  #render = (
    messages: readonly (Message & { readonly sender: User | undefined })[]
  ) => {
    let s = clearTerminal;
    s += cursorTo(0, 0);

    s += "Sender".padEnd(12) + "Message".padEnd(72) + "Sent" + "\n";
    for (const message of messages) {
      s +=
        (message.sender?.name ?? "Unknown").padEnd(12) +
        message.body.padEnd(72) +
        formatDate(message.timestamp) +
        "\n";
    }

    console.log(s);
  };

  init() {
    const url = "http://localhost:5173/";
    return `Watching messages from <a href="${url}" target="_blank">${url}</a>`;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/init") {
      return new Response(this.init(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
