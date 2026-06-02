import express from "express";
import http from "http";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const PORT = 3010; // Shared helper signaling service port
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);

// API route to resolve best node based on leastconn distribution
app.get("/api/sfu/best-route", async (req, res) => {
  try {
    const nodes = await redis.smembers("sfu_nodes");
    if (!nodes || nodes.length === 0) {
      return res.json({
        success: true,
        fallbackMode: "agora",
        nodeId: "agora_fallback",
        url: "https://download.agora.io/sdk"
      });
    }

    let bestNode: any = null;
    let lowestLoad = Infinity;

    for (const nodeId of nodes) {
      const nodeData = await redis.hgetall(`sfu_node:${nodeId}`);
      if (nodeData && nodeData.id) {
        const load = parseInt(nodeData.load || "0", 10);
        // Clean out stale nodes that stopped posting heartbeats within 15 seconds
        const heartbeat = parseInt(nodeData.heartbeat || "0", 10);
        if (Date.now() - heartbeat > 15000) {
          await redis.srem("sfu_nodes", nodeId);
          await redis.del(`sfu_node:${nodeId}`);
          continue;
        }

        if (load < lowestLoad) {
          lowestLoad = load;
          bestNode = nodeData;
        }
      }
    }

    if (!bestNode) {
      return res.json({
        success: true,
        fallbackMode: "p2p",
        reason: "No active cluster nodes discovered"
      });
    }

    res.json({
      success: true,
      bestNode: {
        id: bestNode.id,
        url: bestNode.url,
        port: parseInt(bestNode.port, 10),
        load: lowestLoad
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join, leave and status cache coordinators
app.post("/api/rooms/associate", async (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId || !userId) {
    return res.status(400).json({ error: "Missing roomId or userId parameters" });
  }

  try {
    await redis.sadd(`room:${roomId}:active_users`, userId);
    res.json({ success: true, message: `Associated ${userId} with room ${roomId}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms/release", async (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId || !userId) {
    return res.status(400).json({ error: "Missing roomId or userId" });
  }

  try {
    await redis.srem(`room:${roomId}:active_users`, userId);
    res.json({ success: true, message: `Released association for ${userId}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 [DistributedSignalingServer] Active on port ${PORT}`);
});
