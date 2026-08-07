import { MindwayRepository } from "../github/repository.js";
import { MindwayContextBundleSchema } from "../security/validation.js";

export async function handleMindwayContextBundle(repo: MindwayRepository, input: unknown) {
  const parsed = MindwayContextBundleSchema.parse(input || {});
  const maxFiles = parsed.max_files || 3;

  const bundleFiles: Array<{
    path: string;
    content: string;
    sourceUrl: string;
    fetchedAt: string;
    relevanceReason: string;
  }> = [];

  const addedPaths = new Set<string>();

  // Always include my.md
  const entryRes = await repo.getFile("my.md");
  if (!entryRes.error) {
    bundleFiles.push({
      path: "my.md",
      content: entryRes.content,
      sourceUrl: entryRes.sourceUrl,
      fetchedAt: entryRes.fetchedAt,
      relevanceReason: "Canonical Mindway entry file (always required)."
    });
    addedPaths.add("my.md");
  }

  // Search for additional files matching task terms if budget permits
  if (bundleFiles.length < maxFiles) {
    const searchRes = await repo.searchPublicFiles(parsed.task, maxFiles - bundleFiles.length);
    for (const match of searchRes) {
      if (addedPaths.has(match.path)) continue;
      const fileRes = await repo.getFile(match.path);
      if (!fileRes.error) {
        bundleFiles.push({
          path: match.path,
          content: fileRes.content,
          sourceUrl: fileRes.sourceUrl,
          fetchedAt: fileRes.fetchedAt,
          relevanceReason: `Matched query terms for task: '${parsed.task}'`
        });
        addedPaths.add(match.path);
      }
      if (bundleFiles.length >= maxFiles) break;
    }
  }

  // Fallback to standard protocol files if search yields fewer than max_files
  const standardFallbacks = ["README.md", "PUBLIC_STANDARD.md"];
  for (const fallbackPath of standardFallbacks) {
    if (bundleFiles.length >= maxFiles) break;
    if (!addedPaths.has(fallbackPath)) {
      const fbRes = await repo.getFile(fallbackPath);
      if (!fbRes.error) {
        bundleFiles.push({
          path: fallbackPath,
          content: fbRes.content,
          sourceUrl: fbRes.sourceUrl,
          fetchedAt: fbRes.fetchedAt,
          relevanceReason: "Core Mindway protocol standard file (standard fallback context)."
        });
        addedPaths.add(fallbackPath);
      }
    }
  }

  return {
    task: parsed.task,
    max_files: maxFiles,
    files_included: bundleFiles.length,
    bundle: bundleFiles
  };
}
