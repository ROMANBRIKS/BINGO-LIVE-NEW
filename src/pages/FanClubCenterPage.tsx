import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, Heart, Users, Trophy, Settings, 
  Sparkles, Star, Gift, MessageSquare, Plus,
  Shield, Zap, Crown, Award, TrendingUp, Megaphone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FanClubMember, FAN_CLUB_LEVELS } from '../fanClubLogic';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export default function FanClubCenterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [members, setMembers] = useState<FanClubMember[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Members' | 'Settings' | 'Rewards'>('Overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Fetch fan club members for the current host
        const membersSnap = await getDocs(
          query(collection(db, 'fan_club_members'), where('hostUid', '==', auth.currentUser.uid), orderBy('intimacyPoints', 'desc'))
        );
        setMembers(membersSnap.docs.map(d => d.data() as FanClubMember));
      } catch (error) {
        console.error("Error fetching fan club data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#121212]">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-gradient-to-b from-pink-900/40 to-slate-900 pt-6 pb-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-5 px-2">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl border-4 border-white/10">
            💖
          </div>
          <div className="flex-1 space-y-1">
            <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Fan Club Center</h1>
            <p className="text-xs text-white/40 font-medium">Manage your most loyal supporters and grow your club.</p>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-pink-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{members.length} Members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={12} className="text-rose-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Club</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2 gap-8 mt-8">
          {['Overview', 'Members', 'Settings', 'Rewards'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "py-2 text-[10px] font-black uppercase italic tracking-widest transition-all relative",
                activeTab === tab ? "text-white" : "text-white/20"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Club Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">New Members (7d)</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    <span className="text-xl font-black text-white italic">+12</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Club Intimacy</span>
                  <div className="flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400" />
                    <span className="text-xl font-black text-white italic">High</span>
                  </div>
                </div>
              </div>

              {/* Fan Club Levels Preview */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Club Progression</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 space-y-4">
                  {FAN_CLUB_LEVELS.slice(0, 3).map((level) => (
                    <div key={level.level} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black italic" style={{ backgroundColor: level.badgeColor }}>
                        {level.level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Level {level.level} Perks</span>
                          <span className="text-[8px] text-white/20 uppercase tracking-widest">{level.pointsRequired} pts</span>
                        </div>
                        <div className="flex gap-2">
                          {level.perks.map((perk, i) => (
                            <span key={i} className="text-[8px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full border border-white/5">{perk}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Fans Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Top Supporters</h3>
                  <button onClick={() => setActiveTab('Members')} className="text-[10px] font-black text-pink-400 uppercase tracking-widest">See All</button>
                </div>
                <div className="bg-white/5 rounded-[2.5rem] p-2 border border-white/10">
                  {members.slice(0, 3).map((member, i) => (
                    <div key={member.uid} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-[2rem] transition-colors">
                      <div className="relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} className="w-12 h-12 rounded-2xl object-cover bg-white/5" />
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
                          <span className="text-[10px] font-black text-white">{i + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase tracking-tight">User_{member.uid.slice(0, 4)}</span>
                          {member.isSuperFan && <Crown size={12} className="text-yellow-400" />}
                        </div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Intimacy: {member.intimacyPoints}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                        <Heart size={18} fill="currentColor" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Members' && (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Club Members ({members.length})</h3>
                <button className="p-2 bg-pink-500/10 rounded-full text-pink-500">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.uid} className="bg-white/5 rounded-[2rem] p-4 border border-white/10 flex items-center gap-4">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} className="w-12 h-12 rounded-2xl object-cover bg-white/5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase tracking-tight">User_{member.uid.slice(0, 4)}</span>
                        <div className="bg-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          LV.{member.level}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest">Points: {member.intimacyPoints}</span>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">Last Active: {new Date(member.lastCheckIn).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="p-2 text-white/20 hover:text-white">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'Settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Club Entry Requirements</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">Minimum Level</span>
                      <span className="text-[10px] text-white/40">Required level to join the club</span>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl text-white font-black italic">10</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">Entry Fee</span>
                      <span className="text-[10px] text-white/40">Diamonds required to join</span>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl text-white font-black italic">99</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">Auto-Accept</span>
                      <span className="text-[10px] text-white/40">Automatically accept new members</span>
                    </div>
                    <div className="w-12 h-6 bg-pink-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Customization</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">Club Name</span>
                      <span className="text-[10px] text-white/40">Your unique club identity</span>
                    </div>
                    <button className="text-pink-400 text-[10px] font-black uppercase tracking-widest">Edit</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">Custom Badge</span>
                      <span className="text-[10px] text-white/40">Exclusive badge for members</span>
                    </div>
                    <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white text-xs font-black italic">
                      FC
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Rewards' && (
            <motion.div 
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Gift size={32} className="text-white" />
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Club Rewards</h3>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Set up exclusive rewards for your club members to encourage loyalty and engagement.
                  </p>
                  <button className="px-8 py-3 bg-white text-orange-600 rounded-full font-black uppercase italic tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                    Add Reward
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Sparkles, title: 'Exclusive Emotes', desc: 'Custom emotes only for club members.' },
                  { icon: Shield, title: 'Priority Access', desc: 'Members get priority in guest mic queues.' },
                  { icon: Award, title: 'Special Entrance', desc: 'Unique entrance animation for super fans.' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-5 rounded-[2rem] border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-pink-400">
                      <item.icon size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black italic uppercase tracking-tight text-white">{item.title}</span>
                      <span className="text-[10px] text-white/40 leading-tight">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex-none p-4 bg-[#1a1a1a] border-t border-white/10">
        <button 
          onClick={() => showToast("Club Broadcast coming soon! 📢", 'info')}
          className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
        >
          <Megaphone size={18} />
          Send Club Broadcast
        </button>
      </div>
    </div>
  );
}
