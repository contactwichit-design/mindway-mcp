import { MindwayRepository } from "../github/repository.js";
import { MindwayLoadSchema } from "../security/validation.js";
import { z } from "zod";

export async function handleMindwayLoad(repo: MindwayRepository, input: unknown) {
  const parsed = MindwayLoadSchema.parse(input || {});
  const filesToFetch = ["my.md"];

  if (parsed.include_linked_files) {
    filesToFetch.push("README.md", "PUBLIC_STANDARD.md");
  }

  const loadedFiles: Array<{ path: string; content: string; sourceUrl: string; fetchedAt: string; etag?: string }> = [];
  const failedFiles: Array<{ path: string; sourceUrl: string; error: string }> = [];

  for (const filePath of filesToFetch) {
    const result = await repo.getFile(filePath);
    if (result.error) {
      failedFiles.push({
        path: filePath,
        sourceUrl: result.sourceUrl,
        error: result.error
      });
    } else {
      loadedFiles.push({
        path: result.path,
        content: result.content,
        sourceUrl: result.sourceUrl,
        fetchedAt: result.fetchedAt,
        etag: result.etag
      });
    }
  }

  return {
    status: loadedFiles.length > 0 ? "success" : "failure",
    loaded_files: loadedFiles,
    failed_files: failedFiles,
    total_requested: filesToFetch.length,
    total_loaded: loadedFiles.length
  };
}
