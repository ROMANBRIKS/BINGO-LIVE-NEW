import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Flame, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface GiftExplosionFXProps {
  giftName: string;
  senderName: string;
  comboCount: number;
  cost: number;
  triggerShake: (intensity?: number) => void;
}

// 🔊 Globally Unlocked Shared Audio Context to bypass browser autoplay blocks in iframes
let sharedAudioContext: AudioContext | null = null;
let isAudioEnabledLog = false;

export const ensureAudioContextUnlocked = () => {
  try {
    if (!sharedAudioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioContext = new AudioContextClass();
      }
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().then(() => {
        if (!isAudioEnabledLog) {
          console.log("🔊 Web Audio API Unlocked & Decayed!");
          isAudioEnabledLog = true;
        }
      });
    }
  } catch (err) {
    console.warn("AudioContext unlock blocked:", err);
  }
};

// Register events to wake up the synthesizer as soon as the user interacts with the iframe stream
if (typeof window !== 'undefined') {
  const interactionEvents = ['click', 'touchend', 'mousedown', 'keydown'];
  interactionEvents.forEach(evt => {
    window.addEventListener(evt, ensureAudioContextUnlocked, { passive: true });
  });
}

// High-Fidelity Synthesizer using the shared AudioContext
export const playSyntheticGiftingSound = (type: 'combo' | 'explosion' | 'popup' | 'quake') => {
  try {
    ensureAudioContextUnlocked();
    const ctx = sharedAudioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!ctx) return;
    
    const now = ctx.currentTime;

    if (type === 'combo') {
      // Sparkling digital gold coin cascade chimes
      [587.33, 659.25, 880.00, 1046.50, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.25);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.28);
      });
    } else if (type === 'quake') {
      // Deep, low-frequency planetary earthquake rumble vibrato
      const duration = 1.0;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sawtooth rumble at sub-bass frequencies (38Hz -> 30Hz)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(38, now);
      osc.frequency.linearRampToValueAtTime(28, now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // SWELL gain to build anticipation
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.20, now + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration);
    } else if (type === 'explosion') {
      // Double sub-bass blast combined with metallic debris chimes
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.linearRampToValueAtTime(35, now + 0.6);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ctx.destination);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      osc.start(now);
      osc.stop(now + 0.85);

      // High-frequency debris fragments chimes
      for (let i = 0; i < 9; i++) {
        const dOsc = ctx.createOscillator();
        const dGain = ctx.createGain();
        dOsc.type = 'triangle';
        dOsc.frequency.setValueAtTime(600 + Math.random() * 1800, now + Math.random() * 0.15);
        dOsc.connect(dGain);
        dGain.connect(ctx.destination);
        dGain.gain.setValueAtTime(0.04, now);
        dGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        dOsc.start(now);
        dOsc.stop(now + 0.3);
      }
    } else {
      // Crisp premium navigation popup beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    console.warn("Audio synthesis error:", err);
  }
};

// 🎁 Beautiful Vector SVG Exploding Box structure that scales and splits apart
interface ExplodingBoxProps {
  onBlast: () => void;
}

