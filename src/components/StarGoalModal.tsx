import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Trophy } from 'lucide-react';
import { UserProfile } from '../types';

interface StarGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomBeans: number;
  onHelpHost?: () => void;
  hostProfile?: UserProfile | null;
}

// Reusable 3D Glossy Faceted Star Component
const ThreeDStar: React.FC<{
  color: 'yellow' | 'purple' | 'silver' | 'grey' | 'gold';
  number: string | number;
  size?: string;
  className?: string;
}> = ({ color, number, size = "w-8 h-8", className }) => {
  const isYellow = color === 'yellow' || color === 'gold';
  const isPurple = color === 'purple';
  const isSilver = color === 'silver';
  const uniqueId = React.useId().replace(/:/g, '');
  
  // Custom text colors and shadow filters
  let textFill = "#624a00";
  let borderFilter = "drop-shadow(0px 3px 5px rgba(245,158,11,0.455))";

  if (isPurple) {
    textFill = "#3f007a";
    borderFilter = "drop-shadow(0px 3px 5px rgba(186,104,200,0.455))";
  } else if (isSilver) {
    textFill = "#263238";
    borderFilter = "drop-shadow(0px 2px 4px rgba(144,164,174,0.35))";
  } else if (color === 'grey') {
    textFill = "#78909c";
    borderFilter = "drop-shadow(0px 1px 3px rgba(0,0,0,0.15))";
  }

  return (
    <div className={`${size} relative ${className} flex items-center justify-center select-none`}>
      <svg viewBox="0 0 100 100" style={{ filter: borderFilter }} className="w-full h-full overflow-visible">
        <defs>
          {/* Yellow Gold Metallic Gradient */}
          <linearGradient id={`goldBody-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffde7" />
            <stop offset="18%" stopColor="#fff176" />
            <stop offset="50%" stopColor="#fbc02d" />
            <stop offset="85%" stopColor="#f57f17" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>

          {/* Epic Translucent Purple Body Gradient */}
          <linearGradient id={`purpleBody-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdf4ff" />
            <stop offset="18%" stopColor="#f0c2ff" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="85%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>

          {/* Silver Mirror Gradient */}
          <linearGradient id={`silverBody-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Inactive Charcoal Grey Glass Gradient */}
          <linearGradient id={`greyBody-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="15%" stopColor="#e2e8f0" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="90%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Premium Jelly Gel Overlay Sheen */}
          <linearGradient id={`jellySheen-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* Perfect Chubby Rounded Star Bezier clip path */}
          <clipPath id={`chubbyStarClip-${uniqueId}`}>
            <path d="M 50 7 C 52 13, 58 32, 62 35 C 66 38, 85 35, 90 38 C 95 41, 92 48, 89 53 C 86 58, 68 58, 66 61 C 64 64, 73 83, 75 87 C 77 91, 69 92, 63 88 C 57 84, 52 74, 50 74 C 48 74, 43 84, 37 88 C 31 92, 23 91, 25 87 C 27 83, 36 64, 34 61 C 32 58, 14 58, 11 53 C 8 48, 5 41, 10 38 C 15 35, 34 38, 38 35 C 42 32, 48 13, 50 7 Z" />
          </clipPath>
        </defs>

        {/* Layer 1: Intense 3D Extrusion Shadow (gives bottom thickness) */}
        <path 
          d="M 50 7 C 52 13, 58 32, 62 35 C 66 38, 85 35, 90 38 C 95 41, 92 48, 89 53 C 86 58, 68 58, 66 61 C 64 64, 73 83, 75 87 C 77 91, 69 92, 63 88 C 57 84, 52 74, 50 74 C 48 74, 43 84, 37 88 C 31 92, 23 91, 25 87 C 27 83, 36 64, 34 61 C 32 58, 14 58, 11 53 C 8 48, 5 41, 10 38 C 15 35, 34 38, 38 35 C 42 32, 48 13, 50 7 Z" 
          transform="translate(0, 4.5)"
          fill={isYellow ? "#b23c00" : isPurple ? "#3b0764" : isSilver ? "#1e293b" : "#334155"} 
          className="pointer-events-none"
        />

        {/* Layer 2: Subtle warm ambient lighting glow contour just under the body */}
        <path 
          d="M 50 7 C 52 13, 58 32, 62 35 C 66 38, 85 35, 90 38 C 95 41, 92 48, 89 53 C 86 58, 68 58, 66 61 C 64 64, 73 83, 75 87 C 77 91, 69 92, 63 88 C 57 84, 52 74, 50 74 C 48 74, 43 84, 37 88 C 31 92, 23 91, 25 87 C 27 83, 36 64, 34 61 C 32 58, 14 58, 11 53 C 8 48, 5 41, 10 38 C 15 35, 34 38, 38 35 C 42 32, 48 13, 50 7 Z" 
          transform="translate(0, 1.5)"
          fill={isYellow ? "#f59e0b" : isPurple ? "#a855f7" : isSilver ? "#64748b" : "#475569"} 
          className="pointer-events-none"
        />

        {/* Layer 3: Main Star Body filled with shiny multi-stage gradient */}
        <path 
          d="M 50 7 C 52 13, 58 32, 62 35 C 66 38, 85 35, 90 38 C 95 41, 92 48, 89 53 C 86 58, 68 58, 66 61 C 64 64, 73 83, 75 87 C 77 91, 69 92, 63 88 C 57 84, 52 74, 50 74 C 48 74, 43 84, 37 88 C 31 92, 23 91, 25 87 C 27 83, 36 64, 34 61 C 32 58, 14 58, 11 53 C 8 48, 5 41, 10 38 C 15 35, 34 38, 38 35 C 42 32, 48 13, 50 7 Z" 
          fill={`url(#${isYellow ? 'gold' : isPurple ? 'purple' : isSilver ? 'silver' : 'grey'}Body-${uniqueId})`}
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1"
        />

        {/* Layer 4: Clear Liquid Epoxy Curved Highlight (Clipped into the puffy star) */}
        <path 
          d="M -10 -10 H 110 V 46 C 70 30, 30 30, -10 46 Z" 
          fill={`url(#jellySheen-${uniqueId})`} 
          clipPath={`url(#chubbyStarClip-${uniqueId})`} 
          className="pointer-events-none"
        />

        {/* Layer 5: High-intensity wet-reflecting glass ellipsoid arcs */}
        <ellipse 
          cx="36" 
          cy="23" 
          rx="15" 
          ry="6" 
          fill="#ffffff" 
          opacity="0.85" 
          transform="rotate(-26 36 23)" 
          clipPath={`url(#chubbyStarClip-${uniqueId})`}
          className="pointer-events-none"
        />

        {/* Sharp, radiant inner core spark */}
        <ellipse 
          cx="34" 
          cy="21" 
          rx="9" 
          ry="3.5" 
          fill="#ffffff" 
          opacity="0.95" 
          transform="rotate(-26 34 21)" 
          clipPath={`url(#chubbyStarClip-${uniqueId})`}
          className="pointer-events-none"
        />
      </svg>
      
      {/* Absolute overlay count label strictly formatted inside the chubby center */}
      {number !== "" && (
        <span 
          style={{ color: textFill }} 
          className="absolute font-black text-[9.5px] tracking-tighter drop-shadow-sm select-none leading-none z-10 pt-1"
        >
          {number}
        </span>
      )}
    </div>
  );
};

// Reusable 3D Treasure Chest Box Component
const ThreeDChest: React.FC<{ completed?: boolean; size?: string; className?: string }> = ({ completed = false, size = "w-8 h-8", className }) => {
  return (
    <div className={`${size} ${className} relative flex items-center justify-center select-none drop-shadow-sm`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="chestLid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={completed ? "#ffea00" : "#eceff1"} />
            <stop offset="100%" stopColor={completed ? "#ff9100" : "#b0bec5"} />
          </linearGradient>
          <linearGradient id="chestBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={completed ? "#ff9100" : "#b0bec5"} />
            <stop offset="100%" stopColor={completed ? "#d50000" : "#78909c"} />
          </linearGradient>
          <linearGradient id="chestWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8d6e63" />
            <stop offset="100%" stopColor="#4e342e" />
          </linearGradient>
        </defs>
        
        {/* Chest Dark Wood Back Support Panel */}
        <rect x="20" y="34" width="60" height="42" rx="5" fill="url(#chestWood)" />
        
        {/* Lid (Glass/Metallic Facet Curves) */}
        <path d="M 16 34 C 16 16, 84 16, 84 34 Z" fill="url(#chestLid)" stroke="#3e2723" strokeWidth="2.5" />
        <path d="M 28 34 C 28 20, 72 20, 72 34 Z" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-40" />
        
        {/* Main Chest Body Tub */}
        <path d="M 18 35 L 82 35 L 78 74 L 22 74 Z" fill="url(#chestBase)" stroke="#3e2723" strokeWidth="2.5" />
        
        {/* Vertical Shiny Metal Reinforcements */}
        <rect x="30" y="24" width="8" height="50" fill="#ffd54f" opacity="0.9" />
        <rect x="62" y="24" width="8" height="50" fill="#ffd54f" opacity="0.9" />
        
        {/* Locks Plate & Dial */}
        <rect x="44" y="30" width="12" height="13" rx="1.5" fill="#ffd54f" stroke="#ff8f00" strokeWidth="1" />
        <circle cx="50" cy="36" r="2" fill="#212121" />
      </svg>
    </div>
  );
};

export const StarGoalModal: React.FC<StarGoalModalProps> = ({ 
  isOpen, 
  onClose, 
  roomBeans,
  onHelpHost,
  hostProfile
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'heat'>('daily');
  
  // Custom fallback exactly like original context
  const beansCurrent = roomBeans !== undefined ? roomBeans : 174;

  // Fully-featured star mapping matching Bigo Live's actual reward scaling
  const STAR_LEVELS = [
    { level: 1, target: 50, gifter: 2, heat: 50, luckyCoins: "None", breakthrough: false },
    { level: 2, target: 250, gifter: 3, heat: 150, luckyCoins: "10-800", breakthrough: false },
    { level: 3, target: 1000, gifter: 4, heat: 300, luckyCoins: "10-1000", breakthrough: true,
      rewards: [
        { name: "Area Banner 3%", target: "Host", subText: "Host", icon: "📱", color: "from-blue-500 to-indigo-600" },
        { name: "2-200 Coins", target: "Host", subText: "Host", icon: "🪙", color: "from-amber-400 to-yellow-600" },
        { name: "Item fragment", target: "User", subText: "User", icon: "🧩", color: "from-purple-400 to-pink-500" },
        { name: "Item fragment", target: "User", subText: "User", icon: "🧩", color: "from-emerald-400 to-teal-500" }
      ]
    },
    { level: 4, target: 3000, gifter: 5, heat: 500, luckyCoins: "20-1000", breakthrough: true,
      rewards: [
        { name: "Area Banner 12%", target: "Host", subText: "Host", icon: "📱", color: "from-blue-500 to-indigo-600" },
        { name: "10-200 Coins", target: "Host", subText: "Host", icon: "🪙", color: "from-amber-400 to-yellow-600" },
        { name: "Item fragment x2", target: "User", subText: "User", icon: "🧩", color: "from-purple-400 to-pink-500" },
        { name: "Item fragment x2", target: "User", subText: "User", icon: "🧩", color: "from-emerald-400 to-teal-500" }
      ]
    },
    { level: 5, target: 8000, gifter: 6, heat: 1000, luckyCoins: "50-1000", breakthrough: true,
      rewards: [
        { name: "Area Banner 15%", target: "Host", subText: "Host", icon: "📱", color: "from-blue-500 to-indigo-600" },
        { name: "20-200 Coins", target: "Host", subText: "Host", icon: "🪙", color: "from-amber-400 to-yellow-600" },
        { name: "Item fragment x3", target: "User", subText: "User", icon: "🧩", color: "from-purple-400 to-pink-500" },
        { name: "Item fragment x3", target: "User", subText: "User", icon: "🧩", color: "from-emerald-400 to-teal-500" }
      ]
    },
    { level: 6, target: 15000, gifter: 8, heat: 1500, luckyCoins: "100-1000", breakthrough: true,
      rewards: [
        { name: "Area Banner 30%", target: "Host", subText: "Host", icon: "📱", color: "from-blue-500 to-indigo-600" },
        { name: "40-200 Coins", target: "Host", subText: "Host", icon: "🪙", color: "from-amber-400 to-yellow-600" },
        { name: "Approach animation", target: "User", subText: "User", icon: "🏎️", color: "from-purple-400 to-pink-500" },
        { name: "Avatar frame X1", target: "User", subText: "User", icon: "👤", color: "from-emerald-400 to-teal-500" }
      ],
      userRewards: {
        coins: 30,
        sunHearts: 15,
        items: ["🧩 Fragment X1", "🧩 Fragment X1", "📦 Fragment X3"]
      }
    },
    { level: 10, target: 50000, gifter: 15, heat: 5000, luckyCoins: "200-1500", breakthrough: true,
      rewards: [
        { name: "Area Banner 30%", target: "Host", subText: "Host", icon: "📱", color: "from-blue-500 to-indigo-600" },
        { name: "40-200 Coins", target: "Host", subText: "Host", icon: "🪙", color: "from-amber-400 to-yellow-600" },
        { name: "Approach animation", target: "User", subText: "User", icon: "🏎️", color: "from-purple-400 to-pink-500" },
        { name: "Avatar frame X1", target: "User", subText: "User", icon: "👤", color: "from-emerald-400 to-teal-500" }
      ],
      userRewards: {
        coins: 40,
        sunHearts: 20,
        items: ["🧩 Fragment X2", "🧩 Fragment X1", "📦 Fragment X3"]
      }
    },
    { level: 14, target: 200000, gifter: 30, heat: 15000, luckyCoins: "200-3000", breakthrough: true,
      rewards: [
        { name: "Area Banner 30%", target: "Host", subText: "Host", icon: "📱", color: "from-blue-500 to-indigo-600" },
        { name: "40-200 Coins", target: "Host", subText: "Host", icon: "🪙", color: "from-amber-400 to-yellow-600" },
        { name: "Approach animation", target: "User", subText: "User", icon: "🏎️", color: "from-purple-400 to-pink-500" },
        { name: "Avatar frame X1", target: "User", subText: "User", icon: "👤", color: "from-emerald-400 to-teal-500" }
      ],
      userRewards: {
        coins: 50,
        sunHearts: 25,
        items: ["🧩 Fragment X3", "🧩 Fragment X3", "📦 Fragment X5"]
      }
    }
  ];

  // Dynamically calculate which star challenge is underway in the room right now
  const currentUnderwayStar = STAR_LEVELS.find(lvl => beansCurrent < lvl.target)?.level || 14;

  // Track the star level currently selected for exploration (defaults to underway level when opened)
  const [selectedStar, setSelectedStar] = useState<number>(1);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedStar(currentUnderwayStar);
    }
  }, [isOpen, currentUnderwayStar]);

  const activeStarData = STAR_LEVELS.find(s => s.level === selectedStar) || STAR_LEVELS[0];

  // Compute contribution progress
  const contributionVal = Math.min(beansCurrent, activeStarData.target);
  const contributionPct = (contributionVal / activeStarData.target) * 100;

  // Compute realistic gifter count based on the streamer support level
  const gifterProgress = Math.min(Math.max(1, Math.floor(beansCurrent / 120) + 1), activeStarData.gifter);
  const gifterPct = (gifterProgress / activeStarData.gifter) * 100;

  // Generate date list exactly correlating to May context of screenshot
  const pastDates = ["05.18", "05.19", "05.20", "05.21", "05.22", "05.23", "05.24"];

  // Top Star Rankings formatted strictly like the screenshot values
  const rankList = [
    {
      rank: 1,
      name: "HBD TO ME 🎂",
      stars: 12,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop"
    },
    {
      rank: 2,
      name: "☀️Fallon 🌴",
      stars: 8,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
    }
  ];

  // Host properties
  const hostName = hostProfile?.displayName || "M.o.l.l.y";
  const hostAvatar = hostProfile?.photoURL || "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-auto">
          {/* Subtle blurred backdrop screen */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Bottom sheet card */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="relative w-full max-w-md bg-[#f6f8fe] rounded-t-[32px] shadow-[0_-12px_44px_rgba(0,0,0,0.22)] overflow-hidden flex flex-col z-10 max-h-[85vh]"
          >
            {/* Soft drag grabber bar indicator */}
            <div className="w-full flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 bg-slate-300/60 rounded-full" />
            </div>

            {/* Seamless Header with exact clean layout */}
            <div className="px-6 py-2 flex items-center justify-between relative bg-white shrink-0">
              <div className="flex items-center gap-7">
                {/* Daily Task Tab */}
                <button 
                  onClick={() => setActiveTab('daily')}
                  className="relative pb-2.5 pt-1.5 font-black text-xs md:text-sm select-none outline-none cursor-pointer"
                >
                  <span className={activeTab === 'daily' ? 'text-slate-900 text-xs md:text-sm font-black' : 'text-slate-400 font-bold'}>
                    Daily Task
                  </span>
                  {activeTab === 'daily' && (
                    <motion.div 
                      layoutId="modalTabSelector"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-slate-950 rounded-full" 
                    />
                  )}
                </button>

                {/* Real-time Heat List Tab */}
                <button 
                  onClick={() => setActiveTab('heat')}
                  className="relative pb-2.5 pt-1.5 font-black text-xs md:text-sm flex items-center gap-1.5 select-none outline-none cursor-pointer"
                >
                  <span className={activeTab === 'heat' ? 'text-slate-900 text-xs md:text-sm font-black' : 'text-slate-400 font-bold'}>
                    Real-time Heat List
                  </span>
                  {/* Cyan bar chart mini asset */}
                  <span className="flex items-end gap-0.5 h-3 pb-0.5 select-none animate-bounce">
                    <span className="w-[2px] h-1.5 bg-[#00e5ff] rounded-full" />
                    <span className="w-[2px] h-3 bg-[#00e5ff] rounded-full" />
                    <span className="w-[2px] h-2 bg-[#00e5ff] rounded-full" />
                  </span>
                  {activeTab === 'heat' && (
                    <motion.div 
                      layoutId="modalTabSelector"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-slate-950 rounded-full" 
                    />
                  )}
                </button>
              </div>

              {/* Seamless flat X button */}
              <button 
                onClick={onClose}
                className="hover:scale-105 active:scale-90 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all p-1 cursor-pointer"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Container */}
            <div className="overflow-y-auto no-scrollbar pb-6 px-4 pt-4 space-y-4 flex-1">
              
              {activeTab === 'daily' ? (
                <>
                  {/* Starry Purple Gradient Card Banner Box */}
                  <div className="bg-gradient-to-br from-[#7e4aff] via-[#6d39fa] to-[#5926e8] rounded-[20px] p-3.5 text-white shadow-[0_8px_24px_rgba(110,57,250,0.22)] relative overflow-hidden">
                    {/* Background glow graphics */}
                    <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    
                    <div className="flex items-start justify-between mb-2 relative z-10">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs md:text-sm tracking-tight text-yellow-200">
                            {selectedStar === currentUnderwayStar 
                              ? `Challenging ${selectedStar} star` 
                              : selectedStar < currentUnderwayStar 
                                ? `Star ${selectedStar} Completed` 
                                : `Challenge ${selectedStar} star`
                            }
                          </span>
                          <HelpCircle size={12} className="opacity-70 cursor-pointer hover:opacity-100" />
                        </div>
                        
                        {/* Underway notification stripe warning like Bigo */}
                        {selectedStar !== currentUnderwayStar && (
                          <button 
                            onClick={() => setSelectedStar(currentUnderwayStar)}
                            className="text-[9.5px] text-pink-200 hover:underline flex items-center gap-0.5 tracking-tight mt-0.5 outline-none font-bold"
                          >
                            <span>⚠️ Star {currentUnderwayStar} Challenge is underway. Go &gt;</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Frosted frame */}
                      <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-[inset_0_3px_8px_rgba(255,255,255,0.18)]">
                        <ThreeDStar color={selectedStar <= currentUnderwayStar ? "yellow" : "purple"} number="" size="w-9 h-9" />
                      </div>
                    </div>

                    {/* Step Timeline showing all levels as clickable buttons */}
                    <div className="relative my-4 px-1.5 bg-black/10 py-2.5 rounded-xl border border-white/5">
                      <div className="absolute top-[28px] left-3 right-5 h-[2px] bg-white/15 z-0 rounded-full" />
                      
                      <div className="relative flex justify-between items-center z-10 select-none overflow-x-auto no-scrollbar gap-2.5">
                        {STAR_LEVELS.map((item) => {
                          const isCurrent = item.level === currentUnderwayStar;
                          const isExplored = item.level === selectedStar;
                          const isPassed = item.level < currentUnderwayStar;
                          const isChest = item.level >= 6;

                          return (
                            <button
                              key={item.level}
                              onClick={() => setSelectedStar(item.level)}
                              className={`flex flex-col items-center shrink-0 p-1.5 rounded-xl transition-all duration-200 relative focus:outline-none ${
                                isExplored 
                                  ? 'bg-white/20 scale-105 border border-white/30 shadow-md transform -translate-y-1' 
                                  : 'hover:bg-white/5 active:scale-95'
                              }`}
                            >
                              {/* Glowing Ring Core on underway / explored steps */}
                              {isCurrent && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}

                              {isChest ? (
                                <ThreeDChest completed={isPassed || isCurrent} size="w-5.5 h-5.5" />
                              ) : (
                                <ThreeDStar 
                                  color={isPassed || isCurrent ? "yellow" : "purple"} 
                                  number={item.level} 
                                  size="w-5.5 h-5.5" 
                                />
                              )}
                              
                              <span className="text-[8px] mt-1 font-bold opacity-90 block tracking-tight text-white/95">
                                {isChest ? `L${item.level}` : `S${item.level}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dual Progress Bars precisely sized and spaced */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {/* Contribution Box */}
                      <div className="bg-black/12 rounded-lg p-2.5 border border-white/5 pb-2">
                        <span className="block text-[9px] text-white/70 font-bold mb-1">Contribution value</span>
                        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${contributionPct}%` }} 
                            className="h-full bg-gradient-to-r from-violet-300 via-pink-200 to-white rounded-full transition-all duration-500" 
                          />
                        </div>
                        <span className="block text-[9.5px] text-cyan-200 font-extrabold mt-1 tracking-tight">
                          {contributionVal}/{activeStarData.target} beans
                        </span>
                      </div>

                      {/* Gifter Box */}
                      <div className="bg-black/12 rounded-lg p-2.5 border border-white/5 pb-2">
                        <span className="block text-[9px] text-white/70 font-bold mb-1 font-sans">Gifter support</span>
                        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${gifterPct}%` }} 
                            className="h-full bg-gradient-to-r from-violet-300 via-pink-200 to-white rounded-full transition-all duration-500" 
                          />
                        </div>
                        <span className="block text-[9.5px] text-cyan-200 font-extrabold mt-1 tracking-tight">
                          {gifterProgress}/{activeStarData.gifter} gifters
                        </span>
                      </div>
                    </div>

                    {/* Host's reward and details */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between font-sans">
                      <div className="flex flex-col">
                        <span className="text-[9.5px] text-white/75 font-semibold leading-none">Selected level host reward:</span>
                        {activeStarData.luckyCoins !== "None" && (
                          <span className="text-[9px] text-yellow-200 mt-0.5 leading-none">Coins: {activeStarData.luckyCoins}</span>
                        )}
                      </div>
                      <div className="bg-black/20 px-2.5 py-0.5 rounded-full text-white text-[9.5px] flex items-center gap-1 font-extrabold border border-white/10 shrink-0">
                        <span>🔥</span>
                        <span>{activeStarData.heat} Heat</span>
                      </div>
                    </div>
                  </div>

                  {/* Users' bonus reward bucket - Present on Level 6, 10, 14 */}
                  {activeStarData.userRewards && (
                    <div className="bg-amber-500/10 border border-amber-500/15 rounded-2xl p-3 shadow-sm text-yellow-950 font-sans">
                      <h4 className="font-extrabold text-[10.5px] tracking-tight uppercase flex items-center gap-1 text-amber-800">
                        <span>🎁</span> Users' breakthrough reward bonus
                      </h4>
                      <p className="text-[9px] text-amber-900 mt-1 leading-normal font-semibold">
                        Supporters who assist in passing Star {activeStarData.level} will earn:
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 mt-2">
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200 text-center flex flex-col items-center justify-center">
                          <span className="text-xs">🪙</span>
                          <span className="text-[9px] font-black text-amber-950 mt-0.5">{activeStarData.userRewards.coins} Lucky Coins</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200 text-center flex flex-col items-center justify-center">
                          <span className="text-xs">❤️</span>
                          <span className="text-[9px] font-black text-amber-950 mt-0.5">{activeStarData.userRewards.sunHearts} Intimacy Point</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200 text-center flex flex-col items-center justify-center">
                          <span className="text-xs">📦</span>
                          <span className="text-[9px] font-black text-amber-950 mt-0.5 truncate w-full">Fragment chest</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Breakthrough Rewards Panels (Star 3, 4, 5, 6, 10, 14) */}
                  {activeStarData.breakthrough ? (
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-slate-100/80 font-sans">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-slate-800 font-extrabold text-[11px] tracking-wide uppercase px-1">
                          Bonus of breaking through to {activeStarData.level} stars
                        </h4>
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded-full select-none shrink-0 border border-indigo-100">Milestone</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {activeStarData.rewards?.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center flex flex-col items-center justify-between h-[82px] hover:shadow-xs transition-shadow duration-200"
                          >
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${item.color} flex items-center justify-center text-white text-sm shadow-inner shrink-0`}>
                              {item.icon}
                            </div>
                            <span className="block text-[9px] font-extrabold text-slate-800 leading-tight w-full truncate mt-1">
                              {item.name}
                            </span>
                            <span className={`block text-[8px] font-black ${
                              item.target === 'Host' ? 'text-blue-500' : 'text-purple-500'
                            } leading-none`}>
                              {item.target}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-slate-100/80 text-center py-5 font-sans">
                      <span className="text-xl">⭐</span>
                      <h4 className="text-slate-700 font-black text-[11px] tracking-wide uppercase mt-1">
                        Breakthrough bonus targets
                      </h4>
                      <p className="text-[9px] text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                        Reach Star 3, 4, 5, 6, 10, or 14 to unlock incredible premium booster benefits like local Area Banners, lucky coin pools, custom user approach animations and avatars.
                      </p>
                    </div>
                  )}

                  {/* Last 7 day records Card Container */}
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-slate-100">
                    <h4 className="text-slate-400 font-extrabold text-[11px] tracking-wide uppercase mb-3 px-1">
                      Last 7 day records
                    </h4>

                    {/* Exactly structured 7 column items with puffy star designs */}
                    <div className="grid grid-cols-7 gap-1 font-sans">
                      {pastDates.map((date, idx) => {
                        let innerStarBadge = <ThreeDStar color="grey" number="0" size="w-8 h-8" />;
                        let cardStyle = "flex flex-col items-center py-1 rounded-xl";

                        if (idx === 2) {
                          innerStarBadge = <ThreeDStar color="yellow" number="2" size="w-8 h-8" />;
                          cardStyle = "flex flex-col items-center py-1 px-0.5 bg-amber-50/60 border border-amber-200/50 rounded-[14px]";
                        } else if (idx === 4) {
                          innerStarBadge = <ThreeDStar color="purple" number="1" size="w-8 h-8" />;
                          cardStyle = "flex flex-col items-center py-1 px-0.5 bg-purple-50/60 border border-purple-100/50 rounded-[14px]";
                        }

                        return (
                          <div key={date} className={cardStyle}>
                            {innerStarBadge}
                            <span className={`text-[9px] mt-1.5 font-bold ${
                              idx === 2 ? 'text-amber-600' : idx === 4 ? 'text-purple-600' : 'text-slate-400'
                            }`}>
                              {date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Today Star Ranking Card Container */}
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-slate-100 flex flex-col">
                    <h4 className="text-slate-900 font-black text-xs tracking-wide uppercase mb-4 px-1">
                      Today Star Ranking
                    </h4>

                    {/* Rankings List Details */}
                    <div className="space-y-3 font-sans">
                      {rankList.map((item) => (
                        <div key={item.rank} className="flex items-center justify-between p-1 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                              item.rank === 1 
                                ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 border border-white shadow-sm' 
                                : 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 border border-white shadow-sm'
                            }`}>
                              {item.rank}
                            </div>
                            
                            <div className={`w-8 h-8 rounded-full overflow-hidden ${
                              item.rank === 1 ? 'border-2 border-yellow-400 p-0.5' : 'border border-slate-200'
                            }`}>
                              <img src={item.avatar} alt="User Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                            </div>

                            <span className="text-xs font-black text-slate-800">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pr-3">
                            <span className="flex items-center gap-1">
                              <ThreeDStar color="yellow" number="" size="w-4 h-4" />
                              <span className="text-slate-800 text-xs font-black">
                                {item.stars} Star
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Full layout Help Button */}
                    <button 
                      onClick={() => {
                        if (onHelpHost) onHelpHost();
                      }}
                      className="bg-gradient-to-r from-[#00cbd6] to-[#00fae6] hover:brightness-105 active:scale-98 text-white text-xs font-extrabold py-3.5 px-4 rounded-full mt-6 flex items-center justify-center shadow-lg transition-all cursor-pointer font-sans"
                    >
                      <span>Help the host start challenge &gt;</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Real-time Heat List Tab view details */
                <div className="space-y-4">
                  
                  {/* Pompous Tri-Podium ranking graphics */}
                  <div className="bg-gradient-to-br from-[#12082b] via-[#21114d] to-[#12082b] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(20,10,50,0.18)] text-white relative overflow-hidden select-none border border-white/5 flex flex-col items-center">
                    
                    {/* Glowing spotlight background rings */}
                    <div className="absolute top-[10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-[40%] w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent blur-md" />

                    <span className="text-[10px] text-cyan-300 font-extrabold tracking-widest uppercase mb-1 font-sans">Stream Popularity Leaderboard</span>
                    <h3 className="text-sm font-black text-white/95 tracking-normal mb-8 font-sans">Heat Rankings</h3>

                    {/* The podium structure grids */}
                    <div className="grid grid-cols-3 gap-0 w-full max-w-[280px] items-end relative z-10 select-none px-2 mt-4 font-sans">
                      
                      {/* #2 Rank podium sidebar item */}
                      <div className="flex flex-col items-center group">
                        <div className="relative mb-2">
                          <div className="w-[48px] h-[48px] rounded-full overflow-hidden border-2 border-slate-350 p-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)] bg-slate-400 shrink-0">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop" alt="Fallon" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                          </div>
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 border border-white font-black text-[8px] px-1 py-0.2 rounded-full leading-none">2</span>
                        </div>
                        <span className="text-[9.5px] font-bold text-slate-300 truncate w-full text-center">Fallon</span>
                        <span className="text-[8.5px] font-black text-cyan-200 mt-0.5">🔥 8.4k</span>
                        
                        <div className="w-full h-11 bg-gradient-to-t from-slate-400/10 to-slate-400/20 rounded-t-xl mt-2 relative border border-white/5 border-b-0" />
                      </div>

                      {/* #1 Supreme rank podium middle item */}
                      <div className="flex flex-col items-center group relative -translate-y-2 z-20 scale-105">
                        <span className="text-[11px] mb-0.5 select-none animate-bounce">👑</span>
                        <div className="relative mb-2">
                          <div className="w-[56px] h-[56px] rounded-full overflow-hidden border-2 border-yellow-400 p-0.5 shadow-[0_6px_14px_rgba(245,158,11,0.4)] bg-amber-500 shrink-0">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop" alt="Winner" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                          </div>
                          <span className="absolute -bottom-1 -right-0.5 bg-yellow-400 text-amber-950 border border-white font-black text-[8.5px] w-4 h-4 rounded-full flex items-center justify-center leading-none">1</span>
                        </div>
                        <span className="text-xs font-black text-white truncate w-full text-center tracking-tight">HBD TO ME 🎂</span>
                        <span className="text-[9.5px] font-black text-yellow-300 mt-0.5">🔥 12.5k</span>
                        
                        <div className="w-full h-15 bg-gradient-to-t from-yellow-500/15 to-yellow-500/25 rounded-t-xl mt-2 relative border border-yellow-400/20 border-b-0" />
                      </div>

                      {/* #3 Rank podium sidebar item */}
                      <div className="flex flex-col items-center group">
                        <div className="relative mb-2">
                          <div className="w-[44px] h-[44px] rounded-full overflow-hidden border-2 border-amber-600/60 p-0.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)] bg-amber-700 shrink-0">
                            <img src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop" alt="Sweetslim" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                          </div>
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 border border-white font-black text-[8px] px-1 py-0.2 rounded-full leading-none">3</span>
                        </div>
                        <span className="text-[9.5px] font-bold text-slate-350 truncate w-full text-center">sweetslim</span>
                        <span className="text-[8.5px] font-black text-cyan-200 mt-0.5">🔥 5.2k</span>
                        
                        <div className="w-full h-8 bg-gradient-to-t from-amber-600/10 to-amber-600/20 rounded-t-xl mt-2 relative border border-white/5 border-b-0" />
                      </div>

                    </div>
                  </div>

                  {/* Vertical Ranks Items list (styled cleanly using human formats) */}
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.012)] border border-slate-100 flex flex-col gap-2 relative font-sans">
                    {[
                      { rank: 4, name: "Ziora 👑", heat: "32.8k", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop" },
                      { rank: 5, name: "She's Tea 🎀", heat: "32.1k", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop" },
                      { rank: 6, name: "Big Wama 🦍", heat: "27.6k", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop" },
                      { rank: 7, name: "Tony Starr 💎", heat: "18.3k", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop" },
                      { rank: 8, name: "Riri 🌟", heat: "7.6k", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop" }
                    ].map((item) => (
                      <div 
                        key={item.rank} 
                        className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-slate-50 transition-all active:scale-99"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Warm minimal Rank indicator */}
                          <span className="w-4 text-center text-xs font-black text-slate-400">
                            {item.rank}
                          </span>
                          
                          {/* Clean borderless circular avatar */}
                          <div className="w-[38px] h-[38px] rounded-full overflow-hidden border border-slate-100/40 shadow-sm shrink-0">
                            <img 
                              src={item.avatar} 
                              alt={item.name} 
                              className="w-full h-full object-cover rounded-full" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>

                          {/* Human name tag labels */}
                          <span className="text-[11.5px] font-extrabold text-slate-700 tracking-tight">
                            {item.name}
                          </span>
                        </div>

                        {/* Fire Heat Point Score */}
                        <div className="flex items-center gap-0.5">
                          <span className="text-[#ff5a5a] text-xs filter drop-shadow-sm">🔥</span>
                          <span className="text-[11.5px] font-black text-slate-500">
                            {item.heat}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Persistent Sticky Bottom Row */}
                  <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 -mx-4 -mb-6 mt-3 shadow-[0_-6px_22px_rgba(0,0,0,0.035)] z-20 flex items-center justify-between select-none pb-5.5 font-sans">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-400 w-4 text-center">
                        143
                      </span>
                      
                      <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-slate-100/50 shadow-sm shrink-0">
                        <img 
                          src={hostAvatar} 
                          alt={hostName} 
                          className="w-full h-full object-cover rounded-full" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>

                      <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                        {hostName}
                      </span>
                    </div>

                    {/* Stacked status heat & help call action */}
                    <div className="flex flex-col items-end text-right">
                      {/* Current player popularity state */}
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <span className="text-[#ff5a5a] text-[10.5px] filter drop-shadow">🔥</span>
                        <span className="text-xs font-black text-slate-700">5319</span>
                      </div>

                      {/* Cyan CTA trigger */}
                      <button 
                        onClick={() => {
                          if (onHelpHost) onHelpHost();
                        }}
                        className="text-[10px] text-[#00cbd6] active:text-[#00adc0] font-black flex items-center gap-0.5 mt-0.5 cursor-pointer select-none leading-none hover:brightness-105 inline-flex"
                      >
                        <span className="flex flex-col items-end text-right mr-0.5">
                          <span>Help the host</span>
                          <span>increase popularity</span>
                        </span>
                        <span className="text-[11px] font-extrabold">&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
