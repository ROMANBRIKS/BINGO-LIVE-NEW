import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Gift, MessageSquare, Shield, ShieldCheck, X, UserPlus, Ban, MicOff, UserMinus,
  Share2, MapPin, Eye, Copy, Diamond, Sparkles, Plus, ChevronRight, ChevronLeft, Settings, 
  ExternalLink, LogOut, LayoutGrid, Trophy, Mail, Users, TrendingUp
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { LevelBadge } from './LevelBadge';
import { NobleBadge } from './NobleBadge';
import { SVIPBadge } from './SVIPBadge';

interface UserDiscoveryPopupProps {
  user: UserProfile | null;
  onClose: () => void;
  isHost?: boolean;
}

export const UserDiscoveryPopup: React.FC<UserDiscoveryPopupProps> = ({ user, onClose, isHost }) => {
  if (!user) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full h-full md:max-w-md bg-white overflow-hidden shadow-2xl flex flex-col font-roboto"
        >
          {/* Scrollable Content Container */}
          <div className="overflow-y-auto scrollbar-hide flex-1 bg-white">
            {/* Cover / Profile Photo Area */}
            <div className="relative aspect-square w-full overflow-hidden flex items-center justify-center bg-[#4d3a33]">
              {/* Action Overlay */}
              <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-20">
                <button onClick={onClose} className="hover:bg-black/10 transition-colors">
                  <ChevronLeft size={30} className="text-white" strokeWidth={2} />
                </button>
                <div className="flex items-center gap-3">
                  <button className="text-white drop-shadow-sm">
                    <Share2 size={22} strokeWidth={2.5} />
                  </button>
                  <div className="relative">
                    <button className="p-1 text-white border-[1.5px] border-white/50 rounded-lg">
                      <ExternalLink size={18} strokeWidth={2.5} />
                    </button>
                    <div className="absolute -top-1.5 -right-2 bg-[#2af5ff] text-[7px] font-[900] px-1 py-0.5 rounded-[3px] text-black border border-white/30 shadow-sm leading-none">37%</div>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="w-full h-full relative group bg-gradient-to-br from-[#4d3a33] to-[#3a2c27] flex items-center justify-center">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                    alt="Profile"
                  />
                ) : (
                  <div className="text-[12rem] font-medium text-white/90">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Visitor Pill Overlay - EXACT POSITIONING */}
              <div className="absolute bottom-4 right-3 z-10">
                <div className="relative cursor-pointer active:scale-95 transition-all">
                  <div className="rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 ring-1 ring-white/5">
                    <div className="w-4 h-4 bg-[#2af5ff] rounded-full flex items-center justify-center">
                      <Eye size={10} className="text-black" strokeWidth={3} />
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-tight">visitor: 42</span>
                  </div>
                  <div className="absolute -top-1.5 -right-1 w-4.5 h-4.5 bg-[#ff3b30] rounded-full border-[1.5px] border-[#4d3a33] flex items-center justify-center text-[9px] font-black text-white shadow-lg">6</div>
                </div>
              </div>
            </div>

            {/* Info Section - TIGHT CLONE */}
            <div className="bg-white px-4 pt-3 pb-1 space-y-3.5">
              {/* User Identity Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-[20px] font-[900] tracking-tight text-black leading-tight">{user.displayName}</h2>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-sm bg-[#eff6ff] flex items-center justify-center border border-blue-100">
                        <Users size={9} className="text-blue-400" strokeWidth={3} />
                      </div>
                      <div className="w-4 h-4 rounded-sm bg-[#5cc8ff] flex items-center justify-center shadow-sm">
                        <span className="text-[10px] text-white font-black leading-none">♂</span>
                      </div>
                      <div className="px-1 py-0.5 rounded-sm bg-[#f2f2f2] flex items-center gap-0.5 border border-gray-100">
                        <Plus size={7} className="text-gray-400" strokeWidth={4} />
                        <span className="text-[9px] font-black text-gray-400 leading-none">☺</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#999999] text-[11.5px] font-medium tracking-tight">
                    <span>ID: {user.uid.slice(0, 10)}</span>
                    <button onClick={() => copyToClipboard(user.uid.slice(0, 10))} className="text-gray-300">
                      <Copy size={10} strokeWidth={2.5} />
                    </button>
                    <span className="text-gray-200">|</span>
                    <span>In Space</span>
                  </div>
                </div>
                
                {/* Anniversary Badge */}
                <div className="w-14 h-14 -mt-1">
                  <img src="https://img.icons8.com/color/144/medal2.png" className="w-full h-full object-contain" alt="10th" />
                </div>
              </div>

              {/* Stats Row - CONDENSED & TALL CLONE */}
              <div className="flex items-center gap-4">
                {[
                  { label: 'Fans', value: user.fans || 32 },
                  { label: 'Following', value: user.following || 392 },
                  { label: 'Beans', value: user.totalBeansEarned || 1 },
                  { label: 'Diamonds', value: user.diamonds || 0 },
                ].map((stat, i) => (
                  <div key={i} className="flex items-baseline gap-[2px]">
                    <span className="text-[20px] font-condensed font-[900] text-black tracking-tighter leading-none scale-y-110 origin-bottom transform">
                      {stat.value}
                    </span>
                    <span className="text-[10px] font-semibold text-[#bcbcbc] leading-none ml-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Achievement Row */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-full pl-0.5 pr-2 py-0.5 border border-gray-200/50">
                  <div className="w-3.5 h-3.5 bg-[#ccc] rounded-full flex items-center justify-center">
                    <Diamond size={8} className="text-white fill-white" />
                  </div>
                  <span className="text-[10px] font-[900] text-gray-500">1</span>
                </div>

                <div className="flex items-center gap-1 bg-[#fdf2ff] px-2 py-0.5 rounded-full border border-purple-100/50">
                   <div className="w-4 h-4 bg-white rounded-[3px] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                     <span className="text-[9px]">🎭</span>
                   </div>
                   <span className="text-[9px] font-[900] text-[#c026d3] uppercase tracking-tighter">Challenger</span>
                </div>
              </div>

              {/* Interaction Cards - MORE COMPACT */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="px-3 py-2 rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200/30">
                    <span className="text-base">🦁</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-black text-gray-800 leading-none truncate">Family</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Join now ›</p>
                  </div>
                </div>

                <div className="px-3 py-2 rounded-xl border border-gray-100 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-[1.5px] border-white bg-gray-100 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=contribution${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold text-gray-400 italic">Contribution</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Banner */}
            <div className="px-4 py-3">
              <div className="bg-[#f0fdff] rounded-xl px-3.5 py-2.5 flex items-center justify-between border border-cyan-100/50">
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-black text-gray-800">Bind your Email</h4>
                  <p className="text-[10px] text-cyan-700/60 font-bold">Get personalized recommendations!</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="bg-[#2af5ff] text-white px-3.5 py-1 rounded-full text-[11px] font-black shadow-sm active:scale-95 transition-all">
                    Enter
                  </button>
                  <button className="text-gray-300">
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Tab Header - PRECISION CLONE */}
            <div className="bg-white border-b border-gray-50 sticky top-0 z-20">
              <div className="px-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative py-2.5">
                    <span className="text-[14px] font-[900] text-black">Profile</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-1 bg-black rounded-full" />
                  </div>
                  <div className="py-2.5 opacity-30">
                    <span className="text-[14px] font-[900] text-black">Dino</span>
                  </div>
                </div>
                <button className="p-2 text-gray-300">
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Content Banner Area */}
            <div className="p-5">
              <div className="w-full aspect-[21/9] rounded-xl overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a23] to-[#222]" />
                <img 
                  src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600" 
                  className="w-full h-full object-cover opacity-60" 
                  alt="Life Restart" 
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-center">
                  <h5 className="text-[15px] font-black italic text-white uppercase italic tracking-tight">Life Restart Test</h5>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
