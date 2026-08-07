import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CONFIG } from "./config.js";
import { MindwayRepository } from "./github/repository.js";
import { handleMindwayLoad } from "./tools/load.js";
import { handleMindwayGetEntry } from "./tools/get-entry.js";
import { handleMindwaySearchPublic } from "./tools/search-public.js";
import { handleMindwayGetFile } from "./tools/get-file.js";
import { handleMindwayContextBundle } from "./tools/context-bundle.js";
import { handleMindwayStatus } from "./tools/status.js";
import { handleGetPrompt } from "./prompts/mindway-start.js";

function asTextResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }]
  };
}

export function createMcpServer(repo = new MindwayRepository()) {
  const server = new McpServer(
    { name: CONFIG.SERVICE_NAME, version: CONFIG.VERSION },
    {
      instructions:
        "Mindway is a read-only canonical context gateway. Load the canonical entry first, request only task-relevant public context, and never infer inaccessible or private data."
    }
  );

  server.registerTool(
    "mindway_load",
    {
      title: "Load Mindway",
      description: "Load canonical Mindway startup context.",
      inputSchema: {
        include_linked_files: z.boolean().optional().default(true)
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async args => asTextResult(await handleMindwayLoad(repo, args))
  );

  server.registerTool(
    "mindway_get_entry",
    {
      title: "Get Mindway Entry",
      description: "Return only the canonical my.md entry file.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async args => asTextResult(await handleMindwayGetEntry(repo, args))
  );

  server.registerTool(
    "mindway_search_public",
    {
      title: "Search Mindway Public Sources",
      description: "Search approved public Markdown and text files in the Mindway repository.",
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().positive().max(10).optional().default(5)
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async args => asTextResult(await handleMindwaySearchPublic(repo, args))
  );

  server.registerTool(
    "mindway_get_file",
    {
      title: "Get Mindway File",
      description: "Read one approved public file from the Mindway repository.",
      inputSchema: { path: z.string().min(1) },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async args => asTextResult(await handleMindwayGetFile(repo, args))
  );

  server.registerTool(
    "mindway_context_bundle",
    {
      title: "Build Mindway Context Bundle",
      description: "Build a minimal public context bundle tailored to a task.",
      inputSchema: {
        task: z.string().min(1),
        max_files: z.number().int().positive().max(5).optional().default(3)
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async args => asTextResult(await handleMindwayContextBundle(repo, args))
  );

  server.registerTool(
    "mindway_status",
    {
      title: "Mindway Status",
      description: "Report server and canonical source availability status.",
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async args => asTextResult(await handleMindwayStatus(repo, args))
  );

  const resources = [
    ["mindway-entry", "mindway://entry", "Mindway Entry File", "my.md"],
    ["mindway-readme", "mindway://readme", "Mindway README", "README.md"],
    ["mindway-public-standard", "mindway://public-standard", "Mindway Public Standard", "PUBLIC_STANDARD.md"]
  ] as const;

  for (const [name, uri, title, path] of resources) {
    server.registerResource(
      name,
      uri,
      { title, description: `Read-only canonical Mindway resource: ${path}`, mimeType: "text/markdown" },
      async resourceUri => {
        const result = await repo.getFile(path);
        if (result.error) throw new Error(result.error);
        return {
          contents: [{ uri: resourceUri.href, mimeType: "text/markdown", text: result.content }]
        };
      }
    );
  }

  server.registerPrompt(
    "mindway_start",
    {
      title: "Start with Mindway",
      description: "Start work using the Mindway /my operating protocol.",
      argsSchema: {}
    },
    async () => handleGetPrompt("mindway_start")
  );

  return server;
}
