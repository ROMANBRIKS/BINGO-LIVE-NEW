import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Search, Users, Crown, Shield, Trophy, Star, 
  TrendingUp, Sparkles, Plus, Flame, ChevronDown, Check, Info, X, ChevronRight, HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FamilyDetailsPopup } from '../components/FamilyDetailsPopup';
import FamilyCreationCriteria from '../components/FamilyCreationCriteria';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Custom replicated highly polished Lion Head SVG component as requested
const LionHeadIcon = ({ size = 21, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("text-[#eebd41]", className)}
  >
    <path d="M12 3 L16 6 L20 5 L18 10 L21 11 L19 14 L18 19 L12 21 L6 19 L5 14 L3 11 L6 10 L4 5 L8 6 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M8 12 C9 10, 15 10, 16 12" />
    <path d="M10 14 C11 14.5, 13 14.5, 14 14" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
    <path d="M12 2 L12 6" />
    <path d="M3 11 L7 11" />
    <path d="M21 11 L17 11" />
  </svg>
);

// Custom replicated highly polished Sheet of Paper SVG component as requested
const SheetOfPaperIcon = ({ size = 21, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("text-[#eebd41]", className)}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.1" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

// Types for our high fidelity leaderboard
interface LeaderboardFamily {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  members: string;
  points: string;
  combatPointsVal: number;
  tier: string;
  theme: 'gold' | 'silver' | 'bronze' | 'blue' | 'standard';
  description: string;
  memberCount: number;
  memberLimit: number;
  monthlyPoints: number;
  monthlyTarget: number;
}

// Data from Screenshot 1 & 2 translated to the core
const PRESTIGE_FAMILIES: LeaderboardFamily[] = [
  {
    id: 'ijoba_prestige',
    rank: 1,
    name: 'Ijoba Federal NG',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    members: '452/500',
    points: '508.3K',
    combatPointsVal: 508300,
    tier: 'Challenger III',
    theme: 'gold',
    description: 'LIBRA FEDERAL AGENCY AND FAMILY. UNITY IS OUR COGNITIVE STRENGTH.',
    memberCount: 452,
    memberLimit: 500,
    monthlyPoints: 85300,
    monthlyTarget: 100000
  },
  {
    id: 'vibez_prestige',
    rank: 2,
    name: 'Vibez☀️',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
    members: '490/500',
    points: '504.9K',
    combatPointsVal: 504900,
    tier: 'Challenger III',
    theme: 'silver',
    description: 'VIBEZ ONLY! BRINGING THE SUNSHINE TO BINGO LIVE SINCE DAY ONE.',
    memberCount: 490,
    memberLimit: 500,
    monthlyPoints: 92400,
    monthlyTarget: 100000
  },
  {
    id: 'steppa_prestige',
    rank: 3,
    name: 'BIG STEPPA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    members: '380/500',
    points: '380.9K',
    combatPointsVal: 380900,
    tier: 'Challenger III',
    theme: 'bronze',
    description: 'TAKING BIG STEPS IN BINGO LIVE. WE STEP, WE CONQUER.',
    memberCount: 380,
    memberLimit: 500,
    monthlyPoints: 61500,
    monthlyTarget: 80000
  },
  {
    id: 'joy_prestige',
    rank: 4,
    name: 'Joy and Love',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
    members: '481/500',
    points: '275.2K',
    combatPointsVal: 275200,
    tier: 'Challenger III',
    theme: 'standard',
    description: 'SPREADING JOY AND LOVE WHEREVER WE STREAM. SISTERHOOD AND BROTHERHOOD.',
    memberCount: 481,
    memberLimit: 500,
    monthlyPoints: 49000,
    monthlyTarget: 60000
  },
  {
    id: 'john_prestige',
    rank: 5,
    name: 'JOHN WICK FAMILY',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200',
    members: '247/350',
    points: '237.7K',
    combatPointsVal: 237700,
    tier: 'Challenger II',
    theme: 'standard',
    description: 'WE DO NOT PLAY. YOU MESS WITH THE DOG, YOU DEAL WITH THE FAMILY.',
    memberCount: 247,
    memberLimit: 350,
    monthlyPoints: 37200,
    monthlyTarget: 50000
  },
  {
    id: 'house_prestige',
    rank: 6,
    name: 'House of Wolves',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
    members: '312/500',
    points: '209.5K',
    combatPointsVal: 209500,
    tier: 'Challenger III',
    theme: 'standard',
    description: 'THE STRENGTH OF THE PACK IS THE WOLF, AND THE STRENGTH OF THE WOLF IS THE PACK.',
    memberCount: 312,
    memberLimit: 500,
    monthlyPoints: 34500,
    monthlyTarget: 50000
  },
  {
    id: 'rich_gang_prestige',
    rank: 7,
    name: 'Rich Gang',
    avatar: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=200',
    members: '45/100',
    points: '85.3K',
    combatPointsVal: 85300,
    tier: 'Bronze I',
    theme: 'standard',
    description: 'BRONZE ONE REBEL EMPIRE. SLENDER BUT SPARKING.',
    memberCount: 45,
    memberLimit: 100,
    monthlyPoints: 12500,
    monthlyTarget: 20000
  }
];

const COMBAT_FAMILIES_DATA: LeaderboardFamily[] = [
  {
    id: 'vibez_combat',
    rank: 1,
    name: 'Vibez☀️',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
    members: '490/500',
    points: '239.6M',
    combatPointsVal: 239600000,
    tier: 'Challenger III',
    theme: 'gold',
    description: 'VIBEZ ONLY! BRINGING THE SUNSHINE TO BINGO LIVE SINCE DAY ONE.',
    memberCount: 490,
    memberLimit: 500,
    monthlyPoints: 38500000,
    monthlyTarget: 50000000
  },
  {
    id: 'ballers_combat',
    rank: 2,
    name: 'BALLERS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    members: '422/500',
    points: '160.4M',
    combatPointsVal: 160400000,
    tier: 'Challenger III',
    theme: 'silver',
    description: 'THE BIG GAME BALLERS. HIGH GIVERS, STRONG STREAMERS, NO MERCY IN FIGHTS.',
    memberCount: 422,
    memberLimit: 500,
    monthlyPoints: 24700000,
    monthlyTarget: 40000000
  },
  {
    id: 'royal_combat',
    rank: 3,
    name: 'RÖYÄL LIONS',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200',
    members: '310/350',
    points: '69.3M',
    combatPointsVal: 69300000,
    tier: 'Challenger III',
    theme: 'bronze',
    description: 'THE ROYAL PRIDE OF LIONS. LEADERS OF THE JUNGLE, DOMINATING COMBAT DAILY.',
    memberCount: 310,
    memberLimit: 350,
    monthlyPoints: 11200000,
    monthlyTarget: 20000000
  },
  {
    id: 'joy_combat',
    rank: 4,
    name: 'Joy and Love',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
    members: '481/500',
    points: '68.4M',
    combatPointsVal: 68400000,
    tier: 'Challenger III',
    theme: 'standard',
    description: 'SPREADING JOY AND LOVE WHEREVER WE STREAM. SISTERHOOD AND BROTHERHOOD.',
    memberCount: 481,
    memberLimit: 500,
    monthlyPoints: 9800000,
    monthlyTarget: 15000000
  },
  {
    id: 'mercury_combat',
    rank: 5,
    name: 'Mercury',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
    members: '210/500',
    points: '64.8M',
    combatPointsVal: 64800000,
    tier: 'Challenger III',
    theme: 'standard',
    description: 'FAST AS MERCURY, STRONG AS STEEL. CONQUERING ALL CHALLENGERS.',
    memberCount: 210,
    memberLimit: 500,
    monthlyPoints: 8100000,
    monthlyTarget: 12000000
  },
  {
    id: 'ijoba_combat',
    rank: 6,
    name: 'Ijoba Federal NG',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    members: '452/500',
    points: '51.6M',
    combatPointsVal: 51600000,
    tier: 'Challenger III',
    theme: 'standard',
    description: 'LIBRA FEDERAL AGENCY AND FAMILY. UNITY IS OUR COGNITIVE STRENGTH.',
    memberCount: 452,
    memberLimit: 500,
    monthlyPoints: 7200000,
    monthlyTarget: 10000000
  },
  {
    id: 'rich_gang_combat',
    rank: 7,
    name: 'Rich Gang',
    avatar: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=200',
    members: '45/100',
    points: '20.3M',
    combatPointsVal: 20300000,
    tier: 'Bronze I',
    theme: 'standard',
    description: 'BRONZE ONE REBEL EMPIRE. SLENDER BUT SPARKING.',
    memberCount: 45,
    memberLimit: 100,
    monthlyPoints: 3100000,
    monthlyTarget: 5000000
  }
];

export default function FamilyLeaderboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  // Real-time Firestore families state
  const [dbFamilies, setDbFamilies] = useState<any[]>([]);
  const [showCriteria, setShowCriteria] = useState(false);
  
  useEffect(() => {
    // Sync with Firestore families in real-time
    const q = collection(db, 'families');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDbFamilies(list);
    }, (err) => {
      console.error("Error fetching db families:", err);
    });
    return () => unsubscribe();
  }, []);

  const mergedPrestige = useMemo(() => {
    const baseList = PRESTIGE_FAMILIES.map((f) => {
      let region = 'North America'; // Fallback
      if (f.name.includes('Ijoba') || f.name.includes('Starlite') || f.name.includes('RÖYÄL')) region = 'Africa';
      else if (f.name.includes('Vibez') || f.name.includes('WALASCITY') || f.name.includes('john') || f.name.includes('J0HN') || f.name.includes('House')) region = 'Europe';
      else if (f.name.includes('Joy')) region = 'Caribbean';
      
      const dbMatch = dbFamilies.find(dbF => dbF.id === f.id || dbF.name === f.name);
      return {
        ...f,
        region,
        avatar: dbMatch?.badge || dbMatch?.avatar || f.avatar,
        combatPointsVal: dbMatch?.combatPoints || f.combatPointsVal,
        points: dbMatch?.totalDiamondsSpent ? (dbMatch.totalDiamondsSpent / 1000).toFixed(1) + 'K' : f.points, // If prestige
        description: dbMatch?.description || f.description,
        ownerUid: dbMatch?.ownerUid || (f.name === 'Joy and Love' ? 'DEFAULT_USER_ID' : `${f.id}_owner`)
      };
    });

    // Add any customized created families in Firestore
    dbFamilies.forEach((dbF) => {
      const exists = baseList.some(item => item.id === dbF.id || item.name === dbF.name);
      if (!exists) {
        baseList.push({
          id: dbF.id,
          rank: 99,
          name: dbF.name,
          avatar: dbF.badge || dbF.avatar || 'https://img.icons8.com/color/96/sword.png',
          members: `${dbF.memberCount || 1}/${dbF.memberLimit || 100}`,
          points: dbF.totalDiamondsSpent > 1000 ? `${(dbF.totalDiamondsSpent/1000).toFixed(1)}K` : '0',
          combatPointsVal: dbF.combatPoints || 0,
          tier: dbF.tier || 'Bronze',
          theme: 'standard',
          description: dbF.description || 'Our family tribe',
          memberCount: dbF.memberCount || 1,
          memberLimit: dbF.memberLimit || 100,
          monthlyPoints: dbF.monthlyPoints || 0,
          monthlyTarget: dbF.monthlyTarget || 100000,
          region: dbF.region || 'North America',
          ownerUid: dbF.ownerUid
        });
      }
    });

    const sorted = [...baseList].sort((a, b) => b.combatPointsVal - a.combatPointsVal);
    return sorted.map((f, index) => {
      const regionList = sorted.filter(item => item.region === f.region);
      const regionRank = regionList.findIndex(item => item.id === f.id) + 1;
      return {
        ...f,
        rank: index + 1,
        globalRank: index + 1,
        regionRank
      };
    });
  }, [dbFamilies]);

  const mergedCombat = useMemo(() => {
    const baseList = COMBAT_FAMILIES_DATA.map((f) => {
      let region = 'North America';
      if (f.name.includes('Ijoba') || f.name.includes('Starlite') || f.name.includes('RÖYÄL')) region = 'Africa';
      else if (f.name.includes('Vibez') || f.name.includes('WALASCITY') || f.name.includes('john') || f.name.includes('J0HN') || f.name.includes('House')) region = 'Europe';
      else if (f.name.includes('Joy')) region = 'Caribbean';

      const dbMatch = dbFamilies.find(dbF => dbF.id === f.id || dbF.name === f.name);
      return {
        ...f,
        region,
        avatar: dbMatch?.badge || dbMatch?.avatar || f.avatar,
        combatPointsVal: dbMatch?.combatPoints || f.combatPointsVal,
        points: dbMatch?.combatPoints ? (dbMatch.combatPoints / 1000000).toFixed(1) + 'M' : f.points, // If combat
        description: dbMatch?.description || f.description,
        ownerUid: dbMatch?.ownerUid || (f.name === 'Joy and Love' ? 'DEFAULT_USER_ID' : `${f.id}_owner`)
      };
    });

    dbFamilies.forEach((dbF) => {
      const exists = baseList.some(item => item.id === dbF.id || item.name === dbF.name);
      if (!exists) {
        baseList.push({
          id: dbF.id,
          rank: 99,
          name: dbF.name,
          avatar: dbF.badge || dbF.avatar || 'https://img.icons8.com/color/96/sword.png',
          members: `${dbF.memberCount || 1}/${dbF.memberLimit || 100}`,
          points: dbF.combatPoints > 1000000 ? `${(dbF.combatPoints/1000000).toFixed(1)}M` : '0',
          combatPointsVal: dbF.combatPoints || 0,
          tier: dbF.tier || 'Bronze',
          theme: 'standard',
          description: dbF.description || 'Our family tribe',
          memberCount: dbF.memberCount || 1,
          memberLimit: dbF.memberLimit || 100,
          monthlyPoints: dbF.monthlyPoints || 0,
          monthlyTarget: dbF.monthlyTarget || 100000,
          region: dbF.region || 'North America',
          ownerUid: dbF.ownerUid
        });
      }
    });

    const sorted = [...baseList].sort((a, b) => b.combatPointsVal - a.combatPointsVal);
    return sorted.map((f, index) => {
      const regionList = sorted.filter(item => item.region === f.region);
      const regionRank = regionList.findIndex(item => item.id === f.id) + 1;
      return {
        ...f,
        rank: index + 1,
        globalRank: index + 1,
        regionRank
      };
    });
  }, [dbFamilies]);
  
  // Tab handling
  const [activeTab, setActiveTab] = useState<'prestige' | 'combat'>('prestige');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tooltip guide handler (auto-destructs after 5 seconds)
  const [showTealTooltip, setShowTealTooltip] = useState(true);
  
  // Selected family details modal trigger
  const [selectedFamily, setSelectedFamily] = useState<any | null>(null);
  
  // Dynamic joins list tracking
  const [pendingJoins, setPendingJoins] = useState<string[]>([]);

  useEffect(() => {
    // Tooltip timer of exactly 5 seconds
    const timer = setTimeout(() => {
      setShowTealTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Filter list based on search
  const currentData = activeTab === 'prestige' ? mergedPrestige : mergedCombat;

  const myFamily = useMemo(() => {
    if (profile?.familyId) {
      const match = currentData.find(f => f.id === profile.familyId);
      if (match) return match;
    }
    if (user?.uid) {
      const match = currentData.find(f => f.ownerUid === user.uid);
      if (match) return match;
    }
    // Default user is "Joy and Love" so they can immediately test controls
    const backup = currentData.find(f => f.name === 'Joy and Love');
    if (backup) {
      return { ...backup, ownerUid: user?.uid || 'DEFAULT_USER_ID' };
    }
    return null;
  }, [currentData, profile, user]);

  const filteredData = currentData.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Divide into podium vs rest
  const top3 = filteredData.length >= 3 ? filteredData.slice(0, 3) : currentData.slice(0, 3);
  const restList = filteredData.length > 3 ? filteredData.slice(3) : filteredData;

  const handleJoinClick = (familyId: string, name: string) => {
    if (pendingJoins.includes(familyId)) return;
    setPendingJoins(prev => [...prev, familyId]);
    
    // Auto popup response toast-like feedback
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#00d2c4] text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-2xl z-[9999] opacity-0 transition-all duration-300 transform translate-y-2 flex items-center gap-2';
    toast.innerHTML = `<span class="bg-white/20 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-white"><path d="M20 6 9 17l-5-5"/></svg></span> Joined pending list! Application sent to ${name}.`;
    document.body.appendChild(toast);
    
    // animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    // animate out
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 10px)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col select-none font-sans relative pb-10">
      
      {/* 1. Header Row */}
      <header className="bg-white px-4 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/profile')} 
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
            id="back-btn"
          >
            <ChevronLeft size={28} />
          </button>
          <span className="ml-4 text-[17px] font-black text-slate-850 tracking-tight">Family activities</span>
        </div>

        {/* Right tools: Custom Replicated Lion Head and Sheet of Paper as requested */}
        <div className="flex items-center gap-3.5 pr-1">
          <button 
            onClick={() => navigate('/tasks')} 
            className="text-[#eebd41] hover:text-[#d97706] active:scale-95 transition-all p-1"
            title="Rules Sheet of Paper"
          >
            <SheetOfPaperIcon size={22} />
          </button>
          <button 
            onClick={() => setShowCriteria(true)} 
            className="text-[#eebd41] hover:text-[#d97706] active:scale-95 transition-all p-1"
            title="Criteria of family creation"
          >
            <LionHeadIcon size={22} className="animate-pulse" />
          </button>
        </div>
      </header>

      {/* 2. Banner Area */}
      <div className="p-4" id="banner-section">
        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#922415] via-[#cf3d2c] to-[#922415] aspect-[21/9] flex items-center justify-center p-6 shadow-md border-b-4 border-[#b02213]">
          
          {/* Animated Stars & Decorative Pillar Graphics */}
          <div className="absolute inset-0 opacity-15 overflow-hidden">
            <div className="absolute -left-10 top-0 h-full w-24 bg-white/40 blur-xl transform skew-x-12 animate-pulse" />
            <div className="absolute -right-10 bottom-0 h-full w-24 bg-white/40 blur-xl transform skew-x-12 animate-pulse" />
          </div>

          <div className="absolute top-2 right-4 text-white/50 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
            <Sparkles size={10} className="text-yellow-400" />
            <span>Active Season 3</span>
          </div>

          {/* Premium Logo Column Graphic Clone */}
          <div className="flex flex-col items-center text-center z-10 relative">
            <div className="w-11 h-11 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg border border-amber-200">
              <Crown className="text-slate-900 drop-shadow-sm" size={24} fill="currentColor" />
            </div>
            
            <h1 className="mt-2 text-2xl font-black italic tracking-widest text-[#fde047] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              FAMiLY
            </h1>
            <p className="text-[15px] font-bold tracking-[0.25em] text-white uppercase -mt-1 drop-shadow-md">
              LEADERBOARD
            </p>
          </div>
        </div>
      </div>

      {/* 3. List Section Header and Search Input */}
      <div className="px-4 py-2" id="family-list-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Orange bar on left */}
            <div className="w-1 h-5 bg-[#f08c33] rounded-full" />
            <span className="font-black text-[16px] text-slate-900">Family List</span>
          </div>

          {/* Clean Real Search Box */}
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="search Family"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs text-slate-800 pl-8 pr-2.5 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#f08c33] transition-colors font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Dynamic Capsule Tab Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button 
            onClick={() => setActiveTab('prestige')}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-sm",
              activeTab === 'prestige' 
                ? "bg-[#f08c33] text-white shadow-[#f08c33]/20" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200/60"
            )}
          >
            Family Prestige
          </button>
          <button 
            onClick={() => setActiveTab('combat')}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-sm",
              activeTab === 'combat' 
                ? "bg-[#f08c33] text-white shadow-[#f08c33]/20" 
                : "bg-slate-100 text-slate-500 hover:bg-slate-200/60"
            )}
          >
            Combat Ranking
          </button>
        </div>
      </div>

      {/* 4. Podium Area (Top 3 Ribbons) with Guidance Tooltip popup */}
      <div className="mt-4 px-2 py-4 relative" id="podium-area">
        
        {/* Row containing My Group capsule and "more >" button on the same line */}
        <div className="absolute top-0 inset-x-0 px-4 flex items-center justify-between z-35 select-none">
          {myFamily ? (
            <button
              onClick={() => setSelectedFamily(myFamily)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-full px-3 py-1.5 font-sans text-[11px] tracking-wide cursor-pointer transition-all active:scale-95 text-slate-700 max-w-[70%]"
              id="my-group-pill"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden border border-[#f08c33]/40 flex-shrink-0 bg-slate-100 flex items-center justify-center">
                {myFamily.avatar ? (
                  <img src={myFamily.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-[#f08c33]">🏆</div>
                )}
              </div>
              <span className="font-black text-slate-800 tracking-tight truncate">{myFamily.name}</span>
              <div className="h-2.5 w-[1px] bg-slate-200" />
              <span className="text-[10px] text-[#f08c33] font-black flex items-center gap-1">
                <span>G: #{myFamily.globalRank}</span>
                <span className="text-slate-300">•</span>
                <span>R: #{myFamily.regionRank}</span>
              </span>
            </button>
          ) : (
            <div /> // Spacer
          )}

          <button
            onClick={() => navigate('/family-list')} 
            className="text-[12px] font-bold text-slate-400 hover:text-[#f08c33] transition-colors flex items-center gap-0.5 cursor-pointer select-none active:scale-95"
            id="more-btn"
          >
            <span>more</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Teal POPUP dynamic guidance tooltip */}
        <AnimatePresence>
          {showTealTooltip && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              onClick={() => setShowTealTooltip(false)}
              className="absolute left-1/2 -translate-x-1/2 top-[-25px] w-[88%] bg-[#00d2c4] text-white px-4 py-3 rounded-2xl shadow-xl z-55 flex items-start gap-2.5 cursor-pointer select-none border border-teal-300/10"
              id="guide-tooltip"
            >
              <div className="flex-1 text-[11px] font-bold leading-normal text-white">
                Tap the family avatar to view family details and tap the plus button to apply joining the family
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTealTooltip(false); }} 
                className="text-white/60 hover:text-white p-0.5"
              >
                <X size={15} />
              </button>
              {/* Tooltip triangle indicator */}
              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#00d2c4] rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Podium Side-by-Side Flex */}
        <div className="flex items-end justify-center gap-1.5 md:gap-3 max-w-[420px] mx-auto mt-6">
          
          {/* ======================================================== */}
          {/* TOP 2 PODIUM (BLUE RIBBON SCROLL) */}
          {/* ======================================================== */}
          {top3[1] && (
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="relative w-full aspect-[2/3.8] bg-gradient-to-b from-[#7cb6f4] via-[#3a91e8] to-[#1e58bb] rounded-[18px] flex flex-col justify-between items-center px-1.5 py-3 shadow-[0_4px_12px_rgba(30,88,187,0.3)] border border-blue-400 overflow-hidden text-center cursor-pointer transform hover:scale-102 active:scale-98 transition-transform"
                onClick={() => setSelectedFamily(top3[1])}
              >
                {/* Angel Wings / Top design decor */}
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-blue-300/30 to-transparent pointer-events-none" />
                <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-white/40" />
                
                {/* Diamond Star header */}
                <div className="flex flex-col items-center">
                  <Star size={13} className="text-white fill-white" />
                  <span className="text-[10px] font-black text-white/95 tracking-tighter mt-1 uppercase">TOP2</span>
                </div>

                {/* Avatar circle */}
                <div className="w-13 h-13 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md my-1.5">
                  <img src={top3[1].avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="w-full flex-grow flex flex-col justify-end items-center">
                  <h3 className="text-[11px] font-black text-white truncate max-w-full leading-tight uppercase px-0.5">
                    {top3[1].name}
                  </h3>
                  
                  {/* Level text */}
                  <span className="text-[9px] font-black italic text-red-100 flex items-center justify-center gap-0.5 mt-0.5">
                    <Flame size={9} fill="currentColor" className="text-red-300" />
                    {top3[1].tier}
                  </span>

                  {/* Points Box */}
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-300">
                    <Flame size={11} fill="currentColor" />
                    <span className="text-[11px] font-black leading-none">{top3[1].points}</span>
                    <ChevronDown size={10} className="text-white/60 ml-0.5" />
                  </div>
                </div>

                {/* Round Plus/Check button overlapping bottom */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinClick(top3[1].id, top3[1].name);
                  }}
                  className={cn(
                    "absolute bottom-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transform hover:scale-110 active:scale-90 transition-all z-20 border",
                    pendingJoins.includes(top3[1].id)
                      ? "bg-emerald-500 border-white text-white"
                      : "bg-white border-blue-400 text-slate-800"
                  )}
                >
                  {pendingJoins.includes(top3[1].id) ? <Check size={13} strokeWidth={3} /> : <Plus size={15} strokeWidth={3} />}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOP 1 PODIUM (GOLD / ROYAL LION SCROLL) - TALLER IN CENTER */}
          {/* ======================================================== */}
          {top3[0] && (
            <div className="flex-1 flex flex-col items-center scale-103 -translate-y-1.5">
              <div 
                className="relative w-full aspect-[2/3.5] bg-gradient-to-b from-[#eebd41] via-[#c68925] to-[#995311] rounded-[20px] flex flex-col justify-between items-center px-1.5 py-4 shadow-[0_8px_20px_rgba(153,83,17,0.4)] border-2 border-amber-300 overflow-hidden text-center cursor-pointer transform hover:scale-102 active:scale-98 transition-transform"
                onClick={() => setSelectedFamily(top3[0])}
              >
                {/* Crown glow & Lion face decor base */}
                <div className="absolute top-0 inset-x-0 h-11 bg-gradient-to-b from-amber-200/50 via-amber-300/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-yellow-400/10 pointer-events-none blur-md" />
                
                {/* Glowing Crown header */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Crown size={18} className="text-yellow-200 fill-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] animate-bounce" />
                    <Star size={7} className="text-white fill-white absolute bottom-[-4px] left-[-3px]" />
                  </div>
                  <span className="text-[12px] font-black text-amber-100 tracking-wider uppercase mt-1">TOP1</span>
                </div>

                {/* Avatar circle */}
                <div className="w-15 h-15 rounded-full border-2 border-yellow-300 bg-slate-200 overflow-hidden shadow-lg my-1">
                  <img src={top3[0].avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="w-full flex-grow flex flex-col justify-end items-center">
                  <h3 className="text-[12px] font-black text-white truncate max-w-full leading-tight uppercase px-1">
                    {top3[0].name}
                  </h3>
                  
                  {/* Level text */}
                  <span className="text-[10px] font-black italic text-red-100 flex items-center justify-center gap-0.5 mt-0.5">
                    <Flame size={10} fill="currentColor" className="text-red-300" />
                    {top3[0].tier}
                  </span>

                  {/* Points Box */}
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-300">
                    <Flame size={12} fill="currentColor" />
                    <span className="text-[12px] font-black leading-none">{top3[0].points}</span>
                    <ChevronDown size={10} className="text-white/60 ml-0.5" />
                  </div>
                </div>

                {/* Lion icon or decors near bottom list */}
                <div className="opacity-15 absolute bottom-8 font-[900] text-3xl select-none text-amber-100 italic pointer-events-none">
                  👑
                </div>

                {/* Round Plus button overlapping bottom */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinClick(top3[0].id, top3[0].name);
                  }}
                  className={cn(
                    "absolute bottom-2.5 w-7.5 h-7.5 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-90 transition-all z-20 border",
                    pendingJoins.includes(top3[0].id)
                      ? "bg-emerald-500 border-white text-white"
                      : "bg-white border-yellow-400 text-slate-800"
                  )}
                >
                  {pendingJoins.includes(top3[0].id) ? <Check size={14} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOP 3 PODIUM (COPPER / ROSE RIBBON SCROLL) */}
          {/* ======================================================== */}
          {top3[2] && (
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="relative w-full aspect-[2/3.8] bg-gradient-to-b from-[#e5a085] via-[#bd6c55] to-[#803e2c] rounded-[18px] flex flex-col justify-between items-center px-1.5 py-3 shadow-[0_4px_12px_rgba(128,62,44,0.3)] border border-orange-300 overflow-hidden text-center cursor-pointer transform hover:scale-102 active:scale-98 transition-transform"
                onClick={() => setSelectedFamily(top3[2])}
              >
                {/* Copper wings decor / Top background */}
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-orange-200/30 to-transparent pointer-events-none" />
                
                {/* Shield design header */}
                <div className="flex flex-col items-center">
                  <Trophy size={13} className="text-white fill-white/10" />
                  <span className="text-[10px] font-black text-white/95 tracking-tighter mt-1 uppercase">TOP3</span>
                </div>

                {/* Avatar circle */}
                <div className="w-13 h-13 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md my-1.5">
                  <img src={top3[2].avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="w-full flex-grow flex flex-col justify-end items-center">
                  <h3 className="text-[11px] font-black text-white truncate max-w-full leading-tight uppercase px-0.5">
                    {top3[2].name}
                  </h3>
                  
                  {/* Level text */}
                  <span className="text-[9px] font-black italic text-red-100 flex items-center justify-center gap-0.5 mt-0.5">
                    <Flame size={9} fill="currentColor" className="text-red-300" />
                    {top3[2].tier}
                  </span>

                  {/* Points Box */}
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-300">
                    <Flame size={11} fill="currentColor" />
                    <span className="text-[11px] font-black leading-none">{top3[2].points}</span>
                    <ChevronDown size={10} className="text-white/60 ml-0.5" />
                  </div>
                </div>

                {/* Round Plus button overlapping bottom */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinClick(top3[2].id, top3[2].name);
                  }}
                  className={cn(
                    "absolute bottom-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transform hover:scale-110 active:scale-90 transition-all z-20 border",
                    pendingJoins.includes(top3[2].id)
                      ? "bg-emerald-500 border-white text-white"
                      : "bg-white border-orange-400 text-slate-800"
                  )}
                >
                  {pendingJoins.includes(top3[2].id) ? <Check size={13} strokeWidth={3} /> : <Plus size={15} strokeWidth={3} />}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 5. Remaining Families List (Starting from Rank 4) */}
      <div className="px-3 pb-24 mt-4" id="list-section">
        {restList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Info className="mx-auto text-slate-400 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching families found</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-w-[440px] mx-auto">
            {restList.map((family) => {
              const hasJoined = pendingJoins.includes(family.id);
              
              return (
                <div 
                  key={family.id} 
                  className="bg-white rounded-[22px] p-3 flex items-center justify-between border border-gray-100 hover:border-[#f08c33]/30 hover:bg-slate-50/50 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all group active:scale-[0.99]"
                  onClick={() => setSelectedFamily(family)}
                >
                  
                  {/* Left rank & Avatar info inside the row */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    
                    {/* Rank Number Column */}
                    <span className="text-[17px] font-black italic text-slate-400/85 w-6 text-center select-none">
                      {family.rank}
                    </span>

                    {/* Highly Precise Golden Hexagon Avatar Container! */}
                    <div className="relative flex-shrink-0 w-[54px] h-[54px] flex items-center justify-center">
                      {/* Hexagon Border Graphics */}
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-amber-500 fill-none drop-shadow-[0_1.5px_3px_rgba(217,119,6,0.25)]">
                        <polygon 
                          points="50,3 93,25 93,75 50,97 7,75 7,25" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          strokeLinejoin="round"
                        />
                        <polygon 
                          points="50,9 88,29 88,71 50,91 12,71 12,29" 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          strokeLinejoin="round" 
                          className="opacity-70"
                        />
                      </svg>
                      
                      {/* Inner Avatar clip (rounded Circle inside SVG borders) */}
                      <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-slate-100 bg-slate-50 select-none">
                        <img 
                          src={family.avatar} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                    </div>

                    {/* Mid Text Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-[#f08c33] tracking-tight uppercase truncate max-w-[130px] transition-colors leading-tight">
                        {family.name}
                      </h4>
                      
                      {/* Level / Challenger row */}
                      <div className="flex items-center gap-1 mt-0.5">
                        {/* Golden badges */}
                        <span className="text-[9px] font-black italic text-[#d97706] flex items-center gap-0.5 leading-none">
                          <Flame size={10} fill="currentColor" className="text-amber-500" />
                          {family.tier}
                        </span>
                      </div>

                      {/* Members counts */}
                      <span className="text-[9px] font-bold text-slate-400/90 leading-none mt-1">
                        Member:{family.members}
                      </span>

                      {/* Total Combo points count */}
                      <div className="flex items-center gap-0.5 mt-1">
                        <span className="text-[9.5px] font-extrabold text-slate-505 uppercase tracking-wide leading-none text-slate-600">
                          total comb...oint:{family.points}
                        </span>
                        <ChevronDown size={10} className="text-slate-400" />
                      </div>
                    </div>

                  </div>

                  {/* Actions Column */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinClick(family.id, family.name);
                    }}
                    className={cn(
                      "flex-shrink-0 px-4.5 py-2 text-[11px] font-black uppercase rounded-full shadow-sm hover:shadow active:scale-95 transition-all outline-none border cursor-pointer",
                      hasJoined
                        ? "bg-slate-100 hover:bg-slate-150 text-slate-400 border-slate-200"
                        : "bg-gradient-to-r from-[#f09c38] to-[#f4be4f] text-white border-[#e08a28] hover:brightness-105 active:brightness-95"
                    )}
                  >
                    {hasJoined ? (
                      <span className="flex items-center gap-1">
                        <Check size={11} strokeWidth={3.5} /> Pending
                      </span>
                    ) : '+ Join'}
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Dynamic Family Details Popup Modal overlay */}
      <AnimatePresence>
        {selectedFamily && (
          <FamilyDetailsPopup 
            family={selectedFamily} 
            onClose={() => setSelectedFamily(null)} 
          />
        )}
      </AnimatePresence>

      {/* 7. Criteria of family creation overlay */}
      <AnimatePresence>
        {showCriteria && (
          <FamilyCreationCriteria onClose={() => setShowCriteria(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
