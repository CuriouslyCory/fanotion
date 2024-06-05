import { z } from "zod";

export const storeNoteOptionsSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
});

export const youtubeMetadataSchema = z.object({
  id: z.string(),
  channel: z.string(),
  title: z.string(),
  published_at: z.string(),
});

export type YoutubeMetadata = z.infer<typeof youtubeMetadataSchema>;
