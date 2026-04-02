import React from 'react';
import { cn } from '../lib/utils';

export const LevelBadge = React.memo(({ level, className }: { level: number, className?: string }) => {
  const getColors = () => {
    if (level >= 80) return "from-purple-600 to-pink-600";
    if (level >= 50) return "from-red-500 to-orange-500";
    if (level >= 20) return "from-blue-500 to-cyan-500";
    return "from-orange-400 to-orange-600"; // Matches the brownish/orange diamond in the image
  };

  return (
    <div className={cn(
      "relative w-6 h-4 flex items-center justify-center",
      className
    )}>
      {/* Diamond Shape */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br rounded-[2px] rotate-45 scale-[0.7] shadow-sm border border-white/20",
        getColors()
      )} />
      {/* Level Number */}
      <span className="relative z-10 text-[9px] font-black text-white drop-shadow-sm">
        {level}
      </span>
    </div>
  );
});

LevelBadge.displayName = 'LevelBadge';
