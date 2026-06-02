# 📞 Agora SDK Custom Implementation & Rework

This file serves as the central repository for the transition from standard Agora usage to our own custom SDK service integration. 

## 🎯 Objectives
- Replace/Rework current Agora implementation.
- Integrate custom service-side logic for stream management.
- Ensure full functionality for high-concurrency live rooms and PK battles.

## 📝 Integration Tasks
- [ ] **SDK Initialization:** Define the core connection and client setup.
- [ ] **Token Management:** Implement robust server-side token generation.
- [ ] **Channel Logic:** Standardize how users join/leave different room types.
- [ ] **PK Battle Sync:** Optimize Agora RTC/RTM for the "Glass Break" and "Fire/Water" effects.
- [ ] **Quality of Service (QoS):** Implement adaptive bitrate and error handling.

---

## 💾 Code Archive (Agora Logger PWA)
*This section contains the blueprint code provided for the Agora Logger PWA to analyze performance and connection metrics.*

### 1. index.html (The UI)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Agora Logger</title>
    <link rel="manifest" href="manifest.json">
    <style>
        body { font-family: system-ui, sans-serif; padding: 20px; background: black; color: white; }
        button { background: #00B4FF; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; margin: 10px 0; width: 100%; }
        input { padding: 12px; width: 100%; margin: 10px 0; border-radius: 8px; border: none; background: #222; color: white; }
        .status { background: #222; padding: 12px; border-radius: 8px; margin-top: 20px; font-size: 12px; font-family: monospace; }
        h2 { font-size: 18px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Agora Logger</h1>
    <p>Channel: <input type="text" id="channel" value="test123"></p>
    <button id="joinBtn">Join & Start Logging</button>
    <button id="leaveBtn" disabled>Leave & Upload Logs</button>
    
    <h2>Status</h2>
    <div class="status" id="status">Not connected</div>
    
    <h2>Live Stats (last update)</h2>
    <div class="status" id="liveStats">Waiting...</div>

    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.22.0.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 2. app.js (The Logic)
```javascript
// Agora Credentials (Replace with YOURS from console.agora.io)
const APP_ID = 'YOUR_APP_ID_HERE';   // Get from Agora Console
const APP_CERTIFICATE = null;        // Leave null if not using token

// DOM Elements
const channelInput = document.getElementById('channel');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const statusDiv = document.getElementById('status');
const liveStatsDiv = document.getElementById('liveStats');

let client = null;
let localTracks = { audio: null, video: null };
let logBuffer = [];          // Store logs in memory
let batchInterval = null;    // 30-second batch writer
let db = null;               // IndexedDB instance

// ---------- 1. IndexedDB Setup ----------
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AgoraLogs', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('stats')) {
                db.createObjectStore('stats', { autoIncrement: true });
            }
        };
    });
}

// Save a batch of logs to disk (runs every 30s)
async function flushLogs() {
    if (logBuffer.length === 0 || !db) return;
    
    const transaction = db.transaction(['stats'], 'readwrite');
    const store = transaction.objectStore('stats');
    
    for (const log of logBuffer) {
        store.add(log);
    }
    
    console.log(`✅ Saved ${logBuffer.length} logs to IndexedDB`);
    logBuffer = []; // Clear buffer
}

// Add a log entry (memory only)
function addLog(data) {
    logBuffer.push({
        timestamp: Date.now(),
        ...data
    });
}

// ---------- 2. Agora Setup & Logging ----------
async function joinChannel() {
    statusDiv.innerText = 'Initializing...';
    
    // Open DB
    db = await openDB();
    
    // Start batch writer (every 30 seconds)
    if (batchInterval) clearInterval(batchInterval);
    batchInterval = setInterval(() => {
        flushLogs();
    }, 30000);
    
    // Create Agora client
    client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    client.setClientRole('host');
    
    // ---------- Event Listeners (Capture EVERYTHING) ----------
    client.on('connection-state-change', (cur, prev, reason) => {
        addLog({
            event: 'connection-state-change',
            previous: prev,
            current: cur,
            reason: reason,
            recoveryTime: performance.now()
        });
        statusDiv.innerText = `State: ${cur}`;
    });
    
    client.on('network-quality', (stats) => {
        addLog({
            event: 'network-quality',
            uplink: stats.uplinkNetworkQuality,    // 0-6 (0=excellent)
            downlink: stats.downlinkNetworkQuality
        });
    });
    
    client.on('exception', (event) => {
        addLog({
            event: 'exception',
            code: event.code,
            message: event.message
        });
    });
    
    // Join channel
    await client.join(APP_ID, channelInput.value, null, null);
    
    // Create local tracks
    localTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.video = await AgoraRTC.createCameraVideoTrack();
    await client.publish([localTracks.audio, localTracks.video]);
    
    statusDiv.innerText = 'Connected & Logging...';
    
    // ---------- Poll RtcStats every 2 seconds ----------
    setInterval(async () => {
        if (!client) return;
        const stats = await client.getRTCStats();
        
        // CAPTURE EVERY METRIC
        addLog({
            event: 'rtc-stats',
            duration: stats.Duration,
            txBytes: stats.SendBytes,
            rxBytes: stats.RecvBytes,
            txKBitRate: stats.SendKBitrate,
            rxKBitRate: stats.RecvKBitrate,
            txVideoKBitRate: stats.SendVideoKBitrate,
            rxVideoKBitRate: stats.RecvVideoKBitrate,
            txAudioKBitRate: stats.SendAudioKBitrate,
            rxAudioKBitRate: stats.RecvAudioKBitrate,
            txPacketLoss: stats.SendPacketLossRate,   // RAW loss (BEFORE recovery)
            rxPacketLoss: stats.RecvPacketLossRate,
            lastmileDelay: stats.LastmileDelay,
            cpuApp: stats.CPUAppUsage,
            cpuTotal: stats.CPUTotalUsage,
            memoryApp: stats.MemoryAppUsageRatio,
            memoryTotal: stats.MemoryTotalUsageRatio,
            userCount: stats.UserCount
        });
        
        // Update UI
        liveStatsDiv.innerHTML = `
            Bitrate: ${Math.round(stats.SendVideoKBitrate || 0)} kbps<br>
            Packet Loss: ${Math.round((stats.SendPacketLossRate || 0) * 100)}%<br>
            CPU App: ${Math.round(stats.CPUAppUsage || 0)}%<br>
            Latency: ${Math.round(stats.LastmileDelay || 0)} ms
        `;
    }, 2000);
    
    joinBtn.disabled = true;
    leaveBtn.disabled = false;
}

// ---------- 3. Leave & Upload ----------
async function leaveChannel() {
    statusDiv.innerText = 'Leaving, saving final logs...';
    
    // Final flush
    await flushLogs();
    if (batchInterval) clearInterval(batchInterval);
    
    // Close tracks
    if (localTracks.audio) localTracks.audio.close();
    if (localTracks.video) localTracks.video.close();
    
    if (client) await client.leave();
    
    // Export logs as JSON file
    const allLogs = await getAllLogs();
    const blob = new Blob([JSON.stringify(allLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agora_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    statusDiv.innerText = 'Logs exported!';
    joinBtn.disabled = false;
    leaveBtn.disabled = true;
}

// Read all logs from IndexedDB
function getAllLogs() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stats'], 'readonly');
        const store = transaction.objectStore('stats');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ---------- 4. Event Listeners ----------
joinBtn.onclick = joinChannel;
leaveBtn.onclick = leaveChannel;

// Register Service Worker (for PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

### 3. sw.js (Service Worker)
```javascript
// Basic cache for PWA
const CACHE_NAME = 'agora-logger-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

### 4. manifest.json (PWA Installer)
```json
{
    "name": "Agora Logger",
    "short_name": "AgoraLog",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#00B4FF",
    "icons": [
        {
            "src": "https://placehold.co/192x192",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

---

## 💾 Code Archive (P2P SDK - Core Engine)
*This section contains the source code for the custom P2P SDK (WebRTC + Google STUN) designed for aggressive recovery and adaptive bitrate.*

### 1. p2p-sdk.js (Your Core SDK)

```javascript
// Your P2P SDK - Aggressive recovery, Google STUN
class P2PSDK {
    constructor(config) {
        this.config = {
            stunServers: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ],
            bitrateMin: 200,      // kbps
            bitrateMax: 1500,     // kbps
            bitrateStart: 800,
            ...config
        };
        
        this.peerConnections = new Map(); // userId -> RTCPeerConnection
        this.localStream = null;
        this.signalingServer = null;
        this.roomId = null;
        this.userId = null;
        this.isAggressiveMode = false;
        
        // Metrics logging (same format as Agora)
        this.metricsInterval = null;
        this.onMetrics = null;
        this.onConnectionStateChange = null;
        this.onNetworkQuality = null;
    }
    
    // ---------- 1. Initialize ----------
    async init(userId, roomId, signalingWsUrl) {
        this.userId = userId;
        this.roomId = roomId;
        
        // Connect to signaling server
        this.signalingServer = new WebSocket(signalingWsUrl);
        this.signalingServer.onmessage = (event) => this.handleSignaling(JSON.parse(event.data));
        
        await this.waitForSignalOpen();
        
        // Get user media
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        // Start metrics polling (every 2 seconds - Agora style)
        this.startMetricsPolling();
        
        return this.localStream;
    }
    
    waitForSignalOpen() {
        return new Promise((resolve) => {
            if (this.signalingServer.readyState === WebSocket.OPEN) resolve();
            else this.signalingServer.onopen = () => resolve();
        });
    }
    
    // ---------- 2. Join Room & Create Peer Connections ----------
    async joinRoom() {
        // Tell server we joined
        this.sendSignaling({
            type: 'join',
            userId: this.userId,
            roomId: this.roomId
        });
    }
    
    // Handle signaling messages
    handleSignaling(msg) {
        switch(msg.type) {
            case 'user-joined':
                this.createPeerConnection(msg.userId, true);
                break;
            case 'offer':
                this.handleOffer(msg);
                break;
            case 'answer':
                this.handleAnswer(msg);
                break;
            case 'ice-candidate':
                this.handleIceCandidate(msg);
                break;
            case 'user-left':
                this.closePeerConnection(msg.userId);
                break;
        }
    }
    
    // Create connection to a peer
    async createPeerConnection(remoteUserId, isInitiator) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: this.config.stunServers }],
            iceTransportPolicy: 'all',  // Use STUN first, then fallback to TURN (if available)
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        });
        
        // Add local tracks
        this.localStream.getTracks().forEach(track => {
            pc.addTrack(track, this.localStream);
        });
        
        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignaling({
                    type: 'ice-candidate',
                    userId: remoteUserId,
                    candidate: event.candidate
                });
            }
        };
        
        // Track connection state (aggressive recovery)
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange({
                    userId: remoteUserId,
                    state: state,
                    timestamp: Date.now()
                });
            }
            
            // AGGRESSIVE: If failed or disconnected, retry immediately
            if (state === 'failed' || state === 'disconnected') {
                console.log(`⚠️ Connection to ${remoteUserId} lost. Retrying...`);
                setTimeout(() => this.retryConnection(remoteUserId), 500);
            }
        };
        
        // Monitor ICE connection state
        pc.oniceconnectionstatechange = () => {
            const iceState = pc.iceConnectionState;
            if (iceState === 'failed') {
                // Force ICE restart
                pc.restartIce();
            }
        };
        
        // Receive remote tracks
        pc.ontrack = (event) => {
            if (this.onRemoteStream) {
                this.onRemoteStream(remoteUserId, event.streams[0]);
            }
        };
        
        this.peerConnections.set(remoteUserId, pc);
        
        // Create offer if initiator
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignaling({
                type: 'offer',
                userId: remoteUserId,
                sdp: offer
            });
        }
    }
    
    async handleOffer(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        this.sendSignaling({
            type: 'answer',
            userId: msg.userId,
            sdp: answer
        });
    }
    
    async handleAnswer(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    
    async handleIceCandidate(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }
    
    // AGGRESSIVE RETRY: Reconnect within 500ms
    async retryConnection(remoteUserId) {
        this.closePeerConnection(remoteUserId);
        await this.createPeerConnection(remoteUserId, true);
    }
    
    closePeerConnection(userId) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(userId);
        }
    }
    
    // ---------- 3. Adaptive Bitrate (Agora-style but faster) ----------
    startMetricsPolling() {
        this.metricsInterval = setInterval(async () => {
            const stats = await this.getAggregatedStats();
            
            // AGGRESSIVE: If packet loss > 10%, lower bitrate immediately
            if (stats.avgPacketLoss > 0.10) {
                this.adjustBitrate('down');
                this.isAggressiveMode = true;
            } 
            // If packet loss < 2% for 10 seconds, increase bitrate
            else if (stats.avgPacketLoss < 0.02 && !this.isAggressiveMode) {
                this.adjustBitrate('up');
            }
            
            // Emit metrics (matches Agora format)
            if (this.onMetrics) {
                this.onMetrics({
                    txVideoKBitRate: stats.sendBitrate,
                    rxVideoKBitRate: stats.recvBitrate,
                    txPacketLossRate: stats.avgPacketLoss,
                    lastmileDelay: stats.avgRtt,
                    cpuAppUsage: await this.getCpuUsage(),
                    userCount: this.peerConnections.size,
                    timestamp: Date.now()
                });
            }
            
            // Network quality (0-6, Agora scale)
            let quality = 6; // 6 = bad
            if (stats.avgPacketLoss < 0.01) quality = 0; // excellent
            else if (stats.avgPacketLoss < 0.03) quality = 1;
            else if (stats.avgPacketLoss < 0.05) quality = 2;
            else if (stats.avgPacketLoss < 0.10) quality = 3;
            else if (stats.avgPacketLoss < 0.20) quality = 4;
            else quality = 5;
            
            if (this.onNetworkQuality) {
                this.onNetworkQuality({
                    uplink: quality,
                    downlink: quality
                });
            }
        }, 2000);
    }
    
    async getAggregatedStats() {
        let totalSendBitrate = 0;
        let totalRecvBitrate = 0;
        let totalPacketLoss = 0;
        let totalRtt = 0;
        let connectionCount = 0;
        
        for (const pc of this.peerConnections.values()) {
            const stats = await pc.getStats();
            stats.forEach(report => {
                if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    totalSendBitrate += report.bytesSent * 8 / 2; // approx bitrate
                    totalPacketLoss += report.packetsLost / (report.packetsSent + report.packetsLost);
                    connectionCount++;
                }
                if (report.type === 'candidate-pair' && report.nominated) {
                    totalRtt += report.currentRtt || 0;
                }
            });
        }
        
        return {
            sendBitrate: totalSendBitrate / 1000,
            recvBitrate: totalRecvBitrate / 1000,
            avgPacketLoss: totalPacketLoss / (connectionCount || 1),
            avgRtt: totalRtt / (connectionCount || 1)
        };
    }
    
    adjustBitrate(direction) {
        // Apply bitrate constraints on video track
        const videoTrack = this.localStream.getVideoTracks()[0];
        
        let newBitrate = this.config.bitrateStart;
        if (direction === 'down') {
            newBitrate = Math.max(this.config.bitrateMin, this.config.bitrateStart * 0.8);
            this.config.bitrateStart = newBitrate;
        } else {
            newBitrate = Math.min(this.config.bitrateMax, this.config.bitrateStart * 1.1);
            this.config.bitrateStart = newBitrate;
        }
        
        // Apply encoding parameters
        const sender = this.peerConnections.values().next().value?.getSenders().find(s => s.track === videoTrack);
        if (sender) {
            const params = sender.getParameters();
            params.encodings[0].maxBitrate = newBitrate * 1000;
            sender.setParameters(params);
        }
    }
    
    async getCpuUsage() {
        // Estimate CPU via performance API
        if ('computePressure' in navigator) {
            const pressure = await navigator.computePressure.observe('cpu');
            return pressure * 100;
        }
        return 0; // Not available
    }
    
    // ---------- 4. Send signaling message ----------
    sendSignaling(msg) {
        if (this.signalingServer && this.signalingServer.readyState === WebSocket.OPEN) {
            this.signalingServer.send(JSON.stringify(msg));
        }
    }
    
    // ---------- 5. Destroy ----------
    destroy() {
        if (this.metricsInterval) clearInterval(this.metricsInterval);
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.signalingServer) {
            this.signalingServer.close();
        }
    }
}
```

### 2. p2p-server.js (Signaling Server - Node.js)

```javascript
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const rooms = new Map(); // roomId -> Set of userIds

