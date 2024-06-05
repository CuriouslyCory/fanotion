#!/usr/bin/env node

import { Client } from "@notionhq/client";
import { Command } from "commander";
import chalk from "chalk";
import { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints.js";
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NOTION_TOKEN: z.string(),
  NOTION_PAGE_ID: z.string(),
});

const env = envSchema.parse(process.env);

const program = new Command();

program
  .name("notion-cli")
  .description("A simple CLI tool to interact with Notion API")
  .version("1.0.0");

program
  .command("store-note")
  .description("Store a new note in Notion")
  .option("-n, --name <name>", "name of the note")
  .action(async (options) => {
    const input = await readPipedInput();
    const name = options.name || "World";
    console.log(chalk.green(`Storing note, ${name}!`));
    const content: BlockObjectRequest[] = [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: input,
              },
            },
          ],
        },
      },
      // Add more content blocks as needed
    ];
    createPageInExistingPage(env.NOTION_PAGE_ID ?? "", name, content);
  });

program.parse(process.argv);

/**
 * Function to create a new page in an existing page
 * @param {string} parentPageId - The ID of the parent page
 * @param {string} title - The title of the new page
 * @param {BlockObjectRequest[]} content - The content of the new page
 */
async function createPageInExistingPage(
  parentPageId: string,
  title: string,
  content: BlockObjectRequest[]
) {
  // Initialize the Notion client
  const notion = new Client({ auth: env.NOTION_TOKEN });

  try {
    const response = await notion.pages.create({
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
      data += chunk;
    });

    process.stdin.on("end", function () {
      resolve(data);
    });

    process.stdin.on("error", function (error) {
      reject(error);
    });
  });
}
