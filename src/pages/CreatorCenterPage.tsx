import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Megaphone, Crown, ShieldCheck, AlertTriangle, 
  GraduationCap, Headset, Contact2, CheckCircle2, XCircle,
  Video, Sparkles, Star, Heart, Trophy, Flame, Swords,
  Users, RotateCw, Gamepad2, PartyPopper, Gift, Phone, Music,
  Dog, CalendarHeart, Zap, Hand, Ticket, Settings, Briefcase,
  Camera, Smile, Columns2, ZoomIn, Key, Mic2, Youtube, MonitorUp,
  Newspaper, UserPlus, ChevronRight, FileText, Clock, LifeBuoy, DollarSign, AlertCircle, ThumbsUp, Check,
  Lock as LockIcon, Scale as ScaleIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GoLiveModal } from '../components/GoLiveModal';
import { ARPreviewModal } from '../components/ARPreviewModal';
import { OfficialHostGateModal } from '../components/OfficialHostGateModal';
import { LiveAnalyticsModal } from '../components/LiveAnalyticsModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Agency, UserProfile } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, limit, orderBy, setDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';

const ExampleImage = ({ src, label, status }: { src: string, label: string, status: 'good' | 'ng' }) => (
  <div className="flex flex-col gap-2">
    <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
      <img src={src} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={label} />
      <div className="absolute bottom-2 right-2">
        {status === 'good' ? (
          <div className="bg-teal-500 text-white rounded-full p-0.5">
            <CheckCircle2 size={16} />
          </div>
        ) : (
          <div className="bg-[#FF4D4F] text-white rounded-full p-0.5">
            <XCircle size={16} />
          </div>
        )}
      </div>
    </div>
    <span className="text-[10px] font-medium text-slate-400 text-center">{label}</span>
  </div>
);

