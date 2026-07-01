import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, HelpCircle, Trophy, Shield, Star, Sparkles, TrendingUp, X, 
  ChevronDown, ChevronUp, MoreVertical, BarChart3, Clock, Flame, MessageSquare, Check, Send, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface FamilyDetailsPopupProps {
  family: {
    id: string;
    name: string;
    avatar?: string;
    combatPoints?: number;
    description?: string;
    memberCount?: number;
    memberLimit?: number;
    monthlyPoints?: number;
    monthlyTarget?: number;
    tier?: string;
    ownerUid?: string;
    region?: string;
  };
  onClose: () => void;
  onUpdateAvatar?: (familyId: string, newAvatar: string) => void;
}

interface MemberRankItem {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  flagAndIcons: string; // E.g. "🇩🇲🦜" or "🦜"
  customBadges?: string; // E.g. "💞"
  // Dynamic metrics depending on filter
  stats: {
    'combat points': number;
    'Receive gifts': number;
    'Send gifts': number;
    'Task': number;
    'Top up': number;
  };
}

// Custom data generation for each family to match screenshot perfectly!
const getFamilySpecificData = (name: string) => {
  const isJoyAndLove = name.toLowerCase().includes('joy');
  const isVibez = name.toLowerCase().includes('vibez');
  
  const slogan = isJoyAndLove 
    ? "Host Supporting Host and Having Fun Doing it!"
    : isVibez 
      ? "Sunshine, high energies, and positive vibes. Together we conquer!"
      : "LIBRA FEDERAL AGENCY AND FAMILY. UNITY IS OUR COGNITIVE STRENGTH.";

  // General metrics
  const totalStats = isJoyAndLove ? {
    receiveGifts: 11830612,
    sendGifts: 4719821,
    task: 58695805,
    topUp: 1343159,
    beansToDiamonds: 10222586
  } : {
    receiveGifts: 24719582,
    sendGifts: 8503810,
    task: 92837492,
    topUp: 3847291,
    beansToDiamonds: 15482930
  };

  // Monthly Target and metrics
  const monthTarget = 2000000;
  const monthCurrent = isJoyAndLove ? 275327 : 1482930;
  
  const monthlyStats = isJoyAndLove ? {
    receiveGifts: 26547,
    sendGifts: 14529,
    task: 234281,
    topUp: 5928,
    beansToDiamonds: 10013
  } : {
    receiveGifts: 142903,
    sendGifts: 83741,
    task: 539281,
    topUp: 29381,
    beansToDiamonds: 48920
  };

  // Members list cloned EXACTLY from images for Joy and Love!
  const members: MemberRankItem[] = isJoyAndLove 
    ? [
        {
          rank: 1,
          name: "DaGeneral",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150",
          level: 10,
          flagAndIcons: "🇩🇲🦜",
          customBadges: "👑",
          stats: {
            'combat points': 1006579,
            'Receive gifts': 452910,
            'Send gifts': 123910,
            'Task': 823485,
            'Top up': 34821
          }
        },
        {
          rank: 2,
          name: "Amazon",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
          level: 9,
          flagAndIcons: "🦜",
          customBadges: "💖",
          stats: {
            'combat points': 803442,
            'Receive gifts': 391028,
            'Send gifts': 98201,
            'Task': 612847,
            'Top up': 21094
          }
        },
        {
          rank: 3,
          name: "LouLou J&L",
          avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150",
          level: 9,
          flagAndIcons: "🦜",
          customBadges: "💞",
          stats: {
            'combat points': 77169,
            'Receive gifts': 32901,
            'Send gifts': 8472,
            'Task': 53891,
            'Top up': 5920
          }
        },
        {
          rank: 4,
          name: "LINKY LICK'S",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
          level: 9,
          flagAndIcons: "🦜",
          customBadges: "💞",
          stats: {
            'combat points': 64495,
            'Receive gifts': 28491,
            'Send gifts': 6105,
            'Task': 48329,
            'Top up': 4210
          }
        },
        {
          rank: 5,
          name: "FANCYLINKY",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
          level: 9,
          flagAndIcons: "🦜",
          customBadges: "💞",
          stats: {
            'combat points': 63220,
            'Receive gifts': 25893,
            'Send gifts': 5901,
            'Task': 41284,
            'Top up': 3105
          }
        },
        {
          rank: 6,
          name: "Big Bella",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150",
          level: 5,
          flagAndIcons: "🦜",
          customBadges: "💞",
          stats: {
            'combat points': 47188,
            'Receive gifts': 19803,
            'Send gifts': 3910,
            'Task': 32904,
            'Top up': 1928
          }
        }
      ]
    : [
        {
          rank: 1,
          name: "KingVibez",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
          level: 10,
          flagAndIcons: "🇺🇸🔥",
          customBadges: "👑",
          stats: {
            'combat points': 2503910,
            'Receive gifts': 928470,
            'Send gifts': 458390,
            'Task': 1849301,
            'Top up': 89201
          }
        },
        {
          rank: 2,
          name: "GoldenSoul",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
          level: 9,
          flagAndIcons: "🇬🇧☀️",
          customBadges: "💖",
          stats: {
            'combat points': 1847194,
            'Receive gifts': 738201,
            'Send gifts': 318490,
            'Task': 1301938,
            'Top up': 63891
          }
        },
        {
          rank: 3,
          name: "AlphaQueen",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150",
          level: 9,
          flagAndIcons: "🦜",
          customBadges: "💞",
          stats: {
            'combat points': 1582930,
            'Receive gifts': 619283,
            'Send gifts': 289431,
            'Task': 1009384,
            'Top up': 49028
          }
        },
        {
          rank: 4,
          name: "Mr_Legend",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150",
          level: 8,
          flagAndIcons: "🦜",
          customBadges: "💞",
          stats: {
            'combat points': 938402,
            'Receive gifts': 428391,
            'Send gifts': 103981,
            'Task': 748293,
            'Top up': 25890
          }
        }
      ];

  return { slogan, totalStats, monthTarget, monthCurrent, monthlyStats, members };
};

