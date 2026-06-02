import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Film, Play, Plus, Clock, Globe, Shield, Star, Users, Flame, Info, Share2, 
  Volume2, Maximize2, Settings, Subtitles, HelpCircle, Activity, Heart, Send, Mic, Sparkles, AlertCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export interface Movie {
  id: string;
  title: string;
  category: string;
  year: string;
  score: string;
  duration: string;
  hostName?: string;
  hostPhoto?: string;
  viewerCount?: number;
  description: string;
  backdropUrl: string;
  posterUrl: string;
  tags: string[];
  isLiveWatch: boolean;
  videoUrl?: string;
}

export default function MoviesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const isLight = theme === 'light';

  // Navigation categorization tab
  const [movieCategory, setMovieCategory] = useState<'All' | 'Cinemas' | 'Sci-Fi' | 'Anime' | 'Action'>('All');
  
  // Active movie being played/screened
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // Player controls state
  const [resolution, setResolution] = useState<'4K Ultra HD' | '1080p FHD' | '720p HD' | 'Auto'>('4K Ultra HD');
  const [audioMode, setAudioMode] = useState<'Stereo' | 'Atmos 5.1' | 'IMAX Enhanced'>('Atmos 5.1');
  const [dimLights, setDimLights] = useState(false);
  const [currentTime, setCurrentTime] = useState(128); // mock start time
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Interactive Live Chat system
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; text: string; giftAnim?: string; badgeColor?: string }>>([
    { id: '1', user: 'AlexStream', text: 'OMG, this 4K stream is silky smooth guys! 🔥', badgeColor: 'bg-cyan-500' },
    { id: '2', user: 'Luna_Vibe', text: 'I have watched this three times, absolute masterclass!', badgeColor: 'bg-purple-500' },
    { id: '3', user: 'BigoLegend', text: 'Host, can you screen the directors cut next weekend?', badgeColor: 'bg-amber-500 font-bold border border-amber-300' },
    { id: '4', user: 'NeonRider', text: '🍿 pop-corn wave! Let us go!' }
  ]);

  // Floating gift animation track
  const [floatingGifts, setFloatingGifts] = useState<Array<{ id: string; label: string; x: number; y: number }>>([]);
  
  // Mic Slots Seating State
  const [micSeats, setMicSeats] = useState<Array<{ slotIndex: number; user: string | null; photo: string | null; talking: boolean }>>([
    { slotIndex: 1, user: 'CinemaHost', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150', talking: true },
    { slotIndex: 2, user: null, photo: null, talking: false },
    { slotIndex: 3, user: null, photo: null, talking: false },
    { slotIndex: 4, user: null, photo: null, talking: false }
  ]);

  // Mock Movie list dataset
  const mockMovies: Movie[] = [
    {
      id: 'dune-spice-dust',
      title: 'DUAL NEBULA: CHRONICLES OF SPICE',
      category: 'Sci-Fi',
      year: '2026',
      score: '9.8',
      duration: '2h 35m',
      hostName: 'SpaceGothic',
      hostPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150',
      viewerCount: 14820,
      description: 'Humanity faces an explosive galactic struggle on a radiant desert celestial sphere as mystical space spice resources trigger interstellar dominance. Visual graphics optimized for IMAX screens.',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1547483238-2cbf88be2443?auto=format&fit=crop&w=400&q=80',
      tags: ['4K Ultra HD', 'Dolby Atmos', 'Premium IMAX'],
      isLiveWatch: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    },
    {
      id: 'avatar-reborn',
      title: 'AVATAR: THE RECORDRUN NEXUS',
      category: 'Cinemas',
      year: '2025',
      score: '9.5',
      duration: '3h 12m',
      hostName: 'PrimeWatchers',
      hostPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150',
      viewerCount: 9450,
      description: 'Step into the luminous ecosystem of an extraterrestrial jungle where marine clans fight cybernetic legions to keep the ancient world core alive. The ultimate colorful visual odyssey.',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=400&q=80',
      tags: ['Live Room', 'Dolby 5.1', 'HDR10+'],
      isLiveWatch: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    },
    {
      id: 'cyberpunk-night',
      title: 'CYBERPUNK: NIGHTFALL IN METROPOLIS',
      category: 'Action',
      year: '2026',
      score: '9.4',
      duration: '1h 58m',
      hostName: 'NeonHost',
      hostPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
      viewerCount: 6510,
      description: 'A cybernetically enhanced mercenary attempts to infiltrate a towering corporate vault containing a revolutionary biological chip that grants infinite digital consciousness.',
      backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      tags: ['4K HD', 'HDR Atmos', 'Action Prime'],
      isLiveWatch: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'anime-nexus',
      title: 'ANIME REVELATIONS: THE SHINIGAMI APEX',
      category: 'Anime',
      year: '2026',
      score: '9.7',
      duration: '2h 05m',
      hostName: 'OtakuLounge',
      hostPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
      viewerCount: 11200,
      description: 'When the bounds of reality break, a high-school demon-slayer unites with an ancient soul harvester to prevent a multiversal catastrophic collision.',
      backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
      tags: ['Super Anime', 'Subbed/Dubbed', 'Stereo High'],
      isLiveWatch: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
      id: 'interstellar-voyage',
      title: 'INTERSTELLAR: INFINITE HORIZON',
      category: 'Sci-Fi',
      year: '2024',
      score: '9.9',
      duration: '2h 52m',
      description: 'A desperate expedition of star pilots plunges into a gigantic gravitational wormhole to seek a hospitable environment before humanity on earth perishes.',
      backdropUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
      tags: ['Ultra UHD', 'Sci-Fi Classic', 'HDR Atmos'],
      isLiveWatch: false,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    },
    {
      id: 'chronicles-of-nebula',
      title: 'THE CHRONICLES OF NEBULA: QUANTUM',
      category: 'Sci-Fi',
      year: '2025',
      score: '8.9',
      duration: '1h 44m',
      description: 'A breathtaking scientific deep-dive into black holes, wormholes, dark matter, and cosmic strings mapping out the cosmic blueprints of our observable universe.',
      backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=400&q=80',
      tags: ['UHD Cinema', 'Education', 'Stereo'],
      isLiveWatch: false,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    }
  ];

  // Auto simulate video playback movement when selected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !buffering) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 9200) return 120; // reset
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, buffering]);

  // Handle joining/initiating cinema view
  const triggerWatchCinema = (movie: Movie) => {
    setSelectedMovie(movie);
    setBuffering(true);
    setIsPlaying(false);
    showToast(`Joining cinematic watchroom for "${movie.title}"...`, 'info');
    
    // Auto terminate buffering after 1.5s
    setTimeout(() => {
      setBuffering(false);
      setIsPlaying(true);
      showToast(`Premium stream rendered! 🍿 Current mode: ${resolution} & ${audioMode}`, 'success');
    }, 1500);
  };

  // Convert seconds to format hh:mm:ss
  const formatSec = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Send comment in co-watch
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';
    const newMsg = {
      id: Date.now().toString(),
      user: profile?.displayName || 'You',
      text: chatInput,
      badgeColor: isStaff ? 'bg-indigo-600 font-extrabold border border-indigo-400' : 'bg-cyan-500'
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulated response after user writes something
    setTimeout(() => {
      const answers = [
        "Yes, absolutely fantastic!",
        "OMG did anyone else spot that detail? 😮",
        "The sound engineering in Dolby is next level!",
        "Thanks host for launching this live theater!"
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        user: ['StarSeeder', 'CineLover', 'RetroMovie'][Math.floor(Math.random() * 3)],
        text: randomAnswer
      }]);
    }, 2000);
  };

  // Simulated digital gifting matching Bingo Live flow
  const handleSendGift = (giftType: 'popcorn' | 'soda' | 'ticket' | 'star') => {
    let giftName = '';
    let emoji = '';
    let giftCost = 0;

    switch (giftType) {
      case 'popcorn':
        giftName = 'Crunchy Popcorn';
        emoji = '🍿';
        giftCost = 10;
        break;
      case 'soda':
        giftName = 'Chilled Cola';
        emoji = '🥤';
        giftCost = 15;
        break;
      case 'ticket':
        giftName = 'VIP Cinema Ticket';
        emoji = '🎟️';
        giftCost = 99;
        break;
      case 'star':
        giftName = 'Supernova Film Reel';
        emoji = '💫';
        giftCost = 299;
        break;
    }

    showToast(`Sent ${emoji} ${giftName} to the livestream! (-${giftCost} Gold Coins)`, 'success');

    // Create a floating particle bubble representation
    const newGift = {
      id: Date.now().toString(),
      label: emoji,
      x: 35 + Math.random() * 40, // percentage from left
      y: 90 // start near bottom
    };

    setFloatingGifts(prev => [...prev, newGift]);

    // Insert alert message into the chat room
    setChatMessages(prev => [...prev, {
      id: Date.now().toString() + '-gift',
      user: profile?.displayName || 'You',
      text: `sent ${emoji} ${giftName.toUpperCase()}`,
      badgeColor: 'bg-gradient-to-r from-[#ff407f] to-rose-500 font-extrabold text-[8px]'
    }]);

    // Cleanup floating particle after animation lifecycle (1.8s)
    setTimeout(() => {
      setFloatingGifts(prev => prev.filter(g => g.id !== newGift.id));
    }, 1800);
  };

  // Join Voice Mic Slots
  const toggleMicSeat = (slotIndex: number) => {
    setMicSeats(prev => prev.map(seat => {
      if (seat.slotIndex === slotIndex) {
        if (seat.user) {
          showToast("Left the voice mic slot.", "info");
          return { ...seat, user: null, photo: null, talking: false };
        } else {
          showToast("Joined live cinema audio co-hosting line! 🎙️ Speak now.", "success");
          return { 
            ...seat, 
            user: profile?.displayName || 'You', 
            photo: profile?.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60',
            talking: true 
          };
        }
      }
      return seat;
    }));
  };

  // Filtered lists
  const filteredMovies = mockMovies.filter(movie => {
    if (movieCategory === 'All') return true;
    return movie.category === movieCategory;
  });

  return (
    <div className={`min-h-screen text-sans select-none relative ${
      dimLights ? 'bg-neutral-950 text-white' : (isLight ? 'bg-stone-50 text-stone-900' : 'bg-[#0b0a0e] text-zinc-100')
    }`}>
      
      {/* Dynamic ambient lights glow background */}
      {selectedMovie && isPlaying && !dimLights && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[85%] h-80 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none transition-all duration-1000 animate-pulse" />
      )}

      {/* HEADER BAR */}
      <header className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${
        isLight ? 'bg-white/90 border-stone-200' : 'bg-[#0d0d11]/90 border-zinc-800/40'
      }`}>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate('/')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
              isLight ? 'bg-stone-100 text-stone-900' : 'bg-zinc-900 text-zinc-300'
            }`}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Film size={13} className="text-cyan-400 stroke-[3]" />
              <span className="text-[10px] uppercase font-black tracking-[0.25em] text-cyan-400">BINGO live cinemas</span>
            </div>
            <h1 className="text-sm font-[950] uppercase tracking-tight leading-tighter">Premium Cinema Hall</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20">
            <Activity size={10} className="text-cyan-400 animate-pulse" />
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider">Dolby Atmos UHD</span>
          </div>
          <button 
            onClick={() => {
              setDimLights(!dimLights);
              showToast(dimLights ? "Ambient lights on" : "Theater lights dimmed 🍿", "info");
            }}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs transition ${
              dimLights 
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400" 
                : (isLight ? "bg-stone-100 border-stone-200 text-stone-600" : "bg-neutral-800/80 border-neutral-700 text-zinc-300")
            }`}
          >
            {dimLights ? "💡 Lights On" : "🍿 Dim Mode"}
          </button>
        </div>
      </header>

      {/* NO DATA STATE CRITICAL ERROR WARNING */}
      {selectedMovie && buffering && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-xs space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-t-cyan-400 border-r-transparent border-l-cyan-400 border-b-transparent animate-spin duration-1000" />
              <Film size={20} className="text-cyan-400 absolute animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-cyan-400 block animate-pulse">Syncing Dolby Stream...</span>
              <p className="text-[11px] font-black uppercase text-white tracking-widest leading-none">Connecting High-End Node</p>
              <p className="text-[9px] text-zinc-500 font-mono">Channel: @{selectedMovie.hostName || "BingoMux"} • 4K HDR</p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE MOVIE STREAMING THEATER SCREEN */}
      {selectedMovie && !buffering && (
        <div className="w-full bg-black text-white relative flex flex-col lg:grid lg:grid-cols-3 border-b border-zinc-800">
          
          {/* Main Visual Display Screen */}
          <div className="lg:col-span-2 relative aspect-video w-full bg-[#030305] overflow-hidden flex flex-col justify-between group select-none">
            {/* Realtime Floating Gifts Particle Canvas Overlay */}
            <div className="absolute inset-x-0 bottom-24 top-0 z-20 pointer-events-none overflow-hidden">
              <AnimatePresence>
                {floatingGifts.map(gift => (
                  <motion.div
                    key={gift.id}
                    initial={{ opacity: 0, y: 150, scale: 0.5, x: `${gift.x}%` }}
                    animate={{ opacity: 1, y: -180, scale: 1.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.6, ease: 'easeOut' }}
                    className="absolute text-3xl font-black drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]"
                  >
                    {gift.label}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Real high-fidelity video player tag */}
            {isPlaying ? (
              <video 
                src={selectedMovie.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                autoPlay
                playsInline
                controls={false}
                muted={isMuted}
                className="absolute inset-0 w-full h-full object-contain bg-black z-0 transition-opacity duration-1000"
                style={{ opacity: 0.85 }}
                onTimeUpdate={(e) => {
                  setCurrentTime(Math.floor((e.target as HTMLVideoElement).currentTime));
                }}
              />
            ) : (
              <img 
                src={selectedMovie.backdropUrl} 
                alt={selectedMovie.title}
                className="absolute inset-0 w-full h-full object-cover opacity-45 blur-xs transition-opacity duration-1000"
              />
            )}
            {/* Cinematic filter gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%) pointer-events-none" />

            {/* Screen static and projector effect */}
            {isPlaying && (
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
            )}

            {/* TOP CONTROLS ROW */}
            <div className="p-4 flex items-center justify-between z-10 shrink-0 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400">IMAX CINEMA LIVE</span>
                <span className="text-[9px] text-zinc-400 font-mono">• {selectedMovie.year} • {selectedMovie.duration}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <Users size={10} className="text-cyan-400" />
                <span className="text-[9.5px] font-black font-mono">
                  {((selectedMovie.viewerCount || 4200) + chatMessages.length * 12).toLocaleString()} Watching
                </span>
              </div>
            </div>

            {/* CENTER PLAY OVERLAY OR BUFFER EFFECT */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {!isPlaying ? (
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-2xl transition hover:scale-110 active:scale-95 duration-300 cursor-pointer"
                >
                  <Play size={24} fill="currentColor" className="translate-x-0.5" />
                </button>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => setIsPlaying(false)}
                    className="w-14 h-14 rounded-full bg-black/70 border border-white/20 hover:bg-black/90 text-white flex items-center justify-center shadow-lg transition hover:scale-[1.05]"
                  >
                    <span className="text-xs font-black uppercase">PAUSE</span>
                  </button>
                </div>
              )}
            </div>

            {/* LIVE SUBTITLE REPRESENTATION */}
            {isPlaying && showSubtitles && (
              <div className="absolute bottom-20 inset-x-4 text-center z-10 pointer-events-none">
                <span className="px-4 py-1.5 rounded-lg bg-black/85 text-[11px] font-bold text-yellow-300 tracking-wide border border-zinc-800 shadow-xl inline-block max-w-sm">
                  {currentTime < 200 && '"We must launch the stellar probe before the solar wind core flares!"'}
                  {currentTime >= 200 && currentTime < 500 && '"Affirmative. Engaging quantum trajectory vectors now..."'}
                  {currentTime >= 500 && '"The space spice reserves will sustain our system for three centuries."'}
                </span>
              </div>
            )}

            {/* BOTTOM PLAYBACK CONTROLS BAR WITH PROGRESS TIMELINE */}
            <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-10 shrink-0 space-y-3">
              {/* Progress Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-zinc-400">{formatSec(currentTime)}</span>
                <div 
                  className="flex-1 h-1 bg-zinc-800 rounded-full cursor-pointer relative overflow-hidden group/track"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    setCurrentTime(Math.floor(percent * 9200));
                  }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                    style={{ width: `${(currentTime / 9200) * 100}%` }}
                  />
                  <div 
                    className="absolute h-3 w-3 rounded-full bg-white border-2 border-cyan-400 -top-1 opacity-0 group-hover/track:opacity-100 transition-opacity"
                    style={{ left: `calc(${(currentTime / 9200) * 100}% - 6px)` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">{formatSec(9200)}</span>
              </div>

              {/* Setting Buttons row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      showToast(isPlaying ? 'Playback paused' : 'Playback resumed', 'info');
                    }}
                    className="text-white hover:text-cyan-400 transition"
                  >
                    <span className="text-xs font-black tracking-widest uppercase">{isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}</span>
                  </button>

                  {/* Volume Slider control */}
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <button 
                      onClick={() => {
                        setIsMuted(!isMuted);
                        showToast(isMuted ? "Volume restored" : "Cinema stream muted", "info");
                      }}
                      className="text-zinc-400 hover:text-white transition"
                    >
                      <Volume2 size={13} className={isMuted ? "text-red-500" : ""} />
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        if(isMuted) setIsMuted(false);
                      }}
                      className="w-12 h-1 accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer outlook-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 relative">
                  {/* Resolution badge */}
                  <button
                    onClick={() => {
                      const nextRes = resolution === '4K Ultra HD' ? '1080p FHD' : resolution === '1080p FHD' ? '720p HD' : '4K Ultra HD';
                      setResolution(nextRes);
                      showToast(`Resolution optimized: ${nextRes}`, 'success');
                    }}
                    className="text-[9px] font-black border border-white/20 px-2.5 py-1 rounded-md uppercase tracking-wide hover:border-cyan-400 transition"
                  >
                    🖥️ {resolution}
                  </button>

                  {/* Atmos indicator */}
                  <button
                    onClick={() => {
                      const nextAudio = audioMode === 'Atmos 5.1' ? 'IMAX Enhanced' : 'Atmos 5.1';
                      setAudioMode(nextAudio);
                      showToast(`Cinematic audio configured: ${nextAudio}`, 'success');
                    }}
                    className="text-[9px] font-black border border-white/20 px-2.5 py-1 rounded-md uppercase tracking-wide hover:border-cyan-400 transition"
                  >
                    🔊 {audioMode}
                  </button>

                  <button 
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`p-1 hover:text-cyan-400 transition ${showSubtitles ? "text-cyan-400" : "text-zinc-400"}`}
                    title="Toggle Subtitles"
                  >
                    <Subtitles size={14} />
                  </button>

                  <button 
                    onClick={() => {
                      setSelectedMovie(null);
                      setIsPlaying(false);
                    }}
                    className="text-[9px] font-black bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full uppercase tracking-widest block transition shadow"
                  >
                    Leave Cinema
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL LIVE CHAT & GIFTS ROW DOCK (COL-1) */}
          <div className="border-t lg:border-t-0 lg:border-l border-zinc-800 bg-[#0d0d12]/95 p-4 flex flex-col h-[420px] lg:h-auto justify-between max-h-[500px] lg:max-h-none">
            
            {/* Header / Host representation */}
            <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full border border-cyan-400 overflow-hidden shrink-0">
                  <img src={selectedMovie.hostPhoto || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-white">{selectedMovie.hostName || "GalaxyStudio"}</span>
                    <span className="bg-[#ff407f]/20 text-[#ff407f] text-[7px] font-black uppercase px-1 rounded border border-[#ff407f]/30">Host</span>
                  </div>
                  <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Broadcasting live in UHD</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    showToast("Livestream link copied to clipboard! Share with friends 🔗", "success");
                  }}
                  className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition"
                  title="Share Watchroom"
                >
                  <Share2 size={12} />
                </button>
              </div>
            </div>

            {/* LIVE AUDIO CO-HOSTING MIC SLOTS */}
            <div className="py-2.5 border-b border-zinc-800/80">
              <span className="text-[8.5px] font-black uppercase text-zinc-500 tracking-wider block mb-1.5">
                Co-Watch Audio Mics (Speak in Stream)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {micSeats.map((seat) => (
                  <div 
                    key={seat.slotIndex}
                    onClick={() => toggleMicSeat(seat.slotIndex)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition relative group ${
                      seat.user 
                        ? (seat.talking ? 'bg-indigo-500/10 border-indigo-400' : 'bg-zinc-900 border-zinc-800') 
                        : 'bg-zinc-950/40 border-dashed border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {seat.user ? (
                      <>
                        <div className="relative w-7 h-7 rounded-full overflow-hidden border border-zinc-700">
                          <img src={seat.photo!} alt="mic user" className="w-full h-full object-cover" />
                          {seat.talking && (
                            <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
                          )}
                        </div>
                        <span className="text-[8px] font-black tracking-tight truncate max-w-full text-zinc-300 mt-1">
                          @{seat.user}
                        </span>
                        {/* Audio waveform simulated dots */}
                        {seat.talking && (
                          <div className="flex gap-0.5 mt-0.5">
                            <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-bounce duration-500" />
                            <span className="w-0.5 h-2 bg-indigo-400 rounded-full animate-bounce duration-[300ms]" />
                            <span className="w-0.5 h-1 bg-indigo-400 rounded-full animate-bounce duration-[700ms]" />
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-zinc-900/50 flex items-center justify-center text-zinc-500 group-hover:text-cyan-400 transition">
                          <Mic size={11} />
                        </div>
                        <span className="text-[7.5px] font-black uppercase text-zinc-600 mt-1">Mute</span>
                      </>
                    )}
                    <span className="absolute -top-1 -right-1 bg-black text-zinc-500 border border-zinc-800 text-[6px] px-1 rounded-full font-bold">
                      #{seat.slotIndex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHAT MESSAGES BODY LIST */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 max-h-[220px] lg:max-h-none scrollbar-hide text-left">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-[11px] leading-tight break-all space-y-0.5">
                  <div className="inline-flex items-center gap-1.5">
                    {msg.badgeColor ? (
                      <span className={`px-1 py-0.5 rounded text-[7px] text-white uppercase tracking-tight scale-90 ${msg.badgeColor}`}>
                        {msg.badgeColor.includes('gradient') ? '🎁 GIFTED' : 'STAFF'}
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-400 text-[8px] px-1 py-0.5 rounded">LV.15</span>
                    )}
                    <span className="font-bold text-cyan-400 hover:underline cursor-pointer">
                      {msg.user}
                    </span>
                    <span className="text-zinc-500 font-mono">:</span>
                  </div>
                  <p className={`pl-1 ${msg.badgeColor?.includes('gradient') ? 'text-amber-400 font-black italic' : 'text-zinc-300'}`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* CHAT INPUT FIELD & GIFT SHOP FOOTER */}
            <div className="pt-3 border-t border-zinc-800 shrink-0 space-y-3">
              
              {/* GIFTING FAST DOCK PANEL */}
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500">Send Interactive Props:</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSendGift('popcorn')}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition hover:scale-105 active:scale-95"
                    title="🍿 Popcorn (10 coins)"
                  >
                    <span>🍿</span>
                    <span className="text-[8px] text-zinc-400">10</span>
                  </button>
                  <button 
                    onClick={() => handleSendGift('soda')}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition hover:scale-105 active:scale-95"
                    title="🥤 Soda (15 coins)"
                  >
                    <span>🥤</span>
                    <span className="text-[8px] text-zinc-400">15</span>
                  </button>
                  <button 
                    onClick={() => handleSendGift('ticket')}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition hover:scale-105 active:scale-95"
                    title="🎟️ Ticket (99 coins)"
                  >
                    <span>🎟️</span>
                    <span className="text-[8px] text-zinc-400">99</span>
                  </button>
                  <button 
                    onClick={() => handleSendGift('star')}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition hover:scale-105 active:scale-95"
                    title="💫 Reel (299 coins)"
                  >
                    <span>💫</span>
                    <span className="text-[8px] text-zinc-400">299</span>
                  </button>
                </div>
              </div>

              {/* TEXT FIELD AND DISPATCH BUTTON */}
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask for tracks, chat with cinema viewers..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-400 focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 font-semibold"
                />
                <button
                  onClick={handleSendChat}
                  className="w-10 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center transition shrink-0 hover:scale-105 cursor-pointer"
                >
                  <Send size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPOTLIGHT HERO CONTAINER CINEMA CANVAS BANNER */}
      {!selectedMovie && (
        <div className="px-4 py-4">
          <div className="relative aspect-[21/10] sm:aspect-[21/9] rounded-[2rem] overflow-hidden bg-[#0d0d12] shadow-2xl border border-zinc-800/40 select-none">
            {/* Spotlight backdrop wrapper */}
            <div className="absolute inset-y-0 right-0 w-2/3 md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-full object-cover opacity-75 object-right transform scale-100" 
                alt="Cinema Spotlight Background"
              />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0d0d12] to-transparent" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

            {/* Core Spotlight Content Overlay */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end text-left max-w-md md:max-w-lg space-y-1 md:space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#ff407f] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full select-none shadow">
                  🔥 HIGHEST DEMAND
                </span>
                <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">IMAX 4K STREAMING</span>
              </div>
              
              <h2 className="text-sm md:text-xl font-[1000] uppercase tracking-tighter text-white leading-none">
                DUAL NEBULA: CHRONICLES OF SPICE
              </h2>
              
              <p className="text-[9px] md:text-[11px] text-zinc-400 font-semibold line-clamp-2 md:line-clamp-3 leading-relaxed">
                Humanity faces an explosive galactic struggle on a radiant desert celestial sphere as mystical space spice resources trigger interstellar dominance. Optimized with 3D Atmos Surround sound mapping.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => triggerWatchCinema(mockMovies[0])}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-black text-[10px] tracking-widest uppercase rounded-full shadow-lg hover:scale-105 transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Play size={10} fill="currentColor" /> Play Live 4K
                </button>
                <button
                  onClick={() => {
                    showToast("Added 'Dual Nebula' to your cloud library watch list!", "success");
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] tracking-widest uppercase rounded-full backdrop-blur-md transition shrink-0"
                >
                  <Plus size={10} /> Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL STREAM ROW NAVIGATION CATEGORY BADGES */}
      <div className="px-4 py-1 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0 select-none">
        {(['All', 'Cinemas', 'Sci-Fi', 'Anime', 'Action'] as const).map(cat => (
          <button 
            key={cat}
            onClick={() => setMovieCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-[9px] font-black transition-all whitespace-nowrap uppercase tracking-widest border ${
              movieCategory === cat 
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-sm" 
                : (isLight ? "bg-white border-stone-200 text-stone-600 hover:text-black" : "bg-neutral-900 border-zinc-800/80 text-zinc-400 hover:text-white")
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* STREAM GRID ROWS: BROADCAST CINEMA STREAMS LISTS */}
      <main className="px-4 py-4 space-y-6 max-w-7xl mx-auto select-none">
        
        {/* 1. Live Community Cinema watchrooms header */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-red-500/15 border border-red-500/20 rounded-lg animate-pulse">
                <Flame size={12} className="text-red-500" />
              </div>
              <h3 className={`text-xs font-black uppercase tracking-widest italic ${isLight ? "text-stone-500" : "text-zinc-400"}`}>
                Live Cinema Channels (Bingo Watchrooms)
              </h3>
            </div>
            <span className="text-[9px] font-black text-zinc-500 uppercase font-mono tracking-wider">
              {filteredMovies.filter(m => m.isLiveWatch).length} active streams
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredMovies.filter(m => m.isLiveWatch).map(movie => (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => triggerWatchCinema(movie)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border flex flex-col h-48 transition-all shadow-md relative ${
                  isLight ? 'bg-white border-stone-200 shadow-stone-200' : 'bg-[#121216]/90 border-zinc-800/40'
                }`}
              >
                {/* Poster graphic frame */}
                <div className="relative aspect-video w-full overflow-hidden shrink-0">
                  <img 
                    src={movie.backdropUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Visual ambient screen shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Hot tag label */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[7px] font-black text-white uppercase tracking-wider shadow">
                    <span className="relative flex h-1 w-1 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                    </span>
                    Live
                  </div>

                  {/* Top-right audience viewer size */}
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/55 px-1.5 py-0.5 rounded-full text-white text-[7.5px] font-mono border border-white/10 backdrop-blur-xs select-none">
                    <Users size={7} />
                    <span>{movie.viewerCount && movie.viewerCount > 1000 ? `${(movie.viewerCount / 1000).toFixed(1)}k` : movie.viewerCount}</span>
                  </div>
                </div>

                {/* Content text metadata details frame */}
                <div className="p-2.5 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between min-w-0">
                      <p className="text-[#00e1cf] text-[8px] font-black tracking-wide uppercase truncate">
                        @{movie.hostName || "Streamer"}
                      </p>
                      <span className="text-[7.5px] font-black uppercase text-zinc-500 font-mono">
                        ★ {movie.score}
                      </span>
                    </div>
                    <h4 className={`text-[10.5px] font-black uppercase leading-[1.2] line-clamp-2 ${
                      isLight ? 'text-stone-900' : 'text-zinc-200'
                    }`}>
                      {movie.title}
                    </h4>
                  </div>

                  {/* Footer overlay tag highlights */}
                  <div className="flex items-center gap-1 overflow-hidden pointer-events-none select-none">
                    {movie.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[6.5px] font-black uppercase bg-zinc-800/10 px-1 text-zinc-500 border border-zinc-800/20 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2. Classic High-fidelity Hollywood Cinema Blockbusters (On Demand catalog) */}
        <section className="space-y-3">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-cyan-500/15 border border-cyan-500/20 rounded-lg">
              <Film size={12} className="text-cyan-400" />
            </div>
            <h3 className={`text-xs font-black uppercase tracking-widest italic ${isLight ? "text-stone-500" : "text-zinc-400"}`}>
              Cinema Classical Catalog (On-Demand UHD Player)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredMovies.filter(m => !m.isLiveWatch).map(movie => (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => triggerWatchCinema(movie)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border flex flex-col h-48 transition-all shadow-md relative ${
                  isLight ? 'bg-white border-stone-200 shadow-stone-200' : 'bg-[#121216]/90 border-zinc-800/40'
                }`}
              >
                {/* Poster graphic frame */}
                <div className="relative aspect-video w-full overflow-hidden shrink-0">
                  <img 
                    src={movie.backdropUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Visual ambient screen shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* UHD badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded text-[7px] font-black text-cyan-400 border border-cyan-400/20 uppercase tracking-widest leading-none">
                    4K UHD
                  </div>
                </div>

                {/* Content details frame */}
                <div className="p-2.5 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between min-w-0">
                      <p className="text-zinc-500 text-[8px] font-black tracking-wide uppercase font-mono">
                        {movie.year} • {movie.duration}
                      </p>
                      <span className="text-[7.5px] font-black uppercase text-[#ffc107] font-mono">
                        ★ {movie.score}
                      </span>
                    </div>
                    <h4 className={`text-[10.5px] font-black uppercase leading-[1.2] line-clamp-2 ${
                      isLight ? 'text-stone-900' : 'text-zinc-200'
                    }`}>
                      {movie.title}
                    </h4>
                  </div>

                  {/* Footer tags */}
                  <div className="flex items-center gap-1 overflow-hidden pointer-events-none select-none">
                    {movie.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[6.5px] font-black uppercase bg-zinc-800/10 px-1 text-zinc-400 border border-zinc-400/10 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER SAFE SPACE NOTICE */}
      <footer className="py-12 text-center text-[10px] text-zinc-500 select-none pb-24">
        <p className="font-extrabold uppercase tracking-widest text-[8px] text-zinc-600 mb-1">Bingo Live Movie Streaming Network</p>
        <p className="leading-snug max-w-xs mx-auto">All media nodes utilize encrypted dynamic proxy decoders. Subtitles and multi-mics sync in real-time under ultra-low latency protocols.</p>
      </footer>
    </div>
  );
}
