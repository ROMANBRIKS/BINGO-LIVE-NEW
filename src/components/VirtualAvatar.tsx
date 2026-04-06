import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Heart } from 'lucide-react';

export const VirtualAvatar = ({ seed }: { seed: string }) => {
  // Simple deterministic color based on seed
  const getColor = (s: string) => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const mainColor = getColor(seed);

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110%', x: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ 
              y: '-10%', 
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
            className="absolute text-white/20"
          >
            {i % 3 === 0 ? <Star size={12} /> : i % 3 === 1 ? <Sparkles size={12} /> : <Heart size={12} />}
          </motion.div>
        ))}
      </div>

      {/* Avatar Container */}
      <motion.div 
        animate={{ 
          y: [0, -15, 0],
          rotate: [-1, 1, -1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative flex flex-col items-center"
      >
        {/* Head */}
        <div className={`w-32 h-32 rounded-full ${mainColor} border-4 border-white/20 shadow-2xl relative z-10`}>
          {/* Eyes */}
          <div className="absolute top-1/3 left-1/4 flex gap-8">
            <motion.div 
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-4 h-4 bg-white rounded-full" 
            />
            <motion.div 
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-4 h-4 bg-white rounded-full" 
            />
          </div>
          {/* Mouth */}
          <motion.div 
            animate={{ scaleX: [1, 1.2, 1], y: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-white rounded-full" 
          />
          {/* Blush */}
          <div className="absolute top-1/2 left-4 w-4 h-2 bg-white/20 blur-sm rounded-full" />
          <div className="absolute top-1/2 right-4 w-4 h-2 bg-white/20 blur-sm rounded-full" />
        </div>

        {/* Body */}
        <div className={`w-24 h-32 ${mainColor} opacity-80 rounded-t-3xl -mt-4 border-x-4 border-white/10`} />

        {/* Floating Accessories */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 -right-4 text-yellow-400"
        >
          <Sparkles size={24} />
        </motion.div>
      </motion.div>

      {/* Stage Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/20 blur-[80px] rounded-full" />
    </div>
  );
};
