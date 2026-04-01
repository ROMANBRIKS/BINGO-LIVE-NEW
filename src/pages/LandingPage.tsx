import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Video, Mic, Shield, Zap, CheckCircle, HelpCircle, Heart, Star, Flame, Trophy } from 'lucide-react';

export default function LandingPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)] mb-12 rotate-12 border-2 border-white/20"
        >
          <Video size={48} className="text-white drop-shadow-2xl" />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl sm:text-8xl font-black uppercase italic tracking-tighter leading-none mb-6">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Vibe</span>
          </h1>
          <p className="text-white/40 text-lg font-medium max-w-md mx-auto leading-relaxed">
            Connect with creators, join the party, and experience live entertainment like never before.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-16">
          {[
            { icon: Flame, label: 'PK Battles', color: 'text-orange-500' },
            { icon: Heart, label: 'Gifting', color: 'text-pink-500' },
            { icon: Trophy, label: 'Ranking', color: 'text-yellow-500' },
            { icon: Star, label: 'VIP Status', color: 'text-purple-500' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex flex-col items-center gap-2"
            >
              <feature.icon size={24} className={feature.color} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{feature.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={signIn}
          className="w-full max-w-md py-5 bg-white text-black rounded-[2rem] font-black uppercase italic tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Get Started Now
          <Zap size={20} fill="currentColor" />
        </motion.button>
      </div>

      {/* Footer Stats */}
      <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex justify-around max-w-md mx-auto">
          <div className="text-center">
            <p className="text-xl font-black italic">1M+</p>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Users</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black italic">50K+</p>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Hosts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black italic">24/7</p>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Live</p>
          </div>
        </div>
      </div>
    </div>
  );
}
