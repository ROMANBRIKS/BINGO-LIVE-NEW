import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, onSnapshot, collection, query, orderBy, limit, addDoc, 
  serverTimestamp, updateDoc, increment, deleteField, setDoc, deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Room, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { getDeviceType } from '../lib/device';
import { 
  X, Plus, Coins, Users, Star, MessageSquare, List, Users2, Gift as GiftIcon, ShoppingBag, Settings,
  Smile, Menu, Maximize2, Ban, Bell, Heart, BarChart3, Sparkles, Type, Mail, SendHorizontal
} from 'lucide-react';
import { WingedHeart } from '../components/WingedHeart';
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
  const [input, setInput] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const [quality, setQuality] = useState('HD');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showChatInput, setShowChatInput] = useState(false);
  const [systemMessage, setSystemMessage] = useState<any | null>(null);
  const [localLikes, setLocalLikes] = useState(0);
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

  const handleTapLike = () => {
    setLocalLikes(prev => prev + 1);
    pendingLikesRef.current += 1;
  };

  useEffect(() => {
    if (roomId) {
      setSystemMessage({
        id: 'system-welcome',
        type: 'system',
        text: 'Streamer asks viewers to support her by sending diamonds.',
        timestamp: Date.now()
      });
    }
  }, [roomId]);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [isLowLatency, setIsLowLatency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeGift, setActiveGift] = useState<{ giftName: string, displayName: string, combo: number, animationType?: string } | null>(null);
  const [isSearchingPK, setIsSearchingPK] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const lastJoinKey = React.useRef<string | null>(null);
  const chatRef = React.useRef<HTMLDivElement>(null);
  const desktopChatRef = React.useRef<HTMLDivElement>(null);
  const deviceType = getDeviceType();
  const isMobile = deviceType !== 'desktop';

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      
      // Handle Gift Animations
      if (lastMsg.isGift) {
        const giftName = lastMsg.text.replace('sent a ', '').replace('! 🎁', '');
        const animationType = lastMsg.animationType || 'standard';
        
        setActiveGift(prev => {
          if (prev && prev.giftName === giftName && prev.displayName === lastMsg.displayName) {
            return { ...prev, combo: prev.combo + 1, animationType };
          }
          return { giftName, displayName: lastMsg.displayName, combo: 1, animationType };
        });

        const duration = (animationType === 'kiss' || animationType === 'flower') ? 5000 : 3000;
        const timer = setTimeout(() => setActiveGift(null), duration);
        return () => clearTimeout(timer);
      }

      // Handle Like Animations for other users
      if (lastMsg.type === 'like' && lastMsg.uid !== profile?.uid) {
        likeParticlesRef.current?.triggerLike();
      }
    }
  }, [messages, profile?.uid]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (shouldAutoScroll) {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      if (desktopChatRef.current) desktopChatRef.current.scrollTop = desktopChatRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const emojis = ['❤️', '🔥', '👏', '😂', '😮', '😢', '😍', '🙌', '🎉', '✨', '💯', '🚀'];

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
          pkScore: 0,
          pkOpponentScore: 0,
          pkEndTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
        setIsSearchingPK(false);
      }, 2000);
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
    updateDoc(roomRef, {
      viewerCount: increment(1)
    }).catch(err => console.error('Error incrementing viewer count', err));

    return () => {
      updateDoc(roomRef, {
        viewerCount: increment(-1)
      }).catch(err => console.error('Error decrementing viewer count', err));
    };
  }, [roomId, profile?.uid]);

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) {
        const roomData = { id: snap.id, ...snap.data() } as Room;
        setRoom(roomData);
        
        // Fetch host profile
        getDoc(doc(db, 'users', roomData.hostUid)).then(userSnap => {
          if (userSnap.exists()) {
            setHostProfile(userSnap.data() as UserProfile);
          }
        });
      }
    });

    const q = query(collection(db, `rooms/${roomId}/messages`), orderBy('timestamp', 'desc'), limit(50));
    const unsubMsgs = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
    });

    return () => {
      unsubRoom();
      unsubMsgs();
    };
  }, [roomId]);

  useEffect(() => {
    if (!profile || !room) return;
    
    const followId = `${profile.uid}_${room.hostUid}`;
    const followRef = doc(db, 'follows', followId);
    
    const unsub = onSnapshot(followRef, (doc) => {
      setIsFollowing(doc.exists());
    });
    
    return () => unsub();
  }, [profile?.uid, room?.hostUid]);

  useEffect(() => {
    const currentKey = `${roomId}-${profile?.uid}`;
    if (!profile || !roomId || lastJoinKey.current === currentKey) return;
    
    lastJoinKey.current = currentKey;
    let isMounted = true;

    const sendJoinMessage = async () => {
      try {
        const roomSnap = await getDoc(doc(db, 'rooms', roomId));
        if (!roomSnap.exists()) return;
        const roomData = roomSnap.data();

        // Check follow status early
        let shouldSendFollowPrompt = false;
        if (profile.uid !== roomData.hostUid) {
          const followId = `${profile.uid}_${roomData.hostUid}`;
          const followRef = doc(db, 'follows', followId);
          const followSnap = await getDoc(followRef);
          shouldSendFollowPrompt = !followSnap.exists();
        }

        // 1. Send the join message
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'join',
          uid: profile.uid,
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          level: profile.level || 1,
          nobleTitle: profile.nobleTitle || 'none',
          timestamp: serverTimestamp(),
        });

        // 2. Send the welcome message from the host
        let hostName = 'Host';
        let hostLevel = 1;
        let hostPhoto = '';

        if (hostProfile) {
          hostName = hostProfile.displayName;
          hostLevel = hostProfile.level || 1;
          hostPhoto = hostProfile.photoURL;
        } else {
          const hostSnap = await getDoc(doc(db, 'users', roomData.hostUid));
          if (hostSnap.exists()) {
            const hProfile = hostSnap.data() as UserProfile;
            hostName = hProfile.displayName;
            hostLevel = hProfile.level || 1;
            hostPhoto = hProfile.photoURL;
          } else {
            const title = roomData.title || '';
            if (title.includes("'s Live Stream")) {
              hostName = title.split("'s Live Stream")[0];
            }
          }
        }

        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'welcome',
          uid: profile.uid,
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          hostName: hostName,
          hostPhoto: hostPhoto,
          hostLevel: hostLevel,
          text: `Welcome to my stream, ${profile.displayName}! 💖`,
          timestamp: serverTimestamp(),
        });

        // 3. Send follow prompt if needed
        if (shouldSendFollowPrompt) {
          await addDoc(collection(db, `rooms/${roomId}/messages`), {
            type: 'follow-prompt',
            uid: profile.uid,
            displayName: profile.displayName,
            photoURL: profile.photoURL || '',
            level: profile.level || 1,
            text: `is not following the host yet. Click to follow!`,
            timestamp: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Send join message error', error);
      }
    };
    
    sendJoinMessage();

    return () => {
      isMounted = false;
    };
  }, [roomId, profile?.uid]);

  const toggleFollow = async () => {
    if (!profile || !room) return;
    
    const followId = `${profile.uid}_${room.hostUid}`;
    const followRef = doc(db, 'follows', followId);

    try {
      if (isFollowing) {
        await deleteDoc(followRef);
      } else {
        await setDoc(followRef, {
          followerUid: profile.uid,
          followingUid: room.hostUid,
          timestamp: serverTimestamp()
        });
        
        // Send follow message to chat
        await addDoc(collection(db, `rooms/${roomId}/messages`), {
          type: 'follow',
          uid: profile.uid,
          displayName: profile.displayName,
          photoURL: profile.photoURL || '',
          level: profile.level || 1,
          nobleTitle: profile.nobleTitle || 'none',
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Follow error', error);
    }
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
        level: profile.level || 1,
        type: 'chat',
        timestamp: serverTimestamp(),
      });
      setInput('');
    } catch (error) {
      console.error('Send message error', error);
    }
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
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Send like error', error);
    }
  };

  const handleReport = (reason: string) => {
    setNotification({ message: `Report submitted for ${reason}. Thank you!`, type: 'success' });
    setShowReport(false);
  };

  const handleToolAction = (action: string) => {
    switch (action) {
      case 'Share':
        if (navigator.share) {
          navigator.share({
            title: room?.title || 'BINGO LIVE',
            text: `Check out this live stream: ${room?.title}`,
            url: window.location.href,
          }).catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Share failed:', err);
              // Fallback to clipboard if share fails for other reasons
              navigator.clipboard.writeText(window.location.href);
              setNotification({ message: 'Link copied to clipboard! 🔗', type: 'success' });
            }
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          setNotification({ message: 'Link copied to clipboard! 🔗', type: 'success' });
        }
        break;
      case 'Clean Mode':
        setIsCleanMode(!isCleanMode);
        break;
      case 'Minimize':
        setIsMinimized(!isMinimized);
        break;
      case 'Quality':
        const qualities = ['4K', '2K', 'HD', 'SD'];
        const nextIndex = (qualities.indexOf(quality) + 1) % qualities.length;
        const newQuality = qualities[nextIndex];
        setQuality(newQuality);
        setNotification({ message: `Video quality set to ${newQuality}`, type: 'info' });
        break;
      case 'Watching Optimization':
        const nextLowLatency = !isLowLatency;
        setIsLowLatency(nextLowLatency);
        setNotification({ 
          message: nextLowLatency ? 'Low Latency Mode activated! ⚡' : 'Standard Mode activated', 
          type: 'success' 
        });
        break;
      case 'Recorder':
        if (isRecording) {
          setIsRecording(false);
          setNotification({ message: 'Recording saved to your gallery! 📹', type: 'success' });
        } else {
          setIsRecording(true);
          setNotification({ message: 'Screen recording started... 🔴', type: 'info' });
        }
        break;
      case 'REPORT':
        setShowReport(true);
        break;
      case 'Block':
        setShowBlockConfirm(true);
        break;
      case 'Gift Settings':
        setShowGifts(true);
        break;
      case 'Viewer\'s Info':
        setNotification({ message: 'Fetching viewer statistics and insights... 📊', type: 'info' });
        break;
      case 'Newcomers':
        setNotification({ message: 'Showing recent users who joined the room! 👋', type: 'info' });
        break;
      case 'Gift Sound':
        setNotification({ message: 'Gift sound effects toggled! 🔔', type: 'success' });
        break;
      case 'Wish lists':
        setNotification({ message: 'Opening host\'s gift wish list... 💝', type: 'info' });
        break;
      case 'Fan Lottery':
        setNotification({ message: 'Fan lottery started! Good luck to all participants! 🎟️', type: 'success' });
        break;
      case 'Draw Guess':
      case 'Turntable':
      case 'Big Winner':
      case 'Dino':
      case 'Earn Money':
      case 'Match':
      case 'Craw':
        setNotification({ message: `${action} game is loading... Get ready to play! 🎮`, type: 'info' });
        break;
      case 'Group PK':
      case 'PK Qualifying':
        setNotification({ message: `Joining the ${action} queue... ⚔️`, type: 'info' });
        break;
      case 'Gift Wall':
        setNotification({ message: 'Viewing the room\'s top contributors and gifts! 🎁', type: 'info' });
        break;
      case 'Guide':
        setNotification({ message: 'Opening the BINGO LIVE feature guide... 📘', type: 'info' });
        break;
      case 'Camera':
        setNotification({ message: 'Camera settings opened! 📸', type: 'info' });
        break;
      case 'Mask':
        setNotification({ message: 'Face masks and AR effects loading... 🎭', type: 'info' });
        break;
      case 'Flip':
        setNotification({ message: 'Camera view flipped! 🔄', type: 'info' });
        break;
      case 'Zoom in':
        setNotification({ message: 'Zooming in on the action... 🔍', type: 'info' });
        break;
      case 'Flash':
        setNotification({ message: 'Flash toggled! ⚡', type: 'info' });
        break;
      case 'Key Settings':
        setNotification({ message: 'Opening advanced stream settings... 🔑', type: 'info' });
        break;
      case 'Singing Mode':
        setNotification({ message: 'Singing Mode activated! Get ready for karaoke! 🎤', type: 'success' });
        break;
      case 'Youtube':
        setNotification({ message: 'Suggest a YouTube video to the host! 📺', type: 'info' });
        break;
      case 'Share Screen':
        setNotification({ message: 'Requesting screen share from host... 🖥️', type: 'info' });
        break;
      case 'DIY Notify':
        setNotification({ message: 'Custom notification sent to the host! 📣', type: 'success' });
        break;
      case 'Line':
        setNotification({ message: 'Requesting a guest line call with the host... 📞', type: 'info' });
        break;
      case 'Pet':
        setNotification({ message: 'Interacting with the host\'s virtual pet! 🐶', type: 'info' });
        break;
      case 'Date':
        setNotification({ message: 'Sending a date request to the host! 💝', type: 'info' });
        break;
      case 'Mirror':
        setNotification({ message: 'Mirror mode toggled! 🪞', type: 'info' });
        break;
      case 'Music':
        setNotification({ message: 'Music library opened! 🎵', type: 'info' });
        break;
      case 'Beauty':
        setNotification({ message: 'Beauty filters activated! ✨', type: 'success' });
        break;
      case 'Sticker':
        setNotification({ message: 'Stickers menu opened! 😊', type: 'info' });
        break;
      case 'PK':
        if (room.pkStatus === 'battling') endPK();
        else startPK();
        break;
      case 'Games':
        setShowGames(true);
        break;
      default:
        setNotification({ message: `${action} feature is coming soon! 🚀`, type: 'info' });
    }
    setShowTools(false);
  };

  if (!room) return <div className="p-24 text-center">Loading stream...</div>;

  if (isMobile) {
    return (
      <div className={`fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden transition-all duration-500 ${isMinimized ? 'scale-[0.4] origin-bottom-right translate-x-[-10px] translate-y-[-80px] rounded-3xl shadow-2xl border-2 border-white/20' : ''}`}>
        <div className="absolute inset-0">
          <VideoStream 
            isHost={profile?.uid === room.hostUid} 
            roomId={room.id} 
            hostUid={room.hostUid} 
            pkStatus={room.pkStatus}
            opponentUid={room.pkOpponentUid}
          />
          <LikeParticles ref={likeParticlesRef} onTap={handleTapLike} />
          {isMinimized && (
            <button 
              onClick={() => setIsMinimized(false)}
              className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white z-[60] pointer-events-auto"
            >
              <Maximize2 size={20} />
            </button>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col p-4 pointer-events-none">
          {isRecording && (
            <div className="absolute top-20 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/30 z-50">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Recording</span>
            </div>
          )}
          {!isCleanMode && room.pkStatus === 'battling' && <PKBattle room={room} />}
          {isSearchingPK && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-4 z-50">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-black italic uppercase text-sm">Finding Opponent...</p>
            </div>
          )}

          <AnimatePresence>
            {activeGift && (
              <GiftAnimation 
                giftName={activeGift.giftName} 
                displayName={activeGift.displayName} 
                combo={activeGift.combo} 
                animationType={activeGift.animationType}
              />
            )}
          </AnimatePresence>

          {/* Header */}
          {!isCleanMode && (
            <div className="flex flex-col gap-3 pointer-events-none">
              <div className="flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-0.5 pr-3 rounded-full border border-white/5">
                    <div className="relative">
                      <img 
                        src={hostProfile?.photoURL || `https://picsum.photos/seed/${room.hostUid}/100/100`} 
                        className="w-8 h-8 rounded-full border border-white/10 object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      {profile?.uid !== room.hostUid && (
                        <button 
                          onClick={toggleFollow}
                          className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center transition-all active:scale-90 pointer-events-auto",
                            isFollowing ? "bg-pink-500 text-white" : "bg-[#00E5FF] text-white"
                          )}
                        >
                          {isFollowing ? (
                            <div className="relative">
                              <Heart size={8} fill="currentColor" />
                              <Sparkles size={6} className="absolute -top-1 -right-1" />
                            </div>
                          ) : (
                            <Plus size={10} strokeWidth={4} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] font-bold text-white leading-tight truncate max-w-[70px]">
                          {hostProfile?.displayName || room.title.split("'s")[0]}
                        </p>
                        <Heart size={10} fill="#FFD700" className="text-[#FFD700]" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#FFD700] font-bold">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2C12 2ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18Z" fill="#FFD700"/>
                          <circle cx="12" cy="12" r="3" fill="#FFD700"/>
                        </svg>
                        {room.currentBeans || 7890}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {/* Fancy Border Avatar */}
                    <div className="relative w-7 h-7 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-yellow-400 border-dashed animate-[spin_10s_linear_infinite]" />
                      <img src="https://picsum.photos/seed/viewer1/60/60" className="w-5.5 h-5.5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    
                    {/* Simple Avatar */}
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white/20">
                      <img src="https://picsum.photos/seed/viewer2/60/60" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    {/* Green 'B' Circle */}
                    <div className="w-7 h-7 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-[12px] font-bold border border-white/10">
                      B
                    </div>

                    {/* Gray Count Circle */}
                    <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white text-[10px] font-bold border border-white/10">
                      {room.viewerCount || 458}
                    </div>
                  </div>

                  <button onClick={() => navigate('/')} className="ml-2 p-1 text-white/90 hover:text-white transition-colors">
                    <X size={22} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-3 pointer-events-auto">
                  <button className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5 text-white hover:bg-white/10 transition-colors">
                    <BarChart3 size={11} className="text-yellow-400" />
                    <span className="text-[11px] font-bold">Region List</span>
                  </button>

                  <button className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 text-white hover:bg-white/10 transition-colors">
                    <div className="w-3.5 h-3.5 bg-yellow-500 rounded-sm flex items-center justify-center">
                      <Star size={9} fill="currentColor" className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold tracking-tight">2/50</span>
                  </button>

                  {/* Likes Count moved here */}
                  <div className="flex items-center gap-1.5 bg-pink-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-pink-500/20 text-pink-500">
                    <Heart size={11} fill="currentColor" />
                    <span className="text-[11px] font-bold">{localLikes}</span>
                  </div>
                </div>

                <div className="text-[11px] font-medium text-white/50 tracking-tight pr-1">
                  ID:{room.hostUid.slice(0, 10)}
                </div>
              </div>
            </div>
          )}

          {/* Chat Area */}
          {!isCleanMode && (
            <div 
              ref={chatRef}
              onScroll={handleChatScroll}
              className="mt-auto mb-2 space-y-1.5 max-h-[40vh] overflow-y-auto no-scrollbar pointer-events-auto px-1 max-w-[60%]"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)'
              }}
            >
              {/* System Message */}
              <div className="bg-black/20 backdrop-blur-sm p-2 rounded-xl border border-white/5">
                <p className="text-[11px] text-[#00e5ff] leading-relaxed">
                  Welcome to BINGO LIVE! Please follow the community rules. No pornography, violence, or smoking. We encourage you to report any violations.
                </p>
              </div>

              {/* System Announcement */}
              {systemMessage && (
                <ChatMessage 
                  displayName="System"
                  text={systemMessage.text}
                  level={1}
                  type="system"
                />
              )}

              {messages.length > 5 && (
                <div className="absolute bottom-2 left-4 z-20">
                  <div className="bg-[#00e5ff]/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
                    <span className="text-[11px] font-black italic uppercase tracking-tight text-black">2 new messages</span>
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <ChatMessage 
                  key={msg.id}
                  displayName={msg.displayName}
                  text={msg.text}
                  level={msg.level || 1}
                  type={msg.type}
                  nobleTitle={msg.nobleTitle}
                  hostName={msg.hostName}
                  hostLevel={msg.hostLevel}
                  onFollow={toggleFollow}
                  isFollowing={isFollowing}
                />
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          {!isCleanMode && (
            <div className="flex flex-col gap-2 pointer-events-auto">
              <div className="flex items-center justify-between gap-2">
                <div 
                  onClick={() => setShowChatInput(true)}
                  className="flex-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 px-4 py-2.5 flex items-center cursor-pointer"
                >
                  <span className="text-[13px] text-white/40">Say something...</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowTools(true)}
                    className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 flex items-center justify-center"
                  >
                    <List size={20} className="text-white/80" />
                  </button>
                  <button 
                    type="button"
                    className="w-10 h-10 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 flex items-center justify-center"
                  >
                    <ShoppingBag size={20} className="text-white/80" />
                  </button>
                  <button 
                    onClick={() => setShowGifts(true)}
                    className="w-11 h-11 bg-gradient-to-br from-[#ff0099] to-[#ff6600] rounded-full text-white shadow-lg flex items-center justify-center"
                  >
                    <GiftIcon size={22} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Pop-up */}
        <AnimatePresence>
          {showChatInput && (
            <div className="fixed inset-0 z-[200] flex flex-col justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowChatInput(false)}
                className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-white rounded-t-[1.5rem] p-3 pb-6 flex flex-col gap-2.5 shadow-2xl max-h-[40vh]"
              >
                {/* Quick Replies */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
                  {['Hello 😊', '😂😂😂', 'Heart melting 💖', 'You got'].map((reply) => (
                    <button 
                      key={reply}
                      onClick={async () => {
                        if (!profile || !roomId) return;
                        try {
                          await addDoc(collection(db, `rooms/${roomId}/messages`), {
                            text: reply,
                            uid: profile.uid,
                            displayName: profile.displayName,
                            photoURL: profile.photoURL || '',
                            level: profile.level || 1,
                            type: 'chat',
                            timestamp: serverTimestamp(),
                          });
                          setShowChatInput(false);
                        } catch (error) {
                          console.error('Send quick reply error', error);
                        }
                      }}
                      className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-full text-[12px] font-semibold hover:bg-slate-100 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Icons Row */}
                <div className="flex items-center gap-6 px-1 py-0.5">
                  <button 
                    onClick={async () => {
                      if (!profile || !roomId) return;
                      try {
                        await addDoc(collection(db, `rooms/${roomId}/messages`), {
                          text: '❤️',
                          uid: profile.uid,
                          displayName: profile.displayName,
                          photoURL: profile.photoURL || '',
                          level: profile.level || 1,
                          type: 'chat',
                          timestamp: serverTimestamp(),
                        });
                        setShowChatInput(false);
                      } catch (error) {
                        console.error('Send heart error', error);
                      }
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Heart size={20} />
                  </button>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <Type size={20} />
                  </button>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <Mail size={20} />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    </div>
                  </button>
                </div>

                {/* Input Field */}
                <form 
                  onSubmit={(e) => {
                    sendMessage(e);
                    setShowChatInput(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-100">
                    <input 
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Chat with everyone"
                      className="flex-1 bg-transparent text-slate-900 text-[14px] focus:outline-none placeholder:text-slate-300"
                    />
                    <button type="button" className="text-slate-300">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      input.trim() ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-slate-50 text-slate-200"
                    )}
                  >
                    <SendHorizontal size={22} />
                  </button>
                </form>

                {/* Stickers Row */}
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-1">
                  {['🦆', '💖', '😊', '🔥', '😂', '👋', '✨'].map((sticker, i) => (
                    <button 
                      key={i} 
                      onClick={async () => {
                        if (!profile || !roomId) return;
                        try {
                          await addDoc(collection(db, `rooms/${roomId}/messages`), {
                            text: sticker,
                            uid: profile.uid,
                            displayName: profile.displayName,
                            photoURL: profile.photoURL || '',
                            level: profile.level || 1,
                            type: 'chat',
                            timestamp: serverTimestamp(),
                          });
                          setShowChatInput(false);
                        } catch (error) {
                          console.error('Send sticker error', error);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-slate-50 flex-shrink-0 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-50"
                    >
                      <span className="text-xl">{sticker}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Clean Mode Exit Button */}
        {isCleanMode && (
          <button 
            onClick={() => setIsCleanMode(false)}
            className="fixed bottom-6 right-6 z-[110] w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white shadow-2xl"
          >
            <X size={24} />
          </button>
        )}

        <AnimatePresence>
          {showReport && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReport(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 mb-6">Report Room</h3>
                <div className="space-y-3">
                  {['Pornography', 'Violence', 'Spam', 'Harassment', 'Other'].map((reason) => (
                    <button 
                      key={reason}
                      onClick={() => handleReport(reason)}
                      className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-left transition-all border border-slate-100"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowReport(false)}
                  className="mt-4 w-full p-3 text-center text-slate-400 text-sm font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
          {showTools && (
            <RoomToolsModal 
              onClose={() => setShowTools(false)} 
              isHost={profile?.uid === room.hostUid} 
              onAction={handleToolAction}
              currentQuality={quality}
              isCleanMode={isCleanMode}
              isRecording={isRecording}
              isLowLatency={isLowLatency}
            />
          )}
          {showGames && (
            <RoomToolsModal 
              onClose={() => setShowGames(false)} 
              isHost={profile?.uid === room.hostUid} 
              initialSection="games"
              onAction={handleToolAction}
            />
          )}
        </AnimatePresence>
        {showGifts && <GiftingModal hostUid={room.hostUid} roomId={room.id} onClose={() => setShowGifts(false)} />}
        
        {/* Block Confirmation Modal */}
        <AnimatePresence>
          {showBlockConfirm && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBlockConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                  <Ban size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Block Host?</h3>
                  <p className="text-sm text-slate-500 mt-2">You will no longer see this host's live streams and will be redirected to the home page.</p>
                </div>
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={() => {
                      setNotification({ message: 'Host blocked successfully', type: 'success' });
                      setTimeout(() => navigate('/'), 1000);
                    }}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
                  >
                    Confirm Block
                  </button>
                  <button 
                    onClick={() => setShowBlockConfirm(false)}
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="fixed top-0 left-1/2 -translate-x-1/2 z-[350] px-6 py-3 rounded-2xl bg-white shadow-2xl border border-slate-100 flex items-center gap-3 min-w-[300px]"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                notification.type === 'success' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
              )}>
                {notification.type === 'success' ? <Star size={16} fill="currentColor" /> : <Bell size={16} />}
              </div>
              <span className="text-sm font-bold text-slate-700">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] overflow-hidden">
      <div className="h-[40vh] lg:h-full lg:flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            src={`https://picsum.photos/seed/${room.id}/1920/1080`} 
            className="w-full h-full object-cover opacity-10"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
        
        <div className="relative z-10 aspect-video w-full max-w-5xl bg-white/5 lg:rounded-3xl border-y lg:border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
          {room.pkStatus === 'battling' && <PKBattle room={room} />}
          {isSearchingPK && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center gap-4 z-50">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-black italic uppercase text-xl">Finding Opponent...</p>
            </div>
          )}

          <AnimatePresence>
            {activeGift && (
              <GiftAnimation 
                giftName={activeGift.giftName} 
                displayName={activeGift.displayName} 
                combo={activeGift.combo} 
                animationType={activeGift.animationType}
              />
            )}
          </AnimatePresence>

          <VideoStream 
            isHost={profile?.uid === room.hostUid} 
            roomId={room.id} 
            hostUid={room.hostUid} 
            pkStatus={room.pkStatus}
            opponentUid={room.pkOpponentUid}
          />
          <LikeParticles ref={likeParticlesRef} onTap={handleTapLike} />
        </div>
      </div>

      <div className="w-full lg:w-96 bg-[#0a0a0a] border-l border-white/10 flex flex-col h-[60vh] lg:h-full">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden">
              <img src={`https://picsum.photos/seed/${room.hostUid}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{room.title}</p>
                {profile?.uid !== room.hostUid && (
                  <button 
                    onClick={toggleFollow}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg transition-all active:scale-95 flex items-center justify-center min-w-[50px]",
                      isFollowing 
                        ? "bg-pink-500 text-white shadow-pink-500/20" 
                        : "bg-[#00e5ff] text-black shadow-[#00e5ff]/20"
                    )}
                  >
                    {isFollowing ? <WingedHeart size={14} fill="currentColor" /> : "Follow"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <span className="flex items-center gap-1"><Users size={10} /> {room.viewerCount}</span>
                <span className="flex items-center gap-1"><Coins size={10} /> {room.currentBeans}</span>
                <span className="flex items-center gap-1 text-pink-500"><Heart size={10} fill="currentColor" /> {localLikes}</span>
              </div>
            </div>
          </div>
          {profile?.uid === room.hostUid && (
            <button 
              onClick={room.pkStatus === 'battling' ? endPK : startPK}
              className="px-4 py-1.5 bg-orange-500 text-white text-xs font-black italic rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              {room.pkStatus === 'battling' ? 'END PK' : 'START PK'}
            </button>
          )}
        </div>

        <div 
          ref={desktopChatRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 100%)'
          }}
        >
          {systemMessage && (
            <ChatMessage 
              displayName="System"
              text={systemMessage.text}
              level={0}
              type="system"
            />
          )}
          {messages.map(msg => (
            <ChatMessage 
              key={msg.id}
              displayName={msg.displayName}
              text={msg.text}
              level={msg.level || 1}
              nobleTitle={msg.nobleTitle}
              type={msg.type}
              hostName={msg.hostName}
              hostLevel={msg.hostLevel}
              onFollow={toggleFollow}
              isFollowing={isFollowing}
            />
          ))}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40 relative">
          {/* Quick Replies */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
            {["Hello 😊", "👍👍👍", "Well done 👍", "Sending big love ❤️"].map((reply) => (
              <button
                key={reply}
                onClick={() => setInput(reply)}
                className="whitespace-nowrap px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[11px] font-medium text-white/90 border border-white/5 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 flex flex-wrap gap-3 justify-center z-50 shadow-2xl"
              >
                {emojis.map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 transition-colors",
                  showEmojiPicker ? "text-[#00e5ff]" : "text-white/40 hover:text-white"
                )}
              >
                <Smile size={18} />
              </button>
            </div>

            <button 
              type="button"
              onClick={sendLike}
              className="p-2 bg-pink-500/20 border border-pink-500/30 rounded-xl text-pink-500 hover:bg-pink-500/30 transition-colors"
              title="Send Like"
            >
              <Heart size={20} fill="currentColor" />
            </button>

            <button 
              type="button"
              onClick={() => setShowGifts(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-orange-500 hover:bg-white/10 transition-colors"
            >
              <GiftIcon size={20} />
            </button>

            <button 
              type="button"
              onClick={() => setShowTools(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 transition-colors"
              title="Room Tools"
            >
              <List size={20} />
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 mb-6">Report Room</h3>
              <div className="space-y-3">
                {['Pornography', 'Violence', 'Spam', 'Harassment', 'Other'].map((reason) => (
                  <button 
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-left transition-all border border-slate-100"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="mt-4 w-full p-3 text-center text-slate-400 text-sm font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
        {showTools && (
          <RoomToolsModal 
            onClose={() => setShowTools(false)} 
            isHost={profile?.uid === room.hostUid} 
            onAction={handleToolAction}
            currentQuality={quality}
            isCleanMode={isCleanMode}
            isRecording={isRecording}
            isLowLatency={isLowLatency}
          />
        )}
        {showGames && (
          <RoomToolsModal 
            onClose={() => setShowGames(false)} 
            isHost={profile?.uid === room.hostUid} 
            initialSection="games"
            onAction={handleToolAction}
          />
        )}
      </AnimatePresence>
      {showGifts && <GiftingModal hostUid={room.hostUid} roomId={room.id} onClose={() => setShowGifts(false)} />}
      
      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <Ban size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900">Block Host?</h3>
                <p className="text-sm text-slate-500 mt-2">You will no longer see this host's live streams and will be redirected to the home page.</p>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    setNotification({ message: 'Host blocked successfully', type: 'success' });
                    setTimeout(() => navigate('/'), 1000);
                  }}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-lg shadow-red-500/20"
                >
                  Confirm Block
                </button>
                <button 
                  onClick={() => setShowBlockConfirm(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[350] px-6 py-3 rounded-2xl bg-white shadow-2xl border border-slate-100 flex items-center gap-3 min-w-[300px]"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              notification.type === 'success' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
            )}>
              {notification.type === 'success' ? <Star size={16} fill="currentColor" /> : <Bell size={16} />}
            </div>
            <span className="text-sm font-bold text-slate-700">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
