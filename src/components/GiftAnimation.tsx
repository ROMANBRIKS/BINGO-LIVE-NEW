import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift as GiftIcon } from 'lucide-react';

const KissAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const drawLips = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Animation values
      const scale = 1 + Math.sin(frame * 0.1) * 0.05;
      const wobble = Math.sin(frame * 0.05) * 5;
      
      ctx.save();
      ctx.translate(centerX, centerY + wobble);
      ctx.scale(scale, scale);
      
      // Draw Lips (Top)
      const drawLipHalf = (isTop: boolean) => {
        ctx.beginPath();
        const color = isTop ? '#FF1744' : '#D50000';
        const gradient = ctx.createRadialGradient(0, isTop ? -10 : 10, 0, 0, 0, 60);
        gradient.addColorStop(0, '#FF5252');
        gradient.addColorStop(0.6, color);
        gradient.addColorStop(1, '#880E4F');
        
        ctx.fillStyle = gradient;
        
        if (isTop) {
          // Top Lip
          ctx.moveTo(-50, 0);
          ctx.bezierCurveTo(-40, -30, -10, -35, 0, -15);
          ctx.bezierCurveTo(10, -35, 40, -30, 50, 0);
          ctx.bezierCurveTo(30, -5, 10, -5, 0, 0);
          ctx.bezierCurveTo(-10, -5, -30, -5, -50, 0);
        } else {
          // Bottom Lip
          ctx.moveTo(-50, 0);
          ctx.bezierCurveTo(-30, 35, 30, 35, 50, 0);
          ctx.bezierCurveTo(30, 10, 10, 10, 0, 5);
          ctx.bezierCurveTo(-10, 10, -30, 10, -50, 0);
        }
        ctx.fill();
        
        // Glossy Highlight
        ctx.beginPath();
        ctx.ellipse(isTop ? -15 : 15, isTop ? -15 : 15, 10, 4, isTop ? -0.5 : 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      };

      drawLipHalf(false); // Bottom first
      drawLipHalf(true);  // Top second
      
      ctx.restore();
      frame++;
      requestAnimationFrame(drawLips);
    };

    drawLips();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -20 }}
      animate={{ scale: [0, 1.2, 1], opacity: 1, rotate: 0 }}
      exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: "backOut" }}
      className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none"
    >
      <div className="relative">
        <canvas ref={canvasRef} width={300} height={300} className="drop-shadow-[0_0_50px_rgba(255,23,68,0.6)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full font-black italic uppercase tracking-widest shadow-xl border-2 border-white/20">
            Mwah! 💋
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FlowerAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const drawFlower = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const scale = 1 + Math.sin(frame * 0.05) * 0.03;
      const rotate = Math.sin(frame * 0.02) * 0.1;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotate);
      ctx.scale(scale, scale);
      
      // Stem
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.quadraticCurveTo(10, 60, 0, 100);
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Leaf
      ctx.beginPath();
      ctx.moveTo(5, 50);
      ctx.quadraticCurveTo(25, 40, 30, 60);
      ctx.quadraticCurveTo(15, 70, 5, 50);
      ctx.fillStyle = '#43A047';
      ctx.fill();

      // Petals (Rose style)
      const drawPetal = (angle: number, size: number, color: string) => {
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-size, -size * 1.5, size, -size * 1.5, 0, 0);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      };

      // Outer petals
      for (let i = 0; i < 5; i++) {
        drawPetal((i * Math.PI * 2) / 5 + frame * 0.01, 40, '#C62828');
      }
      // Inner petals
      for (let i = 0; i < 5; i++) {
        drawPetal((i * Math.PI * 2) / 5 - frame * 0.015, 25, '#E53935');
      }
      // Center
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#B71C1C';
      ctx.fill();
      
      ctx.restore();
      frame++;
      requestAnimationFrame(drawFlower);
    };

    drawFlower();
  }, []);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.5 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.8, ease: "backOut" }}
      className="fixed inset-0 flex items-center justify-center z-[200] pointer-events-none"
    >
      <div className="relative">
        <canvas ref={canvasRef} width={300} height={300} className="drop-shadow-[0_0_40px_rgba(229,57,53,0.5)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2 rounded-full font-black italic uppercase tracking-widest shadow-xl border-2 border-white/20">
            For You! 🌹
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const GiftAnimation = React.memo(({ giftName, displayName, combo = 1, animationType }: { giftName: string, displayName: string, combo?: number, animationType?: string }) => {
  return (
    <>
      <motion.div 
        initial={{ x: -200, opacity: 0, scale: 0.8 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 200, opacity: 0, scale: 0.8 }}
        className="fixed top-1/3 left-4 z-[150] flex items-center gap-3 bg-gradient-to-r from-orange-600/90 via-pink-600/90 to-purple-600/90 backdrop-blur-md p-1.5 pr-8 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)] border border-white/30"
      >
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
          <GiftIcon size={24} className="text-orange-500 relative z-10" />
        </div>
        <div className="flex flex-col">
          <p className="text-white font-black italic text-[11px] uppercase leading-none drop-shadow-md">{displayName}</p>
          <p className="text-yellow-300 font-black text-[9px] uppercase tracking-wider drop-shadow-sm">Sent {giftName}</p>
        </div>
        {combo > 1 && (
          <motion.div 
            key={combo}
            initial={{ scale: 2, rotate: 20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-yellow-400 text-black font-black italic text-sm px-3 py-1 rounded-full shadow-xl border-2 border-white transform rotate-12"
          >
            X{combo}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {animationType === 'kiss' && <KissAnimation key="kiss" />}
        {animationType === 'flower' && <FlowerAnimation key="flower" />}
      </AnimatePresence>
    </>
  );
});

GiftAnimation.displayName = 'GiftAnimation';
