import dotenv from "dotenv";
dotenv.config();

const owner = process.env.GITHUB_REPO_OWNER || "contactwichit-design";
const repo = process.env.GITHUB_REPO_NAME || "mindway";
const branch = process.env.GITHUB_BRANCH || "main";

export const CONFIG = {
  PORT: parseInt(process.env.PORT || "8080", 10),
  SERVICE_NAME: "mindway-mcp",
  VERSION: "1.0.0",
  GITHUB_REPO_OWNER: owner,
  GITHUB_REPO_NAME: repo,
  GITHUB_BRANCH: branch,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  CANONICAL_ENTRY_URL: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/my.md`,
  ALLOWED_EXTENSIONS: [".md", ".txt", ".json", ".yaml", ".yml", ".csv"],
  MAX_FILE_SIZE_BYTES: 1024 * 1024, // 1 MB
  UPSTREAM_TIMEOUT_MS: 10000, // 10s
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100
};
