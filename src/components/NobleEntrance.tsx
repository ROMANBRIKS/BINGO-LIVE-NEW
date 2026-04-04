import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NobleTier, NOBLE_LEVELS } from '../NobleTypes';
import { NobleBadge } from './NobleBadge';

/**
 * 👑 NOBLE ENTRANCE COMPONENT
 * File: NobleEntrance.tsx
 * 
 * This component triggers a high-impact, glossy "Welcome" animation
 * when a Noble user enters a live room.
 */

interface NobleEntranceProps {
  user: {
    displayName: string;
    tier: NobleTier;
  } | null;
  onComplete?: () => void;
}

export const NobleEntrance: React.FC<NobleEntranceProps> = ({ user, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user && user.tier !== 'None') {
      setIsVisible(true);
      const duration = NOBLE_LEVELS[user.tier].entranceDuration * 1000;
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [user, onComplete]);

  if (!user || user.tier === 'None') return null;

  // Metallic Gradients matching the badges
  const gradients: Record<NobleTier, string> = {
    'None': 'from-gray-400 to-gray-500',
    'Baron': 'from-[#cd7f32] via-[#e59e5a] to-[#8b4513]',
    'Duke': 'from-[#c0c0c0] via-[#ffffff] to-[#708090]',
    'Grand Duke': 'from-[#ffd700] via-[#fff3b0] to-[#b8860b]',
    'Archduke': 'from-[#e5e4e2] via-[#ffffff] to-[#a9a9a9]',
    'King': 'from-[#ff4d4f] via-[#ff7875] to-[#a8071a]',
    'Emperor': 'from-[#722ed1] via-[#b37feb] to-[#391085]',
    'Global God': 'from-[#00d8ff] via-[#b7f4ff] to-[#0050b3]',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed top-1/4 left-0 right-0 z-[200] flex justify-center pointer-events-none"
        >
          <div className={`relative px-8 py-4 rounded-r-full flex items-center gap-4 bg-gradient-to-r ${gradients[user.tier]} shadow-[0_0_30px_rgba(0,0,0,0.5)] border-y border-r border-white/40 overflow-hidden`}>
            
            {/* Glossy Shine Animation */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            />

            {/* Noble Badge */}
            <NobleBadge tier={user.tier} size="md" />

            {/* Welcome Text */}
            <div className="flex flex-col z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 drop-shadow-sm">
                Noble Entrance
              </span>
              <span className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] italic">
                {user.displayName} <span className="text-sm not-italic opacity-80">has arrived</span>
              </span>
            </div>

            {/* Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 90, 180]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.3 
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"
                  style={{ 
                    top: `${Math.random() * 100}%`, 
                    left: `${Math.random() * 100}%` 
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
