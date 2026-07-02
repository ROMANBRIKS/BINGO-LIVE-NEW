export interface StreamHealthData {
  bitrate: number; // kbps
  latency: number; // ms
  fps: number;
  droppedFrames: number;
  totalFrames: number;
  resolution: string;
  connectionType: string;
  signalStrength: number; // 0-100
  audioLevel: number; // 0-1
  errors: StreamError[];
  timestamp: number;
}

export interface StreamError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export class StreamHealthMonitor {
  private peerConnection: RTCPeerConnection | null = null;
  private mediaStream: MediaStream | null = null;
  private intervalId: any = null;
  private listeners: ((data: StreamHealthData) => void)[] = [];
  private errors: StreamError[] = [];
  private frameCount = 0;
  private droppedCount = 0;
  private startTime = Date.now();

  constructor(peerConnection: RTCPeerConnection | null = null) {
    this.peerConnection = peerConnection;
  }

  setPeerConnection(peerConnection: RTCPeerConnection) {
    this.peerConnection = peerConnection;
  }

  setMediaStream(stream: MediaStream) {
    this.mediaStream = stream;
  }

  startMonitoring(intervalMs: number = 2000) {
    if (this.intervalId) return;

    this.startTime = Date.now();
    this.intervalId = setInterval(async () => {
      const healthData = await this.collectHealthData();
      this.notifyListeners(healthData);
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onHealthData(callback: (data: StreamHealthData) => void) {
    this.listeners.push(callback);
  }

  private async collectHealthData(): Promise<StreamHealthData> {
    const bitrate = await this.getBitrate();
    const latency = await this.getLatency();
    const fps = this.getFPS();
    const resolution = this.getResolution();
    const connectionType = this.getConnectionType();
    const signalStrength = this.getSignalStrength();
    const audioLevel = this.getAudioLevel();

    // Check for errors
    this.checkForErrors(bitrate, latency, fps);

    return {
      bitrate,
      latency,
      fps,
      droppedFrames: this.droppedCount,
      totalFrames: this.frameCount,
      resolution,
      connectionType,
      signalStrength,
      audioLevel,
      errors: [...this.errors],
      timestamp: Date.now()
    };
  }

  private async getBitrate(): Promise<number> {
    if (!this.peerConnection) return 0;

    try {
      const stats = await this.peerConnection.getStats();
      let totalBytes = 0;
      let totalDuration = 0;

      stats.forEach((report: any) => {
        if (report.type === 'outbound-rtp' && report.bytesSent) {
          totalBytes += report.bytesSent;
          if (report.timestamp) {
            const duration = (Date.now() - this.startTime) / 1000;
            totalDuration = duration;
          }
        }
      });

      if (totalDuration > 0) {
        return Math.round((totalBytes * 8) / (totalDuration * 1000)); // kbps
      }
    } catch (e) {
      // Ignore
    }

    return 0;
  }

  private async getLatency(): Promise<number> {
    if (!this.peerConnection) return 0;

    try {
      const stats = await this.peerConnection.getStats();
      let rtt = 0;

      stats.forEach((report: any) => {
        if (report.type === 'candidate-pair' && report.currentRoundTripTime) {
          rtt = Math.round(report.currentRoundTripTime * 1000); // ms
        }
      });

      return rtt;
    } catch (e) {
      return 0;
    }
  }

  private getFPS(): number {
    if (!this.mediaStream) return 0;

    try {
      const videoTracks = this.mediaStream.getVideoTracks();
      if (videoTracks.length === 0) return 0;

      const settings = videoTracks[0].getSettings();
      const frameRate = settings.frameRate || 0;

      // Simulate frame counting if not available
      if (!frameRate) {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return Math.round(this.frameCount / elapsed);
      }

      return Math.round(frameRate);
    } catch (e) {
      return 0;
    }
  }

  private getResolution(): string {
    if (!this.mediaStream) return '0x0';

    try {
      const videoTracks = this.mediaStream.getVideoTracks();
      if (videoTracks.length === 0) return '0x0';

      const settings = videoTracks[0].getSettings();
      const width = settings.width || 0;
      const height = settings.height || 0;

      return `${width}x${height}`;
    } catch (e) {
      return '0x0';
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection;
    if (!connection) return 'unknown';

    return connection.effectiveType || 'unknown';
  }

  private getSignalStrength(): number {
    // Simulate signal strength based on connection type
    const connection = (navigator as any).connection;
    if (!connection) return 70;

    const type = connection.effectiveType;
    switch (type) {
      case '4g': return 80 + Math.random() * 20;
      case '3g': return 50 + Math.random() * 30;
      case '2g': return 20 + Math.random() * 30;
      case 'wifi': return 70 + Math.random() * 30;
      default: return 50 + Math.random() * 40;
    }
  }

  private getAudioLevel(): number {
    if (!this.mediaStream) return 0;

    try {
      const audioTracks = this.mediaStream.getAudioTracks();
      if (audioTracks.length === 0) return 0;

      // Simulate audio level
      return 0.3 + Math.random() * 0.5;
    } catch (e) {
      return 0;
    }
  }

  private checkForErrors(bitrate: number, latency: number, fps: number) {
    // Check bitrate
    if (bitrate > 0 && bitrate < 100) {
      this.addError({
        code: 'LOW_BITRATE',
        message: `Bitrate too low: ${bitrate} kbps`,
        severity: 'high',
        timestamp: Date.now()
      });
    } else if (bitrate > 0 && bitrate < 300) {
      this.addError({
        code: 'LOW_BITRATE_WARNING',
        message: `Low bitrate: ${bitrate} kbps`,
        severity: 'medium',
        timestamp: Date.now()
      });
    }

    // Check latency
    if (latency > 500) {
      this.addError({
        code: 'HIGH_LATENCY',
        message: `High latency: ${latency} ms`,
        severity: 'high',
        timestamp: Date.now()
      });
    } else if (latency > 200) {
      this.addError({
        code: 'HIGH_LATENCY_WARNING',
        message: `Latency elevated: ${latency} ms`,
        severity: 'medium',
        timestamp: Date.now()
      });
    }

    // Check FPS
    if (fps > 0 && fps < 15) {
      this.addError({
        code: 'LOW_FPS',
        message: `Low frame rate: ${fps} FPS`,
        severity: 'high',
        timestamp: Date.now()
      });
    } else if (fps > 0 && fps < 24) {
      this.addError({
        code: 'LOW_FPS_WARNING',
        message: `Low frame rate: ${fps} FPS`,
        severity: 'medium',
        timestamp: Date.now()
      });
    }

    // Check dropped frames percentage
    if (this.frameCount > 0) {
      const droppedPercent = (this.droppedCount / this.frameCount) * 100;
      if (droppedPercent > 10) {
        this.addError({
          code: 'HIGH_DROPPED_FRAMES',
          message: `Dropped ${droppedPercent.toFixed(1)}% of frames`,
          severity: 'critical',
          timestamp: Date.now()
        });
      } else if (droppedPercent > 5) {
        this.addError({
          code: 'HIGH_DROPPED_FRAMES_WARNING',
          message: `Dropped ${droppedPercent.toFixed(1)}% of frames`,
          severity: 'medium',
          timestamp: Date.now()
        });
      }
    }
  }

  private addError(error: StreamError) {
    // Don't duplicate same error within 10 seconds
    const lastError = this.errors[this.errors.length - 1];
    if (lastError && lastError.code === error.code && Date.now() - lastError.timestamp < 10000) {
      return;
    }

    this.errors.push(error);
    if (this.errors.length > 50) {
      this.errors.shift();
    }
  }

  private notifyListeners(data: StreamHealthData) {
    this.listeners.forEach(callback => callback(data));
  }

  // Simulate frame data (call this on each frame)
  trackFrame(dropped: boolean = false) {
    this.frameCount++;
    if (dropped) {
      this.droppedCount++;
    }
  }

  clearErrors() {
    this.errors = [];
  }
}

// Singleton instance
let healthMonitorInstance: StreamHealthMonitor | null = null;

export const getStreamHealthMonitor = (): StreamHealthMonitor => {
  if (!healthMonitorInstance) {
    healthMonitorInstance = new StreamHealthMonitor();
  }
  return healthMonitorInstance;
};
