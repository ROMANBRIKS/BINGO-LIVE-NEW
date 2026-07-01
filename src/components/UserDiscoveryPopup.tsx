import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Gift, MessageSquare, Shield, ShieldCheck, X, UserPlus, Ban, MicOff, UserMinus,
  Share2, MapPin, Eye, Copy, Diamond, Sparkles, Plus, ChevronRight, ChevronLeft, Settings, 
  ExternalLink, LogOut, LayoutGrid, Trophy, Mail, Users, TrendingUp, AlertTriangle, Check,
  Briefcase
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { LevelBadge } from './LevelBadge';
import { NobleBadge } from './NobleBadge';
import { SVIPBadge } from './SVIPBadge';
import { generateEnhancedImageUrl } from '../lib/imageProcessor';
import { auth, db } from '../firebase';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { FamilyDetailsPopup } from './FamilyDetailsPopup';
import { FamilyCreatePopup } from './FamilyCreatePopup';
import { Family } from '../types';
import { getFamilyRankInfo } from '../lib/familyLogic';
import { useToast } from '../context/ToastContext';
import { CategoryTagsModal } from './CategoryTagsModal';
import { ContractedStreamerModal } from './ContractedStreamerModal';
import { FanGroupFAQModal } from './FanGroupFAQModal';

interface UserDiscoveryPopupProps {
  user: UserProfile | null;
  onClose: () => void;
  isHost?: boolean;
  onOpenGifts?: () => void;
  onOpenChat?: (displayName?: string) => void;
  onFollowToggle?: () => void;
  isCurrentlyFollowing?: boolean;
  liveRoomIdToJoin?: string;
  onJoinRoom?: (roomId: string) => void;
}

