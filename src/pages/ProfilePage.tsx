import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { 
  Settings, Wallet, Briefcase, Calendar, ShoppingBag, FileText, Star, CheckCircle, 
  ChevronRight, Bell, BarChart2, HelpCircle, TrendingUp, LogOut, User as UserIcon,
  Diamond, Coins, Shield, Zap, Crown, Home as HomeIcon, Mic, Video, MessageSquare, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelBadge } from '../components/LevelBadge';

import { GoLiveModal } from '../components/GoLiveModal';

export default function ProfilePage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [showGoLive, setShowGoLive] = useState(false);

  if (!profile) return null;

  const handleRecharge = async () => {
    // Mock recharge logic
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        diamonds: increment(1000)
      }, { merge: true });
      alert("Recharged 1,000 Diamonds! 💎");
    } catch (error) {
      console.error("Recharge error:", error);
    }
  };

  const menuItems = [
    { icon: Wallet, label: 'Wallet', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { icon: Briefcase, label: 'Agency Center', color: 'text-blue-500', bg: 'bg-blue-500/10', path: '/creator-center' },
    { icon: Calendar, label: 'Events', color: 'text-pink-500', bg: 'bg-pink-500/10', badge: 'NEW' },
    { icon: ShoppingBag, label: 'Shop', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: FileText, label: 'Task Center', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { icon: Star, label: 'VIP Center', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: CheckCircle, label: 'Verification', color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Bell, label: 'Notifications', color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: BarChart2, label: 'Analytics', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { icon: HelpCircle, label: 'Support', color: 'text-slate-500', bg: 'bg-slate-500/10' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24 sm:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white p-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform cursor-pointer">
                <img src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/128/128`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <button 
                onClick={() => alert("Edit profile picture coming soon! 📸")}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90 transition-all"
              >
                <Plus size={12} />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black italic uppercase tracking-tight">{profile.displayName}</h2>
                <LevelBadge level={profile.level} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {profile.uid.substring(0, 8)}</p>
            </div>
          </div>
          <button 
            onClick={() => alert("Settings coming soon! ⚙️")}
            className="p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div 
            onClick={() => alert("Friends list coming soon! 👥")}
            className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="text-lg font-black italic">{profile.friends}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Friends</span>
          </div>
          <div 
            onClick={() => navigate('/following')}
            className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="text-lg font-black italic">{profile.following}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Following</span>
          </div>
          <div 
            onClick={() => alert("Fans list coming soon! 📣")}
            className="flex flex-col items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="text-lg font-black italic">{profile.fans}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fans</span>
          </div>
        </div>

        {/* Wallet Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-black rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Diamond size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Diamonds</p>
                  <p className="text-xl font-black italic">{profile.diamonds.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Coins size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Beans</p>
                  <p className="text-xl font-black italic">{profile.beans.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleRecharge}
              className="px-6 py-3 bg-orange-500 rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Recharge
            </button>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="p-6 space-y-2">
        {menuItems.map((item, i) => (
          <div 
            key={i}
            onClick={() => item.path ? navigate(item.path) : alert(`${item.label} feature coming soon! 🚀`)}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                <item.icon size={20} />
              </div>
              <span className="font-black italic uppercase tracking-tight text-sm text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              {item.badge && (
                <div className="w-16 h-8 bg-blue-500 rounded-lg overflow-hidden">
                  <img src="https://picsum.photos/seed/event/64/32" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </div>
              )}
              {item.label === 'Task Center' && (
                <span className="bg-pink-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold">Challenger</span>
              )}
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-6">
        <button 
          onClick={logout}
          className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 font-black uppercase italic tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
        >
          Log Out
        </button>
      </div>
      <AnimatePresence>
        {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
      </AnimatePresence>
    </div>
  );
}
