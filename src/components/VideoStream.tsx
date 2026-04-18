import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, Shield, Zap, CheckCircle, HelpCircle, Sparkles, Radio } from 'lucide-react';
import { cn } from '../lib/utils';
import { getDeviceType, getBrowserName, isIOS, isAndroid } from '../lib/device';
import { VirtualAvatar } from './VirtualAvatar';
import { webRTCService } from '../services/WebRTCService';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { streamingService } from '../services/streamingService';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';

const PermissionGuide = ({ onClose, onGrant }: { onClose: () => void, onGrant: () => void }) => {
  const deviceType = getDeviceType();
  const browser = getBrowserName();

  const getInstructions = () => {
    if (isIOS()) {
      return [
        "Tap the 'AA' or 'Refresh' icon in Safari's address bar",
        "Select 'Website Settings'",
        "Set Camera and Microphone to 'Allow'",
        "Refresh the page to start streaming"
      ];
    }
    if (isAndroid()) {
      return [
        "Tap the three dots (⋮) in Chrome's top right corner",
        "Go to 'Settings' > 'Site settings'",
        "Ensure 'Camera' and 'Microphone' are allowed for this site",
        "Refresh the page"
      ];
    }
    return [
      "Click the lock icon (🔒) in your browser's address bar",
      "Toggle Camera and Microphone to 'On'",
      "Refresh the page to activate your stream"
    ];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 border border-orange-500/30">
            <Shield size={40} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">Permission Required</h2>
          <p className="text-white/40 text-sm">To start your live stream, we need access to your camera and microphone.</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Instructions for {browser} on {deviceType}</p>
            <div className="space-y-3">
              {getInstructions().map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{i + 1}</div>
                  <p className="text-xs text-white/70 leading-tight">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onGrant}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-black uppercase italic tracking-widest shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Grant Permissions
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 rounded-2xl text-white/40 font-bold uppercase text-xs hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const VideoStream = React.memo(({ isHost, roomId, hostUid, pkStatus, opponentUid, isVirtual, type }: { isHost: boolean, roomId: string, hostUid: string, pkStatus?: string, opponentUid?: string, isVirtual?: boolean, type?: string }) => {
  const { profile } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoContainerRef = React.useRef<HTMLDivElement>(null);

  // Agora Integration
  useEffect(() => {
    if (!profile || !roomId || isVirtual) return;

    const initStreaming = async () => {
      if (isHost) {
        // Broadcaster side
        try {
          const { videoTrack } = await streamingService.startBroadcast(roomId, profile.uid) || {};
          if (videoTrack && videoRef.current) {
            videoTrack.play(videoRef.current);
          }
        } catch (err) {
          console.error("Agora Broadcast Start Error:", err);
        }
      } else {
        // Audience side
        try {
          await streamingService.joinAsAudience(roomId, profile.uid, (user, mediaType) => {
            if (mediaType === "video" && user.uid === hostUid) {
              const remoteTrack = user.videoTrack;
              if (remoteTrack && remoteVideoContainerRef.current) {
                remoteTrack.play(remoteVideoContainerRef.current);
              }
            }
            if (mediaType === "audio" && user.uid === hostUid) {
              user.audioTrack?.play();
            }
          });
        } catch (err) {
          console.error("Agora Audience Join Error:", err);
        }
      }
    };

    initStreaming();

    return () => {
      streamingService.leave();
    };
  }, [isHost, profile, roomId, hostUid, isVirtual]);

  useEffect(() => {
    if (isHost) {
      checkPermissions();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isHost]);

  const checkPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as any });
      if (result.state === 'granted') {
        setHasPermission(true);
        startStream();
      } else if (result.state === 'prompt') {
        setShowGuide(true);
      } else {
        setHasPermission(false);
        setShowGuide(true);
      }
    } catch (e) {
      // Fallback for browsers that don't support permissions API for camera
      setShowGuide(true);
    }
  };

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: type !== 'audio', 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current && type !== 'audio') {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
      setShowGuide(false);
    } catch (e) {
      setHasPermission(false);
      setShowGuide(true);
    }
  };

  const isPK = pkStatus === 'battling';

  if (type === 'audio') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-900/20 to-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <Radio size={64} className="text-emerald-400" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">AUDIO LIVE</h3>
            <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.3em]">Live Voice Only</p>
          </div>
          
          {/* Audio Visualizer Simulation */}
          <div className="flex items-end gap-1 h-8">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                className="w-1 bg-emerald-400/40 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="w-full h-full bg-slate-900 relative overflow-hidden flex">
        <div className={cn("relative h-full overflow-hidden", isPK ? "w-1/2 border-r border-white/10" : "w-full")}>
          {isVirtual ? (
            <VirtualAvatar seed={hostUid} />
          ) : (
            <div 
              ref={remoteVideoContainerRef}
              className="w-full h-full bg-black"
            >
              {/* Agora will inject the video here */}
              {!streamingService.getClient() && (
                <img 
                  src={`https://picsum.photos/seed/${hostUid}/1920/1080`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>
        
        {isPK && (
          <div className="relative w-1/2 h-full overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/${opponentUid || 'opponent'}/1920/1080`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex">
      <div className={cn("relative h-full overflow-hidden", isPK ? "w-1/2 border-r border-white/10" : "w-full")}>
        {isVirtual ? (
          <VirtualAvatar seed={hostUid} />
        ) : hasPermission ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center bg-gradient-to-b from-slate-900 to-black">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
              <Video size={40} className="text-white/20" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-black" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic text-white mb-2">Camera is Off</h3>
              <p className="text-white/40 text-sm max-w-xs">Enable camera permissions to start your broadcast.</p>
            </div>
            <button 
              onClick={() => setShowGuide(true)}
              className="px-8 py-3 bg-white text-black font-black uppercase italic rounded-xl hover:scale-105 transition-transform"
            >
              Setup Camera
            </button>
          </div>
        )}
      </div>

      {isPK && (
        <div className="relative w-1/2 h-full overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/${opponentUid || 'opponent'}/1920/1080`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>
      )}

      <AnimatePresence>
        {showGuide && (
          <PermissionGuide 
            onClose={() => setShowGuide(false)} 
            onGrant={startStream} 
          />
        )}
      </AnimatePresence>
    </div>
  );
});

VideoStream.displayName = 'VideoStream';