const ExplodingBox: React.FC<ExplodingBoxProps> = ({ onBlast }) => {
  const [stage, setStage] = useState<'rumble' | 'blast' | 'done'>('rumble');

  useEffect(() => {
    // Play structural earthquake quakes
    playSyntheticGiftingSound('quake');

    const blastTimer = setTimeout(() => {
      setStage('blast');
      onBlast();
    }, 1000); // 1.0 Sec intense anticipation quake

    const doneTimer = setTimeout(() => {
      setStage('done');
    }, 2000);

    return () => {
      clearTimeout(blastTimer);
      clearTimeout(doneTimer);
    };
  }, [onBlast]);

  if (stage === 'done') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[120]">
      {stage === 'rumble' ? (
        <motion.div
          initial={{ scale: 0.1, rotate: 0 }}
          animate={{
            scale: [0.1, 1.3, 1.1, 1.4, 1.25, 1.45],
            rotate: [0, -15, 15, -18, 18, -10, 10, 0],
            y: [0, -12, 6, -14, 7, 0]
          }}
          transition={{
            duration: 1.0,
            ease: "easeInOut"
          }}
          className="relative w-44 h-44 flex items-center justify-center filter drop-shadow-[0_0_55px_rgba(245,158,11,0.85)]"
        >
          {/* Detailed premium SVG Mystery Gift Box Chest */}
          <svg viewBox="0 0 100 100" className="w-[140px] h-[140px]">
            <defs>
              <linearGradient id="chestCore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="60%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            {/* Box Body */}
            <rect x="25" y="45" width="50" height="35" rx="6" fill="url(#chestCore)" stroke="#fde047" strokeWidth="2.5" />
            
            {/* Trim decorations */}
            <rect x="44" y="45" width="12" height="35" fill="url(#goldRibbon)" />
            <rect x="25" y="58" width="50" height="8" fill="url(#goldRibbon)" />
            
            {/* Metallic key lock lock badge */}
            <rect x="40" y="51" width="20" height="16" rx="4" fill="url(#goldRibbon)" stroke="#1a1a1a" strokeWidth="1.2" />
            <circle cx="50" cy="59" r="3.5" fill="#171717" />
            
            {/* Imperial Box Lid */}
            <path d="M 23 45 L 77 45 L 70 26 L 30 26 Z" fill="url(#chestCore)" stroke="#fde047" strokeWidth="2.5" />
            <rect x="44" y="26" width="12" height="19" fill="url(#goldRibbon)" />
            
            {/* Sparkle overlays */}
            <circle cx="35" cy="35" r="1.5" fill="#ffffff" className="animate-ping" />
            <circle cx="65" cy="38" r="1" fill="#ffffff" className="animate-pulse" />
          </svg>
          
          {/* Pulsating glowing particle fields behind */}
          <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full -z-10 animate-pulse" />
        </motion.div>
      ) : (
        // 💥 ACTIVE BLAST CHUNKS
        <div className="relative">
          {/* Lid flies straight into orbit */}
          <motion.div
            initial={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            animate={{ y: -340, scale: 0.5, rotate: 240, opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute -top-16 -left-16 w-32 h-16 pointer-events-none"
          >
            <svg viewBox="0 0 100 50" className="w-full h-full filter drop-shadow-[0_0_20px_#eab308]">
              <path d="M 20 40 L 80 40 L 70 10 L 30 10 Z" fill="url(#chestCore)" stroke="#fde047" strokeWidth="2" />
              <rect x="44" y="10" width="12" height="30" fill="url(#goldRibbon)" />
            </svg>
          </motion.div>

          {/* Left panel shards blow left */}
          <motion.div
            initial={{ x: 0, scale: 1, rotate: 0, opacity: 1 }}
            animate={{ x: -280, y: 80, scale: 0.3, rotate: -120, opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute -top-4 -left-24 w-20 h-20"
          >
            <svg viewBox="0 0 50 50" className="w-full h-full filter drop-shadow-[0_0_15px_#ef4444]">
              <rect x="0" y="0" width="40" height="40" rx="4" fill="url(#chestCore)" stroke="#fde047" strokeWidth="2" />
            </svg>
          </motion.div>

          {/* Right panel shards blow right */}
          <motion.div
            initial={{ x: 0, scale: 1, rotate: 0, opacity: 1 }}
            animate={{ x: 280, y: 80, scale: 0.3, rotate: 120, opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="absolute -top-4 -right-4 w-20 h-20"
          >
            <svg viewBox="0 0 50 50" className="w-full h-full filter drop-shadow-[0_0_15px_#ef4444]">
              <rect x="10" y="0" width="40" height="40" rx="4" fill="url(#chestCore)" stroke="#fde047" strokeWidth="2" />
            </svg>
          </motion.div>

          {/* Golden Shockwave Sphere expansion */}
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 7, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute -top-20 -left-20 w-40 h-40 rounded-full border-8 border-yellow-300 shadow-[0_0_75px_rgba(245,158,11,1)]"
          />
        </div>
      )}
    </div>
  );
};

export const GiftExplosionFX: React.FC<GiftExplosionFXProps> = ({
  giftName,
  senderName,
  comboCount,
  cost,
  triggerShake,
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; duration: number }>>([]);
  const [showBlastText, setShowBlastText] = useState(false);
  const [showAnimatedBox, setShowAnimatedBox] = useState(false);

  useEffect(() => {
    // Determine combo milestones or big gifts triggers
    const isBigGift = cost >= 100;
    const isEpicGift = cost >= 1000;
    const isComboMilestone = comboCount > 0 && (comboCount % 10 === 0 || comboCount === 5 || comboCount === 18 || comboCount === 99);

    if (!isBigGift && !isComboMilestone && !isEpicGift) {
      return;
    }

    // Step 1: Start the Exploding Box rattling phase
    setShowAnimatedBox(true);
    setShowBlastText(false);

    // Generate 35+ exploding ring micro-stars particles in advance
    const colors = [
      '#FF0055', '#00F2FF', '#FFD700', '#FF00FF', '#39FF14', '#FF5722', '#E040FB', '#ff007f'
    ];
    const newParticles = Array.from({ length: 35 }).map((_, i) => {
      const angle = (i * Math.PI * 2) / 35 + (Math.random() * 0.3 - 0.15);
      const distance = 120 + Math.random() * 220;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 10 + Math.random() * 22,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 0.9 + Math.random() * 0.6,
      };
    });
    setParticles(newParticles);

  }, [giftName, comboCount, cost]);

  // Handle callback when box rattles and blasts open
  const handleBoxBlastedOpen = () => {
    const isEpicGift = cost >= 1000;
    
    // Step 2: Trigger mechanical base-boom explosion sound
    playSyntheticGiftingSound('explosion');

    // Step 3: Recoil the viewport camera
    if (isEpicGift || comboCount >= 50) {
      triggerShake(1300); // Earth shake duration
    } else {
      triggerShake(750); // High recoil
    }

    // Step 4: Display exploding particles and high-contrast gift banners
    setShowBlastText(true);

    // Auto-tear down banners after duration
    const bannerTimer = setTimeout(() => {
      setShowBlastText(false);
      setShowAnimatedBox(false);
    }, 2800);

    return () => clearTimeout(bannerTimer);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[250] overflow-hidden select-none">
      {/* 1. Full screen flash backlight overlay during blast */}
      {showBlastText && (
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-yellow-400/25 backdrop-blur-[0.5px]"
        />
      )}

      {/* 2. Physical 3D rattle & split chest box */}
      {showAnimatedBox && (
        <ExplodingBox onBlast={handleBoxBlastedOpen} />
      )}

      {/* 3. Expanding 3D Vector Particle Debris explosion rings */}
      <AnimatePresence>
        {showBlastText && particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [1, 1, 0],
              scale: [0.1, 1.6, 0.3],
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: 'easeOut' }}
            className="absolute rounded-full shadow-[0_0_22px_rgba(255,255,255,0.95)] filter blur-[0.5px]"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 18px ${p.color}, inset 0 0 6px #fff`
            }}
          />
        ))}
      </AnimatePresence>

      {/* 4. High-intensity Central Blast Banner with custom text alerts */}
      <AnimatePresence>
        {showBlastText && (
          <motion.div
            initial={{ scale: 0.3, y: 120, rotate: -15, opacity: 0 }}
            animate={{
              scale: 1,
              y: 0,
              rotate: 0,
              opacity: 1,
            }}
            exit={{ scale: 2.2, opacity: 0, y: -160, filter: 'blur(12px)' }}
            transition={{ type: 'spring', damping: 11, mass: 0.7 }}
            className="flex flex-col items-center gap-1 bg-black/90 border-2 border-yellow-400 px-8 py-5 rounded-3xl shadow-[0_0_90px_rgba(234,179,8,0.85)] text-center scale-95 origin-center backdrop-blur-md max-w-sm z-[130]"
          >
            {/* Crown or Flame Icon badge */}
            <div className="flex gap-2">
              <Flame className="text-orange-500 animate-bounce" size={32} />
              <Zap className="text-yellow-300 animate-pulse" size={32} />
              <Sparkles className="text-teal-400 animate-ping" size={24} />
            </div>

            <div className="text-[10px] font-black uppercase text-yellow-400 tracking-[0.25em] drop-shadow-md animate-pulse">
              🔥 INTENSE COMBO CRUSH! 🔥
            </div>

            <h1 className="text-xl md:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-pink-500 tracking-tight drop-shadow-lg uppercase select-none mt-1">
              {giftName} x{comboCount}
            </h1>

            <div className="text-[11px] font-bold text-neutral-200 mt-2 tracking-wide text-center">
              MVP Gifter <span className="text-cyan-400 font-extrabold">{senderName}</span> is blasting!
            </div>

            {cost >= 1000 && (
              <div className="mt-2.5 text-[8px] bg-red-600/30 text-red-400 border border-red-500/40 px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">
                🏆 LEGENDARY EMULATOR SPEED 🏆
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
