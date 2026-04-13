import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { SelfieSegmentation, Results as SegmentationResults } from '@mediapipe/selfie_segmentation';
import { Camera } from '@mediapipe/camera_utils';

export interface ARSettings {
  beautyLevel: number; // 0-100
  brightness: number; // 0-100
  activeMask: string | null; // 'crown', 'glasses', etc.
  virtualBackground: string | null; // 'blur', 'office', 'beach', etc.
  virtualAvatar: string | null; // 'cat', 'robot', 'anime', etc.
  isMirrored?: boolean;
  isFlipped?: boolean;
  zoomLevel?: number; // 1.0 to 3.0
}

class MediaPipeService {
  private faceMesh: FaceMesh | null = null;
  private segmentation: SelfieSegmentation | null = null;
  private camera: Camera | null = null;
  
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoElement: HTMLVideoElement | null = null;

  private settings: ARSettings = {
    beautyLevel: 0,
    brightness: 0,
    activeMask: null,
    virtualBackground: null,
    virtualAvatar: null,
    isMirrored: false,
    isFlipped: false,
    zoomLevel: 1.0
  };

  private isProcessing = false;
  private isInitialized = false;
  private useRawFallback = false;
  private latestFaceLandmarks: any[] | null = null;

  async initialize(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.videoElement = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (this.isInitialized) {
      console.log("MediaPipe already initialized, updated canvas/video references.");
      // Ensure video is playing if we're re-initializing
      if (this.videoElement.paused) {
        this.videoElement.play().catch(e => console.warn("Failed to play video during re-init:", e));
      }
      return;
    }

    // Set a timeout for initialization
    const initTimeout = setTimeout(() => {
      if (!this.isInitialized) {
        console.warn("MediaPipe initialization timed out. Using raw fallback.");
        this.useRawFallback = true;
        this.isInitialized = true; // Mark as initialized so we don't keep trying
      }
    }, 5000);

    try {
      // Initialize Face Mesh
      this.faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.faceMesh.onResults(this.onFaceMeshResults.bind(this));

      // Initialize Segmentation
      this.segmentation = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });

      this.segmentation.setOptions({
        modelSelection: 1,
      });

      this.segmentation.onResults(this.onSegmentationResults.bind(this));

