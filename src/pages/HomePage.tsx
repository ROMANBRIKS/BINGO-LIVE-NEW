import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Room } from '../types';
import { cn } from '../lib/utils';
import { Users, MapPin, Signal, Search, User as UserIcon, Bell, BarChart2, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Sparkles } from 'lucide-react';
import { WeeklyKing } from '../components/WeeklyKing';
import { getAIStreamRecommendations, RecommendationResponse } from '../services/aiRecommendationService';
import { UserProfile } from '../types';
import { getDocs, getDoc, doc } from 'firebase/firestore';
import { SEOHeaders } from '../components/SEOHeaders';
import { UserDiscoveryPopup } from '../components/UserDiscoveryPopup';

const RoomCard = React.memo(({ room, aiReason, onShowProfile }: { room: Room, aiReason?: string, onShowProfile?: (uid: string) => void }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const categories = ['Chat', 'Music', 'Gaming', 'Dance', 'Beauty', 'Emotional'];
  const category = categories[room.id.length % categories.length];
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative aspect-[1/1] overflow-hidden cursor-pointer group transition-colors duration-300",
        isLight ? "bg-white" : "bg-[#1a1a1a]"
      )}
    >
      {/* Background Click navigates to room */}
      <div className="absolute inset-0 z-0" onClick={() => navigate(`/room/${room.id}`)} />

      <img 
        src={`https://picsum.photos/seed/${room.id}/400/400`} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      
      {/* Top Left: Category */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-sm border border-white/10 z-10 pointer-events-none">
        <BarChart2 size={10} className="text-white/60" />
        <span className="text-[9px] font-black uppercase tracking-tighter text-white/90">{category}</span>
      </div>

      {/* Top Right: Viewer Count */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-10 pointer-events-none">
        <Users size={10} className="text-white/60" />
        <span className="text-[9px] font-black text-white">{room.viewerCount || Math.floor(Math.random() * 100)}</span>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 z-10">
        {aiReason && (
          <div className="bg-cyan-500/80 backdrop-blur-md px-1.5 py-0.5 rounded-sm flex items-center gap-1 mb-1 border border-cyan-400/50">
            <BrainCircuit size={8} className="text-white" />
            <span className="text-[7px] font-black text-white uppercase truncate">{aiReason}</span>
          </div>
        )}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onShowProfile?.(room.hostUid);
          }}
          className="flex items-center gap-1.5 group/info"
        >
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20 shadow-lg group-hover/info:scale-110 transition-transform">
            <UserIcon size={8} className="text-white" />
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Lv.{20 + (room.id.length % 20)}</span>
          </div>
          <span className="text-[10px] font-black text-white truncate drop-shadow-md uppercase tracking-tight group-hover/info:text-cyan-400 transition-colors">
            {room.title || "Welcome to my live!"}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

RoomCard.displayName = 'RoomCard';

