import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MoreHorizontal, Lock, Zap, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

type StoreTab = 
  | 'Featured' | 'Profile Card Set' | 'Exclusive BINGO ID' | 'Medal' 
  | 'Pendant' | 'Entrance Effect' | 'Badge' | 'Video Call Frame' 
  | 'Profile Skin' | 'Bullet Skin' | 'Comment Bubble' | 'Floating Screen' 
  | 'Multi-guest Frame' | 'Audio Circle' | 'Background';

interface StoreItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  duration: string;
}

const STORE_ITEMS: Record<StoreTab, StoreItem[]> = {
  'Featured': [
    { id: 'f1', name: 'Adventure Bubble', icon: '💬', price: 60, duration: '3 days' },
    { id: 'f2', name: 'Dragon Message', icon: '🐲', price: 80, duration: '3 days' },
    { id: 'f3', name: 'Star', icon: '⭐', price: 50, duration: '3 days' },
    { id: 'f4', name: 'Moneybags', icon: '💰', price: 100, duration: '3 days' },
    { id: 'f5', name: 'Destory', icon: '💥', price: 300, duration: '3 days' },
    { id: 'f6', name: 'Gemstone crown', icon: '👑', price: 100, duration: '3 days' },
  ],
  'Exclusive BINGO ID': [
    { id: 'id1', name: 'ID: 777', icon: '🆔', price: 600000, duration: '30 days' },
    { id: 'id2', name: 'ID: 888', icon: '🆔', price: 800000, duration: '30 days' },
  ],
  'Medal': [
    { id: 'm1', name: 'Medal', icon: '🏅', price: 50, duration: '3 days' },
    { id: 'm2', name: 'Amethyst', icon: '💎', price: 40, duration: '3 days' },
  ],
  'Pendant': [
    { id: 'p1', name: 'Moneybags', icon: '⭕', price: 100, duration: '3 days' },
    { id: 'p2', name: 'Gemstone crown', icon: '👑', price: 100, duration: '3 days' },
  ],
  'Entrance Effect': [
    { id: 'e1', name: 'Destory', icon: '🚀', price: 400, duration: '3 days' },
    { id: 'e2', name: 'Jeep', icon: '🚙', price: 400, duration: '3 days' },
  ],
  'Badge': [
    { id: 'b1', name: 'Taurus', icon: '♉', price: 80, duration: '3 days' },
    { id: 'b2', name: 'Crush Rose', icon: '🌹', price: 60, duration: '3 days' },
    { id: 'b3', name: 'Superstar officer', icon: '👮', price: 80, duration: '3 days' },
  ],
  'Profile Card Set': [],
  'Video Call Frame': [],
  'Profile Skin': [],
  'Bullet Skin': [],
  'Comment Bubble': [],
  'Floating Screen': [],
  'Multi-guest Frame': [],
  'Audio Circle': [],
  'Background': []
};

export default function PropsStorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StoreTab>('Featured');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(STORE_ITEMS['Featured'][0]);

  const tabs: StoreTab[] = [
    'Featured', 'Profile Card Set', 'Exclusive BINGO ID', 'Medal', 
    'Pendant', 'Entrance Effect', 'Badge', 'Video Call Frame', 
    'Profile Skin', 'Bullet Skin', 'Comment Bubble', 'Floating Screen', 
    'Multi-guest Frame', 'Audio Circle', 'Background'
  ];

  return (
    <div className="flex flex-col bg-[#f8f9fa] h-full overflow-hidden select-none">
      {/* Header & Preview Area */}
      <div className="relative h-[280px] shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e0f7fa] to-white" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#00e5ff_0%,transparent_70%)]" />
        </div>
        
        <div className="relative z-10 pt-12 px-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform">
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1 bg-black/5 rounded-full px-3 py-1">
              <span className="text-xs font-black text-gray-800">0</span>
              <Zap size={12} className="text-yellow-500" fill="currentColor" />
            </div>
            <button className="p-1"><MoreHorizontal size={24} className="text-gray-800" /></button>
          </div>
        </div>

        {/* Preview Display */}
        <div className="relative z-10 flex flex-col items-center justify-center mt-4">
          <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center relative">
            <div className="absolute inset-0 border-4 border-cyan-400 rounded-full animate-pulse" />
            <span className="text-4xl">{selectedItem?.icon || '👤'}</span>
            {selectedItem && (
              <div className="absolute -bottom-2 bg-cyan-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                Preview
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-lg font-black text-gray-800 italic uppercase tracking-tight">
              {selectedItem?.name || 'Select an item'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {selectedItem ? `${selectedItem.duration} duration` : 'Choose from the store below'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 shrink-0">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-3">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-sm font-bold whitespace-nowrap transition-all relative pb-1",
                activeTab === tab ? "text-gray-900" : "text-gray-400"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="storeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <div className="grid grid-cols-3 gap-4">
          {(STORE_ITEMS[activeTab] || []).map((item) => (
            <motion.div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer",
                selectedItem?.id === item.id ? "border-cyan-400 bg-cyan-50/30" : "border-gray-50 bg-gray-50/50"
              )}
            >
              <div className="w-12 h-12 flex items-center justify-center text-2xl mb-2">
                {item.icon}
              </div>
              <p className="text-[10px] font-bold text-gray-800 text-center line-clamp-1 mb-1">{item.name}</p>
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-yellow-500" fill="currentColor" />
                <span className="text-[10px] font-black text-gray-800">{item.price}</span>
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">{item.duration}</span>
            </motion.div>
          ))}
          {(!STORE_ITEMS[activeTab] || STORE_ITEMS[activeTab].length === 0) && (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 opacity-20">
              <Clock size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Coming Soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Button */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <button 
          disabled={!selectedItem}
          className={cn(
            "w-full py-4 rounded-full font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
            selectedItem ? "bg-cyan-400 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          Purchase (
          <Zap size={14} fill="currentColor" />
          {selectedItem?.price || 0}
          )
        </button>
      </div>
    </div>
  );
}
