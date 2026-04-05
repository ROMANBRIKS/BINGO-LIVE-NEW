import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PKShield, getShieldRemainingPercent } from '../pkShieldLogic';

interface PKShieldOverlayProps {
  activeShield: PKShield | null;
  absorbedPoints: number;
  timeLeft: number; // Seconds remaining in shield duration
  isHost: boolean;
}

/**
 * 🛡️ PK SHIELD OVERLAY COMPONENT
 * A protective visual layer over the streamer's score bar during a PK.
 */
export const PKShieldOverlay: React.FC<PKShieldOverlayProps> = ({ 
  activeShield, 
  absorbedPoints, 
  timeLeft,
  isHost 
}) => {
  if (!activeShield) return null;

  const healthPercent = getShieldRemainingPercent(activeShield, absorbedPoints);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2 }}
        className={`absolute top-[68px] ${isHost ? 'left-0' : 'right-0'} w-1/2 h-8 z-50 pointer-events-none`}
      >
        {/* 1. Shield Visual Glow */}
        <div 
          className="absolute inset-0 border-2 rounded-sm blur-[2px] transition-colors duration-500"
          style={{ 
            borderColor: activeShield.color,
            backgroundColor: `${activeShield.color}20`, // 20% opacity hex
            boxShadow: `inset 0 0 15px ${activeShield.glowColor}`
          }}
        />

        {/* 2. Health / Durability Bar */}
        <div className="absolute -top-1 left-2 right-2 h-1 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${healthPercent}%` }}
            className="h-full bg-gradient-to-r from-white/80 to-transparent"
            style={{ backgroundColor: activeShield.color }}
          />
        </div>

        {/* 3. Shield Badge & Timer */}
        <div className={`absolute ${isHost ? 'left-2' : 'right-2'} -bottom-5 flex items-center gap-1.5`}>
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg"
            style={{ backgroundColor: activeShield.color }}
          >
            🛡️
          </div>
          <span className="text-[10px] font-black text-white drop-shadow-md">
            {activeShield.tier.toUpperCase()} SHIELD · {timeLeft}s
          </span>
        </div>

        {/* 4. Absorption "Impact" Animation */}
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 bg-white/10"
        />
      </motion.div>
    </AnimatePresence>
  );
};
