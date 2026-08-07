import { z } from "zod";

export const MindwayLoadSchema = z.object({
  include_linked_files: z.boolean().optional().default(true)
});

export const MindwayGetEntrySchema = z.object({});

export const MindwaySearchPublicSchema = z.object({
  query: z.string().min(1, "Query string cannot be empty"),
  limit: z.number().int().positive().max(10).optional().default(5)
});

export const MindwayGetFileSchema = z.object({
  path: z.string()
    .min(1, "Relative file path is required")
    .refine(p => !p.includes(".."), "Path traversal ('..') is prohibited")
    .refine(p => !p.startsWith("/"), "Absolute paths are prohibited")
});

export const MindwayContextBundleSchema = z.object({
  task: z.string().min(1, "Task description is required"),
  max_files: z.number().int().positive().max(5).optional().default(3)
});

export const MindwayStatusSchema = z.object({});
