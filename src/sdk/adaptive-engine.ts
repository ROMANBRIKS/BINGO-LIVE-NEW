import { DeviceMonitor } from './device-monitor';

export type QualityProfile = 'high' | 'medium' | 'low' | 'veryLow';

export interface QualitySetting {
  width: number;
  height: number;
  bitrate: number; // kbps
  framerate: number;
}

export class AdaptiveEngine {
  private localStream: MediaStream;
  private deviceMonitor: DeviceMonitor;
  public currentQuality: QualityProfile = 'high';
  private videoTrack: MediaStreamTrack | null = null;
  private sender: RTCRtpSender | null = null;

  private qualities: Record<QualityProfile, QualitySetting> = {
    high: { width: 1280, height: 720, bitrate: 1500, framerate: 30 },
    medium: { width: 640, height: 480, bitrate: 800, framerate: 24 },
    low: { width: 480, height: 360, bitrate: 400, framerate: 15 },
    veryLow: { width: 320, height: 240, bitrate: 200, framerate: 10 }
  };

  constructor(localStream: MediaStream, deviceMonitor: DeviceMonitor) {
    this.localStream = localStream;
    this.deviceMonitor = deviceMonitor;
    this.videoTrack = localStream.getVideoTracks()[0] || null;

    this.deviceMonitor.on('cpuHigh', () => this.downgradeQuality());
    this.deviceMonitor.on('networkPoor', (data: any) => {
      console.log('📶 [AdaptiveEngine] Streamer connection bottleneck detected. Adapting profile:', data);
      if (data && (data.reason === 'extremely-poor' || data.reason === 'saveData-enabled')) {
        this.setQuality('veryLow');
      } else {
        this.downgradeQuality();
      }
    });
    this.deviceMonitor.on('networkGood', (data: any) => {
      console.log('📶 [AdaptiveEngine] Streamer connection recovered. Boosting profile:', data);
      this.upgradeQuality();
    });
  }

  setSender(sender: RTCRtpSender) {
    this.sender = sender;
  }

  setVideoTrack(track: MediaStreamTrack) {
    this.videoTrack = track;
  }

  downgradeQuality() {
    const order: QualityProfile[] = ['high', 'medium', 'low', 'veryLow'];
    const currentIndex = order.indexOf(this.currentQuality);
    if (currentIndex < order.length - 1) {
      this.setQuality(order[currentIndex + 1]);
    }
  }

  upgradeQuality() {
    const order: QualityProfile[] = ['high', 'medium', 'low', 'veryLow'];
    const currentIndex = order.indexOf(this.currentQuality);
    if (currentIndex > 0) {
      this.setQuality(order[currentIndex - 1]);
    }
  }

  async setQuality(qualityName: QualityProfile) {
    const quality = this.qualities[qualityName];
    if (!quality) return;

    this.currentQuality = qualityName;
    console.log(`📊 [AdaptiveEngine] Switching to quality profile: ${qualityName}`, quality);

    // Apply constraints on video track
    if (this.videoTrack) {
      try {
        await this.videoTrack.applyConstraints({
          width: { ideal: quality.width },
          height: { ideal: quality.height },
          frameRate: { ideal: quality.framerate }
        });
      } catch (e) {
        console.warn(`[AdaptiveEngine] Failed to apply track constraints for ${qualityName}:`, e);
      }
    }

    // Apply bitrate to sender parameters (WebRTC)
    if (this.sender) {
      try {
        const params = this.sender.getParameters();
        if (params.encodings && params.encodings[0]) {
          params.encodings[0].maxBitrate = quality.bitrate * 1000;
          await this.sender.setParameters(params);
        }
      } catch (e) {
        console.warn(`[AdaptiveEngine] Failed to update sender bitrate for ${qualityName}:`, e);
      }
    }
  }
}
