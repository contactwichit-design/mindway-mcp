import { GitHubClient, GitHubFileResult } from "./client.js";
import { SecurityCheck } from "../security/allowlist.js";

export class MindwayRepository {
  private client: GitHubClient;
  private lastSuccessfulFetch: string | null = null;

  constructor() {
    this.client = new GitHubClient();
  }

  getCanonicalEntryUrl(): string {
    return this.client.getCanonicalEntryUrl();
  }

  getLastSuccessfulFetchTime(): string | null {
    return this.lastSuccessfulFetch;
  }

  async getFile(relativePath: string): Promise<GitHubFileResult> {
    const check = SecurityCheck.validateRelativePath(relativePath);
    if (!check.valid) {
      return {
        path: relativePath,
        content: "",
        sourceUrl: this.client.getRawUrl(relativePath),
        fetchedAt: new Date().toISOString(),
        sizeBytes: 0,
        error: check.reason
      };
    }

    const result = await this.client.fetchRawFile(check.normalizedPath || relativePath);
    if (!result.error) {
      const sizeCheck = SecurityCheck.validateContentSize(result.sizeBytes);
      if (!sizeCheck.valid) {
        result.error = sizeCheck.reason;
        result.content = "";
      } else {
        this.lastSuccessfulFetch = result.fetchedAt;
      }
    }
    return result;
  }

  async searchPublicFiles(query: string, limit = 5): Promise<Array<{ path: string; snippet: string; sourceUrl: string; score: number }>> {
    const treeResult = await this.client.fetchRepositoryTree();
    if (treeResult.error || !treeResult.items.length) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const matches: Array<{ path: string; snippet: string; sourceUrl: string; score: number }> = [];

    const allowedItems = treeResult.items.filter(item => item.type === "blob" && SecurityCheck.validateRelativePath(item.path).valid);

    for (const item of allowedItems) {
      if (matches.length >= limit * 2) break;

      const pathMatch = item.path.toLowerCase().includes(lowerQuery);
      const fileRes = await this.client.fetchRawFile(item.path);

      if (fileRes.error || !fileRes.content) continue;

      const contentLower = fileRes.content.toLowerCase();
      const contentMatch = contentLower.includes(lowerQuery);

      if (pathMatch || contentMatch) {
        let snippet = fileRes.content.slice(0, 300).trim();
        if (contentMatch) {
          const idx = contentLower.indexOf(lowerQuery);
          const start = Math.max(0, idx - 50);
          const end = Math.min(fileRes.content.length, idx + 200);
          snippet = (start > 0 ? "..." : "") + fileRes.content.slice(start, end).trim() + (end < fileRes.content.length ? "..." : "");
        }

        const score = (pathMatch ? 10 : 0) + (contentMatch ? 5 : 0);
        matches.push({
          path: item.path,
          snippet,
          sourceUrl: fileRes.sourceUrl,
          score
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, limit);
  }
}
