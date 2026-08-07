import { MindwayRepository } from "../github/repository.js";
import { MindwayGetEntrySchema } from "../security/validation.js";

export async function handleMindwayGetEntry(repo: MindwayRepository, input: unknown) {
  MindwayGetEntrySchema.parse(input || {});
  const result = await repo.getFile("my.md");

  if (result.error) {
    return {
      status: "error",
      error: result.error,
      path: "my.md",
      source_url: result.sourceUrl,
      fetched_at: result.fetchedAt
    };
  }

  return {
    status: "success",
    path: result.path,
    content: result.content,
    source_url: result.sourceUrl,
    fetched_at: result.fetchedAt,
    etag: result.etag,
    size_bytes: result.sizeBytes
  };
}
