import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Room } from '../types';
import { cn } from '../lib/utils';
import { Users, MapPin, Signal, Search, User as UserIcon, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const RoomCard = React.memo(({ room }: { room: Room }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate(`/room/${room.id}`)}
      className="relative aspect-[4/5] bg-slate-900 rounded-md overflow-hidden cursor-pointer shadow-sm"
    >
      <img 
        src={`https://picsum.photos/seed/${room.id}/400/500`} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      
      {/* Top Info */}
      <div className="absolute top-1 left-1">
        <div className="bg-cyan-500/90 backdrop-blur-sm p-0.5 rounded-sm">
          <Signal size={8} className="text-white" />
        </div>
      </div>

      <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/30 backdrop-blur-sm px-1 py-0.5 rounded-full">
        <Users size={8} className="text-white" />
        <span className="text-[8px] font-bold text-white">{room.viewerCount}</span>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-1.5 left-1.5">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-1 py-0.5 rounded-sm flex items-center gap-0.5">
          <UserIcon size={7} className="text-white" />
          <span className="text-[7px] font-black text-white uppercase tracking-tighter">Lv.{20 + (room.id.length % 20)}</span>
        </div>
      </div>
    </motion.div>
  );
});

RoomCard.displayName = 'RoomCard';

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const tabs = ['Nearby', 'Popular', 'Featured', 'Explore', 'Music', 'Gaming', 'Chat', 'Dance', 'Beauty'];
  const scrollRef = useRef<HTMLDivElement>(null);

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
      console.error("Error fetching rooms:", error);
      // Fallback: Fetch all rooms if the live query fails
      onSnapshot(query(collection(db, 'rooms'), limit(20)), (snap) => {
        setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
      });
    });
    return () => unsub();
  }, []);

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
          (err) => console.error("Location error:", err)
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

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10">
        {/* Floor 1: Logo and Icons Row */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase">BINGO LIVE</h1>
          <div className="flex items-center gap-4 text-white/70">
            <Search size={20} className="cursor-pointer" />
            <div className="relative">
              <Bell size={20} className="cursor-pointer" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-pink-500 rounded-full border border-[#1a1a1a]" />
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
                    ? "bg-[#333333] text-white shadow-sm ring-1 ring-white/20" 
                    : "bg-[#222222] text-white/40 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area - Only scrolls vertically */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-0.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5">
          {filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        {filteredRooms.length === 0 && (
          <div className="text-center py-10 text-white/20 italic text-[9px]">
            No rooms found...
          </div>
        )}
      </main>
    </div>
  );
}
