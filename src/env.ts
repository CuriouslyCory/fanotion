import { z } from "zod";

export const envSchema = z.object({
  NOTION_TOKEN: z.string().min(10),
  NOTION_PAGE_ID: z.string().min(10),
  DEFAULT_MODEL: z.string(),
});

export const env = envSchema.parse(process.env);
