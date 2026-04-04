import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, onSnapshot, collection, query, orderBy, limit, addDoc, 
  serverTimestamp, updateDoc, increment, deleteField, setDoc, deleteDoc,
  getDoc, where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Room, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { getDeviceType } from '../lib/device';
import { 
  X, Plus, Coins, Users, Star, MessageSquare, List, Users2, Gift as GiftIcon, ShoppingBag, Settings,
  Smile, Menu, Maximize2, Ban, Bell, Heart, BarChart3, Sparkles, Type, Mail, SendHorizontal,
  Phone, PhoneCall, Check, Video, Mic, MicOff, VideoOff, Share2, MoreHorizontal, ChevronDown
} from 'lucide-react';
import { WingedHeart } from '../components/WingedHeart';
import { GiftCombo } from '../components/GiftCombo';
import { motion, AnimatePresence } from 'framer-motion';
import { PKBattle } from '../components/PKBattle';
import { GiftAnimation } from '../components/GiftAnimation';
import { LikeParticles, LikeParticlesRef } from '../components/LikeParticles';
import { ChatMessage } from '../components/ChatMessage';
import { LevelBadge } from '../components/LevelBadge';
import { VideoStream } from '../components/VideoStream';
import { GiftingModal } from '../components/GiftingModal';
import { RoomToolsModal } from '../components/RoomToolsModal';

