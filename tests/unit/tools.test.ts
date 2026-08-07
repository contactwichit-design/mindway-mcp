import { describe, it, expect, vi } from "vitest";
import { MindwayRepository } from "../../src/github/repository.js";
import { handleMindwayGetEntry } from "../../src/tools/get-entry.js";
import { handleMindwayGetFile } from "../../src/tools/get-file.js";
import { handleMindwayStatus } from "../../src/tools/status.js";

describe("Mindway Tools Handlers", () => {
  it("handleMindwayGetEntry returns my.md content on success", async () => {
    const mockRepo = new MindwayRepository();
    vi.spyOn(mockRepo, "getFile").mockResolvedValue({
      path: "my.md",
      content: "# /my – Mindway Public Entry",
      sourceUrl: "https://raw.githubusercontent.com/contactwichit-design/mindway/main/my.md",
      fetchedAt: new Date().toISOString(),
      sizeBytes: 28
    });

    const res = await handleMindwayGetEntry(mockRepo, {});
    expect(res.status).toBe("success");
    expect(res.content).toContain("/my");
  });

  it("handleMindwayGetFile rejects invalid traversal path", async () => {
    const mockRepo = new MindwayRepository();
    await expect(handleMindwayGetFile(mockRepo, { path: "../secret.txt" }))
      .rejects.toThrow("Path traversal");
  });

  it("handleMindwayStatus returns valid status metrics", async () => {
    const mockRepo = new MindwayRepository();
    vi.spyOn(mockRepo, "getFile").mockResolvedValue({
      path: "my.md",
      content: "# /my",
      sourceUrl: "https://raw.githubusercontent.com/contactwichit-design/mindway/main/my.md",
      fetchedAt: new Date().toISOString(),
      sizeBytes: 10
    });

    const res = await handleMindwayStatus(mockRepo, {});
    expect(res.service).toBe("mindway-mcp");
    expect(res.source_availability).toBe("available");
  });
});
