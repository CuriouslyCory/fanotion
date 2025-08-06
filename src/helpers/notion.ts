import { Client } from "@notionhq/client";
import {
  type BlockObjectRequest,
  type CreatePageResponse,
} from "@notionhq/client/build/src/api-endpoints.js";

import { env } from "../env.js";

/**
 * Creates a text block for a Notion page.
 *
 * @param text
 * @returns {BlockObjectRequest[]}
 */
export function createTextBlock(text: string): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  // First split on double newlines
  const paragraphs = text.split(/\n\s*\n/);

  for (const paragraph of paragraphs) {
    let remainingText = paragraph;

    while (remainingText.length > 2000) {
      // Try to split at newline near 2000
      let splitIndex = remainingText.slice(0, 2000).lastIndexOf("\n");

      // If no newline found, try to split at space
      if (splitIndex === -1) {
        splitIndex = remainingText.slice(0, 2000).lastIndexOf(" ");
      }

      // If no space found, force split at 2000
      if (splitIndex === -1) {
        splitIndex = 1999;
      }

      const currentText = remainingText.slice(0, splitIndex);
      remainingText = remainingText.slice(splitIndex).trim();

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

    // Add remaining text if any
    if (remainingText.length > 0) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: remainingText,
              },
            },
          ],
        },
      });
    }
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
): Promise<CreatePageResponse> {
  // Initialize the Notion client
  const notion = new Client({ auth: env.NOTION_TOKEN });

  try {
    const page = await notion.pages.create({
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
    return page;
  } catch (error) {
    console.error("Error creating page:", error);
    throw error;
  }
}
