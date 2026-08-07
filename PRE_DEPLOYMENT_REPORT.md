# PRE-DEPLOYMENT REPORT — Runtime-QC Architecture Revision

Status: `BLOCKED_OWNER_ACTION_REPO_CREATE`

## What is verified in the current workspace

- Source package extracted successfully.
- Previous hand-written/fabricated `package-lock.json` is absent.
- Offline source/secret audit: PASS, exit 0.
- MCP HTTP layer has been replaced with the official `@modelcontextprotocol/sdk` v1 production API and Streamable HTTP transport.
- Integration tests now use the official MCP `Client` + `StreamableHTTPClientTransport` rather than hand-crafted JSON-RPC requests.
- Permanent GitHub Actions gates were added for lockfile bootstrap and full runtime QC.
- GitHub repository lookup for `contactwichit-design/mindway-mcp` returned 404 at QC time; repository creation is therefore the current external owner action.

## Not yet independently verified

The current execution environment cannot install npm dependencies from the external npm registry. Therefore the following are intentionally NOT marked PASS here:

- npm install / authentic package-lock generation
- npm ci
- TypeScript build
- Vitest unit tests
- Vitest MCP integration tests
- npm production dependency audit
- Docker build
- container runtime smoke test

These gates are encoded in `.github/workflows/bootstrap-lock.yml` and `.github/workflows/ci.yml` and must execute on GitHub-hosted infrastructure.

## Promotion contract

1. Owner creates `contactwichit-design/mindway-mcp`.
2. Push this source package WITHOUT a package-lock to the initial branch.
3. Run `Bootstrap authentic npm lockfile` workflow.
4. Workflow must generate the lockfile with npm, pass every runtime gate, and open the lockfile PR.
5. Merge only after the workflow is green.
6. `Runtime QC` must then be green on the exact commit proposed for deployment.
7. Main QC reviews the workflow evidence and exact commit SHA.
8. Only then may status become `READY_FOR_OWNER_DEPLOYMENT`.

No builder/self-QC claim can substitute for these runtime gates.
