import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API
  app.use(express.json());

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
      // We use sharpening and slight saturation increase for that "Bigo/High-End" look
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
