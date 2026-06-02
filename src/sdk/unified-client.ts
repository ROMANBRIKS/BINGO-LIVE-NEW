/**
 * Unified Streaming Client - Smart orchestrator that transparently handles
 * routing to either our high-performance custom WebRTC P2P/SFU SDK OR Agora Live CDN Overflow
 */

import { UnifiedStreamingSDK } from './index';
import AgoraRTC, { IAgoraRTCClient, ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';

export type IntegrationMode = 'your-sdk' | 'agora';

export interface StreamConfigResponse {
  type: IntegrationMode;
  config: {
    signalingUrl?: string;
    roomId?: string;
    userId?: string;
    appId?: string;
    token?: string;
    channel?: string;
    uid?: number;
  };
}

export class UnifiedStreamingClient {
  public mode: IntegrationMode | null = null;
  public customClient: UnifiedStreamingSDK | null = null;
  public agoraClient: IAgoraRTCClient | null = null;
  public onNetworkRestriction: ((warning: { type: string; title: string; message: string; advice: string }) => void) | null = null;
  
  private agoraVideoTrack: ILocalVideoTrack | null = null;
  private agoraAudioTrack: ILocalAudioTrack | null = null;

  constructor() {}

  async startStream(userId: string, channelName: string, options: { video?: boolean; audio?: boolean; isHost?: boolean } = {}) {
    const isHost = options.isHost !== false;

    // Step 1: Ask backend where to route this livestream request
    try {
      const response = await fetch('/api/request-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, channelName, isHost })
      });

      if (!response.ok) {
        throw new Error(`Failed to request stream config: ${response.statusText}`);
      }

      const data: StreamConfigResponse = await response.json();
      this.mode = data.type;

      console.log(`📡 [UnifiedStreamingClient] Routing feed to: ${this.mode.toUpperCase()}`);

      if (this.mode === 'your-sdk') {
        // Step 2a: Initialize and join room using our custom Real-Time WebRTC SDK
        this.customClient = new UnifiedStreamingSDK({
          signalingUrl: data.config.signalingUrl,
          agoraAppId: data.config.appId
        });

        // Set restriction callback
        this.customClient.onNetworkRestriction = (warning) => {
          if (this.onNetworkRestriction) this.onNetworkRestriction(warning);
        };

        await this.customClient.init(userId, {
          video: options.video,
          audio: options.audio,
          isHost
        });

        await this.customClient.joinRoom(channelName);
        return {
          mode: this.mode,
          stream: this.customClient.localStream,
          client: this.customClient
        };
      } else {
        // Step 2b: Use Agora Live Video/Voice CDN as the resilient high-scale overflow fallback
        this.agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        await this.agoraClient.setClientRole(isHost ? 'host' : 'audience');

        await this.agoraClient.join(
          data.config.appId || '',
          data.config.channel || channelName,
          data.config.token || null,
          data.config.uid || 0
        );

        let localStream: MediaStream | null = null;

        if (isHost) {
          // Setup media tracks
          this.agoraAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          
          try {
            this.agoraVideoTrack = await AgoraRTC.createCameraVideoTrack({
              encoderConfig: '720p_1'
            });
          } catch (trackErr) {
            console.warn('[UnifiedStreamingClient] Cam access denied. Creating custom color canvas track.');
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#1c1c1e';
              ctx.fillRect(0, 0, 640, 480);
            }
            const canvasTrack = (canvas as any).captureStream ? (canvas as any).captureStream(15).getVideoTracks()[0] : null;
            if (canvasTrack) {
              this.agoraVideoTrack = await AgoraRTC.createCustomVideoTrack({
                mediaStreamTrack: canvasTrack
              });
            }
          }

          const tracksToPublish = [];
          if (this.agoraAudioTrack) tracksToPublish.push(this.agoraAudioTrack);
          if (this.agoraVideoTrack) tracksToPublish.push(this.agoraVideoTrack);

          if (tracksToPublish.length > 0) {
            await this.agoraClient.publish(tracksToPublish);
          }

          // Build standard modern MediaStream for preview compatibility
          localStream = new MediaStream();
          if (this.agoraVideoTrack) {
            localStream.addTrack(this.agoraVideoTrack.getMediaStreamTrack());
          }
          if (this.agoraAudioTrack) {
            localStream.addTrack(this.agoraAudioTrack.getMediaStreamTrack());
          }
        }

        return {
          mode: this.mode,
          stream: localStream,
          client: this.agoraClient
        };
      }
    } catch (err) {
      console.error('[UnifiedStreamingClient] Stream setup routing failed:', err);
      // Clean fallback so UI doesn't crash on network or connection errors
      this.mode = 'your-sdk';
      this.customClient = new UnifiedStreamingSDK();
      
      // Set restriction callback
      this.customClient.onNetworkRestriction = (warning) => {
        if (this.onNetworkRestriction) this.onNetworkRestriction(warning);
      };

      const localStream = await this.customClient.init(userId, { video: options.video, audio: options.audio, isHost });
      await this.customClient.joinRoom(channelName);
      return {
        mode: this.mode,
        stream: localStream,
        client: this.customClient
      };
    }
  }

  async stopStream() {
    console.log(`🔌 [UnifiedStreamingClient] Stopping stream and releasing allocation...`);

    if (this.mode === 'your-sdk' && this.customClient) {
      this.customClient.destroy();
      this.customClient = null;
    } else if (this.mode === 'agora' && this.agoraClient) {
      if (this.agoraAudioTrack) {
        this.agoraAudioTrack.close();
        this.agoraAudioTrack = null;
      }
      if (this.agoraVideoTrack) {
        this.agoraVideoTrack.close();
        this.agoraVideoTrack = null;
      }
      try {
        await this.agoraClient.leave();
      } catch (e) {}
      this.agoraClient = null;
    }

    // Call backend endpoint to decrement loading metrics
    try {
      await fetch('/api/leave-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: this.mode })
      });
    } catch (e) {
      console.warn('[UnifiedStreamingClient] Failed to notify leave-stream release endpoint:', e);
    }

    this.mode = null;
  }
}