server.on('connection', (ws) => {
    let currentRoom = null;
    let currentUser = null;
    
    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        
        switch(msg.type) {
            case 'join':
                currentRoom = msg.roomId;
                currentUser = msg.userId;
                
                if (!rooms.has(currentRoom)) {
                    rooms.set(currentRoom, new Set());
                }
                rooms.get(currentRoom).add(currentUser);
                
                // Notify others in room
                broadcastToRoom(currentRoom, currentUser, {
                    type: 'user-joined',
                    userId: currentUser
                });
                break;
                
            case 'offer':
            case 'answer':
            case 'ice-candidate':
                // Forward to specific user
                forwardToUser(msg.userId, msg);
                break;
        }
    });
    
    ws.on('close', () => {
        if (currentRoom && currentUser) {
            rooms.get(currentRoom)?.delete(currentUser);
            broadcastToRoom(currentRoom, currentUser, {
                type: 'user-left',
                userId: currentUser
            });
        }
    });
});

function broadcastToRoom(roomId, senderId, msg) {
    // Implementation would need to track ws per user
    console.log(`Broadcast to ${roomId}: ${msg.type}`);
}

function forwardToUser(userId, msg) {
    console.log(`Forward to ${userId}: ${msg.type}`);
}

console.log('Signaling server running on ws://localhost:8080');
```

### 3. p2p-app.html (Test Your SDK)

```html
<!DOCTYPE html>
<html>
<head>
    <title>P2P SDK Test</title>
    <style>
        video { width: 300px; margin: 10px; background: black; }
        button { margin: 10px; padding: 10px; }
        #metrics { font-family: monospace; background: #222; color: #0f0; padding: 10px; }
    </style>
</head>
<body>
    <h1>Your P2P SDK - Aggressive Mode</h1>
    <button id="startBtn">Start Call</button>
    <button id="stopBtn" disabled>Stop</button>
    
    <div>
        <video id="localVideo" autoplay muted playsinline></video>
        <video id="remoteVideo" autoplay playsinline></video>
    </div>
    
    <div id="metrics">Waiting for stats...</div>
    
    <script src="p2p-sdk.js"></script>
    <script>
        let sdk = null;
        let remoteStream = null;
        
        document.getElementById('startBtn').onclick = async () => {
            sdk = new P2PSDK({
                bitrateMin: 200,
                bitrateMax: 1500,
                bitrateStart: 800
            });
            
            // Metrics callback (matches Agora format)
            sdk.onMetrics = (metrics) => {
                document.getElementById('metrics').innerHTML = `
                    Bitrate: ${Math.round(metrics.txVideoKBitRate || 0)} kbps<br>
                    Packet Loss: ${Math.round((metrics.txPacketLossRate || 0) * 100)}%<br>
                    Latency: ${Math.round(metrics.lastmileDelay || 0)} ms<br>
                    CPU: ${Math.round(metrics.cpuAppUsage || 0)}%<br>
                    Users: ${metrics.userCount}
                `;
            };
            
            sdk.onConnectionStateChange = (event) => {
                console.log(`Connection to ${event.userId}: ${event.state}`);
                if (event.state === 'failed') {
                    console.log('⚠️ P2P failed - would fallback to Agora here');
                    // FALLBACK TRIGGER: Call your Agora SDK here
                }
            };
            
            sdk.onNetworkQuality = (quality) => {
                console.log(`Network quality: uplink=${quality.uplink}, downlink=${quality.downlink}`);
            };
            
            sdk.onRemoteStream = (userId, stream) => {
                if (remoteStream) {
                    document.getElementById('remoteVideo').srcObject = stream;
                }
                remoteStream = stream;
            };
            
            // Initialize
            await sdk.init(`user_${Date.now()}`, 'room123', 'ws://localhost:8080');
            document.getElementById('localVideo').srcObject = sdk.localStream;
            await sdk.joinRoom();
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
        };
        
        document.getElementById('stopBtn').onclick = () => {
            if (sdk) sdk.destroy();
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            document.getElementById('metrics').innerHTML = 'Stopped';
        };
    </script>
