import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useToast } from '../context/ToastContext';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Trophy, Star, Crown, Flame, ChevronRight, Diamond, Coins, ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { LevelBadge } from '../components/LevelBadge';

export default function LeaderboardPage() {
  const { showToast } = useToast();
  const [topHosts, setTopHosts] = useState<UserProfile[]>([]);
  const [topGivers, setTopGivers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'hosts' | 'givers'>('hosts');
  const [timeRange, setTimeRange] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const qHosts = query(collection(db, 'users'), orderBy('totalBeansEarned', 'desc'), limit(50));
    const unsubHosts = onSnapshot(qHosts, (snap) => {
      setTopHosts(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      if (activeTab === 'hosts') setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users_hosts');
    });

    const qGivers = query(collection(db, 'users'), orderBy('totalDiamondsSpent', 'desc'), limit(50));
    const unsubGivers = onSnapshot(qGivers, (snap) => {
      setTopGivers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      if (activeTab === 'givers') setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users_givers');
    });

    return () => {
      unsubHosts();
      unsubGivers();
    };
  }, []);

  const data = activeTab === 'hosts' ? topHosts : topGivers;
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  const rewards = {
    hourly: [
      { label: 'Hour Top 1', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: Crown },
      { label: 'Hour Top 2', color: 'bg-gradient-to-r from-slate-300 to-slate-500', icon: Star },
      { label: 'Hour Top 3', color: 'bg-gradient-to-r from-orange-600 to-orange-800', icon: Trophy },
    ],
    daily: [
      { label: 'Daily Top 1', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: Crown },
      { label: 'Daily Top 2-3', color: 'bg-gradient-to-r from-blue-400 to-blue-600', icon: Star },
      { label: 'Daily Top 4-10', color: 'bg-gradient-to-r from-purple-500 to-purple-700', icon: Trophy },
    ],
    weekly: [
      { label: 'Week Top 1', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: Crown },
      { label: 'Week Top 2-3', color: 'bg-gradient-to-r from-red-500 to-red-700', icon: Star },
      { label: 'Week Top 4-10', color: 'bg-gradient-to-r from-red-400 to-red-600', icon: Trophy },
    ]
  };

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10 relative z-20">
        {/* Tap to Join Banner */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-1.5 flex items-center justify-between border-b border-cyan-500/10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
              <Plus size={12} className="text-black" />
            </div>
            <p className="text-[9px] font-black text-cyan-400 uppercase tracking-tight">New host ❤️ support me</p>
          </div>
          <button className="bg-cyan-400 text-black px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg shadow-cyan-400/20">
            Tap to Join
          </button>
        </div>

        <div className="px-4 py-2 flex items-center justify-center border-b border-white/5">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
            <span className="text-sm">🇺🇸</span>
            United States 
            <ChevronDown size={12} />
          </button>
        </div>
        <div className="px-4 pt-4 pb-2 flex items-center justify-center gap-12">
          <button 
            onClick={() => setActiveTab('hosts')}
            className={cn(
              "text-sm font-black uppercase italic tracking-widest transition-all pb-2 border-b-2",
              activeTab === 'hosts' ? "text-white border-orange-500" : "text-white/40 border-transparent"
            )}
          >
            Beans Got
          </button>
          <button 
            onClick={() => setActiveTab('givers')}
            className={cn(
              "text-sm font-black uppercase italic tracking-widest transition-all pb-2 border-b-2",
              activeTab === 'givers' ? "text-white border-orange-500" : "text-white/40 border-transparent"
            )}
          >
            Gifts sent
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-[#121212]/60 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex items-center justify-center gap-8 py-4 bg-[#1a1a1a]/50">
          {[
            { id: 'hourly', label: 'This Hour' },
            { id: 'daily', label: 'Today' },
            { id: 'weekly', label: 'This Week' }
          ].map(range => (
            <button 
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                timeRange === range.id ? "text-orange-500" : "text-white/20 hover:text-white/40"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Rewards Section (Gifts Sent only) */}
        {activeTab === 'givers' && (
          <div className="p-4 bg-gradient-to-b from-[#1a1a1a] to-transparent">
            <div className="flex flex-col items-center mb-4">
              <div className="w-full h-32 bg-white/5 rounded-2xl mb-4 flex items-center justify-center border border-white/5 overflow-hidden relative group">
                <img src="https://picsum.photos/seed/leaderboard/400/200" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
              </div>
              <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline">
                About rules &gt;
              </button>
            </div>

            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 text-center">
              Rewards : Identity Label {timeRange === 'weekly' ? '& Entrance Effect' : timeRange === 'daily' ? '& Pendant' : ''}
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              {rewards[timeRange].map((reward, i) => (
                <div key={i} className={cn("px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg", reward.color)}>
                  <reward.icon size={12} className="text-white" />
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">{reward.label}</span>
                </div>
              ))}
            </div>
            
            {/* Top 1-3 Preview */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-pulse" />
                <img 
                  src={top3[0]?.photoURL || "https://picsum.photos/seed/top1/100/100"} 
                  className="w-full h-full rounded-full object-cover p-1"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[8px] font-black">
                  NO.1-3
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pb-24">
          <div className="space-y-3">
            {data.map((user, i) => (
              <div 
                key={user.uid} 
                onClick={() => showToast(`Viewing ${user.displayName}'s profile...`, 'info')}
                className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer active:scale-[0.98]"
              >
                <div className="w-6 flex flex-col items-center">
                  {i < 3 ? (
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black italic",
                      i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-slate-400 text-black" : "bg-orange-700 text-white"
                    )}>
                      {i + 1}
                    </div>
                  ) : (
                    <span className="text-xs font-black italic text-white/20">{i + 1}</span>
                  )}
                </div>
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden">
                    <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/60/60`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  {i % 3 === 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-black px-1.5 py-0.5 rounded-full text-[6px] font-black flex items-center gap-0.5 shadow-lg">
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-1.5 bg-black rounded-full" />
                        <div className="w-0.5 h-1.5 bg-black rounded-full" />
                      </div>
                      LIVE
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black italic uppercase tracking-tight text-sm truncate">{user.displayName}</p>
                    <LevelBadge level={user.level} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black italic text-orange-500">
                    {activeTab === 'hosts' ? (
                      <>
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                        {user.totalBeansEarned.toLocaleString()}
                      </>
                    ) : (
                      <>
                        <Diamond size={10} className="text-cyan-400" fill="currentColor" />
                        {user.totalDiamondsSpent.toLocaleString()}
                      </>
                    )}
                  </div>
                </div>
                
                <button className="p-2 text-cyan-400 hover:scale-110 transition-transform">
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
