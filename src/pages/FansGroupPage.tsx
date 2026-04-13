import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Settings, Heart, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function FansGroupPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'New' | 'Hot'>('New');
  const [showSettings, setShowSettings] = useState(false);
  const [autoJoin, setAutoJoin] = useState(true);
  const [autoMedal, setAutoMedal] = useState(true);

  return (
    <div className="flex flex-col bg-[#f8f9fa] h-full overflow-hidden select-none">
      {/* Header */}
      <header className="bg-white pt-12 pb-2 px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform">
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-lg font-black text-gray-800 tracking-tight">Fan group i joined</h1>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-sm font-bold text-gray-400 active:opacity-60 transition-opacity"
          >
            Manage
          </button>
        </div>
        
        <div className="flex gap-8 mt-6 px-2">
          {['New', 'Hot'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "text-sm font-bold transition-all relative pb-2",
                activeTab === tab ? "text-gray-900" : "text-gray-400"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="fanTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Heart size={64} className="text-pink-200" fill="currentColor" />
        </div>
        <p className="text-gray-400 text-sm font-bold leading-relaxed max-w-[200px]">
          You have not joined any fan groups. Go to the live room and get your first badge.
        </p>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-gray-800">Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-gray-400"><ChevronRight size={24} className="rotate-90" /></button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Automatically join fan group when giving gifts</span>
                    <button 
                      onClick={() => setAutoJoin(!autoJoin)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        autoJoin ? "bg-cyan-400" : "bg-gray-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: autoJoin ? 24 : 2 }}
                        className="absolute top-1 w-5 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-600">Switch medals automatically when entering a room</span>
                    <button 
                      onClick={() => setAutoMedal(!autoMedal)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        autoMedal ? "bg-cyan-400" : "bg-gray-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: autoMedal ? 24 : 2 }}
                        className="absolute top-1 w-5 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
