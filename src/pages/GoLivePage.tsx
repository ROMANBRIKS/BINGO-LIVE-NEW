import React, { useState, useEffect, useRef } from 'react';
import { GiftCombo } from '../components/GiftCombo';
import { GiftAnimation } from '../components/GiftAnimation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, FlipHorizontal, Sparkles, Wand2, Maximize2, ChevronDown, Edit2, MessageCircle, Menu, Link2, Gift, StopCircle, Smile, SendHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PKBattle } from '../components/PKBattle';
import { ChatMessage } from '../components/ChatMessage';
import { NobleEntrance } from '../components/NobleEntrance';
import { MicQueue } from '../components/MicQueue';
import { initializeSeats, handleMicRequest, assignSeat, removeGuest, toggleMute } from '../micQueueLogic';
import { GuestSeat, MicRequest, PKForfeit } from '../types';
import { createThankYouMessage } from '../followLogic';
import { generateSimulatedMessage } from '../simulationLogic';
import { calculatePkResult, generatePkIncrements } from '../pkLogic';
import { getSnipeMultiplier, calculateFinalPKResult } from '../pkEnhancedLogic';
import { PK_SHIELDS, calculateShieldedScore } from '../pkShieldLogic';
import { ShieldTier } from '../types';

const MODES = ['Multi-guest LIVE', 'LIVE', 'Audio Live', 'Game LIVE'];

