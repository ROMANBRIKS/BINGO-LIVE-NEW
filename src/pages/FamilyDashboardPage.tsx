import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, Users, Trophy, Megaphone, Plus, 
  Search, Shield, Star, Heart, Flame, Zap,
  Settings, UserPlus, MessageSquare, Crown,
  TrendingUp, Award, Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Family, FamilyMember, UserProfile } from '../types';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export default function FamilyDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Members' | 'Ranking' | 'PK'>('Overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          
          if (profile.familyId) {
            const familyDoc = await getDoc(doc(db, 'families', profile.familyId));
            if (familyDoc.exists()) {
              setFamily(familyDoc.data() as Family);
              
              // Fetch members
              const membersSnap = await getDocs(
                query(collection(db, `families/${profile.familyId}/members`), orderBy('contributionPoints', 'desc'))
              );
              setMembers(membersSnap.docs.map(d => d.data() as FamilyMember));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching family data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#121212]">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="flex flex-col bg-[#121212] h-full overflow-hidden">
        <header className="flex-none bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">Family Center</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-cyan-500/20">
            <Users size={64} className="text-white" />
          </div>
          
          <div className="space-y-2 max-w-xs">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">No Family Yet</h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Join a family to compete in PK battles, earn exclusive badges, and grow with your community.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
            <button 
              onClick={() => showToast("Create Family coming soon! 🛠️", 'info')}
              className="w-full py-4 bg-cyan-400 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
            >
              Create a Family
            </button>
            <button 
              onClick={() => showToast("Search Families coming soon! 🔍", 'info')}
              className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-white/10 active:scale-95 transition-all"
            >
              Find a Family
            </button>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-6 w-full max-w-md">
            {[
              { icon: Trophy, label: 'Rankings' },
              { icon: Flame, label: 'Family PK' },
              { icon: Award, label: 'Badges' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                  <item.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden">
      {/* Header with Family Info */}
      <header className="flex-none bg-gradient-to-b from-slate-800 to-slate-900 pt-6 pb-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-5 px-2">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl border-4 border-white/10">
            {family.badge || family.name[0]}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white uppercase italic tracking-tight">{family.name}</h1>
              <div className="bg-cyan-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                LV.{family.level}
              </div>
            </div>
            <p className="text-xs text-white/40 font-medium line-clamp-1">{family.description}</p>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-cyan-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{family.memberCount} Members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={12} className="text-yellow-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Rank #{family.ranking || '---'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2 gap-8 mt-8">
          {['Overview', 'Members', 'Ranking', 'PK'].map(tab => (
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
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
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
              {/* Announcement */}
              <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Megaphone size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Announcement</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic">
                  {family.announcement || "Welcome to our family! Let's grow together and dominate the rankings! 🚀"}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Contribution</span>
                  <div className="flex items-center gap-2">
                    <Zap size={20} className="text-yellow-400" />
                    <span className="text-xl font-black text-white italic">{(family.totalDiamondsSpent / 1000).toFixed(1)}K</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Activity Level</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    <span className="text-xl font-black text-white italic">High</span>
                  </div>
                </div>
              </div>

              {/* Top Members Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Top Contributors</h3>
                  <button onClick={() => setActiveTab('Members')} className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">See All</button>
                </div>
                <div className="bg-white/5 rounded-[2.5rem] p-2 border border-white/10">
                  {members.slice(0, 3).map((member, i) => (
                    <div key={member.uid} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-[2rem] transition-colors">
                      <div className="relative">
                        <img src={member.photoURL} className="w-12 h-12 rounded-2xl object-cover" />
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
                          <span className="text-[10px] font-black text-white">{i + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase tracking-tight">{member.displayName}</span>
                          {member.role === 'leader' && <Crown size={12} className="text-yellow-400" />}
                        </div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Contribution: {member.contributionPoints}</span>
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
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Family Members ({members.length})</h3>
                <button className="p-2 bg-cyan-400/10 rounded-full text-cyan-400">
                  <UserPlus size={18} />
                </button>
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.uid} className="bg-white/5 rounded-[2rem] p-4 border border-white/10 flex items-center gap-4">
                    <img src={member.photoURL} className="w-12 h-12 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase tracking-tight">{member.displayName}</span>
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          member.role === 'leader' ? "bg-yellow-500 text-white" : 
                          member.role === 'co-leader' ? "bg-purple-500 text-white" : 
                          "bg-white/10 text-white/40"
                        )}>
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest">Points: {member.contributionPoints}</span>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">Joined: {new Date(member.joinedAt?.seconds * 1000).toLocaleDateString()}</span>
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

          {activeTab === 'Ranking' && (
            <motion.div 
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Current Ranking</span>
                    <div className="text-4xl font-black italic tracking-tighter">#{family.ranking || '---'}</div>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Trophy size={32} className="text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Global Family Ranking</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-2 border border-white/10">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-[2rem] transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-black italic",
                        rank === 1 ? "bg-yellow-500 text-white" :
                        rank === 2 ? "bg-slate-300 text-slate-700" :
                        rank === 3 ? "bg-orange-400 text-white" :
                        "text-white/20"
                      )}>
                        {rank}
                      </div>
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">
                        🛡️
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-white uppercase tracking-tight">Family {rank}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 w-3/4" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-white italic">1.2M</div>
                        <div className="text-[8px] text-white/20 uppercase tracking-widest">Points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'PK' && (
            <motion.div 
              key="pk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-red-600 to-pink-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Flame size={32} className="text-yellow-400" />
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Family Wars</h3>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Coordinate with your family members to dominate the PK arena and win massive rewards.
                  </p>
                  <button className="px-8 py-3 bg-white text-red-600 rounded-full font-black uppercase italic tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                    Start Battle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Target, title: 'PK Strategy', desc: 'Set target goals for upcoming matches.' },
                  { icon: Shield, title: 'Defense Buffs', desc: 'Activate family shields during critical moments.' },
                  { icon: Zap, title: 'Power Boost', desc: 'Coordinate massive gift drops for 2x points.' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-5 rounded-[2rem] border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400">
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
          onClick={() => showToast("Family Chat coming soon! 💬", 'info')}
          className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
        >
          <MessageSquare size={18} />
          Family Group Chat
        </button>
      </div>
    </div>
  );
}
