import React from 'react';
import { cn } from '../lib/utils';

export const LevelBadge = React.memo(({ level, className }: { level: number, className?: string }) => {
  const getColors = () => {
    if (level >= 80) return "from-purple-600 to-pink-600";
    if (level >= 50) return "from-red-500 to-orange-500";
    if (level >= 20) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className={cn(
      "bg-gradient-to-r text-[8px] px-1.5 py-0.5 rounded-sm text-white font-black italic flex items-center gap-0.5 shadow-sm",
      getColors(),
      className
    )}>
      Lv.{level}
    </div>
  );
});

LevelBadge.displayName = 'LevelBadge';
