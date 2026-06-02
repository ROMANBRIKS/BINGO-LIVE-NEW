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
    console.warn("Agora broadcasting is currently suspended for local developer testing.");
    return { videoTrack: null, audioTrack: null };
  }

  /**
   * Initialize an audience session to watch a stream
   */
  async joinAsAudience(channelId: string, uid: string, onUserPublished: (user: any, mediaType: "video" | "audio") => void) {
    console.warn("Agora audience session is currently suspended for local developer testing.");
    return;
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
