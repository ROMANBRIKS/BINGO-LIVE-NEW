import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Users, Crown, Shield, Trophy, Star, TrendingUp, Swords } from 'lucide-react';
import { cn } from '../lib/utils';

interface Family {
  rank: number;
  name: string;
  avatar: string;
  members: string;
  points: string;
  tier: string;
  theme: 'gold' | 'silver' | 'bronze' | 'standard';
}

const FAMILIES: Family[] = [
  {
    rank: 1,
    name: 'Vibez',
    avatar: 'https://picsum.photos/seed/f1/128/128',
    members: '186/190',
    points: '1.2M',
    tier: 'Challenger II',
    theme: 'gold'
  },
  {
    rank: 2,
    name: 'BIG STEPPA',
    avatar: 'https://picsum.photos/seed/f2/128/128',
    members: '150/190',
    points: '862.7K',
    tier: 'Challenger III',
    theme: 'silver'
  },
  {
    rank: 3,
    name: 'Ijoba Feder..',
    avatar: 'https://picsum.photos/seed/f3/128/128',
    members: '175/190',
    points: '742.7K',
    tier: 'Challenger II',
    theme: 'bronze'
  },
  {
    rank: 4,
    name: 'JOHN W..',
    avatar: 'https://picsum.photos/seed/f4/128/128',
    members: '186/190',
    points: '533.1K',
    tier: 'Challenger I',
    theme: 'standard'
  },
  {
    rank: 5,
    name: 'Joy an..',
    avatar: 'https://picsum.photos/seed/f5/128/128',
    members: '472/500',
    points: '488.5K',
    tier: 'Challenger III',
    theme: 'standard'
  },
  {
    rank: 6,
    name: 'TC Alph..',
    avatar: 'https://picsum.photos/seed/f6/128/128',
    members: '159/190',
    points: '422.2K',
    tier: 'Challenger I',
    theme: 'standard'
  },
  {
    rank: 7,
    name: 'Starlite..',
    avatar: 'https://picsum.photos/seed/f7/128/128',
    members: '220/350',
    points: '342.9K',
    tier: 'Challenger II',
    theme: 'standard'
  },
  {
    rank: 8,
    name: 'BALAGAN..',
    avatar: 'https://picsum.photos/seed/f8/128/128',
    members: '180/190',
    points: '286.8K',
    tier: 'Challenger III',
    theme: 'standard'
  },
  {
    rank: 9,
    name: 'Wicked Ones',
    avatar: 'https://picsum.photos/seed/f9/128/128',
    members: '94/130',
    points: '272.4K',
    tier: 'Gold III',
    theme: 'standard'
  },
  {
    rank: 10,
    name: 'THE W..',
    avatar: 'https://picsum.photos/seed/f10/128/128',
    members: '247/500',
    points: '259.8K',
    tier: 'Challenger III',
    theme: 'standard'
  },
  {
    rank: 11,
    name: 'House ..',
    avatar: 'https://picsum.photos/seed/f11/128/128',
    members: '218/350',
    points: '235.2K',
    tier: 'Challenger II',
    theme: 'standard'
  },
  {
    rank: 12,
    name: 'BLACK T..',
    avatar: 'https://picsum.photos/seed/f12/128/128',
    members: '149/160',
    points: '233.6K',
    tier: 'Diamond II',
    theme: 'standard'
  },
  {
    rank: 13,
    name: 'Jays',
    avatar: 'https://picsum.photos/seed/f13/128/128',
    members: '126/190',
    points: '221.6K',
    tier: 'Challenger I',
    theme: 'standard'
  },
  {
    rank: 14,
    name: 'Mercury',
    avatar: 'https://picsum.photos/seed/f14/128/128',
    members: '190/500',
    points: '217.4K',
    tier: 'Challenger III',
    theme: 'standard'
  }
];

const COMBAT_FAMILIES: Family[] = [
  {
    rank: 1,
    name: 'BIG STEPPA',
    avatar: 'https://picsum.photos/seed/f2/128/128',
    members: '150/190',
    points: '2.4M',
    tier: 'Warlord III',
    theme: 'gold'
  },
  {
    rank: 2,
    name: 'Vibez',
    avatar: 'https://picsum.photos/seed/f1/128/128',
    members: '186/190',
    points: '1.8M',
    tier: 'Warlord II',
    theme: 'silver'
  },
  {
    rank: 3,
    name: 'JOHN W..',
    avatar: 'https://picsum.photos/seed/f4/128/128',
    members: '186/190',
    points: '1.5M',
    tier: 'Warlord I',
    theme: 'bronze'
  },
  {
    rank: 4,
    name: 'Ijoba Feder..',
    avatar: 'https://picsum.photos/seed/f3/128/128',
    members: '175/190',
    points: '1.2M',
    tier: 'Commander III',
    theme: 'standard'
  },
  {
    rank: 5,
    name: 'TC Alph..',
    avatar: 'https://picsum.photos/seed/f6/128/128',
    members: '159/190',
    points: '980K',
    tier: 'Commander II',
    theme: 'standard'
  },
  {
    rank: 6,
    name: 'Wicked Ones',
    avatar: 'https://picsum.photos/seed/f9/128/128',
    members: '94/130',
    points: '850K',
    tier: 'Commander I',
    theme: 'standard'
  },
  {
    rank: 7,
    name: 'BALAGAN..',
    avatar: 'https://picsum.photos/seed/f8/128/128',
    members: '180/190',
    points: '720K',
    tier: 'Elite III',
    theme: 'standard'
  }
];

