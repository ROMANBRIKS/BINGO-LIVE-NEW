import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
const nodeId = process.env.NODE_ID || `sfu_${Math.random().toString(36).substring(2, 10)}`;

// Dynamic mock state holding transceivers & simulated media producers
interface SimulatedTransport {
  id: string;
  ip: string;
  port: number;
  status: string;
}

const activeTransports = new Map<string, SimulatedTransport>();

async function initSFUNode() {
  try {
    // Register node presence in cluster Redis set with TTL / Heartbeat pattern
    await redis.sadd("sfu_nodes", nodeId);
    await redis.hset(`sfu_node:${nodeId}`, {
      id: nodeId,
      url: process.env.NODE_URL || `http://localhost:${PORT}`,
      port: PORT.toString(),
      load: "0",
      heartbeat: Date.now().toString()
    });

    // Start automated cluster heartbeat loop
    setInterval(async () => {
      await redis.hset(`sfu_node:${nodeId}`, "heartbeat", Date.now().toString());
    }, 5000);

    console.log(`✅ [SFUNode] Node registered: ${nodeId} on port ${PORT}`);
  } catch (error) {
    console.warn(`⚠️ [SFUNode] Redis offline. Running in isolated standalone worker mode.`, error);
  }
}

// REST route mapping for HAProxy check compliance
app.get("/health", async (req, res) => {
  try {
    const load = activeTransports.size;
    res.json({
      nodeId,
      status: "alive",
      activeConnections: load,
      loadFactor: Math.min(100, (load / 500) * 100)
    });
  } catch (err) {
    res.status(500).json({ status: "degraded", error: String(err) });
  }
});

// Create peer transport endpoint
app.post("/transport", async (req, res) => {
  const { roomId, userId } = req.body;
  const transportId = `transport_${Math.random().toString(36).substring(2, 12)}`;

  const newTransport: SimulatedTransport = {
    id: transportId,
    ip: process.env.ANNOUNCED_IP || "127.0.0.1",
    port: Math.floor(Math.random() * 100) + 20000,
    status: "init"
  };

  activeTransports.set(transportId, newTransport);

  // Increment load registry in live shared Redis
  try {
    await redis.hset(`sfu_node:${nodeId}`, "load", activeTransports.size.toString());
  } catch (e) {
    // Redis fail silent
  }

  res.json({
    success: true,
    transportId: newTransport.id,
    listenIp: newTransport.ip,
    port: newTransport.port,
    nodeId
  });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`📡 [SFUNode] Listening on port ${PORT}`);
});

initSFUNode();
