# Mindway MCP Runtime QC Gate

## Single Definition of Done

An artifact may be promoted to `READY_FOR_OWNER_DEPLOYMENT` only after the committed source and lockfile pass the `Runtime QC` GitHub Actions workflow on the exact commit proposed for deployment.

Mandatory gates:

1. `npm ci`
2. `npm run build`
3. `npm test`
4. `npm run test:integration` using the official MCP client and Streamable HTTP transport
5. `node scripts/audit-check.js`
6. `npm audit --omit=dev --audit-level=high`
7. `docker build`
8. container `/health` check
9. official MCP client runtime smoke test against the built container

No static, mocked, inferred, or manually fabricated result can satisfy a runtime gate.

## Bootstrap when package-lock.json does not exist

Run the `Bootstrap authentic npm lockfile` workflow manually. It generates `package-lock.json` with npm on GitHub-hosted infrastructure, runs the full validation suite, and opens a pull request containing only the generated lockfile if every gate passes.

After that PR is merged, `Runtime QC` becomes the permanent gate for every PR and `main` push.

## Evidence contract

GitHub Actions is the execution evidence source. The commit SHA, workflow run, job logs, and generated lockfile identify the exact artifact tested. Builder agents may report `SELF_CHECKED`; independent QC promotes only after reviewing a green workflow for the exact commit.
