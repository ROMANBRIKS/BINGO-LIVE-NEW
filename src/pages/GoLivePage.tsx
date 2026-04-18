import React, { useState, useEffect, useRef } from 'react';
import { GiftCombo } from '../components/GiftCombo';
import { GiftAnimation } from '../components/GiftAnimation';
import { motion, AnimatePresence } from 'motion/react';
import { mediaPipeService, ARSettings } from '../services/MediaPipeService';
import { streamingService } from '../services/streamingService';
import { cn } from '../lib/utils';
import { AILiveAssistant, StreamStats } from '../components/AILiveAssistant';
import { MiniGameCenter, MiniGame } from '../components/MiniGameCenter';
import { X, Camera, FlipHorizontal, Sparkles, Wand2, Maximize2, ChevronDown, Edit2, MessageCircle, Menu, Link2, Gift, StopCircle, Smile, SendHorizontal, Crown, Glasses, Gamepad2, UserCircle, Mic, Youtube, Music, Mic2, RotateCw, Columns2, Heart, Star, Layout, Palette, User, Waves, Settings as SettingsIcon, Megaphone, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PKBattle } from '../components/PKBattle';
import { YoutubePlayer } from '../components/YoutubePlayer';
import { MusicPlayer } from '../components/MusicPlayer';
import { PredictionSystem } from '../components/PredictionSystem';
import { ChatMessage } from '../components/ChatMessage';
import { NobleEntrance } from '../components/NobleEntrance';
import { MicQueue } from '../components/MicQueue';
import { initializeSeats, handleMicRequest, assignSeat, removeGuest, toggleMute } from '../micQueueLogic';
import { GuestSeat, MicRequest, PKForfeit, StreamType } from '../types';
import { createThankYouMessage } from '../followLogic';
import { generateSimulatedMessage } from '../simulationLogic';
import { calculatePkResult, generatePkIncrements } from '../pkLogic';
import { getSnipeMultiplier, calculateFinalPKResult } from '../pkEnhancedLogic';
import { PK_SHIELDS, calculateShieldedScore } from '../pkShieldLogic';
import { ShieldTier } from '../types';

const CATEGORIES = [
  { id: 'chat', label: 'Chat', icon: MessageCircle, color: '#22c55e' },
  { id: 'dating', label: 'Dating', icon: Smile, color: '#a855f7' },
  { id: 'games', label: 'Games', icon: Gamepad2, color: '#a855f7' },
  { id: 'interests', label: 'Interests', icon: Star, color: '#eab308' },
  { id: 'emotional', label: 'Emotional', icon: Heart, color: '#ec4899' },
];

const THEME_TABS = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'background', label: 'Background', icon: Camera },
  { id: 'mic', label: 'Mic Decor', icon: Mic },
  { id: 'waves', label: 'Voice Waves', icon: Waves },
  { id: 'partner', label: 'Partner Seat', icon: User },
];

const MAGIC_TABS = [
  { id: 'mask', label: 'Mask' },
  { id: 'background', label: 'Background' },
];

const MASK_CATEGORIES = [
  { id: 'favorites', label: 'Favorites' },
  { id: 'hot', label: 'Hot' },
  { id: 'accessory', label: 'Accessory' },
  { id: 'love', label: 'Love' },
  { id: 'simple', label: 'Simple' },
  { id: 'cute', label: 'Cute' },
  { id: 'men', label: 'Men' },
  { id: 'novel', label: 'Novel' },
  { id: 'festival', label: 'Festival' },
  { id: 'dino', label: 'DINO' },
];

const BACKGROUND_CATEGORIES = [
  { id: 'custom', label: 'Custom' },
  { id: 'daily', label: 'Daily' },
  { id: 'blur', label: 'Blur' },
  { id: 'love', label: 'Love' },
];

const ROOM_THEMES = [
  { 
    id: 'default', 
    label: 'Cyber Purple', 
    image: 'https://picsum.photos/seed/cyber/200/300',
    gradient: 'from-[#1a0b2e] via-[#2d1b4d] to-[#1a0b2e]',
    accentColor: '#00f2ff',
    emptyIcon: Plus,
    chatStyle: {
      bg: 'bg-black/40',
      text: 'text-white',
      border: 'border-white/10'
    }
  },
  { 
    id: 'mysterious', 
    label: 'Mysterious Night', 
    image: 'https://picsum.photos/seed/mysterious/200/300',
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    accentColor: '#a855f7',
    emptyIcon: Star,
    chatStyle: {
      bg: 'bg-purple-900/40',
      text: 'text-purple-100',
      border: 'border-purple-500/20'
    }
  },
  { 
    id: 'harmony', 
    label: 'Zen Garden', 
    image: 'https://picsum.photos/seed/harmony/200/300',
    gradient: 'from-[#064e3b] via-[#065f46] to-[#064e3b]',
    accentColor: '#10b981',
    emptyIcon: Waves,
    chatStyle: {
      bg: 'bg-emerald-900/40',
      text: 'text-emerald-50',
      border: 'border-emerald-500/20'
    }
  },
  { 
    id: 'twilight', 
    label: 'Twilight Rose', 
    image: 'https://picsum.photos/seed/twilight/200/300',
    gradient: 'from-[#450a0a] via-[#7f1d1d] to-[#450a0a]',
    accentColor: '#f43f5e',
    emptyIcon: Heart,
    chatStyle: {
      bg: 'bg-rose-900/40',
      text: 'text-rose-50',
      border: 'border-rose-500/20'
    }
  },
  { 
    id: 'stage', 
    label: 'Grand Stage', 
    image: 'https://picsum.photos/seed/stage/200/300',
    backgroundImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1920&auto=format&fit=crop',
    accentColor: '#eab308',
    emptyIcon: Mic2,
    chatStyle: {
      bg: 'bg-black/60',
      text: 'text-yellow-100',
      border: 'border-yellow-500/30'
    }
  },
  { 
    id: 'space', 
    label: 'Deep Space', 
    image: 'https://picsum.photos/seed/space/200/300',
    backgroundImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1920&auto=format&fit=crop',
    accentColor: '#3b82f6',
    emptyIcon: Star,
    chatStyle: {
      bg: 'bg-blue-950/60',
      text: 'text-blue-100',
      border: 'border-blue-400/20'
    }
  }
];

const TAGS = [
  { id: 'beauty', label: 'Beauty' },
  { id: 'singing', label: 'Singing' },
  { id: 'dj', label: 'DJ' },
  { id: 'charmer', label: 'Charmer' },
  { id: 'hipster', label: 'Hipster' },
  { id: 'cutey', label: 'Cutey' },
];

