import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, doc, getDoc, getDocs, 
  orderBy, limit 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, DollarSign, Award, ArrowUpRight, 
  Search, ShieldCheck, UserPlus, Info, ChevronRight,
  BarChart3, Target, Crown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENCY_TIERS, getTierForEarnings, Agency, AgencyMember, recruitStreamer } from '../agencyLogic';
import { UserProfile } from '../types';

export default function AgencyDashboardPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [members, setMembers] = useState<(AgencyMember & { profile?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'growth'>('overview');
  const [recruitId, setRecruitId] = useState('');

  useEffect(() => {
    if (!profile?.agencyId && profile?.role !== 'agency') {
      setLoading(false);
      return;
    }

    const agencyId = profile.role === 'agency' ? profile.uid : profile.agencyId;
    if (!agencyId) return;

    // Listen to Agency Data
    const unsubAgency = onSnapshot(doc(db, 'agencies', agencyId), (snap) => {
      if (snap.exists()) {
        setAgency({ id: snap.id, ...snap.data() } as Agency);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `agencies/${agencyId}`));

    // Listen to Members
    const q = query(collection(db, 'agency_members'), where('agencyId', '==', agencyId));
    const unsubMembers = onSnapshot(q, async (snap) => {
      const memberData = snap.docs.map(d => ({ ...d.data() } as AgencyMember));
      
      // Fetch profiles for members
      const membersWithProfiles = await Promise.all(memberData.map(async (m) => {
        const pSnap = await getDoc(doc(db, 'users', m.uid));
        return { ...m, profile: pSnap.exists() ? { uid: pSnap.id, ...pSnap.data() } as UserProfile : undefined };
      }));

      setMembers(membersWithProfiles);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'agency_members'));

    return () => {
      unsubAgency();
      unsubMembers();
    };
  }, [profile?.agencyId, profile?.role, profile?.uid]);

  const nextTier = agency ? (
    agency.totalEarnings < AGENCY_TIERS.Senior.minEarnings ? 'Senior' :
    agency.totalEarnings < AGENCY_TIERS.Elite.minEarnings ? 'Elite' :
    agency.totalEarnings < AGENCY_TIERS.Master.minEarnings ? 'Master' : 'MAX'
  ) : null;

  const nextTierMin = nextTier && nextTier !== 'MAX' ? (AGENCY_TIERS as any)[nextTier].minEarnings : 0;
  const progress = agency && nextTier !== 'MAX' ? (agency.totalEarnings / nextTierMin) * 100 : 100;

  const handleRecruit = async () => {
    if (!recruitId.trim()) return;
    const agencyId = profile?.role === 'agency' ? profile?.uid : profile?.agencyId;
    if (!agencyId) return;

    try {
      const success = await recruitStreamer(agencyId, recruitId);
      if (success) {
        showToast("Streamer recruited successfully! 🤝", "success");
        setRecruitId('');
      } else {
        showToast("Failed to recruit streamer. Check UID.", "error");
      }
    } catch (err) {
      showToast("An error occurred during recruitment.", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!agency && profile?.role !== 'agency') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <Info size={48} className="mx-auto mb-4 text-white/20" />
          <h2 className="text-xl font-bold mb-2 uppercase italic tracking-widest">No Agency Found</h2>
          <p className="text-white/40 text-sm">You are not Currently part of any official Bingo Live agency.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24 lg:pb-0">
      {/* Header */}
      <div className="relative h-48 lg:h-64 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#050505] to-transparent z-10" />
        <img 
          src="https://picsum.photos/seed/agency/1920/1080?blur=5" 
          className="w-full h-full object-cover opacity-30"
          alt="Banner"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-500/30">
              <ShieldCheck className="text-cyan-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black uppercase italic tracking-tighter">
                {agency?.name || 'ADMIN PANEL'}
              </h1>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest">
                <Crown size={14} />
                <span>{(AGENCY_TIERS as any)[getTierForEarnings(agency?.totalEarnings || 0)].label} Agency</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-30">
        {/* Navigation */}
        <div className="flex gap-4 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-8 w-fit">
          {(['overview', 'members', 'growth'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20" : "text-white/40 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Earnings', value: `$${agency?.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-green-400' },
                  { label: 'Active Members', value: agency?.memberCount || 0, icon: Users, color: 'text-cyan-400' },
                  { label: 'Agency Fee', value: `${(agency?.commissionRate || 0) * 100}%`, icon: BarChart3, color: 'text-purple-400' },
                  { label: 'Current Tier', value: (AGENCY_TIERS as any)[getTierForEarnings(agency?.totalEarnings || 0)].label, icon: Award, color: 'text-yellow-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <stat.icon className={cn("mb-2", stat.color)} size={20} />
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{stat.label}</div>
                    <div className="text-xl font-black">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress Panel */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Tier Progression</h3>
                    <p className="text-white/40 text-xs">Unlock bigger commission bonuses as you scale.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Next Tier</div>
                    <div className="text-cyan-400 font-black">{nextTier}</div>
                  </div>
                </div>

                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                  <span>$0</span>
                  <span>Target: ${nextTierMin.toLocaleString()}</span>
                </div>
              </div>

              {/* Recruitment Tool */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-500/20 p-6 rounded-3xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                      <UserPlus size={20} className="text-cyan-400" />
                      Recruit Talent
                    </h3>
                    <p className="text-white/40 text-xs">Enter a streamer's UID to invite them to your agency family.</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      value={recruitId}
                      onChange={(e) => setRecruitId(e.target.value)}
                      placeholder="Enter UID..."
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 w-full lg:w-48"
                    />
                    <button 
                      onClick={handleRecruit}
                      className="bg-cyan-500 text-black px-6 rounded-xl font-black text-xs uppercase hover:bg-cyan-400 transition-all"
                    >
                      SEND INVITE
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold uppercase italic tracking-widest">Agency Roster ({members.length})</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    placeholder="Search members..."
                    className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.uid} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:border-white/20 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <img 
                          src={member.profile?.photoURL || `https://i.pravatar.cc/150?u=${member.uid}`} 
                          className="w-12 h-12 rounded-xl object-cover"
                          alt="Avatar"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#121212] rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold truncate">{member.profile?.displayName || 'Unknown Streamer'}</div>
                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{member.tier} Tier</div>
                      </div>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                        <div className="text-white/40 text-[9px] uppercase font-bold tracking-widest">Revenue</div>
                        <div className="text-sm font-black">${member.totalEarnings?.toLocaleString() || 0}</div>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                        <div className="text-white/40 text-[9px] uppercase font-bold tracking-widest">Commission</div>
                        <div className="text-sm font-black text-cyan-400">${member.commissionPaid?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'growth' && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Growth Strategy */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target size={20} className="text-orange-400" />
                    Growth Analysis
                  </h3>
                  <div className="space-y-4">
                    {[
                      { l: 'Recruitment Cap', p: 85, v: `${members.length}/100` },
                      { l: 'Avg. Member Performance', p: 62, v: '+$1,250/mo' },
                      { l: 'Agency Popularity', p: 40, v: 'Tier 3' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                          <span className="text-white/40">{item.l}</span>
                          <span className="text-white">{item.v}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white/20" style={{ width: `${item.p}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    Tier Benefits
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(AGENCY_TIERS).map(([key, config]: any) => (
                      <div key={key} className={cn(
                        "p-3 rounded-2xl border flex items-center justify-between",
                        getTierForEarnings(agency?.totalEarnings || 0) === key 
                          ? "bg-cyan-500/10 border-cyan-500/30" 
                          : "bg-white/5 border-white/10 opacity-50"
                      )}>
                        <div>
                          <div className="font-bold text-sm tracking-tight">{config.label}</div>
                          <div className="text-[10px] text-white/40 uppercase font-bold">Min: ${config.minEarnings.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-cyan-400 font-black text-sm">+{config.commissionBonus * 100}%</div>
                          <div className="text-[9px] text-white/40 uppercase font-bold">Bonus</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
