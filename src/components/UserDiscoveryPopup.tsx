import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Gift, MessageSquare, Shield, ShieldCheck, X, UserPlus, Ban, MicOff, UserMinus,
  Share2, MapPin, Eye, Copy, Diamond, Sparkles, Plus, ChevronRight, ChevronLeft, Settings, 
  ExternalLink, LogOut, LayoutGrid, Trophy, Mail, Users, TrendingUp,
  Video, Camera, Play, Eye as EyeIcon, Star, Ruler, Scale, Globe, MessageCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { LevelBadge } from './LevelBadge';
import { NobleBadge } from './NobleBadge';
import { SVIPBadge } from './SVIPBadge';
import { generateEnhancedImageUrl } from '../lib/imageProcessor';
import { auth, db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { FamilyDetailsPopup } from './FamilyDetailsPopup';
import { FamilyCreatePopup } from './FamilyCreatePopup';
import { Family } from '../types';
import { getFamilyRankInfo } from '../lib/familyLogic';

import { useToast } from '../context/ToastContext';

interface UserDiscoveryPopupProps {
  user: UserProfile | null;
  onClose: () => void;
  isHost?: boolean;
}

export const UserDiscoveryPopup: React.FC<UserDiscoveryPopupProps> = ({ user, onClose, isHost }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'talents' | 'dino'>('profile');
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [showFamilyDetails, setShowFamilyDetails] = React.useState(false);
  const [showCreateFamily, setShowCreateFamily] = React.useState(false);
  const [familyData, setFamilyData] = React.useState<Family | null>(null);
  
  const isOwner = auth.currentUser?.uid === user?.uid;

  React.useEffect(() => {
    if (user?.familyId) {
      const unsub = onSnapshot(doc(db, 'families', user.familyId), (docSnap) => {
        if (docSnap.exists()) {
          setFamilyData({ id: docSnap.id, ...docSnap.data() } as Family);
        }
      }, (error) => {
        console.error("Error fetching family real-time:", error);
      });
      return () => unsub();
    }
  }, [user?.familyId]);

  if (!user) return null;

  const compactNumber = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0';
    if (val >= 1000000) {
      const formatted = (val / 1000000).toFixed(2);
      return formatted.endsWith('.00') ? Math.floor(val / 1000000) + 'M' : formatted + 'M';
    }
    if (val >= 1000) {
      const formatted = (val / 1000).toFixed(2);
      return formatted.endsWith('.00') ? Math.floor(val / 1000) + 'K' : formatted + 'K';
    }
    return val.toString();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  const getPublicUrl = () => {
    return `${window.location.origin}/u/${user.uid}`;
  };

  const statusPosts = [
    { id: 1, type: 'video', views: '24.5k', likes: '1.2k', thumbnail: 'https://picsum.photos/seed/p1/600/800', date: '1 month ago' },
    { id: 2, type: 'photo', views: '18.2k', likes: '942', thumbnail: 'https://picsum.photos/seed/p2/600/800', date: '2 months ago' },
  ];

  const galleryThumbnails = [
    'https://picsum.photos/seed/g1/800/1200',
    'https://picsum.photos/seed/g2/800/1200',
    'https://picsum.photos/seed/g3/800/1200',
    'https://picsum.photos/seed/g4/800/1200',
  ];

  const DEFAULT_FAMILY: Family = {
    id: '2much-ic3',
    name: '2 MUCH IC3',
    badge: 'https://img.icons8.com/color/96/sword.png',
    ownerUid: 'system',
    description: '2 MUCH ICE IS BASED ON LOYALTY RESPECT AND DA BAG .WE ARGUE WE FUSS WE FIX WE...',
    memberCount: 28,
    memberLimit: 360,
    totalDiamondsSpent: 8500000,
    combatPoints: 3543887,
    monthlyPoints: 989048,
    monthlyTarget: 1000000,
    level: 13,
    tier: 'Gold',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Family Details Popup */}
        <AnimatePresence>
          {showFamilyDetails && (
            <FamilyDetailsPopup 
              family={familyData || DEFAULT_FAMILY} 
              onClose={() => setShowFamilyDetails(false)} 
            />
          )}
        </AnimatePresence>

        {/* Family Create Popup */}
        <AnimatePresence>
          {showCreateFamily && (
            <FamilyCreatePopup 
              onClose={() => setShowCreateFamily(false)} 
            />
          )}
        </AnimatePresence>

        {/* Gallery Lightbox Viewer */}
                <AnimatePresence>
                  {viewerIndex !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-130">
                <span className="text-white font-black text-sm">{viewerIndex + 1} / {galleryThumbnails.length}</span>
                <button 
                  onClick={() => setViewerIndex(null)}
                  className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <motion.img 
                  key={viewerIndex}
                  src={galleryThumbnails[viewerIndex]}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Navigation Controls */}
                <button 
                  onClick={() => setViewerIndex((prev) => (prev! > 0 ? prev! - 1 : galleryThumbnails.length - 1))}
                  className="absolute left-4 w-12 h-12 bg-black/20 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={() => setViewerIndex((prev) => (prev! < galleryThumbnails.length - 1 ? prev! + 1 : 0))}
                  className="absolute right-4 w-12 h-12 bg-black/20 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronRight size={32} />
                </button>
              </div>

              {/* Swipe/Thumbnail Hint */}
              <div className="p-6 flex justify-center gap-2">
                {galleryThumbnails.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      viewerIndex === i ? "w-8 bg-[#2af5ff]" : "w-2 bg-white/20"
                    )} 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          className="relative w-full h-full md:max-w-md bg-white overflow-hidden shadow-2xl flex flex-col font-roboto rounded-t-[40px] md:rounded-[40px]"
        >
          {/* Scrollable Content Container */}
          <div className="overflow-y-auto scrollbar-hide flex-1 bg-white pb-32">
            {/* Cover / Profile Photo Area */}
            <div className="relative aspect-square w-full overflow-hidden flex items-center justify-center bg-[#4d3a33]">
              {/* Dynamic Aura / Shimmer (from Video) */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 180, 270, 360],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent blur-3xl"
              />

              {/* Action Overlay */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
                <button onClick={onClose} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => copyToClipboard(getPublicUrl(), "Public Bio Link")}
                    className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
                  >
                    <Share2 size={20} strokeWidth={2.5} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => window.open(getPublicUrl(), '_blank')}
                      className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/10"
                    >
                      <ExternalLink size={18} strokeWidth={2.5} />
                    </button>
                    <div className="absolute -top-1.5 -right-2 bg-[#2af5ff] text-[7px] font-[900] px-1 py-0.5 rounded-[3px] text-black border border-white/30 shadow-sm leading-none">PV</div>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="w-full h-full relative group flex items-center justify-center">
                {user.photoURL ? (
                  <img 
                    src={generateEnhancedImageUrl({ url: user.photoURL, width: 600, quality: 95 })} 
                    className="w-full h-full object-cover transition-all duration-700" 
                    referrerPolicy="no-referrer" 
                    alt="Profile"
                  />
                ) : (
                  <div className="text-[12rem] font-medium text-white/90">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* SVIP Noble Aura Overlay (Cloned from Video) */}
                {user.svipStatus && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                    <motion.div 
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    >
                      <Sparkles size={40} className="text-amber-400 animate-pulse" />
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mt-2 italic">Elite SVIP</span>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Floating Gallery Reel (from Video) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1.5 z-10 overflow-x-auto scrollbar-hide">
                {galleryThumbnails.map((thumb, i) => (
                  <motion.div 
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewerIndex(i)}
                    className="w-12 h-12 rounded-lg border-2 border-white/40 shadow-xl overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <img src={thumb} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
                <div className="ml-auto flex flex-col items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 bg-[#2af5ff] rounded-sm flex items-center justify-center">
                      <Play size={10} className="fill-black text-black" />
                    </div>
                    <span className="text-[10px] font-black text-white">Room</span>
                  </div>
                  <span className="text-[8px] font-bold text-white/50 mt-0.5">Live now</span>
                </div>
              </div>
            </div>

            {/* Info Section - TIGHT CLONE */}
            <div className="bg-white px-5 pt-4 pb-2 space-y-3.5">
              {/* Identity Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-[20px] font-[900] tracking-tight text-black leading-tight flex items-center gap-1">
                      🦅 {user.displayName} 🦅
                    </h2>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-sm bg-[#2af5ff]/10 flex items-center justify-center border border-[#2af5ff]/20">
                        <ShieldCheck size={10} className="text-[#2af5ff]" fill="currentColor" />
                      </div>
                      <div className="h-4 px-1.5 rounded-full bg-[#5cc8ff] flex items-center gap-0.5 shadow-sm">
                        <span className="text-[10px] text-white font-black">♂</span>
                        <span className="text-[9px] text-white font-black">39</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[#999999] text-[11px] font-bold tracking-tight">
                    <span>ID: {user.uid.slice(0, 10)}</span>
                    <button onClick={() => copyToClipboard(user.uid, "User ID")} className="text-gray-300">
                      <Copy size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="w-14 h-14 -mt-1">
                  <img src="https://img.icons8.com/color/144/medal2.png" className="w-full h-full object-contain" alt="Accolade" />
                </div>
              </div>

              {/* Stats Row - SQUEEZED BY 30% */}
              <div className="flex items-center justify-between py-1 px-1 bg-slate-50/50 rounded-2xl">
                {[
                  { label: 'Fans', value: compactNumber(user.fans) },
                  { label: 'Following', value: compactNumber(user.following) },
                  { label: 'Beans', value: compactNumber(user.totalBeansEarned) },
                  { label: 'Diamonds', value: compactNumber(user.diamonds) },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <span className="text-[17px] font-condensed font-[900] text-black tracking-tighter leading-none scale-y-110 origin-bottom transform">
                      {stat.value}
                    </span>
                    <span className="text-[9px] font-bold text-[#bcbcbc] leading-none mt-1 uppercase tracking-tighter">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Accolade Row (Precision Placement) */}
              <div className="flex items-center gap-2">
                <LevelBadge level={user.level || 67} className="h-4" />
                {user.nobleTitle && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                    <NobleBadge tier={user.nobleTitle} size="xs" />
                    <span className="text-[9px] font-black text-yellow-600 uppercase italic leading-none">{user.nobleTitle}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 opacity-80">
                  <div className="w-4 h-4 bg-red-100 rounded-sm flex items-center justify-center">
                    <span className="text-[9px]">🎖️</span>
                  </div>
                  <div className="w-4 h-4 bg-pink-100 rounded-sm flex items-center justify-center">
                    <span className="text-[9px]">💖</span>
                  </div>
                  <div className="w-4 h-4 border border-gray-100 rounded-sm flex items-center justify-center">
                    <span className="text-[9px]">🇺🇸</span>
                  </div>
                </div>
              </div>

              {/* Interaction Cards - TIGHT FITTING */}
              <div className={cn(
                "grid gap-2 pt-1",
                (user.familyId || isOwner) ? "grid-cols-2" : "grid-cols-1"
              )}>
                {/* Family Card */}
                {user.familyId ? (
                  <button 
                    onClick={() => setShowFamilyDetails(true)}
                    className="bg-[#f8fafc] rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-white rounded-lg shadow-sm border border-slate-50 flex items-center justify-center">
                      <img src="https://img.icons8.com/color/96/sword.png" className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-[11px] font-black text-slate-800 leading-none truncate uppercase tracking-tighter">
                      {familyData?.name || user.familyName || 'Loading...'}
                    </h4>
                    <span className="text-[9px] font-black text-amber-500 uppercase italic leading-none mt-1.5 block">
                      {familyData ? `${getFamilyRankInfo(familyData.combatPoints || 0).tier} ${getFamilyRankInfo(familyData.combatPoints || 0).level}` : 'Rank ---'}
                    </span>
                    </div>
                  </button>
                ) : isOwner ? (
                  <button 
                    onClick={() => setShowCreateFamily(true)}
                    className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-2.5 border border-indigo-100 shadow-sm flex items-center gap-2.5 hover:from-indigo-100 transition-all group"
                  >
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={18} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-[10px] font-black text-indigo-900 leading-none uppercase tracking-tighter">Start Tribe</h4>
                      <span className="text-[8px] font-bold text-indigo-400 uppercase mt-1 block">Create Family</span>
                    </div>
                  </button>
                ) : null}

                {/* Contribution Card */}
                <div className="bg-[#f8fafc] rounded-xl p-2.5 border border-slate-100 shadow-sm flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-[1.5px] border-white bg-slate-100 overflow-hidden relative">
                        <img src={`https://i.pravatar.cc/100?u=fan${i}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <span className="text-[7px] font-black text-white">{i}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-black text-slate-400 italic tracking-tighter">Contribution</span>
                </div>
              </div>
            </div>

            {/* Existing Promotional Banner (Preserved) - OWNER ONLY */}
            {isOwner && (
              <div className="px-5 py-2">
                <div className="bg-[#f0fdff] rounded-2xl px-4 py-3 flex items-center justify-between border border-cyan-100/50">
                  <div className="space-y-0.5">
                    <h4 className="text-[13px] font-black text-gray-800">Bind your Email</h4>
                    <p className="text-[10px] text-cyan-600 font-bold">Get personalized recommendations!</p>
                  </div>
                  <button className="bg-[#2af5ff] text-white px-4 py-1.5 rounded-full text-[11px] font-black shadow-lg">
                    Enter
                  </button>
                </div>
              </div>
            )}

            {/* Optimized Tabs Header */}
            <div className="bg-white border-b border-gray-50 sticky top-0 z-20 px-5">
              <div className="flex items-center gap-8">
                {['Profile', 'Talents', 'Dino'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                    className={cn(
                      "relative py-3 transition-all duration-200",
                      activeTab === tab.toLowerCase() ? "opacity-100" : "opacity-30"
                    )}
                  >
                    <span className="text-[15px] font-black text-black">{tab}</span>
                    {activeTab === tab.toLowerCase() && (
                      <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#2af5ff] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
              {activeTab === 'profile' && (
                <div className="p-5 space-y-6">
                  {/* Cloned Profile Pillars */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { icon: <Star size={16} className="text-amber-500" />, label: 'Taurus', sub: 'Zodiac' },
                      { icon: <Ruler size={16} className="text-blue-500" />, label: '185CM', sub: 'Height' },
                      { icon: <Scale size={16} className="text-purple-500" />, label: '78KG', sub: 'Weight' },
                      { icon: <Globe size={16} className="text-red-500" />, label: 'English', sub: 'Language' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                        {item.icon}
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-slate-800 leading-none">{item.label}</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Personal Label</h4>
                    <div className="bg-[#fdf2ff] px-4 py-2.5 rounded-xl border border-purple-100/50 w-fit">
                      <span className="text-sm font-bold text-purple-600">👋 Welcome new friends</span>
                    </div>
                  </div>

                  {/* Scheduled Streams Card */}
                  <div className="bg-slate-900 rounded-3xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                      <Users size={100} />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-black text-lg">Weekly Schedule</h4>
                        <p className="text-white/40 text-[11px] font-bold mt-1">8 streams in last 7 days</p>
                      </div>
                      <button className="bg-[#2af5ff] text-black px-6 py-2.5 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">
                        BOOK
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'talents' && (
                <div className="p-5 space-y-8 pb-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Recent Status</h3>
                    <button className="text-[#2af5ff] text-[11px] font-black uppercase">View Grid ›</button>
                  </div>
                  
                  {statusPosts.map((post) => (
                    <div key={post.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
                        <div>
                          <h4 className="text-[14px] font-black text-slate-800">{user.displayName}</h4>
                          <p className="text-[10px] font-bold text-slate-400">{post.date}</p>
                        </div>
                      </div>
                      <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-slate-100 shadow-2xl group">
                        <img src={post.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
                          <div className="flex items-center gap-5">
                            <button className="text-white flex items-center gap-1.5"><Heart size={28} strokeWidth={2.5} /><span className="text-sm font-black">1.2K</span></button>
                            <button className="text-white"><MessageCircle size={26} strokeWidth={2.5} /></button>
                            <button className="text-white ml-auto"><Share2 size={24} strokeWidth={2.5} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isOwner && (
                    <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                      <Plus size={20} />
                      UPLOAD NEW TALENT
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Persistent Visitor Action Bar */}
          {!isOwner && (
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-50 flex items-center gap-3">
              <button className="flex-1 bg-[#2af5ff] text-white py-4 rounded-[20px] font-black shadow-[0_10px_30px_rgba(42,245,255,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Gift size={20} />
                SEND GIFT
              </button>
              <button className="w-14 h-14 bg-white border border-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-all">
                <MessageSquare size={24} />
              </button>
              <button className="w-14 h-14 bg-purple-500 text-white rounded-[20px] flex items-center justify-center shadow-[0_10px_20px_rgba(168,85,247,0.3)] active:scale-95 transition-all">
                <UserPlus size={24} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
