#!/usr/bin/env node
import { type BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints.js";
import chalk from "chalk";
import { Command } from "commander";
import { z } from "zod";

import "dotenv/config";

import { env } from "./env.js";
import { fabric } from "./helpers/fabric.js";
import { createPageInExistingPage, createTextBlock } from "./helpers/notion.js";
import { readPipedInput } from "./helpers/stdin.js";
import { getYoutubeMetadata, getYoutubeTranscript } from "./helpers/youtube.js";
import { storeNoteOptionsSchema, ytSummaryOptionsSchema } from "./schemas.js";

const program = new Command();

program
  .name("notion-cli")
  .description("A CLI tool to interact with notion.so and fabric")
  .version("1.0.0");

program
  .command("store-note")
  .description("Store a new note in Notion")
  .option("-n, --name <name>", "name of the note")
  .option("-c, --content <content>", "note content if not piped")
  .action(async (rawOptions) => {
    const options = storeNoteOptionsSchema.parse(rawOptions);
    const input = options?.content ?? (await readPipedInput());
    const name = options.name ?? "Untitled Note";
    console.log(chalk.green(`Storing note, ${name}!`));
    const content: BlockObjectRequest[] = [...createTextBlock(input)];
    createPageInExistingPage(env.NOTION_PAGE_ID ?? "", name, content).catch(
      console.error
    );
  });

program
  .command("yt-summary")
  .description("Create a page in Notion with YouTube video summary")
  .argument("<uri>", "URI of the YouTube video")
  .option(
    "-m, --model <model>",
    "name of the AI model to use (default: gpt-4o)"
  )
  .action(async (rawUri, rawOptions) => {
    const uri = z.string().url().parse(rawUri);
    const { model } = ytSummaryOptionsSchema.parse(rawOptions);
    console.log(chalk.green(`Retrieving YouTube metadata`));
    const ytMetadata = await getYoutubeMetadata(uri);
    console.log(chalk.green(`Retrieving YouTube transcript`));
    const transcript = await getYoutubeTranscript(uri);
    console.log(chalk.green(`Generating summary`));
    const summary = await fabric("summarize", transcript, model ?? "gpt-4o");
    console.log(chalk.green(`Generating wisdom`));
    const wisdom = await fabric(
      "extract_wisdom",
      transcript,
      model ?? "gpt-4o"
    );
    const name = `${ytMetadata.channel}: ${ytMetadata.title}`;
    console.log(chalk.green(`Saving Note: ${name}`));
    const content: BlockObjectRequest[] = [
      ...createTextBlock(summary),
      ...createTextBlock(wisdom),
    ];
    createPageInExistingPage(env.NOTION_PAGE_ID ?? "", name, content).catch(
      console.error
    );
  });

program.parse(process.argv);
