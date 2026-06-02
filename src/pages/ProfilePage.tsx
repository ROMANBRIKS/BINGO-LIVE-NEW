import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { 
  Settings as SettingsIcon, Wallet, Briefcase, Calendar, ShoppingBag, FileText, Star, CheckCircle, 
  ChevronRight, Bell, BarChart2, HelpCircle, TrendingUp, LogOut, User as UserIcon, UserPlus,
  Diamond, Coins, Shield, Zap, Crown, Home as HomeIcon, Mic, Video, MessageSquare, Plus,
  Users2, Monitor, Heart, Eye, Share2, Copy, MapPin, Moon, Sun, X, ChevronLeft, Sparkles, Trophy, Gift,
  LayoutGrid, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LevelBadge } from '../components/LevelBadge';
import { UserDiscoveryPopup } from '../components/UserDiscoveryPopup';
import { GoLiveModal } from '../components/GoLiveModal';
import { FamilyCreatePopup } from '../components/FamilyCreatePopup';
import { FamilyDetailsPopup } from '../components/FamilyDetailsPopup';
import { getFamilyRankInfo } from '../lib/familyLogic';
import { onSnapshot } from 'firebase/firestore';
import { Family } from '../types';

export default function ProfilePage() {
  const { profile, user, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [showGoLive, setShowGoLive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New settings & discovery states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [discoveredUsers, setDiscoveredUsers] = useState<any[]>([]);
  const [selectedDiscoveredUser, setSelectedDiscoveredUser] = useState<any>(null);
  const [editingDisplayName, setEditingDisplayName] = useState(profile?.displayName || '');
  const [savingSettings, setSavingSettings] = useState(false);

  React.useEffect(() => {
    if (profile?.displayName) {
      setEditingDisplayName(profile.displayName);
    }
  }, [profile?.displayName]);

  React.useEffect(() => {
    if (showDiscovery) {
      const fetchUsers = async () => {
        try {
          const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
          const list = usersSnap.docs
            .map(d => ({ uid: d.id, ...d.data() }))
            .filter((u: any) => u.uid !== profile?.uid);
          setDiscoveredUsers(list);
        } catch (err) {
          console.error("Discovery users load error:", err);
        }
      };
      fetchUsers();
    }
  }, [showDiscovery, profile?.uid]);

  React.useEffect(() => {
    if (profile?.familyId) {
      setLoadingFamily(true);
      const unsub = onSnapshot(doc(db, 'families', profile.familyId), (docSnap) => {
        if (docSnap.exists()) {
          setFamilyData({ id: docSnap.id, ...docSnap.data() } as Family);
        }
        setLoadingFamily(false);
      }, (error) => {
        console.error("Error fetching family real-time:", error);
        setLoadingFamily(false);
      });
      return () => unsub();
    }
  }, [profile?.familyId]);

  if (!profile) return null;

  const isAdmin = (profile?.role === 'admin') || 
                  (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                  (user?.email === 'rogershep101@gmail.com');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const isLight = theme === 'light';

  return (
    <div className={cn(
      "flex flex-col h-full overflow-hidden transition-colors duration-300",
      isLight ? "bg-[#f8f8f8] text-black" : "bg-[#050505] text-white"
    )}>
      {/* Fixed Top Navigation */}
      <header className={cn(
        "flex-none w-full border-b transition-colors duration-300 px-4 pt-4 pb-2",
        isLight ? "bg-white border-black/5" : "bg-[#1a1a1a] border-white/10"
      )}>
        <div className="flex items-center justify-between">
          <h1 className={cn("text-lg font-black tracking-tighter uppercase", isLight ? "text-black" : "text-white")}>
            BINGO LIVE
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-1 active:scale-95 transition-transform" title="Toggle Theme">
              {isLight ? <Moon size={20} className="text-black/70" /> : <Sun size={20} className="text-white/70" />}
            </button>
            <button onClick={() => setShowDiscovery(true)} className="p-1 active:scale-95 transition-transform" title="User Discovery">
              <UserPlus size={20} className={isLight ? "text-cyan-600 font-bold" : "text-cyan-400 font-bold"} />
            </button>
            <button onClick={() => setShowSettingsModal(true)} className="p-1 active:scale-95 transition-transform" title="Settings">
              <Settings size={20} className={isLight ? "text-black/70" : "text-white/70"} />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-6 space-y-6">
        
        {/* User Card */}
        <div className={cn(
          "relative p-6 rounded-[2.5rem] overflow-hidden border transition-all shadow-xl",
          isLight ? "bg-white border-black/5" : "bg-[#1a1a1a] border-white/5"
        )}>
          {/* Visitor Pill */}
          <div 
            onClick={() => navigate('/visitors')}
            className="absolute top-4 right-4 rounded-full px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <div className="p-0.5 bg-cyan-400 rounded-full">
              <Eye size={8} className="text-black" />
            </div>
            <span className="text-[9px] font-black text-cyan-400 uppercase">visitor: 42</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {/* Avatar with Progress */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full border-4 border-cyan-400/20 bg-gray-800 flex items-center justify-center overflow-hidden">
                {profile.photoURL ? (
                  <img src={profile.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Me" />
                ) : (
                  <UserIcon size={32} className="text-white/20" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-cyan-400 rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#1a1a1a]">
                <Plus size={14} className="text-black" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none mb-1">{profile.displayName}</h2>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] text-gray-500 font-medium">ID: {profile.uid.slice(0, 10)}</p>
                <Copy size={12} className="text-gray-500 hover:text-cyan-400 cursor-pointer" onClick={() => {
                  navigator.clipboard.writeText(profile.uid.slice(0, 10));
                  showToast("ID copied!", "success");
                }} />
              </div>
              <div className="flex items-center gap-2">
                <LevelBadge level={profile.level} />
                <button 
                  onClick={() => navigate(`/u/${profile.uid}`)}
                  className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1 ml-auto"
                >
                  View Public Profile <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-cyan-400/50">
              <span className="italic">Level Progress</span>
              <span>75%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Friends', value: 9, path: '/friends' },
            { label: 'Following', value: profile.following || 392, path: '/following' },
            { label: 'Fans', value: profile.fans || 32, growth: '+12', path: '/fans' },
          ].map((stat, i) => (
            <div 
              key={i} 
              onClick={() => navigate(stat.path)}
              className={cn(
                "text-center py-2 rounded-xl cursor-pointer transition-all duration-200 active:scale-95",
                isLight ? "hover:bg-stone-100" : "hover:bg-zinc-900/40"
              )}
            >
              <div className="flex items-center justify-center gap-1">
                <p className={cn("text-lg font-black", isLight ? "text-black" : "text-white")}>
                  {(stat.value ?? 0).toLocaleString()}
                </p>
                {stat.growth && (
                  <span className="text-[10px] font-black text-red-500">{stat.growth}</span>
                )}
              </div>
              <p className="text-[11px] font-medium text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* The Big Three Bingo Cards */}
        <div className="grid grid-cols-3 gap-2 py-2">
          {/* Level Card */}
          <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/40 border border-teal-500/30 flex flex-col items-center justify-center gap-1 overflow-hidden group cursor-pointer active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-teal-400 uppercase italic">Lv.{profile.level}</span>
            <div className="absolute inset-0 bg-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* VIP Card */}
          <div 
            onClick={() => navigate('/vip')}
            className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/40 border border-amber-500/30 flex flex-col items-center justify-center gap-1 overflow-hidden group cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
              <Crown size={20} fill="currentColor" />
            </div>
            <span className="text-[9px] font-black text-amber-400 uppercase italic leading-tight text-center">Purchase VIP</span>
            <div className="absolute inset-0 bg-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Family Card */}
          <div 
            onClick={() => {
              if (profile.familyId) {
                setShowFamilyDetails(true);
              } else {
                setShowCreateFamily(true);
              }
            }}
            className={cn(
              "relative aspect-[4/3] rounded-2xl border flex flex-col items-center justify-center gap-1 overflow-hidden group cursor-pointer active:scale-95 transition-all text-center px-1",
              profile.familyId 
                ? "bg-gradient-to-br from-orange-800/20 to-orange-900/40 border-orange-800/30" 
                : "bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 border-indigo-500/20"
            )}
          >
            {profile.familyId ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-orange-400/20 flex items-center justify-center text-orange-400 mb-1">
                  <Shield size={20} fill="currentColor" />
                </div>
                <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-tighter truncate w-full px-2">
                  {familyData?.name || 'Loading...'}
                </h4>
                <span className="text-[8px] font-black text-orange-500/60 uppercase tracking-widest italic leading-none">
                  {familyData ? `${getFamilyRankInfo(familyData.combatPoints || 0).tier} ${getFamilyRankInfo(familyData.combatPoints || 0).level}` : '...'}
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm border border-indigo-500/10 mb-1">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase italic">Start Tribe</span>
                <span className="text-[7px] font-bold text-indigo-400/40 uppercase tracking-widest">Create Family</span>
              </>
            )}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
              profile.familyId ? "bg-orange-400/5" : "bg-indigo-400/5"
            )} />
          </div>
        </div>

        {/* Action Grid (Headers) */}
        <div className="flex overflow-x-auto scrollbar-hide gap-3 py-2">
          {[
            { icon: Wallet, label: 'Wallet', path: '/wallet', color: 'bg-orange-500' },
            { icon: Briefcase, label: 'Creator', path: '/creator-center', color: 'bg-cyan-500' },
            { icon: ShoppingBag, label: 'Store', path: '/store', color: 'bg-yellow-500' },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex-none w-20 aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 border transition-all active:scale-95",
                isLight ? "bg-white border-black/5" : "bg-[#1a1a1a] border-white/5"
              )}
            >
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Migration Portal */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/migration')}
          className="relative h-24 rounded-[2rem] overflow-hidden cursor-pointer group shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 animate-gradient-x" />
          <div className="absolute inset-0 flex items-center justify-between px-6">
            <div>
              <h3 className="text-xl font-black text-black italic tracking-tighter uppercase leading-none">Migration Portal</h3>
              <p className="text-[8px] font-black text-black/50 uppercase tracking-widest">Claim your Bingo/TikTok Status Match</p>
            </div>
            <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Enter</div>
          </div>
        </motion.div>

        {/* Account Management List (Bingo Style) */}
        <div className="space-y-1">
          <MenuItem 
            icon={Briefcase} 
            label="Creator Center" 
            desc="Tools for broadcasters" 
            onClick={() => navigate('/creator-center')}
            color="text-cyan-400" 
            bg="bg-cyan-400/10" 
          />
          
          <MenuItem 
            icon={Zap} 
            label="Event Center" 
            desc="Latest platform activities" 
            onClick={() => navigate('/migration')}
            color="text-teal-400" 
            bg="bg-teal-400/10" 
            badge={<div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] overflow-hidden">✨</div>}
          />

          <div className="h-4" /> {/* Section Spacer */}

          <MenuItem 
            icon={Wallet} 
            label="Wallet" 
            desc="Diamonds & Bean balance" 
            onClick={() => navigate('/wallet')}
            color="text-orange-500" 
            bg="bg-orange-500/10" 
          />

          <MenuItem 
            icon={ShoppingBag} 
            label="Item Bag" 
            desc="Your props & collectibles" 
            onClick={() => navigate('/store')}
            color="text-amber-500" 
            bg="bg-amber-500/10" 
            status="2"
          />

          <MenuItem 
            icon={FileText} 
            label="Post" 
            desc="My social feed activity" 
            onClick={() => navigate('/posts')}
            color="text-pink-500" 
            bg="bg-pink-500/10" 
          />

          <div className="h-4" /> {/* Section Spacer */}

          <MenuItem 
             icon={Crown} 
             label="SVIP Center" 
             desc="Redeem points & special rewards" 
             onClick={() => navigate('/svip')}
             color="text-yellow-500" 
             bg="bg-yellow-500/10" 
          />

          <MenuItem 
             icon={Sparkles} 
             label="Noble Center" 
             desc="VIP identity & honors" 
             onClick={() => navigate('/noble-center')}
             color="text-cyan-400" 
             bg="bg-cyan-400/10" 
          />

          <MenuItem 
            icon={Monitor} 
            label="Earnings Studio" 
            desc="Withdraw & Analytics" 
            onClick={() => navigate('/earnings-dashboard')}
            color="text-green-500" 
            bg="bg-green-500/10" 
          />

          <MenuItem 
             icon={Calendar} 
             label="Task Center" 
             desc="Daily goals & rewards" 
             onClick={() => navigate('/tasks')}
             color="text-orange-400" 
             bg="bg-orange-400/10" 
             badge={<div className="bg-fuchsia-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Challenger</div>}
          />

          <MenuItem 
             icon={Heart} 
             label="Fans Group" 
             desc="Manage your community" 
             onClick={() => navigate('/fan-club-center')}
             color="text-pink-500" 
             bg="bg-pink-500/10" 
          />

          <MenuItem 
             icon={Users2} 
             label="Family Dashboard" 
             desc={profile.familyId ? "Manage your organization" : "Join or Create a Family"} 
             onClick={() => {
               if (profile.familyId) {
                 navigate('/family-dashboard');
               } else {
                 setShowCreateFamily(true);
               }
             }}
             color="text-purple-500" 
             bg="bg-purple-500/10" 
          />

          <MenuItem 
             icon={Trophy} 
             label="Ranking" 
             desc="Global & Regional lists" 
             onClick={() => navigate('/leaderboard')}
             color="text-cyan-400" 
             bg="bg-cyan-400/10" 
             status="Out of 100"
          />

          <div className="h-4" /> {/* Section Spacer */}

          {isAdmin && (
            <MenuItem 
              icon={Shield} 
              label="Admin Dashboard" 
              desc="Platform oversight" 
              onClick={() => navigate('/admin')}
              color="text-red-500" 
              bg="bg-red-500/10" 
            />
          )}

          <MenuItem 
             icon={HelpCircle} 
             label="Help & Feedback" 
             desc="Support center" 
             onClick={() => navigate('/support')}
             color="text-blue-500" 
             bg="bg-blue-500/10" 
          />

          <button 
            onClick={logout}
            className={cn(
              "w-full p-4 rounded-3xl flex items-center justify-between border transition-all active:scale-[0.99] group mt-6",
              isLight ? "bg-white border-black/5" : "bg-[#1a1a1a] border-white/5"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <LogOut size={24} />
              </div>
              <div className="text-left">
                <h4 className="text-base font-black italic uppercase tracking-tight">Log Out</h4>
                <p className="text-[10px] font-medium text-gray-500 leading-none mt-0.5">Safely exit your session</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
        {showPreview && (
          <UserDiscoveryPopup 
            user={profile} 
            onClose={() => setShowPreview(false)} 
          />
        )}
        {showCreateFamily && (
          <FamilyCreatePopup onClose={() => setShowCreateFamily(false)} />
        )}
        {showFamilyDetails && familyData && (
          <FamilyDetailsPopup 
            family={familyData} 
            onClose={() => setShowFamilyDetails(false)} 
          />
        )}

        {/* Extended Account Settings Modal */}
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-sm rounded-[32px] overflow-hidden p-6 border shadow-2xl space-y-4",
                isLight ? "bg-white border-black/10 text-black" : "bg-[#181818] border-white/10 text-white"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black italic uppercase tracking-wider">Account Settings</h3>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</label>
                <input 
                  type="text"
                  value={editingDisplayName}
                  onChange={(e) => setEditingDisplayName(e.target.value)}
                  placeholder="Enter Display Name"
                  className={cn(
                    "w-full p-3.5 rounded-2xl outline-none font-bold text-sm border focus:ring-2",
                    isLight ? "bg-slate-100 border-black/10 focus:ring-orange-500" : "bg-black/40 border-white/10 focus:ring-[#2af5ff]"
                  )}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settings Sandbox</label>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-light-divider">
                    <span className="font-bold text-slate-400">Push Notifications</span>
                    <input type="checkbox" defaultChecked className="accent-teal-500 w-4 h-4 cursor-pointer" />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-light-divider">
                    <span className="font-bold text-slate-400">Sound Effects</span>
                    <input type="checkbox" defaultChecked className="accent-teal-500 w-4 h-4 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  disabled={savingSettings}
                  onClick={async () => {
                    if (!profile?.uid) return;
                    setSavingSettings(true);
                    try {
                      await updateDoc(doc(db, 'users', profile.uid), {
                        displayName: editingDisplayName
                      });
                      showToast("Profile Updated Successfully!", "success");
                      setShowSettingsModal(false);
                    } catch (err) {
                      showToast("Failed to save configuration.", "error");
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase bg-[#2af5ff] text-black hover:scale-105 active:scale-95 transition-all"
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Dynamic User Discovery Drawer Overlay */}
        {showDiscovery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-sm rounded-[32px] overflow-hidden p-6 border shadow-2xl flex flex-col h-[75vh]",
                isLight ? "bg-white border-black/10 text-black" : "bg-[#181818] border-white/10 text-white"
              )}
            >
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <UserPlus size={20} className="text-[#2af5ff]" />
                  <h3 className="text-lg font-black italic uppercase tracking-wider">Discover Talents</h3>
                </div>
                <button 
                  onClick={() => setShowDiscovery(false)}
                  className="p-1.5 rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Header */}
              <div className="mt-4 flex-shrink-0">
                <input 
                  type="text"
                  value={discoveryQuery}
                  onChange={(e) => setDiscoveryQuery(e.target.value)}
                  placeholder="Search creators by Display Name..."
                  className={cn(
                    "w-full p-3 rounded-2xl outline-none font-bold text-xs border focus:ring-2",
                    isLight ? "bg-slate-100 border-black/10 focus:ring-orange-500" : "bg-black/40 border-white/10 focus:ring-[#2af5ff]"
                  )}
                />
              </div>

              {/* Discovered Users List */}
              <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 scrollbar-hide text-left">
                {discoveredUsers
                  .filter((u: any) => !discoveryQuery || u.displayName?.toLowerCase().includes(discoveryQuery.toLowerCase()))
                  .map((u: any) => (
                    <div 
                      key={u.uid}
                      className={cn(
                        "p-3 rounded-2xl flex items-center justify-between border",
                        isLight ? "bg-slate-50 border-black/5 hover:bg-slate-100" : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.photoURL || `https://picsum.photos/seed/${u.uid}/64/64`}
                          className="w-10 h-10 rounded-full border border-white/10 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left">
                          <h4 className="text-xs font-black italic uppercase tracking-tight truncate max-w-[120px]">{u.displayName || "Anonymous"}</h4>
                          <p className="text-[8px] font-bold text-slate-400">Lv.{u.level || 1} • {u.role || 'user'}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedDiscoveredUser(u)}
                        className="px-3.5 py-1.5 bg-[#2af5ff] text-black text-[9px] font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Profile Card
                      </button>
                    </div>
                  ))}
                {discoveredUsers.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <p className="text-xs font-bold font-mono">No new creators online</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Selected Discovered User Mini Popup */}
        {selectedDiscoveredUser && (
          <UserDiscoveryPopup 
            user={selectedDiscoveredUser}
            onClose={() => setSelectedDiscoveredUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, label, desc, onClick, color, bg, badge, status }: any) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3.5 flex items-center justify-between group transition-all duration-300",
        isLight ? "hover:bg-gray-50" : "hover:bg-[#151515]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", bg, color)}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <h4 className="text-sm font-black italic uppercase tracking-tight leading-none mb-1">{label}</h4>
          <p className="text-[10px] font-medium text-gray-500 leading-none">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status && <span className="text-[10px] font-bold text-gray-500">{status}</span>}
        {badge}
        <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
}
