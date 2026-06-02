import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NobleTier, NOBLE_LEVELS } from '../NobleTypes';
import { NobleBadge } from './NobleBadge';
import { NobleFrame } from './NobleFrame';

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
    gender?: 'male' | 'female';
    photoURL?: string;
  } | null;
  onComplete?: () => void;
}

export const NobleEntrance: React.FC<NobleEntranceProps> = ({ user, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeUser, setActiveUser] = useState<NobleEntranceProps['user']>(null);

  useEffect(() => {
    if (user && user.tier !== 'None') {
      setActiveUser(user);
      setIsVisible(true);
      
      const levelData = NOBLE_LEVELS[user.tier];
      if (!levelData) return;

      const duration = levelData.rank * 1000;
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Wait for animation to finish before clearing user
        setTimeout(() => {
          if (onComplete) onComplete();
          setActiveUser(null);
        }, 200);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [user, onComplete]);

  // Don't return null if we have a user or are currently visible
  if (!user && !activeUser) return null;

  const displayUser = activeUser || user;
  if (!displayUser || !displayUser.tier || displayUser.tier === 'None') return null;

  const levelData = NOBLE_LEVELS[displayUser.tier];
  if (!levelData) return null;
  const duration = levelData.rank || 5;

  // Metallic Gradients matching the badges
  const gradients: Record<NobleTier, string> = {
    'None': 'from-gray-400 to-gray-500',
    'Knight': 'from-[#cd7f32] via-[#e59e5a] to-[#8b4513]',
    'Viscount': 'from-[#b87333] via-[#d2691e] to-[#8b4513]',
    'Earl': 'from-[#a0522d] via-[#d2691e] to-[#8b4513]',
    'Marquis': 'from-[#3b82f6] via-[#60a5fa] to-[#1d4ed8]',
    'Baron': 'from-[#2563eb] via-[#3b82f6] to-[#1e40af]',
    'Viscount Elite': 'from-[#1d4ed8] via-[#3b82f6] to-[#1e3a8a]',
    'Earl Elite': 'from-[#1e40af] via-[#3b82f6] to-[#172554]',
    'Duke': 'from-[#ffd700] via-[#fff3b0] to-[#b8860b]',
    'Grand Duke': 'from-[#ffcc00] via-[#fff3b0] to-[#b8860b]',
    'Archduke': 'from-[#ffb700] via-[#fff3b0] to-[#b8860b]',
    'Prince': 'from-[#a855f7] via-[#c084fc] to-[#7e22ce]',
    'Crown Prince': 'from-[#9333ea] via-[#c084fc] to-[#6b21a8]',
    'King': 'from-[#7e22ce] via-[#a855f7] to-[#581c87]',
    'Emperor': 'from-[#ec4899] via-[#f472b6] to-[#be185d]',
    'Great Emperor': 'from-[#db2777] via-[#f472b6] to-[#9d174d]',
    'Legendary Emperor': 'from-[#be185d] via-[#f472b6] to-[#831843]',
    'Supreme Emperor': 'from-[#9d174d] via-[#f472b6] to-[#500724]',
    'Overlord': 'from-[#831843] via-[#be185d] to-[#500724]',
    'Demi-God': 'from-[#a855f7] via-[#c084fc] to-[#7e22ce]',
    'God of War': 'from-[#9333ea] via-[#c084fc] to-[#6b21a8]',
    'Celestial God': 'from-[#7e22ce] via-[#a855f7] to-[#581c87]',
    'Global God': 'from-[#ffffff] via-[#f3f4f6] to-[#9ca3af]',
  };

  return (
    <AnimatePresence>
      {isVisible && displayUser && (
        <motion.div
          key={`${displayUser.displayName}-${displayUser.tier}`}
          initial={{ x: '100vw', opacity: 0 }}
          animate={{ 
            x: '-100vw', 
            opacity: [0, 1, 1, 0] 
          }}
          transition={{ 
            x: { duration: duration, ease: "linear" },
            opacity: { duration: duration, ease: "linear", times: [0, 0.1, 0.9, 1] }
          }}
          className="fixed top-[35%] left-0 right-0 z-[9999] flex justify-center pointer-events-none"
        >
          <div className="relative flex items-center">
            {/* The Badge - Positioned to overlap slightly, size remains 'md' */}
            <div className="z-20 -mr-3 drop-shadow-xl">
              <NobleBadge tier={displayUser.tier} gender={displayUser.gender} size="md" />
            </div>

            {/* The Banner Body - Reduced in size */}
            <div className={`relative pl-5 pr-4 py-1 rounded-full flex items-center gap-2 bg-gradient-to-r ${gradients[displayUser.tier] || 'from-purple-500 via-indigo-500 to-blue-600'} shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/30 overflow-hidden`}>
              
              {/* Glossy Shine Animation */}
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />

              {/* Avatar - Reduced size */}
              {displayUser.photoURL && (
                <div className="z-10">
                  <NobleFrame tier={displayUser.tier} size={28}>
                    <img src={displayUser.photoURL} alt="" className="w-full h-full object-cover rounded-full" />
                  </NobleFrame>
                </div>
              )}

              {/* Welcome Text - Reduced sizes */}
              <div className="flex flex-col z-10">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/80 leading-none mb-0.5 drop-shadow-sm">
                  Noble Arrival
                </span>
                <span className="text-xs font-black text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] italic whitespace-nowrap">
                  {displayUser.displayName} <span className="text-[9px] not-italic opacity-80">has arrived</span>
                </span>
              </div>

              {/* Sparkles - Scaled down */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [0, 1.2, 0],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_5px_white]"
                    style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%` 
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
