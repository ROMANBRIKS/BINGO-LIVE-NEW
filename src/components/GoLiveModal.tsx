import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, X, Sparkles, Camera, Mic, Dog, MapPin, Users, Gamepad2, Radio, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { StreamType } from '../types';

export const GoLiveModal = ({ onClose }: { onClose: () => void }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<StreamType>('multi-guest-live');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  // Privacy states
  const [roomAccess, setRoomAccess] = useState<'public' | 'private' | 'family'>('public');
  const [passcode, setPasscode] = useState('1234');

  const tabs: { id: StreamType, label: string, icon: any, color: string }[] = [
    { id: 'multi-guest-live', label: 'GUEST LIVE', icon: Users, color: 'from-cyan-500 to-blue-600' },
    { id: 'live', label: 'LIVE', icon: Camera, color: 'from-orange-500 to-pink-500' },
    { id: 'audio-live', label: 'AUDIO LIVE', icon: Radio, color: 'from-emerald-500 to-teal-600' },
    { id: 'game-live', label: 'GAME LIVE', icon: Gamepad2, color: 'from-purple-500 to-indigo-600' },
  ];

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("Location error:", err);
          showToast("Could not get location. Nearby discovery may not work.", 'warning');
        }
      );
    }
  };

  const handleStartBroadcast = async () => {
    if (!profile || loading) return;
    setLoading(true);
    try {
      const roomData = {
        hostUid: profile.uid,
        title: title || `${profile.displayName}'s ${activeTab.replace('-', ' ')} Stream`,
        status: 'live',
        type: activeTab,
        currentBeans: 0,
        viewerCount: 0,
        guests: [],
        isPrivate: roomAccess !== 'public',
        accessType: roomAccess,
        passcode: roomAccess === 'private' ? passcode : null,
        familyId: roomAccess === 'family' ? (profile?.familyId || 'agency_vips') : null,
        familyName: roomAccess === 'family' ? (profile?.familyName || 'Agency Elite') : null,
        createdAt: serverTimestamp(),
        pkStatus: 'idle',
        latitude: location?.lat || null,
        longitude: location?.lng || null
      };

      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      navigate(`/room/${docRef.id}?mode=host`);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
      showToast("Failed to start broadcast. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br", activeTabData.color)} />
        <div className={cn("absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-gradient-to-br", activeTabData.color)} />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <motion.div 
            key={`active-icon-${activeTab}`}
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 6, scale: 1 }}
            className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br", activeTabData.color)}
          >
            <activeTabData.icon size={40} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-2">
            {activeTabData.label}
          </h2>
          <p className="text-white/40 text-sm">Set your stream title and start broadcasting to your fans!</p>
        </div>

        <div className="space-y-4 mb-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Stream Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you up to?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-white/30 transition-all font-bold italic"
            />
          </div>

          {/* Privacy Choice Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Space / Room Privacy</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRoomAccess('public')}
                className={cn(
                  "py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center border",
                  roomAccess === 'public'
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 font-extrabold"
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white/60"
                )}
              >
                <Globe size={14} />
                <span className="text-[9px] uppercase tracking-widest font-black">Public</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomAccess('private')}
                className={cn(
                  "py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center border",
                  roomAccess === 'private'
                    ? "bg-purple-500/10 border-purple-500 text-purple-400 font-extrabold"
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white/60"
                )}
              >
                <Lock size={14} />
                <span className="text-[9px] uppercase tracking-widest font-black">Passcode</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomAccess('family')}
                className={cn(
                  "py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center border",
                  roomAccess === 'family'
                    ? "bg-rose-500/10 border-rose-500 text-rose-400 font-extrabold"
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white/60"
                )}
              >
                <Users size={14} />
                <span className="text-[9px] uppercase tracking-widest font-black">Agency</span>
              </button>
            </div>
          </div>

          {/* Passcode Input & Family Banner Block */}
          <AnimatePresence mode="wait">
            {roomAccess === 'private' && (
              <motion.div
                key="passcode-container"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 ml-2">Set 4-Digit Passcode</label>
                <input 
                  type="text"
                  maxLength={4}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="Enter 4 digits (e.g. 1234)"
                  className="w-full bg-purple-950/15 border border-purple-500/30 rounded-2xl px-6 py-3 text-center text-lg font-bold tracking-[0.5em] text-purple-300 placeholder:text-purple-300/20 focus:outline-none focus:border-purple-500/60 transition-all font-sans"
                />
              </motion.div>
            )}

            {roomAccess === 'family' && (
              <motion.div
                key="agency-banner"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="space-y-1 overflow-hidden bg-rose-950/10 border border-rose-500/20 rounded-2xl p-4 text-left"
              >
                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  🛡️ Family & Agency Mode Active
                </h4>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                  Only members of your Agency <span className="text-white">"{profile?.familyName || 'Agency Elite'}"</span> will bypass and join this session automatically. Others are gated.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={requestLocation}
            className={cn(
              "w-full py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all",
              location ? "bg-green-500/20 border-green-500/50 text-green-500" : "bg-white/5 border-white/5 text-white/40"
            )}
          >
            <MapPin size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {location ? "Location Shared" : "Share Location for Nearby"}
            </span>
          </button>
        </div>

        <button 
          onClick={handleStartBroadcast}
          disabled={loading}
          className={cn(
            "w-full py-3 rounded-2xl text-white font-black text-sm uppercase italic tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 bg-gradient-to-r mb-5",
            activeTabData.color
          )}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Start {activeTabData.label}
              <Sparkles size={20} fill="currentColor" />
            </>
          )}
        </button>

        {/* TAB SELECTOR - NOW AT THE BOTTOM */}
        <div className="flex items-center justify-start gap-4 overflow-x-auto scrollbar-hide py-2 relative z-10">
          {tabs.map((tab) => (
            <button
              key={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 px-2 py-1 transition-all relative",
                tab.id === 'multi-guest-live' && "sticky left-0 z-10 bg-black pr-2",
                activeTab === tab.id 
                  ? "text-white scale-110" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <span className="text-[11px] font-black uppercase tracking-tighter">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-tab-indicator"
                  className={cn("absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r", tab.color)} 
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
