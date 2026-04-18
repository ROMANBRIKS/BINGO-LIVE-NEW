import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  ILocalVideoTrack
} from "agora-rtc-sdk-ng";

const APP_ID = (import.meta as any).env.VITE_AGORA_APP_ID || "";

class StreamingService {
  private client: IAgoraRTCClient | null = null;
  private localVideoTrack: ICameraVideoTrack | ILocalVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }
  }

  /**
   * Initialize a broadcaster session
   */
  async startBroadcast(channelId: string, uid: string, customVideoTrack?: ILocalVideoTrack) {
    if (!this.client) return;
    if (!APP_ID) {
      console.warn("Agora App ID is missing. Streaming will work in mock mode.");
      return;
    }

    try {
      // For "Testing" mode on Agora, token can be null. 
      // In production, you should fetch a token from your server.
      await this.client.setClientRole("host");
      await this.client.join(APP_ID, channelId, null, uid);
      
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      
      if (customVideoTrack) {
        this.localVideoTrack = customVideoTrack;
      } else {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: "720p_1" // HD Quality
        });
      }

      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      return { videoTrack: this.localVideoTrack, audioTrack: this.localAudioTrack };
    } catch (error) {
      console.error("Agora Broadcast Error:", error);
      throw error;
    }
  }

  /**
   * Initialize an audience session to watch a stream
   */
  async joinAsAudience(channelId: string, uid: string, onUserPublished: (user: any, mediaType: "video" | "audio") => void) {
    if (!this.client) return;
    if (!APP_ID) return;

    try {
      this.client.on("user-published", onUserPublished);
      await this.client.join(APP_ID, channelId, null, uid);
    } catch (error) {
      console.error("Agora Join Error:", error);
      throw error;
    }
  }

  createCustomVideoTrack(mediaStreamTrack: MediaStreamTrack) {
    return AgoraRTC.createCustomVideoTrack({ mediaStreamTrack });
  }

  async leave() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    if (this.client) {
      await this.client.leave();
      this.client.removeAllListeners();
    }
  }

  public getClient() {
    return this.client;
  }
}

export const streamingService = new StreamingService();
