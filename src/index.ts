#!/usr/bin/env node
import { type BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints.js";
import chalk from "chalk";
import { Command } from "commander";
import { z } from "zod";

import "dotenv/config";

import { env } from "./env.js";
import { getPageContent } from "./helpers/browser.js";
import { fabric } from "./helpers/fabric.js";
import { createPageInExistingPage, createTextBlock } from "./helpers/notion.js";
import { readPipedInput } from "./helpers/stdin.js";
import { getYoutubeMetadata, getYoutubeTranscript } from "./helpers/youtube.js";
import { storeNoteOptionsSchema, ytSummaryOptionsSchema } from "./schemas.js";

const program = new Command();

program
  .name("fanotion")
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
    if (transcript.startsWith("Transcript not available")) {
      console.log(chalk.red(`Transcript not available`));
      return;
    }
    console.log(chalk.green(`Generating summary`));
    const summary = await fabric(
      "summarize",
      transcript,
      model ?? env.DEFAULT_MODEL
    );
    console.log(chalk.green(`Generating wisdom`));
    const wisdom = await fabric(
      "extract_wisdom",
      transcript,
      model ?? env.DEFAULT_MODEL
    );
    const name = `${ytMetadata.channelTitle}: ${ytMetadata.title}`;
    console.log(chalk.green(`Saving Note: ${name}`));
    const content: BlockObjectRequest[] = [
      ...createTextBlock(uri),
      ...createTextBlock(summary),
      ...createTextBlock(wisdom),
    ];
    createPageInExistingPage(env.NOTION_PAGE_ID ?? "", name, content).catch(
      console.error
    );
  });

program
  .command("page-summary")
  .description("Create a page summary in Notion")
  .argument("<uri>", "URI of the page")
  .option(
    "-m, --model <model>",
    "name of the AI model to use (default: gpt-4o)"
  )
  .action(async (rawUri, rawOptions) => {
    const uri = z.string().url().parse(rawUri);
    const { model } = ytSummaryOptionsSchema.parse(rawOptions);
    console.log(chalk.green(`Retrieving page content`));
    const pageContent = await getPageContent(uri);
    console.log(chalk.green(`Generating summary`));
    const summary = await fabric(
      "summarize",
      pageContent.body,
      model ?? env.DEFAULT_MODEL
    );
    console.log(chalk.green(`Generating wisdom`));
    const wisdom = await fabric(
      "extract_wisdom",
      pageContent.body,
      model ?? env.DEFAULT_MODEL
    );
    const name = `${pageContent.title} Summary`;
    console.log(chalk.green(`Saving Note: ${name}`));
    const content: BlockObjectRequest[] = [
      ...createTextBlock(uri),
      ...createTextBlock(summary),
      ...createTextBlock(wisdom),
    ];
    createPageInExistingPage(env.NOTION_PAGE_ID ?? "", name, content).catch(
      console.error
    );
  });

program.parse(process.argv);
