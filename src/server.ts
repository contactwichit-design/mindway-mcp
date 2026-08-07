import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CONFIG } from "./config.js";
import { Logger } from "./logging/logger.js";
import { RateLimiter } from "./security/rate-limit.js";
import { createMcpServer } from "./mcp.js";

export function createServer() {
  const app = express();

  // Cloud Run sits behind a trusted proxy. Use Express proxy parsing rather than
  // manually trusting arbitrary X-Forwarded-For input.
  app.set("trust proxy", 1);
  app.use(cors({ exposedHeaders: ["Mcp-Session-Id"] }));
  app.use(express.json({ limit: "1mb" }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const rl = RateLimiter.check(req.ip || req.socket.remoteAddress || "unknown");
    res.setHeader("X-RateLimit-Limit", CONFIG.RATE_LIMIT_MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", rl.remaining);
    if (!rl.allowed) {
      Logger.warn("Rate limit exceeded", { ip: req.ip });
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", service: CONFIG.SERVICE_NAME, version: CONFIG.VERSION });
  });

  // Stateless Streamable HTTP: every request gets a fresh MCP server/transport.
  // This is horizontally scalable on Cloud Run because no session state is kept
  // in process memory.
  app.post("/mcp", async (req: Request, res: Response) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      Logger.error("MCP request processing error", { error: message });
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null
        });
      }
    } finally {
      await transport.close().catch(() => undefined);
      await server.close().catch(() => undefined);
    }
  });

  // Stateless servers do not expose a standalone SSE stream or session DELETE.
  app.get("/mcp", (_req: Request, res: Response) => res.status(405).set("Allow", "POST").end());
  app.delete("/mcp", (_req: Request, res: Response) => res.status(405).set("Allow", "POST").end());

  return app;
}
