import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, MessageSquare, Shield, Crown, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { LevelBadge } from '../components/LevelBadge';

import { NobleBadge } from '../components/NobleBadge';
import { NobleTier } from '../NobleTypes';

interface Visitor {
  id: string;
  displayName: string;
  photoURL: string;
  level: number;
  timestamp: string;
  date: string;
  isNew?: boolean;
  hasSpecialBadge?: boolean;
  nobleTier?: NobleTier;
}

const VISITORS: Visitor[] = [
  {
    id: '1',
    displayName: 'Nikkij',
    photoURL: 'https://picsum.photos/seed/v1/128/128',
    level: 37,
    timestamp: '05:40',
    date: 'Yesterday',
    isNew: true,
    nobleTier: 'Baron'
  },
  {
    id: '2',
    displayName: 'TasteTester',
    photoURL: 'https://picsum.photos/seed/v2/128/128',
    level: 51,
    timestamp: '05:24',
    date: 'Yesterday',
    hasSpecialBadge: true,
    nobleTier: 'Duke'
  },
  {
    id: '3',
    displayName: 'PRESTIGE',
    photoURL: 'https://picsum.photos/seed/v3/128/128',
    level: 18,
    timestamp: '15:20',
    date: '2026-04-02',
    nobleTier: 'None'
  },
  {
    id: '4',
    displayName: '3m ayLe',
    photoURL: 'https://picsum.photos/seed/v4/128/128',
    level: 51,
    timestamp: '03:10',
    date: '2026-03-30',
    nobleTier: 'Grand Duke'
  },
  {
    id: '5',
    displayName: 'Litty Kate',
    photoURL: 'https://picsum.photos/seed/v5/128/128',
    level: 13,
    timestamp: '22:44',
    date: '2026-03-29',
    nobleTier: 'None'
  }
];

export default function VisitorsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-white/5 bg-[#121212]">
        <button onClick={() => navigate('/profile')} className="p-1 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black italic uppercase tracking-tight">Visitors</h1>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 bg-[#1a1a1a] py-6 border-b border-white/5">
        <div className="flex flex-col items-center border-r border-white/5">
          <span className="text-3xl font-black italic">36</span>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total visitors</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-black italic text-white/40">0</span>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Today's Visitors</span>
        </div>
      </div>

      {/* VIP Gating Banner */}
      <div className="p-4 bg-[#121212] flex items-center justify-between border-b border-white/5">
        <p className="text-xs font-bold text-white/60">Add personal information to get noticed</p>
        <button className="px-4 py-1.5 bg-cyan-400 text-black text-[10px] font-black uppercase rounded-full shadow-lg shadow-cyan-400/20">
          Add
        </button>
      </div>

      <div className="p-4 bg-[#0a0a0a] flex items-center justify-between">
        <h3 className="text-sm font-black italic uppercase tracking-tight">Last 30 visitors</h3>
        <button className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1">
          Open VIP to view more visitor records <ChevronLeft size={12} className="rotate-180" />
        </button>
      </div>

      {/* Visitor List */}
      <div className="flex-1 overflow-y-auto">
        {['Yesterday', '2026-04-02', '2026-03-30', '2026-03-29'].map((date) => (
          <div key={date}>
            <div className="px-4 py-2 bg-[#121212]/50 text-[10px] font-black text-white/20 uppercase tracking-widest">
              {date}
            </div>
            <div className="divide-y divide-white/5">
              {VISITORS.filter(v => v.date === date).map((visitor) => (
                <div key={visitor.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                        <img src={visitor.photoURL} alt="" className="w-full h-full object-cover" />
                      </div>
                      {visitor.isNew && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm border border-black">
                          NEW
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black italic">{visitor.displayName}</span>
                        {visitor.nobleTier && visitor.nobleTier !== 'None' && (
                          <NobleBadge tier={visitor.nobleTier} size="sm" />
                        )}
                        {visitor.isNew && <span className="bg-orange-500 text-white text-[8px] font-black px-1 rounded-sm">NEW</span>}
                        {visitor.hasSpecialBadge && <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center text-[10px]">💰</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <LevelBadge level={visitor.level} />
                        <span className="text-[10px] font-bold text-white/40">{visitor.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {visitor.id === '1' ? (
                      <button className="p-2 text-white/20 hover:text-white transition-colors">
                        <MessageSquare size={20} />
                      </button>
                    ) : (
                      <button className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all">
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
