import { CONFIG } from "../config.js";
import { Logger } from "../logging/logger.js";

export interface GitHubFileResult {
  path: string;
  content: string;
  sourceUrl: string;
  fetchedAt: string;
  etag?: string;
  sha?: string;
  sizeBytes: number;
  error?: string;
}

export interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
  url: string;
}

export class GitHubClient {
  private owner: string;
  private repo: string;
  private branch: string;
  private token: string;

  constructor() {
    this.owner = CONFIG.GITHUB_REPO_OWNER;
    this.repo = CONFIG.GITHUB_REPO_NAME;
    this.branch = CONFIG.GITHUB_BRANCH;
    this.token = CONFIG.GITHUB_TOKEN;
  }

  getCanonicalEntryUrl(): string {
    return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/my.md`;
  }

  getRawUrl(relativePath: string): string {
    return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${relativePath}`;
  }

  async fetchRawFile(relativePath: string): Promise<GitHubFileResult> {
    const rawUrl = this.getRawUrl(relativePath);
    const fetchedAt = new Date().toISOString();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.UPSTREAM_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        "User-Agent": "mindway-mcp/1.0.0"
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(rawUrl, {
        signal: controller.signal,
        headers
      });

      clearTimeout(timeout);

      if (!response.ok) {
        Logger.warn(`GitHub fetch failed for ${relativePath}`, { status: response.status });
        return {
          path: relativePath,
          content: "",
          sourceUrl: rawUrl,
          fetchedAt,
          sizeBytes: 0,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const content = await response.text();
      const etag = response.headers.get("etag") || undefined;
      const sizeBytes = Buffer.byteLength(content, "utf-8");

      return {
        path: relativePath,
        content,
        sourceUrl: rawUrl,
        fetchedAt,
        etag,
        sizeBytes
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      const errorMessage = err instanceof Error ? err.message : String(err);
      Logger.error(`Network error fetching ${relativePath}`, { error: errorMessage });
      return {
        path: relativePath,
        content: "",
        sourceUrl: rawUrl,
        fetchedAt,
        sizeBytes: 0,
        error: `Fetch error: ${errorMessage}`
      };
    }
  }

  async fetchRepositoryTree(): Promise<{ items: GitHubTreeItem[]; error?: string }> {
    const apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${this.branch}?recursive=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.UPSTREAM_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        "User-Agent": "mindway-mcp/1.0.0",
        "Accept": "application/vnd.github.v3+json"
      };
      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers
      });

      clearTimeout(timeout);

      if (!response.ok) {
        Logger.warn("GitHub tree fetch failed", { status: response.status });
        return { items: [], error: `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = (await response.json()) as { tree?: GitHubTreeItem[] };
      return { items: data.tree || [] };
    } catch (err: unknown) {
      clearTimeout(timeout);
      const errorMessage = err instanceof Error ? err.message : String(err);
      Logger.error("Error fetching repository tree", { error: errorMessage });
      return { items: [], error: `Tree fetch error: ${errorMessage}` };
    }
  }
}
