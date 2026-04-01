import React, { useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
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
}

interface LikeParticlesProps {
  onTap?: (x: number, y: number) => void;
}

export interface LikeParticlesRef {
  triggerLike: (x?: number, y?: number) => void;
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

export const LikeParticles = forwardRef<LikeParticlesRef, LikeParticlesProps>(({ onTap }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, opacity: number, rotation: number, flip: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Calculate flip scale
    const flipScale = Math.cos(flip);
    ctx.scale(flipScale, 1);
    ctx.globalAlpha = opacity;
    
    const d = size;
    
    // Create path for the heart (slightly plumper for a "thicker" look)
    const createHeartPath = (context: CanvasRenderingContext2D) => {
      context.beginPath();
      context.moveTo(0, d / 4);
      context.bezierCurveTo(0, d / 4, -d / 3, -d / 2, -d / 2, -d / 4);
      context.bezierCurveTo(-d * 0.9, d / 4, -d / 2, d, 0, d * 1.3);
      context.bezierCurveTo(d / 2, d, d * 0.9, d / 4, d / 2, -d / 4);
      context.bezierCurveTo(d / 3, -d / 2, 0, d / 4, 0, d / 4);
    };

    // 1. Draw "Thickness" (Side of the heart)
    // This creates a 3D edge effect when the heart is rotating
    if (Math.abs(flipScale) < 0.95) {
      ctx.save();
      // Offset slightly to create depth
      ctx.translate(2 * (flipScale > 0 ? -1 : 1), 1); 
      ctx.fillStyle = adjustColor(color, -60);
      createHeartPath(ctx);
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw main heart with stronger radial gradient for volume
    const gradient = ctx.createRadialGradient(-d/4, -d/4, 0, 0, 0, d);
    gradient.addColorStop(0, adjustColor(color, 30)); // Brighter center
    gradient.addColorStop(0.6, color); 
    gradient.addColorStop(1, adjustColor(color, -50)); // Darker edge
    
    ctx.fillStyle = gradient;
    createHeartPath(ctx);
    ctx.fill();

    // 3. Add a more pronounced glossy highlight
    ctx.beginPath();
    ctx.ellipse(-d/3, -d/4, d/3.5, d/5, Math.PI / 4, 0, Math.PI * 2);
    const highlightGradient = ctx.createLinearGradient(-d/2, -d/2, 0, 0);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)'); // Brighter highlight
    highlightGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // 4. Add a subtle rim light for extra definition
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    createHeartPath(ctx);
    ctx.stroke();
    
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      p.flip += p.flipSpeed;
      p.life -= 0.015;
      p.opacity = Math.max(0, p.life);

      if (p.life <= 0) return false;

      drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, p.flip);
      return true;
    });

    animationFrameRef.current = requestAnimationFrame(updateAndDraw);
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
    animationFrameRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateAndDraw]);

  const addParticle = useCallback((x: number, y: number) => {
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 15 + Math.random() * 15,
      rotation: (Math.random() - 0.5) * Math.PI / 4,
      opacity: 1,
      vx: (Math.random() - 0.5) * 4,
      vy: -4 - Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.1,
      life: 1,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: (Math.random() - 0.5) * 0.2,
    };

    particlesRef.current.push(newParticle);
    
    if (onTap) onTap(x, y);
  }, [onTap]);

  useImperativeHandle(ref, () => ({
    triggerLike: (x?: number, y?: number) => {
      const finalX = x ?? window.innerWidth / 2;
      const finalY = y ?? window.innerHeight - 100;
      addParticle(finalX, finalY);
    }
  }));

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    addParticle(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 cursor-pointer overflow-hidden pointer-events-auto"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      style={{ touchAction: 'none' }}
    />
  );
});