export default function FamilyLeaderboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'prestige' | 'combat'>('prestige');
  const [showAll, setShowAll] = useState(false);

  const currentData = activeTab === 'prestige' ? FAMILIES : COMBAT_FAMILIES;
  const top3 = currentData.slice(0, 3);
  const rest = showAll ? currentData.slice(3) : currentData.slice(3, 8);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between z-50 bg-[#121212]">
        <button onClick={() => navigate('/profile')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-black italic tracking-[0.2em] uppercase">Family Leaderboard</h2>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Search size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 px-6 py-4 bg-[#121212] border-b border-white/5">
        <button 
          onClick={() => setActiveTab('prestige')}
          className={cn(
            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'prestige' ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20" : "bg-white/5 text-white/40"
          )}
        >
          Family Prestige
        </button>
        <button 
          onClick={() => setActiveTab('combat')}
          className={cn(
            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'combat' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/5 text-white/40"
          )}
        >
          Combat Ranking
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Family Activities Banner */}
        <div className="px-4 py-6 bg-gradient-to-b from-[#121212] to-[#050505]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black italic uppercase tracking-tight">Family activities</h3>
          </div>
          <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden group cursor-pointer">
            <img 
              src="https://picsum.photos/seed/leaderboard/800/400" 
              alt="Leaderboard Banner" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8">
              <h4 className="text-2xl font-black italic text-yellow-400 uppercase tracking-tighter leading-none mb-1">Family</h4>
              <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Leaderboard</h4>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Season 12 Active</span>
              </div>
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>

        {/* Podium Section */}
        <div className="relative h-[320px] flex items-end justify-center px-4 pb-8 bg-gradient-to-b from-[#1a1a1a] to-[#050505]">
          {/* Rank 2 (Silver) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 z-10 -mr-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.3)] overflow-hidden">
                <img src={top3[1].avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-slate-400">
                <Trophy size={20} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-black text-[10px] font-black px-2 rounded-full">TOP 2</div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight truncate w-20 text-center">{top3[1].name}</span>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-400 uppercase">{top3[1].tier}</span>
              <span className="text-xs font-black italic text-white">{top3[1].points}</span>
            </div>
          </motion.div>

          {/* Rank 1 (Gold) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 z-20 scale-110"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] overflow-hidden relative">
                <img src={top3[0].avatar} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shine" />
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400">
                <Crown size={28} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-3 rounded-full shadow-lg">TOP 1</div>
            </div>
            <span className="text-xs font-black uppercase tracking-tight truncate w-24 text-center">{top3[0].name}</span>
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-yellow-400 uppercase">{top3[0].tier}</span>
              <span className="text-sm font-black italic text-white">{top3[0].points}</span>
            </div>
          </motion.div>

          {/* Rank 3 (Bronze) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-2 z-10 -ml-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-orange-700 shadow-[0_0_20px_rgba(194,65,12,0.3)] overflow-hidden">
                <img src={top3[2].avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-orange-700">
                <Trophy size={20} />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 rounded-full">TOP 3</div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight truncate w-20 text-center">{top3[2].name}</span>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-orange-700 uppercase">{top3[2].tier}</span>
              <span className="text-xs font-black italic text-white">{top3[2].points}</span>
            </div>
          </motion.div>

          {/* Pedestal Base */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* List Section */}
        <div className="px-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black italic uppercase tracking-tight">Family List</h3>
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
            >
              {showAll ? 'less' : 'more'} <ChevronLeft size={12} className={cn("transition-transform", showAll ? "-rotate-90" : "rotate-180")} />
            </button>
          </div>

          <div className="space-y-2">
            {rest.map((family) => (
              <div key={family.rank} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black italic text-white/20 w-6">{family.rank}</span>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center border border-white/10 overflow-hidden">
                      <img src={family.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Shield size={14} className="text-yellow-400 fill-yellow-400/20" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight truncate w-32">{family.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/40">Member:{family.members}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-yellow-400 uppercase">{family.tier}</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">total combo point:{family.points}</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black uppercase rounded-full shadow-lg shadow-yellow-400/10 hover:scale-105 active:scale-95 transition-all">
                  + Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
