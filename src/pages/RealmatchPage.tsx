import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, X, Heart, Smartphone, Ruler, Weight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'female' | 'male';
  height: string;
  weight: string;
  device: string;
  images: string[];
  isRecentlyActive: boolean;
  country: string;
}

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Akosuah wiafe',
    age: 26,
    gender: 'female',
    height: '<140cm',
    weight: '42kg',
    device: 'Huawei HUAWEI Y7 2018',
    images: ['https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: true,
    country: 'Ghana'
  },
  {
    id: '2',
    name: 'Serwaa Amihere',
    age: 24,
    gender: 'female',
    height: '165cm',
    weight: '55kg',
    device: 'iPhone 13 Pro',
    images: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: true,
    country: 'Ghana'
  },
  {
    id: '3',
    name: 'Abena Mansa',
    age: 22,
    gender: 'female',
    height: '160cm',
    weight: '50kg',
    device: 'Samsung Galaxy S21',
    images: ['https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: true,
    country: 'Ghana'
  },
  {
    id: '4',
    name: 'Esi Boateng',
    age: 25,
    gender: 'female',
    height: '158cm',
    weight: '48kg',
    device: 'Oppo Reno 6',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: false,
    country: 'Ghana'
  },
  {
    id: '5',
    name: 'Kofi Adoma',
    age: 27,
    gender: 'female',
    height: '162cm',
    weight: '52kg',
    device: 'Vivo V21',
    images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: true,
    country: 'Ghana'
  },
  {
    id: '6',
    name: 'Ama Serwaa',
    age: 23,
    gender: 'female',
    height: '170cm',
    weight: '58kg',
    device: 'iPhone 12',
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: true,
    country: 'Ghana'
  },
  {
    id: '7',
    name: 'Yaa Pono',
    age: 21,
    gender: 'female',
    height: '155cm',
    weight: '45kg',
    device: 'Xiaomi Mi 11',
    images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: false,
    country: 'Ghana'
  },
  {
    id: '8',
    name: 'Nana Akua',
    age: 28,
    gender: 'female',
    height: '168cm',
    weight: '60kg',
    device: 'Google Pixel 6',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'],
    isRecentlyActive: true,
    country: 'Ghana'
  }
];

export default function RealmatchPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = mockProfiles[currentIndex];

  const handleNext = () => {
    if (currentIndex < mockProfiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back or handle end
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSwipeAction = (dir: 'left' | 'right') => {
    // In a real app, this would "like" or "dismiss" the profile
    // For now, we just move to the next one
    handleNext();
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white select-none overflow-hidden">
      {/* Header */}
      <header className="flex-none px-4 pt-6 pb-4 flex items-center justify-between bg-[#121212]">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-white">Realmatch</span>
            <div className="w-6 h-0.5 bg-white rounded-full mt-0.5" />
          </div>
          <button 
            onClick={() => navigate('/messages')}
            className="flex items-center gap-1 relative"
          >
            <span className="text-lg font-bold text-gray-500">Messages</span>
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Filter size={24} className="text-white/70" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center overflow-hidden">
              <span className="text-sm font-bold">D</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#00f2ff] text-black text-[8px] font-black px-1 rounded-sm">
              37%
            </div>
          </div>
        </div>
      </header>

      {/* Card Section */}
      <div className="flex-1 px-4 py-2 relative flex items-center justify-center">
        <motion.div
          key={currentProfile.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, info) => {
            if (info.offset.x > 100) handlePrev();
            else if (info.offset.x < -100) handleNext();
          }}
          className="w-full max-w-md aspect-[3/4] bg-[#1a1a1a] rounded-[32px] overflow-hidden relative shadow-2xl cursor-grab active:cursor-grabbing"
        >
          {/* Progress Bars (Indicators for 8 profiles) */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
            {mockProfiles.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i === currentIndex ? "bg-white" : "bg-white/30"
                )} 
              />
            ))}
          </div>

          {/* Recently Active Badge */}
          {currentProfile.isRecentlyActive && (
            <div className="absolute top-10 left-4 z-20">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-[11px] font-bold text-white/90">Recently active</span>
              </div>
            </div>
          )}

          {/* Profile Image */}
          <img 
            src={currentProfile.images[0]} 
            alt={currentProfile.name} 
            className="w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Overlay Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
            <h2 className="text-2xl font-black mb-4">{currentProfile.name}</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Gender/Age */}
              <div className="flex items-center gap-1.5 bg-pink-500 px-3 py-1.5 rounded-full">
                <span className="text-[10px]">♀</span>
                <span className="text-xs font-bold">{currentProfile.age}</span>
              </div>

              {/* Height */}
              <div className="flex items-center gap-1.5 bg-[#a855f7] px-3 py-1.5 rounded-full">
                <Ruler size={12} />
                <span className="text-xs font-bold">{currentProfile.height}</span>
              </div>

              {/* Weight */}
              <div className="flex items-center gap-1.5 bg-[#06b6d4] px-3 py-1.5 rounded-full">
                <Weight size={12} />
                <span className="text-xs font-bold">{currentProfile.weight}</span>
              </div>
            </div>

            {/* Device Badge */}
            <div className="flex items-center gap-2 bg-[#0d9488]/40 border border-[#0d9488]/30 px-3 py-1.5 rounded-full w-fit">
              <Smartphone size={14} className="text-[#2dd4bf]" />
              <span className="text-xs font-bold text-[#2dd4bf]">{currentProfile.device}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex-none px-4 pb-16 flex items-center justify-center gap-6">
        <button 
          onClick={() => handleSwipeAction('left')}
          className="w-40 h-16 bg-[#333333] rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <X size={32} className="text-white" strokeWidth={3} />
        </button>
        <button 
          onClick={() => handleSwipeAction('right')}
          className="w-40 h-16 bg-pink-500 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-pink-500/20"
        >
          <Heart size={32} className="text-white fill-white" />
        </button>
      </div>
    </div>
  );
}