export default function RoomPage() {
  const { roomId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [hostProfile, setHostProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [simulatedMessages, setSimulatedMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [quality, setQuality] = useState('HD');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [privateCallRequest, setPrivateCallRequest] = useState<any | null>(null);
  const [isPrivateCalling, setIsPrivateCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const pendingLikesRef = React.useRef(0);
  const likeParticlesRef = React.useRef<LikeParticlesRef>(null);

  useEffect(() => {
    if (room) {
      setLocalLikes(room.likes || 0);
    }
  }, [room?.likes]);

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

  useEffect(() => {
    if (!roomId || !profile?.uid || !room) return;

    // Streamer side: Listen for incoming requests
    if (profile.uid === room.hostUid) {
      const q = query(
        collection(db, 'private_calls'),
        where('hostUid', '==', profile.uid),
        where('status', '==', 'pending'),
        limit(1)
      );
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setPrivateCallRequest({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setPrivateCallRequest(null);
        }
      });
    }

    // Viewer side: Listen for acceptance
    if (profile.uid !== room.hostUid) {
      const q = query(
        collection(db, 'private_calls'),
        where('viewerUid', '==', profile.uid),
        where('status', '==', 'accepted'),
        limit(1)
      );
      return onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setIsPrivateCalling(true);
        } else {
          setIsPrivateCalling(false);
        }
      });
    }
  }, [roomId, profile?.uid, room?.hostUid]);

  const requestPrivateCall = async () => {
    if (!profile || !room || !roomId) return;
    try {
      await addDoc(collection(db, 'private_calls'), {
        roomId,
        hostUid: room.hostUid,
        viewerUid: profile.uid,
        viewerName: profile.displayName,
        viewerPhoto: profile.photoURL || '',
        status: 'pending',
        fee: 500,
        createdAt: serverTimestamp()
      });
      setNotification({ message: 'Private call request sent! 📞', type: 'info' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'private_calls');
    }
  };

  const acceptPrivateCall = async () => {
    if (!privateCallRequest) return;
    try {
      await updateDoc(doc(db, 'private_calls', privateCallRequest.id), {
        status: 'accepted',
        startedAt: serverTimestamp()
      });
      setIsPrivateCalling(true);
      setPrivateCallRequest(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `private_calls/${privateCallRequest.id}`);
    }
  };

  const declinePrivateCall = async () => {
    if (!privateCallRequest) return;
    try {
      await updateDoc(doc(db, 'private_calls', privateCallRequest.id), {
        status: 'declined'
      });
      setPrivateCallRequest(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `private_calls/${privateCallRequest.id}`);
    }
  };

  const endPrivateCall = async () => {
    setIsPrivateCalling(false);
  };

  const handleTapLike = () => {
    setLocalLikes(prev => prev + 1);
    pendingLikesRef.current += 1;
  };

  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [isLowLatency, setIsLowLatency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeGifts, setActiveGifts] = useState<Array<{ id: string, giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string }>>([]);
  const [giftQueue, setGiftQueue] = useState<Array<{ id: string, giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string }>>([]);
  const [activeAnimation, setActiveAnimation] = useState<{ giftName: string, displayName: string, animationType: string } | null>(null);
  const [isSearchingPK, setIsSearchingPK] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const lastJoinKey = React.useRef<string | null>(null);
  const chatRef = React.useRef<HTMLDivElement>(null);
  const desktopChatRef = React.useRef<HTMLDivElement>(null);
  const deviceType = getDeviceType();
  const isMobile = deviceType !== 'desktop';

  const lastProcessedMsgId = React.useRef<string | null>(null);

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
          
          if (animationType === 'kiss' || animationType === 'flower') {
            setActiveAnimation({ giftName, displayName: senderName, animationType });
            setTimeout(() => setActiveAnimation(null), 4000);
          }
          
          const processGift = (giftData: any) => {
            const { giftName, giftImage, quantity, animationType, senderName, photoURL, hostPhoto, id } = giftData;
            const giftId = id || `msg-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

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

              // New gift
              const newGift = {
                id: giftId,
                giftName, giftImage, displayName: senderName,
                userPhoto: photoURL || hostPhoto,
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

          processGift({
            giftName, giftImage, quantity, animationType, senderName,
            photoURL: lastMsg.photoURL, hostPhoto: lastMsg.hostPhoto, id: lastMsg.id
          });
        }

        if (lastMsg.type === 'like' && lastMsg.uid !== profile?.uid) {
          likeParticlesRef.current?.triggerLike();
        }
      }
    }
  }, [messages, simulatedMessages, profile?.uid]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const lastMessageCountRef = React.useRef(0);

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
        const ts = msg.timestamp?.toMillis ? msg.timestamp.toMillis() : (typeof msg.timestamp === 'number' ? msg.timestamp : Date.now());
        return ts > fiveMinutesAgo;
      })
      .sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (typeof a.timestamp === 'number' ? a.timestamp : Date.now() + 1000);
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (typeof b.timestamp === 'number' ? b.timestamp : Date.now() + 1000);
        return timeA - timeB;
      });
  }, [messages, simulatedMessages, currentTime]);

  const handleLocalGift = (gift: any, quantity: number) => {
    if (!profile) return;
    
    const giftName = gift.name;
    const giftImage = gift.image;
    const animationType = gift.animationType || 'standard';
    const senderName = profile.displayName;
    const giftId = `local-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

    if (animationType === 'kiss' || animationType === 'flower') {
      setActiveAnimation({ giftName, displayName: senderName, animationType });
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
    
    // Add join message
    const addJoinMessage = async () => {
      try {
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'join',
          uid: profile.uid,
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          level: profile.level || 1,
          timestamp: serverTimestamp()
        });

        // If user hasn't followed, also add a follow prompt
        if (!isFollowing) {
          await addDoc(collection(db, `rooms/${roomId}/messages`), {
            type: 'follow-prompt',
            uid: profile.uid,
            displayName: hostProfile?.displayName || 'the host',
            photoURL: profile.photoURL || '',
            hostPhoto: hostProfile?.photoURL || '',
            timestamp: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error adding join message', error);
      }
    };
    addJoinMessage();

    updateDoc(roomRef, { viewerCount: increment(1) }).catch(err => console.error('Error incrementing viewer count', err));
    return () => {
      updateDoc(roomRef, { viewerCount: increment(-1) }).catch(err => console.error('Error decrementing viewer count', err));
    };
  }, [roomId, profile?.uid]);

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) {
        const roomData = { id: snap.id, ...snap.data() } as Room;
        setRoom(roomData);
        getDoc(doc(db, 'users', roomData.hostUid)).then(userSnap => {
          if (userSnap.exists()) setHostProfile(userSnap.data() as UserProfile);
        });
      }
    });
    const q = query(collection(db, `rooms/${roomId}/messages`), orderBy('timestamp', 'desc'), limit(50));
    const unsubMsgs = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })).reverse());
    });
    
    return () => { 
      unsubRoom(); 
      unsubMsgs(); 
    };
  }, [roomId]);

  // Chat Simulation for Viewer (to make the room feel alive)
  useEffect(() => {
    if (!room || !profile) return;

    const interval = setInterval(() => {
      const users = [
        { name: 'Dark Matters2.o', level: undefined },
        { name: 'hanafi', level: 4 },
        { name: 'DD', level: undefined },
        { name: 'Deji', level: 8 },
        { name: 'Sherryluv', level: 12 },
        { name: 'CoolCat', level: 5 },
        { name: 'StreamFan', level: 2 }
      ];
      const texts = ['Go go go!', 'You got this!', 'Amazing stream!', 'PK King!', 'Let\'s win this!', 'Love the energy!', 'Best anchor ever!'];
      
      const rand = Math.random();
      let type: 'chat' | 'gift' | 'join' | 'follow' | 'follow-prompt' | 'like-prompt' | 'guest-live-prompt' = 'chat';
      const userObj = users[Math.floor(Math.random() * users.length)];
      const user = userObj.name;
      const level = userObj.level;
      let text = texts[Math.floor(Math.random() * texts.length)];

      if (rand > 0.98) {
        type = 'guest-live-prompt';
        text = 'Wanna meet with the broadcaster? Click to join the Guest Live!';
      } else if (rand > 0.95) {
        type = 'like-prompt';
        text = 'Tap like to give the host a little energy!';
      } else if (rand > 0.92) {
        type = 'follow-prompt';
        text = 'to get LIVE notifications';
      } else if (rand > 0.85) {
        type = 'gift';
        text = 'sent a Rose 🌹';
      } else if (rand > 0.75) {
        type = 'follow';
        text = 'followed the anchor';
      } else if (rand > 0.5) {
        type = 'join';
        text = 'joined';
      }

      const newMessage = {
        id: 'sim-' + Math.random().toString(36).substr(2, 9),
        displayName: type === 'follow-prompt' ? (hostProfile?.displayName || 'the host') : user,
        text,
        type,
        isGift: type === 'gift',
        giftName: type === 'gift' ? 'Rose' : undefined,
        giftImage: type === 'gift' ? '🌹' : undefined,
        quantity: 1,
        level: type === 'follow-prompt' ? undefined : level,
        timestamp: Date.now(),
        hostPhoto: hostProfile?.photoURL,
        hostName: hostProfile?.displayName,
        isNew: type === 'join' && Math.random() > 0.7
      };

      setSimulatedMessages(prev => {
        const updated = [...prev, newMessage].slice(-30);
        
        // If it was a join, also add a follow prompt simulation
        if (type === 'join') {
          const followPrompt = {
            id: 'sim-follow-prompt-' + Math.random().toString(36).substr(2, 9),
            displayName: hostProfile?.displayName || 'the host',
            text: 'to get LIVE notifications',
            type: 'follow-prompt' as const,
            timestamp: Date.now() + 100,
            hostPhoto: hostProfile?.photoURL
          };
          return [...updated, followPrompt].slice(-30);
        }

        if (type === 'follow') {
          const thankYou = {
            id: 'sim-thank-' + Math.random().toString(36).substr(2, 9),
            displayName: 'System',
            text: `Anchor: Thanks for the follow, ${user}! ❤️`,
            type: 'system' as const,
            timestamp: Date.now()
          };
          return [...updated, thankYou].slice(-30);
        }
        return updated;
      });
    }, 2500); // Faster interval to match GoLivePage

    return () => clearInterval(interval);
  }, [room?.id, hostProfile]);

  // Add immediate and periodic follow prompt for viewers
  useEffect(() => {
    if (!room || !profile || profile.uid === room.hostUid || isFollowing) return;

    // Immediate prompt on join
    const initialPrompt = {
      id: 'follow-prompt-initial',
      type: 'follow-prompt',
      displayName: hostProfile?.displayName || 'the host',
      hostPhoto: hostProfile?.photoURL,
      timestamp: Date.now()
    };
    setSimulatedMessages(prev => [...prev, initialPrompt].slice(-30));

    const promptInterval = setInterval(() => {
      const promptMsg = {
        id: 'follow-prompt-' + Date.now(),
        type: 'follow-prompt',
        displayName: hostProfile?.displayName || 'the host',
        hostPhoto: hostProfile?.photoURL,
        timestamp: Date.now()
      };
      setSimulatedMessages(prev => [...prev, promptMsg].slice(-30));
    }, 60000); // Every 60 seconds

    return () => clearInterval(promptInterval);
  }, [room?.id, room?.hostUid, profile?.uid, isFollowing, hostProfile]);

  useEffect(() => {
    if (!profile || !room) return;
    const followId = `${profile.uid}_${room.hostUid}`;
    const followRef = doc(db, 'follows', followId);
    const unsub = onSnapshot(followRef, (doc) => setIsFollowing(doc.exists()));
    return () => unsub();
  }, [profile?.uid, room?.hostUid]);

  const toggleFollow = async () => {
    if (!profile || !room) return;
    const followId = `${profile.uid}_${room.hostUid}`;
    const followRef = doc(db, 'follows', followId);
    try {
      if (isFollowing) await deleteDoc(followRef);
      else {
        await setDoc(followRef, { followerUid: profile.uid, followingUid: room.hostUid, timestamp: serverTimestamp() });
        await addDoc(collection(db, `rooms/${roomId}/messages`), { type: 'follow', uid: profile.uid, displayName: profile.displayName, photoURL: profile.photoURL || '', level: profile.level || 1, timestamp: serverTimestamp() });
      }
    } catch (error) { console.error('Follow error', error); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile || !roomId) return;
    try {
      await addDoc(collection(db, `rooms/${roomId}/messages`), { text: input, uid: profile.uid, displayName: profile.displayName, photoURL: profile.photoURL || '', level: profile.level || 1, type: 'chat', timestamp: serverTimestamp() });
      setInput('');
      setShowChatInput(false);
    } catch (error) { console.error('Send message error', error); }
  };

  const sendLike = async () => {
    if (!profile || !roomId) return;
    handleTapLike();
    likeParticlesRef.current?.triggerLike();
    try {
      await addDoc(collection(db, `rooms/${roomId}/messages`), { type: 'like', uid: profile.uid, displayName: profile.displayName, photoURL: profile.photoURL, timestamp: serverTimestamp() });
    } catch (error) { console.error('Send like error', error); }
  };

  const handleToolAction = (action: string) => {
    switch (action) {
      case 'Share':
        navigator.clipboard.writeText(window.location.href);
        setNotification({ message: 'Link copied to clipboard! 🔗', type: 'success' });
        break;
      case 'Clean Mode': setIsCleanMode(!isCleanMode); break;
      case 'Minimize': setIsMinimized(!isMinimized); break;
      case 'Quality': setQuality(prev => prev === 'HD' ? 'SD' : 'HD'); break;
      case 'Watching Optimization': setIsLowLatency(!isLowLatency); break;
    }
  };

  if (!room) return <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic uppercase tracking-widest">Loading Room...</div>;

  return (
    <div className="h-full w-full bg-black overflow-hidden relative font-sans select-none">
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
        <VideoStream 
          isHost={profile?.uid === room.hostUid} 
          roomId={room.id} 
          hostUid={room.hostUid}
          pkStatus={room.pkStatus}
          opponentUid={room.pkOpponentUid}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col pointer-events-none">
        {/* HEADER SECTION - EXACT REPLICATION */}
        {!isCleanMode && (
          <div className="flex flex-col pointer-events-none px-4 pt-2 relative">
            <div className="flex items-start justify-between pointer-events-auto">
              {/* Left Group: Host Info & Secondary Pills */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-0.5 pr-0 border border-white/10 shadow-lg scale-90 origin-left">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/150?u=host'} alt="Host" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col px-1.5 min-w-[60px]">
                    <span className="text-white text-[10px] font-bold leading-tight truncate max-w-[80px]">
                      {hostProfile?.displayName || 'keep it secret'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Coins size={8} className="text-yellow-400" />
                      <span className="text-yellow-400 text-[8px] font-bold">
                        {hostProfile?.beans || 8931}
                      </span>
                    </div>
                  </div>
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
                  <span className="text-white text-[11px] font-medium opacity-80">{room.viewerCount || 411}</span>
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
        {room.pkStatus === 'battling' && <PKBattle room={room} />}

        {/* PRIVATE CALL BUTTON (VIEWER ONLY) */}
        {!isCleanMode && profile?.uid !== room.hostUid && !isPrivateCalling && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
            <button 
              onClick={requestPrivateCall}
              className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-2xl active:scale-95 transition-transform border-4 border-white/20"
            >
              <Phone size={28} strokeWidth={3} />
            </button>
            <div className="w-14 h-14 bg-black/30 backdrop-blur-3xl rounded-full flex items-center justify-center text-yellow-400 border border-white/10">
              <Bell size={24} />
            </div>
          </div>
        )}

        {/* INCOMING CALL NOTIFICATION REMOVED */}

        {/* PRIVATE CALL OVERLAY */}
        <AnimatePresence>
          {isPrivateCalling && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[150] bg-black pointer-events-auto"
            >
              <div className="h-full w-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-slate-800 animate-pulse mx-auto mb-4" />
                    <p className="text-white font-black italic uppercase tracking-widest">Private Session Active</p>
                  </div>
                </div>
                
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8">
                  <button onClick={() => setIsMuted(!isMuted)} className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors", isMuted ? "bg-red-500" : "bg-white/10")}>
                    {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                  </button>
                  <button onClick={endPrivateCall} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform">
                    <Phone size={32} className="rotate-[135deg]" />
                  </button>
                  <button onClick={() => setIsCameraOff(!isCameraOff)} className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors", isCameraOff ? "bg-red-500" : "bg-white/10")}>
                    {isCameraOff ? <VideoOff size={28} /> : <Video size={28} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                          onJoinGuest: () => setNotification({ message: "Guest Live request sent! 🎥", type: 'info' })
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
                  <button onClick={() => setShowChatInput(true)} className="w-10 h-10 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <MessageSquare size={18} />
                  </button>
                  <button onClick={() => setShowTools(true)} className="w-10 h-10 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <List size={18} />
                  </button>
                  <button className="w-10 h-10 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <ShoppingBag size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={sendLike} className="w-10 h-10 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-pink-500 active:scale-90 transition-transform">
                    <Heart size={20} fill={localLikes > 0 ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setShowGifts(true)} className="w-12 h-12 bg-gradient-to-br from-[#ff0099] to-[#ff6600] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform">
                    <GiftIcon size={24} fill="currentColor" />
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
                    key={idx}
                    onClick={() => {
                      addDoc(collection(db, `rooms/${roomId}/messages`), { 
                        text: sticker, 
                        uid: profile?.uid, 
                        displayName: profile?.displayName, 
                        photoURL: profile?.photoURL || '', 
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
        {showGifts && <GiftingModal hostUid={room.hostUid} roomId={room.id} onClose={() => setShowGifts(false)} onGiftSent={handleLocalGift} />}
      </AnimatePresence>

      <LikeParticles ref={likeParticlesRef} />
      
      {activeAnimation && (
        <GiftAnimation 
          giftName={activeAnimation.giftName} 
          displayName={activeAnimation.displayName} 
          animationType={activeAnimation.animationType} 
        />
      )}
    </div>
  );
}