export const FamilyDetailsPopup: React.FC<FamilyDetailsPopupProps> = ({ family, onClose, onUpdateAvatar }) => {
  const { user } = useAuth();
  const familyData = getFamilySpecificData(family.name);
  
  // Determine if current user is the owner (or can test owner mode to upload avatar)
  const isOwner = user && (
    family.ownerUid === user.uid || 
    family.ownerUid === 'DEFAULT_USER_ID' ||
    family.id.includes('joy')
  );

  // Collapsible toggle states
  const [totalStatsExpanded, setTotalStatsExpanded] = useState(true);
  const [monthlyStatsExpanded, setMonthlyStatsExpanded] = useState(true);
  
  // Custom interactive dropdown filter for Member ranking
  const [activeMetric, setActiveMetric] = useState<'combat points' | 'Receive gifts' | 'Send gifts' | 'Task' | 'Top up'>('combat points');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Application interaction
  const [hasJoined, setHasJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chats, setChats] = useState<Array<{ sender: 'user' | 'leader', text: string, time: string }>>([
    { sender: 'leader', text: "Hello! Thank you for requesting to join our family stack. What is your active stream level?", time: "2:45 PM" }
  ]);

  // Handle Join request trigger
  const handleJoinTrigger = () => {
    if (hasJoined) return;
    setJoinLoading(true);
    setTimeout(() => {
      setJoinLoading(false);
      setHasJoined(true);
      
      // Floating alert toast implementation
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#ef8a29] text-stone-950 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl z-[9999] opacity-0 transition-all duration-350 transform translate-y-3 border border-yellow-200 flex items-center gap-2';
      toast.innerHTML = `<span class="bg-black/10 p-1 rounded-full"><svg xmlns="http://www.w3.org/2500/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-stone-950"><path d="M20 6 9 17l-5-5"/></svg></span> Joined successfully! Request pending leader approval.`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
      }, 10);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 15px)';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 400);
      }, 3500);

    }, 850);
  };

  // Send message implementation in chat drawer
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg = { sender: 'user' as const, text: chatMessage, time: "Just now" };
    setChats(prev => [...prev, newMsg]);
    setChatMessage("");
    
    // Leadership response simulator
    setTimeout(() => {
      setChats(prev => [...prev, {
        sender: 'leader',
        text: "Awesome! We value hosts like you. Feel free to join pre-scheduled live battles and family checks.",
        time: "Just now"
      }]);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 font-sans backdrop-blur-xs"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="w-full h-full md:max-w-[440px] md:h-[95vh] md:rounded-[36px] bg-[#111215] text-[#e2dfd9] flex flex-col overflow-hidden relative shadow-[0_15px_50px_rgba(0,0,0,0.8)] border border-white/5"
      >
        
        {/* UPPER CORNER GOLD DECORATIVE ELEMENTS (Screenshot Detail Match) */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#eebd41]/20 pointer-events-none rounded-tl-[36px] md:block hidden" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#eebd41]/20 pointer-events-none rounded-tr-[36px] md:block hidden" />

        {/* 1. Header Bar - matching screenshot exactly */}
        <header className="px-4 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#14151a] relative z-20">
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/5 rounded-full transition-colors text-slate-300 active:scale-90"
            id="popup-back-btn"
          >
            <ChevronLeft size={28} />
          </button>
          
          <div className="flex items-center gap-4 text-white/70">
            <button className="hover:text-white transition-colors p-1" title="Visual Statistics Charts">
              <BarChart3 size={21} className="text-[#ffd700]" />
            </button>
            <button className="hover:text-white transition-colors p-1" title="Family Help Info">
              <HelpCircle size={21} />
            </button>
            <button className="hover:text-white transition-colors p-1" title="More Options">
              <MoreVertical size={21} />
            </button>
          </div>
        </header>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          
          {/* Header Shield & Mascot Decor area frame block */}
          <div className="pt-6 pb-4 flex flex-col items-center text-center relative px-4" id="popup-emblem-area">
            
            {/* Elegant Background Arc lines */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#eebd41]/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Hexagon Outline Shield Graphic holding Emblem Initials */}
            <div className="relative w-[110px] h-[110px] flex items-center justify-center">
              
              {/* Outer Golden/Bronze Hexagon Frame */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#eebd41] fill-none drop-shadow-[0_4px_12px_rgba(238,189,65,0.35)]">
                <polygon 
                  points="50,3 93,25 93,75 50,97 7,75 7,25" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeLinejoin="round"
                />
                <polygon 
                  points="50,8 88,29 88,71 50,92 12,71 12,29" 
                  stroke="#1c2128" 
                  strokeWidth="3" 
                  strokeLinejoin="round" 
                  fill="#15171e"
                />
              </svg>

              {/* Inner Circle Frame Clipping Emblem Avatar or Initials */}
              <div 
                onClick={() => {
                  if (isOwner) {
                    document.getElementById('family-avatar-file-input')?.click();
                  }
                }}
                className={cn(
                  "w-[68px] h-[68px] rounded-full overflow-hidden border border-[#eebd41]/60 bg-gradient-to-tr from-[#1b1e26] to-[#0d0e11] flex items-center justify-center select-none shadow-inner relative group/avatar",
                  isOwner ? "cursor-pointer hover:border-white transition-colors" : ""
                )}
                title={isOwner ? "Upload Group Avatar" : undefined}
              >
                {family.avatar ? (
                  <img src={family.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-[20px] font-black text-[#eebd41] tracking-tighter">
                    {family.name.slice(0, 3).toUpperCase()}
                  </span>
                )}

                {/* Edit overlay for group owners as requested */}
                {isOwner && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eebd41" strokeWidth="2.5" className="animate-pulse">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[8px] font-extrabold text-[#eebd41] uppercase tracking-wider mt-1">Upload</span>
                  </div>
                )}
              </div>

              {/* Hidden file input for uploading avatars */}
              {isOwner && (
                <input 
                  type="file"
                  id="family-avatar-file-input"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (reader.result && onUpdateAvatar) {
                        onUpdateAvatar(family.id, reader.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              )}
            </div>

            {/* Family Name */}
            <h2 className="mt-4 text-white text-[19px] font-black tracking-tight drop-shadow-md">
              {family.name}
            </h2>

            {/* Slogan Motto - white caps with elegant tracking */}
            <p className="mt-1.5 text-xs font-bold leading-normal text-slate-400 max-w-xs uppercase tracking-wide px-4">
              {familyData.slogan}
            </p>
          </div>

          {/* 3. Challenger Rank Accordion & Combat Progress Bar */}
          <div className="px-4 py-2" id="popup-rank-bar">
            
            {/* Main Rank Row Frame */}
            <div className="bg-[#181a20] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-3">
              
              <div className="flex items-center justify-between">
                
                {/* Left Shield emblem + Text Row */}
                <div className="flex items-center gap-3">
                  {/* Large 3D Fire Shield Mascot graphic representation */}
                  <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#fd5e26] via-[#df451f] to-[#aa1c0c] flex items-center justify-center shadow-lg border border-red-500/35 relative overflow-hidden flex-shrink-0 animate-pulse">
                    <Flame size={24} fill="#ffd700" className="text-[#ffd700] drop-shadow-sm" />
                    <div className="absolute -bottom-1 inset-x-0 bg-black/40 text-[7px] font-black text-center text-white pb-0.5 tracking-tighter uppercase">STAGE 3</div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#ec6733] text-[15px] font-[900] italic tracking-wide uppercase">
                        {family.tier || "Challenger III"}
                      </span>
                      
                      {/* Interactive arrow to collapse/expand upper general stats block */}
                      <button 
                        onClick={() => setTotalStatsExpanded(!totalStatsExpanded)}
                        className="text-[#ec6733] hover:text-white transition-colors duration-250 p-0.5 cursor-pointer"
                        title="Toggle stats details"
                      >
                        {totalStatsExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                      </button>
                    </div>
                    <span className="text-[10px] font-black text-stone-500/85 uppercase tracking-wider">Combat Rank Multiplier</span>
                  </div>
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-[#f08c33] animate-ping" />
              </div>

              {/* Progress limit bar matching peach/orange gradient precisely */}
              <div className="relative w-full h-[18px] rounded-full bg-[#272832] border border-white/10 overflow-hidden flex items-center justify-center p-[1px]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#e15926] via-[#f08c33] to-[#e4bc39] absolute left-0 top-0 transition-all duration-700" 
                  style={{ width: '42%' }}
                />
                
                {/* Center text on the progress track */}
                <span className="text-[9.5px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-10 flex items-center gap-1">
                  <Flame size={10} fill="currentColor" />
                  {familyData.totalStats.receiveGifts.toLocaleString()}/18,000,0000
                </span>
              </div>
            </div>
          </div>

          {/* 4. Statistics Block 1 (Total/Overall Metrics) - Collapsible on demand */}
          <AnimatePresence initial={false}>
            {totalStatsExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4"
                id="total-metrics-accordion"
              >
                {/* 2-column beveled layout with vertical gray line dividers */}
                <div className="bg-[#14151a]/90 rounded-2xl border border-white/5 p-4 grid grid-cols-3 gap-y-4 gap-x-2 relative mt-1 shadow-inner">
                  
                  {/* Item 1 */}
                  <div className="flex flex-col pl-1">
                    <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Receive gifts</span>
                    <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                      <Flame size={10} fill="currentColor" />
                      <span className="text-[11.5px] leading-tight font-mono">{familyData.totalStats.receiveGifts}</span>
                    </div>
                  </div>

                  {/* Vertical rule line style borders */}
                  <div className="flex flex-col pl-3 border-l border-white/5">
                    <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Send gifts</span>
                    <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                      <Flame size={10} fill="currentColor" />
                      <span className="text-[11.5px] leading-tight font-mono">{familyData.totalStats.sendGifts}</span>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="flex flex-col pl-3 border-l border-white/5">
                    <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Task</span>
                    <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                      <Flame size={10} fill="currentColor" />
                      <span className="text-[11.5px] leading-tight font-mono">{familyData.totalStats.task}</span>
                    </div>
                  </div>

                  {/* Horizontal break on the grid */}
                  <div className="col-span-3 h-[1px] bg-white/5 my-0.5" />

                  {/* Item 4 */}
                  <div className="flex flex-col pl-1 col-span-1">
                    <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Top up</span>
                    <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                      <Flame size={10} fill="currentColor" />
                      <span className="text-[11.5px] leading-tight font-mono">{familyData.totalStats.topUp}</span>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex flex-col pl-3 border-l border-white/5 col-span-2">
                    <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Beans to diamonds</span>
                    <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                      <Flame size={10} fill="currentColor" />
                      <span className="text-[11.5px] leading-tight font-mono">{familyData.totalStats.beansToDiamonds}</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. Block 2: Monthly Target Points Section */}
          <div className="px-4 mt-4" id="monthly-targets-section">
            <div className="bg-[#181a20] border border-white/5 rounded-2xl p-4">
              
              {/* Header Title with clock & arrow */}
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/5">
                
                {/* Title and Help context */}
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="text-[11.5px] font-black text-stone-500 uppercase tracking-widest">Target Points this month</span>
                  <HelpCircle size={12} className="text-stone-500" />
                </div>

                {/* Arrow toggle + 27 Day Clock symbol */}
                <div className="flex items-center gap-2">
                  
                  {/* Monthly target score info */}
                  <div className="flex items-center gap-0.5 text-[12px] font-black tracking-tight">
                    <span className="text-[#ffd700] font-mono">{familyData.monthCurrent}</span>
                    <span className="text-stone-600">/</span>
                    <span className="text-stone-500 font-mono">{familyData.monthTarget}</span>
                  </div>

                  {/* Monthly expanded toggle arrow */}
                  <button 
                    onClick={() => setMonthlyStatsExpanded(!monthlyStatsExpanded)}
                    className="text-stone-400 hover:text-[#eebd41] transition-colors p-0.5"
                    title="Toggle monthly stats breakdown"
                  >
                    {monthlyStatsExpanded ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
                  </button>

                  <div className="flex items-center gap-1 bg-[#252631] text-[#e3b341] text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full">
                    <Clock size={10} />
                    <span>27 Day</span>
                  </div>
                </div>

              </div>

              {/* Collapse targets metrics */}
              <AnimatePresence initial={false}>
                {monthlyStatsExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-y-4 gap-x-2 shadow-inner bg-black/10 p-3 rounded-xl border border-white/5">
                      
                      {/* Metric Row 2: Receive */}
                      <div className="flex flex-col pl-1">
                        <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Receive gifts</span>
                        <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                          <Flame size={10} fill="currentColor" />
                          <span className="text-[11px] font-mono">{familyData.monthlyStats.receiveGifts}</span>
                        </div>
                      </div>

                      {/* Send */}
                      <div className="flex flex-col pl-3 border-l border-white/5">
                        <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Send gifts</span>
                        <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                          <Flame size={10} fill="currentColor" />
                          <span className="text-[11px] font-mono">{familyData.monthlyStats.sendGifts}</span>
                        </div>
                      </div>

                      {/* Task */}
                      <div className="flex flex-col pl-3 border-l border-white/5">
                        <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Task</span>
                        <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                          <Flame size={10} fill="currentColor" />
                          <span className="text-[11px] font-mono">{familyData.monthlyStats.task}</span>
                        </div>
                      </div>

                      {/* Divider inside targets breakdown */}
                      <div className="col-span-3 h-[1px] bg-white/5 my-0.5" />

                      {/* Top up */}
                      <div className="flex flex-col pl-1">
                        <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Top up</span>
                        <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                          <Flame size={10} fill="currentColor" />
                          <span className="text-[11px] font-mono">{familyData.monthlyStats.topUp}</span>
                        </div>
                      </div>

                      {/* Beans to diamonds */}
                      <div className="flex flex-col pl-3 border-l border-white/5 col-span-2">
                        <span className="text-[10px] font-black text-[#858994] uppercase tracking-wide leading-none mb-1">Beans to diamonds</span>
                        <div className="flex items-center gap-0.5 text-[#eebd41] font-black">
                          <Flame size={10} fill="currentColor" />
                          <span className="text-[11px] font-mono">{familyData.monthlyStats.beansToDiamonds}</span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* 6. Member Ranking Section */}
          <div className="px-4 mt-5 relative" id="member-ranking-section">
            
            {/* Header with combat points dropdown chooser */}
            <div className="flex items-center justify-between pb-2 mb-3 relative">
              <span className="text-white text-[14px] font-black uppercase tracking-wide">
                Member ranking
              </span>

              {/* Combo dropdown container */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-stone-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 bg-[#1d1f27] px-3 py-1.5 rounded-full border border-white/5 cursor-pointer active:scale-95 transition-all select-none"
                  id="metric-dropdown-trigger"
                >
                  <span>{activeMetric}</span>
                  <ChevronDown size={12} className={cn("transition-transform", dropdownOpen ? "rotate-180" : "")} />
                </button>

                {/* Drops menu overlay matching the high-fidelity screenshots precisamente! */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 3, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-full bg-[#181a1f] border border-[#eebd41]/35 rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.85)] z-50 w-36 overflow-hidden py-1"
                      id="metric-dropdown-menu"
                    >
                      {(['combat points', 'Receive gifts', 'Send gifts', 'Task', 'Top up'] as const).map((metric) => (
                        <button
                          key={metric}
                          onClick={() => {
                            setActiveMetric(metric);
                            setDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-4.5 py-2.5 text-left text-[11px] font-extrabold uppercase transition-colors tracking-wide block border-b border-white/3 last:border-b-0",
                            activeMetric === metric 
                              ? "text-stone-950 bg-[#e3b341]" 
                              : "text-slate-300 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {metric}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* List of members with accurate styling */}
            <div className="space-y-3" id="member-ranking-list">
              {familyData.members.map((member) => {
                const metricValue = member.stats[activeMetric];
                
                return (
                  <div 
                    key={member.rank}
                    className="bg-[#14151a] rounded-[18px] border border-white/5 p-2.5 flex items-center justify-between hover:border-amber-500/10 transition-all"
                  >
                    
                    {/* Left Rank & User image profile section */}
                    <div className="flex items-center gap-3">
                      
                      {/* Place numbers and medals badges */}
                      <div className="w-6 flex items-center justify-center relative">
                        {member.rank === 1 ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-b from-[#ffd700] to-[#b8860b] flex items-center justify-center text-stone-950 text-[10px] font-black shadow-md border border-white/30">
                            1
                          </div>
                        ) : member.rank === 2 ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-b from-slate-200 to-slate-400/90 flex items-center justify-center text-stone-950 text-[10px] font-black shadow-md">
                            2
                          </div>
                        ) : member.rank === 3 ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 flex items-center justify-center text-stone-950 text-[10px] font-black shadow-md">
                            3
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-500 font-mono">{member.rank}</span>
                        )}
                      </div>

                      {/* User circular photo avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-stone-900 shadow-inner">
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Nickname, level icons, parrot, heart level row */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] font-bold text-white tracking-tight flex items-center gap-0.5 leading-none">
                            {member.flagAndIcons && <span className="font-sans mr-0.5">{member.flagAndIcons}</span>}
                            <span>{member.name}</span>
                            {member.customBadges && <span className="text-[10px] ml-0.5">{member.customBadges}</span>}
                          </span>
                          
                          {/* Shield status level count badge */}
                          <div className="bg-red-600 text-[8.5px] font-black text-rose-100 flex items-center gap-0.5 px-1 py-0.2 rounded-sm leading-none border border-red-500/40">
                            <span>🛡️</span>
                            <span>{member.level}</span>
                          </div>
                        </div>

                        {/* Double colon tag specific points display metric values */}
                        <div className="flex items-center gap-0.75 mt-1">
                          <span className="text-[9.5px] font-bold text-stone-500 uppercase tracking-tight">
                            {activeMetric}::
                          </span>
                          <div className="flex items-center gap-0.5 text-stone-400 font-[900] text-[9.5px] font-mono leading-none">
                            <Flame size={9} fill="currentColor" className="text-amber-500" />
                            <span>{metricValue.toLocaleString()}</span>
                          </div>
                          <ChevronDown size={8} className="text-stone-600" />
                        </div>
                      </div>

                    </div>

                    <ChevronRight size={14} className="text-stone-700 mr-1" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 7. Sticky Bottom Action Controls (Capsule Buttons floating footer) */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#111215] via-[#111215]/95 to-transparent px-4 py-3.5 flex items-center gap-3.5 border-t border-white/5 z-40">
          
          {/* Button 1 (Contact family leader with outline border & message speech sign) */}
          <button 
            onClick={() => setChatting(true)}
            className="flex-1 py-3.5 bg-transparent border border-[#ef8a29] text-[#eebd41] hover:bg-[#ef8a29]/5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 outline-none cursor-pointer"
            id="chat-leader-btn"
          >
            <MessageSquare size={13} fill="currentColor" />
            <span>contact leader</span>
          </button>

          {/* Button 2 (Join Capsule action button) */}
          <button 
            onClick={handleJoinTrigger}
            disabled={hasJoined || joinLoading}
            className={cn(
              "flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-[#111215] flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer",
              hasJoined 
                ? "bg-slate-300 text-stone-700 cursor-not-allowed cursor-default border border-stone-400/40"
                : "bg-gradient-to-r from-[#ffd369] to-[#ef8a29] hover:brightness-105 active:scale-95"
            )}
            id="join-leader-btn"
          >
            {joinLoading ? (
              <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            ) : hasJoined ? (
              <>
                <Check size={14} strokeWidth={3.5} />
                <span>Applied</span>
              </>
            ) : (
              <>
                <span>+ Join</span>
              </>
            )}
          </button>
        </div>

        {/* 8. Leaders chat Sliding Overlay Drawer Component */}
        <AnimatePresence>
          {chatting && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="absolute inset-0 bg-[#0d0e12] z-50 flex flex-col"
              id="leader-chat-sliding"
            >
              {/* Chat Header */}
              <div className="bg-[#14151a] px-4 py-3.5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setChatting(false)}
                    className="p-1 hover:bg-white/5 rounded-full text-slate-300 active:scale-90"
                  >
                    <ChevronLeft size={26} />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Chat with Family Leader</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setChatting(false)}
                  className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end">
                {chats.map((c, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-semibold",
                      c.sender === 'user' 
                        ? "bg-[#ef8a29] text-stone-950 ml-auto rounded-tr-none" 
                        : "bg-[#1d1f26] text-slate-300 mr-auto rounded-tl-none border border-white/3"
                    )}
                  >
                    <p>{c.text}</p>
                    <div className={cn(
                      "text-[8.5px] mt-1 font-mono",
                      c.sender === 'user' ? "text-stone-900/60 text-right" : "text-slate-500"
                    )}>
                      {c.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat input box */}
              <div className="p-3 bg-[#14151a] border-t border-white/5 flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message to the leader..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 bg-[#1d1f26] text-xs font-semibold px-4 py-3 rounded-full text-white outline-none border border-white/5 focus:border-[#ef8a29]"
                />
                
                <button 
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-full bg-[#ef8a29] text-stone-950 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
};
