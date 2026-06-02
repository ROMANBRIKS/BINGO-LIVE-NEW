import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSnipeWindow } from '../pkEnhancedLogic';
import { PK_SHIELDS, getShieldRemainingPercent } from '../pkShieldLogic';
import { PKShieldOverlay } from './PKShieldOverlay';
import { Zap, AlertTriangle, Shield, Swords, Volume2, Gamepad2, Sparkles, Trophy, X, Users, MessageSquareCode } from 'lucide-react';
import { cn } from '../lib/utils';

// CSS Keyframes dynamically injected for falling tears and sparkle effects
const customAnimationsStyles = `
@keyframes tearfall {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: translateY(10px) scale(1);
  }
  85% {
    opacity: 0.9;
  }
  100% {
    transform: translateY(140px) scale(0.6);
    opacity: 0;
  }
}
@keyframes sparkle {
  0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
  50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
}
@keyframes crownBob {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg) scale(1.05); }
  50% { transform: translate(-50%, -50%) translateY(-6px) rotate(2deg) scale(1.1); }
}
@keyframes sofaBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
`;

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
  // Score mechanics & interactive test scoring
  const [localHostScore, setLocalHostScore] = useState<number | null>(null);
  const [localOpponentScore, setLocalOpponentScore] = useState<number | null>(null);

  const pkScore = localHostScore !== null ? localHostScore : (room.pkScore || 0);
  const pkOpponentScore = localOpponentScore !== null ? localOpponentScore : (room.pkOpponentScore || 0);

  const totalPoints = pkScore + pkOpponentScore;
  const hostPercent = totalPoints === 0 ? 50 : (pkScore / totalPoints) * 100;
  
  const [timeLeft, setTimeLeft] = useState("01:26");
  const [isSnipe, setIsSnipe] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Epic cinematic intro steps: 'none' | 'horn' | 'helmets'
  const [introStep, setIntroStep] = useState<'none' | 'horn' | 'helmets'>('none');
  const lastBattleKey = React.useRef<string>('');

  const hostShield = room.pkShieldTier ? PK_SHIELDS[room.pkShieldTier] : null;
  const hostShieldPercent = hostShield ? getShieldRemainingPercent(hostShield, room.pkShieldAbsorbed || 0) : 0;

  const oppShield = room.pkOpponentShieldTier ? PK_SHIELDS[room.pkOpponentShieldTier] : null;
  const oppShieldPercent = oppShield ? getShieldRemainingPercent(oppShield, room.pkOpponentShieldAbsorbed || 0) : 0;

  const [hostShieldTimeLeft, setHostShieldTimeLeft] = useState(0);
  const [oppShieldTimeLeft, setOppShieldTimeLeft] = useState(0);

  // Quick action alerts
  const [showToast, setShowToast] = useState<{ text: string; type: string } | null>(null);

  const triggerToast = (text: string, type: string = 'info') => {
    setShowToast({ text, type });
    setTimeout(() => {
      setShowToast(null);
    }, 2800);
  };

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

  // Follow interaction trigger
  const handleFollowOpponent = () => {
    setIsFollowed(prev => {
      const next = !prev;
      if (next) {
        triggerToast("You followed Peachy! ⚡️🍀", "success");
      } else {
        triggerToast("Unfollowed Peachy", "info");
      }
      return next;
    });
  };

  // Sofa seat spectator join simulation
  const handleJoinSofa = (isLeft: boolean) => {
    triggerToast(`Request sent to sit on ${isLeft ? 'orange' : 'blue'} spectating Guest VIP Sofa! 🛋️`, 'info');
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

  // Determine winners and losers dynamically for displaying Tears vs Crowns!
  const hostIsWinning = pkScore > pkOpponentScore;
  const opponentIsWinning = pkOpponentScore > pkScore;
  const isDraw = pkScore === pkOpponentScore;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      <style>{customAnimationsStyles}</style>

      {/* 1. TOP PROGRESS BAR OF PK BATTLE - EXACT PICTURE MATCH STYLE (Yellow on left, Blue on right) */}
      <div className="absolute top-[110px] left-0 right-0 h-[30px] flex items-center z-50 px-1">
        {/* Host shield indicator overlay */}
        <PKShieldOverlay 
          activeShield={hostShield} 
          absorbedPoints={room.pkShieldAbsorbed || 0} 
          timeLeft={hostShieldTimeLeft} 
          isHost={true} 
        />
        {/* Opponent shield indicator overlay */}
        <PKShieldOverlay 
          activeShield={oppShield} 
          absorbedPoints={room.pkOpponentShieldAbsorbed || 0} 
          timeLeft={oppShieldTimeLeft} 
          isHost={false} 
        />
        
        <div className="flex-1 h-3 flex relative overflow-hidden rounded-full border border-black/80 bg-zinc-950/80 max-w-[95%] mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          {/* Score Left - Host (Gold/Orange bubble with 0 or pkScore) */}
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex items-center">
            <span className="text-white font-[900] text-[13px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#fbbf24] font-mono leading-none">
              {pkScore.toLocaleString()}
            </span>
          </div>

          {/* Yellow Progress Segment (left side / host) */}
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: `${hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 relative"
          />

          {/* Blue Progress Segment (right side / opponent) */}
          <motion.div 
            initial={{ width: '50%' }}
            animate={{ width: `${100 - hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="h-full bg-gradient-to-l from-[#0051ff] via-[#0091ff] to-[#00d4ff] relative"
          />

          {/* Score Right - Opponent (Cyan/Blue bubble with 0 or pkOpponentScore) */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex items-center">
            <span className="text-white font-[900] text-[13px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#00e5ff] font-mono leading-none">
              {pkOpponentScore.toLocaleString()}
            </span>
          </div>

          {/* High-visibility center separator pin with active lightning pulse */}
          <motion.div 
            animate={{ left: `${hostPercent}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="absolute top-0 bottom-0 w-[3px] z-20 -translate-x-1/2 bg-white"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full blur-[8px] opacity-70 animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_12px_#fff] blur-[1px]" />
          </motion.div>
        </div>
      </div>

      {/* 2. TIMER VALUE POSITIONED OVER THE DIVIDER OF TWO SCREENS */}
      <div className="absolute top-[132px] left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <div className="bg-black/85 backdrop-blur-xl border border-zinc-700/50 px-3.5 py-1 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[sparkle_1.5s_infinite_ease-in-out]" />
          <span className={cn(
            "text-[12px] font-[900] tracking-wider font-mono",
            isSnipe ? "text-red-500 animate-pulse" : "text-white"
          )}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* 3. DUAL-CELL VIDEO OVERLAY BOX - LOCKED IN `top-[120px]` to `bottom-[260px]` */}
      <div className="absolute top-[120px] bottom-[260px] left-0 right-0 flex overflow-hidden">
        
        {/* --- LEFT STREAM AREA (HOST SCREEN) --- */}
        <div className="flex-1 h-full relative border-r border-zinc-900/30 overflow-hidden">
          
          {/* Emojis aligned on top-left of Left cell: 😡 😡 😡 */}
          <div className="absolute top-5 left-3 z-30 flex items-center gap-1 select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-pulse">
            <span className="text-[17px] filter drop-shadow hover:scale-125 transition-transform duration-100">😡</span>
            <span className="text-[17px] filter drop-shadow hover:scale-125 transition-transform duration-100">😡</span>
            <span className="text-[17px] filter drop-shadow hover:scale-125 transition-transform duration-100 animate-bounce">😡</span>
          </div>

          {/* Fallback Left Streamer Avatar name label (similar to screenshot: "PRETTY MA...") */}
          <div className="absolute top-5 left-20 z-20 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full md:block hidden">
            <p className="text-[10px] font-black leading-none text-white/95 tracking-tight uppercase">
              Host Live
            </p>
          </div>

          {/* DYNAMIC SETTLEMENT: Loser drops water tears from their eyes */}
          {((opponentIsWinning && !isDraw) || (pkScore === 0 && pkOpponentScore === 0)) && (
            <div className="absolute inset-0 pointer-events-none select-none z-30">
              {/* Left eye teardrop stream */}
              <div className="absolute top-[28%] left-[28%] w-10 h-32 overflow-visible">
                <svg className="absolute w-3 h-4 text-cyan-400 fill-current drop-shadow-[0_1px_4px_rgba(34,211,238,0.4)]" style={{ animation: 'tearfall 1.9s infinite ease-in', animationDelay: '0s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-3.5 h-4 text-cyan-300 fill-current opacity-70" style={{ animation: 'tearfall 1.9s infinite ease-in', animationDelay: '0.6s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-2.5 h-3 text-cyan-100 fill-current opacity-50" style={{ animation: 'tearfall 1.9s infinite ease-in', animationDelay: '1.2s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
              </div>

              {/* Right eye teardrop stream */}
              <div className="absolute top-[28%] right-[28%] w-10 h-32 overflow-visible">
                <svg className="absolute w-3 h-4 text-cyan-400 fill-current drop-shadow-[0_1px_4px_rgba(34,211,238,0.4)]" style={{ animation: 'tearfall 2.1s infinite ease-in', animationDelay: '0.2s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-3.5 h-4 text-cyan-300 fill-current opacity-70" style={{ animation: 'tearfall 2.1s infinite ease-in', animationDelay: '0.8s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-2.5 h-3 text-cyan-100 fill-current opacity-50" style={{ animation: 'tearfall 2.1s infinite ease-in', animationDelay: '1.4s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
              </div>
              
              {/* Highlight wet spot on bottom cheeks */}
              <div className="absolute top-[28%] left-[26%] w-5 h-1 bg-cyan-400/30 rounded-full blur-[1px]" />
              <div className="absolute top-[28%] right-[26%] w-5 h-1 bg-cyan-400/30 rounded-full blur-[1px]" />
            </div>
          )}

          {/* DYNAMIC SETTLEMENT: Winner gets the sparkling gold crown */}
          {hostIsWinning && !isDraw && (
            <div className="absolute top-[22%] left-1/2 pointer-events-none select-none z-30 animate-[crownBob_2.5s_ease-in-out_infinite]" style={{ width: '85px' }}>
              <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_4px_10px_rgba(251,191,36,0.65)]">
                {/* Crown base with shiny metallic yellow gold */}
                <path d="M15 50 L85 50 L80 43 L20 43 Z" fill="url(#leftGoldBase)" stroke="#EAB308" strokeWidth="1" />
                {/* Crown gemstone slots */}
                <rect x="25" y="45" width="6" height="3" rx="1.5" fill="#EF4444" />
                <rect x="37" y="45" width="6" height="3" rx="1.5" fill="#3B82F6" />
                <rect x="49" y="45" width="6" height="3" rx="1.5" fill="#EF4444" />
                <rect x="61" y="45" width="6" height="3" rx="1.5" fill="#3B82F6" />
                <rect x="73" y="45" width="6" height="3" rx="1.5" fill="#EF4444" />
                {/* Crown Spikes */}
                <path d="M15 43 L21 21 L35 32 L50 11 L65 32 L79 21 L85 43 Z" fill="url(#leftGoldSpikes)" stroke="#F59E0B" strokeWidth="1" />
                {/* Embedded crystals on the tips of gold spikes */}
                <circle cx="21" cy="21" r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
                <circle cx="50" cy="11" r="4.5" fill="#EF4444" stroke="#F59E0B" strokeWidth="1.5" className="animate-pulse" />
                <circle cx="79" cy="21" r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
                
                <defs>
                  <linearGradient id="leftGoldBase" x1="50" y1="43" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FBDF24" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                  <linearGradient id="leftGoldSpikes" x1="50" y1="11" x2="50" y2="43" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="40%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute -top-3 left-2 text-yellow-200 text-xs animate-ping">✨</span>
              <span className="absolute -top-1 right-2 text-yellow-300 text-xs animate-pulse">✨</span>
            </div>
          )}

          {/* Overlapping Hexagonal WIN/LOSE Shield on host screen container (Aligned at bottom-right close to division center) */}
          {hostIsWinning && !isDraw && (
            <div className="absolute bottom-1 right-1 z-30 pointer-events-none scale-90">
              <div className="relative flex items-center justify-center animate-bounce" style={{ width: '64px', height: '64px' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-red-600 to-amber-500 rounded-2xl rotate-45 blur-[4px] opacity-85" />
                <div className="absolute inset-1 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] bg-gradient-to-b from-amber-400 via-orange-600 to-red-600 border border-yellow-300 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-yellow-100 text-[8px] font-black italic">WIN</span>
                  <div className="w-6 h-[1.5px] bg-yellow-200/60 mt-0.5" />
                </div>
              </div>
            </div>
          )}

          {((opponentIsWinning && !isDraw) || (pkScore === 0 && pkOpponentScore === 0)) && (
            <div className="absolute bottom-1 right-1 z-30 pointer-events-none scale-90">
              <div className="relative flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-violet-900 to-zinc-850 rounded-2xl rotate-45 blur-[3px] opacity-75" />
                <div className="absolute inset-1 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] bg-gradient-to-b from-zinc-700 via-purple-900 to-zinc-950 border border-purple-500/50 flex flex-col items-center justify-center">
                  <span className="text-purple-300 text-[8px] text-[10px] select-none">⚡</span>
                  <span className="text-purple-200 text-[10px] font-black uppercase italic tracking-tighter">LOSE</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* --- RIGHT STREAM AREA (OPPONENT / GUEST SCREEN) --- */}
        <div className="flex-1 h-full relative overflow-hidden">
          
          {/* Emojis aligned on top-right of Right cell: 😡 😡 😊 */}
          <div className="absolute top-5 right-3 z-30 flex items-center gap-1 select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            <span className="text-[17px] filter drop-shadow">😡</span>
            <span className="text-[17px] filter drop-shadow animate-pulse">😡</span>
            <span className="text-[17px] filter drop-shadow text-emerald-400 rotate-12 inline-block">😊</span>
          </div>

          {/* DYNAMIC SETTLEMENT: Loser drops water tears from their eyes */}
          {hostIsWinning && !isDraw && (
            <div className="absolute inset-0 pointer-events-none select-none z-30">
              {/* Left eye teardrop stream */}
              <div className="absolute top-[28%] left-[28%] w-10 h-32 overflow-visible">
                <svg className="absolute w-3 h-4 text-cyan-400 fill-current drop-shadow-[0_1px_4px_rgba(34,211,238,0.4)]" style={{ animation: 'tearfall 1.85s infinite ease-in', animationDelay: '0s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-3.5 h-4 text-cyan-300 fill-current opacity-70" style={{ animation: 'tearfall 1.85s infinite ease-in', animationDelay: '0.5s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-2.5 h-3 text-cyan-100 fill-current opacity-50" style={{ animation: 'tearfall 1.85s infinite ease-in', animationDelay: '1.1s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
              </div>

              {/* Right eye teardrop stream */}
              <div className="absolute top-[28%] right-[28%] w-10 h-32 overflow-visible">
                <svg className="absolute w-3 h-4 text-cyan-400 fill-current drop-shadow-[0_1px_4px_rgba(34,211,238,0.4)]" style={{ animation: 'tearfall 2.05s infinite ease-in', animationDelay: '0.2s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-3.5 h-4 text-cyan-300 fill-current opacity-70" style={{ animation: 'tearfall 2.05s infinite ease-in', animationDelay: '0.7s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
                <svg className="absolute w-2.5 h-3 text-cyan-100 fill-current opacity-50" style={{ animation: 'tearfall 2.05s infinite ease-in', animationDelay: '1.3s' }} viewBox="0 0 30 45">
                  <path d="M15 0 C25 20 30 30 30 37 C30 46 20 45 15 45 C10 45 0 46 0 37 C0 30 5 20 15 0 Z" />
                </svg>
              </div>
            </div>
          )}

          {/* DYNAMIC SETTLEMENT: Winner gets the sparkling gold crown (Perfect design match, wearable crown look) */}
          {((opponentIsWinning && !isDraw) || (pkScore === 0 && pkOpponentScore === 0)) && (
            <div className="absolute top-[22%] left-1/2 pointer-events-none select-none z-30 animate-[crownBob_2.5s_ease-in-out_infinite]" style={{ width: '85px' }}>
              <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-[0_4px_10px_rgba(251,191,36,0.65)]">
                {/* Crown base with shiny metallic yellow gold */}
                <path d="M15 50 L85 50 L80 43 L20 43 Z" fill="url(#oppGoldBase)" stroke="#EAB308" strokeWidth="1" />
                {/* Gemstone slots */}
                <rect x="25" y="45" width="6" height="3" rx="1.5" fill="#EF4444" />
                <rect x="37" y="45" width="6" height="3" rx="1.5" fill="#3B82F6" />
                <rect x="49" y="45" width="6" height="3" rx="1.5" fill="#EF4444" />
                <rect x="61" y="45" width="6" height="3" rx="1.5" fill="#3B82F6" />
                <rect x="73" y="45" width="6" height="3" rx="1.5" fill="#EF4444" />
                {/* Spikes */}
                <path d="M15 43 L21 21 L35 32 L50 11 L65 32 L79 21 L85 43 Z" fill="url(#oppGoldSpikes)" stroke="#F59E0B" strokeWidth="1" />
                {/* Gem pearls */}
                <circle cx="21" cy="21" r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
                <circle cx="50" cy="11" r="4.5" fill="#EF4444" stroke="#F59E0B" strokeWidth="1.5" className="animate-pulse" />
                <circle cx="79" cy="21" r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
                
                <defs>
                  <linearGradient id="oppGoldBase" x1="50" y1="43" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FBDF24" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                  <linearGradient id="oppGoldSpikes" x1="50" y1="11" x2="50" y2="43" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="40%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute -top-3 left-1 text-yellow-100 text-[10px] animate-ping">✨</span>
              <span className="absolute -top-1.5 right-1.5 text-yellow-300 text-xs animate-bounce">✨</span>
            </div>
          )}

          {/* Overlapping Hexagonal WIN/LOSE Shield on opponent stream container (Aligned at bottom-left close to division center) */}
          {((opponentIsWinning && !isDraw) || (pkScore === 0 && pkOpponentScore === 0)) && (
            <div className="absolute bottom-1 left-1 z-30 pointer-events-none scale-90">
              <div className="relative flex items-center justify-center animate-bounce" style={{ width: '64px', height: '64px' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-red-600 to-amber-500 rounded-2xl rotate-45 blur-[4px] opacity-85" />
                <div className="absolute inset-1 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] bg-gradient-to-b from-amber-400 via-orange-600 to-red-600 border border-yellow-300 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-yellow-100 text-[8px] font-black italic">WIN</span>
                  <div className="w-6 h-[1.5px] bg-yellow-200/60 mt-0.5" />
                </div>
              </div>
            </div>
          )}

          {hostIsWinning && !isDraw && (
            <div className="absolute bottom-1 left-1 z-30 pointer-events-none scale-90">
              <div className="relative flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-violet-900 to-zinc-850 rounded-2xl rotate-45 blur-[3px] opacity-75" />
                <div className="absolute inset-1 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] bg-gradient-to-b from-zinc-700 via-purple-900 to-zinc-950 border border-purple-500/50 flex flex-col items-center justify-center">
                  <span className="text-purple-300 text-[8px] text-[10px] select-none">⚡</span>
                  <span className="text-purple-200 text-[10px] font-black uppercase italic tracking-tighter">LOSE</span>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Follow profile pill overlay in bottom-right segment: `⚡️🍀 Peach...` with [ + ] action */}
          <div className="absolute bottom-2.5 right-2 min-w-[105px] bg-black/60 hover:bg-black/70 backdrop-blur-xl border border-zinc-700/30 rounded-full px-2 py-1 flex items-center justify-between gap-1 z-30 pointer-events-auto transition-all select-none scale-90 origin-bottom-right">
            <div className="flex items-center gap-0.5 min-w-0">
              <span className="text-[9px] leading-none shrink-0" title="Lightning">⚡️</span>
              <span className="text-[10px] leading-none shrink-0" title="Clover">🍀</span>
              <span className="text-white text-[10px] font-bold tracking-tight truncate max-w-[50px]">
                Peachy
              </span>
            </div>
            <button 
              type="button"
              onClick={handleFollowOpponent}
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center border-0 active:scale-90 transition-transform cursor-pointer shadow-md text-[10px]",
                isFollowed 
                  ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                  : "bg-cyan-400 text-black hover:bg-cyan-300 font-extrabold"
              )}
            >
              <span className="leading-none select-none">{isFollowed ? '✓' : '+'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. SETTLEMENT BOTTOM ROW - LOCATED PIXEL PERFECTLY BELOW VIDEOS (Y = 120px to bottom-260px) */}
      <div className="absolute bottom-[205px] left-0 right-0 flex items-center justify-between px-4 z-40 pointer-events-auto">
        {/* Left Sofa spectator chair: Orange sphere with cómoda VIP seat */}
        <button
          type="button"
          onClick={() => handleJoinSofa(true)}
          className="w-11 h-11 rounded-full border border-yellow-400 bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 shadow-[0_4px_12px_rgba(249,115,22,0.5)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer relative"
          title="Join Left Supporter Chair"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white drop-shadow">
            <path d="M4 11V16H20V11H4ZM2 10C2 9.44772 2.44772 9 3 9H21C21.5523 9 22 10.45 22 11V18H2V10ZM1 13H3V17H1V13ZM21 13H23V17H21V13ZM5 18H7V19H5V18ZM17 18H19V19H17V18Z" />
          </svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 border border-black rounded-full scale-75 animate-pulse" />
        </button>
        
        {/* Centre Score lock & Details pill: Exact picture text: `End of PK,Score lock Details >` */}
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="bg-black/85 backdrop-blur-2xl border border-zinc-700/60 px-5 py-2.5 rounded-full flex items-center gap-1 shadow-[0_8px_25px_rgba(0,0,0,0.85)] hover:border-yellow-400/60 active:scale-95 transition-all cursor-pointer text-xs"
        >
          <span className="text-white/40 select-none mr-0.5 animate-pulse text-[9px]">●</span>
          <span className="text-[12px] text-zinc-300 font-extrabold tracking-tight">
            End of PK,Score lock
          </span>
          <span className="text-[12px] text-[#fbbf24] font-black italic tracking-tight flex items-center gap-0.5">
            Details <span>&gt;</span>
          </span>
        </button>

        {/* Right Sofa spectator chair: Blue sphere with cómoda VIP seat */}
        <button
          type="button"
          onClick={() => handleJoinSofa(false)}
          className="w-11 h-11 rounded-full border border-sky-400 bg-gradient-to-tr from-blue-700 via-sky-500 to-cyan-400 shadow-[0_4px_12px_rgba(14,165,233,0.5)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer relative"
          title="Join Right Supporter Chair"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white drop-shadow">
            <path d="M4 11V16H20V11H4ZM2 10C2 9.44772 2.44772 9 3 9H21C21.5523 9 22 10.45 22 11V18H2V10ZM1 13H3V17H1V13ZM21 13H23V17H21V13ZM5 18H7V19H5V18ZM17 18H19V19H17V18Z" />
          </svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 border border-black rounded-full scale-75 animate-pulse" />
        </button>
      </div>

      {/* 5. BIG INTERACTIVE DETAILS SCORECARD DRAWER/MODAL (Opened via "Details >") */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.9)] flex flex-col text-left"
            >
              {/* Leaderboard Header */}
              <div className="bg-gradient-to-r from-amber-600/30 via-zinc-900 to-blue-600/30 p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-400 w-5 h-5" />
                  <div>
                    <h3 className="text-white font-black text-xs uppercase tracking-wider">PK Match Details</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Live Contributor Scorecard</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-800 active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs max-h-[60vh] scrollbar-hide">
                
                {/* Simulated Point controller for quick live demonstration panel */}
                <div className="bg-zinc-900/40 border border-yellow-500/20 rounded-2xl p-4 space-y-3">
                  <h4 className="text-yellow-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                    <Sparkles size={11} className="text-yellow-400 animate-spin" />
                    DEVELOPER PK SIMULATION TOOL
                  </h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Shift scores in the live preview to test the progress bar, witness winner crowns, and lose tears transition actively!
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      onClick={() => {
                        setLocalHostScore(prev => (prev || 0) + 500);
                        triggerToast("Sent +500 Beans to Host streamer!", 'success');
                      }}
                      className="py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-black uppercase rounded-xl active:scale-95 shadow border-0"
                    >
                      +500 Host (Yellow)
                    </button>
                    <button
                      onClick={() => {
                        setLocalOpponentScore(prev => (prev || 0) + 500);
                        triggerToast("Sent +500 Beans to Opponent streamer!", 'success');
                      }}
                      className="py-2.5 bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-black uppercase rounded-xl active:scale-95 shadow border-0"
                    >
                      +500 Opponent (Blue)
                    </button>
                  </div>
                  <div className="flex justify-center text-[10px] pt-1">
                    <button 
                      onClick={() => {
                        setLocalHostScore(0);
                        setLocalOpponentScore(0);
                        triggerToast("Reset scores to 0-0", "info");
                      }}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase rounded-full border border-zinc-700"
                    >
                      Reset Sim 
                    </button>
                  </div>
                </div>

                {/* Score Ratio Progress Circle representation */}
                <div className="flex items-center justify-around py-2 border-b border-zinc-900 pb-5">
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold mb-0.5">Host Support</p>
                    <p className="text-white font-[950] text-xl font-mono text-[#fbbf24]">{hostPercent.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold mb-0.5 font-mono">VS</p>
                    <span className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                      LIVE
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold mb-0.5">Peachy Support</p>
                    <p className="text-white font-[950] text-xl font-mono text-[#00e5ff]">{(100 - hostPercent).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Left Streamer top contributors list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={12} className="text-[#fbbf24]" />
                      Host Fans (Yellow)
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold font-mono">Points: {pkScore}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Dark Matters2.o', contribution: Math.round(pkScore * 0.6), level: 45, badge: '👑 VIP' },
                      { name: 'HNM 🦋🌹', contribution: Math.round(pkScore * 0.3), level: 32, badge: '💎 Fan' },
                      { name: 'Adabekee_9', contribution: Math.round(pkScore * 0.1), level: 25, badge: '⚡ Regular' }
                    ].map((user, i) => (
                      <div key={i} className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black flex items-center justify-center text-xs shadow-inner">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold text-[11px] flex items-center gap-1">
                              {user.name}
                              <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded font-mono font-black">{user.badge}</span>
                            </p>
                            <p className="text-zinc-500 text-[9px] font-bold">Contributor Lv.{user.level}</p>
                          </div>
                        </div>
                        <span className="text-white font-black font-mono tracking-tight text-[#fbbf24]">
                          {user.contribution.toLocaleString()} b.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Streamer top contributors list */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={12} className="text-[#00e5ff]" />
                      Peachy Fans (Blue)
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold font-mono">Points: {pkOpponentScore}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'SweetAsCandy', contribution: Math.round(pkOpponentScore * 0.55), level: 38, badge: '🔥 VIP' },
                      { name: 'Knight_Rider', contribution: Math.round(pkOpponentScore * 0.35), level: 29, badge: '🔮 Patron' },
                      { name: 'Solomon_O', contribution: Math.round(pkOpponentScore * 0.1), level: 18, badge: '⭐ Spect' }
                    ].map((user, i) => (
                      <div key={i} className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black flex items-center justify-center text-xs shadow-inner">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-white font-bold text-[11px] flex items-center gap-1">
                              {user.name}
                              <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1 py-0.2 rounded font-mono font-black">{user.badge}</span>
                            </p>
                            <p className="text-zinc-500 text-[9px] font-bold">Contributor Lv.{user.level}</p>
                          </div>
                        </div>
                        <span className="text-white font-black font-mono tracking-tight text-[#00e5ff]">
                          {user.contribution.toLocaleString()} b.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase rounded-2xl active:scale-95 transition-transform"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. ROUND CORNER GENERAL OVERLAYS (CINEMATIC BATTLE INTRO LOGS) */}
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
                className="flex flex-col items-center gap-4 text-center select-none"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur-[45px] opacity-40 animate-ping" />
                  <div className="w-24 h-24 rounded-full border-4 border-amber-400/40 flex items-center justify-center bg-zinc-950/70 shadow-[0_0_60px_rgba(245,158,11,0.5)]">
                    <Volume2 className="w-12 h-12 text-amber-400" />
                  </div>
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

                <div className="space-y-1">
                  <span className="text-[9px] text-amber-500 font-black tracking-[0.45em] uppercase block animate-pulse">
                    🎺 WAR HORN ACTIVE
                  </span>
                  <h2 className="text-2xl font-black italic uppercase text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none tracking-tight">
                    PREPARE FOR PK BATTLE!
                  </h2>
                </div>
              </motion.div>
            )}

            {introStep === 'helmets' && (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {[...Array(20)].map((_, i) => {
                  const angle = (i * 360) / 20;
                  const radian = (angle * Math.PI) / 180;
                  const distance = 80 + Math.random() * 120;
                  const dx = Math.cos(radian) * distance;
                  const dy = Math.sin(radian) * distance;
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                      animate={{ x: dx, y: dy, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 z-45"
                    />
                  );
                })}

                <motion.div 
                  initial={{ x: -250, rotate: -30, opacity: 0 }}
                  animate={{ x: -40, rotate: 12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="absolute z-20"
                >
                  <div className="relative w-24 h-24 flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
                    <div className="absolute top-[-14px] inset-x-4 h-5 bg-red-600 rounded-t-full border-t border-orange-400" />
                    <div className="w-14 h-4 bg-black/95 rounded border border-amber-400/35 flex items-center justify-around px-2">
                      <div className="w-1 h-2 bg-red-500" />
                      <div className="w-1 h-2 bg-red-500" />
                    </div>
                    <div className="w-2.5 h-8 bg-amber-600 border border-white/10 mt-1 rounded-sm" />
                    <span className="text-[7px] font-black text-white/50 absolute bottom-1.5 uppercase tracking-widest">HOST</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 250, rotate: 30, opacity: 0 }}
                  animate={{ x: 40, rotate: -12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="absolute z-20"
                >
                  <div className="relative w-24 h-24 flex flex-col items-center justify-center bg-gradient-to-bl from-red-600 to-zinc-800 rounded-3xl border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
                    <div className="absolute top-[-14px] inset-x-4 h-5 bg-amber-500 rounded-t-full border-t border-yellow-400/40" />
                    <div className="w-14 h-4 bg-black/95 rounded border border-red-500/35 flex items-center justify-around px-2">
                      <div className="w-1 h-2 bg-[#00e5ff]" />
                      <div className="w-1 h-2 bg-[#00e5ff]" />
                    </div>
                    <div className="w-2.5 h-8 bg-zinc-650 border border-white/10 mt-1 rounded-sm" />
                    <span className="text-[7px] font-black text-white/50 absolute bottom-1.5 uppercase tracking-widest">OPPONENT</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.35, 1], opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.45 }}
                  className="absolute z-30 flex flex-col items-center justify-center text-center mt-32"
                >
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-[65px] opacity-40 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <Swords className="w-6 h-6 text-[#00e5ff] animate-bounce" />
                    <h1 className="text-2xl font-extrabold italic tracking-tighter text-white drop-shadow-[0_4px_15px_rgba(239,68,68,0.95)] bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text text-transparent uppercase">
                      BATTLE START!
                    </h1>
                    <Swords className="w-6 h-6 text-[#ffc400] animate-bounce" />
                  </div>
                  <p className="text-[8px] font-black text-zinc-300 tracking-[0.25em] uppercase mt-0.5">
                    ⚔️ CLASH WITH HONOR ⚔️
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. NOTIFICATION TOAST POPUP PORTAL */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-[999] pointer-events-none flex justify-center"
          >
            <div className="bg-neutral-900/95 backdrop-blur-3xl text-white px-5 py-3 rounded-2xl border border-zinc-700/50 shadow-2xl flex items-center gap-2.5 text-xs font-black uppercase tracking-wide">
              <span>⚡️</span>
              <span className="text-zinc-200">{showToast.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PKBattle.displayName = 'PKBattle';
