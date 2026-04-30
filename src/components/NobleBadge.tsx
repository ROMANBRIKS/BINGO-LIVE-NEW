import React from 'react';
import { motion } from 'motion/react';
import { NOBLE_LEVELS, NobleTier } from '../NobleTypes';

/**
 * 👑 NOBLE BADGE COMPONENT
 * A high-gloss, animated badge that physically draws the Noble tier icons.
 * Uses CSS gradients and box-shadows to create a "shiny" sticker effect.
 */

interface NobleBadgeProps {
  tier: NobleTier;
  gender?: 'male' | 'female';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const NobleBadge: React.FC<NobleBadgeProps> = ({ tier, gender = 'male', size = 'md', showLabel = false }) => {
  const level = NOBLE_LEVELS[tier] || NOBLE_LEVELS['None'];
  
  if (tier === 'None' || !level) return null;

  const displayTitle = gender === 'female' && level.femaleTitle ? level.femaleTitle : tier;

  const sizeMap = {
    xs: { width: 'w-4', height: 'h-4', fontSize: 'text-[8px]', iconSize: 'text-[8px]' },
    sm: { width: 'w-6', height: 'h-6', fontSize: 'text-[10px]', iconSize: 'text-xs' },
    md: { width: 'w-10', height: 'h-10', fontSize: 'text-xs', iconSize: 'text-xl' },
    lg: { width: 'w-16', height: 'h-16', fontSize: 'text-sm', iconSize: 'text-3xl' }
  };

  const { width, height, fontSize, iconSize } = sizeMap[size];

  // Custom Metallic Gradients for each tier
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
          {displayTitle}
        </span>
      )}
    </div>
  );
};
