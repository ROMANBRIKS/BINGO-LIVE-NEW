import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  UserCog, 
  ThumbsUp, 
  Gift, 
  Shirt,
  Crown,
  Info,
  Diamond,
  Heart,
  MessageSquare,
  Bell,
  Mail,
  Zap,
  EyeOff,
  UserPlus,
  ShieldAlert,
  Mic,
  Smartphone,
  Star,
  Ticket,
  Megaphone,
  Sparkles,
  Video,
  Users,
  List,
  Ghost,
  ShieldX,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

type SVIPLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const LionHead = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21c-4.418 0-8-3.582-8-8 0-1.5.4-2.9 1.1-4.1C4.4 7.6 4 6.1 4 4.5 4 3.1 5.1 2 6.5 2c1.6 0 3.1.4 4.4 1.1 1.2-.7 2.6-1.1 4.1-1.1 1.4 0 2.5 1.1 2.5 2.5 0 1.6-.4 3.1-1.1 4.4 1.1 1.2 1.1 2.6 1.1 4.1 0 4.418-3.582 8-8 8z" />
    <path d="M12 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    <path d="M9 16c.5.5 1.2.8 2 .8s1.5-.3 2-.8" />
  </svg>
);

const VIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 4l6 16 6-16" />
  </svg>
);

const Shield3D = ({ level }: { level: number }) => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
    {/* Pedestal */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-white/5 border border-white/10 rounded-lg transform perspective-1000 rotateX-45" />
    
    {/* Shield */}
    <motion.div 
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 w-40 h-40"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700 rounded-[2rem] shadow-2xl border-4 border-gray-400/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        <span className="text-8xl font-black text-white/90 italic tracking-tighter drop-shadow-2xl">S</span>
      </div>
      {/* Level Badge */}
      <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full border-4 border-gray-800 flex items-center justify-center shadow-lg">
        <span className="text-xs font-black text-black">SVIP {level}</span>
      </div>
    </motion.div>
  </div>
);