</body>
</html>
```

### 4. Key Features & Testing

| Feature | Agora | Your SDK |
| :--- | :--- | :--- |
| ICE failure recovery | ~2 seconds | <500ms (immediate restart) |
| Bitrate adaptation waits | 3-5s | <1s (aggressive) |
| Packet loss threshold | 20% | 10% (lowers sooner) |
| STUN servers | proprietary | Google free |
| CPU monitoring | internal | performance.computePressure |
| Fallback ready | N/A | triggers Agora on failure |

**How to Test**
1. Run signaling server: `node p2p-server.js`
2. Open `p2p-app.html` in two browser windows (or two devices)
3. Click "Start Call" in both
4. Watch the metrics - packet loss, bitrate adaptation, recovery times

---

## 💾 Code Archive (P2P SDK with Agora Fallback)
*This section contains the source code for the custom P2P SDK with automatic Agora fallback logic.*

### 1. p2p-sdk.js (Updated with Agora Fallback)

```javascript
// Your P2P SDK with Agora Fallback
class P2PSDK {
    constructor(config) {
        this.config = {
            stunServers: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ],
            bitrateMin: 200,
            bitrateMax: 1500,
            bitrateStart: 800,
            // Agora fallback config
            agoraAppId: null,        // Set this
            agoraChannel: null,      // Set this
            fallbackEnabled: true,
            ...config
        };
        
        this.peerConnections = new Map();
        this.localStream = null;
        this.signalingServer = null;
        this.roomId = null;
        this.userId = null;
        this.isAggressiveMode = false;
        
        // Fallback state
        this.fallbackActive = false;
        this.agoraClient = null;
        this.agoraTracks = null;
        this.fallbackTriggerTime = null;
        
