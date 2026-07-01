/**
 * Unified Streaming SDK
 * Handles: Native P2P, Multi-party adaptation, adaptive bitrate, CPU monitoring, and Agora fallback
 */

import { DeviceMonitor } from './device-monitor';
import { AdaptiveEngine, QualityProfile } from './adaptive-engine';
import { SignalingClient } from './signaling-client';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { getAgoraAudioTrackInitOptions } from '../lib/audioConfig';

export interface TURNConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface StreamingSDKConfig {
  signalingUrl?: string;
  maxPeersBeforeSFU?: number;
  adaptiveBitrate?: boolean;
  cpuThreshold?: number;
  fallbackToAgora?: boolean;
  agoraAppId?: string;
  turnServers?: TURNConfig[];
}

export interface PeerState {
  connection: RTCPeerConnection;
  stream: MediaStream | null;
  quality: QualityProfile;
}

export class UnifiedStreamingSDK {
  public config: Required<StreamingSDKConfig>;
  
  // State
  public roomId: string | null = null;
  public userId: string | null = null;
  public isHost = false;
  public peers: Map<string, PeerState> = new Map(); // userId -> { connection, stream, quality }
  public localStream: MediaStream | null = null;
  public useSFU = false;
  public fallbackActive = false;
  
  // Clients & Engines
  public socket: SignalingClient | null = null;
  private agoraClient: IAgoraRTCClient | null = null;
  private agoraAudioTrack: IMicrophoneAudioTrack | null = null;
  private agoraVideoTrack: ILocalVideoTrack | null = null;
  
  public deviceMonitor: DeviceMonitor;
  public adaptiveEngine: AdaptiveEngine | null = null;
  
  // Wi-Fi restricted diagnostics tracking
  private diagnosticTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Callbacks
  public onRemoteStream: ((userId: string, stream: MediaStream) => void) | null = null;
  public onUserJoined: ((userId: string) => void) | null = null;
  public onUserLeft: ((userId: string) => void) | null = null;
  public onError: ((err: any) => void) | null = null;
  public onMetrics: ((metrics: { isFallback: boolean; reason: string }) => void) | null = null;
  public onNetworkRestriction: ((warning: { type: string; title: string; message: string; advice: string }) => void) | null = null;

  constructor(config: StreamingSDKConfig = {}) {
    this.config = {
      signalingUrl: config.signalingUrl || 'ws://localhost:3000',
      maxPeersBeforeSFU: config.maxPeersBeforeSFU || 3,
      adaptiveBitrate: config.adaptiveBitrate !== false,
      cpuThreshold: config.cpuThreshold || 70,
      fallbackToAgora: config.fallbackToAgora !== false,
      agoraAppId: config.agoraAppId || '1234567890abcdef',
      turnServers: config.turnServers || []
    };
    
    this.deviceMonitor = new DeviceMonitor();
  }

  // ---------- Public API ----------
  