export default function GoLivePage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [title, setTitle] = useState('April Fools 🤪💕💋');
  const [activeCategory, setActiveCategory] = useState('chat');
  const [activeMode, setActiveMode] = useState<StreamType>('multi-guest-live');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activeThemeTab, setActiveThemeTab] = useState('theme');
  const [activeThemeId, setActiveThemeId] = useState('default');
  const [showMediaTools, setShowMediaTools] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeTheme = ROOM_THEMES.find(t => t.id === activeThemeId) || ROOM_THEMES[0];
  const [announcement, setAnnouncement] = useState('Announcement');

  const getCategoryTitle = (catId: string) => {
    switch (catId) {
      case 'chat': return 'Story Chain Room';
      case 'dating': return 'Cross-City Werewolf';
      case 'games': return 'Glitch Talk Lab';
      case 'interests': return 'Keyboard Sound Club';
      case 'emotional': return 'Marriage ER Live';
      default: return 'Story Chain Room';
    }
  };
  const [status, setStatus] = useState<'setup' | 'preparing' | 'countdown' | 'live'>('setup');
  const [countdown, setCountdown] = useState(3);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // AR & Beauty State
  const [arSettings, setArSettings] = useState<ARSettings>({
    beautyLevel: 0,
    brightness: 0,
    activeMask: null,
    virtualBackground: null,
    virtualAvatar: null
  });
  const [showSeatsModal, setShowSeatsModal] = useState(false);
  const [seatCount, setSeatCount] = useState(4);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBeautyModal, setShowBeautyModal] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [showMixerModal, setShowMixerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBlockedWordsModal, setShowBlockedWordsModal] = useState(false);
  const [activeMagicTab, setActiveMagicTab] = useState('mask');
  const [activeMaskCategory, setActiveMaskCategory] = useState('hot');
  const [activeBackgroundCategory, setActiveBackgroundCategory] = useState('daily');
  const [micVolume, setMicVolume] = useState(100);
  const [soundEnhancement, setSoundEnhancement] = useState(true);
  const [activeMusicEffect, setActiveMusicEffect] = useState('original');
  const [activeEqualizer, setActiveEqualizer] = useState('none');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');
  const [roomData, setRoomData] = useState<any>(null);

  const [streamStats, setStreamStats] = useState<StreamStats>({
    viewerCount: 0,
    likeCount: 0,
    giftCount: 0,
    followCount: 0,
    duration: 0
  });
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
  const [activeGift, setActiveGift] = useState<{ giftName: string, giftImage?: string, displayName: string, userPhoto?: string, combo: number, animationType?: string, nobleTier?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showChatInput, setShowChatInput] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (status === 'live') {
      const interval = setInterval(() => {
        setStreamStats(prev => {
          // Natural fluctuation: +/- 1 or 2 viewers every second
          const drift = Math.random() > 0.5 ? 1 : -1;
          const newCount = Math.max(0, prev.viewerCount + drift);
          
          return {
            ...prev,
            duration: prev.duration + 1,
            viewerCount: newCount,
            likeCount: prev.likeCount + Math.floor(Math.random() * 5)
          };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

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
  const [isMiniGameCenterOpen, setIsMiniGameCenterOpen] = useState(false);
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
      if (lastMsg.type === 'gift' || (lastMsg as any).isGift) {
        const giftName = (lastMsg as any).giftName || lastMsg.text.replace('sent a ', '').replace('! 🎁', '').replace(/sent \d+x /, '');
        const giftImage = (lastMsg as any).giftImage || (lastMsg.text.includes('🌹') ? '🌹' : '🎁');
        const quantity = (lastMsg as any).quantity || 1;
        const animationType = (lastMsg as any).animationType || 'standard';
        const nobleTier = (lastMsg as any).nobleTier || 'None';
        
        setActiveGift(prev => {
          if (prev && prev.giftName === giftName && prev.displayName === lastMsg.displayName) {
            return { ...prev, combo: prev.combo + quantity, animationType, nobleTier };
          }
          return { 
            giftName, 
            giftImage,
            displayName: lastMsg.displayName || 'Guest', 
            userPhoto: (lastMsg as any).photoURL || lastMsg.hostPhoto,
            combo: quantity, 
            animationType,
            nobleTier
          };
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (status === 'live' && profile) {
      const roomRef = doc(db, 'rooms', profile.uid); // Assuming roomId is profile.uid for host
      const unsub = onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          setRoomData(snap.data());
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `rooms/${profile.uid}`);
      });
      return () => unsub();
    }
  }, [status, profile]);

  const handleYoutubeStart = async () => {
    if (!profile || !youtubeId) return;
    try {
      const roomRef = doc(db, 'rooms', profile.uid);
      await updateDoc(roomRef, { youtubeVideoId: youtubeId });
      setShowYoutubeInput(false);
      setYoutubeId('');
      showToast("Youtube video started! 📺", 'success');
    } catch (error) {
      console.error("Youtube start error:", error);
    }
  };

  const handleMusicToggle = async () => {
    if (!profile) return;
    try {
      const roomRef = doc(db, 'rooms', profile.uid);
      if (roomData?.currentSong) {
        await updateDoc(roomRef, { currentSong: null });
      } else {
        await updateDoc(roomRef, { 
          currentSong: { title: 'Lofi Hip Hop', artist: 'Lofi Girl', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' } 
        });
      }
    } catch (error) {
      console.error("Music toggle error:", error);
    }
  };

  const handleSingingModeToggle = async () => {
    if (!profile) return;
    try {
      const roomRef = doc(db, 'rooms', profile.uid);
      await updateDoc(roomRef, { isSingingMode: !roomData?.isSingingMode });
    } catch (error) {
      console.error("Singing mode toggle error:", error);
    }
  };

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

  const [cameraError, setCameraError] = useState<string | null>(null);

  const setupCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser or context (requires HTTPS).");
      }

      // Try with audio first
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: true 
        });
      } catch (audioErr) {
        console.warn("Audio access failed, falling back to video-only:", audioErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Explicitly call play to handle some browser restrictions
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play failed, might need user interaction:", playErr);
        }
        
        const initMediaPipe = () => {
          if (canvasRef.current && videoRef.current) {
            // Ensure we have valid dimensions
            const width = videoRef.current.videoWidth || 640;
            const height = videoRef.current.videoHeight || 480;
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            
            mediaPipeService.initialize(videoRef.current, canvasRef.current).then(() => {
              mediaPipeService.startProcessing();
            });
          }
        };

        // Wait for video to be ready
        if (videoRef.current.readyState >= 2) {
          initMediaPipe();
        } else {
          videoRef.current.onloadeddata = initMediaPipe;
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
        setCameraError("Permission Denied: Please allow camera access in your browser settings to go live.");
      } else {
        setCameraError(errorMsg);
      }
      
      showToast("Could not access camera. Please check permissions.", 'error');
    }
  };

  useEffect(() => {
    // Small delay to ensure component is fully mounted and browser is ready
    const timer = setTimeout(() => {
      setupCamera();
    }, 500);

    return () => {
      clearTimeout(timer);
      mediaPipeService.stopProcessing();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Re-initialize MediaPipe whenever the layout changes (which remounts the canvas)
  useEffect(() => {
    if (activeMode === 'audio-live' || activeMode === 'game-live') {
      mediaPipeService.stopProcessing();
      return;
    }

    const reinitMediaPipe = async () => {
      if (videoRef.current && canvasRef.current && stream) {
        try {
          // Ensure video is playing
          if (videoRef.current.paused) {
            await videoRef.current.play();
          }

          // Ensure canvas dimensions match video
          const width = videoRef.current.videoWidth || 640;
          const height = videoRef.current.videoHeight || 480;
          if (width > 0 && height > 0) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          }
          
          console.log("Re-initializing MediaPipe...");
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
          await mediaPipeService.initialize(videoRef.current, canvasRef.current);
          mediaPipeService.startProcessing();
        } catch (err) {
          console.error("Error re-initializing MediaPipe:", err);
        }
      }
    };

    // Wait a bit for the DOM to update and the new canvas to be available
    const timer = setTimeout(reinitMediaPipe, 300);
    return () => clearTimeout(timer);
  }, [activeMode, seatCount, stream, status]);

  // Ensure video is playing whenever stream is active
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn("Auto-play failed:", err));
    }
  }, [stream]);

  useEffect(() => {
    mediaPipeService.updateSettings(arSettings);
  }, [arSettings]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      streamingService.leave();
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
      const initialViewerCount = Math.floor(Math.random() * 50) + 20;
      
      // Integrate Agora Professional Streaming
      if (canvasRef.current && activeMode !== 'audio-live') {
        const stream = (canvasRef.current as any).captureStream(30);
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const customTrack = streamingService.createCustomVideoTrack(videoTrack);
          await streamingService.startBroadcast(profile?.uid || 'anonymous', profile?.uid || 'anonymous', customTrack);
        }
      } else if (activeMode === 'audio-live') {
        await streamingService.startBroadcast(profile?.uid || 'anonymous', profile?.uid || 'anonymous');
      }

      const roomData = {
        hostUid: profile?.uid,
        title: title || `${profile?.displayName}'s Live Stream`,
        status: 'live',
        type: activeMode,
        currentBeans: 0,
        viewerCount: initialViewerCount,
        guests: [],
        seats: initializeSeats(),
        micQueue: [],
        isPrivate: false,
        createdAt: serverTimestamp(),
        pkStatus: 'idle'
      };

      await addDoc(collection(db, 'rooms'), roomData);
      setStreamStats(prev => ({ ...prev, viewerCount: initialViewerCount }));
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

  const renderGrid = () => {
    return (
      <div className="w-full transition-all duration-500 bg-black/20 overflow-hidden border-y border-white/10 w-full aspect-[16/15]">
        <div className="w-full h-full">
          {seatCount === 4 && (
            <div className="grid grid-cols-4 grid-rows-3 w-full h-full gap-0">
              <div className="col-span-3 row-span-3 border-r border-white/10">
                {renderPortal(1, true)}
              </div>
              <div className="col-span-1 row-span-1 border-b border-white/10">
                {renderPortal(2)}
              </div>
              <div className="col-span-1 row-span-1 border-b border-white/10">
                {renderPortal(3)}
              </div>
              <div className="col-span-1 row-span-1">
                {renderPortal(4)}
              </div>
            </div>
          )}

          {seatCount === 6 && (
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0">
              <div className="col-span-2 row-span-2 border-r border-b border-white/10">
                {renderPortal(1, true)}
              </div>
              <div className="col-span-1 row-span-1 border-b border-white/10">
                {renderPortal(2)}
              </div>
              <div className="col-span-1 row-span-1 border-b border-white/10">
                {renderPortal(3)}
              </div>
              <div className="col-span-1 row-span-1 border-r border-white/10">
                {renderPortal(4)}
              </div>
              <div className="col-span-1 row-span-1 border-r border-white/10">
                {renderPortal(5)}
              </div>
              <div className="col-span-1 row-span-1">
                {renderPortal(6)}
              </div>
            </div>
          )}

          {seatCount === 9 && (
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={cn(
                  "w-full h-full",
                  i < 6 && "border-b border-white/10",
                  (i % 3 !== 2) && "border-r border-white/10"
                )}>
                  {renderPortal(i + 1, i === 0)}
                </div>
              ))}
            </div>
          )}

          {seatCount === 12 && (
            <div className="grid grid-cols-4 grid-rows-3 w-full h-full gap-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={cn(
                  "w-full h-full",
                  i < 8 && "border-b border-white/10",
                  (i % 4 !== 3) && "border-r border-white/10"
                )}>
                  {renderPortal(i + 1, i === 0)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPortal = (seatId: number, isHost: boolean = false) => {
    const isAudio = activeMode === 'audio-live';
    const seat = seats.find(s => s.seatId === seatId);
    const isOccupied = seat?.status === 'occupied';

    return (
      <div className={cn(
        "relative bg-black/40 backdrop-blur-md border border-white/5 overflow-hidden flex items-center justify-center transition-all duration-300 w-full h-full p-1"
      )}>
        {isHost ? (
          isAudio ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-[92%] aspect-square rounded-full overflow-hidden border-2 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} className="w-full h-full object-cover" alt="Host" />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, 10, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-0.5 bg-[#00f2ff] rounded-full"
                  />
                ))}
              </div>
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[#00f2ff] rounded text-[7px] font-black text-black uppercase tracking-tighter shadow-lg">HOST</div>
            </div>
          ) : (
            <div className="w-full h-full relative bg-black">
              <canvas 
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[#00f2ff] rounded text-[7px] font-black text-black uppercase tracking-tighter shadow-lg">HOST</div>
            </div>
          )
        ) : (
          isAudio ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className={cn(
                "w-[85%] aspect-square rounded-full overflow-hidden flex items-center justify-center transition-all duration-300",
                isOccupied ? "border-2 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "bg-white/5 border border-white/10"
              )}>
                {isOccupied ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seat.uid}`} className="w-full h-full object-cover" alt="Guest" />
                ) : (
                  <activeTheme.emptyIcon size={16} style={{ color: activeTheme.accentColor }} className="opacity-40" />
                )}
              </div>
              <span className="absolute bottom-1.5 right-1.5 text-[7px] font-bold text-white/40 uppercase tracking-tighter">{seatId}</span>
              {isOccupied && seat.isMuted && (
                <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-red-500/80 flex items-center justify-center">
                  <Mic size={8} className="text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <activeTheme.emptyIcon size={18} style={{ color: activeTheme.accentColor }} className="opacity-40" />
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-tighter">{seatId}</span>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-b from-[#2e1a47] via-[#1a1a2e] to-[#0f0f1a] z-[100] flex flex-col overflow-hidden"
      style={{ height: viewportHeight }}
    >
      {/* Hidden Video for Camera Stream */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className="fixed top-0 left-0 w-full h-full opacity-[0.01] pointer-events-none"
        style={{ zIndex: -1, objectFit: 'cover' }}
      />

      {/* Camera Error State (Full Screen Overlay) */}
      {cameraError && (
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <Camera size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Camera Access Denied</h3>
          <p className="text-white/60 text-sm mb-6 max-w-xs">
            We need camera access to start your live stream. Please check your browser settings and try again.
          </p>
          <button 
            onClick={setupCamera}
            className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
          >
            Retry Access
          </button>
        </div>
      )}

      {status === 'setup' || status === 'preparing' ? (
        <div className="relative flex-1 flex flex-col">
          {activeMode === 'game-live' ? (
            /* Game Mode Setup UI */
            <div className="relative flex-1 flex flex-col">
              {/* Game Header */}
              <div className="relative z-20 flex items-center justify-between p-4">
                <div className="flex-1">
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent text-white font-bold text-lg focus:outline-none w-full"
                    placeholder="Add a title to chat"
                  />
                </div>
                <button onClick={() => navigate(-1)} className="p-2 text-white/80">
                  <X size={24} />
                </button>
              </div>

              {/* Game Tags */}
              <div className="relative z-20 flex items-center gap-2 px-4 mb-8">
                {['Beauty', 'Singing', 'DJ'].map(tag => (
                  <button key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[10px] font-bold text-white/80"># {tag}</span>
                    <span className="text-[10px] font-bold text-white/40">+</span>
                  </button>
                ))}
                <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ChevronDown size={14} className="text-white/40" />
                </button>
              </div>

              {/* Game Main Area */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                  <span className="text-sm font-bold text-white">Choose games</span>
                  <ChevronDown size={16} className="text-white/60" />
                </button>
                <p className="mt-8 text-xs font-medium text-white/40 text-center max-w-[200px]">
                  After the live starts, viewers will see the screen of your phone.
                </p>
              </div>

              {/* Game Bottom Toolbar */}
              <div className="relative z-20 p-4 pb-8">
                <div className="flex items-center justify-between mb-8">
                  {[ 
                    { id: 'tutorial', label: 'Tutorial', icon: MessageCircle },
                    { id: 'events', label: 'Events', icon: Star },
                    { id: 'creator', label: 'Creator Center', icon: UserCircle },
                    { id: 'share', label: 'Share', icon: Link2 },
                    { id: 'settings', label: 'Settings', icon: SettingsIcon },
                  ].map(tool => (
                    <button key={tool.id} className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        {tool.id === 'tutorial' ? <span className="text-white text-xl font-bold">?</span> : <tool.icon size={24} className="text-white" />}
                      </div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{tool.label}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleStartBroadcast}
                  disabled={status === 'preparing'}
                  className="w-full py-2.5 bg-[#00f2ff] hover:bg-[#00d8e6] text-black font-black text-sm uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(0,242,255,0.3)] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 mb-4"
                >
                  {status === 'preparing' ? "Preparing..." : "OK"}
                </button>

                {/* Mode Selector */}
                <div className="flex items-center justify-start gap-8 px-4 overflow-x-auto scrollbar-hide relative">
                  {[
                    { id: 'multi-guest-live', label: 'MULTI-GUEST LIVE' },
                    { id: 'live', label: 'LIVE' },
                    { id: 'audio-live', label: 'AUDIO LIVE' },
                    { id: 'game-live', label: 'GAME LIVE' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id as StreamType)}
                      className={cn(
                        "text-sm font-black uppercase italic tracking-widest transition-all whitespace-nowrap relative pb-2",
                        activeMode === mode.id ? "text-[#00f2ff] scale-110" : "text-white/40"
                      )}
                    >
                      {mode.label}
                      {activeMode === mode.id && (
                        <motion.div layoutId="modeDot" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00f2ff] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeMode === 'live' ? (
            /* Standard LIVE Setup UI (Full-screen Floating) */
            <div className="relative flex-1 flex flex-col overflow-hidden">
              {/* Camera Preview (Background Layer) */}
              <div className="absolute inset-0 z-0 bg-black">
                <canvas 
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              </div>

              {/* Floating Header */}
              <div className="relative z-10 p-2 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
                      <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black flex items-center justify-center">
                      <span className="text-[7px] font-bold text-white">!</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent text-white font-bold text-sm focus:outline-none w-32"
                        placeholder="Add a title..."
                      />
                      <Edit2 size={10} className="text-white/40" />
                    </div>
                    <button 
                      onClick={() => setShowTagModal(true)}
                      className="flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-white/5 rounded-full border border-white/10 w-fit"
                    >
                      <span className="text-[8px] font-bold text-white/60">
                        {selectedTags.length > 0 
                          ? selectedTags.map(id => TAGS.find(t => t.id === id)?.label).join(', ')
                          : 'Select tag'}
                      </span>
                      <ChevronDown size={8} className="text-white/40" />
                    </button>
                  </div>
                </div>

                <button onClick={() => navigate(-1)} className="p-1 text-white/80">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1" />

              {/* Floating Toolbar */}
              <div className="relative z-20 p-2 pb-2 bg-gradient-to-t from-black/60 to-transparent">
                <div className="space-y-2 mb-2">
                  {/* Row 1: Always Visible */}
                  <div className="flex items-center justify-between">
                    {[ 
                      { id: 'flip', label: 'Flip', icon: FlipHorizontal },
                      { id: 'beauty', label: 'Beauty', icon: Sparkles },
                      { id: 'magic', label: 'Magic', icon: Wand2 },
                      { id: 'creator', label: 'Creator', icon: UserCircle },
                      { id: 'collapse', label: isToolbarExpanded ? 'Less' : 'More', icon: ChevronDown },
                    ].map(tool => (
                      <button 
                        key={tool.id}
                        onClick={() => {
                          if (tool.id === 'beauty') setShowBeautyModal(true);
                          if (tool.id === 'magic') setShowMagicModal(true);
                          if (tool.id === 'collapse') setIsToolbarExpanded(!isToolbarExpanded);
                        }}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                          {tool.id === 'collapse' ? (
                            <ChevronDown size={16} className={cn("text-white transition-transform", isToolbarExpanded ? "" : "rotate-180")} />
                          ) : (
                            <tool.icon size={16} className="text-white" />
                          )}
                        </div>
                        <span className="text-[7px] font-bold text-white uppercase tracking-wider">{tool.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Row 2: Collapsible */}
                  <AnimatePresence>
                    {isToolbarExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex items-center justify-between overflow-hidden"
                      >
                        {[ 
                          { id: 'camera', label: 'Camera', icon: Camera },
                          { id: 'fill', label: 'Fill', icon: Sparkles },
                          { id: 'events', label: 'Events', icon: Star },
                          { id: 'share', label: 'Share', icon: Link2 },
                          { id: 'settings', label: 'Settings', icon: SettingsIcon },
                        ].map(tool => (
                          <button 
                            key={tool.id}
                            onClick={() => {
                              if (tool.id === 'settings') setShowSettingsModal(true);
                            }}
                            className="flex flex-col items-center gap-0.5"
                          >
                            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                              <tool.icon size={16} className="text-white" />
                            </div>
                            <span className="text-[7px] font-bold text-white uppercase tracking-wider">{tool.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleStartBroadcast}
                  disabled={status === 'preparing'}
                  className="w-full py-1.5 bg-[#00f2ff] hover:bg-[#00d8e6] text-black font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(0,242,255,0.3)] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 mb-1"
                >
                  {status === 'preparing' ? "Preparing..." : "Go LIVE"}
                </button>

                {/* Mode Selector */}
                <div className="flex items-center justify-start gap-5 px-2 overflow-x-auto scrollbar-hide relative">
                  {[
                    { id: 'multi-guest-live', label: 'MULTI-GUEST' },
                    { id: 'live', label: 'LIVE' },
                    { id: 'audio-live', label: 'AUDIO' },
                    { id: 'game-live', label: 'GAME' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id as StreamType)}
                      className={cn(
                        "text-[9px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap relative pb-1",
                        activeMode === mode.id ? "text-[#00f2ff] scale-110" : "text-white/40"
                      )}
                    >
                      {mode.label}
                      {activeMode === mode.id && (
                        <motion.div layoutId="modeDot" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00f2ff] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Multi-guest & Audio LIVE Setup UI (New Integrated Header & Category Bar) */
            <div className="relative flex-1 flex flex-col pb-4 pt-0">
              <div className="px-4 pt-2">
                <div className="bg-[#4a3a8a]/90 backdrop-blur-xl rounded-xl p-2 shadow-2xl border border-white/10">
                  {/* Header Section */}
                  <div className="flex items-start gap-2 mb-2">
                    {/* Cover Box */}
                    <div className="relative group cursor-pointer">
                      <div className="w-9 h-9 bg-[#5d4a3a] rounded-md overflow-hidden border border-white/10 shadow-lg">
                        <img 
                          src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                          alt="Cover" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-0.5 text-center">
                          <span className="text-[5px] text-white font-bold uppercase tracking-tighter">Change c...</span>
                        </div>
                      </div>
                      {/* Notification Badge */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff2d55] rounded-full border border-[#4a3a8a] flex items-center justify-center shadow-lg">
                        <span className="text-white text-[7px] font-black italic">!</span>
                      </div>
                    </div>

                    {/* Title & Announcement */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-1 group">
                        <input 
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-transparent text-white font-bold text-sm focus:outline-none w-full placeholder:text-white/30"
                          placeholder="Add a title..."
                        />
                        <Edit2 size={10} className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 bg-black/20 rounded-full px-1.5 py-0.5 w-fit border border-white/5">
                        <Megaphone size={8} className="text-white/60" />
                        <input 
                          type="text"
                          value={announcement}
                          onChange={(e) => setAnnouncement(e.target.value)}
                          className="bg-transparent text-white/80 text-[8px] focus:outline-none w-20 placeholder:text-white/30"
                          placeholder="Announcement"
                        />
                      </div>
                    </div>

                    <button onClick={() => navigate(-1)} className="p-1 text-white/40 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Category Navigation */}
                  <div className="flex items-center justify-between gap-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setTitle(getCategoryTitle(cat.id));
                        }}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 relative",
                          activeCategory === cat.id 
                            ? "bg-white/20 border-2 border-white shadow-[0_0_5px_rgba(255,255,255,0.2)]" 
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        )}>
                          <cat.icon 
                            size={12} 
                            style={{ color: cat.color }} 
                            className={cn(
                              "transition-transform duration-300",
                              activeCategory === cat.id ? "scale-110" : "group-hover:scale-105"
                            )} 
                          />
                        </div>
                        <span className={cn(
                          "text-[7px] font-bold uppercase tracking-wider transition-colors",
                          activeCategory === cat.id ? "text-white" : "text-white/60"
                        )}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Preview with Dynamic Seat Layouts */}
              <div className="relative flex-1 flex flex-col items-center justify-center transition-all duration-300 p-0">
                {renderGrid()}
              </div>

              <div className="flex-1" />

              {/* Floating Bottom Section */}
              <div className="relative z-20 px-4 py-0 pb-1.5">
                <div className="flex items-center justify-between mb-1">
                  {[ 
                    { id: 'seats', label: 'Seats', icon: User },
                    { id: 'theme', label: 'Theme', icon: Palette },
                    { id: 'mixer', label: 'Mixer', icon: Mic2 },
                    { id: 'magic', label: 'Magic', icon: Wand2 },
                    { id: 'settings', label: 'Settings', icon: SettingsIcon },
                  ].map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => {
                        if (tool.id === 'seats') setShowSeatsModal(true);
                        if (tool.id === 'theme') setShowThemeModal(true);
                        if (tool.id === 'mixer') setShowMixerModal(true);
                        if (tool.id === 'magic') setShowMagicModal(true);
                        if (tool.id === 'settings') setShowSettingsModal(true);
                      }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <tool.icon size={18} className="text-white" />
                      </div>
                      <span className="text-[8px] font-bold text-white uppercase tracking-wider">{tool.label}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleStartBroadcast}
                  disabled={status === 'preparing'}
                  className="w-full py-1.5 bg-[#00f2ff] hover:bg-[#00d8e6] text-black font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(0,242,255,0.3)] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 mb-1"
                >
                  {status === 'preparing' ? "Preparing..." : "Go LIVE"}
                </button>

                {/* Mode Selector */}
                <div className="flex items-center justify-start gap-6 px-4 overflow-x-auto scrollbar-hide relative">
                  {[
                    { id: 'multi-guest-live', label: 'MULTI-GUEST LIVE' },
                    { id: 'live', label: 'LIVE' },
                    { id: 'audio-live', label: 'AUDIO LIVE' },
                    { id: 'game-live', label: 'GAME LIVE' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id as StreamType)}
                      className={cn(
                        "text-[10px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap relative pb-1",
                        activeMode === mode.id ? "text-[#00f2ff] scale-110" : "text-white/40"
                      )}
                    >
                      {mode.label}
                      {activeMode === mode.id && (
                        <motion.div layoutId="modeDot" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00f2ff] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Select Tag Modal */}
          <AnimatePresence>
            {showTagModal && (
              <div className="fixed inset-0 z-[150] flex items-end">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowTagModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white font-black italic uppercase tracking-tight">Select tag</h3>
                    <X size={20} className="text-white/40" onClick={() => setShowTagModal(false)} />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {TAGS.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button 
                          key={tag.id}
                          onClick={() => {
                            setSelectedTags(prev => 
                              isSelected 
                                ? prev.filter(id => id !== tag.id)
                                : [...prev, tag.id].slice(-3) // Limit to 3 tags
                            );
                          }}
                          className={cn(
                            "py-3 rounded-xl border transition-all font-bold text-[10px] flex items-center justify-center gap-1",
                            isSelected 
                              ? "bg-cyan-400/10 border-cyan-400 text-cyan-400" 
                              : "bg-white/5 border-white/10 text-white/40"
                          )}
                        >
                          {isSelected && <span className="text-white">*</span>}
                          # {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Number of Seats Modal */}
          <AnimatePresence>
            {showSeatsModal && (
              <div className="fixed inset-0 z-[150] flex items-end">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSeatsModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-white font-black italic uppercase tracking-tight">Number of Seats</h3>
                    <X size={20} className="text-white/40" onClick={() => setShowSeatsModal(false)} />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[4, 6, 9, 12].map(count => (
                      <button 
                        key={count}
                        onClick={() => {
                          setSeatCount(count);
                          setShowSeatsModal(false);
                        }}
                        className={cn(
                          "py-4 rounded-2xl border transition-all font-black text-sm",
                          seatCount === count ? "bg-cyan-400 border-cyan-400 text-black" : "bg-white/5 border-white/10 text-white/40"
                        )}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Room Theme Modal */}
          <AnimatePresence>
            {showThemeModal && (
              <div className="fixed inset-0 z-[150] flex items-end">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowThemeModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-black italic uppercase tracking-tight">Room theme</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-all">
                      <div className="w-4 h-4 bg-cyan-400 rounded-sm flex items-center justify-center">
                        <Palette size={10} className="text-black" />
                      </div>
                      <span className="text-[10px] font-black text-cyan-400 uppercase">Props Store</span>
                      <X size={14} className="text-white/40 ml-2" onClick={() => setShowThemeModal(false)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide mb-8 border-b border-white/5">
                    {THEME_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveThemeTab(tab.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 pb-4 transition-all whitespace-nowrap",
                          activeThemeTab === tab.id ? "text-white" : "text-white/40"
                        )}
                      >
                        <span className="text-[10px] font-bold">{tab.label}</span>
                        {activeThemeTab === tab.id && (
                          <motion.div layoutId="activeTab" className="h-1 w-full bg-cyan-400 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                    {activeThemeTab === 'theme' && ROOM_THEMES.map(theme => (
                      <button 
                        key={theme.id} 
                        onClick={() => setActiveThemeId(theme.id)}
                        className="relative group cursor-pointer"
                      >
                        <div className={cn(
                          "aspect-[16/9] rounded-2xl overflow-hidden border-2 transition-all",
                          activeThemeId === theme.id ? "border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "border-transparent group-hover:border-white/20"
                        )}>
                          <img src={theme.image} alt={theme.label} className="w-full h-full object-cover" />
                          {activeThemeId === theme.id && (
                            <div className="absolute inset-0 bg-cyan-400/10 flex items-center justify-center">
                              <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                                <Palette size={14} className="text-black" />
                              </div>
                            </div>
                          )}
                        </div>
                        <p className={cn(
                          "mt-2 text-[9px] font-bold text-center transition-colors",
                          activeThemeId === theme.id ? "text-cyan-400" : "text-white/60"
                        )}>{theme.label}</p>
                      </button>
                    ))}
                    {activeThemeTab === 'layout' && [1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-[16/9] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                        <Layout size={24} className="text-white/20" />
                      </div>
                    ))}
                    {activeThemeTab === 'waves' && [1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                        <Waves size={24} className="text-white/20" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Countdown & Live UI Phase */
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {/* Background Layer */}
          <div className={cn(
            "absolute inset-0 transition-all duration-700",
            activeTheme.backgroundImage ? "" : `bg-gradient-to-b ${activeTheme.gradient}`
          )}>
            {activeTheme.backgroundImage && (
              <img 
                src={activeTheme.backgroundImage} 
                className="w-full h-full object-cover opacity-60" 
                alt="Theme Background"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

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
                  <span className="text-xs font-bold">{streamStats.viewerCount}</span>
                </div>
                <button onClick={() => setStatus('setup')} className="text-white/80">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Grid Area - Same as Setup (Moved Up) */}
            <div className="flex-1 flex flex-col items-center justify-start pt-2 relative overflow-hidden">
              {activeMode === 'live' ? (
                <div className="absolute inset-0 z-0 bg-black">
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </div>
              ) : (
                renderGrid()
              )}
            </div>

            {/* Left Side Goals/Actions */}
            <div className="absolute left-0 top-24 flex flex-col gap-2 p-4 z-20">
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

          {/* Right Side Notifications & Tools */}
          <div className="absolute right-4 top-40 flex flex-col items-end gap-4 z-50">
            {isPkActive && (
              <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md animate-bounce">
                PK BATTLE ACTIVE
              </div>
            )}
            
            {/* Badges */}
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

            {/* Folded Media Tools */}
            {status === 'live' && (
              <div className="relative flex flex-col items-center gap-3 mt-4">
                <AnimatePresence>
                  {showMediaTools && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex flex-col gap-3 shadow-2xl mb-2"
                    >
                      <button 
                        onClick={() => { setShowYoutubeInput(true); setShowMediaTools(false); }}
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                          roomData?.youtubeVideoId ? "bg-red-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                      >
                        <Youtube size={22} />
                      </button>
                      <button 
                        onClick={() => { handleMusicToggle(); setShowMediaTools(false); }}
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                          roomData?.currentSong ? "bg-pink-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                      >
                        <Music size={22} />
                      </button>
                      <button 
                        onClick={() => { handleSingingModeToggle(); setShowMediaTools(false); }}
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                          roomData?.isSingingMode ? "bg-orange-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                      >
                        <Mic2 size={22} />
                      </button>
                      <button 
                        onClick={() => { setShowTransformModal(true); setShowMediaTools(false); }}
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                          (arSettings.zoomLevel! > 1 || arSettings.isMirrored || arSettings.isFlipped) ? "bg-cyan-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                      >
                        <RotateCw size={22} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={() => setShowMediaTools(!showMediaTools)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border backdrop-blur-md",
                    showMediaTools ? "bg-white text-black border-white" : "bg-black/40 text-white border-white/10"
                  )}
                >
                  {showMediaTools ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Prediction System */}
                <PredictionSystem 
                  roomId={profile?.uid || ''} 
                  isHost={true} 
                  userProfile={profile} 
                />
              </div>
            )}
          </div>

          {/* Bottom Area - Toolbar, Chat & Quick Replies */}
          <div className="mt-auto p-4 space-y-2 relative z-30 pb-12 flex-shrink-0">
            {/* Chat Section - Confined Bottom Left (In-flow to avoid overlap) */}
            <div className="w-[280px] h-[120px] flex flex-col gap-1 mb-2">
              {/* New Messages Indicator */}
              {hasNewMessages && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={scrollToBottom}
                  className="bg-cyan-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg w-fit mb-1"
                >
                  New Messages <ChevronDown size={12} />
                </motion.button>
              )}

              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-y-auto scrollbar-hide scroll-smooth flex flex-col gap-1"
              >
                <div className="flex flex-col gap-1 min-h-full justify-end items-start">
                  <div className="flex-1" />
                  {visibleMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "rounded-xl px-3 py-1.5 max-w-full break-words border backdrop-blur-md transition-all",
                        activeTheme.chatStyle.bg,
                        activeTheme.chatStyle.border
                      )}
                    >
                      <ChatMessage 
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Replies */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 pointer-events-auto relative z-40">
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
                  className="whitespace-nowrap px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-medium border border-white/10 active:scale-95 transition-transform"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Streamer Controls */}
            <div className="flex items-center justify-between pointer-events-auto relative z-40">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowChatInput(true)} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <MessageCircle size={18} className="text-white" />
                </button>
                <button 
                  onClick={() => setShowBeautyModal(true)}
                  className={cn(
                    "w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border flex items-center justify-center",
                    (arSettings.beautyLevel > 0 || arSettings.brightness > 0) ? "border-cyan-400 text-cyan-400" : "border-white/10 text-white"
                  )}
                >
                  <Sparkles size={18} />
                </button>
                <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Menu size={18} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={startPkSimulation}
                  className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                    isPkActive 
                      ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'bg-indigo-500/20 border-indigo-500/30'
                  }`}
                >
                  <span className={`text-[9px] font-black italic ${isPkActive ? 'text-white' : 'text-indigo-400'}`}>PK</span>
                </button>
                {isPkActive && (
                  <button 
                    onClick={stopPk}
                    className="w-9 h-9 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 flex items-center justify-center animate-pulse"
                  >
                    <StopCircle size={18} className="text-red-400" />
                  </button>
                )}
                <button className="w-9 h-9 rounded-full bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 flex items-center justify-center">
                  <div className="w-4 h-3 bg-yellow-400 rounded-sm" />
                </button>
                <button className="w-9 h-9 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/30 flex items-center justify-center">
                  <Gift size={18} className="text-pink-400" />
                </button>
              </div>
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
                    key={sticker}
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

      {/* MIC QUEUE / GUEST SEATS (Only for Multi-Guest) */}
      {status === 'live' && roomData?.type === 'multi-guest' && (
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
            onBeautyClick={() => setShowBeautyModal(true)}
            onGamesClick={() => setIsMiniGameCenterOpen(!isMiniGameCenterOpen)}
            onJoinClick={() => showToast("Invite link copied! 🔗", 'success')}
            isBeautyActive={arSettings.beautyLevel > 0 || arSettings.brightness > 0}
            isGamesActive={isMiniGameCenterOpen}
          />
        </div>
      )}

      {/* AI Assistant */}
      {status === 'live' && (
        <AILiveAssistant 
          stats={streamStats} 
          onAction={(action) => {
            if (action === 'pk') setIsPkActive(true);
            if (action === 'share') showToast("Sharing stream... 📢", 'info');
          }} 
        />
      )}

      {/* Mini-Games */}
      {status === 'live' && (
        <MiniGameCenter 
          isOpen={isMiniGameCenterOpen}
          onToggle={() => setIsMiniGameCenterOpen(!isMiniGameCenterOpen)}
          onStartGame={(game) => {
            showToast(`Starting ${game.name}... ${game.icon}`, 'success');
          }} 
        />
      )}
      <div className="fixed top-1/3 left-4 z-[200] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {activeGift && (
            <GiftCombo 
              key={`${activeGift.displayName}-${activeGift.giftName}`}
              giftName={activeGift.giftName}
              giftImage={activeGift.giftImage}
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
      {/* Beauty Modal */}
      <AnimatePresence>
        {showBeautyModal && (
          <div className="fixed inset-0 z-[150] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBeautyModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  {['Presets', 'Beauty', 'Make up', 'Filter'].map(tab => (
                    <button
                      key={tab}
                      className={cn(
                        "text-xs font-black uppercase italic tracking-widest transition-all",
                        tab === 'Beauty' ? "text-white" : "text-white/40"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <X size={20} className="text-white/40" onClick={() => setShowBeautyModal(false)} />
              </div>

              <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide mb-8 border-b border-white/5 pb-4">
                {['Skin', 'Touch Up', 'Face', 'Eyes', 'Nose', 'Mouth'].map(cat => (
                  <button
                    key={cat}
                    className={cn(
                      "text-[10px] font-bold whitespace-nowrap transition-all",
                      cat === 'Skin' ? "text-cyan-400" : "text-white/40"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <RotateCw size={16} className="text-white/40" />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={arSettings.beautyLevel}
                      onChange={(e) => setArSettings(prev => ({ ...prev, beautyLevel: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {['Smooth', 'Brighten', 'Teeth', 'Clarity', 'Tone'].map((item, i) => (
                    <div key={item} className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all",
                        i === 0 ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/5"
                      )}>
                        <Sparkles size={18} className={i === 0 ? "text-cyan-400" : "text-white/40"} />
                      </div>
                      <span className={cn("text-[7px] font-bold uppercase tracking-tighter", i === 0 ? "text-white" : "text-white/40")}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Transform Modal */}
      <AnimatePresence>
        {showTransformModal && (
          <div className="absolute inset-0 z-[110] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTransformModal(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-black italic uppercase tracking-tight">Transform</h3>
                <button onClick={() => setShowTransformModal(false)} className="text-white/40"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                    <span>Zoom</span>
                    <span className="text-orange-400">{arSettings.zoomLevel?.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1"
                    value={arSettings.zoomLevel}
                    onChange={(e) => setArSettings(prev => ({ ...prev, zoomLevel: parseFloat(e.target.value) }))}
                    className="w-full accent-orange-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setArSettings(prev => ({ ...prev, isMirrored: !prev.isMirrored }))}
                    className={cn(
                      "py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-black uppercase italic tracking-widest text-[9px]",
                      arSettings.isMirrored ? "bg-orange-500 border-orange-400 text-white" : "bg-white/5 border-white/10 text-white/40"
                    )}
                  >
                    <Columns2 size={14} />
                    Mirror
                  </button>
                  <button
                    onClick={() => setArSettings(prev => ({ ...prev, isFlipped: !prev.isFlipped }))}
                    className={cn(
                      "py-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-black uppercase italic tracking-widest text-[9px]",
                      arSettings.isFlipped ? "bg-orange-500 border-orange-400 text-white" : "bg-white/5 border-white/10 text-white/40"
                    )}
                  >
                    <RotateCw size={14} />
                    Flip
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Avatar Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="absolute inset-0 z-[110] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-black italic uppercase tracking-tight">Virtual Avatar</h3>
                <button onClick={() => setShowAvatarModal(false)} className="text-white/40"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { id: null, name: 'None', icon: '🚫' },
                  { id: 'robot', name: 'Robot', icon: '🤖' },
                  { id: 'cat', name: 'Cat', icon: '🐱' },
                ].map(avatar => (
                  <button 
                    key={avatar.id || 'none'}
                    onClick={() => {
                      setArSettings(prev => ({ ...prev, virtualAvatar: avatar.id }));
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-[9px]",
                      arSettings.virtualAvatar === avatar.id ? "bg-cyan-400 border-cyan-400 text-black" : "bg-white/5 border-white/5 text-white"
                    )}
                  >
                    <span className="text-2xl">{avatar.icon}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">{avatar.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Magic Modal */}
      <AnimatePresence>
        {showMagicModal && (
          <div className="fixed inset-0 z-[150] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMagicModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  {MAGIC_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMagicTab(tab.id)}
                      className={cn(
                        "text-sm font-black uppercase italic tracking-widest transition-all",
                        activeMagicTab === tab.id ? "text-white" : "text-white/40"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <X size={20} className="text-white/40" onClick={() => setShowMagicModal(false)} />
              </div>

              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide mb-6 border-b border-white/5 pb-4">
                {(activeMagicTab === 'mask' ? MASK_CATEGORIES : BACKGROUND_CATEGORIES).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => activeMagicTab === 'mask' ? setActiveMaskCategory(cat.id) : setActiveBackgroundCategory(cat.id)}
                    className={cn(
                      "text-xs font-bold whitespace-nowrap transition-all",
                      (activeMagicTab === 'mask' ? activeMaskCategory : activeBackgroundCategory) === cat.id ? "text-cyan-400" : "text-white/40"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                {activeMagicTab === 'mask' && Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center group cursor-pointer hover:border-cyan-400 transition-all">
                    <Smile size={24} className="text-white/20 group-hover:text-cyan-400" />
                  </div>
                ))}
                {activeMagicTab === 'background' && activeBackgroundCategory === 'blur' && [1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-md" style={{ backdropFilter: `blur(${i * 4}px)` }} />
                    <span className="relative z-10 text-[10px] font-bold text-white">Blur {i}</span>
                  </div>
                ))}
                {activeMagicTab === 'background' && activeBackgroundCategory !== 'blur' && Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden group cursor-pointer hover:border-cyan-400 transition-all">
                    <img src={`https://picsum.photos/seed/bg${i}/200/200`} alt="BG" className="w-full h-full object-cover opacity-40 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mixer Modal */}
      <AnimatePresence>
        {showMixerModal && (
          <div className="fixed inset-0 z-[150] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMixerModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-black italic uppercase tracking-tight">Mixer</h3>
                <X size={20} className="text-white/40" onClick={() => setShowMixerModal(false)} />
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                {/* Volume */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white/60">Mic Volume</span>
                    <button onClick={() => setMicVolume(100)} className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase">
                      <RotateCw size={10} />
                      Volume Reset
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={micVolume}
                      onChange={(e) => setMicVolume(parseInt(e.target.value))}
                      className="flex-1 accent-cyan-400"
                    />
                    <span className="text-xs font-bold text-white w-8">{micVolume}</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60">Preview</span>
                    <div className="w-10 h-5 bg-white/10 rounded-full relative">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white/40 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60">Sound Enhancement</span>
                    <button 
                      onClick={() => setSoundEnhancement(!soundEnhancement)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-all",
                        soundEnhancement ? "bg-cyan-400" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                        soundEnhancement ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                {/* Music Effects */}
                <div>
                  <span className="text-xs font-bold text-white/60 block mb-4">Music Effects</span>
                  <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                    {['Original', 'Reverb', 'Live Concert', 'KTV', 'Ethereal', 'Concert Hall'].map(effect => (
                      <button 
                        key={effect}
                        onClick={() => setActiveMusicEffect(effect.toLowerCase())}
                        className="flex flex-col items-center gap-2 shrink-0"
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all",
                          activeMusicEffect === effect.toLowerCase() ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/5"
                        )}>
                          <Mic2 size={24} className={activeMusicEffect === effect.toLowerCase() ? "text-cyan-400" : "text-white/40"} />
                        </div>
                        <span className={cn("text-[10px] font-bold", activeMusicEffect === effect.toLowerCase() ? "text-white" : "text-white/40")}>{effect}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equalizer */}
                <div>
                  <span className="text-xs font-bold text-white/60 block mb-4">Equalizer</span>
                  <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                    {['None', 'Custom', 'Electronic', 'Rock', 'Bass', 'Jazz'].map(eq => (
                      <button 
                        key={eq}
                        onClick={() => setActiveEqualizer(eq.toLowerCase())}
                        className="flex flex-col items-center gap-2 shrink-0"
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all",
                          activeEqualizer === eq.toLowerCase() ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 bg-white/5"
                        )}>
                          <Columns2 size={24} className={activeEqualizer === eq.toLowerCase() ? "text-cyan-400" : "text-white/40"} />
                        </div>
                        <span className={cn("text-[10px] font-bold", activeEqualizer === eq.toLowerCase() ? "text-white" : "text-white/40")}>{eq}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[150] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-black italic uppercase tracking-tight">Settings</h3>
                <X size={20} className="text-white/40" onClick={() => setShowSettingsModal(false)} />
              </div>

              <div className="space-y-2">
                {[
                  { id: 'share', label: 'Share' },
                  { id: 'blocked', label: 'Blocked Words', count: 0 },
                  { id: 'schedule', label: 'Live Schedule' },
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'blocked') setShowBlockedWordsModal(true);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.count !== undefined && <span className="text-xs font-bold text-white/40">{item.count}</span>}
                      <ChevronDown size={16} className="text-white/40 -rotate-90" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blocked Words Modal */}
      <AnimatePresence>
        {showBlockedWordsModal && (
          <div className="fixed inset-0 z-[200] flex items-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBlockedWordsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full h-[80vh] bg-[#1a1a1a] rounded-t-[2.5rem] p-6 pb-12 border-t border-white/10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-white/40">?</span>
                  <h3 className="text-white font-bold">Comment Settings</h3>
                </div>
                <X size={20} className="text-white/40" onClick={() => setShowBlockedWordsModal(false)} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-2">Add blocked words (0/50)</p>
                <p className="text-[10px] text-white/40 mb-6">
                  Comments and bullet messages containing the blocked words will not show in the room. You can set up to 50 blocked words.
                </p>
                
                <button className="flex items-center gap-2 text-cyan-400 font-bold">
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                    <span className="text-lg leading-none">+</span>
                  </div>
                  <span>Add to blocked list</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Youtube Input Modal */}
      <AnimatePresence>
        {showYoutubeInput && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowYoutubeInput(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Watch Youtube Together</h3>
              <p className="text-xs text-white/40 mb-6">Enter a Youtube Video ID to start watching with your fans.</p>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <input 
                    type="text"
                    placeholder="Video ID (e.g. dQw4w9WgXcQ)"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                  />
                </div>
                
                <button 
                  onClick={handleYoutubeStart}
                  disabled={!youtubeId}
                  className="w-full py-4 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Start Watching
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
