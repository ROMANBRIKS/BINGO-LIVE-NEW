import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Search, Heart, Star, Users, Award, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
// @ts-ignore
import followedHeartWingsImg from '../assets/images/followed_heart_wings_1781210010399.jpg';

export interface RelationshipUser {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  initials?: string;
  avatarColor?: string;
  level: number;
  levelType: 'silver' | 'gold' | 'bronze' | 'purple' | 'blue';
  badgeType?: 'star' | 'heart' | 'medal' | 'fairy' | 'blood' | 'none';
  badgeValue?: number;
  isLive?: boolean;
  flag?: string;
  isNew?: boolean;
  relationship: 'friend' | 'following' | 'fan';
  customSymbolBadge?: 'wing-silver' | 'wing-cyan' | 'none';
}

const INITIAL_DATA: RelationshipUser[] = [
  // --- FRIENDS ---
  {
    id: 'lee',
    name: 'Lee',
    displayName: 'Lee',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=350', // older bearded black gentleman
    level: 1,
    levelType: 'silver',
    badgeType: 'star',
    badgeValue: 50,
    relationship: 'friend',
    isNew: true
  },
  {
    id: 'nikkij',
    name: 'Nikkij',
    displayName: 'Nikkij',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350', // black woman portrait
    level: 38,
    levelType: 'gold',
    badgeType: 'heart',
    badgeValue: 50,
    flag: '🇨🇦',
    relationship: 'friend',
    isNew: true
  },
  {
    id: 'munching_fat',
    name: 'Munching_FAT',
    displayName: 'Munching_FAT',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=350',
    level: 35,
    levelType: 'gold',
    badgeType: 'star',
    badgeValue: 35,
    relationship: 'friend'
  },
  {
    id: 'danofnation',
    name: 'Danofnation',
    displayName: 'Danofnation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=350', // white outfit style portrait
    level: 1,
    levelType: 'bronze',
    badgeType: 'star',
    badgeValue: 0,
    relationship: 'friend'
  },
  {
    id: 'bratzdollz',
    name: 'BratzDollz',
    displayName: '👄BratzDollz💋',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350', // monochrome face profile
    level: 1,
    levelType: 'silver',
    badgeType: 'heart',
    badgeValue: 0,
    relationship: 'friend'
  },
  {
    id: 'come_to_mummy',
    name: 'come to mummy',
    displayName: 'come to mummy',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=350', // wavy hair selfie
    level: 5,
    levelType: 'bronze',
    badgeType: 'heart',
    badgeValue: 0,
    relationship: 'friend'
  },
  {
    id: 'u1113318913',
    name: '1113318913',
    displayName: '1113318913',
    initials: 'A',
    avatarColor: 'bg-emerald-600',
    level: 5,
    levelType: 'bronze',
    badgeType: 'heart',
    badgeValue: 0,
    relationship: 'friend'
  },
  {
    id: 'ben',
    name: 'Ben',
    displayName: 'Ben 🍥',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=350', // holding phone
    level: 14,
    levelType: 'silver',
    badgeType: 'heart',
    badgeValue: 50,
    relationship: 'friend'
  },
  {
    id: 'big_dolly',
    name: 'big dolly',
    displayName: 'big dolly',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350',
    level: 51,
    levelType: 'purple',
    badgeType: 'heart',
    badgeValue: 51,
    relationship: 'friend'
  },

  // --- FANS ---
  {
    id: 'peace_olamide',
    name: 'Peace Olamide',
    displayName: 'Peace Olamide',
    initials: 'P',
    avatarColor: 'bg-indigo-600',
    level: 1,
    levelType: 'silver',
    isNew: true,
    relationship: 'fan'
  },
  {
    id: 'ajibola_mary',
    name: 'Ajibola mary',
    displayName: 'Ajibola mary',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150', // neutral woman
    level: 1,
    levelType: 'bronze',
    isNew: true,
    relationship: 'fan'
  },
  {
    id: 'munachisy',
    name: 'munachisy',
    displayName: 'munachisy',
    initials: 'O',
    avatarColor: 'bg-amber-600',
    level: 30,
    levelType: 'gold',
    isNew: true,
    relationship: 'fan'
  },
  {
    id: 'mary_kate',
    name: 'Mary Kate',
    displayName: 'Mary Kate',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150', // evening outfit selfie
    level: 1,
    levelType: 'silver',
    isNew: true,
    relationship: 'fan'
  },
  {
    id: 'rebecca_wilson',
    name: 'Rebecca Wilson',
    displayName: 'Rebecca Wilson',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150',
    level: 1,
    levelType: 'silver',
    isNew: true,
    relationship: 'fan'
  },
  {
    id: 'hani_sweet',
    name: 'hani sweet',
    displayName: 'hani sweet',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    level: 1,
    levelType: 'bronze',
    isNew: true,
    relationship: 'fan'
  },
  {
    id: 'neville_thomas',
    name: 'neville Thomas',
    displayName: 'neville Thomas',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    level: 1,
    levelType: 'silver',
    isNew: true,
    relationship: 'fan'
  },

  // --- FOLLOWING ---
  {
    id: 'sweetvee',
    name: 'Sweetvee',
    displayName: '☆`Sweetvee`...',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
    level: 50,
    levelType: 'purple',
    isLive: true,
    relationship: 'following'
  },
  {
    id: 'pretty_mavis',
    name: 'PRETTY MAVIS',
    displayName: 'PRETTY MAVIS',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350',
    level: 66,
    levelType: 'gold',
    isLive: true,
    relationship: 'following'
  },
  {
    id: 'caramel_sauce',
    name: 'Caramel sauce',
    displayName: 'Caramel sauce 🥇',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=350',
    level: 23,
    levelType: 'blue',
    relationship: 'following'
  },
  {
    id: 'vegas',
    name: 'VEGAS',
    displayName: '🦋 𝒱ℰ𝒢𝒜𝒮 🌹',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=350',
    level: 3,
    levelType: 'bronze',
    relationship: 'following'
  },
  {
    id: 'habibi',
    name: 'HABIBI',
    displayName: 'HABIBI🌸',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350',
    level: 1,
    levelType: 'silver',
    customSymbolBadge: 'wing-silver',
    relationship: 'following'
  },
  {
    id: 'mide',
    name: 'Mídé',
    displayName: '🦋 Mídé 🌹',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350',
    level: 1,
    levelType: 'silver',
    isLive: true,
    relationship: 'following'
  },
  {
    id: 'spicy_fairy',
    name: 'SpicyFairy',
    displayName: 'SpicyFairy🧚‍♀️',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=350',
    level: 50,
    levelType: 'purple',
    customSymbolBadge: 'wing-cyan',
    relationship: 'following'
  },
  {
    id: 'bigsori',
    name: 'BiGSORI',
    displayName: '🩸 βiGS☉RI 🦋',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=350',
    level: 47,
    levelType: 'gold',
    relationship: 'following'
  },
  {
    id: 'june_14th',
    name: 'June 14th',
    displayName: 'June 14th 🌳',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350',
    level: 15,
    levelType: 'blue',
    relationship: 'following'
  }
];

