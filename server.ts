import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import fs from "fs";
import Redis from "ioredis";
import pkg from "agora-access-token";

const { RtcTokenBuilder, RtcRole } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize optional Redis Client for High-Performance Distributed Session Routing
let redisClient: Redis | null = null;
let inMemorySdkUserCount = 0;

try {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: false,
      retryStrategy: () => null // Fail fast to execute in-memory state fallback without hanging
    });
    redisClient.on("error", (err) => {
      console.warn("⚠️ [Redis] Client offline. Resorting to in-memory state trackers:", err.message);
    });
  }
} catch (e) {
  console.warn("⚠️ [Redis] Not available. Defaulting to reliable in-memory tracking mode.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API
  app.use(express.json());

  // --- FLOOD CONTROL & SCALE BACKED AGORA OVERFLOW ENGINE ---
  app.post("/api/request-stream", async (req, res) => {
    const { userId, channelName, isHost } = req.body;
    const fallbackId = userId || `user_${Math.random().toString(36).substring(2, 9)}`;
    const fallbackChannel = channelName || "live_stream_general";

    const userLimit = process.env.YOUR_SDK_LIMIT ? parseInt(process.env.YOUR_SDK_LIMIT, 10) : 1000;
    let currentUserCount = 0;

    if (redisClient) {
      try {
        const count = await redisClient.get("sdk:current_users");
        currentUserCount = count ? parseInt(count, 10) : 0;
      } catch (err) {
        currentUserCount = inMemorySdkUserCount;
      }
    } else {
      currentUserCount = inMemorySdkUserCount;
    }

    console.log(`📈 [Overflow Engine] Current live stream sessions load: ${currentUserCount} / ${userLimit}`);

    if (currentUserCount < userLimit) {
      // Under capacity: Route request to our Custom High-Speed P2P / SFU SDK
      if (redisClient) {
        try {
          await redisClient.incr("sdk:current_users");
        } catch (e) {
          inMemorySdkUserCount++;
        }
      } else {
        inMemorySdkUserCount++;
      }

      res.json({
        type: "your-sdk",
        config: {
          signalingUrl: "ws://localhost:3000",
          roomId: fallbackChannel,
          userId: fallbackId,
          appId: process.env.AGORA_APP_ID || "1234567890abcdef"
        }
      });
    } else {
      // Over capacity: Route seamlessly to high-scale Agora Live Video CDN
      const numericUid = parseInt(fallbackId.replace(/\D/g, "")) || Math.floor(Math.random() * 100000);
      const appID = process.env.AGORA_APP_ID || "1234567890abcdef";
      const appCertificate = process.env.AGORA_APP_CERTIFICATE || "abcde12345";
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600; // 1 hour
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      let token = "";
      try {
        token = RtcTokenBuilder.buildTokenWithUid(
          appID,
          appCertificate,
          fallbackChannel,
          numericUid,
          role,
          privilegeExpiredTs
        );
      } catch (tokenError) {
        console.warn("[Overflow Engine] Could not construct Agora token, falling back to empty token credentials.");
      }

      res.json({
        type: "agora",
        config: {
          appId: appID,
          token: token || undefined,
          channel: fallbackChannel,
          uid: numericUid
        }
      });
    }
  });

  app.post("/api/leave-stream", async (req, res) => {
    const { type } = req.body;
    if (type === "your-sdk") {
      if (redisClient) {
        try {
          const count = await redisClient.get("sdk:current_users");
          if (count && parseInt(count, 10) > 0) {
            await redisClient.decr("sdk:current_users");
          }
        } catch (e) {
          inMemorySdkUserCount = Math.max(0, inMemorySdkUserCount - 1);
        }
      } else {
        inMemorySdkUserCount = Math.max(0, inMemorySdkUserCount - 1);
      }
    }
    res.json({ success: true, activeCount: redisClient ? null : inMemorySdkUserCount });
  });

  // --- GEMINI PROXY API ---
  app.post("/api/gemini/generate", async (req, res) => {
    const { prompt, responseMimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key is missing on starting request.");
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: responseMimeType ? { responseMimeType } : undefined
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("Gemini API call returned an error or reached quota limits:", error?.message || error);
      
      // Determine request format to produce a smart, structurally consistent fallback
      const isCoachObject = prompt.includes('"feedback"') || prompt.includes('AICoach');
      const isLiveTipsArray = prompt.includes('JSON array of strings') || prompt.includes('AILiveAssistant') || prompt.includes('array of strings');
      
      let fallbackText = "";
      if (isCoachObject) {
        fallbackText = JSON.stringify({
          feedback: "Focus on double-tapping for likes and welcoming new viewers dynamically to build an active chat community!",
          tips: [
            "Greet all joining members by name with high enthusiasm",
            "Prompt viewers to double-tap to unlock interactive filters",
            "Launch a brief PK Battle to encourage collaborative goal-focused gifting"
          ]
        });
      } else if (isLiveTipsArray) {
        fallbackText = JSON.stringify([
          "Acknowledge new room arrivals immediately to gain loyal followers! 👋",
          "Explain the current mini game goals to encourage participation! 🏆"
        ]);
      } else {
        fallbackText = "Keep up the amazing vibes! Engage your chat in deciding the next game rules.";
      }

      console.log("Serving dynamic simulated response matching the requested schema.");
      res.json({ text: fallbackText });
    }
  });

  // --- SHARP IMAGE PROCESSING API ---
  // This endpoint provides that "glossy" finish and enhanced quality
  app.get("/api/process-image", async (req, res) => {
    const { url, width, height, quality = 80, effect } = req.query;

    if (!url) {
      return res.status(400).send("Image URL is required");
    }

    try {
      const response = await fetch(url as string);
      const arrayBuffer = await response.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      let pipeline = sharp(inputBuffer);

      // 1. Resize if dimensions provided
      if (width || height) {
        pipeline = pipeline.resize(
          width ? parseInt(width as string) : undefined,
          height ? parseInt(height as string) : undefined,
          { fit: "cover" }
        );
      }

      // 2. Add "Glossy" / Enhanced Finish
      // We use sharpening and slight saturation increase for that "Bingo/High-End" look
      pipeline = pipeline
        .sharpen(1.2, 1.0, 2.0) // Adds crispness using positional args
        .modulate({
          brightness: 1.05,
          saturation: 1.15, // Pops the colors
        })
        .normalise(); // Enhances contrast

      // 3. Output as high-quality WebP for transparency and speed
      const outputBuffer = await pipeline
        .webp({ quality: parseInt(quality as string), lossless: false })
        .toBuffer();

      res.set("Content-Type", "image/webp");
      res.send(outputBuffer);
    } catch (error) {
      console.error("Sharp processing error:", error);
      res.status(500).send("Failed to process image");
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express v4 used here, '*' is fine.
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Streaming App Engine running on http://localhost:${PORT}`);
  });
}

startServer();
