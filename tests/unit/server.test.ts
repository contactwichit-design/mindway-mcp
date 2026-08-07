import { describe, it, expect } from "vitest";
import { createServer } from "../../src/server.js";
import type { Server } from "node:http";

describe("Server HTTP Endpoints", () => {
  it("GET /health returns status ok", async () => {
    const app = createServer();
    let server: Server | undefined;

    try {
      await new Promise<void>(resolve => {
        server = app.listen(0, "127.0.0.1", () => resolve());
      });
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Could not resolve test port");

      const response = await fetch(`http://127.0.0.1:${address.port}/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        status: "ok",
        service: "mindway-mcp",
        version: "1.0.0"
      });
    } finally {
      if (server) await new Promise<void>(resolve => server!.close(() => resolve()));
    }
  });
});
