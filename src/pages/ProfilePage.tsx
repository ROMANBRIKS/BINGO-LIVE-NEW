import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { 
  Settings, Wallet, Briefcase, Calendar, ShoppingBag, FileText, Star, CheckCircle, 
  ChevronRight, Bell, BarChart2, HelpCircle, TrendingUp, LogOut, User as UserIcon,
  Diamond, Coins, Shield, Zap, Crown, Home as HomeIcon, Mic, Video, MessageSquare, Plus,
  Users2, Monitor, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LevelBadge } from '../components/LevelBadge';
import { NobleBadge } from '../components/NobleBadge';
import { getUserNobleStatus } from '../nobleLogic';
import { SVIPBadge } from '../components/SVIPBadge';
import { checkExpirationAlerts, formatExpirationCountdown } from '../NobleExpirationSystem';

import { GoLiveModal } from '../components/GoLiveModal';

export default function ProfilePage() {
  const { profile, user, logout } = useAuth();
  const { showToast, unreadCount, clearUnread } = useToast();
  const navigate = useNavigate();
  const [showGoLive, setShowGoLive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const isAdmin = (profile?.role === 'admin') || 
                  (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                  (user?.email === 'rogershep101@gmail.com');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      showToast("Please select an image file.", 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size should be less than 5MB.", 'error');
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${profile.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL
      });

      showToast("Profile picture updated! ✨", 'success');
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload image. Please try again.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const lastPurchaseDate = profile.lastNoblePurchaseDate?.toDate ? profile.lastNoblePurchaseDate.toDate() : (profile.lastNoblePurchaseDate ? new Date(profile.lastNoblePurchaseDate) : new Date());
  const nobleStatus = getUserNobleStatus(profile.totalDiamondsSpent, lastPurchaseDate);
  const expirationAlert = checkExpirationAlerts(nobleStatus);

  const handleRecharge = async () => {
    // Mock recharge logic
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        diamonds: increment(1000)
      }, { merge: true });
      showToast("Recharged 1,000 Diamonds! 💎", 'success');
    } catch (error) {
      console.error("Recharge error:", error);
    }
  };

  const menuItems = [
    { icon: Monitor, label: 'Creator Center', color: 'text-cyan-400', bg: 'bg-cyan-400/10', path: '/creator-center' },
    { icon: Calendar, label: 'Event Center', color: 'text-cyan-400', bg: 'bg-cyan-400/10', thumbnail: 'https://picsum.photos/seed/event/100/60' },
    { icon: Wallet, label: 'Wallet', color: 'text-orange-500', bg: 'bg-orange-500/10', path: '/wallet' },
    { icon: ShoppingBag, label: 'Item Bag', color: 'text-yellow-500', bg: 'bg-yellow-500/10', badge: 'PROPS STORE', path: '/store' },
    { icon: FileText, label: 'Post', color: 'text-cyan-400', bg: 'bg-cyan-400/10', path: '/posts' },
    { icon: Crown, label: 'SVIP', color: 'text-yellow-400', bg: 'bg-white/5', path: '/svip' },
    { icon: CheckCircle, label: 'Task Center', color: 'text-yellow-500', bg: 'bg-yellow-500/10', badge: 'Challenger', path: '/tasks' },
    { icon: Heart, label: 'Fans Group', color: 'text-pink-400', bg: 'bg-pink-400/10', path: '/fans' },
    { icon: BarChart2, label: 'Ranking', color: 'text-cyan-400', bg: 'bg-cyan-400/10', path: '/leaderboard', status: 'Out of 100' },
    { icon: HelpCircle, label: 'Help & Feedback', color: 'text-white/40', bg: 'bg-white/5' },
  ];

  if (isAdmin) {
    menuItems.unshift({ icon: Shield, label: 'Admin Dashboard', color: 'text-red-500', bg: 'bg-red-500/10', path: '/admin', badge: 'MASTER' });
  }

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase">BINGO LIVE</h1>
          <motion.button 
            onClick={() => showToast("Settings coming soon! ⚙️", 'info')}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/5 backdrop-blur-lg rounded-full text-white/40 border border-white/10 hover:bg-white/10 transition-all shadow-lg"
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Profile Info */}
        <div className="p-6 pt-8 flex flex-col items-center relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          {/* Visitor Pill */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/visitors')}
            className={cn(
              "absolute top-4 right-4 rounded-full px-4 py-1.5 flex items-center gap-2 cursor-pointer transition-all group scale-90 relative overflow-hidden",
              "bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)]">
              <Users2 size={12} className="text-black" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tight drop-shadow-md">visitor: 36</span>
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#121212] shadow-lg">2</div>
          </motion.div>

          <div className="relative mb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center text-3xl font-black text-white/20 border-4 border-white/5 shadow-2xl overflow-hidden cursor-pointer relative group"
            >
              {isUploading ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : null}
              {profile.photoURL ? (
                <img src={profile.photoURL} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -top-2 -right-2 bg-cyan-400 text-black text-[8px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
              Have new visitors!
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-cyan-400 rounded-full border-2 border-[#121212] flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight mb-2">{profile.displayName}</h2>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <LevelBadge level={profile.level} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Bingo ID: {profile.uid.slice(0, 8)}</span>
              </div>
              {/* XP Progress Bar */}
              <div className="w-48 space-y-1">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                  <span>Level Progress</span>
                  <span>1,250 / 5,000 XP</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '25%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Banner */}
          <motion.div 
            whileTap={{ scale: 0.98, filter: 'brightness(1.2)' }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full mb-8 rounded-2xl p-4 flex items-center justify-between group cursor-pointer relative overflow-hidden transition-all",
              "bg-[#1a1a1a] border border-white/10 shadow-2xl",
              "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.05] before:to-transparent"
            )}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Plus size={20} />
              </div>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-tight">Upload more photos to let more people know you</p>
            </div>
            <ChevronRight size={18} className="text-white/20 group-hover:text-white/60 transition-transform relative z-10" />
          </motion.div>

          {/* Stats Row */}
          <div className="flex items-center gap-12 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black italic">{profile.friends}</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Friends</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black italic">{profile.following}</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Following</span>
            </div>
            <div className="flex flex-col items-center relative">
              <span className="text-xl font-black italic">{profile.fans}</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Fans</span>
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[8px] font-bold px-1 rounded-sm">+7</span>
            </div>
          </div>

          {/* Badge Row */}
          <div className="flex items-center gap-3 mb-10">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <LevelBadge level={profile.level} />
              <span className="text-[8px] font-black text-white/40 uppercase">Lv.{profile.level}</span>
            </motion.div>
            <motion.div 
              whileTap={{ scale: 0.9, filter: 'brightness(1.2)' }}
              onClick={() => navigate('/vip')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all",
                "bg-[#1a1a1a] border border-white/10 shadow-xl",
                "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.05] before:to-transparent"
              )}>
                <span className="text-orange-500 font-black italic text-xl drop-shadow-lg">V</span>
              </div>
              <span className="text-[8px] font-black text-white/40 uppercase">Purchase VIP</span>
            </motion.div>
            <motion.div 
              whileTap={{ scale: 0.9, filter: 'brightness(1.2)' }}
              onClick={() => navigate('/family-leaderboard')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all",
                "bg-[#1a1a1a] border border-white/10 shadow-xl",
                "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.05] before:to-transparent"
              )}>
                <Users2 size={24} className="text-green-500 drop-shadow-lg" />
              </div>
              <span className="text-[8px] font-black text-white/40 uppercase">Family</span>
            </motion.div>
            <motion.div 
              whileTap={{ scale: 0.9, filter: 'brightness(1.2)' }}
              onClick={() => navigate('/honor-hall')}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all",
                "bg-[#1a1a1a] border border-white/10 shadow-xl",
                "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.05] before:to-transparent"
              )}>
                <Crown size={24} className="text-yellow-500 drop-shadow-lg" />
              </div>
              <span className="text-[8px] font-black text-white/40 uppercase">Honor Hall</span>
            </motion.div>
          </div>
        </div>

        {/* Menu List */}
        <div className="px-4">
          <div className="bg-black rounded-[2.5rem] overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10">
            {/* High-Gloss Mirror Reflections */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.15] via-transparent to-transparent h-[40%] pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none z-20" />
            
            {menuItems.filter(item => item.label !== 'Help & Feedback').map((item, i) => (
              <motion.div 
                key={i}
                whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.03)' }}
                onClick={() => item.path ? navigate(item.path) : showToast(`${item.label} coming soon!`, 'info')}
                className="flex items-center justify-between p-5 transition-all cursor-pointer group relative"
              >
                {/* Subtle separator line (very faint) */}
                {i !== 0 && <div className="absolute top-0 left-6 right-6 h-[1px] bg-white/[0.03]" />}
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden",
                    item.bg, item.color,
                    "border border-white/10 shadow-lg"
                  )}>
                    {/* Icon Gloss */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <item.icon size={22} className="relative z-10 drop-shadow-lg" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black italic uppercase tracking-tighter text-base text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg border border-white/20",
                        item.label === 'Item Bag' ? "bg-yellow-500 text-black" : "bg-purple-500 text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  {item.thumbnail && (
                    <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                      <img src={item.thumbnail} className="w-14 h-10 object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                    </div>
                  )}
                  {item.status && <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{item.status}</span>}
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
                    <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Help & Feedback Section */}
        <div className="px-4 mt-6">
          <div className="bg-black rounded-[2rem] overflow-hidden relative border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.1] via-transparent to-transparent h-[40%] pointer-events-none" />
            {menuItems.filter(item => item.label === 'Help & Feedback').map((item, i) => (
              <motion.div 
                key={i}
                whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.03)' }}
                onClick={() => showToast(`${item.label} coming soon!`, 'info')}
                className="flex items-center justify-between p-5 transition-all cursor-pointer group relative"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 relative overflow-hidden", item.bg, item.color)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                    <item.icon size={20} className="relative z-10" />
                  </div>
                  <span className="font-black italic uppercase tracking-tight text-sm text-white/60">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-white/10 group-hover:text-white/40 transition-colors relative z-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-6">
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className={cn(
            "w-full py-4 rounded-[2rem] font-black uppercase italic tracking-widest transition-all relative overflow-hidden",
            "bg-white/5 backdrop-blur-xl border border-white/10 text-white/20 hover:text-red-500 hover:border-red-500/30",
            "shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10">Log Out</span>
        </motion.button>
      </div>
      <AnimatePresence>
        {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
      </AnimatePresence>
    </div>
  );
}
