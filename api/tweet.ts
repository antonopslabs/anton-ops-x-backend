import type { VercelRequest, VercelResponse } from "@vercel/node";
import { TwitterApi } from "twitter-api-v2";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Basic auth via shared secret
  const authHeader = req.headers["x-anton-secret"];
  if (!authHeader || authHeader !== process.env.ANTON_TWEET_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
  }

  const { text, replyTo } = req.body as { text?: string; replyTo?: string };

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  try {
    const client = new TwitterApi({
      appKey: process.env.X_API_KEY as string,
      appSecret: process.env.X_API_SECRET as string,
      accessToken: process.env.X_ACCESS_TOKEN as string,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET as string,
          });

    const rwClient = client.readWrite;

    let result;
    if (replyTo) {
      result = await rwClient.v2.reply(text, replyTo);
    } else {
      result = await rwClient.v2.tweet(text);
    }

    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    console.error("Tweet error", err);
    return res.status(500).json({
            error: "Failed to post tweet",
      details: err?.message ?? String(err),
    });
  }
}