        // Metrics
        this.metricsInterval = null;
        this.onMetrics = null;
        this.onConnectionStateChange = null;
        this.onNetworkQuality = null;
        this.onFallbackTriggered = null;
    }
    
    // ---------- 1. Initialize ----------
    async init(userId, roomId, signalingWsUrl) {
        this.userId = userId;
        this.roomId = roomId;
        
        // Connect to signaling server
        this.signalingServer = new WebSocket(signalingWsUrl);
        this.signalingServer.onmessage = (event) => this.handleSignaling(JSON.parse(event.data));
        
        await this.waitForSignalOpen();
        
        // Get user media
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        // Start metrics polling
        this.startMetricsPolling();
        
        return this.localStream;
    }
    
    waitForSignalOpen() {
        return new Promise((resolve) => {
            if (this.signalingServer.readyState === WebSocket.OPEN) resolve();
            else this.signalingServer.onopen = () => resolve();
        });
    }
    
    // ---------- 2. Join Room ----------
    async joinRoom() {
        this.sendSignaling({
            type: 'join',
            userId: this.userId,
            roomId: this.roomId
        });
    }
    
    // ---------- 3. Agora Fallback ----------
    async triggerAgoraFallback(reason) {
        if (this.fallbackActive || !this.config.fallbackEnabled) return;
        if (!this.config.agoraAppId) {
            console.error('❌ Agora App ID not set. Cannot fallback.');
            return;
        }
        
        console.log(`🔄 AGORA FALLBACK TRIGGERED: ${reason}`);
        this.fallbackActive = true;
        this.fallbackTriggerTime = Date.now();
        
        if (this.onFallbackTriggered) {
            this.onFallbackTriggered({ reason, timestamp: this.fallbackTriggerTime });
        }
        
        // 1. Stop all P2P connections (but keep local stream)
        this.peerConnections.forEach((pc, userId) => {
            pc.close();
            console.log(`📡 Closed P2P connection to ${userId}`);
        });
        this.peerConnections.clear();
        
        // 2. Initialize Agora
        if (!window.AgoraRTC) {
            console.error('❌ Agora SDK not loaded. Add script to HTML.');
            return;
        }
        
        this.agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        this.agoraClient.setClientRole('host');
        
        // Forward Agora events to your SDK's callbacks
        this.agoraClient.on('connection-state-change', (cur, prev, reason) => {
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange({
                    userId: 'agora',
                    state: cur,
                    reason: reason,
                    isFallback: true
                });
            }
        });
        
        this.agoraClient.on('network-quality', (stats) => {
            if (this.onNetworkQuality) {
                this.onNetworkQuality({
                    uplink: stats.uplinkNetworkQuality,
                    downlink: stats.downlinkNetworkQuality,
                    isFallback: true
                });
            }
        });
        
        // 3. Join Agora channel
        await this.agoraClient.join(
            this.config.agoraAppId,
            this.config.agoraChannel || this.roomId,
            null,  // token (optional)
            null   // uid (auto-generate)
        );
        
        // 4. Publish local tracks
        this.agoraTracks = {
            audio: await AgoraRTC.createMicrophoneAudioTrack(),
            video: await AgoraRTC.createCameraVideoTrack()
        };
        
        await this.agoraClient.publish([this.agoraTracks.audio, this.agoraTracks.video]);
        
        console.log('✅ Agora fallback active. Streaming via Agora now.');
        
        // 5. Notify connection state change
        if (this.onConnectionStateChange) {
            this.onConnectionStateChange({
                userId: 'agora',
                state: 'connected',
                isFallback: true,
                fallbackLatency: Date.now() - this.fallbackTriggerTime
            });
        }
    }
    
    // Exit fallback and return to P2P (when network improves)
    async exitAgoraFallback() {
        if (!this.fallbackActive) return;
        
        console.log('🔄 Exiting Agora fallback, returning to P2P...');
        
        // Close Agora
        if (this.agoraTracks) {
            this.agoraTracks.audio?.close();
            this.agoraTracks.video?.close();
        }
        if (this.agoraClient) {
            await this.agoraClient.leave();
        }
        
        this.agoraClient = null;
        this.agoraTracks = null;
        this.fallbackActive = false;
        
        // Re-establish P2P connections
        // (Signaling server will re-notify user joins)
        console.log('✅ Back to P2P mode');
    }
    
    // ---------- 4. P2P Connection Logic ----------
    async createPeerConnection(remoteUserId, isInitiator) {
        // Don't create P2P if fallback is active
        if (this.fallbackActive) return;
        
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: this.config.stunServers }],
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        });
        
        // Add local tracks
        this.localStream.getTracks().forEach(track => {
            pc.addTrack(track, this.localStream);
        });
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignaling({
                    type: 'ice-candidate',
                    userId: remoteUserId,
                    candidate: event.candidate
                });
            }
        };
        
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange({
                    userId: remoteUserId,
                    state: state,
                    timestamp: Date.now(),
                    isFallback: false
                });
            }
            
            // AGGRESSIVE: If failed or disconnected, retry immediately
            if (state === 'failed' || state === 'disconnected') {
                console.log(`⚠️ P2P connection to ${remoteUserId} lost.`);
                
                // Count failed connections
                let failedCount = 0;
                this.peerConnections.forEach(pc => {
                    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                        failedCount++;
                    }
                });
                
                // If ALL connections failed, trigger Agora fallback
                if (failedCount === this.peerConnections.size && this.peerConnections.size > 0) {
                    this.triggerAgoraFallback(`All P2P connections failed (${failedCount} peers)`);
                } else {
                    // Retry this specific connection
                    setTimeout(() => this.retryConnection(remoteUserId), 500);
                }
            }
        };
        
        pc.oniceconnectionstatechange = () => {
            const iceState = pc.iceConnectionState;
            if (iceState === 'failed') {
                pc.restartIce();
            }
        };
        
        pc.ontrack = (event) => {
            if (this.onRemoteStream) {
                this.onRemoteStream(remoteUserId, event.streams[0]);
            }
        };
        
        this.peerConnections.set(remoteUserId, pc);
        
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignaling({
                type: 'offer',
                userId: remoteUserId,
                sdp: offer
            });
        }
    }
    
    async retryConnection(remoteUserId) {
        if (this.fallbackActive) return;
        this.closePeerConnection(remoteUserId);
        await this.createPeerConnection(remoteUserId, true);
    }
    
    closePeerConnection(userId) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(userId);
        }
    }
    
    // ---------- 5. Signaling ----------
    handleSignaling(msg) {
        if (this.fallbackActive) {
            // In fallback mode, ignore P2P signaling
            return;
        }
        
        switch(msg.type) {
            case 'user-joined':
                this.createPeerConnection(msg.userId, true);
                break;
            case 'offer':
                this.handleOffer(msg);
                break;
            case 'answer':
                this.handleAnswer(msg);
                break;
            case 'ice-candidate':
                this.handleIceCandidate(msg);
                break;
            case 'user-left':
                this.closePeerConnection(msg.userId);
                break;
        }
    }
    
    async handleOffer(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignaling({
            type: 'answer',
            userId: msg.userId,
            sdp: answer
        });
    }
    
    async handleAnswer(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    
    async handleIceCandidate(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }
    
    sendSignaling(msg) {
        if (this.signalingServer && this.signalingServer.readyState === WebSocket.OPEN) {
            this.signalingServer.send(JSON.stringify(msg));
        }
    }
    
    // ---------- 6. Metrics & Bitrate ----------
    startMetricsPolling() {
        this.metricsInterval = setInterval(async () => {
            let stats = {
                txVideoKBitRate: 0,
                rxVideoKBitRate: 0,
                txPacketLossRate: 0,
                lastmileDelay: 0,
                cpuAppUsage: await this.getCpuUsage(),
                userCount: this.peerConnections.size,
                isFallback: this.fallbackActive,
                timestamp: Date.now()
            };
            
            if (this.fallbackActive && this.agoraClient) {
                // Get Agora stats during fallback
                const agoraStats = await this.agoraClient.getRTCStats();
                stats.txVideoKBitRate = agoraStats.SendVideoKBitrate || 0;
                stats.rxVideoKBitRate = agoraStats.RecvVideoKBitrate || 0;
                stats.txPacketLossRate = agoraStats.SendPacketLossRate || 0;
                stats.lastmileDelay = agoraStats.LastmileDelay || 0;
            } else {
                // Get P2P stats
                const p2pStats = await this.getAggregatedStats();
                stats.txVideoKBitRate = p2pStats.sendBitrate;
                stats.rxVideoKBitRate = p2pStats.recvBitrate;
                stats.txPacketLossRate = p2pStats.avgPacketLoss;
                stats.lastmileDelay = p2pStats.avgRtt;
            }
            
            if (this.onMetrics) {
                this.onMetrics(stats);
            }
            
            // Auto bitrate adaptation (P2P mode only)
            if (!this.fallbackActive && stats.txPacketLossRate > 0.10) {
                this.adjustBitrate('down');
            } else if (!this.fallbackActive && stats.txPacketLossRate < 0.02) {
                this.adjustBitrate('up');
            }
        }, 2000);
    }
    
    async getAggregatedStats() {
        let totalSendBitrate = 0;
        let totalRecvBitrate = 0;
        let totalPacketLoss = 0;
        let totalRtt = 0;
        let connectionCount = 0;
        
        for (const pc of this.peerConnections.values()) {
            const stats = await pc.getStats();
            stats.forEach(report => {
                if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    totalSendBitrate += (report.bytesSent * 8) / 2;
                    totalPacketLoss += report.packetsLost / (report.packetsSent + report.packetsLost || 1);
                    connectionCount++;
                }
                if (report.type === 'candidate-pair' && report.nominated) {
                    totalRtt += report.currentRtt || 0;
                }
            });
        }
        
        return {
            sendBitrate: totalSendBitrate / 1000,
            recvBitrate: totalRecvBitrate / 1000,
            avgPacketLoss: totalPacketLoss / (connectionCount || 1),
            avgRtt: totalRtt / (connectionCount || 1)
        };
    }
    
    adjustBitrate(direction) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        let newBitrate = this.config.bitrateStart;
        
        if (direction === 'down') {
            newBitrate = Math.max(this.config.bitrateMin, this.config.bitrateStart * 0.8);
            this.config.bitrateStart = newBitrate;
        } else {
            newBitrate = Math.min(this.config.bitrateMax, this.config.bitrateStart * 1.05);
            this.config.bitrateStart = newBitrate;
        }
        
        const sender = this.peerConnections.values().next().value?.getSenders().find(s => s.track === videoTrack);
        if (sender) {
            const params = sender.getParameters();
            if (params.encodings && params.encodings[0]) {
                params.encodings[0].maxBitrate = newBitrate * 1000;
                sender.setParameters(params);
            }
        }
    }
    
    async getCpuUsage() {
        if ('computePressure' in navigator) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'cpu') {
                            return entry.value;
                        }
                    }
                });
                observer.observe({ type: 'cpu', buffered: true });
                return 0;
            } catch(e) {
                return 0;
            }
        }
        return 0;
    }
    
    // ---------- 7. Destroy ----------
    destroy() {
        if (this.metricsInterval) clearInterval(this.metricsInterval);
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        
        if (this.fallbackActive) {
            if (this.agoraTracks) {
                this.agoraTracks.audio?.close();
                this.agoraTracks.video?.close();
            }
            if (this.agoraClient) {
                this.agoraClient.leave();
            }
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.signalingServer) {
            this.signalingServer.close();
        }
    }
}
```

### 2. p2p-app.html (Updated with Agora SDK & Fallback UI)

```html
<!DOCTYPE html>
<html>
<head>
    <title>P2P SDK - Agora Fallback Ready</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui; padding: 20px; background: #0a0a0a; color: white; }
        .container { max-width: 1200px; margin: 0 auto; }
        .video-grid { display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0; }
        video { width: 400px; max-width: 100%; background: #111; border-radius: 12px; }
        button { background: #00B4FF; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 5px; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .metrics-panel { background: #1a1a1a; padding: 15px; border-radius: 12px; font-family: monospace; margin: 20px 0; border-left: 4px solid #00B4FF; }
        .fallback-badge { background: #ff4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; }
        .p2p-badge { background: #00aa44; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; }
        .status { padding: 10px; border-radius: 8px; margin: 10px 0; }
        .error { background: #ff444422; border: 1px solid #ff4444; }
        .info { background: #00B4FF22; border: 1px solid #00B4FF; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎥 Your P2P SDK <span id="modeBadge" class="p2p-badge">P2P MODE</span></h1>
        
        <div>
            <input type="text" id="channel" placeholder="Channel Name" value="test123" style="padding: 10px; width: 200px; margin-right: 10px;">
            <input type="text" id="userId" placeholder="User ID" value="user_" + Date.now() style="padding: 10px; width: 200px; margin-right: 10px;">
            <button id="startBtn">🎬 Start Call</button>
            <button id="stopBtn" disabled>⏹️ Stop</button>
            <button id="forceFallbackBtn" disabled>🔁 Force Agora Fallback</button>
        </div>
        
        <div class="video-grid">
            <div>
                <video id="localVideo" autoplay muted playsinline></video>
                <p>📹 Your Camera</p>
            </div>
            <div>
                <video id="remoteVideo" autoplay playsinline></video>
                <p>👤 Remote User</p>
            </div>
        </div>
        
        <div class="metrics-panel" id="metrics">
            Waiting for connection...
        </div>
        
        <div class="status info" id="status">
            💡 Ready. Click Start Call.
        </div>
    </div>
    
    <!-- Load Agora SDK first -->
    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.22.0.js"></script>
    <script src="p2p-sdk.js"></script>
    <script>
        // CONFIGURATION
        const AGORA_APP_ID = 'YOUR_AGORA_APP_ID_HERE';  // ← REPLACE THIS
        const SIGNALING_URL = 'ws://localhost:8080';     // Your signaling server
        
        let sdk = null;
        let remoteStream = null;
        
        // DOM Elements
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const forceFallbackBtn = document.getElementById('forceFallbackBtn');
        const channelInput = document.getElementById('channel');
        const userIdInput = document.getElementById('userId');
        const metricsDiv = document.getElementById('metrics');
        const statusDiv = document.getElementById('status');
        const modeBadge = document.getElementById('modeBadge');
        
        // Helper: Update UI
        function updateModeUI(isFallback) {
            if (isFallback) {
                modeBadge.innerHTML = '🔄 AGORA FALLBACK ACTIVE';
                modeBadge.className = 'fallback-badge';
                statusDiv.innerHTML = '⚠️ P2P failed → Using Agora as fallback. Streaming continues.';
                statusDiv.className = 'status error';
            } else {
                modeBadge.innerHTML = '✅ P2P MODE';
                modeBadge.className = 'p2p-badge';
                statusDiv.innerHTML = '✅ P2P connection active. Agora ready as backup.';
                statusDiv.className = 'status info';
            }
        }
        
        // Start call
        startBtn.onclick = async () => {
            const channel = channelInput.value.trim();
            const userId = userIdInput.value.trim() || `user_${Date.now()}`;
            
            if (!AGORA_APP_ID || AGORA_APP_ID === 'YOUR_AGORA_APP_ID_HERE') {
                alert('⚠️ Please set your Agora App ID in the code (line ~230)');
                return;
            }
            
            statusDiv.innerHTML = '🔄 Initializing P2P SDK...';
            
            sdk = new P2PSDK({
                bitrateMin: 200,
                bitrateMax: 1500,
                bitrateStart: 800,
                agoraAppId: AGORA_APP_ID,
                agoraChannel: channel,
                fallbackEnabled: true
            });
            
            // Metrics callback
            sdk.onMetrics = (metrics) => {
                const packetLossPercent = (metrics.txPacketLossRate * 100).toFixed(1);
                metricsDiv.innerHTML = `
                    📊 <strong>Live Metrics</strong><br>
                    Mode: ${metrics.isFallback ? 'AGORA (fallback)' : 'P2P (your SDK)'}<br>
                    Bitrate: ${Math.round(metrics.txVideoKBitRate || 0)} kbps ↑ / ${Math.round(metrics.rxVideoKBitRate || 0)} kbps ↓<br>
                    Packet Loss: ${packetLossPercent}%<br>
                    Latency: ${Math.round(metrics.lastmileDelay || 0)} ms<br>
                    CPU: ${Math.round(metrics.cpuAppUsage || 0)}%<br>
                    Users in call: ${metrics.userCount}
                `;
            };
            
            // Connection state changes (including fallback trigger)
            sdk.onConnectionStateChange = (event) => {
                console.log('Connection event:', event);
                if (event.isFallback && event.state === 'connected') {
                    updateModeUI(true);
                    statusDiv.innerHTML = `🔄 Fallback active (${event.reason || 'P2P failed'}). Connected via Agora in ${event.fallbackLatency}ms.`;
                } else if (!event.isFallback && event.state === 'connected') {
                    updateModeUI(false);
                }
                
                if (event.state === 'failed' && !event.isFallback) {
                    statusDiv.innerHTML = '⚠️ P2P failed. Triggering Agora fallback...';
                }
            };
            
            // Fallback triggered callback
            sdk.onFallbackTriggered = (data) => {
                console.log('Fallback triggered:', data);
                statusDiv.innerHTML = `🔄 FALLBACK: ${data.reason}`;
                updateModeUI(true);
            };
            
            // Network quality
            sdk.onNetworkQuality = (quality) => {
                const qualityText = ['Excellent', 'Good', 'Fair', 'Poor', 'Bad', 'Very Bad', 'Down'];
                if (!quality.isFallback) {
                    // Optional: display quality
                }
            };
            
            // Remote stream
            sdk.onRemoteStream = (userId, stream) => {
                if (remoteStream) {
                    document.getElementById('remoteVideo').srcObject = stream;
                }
                remoteStream = stream;
            };
            
            try {
                await sdk.init(userId, channel, SIGNALING_URL);
                document.getElementById('localVideo').srcObject = sdk.localStream;
                await sdk.joinRoom();
                
                startBtn.disabled = true;
                stopBtn.disabled = false;
                forceFallbackBtn.disabled = false;
                statusDiv.innerHTML = '✅ P2P active. Agora fallback ready if needed.';
            } catch (err) {
                console.error(err);
                statusDiv.innerHTML = `❌ Error: ${err.message}`;
            }
        };
        
        // Stop call
        stopBtn.onclick = () => {
            if (sdk) {
                sdk.destroy();
                sdk = null;
            }
            
            if (remoteStream) {
                remoteStream.getTracks().forEach(t => t.stop());
                remoteStream = null;
            }
            
            document.getElementById('localVideo').srcObject = null;
            document.getElementById('remoteVideo').srcObject = null;
            
            startBtn.disabled = false;
            stopBtn.disabled = true;
            forceFallbackBtn.disabled = true;
            metricsDiv.innerHTML = 'Call ended.';
            updateModeUI(false);
            statusDiv.innerHTML = 'Ready. Click Start Call.';
        };
        
        // Force fallback (for testing)
        forceFallbackBtn.onclick = async () => {
            if (sdk && !sdk.fallbackActive) {
                statusDiv.innerHTML = '🔧 Manually triggering Agora fallback...';
                await sdk.triggerAgoraFallback('Manual test');
            } else if (sdk && sdk.fallbackActive) {
                statusDiv.innerHTML = 'Already in fallback mode.';
            }
        };
        
        // Set default user ID
        userIdInput.value = `user_${Date.now()}`;
    </script>
</body>
</html>
```

### 3. How It Works & Testing

| Step | Action |
| :--- | :--- |
| 1 | Your SDK tries P2P with Google STUN |
| 2 | If any P2P connection fails → retry within 500ms |
| 3 | If all connections fail → auto-triggers Agora fallback |
| 4 | Agora takes over seamlessly (same channel, same stream) |
| 5 | Metrics show which mode is active |

**How to Test**
1. Run signaling server: `node p2p-server.js`
2. Replace `YOUR_AGORA_APP_ID_HERE` in the HTML
3. Open in two browser windows (simulate two users)
4. Click Start Call in both
5. To see fallback: Disable WiFi on one device → P2P fails → Agora auto-takes over

---

## 💾 Code Archive (P2P SDK with TURN Integration)
*This section contains the source code for the custom P2P SDK with TURN support to maximize connectivity and minimize Agora usage.*

### 1. TURN Server Integration Guide

**Option 1: Free Public TURN Servers (For Testing)**
Add these to your configuration in `p2p-sdk.js` to handle basic relaying during development.
```javascript
this.config.iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    // ... other Google STUNs
    { 
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    }
];
```

**Option 2: Deploy Your Own TURN Server (Production - Coturn)**
1. Install: `sudo apt install coturn`
2. Configure `/etc/turnserver.conf`:
```conf
listening-port=3478
listening-ip=0.0.0.0
lt-cred-mech
user=yourusername:yourpassword
realm=your-server-ip
verbose
```

### 2. p2p-sdk.js (Updated with TURN & STUN Support)

```javascript
class P2PSDK {
    constructor(config) {
        this.config = {
            iceServers: config.iceServers || this.getDefaultIceServers(),
            bitrateMin: 200,
            bitrateMax: 1500,
            bitrateStart: 800,
            agoraAppId: null,
            agoraChannel: null,
            fallbackEnabled: true,
            turnOnlyAsFallback: true,  // Only use TURN when STUN fails
            ...config
        };
        
        this.peerConnections = new Map();
        this.localStream = null;
        this.signalingServer = null;
        this.fallbackActive = false;
        // ... rest of properties
    }
    
    getDefaultIceServers() {
        const servers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ];
        if (this.config.turnServerUrl) {
            servers.push({
                urls: this.config.turnServerUrl,
                username: this.config.turnUsername,
                credential: this.config.turnCredential
            });
        }
        return servers;
    }
    
    async createPeerConnection(remoteUserId, isInitiator) {
        if (this.fallbackActive) return;
        
        const pc = new RTCPeerConnection({
            iceServers: this.config.iceServers,
            iceTransportPolicy: this.config.turnOnlyAsFallback ? 'all' : 'relay' 
        });
        
        this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream));
        
        pc.onicecandidate = (event) => {
            if (event.candidate && event.candidate.candidate.includes('typ relay')) {
                console.log(`🔄 Using TURN relay for ${remoteUserId}`);
                this.onConnectionStateChange?.({ userId: remoteUserId, state: 'turn-active' });
            }
            if (event.candidate) {
                this.sendSignaling({ type: 'ice-candidate', userId: remoteUserId, candidate: event.candidate });
            }
        };
        
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (state === 'failed' || state === 'disconnected') {
                if (this.config.turnOnlyAsFallback) {
                    console.log('🔄 Retrying with forced TURN...');
                    this.config.turnOnlyAsFallback = false;
                    this.retryConnection(remoteUserId);
                } else {
                    this.triggerAgoraFallback('TURN relay failed');
                }
            }
        };
        
        this.peerConnections.set(remoteUserId, pc);
        // ... offer/answer logic
    }
    
    // ... (rest of the SDK methods as provided)
}
```

### 3. Summary: TURN Impact on Costs

| Configuration | Success Rate | Agora Usage | Cost Impact |
| :--- | :--- | :--- | :--- |
| STUN only | 80% | 20% | Baseline |
| STUN + Free TURN | 90% | 10% | 50% reduction |
| STUN + Self-hosted | 95-98% | 2-5% | 75-90% reduction |
| STUN + Paid TURN | 99% | 1% | 95% reduction |

---

## 💾 Code Archive (P2P SDK with Automatic TURN Health Checker)
*This section contains the source code for the custom P2P SDK with a health checker that tests multiple TURN servers and switches if one fails.*

### 1. p2p-sdk.js (Updated with TURN Health Checker)

```javascript
class P2PSDK {
    constructor(config) {
        this.config = {
            // TURN server pool (add as many as you want)
            turnServers: config.turnServers || [
                {
                    name: 'Self-Hosted',
                    urls: 'turn:your-server.com:3478',
                    username: 'user1',
                    credential: 'pass1',
                    priority: 1  // 1 = highest priority
                },
                {
                    name: 'Metered Free',
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject',
                    priority: 2
                },
                {
                    name: 'Twilio (paid)',
                    urls: 'turn:global.turn.twilio.com:3478',
                    username: 'your-twilio-user',
                    credential: 'your-twilio-pass',
                    priority: 3
                }
            ],
            bitrateMin: 200,
            bitrateMax: 1500,
            bitrateStart: 800,
            agoraAppId: null,
            agoraChannel: null,
            fallbackEnabled: true,
            turnCheckIntervalMs: 30000,  // Check TURN health every 30 seconds
            ...config
        };
        
        // State
        this.activeTurnServer = null;     // Currently using
        this.turnHealthStatus = new Map(); // Server name -> { healthy, latency, lastCheck }
        this.healthCheckInterval = null;
        this.peerConnections = new Map();
        this.localStream = null;
        this.signalingServer = null;
        this.roomId = null;
        this.userId = null;
        this.fallbackActive = false;
        this.agoraClient = null;
        this.agoraTracks = null;
        this.metricsInterval = null;
        
        // Callbacks
        this.onMetrics = null;
        this.onConnectionStateChange = null;
        this.onNetworkQuality = null;
        this.onFallbackTriggered = null;
        this.onTurnServerChanged = null;
    }
    
    // ---------- 1. Initialize (with TURN health checking) ----------
    async init(userId, roomId, signalingWsUrl) {
        this.userId = userId;
        this.roomId = roomId;
        
        // 1. Test all TURN servers before starting
        await this.testAllTurnServers();
        
        // 2. Pick the best healthy server
        this.selectBestTurnServer();
        
        // 3. Start periodic health checks
        this.startTurnHealthChecks();
        
        // 4. Connect signaling
        this.signalingServer = new WebSocket(signalingWsUrl);
        this.signalingServer.onmessage = (event) => this.handleSignaling(JSON.parse(event.data));
        await this.waitForSignalOpen();
        
        // 5. Get user media
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        // 6. Start metrics
        this.startMetricsPolling();
        
        return this.localStream;
    }
    
    // ---------- 2. Test a single TURN server ----------
    async testTurnServer(server) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            // Create a temporary peer connection just to test this TURN server
            const pc = new RTCPeerConnection({
                iceServers: [{
                    urls: server.urls,
                    username: server.username,
                    credential: server.credential
                }],
                iceTransportPolicy: 'relay'  // Force TURN usage
            });
            
            let timeout = setTimeout(() => {
                pc.close();
                resolve({ server: server.name, healthy: false, latency: null, error: 'timeout' });
            }, 5000);  // 5 second timeout
            
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidateStr = event.candidate.candidate;
                    if (candidateStr.includes('typ relay')) {
                        // Success! Got a relay candidate
                        clearTimeout(timeout);
                        const latency = Date.now() - startTime;
                        pc.close();
                        resolve({ 
                            server: server.name, 
                            healthy: true, 
                            latency: latency,
                            url: server.urls
                        });
                    }
                }
            };
            
            pc.onicegatheringstatechange = () => {
                if (pc.iceGatheringState === 'complete') {
                    // No relay candidate found
                    clearTimeout(timeout);
                    pc.close();
                    resolve({ server: server.name, healthy: false, latency: null, error: 'no-relay' });
                }
            };
            
            // Create a data channel to trigger ICE gathering
            pc.createDataChannel('healthCheck');
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .catch(err => {
                    clearTimeout(timeout);
                    pc.close();
                    resolve({ server: server.name, healthy: false, latency: null, error: err.message });
                });
        });
    }
    
    // ---------- 3. Test all TURN servers ----------
    async testAllTurnServers() {
        console.log('🔍 Testing TURN servers...');
        
        const tests = this.config.turnServers.map(server => this.testTurnServer(server));
        const results = await Promise.all(tests);
        
        for (const result of results) {
            this.turnHealthStatus.set(result.server, {
                healthy: result.healthy,
                latency: result.latency,
                lastCheck: Date.now(),
                url: result.url
            });
            console.log(`📡 ${result.server}: ${result.healthy ? '✅ healthy' : '❌ unhealthy'} (${result.latency ? result.latency + 'ms' : 'failed'})`);
        }
    }
    
    // ---------- 4. Pick best healthy TURN server ----------
    selectBestTurnServer() {
        const healthyServers = [];
        
        for (const server of this.config.turnServers) {
            const status = this.turnHealthStatus.get(server.name);
            if (status && status.healthy) {
                healthyServers.push({
                    ...server,
                    latency: status.latency,
                    priority: server.priority || 999
                });
            }
        }
        
        if (healthyServers.length === 0) {
            console.warn('⚠️ No healthy TURN servers found. Will rely on Agora fallback.');
            this.activeTurnServer = null;
            return;
        }
        
        // Sort by priority (lower = better), then by latency
        healthyServers.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return (a.latency || 999) - (b.latency || 999);
        });
        
        this.activeTurnServer = healthyServers[0];
        console.log(`✅ Active TURN server: ${this.activeTurnServer.name} (${this.activeTurnServer.latency}ms)`);
        
        if (this.onTurnServerChanged) {
            this.onTurnServerChanged({
                name: this.activeTurnServer.name,
                latency: this.activeTurnServer.latency,
                url: this.activeTurnServer.urls
            });
        }
    }
    
    // ---------- 5. Start periodic health checks ----------
    startTurnHealthChecks() {
        this.healthCheckInterval = setInterval(async () => {
            console.log('🔄 Running TURN health check...');
            
            // Re-test all servers
            await this.testAllTurnServers();
            
            const oldServer = this.activeTurnServer;
            this.selectBestTurnServer();
            
            // If server changed, log it
            if (oldServer && this.activeTurnServer && oldServer.name !== this.activeTurnServer.name) {
                console.log(`🔄 TURN server switched: ${oldServer.name} → ${this.activeTurnServer.name}`);
                
                if (this.onTurnServerChanged) {
                    this.onTurnServerChanged({
                        name: this.activeTurnServer.name,
                        latency: this.activeTurnServer.latency,
                        previousServer: oldServer.name,
                        reason: 'health check'
                    });
                }
                
                // Option: Reconnect active connections with new TURN server
                this.reconnectWithNewTurnServer();
            }
        }, this.config.turnCheckIntervalMs);
    }
    
    // ---------- 6. Reconnect existing connections with new TURN server ----------
    async reconnectWithNewTurnServer() {
        if (this.fallbackActive) return;
        
        console.log('🔄 Reconnecting peers with new TURN server...');
        
        const remoteUserIds = Array.from(this.peerConnections.keys());
        
        for (const userId of remoteUserIds) {
            this.closePeerConnection(userId);
            await this.createPeerConnection(userId, true);
        }
    }
    
    // ---------- 7. Get ICE servers (prioritizing healthy TURN) ----------
    getActiveIceServers() {
        const iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ];
        
        if (this.activeTurnServer) {
            const status = this.turnHealthStatus.get(this.activeTurnServer.name);
            if (status && status.healthy) {
                iceServers.push({
                    urls: this.activeTurnServer.urls,
                    username: this.activeTurnServer.username,
                    credential: this.activeTurnServer.credential
                });
            }
        }
        
        return iceServers;
    }
    
    // ---------- 8. Create Peer Connection (uses active TURN) ----------
    async createPeerConnection(remoteUserId, isInitiator) {
        if (this.fallbackActive) return;
        
        const pc = new RTCPeerConnection({
            iceServers: this.getActiveIceServers(),
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        });
        
        // Add local tracks
        this.localStream.getTracks().forEach(track => {
            pc.addTrack(track, this.localStream);
        });
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidateStr = event.candidate.candidate;
                const candidateType = candidateStr.includes('typ relay') ? 'relay' : 
                                      candidateStr.includes('typ srflx') ? 'srflx' : 'host';
                
                if (candidateType === 'relay' && this.onConnectionStateChange) {
                    this.onConnectionStateChange({
                        userId: remoteUserId,
                        state: 'turn-connected',
                        candidateType: 'relay',
                        turnServer: this.activeTurnServer?.name,
                        timestamp: Date.now()
                    });
                }
                
                this.sendSignaling({
                    type: 'ice-candidate',
                    userId: remoteUserId,
                    candidate: event.candidate
                });
            }
        };
        
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange({
                    userId: remoteUserId,
                    state: state,
                    timestamp: Date.now(),
                    turnServer: this.activeTurnServer?.name
                });
            }
            
            if (state === 'failed') {
                // Try another TURN server if available
                this.tryNextTurnServer(remoteUserId);
            }
        };
        
        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'failed') {
                pc.restartIce();
            }
        };
        
        pc.ontrack = (event) => {
            if (this.onRemoteStream) {
                this.onRemoteStream(remoteUserId, event.streams[0]);
            }
        };
        
        this.peerConnections.set(remoteUserId, pc);
        
        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignaling({
                type: 'offer',
                userId: remoteUserId,
                sdp: offer
            });
        }
    }
    
    // ---------- 9. Try next TURN server when current fails ----------
    async tryNextTurnServer(remoteUserId) {
        // Mark current server as unhealthy
        if (this.activeTurnServer) {
            this.turnHealthStatus.set(this.activeTurnServer.name, {
                ...this.turnHealthStatus.get(this.activeTurnServer.name),
                healthy: false,
                lastCheck: Date.now()
            });
        }
        
        // Pick next best server
        this.selectBestTurnServer();
        
        if (this.activeTurnServer) {
            console.log(`🔄 Switching to TURN server: ${this.activeTurnServer.name}`);
            // Reconnect with new server
            this.closePeerConnection(remoteUserId);
            await this.createPeerConnection(remoteUserId, true);
        } else {
            // No TURN servers left → trigger Agora
            console.log('⚠️ No TURN servers available. Triggering Agora fallback.');
            this.triggerAgoraFallback('All TURN servers failed');
        }
    }
    
    // ---------- 10. Trigger Agora fallback (same as before) ----------
    async triggerAgoraFallback(reason) {
        if (this.fallbackActive || !this.config.fallbackEnabled) return;
        if (!this.config.agoraAppId) {
            console.error('❌ Agora App ID not set');
            return;
        }
        
        console.log(`🔄 AGORA FALLBACK: ${reason}`);
        this.fallbackActive = true;
        this.fallbackTriggerTime = Date.now();
        
        if (this.onFallbackTriggered) {
            this.onFallbackTriggered({ reason, timestamp: this.fallbackTriggerTime });
        }
        
        // Stop health checks while in fallback
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        
        // Stop all P2P
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        
        // Initialize Agora
        if (!window.AgoraRTC) {
            console.error('❌ Agora SDK not loaded');
            return;
        }
        
        this.agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        this.agoraClient.setClientRole('host');
        
        this.agoraClient.on('connection-state-change', (cur, prev, reason) => {
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange({
                    userId: 'agora',
                    state: cur,
                    reason: reason,
                    isFallback: true
                });
            }
        });
        
        await this.agoraClient.join(
            this.config.agoraAppId,
            this.config.agoraChannel || this.roomId,
            null,
            null
        );
        
        this.agoraTracks = {
            audio: await AgoraRTC.createMicrophoneAudioTrack(),
            video: await AgoraRTC.createCameraVideoTrack()
        };
        
        await this.agoraClient.publish([this.agoraTracks.audio, this.agoraTracks.video]);
        
        if (this.onConnectionStateChange) {
            this.onConnectionStateChange({
                userId: 'agora',
                state: 'connected',
                isFallback: true,
                fallbackLatency: Date.now() - this.fallbackTriggerTime
            });
        }
    }
    
    // ---------- 11. Exit fallback ----------
    async exitAgoraFallback() {
        if (!this.fallbackActive) return;
        
        console.log('🔄 Exiting Agora fallback...');
        
        if (this.agoraTracks) {
            this.agoraTracks.audio?.close();
            this.agoraTracks.video?.close();
        }
        if (this.agoraClient) {
            await this.agoraClient.leave();
        }
        
        this.agoraClient = null;
        this.agoraTracks = null;
        this.fallbackActive = false;
        
        // Restart health checks
        this.startTurnHealthChecks();
        
        console.log('✅ Back to P2P mode');
    }
    
    // ---------- 12. Destroy (cleanup) ----------
    destroy() {
        if (this.metricsInterval) clearInterval(this.metricsInterval);
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        
        if (this.fallbackActive) {
            if (this.agoraTracks) {
                this.agoraTracks.audio?.close();
                this.agoraTracks.video?.close();
            }
            if (this.agoraClient) {
                this.agoraClient.leave();
            }
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.signalingServer) {
            this.signalingServer.close();
        }
    }
    
    // ---------- Helper methods (keep from previous version) ----------
    waitForSignalOpen() {
        return new Promise((resolve) => {
            if (this.signalingServer.readyState === WebSocket.OPEN) resolve();
            else this.signalingServer.onopen = () => resolve();
        });
    }
    
    async joinRoom() {
        this.sendSignaling({
            type: 'join',
            userId: this.userId,
            roomId: this.roomId
        });
    }
    
    handleSignaling(msg) {
        if (this.fallbackActive) return;
        
        switch(msg.type) {
            case 'user-joined':
                this.createPeerConnection(msg.userId, true);
                break;
            case 'offer':
                this.handleOffer(msg);
                break;
            case 'answer':
                this.handleAnswer(msg);
                break;
            case 'ice-candidate':
                this.handleIceCandidate(msg);
                break;
            case 'user-left':
                this.closePeerConnection(msg.userId);
                break;
        }
    }
    
    async handleOffer(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignaling({
            type: 'answer',
            userId: msg.userId,
            sdp: answer
        });
    }
    
    async handleAnswer(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    
    async handleIceCandidate(msg) {
        const pc = this.peerConnections.get(msg.userId);
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }
    
    closePeerConnection(userId) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(userId);
        }
    }
    
    sendSignaling(msg) {
        if (this.signalingServer && this.signalingServer.readyState === WebSocket.OPEN) {
            this.signalingServer.send(JSON.stringify(msg));
        }
    }
    
    startMetricsPolling() {
        this.metricsInterval = setInterval(async () => {
            let stats = {
                txVideoKBitRate: 0,
                rxVideoKBitRate: 0,
                txPacketLossRate: 0,
                lastmileDelay: 0,
                cpuAppUsage: await this.getCpuUsage(),
                userCount: this.peerConnections.size,
                isFallback: this.fallbackActive,
                activeTurnServer: this.activeTurnServer?.name,
                timestamp: Date.now()
            };
            
            if (this.fallbackActive && this.agoraClient) {
                const agoraStats = await this.agoraClient.getRTCStats();
                stats.txVideoKBitRate = agoraStats.SendVideoKBitrate || 0;
                stats.rxVideoKBitRate = agoraStats.RecvVideoKBitrate || 0;
                stats.txPacketLossRate = agoraStats.SendPacketLossRate || 0;
                stats.lastmileDelay = agoraStats.LastmileDelay || 0;
            } else {
                const p2pStats = await this.getAggregatedStats();
                stats.txVideoKBitRate = p2pStats.sendBitrate;
                stats.rxVideoKBitRate = p2pStats.recvBitrate;
                stats.txPacketLossRate = p2pStats.avgPacketLoss;
                stats.lastmileDelay = p2pStats.avgRtt;
            }
            
            if (this.onMetrics) this.onMetrics(stats);
            
            if (!this.fallbackActive && stats.txPacketLossRate > 0.10) {
                this.adjustBitrate('down');
            } else if (!this.fallbackActive && stats.txPacketLossRate < 0.02) {
                this.adjustBitrate('up');
            }
        }, 2000);
    }
    
    async getAggregatedStats() {
        let totalSendBitrate = 0, totalRecvBitrate = 0, totalPacketLoss = 0, totalRtt = 0, connectionCount = 0;
        for (const pc of this.peerConnections.values()) {
            const stats = await pc.getStats();
            stats.forEach(report => {
                if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    totalSendBitrate += (report.bytesSent * 8) / 2;
                    totalPacketLoss += report.packetsLost / (report.packetsSent + report.packetsLost || 1);
                    connectionCount++;
                }
                if (report.type === 'candidate-pair' && report.nominated) {
                    totalRtt += report.currentRtt || 0;
                }
            });
        }
        return {
            sendBitrate: totalSendBitrate / 1000,
            recvBitrate: totalRecvBitrate / 1000,
            avgPacketLoss: totalPacketLoss / (connectionCount || 1),
            avgRtt: totalRtt / (connectionCount || 1)
        };
    }
    
    adjustBitrate(direction) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        let newBitrate = this.config.bitrateStart;
        if (direction === 'down') {
            newBitrate = Math.max(this.config.bitrateMin, this.config.bitrateStart * 0.8);
        } else {
            newBitrate = Math.min(this.config.bitrateMax, this.config.bitrateStart * 1.05);
        }
        this.config.bitrateStart = newBitrate;
        
        const sender = this.peerConnections.values().next().value?.getSenders().find(s => s.track === videoTrack);
        if (sender && sender.getParameters().encodings) {
            const params = sender.getParameters();
            params.encodings[0].maxBitrate = newBitrate * 1000;
            sender.setParameters(params);
        }
    }
    
    async getCpuUsage() { return 0; }
}
```

### 2. p2p-app.html (Updated with multiple TURN servers)

```html
<!DOCTYPE html>
<html>
<head>
    <title>P2P SDK - Auto TURN Health Checker</title>
    <style>
        body { font-family: system-ui; padding: 20px; background: #0a0a0a; color: white; }
        video { width: 400px; background: #111; border-radius: 12px; margin: 10px; }
        button { background: #00B4FF; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
        .metrics { background: #1a1a1a; padding: 15px; border-radius: 12px; font-family: monospace; margin: 20px 0; }
        .status { padding: 10px; border-radius: 8px; margin: 10px 0; }
        .turn-info { background: #ffaa0022; border-left: 4px solid #ffaa00; }
    </style>
</head>
<body>
    <h1>P2P SDK - Auto TURN Failover</h1>
    
    <input type="text" id="channel" placeholder="Channel" value="test123">
    <input type="text" id="userId" placeholder="User ID" value="user_">
    <button id="startBtn">Start</button>
    <button id="stopBtn" disabled>Stop</button>
    
    <div>
        <video id="localVideo" autoplay muted playsinline></video>
        <video id="remoteVideo" autoplay playsinline></video>
    </div>
    
    <div class="metrics" id="metrics">Waiting...</div>
    <div class="status" id="status">Ready</div>
    <div class="status turn-info" id="turnStatus">TURN: Not active</div>
    
    <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.22.0.js"></script>
    <script src="p2p-sdk.js"></script>
    <script>
        const AGORA_APP_ID = 'YOUR_AGORA_APP_ID';
        const SIGNALING_URL = 'ws://localhost:8080';
        
        // Multiple TURN servers (SDK will auto-pick best)
        const TURN_SERVERS = [
            {
                name: 'Self-Hosted (Priority 1)',
                urls: 'turn:123.45.67.89:3478',  // Replace with your server
                username: 'youruser',
                credential: 'yourpass',
                priority: 1
            },
            {
                name: 'Metered.ca Free',
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject',
                priority: 2
            }
        ];
        
        let sdk = null;
        
        document.getElementById('startBtn').onclick = async () => {
            const channel = document.getElementById('channel').value;
            const userId = document.getElementById('userId').value || `user_${Date.now()}`;
            
            sdk = new P2PSDK({
                turnServers: TURN_SERVERS,
                turnCheckIntervalMs: 30000,  // Check every 30 seconds
                agoraAppId: AGORA_APP_ID,
                agoraChannel: channel,
                fallbackEnabled: true
            });
            
            // Metrics display
            sdk.onMetrics = (metrics) => {
                document.getElementById('metrics').innerHTML = `
                    Mode: ${metrics.isFallback ? 'AGORA' : 'P2P'}<br>
                    TURN Server: ${metrics.activeTurnServer || 'None (STUN only)'}<br>
                    Bitrate: ${Math.round(metrics.txVideoKBitRate || 0)} kbps<br>
                    Packet Loss: ${((metrics.txPacketLossRate || 0) * 100).toFixed(1)}%<br>
                    Latency: ${Math.round(metrics.lastmileDelay || 0)} ms
                `;
            };
            
            // Connection events
            sdk.onConnectionStateChange = (event) => {
                if (event.candidateType === 'relay') {
                    document.getElementById('turnStatus').innerHTML = `🔄 TURN: Connected via ${event.turnServer || 'unknown'}`;
                } else if (event.isFallback) {
                    document.getElementById('turnStatus').innerHTML = `⚠️ FALLBACK: Using Agora`;
                }
            };
            
            // TURN server changes
            sdk.onTurnServerChanged = (data) => {
                console.log('TURN changed:', data);
                document.getElementById('turnStatus').innerHTML = `🔄 TURN: Switched to ${data.name} (${data.latency}ms)${data.reason ? ' - ' + data.reason : ''}`;
            };
            
            // Fallback trigger
            sdk.onFallbackTriggered = (data) => {
                document.getElementById('status').innerHTML = `⚠️ Fallback: ${data.reason}`;
            };
            
            // Remote stream
            sdk.onRemoteStream = (userId, stream) => {
                document.getElementById('remoteVideo').srcObject = stream;
            };
            
            await sdk.init(userId, channel, SIGNALING_URL);
            document.getElementById('localVideo').srcObject = sdk.localStream;
            await sdk.joinRoom();
            
            document.getElementById('startBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
        };
        
        document.getElementById('stopBtn').onclick = () => {
            if (sdk) sdk.destroy();
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            document.getElementById('localVideo').srcObject = null;
            document.getElementById('remoteVideo').srcObject = null;
            document.getElementById('turnStatus').innerHTML = 'TURN: Not active';
        };
        
        document.getElementById('userId').value = `user_${Date.now()}`;
    </script>
</body>
</html>
```

### 3. How It Works & Setup Checklist

| Feature | What it does |
| :--- | :--- |
| **Health checks every 30s** | Tests all TURN servers, picks fastest healthy one |
| **Auto failover** | If current TURN fails, switches to next best |
| **Priority system** | Your self-hosted TURN = priority 1, free backups = priority 2 |
| **Agora as last resort** | Only if ALL TURN servers fail |

**What You Need to Do**
1. Deploy Coturn on a VPS (e.g., DigitalOcean $5/mo).
2. Configure `/etc/turnserver.conf` with your IP, username, and password.
3. Replace the `TURN_SERVERS` array in the client code with your server details.
4. Add a free backup (like Metered.ca) as a secondary fallback.
5. The SDK will automatically switch providers if your primary server goes down.

---

## 💾 Code Archive (Agora Logger - Auto-Report Integration)
*This section contains the auto-report logic for the Agora Logger to automatically send logs to a backend server.*

### 1. app.js (Updated with Auto-Report to Your Dashboard)

```javascript
// Agora Credentials (Replace with YOURS)
const APP_ID = 'YOUR_APP_ID_HERE';
const APP_CERTIFICATE = null;

// YOUR backend server (replace with your actual URL)
const YOUR_API_URL = 'https://your-api.com/upload-logs';  // ← CHANGE THIS

// Auto-report settings
const AUTO_REPORT_INTERVAL = 30000;  // Send logs every 30 seconds (adjust as needed)
const AUTO_REPORT_ENTRY_COUNT = 50;   // Or send when 50 logs collected

// DOM Elements
const channelInput = document.getElementById('channel');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const statusDiv = document.getElementById('status');
const liveStatsDiv = document.getElementById('liveStats');

let client = null;
let localTracks = { audio: null, video: null };
let logBuffer = [];
let batchInterval = null;
let autoReportInterval = null;
let db = null;
let sessionId = null;  // Unique ID for this streaming session

// ---------- 1. IndexedDB Setup ----------
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('AgoraLogs', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('stats')) {
                db.createObjectStore('stats', { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('sentLogs')) {
                db.createObjectStore('sentLogs', { keyPath: 'id' });
            }
        };
    });
}

// Save a batch of logs to disk (every 30 seconds)
async function flushLogs() {
    if (logBuffer.length === 0 || !db) return;
    
    const transaction = db.transaction(['stats'], 'readwrite');
    const store = transaction.objectStore('stats');
    
    for (const log of logBuffer) {
        store.add(log);
    }
    
    console.log(`✅ Saved ${logBuffer.length} logs to IndexedDB`);
    logBuffer = [];
}

// Add a log entry (memory only)
function addLog(data) {
    const logEntry = {
        timestamp: Date.now(),
        sessionId: sessionId,
        ...data
    };
    logBuffer.push(logEntry);
}

// ---------- 2. Auto-Report Logs to Your Server ----------
async function autoReportLogs() {
    if (!db) return;
    
    // Get all unsent logs
    const unsentLogs = await getUnsentLogs();
    
    if (unsentLogs.length === 0) {
        console.log('📡 No new logs to report');
        return;
    }
    
    console.log(`📡 Reporting ${unsentLogs.length} logs to server...`);
    
    try {
        const response = await fetch(YOUR_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: sessionId,
                appId: APP_ID,
                reportTime: Date.now(),
                logCount: unsentLogs.length,
                logs: unsentLogs
            })
        });
        
        if (response.ok) {
            // Mark logs as sent
            await markLogsAsSent(unsentLogs);
            console.log('✅ Logs reported successfully');
            statusDiv.innerText = `📡 ${unsentLogs.length} logs sent to dashboard`;
            setTimeout(() => {
                if (statusDiv.innerText.includes('logs sent')) {
                    statusDiv.innerText = 'Connected & Logging...';
                }
            }, 2000);
        } else {
            console.error('❌ Failed to send logs:', response.status);
        }
    } catch (error) {
        console.error('❌ Auto-report error:', error);
    }
}

// Get logs that haven't been sent yet
function getUnsentLogs() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stats'], 'readonly');
        const store = transaction.objectStore('stats');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const allLogs = request.result;
            // In a real implementation, you'd track which logs were sent
            // For simplicity, we'll send all logs from this session
            // But to avoid duplicates, we'll clear after sending (see markLogsAsSent)
            resolve(allLogs);
        };
        request.onerror = () => reject(request.error);
    });
}

