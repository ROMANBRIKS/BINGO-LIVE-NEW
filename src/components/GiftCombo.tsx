import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { getGiftingEffect } from '../nobleGiftingLogic';
import { NobleTier } from '../NobleTypes';

interface GiftComboProps {
  giftName: string;
  giftImage?: string;
  displayName: string;
  userPhoto?: string;
  combo: number;
  nobleTier?: string;
  onComplete: () => void;
}

export const GiftCombo: React.FC<GiftComboProps> = ({ 
  giftName, 
  giftImage,
  displayName, 
  userPhoto, 
  combo, 
  nobleTier = 'None',
  onComplete 
}) => {
  const [displayCombo, setDisplayCombo] = useState(1);
  const [isPulsing, setIsPulsing] = useState(false);
  const effects = getGiftingEffect({ nobleTitle: nobleTier as NobleTier } as any);

  // Incremental counting logic
  useEffect(() => {
    if (displayCombo < combo) {
      const diff = combo - displayCombo;
      
      // If the difference is huge (like 999), we count faster, 
      // but for normal amounts like 10 or 99, we want to see the numbers climb.
      const increment = diff > 100 ? Math.ceil(diff / 20) : 1;
      
      const timer = setTimeout(() => {
        setDisplayCombo(prev => Math.min(prev + increment, combo));
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 30);
      }, 50); // 50ms per tick for a smooth, fast climb
      
      return () => clearTimeout(timer);
    }
  }, [combo, displayCombo]);

  // Auto-hide logic
  useEffect(() => {
    if (displayCombo === combo && combo > 0) {
      // Once counting is done, wait a very short moment then slide out
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); // Reduced from 3s to 1s for faster cleanup
      return () => clearTimeout(timer);
    }
  }, [displayCombo, combo, onComplete]);

  return (
    <motion.div
      initial={{ x: -200, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -300, opacity: 0, scale: 0.5, transition: { duration: 0.3, ease: "easeIn" } }}
      transition={{ type: "spring", damping: 15, stiffness: 120 }}
      className="flex items-center gap-3 pointer-events-none mb-2"
    >
      {/* Banner - Reduced by 30% */}
      <div className={cn(
        "flex items-center gap-2 backdrop-blur-md pl-1 pr-8 py-1 rounded-full border shadow-2xl relative overflow-hidden",
        effects.hasShine ? "bg-gradient-to-r from-yellow-600/90 via-yellow-400/90 to-transparent border-yellow-200/50" : 
        "bg-gradient-to-r from-black/80 via-black/40 to-transparent border-white/10"
      )}>
        {/* User Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full overflow-hidden border-2 shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10",
          effects.hasShine ? "border-white" : "border-yellow-400"
        )}>
          <img 
            src={userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Text Info */}
        <div className="flex flex-col z-10">
          <span className="text-[10px] font-black text-white leading-none drop-shadow-md uppercase tracking-tighter">
            {displayName}
          </span>
          <span className={cn(
            "text-[8px] font-bold italic drop-shadow-sm mt-0.5",
            effects.hasShine ? "text-white" : "text-yellow-400"
          )}>
            Sent {giftName}
          </span>
        </div>

        {/* Shine Effect */}
        {effects.hasShine && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
          />
        )}

        {/* Gift Image - Floating at the end of the banner */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-20">
          {giftImage ? (
            giftImage.startsWith('/') || giftImage.startsWith('http') ? (
              <img src={giftImage} alt="" className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            ) : (
              <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{giftImage}</span>
            )
          ) : (
            <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🎁</span>
          )}
        </div>
      </div>

      {/* Multiplier - Positioned further right */}
      <motion.div
        key={displayCombo}
        animate={
          displayCombo === combo 
            ? { scale: [1.2, 1.8, 1.4], rotate: [0, 15, 0] } // Final "Bomb" pop
            : isPulsing 
              ? { scale: [1, 1.4, 1.2], rotate: [0, -5, 0] } 
              : { scale: 1.2 }
        }
        transition={{ duration: 0.2 }}
        className="flex items-center ml-4"
      >
        <span className="text-3xl font-black italic text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] select-none flex items-baseline">
          <span className="text-yellow-400 text-xl mr-0.5 font-black not-italic">X</span>
          <span className="bg-gradient-to-b from-white to-yellow-400 bg-clip-text text-transparent">
            {displayCombo}
          </span>
        </span>
      </motion.div>
    </motion.div>
  );
};
