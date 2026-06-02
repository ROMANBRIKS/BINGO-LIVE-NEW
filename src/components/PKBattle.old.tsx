import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSnipeWindow } from '../pkEnhancedLogic';
import { PK_SHIELDS, getShieldRemainingPercent } from '../pkShieldLogic';
import { PKShieldOverlay } from './PKShieldOverlay';
import { Zap, AlertTriangle, Shield, Swords, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';

// SYNTHESIZE WAR HORN SOUNDS DYNAMICALLY WITH WEB AUDIO
const playWarHornSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 0.15);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.95);
    masterGain.connect(ctx.destination);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(115, ctx.currentTime + 1.8);
    filter.Q.setValueAtTime(6.5, ctx.currentTime);
    filter.connect(masterGain);
    
    const distortion = ctx.createWaveShaper();
    function makeDistortionCurve(amount = 25) {
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0 ; i < n_samples; ++i ) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + amount) * x * 22 * deg) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }
    distortion.curve = makeDistortionCurve(35);
    distortion.connect(filter);
    
    // Triple Oscillators for massive retro war horn brassy body
    const baseFrequencies = [70, 71.2, 72.5, 140, 141.5];
    baseFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx < 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(6.0, ctx.currentTime);
      vibratoGain.gain.setValueAtTime(5.0, ctx.currentTime);
      
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      
      osc.connect(distortion);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.0);
      
      vibrato.start(ctx.currentTime);
      vibrato.stop(ctx.currentTime + 2.0);
    });
  } catch (err) {
    console.warn("AudioContext failed:", err);
  }
};

// SYNTHESIZE CLASHING HELMETS / MEDIEVAL METALLIC COMPRESSION WITH NOISE SNAPS
const playHelmetClashSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    masterGain.connect(ctx.destination);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.Q.setValueAtTime(12, ctx.currentTime);
    filter.connect(masterGain);

    const metalFrequencies = [290, 450, 595, 910, 1180, 2050];
    metalFrequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);
      
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.3);
    });
    
    // Highpass noise punch modeling helmet direct contact
    const bufSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
       data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2600, ctx.currentTime);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.95, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noise.start(ctx.currentTime);
  } catch (err) {
    console.warn("AudioContext clash failed:", err);
  }
};