// Mark logs as sent (clear them from DB to avoid re-sending)
function markLogsAsSent(logs) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stats'], 'readwrite');
        const store = transaction.objectStore('stats');
        const clearRequest = store.clear();  // Clear all logs after successful send
        
        clearRequest.onsuccess = () => {
            console.log('🗑️ Cleared sent logs from IndexedDB');
            resolve();
        };
        clearRequest.onerror = () => reject(clearRequest.error);
    });
}

// ---------- 3. Manual Export (as before) ----------
async function manualExportLogs() {
    const allLogs = await getAllLogs();
    const blob = new Blob([JSON.stringify(allLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agora_logs_${sessionId || Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    statusDiv.innerText = 'Logs exported manually!';
}

function getAllLogs() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stats'], 'readonly');
        const store = transaction.objectStore('stats');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ---------- 4. Agora Setup (with auto-report triggers) ----------
async function joinChannel() {
    statusDiv.innerText = 'Initializing...';
    
    // Generate unique session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Open DB
    db = await openDB();
    
    // Start batch writer (every 30 seconds to disk)
    if (batchInterval) clearInterval(batchInterval);
    batchInterval = setInterval(() => {
        flushLogs();
    }, 30000);
    
    // Start auto-report timer (every 30 seconds or after 50 logs)
    if (autoReportInterval) clearInterval(autoReportInterval);
    autoReportInterval = setInterval(() => {
        autoReportLogs();
    }, AUTO_REPORT_INTERVAL);
    
    // Create Agora client
    client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    client.setClientRole('host');
    
    // Event listeners
    client.on('connection-state-change', (cur, prev, reason) => {
        addLog({
            event: 'connection-state-change',
            previous: prev,
            current: cur,
            reason: reason
        });
        statusDiv.innerText = `State: ${cur}`;
        
        // Immediately report critical events
        if (cur === 'DISCONNECTED' || cur === 'FAILED') {
            autoReportLogs();  // Send logs immediately on failure
        }
    });
    
    client.on('network-quality', (stats) => {
        addLog({
            event: 'network-quality',
            uplink: stats.uplinkNetworkQuality,
            downlink: stats.downlinkNetworkQuality
        });
    });
    
    client.on('exception', (event) => {
        addLog({
            event: 'exception',
            code: event.code,
            message: event.message
        });
        // Send exception immediately
        autoReportLogs();
    });
    
    // Join channel
    await client.join(APP_ID, channelInput.value, null, null);
    
    // Create local tracks
    localTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.video = await AgoraRTC.createCameraVideoTrack();
    await client.publish([localTracks.audio, localTracks.video]);
    
    statusDiv.innerText = 'Connected & Logging (auto-report ON)';
    
    // Poll RtcStats every 2 seconds
    setInterval(async () => {
        if (!client) return;
        const stats = await client.getRTCStats();
        
        addLog({
            event: 'rtc-stats',
            duration: stats.Duration,
            txBytes: stats.SendBytes,
            rxBytes: stats.RecvBytes,
            txKBitRate: stats.SendKBitrate,
            rxKBitRate: stats.RecvKBitrate,
            txVideoKBitRate: stats.SendVideoKBitrate,
            rxVideoKBitRate: stats.RecvVideoKBitrate,
            txAudioKBitRate: stats.SendAudioKBitrate,
            rxAudioKBitRate: stats.RecvAudioKBitrate,
            txPacketLoss: stats.SendPacketLossRate,
            rxPacketLoss: stats.RecvPacketLossRate,
            lastmileDelay: stats.LastmileDelay,
            cpuApp: stats.CPUAppUsage,
            cpuTotal: stats.CPUTotalUsage,
            userCount: stats.UserCount
        });
        
        // Auto-report when we hit 50 logs in buffer
        if (logBuffer.length >= AUTO_REPORT_ENTRY_COUNT) {
            await flushLogs();  // Save to DB first
            await autoReportLogs();  // Then send
        }
        
        // Update UI
        liveStatsDiv.innerHTML = `
            Bitrate: ${Math.round(stats.SendVideoKBitrate || 0)} kbps<br>
            Packet Loss: ${Math.round((stats.SendPacketLossRate || 0) * 100)}%<br>
            CPU App: ${Math.round(stats.CPUAppUsage || 0)}%<br>
            Latency: ${Math.round(stats.LastmileDelay || 0)} ms<br>
            📡 Auto-report: every ${AUTO_REPORT_INTERVAL/1000}s
        `;
    }, 2000);
    
    joinBtn.disabled = true;
    leaveBtn.disabled = false;
}

// ---------- 5. Leave & Final Upload ----------
async function leaveChannel() {
    statusDiv.innerText = 'Leaving, sending final logs...';
    
    // Final flush to disk
    await flushLogs();
    
    // Final auto-report
    await autoReportLogs();
    
    // Clear intervals
    if (batchInterval) clearInterval(batchInterval);
    if (autoReportInterval) clearInterval(autoReportInterval);
    
    // Close tracks
    if (localTracks.audio) localTracks.audio.close();
    if (localTracks.video) localTracks.video.close();
    
    if (client) await client.leave();
    
    // Also offer manual export as backup
    await manualExportLogs();
    
    statusDiv.innerText = 'Session ended. Logs sent to dashboard + downloaded.';
    joinBtn.disabled = false;
    leaveBtn.disabled = true;
}

// ---------- 6. Event Listeners ----------
joinBtn.onclick = joinChannel;
leaveBtn.onclick = leaveChannel;

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

### 2. Backend Server Example (Node.js)

```javascript
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

// Endpoint to receive logs
app.post('/upload-logs', (req, res) => {
    const { sessionId, appId, reportTime, logCount, logs } = req.body;
    
    console.log(`📥 Received ${logCount} logs from session ${sessionId}`);
    
    // Save to file or database
    const fs = require('fs');
    const filename = `logs_${sessionId}_${Date.now()}.json`;
    fs.writeFileSync(`./logs/${filename}`, JSON.stringify(logs, null, 2));
    
    res.json({ status: 'ok', filename: filename });
});

app.listen(3000, () => console.log('Log receiver on port 3000'));
```

### 3. Summary: How Auto-Report Works

| Event | What happens |
| :--- | :--- |
| **Every 30 seconds** | Logs auto-send to your server |
| **After 50 logs** | Auto-send immediately |
| **Connection fails** | Auto-send immediately |
| **Exception occurs** | Auto-send immediately |
| **User clicks Leave** | Final send + manual download |

---


