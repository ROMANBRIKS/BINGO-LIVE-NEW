import React from 'react';
import { cn } from '../lib/utils';

export const LevelBadge = React.memo(({ level, className }: { level: number, className?: string }) => {
  const getColors = () => {
    if (level >= 80) return "bg-gradient-to-r from-purple-600 to-pink-600";
    if (level >= 50) return "bg-gradient-to-r from-purple-500 to-indigo-600";
    if (level >= 20) return "bg-gradient-to-r from-blue-400 to-blue-600";
    if (level >= 10) return "bg-gradient-to-r from-cyan-400 to-cyan-600";
    return "bg-gradient-to-r from-orange-400 to-orange-600";
  };

  const getDiamondColor = () => {
    if (level >= 80) return "text-pink-200";
    if (level >= 50) return "text-purple-200";
    if (level >= 20) return "text-blue-100";
    if (level >= 10) return "text-cyan-100";
    return "text-orange-200";
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full shadow-sm border border-white/20 h-3.5 min-w-[24px] justify-center",
      getColors(),
      className
    )}>
      <svg viewBox="0 0 24 24" className={cn("w-2 h-2 fill-current", getDiamondColor())}>
        <path d="M12 2L4.5 12L12 22L19.5 12L12 2Z" />
      </svg>
      <span className="text-[8px] font-black text-white leading-none">
        {level}
      </span>
    </div>
  );
});

LevelBadge.displayName = 'LevelBadge';
