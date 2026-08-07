import { MindwayRepository } from "../github/repository.js";
import { MindwayStatusSchema } from "../security/validation.js";
import { CONFIG } from "../config.js";

const startTime = Date.now();

export async function handleMindwayStatus(repo: MindwayRepository, input: unknown) {
  MindwayStatusSchema.parse(input || {});
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const entryRes = await repo.getFile("my.md");

  return {
    service: CONFIG.SERVICE_NAME,
    version: CONFIG.VERSION,
    uptime_seconds: uptimeSeconds,
    canonical_repository: `${CONFIG.GITHUB_REPO_OWNER}/${CONFIG.GITHUB_REPO_NAME}`,
    canonical_entry_url: repo.getCanonicalEntryUrl(),
    latest_successful_retrieval_time: repo.getLastSuccessfulFetchTime(),
    source_availability: !entryRes.error ? "available" : "degraded",
    source_error: entryRes.error || null,
    cache_status: "live-upstream"
  };
}
