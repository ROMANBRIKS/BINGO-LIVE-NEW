import React from 'react';
import { motion } from 'framer-motion';

interface FamilyBadgeProps {
  familyName: string;
  familyLevel: number;
  familyBadgeIcon?: string;
}

/**
 * 👨‍👩‍👧‍👦 FAMILY BADGE COMPONENT
 * A unique identifier displayed next to the name of any user who belongs to a Family.
 */
export const FamilyBadge: React.FC<FamilyBadgeProps> = ({ familyName, familyLevel, familyBadgeIcon = '👨‍👩‍👧‍👦' }) => {
  // Determine color based on family level
  const getFamilyColor = (level: number): string => {
    if (level >= 10) return '#ef4444'; // Red for high-level families
    if (level >= 5) return '#3b82f6';  // Blue for mid-level families
    return '#64748b';                 // Slate for low-level families
  };

  const familyColor = getFamilyColor(familyLevel);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md border border-white/20 shadow-sm"
      style={{ backgroundColor: `${familyColor}40`, borderColor: `${familyColor}60` }}
    >
      {/* 1. Family Icon */}
      <span className="text-[10px]">{familyBadgeIcon}</span>

      {/* 2. Family Name & Level */}
      <span className="text-[9px] font-black uppercase tracking-tight text-white drop-shadow-sm">
        {familyName.substring(0, 3)} {familyLevel}
      </span>

      {/* 3. Glow Effect for high level families */}
      {familyLevel >= 10 && (
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-md shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        />
      )}
    </motion.div>
  );
};
