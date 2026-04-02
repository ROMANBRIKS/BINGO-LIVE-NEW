import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Trophy, Star, Crown, Flame, ChevronRight, Diamond, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { LevelBadge } from '../components/LevelBadge';

export default function LeaderboardPage() {
  const [topHosts, setTopHosts] = useState<UserProfile[]>([]);
  const [topGivers, setTopGivers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'hosts' | 'givers'>('hosts');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const qHosts = query(collection(db, 'users'), orderBy('totalBeansEarned', 'desc'), limit(50));
    const unsubHosts = onSnapshot(qHosts, (snap) => {
      setTopHosts(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    });

    const qGivers = query(collection(db, 'users'), orderBy('totalDiamondsSpent', 'desc'), limit(50));
    const unsubGivers = onSnapshot(qGivers, (snap) => {
      setTopGivers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    });

    return () => {
      unsubHosts();
      unsubGivers();
    };
  }, []);

  const data = activeTab === 'hosts' ? topHosts : topGivers;
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase">BINGO LIVE</h1>
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('hosts')}
              className={cn(
                "px-4 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-widest transition-all",
                activeTab === 'hosts' ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Hosts
            </button>
            <button 
              onClick={() => setActiveTab('givers')}
              className={cn(
                "px-4 py-1 rounded-lg text-[9px] font-black uppercase italic tracking-widest transition-all",
                activeTab === 'givers' ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Givers
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-16 sm:pb-8">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-8">
            {['daily', 'weekly', 'monthly'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                  timeRange === range ? "text-orange-500" : "text-white/20 hover:text-white/40"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

      <div className="flex items-end justify-center gap-4 sm:gap-12 mb-16 px-4">
        {/* Rank 2 */}
        {top3[1] && (
          <div 
            onClick={() => alert(`Viewing ${top3[1].displayName}'s profile...`)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-400 overflow-hidden shadow-[0_0_30px_rgba(148,163,184,0.3)] group-hover:scale-105 transition-transform">
                <img src={top3[1].photoURL || `https://picsum.photos/seed/${top3[1].uid}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-black italic border-2 border-black shadow-xl">2</div>
            </div>
            <p className="text-sm font-black italic uppercase tracking-tight text-white mb-1">{top3[1].displayName}</p>
            <LevelBadge level={top3[1].level} />
          </div>
        )}

        {/* Rank 1 */}
        {top3[0] && (
          <div 
            onClick={() => alert(`Viewing ${top3[0].displayName}'s profile...`)}
            className="flex flex-col items-center group -mt-8 cursor-pointer"
          >
            <div className="relative mb-4">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                <Crown size={48} fill="currentColor" />
              </div>
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-yellow-400 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.4)] group-hover:scale-105 transition-transform">
                <img src={top3[0].photoURL || `https://picsum.photos/seed/${top3[0].uid}/128/128`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black w-10 h-10 rounded-full flex items-center justify-center font-black italic border-2 border-black shadow-xl text-lg">1</div>
            </div>
            <p className="text-lg font-black italic uppercase tracking-tight text-white mb-1">{top3[0].displayName}</p>
            <LevelBadge level={top3[0].level} />
          </div>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <div 
            onClick={() => alert(`Viewing ${top3[2].displayName}'s profile...`)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-orange-700 overflow-hidden shadow-[0_0_30px_rgba(194,65,12,0.3)] group-hover:scale-105 transition-transform">
                <img src={top3[2].photoURL || `https://picsum.photos/seed/${top3[2].uid}/100/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-black italic border-2 border-black shadow-xl">3</div>
            </div>
            <p className="text-sm font-black italic uppercase tracking-tight text-white mb-1">{top3[2].displayName}</p>
            <LevelBadge level={top3[2].level} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {rest.map((user, i) => (
          <div 
            key={user.uid} 
            onClick={() => alert(`Viewing ${user.displayName}'s profile...`)}
            className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer active:scale-[0.98]"
          >
            <span className="w-6 text-center font-black italic text-white/20 group-hover:text-white/40 transition-colors">{i + 4}</span>
            <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden">
              <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/60/60`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black italic uppercase tracking-tight text-sm truncate">{user.displayName}</p>
                <LevelBadge level={user.level} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black italic text-orange-500">
                {activeTab === 'hosts' ? (
                  <>
                    <Coins size={10} fill="currentColor" />
                    {user.totalBeansEarned.toLocaleString()}
                  </>
                ) : (
                  <>
                    <Diamond size={10} fill="currentColor" />
                    {user.totalDiamondsSpent.toLocaleString()}
                  </>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-white/10 group-hover:text-white/40 transition-colors" />
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
