import { z } from "zod";

export const envSchema = z.object({
  NOTION_TOKEN: z.string(),
  NOTION_PAGE_ID: z.string(),
});

export const env = envSchema.parse(process.env);
