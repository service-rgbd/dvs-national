import { app } from "./public-hono";
import type { WorkerEnv } from "./hono/types";

export default {
  fetch(request: Request, env: WorkerEnv, ctx: { waitUntil: (promise: Promise<unknown>) => void }) {
    void ctx;
    return app.fetch(request, env);
  },
};
