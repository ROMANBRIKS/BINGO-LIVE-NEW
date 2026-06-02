import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift as GiftIcon, Sparkles, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { getGiftingEffect } from '../nobleGiftingLogic';
import { NobleTier } from '../NobleTypes';
import { LottieAnimation } from './LottieAnimation';

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

export const GiftAnimation = React.memo(({ 
  giftName, 
  displayName, 
  combo = 1, 
  animationType, 
  nobleTier = 'None',
  familyName,
  animationUrl,
  giftType,
  cost = 0
}: { 
  giftName: string, 
  displayName: string, 
  combo?: number, 
  animationType?: string, 
  nobleTier?: string,
  familyName?: string,
  animationUrl?: string,
  giftType?: string,
  cost?: number
}) => {
  const effects = getGiftingEffect({ nobleTitle: nobleTier as NobleTier } as any);
  const [showImpact, setShowImpact] = React.useState(false);
  const [showMainAsset, setShowMainAsset] = React.useState(false);

  // Play flight and impact in cascade sequence
  React.useEffect(() => {
    const impactTimer = setTimeout(() => setShowImpact(true), 1100);
    const assetTimer = setTimeout(() => setShowMainAsset(true), 1200);
    return () => {
      clearTimeout(impactTimer);
      clearTimeout(assetTimer);
    };
  }, []);

  return (
    <>
      {/* 1. Curve Gifting Flight CSS path particles */}
      <div className="fixed inset-0 pointer-events-none z-[180]">
        {Array.from({ length: 15 }).map((_, i) => {
          const delay = i * 0.08;
          const duration = 1.0 + Math.random() * 0.3;
          return (
            <motion.div
              key={i}
              initial={{ x: "10vw", y: "85vh", opacity: 0, scale: 0.3 }}
              animate={{
                x: ["10vw", "28vw", "50vw"],
                y: ["85vh", "42vh", "45vh"],
                scale: [0.3, 1.4, 0.8],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: duration,
                delay: delay,
                ease: "easeOut"
              }}
              className="absolute w-5 h-5 rounded-full bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-600 shadow-[0_0_15px_rgba(234,179,8,0.8)] border border-white/20 flex items-center justify-center text-xs"
            >
              ✨
            </motion.div>
          );
        })}
      </div>

      {/* 2. Visual impact-fx shockwave on arrival */}
      {showImpact && (
        <motion.div
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: [0.1, 4.5], opacity: [1, 0] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-[190]"
        >
          <div className="w-16 h-16 rounded-full bg-radial-gradient border-8 border-yellow-300 shadow-[0_0_60px_rgba(234,179,8,0.9)]" />
        </motion.div>
      )}

      {/* 3. Huge centered Gift Animation Asset Panel (supports upload and fallback base64 urls) */}
      <AnimatePresence>
        {showMainAsset && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[200]">
            <motion.div
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 15 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              {(() => {
                const isLottie = giftType === 'lottie' || giftType === 'json' || (animationUrl && (animationUrl.endsWith('.json') || animationUrl.startsWith('data:application/json') || animationUrl.startsWith('data:text/json') || animationUrl.startsWith('data:application/octet-stream;base64,')));
                
                if (isLottie && animationUrl) {
                  return (
                    <div className="relative w-[320px] h-[320px] flex items-center justify-center drop-shadow-[0_0_50px_rgba(34,211,238,0.85)] rounded-full bg-cyan-950/10 p-4 border border-cyan-500/10 backdrop-blur-[1px] animate-pulse">
                      <LottieAnimation animationUrl={animationUrl} className="w-[300px] h-[300px]" loop={true} />
                    </div>
                  );
                }

                if (giftType === 'video' && animationUrl) {
                  return (
                    <div className="relative group p-1.5 rounded-3xl bg-black/60 border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-pulse">
                      <video 
                        src={animationUrl} 
                        autoPlay 
                        muted 
                        playsInline 
                        loop={false} 
                        className="max-w-[280px] h-auto rounded-2xl max-h-[280px]" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                  );
                }

                if ((giftType === 'gif' || giftType === 'image') && animationUrl) {
                  return (
                    <img 
                      src={animationUrl} 
                      className="max-w-[250px] h-auto object-contain max-h-[250px] drop-shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-bounce" 
                      alt={giftName}
                      referrerPolicy="no-referrer"
                    />
                  );
                }

                if (giftType === 'emoji') {
                  return (
                    <div className="text-[120px] drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] select-none animate-pulse">
                      🎁
                    </div>
                  );
                }

                if (animationUrl) {
                  return (
                    <img 
                      src={animationUrl} 
                      className="max-w-[220px] h-auto object-contain max-h-[220px] drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse" 
                      alt={giftName}
                      referrerPolicy="no-referrer"
                    />
                  );
                }

                return null;
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. God-Tier Big Spender Spotlight Bar */}
      {cost >= 1000 && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-lg bg-gradient-to-r from-amber-500/10 via-yellow-400/25 to-amber-500/10 border-y border-yellow-400/40 py-2.5 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(234,179,8,0.4)] z-[210] backdrop-blur-md rounded-2xl"
        >
          <Sparkles className="text-yellow-400 animate-pulse" size={16} />
          <div className="text-[10px] font-black uppercase italic tracking-widest text-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-yellow-300">
            ⭐ GOD-TIER GIFTER: {displayName} sent {giftName}! ⭐
          </div>
          <Sparkles className="text-yellow-400 animate-pulse" size={16} />
        </motion.div>
      )}

      {/* 5. MVP Pinned Badge Card */}
      {cost >= 100 && (
        <motion.div 
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 200, opacity: 0 }}
          className="fixed top-20 right-4 bg-[#0c0c0e]/95 border border-yellow-500/30 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.25)] z-[100] backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white text-base shadow-sm">
            👑
          </div>
          <div>
            <div className="text-[8px] font-black uppercase text-yellow-500 tracking-wider">ROOM MVP</div>
            <div className="text-[11px] font-black text-white">{displayName}</div>
            <div className="text-[8px] text-zinc-400 uppercase font-bold tracking-widest mt-0.5">Sent {giftName} (💎{cost})</div>
          </div>
        </motion.div>
      )}

      {/* 6. Standard Side floating combo flyer card */}
      <motion.div 
        initial={{ x: -250, opacity: 0, scale: 0.8 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 250, opacity: 0, scale: 0.8 }}
        className={cn(
          "fixed top-1/3 left-4 z-[150] flex items-center gap-3 backdrop-blur-md p-1.5 pr-8 rounded-full shadow-2xl border",
          effects.hasShine ? "bg-gradient-to-r from-yellow-600/90 via-yellow-400/90 to-yellow-600/90 border-yellow-200/50" : 
          "bg-gradient-to-r from-orange-600/90 via-pink-600/90 to-purple-600/90 border-white/30 shadow-[0_0_30px_rgba(249,115,22,0.4)]"
        )}
      >
        <div className={cn(
          "w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden",
          effects.hasShine && "border-2 border-yellow-200"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
          <GiftIcon size={24} className={cn("relative z-10", effects.hasShine ? "text-yellow-600" : "text-orange-500")} />
          
          {effects.hasSparkle && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles size={40} className="text-yellow-400/30" />
            </motion.div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <p className="text-white font-black italic text-[11px] uppercase leading-none drop-shadow-md">{displayName}</p>
            {effects.hasShine && <Zap size={10} fill="currentColor" className="text-yellow-200" />}
            {familyName && (
              <span className="text-[10px] bg-white/20 text-white font-black px-1.5 py-0.5 rounded italic">
                {familyName}
              </span>
            )}
          </div>
          <p className={cn(
            "font-black text-[9px] uppercase tracking-wider drop-shadow-sm",
            effects.hasShine ? "text-white" : "text-yellow-300"
          )}>Sent {giftName}</p>
        </div>
        
        {combo > 1 && (
          <motion.div 
            key={combo}
            initial={{ scale: 2, rotate: 20 }}
            animate={{ scale: 1, rotate: 0 }}
            className={cn(
              "absolute -right-4 top-1/2 -translate-y-1/2 font-black italic text-sm px-3 py-1 rounded-full shadow-xl border-2 transform rotate-12",
              effects.hasShine ? "bg-white text-yellow-600 border-yellow-200" : "bg-yellow-400 text-black border-white"
            )}
          >
            X{combo}
          </motion.div>
        )}
        
        {/* Family Shine Effect if in family */}
        {familyName && (
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-yellow-400/40 pointer-events-none"
          />
        )}
        
        {effects.hasShine && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
          />
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
