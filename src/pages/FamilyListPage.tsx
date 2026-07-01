import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Search, Crown, Star, Trophy, Flame, ChevronDown, Check, Info, X, ChevronRight, HelpCircle, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FamilyDetailsPopup } from '../components/FamilyDetailsPopup';
import FamilyCreationCriteria from '../components/FamilyCreationCriteria';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
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

// Highly precise types for our dark family list page
interface DarkFamily {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  members: string;
  p_raw_points: number; // Raw points displayed as integer in dark theme (Prestige)
  c_raw_points: number; // Raw points displayed as integer in dark theme (Combat)
  formattedPrestige: string; // "508K"
  formattedCombat: string; // "239.62M"
  tier: string;
  theme: 'gold' | 'silver' | 'bronze' | 'blue' | 'standard';
  description: string;
  memberCount: number;
  memberLimit: number;
  monthlyPoints: number;
  monthlyTarget: number;
  region?: string;
  ownerUid?: string;
  globalRank?: number;
  regionRank?: number;
}

// Exactly match the data shown in screenshots 3 and 4
const DARK_FAMILIES_PRESTIGE: DarkFamily[] = [
  {
    id: 'ijoba_prestige_dark',
    rank: 1,
    name: 'Ijoba Federal...',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    members: '452/500',
    p_raw_points: 508300,
    c_raw_points: 51601013,
    formattedPrestige: '508K',
    formattedCombat: '51.60M',
    tier: 'ChallengerIII',
    theme: 'gold',
    description: 'LIBRA FEDERAL AGENCY AND FAMILY. UNITY IS OUR COGNITIVE STRENGTH.',
    memberCount: 452,
    memberLimit: 500,
    monthlyPoints: 85300,
    monthlyTarget: 100000
  },
  {
    id: 'vibez_prestige_dark',
    rank: 2,
    name: 'Vibez☀️',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
    members: '490/500',
    p_raw_points: 504000,
    c_raw_points: 239620000,
    formattedPrestige: '504K',
    formattedCombat: '239.62M',
    tier: 'ChallengerIII',
    theme: 'silver',
    description: 'VIBEZ ONLY! BRINGING THE SUNSHINE TO BINGO LIVE SINCE DAY ONE.',
    memberCount: 490,
    memberLimit: 500,
    monthlyPoints: 92400,
    monthlyTarget: 100000
  },
  {
    id: 'steppa_prestige_dark',
    rank: 3,
    name: 'BIG STEP...',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    members: '380/500',
    p_raw_points: 380000,
    c_raw_points: 69300000,
    formattedPrestige: '380K',
    formattedCombat: '69.30M',
    tier: 'ChallengerIII',
    theme: 'bronze',
    description: 'TAKING BIG STEPS IN BINGO LIVE. WE STEP, WE CONQUER.',
    memberCount: 380,
    memberLimit: 500,
    monthlyPoints: 61500,
    monthlyTarget: 80000
  },
  {
    id: 'joy_prestige_dark',
    rank: 4,
    name: 'Joy and Love',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
    members: '481/500',
    p_raw_points: 275265,
    c_raw_points: 68373422,
    formattedPrestige: '275.2K',
    formattedCombat: '68.37M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'SPREADING JOY AND LOVE WHEREVER WE STREAM. SISTERHOOD AND BROTHERHOOD.',
    memberCount: 481,
    memberLimit: 500,
    monthlyPoints: 49000,
    monthlyTarget: 60000
  },
  {
    id: 'john_prestige_dark',
    rank: 5,
    name: 'J0HN WɪcK 🦋',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200',
    members: '247/350',
    p_raw_points: 237681,
    c_raw_points: 54100200,
    formattedPrestige: '237.7K',
    formattedCombat: '54.10M',
    tier: 'ChallengerII',
    theme: 'standard',
    description: 'WE DO NOT PLAY. YOU MESS WITH THE DOG, YOU DEAL WITH THE FAMILY.',
    memberCount: 247,
    memberLimit: 350,
    monthlyPoints: 37200,
    monthlyTarget: 50000
  },
  {
    id: 'house_prestige_dark',
    rank: 6,
    name: 'House of PENDR...',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
    members: '312/500',
    p_raw_points: 209547,
    c_raw_points: 48123200,
    formattedPrestige: '209.5K',
    formattedCombat: '48.12M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'THE STRENGTH OF THE PACK IS THE WOLF, AND THE STRENGTH OF THE WOLF IS THE PACK.',
    memberCount: 312,
    memberLimit: 500,
    monthlyPoints: 34500,
    monthlyTarget: 50000
  },
  {
    id: 'starlite_prestige_dark',
    rank: 7,
    name: 'Starlite Family',
    avatar: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=200',
    members: '444/500',
    p_raw_points: 185300,
    c_raw_points: 39200000,
    formattedPrestige: '185.3K',
    formattedCombat: '39.20M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'STARLITE REBEL EMPIRE. LIGHTENING UP THE LEADERBOARD WITH AMAZING VIBES.',
    memberCount: 444,
    memberLimit: 500,
    monthlyPoints: 21200,
    monthlyTarget: 40000
  }
];

