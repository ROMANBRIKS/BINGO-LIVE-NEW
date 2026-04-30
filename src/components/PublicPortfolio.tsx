import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Eye, Heart, Share2, Download, 
  ExternalLink, Diamond, Users, MessageCircle, ShieldCheck,
  ChevronLeft, Copy, Plus, Settings, Sparkles, MapPin, Globe, 
  Scale, Ruler, Star, MoreHorizontal
} from 'lucide-react';
import { generateEnhancedImageUrl } from '../lib/imageProcessor';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, Family } from '../types';
import { LevelBadge } from './LevelBadge';
import { NobleBadge } from './NobleBadge';
import { SVIPBadge } from './SVIPBadge';
import { FamilyDetailsPopup } from './FamilyDetailsPopup';
import { FamilyCreatePopup } from './FamilyCreatePopup';
import { getFamilyRankInfo } from '../lib/familyLogic';

export const PublicPortfolio: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'status' | 'dino'>('status');
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);
  
  const isOwner = auth.currentUser?.uid === user?.uid;
  
  useEffect(() => {
    let userUnsub: (() => void) | undefined;
    let familyUnsub: (() => void) | undefined;

    async function fetchUser() {
      if (!uid) return;
      try {
        userUnsub = onSnapshot(doc(db, 'users', uid), (userDoc) => {
          if (userDoc.exists()) {
            const userData = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
            setUser(userData);

            if (userData.familyId) {
              if (familyUnsub) familyUnsub();
              familyUnsub = onSnapshot(doc(db, 'families', userData.familyId), (familyDoc) => {
                if (familyDoc.exists()) {
                  setFamily({ id: familyDoc.id, ...familyDoc.data() } as Family);
                }
              });
            }
          }
        });
      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
    return () => {
      if (userUnsub) userUnsub();
      if (familyUnsub) familyUnsub();
    };
  }, [uid]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const compactNumber = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0';
    if (val >= 1000000) {
      const formatted = (val / 1000000).toFixed(2);
      return formatted.endsWith('.00') ? Math.floor(val / 1000000) + 'M' : formatted + 'M';
    }
    if (val >= 1000) {
      const formatted = (val / 1000).toFixed(2);
      return formatted.endsWith('.00') ? Math.floor(val / 1000) + 'K' : formatted + 'K';
    }
    return val.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#2af5ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-6xl font-black mb-4 text-[#2af5ff]">404</h1>
        <p className="text-white/40 mb-8 font-black uppercase tracking-[0.2em] text-xs">Target Not Found</p>
        <Link to="/" className="bg-[#2af5ff] text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(42,245,255,0.3)]">
          Return Home
        </Link>
      </div>
    );
  }

  const posts = [
    { id: 1, type: 'video', views: '24.5k', likes: '1.2k', thumbnail: 'https://picsum.photos/seed/p1/600/800', date: '1 month ago' },
    { id: 2, type: 'video', views: '18.2k', likes: '942', thumbnail: 'https://picsum.photos/seed/p2/600/800', date: '2 months ago' },
  ];

  const galleryThumbnails = [
    'https://picsum.photos/seed/g1/200/200',
    'https://picsum.photos/seed/g2/200/200',
    'https://picsum.photos/seed/g3/200/200',
    'https://picsum.photos/seed/g4/200/200',
  ];

  const DEFAULT_FAMILY: Family = {
    id: '2much-ic3',
    name: '2 MUCH IC3',
    badge: 'https://img.icons8.com/color/96/sword.png',
    ownerUid: 'system',
    description: '2 MUCH ICE IS BASED ON LOYALTY RESPECT AND DA BAG .WE ARGUE WE FUSS WE FIX WE...',
    memberCount: 28,
    memberLimit: 360,
    totalDiamondsSpent: 8500000,
    combatPoints: 3543887,
    monthlyPoints: 989048,
    monthlyTarget: 1000000,
    level: 13,
    tier: 'Gold',
  };

  const [showCreateFamily, setShowCreateFamily] = useState(false);

  return (
    <div className="min-h-screen bg-white font-roboto pb-24 max-w-lg mx-auto shadow-2xl">
      {/* Cover & Gallery Area */}
      <div className="relative">
        <div className="h-64 overflow-hidden relative">
          <img 
            src={generateEnhancedImageUrl({ url: user.photoURL, width: 800, quality: 90 })} 
            className="w-full h-full object-cover blur-2xl scale-110 opacity-40" 
            alt="Cover Blur"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white" />
        </div>

        {/* Global Action Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
          <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
              <Share2 size={20} />
            </button>
            <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Top Floating Gallery - Cloned from Video */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center gap-1.5 z-10 overflow-x-auto pb-1 scrollbar-hide">
          {galleryThumbnails.map((thumb, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-lg flex-shrink-0"
            >
              <img src={thumb} className="w-full h-full object-cover" alt="Album" />
            </motion.div>
          ))}
          <div className="w-24 h-14 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 flex flex-col items-center justify-center gap-1 flex-shrink-0 ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-[#2af5ff] rounded-sm flex items-center justify-center">
                <Play size={10} className="text-black fill-black" />
              </div>
              <span className="text-[11px] font-black text-white">Room</span>
            </div>
            <span className="text-[8px] font-bold text-white/60">Live Now</span>
          </div>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="px-5 pt-3 space-y-4">
        {/* User Identity Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-black tracking-tight">{user.displayName}</h1>
              <div className="flex items-center gap-1">
                <span className="text-[#3b82f6] text-sm">♂</span>
                <span className="text-xs font-black text-blue-500/50 bg-blue-50 px-1 rounded">39</span>
              </div>
              {user.nobleTitle && user.nobleTitle !== 'None' && (
                <div className="w-5 h-5">
                  <NobleBadge tier={user.nobleTitle} size="sm" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
              <span>ID: {user.uid.slice(0, 10)}</span>
              <button onClick={() => copyToClipboard(user.uid)} className="hover:text-[#2af5ff]">
                <Copy size={12} />
              </button>
            </div>
          </div>

          {/* SVIP Shimmer Effect on Profile Circle */}
          <div className="relative group">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-2 bg-gradient-to-br from-yellow-400/30 via-transparent to-purple-500/30 blur-xl opacity-60 rounded-full"
            />
            <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-br from-[#ffd700] via-[#fff] to-[#ffd700] shadow-xl relative z-10">
              <img 
                src={generateEnhancedImageUrl({ url: user.photoURL, width: 200, quality: 95 })} 
                className="w-full h-full rounded-full object-cover"
                alt="Profile"
              />
              {user.svipStatus && (
                <div className="absolute -bottom-1 -right-1 z-20">
                  <SVIPBadge tier={user.svipStatus.tier} size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 pt-2">
          {[
            { label: 'Fans', value: compactNumber(user.fans) },
            { label: 'Following', value: compactNumber(user.following) },
            { label: 'Beans', value: compactNumber(user.totalBeansEarned) },
            { label: 'Diamonds', value: compactNumber(user.diamonds) },
          ].map((stat, i) => (
            <div key={i} className="flex items-baseline gap-1">
              <span className="text-[18px] font-black text-black tracking-tighter">{stat.value}</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Status/Accolade Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <LevelBadge level={user.level || 67} className="h-4 pr-2" />
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
            <NobleBadge tier={user.nobleTitle || 'King'} size="sm" />
            <span className="text-[10px] font-black text-yellow-600 uppercase italic">King</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
            <span className="text-[10px]">🎨</span>
            <span className="text-[10px] font-black text-gray-500 uppercase">Artist</span>
          </div>
        </div>

        {/* Interaction Cards (The Big Buttons) */}
        <div className={cn(
          "grid gap-3 pt-2",
          (user.familyId || isOwner) ? "grid-cols-2" : "grid-cols-1"
        )}>
          {/* Family Card */}
          {user.familyId ? (
            <button 
              onClick={() => setShowFamilyDetails(true)}
              className="bg-[#f8fafc] rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-all text-left w-full"
            >
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center overflow-hidden">
                <img src="https://img.icons8.com/color/96/sword.png" className="w-7 h-7" alt="Clan" />
              </div>
              <div>
                <h4 className="text-[12px] font-black text-slate-800 leading-none truncate uppercase tracking-tighter">
                  {family?.name || user.familyName || 'Loading...'}
                </h4>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-black text-amber-500 uppercase italic">
                    {family ? `${getFamilyRankInfo(family.combatPoints || 0).tier} ${getFamilyRankInfo(family.combatPoints || 0).level}` : 'Rank ---'}
                  </span>
                  <div className="w-10 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-500" 
                      style={{ width: `${family ? getFamilyRankInfo(family.combatPoints || 0).progressPercent : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          ) : isOwner ? (
            <button 
              onClick={() => setShowCreateFamily(true)}
              className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/50 shadow-sm flex items-center gap-3 hover:bg-indigo-100/50 transition-all text-left w-full group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-indigo-900 leading-none uppercase tracking-tighter">Start Tribe</h4>
                <span className="text-[8px] font-bold text-indigo-400 uppercase mt-1 block">Create Family</span>
              </div>
            </button>
          ) : null}

          {/* Contribution Card */}
          <div className="bg-[#f8fafc] rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/100?u=fan${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-[11px] font-black text-slate-400 italic">Contribution</span>
          </div>
        </div>
      </div>

      {/* Tabs View */}
      <div className="mt-8">
        <div className="flex border-b border-slate-50 px-5 gap-8">
          {['Profile', 'Status', 'Dino'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={cn(
                "py-3 text-[14px] font-black transition-all relative",
                activeTab === tab.toLowerCase() ? "text-black" : "text-slate-300"
              )}
            >
              {tab}
              {activeTab === tab.toLowerCase() && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#2af5ff] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Star size={14} className="text-amber-500" />, label: 'Taurus' },
                  { icon: <Ruler size={14} className="text-blue-500" />, label: '208CM' },
                  { icon: <Scale size={14} className="text-purple-500" />, label: '129KG' },
                  { icon: <MapPin size={14} className="text-green-500" />, label: 'United States' },
                  { icon: <Globe size={14} className="text-red-500" />, label: 'English' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    {item.icon}
                    <span className="text-[12px] font-black text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Personal Label</h4>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 w-fit">
                  <span className="text-sm">👋 New friends</span>
                </div>
              </div>

              <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden relative shadow-lg group">
                <img 
                  src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600" 
                  className="w-full h-full object-cover" 
                  alt="Promo" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-5 flex flex-col justify-center">
                  <h3 className="text-white font-black text-xl italic tracking-tight">Life Restart Test</h3>
                  <p className="text-white/60 text-xs font-bold mt-1">Start a new life now ›</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-8">
              {posts.map((post) => (
                <div key={post.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800">{user.displayName}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{post.date}</p>
                    </div>
                  </div>
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-100 shadow-xl group">
                    <img src={post.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex flex-col justify-end p-5">
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1.5 text-white animate-pulse">
                          <Share2 size={24} strokeWidth={2.5} />
                        </button>
                        <button className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-white">
                          <Download size={22} strokeWidth={2.5} />
                        </button>
                        <button className="ml-auto flex items-center gap-2 group/heart">
                          <Heart size={28} className="text-white group-hover/heart:fill-red-500 group-hover/heart:text-red-500 transition-all" strokeWidth={2.5} />
                          <span className="text-[14px] font-black text-white">{post.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isOwner && (
                <button className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-black text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Plus size={20} />
                  UPLOAD NEW TALENT
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Family Details & Create Popups */}
      <AnimatePresence>
        {showFamilyDetails && (
          <FamilyDetailsPopup 
            family={family || DEFAULT_FAMILY} 
            onClose={() => setShowFamilyDetails(false)} 
          />
        )}
        {showCreateFamily && (
          <FamilyCreatePopup onClose={() => setShowCreateFamily(false)} />
        )}
      </AnimatePresence>

      {/* Persistent Support Bar - VISITOR ONLY */}
      {!isOwner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-[#2af5ff] text-white py-4 rounded-2xl font-black shadow-[0_10px_40px_rgba(42,245,255,0.4)] flex items-center justify-center gap-3"
            >
              <Diamond size={20} className="fill-white" />
              SUPPORT TALENT
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-[#ff3b30]"
            >
              <Heart size={24} fill="currentColor" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};
