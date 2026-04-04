import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSnipeWindow } from '../pkEnhancedLogic';
import { PK_SHIELDS, getShieldRemainingPercent } from '../pkShieldLogic';
import { Zap, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export const PKBattle = React.memo(({ room }: { room: any }) => {
  const pkScore = room.pkScore || 0;
  const pkOpponentScore = room.pkOpponentScore || 0;
  const hostPercent = pkScore + pkOpponentScore === 0 ? 50 : (pkScore / (pkScore + pkOpponentScore)) * 100;
  
  const [timeLeft, setTimeLeft] = useState("00:01");
  const [isSnipe, setIsSnipe] = useState(false);

  const hostShield = room.pkShieldTier ? PK_SHIELDS[room.pkShieldTier] : null;
  const hostShieldActive = hostShield && room.pkShieldEndTime && new Date(room.pkShieldEndTime).getTime() > Date.now();
  const hostShieldPercent = hostShield ? getShieldRemainingPercent(hostShield, room.pkShieldAbsorbed || 0) : 0;

  const oppShield = room.pkOpponentShieldTier ? PK_SHIELDS[room.pkOpponentShieldTier] : null;
  const oppShieldActive = oppShield && room.pkOpponentShieldEndTime && new Date(room.pkOpponentShieldEndTime).getTime() > Date.now();
  const oppShieldPercent = oppShield ? getShieldRemainingPercent(oppShield, room.pkOpponentShieldAbsorbed || 0) : 0;

  useEffect(() => {
    if (!room.pkEndTime) return;
    const interval = setInterval(() => {
      const end = new Date(room.pkEndTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      
      setIsSnipe(isSnipeWindow(room.pkEndTime));

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
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2">
            <div className="text-white font-bold text-[18px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {pkScore}
            </div>
            {hostShieldActive && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/30"
              >
                <Shield size={10} style={{ color: hostShield.color }} fill={hostShield.color} />
                <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300" 
                    style={{ width: `${hostShieldPercent}%`, backgroundColor: hostShield.color }} 
                  />
                </div>
              </motion.div>
            )}
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
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2">
            {oppShieldActive && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/30"
              >
                <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300" 
                    style={{ width: `${oppShieldPercent}%`, backgroundColor: oppShield.color }} 
                  />
                </div>
                <Shield size={10} style={{ color: oppShield.color }} fill={oppShield.color} />
              </motion.div>
            )}
            <div className="text-white font-bold text-[18px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {pkOpponentScore}
            </div>
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
        {/* Left Side Status Balls (Host) */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((r) => {
            const result = room.pkResults?.[r - 1];
            const isActive = room.pkRound === r;
            return (
              <div 
                key={`host-round-${r}`}
                className={`w-6 h-6 rounded-full border shadow-lg flex items-center justify-center transition-all ${
                  result === 'win' ? 'bg-green-500 border-green-400' :
                  result === 'loss' ? 'bg-red-500 border-red-400' :
                  result === 'draw' ? 'bg-gray-500 border-gray-400' :
                  isActive ? 'bg-blue-500 border-blue-400 animate-pulse' :
                  'bg-black/50 border-white/10'
                }`}
              >
                {result === 'win' ? <span className="text-[10px]">🏆</span> : 
                 result === 'loss' ? <span className="text-[10px]">😖</span> :
                 result === 'draw' ? <span className="text-[10px]">🤝</span> :
                 <span className="text-[11px] font-black text-white/80">{r}</span>}
              </div>
            );
          })}
        </div>
        
        {/* Center Timer Display */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-black text-[#00e5ff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {room.pkResults?.filter((r: string) => r === 'win').length || 0}
            </span>
            <span className="text-[12px] font-black text-white/40">:</span>
            <span className="text-[16px] font-black text-[#ffc400] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {room.pkResults?.filter((r: string) => r === 'loss').length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-white/60 tracking-widest uppercase">
              ROUND {room.pkRound || 1}
            </span>
            <span className="text-[11px] font-black text-white/40">·</span>
            <span className={cn(
              "text-[11px] font-black tracking-widest transition-colors duration-300",
              isSnipe ? "text-red-500 animate-pulse" : "text-white/60"
            )}>
              {timeLeft}
            </span>
          </div>
          {isSnipe && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30"
            >
              <Zap size={8} className="text-red-500 fill-red-500" />
              <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Snipe Window (1.5x)</span>
            </motion.div>
          )}
        </div>

        {/* Right Side Status Balls (Opponent) */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((r) => {
            const result = room.pkResults?.[r - 1];
            const isActive = room.pkRound === r;
            // Opponent result is inverse of host result
            const oppResult = result === 'win' ? 'loss' : result === 'loss' ? 'win' : result;
            return (
              <div 
                key={`opp-round-${r}`}
                className={`w-6 h-6 rounded-full border shadow-lg flex items-center justify-center transition-all ${
                  oppResult === 'win' ? 'bg-green-500 border-green-400' :
                  oppResult === 'loss' ? 'bg-red-500 border-red-400' :
                  oppResult === 'draw' ? 'bg-gray-500 border-gray-400' :
                  isActive ? 'bg-yellow-500 border-yellow-400 animate-pulse' :
                  'bg-black/50 border-white/10'
                }`}
              >
                {oppResult === 'win' ? <span className="text-[10px]">🏆</span> : 
                 oppResult === 'loss' ? <span className="text-[10px]">😖</span> :
                 oppResult === 'draw' ? <span className="text-[10px]">🤝</span> :
                 <span className="text-[11px] font-black text-white/80">{r}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DRAW/WIN/LOSS BADGES - HEXAGONAL STYLE */}
      <div className="absolute top-[100px] bottom-[220px] left-0 right-0 flex">
        <div className="flex-1 relative flex items-end justify-center pb-16">
          {room.pkResults?.length > 0 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-24 h-24 relative"
            >
              {/* Hexagon Shield for Result */}
              <div className={`absolute inset-0 backdrop-blur-md border-[2.5px] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] flex flex-col items-center justify-center shadow-lg transition-colors duration-500 ${
                room.pkResults[room.pkResults.length - 1] === 'win' ? 'bg-green-500/30 border-green-400 shadow-green-500/40' :
                room.pkResults[room.pkResults.length - 1] === 'loss' ? 'bg-red-500/30 border-red-400 shadow-red-500/40' :
                'bg-[#00e5ff]/20 border-[#00e5ff]/40 shadow-[#00e5ff]/30'
              }`}>
                <div className="text-white text-[14px] font-black italic tracking-tighter drop-shadow-md uppercase">
                  {room.pkResults[room.pkResults.length - 1]}
                </div>
                <div className={`w-10 h-[2px] mt-1 shadow-[0_0_8px] ${
                  room.pkResults[room.pkResults.length - 1] === 'win' ? 'bg-green-400 shadow-green-400' :
                  room.pkResults[room.pkResults.length - 1] === 'loss' ? 'bg-red-400 shadow-red-400' :
                  'bg-[#00e5ff]/60 shadow-[#00e5ff]'
                }`} />
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex-1 relative flex items-end justify-center pb-16">
          {room.pkResults?.length > 0 && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-24 h-24 relative"
            >
              {/* Hexagon Shield for Opponent Result */}
              {(() => {
                const lastResult = room.pkResults[room.pkResults.length - 1];
                const oppResult = lastResult === 'win' ? 'loss' : lastResult === 'loss' ? 'win' : lastResult;
                return (
                  <div className={`absolute inset-0 backdrop-blur-md border-[2.5px] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] flex flex-col items-center justify-center shadow-lg transition-colors duration-500 ${
                    oppResult === 'win' ? 'bg-green-500/30 border-green-400 shadow-green-500/40' :
                    oppResult === 'loss' ? 'bg-red-500/30 border-red-400 shadow-red-500/40' :
                    'bg-[#00e5ff]/20 border-[#00e5ff]/40 shadow-[#00e5ff]/30'
                  }`}>
                    <div className="text-white text-[14px] font-black italic tracking-tighter drop-shadow-md uppercase">
                      {oppResult}
                    </div>
                    <div className={`w-10 h-[2px] mt-1 shadow-[0_0_8px] ${
                      oppResult === 'win' ? 'bg-green-400 shadow-green-400' :
                      oppResult === 'loss' ? 'bg-red-400 shadow-red-400' :
                      'bg-[#00e5ff]/60 shadow-[#00e5ff]'
                    }`} />
                  </div>
                );
              })()}
            </motion.div>
          )}
          {/* Plus Action Button */}
          <div className="absolute bottom-20 right-4 w-9 h-9 bg-[#00e5ff] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] border-2 border-white/30 pointer-events-auto cursor-pointer active:scale-90 transition-transform">
            <span className="text-black font-black text-2xl leading-none">+</span>
          </div>
        </div>
      </div>

      {/* 5. ROUND RESULT OVERLAY - BIG CENTER TEXT */}
      {timeLeft === "00:00" && room.pkResults?.length >= room.pkRound && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
            className="flex flex-col items-center"
          >
            {(() => {
              const lastResult = room.pkResults[room.pkResults.length - 1];
              const color = lastResult === 'win' ? 'text-green-400' : lastResult === 'loss' ? 'text-red-400' : 'text-[#00e5ff]';
              const shadow = lastResult === 'win' ? 'shadow-green-500/50' : lastResult === 'loss' ? 'shadow-red-500/50' : 'shadow-cyan-500/50';
              return (
                <>
                  <div className={`text-[80px] font-black italic uppercase tracking-tighter ${color} drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]`}>
                    {lastResult}
                  </div>
                  <div className={`w-40 h-1 rounded-full bg-white/20 mt-[-10px] overflow-hidden`}>
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className={`w-full h-full bg-gradient-to-r from-transparent via-white to-transparent`}
                    />
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* 4. SETTLEMENT BAR - BOTTOM SECTION */}
      <div className="absolute bottom-[220px] left-0 right-0 flex items-center justify-between px-6">
        {/* Left Side Icon (Blue Circle) */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#007aff] to-[#0051ff] rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
          <div className="w-7 h-7 border-[2.5px] border-white/40 rounded-lg" />
        </div>
        
        {/* Center Info Bar */}
        <div className="bg-black/60 backdrop-blur-2xl px-10 py-2.5 rounded-full border border-white/10 flex flex-col items-center gap-1 shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
          {room.pkRound === 3 && timeLeft === "00:00" ? (
            <>
              <span className="text-[14px] text-white font-black uppercase tracking-widest animate-pulse">
                {(() => {
                  const wins = room.pkResults?.filter((r: string) => r === 'win').length || 0;
                  const losses = room.pkResults?.filter((r: string) => r === 'loss').length || 0;
                  if (wins > losses) return "Victory! 🏆";
                  if (wins < losses) return "Defeat 😖";
                  return "Draw 🤝";
                })()}
              </span>
              {room.pkForfeit && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle size={12} className="text-yellow-400" />
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">
                    Forfeit: {room.pkForfeit.description}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <span className="text-[14px] text-white/90 font-bold tracking-tight">settlement of the PK</span>
              <span className="text-[14px] text-[#00e5ff] font-black italic tracking-tight">Details &gt;</span>
            </>
          )}
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