      clearTimeout(initTimeout);
      this.isInitialized = true;
      this.useRawFallback = false;
    } catch (err) {
      console.error("MediaPipe initialization failed:", err);
      this.useRawFallback = true;
      this.isInitialized = true;
      clearTimeout(initTimeout);
    }
  }

  updateSettings(newSettings: Partial<ARSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  private onFaceMeshResults(results: FaceMeshResults) {
    if (!this.ctx || !this.canvas || !this.videoElement) return;

    this.latestFaceLandmarks = results.multiFaceLandmarks?.[0] || null;

    // If segmentation is active, it handles drawing the base image/background
    // We only draw the face effects here
    if (this.settings.virtualBackground) {
      // 2. Apply Beauty (Smoothing/Brightening) - Only if face is detected
      if (this.latestFaceLandmarks && (this.settings.beautyLevel > 0 || this.settings.brightness > 0)) {
        this.applyBeautyEffects();
      }

      // 3. Draw Masks
      if (this.settings.activeMask && this.latestFaceLandmarks) {
        this.drawMask(this.latestFaceLandmarks);
      }
      return;
    }

    // Normal flow: Draw everything
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply Mirror/Flip/Zoom at the start
    this.applyTransformations();

    // 1. Draw Video Base
    this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

    // 2. Apply Beauty (Smoothing/Brightening)
    if (this.settings.beautyLevel > 0 || this.settings.brightness > 0) {
      this.applyBeautyEffects();
    }

    // 3. Draw Masks
    if (this.settings.activeMask && this.latestFaceLandmarks) {
      this.drawMask(this.latestFaceLandmarks);
    }
    this.ctx.restore();
  }

  private onSegmentationResults(results: SegmentationResults) {
    if (!this.ctx || !this.canvas || !this.videoElement) return;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. Draw the background effect (blurred or colored)
    if (this.settings.virtualBackground === 'blur') {
      this.ctx.filter = 'blur(20px)'; // Increased blur for better effect
      this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.filter = 'none';
    } else if (this.settings.virtualBackground === 'cyan') {
      this.ctx.fillStyle = '#22d3ee';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 2. Create a clipping region for the person using the mask
    // We'll use a temporary canvas to mask the person correctly
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Draw the person's image
      tempCtx.drawImage(results.image, 0, 0, tempCanvas.width, tempCanvas.height);
      // Mask it
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(results.segmentationMask, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the masked person onto the main canvas
      this.ctx.drawImage(tempCanvas, 0, 0);
    }

    this.ctx.restore();
  }

  private applyBeautyEffectsToCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    
    // 1. Skin Tone & Contrast Enhancement (Deeper, Stand out)
    if (this.settings.brightness > 0) {
      ctx.save();
      const intensity = this.settings.brightness / 150;
      
      // Warm "golden hour" tint
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = `rgba(255, 190, 150, ${intensity})`; 
      ctx.fillRect(0, 0, w, h);
      
      // Contrast boost to make features pop
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = `rgba(0, 0, 0, ${intensity / 3})`; 
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 2. Natural Smoothing (Single-layer blend to avoid ghosting/double faces)
    if (this.settings.beautyLevel > 0) {
      const level = this.settings.beautyLevel;
      
      // We use a temporary canvas for a single blurred overlay
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tCtx = tempCanvas.getContext('2d');
      
      if (tCtx) {
        // Draw the current frame blurred
        tCtx.filter = `blur(${4 + (level / 10)}px)`;
        tCtx.drawImage(canvas, 0, 0);
        
        ctx.save();
        // Use 'soft-light' blend mode - this is the most natural way to smooth skin
        // as it preserves the underlying structure and doesn't create "ghosting"
        ctx.globalAlpha = level / 100;
        ctx.globalCompositeOperation = 'soft-light';
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
      }
    }

    // 3. Virtual Avatar
    if (this.settings.virtualAvatar && this.latestFaceLandmarks) {
      this.drawVirtualAvatar(ctx, canvas);
    }

    ctx.restore();
  }

  private drawVirtualAvatar(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const w = canvas.width;
    const h = canvas.height;
    const landmarks = this.latestFaceLandmarks;
    if (!landmarks) return;

    // Get face center and size
    const top = landmarks[10];
    const bottom = landmarks[152];
    const left = landmarks[234];
    const right = landmarks[454];

    const faceWidth = Math.abs(right.x - left.x) * w;
    const faceHeight = Math.abs(bottom.y - top.y) * h;
    const centerX = (left.x + right.x) / 2 * w;
    const centerY = (top.y + bottom.y) / 2 * h;

    ctx.save();
    
    // Simple 2D Avatar (e.g., a stylized circle with eyes that follow landmarks)
    if (this.settings.virtualAvatar === 'robot') {
      // Body/Head
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(centerX - faceWidth * 0.6, centerY - faceHeight * 0.7, faceWidth * 1.2, faceHeight * 1.4, 20);
      ctx.fill();
      ctx.stroke();

      // Eyes
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(leftEye.x * w, leftEye.y * h, faceWidth * 0.1, 0, Math.PI * 2);
      ctx.arc(rightEye.x * w, rightEye.y * h, faceWidth * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.settings.virtualAvatar === 'cat') {
      // Cat Head
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(centerX, centerY, faceWidth * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.moveTo(centerX - faceWidth * 0.5, centerY - faceHeight * 0.4);
      ctx.lineTo(centerX - faceWidth * 0.7, centerY - faceHeight * 0.8);
      ctx.lineTo(centerX - faceWidth * 0.2, centerY - faceHeight * 0.6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX + faceWidth * 0.5, centerY - faceHeight * 0.4);
      ctx.lineTo(centerX + faceWidth * 0.7, centerY - faceHeight * 0.8);
      ctx.lineTo(centerX + faceWidth * 0.2, centerY - faceHeight * 0.6);
      ctx.fill();
    }

    ctx.restore();
  }

  private applyTransformations() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Zoom
    if (this.settings.zoomLevel && this.settings.zoomLevel > 1.0) {
      const z = this.settings.zoomLevel;
      this.ctx.translate(w / 2, h / 2);
      this.ctx.scale(z, z);
      this.ctx.translate(-w / 2, -h / 2);
    }

    // 2. Mirror (Horizontal Flip)
    if (this.settings.isMirrored) {
      this.ctx.translate(w, 0);
      this.ctx.scale(-1, 1);
    }

    // 3. Flip (Vertical Flip)
    if (this.settings.isFlipped) {
      this.ctx.translate(0, h);
      this.ctx.scale(1, -1);
    }
  }

  private applyBeautyEffects() {
    if (!this.ctx || !this.canvas) return;
    this.applyBeautyEffectsToCanvas(this.ctx, this.canvas);
  }

  private drawMask(landmarks: any[]) {
    if (!this.ctx || !this.canvas) return;

    const h = this.canvas.height;
    const w = this.canvas.width;

    if (this.settings.activeMask === 'crown') {
      // Forehead landmark is roughly index 10
      const forehead = landmarks[10];
      const x = forehead.x * w;
      const y = forehead.y * h;
      
      this.ctx.font = `${w * 0.2}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('👑', x, y);
    } else if (this.settings.activeMask === 'glasses') {
      // Nose bridge is roughly index 168
      const bridge = landmarks[168];
      const x = bridge.x * w;
      const y = bridge.y * h;
      
      this.ctx.font = `${w * 0.15}px serif`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🕶️', x, y + (h * 0.02));
    }
  }

  async startProcessing() {
    if (!this.videoElement || !this.faceMesh || !this.segmentation || this.isProcessing) return;

    this.isProcessing = true;
    const process = async () => {
      if (!this.isProcessing || !this.videoElement || this.videoElement.ended) {
        this.isProcessing = false;
        return;
      }

      try {
        // Ensure video is actually playing and has data
        if (this.videoElement.readyState < 2 || this.videoElement.paused) {
          if (this.videoElement.paused) {
            this.videoElement.play().catch(() => {});
          }
          requestAnimationFrame(process);
          return;
        }

        // Ensure canvas size matches video size
        if (this.canvas && (this.canvas.width !== this.videoElement.videoWidth || this.canvas.height !== this.videoElement.videoHeight)) {
          if (this.videoElement.videoWidth > 0 && this.videoElement.videoHeight > 0) {
            this.canvas.width = this.videoElement.videoWidth;
            this.canvas.height = this.videoElement.videoHeight;
          }
        }

        // If raw fallback is active or no effects, just draw the raw frame
        const hasEffects = this.settings.beautyLevel > 0 || 
                          this.settings.brightness > 0 || 
                          this.settings.activeMask || 
                          this.settings.virtualBackground;

        if (this.useRawFallback || !hasEffects) {
          if (this.ctx && this.canvas && this.videoElement) {
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
          }
        } else {
          // Run segmentation if background is needed
          if (this.settings.virtualBackground) {
            await this.segmentation!.send({ image: this.videoElement });
          }
          
          // Run face mesh if masks or beauty are needed, OR if we need to draw the base frame (no background)
          const needsFaceMesh = this.settings.activeMask || this.settings.beautyLevel > 0 || this.settings.brightness > 0 || !this.settings.virtualBackground;
          if (needsFaceMesh) {
            await this.faceMesh!.send({ image: this.videoElement });
          }
        }
      } catch (err) {
        console.error("MediaPipe processing error:", err);
        // Fallback: draw raw frame if MediaPipe fails
        if (this.ctx && this.canvas && this.videoElement) {
          this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        }
      }

      if (this.isProcessing) {
        requestAnimationFrame(process);
      }
    };

    process();
  }

  stopProcessing() {
    this.isProcessing = false;
  }
}

export const mediaPipeService = new MediaPipeService();
