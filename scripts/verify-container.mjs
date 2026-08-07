import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const baseUrl = process.env.MINDWAY_MCP_URL || "http://127.0.0.1:8080";

async function main() {
  const health = await fetch(`${baseUrl}/health`);
  if (!health.ok) throw new Error(`Health check failed: HTTP ${health.status}`);
  const healthJson = await health.json();
  if (healthJson.status !== "ok") throw new Error("Health payload status is not ok");

  const client = new Client({ name: "mindway-runtime-qc", version: "1.0.0" });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`)));
    const tools = await client.listTools();
    const expected = [
      "mindway_load",
      "mindway_get_entry",
      "mindway_search_public",
      "mindway_get_file",
      "mindway_context_bundle",
      "mindway_status"
    ];
    const names = new Set(tools.tools.map((tool) => tool.name));
    for (const name of expected) {
      if (!names.has(name)) throw new Error(`Missing MCP tool: ${name}`);
    }
    if (tools.tools.length !== expected.length) {
      throw new Error(`Expected ${expected.length} tools, received ${tools.tools.length}`);
    }

    const status = await client.callTool({ name: "mindway_status", arguments: {} });
    const text = status.content.find(item => item.type === "text");
    if (!text || text.type !== "text" || !text.text.includes('"service": "mindway-mcp"')) {
      throw new Error("mindway_status returned unexpected content");
    }

    console.log("Runtime MCP QC PASS");
  } finally {
    await client.close();
  }
}

main().catch(error => {
  console.error("Runtime MCP QC FAIL", error);
  process.exit(1);
});
