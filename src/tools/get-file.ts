import { MindwayRepository } from "../github/repository.js";
import { MindwayGetFileSchema } from "../security/validation.js";

export async function handleMindwayGetFile(repo: MindwayRepository, input: unknown) {
  const parsed = MindwayGetFileSchema.parse(input || {});
  const result = await repo.getFile(parsed.path);

  if (result.error) {
    return {
      status: "error",
      error: result.error,
      path: parsed.path,
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
