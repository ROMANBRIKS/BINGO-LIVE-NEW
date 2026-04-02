import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Search, Bell, Diamond, Coins, Plus, Trophy } from 'lucide-react';

export const Navbar = React.memo(() => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#050505] flex items-center justify-between px-4 z-50">
      <div className="flex items-center">
        <div 
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          </div>
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
          onClick={() => navigate('/chats')}
          className="p-2 text-white/80 hover:text-white transition-colors relative"
        >
          <Bell size={24} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
        </button>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
