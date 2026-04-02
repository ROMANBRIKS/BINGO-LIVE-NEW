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
  Phone, PhoneCall, Check, Video, Mic, MicOff, VideoOff, Share2, MoreHorizontal
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

  useEffect(() => {
    if (roomId) {
      setSystemMessage({
        id: 'system-welcome',
        type: 'system',
        text: 'Minors are strictly prohibited from using BINGO LIVE. The review team will monitor rooms 24/7. Please report any violations.',
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
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
    });
    return () => { unsubRoom(); unsubMsgs(); };
  }, [roomId]);

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
          <div className="flex flex-col pointer-events-none px-4 pt-10">
            {/* Bingo Live Logo at the very top */}
            <div className="flex flex-col items-center gap-1 mb-2">
              <h1 className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Bingo Live</h1>
              <div className="h-[1px] w-12 bg-white/10" />
            </div>

            {/* System Warning Banner */}
            <div className="bg-red-500/10 border-y border-red-500/20 py-1.5 px-4 mb-4">
              <p className="text-[9px] text-red-400 font-bold text-center leading-tight uppercase tracking-wider">
                Minors are strictly prohibited from using BINGO LIVE. The review team will monitor rooms 24/7. Please report any violations.
              </p>
            </div>

            <div className="flex items-center justify-between pointer-events-auto">
              {/* Left Group: Host Info & Coin Balance */}
              <div className="flex items-center gap-3">
                <div className="bg-black/30 backdrop-blur-3xl p-1.5 pr-5 rounded-full border border-white/10 flex items-center gap-3 shadow-xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                    <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/150?u=host'} alt="Host" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 text-[14px] font-black italic tracking-tight">1319198</span>
                  </div>
                </div>
                {/* Random User Avatar 1 */}
                <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-3xl border border-white/10 overflow-hidden flex items-center justify-center">
                  <img src="https://i.pravatar.cc/100?u=user1" alt="User" className="w-full h-full object-cover opacity-60" />
                </div>
              </div>

              {/* Right Group: Viewers & Close */}
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 bg-black/30 backdrop-blur-3xl rounded-full border border-white/10 flex items-center justify-center text-white font-black text-lg">D</div>
                <div className="w-11 h-11 bg-black/30 backdrop-blur-3xl rounded-full border border-white/10 overflow-hidden flex items-center justify-center">
                  <img src="https://i.pravatar.cc/100?u=user2" alt="User" className="w-full h-full object-cover opacity-60" />
                </div>
                <div className="bg-black/30 backdrop-blur-3xl rounded-full px-5 py-2.5 border border-white/10 flex items-center gap-1.5 shadow-xl">
                  <span className="text-white text-[15px] font-black tracking-tighter">63</span>
                </div>
                <button onClick={() => navigate('/')} className="w-11 h-11 bg-black/30 backdrop-blur-3xl rounded-full text-white border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                  <X size={26} strokeWidth={3} />
                </button>
              </div>
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
        <div className="mt-auto p-4 flex flex-col gap-4 pointer-events-none">
          {!isCleanMode && (
            <div className="flex flex-col gap-4">
              {/* System Message Replicated */}
              {systemMessage && (
                <div className="bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/5 max-w-[80%] pointer-events-auto">
                  <p className="text-[13px] text-[#00e5ff] font-medium leading-relaxed drop-shadow-sm">{systemMessage.text}</p>
                </div>
              )}
              
              {/* Chat Messages */}
              <div ref={chatRef} onScroll={handleChatScroll} className="max-h-[30vh] overflow-y-auto no-scrollbar flex flex-col gap-2 pointer-events-auto">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
              </div>

              {/* Bottom Interaction Bar */}
              <div className="flex items-center justify-between pointer-events-auto pb-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowChatInput(true)} className="w-12 h-12 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <MessageSquare size={22} />
                  </button>
                  <button onClick={() => setShowTools(true)} className="w-12 h-12 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <List size={22} />
                  </button>
                  <button className="w-12 h-12 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-white/80 active:scale-90 transition-transform">
                    <ShoppingBag size={22} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={sendLike} className="w-12 h-12 bg-black/40 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 text-pink-500 active:scale-90 transition-transform">
                    <Heart size={24} fill={localLikes > 0 ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setShowGifts(true)} className="w-14 h-14 bg-gradient-to-br from-[#ff0099] to-[#ff6600] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-transform">
                    <GiftIcon size={28} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS & OVERLAYS */}
      <AnimatePresence>
        {showChatInput && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChatInput(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white rounded-t-[2.5rem] p-6 pb-12 shadow-2xl">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Say something nice..." className="flex-1 bg-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:outline-none" />
                <button type="submit" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"><SendHorizontal size={24} /></button>
              </form>
            </motion.div>
          </div>
        )}
        {showTools && <RoomToolsModal onClose={() => setShowTools(false)} isHost={profile?.uid === room.hostUid} onAction={handleToolAction} currentQuality={quality} isCleanMode={isCleanMode} isRecording={isRecording} isLowLatency={isLowLatency} />}
        {showGifts && <GiftingModal hostUid={room.hostUid} roomId={room.id} onClose={() => setShowGifts(false)} />}
      </AnimatePresence>

      <LikeParticles ref={likeParticlesRef} />
      {activeGift && <GiftAnimation giftName={activeGift.giftName} displayName={activeGift.displayName} combo={activeGift.combo} animationType={activeGift.animationType} />}
    </div>
  );
}
