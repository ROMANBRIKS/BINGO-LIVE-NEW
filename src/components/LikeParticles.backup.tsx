import React, { useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
// @ts-ignore
import goldSlimeImg from '../assets/images/gold_slime_mascot_1781205271835.jpg';
// @ts-ignore
import partyHornImg from '../assets/images/party_horn_icon_1781205987775.jpg';

interface Particle {
  id: number;
  x: number;
  y: number;
  startX?: number;
  startY?: number;
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
  isExplosionBlast?: boolean;
  curveOffset?: number;
}

// Chroma key preprocessor to remove black background and keep the transparent golden slime + crown
const processSlimeImage = (img: HTMLImageElement): HTMLCanvasElement => {
  const offscreen = document.createElement('canvas');
  offscreen.width = img.width;
  offscreen.height = img.height;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return offscreen;
  
  // Draw original image
  oCtx.drawImage(img, 0, 0);
  
  try {
    const imgData = oCtx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is very close to pure black (background), make it transparent
      if (r < 25 && g < 25 && b < 25) {
        data[i + 3] = 0;
      } else {
        // Feathering transition with slight transparency for anti-aliasing near edges
        const maxColor = Math.max(r, g, b);
        if (maxColor < 50) {
          const alphaFactor = (maxColor - 25) / 25;
          data[i + 3] = Math.floor(alphaFactor * 255);
        }
      }
    }
    oCtx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.error("Transparancy styling preprocessing had a CORS issue or error:", e);
    // If there is any canvas security error, fallback to a beautiful gold circular border crop
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

// Generates a 3D-shading darkened overlay version of the preprocessed image for extrusion walls
const makeDarkenedVersion = (srcCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const offscreen = document.createElement('canvas');
  offscreen.width = srcCanvas.width;
  offscreen.height = srcCanvas.height;
  const oCtx = offscreen.getContext('2d');
  if (oCtx) {
    oCtx.drawImage(srcCanvas, 0, 0);
    // Overlay a rich, shaded black multiplier mask to darken the image content naturally
    oCtx.globalCompositeOperation = 'source-atop';
    oCtx.fillStyle = 'rgba(0, 0, 0, 0.44)'; // Beautiful volumetric shadowed edge tint
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

export const LikeParticles = forwardRef<LikeParticlesRef, LikeParticlesProps>(({ onTap, onArrival, targetX, targetY }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(false);

  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    
    // Create a shiny 4-pointed star particle
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

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number, rotation: number, flip: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    const d = size * 0.95; // base scale
    const depth = d * 0.24; // Volumetric 3D extrusion depth
    const depthSteps = 6;   // Number of layers for perfect 3D solid edge shading

    // Determine front/back facing
    const cosF = Math.cos(flip);
    const sinF = Math.sin(flip);
    const isFront = cosF >= 0;
    
    // Horizontal scale factor for rotation.
    // Instead of dropping to absolute zero (paper thin), we enforce a tiny thickness minimum
    const scaleX = cosF;

    // Define the plump, bubbly, symmetrical heart path
    const drawPlumpHeartPath = (context: CanvasRenderingContext2D) => {
      context.beginPath();
      context.moveTo(0, -d * 0.15);
      context.bezierCurveTo(-d * 0.45, -d * 0.65, -d * 1.0, -d * 0.35, -d * 1.0, d * 0.15);
      context.bezierCurveTo(-d * 1.0, d * 0.6, -d * 0.5, d * 0.9, 0, d * 1.1);
      context.bezierCurveTo(d * 0.5, d * 0.9, d * 1.0, d * 0.6, d * 1.0, d * 0.15);
      context.bezierCurveTo(d * 1.0, -d * 0.35, d * 0.45, -d * 0.65, 0, -d * 0.15);
      context.closePath();
    };

    // Color definitions
    let BaseTop = adjustColor(color, 85);
    let BaseMid = adjustColor(color, 25);
    let BaseMain = color;
    let BaseDeep = adjustColor(color, -40);

    const upperColor = color.toUpperCase();
    if (upperColor === '#FF1493' || upperColor === '#FF69B4' || upperColor === '#FF0000' || upperColor === '#FF00FF' || upperColor === '#FF4500') {
      BaseTop = '#ffd3e6';
      BaseMid = '#ff82a5';
      BaseMain = '#ff336f';
      BaseDeep = '#c9003c';
    }

    // Adapt face color based on front/back lighting to match shadows in 3D
    const topColor = isFront ? BaseTop : adjustColor(BaseTop, -52);
    const midColor = isFront ? BaseMid : adjustColor(BaseMid, -42);
    const baseColor = isFront ? BaseMain : adjustColor(BaseMain, -32);
    const deepColor = isFront ? BaseDeep : adjustColor(BaseDeep, -52);

    // Darker materials for the extrusion side-wall
    const sideColorOuter = adjustColor(BaseDeep, -28);
    const sideColorInner = adjustColor(BaseMain, -55);

    // 1. Draw a soft, diffuse translucent shadow behind the 3D body
    ctx.save();
    ctx.translate(-sinF * depth * 0.6, d * 0.12);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = d * 0.24;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.scale(scaleX, 1);
    drawPlumpHeartPath(ctx);
    ctx.fill();
    ctx.restore();

    // 2. Draw 3D Extrusion Side Wall (back to front layering of darker offset slices)
    const totalShiftX = sinF * depth;

    for (let i = 0; i <= depthSteps; i++) {
      const t = i / depthSteps;
      const layerShiftX = totalShiftX * (1 - t);

      ctx.save();
      ctx.translate(layerShiftX, 0);
      ctx.scale(scaleX, 1);

      // Gradient representing side bevel round shading under light
      const sideGrad = ctx.createLinearGradient(0, -d * 0.5, 0, d * 1.1);
      sideGrad.addColorStop(0, adjustColor(sideColorOuter, 35));
      sideGrad.addColorStop(0.3, sideColorInner);
      sideGrad.addColorStop(0.7, sideColorOuter);
      sideGrad.addColorStop(1, adjustColor(sideColorOuter, -25));

      ctx.fillStyle = sideGrad;
      drawPlumpHeartPath(ctx);
      ctx.fill();

      ctx.strokeStyle = adjustColor(sideColorOuter, -15);
      ctx.lineWidth = Math.max(1.0, d * 0.04);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Draw Main Face (front or back of the 3D heart)
    ctx.save();
    ctx.scale(scaleX, 1);

    const faceGrad = ctx.createLinearGradient(0, -d * 0.5, 0, d * 1.1);
    faceGrad.addColorStop(0, topColor);
    faceGrad.addColorStop(0.25, midColor);
    faceGrad.addColorStop(0.65, baseColor);
    faceGrad.addColorStop(1, deepColor);

    ctx.fillStyle = faceGrad;
    drawPlumpHeartPath(ctx);
    ctx.fill();

    // Highlights relative to front/back facing
    if (isFront) {
      // Highlight 1: Left Lobe Glossy Reflection
      ctx.save();
      ctx.translate(-d * 0.42, -d * 0.18);
      ctx.rotate(-Math.PI / 4.5);
      
      const highlightGradLeft = ctx.createLinearGradient(0, -d * 0.25, 0, d * 0.25);
      highlightGradLeft.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      highlightGradLeft.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
      highlightGradLeft.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = highlightGradLeft;
      ctx.beginPath();
      ctx.ellipse(0, 0, d * 0.12, d * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Highlight 2: Right Lobe Secondary Light Reflection
      ctx.save();
      ctx.translate(d * 0.46, -d * 0.14);
      ctx.rotate(Math.PI / 3.8);
      
      const highlightGradRight = ctx.createLinearGradient(0, -d * 0.15, 0, d * 0.15);
      highlightGradRight.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      highlightGradRight.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      highlightGradRight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = highlightGradRight;
      ctx.beginPath();
      ctx.ellipse(0, 0, d * 0.07, d * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Highlight 3: Soft Bottom-Left Inner Rim Reflective Glow
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = Math.max(1.5, d * 0.08);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-d * 0.4, d * 0.35, d * 0.45, Math.PI * 0.6, Math.PI * 1.1);
      ctx.stroke();
      ctx.restore();
    } else {
      // Draw subtle back glossy highlighted curves to show continuous 3D lighting on the back side
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = Math.max(1.0, d * 0.06);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(d * 0.4, d * 0.35, d * 0.45, Math.PI * 1.1, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();
    }

    // Crisp high-contrast material contour border
    ctx.strokeStyle = (upperColor === '#FF1493' || upperColor === '#FF69B4' || upperColor === '#FF0000' || upperColor === '#FF00FF')
      ? (isFront ? '#ff2062' : '#c9003c')
      : (isFront ? adjustColor(color, 20) : adjustColor(color, -20));
    ctx.lineWidth = Math.max(1.2, d * 0.06); 
    drawPlumpHeartPath(ctx);
    ctx.stroke();

    ctx.restore();
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

  const drawSlime = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotation: number, flip: number) => {
    const slimeCanvas = slimeCanvasRef.current;
    const slimeDarkCanvas = slimeCanvasDarkRef.current;
    if (!slimeCanvas) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const cosF = Math.cos(flip);
    const sinF = Math.sin(flip);
    const scaleX = cosF;
    const isFront = cosF >= 0;

    const drawSize = size * 2.3;
    const depth = drawSize * 0.12; // Realistic 3D sticker thickness
    const depthSteps = 5;

    // 1. Draw a soft offset shadow
    ctx.save();
    ctx.translate(-sinF * depth * 0.7, drawSize * 0.08);
    ctx.scale(scaleX, 1);
    ctx.globalAlpha = opacity * 0.22;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = drawSize * 0.14;
    ctx.drawImage(slimeCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();

    // 2. Draw 3D Extrusion Side Wall layers
    const totalShiftX = sinF * depth;
    const sideCanvas = slimeDarkCanvas || slimeCanvas;

    for (let i = 0; i <= depthSteps; i++) {
      const t = i / depthSteps;
      const layerShiftX = totalShiftX * (1 - t);

      ctx.save();
      ctx.translate(layerShiftX, 0);
      ctx.scale(scaleX, 1);
      ctx.drawImage(sideCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
    }

    // 3. Draw Main Face (front or shadow-facing back)
    ctx.save();
    ctx.scale(scaleX, 1);
    const faceCanvas = isFront ? slimeCanvas : (slimeDarkCanvas || slimeCanvas);
    ctx.drawImage(faceCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();

    ctx.restore();
  };

  const drawHorn = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotation: number, flip: number) => {
    const hornCanvas = hornCanvasRef.current;
    const hornDarkCanvas = hornCanvasDarkRef.current;
    if (!hornCanvas) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;

    const cosF = Math.cos(flip);
    const sinF = Math.sin(flip);
    const scaleX = cosF;
    const isFront = cosF >= 0;

    const drawSize = size * 2.3;
    const depth = drawSize * 0.12; // Vibrant 3D party horn sticker thickness
    const depthSteps = 5;

    // 1. Draw soft tactile depth shadow
    ctx.save();
    ctx.translate(-sinF * depth * 0.7, drawSize * 0.08);
    ctx.scale(scaleX, 1);
    ctx.globalAlpha = opacity * 0.22;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = drawSize * 0.14;
    ctx.drawImage(hornCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();

    // 2. Draw 3D Extrusion layers
    const totalShiftX = sinF * depth;
    const sideCanvas = hornDarkCanvas || hornCanvas;

    for (let i = 0; i <= depthSteps; i++) {
      const t = i / depthSteps;
      const layerShiftX = totalShiftX * (1 - t);

      ctx.save();
      ctx.translate(layerShiftX, 0);
      ctx.scale(scaleX, 1);
      ctx.drawImage(sideCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
    }

    // 3. Draw Main Face (front or back-shadow)
    ctx.save();
    ctx.scale(scaleX, 1);
    const faceCanvas = isFront ? hornCanvas : (hornDarkCanvas || hornCanvas);
    ctx.drawImage(faceCanvas, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();

    ctx.restore();
  };

  // Helper to darken/lighten colors for the gradient
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

    // Stop animation loop completely if there are no particles
    if (particlesRef.current.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      isAnimatingRef.current = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const extraSparkles: Particle[] = [];
    let triggerOnArrivalCount = 0;

    particlesRef.current = particlesRef.current.filter(p => {
      // 1. Particle movement logic
      if (p.isSparkle) {
        // Sparkles fall with micro-gravity and air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // Subtle downward gravity pull
        p.vx *= 0.98; // Air resistance logic
        p.life -= 0.025; // Sparkles fade away relatively fast
      } else if (p.isExplosionBlast) {
        // Explosion blast items propagate in all directions with gravity
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // Natural gravity
        p.vx *= 0.97; // Minimal air resistance drag
        p.life -= 0.012; // Beautiful, long tactile duration for 3D elements
      } else if (p.targetX !== undefined && p.targetY !== undefined) {
        // HEART TRAJECTORY TO TARGET:
        // We use fractional life to interpolate between start position and target position
        // This ensures they line up in paths toward the streamer profile tag exactly as in the video.
        p.life -= 0.015; // Controlled flight speed
        const t = 1 - p.life; // Goes from 0 to 1

        // Smooth cubic-bezier interpolation
        const easeT = t * t * (3 - 2 * t);

        const startX = p.startX ?? p.x;
        const startY = p.startY ?? p.y;
        
        // Add curved path sway/arcing so they look organic heading to the endpoint
        const offsetDist = Math.sin(t * Math.PI) * (p.curveOffset ?? 50);
        
        p.x = startX + (p.targetX - startX) * easeT + offsetDist;
        p.y = startY + (p.targetY - startY) * easeT;

        // Scale down slightly as it approaches target
        p.size = (p.size * 0.98) > 8 ? p.size * 0.98 : 8;

        // Proximity arrival checking
        const dx = p.x - p.targetX;
        const dy = p.y - p.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15 || p.life <= 0.05) {
          triggerOnArrivalCount++;
          // Trigger a beautiful, concentrated sparkle star burst exactly at target coordinates!
          for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i + (Math.random() * 0.3);
            const speed = 2 + Math.random() * 4;
            extraSparkles.push({
              id: Math.random() + Date.now() + i,
              x: p.targetX,
              y: p.targetY,
              color: p.color,
              size: 3 + Math.random() * 5,
              rotation: Math.random() * Math.PI,
              opacity: 1,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 0.5,
              vr: (Math.random() - 0.5) * 0.3,
              life: 1.0 + Math.random() * 0.5,
              flip: 0,
              flipSpeed: 0,
              isSparkle: true
            });
          }
          return false;
        }
      } else {
        // Standard non-targeted likes float directly upwards
        p.x += p.vx + Math.sin(p.life * 8.5) * 1.6;
        p.y += p.vy;
        p.life -= 0.013;
      }
      
      p.rotation += p.vr;
      p.flip += p.flipSpeed;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0) {
        // Standard fade-out heart explosion
        if (!p.isSparkle) {
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + (Math.random() * 0.4);
            const speed = 1.5 + Math.random() * 2.5;
            extraSparkles.push({
              id: Math.random() + Date.now() + i,
              x: p.x,
              y: p.y,
              color: p.color,
              size: 2.5 + Math.random() * 3.5,
              rotation: Math.random() * Math.PI,
              opacity: 1,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 0.5,
              vr: (Math.random() - 0.5) * 0.2,
              life: 0.8 + Math.random() * 0.4,
              flip: 0,
              flipSpeed: 0,
              isSparkle: true
            });
          }
        }
        return false;
      }

      if (p.isSparkle) {
        drawSparkle(ctx, p.x, p.y, p.size, p.color, p.opacity);
      } else if (p.isSlime) {
        drawSlime(ctx, p.x, p.y, p.size, p.opacity, p.rotation, p.flip);
      } else if (p.isHorn) {
        drawHorn(ctx, p.x, p.y, p.size, p.opacity, p.rotation, p.flip);
      } else {
        drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, p.flip);
      }
      return true;
    });

    if (extraSparkles.length > 0) {
      particlesRef.current.push(...extraSparkles);
    }

    if (triggerOnArrivalCount > 0 && onArrival) {
      onArrival(triggerOnArrivalCount);
    }

    // Keep loop going only if we have active particles
    if (particlesRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    } else {
      isAnimatingRef.current = false;
    }
  }, [onArrival]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Resume loop on resize/mount only if active particles are pending
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
    // Determine if particle is targeted. By default on user tap,
    // we route exactly 50% of hearts directly to the streamer profile tag (isTargeted)
    // while the rest float organically up to keep the screen beautifully dynamic!
    const isTargeted = isTargetedForce ?? (targetX !== undefined && targetY !== undefined && Math.random() < 0.50);

    const rand = Math.random();
    const isSlime = rand < 0.20; // 20% slimy gold companion
    const isHorn = !isSlime && rand < 0.40; // 20% cute glossy party horn popper

    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      startX: x,
      startY: y,
      targetX: isTargeted ? targetX : undefined,
      targetY: isTargeted ? targetY : undefined,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: (isSlime || isHorn) ? 18 + Math.random() * 12 : 15 + Math.random() * 14,
      rotation: (Math.random() - 0.5) * Math.PI / 4,
      opacity: 1,
      vx: isTargeted ? 0 : (Math.random() - 0.5) * 4,
      vy: isTargeted ? 0 : -3.5 - Math.random() * 5.5,
      vr: (Math.random() - 0.5) * 0.1,
      life: 1.0,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: (Math.random() - 0.5) * 0.2,
      isSlime,
      isHorn,
      curveOffset: isTargeted ? (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 120, // Tighter queue for targeted hearts, organic wide arcing count for others
    };

    particlesRef.current.push(newParticle);
    
    if (onTap) onTap(x, y);

    // Dynamic animation loop starter
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    }
  }, [onTap, targetX, targetY, updateAndDraw]);

  useImperativeHandle(ref, () => ({
    triggerLike: (x?: number, y?: number, isTargetedForce?: boolean) => {
      const finalX = x ?? window.innerWidth * 0.75;
      const finalY = y ?? window.innerHeight - 100;
      addParticle(finalX, finalY, isTargetedForce);
    },
    triggerExplosion: (x: number, y: number) => {
      const blastParticles: Particle[] = [];
      const colorsToUse = COLORS;

      // 1. Generate beautiful, shimmering sparkles (16 particles)
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 / 16) * i + (Math.random() * 0.3);
        const speed = 3.0 + Math.random() * 6.0;
        blastParticles.push({
          id: Math.random() + Date.now() + i,
          x,
          y,
          color: colorsToUse[Math.floor(Math.random() * colorsToUse.length)],
          size: 4 + Math.random() * 4.5,
          rotation: Math.random() * Math.PI,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          vr: (Math.random() - 0.5) * 0.4,
          life: 1.2 + Math.random() * 0.6,
          flip: 0,
          flipSpeed: 0,
          isSparkle: true
        });
      }

      // 2. Generate 3D Hearts with 360-degree extrusion (8 particles)
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + (Math.random() * 0.4);
        const speed = 4.0 + Math.random() * 5.0;
        blastParticles.push({
          id: Math.random() + Date.now() + 100 + i,
          x,
          y,
          color: colorsToUse[Math.floor(Math.random() * colorsToUse.length)],
          size: 14 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.0, // Initial upward pop force
          vr: (Math.random() - 0.5) * 0.12,
          life: 1.5 + Math.random() * 0.5,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: (Math.random() - 0.5) * 0.15,
          isExplosionBlast: true
        });
      }

      // 3. Generate 3D Golden Slime Mascots (4 particles)
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i + (Math.random() * 0.5);
        const speed = 4.5 + Math.random() * 3.5;
        blastParticles.push({
          id: Math.random() + Date.now() + 200 + i,
          x,
          y,
          color: '#FFD700', // Gold color fallback
          size: 20 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          vr: (Math.random() - 0.5) * 0.08,
          life: 1.6 + Math.random() * 0.4,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: (Math.random() - 0.5) * 0.12,
          isSlime: true,
          isExplosionBlast: true
        });
      }

      // 4. Generate 3D Party Horn popper icons (4 particles)
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 / 4) * i + Math.random() * 0.4;
        const speed = 4.0 + Math.random() * 4.0;
        blastParticles.push({
          id: Math.random() + Date.now() + 300 + i,
          x,
          y,
          color: '#FF1493',
          size: 20 + Math.random() * 6,
          rotation: Math.random() * Math.PI * 2,
          opacity: 1,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.8,
          vr: (Math.random() - 0.5) * 0.1,
          life: 1.6 + Math.random() * 0.4,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: (Math.random() - 0.5) * 0.12,
          isHorn: true,
          isExplosionBlast: true
        });
      }

      particlesRef.current.push(...blastParticles);

      // 5. Helper function to deploy secondary sparkle/classic heart blasts (previous style)
      const triggerSecondarySparkleBlast = (bx: number, by: number) => {
        const secondaryParticles: Particle[] = [];
        
        // Spawn ring of fast-expanding colorful sparkles
        for (let i = 0; i < 18; i++) {
          const angle = (Math.PI * 2 / 18) * i + (Math.random() * 0.3);
          const speed = 2.5 + Math.random() * 5.0;
          secondaryParticles.push({
            id: Math.random() + Date.now() + 1000 + i,
            x: bx,
            y: by,
            color: colorsToUse[Math.floor(Math.random() * colorsToUse.length)],
            size: 3 + Math.random() * 4.5,
            rotation: Math.random() * Math.PI,
            opacity: 1,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.2,
            vr: (Math.random() - 0.5) * 0.4,
            life: 1.1 + Math.random() * 0.5,
            flip: 0,
            flipSpeed: 0,
            isSparkle: true
          });
        }

        // Spawn ring of floaty classic hearts
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i + (Math.random() * 0.3);
          const speed = 3.0 + Math.random() * 4.0;
          secondaryParticles.push({
            id: Math.random() + Date.now() + 2000 + i,
            x: bx,
            y: by,
            color: colorsToUse[Math.floor(Math.random() * colorsToUse.length)],
            size: 10 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            opacity: 1,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.0,
            vr: (Math.random() - 0.5) * 0.15,
            life: 1.3 + Math.random() * 0.4,
            flip: Math.random() * Math.PI * 2,
            flipSpeed: (Math.random() - 0.5) * 0.12,
            isExplosionBlast: true
          });
        }

        particlesRef.current.push(...secondaryParticles);

        if (!isAnimatingRef.current) {
          isAnimatingRef.current = true;
          animationFrameRef.current = requestAnimationFrame(updateAndDraw);
        }
      };

      // Schedule multiple secondary blasts in a beautiful cascading sequence around the target
      setTimeout(() => triggerSecondarySparkleBlast(x - 60, y + 20), 200);
      setTimeout(() => triggerSecondarySparkleBlast(x + 70, y - 30), 400);
      setTimeout(() => triggerSecondarySparkleBlast(x - 30, y - 80), 600);
      setTimeout(() => triggerSecondarySparkleBlast(x + 50, y + 60), 800);
      setTimeout(() => triggerSecondarySparkleBlast(x, y), 1000); // Grand finale final burst!

      // Start the loop if not already running
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
