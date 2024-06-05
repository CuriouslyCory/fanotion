import { type BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints.js";

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
