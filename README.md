# Mindway MCP Server

Mindway MCP is the canonical context gateway for the **Mindway operating protocol**. It allows MCP-compatible AI clients (such as Gemini Spark Custom Connected Apps) to read startup context, search public guidelines, and load relevant protocol documentation safely.

- **Canonical Public Entry**: `https://raw.githubusercontent.com/contactwichit-design/mindway/main/my.md`
- **Protocol Endpoint**: `https://<deployed-domain>/mcp`
- **Health Check**: `GET /health`

---

## Capabilities & Tools (Read-Only Version 1)

1. `mindway_load`: Load canonical startup context (`my.md`, `README.md`, `PUBLIC_STANDARD.md`).
2. `mindway_get_entry`: Retrieve the canonical `my.md` entry file.
3. `mindway_search_public`: Search approved public Markdown files in `contactwichit-design/mindway`.
4. `mindway_get_file`: Read one approved public file with path traversal protection.
5. `mindway_context_bundle`: Build a minimal context bundle tailored to a task.
6. `mindway_status`: Report server health, version, uptime, and canonical source status.

---

## Security Model
- **Read-Only**: Version 1 has zero write, update, delete, or external URL capabilities.
- **Path Traversal Protection**: Strictly blocks `../`, absolute paths, dotfiles, and secrets.
- **Extension Allowlist**: Only `.md`, `.txt`, `.json`, `.yaml`, `.yml`, `.csv` files permitted.
- **Rate Limiting**: 100 requests per minute per IP.
- **File Size Caps**: 1 MB maximum per file.

---

## Local Setup & Testing

```bash
# Install dependencies
npm install

# Build
npm run build

# Run unit tests
npm test

# Run local integration test
npm run test:integration

# Start local server
npm start
```

---

## Docker Support

```bash
docker build -t mindway-mcp .
docker run -p 8080:8080 mindway-mcp
```
