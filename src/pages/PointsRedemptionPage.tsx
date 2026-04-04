import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  UserCog, 
  ThumbsUp, 
  Gift, 
  Shirt,
  Crown,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function PointsRedemptionPage() {
  const navigate = useNavigate();

  const privileges = [
    { id: 'account', icon: ShieldCheck, label: 'Account Privileges', locked: false },
    { id: 'ban', icon: Lock, label: 'Ban Appeal', locked: true },
    { id: 'reset', icon: UserCog, label: 'Reset Information', locked: false },
    { id: 'official', icon: ThumbsUp, label: 'Official recommendation', locked: false },
    { id: 'gifts', icon: Gift, label: 'Virtual gifts', locked: false },
  ];

  const skins = [
    { id: 'skin-a', name: 'Africa-Profile Skin A', points: 800 },
    { id: 'skin-b', name: 'Africa-Profile Skin B', points: 1200 },
    { id: 'skin-c', name: 'Africa-Profile Skin C', points: 1600 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-lg px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Points Redemption</h1>
      </header>

      <div className="px-4 space-y-8">
        {/* SVIP Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004d4d] via-[#003333] to-[#001a1a] p-6 border border-white/5 shadow-2xl"
        >
          <div className="relative z-10">
            <h2 className="text-4xl font-black italic tracking-tighter mb-2">SVIP 1</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-[80%]">
              Only SVIP 1 can redeem the following privileges
            </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-cyan-400/10 blur-3xl rounded-full" />
        </motion.div>

        {/* Privileges Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
          {privileges.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-3 min-w-[80px] group"
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative",
                item.locked 
                  ? "bg-white/5 border border-white/10 text-white/30" 
                  : "bg-white/10 border border-white/5 text-white group-hover:bg-white/20 group-hover:scale-110 group-active:scale-95 shadow-lg"
              )}>
                <item.icon size={24} />
                {item.locked && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 shadow-lg">
                    <Lock size={10} className="text-white" />
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[10px] text-center font-medium leading-tight max-w-[70px]",
                item.locked ? "text-white/30" : "text-white/60 group-hover:text-white"
              )}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Redemption Grid */}
        <div className="grid grid-cols-2 gap-4">
          {skins.map((skin, index) => (
            <motion.button
              key={skin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-[#121212] border border-white/5 rounded-3xl p-5 flex flex-col items-center gap-4 group hover:border-cyan-400/30 transition-all active:scale-95"
            >
              <div className="relative w-24 h-24 flex items-center justify-center bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                <Shirt size={48} className="text-white/40" />
                <Crown size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60" />
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="text-xs font-bold text-white/90">{skin.name}</h3>
                <p className="text-[10px] font-medium">
                  <span className="text-orange-400 font-bold text-sm">{skin.points}</span>
                  <span className="text-white/40 ml-1">points per time</span>
                </p>
              </div>

              <div className="w-full py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:bg-cyan-400 group-hover:text-black transition-all">
                Redeem
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/40 leading-relaxed">
            Points are earned through daily tasks and engagement. Redemption is final and cannot be reversed. Skins are valid for 30 days from the date of redemption.
          </p>
        </div>
      </div>
    </div>
  );
}
