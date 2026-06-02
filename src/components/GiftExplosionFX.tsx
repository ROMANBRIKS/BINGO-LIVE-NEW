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

// 🔊 High-Fidelity Web Audio Synthesizer (Bypass file download errors)
export const playSyntheticGiftingSound = (type: 'combo' | 'explosion' | 'popup') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (ctx.state === 'suspended') {
      // Try to resume on click/interaction fallback
      ctx.resume();
    }

    if (type === 'combo') {
      // Sparkling high-pitched digital gold coin chimes Cascade
      [587.33, 659.25, 880.00, 1046.50, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.22);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } else if (type === 'explosion') {
      // Heavy mechanical acoustic sub-bass boom
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.linearRampToValueAtTime(45, now + 0.5);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ctx.destination);

      oscGain.gain.setValueAtTime(0.25, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.7);

      // Multi-angle metallic high frequency sparks debris
      for (let i = 0; i < 7; i++) {
        const dOsc = ctx.createOscillator();
        const dGain = ctx.createGain();
        dOsc.type = 'triangle';
        dOsc.frequency.setValueAtTime(700 + Math.random() * 1500, now + Math.random() * 0.1);
        dOsc.connect(dGain);
        dGain.connect(ctx.destination);
        dGain.gain.setValueAtTime(0.03, now);
        dGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        dOsc.start(now);
        dOsc.stop(now + 0.22);
      }
    } else {
      // Crisp popup bell beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    console.warn("Synthetic Audio blocked by autoplay regulations:", err);
  }
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

  useEffect(() => {
    // Determine combo milestones or big gifts triggers
    const isBigGift = cost >= 100;
    const isEpicGift = cost >= 1000;
    const isComboMilestone = comboCount > 0 && (comboCount % 10 === 0 || comboCount === 5 || comboCount === 18 || comboCount === 99);

    if (!isBigGift && !isComboMilestone && !isEpicGift) {
      return;
    }

    // Sound logic in cascades
    if (isEpicGift || comboCount >= 50) {
      playSyntheticGiftingSound('explosion');
      triggerShake(1200); // Massive screen shake duration
    } else {
      playSyntheticGiftingSound('combo');
      triggerShake(600); // Standard camera recoil
    }

    // Generate 25+ exploding particle vector structures out of coordinates
    const colors = [
      '#FF0055', '#00F2FF', '#FFD700', '#FF00FF', '#39FF14', '#FF5722', '#E040FB'
    ];
    const newParticles = Array.from({ length: 30 }).map((_, i) => {
      const angle = (i * Math.PI * 2) / 30 + (Math.random() * 0.4 - 0.2);
      const distance = 100 + Math.random() * 200;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 8 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 0.8 + Math.random() * 0.5,
      };
    });

    setParticles(newParticles);
    setShowBlastText(true);

    const textTimer = setTimeout(() => {
      setShowBlastText(false);
    }, 2200);

    return () => {
      clearTimeout(textTimer);
    };
  }, [giftName, comboCount, cost]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[250] overflow-hidden select-none">
      {/* 1. Full screen flash overlay under heavy load */}
      {showBlastText && (cost >= 1000 || comboCount >= 50) && (
        <motion.div
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-yellow-400/20 backdrop-blur-[1px]"
        />
      )}

      {/* 2. Expanding 3D Vector Particle Debris explosion rings */}
      <AnimatePresence>
        {showBlastText && particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [1, 1, 0],
              scale: [0.2, 1.5, 0.4],
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: 'easeOut' }}
            className={cn(
              "absolute rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] filter blur-[0.5px]",
              p.size > 18 ? "clip-path-hexagon" : "rounded-full"
            )}
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 15px ${p.color}, inset 0 0 5px #fff`
            }}
          />
        ))}
      </AnimatePresence>

      {/* 3. High-intensity Central Blast Banner with custom text alerts */}
      <AnimatePresence>
        {showBlastText && (
          <motion.div
            initial={{ scale: 0.3, y: 80, rotate: -15, opacity: 0 }}
            animate={{
              scale: [0.3, 1.3, 1],
              y: 0,
              rotate: [0, 5, -3, 0],
              opacity: 1,
            }}
            exit={{ scale: 2.2, opacity: 0, y: -120, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 10, mass: 0.8 }}
            className="flex flex-col items-center gap-1 bg-black/85 border-2 border-yellow-400/80 px-8 py-5 rounded-3xl shadow-[0_0_80px_rgba(234,179,8,0.7)] text-center scale-95 origin-center backdrop-blur-md max-w-sm"
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
              <div className="mt-2.5 text-[8px] bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">
                🏆 LEGENDARY EMULATOR SPEED 🏆
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
