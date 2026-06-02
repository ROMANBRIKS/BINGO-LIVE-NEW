import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, doc, getDoc, getDocs, 
  orderBy, limit, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, DollarSign, Award, ArrowUpRight, 
  Search, ShieldCheck, UserPlus, Info, ChevronRight,
  BarChart3, Target, Crown, Shield, Globe, Lock, Megaphone,
  Video, Calendar, Bell, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AGENCY_TIERS, getTierForEarnings, Agency, AgencyMember, recruitStreamer } from '../agencyLogic';
import { UserProfile } from '../types';

export default function AgencyDashboardPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [members, setMembers] = useState<(AgencyMember & { profile?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'growth' | 'meetings'>('overview');
  const [recruitId, setRecruitId] = useState('');

  // Meeting / Notification Creation States
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingContent, setMeetingContent] = useState('');
  const [meetingPrivacy, setMeetingPrivacy] = useState<'public' | 'private'>('private'); // default closed/private to agency members
  const [meetingType, setMeetingType] = useState<'instant' | 'scheduled' | 'announcement'>('instant');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingPass, setMeetingPass] = useState('1234');
  const [notices, setNotices] = useState<any[]>([]);

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

    // Listen to agency announcements/meetings (sort client-side for absolute robust safety)
    const nQ = query(collection(db, 'agency_notices'), where('agencyId', '==', agencyId));
    const unsubNotices = onSnapshot(nQ, (snap) => {
      const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Robust client-side sorting by creation time desc
      loaded.sort((a: any, b: any) => {
        const aSec = a.createdAt?.seconds || 0;
        const bSec = b.createdAt?.seconds || 0;
        return bSec - aSec;
      });
      setNotices(loaded);
    }, (err) => {
      console.warn("Notices snapshot error:", err);
    });

    return () => {
      unsubAgency();
      unsubMembers();
      unsubNotices();
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

  const handleCreateNotice = async () => {
    if (!meetingTitle.trim()) {
      showToast("Please enter a title or topic for the agency announcement.", "error");
      return;
    }
    const agencyId = profile?.role === 'agency' ? profile?.uid : profile?.agencyId;
    if (!agencyId) {
      showToast("Unified agency context not found.", "error");
      return;
    }

    try {
      const noticeData = {
        agencyId,
        agencyName: agency?.name || 'My Agency Family',
        title: meetingTitle,
        content: meetingContent,
        type: meetingType, // 'instant' | 'scheduled' | 'announcement'
        privacy: meetingPrivacy,
        passcode: meetingPrivacy === 'private' ? meetingPass : null,
        scheduledAt: meetingType === 'scheduled' ? meetingDate : null,
        creatorUid: profile.uid,
        creatorName: profile.displayName || 'Agency Director',
        creatorPhoto: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'agency_notices'), noticeData);
      showToast("Official Agency space announced! Notification sent 📣", "success");
      
      const isInstant = meetingType === 'instant';
      setMeetingTitle('');
      setMeetingContent('');

      if (isInstant) {
        showToast("Launching meeting room draft... Ready to stream! 🔴", "success");
        navigate('/go-live');
      }
    } catch (err) {
      console.error("Error creating notice:", err);
      showToast("Failed to notify members.", "error");
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
        <div className="flex flex-wrap gap-2 lg:gap-4 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-8 w-fit">
          {(['overview', 'members', 'growth', 'meetings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 animate-pulse" : "text-white/40 hover:text-white"
              )}
            >
              {tab === 'meetings' ? 'Spaces & Meetings 🎙️' : tab}
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

          {activeTab === 'meetings' && (
            <motion.div
              key="meetings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Creator Panel (Only for agency management role) */}
              {profile?.role === 'agency' ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                      <Shield className="text-cyan-400" size={22} />
                      Dispatch Meeting Space & Announcement
                    </h3>
                    <p className="text-xs text-white/40 mt-1">
                      Initiate premium meeting calls, schedule discussions, or release notifications directly to agency member inboxes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Controls */}
                    <div className="space-y-4">
                      {/* Topic Title */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white/40 ml-1">Topic / Title</label>
                        <input
                          type="text"
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          placeholder="e.g. Weekly Streamer Commission & Dynamic Gifting Alignments"
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 text-white font-bold"
                        />
                      </div>

                      {/* Msg content / Agenda */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white/40 ml-1">Agenda / Memo Message</label>
                        <textarea
                          rows={3}
                          value={meetingContent}
                          onChange={(e) => setMeetingContent(e.target.value)}
                          placeholder="Provide details about the meeting rules, live streams target numbers, etc."
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 text-white"
                        />
                      </div>

                      {/* Space type / Privacy controls */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 ml-1">Audience Scope</label>
                          <div className="flex gap-2 bg-neutral-900 p-1.5 rounded-2xl border border-white/5">
                            <button
                              type="button"
                              onClick={() => setMeetingPrivacy('private')}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-center text-[10px] uppercase font-black transition-all flex items-center justify-center gap-1.5",
                                meetingPrivacy === 'private' ? "bg-white/10 text-cyan-400" : "text-white/40 hover:text-white"
                              )}
                            >
                              <Lock size={12} />
                              Closed
                            </button>
                            <button
                              type="button"
                              onClick={() => setMeetingPrivacy('public')}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-center text-[10px] uppercase font-black transition-all flex items-center justify-center gap-1.5",
                                meetingPrivacy === 'public' ? "bg-white/10 text-rose-400" : "text-white/40 hover:text-white"
                              )}
                            >
                              <Globe size={12} />
                              Open
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-white/40 ml-1">Action Type</label>
                          <select
                            value={meetingType}
                            onChange={(e) => setMeetingType(e.target.value as any)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none font-bold"
                          >
                            <option value="instant">🔴 Live Space Call</option>
                            <option value="scheduled">⏰ Scheduled Meeting</option>
                            <option value="announcement">🛡️ Memorandum Notice</option>
                          </select>
                        </div>
                      </div>

                      {/* Scheduled Time & Passcode options side-by-side */}
                      <div className="grid grid-cols-2 gap-4">
                        {meetingType === 'scheduled' && (
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 ml-1">Schedule date/time</label>
                            <input
                              type="datetime-local"
                              value={meetingDate}
                              onChange={(e) => setMeetingDate(e.target.value)}
                              className="w-full bg-neutral-900 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none"
                            />
                          </div>
                        )}

                        {meetingPrivacy === 'private' && (
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 ml-1">Space Passcode</label>
                            <input
                              type="text"
                              maxLength={4}
                              value={meetingPass}
                              onChange={(e) => setMeetingPass(e.target.value.replace(/\D/g, '').substring(0,4))}
                              className="w-full bg-neutral-900 border border-white/10 rounded-2xl px-3 py-2 text-center text-xs text-white focus:outline-none font-mono tracking-widest font-black"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleCreateNotice}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:scale-[1.01] active:scale-[0.99] transition-all text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 mt-4"
                      >
                        <Megaphone size={16} />
                        Dispatch Meeting Space 📢
                      </button>
                    </div>

                    {/* Notification Alert Preview */}
                    <div className="bg-black/35 rounded-3xl border border-white/5 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">🚨 Interactive Alert Preview</span>
                          <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-right uppercase">Inbox Notice</span>
                        </div>
                        
                        <div className="mt-4 flex items-start gap-3">
                          <img 
                            src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                            className="w-10 h-10 rounded-xl"
                            alt="avatar"
                          />
                          <div className="flex-1 text-left">
                            <h4 className="text-sm font-black text-gray-200">{agency?.name || "Official Agency Info"}</h4>
                            <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                              <span>BY {profile?.displayName || 'LEADER'} (DIRECTOR)</span>
                            </div>
                            <p className="text-xs text-neutral-300 font-bold leading-normal uppercase text-cyan-200 decoration-cyan-500">
                              {meetingTitle || "Topic Title Placeholder"}
                            </p>
                            <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                              {meetingContent || "Provide agenda text message and we'll display it to your hosts."}
                            </p>
                          </div>
                        </div>

                        {meetingPrivacy === 'private' && (
                          <div className="p-3 bg-neutral-900 border border-white/5 rounded-2xl mt-4 text-left flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 font-extrabold uppercase">🔐 Restricted Space Gated</span>
                            <span className="text-xs font-bold font-mono tracking-widest text-cyan-400">Code: {meetingPass}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-4 justify-between">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Target: All streamer members</span>
                        {meetingType === 'instant' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-black text-[8px] uppercase tracking-wider">LIVE NOW ON BROADCAST</span>
                        ) : meetingType === 'scheduled' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400 font-black text-[8px] uppercase tracking-wider">SCHEDULED IN CALENDAR</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/15 text-purple-400 font-black text-[8px] uppercase tracking-wider">ANNOMANDUM</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Streamer Members view */
                <div className="bg-gradient-to-br from-cyan-950/20 to-transparent border border-white/10 rounded-3xl p-6 text-left space-y-2">
                  <ShieldCheck className="text-cyan-400" size={32} />
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Agency Member Communiques</h3>
                  <p className="text-xs text-white/40 leading-relaxed max-w-xl">
                    Welcome to the private Agency Spaces forum. Since you are registered as a premium broadcaster under <span className="text-cyan-400 font-extrabold">"{agency?.name || 'Exclusive Family'}"</span>, you will review official directives and scheduled spaces directly below.
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                    ⚠️ To publish announcements or start instant board meetings, you must contact your direct agency manager.
                  </p>
                </div>
              )}

              {/* Announcements & Space Notices History Feed */}
              <div className="space-y-4">
                <h3 className="text-lg font-black uppercase italic tracking-widest text-left">Agency notice records ({notices.length})</h3>
                {notices.length === 0 ? (
                  <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl">
                    <Bell size={32} className="mx-auto mb-2 text-white/20" />
                    <p className="text-sm font-bold text-white/40 uppercase">No notifications found.</p>
                    <p className="text-xs text-white/30">Official meetings will be listed here once called.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notices.map((notice) => {
                      const isLiveNow = notice.type === 'instant';
                      return (
                        <div key={notice.id} className="relative bg-white/5 border border-white/10 p-5 rounded-3xl text-left space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={notice.creatorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notice.creatorUid}`} className="w-8 h-8 rounded-full border border-white/10" alt="avatar"/>
                              <div>
                                <span className="text-xs font-semibold block text-neutral-100">{notice.creatorName}</span>
                                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">Director</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {notice.type === 'instant' ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-black text-[9px] uppercase tracking-wider inline-block">LIVE SPACE</span>
                              ) : notice.type === 'scheduled' ? (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 text-amber-400 font-black text-[9px] uppercase tracking-wider inline-block">SCHEDULED</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/15 text-purple-400 font-black text-[9px] uppercase tracking-wider inline-block font-sans">MEMORANDUM</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-white uppercase">{notice.title}</h4>
                            <p className="text-xs text-neutral-300 leading-relaxed">{notice.content}</p>
                          </div>

                          {notice.privacy === 'private' && (
                            <div className="p-2.5 bg-black/45 rounded-2xl flex items-center justify-between border border-white/5">
                              <span className="text-[9px] font-black tracking-widest uppercase text-white/30">🔐 Closed Space</span>
                              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400">{notice.passcode || '1234'}</span>
                            </div>
                          )}

                          {notice.type === 'scheduled' && notice.scheduledAt && (
                            <div className="p-2.5 bg-black/45 rounded-2xl flex items-center justify-between border border-white/5">
                              <span className="text-[9px] font-black tracking-widest uppercase text-white/30">⏰ Start Target</span>
                              <span className="text-xs font-bold text-amber-400">{notice.scheduledAt.replace('T', ' ')}</span>
                            </div>
                          )}

                          {/* Meeting Live Space Action Direct Link */}
                          {isLiveNow && (
                            <button
                              onClick={() => {
                                showToast("Connecting to live agency space meeting...", "info");
                                navigate(`/room/${notice.creatorUid}`);
                              }}
                              className="w-full py-2.5 bg-cyan-400 hover:scale-[1.01] transition-transform text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-1.5 animate-pulse shadow-xl shadow-cyan-400/10"
                            >
                              <Video size={13} />
                              Join Meeting Space Now ➔
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
