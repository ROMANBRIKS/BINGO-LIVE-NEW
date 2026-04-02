import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home as HomeIcon, Trophy, Users, Star, Flame, TrendingUp, Search, Plus } from 'lucide-react';
import { GoLiveModal } from './GoLiveModal';
import { AnimatePresence } from 'framer-motion';

export const Sidebar = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGoLive, setShowGoLive] = useState(false);

  const menuItems = [
    { icon: HomeIcon, label: 'Live', path: '/' },
    { icon: Trophy, label: 'Top', path: '/leaderboard' },
    { icon: Users, label: 'Follow', path: '/following' },
    { icon: Star, label: 'VIP', path: '/vip' },
    { icon: Flame, label: 'PK', path: '/pk' },
    { icon: TrendingUp, label: 'Hot', path: '/hot' },
  ];

  return (
    <>
      <aside className="hidden sm:flex sticky top-0 h-screen w-20 md:w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex-col p-4 z-40 shrink-0">
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <button 
              key={i}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-2xl transition-all group",
                location.pathname === item.path 
                  ? "bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={24} className="shrink-0" />
              <span className="hidden md:block text-xs font-black uppercase italic tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
          <div className="hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 px-3">Top Hosts</p>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  onClick={() => alert(`Viewing Top Host ${i}'s profile...`)}
                  className="flex items-center gap-3 px-3 group cursor-pointer active:scale-95 transition-all"
                >
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/host${i}/64/64`} className="w-8 h-8 rounded-full border border-white/10 group-hover:scale-110 transition-transform" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white/80 truncate group-hover:text-white transition-colors">Top Host {i}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest">Lv.42</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => setShowGoLive(true)}
            className="w-full bg-gradient-to-br from-orange-500 to-pink-500 p-4 rounded-2xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            <span className="hidden md:block text-xs font-black uppercase italic tracking-widest">Go Live</span>
          </button>
        </div>
      </aside>
      <AnimatePresence>
        {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
      </AnimatePresence>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
