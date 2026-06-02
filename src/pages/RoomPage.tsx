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
import { SVIPManager } from '../lib/svipLogic';
import { MiniGameOverlay, MiniGame as ActiveGame } from '../components/MiniGameOverlay';
import { PK_SHIELDS } from '../pkShieldLogic';
import { SEOHeaders } from '../components/SEOHeaders';
import { UserDiscoveryPopup } from '../components/UserDiscoveryPopup';
import { LiveAdPlayer } from '../components/LiveAdPlayer';
import { CoStreamManager } from '../components/CoStreamManager';
import { GiftExplosionFX } from '../components/GiftExplosionFX';

export default function RoomPage() {
  const { roomId } = useParams();
  const isSimulatedRoom = !roomId || roomId === 'shyne_featured' || roomId.startsWith('host_') || roomId.startsWith('sim_') || roomId.includes('featured');
  const [searchParams] = useSearchParams();
  const isGhost = searchParams.get('ghost') === 'true';
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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
  const [localLikes, setLocalLikes] = useState(0);
  const [nobleEntranceUser, setNobleEntranceUser] = useState<{ displayName: string, tier: any, photoURL?: string } | null>(null);
  const [fanClubWelcomeUser, setFanClubWelcomeUser] = useState<{ displayName: string, level: number, isSuperFan: boolean } | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isLowLatency, setIsLowLatency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
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

  // Camera Shake & Gifting Explosion system
  const [isShaking, setIsShaking] = useState(false);
  const [recentExplosion, setRecentExplosion] = useState<{ id: string; giftName: string; senderName: string; comboCount: number; cost: number } | null>(null);

  const triggerShake = (duration = 600) => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), duration);
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
    setLocalLikes(prev => prev + 1);
    pendingLikesRef.current += 1;
  };

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
            const { giftName, giftImage, quantity, animationType, senderName, photoURL, hostPhoto, id, nobleTier, familyName } = giftData;
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
            nobleTier, familyName
          });
        }

        if (lastMsg.type === 'like' && lastMsg.uid !== profile?.uid) {
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
            await initializeEnhancedSeats(room.id, 4);
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
        },
        {
          id: 'host_bigs',
          title: 'βiGS Gang Room - Let the battle begin 🩸🔥',
          hostUid: 'host_bigs',
          hostName: 'βiGS... 🩸',
          hostPhotoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=350',
          viewerCount: 142,
          level: 45,
        },
        {
          id: 'host_rosey',
          title: 'Rose Palace - Live music and request show! 🌹🎙️',
          hostUid: 'host_rosey',
          hostName: '⭐ ROSeY 🌹',
          hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350',
          viewerCount: 215,
          level: 32,
        },
        {
          id: 'host_june',
          title: 'June Spring - Multi-guest cozy chats & mini-games! 🌸✨',
          hostUid: 'host_june',
          hostName: '6k June 🌸...',
          hostPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350',
          viewerCount: 310,
          level: 48,
        },
        {
          id: 'host_babyface',
          title: 'bäbyfäcε acoustics - Chill acoustic beats & late loops 👾',
          hostUid: 'host_babyface',
          hostName: 'bäbyfäcε...',
          hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
          viewerCount: 74,
          level: 29,
        },
        {
          id: 'host_adabekee',
          title: 'BINGO Verified premier host 🇳🇬✨',
          hostUid: 'host_adabekee',
          hostName: 'Ada Bekee.',
          hostPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350',
          viewerCount: 180,
          level: 55,
        }
      ];
      const found = featured.find(f => f.id === id);
      if (found) return found;

      const foundSim = bigoSimulatedFeeds.find(f => f.id === id);
      if (foundSim) {
        return {
          id: foundSim.id,
          title: foundSim.title,
          hostUid: foundSim.hostUid,
          hostName: foundSim.hostName || 'Host',
          hostPhotoURL: foundSim.hostPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
          viewerCount: foundSim.viewerCount,
          level: foundSim.level || 30
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
        type: 'live',
        status: 'live',
        viewerCount: mockRoom.viewerCount,
        likes: 1200 + Math.floor(Math.random() * 500),
        currentBeans: 4200 + Math.floor(Math.random() * 1000),
        latitude: 6.43,
        longitude: 3.52,
        locationName: 'Lekki, Nigeria',
        guests: [],
        isPrivate: false,
        createdAt: null
      });
      setHostProfile({
        uid: mockRoom.hostUid,
        displayName: mockRoom.hostName,
        photoURL: mockRoom.hostPhotoURL,
        level: mockRoom.level,
        role: 'user',
        totalBeansEarned: mockRoom.level * 1000 + 4000,
        diamonds: 1000,
        beans: 500
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
      setIsFollowing(!isFollowing);
      showToast(isFollowing ? "Unfollowed! 😿" : "Following! ❤️", 'success');
      return;
    }
    const followId = `${profile.uid}_${room.hostUid}`;
    const followRef = doc(db, 'follows', followId);
    try {
      if (isFollowing) await deleteDoc(followRef);
      else {
        await setDoc(followRef, { followerUid: profile.uid, followingUid: room.hostUid, timestamp: serverTimestamp() });
        
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
      await addDoc(collection(db, `rooms/${roomId}/messages`), { 
        type: 'like', 
        uid: profile.uid, 
        displayName: profile.displayName, 
        photoURL: profile.photoURL, 
        svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
        timestamp: serverTimestamp() 
      });

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
              onClick={() => navigate('/', { state: { returnToFeatured: true } })}
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
              onClick={() => navigate('/', { state: { returnToFeatured: true } })}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-neutral-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center"
            >
              Exit to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full bg-black overflow-hidden relative font-sans select-none", isShaking && "animate-shake")}>
      <SEOHeaders 
        title={`${room?.title || 'Live Room'} - Bingo Live`}
        description={`Watch ${hostProfile?.displayName || 'Host'} live on Bingo Live! Join the fun with gifts, polls, and more.`}
        keywords={`live streaming, ${hostProfile?.displayName || 'streamer'}, bingo live, gifting, USA, UK, Europe`}
        isLive={room?.status === 'live'}
      />
      <div className={cn(
        "absolute inset-0 z-0 bg-[#070b19] transition-all duration-300",
        room?.pkStatus === 'battling' && "top-[120px] bottom-[260px] rounded-3xl overflow-hidden shadow-2xl"
      )}>
        <VideoStream 
          isHost={isHost} 
          roomId={room.id} 
          hostUid={room.hostUid}
          pkStatus={room.pkStatus}
          opponentUid={room.pkOpponentUid}
          isVirtual={room.type === 'virtual-live'}
          type={room.type}
        />
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
        {room && !isCleanMode && (
          <TreasureChestDisplay 
            roomId={room.id} 
            isHost={isHost} 
            userProfile={profile}
          />
        )}
      </div>

      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* HEADER SECTION - EXACT REPLICATION */}
        {!isCleanMode && (
          <div className="flex flex-col pointer-events-none px-4 pt-[calc(env(safe-area-inset-top,0px)+54px)] md:pt-4 relative">
            <div className="flex items-start justify-between pointer-events-auto">
              {/* Left Group: Host Info & Secondary Pills */}
              <div className="flex flex-col gap-1.5">
                <div 
                  onClick={() => hostProfile && showUserProfile(hostProfile.uid)}
                  className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-0.5 pr-0 border border-white/10 shadow-lg scale-90 origin-left cursor-pointer group hover:bg-black/60 transition-all"
                >
                  <NobleFrame tier={hostProfile?.nobleTitle || 'None'} size={32}>
                    <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/150?u=host'} alt="Host" className="w-full h-full object-cover rounded-full" />
                  </NobleFrame>
                  <div className="flex flex-col px-1.5 min-w-[60px]">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-white text-[10px] font-bold leading-tight truncate max-w-[80px]">
                        {hostProfile?.displayName || 'keep it secret'}
                      </span>
                      {activePrivateCall && (
                        <span className="text-[6px] bg-pink-500 text-white px-1 rounded-full font-black uppercase">Private</span>
                      )}
                      {((hostProfile && (hostProfile.agencyId || hostProfile.uid.startsWith('host_') || hostProfile.role === 'host')) || room?.hostUid?.startsWith('host_')) && (
                        <span className="text-[7px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1 rounded-sm font-black uppercase tracking-tighter flex items-center gap-0.5 shadow-sm leading-tight">
                          👑 IDOL
                        </span>
                      )}
                      {hostProfile?.nobleTitle && hostProfile.nobleTitle !== 'None' && (
                        <NobleBadge tier={hostProfile.nobleTitle as any} size="sm" />
                      )}
                      {hostProfile?.familyName && hostProfile?.familyLevel && (
                        <FamilyBadge familyName={hostProfile.familyName} familyLevel={hostProfile.familyLevel} />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins size={8} className="text-yellow-400" />
                      <span className="text-yellow-400 text-[8px] font-bold">
                        {hostProfile?.beans || 8931}
                      </span>
                    </div>
                  </div>
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
                        "w-7 h-7 rounded-full flex items-center justify-center text-white ml-0.5 transition-all",
                        isFollowing ? "bg-white/20" : "bg-cyan-400"
                      )}
                    >
                      {isFollowing ? <Check size={14} strokeWidth={4} /> : <Plus size={14} strokeWidth={4} />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setShowRegionList(true)}
                    className="bg-black/30 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/5 scale-90 origin-left cursor-pointer hover:bg-black/50 hover:border-white/15 active:scale-95 transition-all text-left"
                    title="Open Regional Rankings"
                  >
                    <BarChart3 size={10} className="text-yellow-400" />
                    <span className="text-white text-[9px] font-medium select-none">Region List</span>
                  </button>
                  <button 
                    onClick={() => setShowStarGoalDetail(true)}
                    className="bg-black/30 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/5 scale-90 origin-left cursor-pointer hover:bg-black/50 hover:border-white/15 active:scale-95 transition-all text-left"
                    title="Open Star Task Goal Progress"
                  >
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <Coins size={10} className="text-white/60" />
                    <span className="text-white text-[9px] font-medium select-none flex items-center gap-0.5">
                      {Math.min(room?.currentBeans !== undefined ? room.currentBeans : 174, 200)}/200
                    </span>
                  </button>
                  <div className="bg-black/30 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/5 scale-90 origin-left text-left" title="Stream popularity heat rating">
                    <span className="text-[#ff5a5a] text-[10.5px] filter drop-shadow">🔥</span>
                    <span className="text-white text-[9px] font-black leading-none">
                      {((room as any)?.popularity !== undefined ? (room as any).popularity : 5319).toLocaleString()}
                    </span>
                  </div>
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
                
                <button onClick={() => navigate('/', { state: { returnToFeatured: true } })} className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all scale-90 origin-right">
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

        {/* MIC QUEUE / GUEST SEATS */}
        {!isCleanMode && room.type === 'multi-guest-live' && (
          <div className="absolute right-3 top-[250px] z-30 pointer-events-auto flex flex-col items-end gap-2 w-[94px]">
            {/* Elegant Right-Aligned BINGO LIVE style "+ Join" and stack */}
            <button
              id="bg-join-mic-btn"
              onClick={() => handleJoinMicRequest('audio')}
              className="w-[88px] h-9 bg-black/35 hover:bg-black/50 border border-white/10 backdrop-blur-md rounded-xl shadow-md text-xs font-medium text-white flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <Plus size={14} className="text-[#00e5ff]" /> Join
            </button>
            
            <div className="flex flex-col gap-1.5 w-[88px] max-h-[380px] overflow-y-auto no-scrollbar">
              {seats && seats.map((seat, idx) => (
                <EnhancedGuestSeat
                  key={`seat_${idx}`}
                  seat={seat}
                  seatId={idx}
                  roomId={room.id}
                  isHost={isHost}
                  coinContribution={seat.coinContribution || 0}
                  onSeatChange={() => setSeats([...seats])}
                  onShowProfile={showUserProfile}
                />
              ))}
            </div>
            
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

        {/* Live Interactive Ads Portal (For viewers/hosts) */}
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
        <div className="mt-auto p-4 pb-1 flex flex-col gap-2 pointer-events-none relative z-20">
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
                  className="w-[65%] max-h-[40vh] overflow-y-auto scrollbar-hide flex flex-col gap-2 pointer-events-auto scroll-smooth"
                >
                  <div className="flex flex-col gap-2 min-h-full">
                    <div className="flex-1" />
                    {visibleMessages.map((msg, idx) => (
                      <ChatMessage 
                        key={`${msg.id || 'msg'}-${idx}`} 
                        message={{
                          ...msg,
                          type: (msg.type === 'welcome' || msg.uid === room?.hostUid) ? 'welcome' : msg.type,
                          hostName: msg.hostName || msg.displayName || 'Anchor',
                          hostLevel: msg.hostLevel || msg.level || 1,
                          onFollow: toggleFollow,
                          isFollowing: isFollowing,
                          onLike: sendLike,
                          onJoinGuest: () => showToast("Guest Live request sent! 🎥", 'info'),
                          onClick: () => {
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

              {/* Quick Replies */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 pointer-events-auto">
                {['Hi 👋', '😘😘😘', 'So gorgeous!', 'Good vibes'].map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setInput(reply);
                      setShowChatInput(true);
                    }}
                    className="whitespace-nowrap px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-medium border border-white/10 active:scale-95 transition-transform"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Bottom Interaction Bar */}
              <div className="flex items-center justify-between pointer-events-auto pb-0 w-full">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowChatInput(true)} className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={() => setShowTools(true)} className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <List size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Room link copied! 🔗', 'success');
                    }}
                    className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform"
                  >
                    <Share2 size={16} />
                  </button>
                  <button className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <ShoppingBag size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleJoinMicRequest('audio')} 
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform",
                      micQueue.some(r => r.uid === profile?.uid) ? "bg-orange-500 text-white" : "bg-black/40 backdrop-blur-3xl text-white"
                    )}
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={() => showToast("Play Center coming soon! 🎮", 'info')}
                    className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform"
                  >
                    <BarChart3 size={18} />
                  </button>
                  <button onClick={sendLike} className="w-9 h-9 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-pink-500 active:scale-90 transition-transform">
                    <Heart size={18} fill={localLikes > 0 ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setShowGifts(true)} className="w-11 h-11 bg-gradient-to-br from-[#ff0099] to-[#ff6600] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform">
                    <GiftIcon size={22} fill="currentColor" />
                  </button>
                </div>
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

      <LikeParticles ref={likeParticlesRef} />
      
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
    </div>
  );
}