export default function CreatorCenterPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('Live');
  const [tutorialTab, setTutorialTab] = useState<string>('Live Skills');
  const [isGoLiveModalOpen, setIsGoLiveModalOpen] = useState(false);
  const [isARPreviewOpen, setIsARPreviewOpen] = useState(false);
  const [arInitialTab, setArInitialTab] = useState<'beauty' | 'magic' | 'transform'>('beauty');
  const [agency, setAgency] = useState<Agency | null>(null);
  const [agencyHosts, setAgencyHosts] = useState<UserProfile[]>([]);
  const [isLoadingAgency, setIsLoadingAgency] = useState(false);
  const [isCreatingAgency, setIsCreatingAgency] = useState(false);
  const [isHostGateOpen, setIsHostGateOpen] = useState(false);
  const [isLiveAnalyticsOpen, setIsLiveAnalyticsOpen] = useState(false);

  // Advanced Automated Contract States
  const [hostAgency, setHostAgency] = useState<Agency | null>(null);
  const [agencyMember, setAgencyMember] = useState<any>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [showAgencyApplyModal, setShowAgencyApplyModal] = useState(false);
  const [showLockedQualifications, setShowLockedQualifications] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [agreedToStandardTerms, setAgreedToStandardTerms] = useState(false);

  // Enforced Veteran Qualification Targets
  const userLevel = profile?.level || 1;
  const userBeansEarned = profile?.totalBeansEarned || 0;
  
  // Calculate agency contract tracking (90 days)
  const getContractTracking = () => {
    let joinedDate = new Date();
    if (agencyMember?.joinedAt) {
      if (typeof agencyMember.joinedAt.toDate === 'function') {
        joinedDate = agencyMember.joinedAt.toDate();
      } else {
        joinedDate = new Date(agencyMember.joinedAt);
      }
    } else {
      // Fallback: Default to exactly 45 days ago for existing / uninitialized members to present simulated cycle progress
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 45);
      joinedDate = pastDate;
    }

    const elapsedMs = new Date().getTime() - joinedDate.getTime();
    const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
    const contractLimitDays = 90;
    const isPast90Days = elapsedDays >= contractLimitDays;
    const daysProgressPercent = Math.min(100, Math.round((elapsedDays / contractLimitDays) * 100));

    // Calculate buyout proportional fee and multipliers
    // S-Tiers in Creator Center: S1=180k, S2=300k, S3=600k, S4=800k, S6=1.2M beans
    let baseBuyout = 10000;
    let rankLabel = "Tier 1 (Novice Streamer)";
    if (userBeansEarned >= 1000000) {
      baseBuyout = 500000;
      rankLabel = "Tier 5 (Mega Star)";
    } else if (userBeansEarned >= 150000) {
      baseBuyout = 150050;
      rankLabel = "Tier 4 (Power Streamer)";
    } else if (userBeansEarned >= 50000) {
      baseBuyout = 60000;
      rankLabel = "Tier 3 (Rising Host)";
    } else if (userBeansEarned >= 30000) {
      baseBuyout = 30000;
      rankLabel = "Tier 2 (Standard Host)";
    }

    const region = profile?.region || 'US';
    let regionMultiplier = 1.0;
    if (region === 'US') {
      regionMultiplier = 1.5;
    } else if (region === 'GB' || region === 'UK') {
      regionMultiplier = 1.4;
    } else if (region === 'EU') {
      regionMultiplier = 1.3;
    }

    const finalFee = isPast90Days ? 0 : Math.round(baseBuyout * regionMultiplier);

    return {
      elapsedDays,
      isPast90Days,
      daysProgressPercent,
      baseBuyout,
      rankLabel,
      region,
      regionMultiplier,
      finalFee
    };
  };

  const contractInfo = getContractTracking();

  const targetLevel = 15;
  const targetBeans = 630000; // $3,000 USD ecosystem volume (210 beans per $1 cashout value, or 1 diamond sent = 1 bean received -> 630,000 beans)
  
  const meetsLevel = userLevel >= targetLevel;
  const meetsEarnings = userBeansEarned >= targetBeans;
  const isQualifiedForAgency = meetsLevel && meetsEarnings;

  const handleLiveDataClick = () => {
    if (profile?.role === 'host' || profile?.role === 'agency' || profile?.role === 'admin') {
      setIsLiveAnalyticsOpen(true);
    } else {
      setIsHostGateOpen(true);
    }
  };

  const handleSuccessfullySignedHost = async () => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        role: 'host'
      });
      setIsHostGateOpen(false);
      showToast("Congratulations! You are now an official signed BINGO LIVE Host! 🎙️✨", "success");
      setIsLiveAnalyticsOpen(true);
    } catch (err) {
      console.error("Error signing host contract:", err);
      showToast("Upgrade failed. Please check connection and try again.", "error");
    }
  };

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (!profile) return;
      setIsLoadingAgency(true);
      try {
        if (profile.role === 'agency') {
          const agencySnap = await getDocs(query(collection(db, 'agencies'), where('ownerUid', '==', profile.uid), limit(1)));
          if (!agencySnap.empty) {
            const agencyData = agencySnap.docs[0].data() as Agency;
            setAgency(agencyData);
            const hostsSnap = await getDocs(query(collection(db, 'users'), where('agencyId', '==', agencyData.id), orderBy('totalBeansEarned', 'desc'), limit(10)));
            setAgencyHosts(hostsSnap.docs.map(d => d.data() as UserProfile));
          }
        } else if (profile.agencyId) {
          const agencyDoc = await getDoc(doc(db, 'agencies', profile.agencyId));
          if (agencyDoc.exists()) {
            setHostAgency({ id: agencyDoc.id, ...agencyDoc.data() } as Agency);
          }
          const memberDoc = await getDoc(doc(db, 'agency_members', profile.uid));
          if (memberDoc.exists()) {
            setAgencyMember(memberDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching agency data:", error);
      } finally {
        setIsLoadingAgency(false);
      }
    };
    if (activeTab === 'Agency') {
      fetchAgencyData();
    }
  }, [activeTab, profile]);

  const handleCreateAgency = async () => {
    if (!profile) return;
    if (!isQualifiedForAgency) {
      setShowLockedQualifications(true);
      return;
    }
    
    // Open standardized setup modal instead of immediate unilateral creation
    setNewAgencyName(`${profile.displayName || 'Vanguard'} Studio`);
    setShowAgencyApplyModal(true);
  };

  const handleConfirmAgencyCreation = async () => {
    if (!profile) return;
    if (!newAgencyName.trim()) {
      showToast("Please provide a name for your official Agency Studio.", "error");
      return;
    }
    if (!agreedToStandardTerms) {
      showToast("You must review and agree to the Automated BINGO LIVE Agency Terms.", "error");
      return;
    }

    setIsCreatingAgency(true);
    try {
      const agencyId = profile.uid;
      await setDoc(doc(db, 'agencies', agencyId), {
        id: agencyId,
        name: newAgencyName,
        ownerUid: profile.uid,
        commissionRate: 0.10, // 10% standard partner starting rate
        memberCount: 0,
        totalEarnings: 0,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', profile.uid), {
        role: 'agency',
        agencyId: agencyId // Agency owner also has context of their own studio
      });

      showToast("Official BINGO LIVE Agency registered successfully! 👑", "success");
      setShowAgencyApplyModal(false);
      
      // For immediate fresh state feedback:
      window.location.reload();
    } catch (err) {
      console.error("Error setting up agency:", err);
      showToast("Failed to compile Agency contract registration. Try again.", "error");
    } finally {
      setIsCreatingAgency(false);
    }
  };

  const handleImmediateBuyout = async () => {
    if (!profile || !profile.agencyId) return;
    const currentBeans = profile.beans || 0;
    const finalFee = contractInfo.finalFee;

    if (!contractInfo.isPast90Days && currentBeans < finalFee) {
      showToast(`Insufficient Balance. You need at least ${finalFee.toLocaleString()} Beans to execute instant buyout termination for this contract.`, "error");
      return;
    }

    try {
      const userRef = doc(db, 'users', profile.uid);
      const agencyId = profile.agencyId;
      
      await updateDoc(userRef, {
        beans: increment(-finalFee),
        agencyId: null,
        coolingOffScheduled: false, // reset scheduled coolingOff if relevant
        coolingOffSince: null
      });

      await updateDoc(doc(db, 'agencies', agencyId), {
        memberCount: increment(-1)
      });

      await deleteDoc(doc(db, 'agency_members', profile.uid));

      if (contractInfo.isPast90Days) {
        showToast("90-Day notice rules applied: Streamer contract released immediately for 0 Beans! 🕊️", "success");
      } else {
        showToast(`Immediate Contract Buyout completed! Deducted ${finalFee.toLocaleString()} Beans proportional penalty.`, "success");
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      showToast("Failed to compile buyout transaction.", "error");
    }
  };

  const handleInitiateCoolingOff = async () => {
    if (!profile || !profile.agencyId) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        coolingOffScheduled: true,
        coolingOffSince: serverTimestamp()
      });
      showToast("Success! Standard 30-Day cooling-off period initiated. Return in 30 days.", "success");
      window.location.reload();
    } catch (err) {
      console.error(err);
      showToast("Failed to initiate cooling-off notice.", "error");
    }
  };

  const handleSubmitDispute = async () => {
    if (!profile || !profile.agencyId) return;
    if (!disputeText.trim()) {
      showToast("Please detail specific communication neglect or non-support issues to file a claim.", "error");
      return;
    }

    try {
      const agencyId = profile.agencyId;
      await setDoc(doc(collection(db, 'agency_disputes'), profile.uid), {
        streamerUid: profile.uid,
        streamerName: profile.displayName || 'Signed Broadcaster',
        agencyId,
        text: disputeText,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'users', profile.uid), {
        agencyId: null
      });

      await updateDoc(doc(db, 'agencies', agencyId), {
        memberCount: increment(-1)
      });

      await deleteDoc(doc(db, 'agency_members', profile.uid));

      showToast("Dispute logged successfully. System protective rules has immediately liberated you for $0 cost!", "success");
      setShowDisputeModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      showToast("Failed to record dispute claim.", "error");
    }
  };

  // Cloned services list from Screenshot 4
  const services = [
    { icon: Video, label: 'Live Preview', desc: 'Reserve your next live', color: 'bg-sky-50 text-[#00A5FF]', id: 'live_preview' },
    { icon: AlertTriangle, label: 'Cover Adjustment', desc: 'Optimize visual exposure', color: 'bg-rose-50 text-[#D84B31]', id: 'cover_adj' },
    { icon: Megaphone, label: 'Check my events', desc: 'Host events & bonuses', color: 'bg-indigo-50 text-[#409EFF]', id: 'check_events' },
    { icon: Crown, label: 'Host level', desc: 'Elevate host reputation', color: 'bg-teal-50 text-[#00B4D8]', id: 'host_level' },
    { icon: AlertTriangle, label: 'Account Violations', desc: 'Track streaming health', color: 'bg-amber-50 text-[#FFA800]', id: 'account_viol' },
    { icon: GraduationCap, label: 'Host Academy', desc: 'Master classes & growth', color: 'bg-violet-50 text-[#7F00FF]', id: 'host_acad' },
    { icon: Headset, label: 'Customer Services', desc: 'Dedicated host assistance', color: 'bg-blue-50 text-[#007CFF]', id: 'cust_serv' },
    { icon: Contact2, label: 'Real name authentication', desc: 'Verification status', color: 'bg-emerald-50 text-[#10B981]', id: 'real_name' },
  ];

  const tutorialTabs = ['Live Skills', 'Single Live', 'Multi-guest Live', 'Virtual Live', 'Game Live'];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1D2124] font-sans antialiased flex flex-col pb-32">
      {/* Pristine Header with back arrow & Title precisely aligned as per Screenshot 4 */}
      <header className="bg-white border-b border-gray-100 flex-none sticky top-0 z-50 px-4 pt-10 pb-3 shadow-sm">
        <div className="relative flex items-center justify-center w-full h-10">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-0 p-2 text-[#1D2124] active:scale-95 transition-transform"
            id="back-creator-btn"
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>
          <span className="text-lg font-bold text-[#1D2124]">Creator Center</span>
        </div>

        {/* Navigation Tabs - Live & Agency under Header with solid deep bar underline indicator inside light mode */}
        <div className="flex gap-8 px-2 mt-2">
          {['Live', 'Agency'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-1 text-[15px] font-bold transition-all relative",
                activeTab === tab ? "text-[#1D2124] font-black" : "text-[#909399]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="creatorTabIndicator" 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[4px] bg-[#1D2124] rounded-full" 
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {activeTab === 'Live' ? (
          <>
            {/* May Data Card - Custom-made blue wave gradient background layout */}
            <div className="bg-gradient-to-br from-[#E2F5FF] via-[#E8F8FF] to-[#D5F0FF] rounded-[1.5rem] p-5 shadow-sm border border-[#CDEBFF] relative overflow-hidden">
              {/* Absolutes for abstract aesthetic back-shapes */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-200/40 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  {/* Avatar holding display name initial letter inside a round circle */}
                  <div className="w-12 h-12 rounded-full bg-amber-800 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                    {profile?.displayName ? profile.displayName[0].toUpperCase() : 'D'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-[#111111] leading-tight">May data</span>
                  </div>
                </div>
                <button 
                  onClick={handleLiveDataClick}
                  className="text-xs font-bold text-[#00A5FF] flex items-center gap-0.5 hover:opacity-80 active:scale-95 duration-100 bg-white/75 px-3 py-1.5 rounded-full border border-[#BCE1FF]"
                >
                  Live Data <ChevronRight size={13} className="stroke-[3]" />
                </button>
              </div>

              {/* Stat rows */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 relative z-10">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#1D2124]">0</span>
                  <span className="text-[10px] font-bold text-[#606266] uppercase mt-0.5">Live minutes</span>
                </div>
                <div className="flex flex-col border-x border-[#BCE1FF]/50">
                  <span className="text-2xl font-black text-[#1D2124]">0</span>
                  <span className="text-[10px] font-bold text-[#606266] uppercase mt-0.5">New fans</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#1D2124]">0</span>
                  <span className="text-[10px] font-bold text-[#606266] uppercase mt-0.5">New Beans</span>
                </div>
              </div>
            </div>

            {/* Stylized Streamer Promotion CTA Banner precisely Cloned from Screenshot 4 */}
            <div 
              onClick={handleLiveDataClick}
              className="relative bg-gradient-to-r from-[#00E0E0] via-[#01CBD6] to-[#029FA7] rounded-[1.5rem] p-5 shadow-sm text-white overflow-hidden border border-[#00C4D0] cursor-pointer hover:brightness-105 active:scale-[0.99] duration-100 transition-all"
            >
              <div className="absolute right-2 bottom-0 w-24 h-24 opacity-25">
                {/* Simulated 3D yellow cylinder asset decoration with CSS vector circle rings */}
                <div className="absolute right-0 bottom-4 w-12 h-16 bg-[#FFBF00] rounded-t-full border border-yellow-200" />
                <div className="absolute -right-4 bottom-0 w-16 h-12 bg-orange-400 rounded-full" />
              </div>
              <div className="relative z-10 flex flex-col max-w-[70%]">
                <span className="text-lg font-black tracking-tight leading-tight">Become Signed Streamer</span>
                <span className="bg-[#FFEA00] text-[#007F86] text-[10px] font-black px-2.5 py-1 rounded w-fit uppercase tracking-tight mt-2.5 shadow-sm transform">
                  Earn More Money
                </span>
              </div>
              {/* Vibrant pink "UP!" round container floating on the right side */}
              <div className="absolute right-6 top-6 bg-rose-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-2 py-1 rounded-full border-2 border-white shadow-md animate-bounce">
                UP!
              </div>
            </div>

            {/* Live Services Subsection with Cloned 2-Column Grid */}
            <section className="space-y-2.5">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#909399] block ml-1">
                Live Services
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {services.map((svc) => (
                  <div 
                    key={svc.id}
                    onClick={() => {
                      if (svc.id === 'live_preview') {
                        setIsGoLiveModalOpen(true);
                      } else if (svc.id === 'cover_adj') {
                        setArInitialTab('beauty');
                        setIsARPreviewOpen(true);
                      } else {
                        showToast(`${svc.label} feature coming soon! 🛠️`, 'info');
                      }
                    }}
                    className="bg-white p-3.5 rounded-[1.25rem] border border-gray-100 hover:bg-gray-50 flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer shadow-sm min-h-[64px]"
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", svc.color)}>
                      <svc.icon size={20} className="stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-extrabold text-[#111111] leading-tight">
                        {svc.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Live Tutorial expandable collapsible footer for rich completeness */}
            <section className="space-y-3 pt-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#909399] block ml-2">
                Live Tutorial
              </span>
              
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
                {tutorialTabs.map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setTutorialTab(tab)}
                    className={cn(
                      "px-5 py-2 rounded-full text-[10px] font-extrabold uppercase italic tracking-widest transition-all whitespace-nowrap snap-center border",
                      tutorialTab === tab 
                        ? "bg-[#1E2022] text-white border-[#1E2022] shadow-sm" 
                        : "bg-white text-gray-400 border-gray-100"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[#1E2022] text-sm leading-tight uppercase">1. Live Settings and Makeup</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Set a sparkling cover and clear description to instantly trigger massive entry flows.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <ExampleImage src="https://picsum.photos/seed/cover1/300/300" label="Highlight" status="good" />
                  <ExampleImage src="https://picsum.photos/seed/cover2/300/300" label="High-resolution" status="good" />
                  <ExampleImage src="https://picsum.photos/seed/cover6/300/300" label="Blur/Block" status="ng" />
                </div>
              </div>
            </section>
          </>
        ) : profile?.role === 'agency' ? (
          <div className="space-y-6">
            {/* Cloned Agency Banner Card */}
            <div className="relative bg-[#1a1a1a] rounded-[1.5rem] p-6 text-white overflow-hidden shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">{agency?.name || 'My Agency Studio'}</h3>
                  <span className="text-[9px] uppercase font-black tracking-widest text-cyan-400 block">ACTIVE BINGO PARTNER</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="block text-[8px] uppercase font-bold text-white/40 tracking-wider">Total Earnings</span>
                  <span className="text-base font-extrabold text-white">${agency?.totalEarnings?.toLocaleString() || '0.00'}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <span className="block text-[8px] uppercase font-bold text-white/40 tracking-wider">Active Hosts</span>
                  <span className="text-base font-extrabold text-cyan-400">{agency?.memberCount || 0} Streamers</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/agency-dashboard')}
                className="w-full py-3 bg-cyan-400 hover:brightness-105 text-black rounded-xl font-bold uppercase text-[11px] tracking-widest text-center flex items-center justify-center gap-1.5 duration-100"
              >
                Enter Full Agency Console
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Quick Streamers roster */}
            <div className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Manage Streamers roster
              </span>

              {isLoadingAgency ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : agencyHosts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <p className="text-xs font-bold leading-relaxed">No streamers recruited yet.<br/>Go recruiting inside Agency Console!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agencyHosts.map((host, idx) => (
                    <div key={host.uid} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-300 font-mono">#{idx+1}</span>
                        <img 
                          src={host.photoURL || `https://i.pravatar.cc/150?u=${host.uid}`} 
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                          alt="avatar" 
                        />
                        <div>
                          <span className="text-xs font-black text-[#1D2124] block truncate max-w-[120px]">{host.displayName}</span>
                          <span className="text-[9px] bg-cyan-50 text-[#00cbd6] font-extrabold px-1.5 py-0.5 rounded block w-fit mt-1">Lv.{host.level || 1}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 block leading-none mb-1">Total Beans</span>
                        <span className="text-xs font-extrabold text-rose-500 font-mono">🔥 {host.totalBeansEarned?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : profile?.agencyId ? (
          // Recruited Streamer / Signed Host Contract View
          <div className="space-y-6 text-left">
            <div className="relative bg-[#0F1C24] text-white rounded-[2rem] p-6 shadow-xl border border-teal-500/20 overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] w-36 h-36 bg-teal-500/5 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-300">
                  <ShieldCheck size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-teal-400">BINGO LIVE PARTNER</h3>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Standard Automated Host Contract</span>
                </div>
              </div>

              <div className="pt-2 pb-4 border-b border-white/5 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Affiliated Studio:</span>
                <div className="flex items-center justify-between">
                  <div className="font-black text-lg text-white">{hostAgency?.name || "Premium Partner Studio"}</div>
                  <span className="text-[9px] bg-teal-500/10 text-teal-300 font-extrabold px-2.5 py-1 rounded">SECURED STATUS</span>
                </div>
              </div>

              {/* Progress metrics */}
              <div className="space-y-4 pt-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>90-Day Contract Cycle</span>
                    <span className="text-zinc-200 font-mono">Day {contractInfo.elapsedDays} of 90 ({contractInfo.daysProgressPercent}%)</span>
                  </div>
                  <div className="h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: `${contractInfo.daysProgressPercent}%` }} />
                  </div>
                  {contractInfo.isPast90Days ? (
                    <span className="text-[9px] text-emerald-400 mt-2.5 block font-bold uppercase leading-normal flex items-center gap-1">
                      👑 90-Day Contract Maturity Unlocked! Immediate zero-penalty release available below.
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-400 mt-2.5 block font-bold uppercase leading-normal">
                      Elapsed duration code tracking: {contractInfo.elapsedDays} days. Early release scales proportional to streamer rank level.
                    </span>
                  )}
                </div>

                <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#00E5FF] block">Platform Revenue Splits</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                    <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] uppercase text-zinc-500 font-extrabold tracking-wider block">Split On Target</span>
                      <span className="font-extrabold text-white text-xs block">100% Base Salary</span>
                    </div>
                    <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="text-[8px] uppercase text-zinc-500 font-extrabold tracking-wider block">Split Under Target</span>
                      <span className="font-extrabold text-teal-400 text-xs block">50% Part-Bonus</span>
                    </div>
                  </div>
                  
                  <span className="text-[9px] text-zinc-400 leading-relaxed block">
                    ⚠️ Splits are fully standardized and automatically executed via platform engine. 
                    Agencies are blocked from drafting self-invented predatory parameters. 
                    Your direct agency contract includes active commission cut rate: <span className="text-[#00E5FF] font-black">{(hostAgency?.commissionRate || 0.10) * 100}%</span>.
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Exit valves */}
            <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ScaleIcon size={16} className="text-teal-600 shrink-0" />
                  Anti-Lockout Dissolution Center
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  To protect performers, your contract is backed by 3 standard platform discharge mechanisms. You are never permanently locked down.
                </p>
              </div>

              {profile?.coolingOffScheduled ? (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                  <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black text-amber-800 block uppercase">Cooling-Off Period Active</span>
                    <p className="text-[10px] text-amber-700 leading-normal mt-1">
                      You filed for Option B cooling-off dissolution. You are free to stream under standard terms, and your affiliation will be completely dissolved in 30 days on schedule for 0 cost.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-sans">
                  {/* Option A */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase">Option A: Instant Release</span>
                        {contractInfo.isPast90Days ? (
                          <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded tracking-wider">FREE RELEASE UNLOCKED</span>
                        ) : (
                          <span className="text-[8px] font-black uppercase text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded tracking-wider">PROPORTIONAL BUYOUT</span>
                        )}
                      </div>
                      
                      {contractInfo.isPast90Days ? (
                        <p className="text-[10px] text-slate-500 leading-normal mt-1.5">
                          Since you completed the primary contract term of 90+ days, you can execute immediate dissolution and transition to solo streaming for **0 Beans**. No fees will be charged.
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1.5 text-left">
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Cancel your agency contract immediately under 90 days. Platform protective rules calculate a proportional liquidated penalty based on tier merit and geographic multiplier:
                          </p>
                          <div className="bg-slate-100/75 p-2.5 rounded-xl text-[9px] text-slate-600 space-y-1 font-mono">
                            <div className="flex justify-between">
                              <span>Broadcaster Merit:</span>
                              <span className="font-bold text-slate-800">{contractInfo.rankLabel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Base Contract Value:</span>
                              <span className="font-bold text-slate-800">{contractInfo.baseBuyout?.toLocaleString()} Beans</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Regional Multiplier:</span>
                              <span className="font-bold text-slate-800">{contractInfo.regionMultiplier}x ({contractInfo.region})</span>
                            </div>
                            <div className="border-t border-slate-200/60 my-1"></div>
                            <div className="flex justify-between text-xs font-extrabold text-slate-900">
                              <span>Buyout Fee:</span>
                              <span className="text-rose-600">{contractInfo.finalFee?.toLocaleString()} Beans</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mt-2.5 font-sans">
                        <span>Available Balance:</span>
                        <span className={cn(
                          "font-mono", 
                          (profile?.beans || 0) >= contractInfo.finalFee ? "text-emerald-600" : "text-rose-500"
                        )}>
                          {profile?.beans || 0} Beans
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleImmediateBuyout}
                      className={cn(
                        "w-full mt-2 py-2.5 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm",
                        contractInfo.isPast90Days 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-rose-500 hover:bg-rose-600"
                      )}
                    >
                      {contractInfo.isPast90Days 
                        ? "Execute Standard Free Dissolution (0 Beans)" 
                        : `Process ${contractInfo.finalFee?.toLocaleString()} Beans Buyout`
                      }
                    </button>
                  </div>

                  {/* Option B */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase">Option B: 30-Day Cooling-off</span>
                        <span className="text-[8px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-0.5 rounded">No Cost</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1">
                        Serve a standard 30-day notice broadcasting under the agency rules, after which you are automatically liberated with 0 fee.
                      </p>
                    </div>
                    <button 
                      onClick={handleInitiateCoolingOff}
                      className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      Initiate 30-Day Cooling-Off Period
                    </button>
                  </div>

                  {/* Option C */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase">Option C: Support Neglect Dispute</span>
                        <span className="text-[8px] font-black uppercase text-teal-500 bg-teal-50 px-2 py-0.5 rounded">Failsafe</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal mt-1">
                        If your Agency Studio fails to support, communicate, or mentor you, file a support dispute. Certified claims trigger immediate, automated zero-fee liberation.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setDisputeText('');
                        setShowDisputeModal(true);
                      }}
                      className="w-full mt-2 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      File Non-Support Neglect Claim
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-8 pb-12 px-6 text-center space-y-8">
            {/* Visual Vector Illustration inspired by Screenshot 1 */}
            <div className="relative w-72 h-44 flex items-center justify-center select-none">
              {/* Back Soft Cyan Circle */}
              <div className="absolute inset-0 bg-[#E0FCFF] rounded-full scale-90 opacity-60 filter blur-xl" />
              
              {/* Outer platform */}
              <div className="absolute bottom-4 w-48 h-3 bg-[#C4FAFF] rounded-full" />
              
              {/* Computer monitor layout */}
              <div className="relative z-10 mr-12 -mt-2">
                {/* Stand */}
                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-8 h-8 bg-[#525CEB] rounded-sm transform skew-x-3" />
                <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-14 h-3 bg-[#525CEB] rounded-full" />
                
                {/* Screen Housing */}
                <div className="w-32 h-22 bg-[#A5F3FC] rounded-xl p-1 shadow-sm flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-1.5 relative overflow-hidden">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-10 pointer-events-none">
                      <div className="border-r border-b border-[#00E5FF]"></div>
                      <div className="border-r border-b border-[#00E5FF]"></div>
                      <div className="border-r border-b border-[#00E5FF]"></div>
                      <div className="border-b border-[#00E5FF]"></div>
                    </div>
                    {/* Growth Chart Arrow Line */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60">
                      <path 
                        d="M 10,50 Q 40,40 60,25 T 90,10" 
                        fill="none" 
                        stroke="#00D4EC" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <circle cx="90" cy="10" r="4" fill="#00D4EC" />
                      {/* Interactive dot animation pulsing */}
                      <circle cx="90" cy="10" r="8" fill="#00D4EC" className="animate-ping opacity-70" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Cute Waving character/mascot behind cyan window right-side */}
              <div className="absolute right-8 top-6 z-20 flex items-center justify-center">
                <div className="w-24 h-24 bg-[#525CEB]/10 rounded-full border-[1.5px] border-[#00E5FF] flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center bg-[#FF80B5]/10">
                    {/* Pink arc at top */}
                    <div className="absolute bottom-0 w-20 h-10 bg-[#FF6EA7] rounded-full" />
                    
                    {/* Cute Dino Monster Avatar Mascot */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-14 h-14 bg-white border border-gray-100 rounded-full shadow-sm">
                      {/* Character eyes & happy smile */}
                      <div className="flex gap-2.5 mb-1 mt-1">
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                      </div>
                      {/* Cute blush dots */}
                      <div className="flex gap-4 absolute top-6">
                        <div className="w-1 h-0.5 bg-rose-400 rounded-full" />
                        <div className="w-1 h-0.5 bg-rose-400 rounded-full" />
                      </div>
                      {/* Smile curve */}
                      <div className="w-4 h-2.5 border-b-[2px] border-slate-800 rounded-b-full -mt-0.5" />
                    </div>

                    {/* Blue spikes on dinosaur */}
                    <div className="absolute left-3 top-3 w-3 h-3 bg-[#00E5FF] rounded-full" />
                    <div className="absolute right-3 top-3 w-3 h-3 bg-[#00E5FF] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating gold gems/diamonds */}
              <div className="absolute left-6 top-8 w-4 h-4 rounded-md bg-gradient-to-br from-[#FFEA79] to-[#FFBF00] transform rotate-45 flex items-center justify-center shadow-xs">
                <span className="text-[7px] text-white select-none">💎</span>
              </div>
              <div className="absolute right-3 top-20 w-3 h-3 rounded-md bg-gradient-to-br from-[#FFEA79] to-[#FFBF00] transform rotate-12 flex items-center justify-center shadow-xs">
                <span className="text-[6px] text-white select-none">💎</span>
              </div>
            </div>

            {/* Title & Subdescription */}
            <div className="space-y-2.5">
              <h2 className="text-xl font-extrabold text-[#1D2124] tracking-tight">Be a BINGO LIVE agent</h2>
              <p className="text-sm text-[#909399] leading-relaxed max-w-[280px] mx-auto whitespace-pre-line text-center">
                Share the platform profits
                {"\n"}Get host recruitment and management tools
              </p>
            </div>

            {/* Action buttons matching exact design in Screenshot 1 */}
            <div className="w-full max-w-[280px] space-y-3">
              <button 
                onClick={handleCreateAgency}
                disabled={isCreatingAgency}
                className="w-full py-3.5 bg-[#00E5FF] hover:bg-[#00D4EC] text-white active:scale-98 transition-all rounded-full font-bold text-sm tracking-wide shadow-sm"
              >
                {isCreatingAgency ? 'Creating Studio...' : 'Apply to become an agent'}
              </button>
              
              <button 
                onClick={handleCreateAgency}
                disabled={isCreatingAgency}
                className="w-full py-3.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#1D2124] active:scale-98 transition-all rounded-full font-bold text-sm tracking-wide"
              >
                Apply to be an administrator/agent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Sticky bottom "Go Live" action pill wrapper matching design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 border-t border-gray-100 z-50 flex justify-center shadow-lg">
        <button 
          onClick={() => setIsGoLiveModalOpen(true)}
          className="w-full max-w-md py-3.5 bg-[#00E5FF] hover:bg-[#00D4EC] text-white rounded-full font-extrabold text-[15px] uppercase tracking-wider shadow-md shadow-[#00E5FF]/20 duration-100 active:scale-95"
          id="go-live-creator-center"
        >
          Go Live
        </button>
      </div>

      {/* Go Live Modal */}
      <AnimatePresence>
        {isGoLiveModalOpen && (
          <GoLiveModal onClose={() => setIsGoLiveModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* AR Live Effects/Beautiful Filter settings preview Modal */}
      <AnimatePresence>
        {isARPreviewOpen && (
          <ARPreviewModal 
            isOpen={isARPreviewOpen} 
            onClose={() => setIsARPreviewOpen(false)} 
            initialTab={arInitialTab}
          />
        )}
      </AnimatePresence>

      {/* Official Host Gate Sheet */}
      <AnimatePresence>
        {isHostGateOpen && (
          <OfficialHostGateModal 
            onClose={() => setIsHostGateOpen(false)} 
            onSuccess={handleSuccessfullySignedHost}
          />
        )}
      </AnimatePresence>

      {/* Unlocked Live Analytics Modal */}
      <AnimatePresence>
        {isLiveAnalyticsOpen && (
          <LiveAnalyticsModal 
            onClose={() => setIsLiveAnalyticsOpen(false)} 
            displayName={profile?.displayName || 'Host'}
          />
        )}
      </AnimatePresence>

      {/* Support Neglect Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <div className="fixed inset-0 bg-[#1D2124]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] max-w-sm w-full p-6 space-y-4 shadow-xl text-left"
            >
              <div className="flex items-center gap-2.5 text-teal-600">
                <ScaleIcon size={24} className="stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase tracking-tight">Support Neglect Arbitration</h3>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                BINGO LIVE protects performers from neglect. If your agency owner has failed to guide or communicate with you, detail it below to trigger immediate $0 contract liberation.
              </p>
              <textarea 
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                placeholder="Describe communication failure, neglect or lack of mentorship..."
                className="w-full h-28 bg-[#F6F8FA] border border-gray-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-400 outline-none resize-none font-medium"
              />
              <div className="flex gap-2 pt-2 col-span-2">
                <button 
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 border border-gray-100 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-wider text-center"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitDispute}
                  className="flex-1 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  Submit Dispute Claim
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Locked Qualification Progress Overlay */}
      <AnimatePresence>
        {showLockedQualifications && (
          <div className="fixed inset-0 bg-[#1D2124]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-6 text-left space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <LockIcon size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1E2022] uppercase tracking-tight">Ecosystem Agency Guard</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mt-0.5">BINGO LIVE VETERAN SPECIFICATIONS</span>
                </div>
              </div>

              <p className="text-xs text-[#909399] leading-relaxed">
                To prevent spam studios and maintain premium, high-integrity streamer representation, becoming an official agency registrar requires standard veteran levels:
              </p>

              <div className="space-y-3 pt-1">
                {/* Rule 1 */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 uppercase block">Account Level 15</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">Your current level: Lv.{userLevel}</span>
                  </div>
                  {meetsLevel ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold px-3 py-1 rounded-full uppercase">PASSED</span>
                  ) : (
                    <span className="text-[10px] bg-rose-50 text-rose-500 font-extrabold px-3 py-1 rounded-full uppercase">LOCKED {userLevel}/15</span>
                  )}
                </div>

                {/* Rule 2 */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-800 uppercase block">Earnings Volume</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">Target: 630k Beans (${targetBeans.toLocaleString()}/$3k value)</span>
                  </div>
                  {meetsEarnings ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-extrabold px-3 py-1 rounded-full uppercase">PASSED</span>
                  ) : (
                    <span className="text-[10px] bg-rose-50 text-rose-500 font-extrabold px-3 py-1 rounded-full uppercase">LOCKED {userBeansEarned.toLocaleString()}/630k</span>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 text-[10px] text-amber-700 leading-normal font-sans">
                💡 <span className="font-bold">Ecosystem Integrity Policy:</span> Anyone with 5,000 coins cannot cheapen our community by creating low-quality agencies. Raising the guard protects creators from low-effort recruitments!
              </div>

              <button 
                onClick={() => setShowLockedQualifications(false)}
                className="w-full py-3.5 bg-[#1E2022] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Acknowledge Requirements
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Setup Accord App Form */}
      <AnimatePresence>
        {showAgencyApplyModal && (
          <div className="fixed inset-0 bg-[#1D2124]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-6 text-left space-y-4"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#1E2022] uppercase tracking-tight flex items-center gap-1.5">
                  <Briefcase size={18} className="text-[#00E5FF]" />
                  Register Studio Agreement Accord
                </h3>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Official BINGO LIVE Registrar Accord</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Agency Studio Name</label>
                <input 
                  type="text" 
                  value={newAgencyName} 
                  onChange={(e) => setNewAgencyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-800 font-black outline-none focus:ring-2 focus:ring-[#00E5FF]"
                  placeholder="Enter custom agency brand..."
                />
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-2.5 text-xs text-slate-500 leading-relaxed max-h-52 overflow-y-auto font-sans">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 block">STANDARD AUTOMATED TERMS</span>
                
                <div className="space-y-2 text-[10px]">
                  <p>✔ **Anti-Predatory Standard**: Studio referral commission rate is set at a standard base rate. Owners are blocked from typing unilateral lock-in clauses.</p>
                  <p>✔ **Streamer Freedom Valves**: Members retain standard options for contract dissolution (10,000 Beans Instant Buyout, or 30-Day Cooling-off Notice).</p>
                  <p>✔ **Support Neglect Failsafe**: Streamers can submit neglect dispute arbitrations that trigger automated zero-charge clearance if left abandoned.</p>
                  <p>✔ **Cyclic Windows**: Contracts operate on standard 90-day seasonal cycles with automatic 5-day instant exit opportunities.</p>
                </div>
              </div>

              {/* Accept checkbox */}
              <label className="flex items-start gap-2 pt-1 font-sans cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={agreedToStandardTerms}
                  onChange={(e) => setAgreedToStandardTerms(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#00E5FF] focus:ring-[#00E5FF]" 
                />
                <span className="text-[11.5px] text-slate-600 font-bold leading-tight">
                  I agree to support, train and mentor creators under standard BINGO LIVE non-predatory conditions.
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowAgencyApplyModal(false)}
                  className="flex-1 py-3 border border-gray-100 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest text-center"
                >
                  Close
                </button>
                <button 
                  onClick={handleConfirmAgencyCreation}
                  className="flex-1 py-3 bg-[#00E5FF] hover:bg-[#00D4EC] text-white rounded-xl text-xs font-bold uppercase tracking-widest text-center"
                >
                  Register Accord
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
