import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const PKBattle = React.memo(({ room }: { room: any }) => {
  const pkScore = room.pkScore || 0;
  const pkOpponentScore = room.pkOpponentScore || 0;
  const hostPercent = pkScore + pkOpponentScore === 0 ? 50 : (pkScore / (pkScore + pkOpponentScore)) * 100;
  
  const [timeLeft, setTimeLeft] = useState("00:01");

  useEffect(() => {
    if (!room.pkEndTime) return;
    const interval = setInterval(() => {
      const end = new Date(room.pkEndTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("00:00");
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
      {/* 1. TOP PROGRESS BAR - EXACT PIXEL MATCH */}
      <div className="absolute top-[68px] left-0 right-0 h-8 flex items-center">
        <div className="flex-1 h-full flex relative overflow-hidden">
          {/* Blue Side Score */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 text-white font-bold text-[18px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            {pkScore}
          </div>

          {/* Host Progress (Blue) */}
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: `${hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
            className="h-full bg-gradient-to-r from-[#0091ff] to-[#00d4ff] relative"
          />

          {/* Opponent Progress (Yellow) */}
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: `${100 - hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
            className="h-full bg-gradient-to-l from-[#ffc400] to-[#ffeb3b] relative"
          />

          {/* Yellow Side Score */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 text-white font-bold text-[18px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            {pkOpponentScore}
          </div>

          {/* Central Divider Glow */}
          <motion.div 
            animate={{ left: `${hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
            className="absolute top-0 bottom-0 w-[2px] z-20 -translate-x-1/2 bg-white/80"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full blur-[30px] opacity-40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow-[0_0_25px_#fff] blur-[2px]" />
          </motion.div>
        </div>
      </div>

      {/* 2. ROUND INFO - EXACT REPLICATION */}
      <div className="absolute top-[108px] left-0 right-0 flex items-center justify-center gap-6">
        {/* Left Side Status Balls */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-[#ff3b30] rounded-full border border-white/20 shadow-lg flex items-center justify-center">
            <span className="text-sm">😖</span>
          </div>
          <div className="w-6 h-6 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-black text-white/80">2</span>
          </div>
          <div className="w-6 h-6 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-black text-white/80">3</span>
          </div>
        </div>
        
        {/* Center Timer Display */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-black text-white tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">ROUND 1</span>
          <span className="text-[14px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">·</span>
          <span className="text-[14px] font-black text-white tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{timeLeft}</span>
        </div>

        {/* Right Side Status Balls */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-black text-white/80">3</span>
          </div>
          <div className="w-6 h-6 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-black text-white/80">2</span>
          </div>
          <div className="w-6 h-6 bg-[#ff3b30] rounded-full border border-white/20 shadow-lg flex items-center justify-center">
            <span className="text-sm">😖</span>
          </div>
        </div>
      </div>

      {/* 3. DRAW BADGES - HEXAGONAL STYLE */}
      <div className="absolute top-[100px] bottom-[220px] left-0 right-0 flex">
        <div className="flex-1 relative flex items-end justify-center pb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 relative"
          >
            {/* Hexagon Shield for DRAW */}
            <div className="absolute inset-0 bg-[#00e5ff]/10 backdrop-blur-md border-[2.5px] border-[#00e5ff]/40 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <div className="text-white text-[12px] font-black italic tracking-tighter drop-shadow-md">DRAW</div>
              <div className="w-8 h-[2px] bg-[#00e5ff]/60 mt-1 shadow-[0_0_5px_#00e5ff]" />
              <div className="mt-1 w-5 h-5 border-b-[2px] border-x-[2px] border-[#00e5ff]/40 rounded-b-sm" />
            </div>
          </motion.div>
        </div>
        <div className="flex-1 relative flex items-end justify-center pb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 relative"
          >
            {/* Hexagon Shield for DRAW */}
            <div className="absolute inset-0 bg-[#00e5ff]/10 backdrop-blur-md border-[2.5px] border-[#00e5ff]/40 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <div className="text-white text-[12px] font-black italic tracking-tighter drop-shadow-md">DRAW</div>
              <div className="w-8 h-[2px] bg-[#00e5ff]/60 mt-1 shadow-[0_0_5px_#00e5ff]" />
              <div className="mt-1 w-5 h-5 border-b-[2px] border-x-[2px] border-[#00e5ff]/40 rounded-b-sm" />
            </div>
          </motion.div>
          {/* Plus Action Button */}
          <div className="absolute bottom-20 right-4 w-9 h-9 bg-[#00e5ff] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-white/30 pointer-events-auto cursor-pointer active:scale-90 transition-transform">
            <span className="text-black font-black text-2xl leading-none">+</span>
          </div>
        </div>
      </div>

      {/* 4. SETTLEMENT BAR - BOTTOM SECTION */}
      <div className="absolute bottom-[220px] left-0 right-0 flex items-center justify-between px-6">
        {/* Left Side Icon (Blue Circle) */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#007aff] to-[#0051ff] rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <div className="w-7 h-7 border-[2.5px] border-white/40 rounded-lg" />
        </div>
        
        {/* Center Info Bar */}
        <div className="bg-black/60 backdrop-blur-2xl px-10 py-2.5 rounded-full border border-white/10 flex items-center gap-4 shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
          <span className="text-[14px] text-white/90 font-bold tracking-tight">settlement of the PK</span>
          <span className="text-[14px] text-[#00e5ff] font-black italic tracking-tight">Details &gt;</span>
        </div>

        {/* Right Side Icon (Orange Circle) */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#ff9500] to-[#ff6a00] rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <div className="w-7 h-7 border-[2.5px] border-white/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
});

PKBattle.displayName = 'PKBattle';
