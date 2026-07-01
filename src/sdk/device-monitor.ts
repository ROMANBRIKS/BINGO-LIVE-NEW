/**
 * Device Monitor
 * Monitors CPU load (via PerformanceObserver / Frame Drops), Battery levels, and Network speeds.
 */

export type DeviceEvent = 'cpuHigh' | 'batteryLow' | 'networkPoor' | 'networkGood';
export type DeviceCallback = (data: any) => void;

export class DeviceMonitor {
  private interval: NodeJS.Timeout | null = null;
  private callbacks: Record<DeviceEvent, DeviceCallback[]> = {
    cpuHigh: [],
    batteryLow: [],
    networkPoor: [],
    networkGood: []
  };
  private currentCpu = 0;
  private currentBattery = 100;
  private lastTime = performance.now();
  private frameCount = 0;

  constructor() {}

  start() {
    this.interval = setInterval(() => {
      this.checkCPU();
      this.checkBattery();
      this.checkNetwork();
    }, 2000);

    // Track animation frames to estimate CPU under high load
    if (typeof window !== 'undefined') {
      const trackFrames = () => {
        this.frameCount++;
        if (this.interval) {
          requestAnimationFrame(trackFrames);
        }
      };
      requestAnimationFrame(trackFrames);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async checkCPU() {
    // 1. Check native Compute Pressure API if available
    const nav = navigator as any;
    if ('computePressure' in nav) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'cpu') {
              this.currentCpu = (entry as any).value * 100;
              if (this.currentCpu > 70) {
                this.emit('cpuHigh', this.currentCpu);
              }
            }
          }
        });
        observer.observe({ type: 'cpu' as any, buffered: true });
        return;
      } catch (e) {
        // Fallback to framerate estimation
      }
    }

    // 2. Framerate drop estimation
    const now = performance.now();
    const duration = now - this.lastTime;
    if (duration >= 1000) {
      const fps = (this.frameCount * 1000) / duration;
      this.frameCount = 0;
      this.lastTime = now;

      // Drop below 24FPS implies CPU is struggling to render layout/compositor
      if (fps < 24) {
        this.currentCpu = 85;
        this.emit('cpuHigh', this.currentCpu);
      }
    }
  }

  private checkBattery() {
    const nav = navigator as any;
    if ('getBattery' in nav) {
      nav.getBattery().then((battery: any) => {
        this.currentBattery = battery.level * 100;
        if (this.currentBattery < 20 && !battery.charging) {
          this.emit('batteryLow', this.currentBattery);
        }
      });
    }
  }

  private checkNetwork() {
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      const rtt = conn.rtt || 0;
      const downlink = conn.downlink || 0; // in Mbps
      const effectiveType = conn.effectiveType || '';

      if (conn.saveData) {
        this.emit('networkPoor', { reason: 'saveData-enabled', rtt, downlink, effectiveType });
        return;
      }

      // Check for throttled or poor network (including 3G or heavy congestion)
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || (downlink > 0 && downlink < 1.0) || rtt > 350) {
        this.emit('networkPoor', { reason: 'extremely-poor', rtt, downlink, effectiveType });
      } else if (effectiveType === '3g' || (downlink > 0 && downlink < 2.5) || rtt > 200) {
        this.emit('networkPoor', { reason: 'moderate-3g', rtt, downlink, effectiveType });
      } else if ((effectiveType === '4g' || effectiveType === 'wifi') || downlink >= 3.0 || (rtt > 0 && rtt < 150)) {
        this.emit('networkGood', { rtt, downlink, effectiveType });
      }
    }
  }

  on(event: DeviceEvent, callback: DeviceCallback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  private emit(event: DeviceEvent, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error('[DeviceMonitor] Error in event listener:', e);
        }
      });
    }
  }
}
