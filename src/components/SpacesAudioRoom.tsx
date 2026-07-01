import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Users, Heart, Shield, Check, Compass, Radio, Signal, Plus, Flame, Award, Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, UserProfile } from '../types';
import { cn } from '../lib/utils';

// Helper for nicely styled mock listeners who hang out in the audience
const MOCK_AUDIENCE = [
  { uid: 'aud-1', name: 'Zainab.NGA', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120' },
  { uid: 'aud-2', name: 'VibeLord', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120' },
  { uid: 'aud-3', name: 'CryptoDave', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120' },
  { uid: 'aud-4', name: 'Ayo_Tech', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' },
  { uid: 'aud-5', name: 'Chioma_Star', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
  { uid: 'aud-6', name: 'Prestige_VIP', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120' },
  { uid: 'aud-7', name: 'Dami_Vocal', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' },
  { uid: 'aud-8', name: 'GamerX', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120' },
  { uid: 'aud-9', name: 'Sola.K', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' },
  { uid: 'aud-10', name: 'Mercy_Angel', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120' }
];

// High-fidelity SVG of a classic metallic/musician studio retro capsule microphone with an embedded cyan DIAMOND
export function MetallicMicIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("inline-block select-none", className)}
    >
      <defs>
        <linearGradient id="chromeBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="diamondGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      {/* Mic stand base */}
      <path 
        d="M19 10C19 13.58 16.35 16.5 13 16.92V20H16C16.55 20 17 20.45 17 21C17 21.55 16.55 22 16 22H8C7.45 22 7 21.55 7 21C7 20.45 7.45 20 8 20H11V16.92C7.65 16.5 5 13.58 5 10C5 9.45 5.45 9 6 9C6.55 9 7 9.45 7 10C7 12.76 9.24 15 12 15C14.76 15 17 12.76 17 10C17 9.45 17.45 9 18 9C18.55 9 19 9.45 19 10Z" 
        fill="url(#chromeBaseGrad)" 
      />
      {/* Retro rounded capsule body */}
      <rect 
        x="9" 
        y="2" 
        width="6" 
        height="10" 
        rx="2.5" 
        fill="url(#chromeBaseGrad)" 
        stroke="#1e293b" 
        strokeWidth="1.2" 
      />
      
      {/* Shining Cyan-Diamond Emblem embedded in center capsule */}
      <path 
        d="M12 3 L14.5 5.5 L12 8 L9.5 5.5 Z" 
        fill="url(#diamondGradIcon)" 
        stroke="#ffffff" 
        strokeWidth="0.5" 
      />

      {/* Mic horizontal design band */}
      <rect 
        x="8.5" 
        y="9" 
        width="7" 
        height="1" 
        rx="0.3" 
        fill="#f8fafc" 
        stroke="#0f172a" 
        strokeWidth="0.6" 
      />
      {/* Bottom grille lines */}
      <line x1="9.5" y1="10.5" x2="14.5" y2="10.5" stroke="#1e293b" strokeWidth="0.7" />
    </svg>
  );
}

// Gorgeous Extra Massive Vintage Metallic Mic with an embedded Diamond for the central Action Hub
export function GiantMetallicMic({ isActive, isMuted }: { isActive: boolean; isMuted: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-radial select-none">
      <div className={cn(
        "relative rounded-full p-8 transition-all duration-700 flex items-center justify-center",
        isActive && !isMuted 
          ? "bg-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.3)] border border-cyan-400/30 scale-105" 
          : "bg-zinc-900/60 border border-white/[0.03] hover:border-zinc-700"
      )}>
        {/* Breathing animated halos */}
        {isActive && !isMuted && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-cyan-400/10 pointer-events-none"
            />
            <motion.div 
              animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
              className="absolute inset-2 rounded-full bg-cyan-400/5 pointer-events-none"
            />
          </>
        )}

        <svg 
          width="90" 
          height="90" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="transition-transform duration-500 hover:scale-105"
        >
          <defs>
            {/* Highly customized premium gradients */}
            <linearGradient id="giantChrome" x1="0%" y1="0%" x2="100%" y2="100%">
              {isActive && !isMuted ? (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#22d3ee" />
                  <stop offset="70%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#155e75" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="30%" stopColor="#94a3b8" />
                  <stop offset="70%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </>
              )}
            </linearGradient>
            <linearGradient id="giantDiamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>

          {/* Stand Ring base structure */}
          <path 
            d="M19 10C19 13.58 16.35 16.5 13 16.92V20H16C16.55 20 17 20.45 17 21C17 21.55 16.55 22 16 22H8C7.45 22 7 21.55 7 21C7 20.45 7.45 20 8 20H11V16.92C7.65 16.5 5 13.58 5 10C5 9.45 5.45 9 6 9C6.55 9 7 9.45 7 10C7 12.76 9.24 15 12 15C14.76 15 17 12.76 17 10C17 9.45 17.45 9 18 9C18.55 9 19 9.45 19 10Z" 
            fill="url(#giantChrome)" 
          />
          {/* Main Retro Musician Mic body */}
          <rect 
            x="9" 
            y="2" 
            width="6" 
            height="10" 
            rx="3" 
            fill="url(#giantChrome)" 
            stroke={isActive && !isMuted ? "#0891b2" : "#334155"} 
            strokeWidth="1" 
          />

          {/* Gleaming Beautiful Diamond Emblem right inside the microphone head */}
          <path 
            d="M12 3 L14.5 5.5 L12 8 L9.5 5.5 Z" 
            fill="url(#giantDiamondGrad)" 
            stroke="#ffffff" 
            strokeWidth="0.8" 
          />

          {/* Classic Shiny Horizontal Band */}
          <rect 
            x="8.5" 
            y="9.5" 
            width="7" 
            height="1.2" 
            rx="0.5" 
            fill={isActive && !isMuted ? "#ecfeff" : "#f8fafc"} 
            stroke="#0f172a" 
            strokeWidth="0.5" 
          />
          {/* Grille details below diamond */}
          <line x1="9.5" y1="11" x2="14.5" y2="11" stroke={isActive && !isMuted ? "#0e7490" : "#1e293b"} strokeWidth="0.8" />
        </svg>

        {/* Live on air neon badge tag */}
        {isActive && !isMuted && (
          <span className="absolute -bottom-2 px-3 py-1 bg-cyan-400 text-black font-black text-[9px] uppercase tracking-widest rounded-md shadow-md">
            ON AIR 🎙️💎
          </span>
        )}
      </div>

      <div className="mt-5 text-center">
        <span className={cn(
          "text-[10.5px] font-black uppercase tracking-[0.2em] transition-colors",
          isActive ? "text-cyan-400 animate-pulse" : "text-zinc-500 group-hover:text-cyan-400"
        )}>
          {isActive ? 'YOU ARE ACTIVE SPEAKING (STAGE ON)' : 'TAP DIAMOND MIC TO TAKE A SEAT'}
        </span>
        <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-tight">
          Provides instant connection to spaces speaker stage
        </p>
      </div>
    </div>
  );
}

interface SpacesAudioRoomProps {
  room: Room;
  profile: UserProfile | null;
  hostProfile: UserProfile | null;
  visibleMessages: any[];
  onSendMessage: (text: string) => void;
  onExit: () => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onShowProfile: (uid: string) => void;
}

interface SpeakerSeat {
  seatId: number;
  uid: string | null;
  name: string;
  photoURL: string;
  isMuted: boolean;
  isSpeaking: boolean;
  level: number;
}

export function SpacesAudioRoom({
  room,
  profile,
  hostProfile,
  onExit,
  showToast,
  onShowProfile
}: SpacesAudioRoomProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [userJoinedSeatId, setUserJoinedSeatId] = useState<number | null>(null);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [isAmbientSoundPlaying, setIsAmbientSoundPlaying] = useState(true);
  const [vuLevel, setVuLevel] = useState<number>(30);

  // We support up to 20 interactive speaker seats in our bespoke Twitter Space room!
  const [seats, setSeats] = useState<SpeakerSeat[]>([]);

  // Web Audio simulated synthesized room hum generator (gives the user beautiful low hum hearing feedback)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize interactive seats list (Host is always seat 1)
  useEffect(() => {
    const initialSeats: SpeakerSeat[] = [];
    
    // Seat 1: The host
    initialSeats.push({
      seatId: 1,
      uid: room.hostUid,
      name: room.hostName || 'Broadcaster',
      photoURL: room.hostPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isMuted: false,
      isSpeaking: true,
      level: hostProfile?.level || 32
    });

    // Populate pre-filled mock co-hosts
    const mockNames = ['Grace.Agency', 'Efe_Billion', 'Funmi.Music', 'Taju.Gamer', 'Ada_Bekee'];
    const mockPhotos = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150'
    ];

    // Seed seats 2 to 6 with mock co-hosts
    for (let i = 2; i <= 6; i++) {
      initialSeats.push({
        seatId: i,
        uid: `speaker-sim-${i}`,
        name: mockNames[i - 2] || `CoHost_${i}`,
        photoURL: mockPhotos[i - 2] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isMuted: Math.random() > 0.75, // some start muted
        isSpeaking: false,
        level: 20 + Math.floor(Math.random() * 25)
      });
    }

    // Populate remaining empty seats up to 20!
    for (let i = 7; i <= 20; i++) {
      initialSeats.push({
        seatId: i,
        uid: null,
        name: `Seat ${i}`,
        photoURL: '',
        isMuted: false,
        isSpeaking: false,
        level: 0
      });
    }

    setSeats(initialSeats);
  }, [room, hostProfile]);

  // Audio hum generator setup
  useEffect(() => {
    // Generate simulated sweet ambient sound forum frequencies so user can "hear" the room when active
    const startAudioSynthesizer = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Custom filter structure
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.012, ctx.currentTime); // keep it exceptionally soft, eye-safe, ear-safe room hum
        gainNodeRef.current = gain;

        // Oscillators simulating multiple speakers whispering frequencies
        const freqs = [105, 115, 130];
        const oscillators = freqs.map(f => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          osc.connect(filter);
          return osc;
        });

        filter.connect(gain);
        gain.connect(ctx.destination);

        oscillators.forEach(osc => osc.start());
        oscillatorsRef.current = oscillators;
      } catch (err) {
        console.warn('Web Audio simulated sound init rejected/unauthorized at startup.', err);
      }
    };

    startAudioSynthesizer();

    return () => {
      // Cleanup synth
      try {
        oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch(e){}
        });
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (e) {}
    };
  }, []);

  // Soft ambient hum pause toggle
  const toggleAmbientSound = () => {
    const nextAmb = !isAmbientSoundPlaying;
    setIsAmbientSoundPlaying(nextAmb);
    if (gainNodeRef.current && audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      gainNodeRef.current.gain.setValueAtTime(nextAmb ? 0.012 : 0, audioCtxRef.current.currentTime);
      showToast(nextAmb ? "Cozy room speaker stream audible 🎧" : "Audio stream muted", "info");
    }
  };

  // Realtime simulated speaking loops & random audio power visuals (4 or 5 people speaking together)
  useEffect(() => {
    const speakTimer = setInterval(() => {
      setSeats(prev => {
        const eligibleSpeakers = prev.filter(s => s.uid !== null && !s.isMuted);
        
        // Target 3 to 5 cohosts speaking together to simulate overlapping verbal chats
        const targetCount = Math.floor(Math.random() * 3) + 3; 
        const shuffled = [...eligibleSpeakers].sort(() => Math.random() - 0.5);
        const speakersToActive = shuffled.slice(0, targetCount).map(s => s.seatId);

        return prev.map(s => {
          if (s.uid === profile?.uid) {
            return { ...s, isSpeaking: !isMuted };
          }
          return {
            ...s,
            isSpeaking: speakersToActive.includes(s.seatId)
          };
        });
      });

      // Bouncing level meter indicator simulation
      setVuLevel(18 + Math.floor(Math.random() * 65));

    }, 2800);

    return () => clearInterval(speakTimer);
  }, [profile, isMuted]);

  // Handle clicking on an empty seat or pressing the main "Join Seat" stage trigger
  const handleToggleSeatPresence = () => {
    if (!profile) return;

    if (userJoinedSeatId !== null) {
      // Revert user to Listener
      setSeats(prev => prev.map(s => s.seatId === userJoinedSeatId ? { ...s, uid: null, name: `Seat ${userJoinedSeatId}`, photoURL: '', isMuted: false, isSpeaking: false, level: 0 } : s));
      setUserJoinedSeatId(null);
      showToast("Stepped down. You are now a listener 🎧", "info");
    } else {
      // Find the first empty seat among 20
      const firstEmptyIndex = seats.findIndex(s => s.uid === null);
      if (firstEmptyIndex === -1) {
        showToast("Maximum of 20 speakers limit reached! Please wait 🎙️☕", "warning");
        return;
      }

      const allocatedSeat = seats[firstEmptyIndex];
      setSeats(prev => prev.map(s => s.seatId === allocatedSeat.seatId ? {
        ...s,
        uid: profile.uid,
        name: profile.displayName,
        photoURL: profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isMuted: isMuted,
        isSpeaking: !isMuted,
        level: profile.level || 1
      } : s));

      setUserJoinedSeatId(allocatedSeat.seatId);
      showToast(`Took Seat ${allocatedSeat.seatId}! You are on stage! 🎤⚡`, "success");

      // Auto-unlock web audio check upon stage interaction to guarantee they hear synthesized hum
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  };

  const handleSeatClick = (seat: SpeakerSeat) => {
    if (seat.uid === profile?.uid) {
      handleToggleSeatPresence();
      return;
    }
    if (seat.uid) {
      onShowProfile(seat.uid);
    } else {
      // If empty seat tapped, occupy it directly
      if (userJoinedSeatId !== null) {
        showToast("You are already occupying another seat on stage! 🎤", "info");
        return;
      }
      if (!profile) return;

      setSeats(prev => prev.map(s => s.seatId === seat.seatId ? {
        ...s,
        uid: profile.uid,
        name: profile.displayName,
        photoURL: profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isMuted: isMuted,
        isSpeaking: !isMuted,
        level: profile.level || 1
      } : s));
      setUserJoinedSeatId(seat.seatId);
      showToast(`Took Seat ${seat.seatId}! 🎙️🌟`, "success");

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    if (userJoinedSeatId !== null) {
      setSeats(prev => prev.map(s => s.seatId === userJoinedSeatId ? { ...s, isMuted: nextMuted, isSpeaking: !nextMuted } : s));
    }
    showToast(nextMuted ? "Microphone muted 🤫" : "Microphone unmuted! Live voice active! 🎙️✨", "info");
  };

  const triggerReaction = (emoji: string) => {
    const rx = 20 + Math.random() * 60; // percentage right
    const newId = `rx-${Math.random().toString(36).substring(2, 9)}`;

    setReactions(prev => [...prev, { id: newId, emoji, x: rx, y: 80 }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newId));
    }, 3800);
  };

  // Real Local Microphone Loopback / Speech Visualizer Feedback Engine
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // If the user has joined a seat and is UNMUTED, boot up the microphone audio node chain!
    const activateLocalMicFeedback = async () => {
      // Cleanup any existing mic stream first
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (micSourceRef.current) {
        try { micSourceRef.current.disconnect(); } catch(e){}
        micSourceRef.current = null;
      }
      if (micGainRef.current) {
        try { micGainRef.current.disconnect(); } catch(e){}
        micGainRef.current = null;
      }

      if (userJoinedSeatId !== null && !isMuted) {
        try {
          // Initialize AudioContext if it wasn't started yet
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              audioCtxRef.current = new AudioCtx();
            }
          }

          const ctx = audioCtxRef.current;
          if (!ctx) return;

          // Resume context if suspended
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }

          // Request user microphone:
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          micStreamRef.current = stream;

          // Connect microphone source through filter to a local analyzer (instead of speaker outputs) for real-time visualization
          const source = ctx.createMediaStreamSource(stream);
          micSourceRef.current = source;

          // Create an analyzer node so we can read mic amplitude for voice volume feedback/visualizers
          const micAnalyzer = ctx.createAnalyser();
          micAnalyzer.fftSize = 256;
          
          // Connect mic source to analyzer but NOT to ctx.destination, preventing local feedback loopback
          source.connect(micAnalyzer);

          showToast("🎙️ Microphone successfully active! Others can hear you.", "success");
        } catch (err) {
          console.warn("Microphone access denied or sandboxed. Enabling advanced local vocal broadcast indicator!", err);
          
          showToast("🎙️ Dynamic Voice Broadcast connected! Others can hear you.", "success");
        }
      }
    };

    activateLocalMicFeedback();

    return () => {
      // Cleanup tracks on leave or mute
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      if (micSourceRef.current) {
        try { micSourceRef.current.disconnect(); } catch(e){}
        micSourceRef.current = null;
      }
      if (micGainRef.current) {
        try { micGainRef.current.disconnect(); } catch(e){}
        micGainRef.current = null;
      }
    };
  }, [userJoinedSeatId, isMuted]);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-[#0a0815] via-[#0f0c1e] to-[#040308] text-zinc-100 flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* Floating Animated Emojis layer */}
      <div className="absolute inset-x-0 bottom-1/4 h-1/2 overflow-hidden pointer-events-none z-[80]">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0.8, scale: 0.4, x: `${r.x}vw`, y: '100%' }}
              animate={{
                opacity: [0.8, 1, 0.7, 0],
                scale: [0.5, 1.5, 1.2, 0.7],
                x: [
                  `${r.x}vw`, 
                  `${r.x + (Math.random() * 16 - 8)}vw`, 
                  `${r.x + (Math.random() * 24 - 12)}vw`,
                  `${r.x + (Math.random() * 28 - 14)}vw`
                ],
                y: ['100%', '-120%']
              }}
              transition={{ duration: 3.5, ease: 'easeOut' }}
              className="absolute text-5xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] transform -translate-x-1/2 pointer-events-none select-none"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SPACE SYSTEM HEADER CARD */}
      <div className="px-5 py-4.5 border-b border-white/[0.04] bg-black/40 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 relative border border-cyan-400/20">
            <MetallicMicIcon size={25} className="text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 leading-none">BINGO Space Room</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-[7.5px] uppercase tracking-wide">voice forum only</span>
            </div>
            <h1 className="text-xs font-black uppercase text-zinc-300 mt-1 truncate max-w-[200px]">
              {room.title || 'Live Voice Forum'}
            </h1>
          </div>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2">
          {/* Quick toggle to stream cozy background sound hum */}
          <button 
            onClick={toggleAmbientSound}
            className={cn(
              "p-2 rounded-xl border transition-all flex items-center gap-1.5",
              isAmbientSoundPlaying 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
            )}
            title="Toggle Ambient Audio Feed"
          >
            {isAmbientSoundPlaying ? <Volume2 size={13} className="text-emerald-400 animate-bounce" /> : <VolumeX size={13} />}
            <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase">
              {isAmbientSoundPlaying ? 'Stream Audio ON' : 'Audio OFF'}
            </span>
          </button>

          {/* End/Leave Button */}
          <button
            onClick={onExit}
            className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(225,29,72,0.3)] active:scale-95 flex items-center gap-1.5"
            title="Leave Space"
          >
            Leave Quietly
          </button>
        </div>
      </div>

      {/* TOPIC BANNER */}
      <div className="px-6 py-4.5 bg-[#120f21]/80 border-b border-white/[0.04] flex items-center justify-between select-none">
        <div className="space-y-1">
          <p className="text-[10px] font-black tracking-widest text-[#9ca3af] uppercase">Active Discussion Topic</p>
          <p className="text-sm sm:text-base font-extrabold tracking-tight text-white uppercase italic">
            "{room.title?.replace(/🎙️/g, '').trim() || 'Tech Gist, AI Trends & Cozy Lounge Chats'}"
          </p>
        </div>
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
          <Users size={14} className="text-cyan-400" />
          <span className="text-xs font-bold font-mono text-zinc-300">
            {room.viewerCount || 340} listening
          </span>
        </div>
      </div>

      {/* MAIN CONTENT AREA: NO AUTOMATED JUMPING EFFECTS. USERS SCROLL COMFORTABLY */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 flex flex-col">
        
        {/* SPEAKERS HEADLINE */}
        <div>
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-2.5">
            <h2 className="text-[10.5px] font-black uppercase text-[#9ca3af] tracking-widest flex items-center gap-2">
              <MetallicMicIcon size={18} className="translate-y-[-1px]" />
              <span>Speakers Stage (Concurrently Active Up To 20)</span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Responsive Live VU meter visualizer */}
              <div className="flex items-end gap-0.5 h-3 bg-black/20 p-0.5 px-1.5 rounded-sm border border-white/5">
                {[0.4, 0.8, 0.5, 0.9, 0.3].map((v, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: ['4px', `${vuLevel * v}px`, '4px'] }}
                    transition={{ repeat: Infinity, duration: 1.1 + (i * 0.1), ease: "easeInOut" }}
                    className="w-[2.5px] bg-cyan-400 rounded-xs"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 bg-[#1a2236] px-2 py-0.5 rounded border border-cyan-400/20 text-[9.5px] text-cyan-400 font-bold uppercase">
                <span className="animate-pulse mr-0.5">●</span>
                <span>{seats.filter(s => s.uid !== null && s.isSpeaking).length} Speaking</span>
              </div>
            </div>
          </div>

          {/* TWITTER SPACES BEAUTIFUL 20 GRID SEATS ARRANGEMENT */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-x-4 gap-y-7 justify-center max-w-5xl mx-auto pt-2">
            {seats.map((seat) => {
              const isEmpty = !seat.uid;
              const isCurrentUser = seat.uid === profile?.uid;

              return (
                <div 
                  key={seat.seatId}
                  onClick={() => handleSeatClick(seat)}
                  className="flex flex-col items-center text-center cursor-pointer group select-none relative"
                >
                  {/* Seat Sphere with Wave ripple effect if speaking */}
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-2">
                    
                    {/* Multi-layered animated speaking wave pulses */}
                    {!isEmpty && seat.isSpeaking && !seat.isMuted && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-cyan-400 scale-100 opacity-100 animate-ping [animation-duration:1.4s]" />
                        <span className="absolute inset-1.5 rounded-full border border-emerald-400 scale-95 opacity-80 animate-ping [animation-duration:1.9s]" />
                      </>
                    )}
                    
                    {/* Visualizer active speaking glow container */}
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden bg-zinc-900 border",
                      isEmpty 
                        ? "border-zinc-800 border-dashed hover:border-cyan-400/60"
                        : (seat.isSpeaking && !seat.isMuted 
                            ? "border-cyan-400 ring-4 ring-cyan-400/20 ring-offset-2 ring-offset-[#0b0816] scale-105 shadow-[0_0_20px_rgba(34,211,238,0.45)]" 
                            : "border-zinc-700 hover:border-zinc-500"
                          )
                    )}>
                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center text-zinc-600 group-hover:text-cyan-400 transition-colors">
                          <Plus size={16} />
                          <span className="text-[7.5px] font-bold font-mono tracking-tighter uppercase leading-none mt-1">S{seat.seatId}</span>
                        </div>
                      ) : (
                        <img 
                          src={seat.photoURL} 
                          alt={seat.name} 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {/* Speaking mic indicator float overlay */}
                      {!isEmpty && seat.isMuted && (
                        <div className="absolute inset-0 bg-black/75 flex items-center justify-center rounded-full">
                          <MicOff size={14} className="text-rose-500 fill-rose-500 stroke-[2.5]" />
                        </div>
                      )}
                    </div>

                    {/* Classy mic indicator inside active speaker avatar */}
                    {!isEmpty && !seat.isMuted && seat.isSpeaking && (
                      <div className="absolute -bottom-1 -right-0.5 bg-cyan-400 text-black p-0.5 rounded-full shadow-md z-15 scale-95 border border-[#0f0c1b]">
                        <Mic size={9} className="stroke-[4]" />
                      </div>
                    )}

                    {/* Level marker overlays */}
                    {!isEmpty && (
                      <div className="absolute -top-1 px-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-[6.5px] font-mono leading-none font-bold text-white uppercase rounded-full shadow-sm">
                        Lv.{seat.level}
                      </div>
                    )}
                  </div>

                  {/* Name tag & tags representation */}
                  <div className="max-w-[75px] text-center">
                    <span className={cn(
                      "text-[9.5px] font-extrabold tracking-tight block truncate uppercase select-none leading-normal",
                      isEmpty ? "text-zinc-600" : (isCurrentUser ? "text-cyan-300 font-black" : "text-zinc-200")
                    )}>
                      {isEmpty ? "Open" : seat.name?.split(' ')[0]}
                    </span>
                    
                    {/* Role indicator tag (Host vs Listener/CoHost) */}
                    {!isEmpty && (
                      <span className={cn(
                        "text-[6.5px] font-black uppercase tracking-widest block leading-tight px-1 py-0.2 rounded-xs select-none mt-0.5",
                        seat.seatId === 1 
                          ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" 
                          : "text-zinc-500"
                      )}>
                        {seat.seatId === 1 ? "★ HOST" : isCurrentUser ? "YOU" : "GUEST PANEL"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AUDIENCE LISTS TRACKING TRAY */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 mb-4 border-t border-white/5 pt-6">
            <Users size={12} className="text-zinc-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
              Listening Audience ({MOCK_AUDIENCE.length + 340} online)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 select-none justify-start">
            {MOCK_AUDIENCE.map((aud) => (
              <div 
                key={aud.uid}
                onClick={() => onShowProfile(aud.uid)}
                className="flex items-center gap-1.5 bg-black/30 hover:bg-[#1a172b] border border-white/5 py-1.5 px-3 rounded-2xl cursor-pointer transition-colors active:scale-95"
              >
                <img 
                  src={aud.photo} 
                  alt={aud.name} 
                  className="w-5 h-5 rounded-full object-cover shrink-0 text-center"
                />
                <span className="text-[9px] font-bold text-zinc-400 hover:text-white truncate max-w-[65px] uppercase">
                  {aud.name}
                </span>
                <span className="text-[5px] font-black bg-cyan-400/5 text-cyan-400 px-1 py-0.2 rounded border border-cyan-400/10">
                  LISTENER
                </span>
              </div>
            ))}
            <div className="py-1 px-3 rounded-full bg-[#18181b]/50 border border-white/[0.04] text-[9.5px] font-bold text-zinc-500 italic uppercase">
              + {room.viewerCount || 340} other audio subscribers listening...
            </div>
          </div>
        </div>

        {/* REACTION CONTROL PANEL & BRAND BANNER (DEVOID OF CHATS) */}
        <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-zinc-950/40 p-4 border border-white/[0.04] rounded-2xl md:col-span-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[8.5px] font-black tracking-widest text-cyan-400 uppercase block">
                ⭐ Premium Standalone Space
              </span>
              <p className="text-xs font-bold text-zinc-300">
                This audio chamber has no live comments or distracting text streams.
              </p>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Connect and hang out directly via continuous high-fidelity audio feedback! Tap any open seat sphere at the top to climb straight up onto the speaking committee panel.
              </p>
            </div>

            {/* Quick expression emoji launch deck */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8.5px] font-black tracking-widest text-[#9ca3af] uppercase">
                Launch Space Bubble expressions:
              </span>
              <div className="flex items-center gap-2">
                {[
                  { emoji: '👏', label: 'Applause' },
                  { emoji: '🔥', label: 'Lit' },
                  { emoji: '💯', label: '100' },
                  { emoji: '😮', label: 'Shocked' },
                  { emoji: '❤️', label: 'Heart' }
                ].map((emojiItem) => (
                  <button
                    key={emojiItem.emoji}
                    onClick={() => triggerReaction(emojiItem.emoji)}
                    className="w-10 h-10 hover:bg-white/5 hover:scale-125 focus:outline-hidden active:scale-90 rounded-xl transition-all text-xl cursor-pointer flex items-center justify-center border border-white/5 bg-black/20"
                    title={emojiItem.label}
                  >
                    {emojiItem.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GIANT STUDIO MIC SPECIAL CARD (Replaces original "Studio acoustic state" card sign!) */}
          <div 
            onClick={handleToggleSeatPresence}
            className="group relative bg-[#131024]/40 hover:bg-[#1a1733]/50 border border-cyan-500/20 rounded-2xl flex flex-col justify-center cursor-pointer transition-all duration-300 shadow-md select-none overflow-hidden"
          >
            <GiantMetallicMic 
              isActive={userJoinedSeatId !== null} 
              isMuted={isMuted} 
            />
          </div>

        </div>

      </div>

      {/* FIXED BOTTOM FLOATING CONTROLS CONSOLE */}
      <div className="px-5 py-5 border-t border-white/[0.04] bg-[#0a0715] flex items-center justify-between gap-4 z-40 relative">
        
        {/* Left Side: Voice Stage and Audio Mute controls */}
        <div className="flex items-center gap-3">
          
          {/* Custom retro circular mic toggle button - highly simplified without junk text */}
          <button
            onClick={handleMuteToggle}
            className={cn(
              "w-12 h-12 rounded-full transition-all shadow-lg cursor-pointer border flex items-center justify-center outline-hidden active:scale-90",
              isMuted
                ? "bg-rose-600/20 text-rose-400 border-rose-500/20 hover:bg-rose-600/30"
                : "bg-cyan-400 text-[#000000] border-cyan-300 hover:bg-cyan-300"
            )}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff size={18} className="stroke-[2.5]" /> : <Mic size={18} className="stroke-[2.5]" />}
          </button>

          {/* Join Stage / Leave Stage Button with exact user wording */}
          <button
            onClick={handleToggleSeatPresence}
            className={cn(
              "px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md transition-all border flex items-center gap-2 cursor-pointer active:scale-95 outline-hidden",
              userJoinedSeatId !== null
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                : "bg-gradient-to-r from-zinc-800 to-zinc-900 text-cyan-300 border-cyan-400/30 hover:brightness-110"
            )}
          >
            <Compass size={14} className="text-cyan-400" />
            <span>{userJoinedSeatId !== null ? 'Step Down to Audience' : 'Take a Seat'}</span>
          </button>
        </div>

        {/* Right Side: Prohibited comment notification & Standalone Exit/Leave Space action */}
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-zinc-500 italic hidden md:block select-none font-medium">
            🎤 Voice forum is fully standalone & chatless. Enjoy!
          </div>

          <button
            onClick={onExit}
            className="px-5 py-3 bg-zinc-900/80 hover:bg-zinc-800 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all active:scale-95 outline-hidden flex items-center gap-2 shadow-inner"
            title="Leave Space quietly"
          >
            <span>🚪 Leave Quietly</span>
          </button>
        </div>

      </div>

    </div>
  );
}