  async init(userId: string, options: { audio?: boolean; video?: boolean; isHost?: boolean } = {}) {
    this.userId = userId;
    this.isHost = options.isHost || false;
    
    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio !== false,
        video: options.video !== false ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      });
    } catch (e) {
      console.warn('[UnifiedStreamingSDK] Media devices failed, starting simulated local stream.', e);
      // Fallback: create canvas stream for safe browser environment representation
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1c1c1e';
        ctx.fillRect(0, 0, 640, 480);
      }
      this.localStream = (canvas as any).captureStream ? (canvas as any).captureStream(15) : new MediaStream();
    }
    
    // Start device monitoring
    this.deviceMonitor.start();
    this.deviceMonitor.on('cpuHigh', (cpuUsage) => {
      if (this.adaptiveEngine) {
        this.adaptiveEngine.downgradeQuality();
      }
    });
    
    // Initialize adaptive engine
    if (this.localStream) {
      this.adaptiveEngine = new AdaptiveEngine(this.localStream, this.deviceMonitor);
    }
    
    // Connect signaling client
    this.socket = new SignalingClient(this.config.signalingUrl);
    await this.socket.connect(userId);
    
    // Hook signaling message feeds
    this.socket.on('user-joined', (data) => this.handleUserJoined(data));
    this.socket.on('user-left', (data) => this.handleUserLeft(data));
    this.socket.on('offer', (data) => this.handleOffer(data));
    this.socket.on('answer', (data) => this.handleAnswer(data));
    this.socket.on('ice-candidate', (data) => this.handleIceCandidate(data));
    
    return this.localStream;
  }

  async joinRoom(roomId: string) {
    this.roomId = roomId;
    if (this.socket) {
      this.socket.emit('join', {
        roomId: this.roomId,
        userId: this.userId,
        isHost: this.isHost
      });
    }
  }

  async leaveRoom() {
    // Clear any diagnostic timers
    this.diagnosticTimers.forEach((timer) => clearTimeout(timer));
    this.diagnosticTimers.clear();

    // Close peer connections
    this.peers.forEach((peer) => {
      if (peer.connection) {
        try {
          peer.connection.close();
        } catch (e) {}
      }
    });
    this.peers.clear();
    
    // Leave Agora fallback if active
    if (this.fallbackActive) {
      await this.deactivateAgoraFallback();
    }
    
    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
    }
    
    if (this.socket && this.roomId && this.userId) {
      this.socket.emit('leave', {
        roomId: this.roomId,
        userId: this.userId
      });
    }
    
    this.roomId = null;
  }

  destroy() {
    this.leaveRoom();
    this.deviceMonitor.stop();
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // ---------- Peer Connection (Direct Real-Time WebRTC P2P Mode) ----------

  async createPeerConnection(remoteUserId: string, isInitiator: boolean) {
    if (this.useSFU) return null; // Resilient SFU routing

    const turnIce = this.config.turnServers.map(turn => ({
      urls: turn.urls,
      username: turn.username,
      credential: turn.credential
    }));

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        ...turnIce
      ]
    });

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          pc.addTrack(track, this.localStream);
        }
      });
    }

    // Ice Candidate gather
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket && this.roomId) {
        this.socket.emit('signal', {
          to: remoteUserId,
          from: this.userId,
          roomId: this.roomId,
          signal: event.candidate.toJSON()
        });
      }
    };

    // Receive Remote Track
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        const peer = this.peers.get(remoteUserId);
        if (peer) {
          peer.stream = remoteStream;
        }
        if (this.onRemoteStream) {
          this.onRemoteStream(remoteUserId, remoteStream);
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === 'connected' || state === 'completed') {
        const timer = this.diagnosticTimers.get(remoteUserId);
        if (timer) {
          clearTimeout(timer);
          this.diagnosticTimers.delete(remoteUserId);
        }
      }
      if (state === 'failed' || state === 'disconnected') {
        const timer = this.diagnosticTimers.get(remoteUserId);
        if (timer) {
          clearTimeout(timer);
          this.diagnosticTimers.delete(remoteUserId);
        }
        this.triggerNetworkRestrictionWarning();
        this.handlePeerFailure(remoteUserId);
      }
    };

    this.peers.set(remoteUserId, {
      connection: pc,
      stream: null,
      quality: 'high'
    });

    // Start diagnostic timer for restricted corporate/school Wi-Fi networks (UDP Port blocking)
    const iceCheckTimeout = setTimeout(() => {
      const currentPC = this.peers.get(remoteUserId)?.connection;
      if (currentPC && currentPC.iceConnectionState !== 'connected' && currentPC.iceConnectionState !== 'completed') {
        console.warn(`⚠️ [WebRTC Network Diagnostic] Peer Connection with ${remoteUserId} took too long to establish. Likely UDP/STUN/TURN block on corporate/school firewall.`);
        this.triggerNetworkRestrictionWarning();
      }
    }, 12000); // 12 seconds check
    this.diagnosticTimers.set(remoteUserId, iceCheckTimeout);

    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (this.socket && this.roomId) {
          this.socket.emit('signal', {
            to: remoteUserId,
            from: this.userId,
            roomId: this.roomId,
            signal: offer
          });
        }
      } catch (e) {
        console.error('[UnifiedStreamingSDK] Failed to create P2P offer:', e);
      }
    }

    return pc;
  }

  handleUserJoined(data: { userId: string }) {
    const { userId } = data;
    if (userId === this.userId) return;

    const currentPeerCount = this.peers.size;
    if (currentPeerCount + 1 >= this.config.maxPeersBeforeSFU && !this.useSFU) {
      console.log(`⚠️ Switch limit reached (${currentPeerCount + 1} users). Activating production Fallback structure...`);
      this.activateAgoraFallback('Multi-party limit crossed').catch(e => {
        console.error('Fallback switch issue:', e);
      });
      return;
    }

    if (this.onUserJoined) {
      this.onUserJoined(userId);
    }

    this.createPeerConnection(userId, true);
  }

  handleUserLeft(data: { userId: string }) {
    const { userId } = data;
    const timer = this.diagnosticTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.diagnosticTimers.delete(userId);
    }

    const peer = this.peers.get(userId);
    if (peer) {
      try {
        peer.connection.close();
      } catch (e) {}
      this.peers.delete(userId);
    }
    if (this.onUserLeft) {
      this.onUserLeft(userId);
    }
  }

  public triggerNetworkRestrictionWarning() {
    if (this.onNetworkRestriction) {
      this.onNetworkRestriction({
        type: 'restricted-wifi',
        title: 'Restricted Network Detected (Corporate / School Wi-Fi)',
        message: 'Your current streaming connection is being blocked, throttled, or repeatedly interrupted. School and corporate networks frequently block live WebRTC ports.',
        advice: 'Please toggle off Wi-Fi and switch to Cellular Mobile Data (4G/5G) or private Home Wi-Fi for an uninterrupted stream.'
      });
    }
  }

  async handleOffer(data: { from: string; signal: any }) {
    const { from, signal } = data;
    let peer = this.peers.get(from);
    if (!peer) {
      const pc = await this.createPeerConnection(from, false);
      if (!pc) return;
      peer = this.peers.get(from)!;
    }

    try {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);

      if (this.socket && this.roomId) {
        this.socket.emit('signal', {
          to: from,
          from: this.userId,
          roomId: this.roomId,
          signal: answer
        });
      }
    } catch (e) {
      console.error('[UnifiedStreamingSDK] Remote offer handling error:', e);
    }
  }

  async handleAnswer(data: { from: string; signal: any }) {
    const { from, signal } = data;
    const peer = this.peers.get(from);
    if (peer) {
      try {
        await peer.connection.setRemoteDescription(new RTCSessionDescription(signal));
      } catch (e) {
        console.error('[UnifiedStreamingSDK] Remote answer set explanation error:', e);
      }
    }
  }

  async handleIceCandidate(data: { from: string; signal: any }) {
    const { from, signal } = data;
    const peer = this.peers.get(from);
    if (peer) {
      try {
        await peer.connection.addIceCandidate(new RTCIceCandidate(signal));
      } catch (e) {
        // Safe console silent warning on ICE lifecycle
      }
    }
  }

  // ---------- Fallback to High-Definition Agora ----------

  async handlePeerFailure(remoteUserId: string) {
    console.log(`⚠️ [WebRTC] Connection failed with ${remoteUserId}. Initiating Agora dynamic fallbacks.`);
    if (!this.fallbackActive) {
      await this.activateAgoraFallback('Connection quality loss');
    }
  }

  async activateAgoraFallback(reason: string) {
    if (!this.config.fallbackToAgora) return;
    if (this.fallbackActive) return;

    this.fallbackActive = true;
    console.log(`🔄 [UnifiedStreamingSDK] Fallback Activated: ${reason}`);

    // Clean standard P2P instances
    this.peers.forEach((peer) => {
      try {
        peer.connection.close();
      } catch (e) {}
    });
    this.peers.clear();

    try {
      this.agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      await this.agoraClient.setClientRole(this.isHost ? 'host' : 'audience');

      // Configure publisher fallbacks for the streamer
      try {
        if (this.isHost) {
          await this.agoraClient.enableDualStream();
          // Configures uplink fallback: fall back to publishing audio-only under poor internet uplink
          await (this.agoraClient as any).setLocalPublishFallbackOption(1);
          console.log('[UnifiedStreamingSDK] Configured dual-stream publishing and uplink audio fallback for Host.');
        }
      } catch (err) {
        console.warn('[UnifiedStreamingSDK] Failed to configure broadcaster fallback: ', err);
      }

      // Connect to Agora Channel
      await this.agoraClient.join(
        this.config.agoraAppId,
        this.roomId || 'default_room',
        null,
        this.userId || `user_${Date.now()}`
      );

      // Publish Host stream
      if (this.isHost && this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0];
        const videoTrack = this.localStream.getVideoTracks()[0];

        if (audioTrack) {
          this.agoraAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(getAgoraAudioTrackInitOptions());
        }
        if (videoTrack) {
          this.agoraVideoTrack = await AgoraRTC.createCustomVideoTrack({
            mediaStreamTrack: videoTrack
          });
        }

        const publishTracks = [];
        if (this.agoraAudioTrack) publishTracks.push(this.agoraAudioTrack);
        if (this.agoraVideoTrack) publishTracks.push(this.agoraVideoTrack);

        if (publishTracks.length > 0) {
          await this.agoraClient.publish(publishTracks as any);
        }
      }

      // Live Subscribing stream feeds
      this.agoraClient.on('user-published', async (user, mediaType) => {
        if (this.agoraClient) {
          await this.agoraClient.subscribe(user, mediaType);

          // Configure stream fallback of subscribed remote user: prioritizes clean audio over video chunk drops
          try {
            await this.agoraClient.setStreamFallbackOption(user.uid, 2);
            console.log(`[UnifiedStreamingSDK] Configured audio-priority downlink fallback for user ${user.uid}`);
          } catch (err) {
            console.warn('[UnifiedStreamingSDK] Failed to set receiver fallback option for user:', user.uid, err);
          }

          if (mediaType === 'video' && this.onRemoteStream && user.videoTrack) {
            const remoteStream = new MediaStream();
            const nativeVideoTrack = (user.videoTrack as any)._track || user.videoTrack.getMediaStreamTrack();
            if (nativeVideoTrack) {
              remoteStream.addTrack(nativeVideoTrack);
              this.onRemoteStream(user.uid as string, remoteStream);
            }
          }
        }
      });

      if (this.onMetrics) {
        this.onMetrics({ isFallback: true, reason });
      }
    } catch (e) {
      console.error('[UnifiedStreamingSDK] Failed to init target fallback:', e);
    }
  }

  async deactivateAgoraFallback() {
    if (!this.fallbackActive) return;

    try {
      if (this.agoraAudioTrack) {
        this.agoraAudioTrack.close();
        this.agoraAudioTrack = null;
      }
      if (this.agoraVideoTrack) {
        this.agoraVideoTrack.close();
        this.agoraVideoTrack = null;
      }
      if (this.agoraClient) {
        await this.agoraClient.leave();
        this.agoraClient = null;
      }
    } catch (e) {
      console.warn('Deactivate warning:', e);
    }

    this.fallbackActive = false;
  }
}
