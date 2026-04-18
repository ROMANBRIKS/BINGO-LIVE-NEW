import React from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface WeeklyKingProps {
  user: UserProfile | null;
  type: 'Host' | 'Giver';
}

export const WeeklyKing: React.FC<WeeklyKingProps> = ({ user, type }) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group cursor-pointer"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 blur-3xl animate-pulse" />
      
      <div className="relative bg-white/5 border border-yellow-500/30 backdrop-blur-md rounded-3xl p-6 overflow-hidden">
        {/* Animated Background Lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50" />
          <motion.div 
            animate={{ x: [0, 500], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-yellow-400 to-transparent skew-x-12"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar Frame */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-500 via-orange-400 to-yellow-600 rounded-full animate-spin-slow opacity-50" />
              <div className="absolute -inset-1 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
              
              <img 
                src={user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`} 
                className="relative w-24 h-24 rounded-full object-cover border-4 border-[#121212]" 
                alt="Weekly King"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute -top-4 -left-4 bg-yellow-400 text-black p-2 rounded-2xl shadow-xl transform -rotate-12 border-2 border-white/20">
                <Crown size={24} fill="currentColor" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-black text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full italic">
                  Weekly King
                </span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  {type} Edition
                </span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1 group-hover:text-yellow-400 transition-colors">
                {user.displayName}
              </h2>
              <div className="flex items-center gap-2 text-yellow-400/60 font-bold italic text-sm">
                <TrendingUp size={16} />
                <span>Lv.{user.level} Eternal Legend</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:items-end justify-center">
            <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-yellow-500/20 shadow-2xl">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">
                {type === 'Host' ? 'Beans Generated' : 'Diamonds Sent'}
              </div>
              <div className="text-3xl font-black tabular-nums flex items-center gap-2">
                <span className="text-yellow-400">
                  {(type === 'Host' ? user.totalBeansEarned : user.totalDiamondsSpent).toLocaleString()}
                </span>
                <Sparkles size={20} className="text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