const DARK_FAMILIES_COMBAT: DarkFamily[] = [
  {
    id: 'vibez_combat_dark',
    rank: 1,
    name: 'Vibez☀️',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
    members: '490/500',
    p_raw_points: 504000,
    c_raw_points: 239620000,
    formattedPrestige: '504K',
    formattedCombat: '239.62M',
    tier: 'ChallengerIII',
    theme: 'gold',
    description: 'VIBEZ ONLY! BRINGING THE SUNSHINE TO BINGO LIVE SINCE DAY ONE.',
    memberCount: 490,
    memberLimit: 500,
    monthlyPoints: 38500000,
    monthlyTarget: 50000000
  },
  {
    id: 'ballers_combat_dark',
    rank: 2,
    name: 'BALLERS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    members: '422/500',
    p_raw_points: 320000,
    c_raw_points: 160350000,
    formattedPrestige: '320K',
    formattedCombat: '160.35M',
    tier: 'ChallengerIII',
    theme: 'silver',
    description: 'THE BIG GAME BALLERS. HIGH GIVERS, STRONG STREAMERS, NO MERCY IN FIGHTS.',
    memberCount: 422,
    memberLimit: 500,
    monthlyPoints: 24700000,
    monthlyTarget: 40000000
  },
  {
    id: 'royal_combat_dark',
    rank: 3,
    name: 'RÖYÄL L...',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200',
    members: '310/350',
    p_raw_points: 154000,
    c_raw_points: 69300000,
    formattedPrestige: '154K',
    formattedCombat: '69.30M',
    tier: 'ChallengerIII',
    theme: 'bronze',
    description: 'THE ROYAL PRIDE OF LIONS. LEADERS OF THE JUNGLE, DOMINATING COMBAT DAILY.',
    memberCount: 310,
    memberLimit: 350,
    monthlyPoints: 11200000,
    monthlyTarget: 20000000
  },
  {
    id: 'joy_combat_dark',
    rank: 4,
    name: 'Joy and Love',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
    members: '481/500',
    p_raw_points: 275265,
    c_raw_points: 68373422,
    formattedPrestige: '275.2K',
    formattedCombat: '68.37M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'SPREADING JOY AND LOVE WHEREVER WE STREAM. SISTERHOOD AND BROTHERHOOD.',
    memberCount: 481,
    memberLimit: 500,
    monthlyPoints: 9800000,
    monthlyTarget: 15000000
  },
  {
    id: 'mercury_combat_dark',
    rank: 5,
    name: 'Mercury',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200',
    members: '210/500',
    p_raw_points: 198000,
    c_raw_points: 64836486,
    formattedPrestige: '198K',
    formattedCombat: '64.84M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'FAST AS MERCURY, STRONG AS STEEL. CONQUERING ALL CHALLENGERS.',
    memberCount: 210,
    memberLimit: 500,
    monthlyPoints: 8100000,
    monthlyTarget: 12000000
  },
  {
    id: 'ijoba_combat_dark',
    rank: 6,
    name: 'Ijoba Federal NG',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    members: '452/500',
    p_raw_points: 508300,
    c_raw_points: 51601013,
    formattedPrestige: '508K',
    formattedCombat: '51.60M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'LIBRA FEDERAL AGENCY AND FAMILY. UNITY IS OUR COGNITIVE STRENGTH.',
    memberCount: 452,
    memberLimit: 500,
    monthlyPoints: 7200000,
    monthlyTarget: 10000000
  },
  {
    id: 'walas_combat_dark',
    rank: 7,
    name: 'WALASCITY',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200',
    members: '73/500',
    p_raw_points: 65000,
    c_raw_points: 20300000,
    formattedPrestige: '65K',
    formattedCombat: '20.30M',
    tier: 'ChallengerIII',
    theme: 'standard',
    description: 'WALAS CITIZENS STAND COLLATERAL FORCE. STAND WITH THE CHAMPIONS.',
    memberCount: 73,
    memberLimit: 500,
    monthlyPoints: 3100000,
    monthlyTarget: 5000005
  }
];

