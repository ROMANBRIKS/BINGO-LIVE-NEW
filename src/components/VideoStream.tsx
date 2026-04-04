import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Mic, Shield, Zap, CheckCircle, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getDeviceType, getBrowserName, isIOS, isAndroid } from '../lib/device';

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

export const VideoStream = React.memo(({ isHost, roomId, hostUid, pkStatus, opponentUid }: { isHost: boolean, roomId: string, hostUid: string, pkStatus?: string, opponentUid?: string }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
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

  if (!isHost) {
    return (
      <div className="w-full h-full bg-slate-900 relative overflow-hidden flex">
        <div className={cn("relative h-full overflow-hidden", isPK ? "w-1/2 border-r border-white/10" : "w-full")}>
          <img 
            src={`https://picsum.photos/seed/${hostUid}/1920/1080`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
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
        {hasPermission ? (
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