export function RelationshipsPage({ initialTab = 'friends' }: { initialTab?: 'friends' | 'following' | 'fans' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab can be passed either via router prompt or search params
  const queryTab = searchParams.get('tab');
  const [activeSegment, setActiveSegment] = useState<'friends' | 'following' | 'fans'>(
    (queryTab as any) || initialTab
  );

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'special'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [relationships, setRelationships] = useState<RelationshipUser[]>(INITIAL_DATA);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // State to filter special followers/fans. Let's make it fully dynamic so the user can actually tag/toggle users as special!
  const [specialIds, setSpecialIds] = useState<Record<string, boolean>>({});

  // Search logic
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const currentSegmentTitle = useMemo(() => {
    if (activeSegment === 'friends') return 'Friends';
    if (activeSegment === 'fans') return 'Fans';
    return 'Following';
  }, [activeSegment]);

  // Dynamic filter
  const filteredUsers = useMemo(() => {
    return relationships.filter(user => {
      // Correct relationship segment
      if (user.relationship !== activeSegment) return false;

      // Sub-tab: All vs Special
      if (activeSubTab === 'special' && !specialIds[user.id]) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return user.displayName.toLowerCase().includes(query) || user.name.toLowerCase().includes(query);
      }

      return true;
    });
  }, [relationships, activeSegment, activeSubTab, specialIds, searchQuery]);

  // Unfollow or Toggle relationship function
  const handleActionClick = (user: RelationshipUser) => {
    setRelationships(prev => prev.map(u => {
      if (u.id !== user.id) return u;
      
      if (u.relationship === 'following') {
        // Toggle from following to non-following
        return { ...u, relationship: 'fan' }; // Demo change
      } else if (u.relationship === 'fan') {
        // Toggle fan to friends or following
        return { ...u, relationship: 'following' };
      } else {
        // Friends toggled to following
        return { ...u, relationship: 'following' };
      }
    }));
  };

  // Toggle special tag
  const toggleSpecial = (userId: string) => {
    setSpecialIds(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Count loaders
  const specialCount = useMemo(() => {
    return relationships.filter(u => u.relationship === activeSegment && specialIds[u.id]).length;
  }, [relationships, activeSegment, specialIds]);

  // Render Diamond / Wealth Badge
  const renderDiamondBadge = (user: RelationshipUser) => {
    let gradient = '';
    let diamondColor = '';
    
    switch (user.levelType) {
      case 'gold':
        gradient = 'from-amber-400 to-orange-500 border-amber-300';
        diamondColor = '#fff7bc';
        break;
      case 'silver':
        gradient = 'from-zinc-350 to-zinc-500 border-zinc-200';
        diamondColor = '#f3f4f6';
        break;
      case 'blue':
        gradient = 'from-sky-400 to-blue-500 border-sky-300';
        diamondColor = '#e0f2fe';
        break;
      case 'purple':
        gradient = 'from-purple-500 via-fuchsia-600 to-pink-500 border-fuchsia-400';
        diamondColor = '#fae8ff';
        break;
      case 'bronze':
      default:
        gradient = 'from-orange-700 to-amber-900 border-orange-800';
        diamondColor = '#ffedd5';
        break;
    }

    return (
      <div className={cn(
        "absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-[1px] px-1 rounded-full border shadow-sm z-10 select-none scale-90",
        `bg-gradient-to-r ${gradient}`
      )}>
        {/* Absolute custom vector diamond */}
        <svg viewBox="0 0 24 24" className="w-[8px] h-[8px]" fill={diamondColor}>
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
        <span className="text-[7.5px] font-[900] text-white leading-none tracking-tighter">
          {user.level}
        </span>
      </div>
    );
  };

  // Render Side Badges next to display names
  const renderNameBadges = (user: RelationshipUser) => {
    if (!user.badgeType || user.badgeType === 'none') return null;

    if (user.badgeType === 'star') {
      return (
        <span className="flex items-center gap-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-[8px] font-black px-1.5 py-[1px] rounded-[5px] scale-95 shadow-xs select-none">
          <Star size={7.5} fill="currentColor" className="text-white shrink-0" />
          <span>{user.badgeValue}</span>
        </span>
      );
    }

    if (user.badgeType === 'heart') {
      return (
        <span className="flex items-center gap-0.5 bg-gradient-to-r from-pink-400 to-rose-500 text-white text-[8px] font-black px-1.5 py-[1px] rounded-[5px] scale-95 shadow-xs select-none">
          <Heart size={7.5} fill="currentColor" className="text-white shrink-0" />
          <span>{user.badgeValue}</span>
        </span>
      );
    }

    return null;
  };

  // Custom visual sub-badge (e.g. Flight/Wing badge next to HABIBI or SpicyFairy)
  const renderCustomWingBadge = (user: RelationshipUser) => {
    if (!user.customSymbolBadge || user.customSymbolBadge === 'none') return null;

    if (user.customSymbolBadge === 'wing-silver') {
      return (
        <div className="flex items-center gap-0.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-[8px] font-black text-white px-1 py-[1.5px] rounded border border-white/15 scale-90 tracking-tighter shrink-0 select-none">
          <Sparkles size={7} fill="currentColor" />
          <span>Lv.2</span>
        </div>
      );
    }

    if (user.customSymbolBadge === 'wing-cyan') {
      return (
        <div className="flex items-center gap-0.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-[8px] font-black text-white px-1 py-[1.5px] rounded border border-cyan-300/10 scale-90 tracking-tighter shrink-0 select-none animate-pulse">
          <Award size={7.5} />
          <span>Fairy</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans select-none relative pb-16 transition-colors duration-300",
      isLight ? "bg-[#f8f8f8] text-stone-900" : "bg-[#121212] text-zinc-150"
    )}>
      
      {/* Dynamic Native Style Header */}
      <header className={cn(
        "sticky top-0 z-40 px-4 pt-12 pb-3.5 flex items-center justify-between transition-colors duration-300",
        isLight ? "bg-white border-b border-stone-200" : "bg-[#121212]/95 backdrop-blur-md"
      )}>
        <button 
          onClick={() => navigate(-1)} 
          className={cn(
            "p-1 rounded-full transition-transform active:scale-90",
            isLight ? "text-stone-700 hover:text-stone-950" : "text-zinc-300 hover:text-white"
          )}
        >
          <ChevronLeft size={24} />
        </button>
        
        <h1 className={cn(
          "text-[17px] font-extrabold tracking-tight text-center flex-1 pr-6",
          isLight ? "text-stone-900" : "text-white"
        )}>
          {currentSegmentTitle}
        </h1>
      </header>

      {/* Profile Stats Quick Switcher Tabs (to easily slide between following, fans, friends pages) */}
      <div className={cn(
        "flex justify-center border-b items-center text-xs font-bold leading-none select-none",
        isLight ? "bg-white border-stone-200" : "bg-[#16161a] border-zinc-900"
      )}>
        {[
          { key: 'friends', label: 'Friends' },
          { key: 'following', label: 'Following' },
          { key: 'fans', label: 'Fans' }
        ].map((seg) => (
          <button
            key={seg.key}
            onClick={() => {
              setActiveSegment(seg.key as any);
              setActiveSubTab('all');
              setSearchQuery('');
            }}
            className={cn(
              "flex-1 text-center py-3 relative cursor-pointer text-xs font-black transition-colors duration-200",
              activeSegment === seg.key 
                ? (isLight ? "text-black" : "text-white")
                : (isLight ? "text-stone-400 hover:text-stone-700" : "text-zinc-500 hover:text-zinc-300")
            )}
          >
            {seg.label}
            {activeSegment === seg.key && (
              <motion.div 
                layoutId="activeRelationshipIndicator"
                className="absolute bottom-0 left-1/4 right-1/4 h-[2.5px] bg-cyan-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tabs: All vs Special follow/fans (present in Following & Fans pages) */}
      {activeSegment !== 'friends' && (
        <div className={cn(
          "flex items-center gap-6 px-6 pt-3.5 pb-2 transition-colors duration-300",
          isLight ? "bg-stone-50/50" : "bg-transparent"
        )}>
          <button
            onClick={() => setActiveSubTab('all')}
            className="flex flex-col items-center relative select-none pb-1.5 cursor-pointer"
          >
            <span className={cn(
              "text-sm font-black tracking-wide transition-colors duration-200",
              activeSubTab === 'all' 
                ? (isLight ? "text-black" : "text-zinc-100") 
                : (isLight ? "text-stone-400" : "text-zinc-500")
            )}>
              All
            </span>
            {activeSubTab === 'all' && (
              <div className={cn("absolute bottom-0 w-2.5 h-[3px] rounded-full", isLight ? "bg-stone-900" : "bg-[#00e1cf]")} />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('special')}
            className="flex flex-col items-center relative select-none pb-1.5 cursor-pointer"
          >
            <span className={cn(
              "text-sm font-black tracking-wide transition-colors duration-200",
              activeSubTab === 'special' 
                ? (isLight ? "text-black" : "text-zinc-100") 
                : (isLight ? "text-stone-400" : "text-zinc-500")
            )}>
              {activeSegment === 'following' ? `Special follow(${specialCount})` : `Special fans(${specialCount})`}
            </span>
            {activeSubTab === 'special' && (
              <div className={cn("absolute bottom-0 w-2.5 h-[3px] rounded-full", isLight ? "bg-stone-900" : "bg-[#00e1cf]")} />
            )}
          </button>
        </div>
      )}

      {/* Standard Rounded Search Bar (Only shown in Friends or unselected All sub-tabs matching screenshot layout) */}
      {(activeSegment === 'friends' || activeSubTab === 'all') && (
        <div className="px-4 py-3 shrink-0">
          <div className="relative">
            <Search size={15} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isLight ? "text-stone-400" : "text-zinc-500")} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search"
              className={cn(
                "w-full h-9 pl-11 pr-4 text-xs font-semibold rounded-full outline-none transition-colors duration-300 border",
                isLight 
                  ? "bg-stone-200/50 border-stone-200/80 text-stone-900 focus:bg-white placeholder-stone-450 focus:border-cyan-400" 
                  : "bg-[#202022] border-transparent text-white focus:bg-[#28282b] placeholder-zinc-600 focus:border-zinc-700"
              )}
            />
          </div>
        </div>
      )}

      {/* Main Lists Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="space-y-4 pt-1">
          <AnimatePresence initial={false}>
            {filteredUsers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-zinc-500"
              >
                <div className="w-16 h-16 rounded-full mx-auto bg-zinc-800/10 flex items-center justify-center mb-4">
                  <Users size={28} className="text-zinc-500" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider">No connections found</p>
                <p className="text-[11px] text-zinc-600 mt-1">Try another search or follow more creators!</p>
              </motion.div>
            ) : (
              filteredUsers.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.3) }}
                  className={cn(
                    "flex items-center justify-between p-1.5 rounded-2xl transition-all duration-200",
                    isLight ? "hover:bg-stone-100/50" : "hover:bg-zinc-900/40"
                  )}
                >
                  {/* Left part: Avatar & Name Badges */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    
                    {/* Circle Avatar Wrapper */}
                    <div className="relative select-none shrink-0" onClick={() => toggleSpecial(user.id)}>
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          className={cn(
                            "w-[46px] h-[46px] rounded-full object-cover border-2 shadow-xs",
                            specialIds[user.id] 
                              ? "border-pink-500" 
                              : (isLight ? "border-white" : "border-zinc-800")
                          )}
                        />
                      ) : (
                        <div className={cn(
                          "w-[46px] h-[46px] rounded-full flex items-center justify-center text-sm font-black text-white border-2 shadow-xs",
                          user.avatarColor || "bg-gradient-to-tr from-cyan-500 to-indigo-600",
                          specialIds[user.id] 
                            ? "border-pink-500" 
                            : (isLight ? "border-white" : "border-zinc-800")
                        )}>
                          {user.initials || user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Overlapping hexagonal Sender/Wealth level jewel */}
                      {renderDiamondBadge(user)}
                    </div>

                    {/* Middle: User details and Names */}
                    <div className="min-w-0 flex flex-col justify-center select-text">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn(
                          "text-[13.5px] font-bold tracking-tight truncate leading-tight transition-colors",
                          isLight ? "text-stone-900" : "text-white"
                        )}>
                          {user.displayName}
                        </span>

                        {/* Red NEW indicator next to name (fans & friends screens) */}
                        {user.isNew && (
                          <span className="bg-[#ff3b30] text-white text-[7.5px] font-black tracking-widest uppercase px-1.5 py-[1.5px] rounded-sm shrink-0 select-none">
                            NEW
                          </span>
                        )}

                        {/* Flags */}
                        {user.flag && <span className="text-[12px]">{user.flag}</span>}

                        {/* Interactive dynamic level badge adjacent to name */}
                        {renderNameBadges(user)}

                        {/* Secondary rare badges */}
                        {renderCustomWingBadge(user)}
                      </div>

                      {/* Suffix info or Sub-bio details */}
                      <span className="text-[10px] text-zinc-500 mt-0.5 truncate select-none leading-none">
                        BINGO Live ID: {user.name.toLowerCase()}3005
                      </span>
                    </div>
                  </div>

                  {/* Right part: Action controls + Live State Indicator */}
                  <div className="flex items-center gap-3 shrink-0">
                    
                    {/* Live Equalizer Status Pill */}
                    {user.isLive && (
                      <div className="flex items-center gap-1.5 bg-[#00ff66]/10 border border-[#00ff66]/20 px-2 py-0.5 rounded-full select-none scale-90">
                        {/* Dynamic equalizing animations */}
                        <span className="flex items-end gap-[1px] h-[7px] pb-[0.5px] shrink-0 origin-bottom bg-transparent">
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
                        <span className="text-[8px] font-black text-[#00ff66] uppercase tracking-wider">
                          LIVE
                        </span>
                      </div>
                    )}

                    {/* Highly responsive interactive state toggle capsule button/image */}
                    {user.relationship === 'following' || user.relationship === 'friend' ? (
                      <button
                        onClick={() => handleActionClick(user)}
                        className="w-[64px] h-[51px] flex items-center justify-center transition-all duration-300 active:scale-95 relative shrink-0 cursor-pointer"
                        title={user.relationship === 'friend' ? 'Friends' : 'Following'}
                      >
                        <img 
                          src={followedHeartWingsImg} 
                          alt="Following" 
                          className="w-[55px] h-[46px] object-contain drop-shadow-[0_1.5px_3.5px_rgba(244,63,94,0.35)] hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActionClick(user)}
                        className={cn(
                          "text-[11px] font-[800] px-4.5 py-1.5 rounded-full shadow-sm select-none transition-all active:scale-[0.96] border cursor-pointer uppercase tracking-tight",
                          "bg-cyan-400 border-transparent text-zinc-950 font-black hover:brightness-110 shadow-cyan-400/10"
                        )}
                      >
                        Follow
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
