import { MindwayRepository } from "../github/repository.js";
import { MindwaySearchPublicSchema } from "../security/validation.js";

export async function handleMindwaySearchPublic(repo: MindwayRepository, input: unknown) {
  const parsed = MindwaySearchPublicSchema.parse(input || {});
  const results = await repo.searchPublicFiles(parsed.query, parsed.limit);

  return {
    query: parsed.query,
    limit: parsed.limit,
    results_count: results.length,
    results
  };
}