export const PKBattle = React.memo(({ room }: { room: any }) => {
  const pkScore = room.pkScore || 0;
  const pkOpponentScore = room.pkOpponentScore || 0;
  const hostPercent = pkScore + pkOpponentScore === 0 ? 50 : (pkScore / (pkScore + pkOpponentScore)) * 100;
  
  const [timeLeft, setTimeLeft] = useState("00:01");
  const [isSnipe, setIsSnipe] = useState(false);

  // Epic cinematic intro steps: 'none' | 'horn' | 'helmets'
  const [introStep, setIntroStep] = useState<'none' | 'horn' | 'helmets'>('none');
  const lastBattleKey = React.useRef<string>('');

  const hostShield = room.pkShieldTier ? PK_SHIELDS[room.pkShieldTier] : null;
  const hostShieldActive = hostShield && room.pkShieldEndTime && new Date(room.pkShieldEndTime).getTime() > Date.now();
  const hostShieldPercent = hostShield ? getShieldRemainingPercent(hostShield, room.pkShieldAbsorbed || 0) : 0;

  const oppShield = room.pkOpponentShieldTier ? PK_SHIELDS[room.pkOpponentShieldTier] : null;
  const oppShieldActive = oppShield && room.pkOpponentShieldEndTime && new Date(room.pkOpponentShieldEndTime).getTime() > Date.now();
  const oppShieldPercent = oppShield ? getShieldRemainingPercent(oppShield, room.pkOpponentShieldAbsorbed || 0) : 0;

  const [hostShieldTimeLeft, setHostShieldTimeLeft] = useState(0);
  const [oppShieldTimeLeft, setOppShieldTimeLeft] = useState(0);

  const handleReplayIntro = () => {
    setIntroStep('horn');
    playWarHornSound();
    
    const t1 = setTimeout(() => {
      setIntroStep('helmets');
      playHelmetClashSound();
    }, 1800);
    
    const t2 = setTimeout(() => {
      setIntroStep('none');
    }, 4500);
  };

  // Trigger battle introduction sequence automatically on round change / battle match
  useEffect(() => {
    if (room.pkEndTime) {
      const matchKey = `${room.pkEndTime}_${room.pkRound || 1}`;
      if (lastBattleKey.current !== matchKey) {
        lastBattleKey.current = matchKey;
        handleReplayIntro();
      }
    }
  }, [room.pkEndTime, room.pkRound]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (room.pkShieldEndTime) {
        const diff = new Date(room.pkShieldEndTime).getTime() - Date.now();
        setHostShieldTimeLeft(Math.max(0, Math.floor(diff / 1000)));
      }
      if (room.pkOpponentShieldEndTime) {
        const diff = new Date(room.pkOpponentShieldEndTime).getTime() - Date.now();
        setOppShieldTimeLeft(Math.max(0, Math.floor(diff / 1000)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [room.pkShieldEndTime, room.pkOpponentShieldEndTime]);

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
        <PKShieldOverlay 
          activeShield={hostShield} 
          absorbedPoints={room.pkShieldAbsorbed || 0} 
          timeLeft={hostShieldTimeLeft} 
          isHost={true} 
        />
        <PKShieldOverlay 
          activeShield={oppShield} 
          absorbedPoints={room.pkOpponentShieldAbsorbed || 0} 
          timeLeft={oppShieldTimeLeft} 
          isHost={false} 
        />
        
        <div className="flex-1 h-full flex relative overflow-hidden">
          {/* Blue Side Score */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex items-center gap-2">
            <div className="text-white font-bold text-[18px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {pkScore}
            </div>
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
          <div className="flex items-center gap-2 pointer-events-auto">
            <button 
              type="button"
              onClick={handleReplayIntro}
              title="Replay Battle Intro Sound Effects"
              className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-black text-[8px] uppercase tracking-wider animate-pulse transition-all active:scale-90 shadow-md shadow-red-900/30 border-0 cursor-pointer flex items-center gap-0.5"
            >
              <Swords size={7} /> CLASH
            </button>
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

      {/* 6. CINEMATIC BATTLE INTRODUCTION OVERLAY */}
      <AnimatePresence>
        {introStep !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] pointer-events-auto"
          >
            {introStep === 'horn' && (
              <motion.div
                initial={{ scale: 0.6, rotate: -15 }}
                animate={{ 
                  scale: [0.6, 1.15, 1], 
                  rotate: [-15, 8, 0],
                  x: [0, -4, 4, -4, 0],
                  y: [0, 4, -4, 4, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  x: { repeat: Infinity, duration: 0.12 },
                  y: { repeat: Infinity, duration: 0.1 }
                }}
                className="flex flex-col items-center gap-7 text-center select-none"
              >
                {/* Visual Representation of the Epic Gold Horn blowing */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur-[45px] opacity-40 animate-ping" />
                  <div className="w-36 h-36 rounded-full border-4 border-amber-400/40 flex items-center justify-center bg-zinc-950/70 shadow-[0_0_60px_rgba(245,158,11,0.5)]">
                    <Volume2 className="w-20 h-20 text-amber-400" />
                  </div>
                  {/* Glowing Sound waves */}
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.8, opacity: 0.9 }}
                      animate={{ scale: 2.3, opacity: 0 }}
                      transition={{ 
                        duration: 1.1, 
                        repeat: Infinity, 
                        delay: i * 0.3,
                        ease: "easeOut" 
                      }}
                      className="absolute inset-0 border-2 border-amber-400/80 rounded-full pointer-events-none"
                    />
                  ))}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-amber-500 font-black tracking-[0.45em] uppercase block animate-pulse">
                    🎺 SOUNDING THE WAR HORN
                  </span>
                  <h2 className="text-3xl font-black italic uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none tracking-tight">
                    PREPARE FOR BATTLE!
                  </h2>
                </div>
              </motion.div>
            )}

            {introStep === 'helmets' && (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Star fire dynamic spark particles from impact point */}
                {[...Array(24)].map((_, i) => {
                  const angle = (i * 360) / 24;
                  const radian = (angle * Math.PI) / 180;
                  const distance = 90 + Math.random() * 140;
                  const dx = Math.cos(radian) * distance;
                  const dy = Math.sin(radian) * distance;
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                      animate={{ x: dx, y: dy, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 z-40"
                    />
                  );
                })}

                {/* Left Gladiator Helmet sliding to center with high kinetic force */}
                <motion.div 
                  initial={{ x: -280, rotate: -30, opacity: 0 }}
                  animate={{ x: -50, rotate: 12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="absolute z-20"
                >
                  <div className="relative w-32 h-32 flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
                    {/* Centurion feathered crest plume */}
                    <div className="absolute top-[-18px] inset-x-5 h-7 bg-red-600 rounded-t-full border-t-2 border-orange-400" />
                    {/* Metal visor design */}
                    <div className="w-18 h-5 bg-black/95 rounded-md border border-amber-400/35 flex items-center justify-around px-2.5">
                      <div className="w-1 h-3.5 bg-red-500 animate-pulse" />
                      <div className="w-1 h-3.5 bg-red-500 animate-pulse" />
                    </div>
                    {/* Ancient Nose Guard decoration */}
                    <div className="w-3.5 h-11 bg-amber-600 border border-white/10 mt-1 rounded-sm" />
                    <span className="text-[8px] font-black text-white/50 absolute bottom-2 uppercase tracking-widest">HOST</span>
                  </div>
                </motion.div>

                {/* Right Gladiator Helmet sliding to center with high kinetic force */}
                <motion.div 
                  initial={{ x: 280, rotate: 30, opacity: 0 }}
                  animate={{ x: 50, rotate: -12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="absolute z-20"
                >
                  <div className="relative w-32 h-32 flex flex-col items-center justify-center bg-gradient-to-bl from-red-600 to-zinc-800 rounded-3xl border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
                    {/* Centurion feathered crest plume */}
                    <div className="absolute top-[-18px] inset-x-5 h-7 bg-amber-500 rounded-t-full border-t-2 border-yellow-400/40 animate-pulse" />
                    {/* Metal visor design */}
                    <div className="w-18 h-5 bg-black/95 rounded-md border border-red-500/35 flex items-center justify-around px-2.5">
                      <div className="w-1 h-3.5 bg-[#00e5ff] animate-pulse" />
                      <div className="w-1 h-3.5 bg-[#00e5ff] animate-pulse" />
                    </div>
                    {/* Ancient Nose Guard decoration */}
                    <div className="w-3.5 h-11 bg-zinc-650 border border-white/10 mt-1 rounded-sm" />
                    <span className="text-[8px] font-black text-white/50 absolute bottom-2 uppercase tracking-widest">OPPONENT</span>
                  </div>
                </motion.div>

                {/* Central Clash explosion text and sword badges */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.35, 1], opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.45 }}
                  className="absolute z-30 flex flex-col items-center justify-center text-center mt-44"
                >
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-[65px] opacity-50 animate-pulse" />
                  <div className="flex items-center gap-3">
                    <Swords className="w-9 h-9 text-[#00e5ff] animate-bounce" />
                    <h1 className="text-4xl font-extrabold italic tracking-tighter text-white drop-shadow-[0_4px_15px_rgba(239,68,68,0.95)] bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent uppercase">
                      BATTLE START!
                    </h1>
                    <Swords className="w-9 h-9 text-[#ffc400] animate-bounce" />
                  </div>
                  <p className="text-[9px] font-black text-zinc-300 tracking-[0.3em] uppercase mt-1">
                    ⚔️ CLASH WITH HONOR & GLORY ⚔️
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PKBattle.displayName = 'PKBattle';
