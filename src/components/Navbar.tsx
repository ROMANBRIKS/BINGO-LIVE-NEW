import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, LANGUAGES, LanguageCode } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { Search, Bell, Diamond, Coins, Plus, Trophy, Globe } from 'lucide-react';

export const Navbar = React.memo(() => {
  const { profile } = useAuth();
  const { showToast, unreadCount, clearUnread } = useToast();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isStreamPage = location.pathname.startsWith('/room/') || location.pathname === '/go-live';
  if (isStreamPage) return null;

  if (!profile) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#050505] flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-3">
        <div 
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          </div>
        </div>

        {/* Rapid manual language selector built right in the header for fast location override */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-2.5 py-1.5 hover:border-cyan-400/50 transition-all">
          <Globe size={12} className="text-cyan-400" />
          <select
            value={language}
            onChange={(e) => {
              const selected = e.target.value as LanguageCode;
              setLanguage(selected);
              showToast(`App language switched! 🌐`, "success");
            }}
            className="bg-transparent text-white font-black text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-zinc-950 text-white font-sans text-xs">
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <Diamond size={20} className="text-cyan-400" />
        </button>
        <button 
          onClick={() => navigate('/leaderboard')}
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <Trophy size={20} className="text-yellow-400" />
        </button>
        <button 
          onClick={() => navigate('/')}
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <Search size={24} />
        </button>
        <button 
          onClick={() => {
            clearUnread();
            showToast(`You have ${unreadCount} new notifications! 🔔`, 'info');
          }}
          className="p-2 text-white/80 hover:text-white transition-colors relative"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