const Marquee = ({ text }: { text: string }) => (
  <div className="overflow-hidden whitespace-nowrap bg-white/5 py-1 border-y border-white/5">
    <motion.div 
      animate={{ x: [0, -1000] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="inline-block"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-4">{text}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-4">{text}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-4">{text}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-4">{text}</span>
    </motion.div>
  </div>
);

export default function PointsRedemptionPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<SVIPLevel>(1);
  const [selectedPrivilege, setSelectedPrivilege] = useState('account');

  const levels = [
    { id: 1, label: 'SVIP 1', color: 'from-[#004d4d] to-[#001a1a]', accent: 'text-teal-400', glow: 'bg-teal-400/20', shield: 'teal', icon: LionHead },
    { id: 2, label: 'SVIP 2', color: 'from-[#1b4332] to-[#081c15]', accent: 'text-green-400', glow: 'bg-green-400/20', shield: 'green', icon: Crown },
    { id: 3, label: 'SVIP 3', color: 'from-[#023e8a] to-[#001233]', accent: 'text-blue-400', glow: 'bg-blue-400/20', shield: 'blue', icon: Crown },
    { id: 4, label: 'SVIP 4', color: 'from-[#4a3728] to-[#1a120a]', accent: 'text-orange-300', glow: 'bg-orange-300/20', shield: 'gold', icon: Crown },
    { id: 5, label: 'SVIP 5', color: 'from-[#4d0000] to-[#1a0000]', accent: 'text-red-500', glow: 'bg-red-500/20', shield: 'red', icon: Crown },
    { id: 6, label: 'SVIP 6', color: 'from-[#2c3e50] to-[#000000]', accent: 'text-slate-300', glow: 'bg-slate-300/20', shield: 'silver', icon: Crown },
    { id: 7, label: 'SVIP 7', color: 'from-[#001f3f] to-[#000000]', accent: 'text-blue-500', glow: 'bg-blue-500/20', shield: 'diamond', icon: Crown },
    { id: 8, label: 'SVIP 8', color: 'from-[#600000] to-[#000000]', accent: 'text-red-600', glow: 'bg-red-600/20', shield: 'ornate', icon: Crown },
  ];

  const privileges = [
    { id: 'account', icon: Crown, label: 'Account Privileges' },
    { id: 'ban', icon: Lock, label: 'Ban Appeal' },
    { id: 'reset', icon: UserCog, label: 'Reset Information' },
    { id: 'official', icon: ThumbsUp, label: 'Official recommendation' },
    { id: 'gifts', icon: Gift, label: 'Virtual gifts' },
  ];

  const currentLevelData = levels.find(l => l.id === level)!;

  const redemptionCards = [
    { id: 1, icon: MessageSquare, label: 'Africa-Text Ban Appeal', points: 50, levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { id: 2, icon: Bell, label: 'Africa - Push Message-1', points: 150, levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { id: 3, icon: ShieldAlert, label: 'Africa-Post Ban Appeal', points: 100, levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { id: 4, icon: Mail, label: 'Africa-IM-1', points: 200, levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  ];

  const categoryItems: Record<string, any[]> = {
    account: [
      { id: 'a0', icon: Zap, label: 'Auto boost', points: 100, minLevel: 4, maxLevel: 7 },
      { id: 'a1', icon: LionHead, label: 'Africa-Change Family logo', points: 50, minLevel: 1 },
      { id: 'a2', icon: LionHead, label: 'Africa-Change Family Name/Avatar', points: 100, minLevel: 1 },
      { id: 'a11', icon: LionHead, label: 'Change Family Profile', points: 50, minLevel: 1 },
      { id: 'a3', icon: Ticket, label: 'Africa-Recharge Rebate Coupon 15%', points: 250, minLevel: 2 },
      { id: 'a6', icon: Megaphone, label: 'Africa-Share to all (x10)', points: 50, minLevel: 2 },
      { id: 'a4', icon: Ticket, label: 'Africa-Recharge Rebate Coupon 20%', points: 350, minLevel: 3 },
      { id: 'a5', icon: Ticket, label: 'Africa-Recharge Rebate Coupon 30%', points: 450, minLevel: 3 },
      { id: 'a7', icon: Ghost, label: 'Africa-Invisible Profile Visitor', points: 1000, minLevel: 3, maxLevel: 3 },
      { id: 'a8', icon: Sparkles, label: 'Africa-Mysterious Gifter', points: 1000, minLevel: 3, maxLevel: 3 },
      { id: 'a9', icon: ShieldX, label: 'Africa-Anti-Kickout', points: 1000, minLevel: 3, maxLevel: 7 },
      { id: 'a10', icon: Mic, label: 'Africa-Anti-mute', points: 1000, minLevel: 3, maxLevel: 7 },
      { id: 'a12', icon: Smartphone, label: 'Screen Recording', points: 100, minLevel: 3 },
    ],
    ban: [
      { id: 'b1', icon: MessageSquare, label: 'Africa-Text Ban Appeal', points: 50, minLevel: 1 },
      { id: 'b2', icon: ShieldAlert, label: 'Africa-Post Ban Appeal', points: 100, minLevel: 1 },
      { id: 'b3', icon: EyeOff, label: 'Image Ban Appeal', points: 100, minLevel: 2 },
      { id: 'b4', icon: Video, label: 'Live Ban Appeal', points: 50, minLevel: 2 },
    ],
    reset: [
      { id: 'r1', icon: UserPlus, label: 'Africa-BINGO ID Change', points: 50, minLevel: 3 },
      { id: 'r2', icon: Star, label: 'Africa-Fan Medal Change', points: 50, minLevel: 3 },
      { id: 'r3', icon: Zap, label: 'Africa-Remove Beans & contribution list', points: 300, minLevel: 3 },
      { id: 'r4', icon: Users, label: 'Africa-Remove Contribution List', points: 100, minLevel: 3 },
      { id: 'r5', icon: Users, label: 'Africa-Remove Fans', points: 200, minLevel: 3 },
    ],
    official: [
      { id: 'o1', icon: Bell, label: 'Africa - Push Message-1', points: 150, minLevel: 1 },
      { id: 'o2', icon: Mail, label: 'Africa-IM-1', points: 200, minLevel: 1 },
      { id: 'o3', icon: Bell, label: 'Africa - Push Message-2', points: 250, minLevel: 2 },
      { id: 'o4', icon: Mail, label: 'Africa-IM-2', points: 300, minLevel: 2 },
      { id: 'o5', icon: Bell, label: 'Africa - Push Message-3', points: 350, minLevel: 3 },
      { id: 'o6', icon: Mail, label: 'Africa-IM-3', points: 400, minLevel: 3 },
      { id: 'o7', icon: Zap, label: 'Africa-Banner', points: 300, minLevel: 3 },
      { id: 'o8', icon: ThumbsUp, label: 'Africa-Boosting', points: 25, minLevel: 3 },
      { id: 'o9', icon: Smartphone, label: 'Africa-Customized', points: 100, minLevel: 3 },
      { id: 'o10', icon: Smartphone, label: 'Africa-Opening Page', points: 100, minLevel: 3 },
    ],
    gifts: [
      { id: 'g1', icon: Shirt, label: 'Africa-Profile Skin A', points: 800, minLevel: 2 },
      { id: 'g2', icon: Shirt, label: 'Africa-Profile Skin B', points: 1200, minLevel: 3 },
      { id: 'g3', icon: Shirt, label: 'Africa-Profile Skin C', points: 1600, minLevel: 3 },
    ]
  };

  const featuredPrivileges = [
    { id: 'family', icon: LionHead, label: 'Family', minLevel: 1 },
    { id: 'incognito', icon: ShieldCheck, label: 'Incognito', minLevel: 2 },
    { id: 'invisible', icon: Ghost, label: 'Invisible', minLevel: 2 },
    { id: 'gifter', icon: Sparkles, label: 'Gifter', minLevel: 3 },
    { id: 'kickout', icon: ShieldX, label: 'Anti-Kickout', minLevel: 3 },
    { id: 'mute', icon: Mic, label: 'Anti-Mute', minLevel: 3 },
    { id: 'recording', icon: Smartphone, label: 'Recording', minLevel: 3 },
    { id: 'beans', icon: Diamond, label: 'Beans Hider', minLevel: 5 },
    { id: 'spending', icon: Ticket, label: 'Spending Hider', minLevel: 5 },
    { id: 'antimute_elite', icon: Mic, label: 'Anti-Mute Elite', minLevel: 6 },
    { id: 'antikick_elite', icon: ShieldX, label: 'Anti-Kick Elite', minLevel: 7 },
    { id: 'svip8_badge', icon: Crown, label: 'SVIP 8 Badge', minLevel: 8 },
    { id: 'africa_invisible', icon: Ghost, label: 'Africa-Invisible', minLevel: 4 },
    { id: 'africa_gifter', icon: Sparkles, label: 'Africa-Gifter', minLevel: 4 },
    { id: 'africa_kickout', icon: ShieldX, label: 'Africa-Anti-Kickout', minLevel: 8 },
    { id: 'africa_mute', icon: Mic, label: 'Africa-Anti-Mute', minLevel: 8 },
  ];

  const [selectedFeatured, setSelectedFeatured] = useState('family');

  const skins = [
    { id: 'skin-a', name: 'Africa-Profile Skin A', points: 800 },
    { id: 'skin-b', name: 'Africa-Profile Skin B', points: 1200 },
    { id: 'skin-c', name: 'Africa-Profile Skin C', points: 1600 },
  ];

  const filteredRedemptionCards = redemptionCards.filter(card => card.levels.includes(level));

  return (
    <div className="min-h-screen bg-black text-white pb-32 select-none overflow-x-hidden">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-white/80"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-bold">SVIP</h1>
        <div className="flex items-center gap-2">
          <VIcon className="w-6 h-6 text-yellow-500" />
          <List className="w-6 h-6 text-white/80" />
        </div>
      </header>

      <div className="px-4 space-y-8">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center border-2 border-white/20">
            <span className="text-2xl font-bold">D</span>
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold tracking-tight">Dark Matters2.o</h2>
            <p className="text-sm text-white/40">You are not an SVIP yet</p>
          </div>
        </div>

        {/* Shield Section */}
        <div className="relative py-8">
          <Shield3D level={level} />
          <div className="text-center mt-4">
            <h3 className="text-4xl font-black italic tracking-tighter">SVIP {level}</h3>
          </div>
        </div>

        {/* Level Progress */}
        <div className="relative px-4">
          <div className="absolute left-0 right-0 h-[2px] bg-white/5 top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-white/20 to-white/40 transition-all duration-500" 
              style={{ width: `${((level - 1) / 7) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <button onClick={() => setLevel(1)} className="flex flex-col items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full transition-all", level >= 1 ? "bg-white shadow-[0_0_8px_white]" : "bg-white/10")} />
              <span className={cn("text-[9px] font-black transition-colors", level >= 1 ? "text-white" : "text-white/20")}>0</span>
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((l, i) => {
              const filters = [
                'sepia(1) saturate(3) hue-rotate(-30deg) brightness(0.7)', // 1: Bronze
                'grayscale(1) brightness(1.2)', // 2: Silver
                'sepia(1) saturate(6) hue-rotate(5deg) brightness(1.2)', // 3: Gold
                'hue-rotate(110deg) saturate(2.5)', // 4: Emerald
                'hue-rotate(310deg) saturate(4)', // 5: Ruby
                'saturate(3)', // 6: Sapphire
                'hue-rotate(240deg) saturate(3)', // 7: Amethyst
                'brightness(1.5) grayscale(1)', // 8: White Diamond
              ];
              const filter = filters[i];
              const isActive = level >= l;
              
              return (
                <button key={l} onClick={() => setLevel(l as SVIPLevel)} className="flex flex-col items-center gap-2 group">
                  <div className="relative">
                    {isActive && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 blur-xl opacity-40 rounded-full"
                        style={{ background: 'white', filter: filter }}
                      />
                    )}
                    <motion.div 
                      className={cn(
                        "w-8 h-8 flex items-center justify-center transition-all duration-300 relative z-10 text-xl",
                        isActive ? "scale-125" : "scale-90 opacity-20 grayscale"
                      )}
                      animate={isActive ? {
                        filter: [filter, `${filter} brightness(1.5)`, filter],
                        scale: [1.25, 1.35, 1.25]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span style={{ filter: isActive ? filter : 'grayscale(1)' }}>💎</span>
                    </motion.div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black transition-all duration-300",
                    isActive ? "text-white scale-110" : "text-white/20"
                  )}>
                    {l}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upgrade Prompt */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-[11px] font-medium leading-relaxed">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-black uppercase mr-2">Locked</span>
            Top up 💎 <span className="text-white font-bold">
              {level === 1 ? '12000' : level === 2 ? '30000' : level === 3 ? '60000' : level === 4 ? '120000' : level === 5 ? '300000' : level === 6 ? '600000' : level === 7 ? '1200000' : '2400000'}
            </span> and send 💖 <span className="text-white font-bold">
              {level === 1 ? '8000' : level === 2 ? '20000' : level === 3 ? '40000' : level === 4 ? '60000' : level === 5 ? '200000' : level === 6 ? '400000' : level === 7 ? '800000' : '1600000'}
            </span> within 30 days to upgrade <span className="text-white font-bold">Become SVIP</span> <ChevronRight size={12} className="inline" />
          </p>
        </div>

        {/* Points Redemption Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight">Points Redemption <span className="text-yellow-500">SVIP {level} Exclu</span></h2>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 shrink-0">
            {privileges.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrivilege(p.id)}
                className="flex flex-col items-center gap-2 shrink-0 transition-all duration-300"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                  selectedPrivilege === p.id ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
                )}>
                  <p.icon size={24} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold text-center w-20 leading-tight",
                  selectedPrivilege === p.id ? "text-white" : "text-white/40"
                )}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
          
          {/* Grid Content */}
          <div className="grid grid-cols-2 gap-3">
            {(categoryItems[selectedPrivilege] || [])
              .filter(card => !card.maxLevel || level <= card.maxLevel)
              .map((card, index) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl relative overflow-hidden",
                  card.minLevel > level && "opacity-40 grayscale"
                )}
              >
                {card.minLevel > level && (
                  <div className="absolute top-2 right-2">
                    <Lock size={12} className="text-white/40" />
                  </div>
                )}
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-white/60">
                  <card.icon size={48} />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-[11px] font-bold text-white/80 leading-tight h-8 flex items-center justify-center">{card.label}</h3>
                  <p className="text-[10px] font-medium text-white/40">
                    <span className="text-yellow-500 font-black">{card.points}</span> points per time
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Account Privileges Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight italic">Account Privileges <span className="text-yellow-500">SVIP {level} Exclusive</span></h2>
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <span>View All</span>
              <ChevronRight size={10} />
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar shrink-0">
            {featuredPrivileges
              .filter(p => p.minLevel <= level)
              .map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedFeatured(p.id)}
                className="flex flex-col items-center gap-2 shrink-0 transition-all duration-300"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                  selectedFeatured === p.id ? "bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-white/5 text-white/40"
                )}>
                  <p.icon size={24} />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-b from-[#121212] to-black border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
            <div className="relative w-full aspect-video bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-1 bg-white/20 h-px absolute left-0 right-0 top-1/2 -translate-y-1/2" />
                <span className="bg-black/40 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-[10px] font-black tracking-widest uppercase">
                  {selectedFeatured} Privileges
                </span>
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center">
                  {featuredPrivileges.find(p => p.id === selectedFeatured)?.icon({ size: 64, className: "text-yellow-500/40" })}
                </div>
              </div>
            </div>
            <p className="text-sm font-bold text-white/60 italic">Enjoy your exclusive SVIP{level} privileges!</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-8 pb-12 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">
            All rights of interpretation belong to BINGO LIVE
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium text-white/60">
            Top up 💎 <span className="text-yellow-500 font-black">
              {level === 1 ? '12000' : level === 2 ? '30000' : level === 3 ? '60000' : level === 4 ? '120000' : level === 5 ? '300000' : level === 6 ? '600000' : level === 7 ? '1200000' : '2400000'}
            </span> more to upgrade to SVIP {level}
          </p>
        </div>
        <button className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-6 py-3 rounded-full text-sm font-black shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 transition-transform">
          Top Up to Be SVIP
        </button>
      </div>
    </div>
  );
}
