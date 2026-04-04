import React from 'react';
import { motion } from 'framer-motion';
import { NOBLE_LEVELS, NobleTier } from '../NobleTypes';

/**
 * 👑 NOBLE BADGE COMPONENT
 * A high-gloss, animated badge that physically draws the Noble tier icons.
 * Uses CSS gradients and box-shadows to create a "shiny" sticker effect.
 */

interface NobleBadgeProps {
  tier: NobleTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const NobleBadge: React.FC<NobleBadgeProps> = ({ tier, size = 'md', showLabel = false }) => {
  const level = NOBLE_LEVELS[tier];
  
  if (tier === 'None') return null;

  const sizeMap = {
    sm: { width: 'w-6', height: 'h-6', fontSize: 'text-[10px]', iconSize: 'text-xs' },
    md: { width: 'w-10', height: 'h-10', fontSize: 'text-xs', iconSize: 'text-xl' },
    lg: { width: 'w-16', height: 'h-16', fontSize: 'text-sm', iconSize: 'text-3xl' }
  };

  const { width, height, fontSize, iconSize } = sizeMap[size];

  // Custom Metallic Gradients for each tier
  const gradients: Record<NobleTier, string> = {
    'None': 'from-gray-400 to-gray-500',
    'Baron': 'from-[#cd7f32] via-[#e59e5a] to-[#8b4513]', // Bronze
    'Duke': 'from-[#c0c0c0] via-[#ffffff] to-[#708090]', // Silver
    'Grand Duke': 'from-[#ffd700] via-[#fff3b0] to-[#b8860b]', // Gold
    'Archduke': 'from-[#e5e4e2] via-[#ffffff] to-[#a9a9a9]', // Platinum
    'King': 'from-[#ff4d4f] via-[#ff7875] to-[#a8071a]', // Royal Red
    'Emperor': 'from-[#722ed1] via-[#b37feb] to-[#391085]', // Imperial Purple
    'Global God': 'from-[#00d8ff] via-[#b7f4ff] to-[#0050b3]', // Celestial Blue
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: 1,
          boxShadow: [
            `0 0 5px ${level.glowColor}`,
            `0 0 15px ${level.glowColor}`,
            `0 0 5px ${level.glowColor}`
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`${width} ${height} rounded-full flex items-center justify-center bg-gradient-to-br ${gradients[tier]} border border-white/40 shadow-xl relative overflow-hidden`}
      >
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none" />
        
        {/* Tier Icon */}
        <span className={`${iconSize} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10`}>
          {level.badgeIcon}
        </span>
      </motion.div>

      {showLabel && (
        <span className={`${fontSize} font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r ${gradients[tier]} drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}>
          {tier}
        </span>
      )}
    </div>
  );
};
