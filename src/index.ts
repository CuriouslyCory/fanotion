#!/usr/bin/env node
import { exec } from "child_process";
import { promisify } from "util";
import { Client } from "@notionhq/client";
import { type BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints.js";
import chalk from "chalk";
import { Command } from "commander";
import { z } from "zod";

import "dotenv/config";

import { env } from "./env.js";
import { createTextBlock } from "./notion-helpers.js";
import {
  storeNoteOptionsSchema,
  youtubeMetadataSchema,
  ytSummaryOptionsSchema,
} from "./schemas.js";
import { escapeForEcho } from "./string-utils.js";

const program = new Command();

program
  .name("notion-cli")
  .description("A simple CLI tool to interact with Notion API")
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

async function getYoutubeMetadata(uri: string): Promise<YoutubeMetadata> {
  const command = `yt --metadata ${uri}`;
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(command);
    const metadata = youtubeMetadataSchema.parse(JSON.parse(stdout));
    return metadata;
  } catch (error) {
    console.error("Error getting YouTube metadata:", error);
    throw error;
  }
}

async function getYoutubeTranscript(uri: string): Promise<string> {
  const command = `yt --transcript ${uri}`;
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(command);
    const transcript = z.string().parse(stdout);
    return transcript;
  } catch (error) {
    console.error("Error getting YouTube metadata:", error);
    throw error;
  }
}

async function fabric(promptTemplate: string, input: string, model = "gpt-4o") {
  const escapedInput = escapeForEcho(input);
  const command = `echo "${escapedInput}" | fabric -m ${model} -p ${promptTemplate}`;
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } catch (error) {
    console.error("Error running fabric command:", error);
    throw error;
  }
}

interface YoutubeMetadata {
  id: string;
  title: string;
  channel: string;
  published_at: string;
}

/**
 * Function to create a new page in an existing page.
 *
 * @param {string} parentPageId - The ID of the parent page.
 * @param {string} title - The title of the new page.
 * @param {BlockObjectRequest[]} content - The content of the new page.
 */
async function createPageInExistingPage(
  parentPageId: string,
  title: string,
  content: BlockObjectRequest[]
) {
  // Initialize the Notion client
  const notion = new Client({ auth: env.NOTION_TOKEN });

  try {
    await notion.pages.create({
      parent: { page_id: parentPageId },
      properties: {
        title: [
          {
            type: "text",
            text: {
              content: title,
            },
          },
        ],
      },
      children: content,
    });

    console.log("Page created successfully");
  } catch (error) {
    console.error("Error creating page:", error);
  }
}

function readPipedInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", function (chunk) {
      data += chunk.toString(); // Convert chunk to a string before concatenating
    });

    process.stdin.on("end", function () {
      resolve(data);
    });

    process.stdin.on("error", function (error) {
      reject(error);
    });
  });
}
