import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home as HomeIcon, Users, Video, MessageCircle, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#1a1a1a] flex items-center justify-around px-2 z-50 border-t border-white/5 sm:hidden">
        <button 
          onClick={() => navigate('/')}
          className={cn("flex flex-col items-center gap-0", location.pathname === '/' ? "text-white" : "text-white/40")}
        >
          <HomeIcon size={20} />
          <span className="text-[8px] font-bold">Live</span>
        </button>
        <button 
          onClick={() => navigate('/party')}
          className={cn("flex flex-col items-center gap-0", location.pathname === '/party' ? "text-white" : "text-white/40")}
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
          className={cn("flex flex-col items-center gap-0 relative", (location.pathname === '/chats' || location.pathname === '/messages') ? "text-white" : "text-white/40")}
        >
          <div className="relative">
            <MessageCircle size={20} className={cn((location.pathname === '/chats' || location.pathname === '/messages') && "fill-white")} />
            <div className="absolute -top-1 -right-2 bg-pink-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full border border-[#1a1a1a]">
              24
            </div>
          </div>
          <span className="text-[8px] font-bold">Chats</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={cn("flex flex-col items-center gap-0 relative", location.pathname === '/profile' ? "text-white" : "text-white/40")}
        >
          <div className="relative">
            <UserIcon size={20} />
            <div className="absolute top-0 right-0 w-1 h-1 bg-pink-500 rounded-full border border-[#1a1a1a]" />
          </div>
          <span className="text-[8px] font-bold">Me</span>
        </button>
      </div>
    </>
  );
});

BottomNav.displayName = 'BottomNav';
