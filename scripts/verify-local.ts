import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createServer } from "../src/server.js";
import type { Server } from "node:http";

async function main() {
  const app = createServer();
  let httpServer: Server | undefined;
  try {
    await new Promise<void>(resolve => {
      httpServer = app.listen(0, "127.0.0.1", () => resolve());
    });
    const address = httpServer.address();
    if (!address || typeof address === "string") throw new Error("Could not resolve local port");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${baseUrl}/health`);
    if (!health.ok) throw new Error(`Health check failed: HTTP ${health.status}`);

    const client = new Client({ name: "mindway-local-qc", version: "1.0.0" });
    try {
      await client.connect(new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`)));
      const tools = await client.listTools();
      if (tools.tools.length !== 6) throw new Error(`Expected 6 tools, received ${tools.tools.length}`);
      const resources = await client.listResources();
      if (resources.resources.length < 3) throw new Error("Expected at least 3 resources");
      const prompts = await client.listPrompts();
      if (!prompts.prompts.some(p => p.name === "mindway_start")) throw new Error("mindway_start prompt missing");
      const status = await client.callTool({ name: "mindway_status", arguments: {} });
      if (!status.content.some(item => item.type === "text" && item.text.includes('"service": "mindway-mcp"'))) {
        throw new Error("mindway_status returned unexpected content");
      }
      console.log("Local MCP verification PASS");
    } finally {
      await client.close();
    }
  } finally {
    if (httpServer) await new Promise<void>(resolve => httpServer!.close(() => resolve()));
  }
}

main().catch(error => {
  console.error("Local MCP verification FAIL", error);
  process.exit(1);
});
