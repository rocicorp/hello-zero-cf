import { DurableObject } from "cloudflare:workers";

export class ZeroDO extends DurableObject {
  private count: number = 0;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/increment") {
      this.count++;
      return Response.json({ count: this.count });
    }

    if (url.pathname === "/get") {
      return Response.json({ count: this.count });
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
