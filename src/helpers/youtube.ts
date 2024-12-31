import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

import { youtubeMetadataSchema, type YoutubeMetadata } from "../schemas.js";

/**
 * Function to get transcript of a YouTube video.
 *
 * @description Uses the yt cli command provided by fabric to fetch the video transcript.
 * @param {string} uri - The URI of the YouTube video.
 * @returns {Promise<string>} The transcript of the YouTube video.
 */
export async function getYoutubeTranscript(uri: string): Promise<string> {
  const command = `fabric -y "${uri}" --transcript`;
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

/**
 * Function to get metadata of a YouTube video.
 *
 * @description Uses the yt cli command provided by fabric to fetch the video metadata.
 * @param {string} uri - The URI of the YouTube video.
 * @returns {Promise<YoutubeMetadata>} The metadata of the YouTube video.
 */
export async function getYoutubeMetadata(
  uri: string
): Promise<YoutubeMetadata> {
  const command = `fabric -y "${uri}" --metadata`;
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
