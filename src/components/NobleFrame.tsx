import React from 'react';
import { motion } from 'framer-motion';
import { NOBLE_LEVELS, NobleTier } from '../NobleTypes';

interface NobleFrameProps {
  tier: NobleTier;
  children: React.ReactNode;
  size?: number;
}

/**
 * 🖼️ NOBLE PROFILE FRAME COMPONENT
 * A premium visual border that wraps around user avatars based on their Noble tier.
 */
export const NobleFrame: React.FC<NobleFrameProps> = ({ tier, children, size = 64 }) => {
  const levelData = NOBLE_LEVELS[tier];

  // If no noble tier or no premium frame, just return the children
  if (!levelData || tier === 'None' || !levelData.hasPremiumFrame) {
    return <div style={{ width: size, height: size }}>{children}</div>;
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 1. The Main Frame Border */}
      <motion.div
        animate={levelData.rank >= 5 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-10 rounded-full border-4 pointer-events-none"
        style={{ 
          borderColor: levelData.color,
          boxShadow: `0 0 15px ${levelData.glowColor}, inset 0 0 10px ${levelData.glowColor}`
        }}
      >
        {/* 2. Animated Shine Effect for high ranks */}
        {levelData.rank >= 3 && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 rounded-full border-2 border-dashed opacity-30"
            style={{ borderColor: levelData.color }}
          />
        )}

        {/* 3. Glossy Highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* 4. The Avatar/Content */}
      <div className="absolute inset-1 rounded-full overflow-hidden z-0">
        {children}
      </div>

      {/* 5. Rank Badge Mini-Icon */}
      <div 
        className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg border border-white/40"
        style={{ backgroundColor: levelData.color }}
      >
        {levelData.badgeIcon}
      </div>
    </div>
  );
};
