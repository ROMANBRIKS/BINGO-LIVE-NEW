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
          className="absolute w-64 h-64 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-600/20 blur-3xl rounded-full"
        />

        {/* 2. Main Banner */}
        <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 px-10 py-4 rounded-full border-4 border-white/30 shadow-[0_0_50px_rgba(219,39,119,0.5)] flex flex-col items-center">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">💖</span>
            <span className="text-xs font-black text-white/80 uppercase tracking-[0.4em]">Super Fan Joined</span>
            <span className="text-2xl">💖</span>
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
            {userName}
          </h2>
          <div className="mt-2 bg-white/20 px-4 py-1 rounded-full border border-white/30">
            <span className="text-sm font-black text-yellow-300">LEVEL {level}</span>
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
