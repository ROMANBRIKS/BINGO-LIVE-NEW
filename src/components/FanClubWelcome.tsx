import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FanClubWelcomeProps {
  userName: string;
  level: number;
  isSuperFan: boolean;
  onComplete: () => void;
}

/**
 * 🎇 FAN CLUB WELCOME COMPONENT
 * A dramatic entrance animation for top-tier Fan Club members.
 */
export const FanClubWelcome: React.FC<FanClubWelcomeProps> = ({ userName, level, isSuperFan, onComplete }) => {
  if (!isSuperFan) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.2, y: 100 }}
        onAnimationComplete={() => setTimeout(onComplete, 3000)}
        className="absolute inset-x-0 top-1/4 z-[150] flex flex-col items-center pointer-events-none"
      >
        {/* 1. Sparkle Background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 blur-2xl rounded-full"
        />

        {/* 2. Main Banner */}
        <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 px-6 py-2 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(219,39,119,0.4)] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base">💖</span>
            <span className="text-[9px] font-black text-white/90 uppercase tracking-[0.25em]">Super Fan Joined</span>
            <span className="text-base">💖</span>
          </div>
          <h2 className="text-base font-black text-white italic uppercase tracking-normal drop-shadow-md">
            {userName}
          </h2>
          <div className="mt-1 bg-white/20 px-3 py-0.5 rounded-full border border-white/20">
            <span className="text-[10px] font-black text-yellow-300">LEVEL {level}</span>
          </div>

          {/* Glossy Shine */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </div>

        {/* 3. Floating Hearts */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [-20, -100], 
              x: [0, (i % 2 === 0 ? 50 : -50)],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "easeOut"
            }}
            className="absolute text-2xl"
          >
            {i % 2 === 0 ? '❤️' : '💖'}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
