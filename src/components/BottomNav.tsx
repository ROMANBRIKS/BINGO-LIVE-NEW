import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home as HomeIcon, Users, Video, MessageCircle, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export const BottomNav = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const isStreamPage = location.pathname.startsWith('/room/') || location.pathname === '/go-live';
  if (isStreamPage) return null;

  return (
    <>
      <div className={cn(
        "fixed bottom-0 left-0 right-0 h-12 flex items-center justify-around px-2 z-50 sm:hidden transition-colors duration-300",
        isLight ? "bg-white border-t border-black/5" : "bg-[#1a1a1a] border-t border-white/5"
      )}>
        <button 
          onClick={() => navigate('/')}
          className={cn(
            "flex flex-col items-center gap-0 transition-colors", 
            location.pathname === '/' 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <HomeIcon size={20} />
          <span className="text-[8px] font-bold">Live</span>
        </button>
        <button 
          onClick={() => navigate('/party')}
          className={cn(
            "flex flex-col items-center gap-0 transition-colors", 
            location.pathname === '/party' 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <Users size={20} />
          <span className="text-[8px] font-bold">Party</span>
        </button>
        <button 
          onClick={() => navigate('/go-live')}
          className="relative -mt-5"
        >
          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black shadow-lg shadow-cyan-400/20 active:scale-95 transition-transform">
            <Video size={22} />
          </div>
        </button>
        <button 
          onClick={() => navigate('/chats')}
          className={cn(
            "flex flex-col items-center gap-0 relative transition-colors", 
            (location.pathname === '/chats' || location.pathname === '/messages') 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <div className="relative">
            <MessageCircle size={20} className={cn((location.pathname === '/chats' || location.pathname === '/messages') && (isLight ? "fill-black" : "fill-white"))} />
            <div className={cn(
              "absolute -top-1 -right-2 bg-pink-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full border",
              isLight ? "border-white" : "border-[#1a1a1a]"
            )}>
              24
            </div>
          </div>
          <span className="text-[8px] font-bold">Chats</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={cn(
            "flex flex-col items-center gap-0 relative transition-colors", 
            location.pathname === '/profile' 
              ? (isLight ? "text-black" : "text-white") 
              : (isLight ? "text-black/30" : "text-white/40")
          )}
        >
          <div className="relative">
            <UserIcon size={20} />
            <div className={cn(
              "absolute top-0 right-0 w-1 h-1 bg-pink-500 rounded-full border",
              isLight ? "border-white" : "border-[#1a1a1a]"
            )} />
          </div>
          <span className="text-[8px] font-bold">Me</span>
        </button>
      </div>
    </>
  );
});

BottomNav.displayName = 'BottomNav';
