import ytdl from "@distube/ytdl-core";

import { youtubeMetadataSchema, type YoutubeMetadata } from "../schemas.js";

/**
 * Get transcript of a YouTube video.
 *
 * @description Uses the yt cli command provided by fabric to fetch the video transcript.
 * @param {string} uri - The URI of the YouTube video.
 * @returns {Promise<string>} The transcript of the YouTube video.
 */
export async function getYoutubeTranscript(uri: string): Promise<string> {
  const info = await ytdl.getInfo(uri);
  if (
    info.player_response.captions?.playerCaptionsTracklistRenderer
      .captionTracks[0].baseUrl
  ) {
    const response = await fetch(
      info.player_response.captions?.playerCaptionsTracklistRenderer
        .captionTracks[0].baseUrl
    );
    const xml = await response.text();

    // Parse the XML string into text content
    const transcript =
      xml
        .match(/<text[^>]*>(.*?)<\/text>/g)
        ?.map((text) => {
          // Extract just the content between the tags
          const match = text.match(/<text[^>]*>(.*?)<\/text>/);
          return match ? match[1] : "";
        })
        .join(" ") || "";

    return transcript
      .replaceAll("&#39;", "'")
      .replaceAll("&quot;", '"')
      .replaceAll("&amp;", "&")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">");
  }
  throw new Error("No transcript found");
}

/**
 * Get metadata of a YouTube video.
 *
 * @description Uses the yt cli command provided by fabric to fetch the video metadata.
 * @param {string} uri - The URI of the YouTube video.
 * @returns {Promise<YoutubeMetadata>} The metadata of the YouTube video.
 */
export async function getYoutubeMetadata(
  uri: string
): Promise<YoutubeMetadata> {
  // This returns a promise resolving to lots of metadata.
  const info = await ytdl.getInfo(uri);

  // The "videoDetails" object contains key info about the video:
  const details = info.videoDetails;

  // For example:
  const metadata = {
    id: details.videoId,
    title: details.title,
    description: details.description,
    publishedAt: details.publishDate,
    channelId: details.author.id,
    channelTitle: details.author.name,
    categoryId: details.category,
    tags: details.keywords ?? [],
    viewCount: Number(details.viewCount),
    likeCount: details.likes,
  };

  return youtubeMetadataSchema.parse(metadata);
}
