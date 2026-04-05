import React from 'react';
import { motion } from 'framer-motion';
import { getBadgeStyle } from '../fanClubLogic';

interface FanClubBadgeProps {
  level: number;
  hostName: string;
}

/**
 * 🏷️ FAN CLUB BADGE COMPONENT
 * A small, colorful badge displayed next to the fan's name in chat.
 */
export const FanClubBadge: React.FC<FanClubBadgeProps> = ({ level, hostName }) => {
  const { color, label } = getBadgeStyle(level);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 h-5 px-1.5 rounded-sm border border-white/20 shadow-sm"
      style={{ backgroundColor: `${color}40`, borderColor: `${color}60` }}
    >
      {/* 1. Heart Icon */}
      <span className="text-[10px]" style={{ color }}>❤️</span>

      {/* 2. Host Name Abbreviation & Level */}
      <span className="text-[9px] font-black uppercase tracking-tight text-white drop-shadow-sm">
        {hostName.substring(0, 2)} {level}
      </span>

      {/* 3. Glossy Shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </motion.div>
  );
};
