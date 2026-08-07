import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createServer } from "../../src/server.js";
import type { Server } from "node:http";

function textOf(result: { content?: Array<{ type: string; text?: string }> }) {
  return result.content?.find(item => item.type === "text")?.text ?? "";
}

describe("MCP Streamable HTTP integration", () => {
  let httpServer: Server;
  let baseUrl: string;
  let client: Client;

  beforeAll(async () => {
    const app = createServer();
    await new Promise<void>(resolve => {
      httpServer = app.listen(0, "127.0.0.1", () => resolve());
    });
    const address = httpServer.address();
    if (!address || typeof address === "string") throw new Error("Could not resolve test port");
    baseUrl = `http://127.0.0.1:${address.port}`;

    client = new Client({ name: "mindway-mcp-integration-test", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`)));
  });

  afterAll(async () => {
    await client?.close();
    await new Promise<void>(resolve => httpServer?.close(() => resolve()));
  });

  it("health endpoint returns service metadata", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok", service: "mindway-mcp", version: "1.0.0" });
  });

  it("official MCP client lists all six tools", async () => {
    const result = await client.listTools();
    const names = result.tools.map(tool => tool.name);
    expect(names).toEqual(expect.arrayContaining([
      "mindway_load",
      "mindway_get_entry",
      "mindway_search_public",
      "mindway_get_file",
      "mindway_context_bundle",
      "mindway_status"
    ]));
    expect(result.tools).toHaveLength(6);
  });

  it("official MCP client lists canonical resources", async () => {
    const result = await client.listResources();
    expect(result.resources.map(resource => resource.uri)).toEqual(expect.arrayContaining([
      "mindway://entry",
      "mindway://readme",
      "mindway://public-standard"
    ]));
  });

  it("official MCP client lists mindway_start prompt", async () => {
    const result = await client.listPrompts();
    expect(result.prompts.map(prompt => prompt.name)).toContain("mindway_start");
  });

  it("mindway_status executes through MCP transport", async () => {
    const result = await client.callTool({ name: "mindway_status", arguments: {} });
    expect(textOf(result as never)).toContain('"service": "mindway-mcp"');
  });
});
