import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, FlipHorizontal, Sparkles, Wand2, Maximize2, ChevronDown, Edit2, MessageCircle, Menu, Link2, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const MODES = ['Multi-guest LIVE', 'LIVE', 'Audio Live', 'Game LIVE'];

export default function GoLivePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [title, setTitle] = useState('April Fools 🤪💕💋');
  const [activeMode, setActiveMode] = useState('LIVE');
  const [status, setStatus] = useState<'setup' | 'preparing' | 'countdown'>('setup');
  const [countdown, setCountdown] = useState(3);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartBroadcast = async () => {
    if (!profile || status !== 'setup') return;
    
    // Phase 1: Preparing
    setStatus('preparing');
    
    setTimeout(() => {
      // Phase 2: Countdown & UI Change
      setStatus('countdown');
      let count = 3;
      setCountdown(count);
      
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          finalizeBroadcast();
        }
      }, 1000);
    }, 1000);
  };

  const finalizeBroadcast = async () => {
    try {
      const roomData = {
        hostUid: profile?.uid,
        title: title || `${profile?.displayName}'s Live Stream`,
        status: 'live',
        type: activeMode === 'Audio Live' ? 'audio' : 'video',
        currentBeans: 0,
        viewerCount: 0,
        guests: [],
        isPrivate: false,
        createdAt: serverTimestamp(),
        pkStatus: 'idle'
      };

      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      navigate(`/room/${docRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to start broadcast. Please try again.");
      setStatus('setup');
    }
  };

  return (
    <div className="absolute inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Camera Preview Background */}
      <div className="absolute inset-0 z-0">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {status === 'setup' || status === 'preparing' ? (
        <>
          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between p-4">
            <div className="w-10" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
              </div>
              <span className="text-[11px] font-black tracking-[0.15em] text-white uppercase">Bingo Live</span>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative z-10 flex-1 flex flex-col p-4">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xs relative">
              <div className="absolute top-2 right-2 bg-pink-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm text-white tracking-widest">
                New
              </div>
              <div className="flex gap-3">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 border border-white/20 relative">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Camera size={24} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-100 group-hover:bg-black/60 transition-colors">
                      <Edit2 size={14} className="text-white mb-0.5" />
                      <span className="text-[8px] font-bold uppercase text-white">Edit</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
                      <div className="w-full h-full bg-indigo-600/80 clip-path-hexagon flex flex-col items-center justify-center p-0.5 leading-none">
                        <span className="text-[4px] font-bold text-white/60">10th</span>
                        <span className="text-[5px] font-black text-white">Carnival</span>
                        <span className="text-[4px] font-bold text-white/60">Eve</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-white font-bold text-lg focus:outline-none placeholder:text-white/40"
                    placeholder="Add a title..."
                  />
                  <button className="mt-2 flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors">
                    Select tag <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto mb-8">
              <div className="flex items-center justify-center gap-8 mb-8">
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <FlipHorizontal size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Flip</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Beauty</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Wand2 size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Magic</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Camera size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Camera</span>
                </button>
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                    <Maximize2 size={24} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Expand</span>
                </button>
              </div>

              <div className="flex justify-center mb-8">
                <button 
                  onClick={handleStartBroadcast}
                  disabled={status === 'preparing'}
                  className="w-full max-w-xs py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-[0.2em] rounded-full shadow-[0_10px_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {status === 'preparing' ? "Preparing..." : "Go LIVE"}
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide px-4">
                {MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className={`whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all ${
                      activeMode === mode 
                        ? 'text-white scale-110' 
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {mode}
                    {activeMode === mode && (
                      <motion.div 
                        layoutId="activeMode"
                        className="w-1 h-1 bg-white rounded-full mx-auto mt-1"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Countdown & Live UI Phase */
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Top Bar Live */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                <img src={profile?.photoURL || ''} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold leading-none text-white">{profile?.displayName}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-[8px] font-bold text-yellow-400">1638</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                <span className="text-xs font-bold">0</span>
              </div>
              <button onClick={() => setStatus('setup')} className="text-white/80">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Left Side Goals/Actions */}
          <div className="flex flex-col gap-2 p-4 mt-4">
            {['Dance', '360', 'Wish', 'Kiss', 'Spill secret'].map((action) => (
              <div key={action} className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-lg px-2 py-1.5 border border-white/5 w-fit">
                <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center">
                  <Sparkles size={10} className="text-white/40" />
                </div>
                <span className="text-[10px] font-bold text-white/80">{action}</span>
              </div>
            ))}
          </div>

          {/* Countdown Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.span 
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-[180px] font-black text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              {countdown}
            </motion.span>
          </div>

          {/* Right Side Notifications */}
          <div className="absolute right-4 top-40 flex flex-col items-end gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                </div>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-white">Bells</span>
            </div>
            <div className="bg-blue-500/80 backdrop-blur-md rounded-full pl-1 pr-4 py-1 flex items-center gap-2 border border-white/20">
              <div className="w-6 h-6 bg-white rounded-full overflow-hidden">
                <div className="w-full h-full bg-blue-400" />
              </div>
              <span className="text-[10px] font-bold text-white">HNM 🦋🌹</span>
            </div>
          </div>

          {/* Bottom Area */}
          <div className="mt-auto p-4 space-y-4">
            {/* Warning Message */}
            <div className="max-w-[90%]">
              <p className="text-[10px] leading-relaxed text-white/60 font-medium">
                Minors are strictly prohibited from using BINGO LIVE. The review team will monitor live content 24/7 to prevent the spread of content that may be harmful and violates our community guidelines. If you encounter any violations, please report the content promptly.
              </p>
            </div>

            {/* Streamer Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <Menu size={20} className="text-white" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-cyan-400/20 backdrop-blur-md border border-cyan-400/30 flex items-center justify-center">
                  <Link2 size={20} className="text-cyan-400" />
                </button>
                <button className="w-10 h-10 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center">
                  <span className="text-[10px] font-black italic text-indigo-400">PK</span>
                </button>
                <button className="w-10 h-10 rounded-full bg-yellow-400/20 backdrop-blur-md border border-yellow-400/30 flex items-center justify-center">
                  <div className="w-5 h-4 bg-yellow-400 rounded-sm" />
                </button>
                <button className="w-10 h-10 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/30 flex items-center justify-center">
                  <Gift size={20} className="text-pink-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
