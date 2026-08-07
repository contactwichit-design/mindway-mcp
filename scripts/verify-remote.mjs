import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const targetUrl = process.argv[2];
if (!targetUrl) {
  console.error("Usage: npm run verify:remote -- <https://service.example/mcp>");
  process.exit(1);
}

async function main() {
  const mcpUrl = new URL(targetUrl);
  const healthUrl = new URL(mcpUrl.toString());
  healthUrl.pathname = healthUrl.pathname.replace(/\/mcp\/?$/, "/health");

  const health = await fetch(healthUrl);
  if (!health.ok) throw new Error(`Health check failed: HTTP ${health.status}`);
  const healthJson = await health.json();
  if (healthJson.status !== "ok") throw new Error("Health payload status is not ok");

  const client = new Client({ name: "mindway-remote-qc", version: "1.0.0" });
  try {
    await client.connect(new StreamableHTTPClientTransport(mcpUrl));
    const tools = await client.listTools();
    const expectedTools = [
      "mindway_load", "mindway_get_entry", "mindway_search_public",
      "mindway_get_file", "mindway_context_bundle", "mindway_status"
    ];
    const names = new Set(tools.tools.map((tool) => tool.name));
    for (const name of expectedTools) if (!names.has(name)) throw new Error(`Missing MCP tool: ${name}`);
    if (tools.tools.length !== expectedTools.length) throw new Error(`Expected 6 tools, received ${tools.tools.length}`);

    const calls = [
      { name: "mindway_get_entry", arguments: {} },
      { name: "mindway_load", arguments: { include_linked_files: true } },
      { name: "mindway_search_public", arguments: { query: "mindway", limit: 3 } },
      { name: "mindway_get_file", arguments: { path: "my.md" } },
      { name: "mindway_context_bundle", arguments: { task: "security audit", max_files: 3 } },
      { name: "mindway_status", arguments: {} }
    ];
    for (const call of calls) {
      const result = await client.callTool(call);
      if (result.isError) throw new Error(`Tool failed: ${call.name}`);
    }

    const resources = await client.listResources();
    if (resources.resources.length < 3) throw new Error("Expected at least 3 resources");
    const entry = resources.resources.find((r) => r.uri === "mindway://entry");
    if (!entry) throw new Error("mindway://entry resource missing");
    await client.readResource({ uri: entry.uri });

    const prompts = await client.listPrompts();
    if (!prompts.prompts.some((p) => p.name === "mindway_start")) throw new Error("mindway_start prompt missing");
    await client.getPrompt({ name: "mindway_start", arguments: {} });

    console.log("Remote MCP verification PASS");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Remote MCP verification FAIL", error);
  process.exit(1);
});
