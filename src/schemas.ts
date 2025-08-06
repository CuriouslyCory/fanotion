import { z } from "zod";

export const storeNoteOptionsSchema = z.object({
  name: z.string().optional(),
  content: z.string().optional(),
});

export const youtubeMetadataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  publishedAt: z.string().optional(),
  channelId: z.string(),
  channelTitle: z.string(),
  categoryId: z.string(),
  tags: z.array(z.string()),
  viewCount: z.number(),
  likeCount: z.number().optional(),
});

export type YoutubeMetadata = z.infer<typeof youtubeMetadataSchema>;

export const ytSummaryOptionsSchema = z.object({
  model: z.string().optional(),
});

export type YtSummaryOptions = z.infer<typeof ytSummaryOptionsSchema>;