export const UserDiscoveryPopup: React.FC<UserDiscoveryPopupProps> = ({ 
  user, 
  onClose, 
  isHost,
  onOpenGifts,
  onOpenChat,
  onFollowToggle,
  isCurrentlyFollowing,
  liveRoomIdToJoin,
  onJoinRoom
}) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showFamilyDetails, setShowFamilyDetails] = React.useState(false);
  const [showCreateFamily, setShowCreateFamily] = React.useState(false);
  const [showCategoryTagsModal, setShowCategoryTagsModal] = React.useState(false);
  const [showContractedModal, setShowContractedModal] = React.useState(false);
  const [showFaqModal, setShowFaqModal] = React.useState(false);
  const [familyData, setFamilyData] = React.useState<Family | null>(null);
  const [agencyData, setAgencyData] = React.useState<any>(null);
  const [localFollowState, setLocalFollowState] = React.useState<boolean | null>(null);
  const [liveUserDoc, setLiveUserDoc] = React.useState<UserProfile | null>(null);
  const [userLiveRoomId, setUserLiveRoomId] = React.useState<string | null>(null);

  const isOwner = auth.currentUser?.uid === user?.uid;

  React.useEffect(() => {
    if (liveUserDoc?.agencyId || user?.agencyId) {
      const targetAgencyId = liveUserDoc?.agencyId || user?.agencyId;
      if (!targetAgencyId) return;
      const unsub = onSnapshot(doc(db, 'agencies', targetAgencyId), (docSnap) => {
        if (docSnap.exists()) {
          setAgencyData({ id: docSnap.id, ...docSnap.data() });
        }
      }, (error) => {
        console.error("Error fetching agency details:", error);
      });
      return () => unsub();
    } else {
      setAgencyData(null);
    }
  }, [liveUserDoc?.agencyId, user?.agencyId]);

  React.useEffect(() => {
    if (user?.uid) {
      setUserLiveRoomId(null);
      // Let's check if the user is hosting an active live stream
      const q = query(
        collection(db, 'rooms'),
        where('hostUid', '==', user.uid),
        where('status', '==', 'live'),
        limit(1)
      );
      getDocs(q).then(snap => {
        if (!snap.empty) {
          setUserLiveRoomId(snap.docs[0].id);
        }
      }).catch(err => {
        console.error("Error searching active streams for user:", err);
      });
    }
  }, [user?.uid]);

  React.useEffect(() => {
    if (user?.uid) {
      setLiveUserDoc(null);
      const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setLiveUserDoc({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
        }
      }, (error) => {
        console.error("Error fetching live user wallet data:", error);
      });
      return () => unsub();
    }
  }, [user?.uid]);

  const finalUser = liveUserDoc || user;

  React.useEffect(() => {
    if (finalUser?.familyId) {
      const unsub = onSnapshot(doc(db, 'families', finalUser.familyId), (docSnap) => {
        if (docSnap.exists()) {
          setFamilyData({ id: docSnap.id, ...docSnap.data() } as Family);
        }
      }, (error) => {
        console.error("Error fetching family real-time:", error);
      });
      return () => unsub();
    }
  }, [finalUser?.familyId]);

  // Handle follow state sync with props and cache
  React.useEffect(() => {
    if (finalUser) {
      if (isCurrentlyFollowing !== undefined) {
        setLocalFollowState(isCurrentlyFollowing);
      } else {
        // Fallback for non-host users: fetch from localStorage or mock
        const isFollowed = localStorage.getItem(`follow_${finalUser.uid}`) === 'true';
        setLocalFollowState(isFollowed);
      }
    }
  }, [finalUser, isCurrentlyFollowing]);

  if (!finalUser) return null;

  const compactNumber = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0';
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(1) + 'k';
    }
    return val.toString();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard! 📋`, 'success');
  };

  const handleFollowClick = () => {
    if (onFollowToggle) {
      onFollowToggle();
    } else {
      // Offline mock tracking for other commenters
      const nextState = !localFollowState;
      setLocalFollowState(nextState);
      localStorage.setItem(`follow_${finalUser.uid}`, String(nextState));
      if (nextState) {
        showToast(`Following ${finalUser.displayName}! 💖`, 'success');
      } else {
        showToast(`Unfollowed ${finalUser.displayName}! 😔`, 'info');
      }
    }
  };

  // Convert UID string into a highly realistic 9-digit numeric ID string
  const getNumericID = (uidString: string) => {
    // If user has a real numeric ID or has the custom room numeric pattern
    if (!isNaN(Number(uidString)) && uidString.length >= 6) return uidString;
    // Map string hash into a clean 9-digit Bingo ID
    let hash = 0;
    for (let i = 0; i < uidString.length; i++) {
      hash = uidString.charCodeAt(i) + ((hash << 5) - hash);
    }
    return String(Math.abs((hash % 900000000) + 100000000));
  };

  const formattedId = getNumericID(finalUser.uid);

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
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
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

        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchStart={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-[1px] cursor-pointer pointer-events-auto"
        />
        
        {/* High Fidelity Bingo Bottom Drawer Component (CLONE TO THE LAST DETAIL) */}
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col font-sans pb-5 overflow-visible z-10"
        >
          {/* Explicit Mobile-friendly Close / Minimize Button in Top Right */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-4 z-20 text-slate-400 hover:text-slate-600 active:scale-95 transition-all p-1.5 hover:bg-slate-100 rounded-full cursor-pointer flex items-center justify-center border border-slate-100/50 bg-slate-50/50 select-none"
            aria-label="Close"
          >
            <X size={16} strokeWidth={3} />
          </button>

          {/* Header Controls (Report & Challenge box) */}
          <div className="flex items-center justify-between px-6 pt-3.5 pb-0.5">
            <button 
              onClick={() => showToast("User reported. Under review 🚨", 'info')}
              className="flex items-center gap-1 text-[#666] font-extrabold text-[12px] uppercase select-none active:opacity-60 transition-opacity"
            >
              <AlertTriangle size={13} className="text-[#888]" />
              <span>REPORT</span>
            </button>

            {/* View Full Profile / Portfolio link */}
            <button
              onClick={() => {
                onClose();
                navigate(`/u/${finalUser.uid}`);
              }}
              className="flex items-center gap-1.5 text-cyan-500 font-extrabold text-[11.5px] uppercase tracking-normal select-none active:opacity-60 transition-opacity"
            >
              <ExternalLink size={13} strokeWidth={2.5} />
              <span>FULL VIEW</span>
            </button>
            
            {/* Challenge Progress */}
            <div className="flex items-center gap-1 border border-purple-200 bg-purple-50/60 text-purple-600 rounded-full px-2.5 py-0.5 text-[10px] font-black select-none shadow-sm cursor-pointer hover:bg-purple-100/50 transition-colors">
              <span className="text-purple-500 text-[10px]">🎁</span>
              <span>0/22</span>
              <span className="text-purple-400 text-[8px] ml-0.5">&gt;</span>
            </div>
          </div>

          {/* Majestic Overlap Cosmic Avatar Frame */}
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-24 h-24 select-none flex items-center justify-center">
            {/* Concentric ambient glow */}
            <div className="absolute inset-2 bg-yellow-400/20 rounded-full blur animate-pulse" />
            
            {/* Gorgeous SVG Cosmic Level Ribbon Ring Frame */}
            <div className="absolute inset-[-14px] pointer-events-none z-10 flex items-center justify-center">
              <svg className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]" viewBox="0 0 120 120" fill="none">
                {/* Thick Gold Frame Ring */}
                <circle cx="60" cy="62" r="41" stroke="#fbbf24" strokeWidth="4.5" fill="none" />
                <circle cx="60" cy="62" r="38" stroke="#ffffff" strokeWidth="1" fill="none" />
                
                {/* Blue Ribbon Bow underneath */}
                <path d="M14 85 C28 106, 52 114, 60 114 C68 114, 92 106, 106 85" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" />
                <path d="M14 85 C28 106, 52 114, 60 114 C68 114, 92 106, 106 85" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Left Ribbon Tail drape */}
                <path d="M21 72 C11 82, 6 96, 9 108 C13 113, 20 108, 22 101 C24 93, 23 81, 21 72" fill="#1e40af" />
                <path d="M21 72 C16 80, 11 92, 13 103" stroke="#eab308" strokeWidth="2" />
                
                {/* Right Ribbon Tail drape */}
                <path d="M99 72 C109 82, 114 96, 111 108 C107 113, 100 108, 98 101 C96 93, 97 81, 99 72" fill="#1e40af" />
                <path d="M99 72 C104 80, 109 92, 107 103" stroke="#eab308" strokeWidth="2" />

                {/* Sparkling gold 5-point crown star */}
                <polygon points="60,8 63,18 73,18 65,24 68,34 60,28 52,34 55,24 47,18 57,18" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="60" cy="23" r="3" fill="#1d4ed8" />

                {/* Bottom Gold Treasure Coin Bean */}
                <rect x="49" y="103" width="22" height="13" rx="6.5" fill="#f59e0b" stroke="#1e3a8a" strokeWidth="2" />
                <ellipse cx="60" cy="110" rx="6" ry="3.5" fill="#fef08a" />
              </svg>
            </div>
            
            {/* The actual avatar image circular mask */}
            <div className="w-[74px] h-[74px] rounded-full overflow-hidden border-[3px] border-yellow-200 shadow-inner bg-slate-100 z-0">
              <img 
                src={finalUser.photoURL || `https://i.pravatar.cc/150?u=${finalUser.displayName}`} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                alt="Profile"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col items-center pt-10 px-6 text-center">
            {/* Display Name with gender badge & talent badge */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
              <h2 className="text-[#222] font-[900] text-[18px] tracking-tight leading-6 flex items-center gap-1 select-none">
                {finalUser.displayName}
              </h2>
              
              {/* Teal/Turquoise Broadcaster talent badge */}
              <div className="w-3.5 h-3.5 rounded-sm bg-[#5af1f2]/20 flex items-center justify-center border border-[#14b8a6]/20">
                <span className="text-[#14b8a6] text-[8.5px] font-black">✔</span>
              </div>
              
              {/* Pink Gender & Age Pill */}
              <div className="h-4 px-2 rounded-full bg-pink-500 text-white flex items-center gap-0.5 text-[9.5px] font-black shadow-sm shrink-0">
                <span className="leading-none text-[8.5px]">♀</span>
                <span className="leading-none text-[8.5px]">22</span>
              </div>
            </div>

            {/* ID string with copies */}
            <button 
              onClick={() => copyToClipboard(formattedId, "User ID")}
              className="text-[#999] text-[11.5px] font-bold tracking-tight mt-0.5 mb-1.5 hover:text-cyan-500 transition-colors flex items-center gap-1 active:scale-95 duration-200"
            >
              <span>ID:{formattedId}</span>
              <Copy size={10} className="text-[#bbb]" />
            </button>

            {/* Sub Labels Badges Row 1 */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[95%] mt-1">
              {agencyData && (
                <div className="flex items-center gap-1 bg-cyan-50 border border-cyan-100 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-600 shadow-sm animate-pulse">
                  <Briefcase size={10} className="stroke-[2.5]" />
                  <span>{agencyData.name} Partner</span>
                </div>
              )}

              {/* Pink Challenger pill */}
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white font-extrabold text-[10px] uppercase tracking-normal shadow-sm">
                👾 Challenger
              </span>

              {(finalUser.agencyId || finalUser.role === 'host' || finalUser.uid?.startsWith('host_')) && (
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-[10px] uppercase tracking-normal shadow-sm flex items-center gap-1">
                  👑 Bigo IDOL
                </span>
              )}
              
              {/* Silver ring LevelBadge */}
              <div className="relative inline-flex items-center gap-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                <span>Lv.{finalUser.level || 13}</span>
              </div>

              {/* Blue Dancing tag */}
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-extrabold text-[10px] uppercase tracking-normal shadow-sm">
                💃 Dancing
              </span>

              {/* Blue Singing category tag with Mic - Tappable trigger */}
              <button
                type="button"
                onClick={() => setShowCategoryTagsModal(true)}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-normal shadow-sm flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              >
                🎤 Singing
              </button>

              {/* Lips emoji */}
              <span className="text-[14px]">💋</span>
            </div>

            {/* Sub Labels Badges Row 2 (Signed Host & Larger Wings Heart Badge) */}
            <div className="flex items-center gap-3.5 justify-center mt-2.5">
              {/* Gold Signed Host badge - trigger for Platform Contracted Streamer popup */}
              <button
                type="button"
                onClick={() => setShowContractedModal(true)}
                className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-black text-[11px] uppercase tracking-normal shadow-md flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              >
                📝 Signed Host
              </button>

              {/* Pink Heart with Golden Wings badge - trigger for Fan Group FAQ (Text deleted, heart double size) */}
              <button
                type="button"
                onClick={() => setShowFaqModal(true)}
                className="px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white font-black shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-amber-300/30 relative overflow-hidden shrink-0"
                title="Fan Group FAQ"
              >
                <span className="text-[11px] text-yellow-300 font-extrabold -scale-x-100 transform inline-block pb-0.5 select-none">🪶</span>
                <span className="text-[20px] leading-none animate-pulse filter drop-shadow-[0_1px_3px_rgba(244,63,94,0.4)]">💝</span>
                <span className="text-[11px] text-yellow-300 font-extrabold pb-0.5 select-none">🪶</span>
              </button>
            </div>

            {/* Statistics Row (compact formatted metrics) */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2 mt-3.5 flex items-center justify-around shadow-inner">
              <div className="flex flex-col items-center flex-1 border-r border-slate-100">
                <span className="text-[16px] font-[900] text-black tracking-tight leading-none">
                  {compactNumber(finalUser.fans || 316)}
                </span>
                <span className="text-[9.5px] font-[700] text-slate-400 leading-none mt-1 capitalize tracking-normal">Fans</span>
              </div>
              
              <div className="flex flex-col items-center flex-1 border-r border-[#f1f5f9]">
                <span className="text-[16px] font-[900] text-black tracking-tight leading-none">
                  {compactNumber(finalUser.following || 122)}
                </span>
                <span className="text-[9.5px] font-[700] text-slate-400 leading-none mt-1 capitalize tracking-normal">Following</span>
              </div>

              <div className="flex flex-col items-center flex-1 border-r border-[#f1f5f9]">
                <span className="text-[16px] font-[900] text-black tracking-tight leading-none">
                  {compactNumber(finalUser.totalBeansEarned || 2410)}
                </span>
                <span className="text-[9.5px] font-[700] text-slate-400 leading-none mt-1 capitalize tracking-normal">Beans</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                <span className="text-[16px] font-[900] text-black tracking-tight leading-none">
                  {compactNumber(finalUser.diamonds || 0)}
                </span>
                <span className="text-[9.5px] font-[700] text-slate-400 leading-none mt-1 capitalize tracking-normal">Diamonds</span>
              </div>
            </div>

            {/* Double Silver/Teal Cards Row */}
            <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
              {/* Silver gray level card */}
              <button className="flex items-center justify-center gap-1.5 rounded-xl py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 border border-white/80 shadow-md text-slate-600 font-[900] text-[11px] tracking-tight active:scale-95 transition-transform">
                <span className="text-[11px]">💎</span>
                <span>Lv. 1</span>
              </button>
              
              {/* Medallion blue-teal Honor card */}
              <button 
                onClick={() => showToast("Opening Honor Hall... 🏅", 'info')}
                className="flex items-center justify-center gap-1.5 rounded-xl py-1.5 bg-gradient-to-r from-[#1b3d42] to-[#254f55] border border-white/10 shadow-md text-teal-100 font-[900] text-[11px] tracking-tight active:scale-95 transition-transform"
              >
                <span className="text-[11px]">🏅</span>
                <span>Honor Hall</span>
              </button>
            </div>
            
            {/* Live stream stream-hop Option */}
            {(liveRoomIdToJoin || userLiveRoomId || finalUser.uid === 'opponent_live' || finalUser.uid === '1089138321' || finalUser.uid?.startsWith('seat_') || finalUser.uid?.startsWith('opponent_')) && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 p-3 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-rose-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-[950] uppercase text-rose-500 tracking-wider">Broadcasting Live!</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold leading-tight">Hop into their live room stream now</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const id = liveRoomIdToJoin || userLiveRoomId || 'room_molly_fallback';
                    showToast(`Transitioning to ${finalUser.displayName || 'their'}'s stream! 🚀`, 'success');
                    onClose();
                    if (onJoinRoom) {
                      onJoinRoom(id);
                    }
                  }}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-indigo-500 hover:opacity-90 font-extrabold text-[11px] text-white tracking-wide shadow-md active:scale-95 transition-all shrink-0"
                >
                  Join Stream
                </button>
              </motion.div>
            )}
            
            {/* Action Bar controls */}
            <div className="w-full flex items-center justify-between gap-2.5 mt-4">
              {/* Follow Button */}
              <button 
                onClick={handleFollowClick}
                className={cn(
                  "flex-1 h-10 rounded-full font-[900] text-[13px] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95",
                  localFollowState 
                    ? "bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 shadow-none" 
                    : "bg-[#06b6d4] hover:bg-cyan-500 text-white"
                )}
              >
                {localFollowState ? (
                  <>
                    <Check size={14} strokeWidth={3} className="text-slate-400" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} strokeWidth={3} className="text-white" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              {/* Round Gradient Gifting Button */}
              <button 
                onClick={() => {
                  onClose();
                  if (onOpenGifts) onOpenGifts();
                }}
                className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(236,72,153,0.35)] active:scale-90 transition-all shrink-0"
                title="Send Gift"
              >
                <span className="text-[17px] filter drop-shadow">🎁</span>
              </button>

              {/* Chat Button */}
              <button 
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat(finalUser.displayName);
                }}
                className="h-10 px-4 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-[900] text-[12px] tracking-tight flex items-center gap-1.5 active:scale-95 transition-all shadow-md shrink-0"
              >
                <MessageSquare size={14} className="text-slate-400" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Certified Category Tags Pop-up Dialog */}
        <CategoryTagsModal 
          isOpen={showCategoryTagsModal} 
          onClose={() => setShowCategoryTagsModal(false)} 
        />

        {/* Platform Contracted Streamer Badge Dialog */}
        <ContractedStreamerModal 
          isOpen={showContractedModal} 
          onClose={() => setShowContractedModal(false)} 
        />

        {/* Fan Group FAQ Rules and Battle Modal */}
        <FanGroupFAQModal 
          isOpen={showFaqModal} 
          onClose={() => setShowFaqModal(false)} 
        />
      </div>
    </AnimatePresence>
  );
};
