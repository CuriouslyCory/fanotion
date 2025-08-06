import { BG, buildURL, GOOG_API_KEY, type WebPoSignalOutput } from "bgutils-js";
import chalk from "chalk";
import { JSDOM } from "jsdom";
import { Innertube, UniversalCache } from "youtubei.js";

import { youtubeMetadataSchema, type YoutubeMetadata } from "../schemas.js";

type VideoInfo = Awaited<ReturnType<typeof yt.getInfo>>;

const videoInfoCache = new Map<string, VideoInfo>();

// Cache for the authenticated Innertube instance
let authenticatedYt: Innertube | null = null;

/**
 * Create an authenticated Innertube instance with po_token.
 * Creates an Innertube instance with proper authentication using BgUtils to generate po_tokens.
 *
 * @returns The authenticated Innertube instance.
 */
async function createAuthenticatedYt(): Promise<Innertube> {
  if (authenticatedYt) {
    return authenticatedYt;
  }

  const cookie = process.env.YT_COOKIE;

  // Create a barebones Innertube instance to get visitor data
  const tempYt = await Innertube.create({
    retrieve_player: false,
    cookie,
  });

  const requestKey = "O43z0dpjhgX20SCx4KAo";
  const visitorData = tempYt.session.context.client.visitorData;

  if (!visitorData) {
    throw new Error("Could not get visitor data");
  }

  const dom = new JSDOM();

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });

  // Fetch challenge using lower-level API
  const challengeResponse = await fetch(buildURL("Create", true), {
    method: "POST",
    headers: {
      "content-type": "application/json+protobuf",
      "x-goog-api-key": GOOG_API_KEY,
      "x-user-agent": "grpc-web-javascript/0.1",
    },
    body: JSON.stringify([requestKey]),
  });

  const bgChallenge = BG.Challenge.parseChallengeData(
    (await challengeResponse.json()) as Record<string, unknown>
  );

  if (!bgChallenge) {
    throw new Error("Could not get challenge");
  }

  const interpreterJavascript =
    bgChallenge.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;

  if (interpreterJavascript) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(interpreterJavascript)();
  } else {
    throw new Error("Could not load VM");
  }

  // Generate PoToken using lower-level API
  const botguard = await BG.BotGuardClient.create({
    globalName: bgChallenge.globalName,
    globalObj: globalThis,
    program: bgChallenge.program,
  });

  const webPoSignalOutput: WebPoSignalOutput = [];
  const botguardResponse = await botguard.snapshot({ webPoSignalOutput });

  const integrityTokenResponse = await fetch(buildURL("GenerateIT", true), {
    method: "POST",
    headers: {
      "content-type": "application/json+protobuf",
      "x-goog-api-key": GOOG_API_KEY,
      "x-user-agent": "grpc-web-javascript/0.1",
    },
    body: JSON.stringify([requestKey, botguardResponse]),
  });

  const response = (await integrityTokenResponse.json()) as unknown[];

  if (typeof response[0] !== "string") {
    throw new Error("Could not get integrity token");
  }

  const integrityTokenBasedMinter = await BG.WebPoMinter.create(
    { integrityToken: response[0] },
    webPoSignalOutput
  );
  const poToken =
    await integrityTokenBasedMinter.mintAsWebsafeString(visitorData);

  console.log(
    chalk.blue(
      `Generated po_token for visitor: ${visitorData.substring(0, 10)}...`
    )
  );

  console.log(chalk.red(`po_token: ${poToken}`));

  authenticatedYt = await Innertube.create({
    po_token: poToken,
    visitor_data: visitorData,
    cache: new UniversalCache(true),
    generate_session_locally: true,
    lang: "en",
    location: "US",
    cookie,
  });

  return authenticatedYt;
}

// Get the authenticated YouTube instance
const yt = await createAuthenticatedYt();

async function getVideoInfo(videoId: string) {
  if (videoInfoCache.has(videoId)) {
    return videoInfoCache.get(videoId)!;
  }

  const videoInfo = await yt.getInfo(videoId);
  if (!videoInfo) {
    throw new Error("No video info found");
  }

  videoInfoCache.set(videoId, videoInfo);

  // console.log(chalk.green(`Video Info: ${JSON.stringify(videoInfo, null, 2)}`));
  return videoInfo;
}

/**
 * Get transcript of a YouTube video.
 * Fetches the transcript from the first available caption track in the video info.
 *
 * @param videoId - The videoId of the YouTube video.
 * @returns The transcript of the YouTube video.
 */
export async function getYoutubeTranscript(videoId: string): Promise<string> {
  const info = await getVideoInfo(videoId);

  if (!info.captions?.caption_tracks?.[0]?.base_url) {
    throw new Error("No caption tracks found");
  }
  const baseUrl = new URL(info.captions.caption_tracks[0].base_url);
  baseUrl.searchParams.set("potc", "1");
  baseUrl.searchParams.set("pot", yt.session.player?.po_token ?? "");
  baseUrl.searchParams.set("c", "WEB");
  baseUrl.searchParams.set("cplatform", "DESKTOP");

  console.log(chalk.green(`Base URL: ${baseUrl.toString()}`));
  if (baseUrl) {
    const response = await fetch(baseUrl.toString());
    const xml = await response.text();

    if (xml.length < 1000) {
      throw new Error("Transcript not available");
    }

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
 * Extracts metadata from the new getVideoInfo() response structure.
 *
 * @param videoId - The videoId of the YouTube video.
 * @returns The metadata of the YouTube video.
 */
export async function getYoutubeMetadata(
  videoId: string
): Promise<YoutubeMetadata> {
  const info = await getVideoInfo(videoId);

  const metadata = {
    id: info.basic_info.id ?? "",
    title: info.basic_info.title ?? "",
    description: info.secondary_info?.description.text ?? "",
    publishedAt: info.primary_info?.published.text ?? "",
    channelId: info.basic_info?.channel?.id ?? "",
    channelTitle: info.basic_info?.channel?.name ?? "",
    categoryId: info.basic_info?.category ?? "",
    tags: info.basic_info?.tags ?? [],
    viewCount: info.basic_info?.view_count ?? 0,
    likeCount: info.basic_info?.like_count ?? 0,
  } as YoutubeMetadata;

  return youtubeMetadataSchema.parse(metadata);
}
