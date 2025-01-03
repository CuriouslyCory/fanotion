import { Client } from "@notionhq/client";
import { type BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints.js";

import { env } from "../env.js";

/**
 * Creates a text block for a Notion page.
 *
 * @description Create a text block for notion. Splits the text into multiple blocks if it exceeds
 *              2000 characters.
 * @param text
 * @returns {BlockObjectRequest[]}
 */
export function createTextBlock(text: string): BlockObjectRequest[] {
  // text blocks can only be 2000 characters, so split the text into multiple blocks
  const blocks: BlockObjectRequest[] = [];
  let remainingText = text;
  while (remainingText.length > 0) {
    const currentText = remainingText.slice(0, 2000);
    remainingText = remainingText.slice(2000);
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: currentText,
            },
          },
        ],
      },
    });
  }
  return blocks;
}

/**
 * Create a new Heading block.
 *
 * @param {string} title - The title of the heading.
 * @returns {BlockObjectRequest}
 */
export function createHeadingBlock(title: string): BlockObjectRequest {
  return {
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: title } }] },
  };
}

/**
 * Function to create a new page in an existing page.
 *
 * @param {string} parentPageId - The ID of the parent page.
 * @param {string} title - The title of the new page.
 * @param {BlockObjectRequest[]} content - The content of the new page.
 */
export async function createPageInExistingPage(
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
