import React, { useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
// @ts-ignore
import goldSlimeImg from '../assets/images/gold_slime_mascot_1781205271835.jpg';
// @ts-ignore
import partyHornImg from '../assets/images/party_horn_icon_1781205987775.jpg';

interface Particle {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  color: string;
  size: number;
  rotation: number;
  opacity: number;
  vx: number;
  vy: number;
  vr: number;
  life: number;
  flip: number;
  flipSpeed: number;
  isSparkle?: boolean;
  isSlime?: boolean;
  isHorn?: boolean;
  isHeart?: boolean; // Strictly 2D flat heart
  isPartyPaper?: boolean; // Confetti party papers
  paperType?: 'rect' | 'triangle';
  isExplosionBlast?: boolean;
  curveOffset?: number;
  hasSpawnedHeart?: boolean;
  canSpawnHeart?: boolean;
}

// Chroma key preprocessor to remove black background and keep the transparent golden slime + crown
const processSlimeImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const offscreen = document.createElement('canvas');
  offscreen.width = img.width;
  offscreen.height = img.height;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return offscreen;
  
  oCtx.drawImage(img, 0, 0);
  
  try {
    const imgData = oCtx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (r < 25 && g < 25 && b < 25) {
        data[i + 3] = 0;
      } else {
        const maxColor = Math.max(r, g, b);
        if (maxColor < 50) {
          const alphaFactor = (maxColor - 25) / 25;
          data[i + 3] = Math.floor(alphaFactor * 255);
        }
      }
    }
    oCtx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.error("Transparency styling preprocessing had a CORS issue or error:", e);
    oCtx.clearRect(0, 0, img.width, img.height);
    oCtx.save();
    oCtx.beginPath();
    oCtx.arc(img.width / 2, img.height / 2, img.width * 0.44, 0, Math.PI * 2);
    oCtx.clip();
    oCtx.drawImage(img, 0, 0);
    oCtx.restore();
    
    oCtx.strokeStyle = '#FFD700';
    oCtx.lineWidth = 14;
    oCtx.beginPath();
    oCtx.arc(img.width / 2, img.height / 2, img.width * 0.44, 0, Math.PI * 2);
    oCtx.stroke();
  }
  
  return offscreen;
};

// Chroma key preprocessor to remove black background from the party horn asset
const processHornImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const offscreen = document.createElement('canvas');
  offscreen.width = img.width;
  offscreen.height = img.height;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return offscreen;

  oCtx.drawImage(img, 0, 0);

  try {
    const imgData = oCtx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r < 25 && g < 25 && b < 25) {
        data[i + 3] = 0;
      } else {
        const maxColor = Math.max(r, g, b);
        if (maxColor < 50) {
          const alphaFactor = (maxColor - 25) / 25;
          data[i + 3] = Math.floor(alphaFactor * 255);
        }
      }
    }
    oCtx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.error("Transparency styling preprocessing failed for party horn, fallback circular crop", e);
    oCtx.clearRect(0, 0, img.width, img.height);
    oCtx.save();
    oCtx.beginPath();
    oCtx.arc(img.width / 2, img.height / 2, img.width * 0.44, 0, Math.PI * 2);
    oCtx.clip();
    oCtx.drawImage(img, 0, 0);
    oCtx.restore();
  }

  return offscreen;
};

// Generates a darkened version for underlays to create rich depth
const makeDarkenedVersion = (srcCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const offscreen = document.createElement('canvas');
  offscreen.width = srcCanvas.width;
  offscreen.height = srcCanvas.height;
  const oCtx = offscreen.getContext('2d');
  if (oCtx) {
    oCtx.drawImage(srcCanvas, 0, 0);
    oCtx.globalCompositeOperation = 'source-atop';
    oCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    oCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);
  }
  return offscreen;
};

interface LikeParticlesProps {
  onTap?: (x: number, y: number) => void;
  onArrival?: (count: number) => void;
  targetX?: number;
  targetY?: number;
}

export interface LikeParticlesRef {
  triggerLike: (x?: number, y?: number, isTargeted?: boolean) => void;
  triggerExplosion: (x: number, y: number) => void;
}

const COLORS = [
  '#FF0000', // Red
  '#FF69B4', // HotPink
  '#FF1493', // DeepPink
  '#FF4500', // OrangeRed
  '#FFD700', // Gold
  '#00E5FF', // Cyan
  '#FF00FF', // Magenta
];