export default function GoLivePage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [title, setTitle] = useState('April Fools 🤪💕💋');
  const [activeMode, setActiveMode] = useState('LIVE');
  const [status, setStatus] = useState<'setup' | 'preparing' | 'countdown' | 'live'>('setup');
  const [countdown, setCountdown] = useState(3);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<{ 
    id: string; 
    displayName?: string; 
    hostName?: string;
    hostLevel?: number;
    text: string; 
    type: 'chat' | 'join' | 'like' | 'system' | 'follow' | 'follow-prompt' | 'like-prompt' | 'guest-live-prompt' | 'gift' | 'welcome' | 'mic-request'; 
    level?: number; 
    hostPhoto?: string;
    timestamp?: number;
  }[]>([]);
  const [activeGift, setActiveGift] = useState<{ giftName: string, displayName: string, userPhoto?: string, combo: number, animationType?: string, nobleTier?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showChatInput, setShowChatInput] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const visibleMessages = React.useMemo(() => {
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    
    const systemMsg = {
      id: 'system-welcome',
      type: 'system' as const,
      displayName: 'System',
      text: 'Minors are strictly prohibited from using BINGO LIVE. The review team will monitor rooms 24/7. Please report any violations.',
      timestamp: 0
    };

    return [systemMsg, ...messages]
      .filter(msg => {
        if (msg.id === 'system-welcome') return true;
        
        // Host should never see follow-prompt
        if (msg.type === 'follow-prompt') return false;

        const ts = msg.timestamp || Date.now();
        return ts > fiveMinutesAgo;
      })
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messages, currentTime]);

  // PK Simulation State
  const [isPkActive, setIsPkActive] = useState(false);
  const [pkRound, setPkRound] = useState(1);
  const [pkScore, setPkScore] = useState(0);
  const [pkOpponentScore, setPkOpponentScore] = useState(0);
  const pkScoreRef = useRef(0);
  const pkOpponentScoreRef = useRef(0);
  const [pkEndTime, setPkEndTime] = useState<string | null>(null);
  const [pkResults, setPkResults] = useState<('win' | 'loss' | 'draw')[]>([]);
  const [pkForfeit, setPkForfeit] = useState<PKForfeit | null>(null);

  const [pkShieldTier, setPkShieldTier] = useState<ShieldTier | null>(null);
  const [pkShieldAbsorbed, setPkShieldAbsorbed] = useState(0);
  const [pkShieldEndTime, setPkShieldEndTime] = useState<string | null>(null);

  const [pkOpponentShieldTier, setPkOpponentShieldTier] = useState<ShieldTier | null>(null);
  const [pkOpponentShieldAbsorbed, setPkOpponentShieldAbsorbed] = useState(0);
  const [pkOpponentShieldEndTime, setPkOpponentShieldEndTime] = useState<string | null>(null);

  const [nobleEntranceUser, setNobleEntranceUser] = useState<{ displayName: string, tier: any } | null>(null);
  const [seats, setSeats] = useState<GuestSeat[]>(initializeSeats());
  const [micQueue, setMicQueue] = useState<MicRequest[]>([]);
  const pkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roundTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated Chat/Gifts/Joins during Live
  useEffect(() => {
    if (status !== 'live') {
      setMessages([]);
      return;
    }

    const interval = setInterval(() => {
      const newMessage = generateSimulatedMessage(profile);

      setMessages(prev => {
        const updated = [...prev, newMessage].slice(-50);
        
        if (newMessage.type === 'mic-request') {
          setMicQueue(q => {
            if (q.some(r => r.uid === newMessage.id)) return q;
            const newReq: MicRequest = {
              uid: newMessage.id,
              displayName: newMessage.displayName || 'Guest',
              photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMessage.displayName}`,
              timestamp: Date.now(),
              type: 'audio',
              nobleTier: newMessage.nobleTier as any
            };
            return [...q, newReq];
          });
        }

        if (newMessage.type === 'join' && newMessage.nobleTier && newMessage.nobleTier !== 'None') {
          setNobleEntranceUser({ displayName: newMessage.displayName, tier: newMessage.nobleTier });
        }

        if (newMessage.type === 'follow') {
          const thankYou = createThankYouMessage(newMessage.displayName, profile);
          return [...updated, thankYou].slice(-50);
        }
        
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.type === 'gift') {
        const giftName = lastMsg.text.replace('sent a ', '').replace('! 🎁', '');
        const animationType = (lastMsg as any).animationType || 'standard';
        const nobleTier = (lastMsg as any).nobleTier || 'None';
        
        setActiveGift(prev => {
          if (prev && prev.giftName === giftName && prev.displayName === lastMsg.displayName) {
            return { ...prev, combo: prev.combo + 1, animationType, nobleTier };
          }
          return { 
            giftName, 
            displayName: lastMsg.displayName, 
            userPhoto: lastMsg.hostPhoto,
            combo: 1, 
            animationType,
            nobleTier
          };
        });
      }
    }
  }, [messages]);

  const lastMessageCountRef = useRef(0);

  useEffect(() => {
    const currentCount = messages.length;
    if (chatContainerRef.current) {
      if (isAtBottom) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        setHasNewMessages(false);
      } else if (currentCount > lastMessageCountRef.current) {
        setHasNewMessages(true);
      }
    }
    lastMessageCountRef.current = currentCount;
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
      if (atBottom) {
        setHasNewMessages(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
      setHasNewMessages(false);
    }
  };

  useEffect(() => {
    if (isPkActive && pkEndTime) {
      const checkTime = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(pkEndTime).getTime();
        if (now >= end) {
          handleRoundEnd();
          clearInterval(checkTime);
        }
      }, 1000);
      return () => clearInterval(checkTime);
    }
  }, [isPkActive, pkEndTime, pkRound]);

  const handleRoundEnd = () => {
    if (pkIntervalRef.current) clearInterval(pkIntervalRef.current);
    
    const currentScore = pkScoreRef.current;
    const currentOpponentScore = pkOpponentScoreRef.current;
    
    let result = calculatePkResult(currentScore, currentOpponentScore);

    const newResults = [...pkResults, result];
    setPkResults(newResults);

    if (pkRound < 3) {
      // Start next round after a short break
      setTimeout(() => {
        setPkRound(prev => prev + 1);
        setPkScore(0);
        pkScoreRef.current = 0;
        setPkOpponentScore(0);
        pkOpponentScoreRef.current = 0;
        setPkEndTime(new Date(Date.now() + 20000).toISOString());
        startScoreSimulation();
      }, 3000);
    } else {
      // PK Finished
      const finalResult = calculateFinalPKResult({
        hostUid: profile?.uid || 'host',
        pkScore: pkScoreRef.current,
        pkOpponentScore: pkOpponentScoreRef.current,
        pkOpponentUid: 'opponent',
        pkResults: newResults,
        pkRound: 3
      } as any);

      if (finalResult.forfeit) {
        setPkForfeit(finalResult.forfeit);
        setMessages(prev => [...prev, {
          id: 'pk-forfeit-' + Date.now(),
          type: 'system',
          text: `PK OVER! Loser must: ${finalResult.forfeit?.description}`,
          timestamp: Date.now()
        }]);
      }

      setTimeout(() => {
        stopPk();
        setPkForfeit(null);
      }, 8000);
    }
  };

  const startScoreSimulation = () => {
    if (pkIntervalRef.current) clearInterval(pkIntervalRef.current);
    
    pkIntervalRef.current = setInterval(() => {
      const { hostInc, oppInc } = generatePkIncrements(pkRound);
      const multiplier = pkEndTime ? getSnipeMultiplier(pkEndTime) : 1.0;
      
      // Apply Host Shield to Opponent's Increment
      let finalOppInc = Math.floor(oppInc * multiplier);
      const hShield = pkShieldTier ? PK_SHIELDS[pkShieldTier] : null;
      const hShieldActive = hShield && pkShieldEndTime && new Date(pkShieldEndTime).getTime() > Date.now();
      
      if (hShieldActive) {
        const { passedScore, newlyAbsorbed } = calculateShieldedScore(finalOppInc, hShield, pkShieldAbsorbed);
        finalOppInc = passedScore;
        setPkShieldAbsorbed(newlyAbsorbed);
      }

      // Apply Opponent Shield to Host's Increment
      let finalHostInc = Math.floor(hostInc * multiplier);
      const oShield = pkOpponentShieldTier ? PK_SHIELDS[pkOpponentShieldTier] : null;
      const oShieldActive = oShield && pkOpponentShieldEndTime && new Date(pkOpponentShieldEndTime).getTime() > Date.now();

      if (oShieldActive) {
        const { passedScore, newlyAbsorbed } = calculateShieldedScore(finalHostInc, oShield, pkOpponentShieldAbsorbed);
        finalHostInc = passedScore;
        setPkOpponentShieldAbsorbed(newlyAbsorbed);
      }

      setPkScore(prev => {
        const next = prev + finalHostInc;
        pkScoreRef.current = next;
        return next;
      });
      setPkOpponentScore(prev => {
        const next = prev + finalOppInc;
        pkOpponentScoreRef.current = next;
        return next;
      });

      // Randomly activate shields for simulation
      if (!pkShieldTier && Math.random() < 0.05) {
        const tiers: ShieldTier[] = ['Light', 'Standard', 'Heavy', 'Emergency'];
        const tier = tiers[Math.floor(Math.random() * tiers.length)];
        setPkShieldTier(tier);
        setPkShieldAbsorbed(0);
        setPkShieldEndTime(new Date(Date.now() + PK_SHIELDS[tier].duration * 1000).toISOString());
      }

      if (!pkOpponentShieldTier && Math.random() < 0.05) {
        const tiers: ShieldTier[] = ['Light', 'Standard', 'Heavy', 'Emergency'];
        const tier = tiers[Math.floor(Math.random() * tiers.length)];
        setPkOpponentShieldTier(tier);
        setPkOpponentShieldAbsorbed(0);
        setPkOpponentShieldEndTime(new Date(Date.now() + PK_SHIELDS[tier].duration * 1000).toISOString());
      }

    }, 1000);
  };

  const startPkSimulation = () => {
    if (!profile || status !== 'live') return;
    
    setIsPkActive(true);
    setPkRound(1);
    setPkScore(0);
    pkScoreRef.current = 0;
    setPkOpponentScore(0);
    pkOpponentScoreRef.current = 0;
    setPkResults([]);
    setPkEndTime(new Date(Date.now() + 20000).toISOString());
    startScoreSimulation();
  };

  const stopPk = () => {
    setIsPkActive(false);
    setPkEndTime(null);
    if (pkIntervalRef.current) clearInterval(pkIntervalRef.current);
    if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
  };

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartBroadcast = async () => {
    if (!profile || status !== 'setup') return;
    
    // Phase 1: Preparing
    setStatus('preparing');
    
    setTimeout(() => {
      // Phase 2: Countdown & UI Change
      setStatus('countdown');
      let count = 3;
      setCountdown(count);
      
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(interval);
          // Small delay on 0 before finalizing
          setTimeout(() => {
            finalizeBroadcast();
          }, 800);
        }
      }, 1000);
    }, 1000);
  };

  const finalizeBroadcast = async () => {
    try {
      const roomData = {
        hostUid: profile?.uid,
        title: title || `${profile?.displayName}'s Live Stream`,
        status: 'live',
        type: activeMode === 'Audio Live' ? 'audio' : 'video',
        currentBeans: 0,
        viewerCount: 0,
        guests: [],
        seats: initializeSeats(),
        micQueue: [],
        isPrivate: false,
        createdAt: serverTimestamp(),
        pkStatus: 'idle'
      };

      await addDoc(collection(db, 'rooms'), roomData);
      setStatus('live');
    } catch (error) {
      console.error("Error creating room:", error);
      showToast("Failed to start broadcast. Please try again.", 'error');
      setStatus('setup');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { 
      id: Math.random().toString(), 
      displayName: profile?.displayName || 'Me', 
      text: input, 
      type: 'chat' as const, 
      level: profile?.level || 1, 
      timestamp: Date.now() 
    }].slice(-50));
    
    setInput('');
    setShowChatInput(false);
  };

  const handleJoinMicRequest = (type: 'audio' | 'video') => {
    if (!profile) return;
    setMicQueue(prev => handleMicRequest(prev, profile, type));
  };

  const handleAssignSeat = (seatId: number, request: MicRequest) => {
    setSeats(prev => assignSeat(prev, seatId, request.uid, request.type));
    setMicQueue(prev => prev.filter(req => req.uid !== request.uid));
  };

  const handleRemoveGuest = (seatId: number) => {
    setSeats(prev => removeGuest(prev, seatId));
  };

  const handleToggleMute = (seatId: number) => {
    setSeats(prev => toggleMute(prev, seatId));
  };

  const handleToggleLock = (seatId: number) => {
    setSeats(prev => prev.map(s => s.seatId === seatId ? { ...s, status: s.status === 'locked' ? 'empty' : 'locked' } : s));
  };

  return (
    <div className="absolute inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Camera Preview Background */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {status === 'setup' || status === 'preparing' ? (
        <>
          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between p-4">
            <div className="w-10" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
              </div>
              <span className="text-[11px] font-black tracking-[0.15em] text-white uppercase">Bingo Live</span>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative z-10 flex-1 flex flex-col p-4">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xs relative">
              <div className="absolute top-2 right-2 bg-pink-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm text-white tracking-widest">
                New
              </div>
              <div className="flex gap-3">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 border border-white/20 relative">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Camera size={24} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-100 group-hover:bg-black/60 transition-colors">
                      <Edit2 size={14} className="text-white mb-0.5" />
                      <span className="text-[8px] font-bold uppercase text-white">Edit</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
                      <div className="w-full h-full bg-indigo-600/80 clip-path-hexagon flex flex-col items-center justify-center p-0.5 leading-none">
                        <span className="text-[4px] font-bold text-white/60">10th</span>
                        <span className="text-[5px] font-black text-white">Carnival</span>
                        <span className="text-[4px] font-bold text-white/60">Eve</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-white/40"
                    placeholder="Add a title..."
                  />
                  <button className="mt-2 flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors">
                    Select tag <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto mb-8">
              <div className="flex items-center justify-center gap-8 mb-8">
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <FlipHorizontal size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Flip</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Beauty</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Wand2 size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Magic</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Camera size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Camera</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Expand</span>
                </button>
              </div>

              <div className="flex justify-center mb-8">
                <button 
                  onClick={handleStartBroadcast}
                  disabled={status === 'preparing'}
                  className="w-full max-w-xs py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-[0.2em] rounded-full shadow-[0_10px_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {status === 'preparing' ? "Preparing..." : "Go LIVE"}
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide px-4">
                {MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${
                      activeMode === mode 
                        ? 'text-white scale-110' 
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {mode}
                    {activeMode === mode && (
                      <motion.div 
                        layoutId="activeMode"
                        className="w-1 h-1 bg-white rounded-full mx-auto mt-1"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Countdown & Live UI Phase */
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Top Bar Live */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                <img src={profile?.photoURL || ''} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold leading-none text-white">{profile?.displayName}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-[8px] font-bold text-yellow-400">1638</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                <span className="text-xs font-bold">0</span>
              </div>
              <button onClick={() => setStatus('setup')} className="text-white/80">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Left Side Goals/Actions */}
          <div className="flex flex-col gap-2 p-4 mt-4">
            {['Dance', '360', 'Wish', 'Kiss', 'Spill secret'].map((action) => (
              <div key={action} className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-lg px-2 py-1.5 border border-white/5 w-fit">
                <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center">
                  <Sparkles size={10} className="text-white/40" />
                </div>
                <span className="text-[10px] font-bold text-white/80">{action}</span>
              </div>
            ))}
          </div>

          {/* Countdown Overlay */}
          {status === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.span 
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-[180px] font-black text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                {countdown}
              </motion.span>
            </div>
          )}

          {/* PK Battle Overlay */}
          {isPkActive && (
            <PKBattle 
              room={{
                pkScore,
                pkOpponentScore,
                pkEndTime,
                pkRound,
                pkResults,
                pkForfeit,
                pkShieldTier,
                pkShieldAbsorbed,
                pkShieldEndTime,
                pkOpponentShieldTier,
                pkOpponentShieldAbsorbed,
                pkOpponentShieldEndTime
              }} 
            />
          )}

          {/* Right Side Notifications */}
          <div className="absolute right-4 top-40 flex flex-col items-end gap-4">
            {isPkActive && (
              <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md animate-bounce">
                PK BATTLE ACTIVE
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                </div>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-white">Bells</span>
            </div>
            <div className="bg-blue-500/80 backdrop-blur-md rounded-full pl-1 pr-4 py-1 flex items-center gap-2 border border-white/20">
              <div className="w-6 h-6 bg-white rounded-full overflow-hidden">
                <div className="w-full h-full bg-blue-400" />
              </div>
              <span className="text-[10px] font-bold text-white">HNM 🦋🌹</span>
            </div>
          </div>

          {/* Bottom Area */}
          <div className="mt-auto p-4 space-y-4 relative">
            {/* New Messages Indicator */}
            {hasNewMessages && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={scrollToBottom}
                className="absolute -top-8 left-4 bg-cyan-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg z-20"
              >
                New Messages <ChevronDown size={12} />
              </motion.button>
            )}

            {/* Chat Section - 65% width */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="w-[65%] flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-hide scroll-smooth"
            >
              <div className="flex flex-col gap-1 min-h-full justify-end items-start">
                <div className="flex-1" />
                {visibleMessages.map(msg => (
                  <ChatMessage 
                    key={msg.id} 
                    message={{
                      ...msg,
                      onFollow: () => {},
                      onLike: () => {},
                      onJoinGuest: () => {},
                      onClick: () => {
                        if (msg.displayName && msg.type !== 'system') {
                          setInput(`@${msg.displayName} `);
                          setShowChatInput(true);
                        }
                      }
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Quick Replies */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 pointer-events-auto">
              {['Hi 👋', '😘😘😘', 'So gorgeous!', 'Good vibes'].map((reply) => (
                <button
                  key={reply}
                  onClick={() => {
                    setMessages(prev => [...prev, { 
                      id: Math.random().toString(), 
                      displayName: profile?.displayName || 'Me', 
                      text: reply, 
                      type: 'chat' as const, 
                      level: profile?.level || 1, 
                      timestamp: Date.now() 
                    }].slice(-50));
                  }}
                  className="whitespace-nowrap px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-medium border border-white/10 active:scale-95 transition-transform"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Streamer Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowChatInput(true)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Menu size={20} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-cyan-400/20 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center">
                  <Link2 size={20} className="text-cyan-400" />
                </button>
                <button 
                  onClick={startPkSimulation}
                  className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                    isPkActive 
                      ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'bg-indigo-500/20 border-indigo-500/30'
                  }`}
                >
                  <span className={`text-[10px] font-black italic ${isPkActive ? 'text-white' : 'text-indigo-400'}`}>PK</span>
                </button>
                {isPkActive && (
                  <button 
                    onClick={stopPk}
                    className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 flex items-center justify-center animate-pulse"
                  >
                    <StopCircle size={20} className="text-red-400" />
                  </button>
                )}
                <button className="w-10 h-10 rounded-full bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 flex items-center justify-center">
                  <div className="w-5 h-4 bg-yellow-400 rounded-sm" />
                </button>
                <button className="w-10 h-10 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/30 flex items-center justify-center">
                  <Gift size={20} className="text-pink-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      setMessages(prev => [...prev, { 
                        id: Math.random().toString(), 
                        displayName: profile?.displayName || 'Me', 
                        text: sticker, 
                        type: 'chat' as const, 
                        level: profile?.level || 1, 
                        timestamp: Date.now() 
                      }].slice(-50));
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
      </AnimatePresence>

      <NobleEntrance 
        user={nobleEntranceUser} 
        onComplete={() => setNobleEntranceUser(null)} 
      />

      {/* MIC QUEUE / GUEST SEATS */}
      {status === 'live' && (
        <div className="fixed left-4 right-4 top-[120px] z-30 pointer-events-auto">
          <MicQueue 
            isHost={true}
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

      {/* Gift Combo Overlay */}
      <div className="fixed top-1/3 left-4 z-[200] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {activeGift && (
            <GiftCombo 
              key={`${activeGift.displayName}-${activeGift.giftName}`}
              giftName={activeGift.giftName}
              displayName={activeGift.displayName}
              userPhoto={activeGift.userPhoto}
              combo={activeGift.combo}
              nobleTier={activeGift.nobleTier}
              onComplete={() => setActiveGift(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {activeGift && (activeGift.animationType === 'kiss' || activeGift.animationType === 'flower') && (
        <GiftAnimation 
          giftName={activeGift.giftName} 
          displayName={activeGift.displayName} 
          animationType={activeGift.animationType} 
          nobleTier={activeGift.nobleTier}
        />
      )}
    </div>
  );
}
