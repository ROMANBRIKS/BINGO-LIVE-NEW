import React from 'react';
import { motion } from 'framer-motion';
import { Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface SVIPBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SVIPBadge: React.FC<SVIPBadgeProps> = ({ tier, size = 'sm', className }) => {
  const sizeClasses = {
    sm: 'h-4 px-1.5 text-[8px]',
    md: 'h-5 px-2 text-[10px]',
    lg: 'h-6 px-2.5 text-[12px]'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-black italic uppercase tracking-tighter shadow-lg border border-white/20",
        "bg-gradient-to-r from-slate-200 via-white to-slate-300 text-slate-900",
        sizeClasses[size],
        className
      )}
    >
      <div className="relative">
        <ShieldCheck size={iconSizes[size]} className="text-slate-900" />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles size={iconSizes[size] - 2} className="text-cyan-500" />
        </motion.div>
      </div>
      <span className="drop-shadow-sm">S VIP</span>
      <span className="opacity-60 font-medium ml-0.5">{tier.split(' ')[0]}</span>
    </motion.div>
  );
};
