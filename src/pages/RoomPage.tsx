import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  doc, onSnapshot, collection, query, orderBy, limit, addDoc, 
  serverTimestamp, updateDoc, increment, deleteField, setDoc, deleteDoc,
  getDoc, where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useToast } from '../context/ToastContext';
import { Room, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { createThankYouMessage, createInitialFollowPrompt } from '../followLogic';
import { generateSimulatedMessage } from '../simulationLogic';
import { PRIVATE_CALL_FEE_AUDIO, PRIVATE_CALL_FEE_VIDEO } from '../privateCallLogic';
import { cn } from '../lib/utils';
import { getDeviceType } from '../lib/device';
import { AILiveAssistant, StreamStats } from '../components/AILiveAssistant';
import { MiniGameCenter, MiniGame } from '../components/MiniGameCenter';
import { bigoSimulatedFeeds } from './HomePage';
import { INITIAL_SIMULATED_SPACES } from '../components/SpacesTabContent';
import { SpacesAudioRoom } from '../components/SpacesAudioRoom';
import { 
  X, Plus, Coins, Users, Star, MessageSquare, List, Users2, Gift as GiftIcon, ShoppingBag, Settings,
  Smile, Menu, Maximize2, Ban, Bell, Heart, BarChart3, Sparkles, Type, Mail, SendHorizontal,
  Phone, PhoneCall, Check, Video, Mic, MicOff, VideoOff, Share2, MoreHorizontal, ChevronDown, Gamepad2,
  Lock, Globe
} from 'lucide-react';
import { WingedHeart } from '../components/WingedHeart';
import { GiftCombo } from '../components/GiftCombo';
import { motion, AnimatePresence } from 'motion/react';
import { PrivateCallManager } from '../components/PrivateCallManager';
import { PredictionSystem } from '../components/PredictionSystem';
import { PKBattle } from '../components/PKBattle';
import { YoutubePlayer } from '../components/YoutubePlayer';
import { MusicPlayer } from '../components/MusicPlayer';
import { GiftAnimation } from '../components/GiftAnimation';
import { NobleEntrance } from '../components/NobleEntrance';
import { MicQueue } from '../components/MicQueue';
import { initializeSeats, handleMicRequest, assignSeat, removeGuest, toggleMute } from '../micQueueLogic';
import { getSnipeMultiplier, calculateFinalPKResult } from '../pkEnhancedLogic';
import { GuestSeat, MicRequest } from '../types';
import { LikeParticles, LikeParticlesRef } from '../components/LikeParticles';
import { HostProfileBadge, HostProfileBadgeRef } from '../components/HostProfileBadge';
// @ts-ignore
import followedHeartWingsImg from '../assets/images/followed_heart_wings_1781210010399.jpg';
import { ChatMessage } from '../components/ChatMessage';
import { LevelBadge } from '../components/LevelBadge';
import { VideoStream } from '../components/VideoStream';
import { GiftingModal } from '../components/GiftingModal';
import { RoomToolsModal } from '../components/RoomToolsModal';
import { PKShieldOverlay } from '../components/PKShieldOverlay';
import { FanClubWelcome } from '../components/FanClubWelcome';
import { RoomFanClubDrawer } from '../components/RoomFanClubDrawer';
import { RegionListModal } from '../components/RegionListModal';
import { StarGoalModal } from '../components/StarGoalModal';
import { NobleFrame } from '../components/NobleFrame';
import { NobleBadge } from '../components/NobleBadge';
import { FamilyBadge } from '../components/FamilyBadge';
import { TreasureChestDisplay } from '../components/TreasureChestDisplay';
import { EnhancedGuestSeat } from '../components/EnhancedGuestSeat';
import { SeatRequestManager } from '../components/SeatRequestManager';
import { PollSystem } from '../components/PollSystem';
import { ChaosEvents } from '../components/ChaosEvents';
import { EasterEggDrops } from '../components/EasterEggDrops';
import { FeatureAutoManager } from '../components/FeatureAutoManager';
import { initializeTreasureChest } from '../treasureChestLogic';
import { initializeEnhancedSeats } from '../seatManagementLogic';
import { processGiftTransaction } from '../services/giftingService';
import { SVIPManager } from '../lib/svipLogic';
import { MiniGameOverlay, MiniGame as ActiveGame } from '../components/MiniGameOverlay';
import { PK_SHIELDS } from '../pkShieldLogic';
import { SEOHeaders } from '../components/SEOHeaders';
import { UserDiscoveryPopup } from '../components/UserDiscoveryPopup';
import { LiveAdPlayer } from '../components/LiveAdPlayer';
import { CoStreamManager } from '../components/CoStreamManager';
import { GiftExplosionFX } from '../components/GiftExplosionFX';

// --- Custom 3D High-Fidelity Flipping Header Widgets ---
export const RegionListWidget: React.FC<{ onClick: () => void; rank?: number }> = ({ onClick, rank }) => {
  const [activeWidget, setActiveWidget] = useState<'region' | 'beans'>('region');
  const [passCount, setPassCount] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (activeWidget === 'beans') {
      const timer = setTimeout(() => {
        setActiveWidget('region');
        setPassCount(0);
        setKey(prev => prev + 1);
      }, 4500); // stay on beans for 4.5 seconds
      return () => clearTimeout(timer);
    }
  }, [activeWidget]);

  const handleAnimationComplete = () => {
    if (activeWidget === 'region') {
      const nextPass = passCount + 1;
      if (nextPass >= 3) {
        // Transition to beans
        setActiveWidget('beans');
      } else {
        setPassCount(nextPass);
        setKey(prev => prev + 1);
      }
    }
  };

  return (
    <button
      onClick={onClick}
      className="bg-[#241529]/30 backdrop-blur-sm rounded-full h-[28px] px-2 flex items-center gap-1.5 border border-white/10 cursor-pointer text-left transition-all leading-none w-[108px] overflow-hidden"
      title="Daily Region List"
    >
      {/* 3D Gold Bars / Frequency waves on the left */}
      <div className="flex items-end gap-[1.5px] h-3.5 w-3 select-none flex-shrink-0 mb-[0.5px]">
        <motion.div 
          className="w-[1.8px] bg-gradient-to-t from-orange-500 to-amber-300 rounded-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" 
          animate={{ height: ["20%", "100%", "20%"] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
        />
        <motion.div 
          className="w-[1.8px] bg-gradient-to-t from-orange-500 to-amber-300 rounded-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" 
          animate={{ height: ["40%", "100%", "40%"] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
        />
        <motion.div 
          className="w-[1.8px] bg-gradient-to-t from-orange-500 to-amber-300 rounded-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]" 
          animate={{ height: ["10%", "100%", "10%"] }}
          transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut", delay: 0.3 }}
        />
      </div>

      {/* Marquee Text area */}
      <div className="w-[75px] h-[20px] overflow-hidden relative flex items-center select-none">
        <AnimatePresence mode="wait">
          {activeWidget === 'region' ? (
            <motion.div
              key={`region-${key}`}
              initial={{ x: 80, y: 0, opacity: 1 }}
              animate={{ x: -150 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ x: { ease: "linear", duration: 14.5 }, y: { duration: 0.3 } }}
              onAnimationComplete={handleAnimationComplete}
              style={{ willChange: "transform" }}
              className="absolute whitespace-nowrap text-white text-[11px] sm:text-[11.5px] font-bold leading-none select-none tracking-tight mb-[0.5px]"
            >
              Daily region list TOP {rank || 64}
            </motion.div>
          ) : (
            <motion.div
              key="beans-surpass"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute whitespace-nowrap text-[11px] sm:text-[11.5px] font-medium leading-none select-none tracking-tight mb-[0.5px] flex items-center"
            >
              <span className="text-amber-300 mr-1 text-[11.5px] sm:text-[12px] font-extrabold">3</span> 
              <span className="text-white/95">beans to surpass previous</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export const StarGoalWidget: React.FC<{ 
  popularity: number; 
  onStarClick: () => void; 
}> = ({ popularity, onStarClick }) => {
  const [phase, setPhase] = useState<'star' | 'heat'>('star');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase(prev => (prev === 'star' ? 'heat' : 'star'));
    }, 30000); // Changed from 4.5 seconds to 30 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <button
      onClick={phase === 'star' ? onStarClick : undefined}
      className={cn(
        "bg-[#241529]/30 backdrop-blur-sm rounded-full h-[28px] px-2 flex items-center justify-center border border-white/10 text-left leading-none w-[62px] overflow-hidden focus:outline-none transition-all relative",
        phase === 'star' ? "cursor-pointer" : "cursor-default"
      )}
    >
      {/* Faint gold progress bar loaded underneath indicating 3 out of 4 (75% completed) */}
      {phase === 'star' && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600/30 to-amber-500/20 z-0 pointer-events-none"
        />
      )}

      <div className="relative z-10 w-full h-[20px] overflow-hidden flex items-center justify-center select-none">
        <AnimatePresence mode="wait">
          {phase === 'star' ? (
            <motion.div
              key="star-phase"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-[5px] justify-center"
            >
              {/* Gold 3D Star Frame with 1 inside */}
              <div className="relative w-[14px] h-[14px] flex items-center justify-center filter drop-shadow-[0_1.2px_1.5px_rgba(0,0,0,0.5)] flex-shrink-0 mb-[0.5px]">
                <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]">
                  <defs>
                    <linearGradient id="gold3d-widget" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fff176" />
                      <stop offset="40%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                  <polygon 
                    points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" 
                    fill="url(#gold3d-widget)" 
                    stroke="#78350f"
                    strokeWidth="1.2"
                  />
                  <polygon 
                    points="12,5 14,10 19,10 15,13 16,18 12,15 8,18 9,13 5,10 10,10" 
                    fill="#fff" 
                    opacity="0.35"
                  />
                </svg>
                <span className="absolute text-[7px] font-black text-amber-955 top-[3.2px] left-[5px] scale-90 leading-none select-none">1</span>
              </div>

              {/* Person Icon Outline taken out as requested to maximize text space! */}

              {/* Figure progress text e.g. 3/4 */}
              <span className="text-white text-[11px] sm:text-[11.5px] font-black tracking-normal leading-none select-none mb-[0.5px]">
                3/4
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="heat-phase"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="flex items-center gap-[3px] justify-center"
            >
              {/* Flame Icon with subtle 3D glowing */}
              <span className="text-[#ff4747] text-[11px] filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] select-none leading-none mr-[1px]">🔥</span>
              
              {/* Popularity Count figures */}
              <span className="text-white text-[11px] sm:text-[11.5px] font-black tracking-normal leading-none select-none mb-[0.5px]">
                {popularity.toLocaleString()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

interface ImmersionGuestSeatCardProps {
  seat: GuestSeat;
  seatNum: number;
  roomId: string;
  isHost: boolean;
  onShowProfile: (uid: string) => void;
  onJoin: (type: 'audio' | 'video', seatId: number) => void;
  totalSeatsCount: number;
}

const ImmersionGuestSeatCard: React.FC<ImmersionGuestSeatCardProps> = ({
  seat,
  seatNum,
  roomId,
  isHost,
  onShowProfile,
  onJoin,
  totalSeatsCount
}) => {
  const [profile, setProfile] = useState<{ displayName: string; photoURL?: string; level?: number } | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (seat.status === 'occupied' && seat.uid) {
      const userRef = doc(db, 'users', seat.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            displayName: d.displayName || 'Guest',
            photoURL: d.photoURL || '',
            level: d.level || 1
          });
        }
      }).catch(err => {
        console.error("Error loading seat profile", err);
      });
    } else {
      setProfile(null);
    }
  }, [seat.status, seat.uid]);

  // Simulate active equalizers dynamically
  useEffect(() => {
    if (seat.status === 'occupied' && !seat.isMuted) {
      const timer = setInterval(() => {
        setSpeaking(Math.random() > 0.4);
      }, 1500 + (seatNum * 123) % 1000);
      return () => clearInterval(timer);
    } else {
      setSpeaking(false);
    }
  }, [seat.status, seat.isMuted, seatNum]);

  const pName = profile?.displayName || (seatNum === 1 ? 'Glock43' : seatNum === 2 ? 'romeo' : seatNum === 3 ? 'NARD BEATZ' : seatNum === 4 ? 'DAVE' : seatNum === 5 ? 'HOOCHIE_MAMA' : `Seat ${seatNum}`);
  const pPhoto = profile?.photoURL || (
    seatNum === 1 ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500' :
    seatNum === 2 ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500' :
    seatNum === 3 ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500' :
    seatNum === 4 ? 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500' :
    seatNum === 5 ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500' :
    `https://api.dicebear.com/7.x/avataaars/svg?seed=seat${seatNum}`
  );
  const pLevel = profile?.level || Math.floor((seatNum * 13) % 45 + 3);

  const hasCrownBadge = seatNum === 1 || seatNum === 2 || seatNum === 3;
  const crownLevel = seatNum === 1 ? 8 : seatNum === 2 ? 3 : 3;

  const hasMugsSticker = seatNum === 4;
  const hasLodeSticker = seatNum === 5;

  const isAudioSeat = seat.type === 'audio' || !seat.uid;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      onClick={() => {
        if (seat.status === 'occupied' && seat.uid) {
          onShowProfile(seat.uid);
        } else if (seat.status === 'empty') {
          onJoin(seat.type || 'audio', seatNum - 1);
        }
      }}
      className={cn(
        "relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer shadow-lg select-none",
        seat.status === 'occupied' 
          ? "border-white/10 bg-[#12121e]/85 backdrop-blur-md" 
          : "border-dashed border-white/15 bg-black/30 hover:bg-black/50 hover:border-white/25",
        "w-full h-full min-h-[96px] flex flex-col items-center justify-center p-2"
      )}
    >
      {seat.status === 'occupied' && !isAudioSeat && (
        <div className="absolute inset-0 z-0">
          <img src={pPhoto} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent w-full" />
        </div>
      )}

      {seat.status === 'occupied' && isAudioSeat && (
        <div className="relative flex flex-col items-center justify-center flex-1 py-1 z-10 w-full">
          {(speaking || seatNum === 3) && (
            <div className="absolute w-20 h-20 rounded-full bg-pink-500/10 border border-pink-500/30 animate-pulse z-0 pointer-events-none scale-90" />
          )}
          <div className={cn(
            "relative w-14 h-14 rounded-full border-2 overflow-hidden bg-zinc-800 shadow-[0_3px_10px_rgba(0,0,0,0.5)] z-10",
            (speaking || seatNum === 3) ? "border-pink-500 shadow-[0_0_12px_#ec4899]" : "border-white/20"
          )}>
            <img src={pPhoto} className="w-full h-full object-cover" />
          </div>

          {hasMugsSticker && (
            <div className="absolute top-0 right-1 transform translate-x-2 -translate-y-1 z-25 text-lg select-none">
              🍻
            </div>
          )}

          {hasLodeSticker && (
            <div className="absolute -bottom-1 bg-gradient-to-r from-pink-500 to-rose-600 px-1.5 py-0.5 rounded-md text-[7px] font-black text-white uppercase tracking-tight scale-90 shadow-md border border-white/15">
              lode ⚔️ 🪙
            </div>
          )}
        </div>
      )}

      {seat.status === 'occupied' && hasCrownBadge && (
        <div className="absolute top-1 left-1.5 z-25 flex items-center gap-0.5 select-none pointer-events-none bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-stone-950 font-black text-[7px] tracking-tighter px-1 py-0.5 rounded-md shadow-md transform scale-90 border border-amber-200">
          <span className="scale-75 origin-center">👑</span>
          <span>LV{crownLevel}</span>
        </div>
      )}

      {seat.status === 'occupied' && (
        <div className="absolute top-1.5 right-1.5 z-20">
          {seat.isMuted ? (
            <div className="bg-black/55 p-1 rounded-full border border-white/5 text-rose-500 flex items-center justify-center">
              <MicOff size={10} />
            </div>
          ) : (
            speaking ? (
              <div className="bg-black/40 px-1.5 py-0.5 rounded-full border border-white/10 flex items-end gap-[1.5px] h-[16px] animate-pulse">
                <span className="w-0.5 h-1 px-[0.25px] bg-[#00ff66]" />
                <span className="w-0.5 h-2 px-[0.25px] bg-[#00ff66]" />
                <span className="w-0.5 h-1.5 px-[0.25px] bg-[#00ff66]" />
              </div>
            ) : (
              <div className="bg-black/45 p-1 rounded-full border border-white/5 text-white/90">
                <Mic size={10} />
              </div>
            )
          )}
        </div>
      )}

      {seat.status === 'empty' && (
        <div className="flex flex-col items-center justify-center gap-1.5 py-2">
          <div className="w-9 h-9 rounded-full bg-white/5 border border-dashed border-white/15 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
            <Plus size={14} className="text-white/40" />
          </div>
          <span className="text-[9px] font-bold text-white/35 tracking-widest uppercase">
            Seat {seatNum}
          </span>
        </div>
      )}

      {seat.status === 'locked' && (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center border border-white/5">
            <Lock size={12} className="text-white/20" />
          </div>
          <span className="text-[8px] font-bold text-white/20 uppercase">Locked</span>
        </div>
      )}

      {seat.status === 'occupied' && (
        <div className="absolute bottom-1 left-1 right-1 bg-black/55 hover:bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-white/5 flex items-center justify-between z-10 w-[calc(100%-8px)]">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <span className="text-[7.5px] font-black bg-yellow-400 text-stone-950 px-0.5 rounded leading-none">
              {pLevel}
            </span>
            <span className="text-[9px] font-extrabold text-white/90 truncate">
              {seatNum} {pName}
            </span>
          </div>
          <span className="text-[7px] font-black text-rose-400 shrink-0 select-none scale-[0.8] origin-right">+</span>
        </div>
      )}
    </motion.div>
  );
};

