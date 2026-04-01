import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Crown } from 'lucide-react';
import { cn } from '../lib/utils';

export const PKBattle = React.memo(({ room }: { room: any }) => {
  const pkScore = room.pkScore || 0;
  const pkOpponentScore = room.pkOpponentScore || 0;
  const hostPercent = pkScore + pkOpponentScore === 0 ? 50 : (pkScore / (pkScore + pkOpponentScore)) * 100;
  
  const [timeLeft, setTimeLeft] = useState("00:01");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!room.pkEndTime) return;
    const interval = setInterval(() => {
      const end = new Date(room.pkEndTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("00:00");
        setIsFinished(true);
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [room.pkEndTime]);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Top Progress Bar */}
      <div className="absolute top-14 left-0 right-0 h-6 flex items-center px-0.5">
        <div className="flex-1 h-full flex relative overflow-hidden rounded-sm">
          {/* Host Side (Blue) */}
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: `${hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="h-full bg-gradient-to-r from-[#0095ff] to-[#00e5ff] relative flex items-center"
          >
            <span className="ml-3 text-sm font-black text-white drop-shadow-md z-10">{pkScore}</span>
            {/* Animated Shine */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
            />
          </motion.div>

          {/* Opponent Side (Yellow) */}
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: `${100 - hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="h-full bg-gradient-to-l from-[#ffcc00] to-[#ffeb3b] relative flex items-center justify-end"
          >
            <span className="mr-3 text-sm font-black text-white drop-shadow-md z-10">{pkOpponentScore}</span>
            {/* Animated Shine */}
            <motion.div 
              animate={{ x: ['100%', '-200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent skew-x-[20deg]"
            />
          </motion.div>

          {/* Glowing Divider / Sparkle */}
          <motion.div 
            animate={{ left: `${hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="absolute top-0 bottom-0 w-1 z-20 -translate-x-1/2"
          >
            {/* Central Flare */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full blur-xl opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_#fff]" />
            
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, (i % 2 === 0 ? -20 : 20)],
                  x: [0, (i < 3 ? -15 : 15)],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 1 + Math.random(), 
                  repeat: Infinity, 
                  delay: Math.random() 
                }}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Round Info */}
      <div className="absolute top-[84px] left-0 right-0 flex items-center justify-center gap-6">
        {/* Left Side Win/Loss Balls */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-red-500 rounded-full border border-white/20 shadow-[0_0_5px_rgba(239,68,68,0.5)] flex items-center justify-center">
            <span className="text-[6px] text-white">😖</span>
          </div>
          <div className="w-4 h-4 bg-black/60 rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60">2</span>
          </div>
          <div className="w-4 h-4 bg-black/60 rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60">3</span>
          </div>
        </div>
        
        <div className="bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
          <span className="text-[11px] font-black italic text-white tracking-widest">ROUND 1</span>
          <div className="w-px h-3 bg-white/20" />
          <span className="text-[11px] font-black italic text-white tracking-widest">{timeLeft}</span>
        </div>

        {/* Right Side Win/Loss Balls */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-black/60 rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60">3</span>
          </div>
          <div className="w-4 h-4 bg-black/60 rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white/60">2</span>
          </div>
          <div className="w-4 h-4 bg-red-500 rounded-full border border-white/20 shadow-[0_0_5px_rgba(239,68,68,0.5)] flex items-center justify-center">
            <span className="text-[6px] text-white">😖</span>
          </div>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="absolute top-[80px] bottom-[200px] left-0 right-0 flex">
        {/* Left Stream Overlay */}
        <div className="flex-1 relative flex flex-col items-center justify-end pb-10">
          <div className="relative w-16 h-16">
            <img src="https://i.imgur.com/8Yv9p9z.png" alt="Status" className="w-full h-full object-contain" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8px] font-black text-white mt-4 italic">
                {pkScore > pkOpponentScore ? 'WIN' : pkScore < pkOpponentScore ? 'LOSE' : 'DRAW'}
              </span>
            </div>
          </div>
        </div>
        {/* Right Stream Overlay */}
        <div className="flex-1 relative flex flex-col items-center justify-end pb-10">
          <div className="relative w-16 h-16">
            <img src="https://i.imgur.com/8Yv9p9z.png" alt="Status" className="w-full h-full object-contain" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[8px] font-black text-white mt-4 italic">
                {pkOpponentScore > pkScore ? 'WIN' : pkOpponentScore < pkScore ? 'LOSE' : 'DRAW'}
              </span>
            </div>
          </div>
          {/* Plus Button */}
          <div className="absolute bottom-12 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer">
            <span className="text-black font-bold text-lg leading-none">+</span>
          </div>
        </div>
      </div>

      {/* Settlement Bar */}
      <div className="absolute bottom-[180px] left-0 right-0 flex items-center justify-between px-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl border border-white/20">
          <div className="w-5 h-5 bg-white/20 rounded-md backdrop-blur-sm" />
        </div>
        
        <div className="bg-black/60 backdrop-blur-md px-6 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
          <span className="text-[11px] text-white/90 font-medium">settlement of the PK</span>
          <span className="text-[11px] text-cyan-400 font-black italic tracking-tight">Details &gt;</span>
        </div>

        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center shadow-xl border border-white/20">
          <div className="w-5 h-5 bg-white/20 rounded-md backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
});

PKBattle.displayName = 'PKBattle';
