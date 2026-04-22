import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home as HomeIcon, Trophy, Users, Star, Flame, TrendingUp, Search, Plus, Shield, Briefcase } from 'lucide-react';
import { GoLiveModal } from './GoLiveModal';
import { AnimatePresence } from 'motion/react';

export const Sidebar = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { profile, user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [showGoLive, setShowGoLive] = useState(false);

  const isAdmin = (profile?.role === 'admin') || 
                  (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                  (user?.email === 'rogershep101@gmail.com');

  const isAgency = profile?.role === 'agency';

  const isStreamPage = location.pathname.startsWith('/room/') || location.pathname === '/go-live';
  if (isStreamPage) return null;

  const menuItems = [
    { icon: HomeIcon, label: 'Live', path: '/' },
    { icon: Trophy, label: 'Top', path: '/leaderboard' },
    { icon: Users, label: 'Follow', path: '/following' },
    { icon: Star, label: 'VIP', path: '/vip' },
    { icon: Flame, label: 'PK', path: '/pk' },
    { icon: TrendingUp, label: 'Hot', path: '/hot' },
  ];

  if (isAgency) {
    menuItems.push({ icon: Briefcase, label: 'Agency', path: '/agency-dashboard' });
  }

  if (isAdmin) {
    menuItems.push({ icon: Shield, label: 'Admin', path: '/admin' });
  }

  return (
    <>
      <aside className={cn(
        "hidden sm:flex sticky top-0 h-screen w-20 md:w-64 flex-col p-4 z-40 shrink-0 transition-colors duration-300",
        isLight ? "bg-white border-r border-black/5" : "bg-black/40 backdrop-blur-xl border-r border-white/5"
      )}>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-2xl transition-all group",
                location.pathname === item.path 
                  ? "bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)]" 
                  : (isLight ? "text-black/40 hover:text-black hover:bg-black/5" : "text-white/40 hover:text-white hover:bg-white/5")
              )}
            >
              <item.icon size={24} className="shrink-0" />
              <span className="hidden md:block text-xs font-black uppercase italic tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <div className={cn("mt-8 pt-8 border-t space-y-6", isLight ? "border-black/5" : "border-white/5")}>
          <div className="hidden md:block">
            <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-4 px-3", isLight ? "text-black/20" : "text-white/20")}>Top Hosts</p>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div 
                  key={`top-host-${i}`} 
                  onClick={() => showToast(`Viewing Top Host ${i}'s profile...`, 'info')}
                  className="flex items-center gap-3 px-3 group cursor-pointer active:scale-95 transition-all"
                >
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/host${i}/64/64`} className={cn("w-8 h-8 rounded-full border group-hover:scale-110 transition-transform", isLight ? "border-black/10" : "border-white/10")} />
                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2", isLight ? "border-white" : "border-black")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[10px] font-bold truncate transition-colors", isLight ? "text-black/80 group-hover:text-black" : "text-white/80 group-hover:text-white")}>Top Host {i}</p>
                    <p className={cn("text-[8px] uppercase tracking-widest", isLight ? "text-black/20" : "text-white/20")}>Lv.42</p>
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