interface MultiGuestGridProps {
  room: Room;
  seats: GuestSeat[];
  isHost: boolean;
  onShowProfile: (uid: string) => void;
  onJoinMicRequest: (type: 'audio' | 'video', index: number) => void;
  hostProfile: UserProfile | null;
}

const MultiGuestGrid: React.FC<MultiGuestGridProps> = ({
  room,
  seats,
  isHost,
  onShowProfile,
  onJoinMicRequest,
  hostProfile
}) => {
  const totalSeats = seats?.length || 6;

  if (totalSeats === 6) {
    return (
      <div className="flex flex-col gap-2 w-full mt-2 select-none h-[300px]">
        <div className="flex gap-2 h-[200px] w-full">
          <div 
            onClick={() => hostProfile && onShowProfile(hostProfile.uid)}
            className="w-[58%] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-xl relative cursor-pointer group flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0">
              <VideoStream 
                isHost={isHost} 
                roomId={room.id} 
                hostUid={room.hostUid}
                type="multi-guest-live"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center scale-90">
              <span className="absolute top-2 left-[20%] text-xl">🌸</span>
              <span className="absolute top-2 right-[20%] text-xl">🌸</span>
              <div className="w-[80px] h-[32px] relative border-[3.5px] border-zinc-800/80 rounded-full flex items-center justify-between px-1 bg-black/10">
                <div className="w-7 h-7 rounded-full border-2 border-black/80 flex items-center justify-center shadow-inner">
                  <span className="text-[6px]">⚫</span>
                </div>
                <div className="w-1 h-[2px] bg-black/80 rounded-full" />
                <div className="w-7 h-7 rounded-full border-2 border-black/80 flex items-center justify-center shadow-inner">
                  <span className="text-[6px]">⚫</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-1.5 left-1.5 right-1.5 z-20 flex flex-col gap-1.5">
              <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-yellow-200 px-2.5 py-0.5 rounded-full text-[8.5px] font-black text-[#121214] flex items-center gap-1 shadow-md w-max select-none">
                <span>✦ Savage Mode ⚔️ 🪙</span>
              </div>

              <div className="bg-black/55 backdrop-blur-sm p-1 rounded-xl border border-white/5 flex items-center justify-between gap-1 w-full">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/100?u=staxx'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-[9px] font-black truncate leading-tight uppercase">
                      {hostProfile?.displayName || 'Staxx 💋'}
                    </span>
                    <span className="text-amber-400 text-[8px] font-semibold flex items-center leading-none scale-90 origin-left">
                      5/6 👑
                    </span>
                  </div>
                </div>
                <span className="text-rose-400 font-extrabold text-[12px] shrink-0 leading-none select-none pr-1 cursor-pointer">+</span>
              </div>
            </div>

            <div className="absolute top-1.5 right-1.5 z-20 bg-cyan-400 border border-cyan-300/35 text-stone-950 font-black text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-md">
              Host
            </div>
          </div>

          <div className="w-[40%] flex flex-col gap-2 justify-between">
            <div className="h-[48.5%] w-full">
              {seats[0] ? (
                <ImmersionGuestSeatCard 
                  seat={seats[0]} 
                  seatNum={1} 
                  roomId={room.id}
                  isHost={isHost}
                  onShowProfile={onShowProfile}
                  onJoin={(type) => onJoinMicRequest(type, 0)}
                  totalSeatsCount={6}
                />
              ) : null}
            </div>
            <div className="h-[48.5%] w-full">
              {seats[1] ? (
                <ImmersionGuestSeatCard 
                  seat={seats[1]} 
                  seatNum={2} 
                  roomId={room.id}
                  isHost={isHost}
                  onShowProfile={onShowProfile}
                  onJoin={(type) => onJoinMicRequest(type, 1)}
                  totalSeatsCount={6}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 h-[92px] w-full mt-0.5">
          {[2, 3, 4].map((idx) => (
            <div key={`bottom_seat_${idx}`} className="w-full h-full">
              {seats[idx] ? (
                <ImmersionGuestSeatCard 
                  seat={seats[idx]} 
                  seatNum={idx + 1} 
                  roomId={room.id}
                  isHost={isHost}
                  onShowProfile={onShowProfile}
                  onJoin={(type) => onJoinMicRequest(type, idx)}
                  totalSeatsCount={6}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  } else if (totalSeats === 4) {
    return (
      <div className="flex flex-col gap-2 w-full mt-2 select-none h-[280px]">
        <div className="flex gap-2 h-[180px] w-full">
          <div 
            onClick={() => hostProfile && onShowProfile(hostProfile.uid)}
            className="w-[58%] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 relative cursor-pointer flex flex-col justify-end"
          >
            <div className="absolute inset-0 z-0">
              <VideoStream isHost={isHost} roomId={room.id} hostUid={room.hostUid} type="multi-guest-live" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>
            <div className="absolute bottom-1.5 left-1.5 right-1.5 z-20 flex flex-col gap-1 w-full">
              <div className="bg-gradient-to-r from-amber-300 to-yellow-400 px-2 py-0.5 rounded-full text-[8px] font-black text-black w-max shadow">
                Savage Mode ⚔️
              </div>
              <div className="bg-black/55 backdrop-blur-sm p-1 rounded-xl flex items-center justify-between w-[calc(100%-4px)]">
                <span className="text-white text-[9.5px] font-black truncate">{hostProfile?.displayName || 'Host'}</span>
                <span className="text-amber-400 text-[8px]">5/6 👑</span>
              </div>
            </div>
            <div className="absolute top-1.5 right-1.5 z-20 bg-cyan-400 text-black font-black text-[8px] px-1.5 py-0.5 rounded uppercase">Host</div>
          </div>
          <div className="w-[40%] h-full">
            {seats[0] ? (
              <ImmersionGuestSeatCard seat={seats[0]} seatNum={1} roomId={room.id} isHost={isHost} onShowProfile={onShowProfile} onJoin={(type) => onJoinMicRequest(type, 0)} totalSeatsCount={4} />
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 h-[92px] w-full">
          {[1, 2].map((idx) => (
            <div key={`bottom_seat_4_${idx}`} className="w-full h-full">
              {seats[idx] ? (
                <ImmersionGuestSeatCard seat={seats[idx]} seatNum={idx + 1} roomId={room.id} isHost={isHost} onShowProfile={onShowProfile} onJoin={(type) => onJoinMicRequest(type, idx)} totalSeatsCount={4} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className={cn(
        "grid gap-2 w-full mt-2 select-none overflow-y-auto no-scrollbar",
        totalSeats === 9 ? "grid-cols-3 grid-rows-3 h-[280px]" : "grid-cols-3 grid-rows-4 h-[355px]"
      )}>
        <div 
          onClick={() => hostProfile && onShowProfile(hostProfile.uid)}
          className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 relative cursor-pointer flex flex-col justify-end h-full min-h-[96px]"
        >
          <div className="absolute inset-0 z-0">
            <VideoStream isHost={isHost} roomId={room.id} hostUid={room.hostUid} type="multi-guest-live" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </div>
          <div className="absolute bottom-1.5 left-1.5 right-1.5 z-20 bg-black/55 backdrop-blur-sm p-1 rounded-lg border border-white/5 flex items-center justify-between w-[calc(100%-8px)]">
            <span className="text-white text-[8px] font-black truncate">{hostProfile?.displayName || 'Host'}</span>
            <span className="text-cyan-400 text-[6.5px] font-black uppercase shrink-0">Host</span>
          </div>
        </div>

        {seats.slice(0, totalSeats - 1).map((seat, idx) => (
          <div key={`grid_seat_${idx}`} className="w-full h-full">
            <ImmersionGuestSeatCard 
              seat={seat} 
              seatNum={idx + 1} 
              roomId={room.id} 
              isHost={isHost} 
              onShowProfile={onShowProfile} 
              onJoin={(type) => onJoinMicRequest(type, idx)} 
              totalSeatsCount={totalSeats} 
            />
          </div>
        ))}
      </div>
    );
  }
};

export default function RoomPage() {
  const { roomId } = useParams();
  const isSimulatedRoom = !roomId || roomId === 'shyne_featured' || roomId.startsWith('host_') || roomId.startsWith('sim_') || roomId.startsWith('sim-') || roomId.includes('featured') || roomId.startsWith('party_');
  const [searchParams] = useSearchParams();
  const isGhost = searchParams.get('ghost') === 'true';
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isStandalonePWA, setIsStandalonePWA] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalonePWA(e.matches || (window.navigator as any).standalone === true);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Define isHost based on room ownership and the active streamer mode query param
  const [room, setRoom] = useState<Room | null>(null);
  const isHost = !!(profile && room && profile.uid === room.hostUid && searchParams.get('mode') === 'host');
  const [hostProfile, setHostProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [simulatedMessages, setSimulatedMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [localSentMessages, setLocalSentMessages] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    viewerCount: 0,
    likeCount: 0,
    giftCount: 0,
    followCount: 0,
    duration: 0
  });
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [quality, setQuality] = useState('HD');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const hostProfileBadgeRef = React.useRef<HostProfileBadgeRef>(null);
  const tapCountSessionRef = React.useRef<number>(0);
  const lastTapTimeRef = React.useRef<number>(0);
  const lastLikeMessageSentTimeRef = React.useRef<number>(0);
  const tapTimerRef = React.useRef<any>(null);
  const hostAvatarRef = React.useRef<HTMLDivElement>(null);
  const [targetCoords, setTargetCoords] = useState({ x: 60, y: 80 });
  const [nobleEntranceUser, setNobleEntranceUser] = useState<{ displayName: string, tier: any, photoURL?: string } | null>(null);
  const [fanClubWelcomeUser, setFanClubWelcomeUser] = useState<{ displayName: string, level: number, isSuperFan: boolean } | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isLowLatency, setIsLowLatency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);
  const [followBanner, setFollowBanner] = useState<{
    id: string;
    displayName: string;
    photoURL: string;
    points: number;
  } | null>(null);

  // Auto-dismiss the follow banner after 4.5 seconds
  useEffect(() => {
    if (!followBanner) return;
    const timer = setTimeout(() => {
      setFollowBanner(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [followBanner]);

  const [activeGifts, setActiveGifts] = useState<Array<{ id: string, giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string, nobleTier?: string, familyName?: string }>>([]);
  const [giftQueue, setGiftQueue] = useState<Array<{ id: string, giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string, nobleTier?: string, familyName?: string }>>([]);
  const [activeAnimation, setActiveAnimation] = useState<{ giftName: string, displayName: string, animationType: string, nobleTier?: string, familyName?: string, animationUrl?: string, giftType?: string, cost?: number } | null>(null);
  const [isSearchingPK, setIsSearchingPK] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [seats, setSeats] = useState<GuestSeat[]>([]);
  const [micQueue, setMicQueue] = useState<MicRequest[]>([]);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [treasureInitialized, setTreasureInitialized] = useState(false);
  const [seatRequestCount, setSeatRequestCount] = useState(0);
  const [fluctuatedViewerCount, setFluctuatedViewerCount] = useState(0);
  const [activePrivateCall, setActivePrivateCall] = useState<any | null>(null);
  const [showRegionList, setShowRegionList] = useState(false);
  const [showStarGoalDetail, setShowStarGoalDetail] = useState(false);
  const [showFanClubDrawer, setShowFanClubDrawer] = useState(false);
  const [fanClubMember, setFanClubMember] = useState<any | null>(null);

  // Custom flipping state to auto-toggle header info panels back & forth every 3.5 seconds
  const [topBarFlip, setTopBarFlip] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTopBarFlip(prev => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Camera Shake & Gifting Explosion system
  const [isShaking, setIsShaking] = useState(false);
  const [recentExplosion, setRecentExplosion] = useState<{ id: string; giftName: string; senderName: string; comboCount: number; cost: number } | null>(null);

  const triggerShake = (duration = 600) => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), duration);
  };

  const handleExitStream = () => {
    const from = searchParams.get('from');
    if (from === 'spaces' || room?.type === 'audio-live') {
      navigate('/', { state: { returnTab: 'Spaces' } });
    } else if (from === 'party') {
      navigate('/party');
    } else if (from === 'popular') {
      navigate('/', { state: { returnTab: 'Popular' } });
    } else if (from === 'featured') {
      navigate('/', { state: { returnTab: 'Featured' } });
    } else if (from === 'explore') {
      navigate('/', { state: { returnTab: 'Explore' } });
    } else if (from === 'nearby') {
      navigate('/', { state: { returnTab: 'Nearby' } });
    } else {
      navigate('/');
    }
  };

  // Profile Discovery State
  const [selectedInRoomUser, setSelectedInRoomUser] = useState<UserProfile | null>(null);
  const cachedDiscoveryProfiles = React.useRef<Record<string, UserProfile>>({});

  // Room Gated Access States
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // 2. REFS
  const pendingLikesRef = React.useRef(0);
  const likeParticlesRef = React.useRef<LikeParticlesRef>(null);
  const lastJoinKey = React.useRef<string | null>(null);
  const chatRef = React.useRef<HTMLDivElement>(null);
  const desktopChatRef = React.useRef<HTMLDivElement>(null);
  const lastProcessedMsgId = React.useRef<string | null>(null);
  const lastMessageCountRef = React.useRef(0);

  // 3. UTILS
  const deviceType = getDeviceType();
  const isMobile = deviceType !== 'desktop';

  useEffect(() => {
    if (room) {
      setStreamStats(prev => ({
        ...prev,
        viewerCount: room.viewerCount || 0,
        likeCount: room.likes || 0,
        duration: prev.duration + 1
      }));
      if (fluctuatedViewerCount === 0) {
        setFluctuatedViewerCount(room.viewerCount || 411);
      }
    }
  }, [room]);

  // Viewer count fluctuation logic
  useEffect(() => {
    if (!room) return;
    
    const interval = setInterval(() => {
      setFluctuatedViewerCount(prev => {
        const drift = Math.random() > 0.5 ? 1 : -1;
        // Keep it within a reasonable range of the actual count (+/- 10%)
        const base = room.viewerCount || 411;
        const min = Math.max(1, Math.floor(base * 0.9));
        const max = Math.ceil(base * 1.1);
        
        let next = prev + drift;
        if (next < min) next = min + 1;
        if (next > max) next = max - 1;
        return next;
      });
    }, 3000); // Update every 3 seconds for a natural feel

    return () => clearInterval(interval);
  }, [room?.viewerCount]);

  useEffect(() => {
    const syncLikes = async () => {
      if (pendingLikesRef.current > 0 && roomId) {
        const likesToAdd = pendingLikesRef.current;
        pendingLikesRef.current = 0;
        if (isSimulatedRoom) return;
        try {
          await updateDoc(doc(db, 'rooms', roomId), {
            likes: increment(likesToAdd)
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
        }
      }
    };

    const interval = setInterval(syncLikes, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleTapLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
    }
    pendingLikesRef.current += 1;
    
    hostProfileBadgeRef.current?.onTapLike();
    hostProfileBadgeRef.current?.onHeartArrival(1); // Increment likes progress directly on tap
    lastTapTimeRef.current = Date.now();
    
    tapCountSessionRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountSessionRef.current = 0;
    }, 2500);
  };

  // Dynamically calculate coordinate position of the circular host profile picture for incoming likes
  useEffect(() => {
    const measureCoords = () => {
      if (hostAvatarRef.current) {
        const rect = hostAvatarRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setTargetCoords({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          });
        }
      }
    };

    measureCoords();
    // Re-measure on window updates, or layout switches
    window.addEventListener('resize', measureCoords);
    const mTimer = setTimeout(measureCoords, 800); // Fail-safe fallback timer

    return () => {
      window.removeEventListener('resize', measureCoords);
      clearTimeout(mTimer);
    };
  }, [hostProfile]);

  const handleHeartArrival = React.useCallback((count: number = 1) => {
    hostProfileBadgeRef.current?.onHeartArrival(count);
  }, []);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const allMessages = [...messages, ...simulatedMessages].sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || Date.now());
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || Date.now());
      return timeA - timeB;
    });

    if (allMessages.length > 0) {
      const lastMsg = allMessages[allMessages.length - 1];
      
      if (lastMsg.id !== lastProcessedMsgId.current) {
        lastProcessedMsgId.current = lastMsg.id;

        if ((lastMsg.type === 'gift' || lastMsg.isGift) && lastMsg.uid !== profile?.uid) {
          const giftName = lastMsg.giftName || lastMsg.text.replace('sent a ', '').replace('! 🎁', '').replace(/sent \d+x /, '');
          const giftImage = lastMsg.giftImage || (lastMsg.text.includes('🌹') ? '🌹' : '🎁');
          const quantity = lastMsg.quantity || 1;
          const animationType = lastMsg.animationType || 'standard';
          const senderName = lastMsg.displayName;
          const nobleTier = lastMsg.nobleTier || 'None';
          const familyName = lastMsg.familyName;
          const animationUrl = lastMsg.animationUrl || null;
          const giftType = lastMsg.giftType || null;
          const cost = lastMsg.cost || 0;
          
          setActiveAnimation({ giftName, displayName: senderName, animationType, nobleTier, familyName, animationUrl, giftType, cost });
          setTimeout(() => setActiveAnimation(null), 5000);
          
          const processGift = (giftData: any) => {
            const { giftName, giftImage, quantity, animationType, senderName, photoURL, hostPhoto, id, nobleTier, familyName, cost } = giftData;
            const giftId = id || `msg-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

            setActiveGifts(prevActive => {
              const existingIndex = prevActive.findIndex(g => g.displayName === senderName && g.giftName === giftName);
              if (existingIndex !== -1) {
                const updated = [...prevActive];
                const nextCombo = updated[existingIndex].combo + quantity;
                updated[existingIndex] = { ...updated[existingIndex], combo: nextCombo, animationType, nobleTier, familyName };
                
                // Trigger explosion overlay if combo milestone matches or high cost
                if (nextCombo % 10 === 0 || nextCombo === 5 || nextCombo === 18 || nextCombo === 99 || cost >= 100) {
                  setRecentExplosion({
                    id: `${giftId}-${nextCombo}-${Date.now()}`,
                    giftName,
                    senderName,
                    comboCount: nextCombo,
                    cost
                  });
                }
                return updated;
              }

              // Check queue
              const existingQueueIndex = giftQueue.findIndex(g => g.displayName === senderName && g.giftName === giftName);
              if (existingQueueIndex !== -1) {
                setGiftQueue(prevQueue => {
                  const updated = [...prevQueue];
                  const nextCombo = updated[existingQueueIndex].combo + quantity;
                  updated[existingQueueIndex] = { ...updated[existingQueueIndex], combo: nextCombo, animationType, nobleTier, familyName };
                  
                  if (nextCombo % 10 === 0 || nextCombo === 5 || nextCombo === 18 || nextCombo === 99 || cost >= 100) {
                    setRecentExplosion({
                      id: `${giftId}-${nextCombo}-${Date.now()}`,
                      giftName,
                      senderName,
                      comboCount: nextCombo,
                      cost
                    });
                  }
                  return updated;
                });
                return prevActive;
              }

              // New gift
              const newGift = {
                id: giftId,
                giftName, giftImage, displayName: senderName,
                userPhoto: photoURL || hostPhoto,
                combo: quantity, animationType, nobleTier, familyName
              };

              if (quantity >= 5 || cost >= 100) {
                setRecentExplosion({
                  id: `${giftId}-${quantity}-${Date.now()}`,
                  giftName,
                  senderName,
                  comboCount: quantity,
                  cost
                });
              }

              if (prevActive.length < 2) {
                return [...prevActive, newGift];
              } else {
                setGiftQueue(prevQueue => [...prevQueue, newGift]);
                return prevActive;
              }
            });
          };

          processGift({
            giftName, giftImage, quantity, animationType, senderName,
            photoURL: lastMsg.photoURL, hostPhoto: lastMsg.hostPhoto, id: lastMsg.id,
            nobleTier, familyName, cost
          });
        }

        if (lastMsg.type === 'like' && lastMsg.uid !== profile?.uid) {
          hostProfileBadgeRef.current?.onTapLike();
          hostProfileBadgeRef.current?.onHeartArrival(1);
          likeParticlesRef.current?.triggerLike();
        }
      }
    }
  }, [messages, simulatedMessages, profile?.uid]);

  useEffect(() => {
    const allMessages = [...messages, ...simulatedMessages];
    const currentCount = allMessages.length;
    
    if (chatRef.current) {
      if (isAtBottom) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        setHasNewMessages(false);
      } else if (currentCount > lastMessageCountRef.current) {
        // Only show "New Messages" if the count actually increased while we were scrolled up
        setHasNewMessages(true);
      }
    }
    lastMessageCountRef.current = currentCount;
  }, [messages, simulatedMessages, isAtBottom]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // Update every 10 seconds to refresh the 5-minute filter
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!room) return;
    setSeats(room.seats || initializeSeats());
    setMicQueue(room.micQueue || []);
  }, [room?.seats, room?.micQueue]);

  useEffect(() => {
    if (room && !treasureInitialized && profile?.uid === room.hostUid) {
      const initializeFeatures = async () => {
        try {
          await initializeTreasureChest(room.id);
          if (room.type === 'multi-guest-live') {
            await initializeEnhancedSeats(room.id, room.seats?.length || 6);
          }
          setTreasureInitialized(true);
        } catch (error) {
          console.error('Error initializing features:', error);
        }
      };
      initializeFeatures();
    }
  }, [room?.id, room?.hostUid, room?.type, profile?.uid, treasureInitialized]);

  const handleJoinMicRequest = async (type: 'audio' | 'video') => {
    if (!profile || !room) return;
    
    let displayName = profile.displayName;
    let photoURL = profile.photoURL;
    
    const isMysteryMan = await SVIPManager.hasPrivilege(profile.uid, 'mystery_man_mode');
    if (isMysteryMan) {
      displayName = "Mystery Man";
      photoURL = "https://i.pravatar.cc/150?u=mystery";
    }

    const updatedQueue = handleMicRequest(micQueue, { ...profile, displayName, photoURL }, type);
    if (isSimulatedRoom) {
      setMicQueue(updatedQueue);
      return;
    }
    await updateDoc(doc(db, 'rooms', roomId), {
      micQueue: updatedQueue
    });
  };

  const handleAssignSeat = async (seatId: number, request: MicRequest) => {
    if (!room) return;
    const updatedSeats = assignSeat(seats, seatId, request.uid, request.type);
    const updatedQueue = micQueue.filter(req => req.uid !== request.uid);
    if (isSimulatedRoom) {
      setSeats(updatedSeats);
      setMicQueue(updatedQueue);
      return;
    }
    await updateDoc(doc(db, 'rooms', roomId), {
      seats: updatedSeats,
      micQueue: updatedQueue
    });
  };

  const handleRemoveGuest = async (seatId: number) => {
    if (!room) return;
    const seat = seats.find(s => s.seatId === seatId);
    if (seat?.uid) {
      const hasAntiKick = await SVIPManager.hasPrivilege(seat.uid, 'anti_kick');
      if (hasAntiKick) {
        showToast("This user has Anti-Kick protection! 🛡️", 'error');
        return;
      }
    }
    const updatedSeats = removeGuest(seats, seatId);
    if (isSimulatedRoom) {
      setSeats(updatedSeats);
      return;
    }
    await updateDoc(doc(db, 'rooms', roomId), {
      seats: updatedSeats
    });
  };

  const handleToggleMute = async (seatId: number) => {
    if (!room) return;
    const seat = seats.find(s => s.seatId === seatId);
    if (seat?.uid && !seat.isMuted) { // Only check when trying to mute
      const hasAntiMute = await SVIPManager.hasPrivilege(seat.uid, 'anti_mute');
      if (hasAntiMute) {
        showToast("This user has Anti-Mute protection! 🛡️", 'error');
        return;
      }
    }
    const updatedSeats = toggleMute(seats, seatId);
    if (isSimulatedRoom) {
      setSeats(updatedSeats);
      return;
    }
    await updateDoc(doc(db, 'rooms', roomId), {
      seats: updatedSeats
    });
  };

  const handleToggleLock = async (seatId: number) => {
    if (!room) return;
    const updatedSeats = seats.map(s => s.seatId === seatId ? { ...s, status: (s.status === 'locked' ? 'empty' : 'locked') as any } : s);
    if (isSimulatedRoom) {
      setSeats(updatedSeats);
      return;
    }
    await updateDoc(doc(db, 'rooms', roomId), {
      seats: updatedSeats
    });
  };

  const showOpponentUserProfile = (oppUid: string) => {
    const mockOpponent: UserProfile = {
      uid: "1089138321", // Exact ID from the screenshot!
      displayName: "M.ø.l.l.y", // Exact display name!
      photoURL: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop", // Elegant look
      level: 13,
      nobleTitle: 'None',
      familyName: '2 MUCH IC3',
      familyLevel: 13,
      fans: 316,
      following: 122,
      totalBeansEarned: 2410,
      diamonds: 0,
      beans: 2410,
      coins: 0,
      points: 0,
      role: 'user',
      friends: 10,
      referralCode: '',
      totalDiamondsSpent: 0
    };
    setSelectedInRoomUser(mockOpponent);
  };

  const showUserProfile = async (uid: string) => {
    if (uid.startsWith('opponent_')) {
      showOpponentUserProfile(uid);
      return;
    }
    if (cachedDiscoveryProfiles.current[uid]) {
      setSelectedInRoomUser(cachedDiscoveryProfiles.current[uid]);
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const u = { uid: snap.id, ...snap.data() } as UserProfile;
        cachedDiscoveryProfiles.current[uid] = u;
        setSelectedInRoomUser(u);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const visibleMessages = React.useMemo(() => {
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    
    const systemMsg = {
      id: 'system-welcome',
      type: 'system' as const,
      text: 'Minors are strictly prohibited from using BINGO LIVE. The review team will monitor rooms 24/7. Please report any violations.',
      timestamp: 0 // Keep it at the very top
    };

    const uniqueLocalMsgs = localSentMessages.filter(localMsg => {
      return !messages.some(dbMsg => dbMsg.uid === localMsg.uid && dbMsg.text === localMsg.text);
    });

    const combined = [systemMsg, ...messages, ...uniqueLocalMsgs, ...simulatedMessages];
    
    // De-duplicate by message ID to prevent duplicate React keys
    const seenIds = new Set<string>();
    const uniqueCombined: any[] = [];
    for (const msg of combined) {
      if (msg && msg.id) {
        if (seenIds.has(msg.id)) {
          continue;
        }
        seenIds.add(msg.id);
      }
      uniqueCombined.push(msg);
    }

    return uniqueCombined
      .filter(msg => {
        if (msg.id === 'system-welcome') return true;
        
        // Filter out follow-prompt if already following or if user is host
        if (msg.type === 'follow-prompt') {
          if (isFollowing) return false;
          if (profile?.uid === room?.hostUid) return false;
        }

        const ts = msg.timestamp?.toMillis ? msg.timestamp.toMillis() : (typeof msg.timestamp === 'number' ? msg.timestamp : Date.now());
        return ts > fiveMinutesAgo;
      })
      .sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (typeof a.timestamp === 'number' ? a.timestamp : Date.now() + 1000);
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (typeof b.timestamp === 'number' ? b.timestamp : Date.now() + 1000);
        return timeA - timeB;
      });
  }, [messages, localSentMessages, simulatedMessages, currentTime, isFollowing, profile?.uid, room?.hostUid]);

  const handleLocalGift = (gift: any, quantity: number) => {
    if (!profile) return;
    
    const giftName = gift.name;
    const giftImage = gift.image;
    const animationType = gift.animationType || 'standard';
    const senderName = profile.displayName;
    const giftId = `local-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    const animationUrl = gift.animationUrl || null;
    const giftType = gift.giftType || null;
    const cost = gift.cost || 0;

    // Asynchronously deduct diamonds from persistent sender wallet and increment host beans in database
    if (room?.id) {
      processGiftTransaction(
        profile.uid,
        room.hostUid,
        room.id,
        {
          id: gift.id || gift.name.toLowerCase(),
          name: gift.name,
          image: gift.image,
          cost: cost,
          animationType: animationType
        },
        quantity,
        'Local',
        1,
        0
      ).then((result) => {
        if (result.success) {
          showToast(`Sent ${quantity}x ${giftName}! 💎 -${result.totalCost} diamonds`, 'success');
        }
      }).catch(err => {
        console.error("Fast gift transaction failed:", err);
        showToast(err.message || "Failed to process gift payment", 'error');
      });
    }

    // Instantly update local Room state for zero-latency, real-time UI/Heat updates (especially in simulated sessions)
    setRoom(prev => {
      if (!prev) return prev;
      const totalCost = cost * quantity;
      return {
        ...prev,
        currentBeans: (prev.currentBeans || 0) + totalCost,
        popularity: (prev.popularity || 0) + (totalCost * 15) // Each diamond contributes robust popularity Heat multiplier!
      };
    });

    setActiveAnimation({ giftName, displayName: senderName, animationType, nobleTier: profile.nobleTitle || 'None', animationUrl, giftType, cost });
    setTimeout(() => setActiveAnimation(null), 5000);

    setActiveGifts(prevActive => {
      const existingIndex = prevActive.findIndex(g => g.displayName === senderName && g.giftName === giftName);
      if (existingIndex !== -1) {
        const updated = [...prevActive];
        const nextCombo = updated[existingIndex].combo + quantity;
        updated[existingIndex] = { ...updated[existingIndex], combo: nextCombo, animationType };
        
        if (nextCombo % 10 === 0 || nextCombo === 5 || nextCombo === 18 || nextCombo === 99 || cost >= 100) {
          setRecentExplosion({
            id: `${giftId}-${nextCombo}-${Date.now()}`,
            giftName,
            senderName,
            comboCount: nextCombo,
            cost
          });
        }
        return updated;
      }

      // Check queue
      const existingQueueIndex = giftQueue.findIndex(g => g.displayName === senderName && g.giftName === giftName);
      if (existingQueueIndex !== -1) {
        setGiftQueue(prevQueue => {
          const updated = [...prevQueue];
          const nextCombo = updated[existingQueueIndex].combo + quantity;
          updated[existingQueueIndex] = { ...updated[existingQueueIndex], combo: nextCombo, animationType };
          
          if (nextCombo % 10 === 0 || nextCombo === 5 || nextCombo === 18 || nextCombo === 99 || cost >= 100) {
            setRecentExplosion({
              id: `${giftId}-${nextCombo}-${Date.now()}`,
              giftName,
              senderName,
              comboCount: nextCombo,
              cost
            });
          }
          return updated;
        });
        return prevActive;
      }

      const newGift = {
        id: giftId,
        giftName, giftImage, displayName: senderName,
        userPhoto: profile.photoURL,
        combo: quantity, animationType, familyName: profile.familyName
      };

      if (quantity >= 5 || cost >= 100) {
        setRecentExplosion({
          id: `${giftId}-${quantity}-${Date.now()}`,
          giftName,
          senderName,
          comboCount: quantity,
          cost
        });
      }

      if (prevActive.length < 2) {
        return [...prevActive, newGift];
      } else {
        setGiftQueue(prevQueue => [...prevQueue, newGift]);
        return prevActive;
      }
    });
  };

  const handleChatScroll = () => {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
      // Use a slightly larger threshold for "at bottom" to be more forgiving
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
      if (atBottom) {
        setHasNewMessages(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      setIsAtBottom(true);
      setHasNewMessages(false);
    }
  };

  const startPK = async () => {
    if (!roomId || !profile || profile.uid !== room?.hostUid || isSearchingPK) return;
    setIsSearchingPK(true);
    try {
      setTimeout(async () => {
        const opponentUid = "opponent_" + Math.random().toString(36).substring(7);
        const opponentRoomId = "room_" + Math.random().toString(36).substring(7);
        await updateDoc(doc(db, 'rooms', roomId), {
          pkStatus: 'battling',
          pkOpponentUid: opponentUid,
          pkOpponentRoomId: opponentRoomId,
          pkScore: 1250,
          pkOpponentScore: 840,
          pkEndTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
        setIsSearchingPK(false);
      }, 1000);
    } catch (error) {
      console.error('Start PK error', error);
      setIsSearchingPK(false);
    }
  };

  const endPK = async () => {
    if (!roomId || !profile || profile.uid !== room?.hostUid) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        pkStatus: 'idle',
        pkOpponentUid: deleteField(),
        pkOpponentRoomId: deleteField(),
        pkScore: deleteField(),
        pkOpponentScore: deleteField(),
        pkEndTime: deleteField()
      });
    } catch (error) {
      console.error('End PK error', error);
    }
  };

  useEffect(() => {
    if (!roomId || !profile?.uid) return;
    if (isSimulatedRoom) {
      // Mock room guard to prevent firestore write errors
      return;
    }
    const roomRef = doc(db, 'rooms', roomId);
    
    // Ghost Mode: Admins can join without being noticed
    const shouldBeGhost = isGhost && profile.role === 'admin';
    
    if (shouldBeGhost) {
      console.log("[Admin] Joining in Ghost Mode...");
      return;
    }

    // Add join message
    const addJoinMessage = async () => {
      try {
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'join',
          uid: profile.uid,
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
          level: profile.level || 1,
          nobleTier: profile.nobleTitle || 'None',
          timestamp: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}/messages`);
      }
    };
    addJoinMessage();

    updateDoc(roomRef, { viewerCount: increment(1) }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`));
    return () => {
      updateDoc(roomRef, { viewerCount: increment(-1) }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`));
    };
  }, [roomId, profile?.uid]);

  // 4. LISTENERS
  useEffect(() => {
    if (!roomId) return;

    const matchFeaturedRoom = (id: string) => {
      const featured = [
        {
          id: 'shyne_featured',
          title: 'I need you! Special Featured Live 💖',
          hostUid: 'host_shyne',
          hostName: 'SHYNE..... ✨',
          hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
          viewerCount: 98,
          level: 35,
          type: 'live',
          regionRank: 12
        },
        {
          id: 'host_bigs',
          title: 'βiGS Gang Room - Let the battle begin 🩸🔥',
          hostUid: 'host_bigs',
          hostName: 'βiGS... 🩸',
          hostPhotoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=350',
          viewerCount: 142,
          level: 45,
          type: 'live',
          pkStatus: 'battling',
          pkOpponentUid: 'host_rosey',
          regionRank: 64
        },
        {
          id: 'host_rosey',
          title: 'Rose Palace - Live music and request show! 🌹🎙️',
          hostUid: 'host_rosey',
          hostName: '⭐ ROSeY 🌹',
          hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350',
          viewerCount: 215,
          level: 32,
          type: 'live'
        },
        {
          id: 'host_june',
          title: 'June Spring - Multi-guest cozy chats & mini-games! 🌸✨',
          hostUid: 'host_june',
          hostName: '6k June 🌸...',
          hostPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350',
          viewerCount: 310,
          level: 48,
          type: 'multi-guest-live',
          regionRank: 80,
          guests: ['sim_g1', 'sim_g2', 'sim_g3', 'sim_g4', 'sim_g5'],
          seats: [
            { seatId: 1, uid: 'sim_g1', status: 'occupied', isMuted: false, type: 'audio' },
            { seatId: 2, uid: 'sim_g2', status: 'occupied', isMuted: true, type: 'audio' },
            { seatId: 3, uid: 'sim_g3', status: 'occupied', isMuted: false, type: 'audio' },
            { seatId: 4, uid: 'sim_g4', status: 'occupied', isMuted: false, type: 'audio' },
            { seatId: 5, uid: 'sim_g5', status: 'occupied', isMuted: false, type: 'audio' },
            { seatId: 6, uid: null, status: 'empty', isMuted: false, type: 'audio' }
          ]
        },
        {
          id: 'host_babyface',
          title: 'bäbyfäcε acoustics - Chill acoustic beats & late loops 👾',
          hostUid: 'host_babyface',
          hostName: 'bäbyfäcε...',
          hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
          viewerCount: 74,
          level: 29,
          type: 'live'
        },
        {
          id: 'host_adabekee',
          title: 'BINGO Verified premier host 🇳🇬✨',
          hostUid: 'host_adabekee',
          hostName: 'Ada Bekee.',
          hostPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350',
          viewerCount: 180,
          level: 55,
          type: 'live',
          regionRank: 15
        }
      ];
      const found = featured.find(f => f.id === id);
      if (found) return found;

      const partySimulatedFeeds = [
        { 
          id: 'party_retro_aria', 
          type: 'audio-live', 
          title: 'Acoustic Hits & Old-school Jam Session 🎙️', 
          hostName: 'Aria.Acoustic', 
          hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop', 
          hostUid: 'host_retro_aria', 
          viewerCount: 165, 
          level: 28,
          currentBeans: 4900,
        },
        { 
          id: 'party_neon_dj_leo', 
          type: 'multi-guest-live', 
          title: 'Friday Mega Dance Party & VIP Mikes On! 🔥', 
          hostName: 'DJ.Leo.Vibes', 
          hostPhotoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop', 
          hostUid: 'host_neon_dj_leo', 
          viewerCount: 230, 
          level: 39,
          currentBeans: 12500,
        },
        {
          id: 'party_followed_nadia',
          hostUid: 'host_party_followed_nadia',
          hostName: 'Nadia.Live 🌸',
          hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
          title: 'Weekend Chills & Late Music 🎵',
          type: 'audio-live',
          viewerCount: 420,
          level: 32,
          currentBeans: 5200,
        },
        {
          id: 'party_followed_alex',
          hostUid: 'host_party_followed_alex',
          hostName: 'Alex.King 👑',
          hostPhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
          title: 'Ludo Arena - Seats Open 🎲',
          type: 'multi-guest-live',
          viewerCount: 180,
          level: 41,
          currentBeans: 6800,
        },
        {
          id: 'party_followed_yasmin',
          hostUid: 'host_party_followed_yasmin',
          hostName: 'Yasmin.Vibe ✨',
          hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          title: '10k Beans Goal! Join seats 🎙️',
          type: 'audio-live',
          viewerCount: 310,
          level: 25,
          currentBeans: 9200,
        },
        {
          id: 'party_followed_marcus',
          hostUid: 'host_party_followed_marcus',
          hostName: 'Marcus.Talks 🎤',
          hostPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
          title: 'Late Night Truth or Dare 🔥',
          type: 'multi-guest-live',
          viewerCount: 520,
          level: 37,
          currentBeans: 14100,
        }
      ];

      const foundSim: any = bigoSimulatedFeeds.find(f => f.id === id) || 
                            partySimulatedFeeds.find(f => f.id === id) ||
                            INITIAL_SIMULATED_SPACES.find(f => f.id === id);
      if (foundSim) {
        const hashValDummy = foundSim.id ? foundSim.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        const isNewHostDummy = foundSim.title?.toLowerCase().includes('new') || foundSim.id?.includes('babyface') || (hashValDummy % 7 === 1);
        const isVideoRoomDummy = !isNewHostDummy && (foundSim.title?.toLowerCase().includes('multi') || foundSim.title?.toLowerCase().includes('party') || foundSim.type === 'multi-guest-live' || (hashValDummy % 7 === 3));
        const isPKDummy = !isNewHostDummy && !isVideoRoomDummy && (foundSim.title?.toLowerCase().includes('pk') || foundSim.id?.startsWith('party_followed_') || (hashValDummy % 7 === 5));
 
        const determinedType = isVideoRoomDummy ? 'multi-guest-live' : (foundSim.type || 'audio-live');
        const determinedPKStatus = isPKDummy ? 'battling' : 'idle';
        const determinedOpponent = isPKDummy ? 'host_rosey' : '';
 
        // If it's a multi-guest-live, populate authentic seats
        const determinedSeats = determinedType === 'multi-guest-live' ? [
          { seatId: 1, uid: 'sim_g1', status: 'occupied', isMuted: false, type: 'audio' },
          { seatId: 2, uid: 'sim_g2', status: 'occupied', isMuted: true, type: 'audio' },
          { seatId: 3, uid: 'sim_g3', status: 'occupied', isMuted: false, type: 'audio' },
          { seatId: 4, uid: 'sim_g4', status: 'occupied', isMuted: false, type: 'audio' },
          { seatId: 5, uid: 'sim_g5', status: 'occupied', isMuted: false, type: 'audio' },
          { seatId: 6, uid: null, status: 'empty', isMuted: false, type: 'audio' }
        ] : (foundSim.seats || []);
 
        return {
          id: foundSim.id,
          title: foundSim.title,
          hostUid: foundSim.hostUid || foundSim.speakingUid || ('sim_host_' + foundSim.id),
          hostName: foundSim.hostName || 'Host',
          hostPhotoURL: foundSim.hostPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
          viewerCount: foundSim.viewerCount,
          level: foundSim.level || foundSim.hostLevel || 30,
          regionRank: foundSim.regionRank || (foundSim.id?.includes('adabekee') ? 15 : foundSim.id?.includes('featured') ? 12 : foundSim.id?.includes('bigs') ? 64 : foundSim.id?.includes('june') ? 80 : undefined),
          type: determinedType,
          guests: isVideoRoomDummy ? ['sim_g1', 'sim_g2', 'sim_g3', 'sim_g4', 'sim_g5'] : (foundSim.guests || []),
          seats: determinedSeats,
          pkStatus: determinedPKStatus,
          pkOpponentUid: determinedOpponent
        };
      }
      return undefined;
    };

    const mockRoom = matchFeaturedRoom(roomId);
    if (mockRoom) {
      setRoom({
        id: mockRoom.id,
        title: mockRoom.title,
        hostUid: mockRoom.hostUid,
        hostName: mockRoom.hostName,
        hostPhotoURL: mockRoom.hostPhotoURL,
        type: mockRoom.type || 'live',
        status: 'live',
        viewerCount: mockRoom.viewerCount,
        likes: 1200 + Math.floor(Math.random() * 500),
        currentBeans: 4200 + Math.floor(Math.random() * 1000),
        latitude: 6.43,
        longitude: 3.52,
        locationName: 'Lekki, Nigeria',
        guests: mockRoom.guests || [],
        seats: mockRoom.seats || [],
        pkStatus: mockRoom.pkStatus || 'idle',
        pkOpponentUid: mockRoom.pkOpponentUid || '',
        isPrivate: false,
        createdAt: null
      } as any);

      setHostProfile({
        uid: mockRoom.hostUid,
        displayName: mockRoom.hostName,
        photoURL: mockRoom.hostPhotoURL,
        level: mockRoom.level,
        role: 'user',
        totalBeansEarned: mockRoom.level * 1000 + 4000,
        diamonds: 1000,
        beans: 500,
        regionRank: mockRoom.regionRank
      } as any);

      // Populate initial vibrant mock comments to make it highly immersive!
      setMessages([
        { id: 'm1', uid: 'user_a', displayName: 'Tony 🔥', content: `Welcome to ${mockRoom.hostName}'s live show!`, timestamp: { toDate: () => new Date() } } as any,
        { id: 'm2', uid: 'user_b', displayName: 'Joy 👑', content: 'Gifting a flower! 🌹 Keep shinning', timestamp: { toDate: () => new Date() } } as any,
        { id: 'm3', uid: 'user_c', displayName: 'Prince ⚡', content: 'Wow, great performance!', timestamp: { toDate: () => new Date() } } as any,
        { id: 'm4', uid: 'user_d', displayName: 'Sonia 🌸', content: 'Love the chill vibes here!', timestamp: { toDate: () => new Date() } } as any,
      ]);
      return () => {};
    }

    // Listen to Room Data
    const unsubRoom = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) {
        const roomData = { id: snap.id, ...snap.data() } as Room;
        setRoom(roomData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
    });

    // Listen to Messages
    const q = query(
      collection(db, 'rooms', roomId, 'messages'), 
      orderBy('timestamp', 'desc'), 
      limit(50)
    );
    const unsubMsgs = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })).reverse());

      // Parse newly-added documents from the snap changes list
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docData = change.doc.data();
          if (docData.type === 'join') {
            const nobleTier = docData.nobleTier || docData.nobleTitle;
            if (nobleTier && nobleTier !== 'None') {
              setNobleEntranceUser({
                displayName: docData.displayName || 'Visitor',
                tier: nobleTier,
                photoURL: docData.photoURL || 'https://i.pravatar.cc/100'
              });
            } else if (docData.fanClubLevel && docData.fanClubLevel >= 5) {
              setFanClubWelcomeUser({
                displayName: docData.displayName || 'Fan Member',
                level: docData.fanClubLevel,
                isSuperFan: docData.isSuperFan || docData.fanClubLevel >= 15
              });
            }
          }
          if (docData.type === 'follow') {
            setFollowBanner({
              id: change.doc.id,
              displayName: docData.displayName || 'User',
              photoURL: docData.photoURL || '',
              points: 160
            });
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/messages`);
    });

    return () => {
      unsubRoom();
      unsubMsgs();
    };
  }, [roomId]);

  // Listen to Host Profile
  useEffect(() => {
    if (!room?.hostUid) return;
    const hostUid = room.hostUid;

    const unsubHost = onSnapshot(doc(db, 'users', hostUid), (userSnap) => {
      if (userSnap.exists()) {
        setHostProfile({ uid: userSnap.id, ...userSnap.data() } as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${hostUid}`);
    });

    return () => unsubHost();
  }, [room?.hostUid]);

  // Listen for active private calls in this room
  useEffect(() => {
    if (!roomId || isSimulatedRoom) return;
    const q = query(collection(db, `rooms/${roomId}/private_calls`), where('status', '==', 'active'), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActivePrivateCall({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setActivePrivateCall(null);
      }
    });
    return () => unsub();
  }, [roomId]);

  // Check Following Status
  useEffect(() => {
    if (!profile || !room?.hostUid || isSimulatedRoom) return;
    const hostUid = room.hostUid;
    const followId = `${profile.uid}_${hostUid}`;

    const unsub = onSnapshot(doc(db, 'follows', followId), (doc) => {
      setIsFollowing(doc.exists());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `follows/${followId}`);
    });

    return () => unsub();
  }, [profile?.uid, room?.hostUid]);

  // Listen to Fan Club Status
  useEffect(() => {
    if (!profile?.uid || !room?.hostUid || isSimulatedRoom) return;
    const hostUid = room.hostUid;
    const senderUid = profile.uid;
    const memberKey = `${hostUid}_${senderUid}`;

    const unsub = onSnapshot(doc(db, 'fan_club_members', memberKey), (snap) => {
      if (snap.exists()) {
        setFanClubMember(snap.data());
      } else {
        setFanClubMember(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `fan_club_members/${memberKey}`);
    });

    return () => unsub();
  }, [profile?.uid, room?.hostUid]);

  // Chat Simulation for Viewer (to make the room feel alive)
  useEffect(() => {
    if (!room || !profile) return;

    const interval = setInterval(() => {
      const newMessage = generateSimulatedMessage(hostProfile);

      setSimulatedMessages(prev => {
        const updated = [...prev, newMessage].slice(-30);
        
        if (newMessage.type === 'join' && newMessage.nobleTier && newMessage.nobleTier !== 'None') {
          setNobleEntranceUser({ 
            displayName: newMessage.displayName, 
            tier: newMessage.nobleTier,
            photoURL: (newMessage as any).photoURL
          });
        }

        if (newMessage.type === 'join' && newMessage.isSuperFan) {
          setFanClubWelcomeUser({ 
            displayName: newMessage.displayName, 
            level: newMessage.fanClubLevel || 1, 
            isSuperFan: true 
          });
        }

        if (newMessage.type === 'follow') {
          const thankYou = createThankYouMessage(newMessage.displayName, hostProfile);
          return [...updated, thankYou].slice(-30);
        }
        return updated;
      });
    }, 2500); // Faster interval to match GoLivePage

    return () => clearInterval(interval);
  }, [room?.id, hostProfile]);

  // Add immediate follow prompt for viewers
  useEffect(() => {
    if (!room || !profile || profile.uid === room.hostUid || isFollowing || !hostProfile) return;

    // Immediate prompt on join
    const initialPrompt = createInitialFollowPrompt(room.id, hostProfile);
    
    setSimulatedMessages(prev => {
      const existingIndex = prev.findIndex(m => m.id === initialPrompt.id);
      if (existingIndex !== -1) {
        // Update existing prompt with latest host info if needed
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...initialPrompt };
        return updated;
      }
      return [...prev, initialPrompt].slice(-30);
    });

    return () => {};
  }, [room?.id, room?.hostUid, profile?.uid, isFollowing, hostProfile]);


  const toggleFollow = async () => {
    if (!profile || !room) return;
    
    if (isSimulatedRoom) {
      if (!isFollowing) {
        setIsFollowing(true);
        setJustFollowed(true);
        setTimeout(() => setJustFollowed(false), 1500);

        setFollowBanner({
          id: `sim_banner_${Date.now()}`,
          displayName: profile.displayName || 'Guest',
          photoURL: profile.photoURL || '',
          points: 160
        });

        const newFollowMsg = {
          id: `sim_follow_${Date.now()}`,
          type: 'follow',
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          level: profile.level || 1,
          timestamp: Date.now()
        };
 
        const newContribMsg = {
          id: `sim_contrib_${Date.now()}`,
          type: 'follow-contribution',
          displayName: profile.displayName,
          timestamp: Date.now()
        };
 
        const newIncentiveMsg = {
          id: `sim_incentive_${Date.now()}`,
          type: 'follow-join-fan-club',
          displayName: profile.displayName,
          timestamp: Date.now()
        };
 
        setSimulatedMessages(prev => [...prev, newFollowMsg, newContribMsg, newIncentiveMsg].slice(-35));
        showToast("Following! ❤️", 'success');
      } else {
        setIsFollowing(false);
        showToast("Unfollowed! 😿", 'success');
      }
      return;
    }

    const followId = `${profile.uid}_${room.hostUid}`;
    const followRef = doc(db, 'follows', followId);
    try {
      if (isFollowing) {
        await deleteDoc(followRef);
        showToast("Unfollowed! 😿", 'success');
      } else {
        setJustFollowed(true);
        setTimeout(() => setJustFollowed(false), 1500);

        await setDoc(followRef, { followerUid: profile.uid, followingUid: room.hostUid, timestamp: serverTimestamp() });
        
        // Increase popularity/heat by 160 points
        await updateDoc(doc(db, 'rooms', roomId), { 
          popularity: increment(160) 
        });

        // Add follow message
        await addDoc(collection(db, `rooms/${roomId}/messages`), { 
          type: 'follow', 
          uid: profile.uid, 
          displayName: profile.displayName, 
          photoURL: profile.photoURL || '', 
          svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
          level: profile.level || 1, 
          timestamp: serverTimestamp() 
        });

        // Add Follow Contribution message log
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'follow-contribution',
          uid: profile.uid,
          displayName: profile.displayName,
          timestamp: serverTimestamp()
        });

        // Add Fan Club Incentive message log
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'follow-join-fan-club',
          uid: profile.uid,
          displayName: profile.displayName,
          timestamp: serverTimestamp()
        });

        // Add automated thank you message from the host/system
        const thankYouMessages = [
          `Thanks for the follow, @${profile.displayName}! ❤️`,
          `Welcome to the family, @${profile.displayName}! 🙏`,
          `Glad to have you here, @${profile.displayName}! 🌟`,
          `Thanks for the support, @${profile.displayName}! ✨`,
          `Welcome! Thanks for the follow, @${profile.displayName}! 💖`
        ];
        const randomThankYou = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];

        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'welcome',
          uid: profile.uid,
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
          hostName: hostProfile?.displayName || 'Anchor',
          hostLevel: hostProfile?.level || 1,
          text: randomThankYou,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) { console.error('Follow error', error); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile || !roomId) return;
    
    const isMessagingRestricted = profile.bannedMessaging && (!profile.suspendedUntil || new Date(profile.suspendedUntil) > new Date());
    if (isMessagingRestricted || profile.isBanned || profile.bannedApp) {
      showToast("Your chat & messaging permissions have been restricted by the Safety Desk.", "error");
      return;
    }

    const textVal = input;
    
    // Instantly append to local messages state for premium speed experience
    const localMsg = {
      id: `local-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      text: textVal,
      uid: profile.uid,
      displayName: profile.displayName,
      photoURL: profile.photoURL || '',
      svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
      level: profile.level || 1,
      type: 'chat',
      timestamp: Date.now(),
      fanClubLevel: fanClubMember ? fanClubMember.level : null,
      fanClubHostName: fanClubMember ? (hostProfile?.displayName || 'Anchor') : null
    };
    setLocalSentMessages(prev => [...prev, localMsg]);
    setInput('');
    setShowChatInput(false);

    try {
      if (isSimulatedRoom) return;
      await addDoc(collection(db, `rooms/${roomId}/messages`), { 
        text: textVal, 
        uid: profile.uid, 
        displayName: profile.displayName, 
        photoURL: profile.photoURL || '', 
        svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
        level: profile.level || 1, 
        type: 'chat', 
        timestamp: serverTimestamp(),
        fanClubLevel: fanClubMember ? fanClubMember.level : null,
        fanClubHostName: fanClubMember ? (hostProfile?.displayName || 'Anchor') : null
      });
    } catch (error) { console.error('Send message error', error); }
  };

  const sendLike = async () => {
    if (!profile || !roomId) return;
    handleTapLike();
    likeParticlesRef.current?.triggerLike();
    if (isSimulatedRoom) return;
    try {
      const now = Date.now();
      if (now - lastLikeMessageSentTimeRef.current > 3500) {
        lastLikeMessageSentTimeRef.current = now;
        await addDoc(collection(db, `rooms/${roomId}/messages`), { 
          type: 'like', 
          uid: profile.uid, 
          displayName: profile.displayName, 
          photoURL: profile.photoURL, 
          svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
          timestamp: serverTimestamp() 
        });
      }

      // Automated thanks from anchor for liking, only once per room session matching screenshot logic
      if (hostProfile && profile.uid !== room?.hostUid) {
        const sessionKey = `thanked_like_${roomId}`;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, 'true');
          setTimeout(async () => {
            try {
              await addDoc(collection(db, `rooms/${roomId}/messages`), {
                type: 'welcome',
                uid: hostProfile.uid,
                displayName: hostProfile.displayName,
                photoURL: hostProfile.photoURL || '',
                svipTier: hostProfile.svipStatus?.status === 'active' ? hostProfile.svipStatus.tier : null,
                hostName: hostProfile.displayName || 'Anchor',
                hostLevel: hostProfile.level || 1,
                text: `@${profile.displayName} Thanks for liking! Drop a comment too?`,
                timestamp: serverTimestamp()
              });
            } catch (err) { console.error('Error sending auto thank you msg', err); }
          }, 1000);
        }
      }
    } catch (error) { console.error('Send like error', error); }
  };

  const handleToolAction = (action: string) => {
    switch (action) {
      case 'Share':
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard! 🔗', 'success');
        break;
      case 'Clean Mode': setIsCleanMode(!isCleanMode); break;
      case 'Minimize': setIsMinimized(!isMinimized); break;
      case 'Quality': setQuality(prev => prev === 'HD' ? 'SD' : 'HD'); break;
      case 'Watching Optimization': setIsLowLatency(!isLowLatency); break;
      case 'Mini-Games': setShowGames(true); break;
      case 'Simulate Noble':
        const nobleTiers: any[] = ['Baron', 'Duke', 'Grand Duke', 'Archduke', 'King', 'Emperor', 'Global God'];
        const randomTier = nobleTiers[Math.floor(Math.random() * nobleTiers.length)];
        setNobleEntranceUser({
          displayName: 'Simulated Noble',
          tier: randomTier,
          photoURL: 'https://i.pravatar.cc/150?u=noble'
        });
        break;
    }
  };

  if (!room) return <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic uppercase tracking-widest">Loading Room...</div>;

  const needsPasscode = room.isPrivate && room.accessType === 'private' && !isHost;
  const needsFamilyCheck = room.isPrivate && room.accessType === 'family' && !isHost;
  const isFamilyMember = !!(profile && room.familyId && profile.familyId === room.familyId);

  // Passcode Lock screen overlay
  if (needsPasscode && !isPasscodeUnlocked) {
    const handleNumberClick = (num: string) => {
      setPasscodeError(false);
      if (enteredPasscode.length < 4) {
        const next = enteredPasscode + num;
        setEnteredPasscode(next);
        
        // Auto-check on 4th digit
        if (next === (room.passcode || '1234')) {
          setTimeout(() => {
            setIsPasscodeUnlocked(true);
            showToast("Meeting Space Unlocked! 🔓", "success");
          }, 300);
        } else if (next.length === 4) {
          setTimeout(() => {
            setPasscodeError(true);
            setEnteredPasscode('');
            showToast("Invalid Passcode. Try again!", "error");
          }, 400);
        }
      }
    };

    const handleBackspace = () => {
      setEnteredPasscode(prev => prev.slice(0, -1));
    };

    return (
      <div className="h-screen w-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4 font-sans select-none relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-505/10 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-8">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Lock size={28} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-neutral-100">
                Gated Meeting Space
              </h2>
              <p className="text-xs text-neutral-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
                This stream is private. Please enter the 4-digit passcode provided by the host to connect.
              </p>
              <div className="mt-2 text-[10px] font-mono text-zinc-500 select-all font-semibold uppercase tracking-wider">
                Hint for testers: <span className="text-purple-400 font-bold">{room.passcode || '1234'}</span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const active = enteredPasscode.length > idx;
              return (
                <div
                  key={idx}
                  className={cn(
                    "w-4 h-4 rounded-full transition-all duration-200 border",
                    passcodeError 
                      ? "bg-red-500/30 border-red-500 animate-bounce"
                      : active 
                        ? "bg-purple-500 border-purple-400 scale-110 shadow-lg shadow-purple-500/40" 
                        : "bg-white/5 border-white/10"
                  )}
                />
              );
            })}
          </div>

          {/* Dialpad Matrix */}
          <div className="grid grid-cols-3 gap-4 w-full px-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-lg font-black tracking-tight transition-all flex items-center justify-center mx-auto"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleExitStream}
              className="w-14 h-14 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 active:scale-95 text-[9px] font-black uppercase tracking-wider leading-none transition-all flex items-center justify-center mx-auto"
            >
              Exit
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-lg font-black tracking-tight transition-all flex items-center justify-center mx-auto"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 active:scale-95 border border-white/5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center mx-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Agency Exclusive restrictions screen overlay
  if (needsFamilyCheck && !isFamilyMember && !isPasscodeUnlocked) {
    const handleJoinAgencyBypass = () => {
      setIsPasscodeUnlocked(true);
      showToast("Access Granted: Authorized Agency testing bypass active! 🛡️", "success");
    };

    return (
      <div className="h-screen w-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4 font-sans select-none relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-6">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 text-center">
              <Users size={28} className="mx-auto" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-neutral-100">
                Agency / Family Exclusive
              </h2>
              <p className="text-xs text-neutral-400 max-w-[280px] mx-auto mt-2 leading-relaxed">
                This meeting space is restricted. Only verified members of the premium agency <span className="text-rose-400 font-extrabold">"{room.familyName || 'Agency Elite'}"</span> are permitted to enter.
              </p>
            </div>
          </div>

          <div className="space-y-3 w-full px-6">
            <button
              onClick={handleJoinAgencyBypass}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span>Authorized Agency Bypass (Demo)</span>
            </button>
            <button
              onClick={handleExitStream}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-neutral-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center"
            >
              Exit to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (room?.type === 'audio-live') {
    return (
      <SpacesAudioRoom 
        room={room}
        profile={profile}
        hostProfile={hostProfile}
        visibleMessages={[]}
        onSendMessage={() => {}}
        onExit={handleExitStream}
        showToast={showToast}
        onShowProfile={(uid) => {
          showUserProfile(uid);
        }}
      />
    );
  }

  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet' || window.innerWidth < 768;

  return (
    <div 
      className={cn("h-screen w-screen bg-black overflow-hidden relative flex flex-col font-sans select-none", isShaking && "animate-shake")}
    >
      <SEOHeaders 
        title={`${room?.title || 'Live Room'} - Bingo Live`}
        description={`Watch ${hostProfile?.displayName || 'Host'} live on Bingo Live! Join the fun with gifts, polls, and more.`}
        keywords={`live streaming, ${hostProfile?.displayName || 'streamer'}, bingo live, gifting, USA, UK, Europe`}
        isLive={room?.status === 'live'}
      />

      {/* Top 17% Black Safety Zone to clear Mobile Browser Chrome & Headers */}
      {isMobileOrTablet && !isStandalonePWA && (
        <div className="h-[17dvh] w-full bg-black flex-shrink-0 z-[40] pointer-events-none relative flex flex-col items-center justify-end pb-1 border-b border-white/[0.04]">
          <div className="text-[8.5px] font-black tracking-[0.25em] text-cyan-400 select-none opacity-45 uppercase font-mono animate-pulse">
            ★ Live Browser Safe-Viewport ★
          </div>
        </div>
      )}

      {/* Main Stream App Feed Container taking the remaining 83% of viewport height (or full in standalone PWA mode) */}
      <div 
        className={cn(
          "w-full relative overflow-hidden flex-1 flex flex-col bg-[#070b19]",
          (isMobileOrTablet && !isStandalonePWA) ? "h-[83dvh]" : "h-full"
        )}
        onPointerDown={(e) => {
          const targetEl = e.target as HTMLElement;
          const isInteractive = targetEl.closest('button, input, textarea, a, svg, [role="button"], .pointer-events-auto');
          
          if (!isInteractive) {
            const rect = e.currentTarget.getBoundingClientRect();
            const tapX = e.clientX - rect.left;
            const tapY = e.clientY - rect.top;

            handleTapLike();
            likeParticlesRef.current?.triggerLike(tapX, tapY);

            // Dynamically synchronize the event with Firebase Firestore
            // We rate limit the likes message writes to once per 3.5 seconds to prevent browser & chat freezes completely!
            if (profile && roomId && !isSimulatedRoom) {
              const now = Date.now();
              if (now - lastLikeMessageSentTimeRef.current > 3500) {
                lastLikeMessageSentTimeRef.current = now;
                addDoc(collection(db, `rooms/${roomId}/messages`), { 
                  type: 'like', 
                  uid: profile.uid, 
                  displayName: profile.displayName, 
                  photoURL: profile.photoURL, 
                  svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
                  timestamp: serverTimestamp() 
                }).catch(err => console.error('Full screen like send failed', err));
              }
            }
          }
        }}
      >
        <div className={cn(
          "absolute inset-0 z-0 transition-all duration-300",
          room?.type === 'multi-guest-live' 
            ? "bg-gradient-to-b from-[#1c121e] via-[#4d2a45] via-[#8c4852] to-[#dc7f65]" 
            : "bg-[#070b19]",
          room?.pkStatus === 'battling' && "top-[120px] bottom-[260px] rounded-3xl overflow-hidden shadow-2xl"
        )}>
        {room?.type === 'multi-guest-live' ? (
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1c121e] via-[#5c2d4c] via-[#a34150] to-[#df7255] opacity-95" />
            <svg className="absolute bottom-[200px] left-0 w-full opacity-[0.22] mix-blend-screen" viewBox="0 0 1440 320" fill="currentColor">
              <path fill="#ffffbc" d="M0,192L48,197.3C96,203,192,213,288,224C384,235,480,245,576,234.7C672,224,768,192,864,186.7C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-t from-orange-400 to-amber-200 blur-2xl opacity-15 pointer-events-none" />
          </div>
        ) : (
          <VideoStream 
            isHost={isHost} 
            roomId={room.id} 
            hostUid={room.hostUid}
            pkStatus={room.pkStatus}
            opponentUid={room.pkOpponentUid}
            isVirtual={room.type === 'virtual-live'}
            type={room.type}
          />
        )}
        {room.pkStatus === 'battling' && (
          <div className="absolute top-[120px] bottom-[260px] left-0 right-0 flex z-10 pointer-events-auto">
            {/* Left side streamer touch segment */}
            <div 
              onClick={() => room.hostUid && showUserProfile(room.hostUid)}
              className="flex-1 h-full cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors rounded-l-2xl"
              title="View Broadcaster Profile"
            />
            {/* Right side streamer touch segment */}
            <div 
              onClick={() => {
                const oppUid = room.pkOpponentUid || 'opponent_live';
                showOpponentUserProfile(oppUid);
              }}
              className="flex-1 h-full cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors rounded-r-2xl"
              title="View Opponent Profile"
            />
          </div>
        )}
        {/* Removed TreasureChestDisplay component as requested by game guidelines */}
        {/*
        {room && !isCleanMode && (
          <TreasureChestDisplay 
            roomId={room.id} 
            isHost={isHost} 
            userProfile={profile}
          />
        )}
        */}
      </div>

      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* HEADER SECTION - EXACT REPLICATION */}
        {!isCleanMode && (
          <div className={cn(
            "flex flex-col pointer-events-none px-4 relative",
            isMobileOrTablet ? "pt-2" : "pt-[calc(env(safe-area-inset-top,0px)+54px)] md:pt-4"
          )}>
            <div className="flex items-start justify-between pointer-events-auto">
              {/* Left Group: Host Info & Secondary Pills */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center">
                  <HostProfileBadge 
                    ref={hostProfileBadgeRef}
                    hostProfile={hostProfile}
                    activePrivateCall={activePrivateCall}
                    showUserProfile={showUserProfile}
                    likeParticlesRef={likeParticlesRef}
                    targetCoords={targetCoords}
                    elementRef={hostAvatarRef}
                  />
                  <button 
                    onClick={() => setShowFanClubDrawer(true)}
                    className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 ml-0.5 border border-pink-500/30 cursor-pointer active:scale-90 transition-transform"
                    title="Open Fan Club"
                  >
                    <Star size={12} fill={fanClubMember ? "currentColor" : "none"} />
                  </button>
                  {profile?.uid !== room.hostUid && (
                    <button 
                      onClick={toggleFollow}
                      className={cn(
                        "flex items-center justify-center ml-1.5 transition-all duration-500 ease-out relative select-none shrink-0 cursor-pointer",
                        justFollowed 
                          ? "w-7 h-7 rounded-full bg-green-500 scale-110 shadow-[0_0_15px_rgba(34,197,94,0.85)]" 
                          : isFollowing 
                            ? "w-[51px] h-[41px]" 
                            : "w-7 h-7 rounded-full bg-cyan-400 hover:bg-cyan-500 active:scale-90 shadow-sm"
                      )}
                      title={isFollowing ? "Followed" : "Follow"}
                    >
                      {justFollowed ? (
                        <Check size={14} strokeWidth={4} className="scale-110 text-white animate-in zoom-in spin-in-12 duration-200" />
                      ) : isFollowing ? (
                        <motion.img 
                          src={followedHeartWingsImg} 
                          alt="Followed" 
                          className="w-[51px] h-[41px] object-contain drop-shadow-[0_1.5px_4px_rgba(244,63,94,0.35)] animate-in zoom-in-50 duration-300"
                          initial={{ scale: 0.2, rotate: -15 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 15 }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Plus size={14} strokeWidth={4} className="text-white" />
                      )}
                    </button>
                  )}
                </div>

                 <div className="flex items-center gap-[4px] sm:gap-1.5 select-none font-sans mt-0.5">
                   {hostProfile?.regionRank && hostProfile.regionRank <= 100 ? (
                    <RegionListWidget onClick={() => setShowRegionList(true)} rank={hostProfile.regionRank} />
                  ) : null}
                   <StarGoalWidget 
                     popularity={(room as any)?.popularity !== undefined ? (room as any).popularity : 4623} 
                     onStarClick={() => setShowStarGoalDetail(true)} 
                   />
                 </div>
              </div>

              {/* Right Group: Viewers & Close */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center -space-x-2 mr-0.5 scale-90 origin-right">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full border border-white/20 overflow-hidden">
                      <img src="https://i.pravatar.cc/100?u=v1" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full px-1 py-0 text-[6px] font-bold text-white border border-black/20">26</div>
                  </div>
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full border-2 border-yellow-400/50 overflow-hidden">
                      <img src="https://i.pravatar.cc/100?u=v2" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded-full pointer-events-none" />
                  </div>
                </div>
                
                <div className="bg-black/20 backdrop-blur-md rounded-full px-2 py-1 border border-white/5 scale-90 origin-right">
                  <span className="text-white text-[11px] font-medium opacity-80">{fluctuatedViewerCount}</span>
                </div>
                
                <button onClick={handleExitStream} className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all scale-90 origin-right">
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ID string at bottom right of header */}
            <div className="absolute right-4 top-[40px] opacity-40">
              <span className="text-white text-[11px] font-medium tracking-wide">ID:{room.id.substring(0, 5)}_Bomiz</span>
            </div>
          </div>
        )}

        {/* POLISHED IMMERSIVE MULTI-GUEST GRID UNDER HEADER */}
        {!isCleanMode && room && room.type === 'multi-guest-live' && (
          <div className="w-full px-3.5 pt-1 pb-1 flex-shrink-0 z-20 pointer-events-auto select-none sm:max-w-md sm:mx-auto">
            <MultiGuestGrid 
              room={room}
              seats={seats}
              isHost={isHost}
              onShowProfile={showUserProfile}
              onJoinMicRequest={handleJoinMicRequest}
              hostProfile={hostProfile}
            />
          </div>
        )}

        {/* PK BATTLE OVERLAY */}
        {room.pkStatus === 'battling' && (
          <>
            <PKBattle room={room} />
            <PKShieldOverlay 
              activeShield={room.pkShieldTier ? PK_SHIELDS[room.pkShieldTier] : null}
              absorbedPoints={room.pkShieldAbsorbed || 0}
              timeLeft={room.pkShieldEndTime ? Math.max(0, Math.floor((new Date(room.pkShieldEndTime).getTime() - Date.now()) / 1000)) : 0}
              isHost={true}
            />
            <PKShieldOverlay 
              activeShield={room.pkOpponentShieldTier ? PK_SHIELDS[room.pkOpponentShieldTier] : null}
              absorbedPoints={room.pkOpponentShieldAbsorbed || 0}
              timeLeft={room.pkOpponentShieldEndTime ? Math.max(0, Math.floor((new Date(room.pkOpponentShieldEndTime).getTime() - Date.now()) / 1000)) : 0}
              isHost={false}
            />
          </>
        )}

        {/* Youtube Player Overlay */}
        <AnimatePresence>
          {room.youtubeVideoId && (
            <YoutubePlayer 
              videoId={room.youtubeVideoId} 
              isHost={isHost}
              onClose={async () => {
                const roomRef = doc(db, 'rooms', room.id);
                await updateDoc(roomRef, { youtubeVideoId: null });
              }}
            />
          )}
        </AnimatePresence>

        {/* Music Player Overlay */}
        <AnimatePresence>
          {room.currentSong && (
            <MusicPlayer 
              song={room.currentSong}
              isHost={isHost}
              onClose={async () => {
                const roomRef = doc(db, 'rooms', room.id);
                await updateDoc(roomRef, { currentSong: null });
              }}
            />
          )}
        </AnimatePresence>

        {/* Singing Mode Indicator */}
        <AnimatePresence>
          {room.isSingingMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-24 right-4 z-30"
            >
              <div className="bg-pink-500 text-white p-2 rounded-full shadow-lg shadow-pink-500/40 animate-bounce">
                <Mic size={20} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MIC QUEUE REQUEST MANAGER (TUCKED AND NON-DUPLICATIVE) */}
        {!isCleanMode && room.type === 'multi-guest-live' && isHost && (
          <div className="absolute right-3 top-[250px] z-30 pointer-events-auto flex flex-col items-end gap-2">
            <MicQueue 
              isHost={isHost}
              seats={seats}
              micQueue={micQueue}
              onJoinRequest={handleJoinMicRequest}
              onAssignSeat={handleAssignSeat}
              onRemoveGuest={handleRemoveGuest}
              onToggleMute={handleToggleMute}
              onToggleLock={handleToggleLock}
            />
          </div>
        )}

        {/* EXPLICIT HIGHER PLACED PRIVATE CALL MANAGER */}
        {!isCleanMode && room && (
          <div className="absolute right-4 top-[215px] z-[100] pointer-events-auto">
            <PrivateCallManager 
              roomId={roomId || ''} 
              hostUid={room.hostUid} 
              isHost={isHost}
              userProfile={profile}
              hostProfile={hostProfile}
            />
          </div>
        )}

        {/* OTHER SIDELINE TOOLS */}
        {!isCleanMode && room && (
          <div className="absolute right-4 top-[565px] z-50 pointer-events-auto flex flex-col gap-4 items-end">
            {room && room.type === 'multi-guest-live' && isHost && (
              <SeatRequestManager
                roomId={room.id}
                isHost={true}
                onRequestsChange={setSeatRequestCount}
              />
            )}
            <PollSystem 
              roomId={room.id} 
              isHost={isHost} 
            />
            <ChaosEvents roomId={room.id} />
            <EasterEggDrops roomId={room.id} />
            <FeatureAutoManager roomId={room.id} isHost={isHost} />

            {/* Prediction System */}
            <PredictionSystem 
              roomId={roomId || ''} 
              isHost={isHost} 
              userProfile={profile} 
            />
          </div>
        )}

        {/* AI Assistant (Only for Host) */}
        {isHost && (
          <AILiveAssistant 
            stats={streamStats} 
            room={room}
            messages={messages}
            onAction={(action) => {
              if (action === 'pk') showToast("Starting PK... ⚔️", 'info');
              if (action === 'share') showToast("Sharing stream... 🔗", 'info');
            }} 
          />
        )}

        {/* Live Interactive Ads Portal (For viewers/hosts) - Restored banner as requested */}
        <LiveAdPlayer 
          roomId={room.id}
          hostUid={room.hostUid}
          isHost={isHost}
        />

        {/* Co-Stream Guest Join List & Picture-in-Picture display */}
        <CoStreamManager 
          roomId={room.id}
          hostUid={room.hostUid}
          isHost={isHost}
        />

        {/* Mini-Games */}
        <MiniGameCenter 
          isOpen={showGames}
          onToggle={() => setShowGames(!showGames)}
          roomId={room.id}
          profile={profile}
          onStartGame={(game) => {
            showToast(`Starting ${game.name}... ${game.icon}`, 'success');
            // Simulate starting a game
            const newGame: ActiveGame = {
              id: 'game-' + Math.random().toString(36).substr(2, 9),
              type: 'TapBattle',
              status: 'active',
              startTime: Date.now(),
              endTime: Date.now() + 30000,
              participants: [profile?.uid || ''],
              scores: { [profile?.uid || '']: 0 },
              config: {}
            };
            setActiveGame(newGame);
            
            // Auto-finish game after 30s
            setTimeout(() => {
              setActiveGame(prev => prev ? { ...prev, status: 'finished' } : null);
              setTimeout(() => setActiveGame(null), 5000);
            }, 30000);
          }} 
        />

        {activeGame && (
          <MiniGameOverlay 
            game={activeGame} 
            currentUserUid={profile?.uid || ''} 
            onTap={() => {
              if (profile?.uid) {
                setActiveGame(prev => {
                  if (!prev || prev.status !== 'active') return prev;
                  const newScores = { ...prev.scores };
                  newScores[profile.uid] = (newScores[profile.uid] || 0) + 1;
                  return { ...prev, scores: newScores };
                });
              }
            }}
          />
        )}

        {/* CHAT & ACTION SECTION */}
        <div className="mt-auto pl-0 pr-4 py-4 pb-1 flex flex-col gap-2 pointer-events-none relative z-20">
          {!isCleanMode && (
            <>
              <div className="flex flex-col gap-2 items-start relative">
                {/* Gift Combo Overlay - Positioned above chat */}
                <div className="absolute bottom-full left-0 mb-2 z-[200] flex flex-col-reverse gap-1.5 pointer-events-none">
                  <AnimatePresence mode="popLayout">
                    {activeGifts.map((gift, idx) => (
                      <GiftCombo 
                        key={`${gift.id || 'gift'}-${idx}`}
                        giftName={gift.giftName}
                        giftImage={gift.giftImage}
                        displayName={gift.displayName}
                        userPhoto={gift.userPhoto}
                        combo={gift.combo}
                        nobleTier={gift.nobleTier}
                        familyName={gift.familyName}
                        onComplete={() => {
                          setActiveGifts(prev => {
                            const filtered = prev.filter(g => g.id !== gift.id);
                            // If we have space and something in queue, pull it in
                            setGiftQueue(queue => {
                              if (queue.length > 0 && filtered.length < 2) {
                                const [next, ...rest] = queue;
                                setActiveGifts([...filtered, next]);
                                return rest;
                              }
                              return queue;
                            });
                            return filtered;
                          });
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* New Messages Indicator */}
                <AnimatePresence>
                  {hasNewMessages && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={scrollToBottom}
                      className="absolute -top-10 left-4 bg-cyan-400 text-black px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-30 pointer-events-auto active:scale-95 transition-transform"
                    >
                      New Messages <ChevronDown size={14} className="animate-bounce" />
                    </motion.button>
                  )}
                </AnimatePresence>
                
                {/* Chat Messages */}
                <div 
                  ref={chatRef} 
                  onScroll={handleChatScroll} 
                  className="w-[60%] sm:w-[50%] max-w-[480px] pl-4 max-h-[40vh] overflow-y-auto scrollbar-hide flex flex-col gap-1.5 pointer-events-auto scroll-smooth"
                >
                  <div className="flex flex-col gap-2 min-h-full">
                    <div className="flex-1" />
                    
                    {room?.type === 'multi-guest-live' && (
                      <>
                        {/* Yellow VIP Promotion Banner Cloned from Screenshot */}
                        <div className="w-full bg-gradient-to-r from-[#ffe17d] via-[#ffcc33] to-[#ffa502] p-2 rounded-2xl flex items-center justify-between text-[#121214] border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.25)] mb-1 select-none pointer-events-auto">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-[10px] bg-zinc-950 text-[#ffcc33] px-1.5 py-0.5 rounded-md font-black italic scale-90 shrink-0">VIP</span>
                            <span className="text-[8.5px] font-black tracking-wide text-zinc-950 uppercase truncate">
                              Subscribe to BIGO VIP and enjoy exclusive privileges
                            </span>
                          </div>
                          <button 
                            onClick={() => showToast("Opening BIGO VIP Portal! 👑✨", "success")} 
                            className="px-2.5 py-1 bg-zinc-950 font-black text-[8px] rounded-full text-white tracking-widest uppercase hover:bg-zinc-900 active:scale-95 transition-all shrink-0 ml-1"
                          >
                            Open
                          </button>
                        </div>

                        {/* Savage Mode Pinned Streamer Intro Banner Cloned from Screenshot */}
                        <div className="bg-[#12121ec0] backdrop-blur-md border border-white/10 p-3 rounded-2xl w-full text-left select-none shadow-[0_4px_15px_rgba(0,0,0,0.3)] flex flex-col gap-1 pointer-events-auto">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full border border-pink-400 overflow-hidden shrink-0">
                              <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/100?u=host'} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-pink-400 text-[10px] font-extrabold truncate">{hostProfile?.displayName || 'Staxx 💋'}</span>
                            <span className="text-amber-400 text-[8px] font-medium scale-90 origin-left flex items-center shrink-0">5/6 👑</span>
                            <span className="text-[7.5px] bg-[#3b5998]/40 text-blue-300 border border-blue-400/20 px-1 rounded scale-90 select-none flex items-center gap-0.5 uppercase tracking-tighter">
                              📍 Baltimore
                            </span>
                          </div>
                          <p className="text-white/90 text-[10.5px] font-bold leading-relaxed">
                            # 🏠 Savage Mode ⚔️ 🪙 Baltimore, United States
                          </p>
                          <p className="text-white text-[11px] leading-relaxed font-bold border-l-2 border-pink-500 pl-2 mt-0.5">
                            Tequila Tewsday 🥂🔥! Welcome everyone. Let\'s make this live session unforgettable!
                          </p>
                        </div>
                      </>
                    )}

                    {visibleMessages.map((msg, idx) => (
                      <ChatMessage 
                        key={`${msg.id || 'msg'}-${idx}`} 
                        message={{
                          ...msg,
                          type: (msg.type === 'follow-contribution' || msg.type === 'follow-join-fan-club')
                            ? msg.type
                            : (msg.type === 'welcome' || msg.uid === room?.hostUid) ? 'welcome' : msg.type,
                          hostName: msg.hostName || msg.displayName || 'Anchor',
                          hostLevel: msg.hostLevel || msg.level || 1,
                          onFollow: toggleFollow,
                          isFollowing: isFollowing,
                          onLike: sendLike,
                          onJoinGuest: () => showToast("Guest Live request sent! 🎥", 'info'),
                          onClick: () => {
                            if (msg.type === 'follow-join-fan-club') {
                              setShowFanClubDrawer(true);
                              return;
                            }
                            if (msg.type === 'system') return;
                            if (msg.uid || msg.userId) {
                              showUserProfile(msg.uid || msg.userId);
                            } else {
                              const mockProfile: UserProfile = {
                                uid: msg.displayName ? `mock_${msg.displayName}` : 'mock_user_123',
                                displayName: msg.displayName || 'Bingo Live Fan',
                                photoURL: msg.photoURL || `https://i.pravatar.cc/150?u=${msg.displayName || 'star'}`,
                                level: msg.level || 13,
                                nobleTitle: (msg.nobleTier as any) || 'None',
                                familyName: msg.familyName || undefined,
                                familyLevel: msg.familyLevel || undefined,
                                fans: Math.floor(Math.random() * 400) + 120,
                                following: Math.floor(Math.random() * 180) + 30,
                                totalBeansEarned: Math.floor(Math.random() * 5000) + 200,
                                diamonds: 0,
                                beans: Math.floor(Math.random() * 5000) + 200,
                                coins: 0,
                                points: 0,
                                role: 'user',
                                friends: 20,
                                referralCode: '',
                                totalDiamondsSpent: 0
                              };
                              setSelectedInRoomUser(mockProfile);
                            }
                          },
                          onTextClick: (name: string) => {
                            if (msg.type === 'system') return;
                            setInput(`@${name} `);
                            setShowChatInput(true);
                          }
                        }} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Replies cleaned from main live room area */}

              {/* Bottom Interaction Bar */}
              <div className="flex items-center justify-between pointer-events-auto pb-0 w-full pl-4">
                {room?.type === 'multi-guest-live' ? (
                  /* PERFECT CLONE OF THE BIGO TOOLBAR FROM SCREENSHOT */
                  <div className="flex items-center justify-between w-full gap-2.5">
                    {/* Left Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowChatInput(true)} 
                        className="relative w-10 h-10 bg-black/65 border border-white/10 rounded-full flex items-center justify-center text-white/90 active:scale-95 transition-all shadow-md group"
                      >
                        <MessageSquare size={16} />
                        {/* Dynamic Notification badge */}
                        <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white font-black text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-zinc-900 leading-none">
                          1
                        </span>
                      </button>

                      {/* Menu Drawer */}
                      <button 
                        onClick={() => setShowTools(true)} 
                        className="w-10 h-10 bg-black/65 border border-white/10 rounded-full flex items-center justify-center text-white/90 active:scale-95 transition-all shadow-md"
                      >
                        <Menu size={16} />
                      </button>
                    </div>

                    {/* Right Gifting Actions */}
                    <div className="flex items-center gap-2">
                      {/* Full Gifting Present Box Button */}
                      <button 
                        onClick={() => setShowGifts(true)} 
                        className="w-12 h-12 bg-gradient-to-tr from-[#ff3366] to-[#ff9933] border-2 border-white/30 rounded-full flex items-center justify-center text-white active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,51,102,0.4)]"
                      >
                        <GiftIcon size={18} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowChatInput(true)} className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => setShowTools(true)} className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                        <Menu size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowGifts(true)} className="w-11 h-11 bg-gradient-to-br from-[#ff0099] to-[#ff6600] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform">
                        <GiftIcon size={22} fill="currentColor" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODALS & OVERLAYS */}
      <AnimatePresence>
        {showChatInput && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChatInput(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white rounded-t-[2.5rem] p-4 pb-10 shadow-2xl">
              {/* Stickers Row inside Chat Input */}
              <div className="flex items-center justify-around py-4 border-b border-slate-100 mb-4">
                {['🤡', '😍', '😂', '🌹', '🔥', '😡', '😱'].map((sticker, idx) => (
                  <button
                    key={sticker}
                    onClick={() => {
                      if (profile) {
                        const stickerText = input.trim() ? `${input.trim()} ${sticker}` : sticker;
                        const localMsg = {
                          id: `local-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
                          text: stickerText,
                          uid: profile.uid,
                          displayName: profile.displayName,
                          photoURL: profile.photoURL || '',
                          svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
                          level: profile.level || 1,
                          type: 'chat',
                          timestamp: Date.now()
                        };
                        setLocalSentMessages(prev => [...prev, localMsg]);
                        
                        addDoc(collection(db, `rooms/${roomId}/messages`), { 
                          text: stickerText, 
                          uid: profile.uid, 
                          displayName: profile.displayName, 
                          photoURL: profile.photoURL || '', 
                          svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
                          level: profile.level || 1, 
                          type: 'chat', 
                          timestamp: serverTimestamp() 
                        });
                      }
                      setInput('');
                      setShowChatInput(false);
                    }}
                    className="text-2xl hover:scale-125 active:scale-90 transition-transform"
                  >
                    <img 
                      src={`https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/${
                        ['Clown Face', 'Smiling Face with Heart-Eyes', 'Face with Tears of Joy', 'Rose', 'Fire', 'Enraged Face', 'Face Screaming in Fear'][idx]
                      }.png`} 
                      alt={sticker}
                      className="w-10 h-10 object-contain"
                    />
                  </button>
                ))}
              </div>

              {/* Quick Replies inside Message Section */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2.5 mb-3.5 px-1 border-t border-slate-100">
                {['Hi 👋', '😘😘😘', 'So gorgeous!', 'Good vibes'].map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => {
                      setInput(reply);
                    }}
                    className="whitespace-nowrap px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-800 dark:text-slate-100 text-xs font-bold active:scale-95 transition-all outline-none border border-slate-200/50 cursor-pointer shadow-xs"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex items-center gap-3 bg-slate-100 rounded-full px-4 py-2">
                <input 
                  autoFocus 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Chat with everyone" 
                  className="flex-1 bg-transparent py-2 text-slate-900 focus:outline-none text-[15px]" 
                />
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Smile size={24} />
                </button>
                <button type="submit" className="text-slate-400 hover:text-blue-500 transition-colors active:scale-90">
                  <SendHorizontal size={24} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
        {showTools && <RoomToolsModal onClose={() => setShowTools(false)} isHost={isHost} onAction={handleToolAction} currentQuality={quality} isCleanMode={isCleanMode} isRecording={isRecording} isLowLatency={isLowLatency} />}
        {showGifts && <GiftingModal room={room} seats={seats} onClose={() => setShowGifts(false)} onGiftSent={handleLocalGift} />}
        {showFanClubDrawer && room && hostProfile && profile && (
          <RoomFanClubDrawer 
            isOpen={showFanClubDrawer} 
            onClose={() => setShowFanClubDrawer(false)}
            hostUid={room.hostUid}
            hostName={hostProfile.displayName || 'Anchor'}
            senderUid={profile.uid}
            senderProfile={profile}
            fanClubMember={fanClubMember}
          />
        )}
      </AnimatePresence>

      <LikeParticles 
        ref={likeParticlesRef} 
        targetX={targetCoords.x}
        targetY={targetCoords.y}
        onArrival={handleHeartArrival}
      />
      
      <NobleEntrance 
        user={nobleEntranceUser} 
        onComplete={() => setNobleEntranceUser(null)} 
      />

      {room && <EasterEggDrops roomId={room.id} />}

      {activeAnimation && (
        <GiftAnimation 
          giftName={activeAnimation.giftName} 
          displayName={activeAnimation.displayName} 
          animationType={activeAnimation.animationType} 
          nobleTier={activeAnimation.nobleTier}
          familyName={activeAnimation.familyName}
          animationUrl={activeAnimation.animationUrl}
          giftType={activeAnimation.giftType}
          cost={activeAnimation.cost}
        />
      )}

      {recentExplosion && (
        <GiftExplosionFX
          key={recentExplosion.id}
          giftName={recentExplosion.giftName}
          senderName={recentExplosion.senderName}
          comboCount={recentExplosion.comboCount}
          cost={recentExplosion.cost}
          triggerShake={triggerShake}
        />
      )}

      <FanClubWelcome 
        userName={fanClubWelcomeUser?.displayName || ''} 
        level={fanClubWelcomeUser?.level || 1} 
        isSuperFan={fanClubWelcomeUser?.isSuperFan || false} 
        onComplete={() => setFanClubWelcomeUser(null)} 
      />
      {/* User discovery popup */}
      <UserDiscoveryPopup 
        user={selectedInRoomUser} 
        onClose={() => setSelectedInRoomUser(null)} 
        isHost={isHost}
        onJoinRoom={(roomId) => {
          setSelectedInRoomUser(null);
          navigate(`/room/${roomId}`);
        }}
        onOpenGifts={() => {
          setSelectedInRoomUser(null);
          setShowGifts(true);
        }}
        onOpenChat={(displayName) => {
          setSelectedInRoomUser(null);
          if (displayName) {
            setInput(`@${displayName} `);
            setShowChatInput(true);
          } else {
            setShowChatInput(true);
          }
        }}
        onFollowToggle={async () => {
          if (!profile || !selectedInRoomUser) return;
          const isViewingHost = selectedInRoomUser.uid === room?.hostUid;
          if (isViewingHost) {
            await toggleFollow();
          } else {
            if (isSimulatedRoom) {
              showToast(`Following ${selectedInRoomUser.displayName}! 💖`, 'success');
              return;
            }
            const followId = `${profile.uid}_${selectedInRoomUser.uid}`;
            const followRef = doc(db, 'follows', followId);
            try {
              const fSnap = await getDoc(followRef);
              if (fSnap.exists()) {
                await deleteDoc(followRef);
                showToast(`Unfollowed ${selectedInRoomUser.displayName}! 😔`, 'info');
              } else {
                await setDoc(followRef, {
                  followerId: profile.uid,
                  followingId: selectedInRoomUser.uid,
                  timestamp: new Date().toISOString()
                });
                showToast(`Following ${selectedInRoomUser.displayName}! 💖`, 'success');
              }
            } catch (err) {
              console.error(err);
            }
          }
        }}
        isCurrentlyFollowing={selectedInRoomUser?.uid === room?.hostUid ? isFollowing : undefined}
      />

      {/* Region List rankings overlay */}
      <RegionListModal 
        isOpen={showRegionList}
        onClose={() => setShowRegionList(false)}
        hostProfile={hostProfile}
        roomBeans={room?.currentBeans !== undefined ? room.currentBeans : 174}
      />

      {/* Star Goal details breakdown overlay */}
      <StarGoalModal 
        isOpen={showStarGoalDetail}
        onClose={() => setShowStarGoalDetail(false)}
        roomBeans={room?.currentBeans !== undefined ? room.currentBeans : 174}
        hostProfile={hostProfile}
        onHelpHost={() => {
          setShowStarGoalDetail(false);
          setShowGifts(true);
        }}
      />

      {/* FLOAT SLIDE-IN FOLLOW CONTRIBUTION BANNER */}
      <AnimatePresence>
        {followBanner && (
          <motion.div
            key={followBanner.id}
            initial={{ opacity: 0, x: 180, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="absolute right-4 top-[175px] z-[150] min-w-[200px] max-w-[260px] bg-black/45 backdrop-blur-md rounded-full py-1 pl-1 pr-4 flex items-center justify-between shadow-[0_4px_15px_rgba(0,0,0,0.35)] select-none pointer-events-auto"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8.5 h-8.5 rounded-full bg-[#836953] flex items-center justify-center text-white shrink-0 overflow-hidden font-sans text-sm font-bold uppercase shadow-inner">
                {followBanner.photoURL ? (
                  <img src={followBanner.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  followBanner.displayName.charAt(0)
                )}
              </div>
              <div className="flex flex-col text-left min-w-0 leading-tight">
                <span className="text-white text-[12.5px] font-bold truncate pr-1">
                  {followBanner.displayName}
                </span>
                <span className="text-yellow-400 text-[10px] font-light tracking-wide">
                  Followed the anchor
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 select-none shrink-0 ml-3.5">
              <span className="text-[17px] leading-none filter drop-shadow-sm">🔥</span>
              <span className="text-white font-extrabold text-[13px] tracking-wide">+{followBanner.points}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