const PARTY_COLORS = [
  '#FFD700', // Gold
  '#FF1493', // DeepPink
  '#00E5FF', // Cyan
  '#39FF14', // Neon Green
  '#FF4500', // OrangeRed
  '#8A2BE2', // Purple
  '#FF00FF', // Magenta
  '#FF8C00', // DarkOrange
];

export const LikeParticles = forwardRef<LikeParticlesRef, LikeParticlesProps>(({ onTap, onArrival, targetX, targetY }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);
  const lastHeartSpawnTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const tapCounterRef = useRef<number>(0);

  // High performance: track callbacks and target coords in refs to prevent closure traps and avoid canceling the RAF animation frame loop when props change!
  const onTapRef = useRef(onTap);
  const onArrivalRef = useRef(onArrival);
  const targetXRef = useRef(targetX);
  const targetYRef = useRef(targetY);

  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  useEffect(() => {
    onArrivalRef.current = onArrival;
  }, [onArrival]);

  useEffect(() => {
    targetXRef.current = targetX;
  }, [targetX]);

  useEffect(() => {
    targetYRef.current = targetY;
  }, [targetY]);

  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Strictly 2D flat heart rendering with beautiful gloss gradient and white highlight
  const drawFlatHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    const d = size * 0.95;

    // Plump, bubbly symmetrical heart path
    ctx.beginPath();
    ctx.moveTo(0, -d * 0.15);
    ctx.bezierCurveTo(-d * 0.45, -d * 0.65, -d * 1.0, -d * 0.35, -d * 1.0, d * 0.15);
    ctx.bezierCurveTo(-d * 1.0, d * 0.6, -d * 0.5, d * 0.9, 0, d * 1.1);
    ctx.bezierCurveTo(d * 0.5, d * 0.9, d * 1.0, d * 0.6, d * 1.0, d * 0.15);
    ctx.bezierCurveTo(d * 1.0, -d * 0.35, d * 0.45, -d * 0.65, 0, -d * 0.15);
    ctx.closePath();

    // Gloss gradient
    const faceGrad = ctx.createLinearGradient(0, -d * 0.5, 0, d * 1.1);
    const topColor = adjustColor(color, 65);
    const midColor = adjustColor(color, 25);
    const baseColor = color;
    const deepColor = adjustColor(color, -30);

    faceGrad.addColorStop(0, topColor);
    faceGrad.addColorStop(0.3, midColor);
    faceGrad.addColorStop(0.7, baseColor);
    faceGrad.addColorStop(1, deepColor);

    ctx.fillStyle = faceGrad;
    ctx.fill();

    // High contrast glossy highlight on the left lobe
    ctx.save();
    ctx.translate(-d * 0.35, -d * 0.2);
    ctx.rotate(-Math.PI / 5);
    const highlightGrad = ctx.createLinearGradient(0, -d * 0.15, 0, d * 0.15);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    highlightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, d * 0.1, d * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Outer rich stroke border
    ctx.strokeStyle = adjustColor(color, -20);
    ctx.lineWidth = Math.max(1.5, d * 0.08);
    ctx.stroke();

    ctx.restore();
  };

  // Confetti / Party Paper rendering with 3D tumbling scaleY
  const drawPartyPaper = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number, rotation: number, flip: number, paperType: 'rect' | 'triangle') => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    // Apply vertical 3D scale flipping
    const scaleY = Math.cos(flip);
    ctx.scale(1, scaleY);

    if (paperType === 'rect') {
      ctx.fillRect(-size, -size / 2, size * 2, size);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-size, -size / 2, size * 2, size);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, size);
      ctx.lineTo(-size, size);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  };

  const slimeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const slimeCanvasDarkRef = useRef<HTMLCanvasElement | null>(null);
  const hornCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hornCanvasDarkRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const imgS = new Image();
    imgS.src = goldSlimeImg;
    imgS.onload = () => {
      const processed = processSlimeImage(imgS);
      slimeCanvasRef.current = processed;
      slimeCanvasDarkRef.current = makeDarkenedVersion(processed);
    };

    const imgH = new Image();
    imgH.src = partyHornImg;
    imgH.onload = () => {
      const processed = processHornImage(imgH);
      hornCanvasRef.current = processed;
      hornCanvasDarkRef.current = makeDarkenedVersion(processed);
    };
  }, []);

  // Volumetric forward-facing mascot (Slime) with depth underlay and shadow, NO spiraling
  const drawSlime = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotation: number) => {
    const slimeCanvas = slimeCanvasRef.current;
    const slimeDarkCanvas = slimeCanvasDarkRef.current;
    if (!slimeCanvas) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const drawSize = size * 2.3;

    // 1. Volumetric blur shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = drawSize * 0.16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = drawSize * 0.08;
    ctx.drawImage(slimeCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();

    // 2. Volumetric thick edge underlay
    if (slimeDarkCanvas) {
      ctx.drawImage(slimeDarkCanvas, -drawSize / 2, -drawSize / 2 + 2, drawSize, drawSize);
    }

    // 3. Main face
    ctx.drawImage(slimeCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

    ctx.restore();
  };

  // Volumetric forward-facing mascot (Party Horn) with depth underlay and shadow, NO spiraling
  const drawHorn = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotation: number) => {
    const hornCanvas = hornCanvasRef.current;
    const hornDarkCanvas = hornCanvasDarkRef.current;
    if (!hornCanvas) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const drawSize = size * 2.3;

    // 1. Volumetric blur shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = drawSize * 0.16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = drawSize * 0.08;
    ctx.drawImage(hornCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();

    // 2. Volumetric thick edge underlay
    if (hornDarkCanvas) {
      ctx.drawImage(hornDarkCanvas, -drawSize / 2, -drawSize / 2 + 2, drawSize, drawSize);
    }

    // 3. Main face
    ctx.drawImage(hornCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

    ctx.restore();
  };

  // Color adjuster helper
  const adjustColor = (hex: string, amt: number) => {
    let usePound = false;
    if (hex[0] === "#") {
      hex = hex.slice(1);
      usePound = true;
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  };

  const updateAndDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      isAnimatingRef.current = false;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isAnimatingRef.current = false;
      return;
    }

    if (particlesRef.current.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      isAnimatingRef.current = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const extraSparkles: Particle[] = [];
    let triggerOnArrivalCount = 0;

    particlesRef.current = particlesRef.current.filter(p => {
      // 1. Particle physics
      if (p.isSparkle) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // subtle gravity
        p.vx *= 0.97; // air resistance
        p.life -= 0.025; // fast fade
      } 
      else if (p.isPartyPaper) {
        // Drifting horizontal sway
        p.x += p.vx + Math.sin(p.life * 10) * 1.0;
        p.y += p.vy;
        p.vy += 0.055; // gentle gravity
        p.vx *= 0.98;
        p.life -= 0.012; // long floating life
      }
      else if (p.isSlime || p.isHorn) {
        // Total lifetime is exactly 0.90 seconds (0.30s rise phase + 0.60s disappear phase - 40% total fade reduction).
        // At 60fps, 0.90s = 54 frames, so 1 / 54 ~ 0.01852 decrement per frame.
        p.life -= 0.01852;
        const progress = 1.0 - p.life;
        
        // Rise phase duration remains exactly 0.30 seconds (0.3333 of the 0.90s lifespan)
        const riseLimit = 0.3333;
        
        const tx = p.startX; // Rises straight up from tap point
        const ty = p.targetY ?? (p.startY - window.innerHeight * 0.32); // Reduced height by 20% (32% instead of 40%)

        if (progress <= riseLimit) {
          // 1. Rise Phase: Shoots up to 50% of distance instantly, then applies brakes & shakes
          const riseT = progress / riseLimit; // goes from 0 to 1 over 0.30s
          
          let distRatio = 0;
          let decay = 0;
          if (riseT <= 0.3) {
            // First 30% of the rise time (90ms): shoots up extremely fast to 50% of the distance
            const tNorm = riseT / 0.3;
            distRatio = tNorm * 0.5;
            p.x = p.startX;
            p.y = p.startY + (ty - p.startY) * distRatio;
            p.rotation = 0;
          } else {
            // Remaining 70% of the rise time (210ms): decelerates and shakes ("pulling the brakes")
            const tNorm = (riseT - 0.3) / 0.7;
            const easeDecl = 1.0 - Math.pow(1.0 - tNorm, 2); // Quadratic ease-out for braking deceleration
            distRatio = 0.5 + 0.5 * easeDecl;
            
            decay = 1.0 - tNorm; // Shake decays as it reaches the destination
            const brakeShakeY = Math.sin(riseT * Math.PI * 14) * 4 * decay; // Smooth vertical deceleration bob
            const brakeShakeX = Math.sin(riseT * Math.PI * 14) * 0.8 * decay; // Tiny horizontal sway
            
            p.x = p.startX + brakeShakeX;
            p.y = (p.startY + (ty - p.startY) * distRatio) + brakeShakeY;
            p.rotation = Math.sin(riseT * Math.PI * 14) * 0.24 * decay; // Highly visible, flexible rotational head tilt (back-and-forth swing)
          }
        } else {
          // 2. Hover & Fade Phase: Stays suspended perfectly straight, no wobbling, no swaying
          p.x = p.startX;
          p.y = ty;
          p.rotation = 0;

          const hoverProgress = (progress - riseLimit) / (1.0 - riseLimit);
          // Fades out completely over the remaining 1.0s hover phase
          p.opacity = Math.max(0, 1.0 - hoverProgress);

          // Spawn heart from the mascot when it reaches hover phase
          if (!p.hasSpawnedHeart) {
            if (p.canSpawnHeart) {
              const activeHearts = particlesRef.current.filter(h => h.isHeart && h.life > 0);
              
              let canSpawn = true;
              for (const h of activeHearts) {
                const dx = h.x - p.x;
                const dy = h.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 38) { // Natural tight spacing of 38px for beautiful continuous queues
                  canSpawn = false;
                  break;
                }
              }
              
              // Force spawn if we are running out of time in the mascot's lifespan to prevent missing taps
              if (canSpawn || p.life < 0.15) {
                p.hasSpawnedHeart = true;
                const tX = targetXRef.current ?? 60;
                const tY = targetYRef.current ?? 80;
                
                extraSparkles.push({
                  id: Date.now() + Math.random() + 5000,
                  x: p.x,
                  y: p.y,
                  startX: p.x,
                  startY: p.y,
                  targetX: tX,
                  targetY: tY,
                  color: COLORS[Math.floor(Math.random() * COLORS.length)],
                  size: 14 + Math.random() * 4,
                  rotation: 0, // Face upright strictly
                  opacity: 1,
                  vx: 0,
                  vy: 0,
                  vr: 0,
                  life: 1.0,
                  flip: 0,
                  flipSpeed: 0,
                  isHeart: true,
                });
              }
            } else {
              p.hasSpawnedHeart = true; // Mark as done if this tap index shouldn't spawn a heart
            }
          }
        }
      }
      else if (p.isHeart && p.targetX !== undefined && p.targetY !== undefined) {
        // Flat 2D hearts fly to target on a gorgeous 2-stage Bezier arc trajectory (Upright, no turning or flipping)
        // No "idle standing" or stopping - they move continuously from spawn directly to profile picture.
        p.life -= 0.00667; // Slower speed (150 frames total = exactly 2.5 seconds) for elegant flight
        const t = 1 - p.life;
        
        // Smooth deceleration / flight speed
        const easeT = t * t * (3 - 2 * t);

        const startX = p.startX;
        const startY = p.startY;
        const heartTargetX = p.targetX;
        const heartTargetY = p.targetY;
        
        const W = startX - heartTargetX;
        const H = startY - heartTargetY;

        // Stage 1: Deep leftward sweep towards the left edge of the screen
        // We sweep to about 35px to the left of the target, but keep it at least 25px from the left edge of the screen
        const leftLimit = Math.max(25, heartTargetX - 35);
        const p1x = leftLimit + (startX - leftLimit) * 0.1; // head towards left edge
        const p1y = startY - H * 0.45;

        // Stage 2: Climb up along the left edge before pulling into the target profile picture
        const p2x = leftLimit;
        const p2y = heartTargetY + H * 0.18;

        const mt = 1 - easeT;
        p.x = mt * mt * mt * startX + 3 * mt * mt * easeT * p1x + 3 * mt * easeT * easeT * p2x + easeT * easeT * easeT * heartTargetX;
        p.y = mt * mt * mt * startY + 3 * mt * mt * easeT * p1y + 3 * mt * easeT * easeT * p2y + easeT * easeT * easeT * heartTargetY;

        // CRITICAL UPDATE: No fade out in flight! Hearts remain 100% fully solid and visible all the way to the circle.
        p.opacity = 1.0;

        // CRITICAL UPDATE: No size shrinking! Keep the heart robust and beautiful.
        p.rotation = 0; // No turning
        p.flip = 0; // No flipping

        // Arrival detection: target coordinates are the exact center of the profile picture.
        const dx = p.x - p.targetX;
        const dy = p.y - p.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 8 || p.life <= 0.005) {
          triggerOnArrivalCount++;
          // CRITICAL UPDATE: Absolutely NO sparkle burst or particles on arrival!
          return false;
        }
      } 
      else {
        // standard float
        p.x += p.vx + Math.sin(p.life * 8.5) * 1.6;
        p.y += p.vy;
        p.life -= 0.015;
      }
      
      p.rotation += p.vr;
      p.flip += p.flipSpeed;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0) {
        // CRITICAL UPDATE: Absolutely NO sparkle puff on standard heart/mascot fade out!
        return false;
      }

      // Drawing routines
      if (p.isSparkle) {
        drawSparkle(ctx, p.x, p.y, p.size, p.color, p.opacity);
      } else if (p.isPartyPaper && p.paperType) {
        drawPartyPaper(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, p.flip, p.paperType);
      } else if (p.isSlime) {
        drawSlime(ctx, p.x, p.y, p.size, p.opacity, p.rotation);
      } else if (p.isHorn) {
        drawHorn(ctx, p.x, p.y, p.size, p.opacity, p.rotation);
      } else {
        drawFlatHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      }
      return true;
    });

    if (extraSparkles.length > 0) {
      particlesRef.current.push(...extraSparkles);
    }

    if (triggerOnArrivalCount > 0 && onArrivalRef.current) {
      onArrivalRef.current(triggerOnArrivalCount);
    }

    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    } else {
      isAnimatingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    if (particlesRef.current.length > 0 && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateAndDraw]);

  const addParticle = useCallback((x: number, y: number, isTargetedForce?: boolean) => {
    // Spawning the Mascot at the tap coordinates.
    const rand = Math.random();
    const isSlime = rand < 0.60; // 60% Golden Slime, 40% Party Horn
    const isHorn = !isSlime;

    // Rise straight up by 32% of the screen height from the tap point (reduced height by 20%)
    const tX = x;
    const tY = y - (window.innerHeight * 0.32);

    // Track latest tap time and increment total taps
    lastTapTimeRef.current = Date.now();
    tapCounterRef.current += 1;

    // Exactly 2 hearts are generated for every 3 taps (Taps 1 & 2 spawn, Tap 3 skips, Taps 4 & 5 spawn...)
    const tapIndexInGroup = (tapCounterRef.current - 1) % 3;
    const canSpawnHeart = tapIndexInGroup === 0 || tapIndexInGroup === 1;

    const mascotParticle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      startX: x,
      startY: y,
      targetX: tX,
      targetY: tY,
      color: '#FFD700',
      size: 18 + Math.random() * 6,
      rotation: 0, // Facing strictly up
      opacity: 1,
      vx: 0,
      vy: 0,
      vr: 0,
      life: 1.0,
      flip: 0,
      flipSpeed: 0,
      isSlime,
      isHorn,
      hasSpawnedHeart: false,
      canSpawnHeart,
    };

    particlesRef.current.push(mascotParticle);
    
    if (onTapRef.current) onTapRef.current(x, y);

    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    }
  }, [updateAndDraw]);

  useImperativeHandle(ref, () => ({
    triggerLike: (x?: number, y?: number, isTargetedForce?: boolean) => {
      const finalX = x ?? window.innerWidth * 0.75;
      const finalY = y ?? window.innerHeight - 100;
      addParticle(finalX, finalY, isTargetedForce);
    },
    triggerExplosion: (x: number, y: number) => {
      const blastParticles: Particle[] = [];
      const colorsToUse = COLORS;

      // 1. Generate party paper confetti (28 particles) with 3D tumbling physics!
      for (let i = 0; i < 28; i++) {
        const angle = (Math.PI * 2 / 28) * i + (Math.random() * 0.2);
        const speed = 4.0 + Math.random() * 8.0;
        blastParticles.push({
          id: Math.random() + Date.now() + i,
          x,
          y,
          startX: x,
          startY: y,
          color: PARTY_COLORS[Math.floor(Math.random() * PARTY_COLORS.length)],
          size: 6 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.0, // strong upward thrust
          vr: (Math.random() - 0.5) * 0.15,
          life: 1.2 + Math.random() * 0.8,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: 0.05 + Math.random() * 0.15, // tumbling speed
          isPartyPaper: true,
          paperType: Math.random() < 0.5 ? 'rect' : 'triangle'
        });
      }

      // 2. Generate flat 2D Hearts (12 particles) exploding outwards
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i + (Math.random() * 0.3);
        const speed = 3.5 + Math.random() * 5.0;
        blastParticles.push({
          id: Math.random() + Date.now() + 100 + i,
          x,
          y,
          startX: x,
          startY: y,
          color: colorsToUse[Math.floor(Math.random() * colorsToUse.length)],
          size: 12 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          vr: (Math.random() - 0.5) * 0.1,
          life: 1.4 + Math.random() * 0.5,
          flip: 0,
          flipSpeed: 0,
          isHeart: true,
          isExplosionBlast: true
        });
      }

      // 3. Generate some 3D mascots (8 particles) exploding and swaying outwards with no spin
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + (Math.random() * 0.4);
        const speed = 2.5 + Math.random() * 4.0;
        const isSlime = i % 2 === 0;
        blastParticles.push({
          id: Math.random() + Date.now() + 200 + i,
          x,
          y,
          startX: x,
          startY: y,
          color: '#FFD700',
          size: 16 + Math.random() * 6,
          rotation: Math.random() * Math.PI,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.8,
          vr: (Math.random() - 0.5) * 0.04,
          life: 1.3 + Math.random() * 0.4,
          flip: 0,
          flipSpeed: 0,
          isSlime,
          isHorn: !isSlime,
          isExplosionBlast: true
        });
      }

      // 4. Sparkling star puffs
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i + (Math.random() * 0.3);
        const speed = 3.0 + Math.random() * 6.0;
        blastParticles.push({
          id: Math.random() + Date.now() + 300 + i,
          x,
          y,
          startX: x,
          startY: y,
          color: colorsToUse[Math.floor(Math.random() * colorsToUse.length)],
          size: 3.5 + Math.random() * 4,
          rotation: Math.random() * Math.PI,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.0,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1.0 + Math.random() * 0.5,
          flip: 0,
          flipSpeed: 0,
          isSparkle: true
        });
      }

      particlesRef.current.push(...blastParticles);

      // Cascading confetti explosion effects for maximum prestige volume
      const triggerSecondaryBlast = (bx: number, by: number) => {
        const secondary: Particle[] = [];
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i + (Math.random() * 0.3);
          const speed = 2.0 + Math.random() * 4.5;
          secondary.push({
            id: Math.random() + Date.now() + 2000 + i,
            x: bx,
            y: by,
            startX: bx,
            startY: by,
            color: PARTY_COLORS[Math.floor(Math.random() * PARTY_COLORS.length)],
            size: 4 + Math.random() * 5,
            rotation: Math.random() * Math.PI * 2,
            opacity: 1,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            vr: (Math.random() - 0.5) * 0.12,
            life: 1.0 + Math.random() * 0.6,
            flip: Math.random() * Math.PI * 2,
            flipSpeed: 0.05 + Math.random() * 0.1,
            isPartyPaper: true,
            paperType: Math.random() < 0.5 ? 'rect' : 'triangle'
          });
        }
        particlesRef.current.push(...secondary);
        if (!isAnimatingRef.current) {
          isAnimatingRef.current = true;
          animationFrameRef.current = requestAnimationFrame(updateAndDraw);
        }
      };

      setTimeout(() => triggerSecondaryBlast(x - 50, y + 20), 180);
      setTimeout(() => triggerSecondaryBlast(x + 60, y - 25), 320);
      setTimeout(() => triggerSecondaryBlast(x - 20, y - 60), 480);

      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        animationFrameRef.current = requestAnimationFrame(updateAndDraw);
      }
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
    />
  );
});
