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
  let borderFilter = "drop-shadow(0px 3px 5px rgba(245,158,11,0.45))";

  if (isPurple) {
    textFill = "#3f007a";
    borderFilter = "drop-shadow(0px 3px 5px rgba(186,104,200,0.45))";
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
        {/* Soft, broad light beam reflecting from upper left */}
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

        {/* Auxiliary micro specular reflections representing studio key lighting */}
        <circle cx="28" cy="38" r="2.5" fill="#ffffff" opacity="0.5" className="pointer-events-none" />
        <circle cx="68" cy="38" r="2.2" fill="#ffffff" opacity="0.45" className="pointer-events-none" />
        <circle cx="50" cy="15" r="3" fill="#ffffff" opacity="0.65" className="pointer-events-none" />

        {/* Center count circle containing state number label */}
        {number !== "" && (
          <>
            <circle cx="50" cy="51" r="14.5" fill="white" fillOpacity="0.88" />
            <text 
              x="50" 
              y="56.5" 
              textAnchor="middle" 
              fill={textFill} 
              fontSize="19" 
              fontWeight="900" 
              fontFamily="system-ui, sans-serif"
            >
              {number}
            </text>
          </>
        )}
      </svg>
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
  
  // Calculation based on step milestones
  const contributionValue = Math.min(beansCurrent % 50 === 0 && beansCurrent > 0 ? 50 : beansCurrent % 50, 50);

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
                  className="relative pb-2.5 pt-1.5 font-black text-sm select-none outline-none cursor-pointer"
                >
                  <span className={activeTab === 'daily' ? 'text-slate-900 text-sm font-black' : 'text-slate-400 font-bold'}>
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
                  className="relative pb-2.5 pt-1.5 font-black text-sm flex items-center gap-1.5 select-none outline-none cursor-pointer"
                >
                  <span className={activeTab === 'heat' ? 'text-slate-900 text-sm font-black' : 'text-slate-400 font-bold'}>
                    Real-time Heat List
                  </span>
                  {/* Cyan bar chart mini asset */}
                  <span className="flex items-end gap-0.5 h-3 pb-0.5 select-none">
                    <span className="w-[2px] h-1.5 bg-[#00e5ff] rounded-full animate-pulse" />
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

              {/* Seamless flat X button with no circular bg */}
              <button 
                onClick={onClose}
                className="hover:scale-105 active:scale-90 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all p-1 cursor-pointer"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Container with exact off-whites */}
            <div className="overflow-y-auto no-scrollbar pb-6 px-4 pt-4 space-y-4 flex-1">
              
              {activeTab === 'daily' ? (
                <>
                  {/* Starry Purple Gradient Card Banner Box */}
                  <div className="bg-gradient-to-br from-[#7e4aff] via-[#6d39fa] to-[#5926e8] rounded-[20px] p-3.5 text-white shadow-[0_8px_24px_rgba(110,57,250,0.22)] relative overflow-hidden">
                    {/* Background glow graphics mimicking ambient stars */}
                    <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    
                    <div className="flex items-start justify-between mb-2 relative z-10">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs md:text-sm tracking-tight">Challenging 1 star</span>
                        <HelpCircle size={12} className="opacity-70 cursor-pointer hover:opacity-100" />
                      </div>
                      
                      {/* Frosted translucent circular frame enclosing the large 3D lavender star (squeezed by 30%) */}
                      <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-[inset_0_3px_8px_rgba(255,255,255,0.18)]">
                        <ThreeDStar color="purple" number="" size="w-9 h-9" />
                      </div>
                    </div>

                    {/* Horizontal Milestones Step timeline lines (squeezed by 30%) */}
                    <div className="relative my-4 px-1.5">
                      {/* Connection bar route outline */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-3 right-5 h-[2px] bg-white/15 z-0 rounded-full" />
                      
                      <div className="relative flex justify-between items-center z-10 select-none">
                        {/* Step 1 (Active Yellow Gold 3D Star) */}
                        <div className="flex flex-col items-center">
                          <ThreeDStar color="yellow" number="1" size="w-6.5 h-6.5" />
                        </div>

                        {/* Step 2 (Glossy Lavender 3D Star) */}
                        <div className="flex flex-col items-center">
                          <ThreeDStar color="purple" number="2" size="w-5 h-5" className="opacity-80" />
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                          <ThreeDStar color="purple" number="3" size="w-5 h-5" className="opacity-80" />
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center">
                          <ThreeDStar color="purple" number="4" size="w-5 h-5" className="opacity-80" />
                        </div>

                        {/* Step 5 */}
                        <div className="flex flex-col items-center">
                          <ThreeDStar color="purple" number="5" size="w-5 h-5" className="opacity-80" />
                        </div>

                        {/* Milestone 6 Chest */}
                        <div className="flex flex-col items-center">
                          <ThreeDChest completed={false} size="w-5 h-5" className="opacity-80" />
                        </div>

                        {/* Milestone 7 Chest (Cropped visual edge like BINGO) */}
                        <div className="flex flex-col items-center">
                          <ThreeDChest completed={false} size="w-5 h-5" className="opacity-45 transform translate-x-1" />
                        </div>
                      </div>
                    </div>

                    {/* Dual Progress Bars precisely sized and spaced */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {/* Contribution Box */}
                      <div className="bg-black/12 rounded-lg p-2.5 border border-white/5 pb-2">
                        <span className="block text-[9px] text-white/70 font-bold mb-1">Contribution value</span>
                        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(contributionValue / 50) * 100}%` }} 
                            className="h-full bg-gradient-to-r from-violet-300 via-pink-200 to-white rounded-full" 
                          />
                        </div>
                        <span className="block text-[9px] text-cyan-200 font-extrabold mt-1">
                          {contributionValue}/50
                        </span>
                      </div>

                      {/* Gifter Box */}
                      <div className="bg-black/12 rounded-lg p-2.5 border border-white/5 pb-2">
                        <span className="block text-[9px] text-white/70 font-bold mb-1">Gifter</span>
                        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(1 / 2) * 100}%` }} 
                            className="h-full bg-gradient-to-r from-violet-300 via-pink-200 to-white rounded-full" 
                          />
                        </div>
                        <span className="block text-[9px] text-cyan-200 font-extrabold mt-1">
                          1/2
                        </span>
                      </div>
                    </div>

                    {/* Host's reward thin stripe with bottom reward capsule */}
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-white/75 font-bold">Host's reward</span>
                      <div className="bg-black/20 px-2 py-0.5 rounded-full text-white text-[9.5px] flex items-center gap-1 font-extrabold">
                        <span>🔥</span>
                        <span>50</span>
                      </div>
                    </div>
                  </div>

                  {/* Last 7 day records Card Container */}
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-slate-100">
                    <h4 className="text-slate-400 font-extrabold text-[11px] tracking-wide uppercase mb-3 px-1">
                      Last 7 day records
                    </h4>

                    {/* Exactly structured 7 column items with puffy star designs */}
                    <div className="grid grid-cols-7 gap-1">
                      {pastDates.map((date, idx) => {
                        let innerStarBadge = <ThreeDStar color="grey" number="0" size="w-8 h-8" />;
                        let cardStyle = "flex flex-col items-center py-1 rounded-xl";

                        if (idx === 2) {
                          // May 20 Highlight: 2 Gold stars
                          innerStarBadge = <ThreeDStar color="yellow" number="2" size="w-8 h-8" />;
                          cardStyle = "flex flex-col items-center py-1 px-0.5 bg-amber-50/60 border border-amber-200/50 rounded-[14px]";
                        } else if (idx === 4) {
                          // May 22 Highlight: 1 Purple star
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
                    <div className="space-y-3">
                      {rankList.map((item) => (
                        <div key={item.rank} className="flex items-center justify-between p-1 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex items-center gap-3">
                            {/* Medallions formatted precisely */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                              item.rank === 1 
                                ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 border border-white shadow-sm' 
                                : 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 border border-white shadow-sm'
                            }`}>
                              {item.rank}
                            </div>
                            
                            {/* Avatar with glossy borders */}
                            <div className={`w-8 h-8 rounded-full overflow-hidden ${
                              item.rank === 1 ? 'border-2 border-yellow-400 p-0.5' : 'border border-slate-200'
                            }`}>
                              <img src={item.avatar} alt="User Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                            </div>

                            <span className="text-xs font-black text-slate-800">
                              {item.name}
                            </span>
                          </div>

                          {/* 3D Gold Accent Star count label values */}
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

                    {/* Persistent support row of current host */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-1 rounded">
                          50+
                        </span>
                        
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                          <img src={hostAvatar} alt="Host Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 tracking-tight leading-none mb-1">
                            {hostName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold leading-none flex items-center gap-0.5">
                            <ThreeDStar color="yellow" number="" size="w-3 h-3" className="translate-y-[-0.5px]" /> 0 Star
                          </span>
                        </div>
                      </div>

                      {/* Help the Host Action Button */}
                      <button
                        onClick={() => {
                          if (onHelpHost) onHelpHost();
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-[#7e4aff] to-[#5926e8] hover:brightness-105 active:scale-95 text-white text-xs font-black rounded-full shadow-[0_4px_14px_rgba(110,57,250,0.3)] transition-all uppercase tracking-wide cursor-pointer"
                      >
                        Help the host
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Heat List Tab details: High-fidelity exact clone of the design */
                <div className="flex flex-col space-y-4">
                  {/* Small Rules Row at top right */}
                  <div className="flex justify-end px-1 -mb-1">
                    <button className="flex items-center gap-1 text-slate-400 font-bold text-xs select-none hover:text-slate-600 transition-colors">
                      <HelpCircle size={13} className="text-slate-400" />
                      Rules
                    </button>
                  </div>

                  {/* Podium grid exactly matching rank 2, 1, 3 column style */}
                  <div className="grid grid-cols-3 gap-2.5 items-end pt-5 pb-3 select-none">
                    
                    {/* Rank 2 (Left) */}
                    <div className="bg-gradient-to-b from-[#f0f9ff]/85 via-white to-white border border-[#bae6fd]/35 rounded-[22px] p-2.5 pb-4.5 flex flex-col items-center relative text-center shadow-[0_4px_12px_rgba(224,242,254,0.3)] min-h-[148px] justify-end">
                      {/* Silver Rank Badge */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                        <div className="w-[26px] h-[26px] bg-gradient-to-br from-[#ffffff] via-[#cbd5e1] to-[#64748b] border-2 border-white flex items-center justify-center text-white text-[11px] font-black rounded-b-md shadow-[0_2px_5px_rgba(0,0,0,0.15)]">
                          2
                        </div>
                      </div>

                      {/* Avatar with cyan ring */}
                      <div className="w-[54px] h-[54px] rounded-full overflow-hidden border-2 border-[#93c5fd] shadow-sm p-0.5 bg-white mb-2">
                        <img 
                          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop" 
                          alt="Sasha" 
                          className="w-full h-full object-cover rounded-full" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* User Display Info */}
                      <span className="text-[11px] font-extrabold text-slate-700 leading-tight truncate max-w-[80px]">
                        Sasha 💞
                      </span>
                      <div className="flex items-center gap-0.5 mt-1">
                        <span className="text-[#ff5a5a] text-[10px] filter drop-shadow">🔥</span>
                        <span className="text-[10px] font-black text-[#ff5a5a]">38.7k</span>
                      </div>
                    </div>

                    {/* Rank 1 (Center) */}
                    <div className="bg-gradient-to-b from-[#fffbeb] via-white to-white border border-[#fef3c7] rounded-[24px] p-2.5 pb-5 flex flex-col items-center relative text-center shadow-[0_8px_22px_rgba(245,158,11,0.18)] min-h-[168px] justify-end scale-105 z-10">
                      {/* Golden Crown Badge */}
                      <div className="absolute -top-[19px] left-1/2 -translate-x-1/2 flex flex-col items-center z-12">
                        <span className="text-[15px] leading-none mb-0.5 animate-bounce">👑</span>
                        <div className="w-[28px] h-[28px] bg-gradient-to-br from-[#ffe082] via-[#ffb300] to-[#f57c00] border-2 border-white flex items-center justify-center text-white text-[12px] font-black rounded-b-md shadow-[0_2px_6px_rgba(217,119,6,0.22)]">
                          1
                        </div>
                      </div>

                      {/* Large Glowing Gold Avatar */}
                      <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-[2.5px] border-[#fcd34d] shadow-[0_0_10px_rgba(251,191,36,0.35)] p-0.5 bg-white mb-2.5">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop" 
                          alt="Lansie" 
                          className="w-full h-full object-cover rounded-full" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Golden User Display Info */}
                      <span className="text-[12px] font-black text-slate-800 leading-tight truncate max-w-[90px]">
                        La♑sie 🔱...
                      </span>
                      <div className="flex items-center gap-0.5 mt-1">
                        <span className="text-[#ff5a5a] text-[10px] filter drop-shadow">🔥</span>
                        <span className="text-[10.5px] font-black text-[#ff5a5a]">40.0k</span>
                      </div>
                    </div>

                    {/* Rank 3 (Right) */}
                    <div className="bg-gradient-to-b from-[#fff7ed]/85 via-white to-white border border-[#ffedd5]/35 rounded-[22px] p-2.5 pb-4.5 flex flex-col items-center relative text-center shadow-[0_4px_12px_rgba(254,215,170,0.3)] min-h-[148px] justify-end">
                      {/* Bronze Rank Badge */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                        <div className="w-[26px] h-[26px] bg-gradient-to-br from-[#ffedd5] via-[#ea580c] to-[#9a3412] border-2 border-white flex items-center justify-center text-white text-[11px] font-black rounded-b-md shadow-[0_2px_5px_rgba(0,0,0,0.15)]">
                          3
                        </div>
                      </div>

                      {/* Avatar with gold/bronze ring */}
                      <div className="w-[54px] h-[54px] rounded-full overflow-hidden border-2 border-[#fdba74] shadow-sm p-0.5 bg-white mb-2">
                        <img 
                          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop" 
                          alt="softRae" 
                          className="w-full h-full object-cover rounded-full" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* User Display Info */}
                      <span className="text-[11px] font-extrabold text-slate-700 leading-tight truncate max-w-[80px]">
                        softRae...
                      </span>
                      <div className="flex items-center gap-0.5 mt-1">
                        <span className="text-[#ff5a5a] text-[10px] filter drop-shadow">🔥</span>
                        <span className="text-[10px] font-black text-[#ff5a5a]">35.1k</span>
                      </div>
                    </div>

                  </div>

                  {/* Vertical Rankings starting from Rank 4 downwards precisely matching */}
                  <div className="bg-white rounded-[26px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-slate-100 flex flex-col space-y-1 mt-1 pr-3">
                    {[
                      {
                        rank: 4,
                        name: "Sweet Baby 💋",
                        heat: "27.6k",
                        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop"
                      },
                      {
                        rank: 5,
                        name: "ONLYHELP👑mşfèfè",
                        heat: "24.8k",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop"
                      },
                      {
                        rank: 6,
                        name: "shan",
                        heat: "24.6k",
                        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop"
                      },
                      {
                        rank: 7,
                        name: "TUXFIT🏋️",
                        heat: "23.9k",
                        avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop"
                      },
                      {
                        rank: 8,
                        name: "Jhennaaaa✨🌸😍",
                        heat: "22.9k",
                        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop"
                      }
                    ].map((item, idx) => (
                      <div 
                        key={item.rank} 
                        className={`flex items-center justify-between py-2 px-1 hover:bg-slate-50/70 rounded-xl transition-all ${
                          idx !== 4 ? 'border-b border-slate-50' : ''
                        }`}
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
                  <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 -mx-4 -mb-6 mt-3 shadow-[0_-6px_22px_rgba(0,0,0,0.035)] z-20 flex items-center justify-between select-none pb-5.5">
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
                        className="text-[10px] text-[#00cbd6] active:text-[#00adc0] font-black flex items-center gap-0.5 mt-0.5 cursor-pointer select-none leading-none hover:brightness-105"
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
