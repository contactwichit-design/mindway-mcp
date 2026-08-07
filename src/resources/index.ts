import { MindwayRepository } from "../github/repository.js";

export const RESOURCE_DEFINITIONS = [
  {
    uri: "mindway://entry",
    name: "Mindway Entry File (my.md)",
    description: "The canonical public entry file for the Mindway protocol.",
    mimeType: "text/markdown"
  },
  {
    uri: "mindway://readme",
    name: "Mindway README File",
    description: "Overview and usage documentation for Mindway.",
    mimeType: "text/markdown"
  },
  {
    uri: "mindway://public-standard",
    name: "Mindway Public Standard",
    description: "The public standard and guidelines for Mindway.",
    mimeType: "text/markdown"
  }
];

export async function handleReadResource(uri: string, repo: MindwayRepository) {
  let path = "";
  if (uri === "mindway://entry") path = "my.md";
  else if (uri === "mindway://readme") path = "README.md";
  else if (uri === "mindway://public-standard") path = "PUBLIC_STANDARD.md";
  else throw new Error(`Unknown resource URI: ${uri}`);

  const res = await repo.getFile(path);
  if (res.error) {
    throw new Error(`Failed to read resource ${uri}: ${res.error}`);
  }

  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text: res.content
      }
    ]
  };
}
