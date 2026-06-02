import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Users, Music, Gamepad2, Radio, Video, Plus, 
  Sparkles, Flame, Trophy, Heart, Mic, Check, Play, Tv,
  LayoutGrid, LayoutList, Search, Bell, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { GoLiveModal } from '../components/GoLiveModal';
import { StreamType, Room } from '../types';

export default function PartyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const isLight = theme === 'light';

  // State elements
  const [activeTab, setActiveTab] = useState<'Follow' | 'Hot' | 'Video' | 'Voice'>('Hot');
  const [selectedCountry, setSelectedCountry] = useState({ name: 'Ghana', flag: '🇬🇭', code: 'GH' });
  const [showRegions, setShowRegions] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [dbRooms, setDbRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [showGoLive, setShowGoLive] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Floating "One-Tap Mic On" following stream rotation cycle
  const [currentFollowedIndex, setCurrentFollowedIndex] = useState(0);

  // Pool of followed streamers that cycle on the "One-Tap Mic On" floating widget (5 seconds each)
  const followedStreamers = [
    {
      id: 'party_followed_nadia',
      name: 'Nadia.Live 🌸',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      roomTitle: 'Weekend Chills & Late Music 🎵',
      category: 'Voice',
      viewerCount: 420
    },
    {
      id: 'party_followed_alex',
      name: 'Alex.King 👑',
      photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
      roomTitle: 'Ludo Arena - Seats Open 🎲',
      category: 'Video',
      viewerCount: 180
    },
    {
      id: 'party_followed_yasmin',
      name: 'Yasmin.Vibe ✨',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      roomTitle: '10k Beans Goal! Join seats 🎙️',
      category: 'Voice',
      viewerCount: 310
    },
    {
      id: 'party_followed_marcus',
      name: 'Marcus.Talks 🎤',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      roomTitle: 'Late Night Truth or Dare 🔥',
      category: 'Video',
      viewerCount: 520
    }
  ];

  // 100% accurate list of regional options matching the theme
  const regionsData = [
    {
      name: 'Popular',
      countries: [
        { name: 'Ghana', flag: '🇬🇭', code: 'GH', isHot: true },
        { name: 'Nigeria', flag: '🇳🇬', code: 'NG', isHot: true },
        { name: 'Philippines', flag: '🇵🇭', code: 'PH', isHot: true },
        { name: 'USA', flag: '🇺🇸', code: 'US', isHot: true },
        { name: 'United Kingdom', flag: '🇬🇧', code: 'GB', isHot: true },
        { name: 'Canada', flag: '🇨🇦', code: 'CA' },
        { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
        { name: 'Turkey', flag: '🇹🇷', code: 'TR' }
      ]
    },
    {
      name: 'Africa',
      countries: [
        { name: 'Ghana', flag: '🇬🇭', code: 'GH', isHot: true },
        { name: 'Nigeria', flag: '🇳🇬', code: 'NG', isHot: true },
        { name: 'Kenya', flag: '🇰🇪', code: 'KE' },
        { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
        { name: 'Egypt', flag: '🇪🇬', code: 'EG' }
      ]
    },
    {
      name: 'Americas',
      countries: [
        { name: 'USA', flag: '🇺🇸', code: 'US', isHot: true },
        { name: 'Canada', flag: '🇨🇦', code: 'CA' },
        { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
        { name: 'Mexico', flag: '🇲🇽', code: 'MX' }
      ]
    },
    {
      name: 'Europe & Asia',
      countries: [
        { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
        { name: 'Germany', flag: '🇩🇪', code: 'DE' },
        { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
        { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
        { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
        { name: 'Korea', flag: '🇰🇷', code: 'KR' },
        { name: 'Japan', flag: '🇯🇵', code: 'JP' }
      ]
    }
  ];

  // High fidelity simulated parties cloned directly from the screenshots
  const simulatedParties = [
    { 
      id: 'party_wtwww', 
      type: 'multi-guest-live' as StreamType, 
      title: 'Wtwww🫶❤️', 
      hostName: 'Wtwww.Sweet', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_wtwww', 
      viewerCount: 161, 
      tag: 'Chat',
      isPopular: true,
      level: 26,
      currentBeans: 4500,
      countryCode: 'GH',
      participants: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150'
      ]
    },
    { 
      id: 'party_about_me', 
      type: 'multi-guest-live' as StreamType, 
      title: 'It\'s all about MEEEE💕', 
      hostName: 'MEEEE.Queen', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_about_me', 
      viewerCount: 92, 
      tag: 'Chat',
      isPopular: false,
      level: 34,
      currentBeans: 12400,
      countryCode: 'GH',
      participants: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150'
      ]
    },
    { 
      id: 'party_ptdims', 
      type: 'multi-guest-live' as StreamType, 
      title: 'PTDIMS 🛩️', 
      hostName: 'PTDIMS', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_ptdims', 
      viewerCount: 104, 
      tag: 'Chat',
      isPopular: false,
      level: 34,
      currentBeans: 8500,
      countryCode: 'US',
      participants: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150'
      ]
    },
    { 
      id: 'party_8kaway', 
      type: 'audio-live' as StreamType, 
      title: '8kaway 💋💋💋', 
      hostName: '8kaway', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_8kaway', 
      viewerCount: 91, 
      tag: 'Chat',
      isPopular: false,
      level: 31,
      currentBeans: 9800,
      countryCode: 'GH',
      participants: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
      ]
    },
    { 
      id: 'party_beans_goal', 
      type: 'audio-live' as StreamType, 
      title: '600 beans left to go til ...', 
      hostName: 'BeanSeeker', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_beans_goal', 
      viewerCount: 116, 
      tag: 'Chat',
      isPopular: false,
      level: 34,
      currentBeans: 15400,
      countryCode: 'GH',
      participants: [] // Empty circles/mics placeholders
    },
    { 
      id: 'party_million_dolls', 
      type: 'multi-guest-live' as StreamType, 
      title: '1.2 million dolls', 
      hostName: 'DollFace', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_million_dolls', 
      viewerCount: 138, 
      tag: 'Chat',
      isPopular: false,
      level: 40,
      currentBeans: 24500,
      countryCode: 'GB',
      participants: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150'
      ]
    },
    { 
      id: 'party_nobod_loves', 
      type: 'multi-guest-live' as StreamType, 
      title: 'Nobody loves me', 
      hostName: 'LonesomeVibes', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_nobod_loves', 
      viewerCount: 64, 
      tag: 'Room PK',
      isPopular: false,
      level: 33,
      currentBeans: 3100,
      countryCode: 'GH',
      participants: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150'
      ]
    },
    { 
      id: 'party_idea_bw', 
      type: 'audio-live' as StreamType, 
      title: 'Idea black and white O...', 
      hostName: 'BWCreator', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_idea_bw', 
      viewerCount: 104, 
      tag: 'Chat',
      isPopular: false,
      level: 30,
      currentBeans: 4600,
      countryCode: 'CA',
      participants: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
      ]
    },
    { 
      id: 'party_retro_aria', 
      type: 'audio-live' as StreamType, 
      title: 'Acoustic Hits & Old-school Jam Session 🎙️', 
      hostName: 'Aria.Acoustic', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_retro_aria', 
      viewerCount: 165, 
      tag: 'Chat',
      isPopular: true,
      level: 28,
      currentBeans: 4900,
      countryCode: 'GH',
      participants: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150'
      ]
    },
    { 
      id: 'party_neon_dj_leo', 
      type: 'multi-guest-live' as StreamType, 
      title: 'Friday Mega Dance Party & VIP Mikes On! 🔥', 
      hostName: 'DJ.Leo.Vibes', 
      hostPhotoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop', 
      hostUid: 'host_neon_dj_leo', 
      viewerCount: 230, 
      tag: 'Chat',
      isPopular: true,
      level: 39,
      currentBeans: 12500,
      countryCode: 'GH',
      participants: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
      ]
    }
  ];

  // Helper to generate realistic interactive seated occupants for joining list/grid rooms
  const generateMockSeats = (type: StreamType) => {
    const isAudio = type === 'audio-live';
    const seatType = isAudio ? 'audio' : 'video';
    return [
      { seatId: 1, uid: 'seat_user_1', status: 'occupied', type: seatType, isMuted: false, displayName: 'M.ø.l.l.y 💖', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150' },
      { seatId: 2, uid: 'seat_user_2', status: 'occupied', type: seatType, isMuted: false, displayName: 'Luna • Star 🔥', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150' },
      { seatId: 3, uid: 'seat_user_3', status: 'occupied', type: seatType, isMuted: true, displayName: 'Zack DJ ⚡', photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150' },
      { seatId: 4, uid: null, status: 'empty', type: seatType, isMuted: false },
      { seatId: 5, uid: null, status: 'empty', type: seatType, isMuted: false },
      { seatId: 6, uid: null, status: 'empty', type: seatType, isMuted: false }
    ];
  };

  // 1. Cycle One-Tap Mic On Floating button followed users every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFollowedIndex((prev) => (prev + 1) % followedStreamers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 2. Query Firestore real-time active rooms
  useEffect(() => {
    const q = query(
      collection(db, 'rooms'),
      where('status', '==', 'live'),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const liveList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      const partyList = liveList.filter(
        room => room.type === 'multi-guest-live' || room.type === 'audio-live'
      );
      setDbRooms(partyList);
      setLoadingRooms(false);
    }, (error) => {
      console.error("Error listening active party rooms:", error);
      setLoadingRooms(false);
    });

    return () => unsub();
  }, []);

  // 3. Merge live firestore instances with screenshot-mode high-fidelity simulated parties
  const mergedRooms = React.useMemo(() => {
    const result = [...dbRooms];
    
    simulatedParties.forEach((simKey) => {
      const hostIsLiveReal = dbRooms.some(dbRoom => dbRoom.hostUid === simKey.hostUid);
      if (!hostIsLiveReal) {
        result.push({
          id: simKey.id,
          hostUid: simKey.hostUid,
          hostName: simKey.hostName,
          hostPhotoURL: simKey.hostPhotoURL,
          title: simKey.title,
          status: 'live',
          type: simKey.type,
          currentBeans: simKey.currentBeans,
          viewerCount: simKey.viewerCount,
          likes: 2100,
          guests: simKey.participants || [],
          seats: generateMockSeats(simKey.type) as any,
          isPrivate: false,
          createdAt: null,
          countryCode: simKey.countryCode,
          // Custom properties matching screenshot layout
          tag: simKey.tag,
          isPopular: simKey.isPopular,
          level: simKey.level,
          participants: simKey.participants
        } as any);
      }
    });

    return result;
  }, [dbRooms]);

  // 4. Implement filter rules for custom tabs (Follow, Hot, Video, Voice) and the active selected country (Ghana/Any filter list match)
  const filteredRooms = React.useMemo(() => {
    let list = [...mergedRooms];

    // Follow / Hot / Video / Voice tab selection filtering
    if (activeTab === 'Follow') {
      // Show matching followed profile identifiers or cycle list
      list = list.filter(r => r.id.includes('followed') || r.isPopular || r.level > 35);
      if (list.length === 0) {
        list = mergedRooms.slice(0, 3);
      }
    } else if (activeTab === 'Video') {
      list = list.filter(r => r.type === 'multi-guest-live');
    } else if (activeTab === 'Voice') {
      list = list.filter(r => r.type === 'audio-live');
    } // 'Hot' maintains the overall feeds sorted by hot/popularity

    // Country regional filter selection matching
    if (selectedCountry && selectedCountry.code && selectedCountry.code !== 'GL') {
      const matchedByCountry = list.filter(r => r.countryCode === selectedCountry.code);
      if (matchedByCountry.length > 0) {
        return matchedByCountry.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
      } else {
        // Fallback gracefully so lists are never blank when changing country filters
        // We override country metadata dynamically for a realistic clone result
        return list.map((r, idx) => {
          if (idx < 3) {
            return {
              ...r,
              countryCode: selectedCountry.code,
              title: `${selectedCountry.flag} [${selectedCountry.name}] ${r.title}`
            };
          }
          return r;
        }).filter(r => r.countryCode === selectedCountry.code)
          .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
      }
    }

    return list.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
  }, [mergedRooms, activeTab, selectedCountry]);

  // Join handler: registers simulated room in Firestore dynamically on first click to provide full operational live experience
  const handleJoinParty = async (room: any) => {
    showToast(`Entering the Party: ${room.title}! 🥳`, 'success');
    
    if (room.id.startsWith('party_')) {
      try {
        await setDoc(doc(db, 'rooms', room.id), {
          hostUid: room.hostUid,
          hostName: room.hostName,
          hostPhotoURL: room.hostPhotoURL,
          title: room.title,
          status: 'live',
          type: room.type,
          currentBeans: room.currentBeans || 1000,
          viewerCount: room.viewerCount || 100,
          likes: room.likes || 1500,
          guests: room.guests || [],
          seats: room.seats || generateMockSeats(room.type),
          isPrivate: false,
          pkStatus: 'idle',
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error backing simulated party to firestore:", err);
      }
    }

    navigate(`/room/${room.id}`);
  };

  // Join the currently active cycling followed streamer on the "One-Tap Mic On" trigger
  const handleJoinFollowedStreamer = async () => {
    const current = followedStreamers[currentFollowedIndex];
    showToast(`Connecting with followed host: ${current.name}! 🚀`, 'success');
    
    try {
      await setDoc(doc(db, 'rooms', current.id), {
        hostUid: `host_${current.id}`,
        hostName: current.name,
        hostPhotoURL: current.photoURL,
        title: current.roomTitle,
        status: 'live',
        type: current.category === 'Voice' ? 'audio-live' : 'multi-guest-live',
        currentBeans: 5200,
        viewerCount: current.viewerCount,
        likes: 2100,
        guests: ['seat_user_1', 'seat_user_2'],
        seats: generateMockSeats(current.category === 'Voice' ? 'audio-live' : 'multi-guest-live'),
        isPrivate: false,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error initializing followed streamer room:", err);
    }

    navigate(`/room/${current.id}`);
  };

  const activeFollowed = followedStreamers[currentFollowedIndex];

  return (
    <div className={`flex flex-col h-full overflow-hidden select-none pb-14 sm:pb-0 ${
      isLight ? 'bg-[#f4f4f7]' : 'bg-[#000000]'
    }`}>
      {/* Pristine cloned Top Header */}
      <header className={`flex-none border-b transition-colors duration-300 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-black border-neutral-900/60'
      }`}>
        {/* Row 1: Follow, Hot, Video, Voice + Filter controls */}
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-5 sm:gap-7">
            {(['Follow', 'Hot', 'Video', 'Voice'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  showToast(`Viewing ${tab} Rooms! 🌟`, "info");
                }}
                className="relative py-2 text-[16px] font-[900] tracking-tight transition-colors select-none duration-200"
                style={{ 
                  color: activeTab === tab ? (isLight ? '#121212' : '#ffffff') : '#9d9da6',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <span>{tab}</span>
                {activeTab === tab && (
                  <motion.div
                    layoutId="partyTopTabUnderline"
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full",
                      isLight ? "bg-stone-900" : "bg-white"
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-zinc-300">
            <button 
              onClick={() => showToast("Search active rooms... 🔍", "info")}
              className="p-1 hover:text-white transition-colors"
            >
              <Search size={21} className="stroke-[2.5]" />
            </button>
            
            <button 
              onClick={() => showToast("All notifications up-to-date! 🔔", "info")}
              className="relative p-1 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-current" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff3377] rounded-full" />
            </button>
          </div>
        </div>

        {/* Row 2: Selected Country (e.g., Ghana) + Recommendations caption */}
        <div className={cn("px-4 py-1.5 flex items-center gap-2 text-left transition-colors duration-300", isLight ? "bg-stone-100" : "bg-black/40")}>
          <button 
            onClick={() => setShowRegions(true)}
            className="text-[13px] font-[900] text-[#9d9da6] hover:text-[#00f3df] transition-colors leading-none flex items-center gap-1 uppercase tracking-wide"
          >
            <span>{selectedCountry.name}</span>
            <span className="text-[10px]">▼</span>
          </button>
          <span className={cn("text-[13px] font-[900] leading-none uppercase tracking-wide transition-colors", isLight ? "text-stone-950" : "text-white")}>
            Recommendations
          </span>
        </div>

        {/* Row 3: "Room" Title, Grid Layout Mode switcher, and Filter dialog modal launcher */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className={cn("text-[16px] font-black select-none tracking-tight uppercase transition-colors", isLight ? "text-[#121212]" : "text-white")}>
            Room
          </span>
          
          <div className="flex items-center gap-4">
            {/* Grid vs. List mode button matching native mockup */}
            <button 
              onClick={() => {
                const nextMode = layoutMode === 'grid' ? 'list' : 'grid';
                setLayoutMode(nextMode);
                showToast(`Layout toggled! 📺`, "info");
              }}
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              {layoutMode === 'grid' ? (
                <LayoutGrid size={20} className="stroke-[2.5]" />
              ) : (
                <LayoutList size={20} className="stroke-[2.5]" />
              )}
            </button>

            {/* Filter icon funnel triggers list dropdown region dialog sheet */}
            <button 
              onClick={() => setShowRegions(true)}
              className="text-zinc-400 hover:text-[#00f3df] transition-colors p-1"
              title="Region selector"
            >
              <svg className="w-[19px] h-[19px] text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Streams list container */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2.5">
        
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <Mic size={32} className="text-zinc-600 animate-pulse" />
            <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
              No live party streams in {selectedCountry.name} 🇺🇦
            </p>
            <button 
              onClick={() => setSelectedCountry({ name: 'Ghana', flag: '🇬🇭', code: 'GH' })}
              className="px-4 py-2 bg-zinc-900 border border-zinc-805 text-[10.5px] font-black text-white hover:text-[#00f3df] uppercase tracking-wider rounded-full"
            >
              Reset to Ghana 🇬🇭
            </button>
          </div>
        ) : layoutMode === 'grid' ? (
          /* Grid tiles cloned directly from Bigo Live layout screenshots */
          <div className="grid grid-cols-2 gap-2.5 pb-24">
            {filteredRooms.map((room) => {
              const displayParticipants = room.participants || [];
              const getConsistentLevel = (uid: string) => {
                const profilesMap: Record<string, number> = {
                  'host_shyne': 35,
                  'host_bigs': 45,
                  'host_rosey': 32,
                  'host_june': 48,
                  'host_babyface': 29,
                  'host_adabekee': 55,
                  'host_agency': 60,
                  'host_mothersday': 41,
                  'host_help_daddi': 34,
                  'host_target_hunt': 38,
                  'host_dating': 42,
                  'host_saveme': 36,
                  'host_wtwww': 26,
                  'host_about_me': 34,
                  'host_ptdims': 34,
                  'host_8kaway': 31,
                  'host_beans_goal': 34,
                  'host_million_dolls': 40,
                  'host_nobod_loves': 33,
                  'host_idea_bw': 30,
                  'host_retro_aria': 28,
                  'host_neon_dj_leo': 39,
                };
                if (profilesMap[uid]) return profilesMap[uid];
                
                let hash = 0;
                for (let i = 0; i < uid.length; i++) {
                  hash = uid.charCodeAt(i) + ((hash << 5) - hash);
                }
                return 15 + Math.abs(hash % 51);
              };
              const levelValue = getConsistentLevel(room.hostUid);
              const hasParticipants = displayParticipants.length > 0;
              
              return (
                <motion.div
                  key={room.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleJoinParty(room)}
                  className="relative aspect-[1/1.12] rounded-[18px] overflow-hidden cursor-pointer group bg-zinc-950 border border-white/5 shadow-lg flex flex-col"
                >
                  {/* Background photo block */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={room.hostPhotoURL || `https://picsum.photos/seed/${room.id}/500/500`} 
                      alt={room.hostName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35" />
                  </div>

                  {/* Top line layout items */}
                  <div className="relative z-10 w-full p-2 flex items-center justify-between">
                    {/* Sound Waves equalizer Live Status indicator */}
                    <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-0.5 rounded-full select-none">
                      {/* Beautiful real-time concurrent green lines visualizer */}
                      <span className="flex items-end gap-[1.2px] h-[8px] pb-[0.5px] select-none shrink-0 origin-bottom mr-1 bg-transparent">
                        <motion.span 
                          animate={{ height: ["2px", "7px", "3px", "6px", "2px"] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                          className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                        />
                        <motion.span 
                          animate={{ height: ["7px", "2px", "6px", "1px", "7px"] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                        />
                        <motion.span 
                          animate={{ height: ["3px", "6px", "1px", "8px", "3px"] }}
                          transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                          className="w-[1.2px] bg-[#00ff66] rounded-full origin-bottom"
                        />
                      </span>
                      <span className="text-[9px] font-black text-white uppercase tracking-wider">
                        {room.tag || 'Chat'}
                      </span>
                    </div>

                    {/* Viewers human icon counts tag */}
                    <div className="flex items-center gap-0.5 bg-black/35 backdrop-blur-xs px-2 py-0.5 rounded-full text-white select-none">
                      <Users size={9.5} className="text-white shrink-0" />
                      <span className="text-[10px] font-[900]">
                        {room.viewerCount}
                      </span>
                    </div>
                  </div>

                  {/* Spacer to push content down */}
                  <div className="flex-1" />

                  {/* Lower sections: Overlapping user bubbles & badges */}
                  <div className="relative z-10 p-3 flex flex-col justify-end space-y-1">
                    {/* Nested profile heads of occupants currently active inside streamer's live */}
                    <div className="flex items-center -space-x-1.5 mb-1.5">
                      {hasParticipants ? (
                        displayParticipants.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt="Guest avatar"
                            className="w-[25px] h-[25px] rounded-full object-cover border-[1.5px] border-white/60 bg-zinc-900 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        ))
                      ) : (
                        // Render empty mic seat circles to mirror the empty mics on screenshot
                        Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="w-[25px] h-[25px] rounded-full border-[1.5px] border-white/30 bg-black/50 backdrop-blur-xs flex items-center justify-center shadow-md shrink-0">
                            <Mic size={9.5} className="text-white/60" />
                          </div>
                        ))
                      )}
                    </div>

                    {/* Popular indicator pill + user ratings levels */}
                    <div className="flex items-center gap-1">
                      {room.isPopular && (
                        <span className="text-[8px] font-black text-white bg-cyan-500 rounded-[4px] px-1.5 py-0.5 leading-none">
                          Popular
                        </span>
                      )}
                      
                      <span className="text-[8.5px] font-[900] text-white bg-gradient-to-r from-amber-400 to-orange-500 rounded-[4px] px-1.5 py-0.5 leading-none flex items-center gap-0.5 shadow-sm">
                        <span>💎</span>
                        <span>Lv.{levelValue}</span>
                      </span>
                    </div>

                    {/* Cloned Room message/topic title */}
                    <h3 className="text-white text-[11.5px] font-[950] tracking-tight truncate leading-tight drop-shadow-md py-0.5">
                      {room.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Horizontal mode visual tiles layout */
          <div className="flex flex-col gap-2.5 pb-24">
            {filteredRooms.map((room) => {
              const displayParticipants = room.participants || [];
              const hasParticipants = displayParticipants.length > 0;
              const getConsistentLevel = (uid: string) => {
                const profilesMap: Record<string, number> = {
                  'host_shyne': 35,
                  'host_bigs': 45,
                  'host_rosey': 32,
                  'host_june': 48,
                  'host_babyface': 29,
                  'host_adabekee': 55,
                  'host_agency': 60,
                  'host_mothersday': 41,
                  'host_help_daddi': 34,
                  'host_target_hunt': 38,
                  'host_dating': 42,
                  'host_saveme': 36,
                  'host_wtwww': 26,
                  'host_about_me': 34,
                  'host_ptdims': 34,
                  'host_8kaway': 31,
                  'host_beans_goal': 34,
                  'host_million_dolls': 40,
                  'host_nobod_loves': 33,
                  'host_idea_bw': 30,
                  'host_retro_aria': 28,
                  'host_neon_dj_leo': 39,
                };
                if (profilesMap[uid]) return profilesMap[uid];
                
                let hash = 0;
                for (let i = 0; i < uid.length; i++) {
                  hash = uid.charCodeAt(i) + ((hash << 5) - hash);
                }
                return 15 + Math.abs(hash % 51);
              };
              const levelValue = getConsistentLevel(room.hostUid);

              return (
                <div 
                  key={room.id}
                  onClick={() => handleJoinParty(room)}
                  className={cn(
                    "relative h-28 w-full border rounded-[18px] overflow-hidden flex items-center p-2.5 gap-4 cursor-pointer transition-colors duration-300",
                    isLight 
                      ? "bg-white border-zinc-250 hover:bg-stone-50" 
                      : "bg-[#111] border-white/5 hover:border-[#00f3df]/30"
                  )}
                >
                  {/* Thumbnail cover */}
                  <div className="relative w-24 h-full rounded-[12px] overflow-hidden shrink-0 select-none">
                    <img 
                      src={room.hostPhotoURL || `https://picsum.photos/seed/${room.id}/300/300`} 
                      alt={room.hostName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Status live bars */}
                    <div className="absolute bottom-1.5 left-1.5 bg-black/70 px-2 py-0.5 rounded-full text-[7.5px] font-black text-[#00ff66] uppercase tracking-wider flex items-center gap-1 border border-white/10">
                      <span className="flex items-end gap-[1px] h-[7px] pb-[0.5px] select-none shrink-0 origin-bottom bg-transparent">
                        <motion.span 
                          animate={{ height: ["1.5px", "6px", "2px", "5px", "1.5px"] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                          className="w-[1px] bg-[#00ff66] rounded-full origin-bottom"
                        />
                        <motion.span 
                          animate={{ height: ["6px", "1.5px", "5px", "1px", "6px"] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className="w-[1px] bg-[#00ff66] rounded-full origin-bottom"
                        />
                        <motion.span 
                          animate={{ height: ["2px", "5px", "1px", "7px", "2px"] }}
                          transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                          className="w-[1px] bg-[#00ff66] rounded-full origin-bottom"
                        />
                      </span>
                      <span>{room.tag || 'Chat'}</span>
                    </div>
                  </div>

                  {/* Content metadata details */}
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[#9d9da6] text-[10px] font-bold uppercase truncate">
                          @{room.hostName || "Host"}
                        </span>
                        
                        <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black", isLight ? "bg-stone-100 text-stone-800" : "bg-zinc-900/85 text-white")}>
                          <Users size={8.5} />
                          <span>{room.viewerCount}</span>
                        </div>
                      </div>
                      
                      <h3 className={cn("text-[12.5px] font-black truncate leading-snug transition-colors", isLight ? "text-stone-900" : "text-white")}>
                        {room.title}
                      </h3>
                    </div>

                    {/* Lower nested grid bubbles and level indications */}
                    <div className="flex items-center justify-between border-t border-dashed border-zinc-800/60 pt-1.5">
                      <div className="flex items-center -space-x-1">
                        {hasParticipants ? (
                          displayParticipants.slice(0, 3).map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Guest head"
                              className="w-5 h-5 rounded-full object-cover border border-[#111]"
                              referrerPolicy="no-referrer"
                            />
                          ))
                        ) : (
                          Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="w-5 h-5 rounded-full border border-[#222] bg-zinc-800 flex items-center justify-center">
                              <Mic size={7.5} className="text-zinc-500" />
                            </div>
                          ))
                        )}
                      </div>

                      <span className="text-[8px] font-black text-white bg-gradient-to-r from-amber-400 to-orange-500 rounded px-1.5 py-0.5 leading-none">
                        💎 Lv.{levelValue}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 
        PREMIUM NATIVE FLOOR FLOATING WIDGET: "One-Tap Mic On"
        Cycles automatically through members of followed hosts currently live in the Party Hub
      */}
      <AnimatePresence mode="wait">
        {activeTab !== 'Follow' && activeFollowed && (
          <motion.div
            key={activeFollowed.id}
            initial={{ opacity: 0, y: 35, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 16, stiffness: 190 }}
            onClick={handleJoinFollowedStreamer}
            className="fixed bottom-[74px] right-3.5 z-40 w-[174px] h-[66px] bg-gradient-to-r from-[#03ccbc] via-[#03d8b7] to-[#addf58] text-white rounded-[20px] shadow-[0_10px_28px_rgba(3,204,188,0.4)] flex items-center pl-4 select-none cursor-pointer hover:scale-[1.03] active:scale-95 transition-all outline-none"
          >
            {/* Left Section: Double Line Text and Animated Scrolling Marquee Badge row */}
            <div className="flex flex-col items-start min-w-0 text-left select-none">
              <span className="text-[15.5px] font-[900] leading-[1.1] text-white font-sans tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                One-Tap Mic
              </span>
              <span className="text-[15.5px] font-[900] leading-none text-white font-sans tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] mt-0.5">
                On
              </span>
              
              {/* Premium smooth marquee container */}
              <div className="w-[90px] overflow-hidden mt-1.5 select-none">
                <motion.div
                  animate={{ x: ["5%", "-100%"] }}
                  transition={{
                    ease: "linear",
                    duration: 6,
                    repeat: Infinity,
                  }}
                  className="flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  {/* Custom styled Orange Pill Badge matching standard Bigo Live layout */}
                  <span className="text-[8px] font-[900] text-white bg-[#ff9c00] px-2 py-[2px] rounded-full uppercase tracking-wider leading-none shrink-0 shadow-sm">
                    Following
                  </span>
                  <span className="text-[9.5px] font-extrabold text-white/95 leading-none drop-shadow-xs shrink-0">
                    Someone you follow is live!
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Right Section: Circular Avatar styled inside an overlapping upper-right glowing teal ring */}
            <div className="absolute -top-3.5 -right-2.5 w-[58px] h-[58px] rounded-full flex items-center justify-center bg-[#1c1c1e] border-[3px] border-[#01ebd2] shadow-[0_5px_15px_rgba(3,204,188,0.45)] overflow-visible z-10">
              <div className="absolute inset-[-4px] rounded-full border border-[#01ebd2]/30 animate-ping opacity-20" />
              <img 
                src={activeFollowed.photoURL} 
                alt={activeFollowed.name}
                className="w-full h-full rounded-full object-cover border-[2px] border-[#1c1c1e]"
                referrerPolicy="no-referrer"
              />
              {/* Pulsating active green marker dot on bottom right */}
              <span className="absolute bottom-[2px] right-[2px] w-2.5 h-2.5 bg-[#00ff8c] border border-black rounded-full shadow-md animate-pulse z-20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cloned Regional Country selector Bottom Sheet Modal */}
      <AnimatePresence>
        {showRegions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegions(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />
            
            {/* Bottom Sheet Card Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={cn(
                "relative w-full max-w-md border-t shadow-2xl flex flex-col font-sans mb-0 h-[80vh] overflow-hidden transition-colors duration-300",
                isLight ? "bg-white border-zinc-200 text-stone-800" : "bg-zinc-950 border-zinc-800 text-zinc-300"
              )}
            >
              {/* Header handle notch */}
              <div className={cn("w-12 h-1 rounded-full mx-auto mt-3 shrink-0", isLight ? "bg-stone-300" : "bg-zinc-800")} />
              
              <div className={cn("flex items-center justify-between px-6 pt-3 pb-1 border-b shrink-0", isLight ? "border-stone-100" : "border-zinc-900")}>
                <span className={cn("text-[15px] font-black tracking-wide font-sans uppercase", isLight ? "text-stone-900" : "text-white")}>
                  Select country
                </span>
                <button 
                  onClick={() => setShowRegions(false)}
                  className={cn(
                    "p-1 rounded-full border transition-colors",
                    isLight ? "bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-950" : "bg-zinc-900 border-zinc-800 hover:text-white"
                  )}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Country dynamic Search text input field */}
              <div className={cn("p-4 shrink-0 transition-colors", isLight ? "bg-white" : "bg-zinc-950")}>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={countrySearchQuery}
                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                    placeholder="Search country name"
                    className={cn(
                      "w-full h-9 pl-9 pr-4 text-xs font-bold rounded-full placeholder-zinc-500 focus:outline-none focus:border-[#00f3df] border transition-colors", 
                      isLight ? "bg-stone-50 border-stone-200 text-stone-900 focus:bg-white" : "bg-zinc-900 border-zinc-800 text-white"
                    )}
                  />
                </div>
              </div>

              {/* Content lists */}
              <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
                {countrySearchQuery ? (
                  /* Filtered searched countries list results */
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      Search Results
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {regionsData.flatMap(r => r.countries)
                        .filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                        .map(country => (
                          <button
                            key={country.name}
                            onClick={() => {
                              setSelectedCountry({ name: country.name, flag: country.flag, code: country.code });
                              setShowRegions(false);
                              showToast(`Feeds switched to ${country.name}! 🗺️`, "success");
                            }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                              selectedCountry.name === country.name 
                                ? "border-[#00f3df] bg-[#00f3df]/10 text-[#00f3df]" 
                                : "border-zinc-900 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300"
                            }`}
                          >
                            <span>{country.flag}</span>
                            <span className="text-[11.5px] font-black truncate">{country.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  /* Categorized regions container lists */
                  regionsData.map(region => (
                    <div key={region.name} className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                        {region.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        {region.countries.map(country => (
                          <button
                            key={country.name}
                            onClick={() => {
                              setSelectedCountry({ name: country.name, flag: country.flag, code: country.code });
                              setShowRegions(false);
                              showToast(`Streams filtered for ${country.name}! 🌍`, "success");
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all select-none ${
                              selectedCountry.name === country.name 
                                ? "border-[#00f3df]/80 bg-[#00f3df]/5 text-[#00f3df]" 
                                : "border-zinc-905 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300"
                            }`}
                          >
                            <span className="text-[14px] leading-none shrink-0">{country.flag}</span>
                            <span className="text-[11.5px] font-black truncate">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render GoLiveModal when Active */}
      <AnimatePresence>
        {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
      </AnimatePresence>
    </div>
  );
}
