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
import { 
  X, Plus, Coins, Users, Star, MessageSquare, List, Users2, Gift as GiftIcon, ShoppingBag, Settings,
  Smile, Menu, Maximize2, Ban, Bell, Heart, BarChart3, Sparkles, Type, Mail, SendHorizontal,
  Phone, PhoneCall, Check, Video, Mic, MicOff, VideoOff, Share2, MoreHorizontal, ChevronDown, Gamepad2
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
import { AICoach } from '../components/AICoach';
import { PKShieldOverlay } from '../components/PKShieldOverlay';
import { FanClubWelcome } from '../components/FanClubWelcome';
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

export default function RoomPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const isGhost = searchParams.get('ghost') === 'true';
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 1. ALL STATE DEFINITIONS AT THE TOP
  const [room, setRoom] = useState<Room | null>(null);
  const [hostProfile, setHostProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [simulatedMessages, setSimulatedMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
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
  const [activeGifts, setActiveGifts] = useState<Array<{ id: string, giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string, nobleTier?: string }>>([]);
  const [giftQueue, setGiftQueue] = useState<Array<{ id: string, giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string, nobleTier?: string }>>([]);
  const [activeAnimation, setActiveAnimation] = useState<{ giftName: string, displayName: string, animationType: string, nobleTier?: string } | null>(null);
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
          
          if (animationType === 'kiss' || animationType === 'flower') {
            setActiveAnimation({ giftName, displayName: senderName, animationType, nobleTier });
            setTimeout(() => setActiveAnimation(null), 4000);
          }
          
          const processGift = (giftData: any) => {
            const { giftName, giftImage, quantity, animationType, senderName, photoURL, hostPhoto, id, nobleTier } = giftData;
            const giftId = id || `msg-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

            setActiveGifts(prevActive => {
              const existingIndex = prevActive.findIndex(g => g.displayName === senderName && g.giftName === giftName);
              if (existingIndex !== -1) {
                const updated = [...prevActive];
                updated[existingIndex] = { ...updated[existingIndex], combo: updated[existingIndex].combo + quantity, animationType, nobleTier };
                return updated;
              }

              // Check queue
              const existingQueueIndex = giftQueue.findIndex(g => g.displayName === senderName && g.giftName === giftName);
              if (existingQueueIndex !== -1) {
                setGiftQueue(prevQueue => {
                  const updated = [...prevQueue];
                  updated[existingQueueIndex] = { ...updated[existingQueueIndex], combo: updated[existingQueueIndex].combo + quantity, animationType, nobleTier };
                  return updated;
                });
                return prevActive;
              }

              // New gift
              const newGift = {
                id: giftId,
                giftName, giftImage, displayName: senderName,
                userPhoto: photoURL || hostPhoto,
                combo: quantity, animationType, nobleTier
              };

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
            nobleTier
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
    await updateDoc(doc(db, 'rooms', roomId), {
      micQueue: updatedQueue
    });
  };

  const handleAssignSeat = async (seatId: number, request: MicRequest) => {
    if (!room) return;
    const updatedSeats = assignSeat(seats, seatId, request.uid, request.type);
    const updatedQueue = micQueue.filter(req => req.uid !== request.uid);
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
    await updateDoc(doc(db, 'rooms', roomId), {
      seats: updatedSeats
    });
  };

  const handleToggleLock = async (seatId: number) => {
    if (!room) return;
    const updatedSeats = seats.map(s => s.seatId === seatId ? { ...s, status: s.status === 'locked' ? 'empty' : 'locked' } : s);
    await updateDoc(doc(db, 'rooms', roomId), {
      seats: updatedSeats
    });
  };

  const visibleMessages = React.useMemo(() => {
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    
    const systemMsg = {
      id: 'system-welcome',
      type: 'system' as const,
      text: 'Minors are strictly prohibited from using BINGO LIVE. The review team will monitor rooms 24/7. Please report any violations.',
      timestamp: 0 // Keep it at the very top
    };

    return [systemMsg, ...messages, ...simulatedMessages]
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
  }, [messages, simulatedMessages, currentTime, isFollowing, profile?.uid, room?.hostUid]);

  const handleLocalGift = (gift: any, quantity: number) => {
    if (!profile) return;
    
    const giftName = gift.name;
    const giftImage = gift.image;
    const animationType = gift.animationType || 'standard';
    const senderName = profile.displayName;
    const giftId = `local-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

    if (animationType === 'kiss' || animationType === 'flower') {
      setActiveAnimation({ giftName, displayName: senderName, animationType, nobleTier: profile.nobleTitle || 'None' });
      setTimeout(() => setActiveAnimation(null), 4000);
    }

    setActiveGifts(prevActive => {
      const existingIndex = prevActive.findIndex(g => g.displayName === senderName && g.giftName === giftName);
      if (existingIndex !== -1) {
        const updated = [...prevActive];
        updated[existingIndex] = { ...updated[existingIndex], combo: updated[existingIndex].combo + quantity, animationType };
        return updated;
      }

      // Check queue
      const existingQueueIndex = giftQueue.findIndex(g => g.displayName === senderName && g.giftName === giftName);
      if (existingQueueIndex !== -1) {
        setGiftQueue(prevQueue => {
          const updated = [...prevQueue];
          updated[existingQueueIndex] = { ...updated[existingQueueIndex], combo: updated[existingQueueIndex].combo + quantity, animationType };
          return updated;
        });
        return prevActive;
      }

      const newGift = {
        id: giftId,
        giftName, giftImage, displayName: senderName,
        userPhoto: profile.photoURL,
        combo: quantity, animationType
      };

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
    if (!roomId) return;
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
    if (!profile || !room?.hostUid) return;
    const hostUid = room.hostUid;
    const followId = `${profile.uid}_${hostUid}`;

    const unsub = onSnapshot(doc(db, 'follows', followId), (doc) => {
      setIsFollowing(doc.exists());
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `follows/${followId}`);
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
          `Thanks for the follow, ${profile.displayName}! ❤️`,
          `Welcome to the family, ${profile.displayName}! 🙏`,
          `Glad to have you here, ${profile.displayName}! 🌟`,
          `Thanks for the support, ${profile.displayName}! ✨`,
          `Welcome! Thanks for the follow, ${profile.displayName}! 💖`
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
    try {
      await addDoc(collection(db, `rooms/${roomId}/messages`), { 
        text: input, 
        uid: profile.uid, 
        displayName: profile.displayName, 
        photoURL: profile.photoURL || '', 
        svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
        level: profile.level || 1, 
        type: 'chat', 
        timestamp: serverTimestamp() 
      });
      setInput('');
      setShowChatInput(false);
    } catch (error) { console.error('Send message error', error); }
  };

  const sendLike = async () => {
    if (!profile || !roomId) return;
    handleTapLike();
    likeParticlesRef.current?.triggerLike();
    try {
      await addDoc(collection(db, `rooms/${roomId}/messages`), { 
        type: 'like', 
        uid: profile.uid, 
        displayName: profile.displayName, 
        photoURL: profile.photoURL, 
        svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
        timestamp: serverTimestamp() 
      });
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

  return (
    <div className="h-full w-full bg-black overflow-hidden relative font-sans select-none">
      <SEOHeaders 
        title={`${room?.title || 'Live Room'} - Bingo Live`}
        description={`Watch ${hostProfile?.displayName || 'Host'} live on Bingo Live! Join the fun with gifts, polls, and more.`}
        keywords={`live streaming, ${hostProfile?.displayName || 'streamer'}, bingo live, gifting, USA, UK, Europe`}
        isLive={room?.status === 'live'}
      />
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
        <VideoStream 
          isHost={profile?.uid === room.hostUid} 
          roomId={room.id} 
          hostUid={room.hostUid}
          pkStatus={room.pkStatus}
          opponentUid={room.pkOpponentUid}
          isVirtual={room.type === 'virtual-live'}
          type={room.type}
        />
        {room && !isCleanMode && (
          <TreasureChestDisplay 
            roomId={room.id} 
            isHost={profile?.uid === room.hostUid} 
          />
        )}
      </div>

      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* HEADER SECTION - EXACT REPLICATION */}
        {!isCleanMode && (
          <div className="flex flex-col pointer-events-none px-4 pt-2 relative">
            <div className="flex items-start justify-between pointer-events-auto">
              {/* Left Group: Host Info & Secondary Pills */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-0.5 pr-0 border border-white/10 shadow-lg scale-90 origin-left">
                  <NobleFrame tier={hostProfile?.nobleTitle || 'None'} size={32}>
                    <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/150?u=host'} alt="Host" className="w-full h-full object-cover rounded-full" />
                  </NobleFrame>
                  <div className="flex flex-col px-1.5 min-w-[60px]">
                    <div className="flex items-center gap-1">
                      <span className="text-white text-[10px] font-bold leading-tight truncate max-w-[80px]">
                        {hostProfile?.displayName || 'keep it secret'}
                      </span>
                      {activePrivateCall && (
                        <span className="text-[6px] bg-pink-500 text-white px-1 rounded-full font-black uppercase">Private</span>
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
                    onClick={() => navigate('/fan-club')}
                    className="w-7 h-7 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 ml-0.5 border border-pink-500/30"
                  >
                    <Star size={12} fill="currentColor" />
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
                  <div className="bg-black/30 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/5 scale-90 origin-left">
                    <BarChart3 size={10} className="text-yellow-400" />
                    <span className="text-white text-[9px] font-medium">Region List</span>
                  </div>
                  <div className="bg-black/30 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center gap-1 border border-white/5 scale-90 origin-left">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <Coins size={10} className="text-white/60" />
                    <span className="text-white text-[9px] font-medium">174/200</span>
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
                
                <button onClick={() => navigate('/')} className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all scale-90 origin-right">
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
              isHost={profile?.uid === room.hostUid}
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
              isHost={profile?.uid === room.hostUid}
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
          <div className="absolute left-4 right-4 top-[120px] z-30 pointer-events-auto">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {seats && seats.map((seat, idx) => (
                <EnhancedGuestSeat
                  key={`seat_${idx}`}
                  seat={seat}
                  seatId={idx}
                  roomId={room.id}
                  isHost={profile?.uid === room.hostUid}
                  coinContribution={seat.coinContribution || 0}
                  onSeatChange={() => setSeats([...seats])}
                />
              ))}
            </div>
            <MicQueue 
              isHost={profile?.uid === room.hostUid}
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

        {/* PRIVATE CALL MANAGER */}
        {!isCleanMode && room && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto flex flex-col gap-4">
            {room && room.type === 'multi-guest-live' && profile?.uid === room.hostUid && (
              <SeatRequestManager
                roomId={room.id}
                isHost={true}
                onRequestsChange={setSeatRequestCount}
              />
            )}
            <PollSystem 
              roomId={room.id} 
              isHost={profile?.uid === room.hostUid} 
            />
            <ChaosEvents roomId={room.id} />
            <EasterEggDrops roomId={room.id} />
            <FeatureAutoManager roomId={room.id} isHost={profile?.uid === room.hostUid} />
            <PrivateCallManager 
              roomId={roomId || ''} 
              hostUid={room.hostUid} 
              isHost={profile?.uid === room.hostUid}
              userProfile={profile}
              hostProfile={hostProfile}
            />

            {/* Prediction System */}
            <PredictionSystem 
              roomId={roomId || ''} 
              isHost={profile?.uid === room.hostUid} 
              userProfile={profile} 
            />

            {profile?.uid === room.hostUid && (
              <button 
                onClick={() => setShowAICoach(!showAICoach)}
                className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 active:scale-90 transition-all"
              >
                <Sparkles size={24} />
              </button>
            )}
          </div>
        )}

        {/* AI COACH OVERLAY */}
        {showAICoach && profile?.uid === room.hostUid && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto">
            <AICoach 
              room={room} 
              messages={messages} 
              onClose={() => setShowAICoach(false)} 
            />
          </div>
        )}

        {/* AI Assistant (Only for Host) */}
        {profile?.uid === room.hostUid && (
          <AILiveAssistant 
            stats={streamStats} 
            onAction={(action) => {
              if (action === 'pk') showToast("Starting PK... ⚔️", 'info');
              if (action === 'share') showToast("Sharing stream... 🔗", 'info');
            }} 
          />
        )}

        {/* Mini-Games */}
        <MiniGameCenter 
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
                    {activeGifts.map((gift) => (
                      <GiftCombo 
                        key={gift.id}
                        giftName={gift.giftName}
                        giftImage={gift.giftImage}
                        displayName={gift.displayName}
                        userPhoto={gift.userPhoto}
                        combo={gift.combo}
                        nobleTier={gift.nobleTier}
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
                    {visibleMessages.map(msg => (
                      <ChatMessage 
                        key={msg.id} 
                        message={{
                          ...msg,
                          onFollow: toggleFollow,
                          isFollowing: isFollowing,
                          onLike: sendLike,
                          onJoinGuest: () => showToast("Guest Live request sent! 🎥", 'info'),
                          onClick: () => {
                            if (profile?.uid === room?.hostUid && msg.displayName && msg.type !== 'system') {
                              setInput(`@${msg.displayName} `);
                              setShowChatInput(true);
                            }
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
                      addDoc(collection(db, `rooms/${roomId}/messages`), { 
                        text: sticker, 
                        uid: profile?.uid, 
                        displayName: profile?.displayName, 
                        photoURL: profile?.photoURL || '', 
                        svipTier: profile?.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
                        level: profile?.level || 1, 
                        type: 'chat', 
                        timestamp: serverTimestamp() 
                      });
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
        {showTools && <RoomToolsModal onClose={() => setShowTools(false)} isHost={profile?.uid === room.hostUid} onAction={handleToolAction} currentQuality={quality} isCleanMode={isCleanMode} isRecording={isRecording} isLowLatency={isLowLatency} />}
        {showGifts && <GiftingModal room={room} onClose={() => setShowGifts(false)} onGiftSent={handleLocalGift} />}
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
        />
      )}

      <FanClubWelcome 
        userName={fanClubWelcomeUser?.displayName || ''} 
        level={fanClubWelcomeUser?.level || 1} 
        isSuperFan={fanClubWelcomeUser?.isSuperFan || false} 
        onComplete={() => setFanClubWelcomeUser(null)} 
      />
    </div>
  );
}