export default function FamilyListPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  // Real-time Firestore families state
  const [dbFamilies, setDbFamilies] = useState<any[]>([]);
  
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

  // Sync static lists with DB changes and calculate correct rankings
  const mergedPrestige = React.useMemo(() => {
    // Assign specific regions to provide coherent regional ranking metrics
    const baseList = DARK_FAMILIES_PRESTIGE.map((f) => {
      let region = 'North America'; // Fallback
      if (f.name.includes('Ijoba') || f.name.includes('Starlite') || f.name.includes('RÖYÄL')) region = 'Africa';
      else if (f.name.includes('Vibez') || f.name.includes('WALASCITY') || f.name.includes('john') || f.name.includes('J0HN') || f.name.includes('House')) region = 'Europe';
      else if (f.name.includes('Joy')) region = 'Caribbean';
      
      const dbMatch = dbFamilies.find(dbF => dbF.id === f.id || dbF.name === f.name);
      return {
        ...f,
        region,
        avatar: dbMatch?.badge || dbMatch?.avatar || f.avatar,
        p_raw_points: dbMatch?.totalDiamondsSpent || f.p_raw_points,
        c_raw_points: dbMatch?.combatPoints || f.c_raw_points,
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
          p_raw_points: dbF.totalDiamondsSpent || 0,
          c_raw_points: dbF.combatPoints || 0,
          formattedPrestige: dbF.totalDiamondsSpent > 1000 ? `${(dbF.totalDiamondsSpent/1000).toFixed(1)}K` : '0',
          formattedCombat: dbF.combatPoints > 1000000 ? `${(dbF.combatPoints/1000000).toFixed(2)}M` : '0',
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

    // Sort by p_raw_points (Prestige) desc
    const sorted = [...baseList].sort((a, b) => b.p_raw_points - a.p_raw_points);
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

  const mergedCombat = React.useMemo(() => {
    const baseList = DARK_FAMILIES_COMBAT.map((f) => {
      let region = 'North America';
      if (f.name.includes('Ijoba') || f.name.includes('Starlite') || f.name.includes('RÖYÄL')) region = 'Africa';
      else if (f.name.includes('Vibez') || f.name.includes('WALASCITY') || f.name.includes('john') || f.name.includes('J0HN') || f.name.includes('House')) region = 'Europe';
      else if (f.name.includes('Joy')) region = 'Caribbean';

      const dbMatch = dbFamilies.find(dbF => dbF.id === f.id || dbF.name === f.name);
      return {
        ...f,
        region,
        avatar: dbMatch?.badge || dbMatch?.avatar || f.avatar,
        p_raw_points: dbMatch?.totalDiamondsSpent || f.p_raw_points,
        c_raw_points: dbMatch?.combatPoints || f.c_raw_points,
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
          p_raw_points: dbF.totalDiamondsSpent || 0,
          c_raw_points: dbF.combatPoints || 0,
          formattedPrestige: dbF.totalDiamondsSpent > 1000 ? `${(dbF.totalDiamondsSpent/1000).toFixed(1)}K` : '0',
          formattedCombat: dbF.combatPoints > 1000000 ? `${(dbF.combatPoints/1000000).toFixed(2)}M` : '0',
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

    // Sort by c_raw_points (Combat) desc
    const sorted = [...baseList].sort((a, b) => b.c_raw_points - a.c_raw_points);
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
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Rule guide modal details
  const [showRules, setShowRules] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  
  // Selected family details modal trigger
  const [selectedFamily, setSelectedFamily] = useState<DarkFamily | null>(null);
  
  // Dynamic joins list tracking
  const [pendingJoins, setPendingJoins] = useState<string[]>([]);

  // Choose the data source based on tab selection
  const rawList = activeTab === 'prestige' ? mergedPrestige : mergedCombat;

  // Retrieve user's assigned/owned/default group
  const myFamily = React.useMemo(() => {
    if (profile?.familyId) {
      const match = rawList.find(f => f.id === profile.familyId);
      if (match) return match;
    }
    if (user?.uid) {
      const match = rawList.find(f => f.ownerUid === user.uid);
      if (match) return match;
    }
    // Default user is "Joy and Love" so they can immediately test controls
    const backup = rawList.find(f => f.name === 'Joy and Love');
    if (backup) {
      return { ...backup, ownerUid: user?.uid || 'DEFAULT_USER_ID' };
    }
    return null;
  }, [rawList, profile, user]);
  
  // Search filtering
  const filteredList = rawList.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate top 3 vs rest list
  const top3 = filteredList.length >= 3 ? filteredList.slice(0, 3) : rawList.slice(0, 3);
  const restList = filteredList.length > 3 ? filteredList.slice(3) : filteredList;

  // Handle applied / join events
  const handleApplyJoin = (familyId: string, name: string) => {
    if (pendingJoins.includes(familyId)) return;
    setPendingJoins(prev => [...prev, familyId]);
    
    // Auto popup response toast-like feedback
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#e3b341] text-stone-950 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full shadow-2xl z-[9999] opacity-0 transition-all duration-300 transform translate-y-2 flex items-center gap-2 border border-yellow-250';
    toast.innerHTML = `<span class="bg-black/10 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-stone-950"><path d="M20 6 9 17l-5-5"/></svg></span> Request sent to ${name}!`;
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
    }, 3000);
  };

  const handleUpdateAvatar = async (familyId: string, newAvatarUrl: string) => {
    // If it's selected, update immediately in state so popup remains in-sync
    if (selectedFamily && selectedFamily.id === familyId) {
      setSelectedFamily(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
    }

    try {
      // Save directly to Firestore 'families' collection
      const docRef = doc(db, 'families', familyId);
      await setDoc(docRef, { badge: newAvatarUrl }, { merge: true });
      
      // Display floating success toast message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#ef8a29] text-stone-950 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl z-[9999] opacity-0 transition-all duration-350 transform translate-y-3 border border-yellow-200 flex items-center gap-2';
      toast.innerHTML = `<span class="bg-black/10 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-stone-950"><path d="M20 6 9 17l-5-5"/></svg></span> Group avatar uploaded and saved!`;
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
      }, 3000);
    } catch (err) {
      console.error("Error writing updated avatar to Firestore:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#111215] text-[#e2dfd9] flex flex-col select-none font-sans relative pb-12">
      
      {/* 1. Header Row - Dark and Sleek with Question circle and icons */}
      <header className="bg-[#14151a] px-4 py-3.5 flex items-center justify-between border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/family-leaderboard')} 
            className="p-1 hover:bg-white/5 rounded-full transition-colors text-slate-300"
            id="back-btn-dark"
          >
            <ChevronLeft size={26} />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowRules(true)}>
            <span className="text-[16px] font-black tracking-tight text-white select-none">Family list</span>
            <HelpCircle size={15} className="text-white/60 hover:text-white" />
          </div>
        </div>

        {/* Right tools: Custom Replicated Lion Head and Sheet of Paper as requested */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => navigate('/tasks')} 
            className="text-[#eebd41] hover:text-yellow-250 active:scale-95 transition-all p-1"
            title="Rules Sheet of Paper"
          >
            <SheetOfPaperIcon size={22} />
          </button>
          <button 
            onClick={() => setShowCriteria(true)} 
            className="text-[#eebd41] hover:text-yellow-250 active:scale-95 transition-all p-1"
            title="Criteria of family creation"
          >
            <LionHeadIcon size={22} className="animate-pulse" />
          </button>
        </div>
      </header>

      {/* 2. Embedded Banner Area - Identical structure styled to dark theme */}
      <div className="p-4" id="banner-section-dark">
        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#59160d] via-[#a32b1d] to-[#59160d] aspect-[21/9] flex items-center justify-center p-6 shadow-xl border-b-4 border-[#3a0d07]">
          
          {/* Animated Stars & Decorative Pillar Graphics */}
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute -left-10 top-0 h-full w-24 bg-white/30 blur-lg transform skew-x-12 animate-pulse" />
            <div className="absolute -right-10 bottom-0 h-full w-24 bg-white/30 blur-lg transform skew-x-12 animate-pulse" />
          </div>

          <div className="absolute top-2 right-4 text-white/50 text-[9px] font-black tracking-widest uppercase flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
            <Flame size={9} className="text-yellow-400" />
            <span>Active Season 3</span>
          </div>

          {/* Premium Logo Column Graphic */}
          <div className="flex flex-col items-center text-center z-10 relative">
            <div className="w-10 h-10 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg border border-amber-200">
              <Crown className="text-stone-900 drop-shadow-sm" size={20} fill="currentColor" />
            </div>
            
            <h2 className="mt-2 text-xl font-black italic tracking-widest text-[#fde047] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              FAMiLY
            </h2>
            <p className="text-[13px] font-bold tracking-[0.25em] text-white uppercase -mt-1 drop-shadow-md">
              LEADERBOARD
            </p>
          </div>
        </div>
      </div>

      {/* 3. List Title Banner with Vertical Bookmark Flag and Search button */}
      <div className="px-4 py-2 flex flex-col" id="family-list-header-dark">
        <div className="flex items-center justify-between relative">
          
          {/* Left Ribbon and Label */}
          <div className="flex items-center gap-2">
            
            {/* SVG Bookmark Ribbon Graphic on Left */}
            <div className="relative w-7 h-8 flex-shrink-0 -mt-1 shadow-sm select-none">
              <svg viewBox="0 0 30 40" className="w-full h-full text-[#eebd41] fill-currentColor">
                <polygon points="0,0 30,0 30,36 15,26 0,36" />
              </svg>
              <Star size={11} className="absolute top-2 left-1/2 -translate-x-1/2 text-stone-950 fill-stone-950" />
            </div>

            <span className="font-black text-[17px] text-[#eebd41] tracking-wide uppercase">Family List</span>
          </div>

          {/* Search Toggle container */}
          <div className="flex items-center gap-3">
            {searchOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 140, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input 
                  type="text" 
                  placeholder="search family..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#21232c] hover:bg-[#282a35] text-xs font-semibold text-white px-3 py-1.5 rounded-full outline-none border border-yellow-500/20 focus:border-[#eebd41] w-full"
                />
              </motion.div>
            )}

            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-[#eebd41] hover:text-yellow-200 transition-colors"
              title="Search family"
            >
              <Search size={22} />
            </button>
          </div>
        </div>

        {/* 3.1 Luxury Flat Gold Tabs representing high-fidelity design */}
        <div className="flex items-center gap-8 mt-5 px-1 relative border-b border-white/5 pb-2.5">
          <button 
            onClick={() => setActiveTab('prestige')}
            className="flex-1 text-center relative focus:outline-none"
          >
            <span className={cn(
              "text-[14px] font-[900] tracking-wide uppercase transition-all block",
              activeTab === 'prestige' 
                ? "text-[#eebd41] drop-shadow-[0_0_8px_rgba(238,189,65,0.2)]" 
                : "text-[#7a7e85] hover:text-white"
            )}>
              Family Prestige
            </span>
            {activeTab === 'prestige' && (
              <motion.div 
                layoutId="goldTabUnderline" 
                className="w-12 h-0.75 bg-[#eebd41] rounded-full mx-auto mt-2"
              />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('combat')}
            className="flex-1 text-center relative focus:outline-none"
          >
            <span className={cn(
              "text-[14px] font-[900] tracking-wide uppercase transition-all block",
              activeTab === 'combat' 
                ? "text-[#eebd41] drop-shadow-[0_0_8px_rgba(238,189,65,0.2)]" 
                : "text-[#7a7e85] hover:text-white"
            )}>
              Combat Ranking
            </span>
            {activeTab === 'combat' && (
              <motion.div 
                layoutId="goldTabUnderline" 
                className="w-12 h-0.75 bg-[#eebd41] rounded-full mx-auto mt-2"
              />
            )}
          </button>
        </div>
      </div>

      {/* 4. Podium Area with "View more" link and Luxury Scroll Banners */}
      <div className="mt-4 px-2 py-3 relative" id="podium-area-dark">
        
        {/* Row containing My Group capsule and "View more" button on the same line */}
        <div className="absolute top-0 inset-x-0 px-4 flex items-center justify-between z-35 select-none">
          {myFamily ? (
            <button
              onClick={() => setSelectedFamily(myFamily)}
              className="flex items-center gap-1.5 bg-[#eebd41]/10 hover:bg-[#eebd41]/25 border border-[#eebd41]/35 rounded-full px-3 py-1.5 font-sans text-[11px] tracking-wide cursor-pointer transition-all active:scale-95 text-[#eebd41] shadow-2xl shadow-yellow-500/5 max-w-[75%]"
              id="my-group-pill"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden border border-[#eebd41]/60 flex-shrink-0 bg-stone-900 flex items-center justify-center">
                {myFamily.avatar ? (
                  <img src={myFamily.avatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-white">🏆</div>
                )}
              </div>
              <span className="font-black text-white tracking-tight truncate">{myFamily.name}</span>
              <div className="h-2.5 w-[1px] bg-white/10" />
              <span className="text-[10px] text-[#eebd41] font-black flex items-center gap-1">
                <span>G: #{myFamily.globalRank}</span>
                <span className="text-white/30">•</span>
                <span>R: #{myFamily.regionRank}</span>
              </span>
            </button>
          ) : (
            <div /> // Spacer
          )}

          <button
            onClick={() => navigate('/family-dashboard')} 
            className="text-[12px] font-extrabold text-[#c2bfb9] hover:text-[#eebd41] transition-colors flex items-center gap-0.5 cursor-pointer select-none active:scale-95"
            id="view-more-btn"
          >
            <span>View more</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* Podium Flex - High fidelity clones of scroll cards */}
        <div className="flex items-end justify-center gap-1.5 md:gap-3 max-w-[420px] mx-auto mt-8">
          
          {/* ======================================================== */}
          {/* TOP 2 PODIUM (BLUE MERMAID SCROLL) */}
          {/* ======================================================== */}
          {top3[1] && (
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="relative w-full aspect-[2/3.8] bg-gradient-to-b from-[#4d86d6] via-[#1b5cb1] to-[#0d3478] rounded-[18px] flex flex-col justify-between items-center px-1 py-3 shadow-[0_6px_16px_rgba(13,52,120,0.4)] border border-blue-400/40 overflow-hidden text-center cursor-pointer transform hover:scale-[1.02] active:scale-98 transition-transform"
                onClick={() => setSelectedFamily(top3[1])}
              >
                {/* Scroll header/wings design */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-blue-200/20 to-transparent pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-white/30" />
                
                {/* TOP2 Header */}
                <div className="flex flex-col items-center">
                  <Star size={11} className="text-blue-200 fill-blue-200" />
                  <span className="text-[10px] font-black text-[#cae2ff] tracking-tight mt-0.5 uppercase">TOP2</span>
                </div>

                {/* Name */}
                <div className="w-full flex flex-col items-center px-0.5">
                  <span className="text-[12px] font-black text-white uppercase italic tracking-wider leading-relaxed truncate max-w-full">
                    {top3[1].name}
                  </span>
                </div>

                {/* Circle Avatar inside scroll */}
                <div className="w-11 h-11 rounded-full border border-white/60 bg-[#142345] overflow-hidden shadow-inner my-1">
                  <img src={top3[1].avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Badge tier */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-extrabold italic text-red-200 flex items-center justify-center gap-0.5">
                    <Flame size={8} fill="currentColor" className="text-red-400" />
                    {top3[1].tier}
                  </span>

                  {/* Points banner box */}
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-300 bg-[#0d2a5a]/75 px-1.5 py-0.5 rounded-full">
                    <Flame size={10} fill="currentColor" />
                    <span className="text-[9.5px] font-black leading-none tracking-tighter">
                      {activeTab === 'prestige' ? top3[1].formattedPrestige : top3[1].formattedCombat}
                    </span>
                    <ChevronDown size={8} className="text-white/60" />
                  </div>
                </div>

                {/* Plus button at the bottom tail */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyJoin(top3[1].id, top3[1].name);
                  }}
                  className={cn(
                    "absolute bottom-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transform hover:scale-110 active:scale-90 transition-all z-20 border",
                    pendingJoins.includes(top3[1].id)
                      ? "bg-emerald-500 border-white text-white"
                      : "bg-white/90 border-[#1b5cb1] text-[#0d3478]"
                  )}
                >
                  {pendingJoins.includes(top3[1].id) ? <Check size={11} strokeWidth={4} /> : <Plus size={13} strokeWidth={4} />}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOP 1 PODIUM (GOLD MEDAL SCROLL) - CENTRAL GAUNTLET */}
          {/* ======================================================== */}
          {top3[0] && (
            <div className="flex-1 flex flex-col items-center scale-103 -translate-y-2">
              <div 
                className="relative w-full aspect-[2/3.5] bg-gradient-to-b from-[#d9aa32] via-[#a36f1c] to-[#6b3a0a] rounded-[20px] flex flex-col justify-between items-center px-1.5 py-4 shadow-[0_8px_20px_rgba(107,58,10,0.5)] border-2 border-amber-300 overflow-hidden text-center cursor-pointer transform hover:scale-[1.02] active:scale-98 transition-transform"
                onClick={() => setSelectedFamily(top3[0])}
              >
                {/* Shiny gloss effect */}
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-amber-100/30 via-transparent to-transparent pointer-events-none" />
                
                {/* TOP1 Logo Crown */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Crown size={16} className="text-[#ffd700] fill-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                    <Star size={7} className="text-white fill-white absolute -bottom-1 -left-2 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-black text-amber-100 tracking-wider uppercase mt-1">TOP1</span>
                </div>

                {/* Name */}
                <div className="w-full flex flex-col items-center px-0.5">
                  <span className="text-[13px] font-black text-white uppercase italic tracking-normal leading-tight truncate max-w-full">
                    {top3[0].name}
                  </span>
                </div>

                {/* Circle Avatar inside Scroll */}
                <div className="w-13 h-13 rounded-full border-2 border-amber-400 bg-[#3f2203] overflow-hidden shadow-lg my-1">
                  <img src={top3[0].avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex flex-col items-center">
                  <span className="text-[9.5px] font-extrabold italic text-red-200 flex items-center justify-center gap-0.5">
                    <Flame size={9} fill="currentColor" className="text-red-400" />
                    {top3[0].tier}
                  </span>

                  {/* Points Box */}
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-300 bg-[#422100]/80 border border-yellow-700/20 px-2 py-0.5 rounded-full">
                    <Flame size={11} fill="currentColor" />
                    <span className="text-[10px] font-black leading-none">
                      {activeTab === 'prestige' ? top3[0].formattedPrestige : top3[0].formattedCombat}
                    </span>
                    <ChevronDown size={8} className="text-white/60" />
                  </div>
                </div>

                {/* Overlapping bottom tail plus */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyJoin(top3[0].id, top3[0].name);
                  }}
                  className={cn(
                    "absolute bottom-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-90 transition-all z-20 border",
                    pendingJoins.includes(top3[0].id)
                      ? "bg-emerald-500 border-white text-white"
                      : "bg-[#ffd700] border-amber-400 text-stone-950"
                  )}
                >
                  {pendingJoins.includes(top3[0].id) ? <Check size={12} strokeWidth={4} /> : <Plus size={14} strokeWidth={4} />}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOP 3 PODIUM (COPPER MOUNTAIN SCROLL) */}
          {/* ======================================================== */}
          {top3[2] && (
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="relative w-full aspect-[2/3.8] bg-gradient-to-b from-[#d1866a] via-[#944a32] to-[#592212] rounded-[18px] flex flex-col justify-between items-center px-1 py-3 shadow-[0_6px_16px_rgba(89,34,18,0.4)] border border-orange-400/40 overflow-hidden text-center cursor-pointer transform hover:scale-[1.02] active:scale-98 transition-transform"
                onClick={() => setSelectedFamily(top3[2])}
              >
                {/* Scroll header decor */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-orange-200/20 to-transparent pointer-events-none" />
                
                {/* TOP3 Header */}
                <div className="flex flex-col items-center">
                  <Trophy size={11} className="text-orange-200 fill-orange-200/10" />
                  <span className="text-[10px] font-black text-orange-200 tracking-tight mt-0.5 uppercase">TOP3</span>
                </div>

                {/* Name */}
                <div className="w-full flex flex-col items-center px-0.5">
                  <span className="text-[12px] font-black text-white uppercase italic tracking-wider leading-relaxed truncate max-w-full">
                    {top3[2].name}
                  </span>
                </div>

                {/* Circle Avatar inside scroll */}
                <div className="w-11 h-11 rounded-full border border-orange-300/60 bg-[#2b1007] overflow-hidden shadow-inner my-1">
                  <img src={top3[2].avatar} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Badge tier */}
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-extrabold italic text-red-200 flex items-center justify-center gap-0.5">
                    <Flame size={8} fill="currentColor" className="text-red-400" />
                    {top3[2].tier}
                  </span>

                  {/* Points Box */}
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-yellow-300 bg-[#3a1307]/80 px-1.5 py-0.5 rounded-full">
                    <Flame size={10} fill="currentColor" />
                    <span className="text-[9.5px] font-black leading-none">
                      {activeTab === 'prestige' ? top3[2].formattedPrestige : top3[2].formattedCombat}
                    </span>
                    <ChevronDown size={8} className="text-white/60" />
                  </div>
                </div>

                {/* Plus button overlapping bottom */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyJoin(top3[2].id, top3[2].name);
                  }}
                  className={cn(
                    "absolute bottom-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transform hover:scale-110 active:scale-90 transition-all z-20 border",
                    pendingJoins.includes(top3[2].id)
                      ? "bg-emerald-500 border-white text-white"
                      : "bg-white/90 border-[#bd6c55] text-[#592212]"
                  )}
                >
                  {pendingJoins.includes(top3[2].id) ? <Check size={11} strokeWidth={4} /> : <Plus size={13} strokeWidth={4} />}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 5. Translucent Rows with Golden Hexagon Avatar container */}
      <div className="px-3 pb-24 mt-4" id="list-section-dark">
        {restList.length === 0 ? (
          <div className="text-center py-12 bg-[#17181d] rounded-2xl border border-white/5">
            <Info className="mx-auto text-[#eebd41]/60 mb-2" size={24} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching families found</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-w-[440px] mx-auto">
            {restList.map((family) => {
              // Custom raw points based on active tab
              const displayRawPoints = activeTab === 'prestige' ? family.p_raw_points : family.c_raw_points;
              
              return (
                <div 
                  key={family.id} 
                  className="bg-[#18191e] border border-white/5 rounded-[22px] p-3 flex items-center justify-between hover:bg-[#1e2028] hover:border-yellow-500/25 cursor-pointer shadow-[0_3px_10px_rgba(0,0,0,0.2)] transition-all group active:scale-[0.99]"
                  onClick={() => setSelectedFamily(family)}
                >
                  
                  {/* Left rank & Avatar info inside the row */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    
                    {/* Rank Number Column - White/Silver Display Character */}
                    <span className="text-[18px] font-black italic text-stone-500/90 w-6 text-center select-none font-mono">
                      {family.rank}
                    </span>

                    {/* Highly Precise Golden Hexagon Avatar Container! */}
                    <div className="relative flex-shrink-0 w-[54px] h-[54px] flex items-center justify-center">
                      {/* Hexagon Border Graphics */}
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-amber-500 fill-none drop-shadow-[0_1.5px_3px_rgba(217,119,6,0.35)]">
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
                          className="opacity-50"
                        />
                      </svg>
                      
                      {/* Inner Avatar clip (Circle inside hexagonal outline frame block) */}
                      <div className="w-[36px] h-[36px] rounded-full overflow-hidden border border-stone-850 bg-stone-900 select-none">
                        <img 
                          src={family.avatar} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                    </div>

                    {/* Mid Text Info Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-black text-white group-hover:text-[#eebd41] tracking-tight uppercase truncate max-w-[130px] transition-colors leading-tight">
                          {family.name}
                        </h4>
                        
                        {/* Golden level shield display */}
                        <span className="text-[9px] font-black italic text-yellow-500/90 flex items-center gap-0.5 leading-none">
                          <Flame size={10} fill="currentColor" className="text-amber-500" />
                          {family.tier}
                        </span>
                      </div>

                      {/* Members counts */}
                      <span className="text-[9px] font-extrabold text-stone-500 leading-none mt-1 uppercase tracking-wide">
                        Member:{family.members}
                      </span>

                      {/* combat points:: row exactly cloning lowercase tag double colon & point layout */}
                      <div className="flex items-center gap-0.5 mt-1 text-[#8b8e96] font-extrabold uppercase">
                        <span className="text-[9.5px] leading-none tracking-tight">
                          combat points::
                        </span>
                        
                        <div className="flex items-center gap-0.5 text-yellow-500 font-black font-mono ml-0.5">
                          <Flame size={10} fill="currentColor" className="text-amber-500 flex-shrink-0" />
                          <span className="text-[10px] leading-none tracking-normal">
                            {displayRawPoints}
                          </span>
                        </div>
                        <ChevronDown size={10} className="text-stone-600 ml-1 flex-shrink-0" />
                      </div>
                    </div>

                  </div>

                  {/* Note: As per Screenshots 3 & 4 dark theme, there is no join button on the right edge. */}
                  {/* Rather, the whole row is clickable, allowing an immersive profile inspection with customized popups! */}
                  <div className="flex-shrink-0 pr-1 py-1 text-yellow-500/20 group-hover:text-[#eebd41] transition-colors">
                    <ChevronRight size={18} />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Family Rules Guide modal overlay */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1b1c21] border border-white/5 rounded-3xl p-6 max-w-sm w-full relative"
            >
              <button 
                onClick={() => setShowRules(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Crown className="text-[#eebd41]" size={24} />
                <h3 className="text-md font-black text-white uppercase tracking-wider">Family Rank Rules</h3>
              </div>
              
              <div className="space-y-3.5 text-xs text-white/75 leading-relaxed font-semibold">
                <p>
                  1. <strong className="text-[#eebd41]">Family Prestige</strong> is calculated monthly based on daily engagement, check-ins, gifts given by members, and victory counts in daily PK battlefield events.
                </p>
                <p>
                  2. <strong className="text-[#eebd41]">Combat Ranking</strong> is the raw accumulate multiplier of points generated from PK matches, gift events, and overall streaming tasks performed inside active streaming rooms.
                </p>
                <p>
                  3. The ranking is updated in real-time. Join standard families to represent them in active events!
                </p>
              </div>

              <button 
                onClick={() => setShowRules(false)}
                className="mt-6 w-full py-3 bg-[#eebd41] text-stone-950 rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-105 active:scale-95 transition-all"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Dynamic Family Details Popup Modal overlay */}
      <AnimatePresence>
        {selectedFamily && (
          <FamilyDetailsPopup 
            family={selectedFamily} 
            onClose={() => setSelectedFamily(null)} 
            onUpdateAvatar={handleUpdateAvatar}
          />
        )}
      </AnimatePresence>

      {/* 8. Criteria of family creation overlay */}
      <AnimatePresence>
        {showCriteria && (
          <FamilyCreationCriteria onClose={() => setShowCriteria(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