export default function HomePage() {
  const { showToast, unreadCount, clearUnread } = useToast();
  const { profile, user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [weeklyKing, setWeeklyKing] = useState<UserProfile | null>(null);
  const [aiRecs, setAiRecs] = useState<RecommendationResponse[]>([]);
  const [activeTab, setActiveTab] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  // Profile Discovery State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const cachedProfiles = useRef<Record<string, UserProfile>>({});

  const tabs = ['Nearby', 'Popular', 'Featured', 'Explore', 'Music', 'Gaming', 'Chat', 'Dance', 'Beauty'];
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchHostProfile = async (uid: string) => {
    if (cachedProfiles.current[uid]) {
      setSelectedUser(cachedProfiles.current[uid]);
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const u = { uid: snap.id, ...snap.data() } as UserProfile;
        cachedProfiles.current[uid] = u;
        setSelectedUser(u);
      } else {
        showToast("User profile not found.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading profile.", 'error');
    }
  };

  useEffect(() => {
    // Simplified query to avoid index issues and ensure consistent loading
    const q = query(
      collection(db, 'rooms'), 
      where('status', '==', 'live'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const roomList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Room));
      // Sort in memory to avoid index requirements
      roomList.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
      setRooms(roomList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
      // Fallback: Fetch all rooms if the live query fails
      onSnapshot(query(collection(db, 'rooms'), limit(20)), (snap) => {
        setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'rooms_fallback');
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Fetch Weekly King (Top Bean Earner)
    const fetchKing = async () => {
      const q = query(collection(db, 'users'), orderBy('totalBeansEarned', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setWeeklyKing({ uid: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile);
      }
    };
    fetchKing();
  }, []);

  useEffect(() => {
    // Run AI recommendations when rooms are loaded
    if (rooms.length > 0 && aiRecs.length === 0) {
      const runAiRecs = async () => {
        // Fetch profiles for the top rooms to give AI context
        const profiles: Record<string, UserProfile> = {};
        const topHostUids = Array.from(new Set(rooms.slice(0, 10).map(r => r.hostUid)));
        
        await Promise.all(topHostUids.map(async (uid) => {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) {
            profiles[uid] = { uid: snap.id, ...snap.data() } as UserProfile;
          }
        }));

        const recs = await getAIStreamRecommendations(rooms.slice(0, 20), profiles);
        setAiRecs(recs);
      };
      runAiRecs();
    }
  }, [rooms.length]);

  // Drag to scroll logic for desktop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => isDown = false;
    const onMouseUp = () => isDown = false;
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'Nearby' && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => {
            console.error("Location error:", err);
            showToast("Could not access location. Nearby rooms will not be sorted by distance.", 'warning');
          }
        );
      }
    }
  }, [activeTab, userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostUid?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'Nearby') {
      return room.latitude !== null && room.longitude !== null;
    }

    return true;
  }).sort((a, b) => {
    if (activeTab === 'Nearby' && userLocation) {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude || 0, a.longitude || 0);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude || 0, b.longitude || 0);
      return distA - distB;
    }
    return (b.viewerCount || 0) - (a.viewerCount || 0);
  });

  const isAdmin = (profile?.role === 'admin') || 
                  (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                  (user?.email === 'rogershep101@gmail.com');

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none relative">
      <SEOHeaders 
        title="Bingo Live - Global Gifting & Live Streaming Platform"
        description="The elite live streaming community for USA, UK, Europe, Australia and Ireland. Join professional creators, engage in interactive rooms, and experience advanced digital gifting."
        keywords="live streaming USA, professional streamers UK, social broadcasting Europe, creator monetization Australia, live gifting app Ireland, global social platform"
      />
      {isAdmin && (
        <button 
          onClick={() => navigate('/admin')}
          className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all border-4 border-white/20 group"
        >
          <Shield size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-12 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest italic">
            Admin Dashboard
          </div>
        </button>
      )}
      {/* Fixed Top Navigation */}
      <header className={cn(
        "flex-none w-full border-b transition-colors duration-300",
        isLight ? "bg-white border-black/5" : "bg-[#1a1a1a] border-white/10"
      )}>
        {/* Floor 1: Logo and Icons Row */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className={cn("text-lg font-black tracking-tighter uppercase", isLight ? "text-black" : "text-white")}>BINGO LIVE</h1>
          <div className={cn("flex items-center gap-4", isLight ? "text-black/70" : "text-white/70")}>
            <Search size={20} className="cursor-pointer" />
            <div className="relative">
              <Bell 
                size={20} 
                className={cn("cursor-pointer transition-colors", isLight ? "hover:text-black" : "hover:text-white")} 
                onClick={() => {
                  if (unreadCount > 0) {
                    showToast(`You have ${unreadCount} new notifications! 🔔`, 'info');
                    clearUnread();
                  } else {
                    showToast("No new notifications! ✨", 'info');
                  }
                }}
              />
              {unreadCount > 0 && (
                <div className={cn(
                  "absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] font-bold px-1 rounded-full border",
                  isLight ? "border-white" : "border-[#1a1a1a]"
                )}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floor 2: Scrollable Tabs Row */}
        <div 
          ref={scrollRef}
          className="w-full overflow-x-auto scrollbar-hide touch-pan-x pb-3 pt-1 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2 px-4 w-max">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap",
                  activeTab === tab 
                    ? (isLight ? "bg-black text-white shadow-sm ring-1 ring-black/10" : "bg-[#333333] text-white shadow-sm ring-1 ring-white/20") 
                    : (isLight ? "bg-gray-100 text-gray-500 hover:text-black" : "bg-[#222222] text-white/40 hover:text-white")
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area - Only scrolls vertically */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Migration Portal Banner */}
        <div className="px-4 pt-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/migration')}
            className="relative h-24 rounded-2xl overflow-hidden cursor-pointer group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 animate-gradient-x" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <div className="absolute inset-0 flex items-center justify-between px-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-black" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">Migration Protocol</span>
                </div>
                <h3 className="text-xl font-black text-black italic tracking-tighter uppercase leading-none">Status Match Center</h3>
                <p className="text-[9px] font-black text-black/50 uppercase tracking-widest">Migrate from Bigo/TikTok • Get King Status</p>
              </div>
              <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-colors shadow-xl">
                Start Now
              </div>
            </div>
            {/* Gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </motion.div>
        </div>

        {/* Weekly King Spotlight */}
        <div className="px-4 py-4">
          <WeeklyKing user={weeklyKing} type="Host" />
        </div>

        {/* AI Recommendations Section */}
        {aiRecs.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                <BrainCircuit size={16} className="text-cyan-400" />
              </div>
              <h3 className={cn("text-xs font-black uppercase italic tracking-widest", isLight ? "text-gray-400" : "text-white/60")}>
                AI Match for you
              </h3>
            </div>
            <div className={cn(
              "grid grid-cols-2 gap-0.5 rounded-2xl overflow-hidden border shadow-[0_0_20px_rgba(6,182,212,0.1)]",
              isLight ? "border-cyan-500/10" : "border-cyan-500/20"
            )}>
              {aiRecs.slice(0, 2).map(rec => {
                const room = rooms.find(r => r.id === rec.recommendedRoomId);
                if (!room) return null;
                return <RoomCard key={room.id} room={room} aiReason={rec.reason} onShowProfile={fetchHostProfile} />;
              })}
            </div>
          </div>
        )}

        {/* Banner Section */}
        <div className="px-4 py-3">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-pink-600 shadow-2xl group cursor-pointer">
            <img 
              src="https://picsum.photos/seed/bingogala/800/400" 
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h3 className="text-2xl font-black italic tracking-tighter text-white leading-none mb-1">BINGO 10TH</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Anniversary Gala</p>
            </div>
            <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="text-[8px] font-black uppercase tracking-widest text-white">Live Now</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 px-0.5">
          {filteredRooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onShowProfile={fetchHostProfile}
              aiReason={aiRecs.find(rec => rec.recommendedRoomId === room.id)?.reason} 
            />
          ))}
        </div>
        {filteredRooms.length === 0 && (
          <div className="text-center py-10 text-white/20 italic text-[9px]">
            No rooms found...
          </div>
        )}
      </main>

      {/* User Info Popup */}
      <UserDiscoveryPopup 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
}
