import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Coins } from 'lucide-react';
import { UserProfile } from '../types';
import { NobleFrame } from './NobleFrame';
import { NobleBadge } from './NobleBadge';
import { FamilyBadge } from './FamilyBadge';

export interface HostProfileBadgeRef {
  onTapLike: () => void;
  onHeartArrival: (count?: number) => void;
  getTapProgress: () => number;
}

interface HostProfileBadgeProps {
  hostProfile: UserProfile | null;
  activePrivateCall: any | null;
  showUserProfile: (uid: string) => void;
  likeParticlesRef: React.RefObject<any>;
  targetCoords: { x: number; y: number };
  elementRef?: React.RefObject<HTMLDivElement | null>;
}

export const HostProfileBadge = forwardRef<HostProfileBadgeRef, HostProfileBadgeProps>(({
  hostProfile,
  activePrivateCall,
  showUserProfile,
  likeParticlesRef,
  targetCoords,
  elementRef
}, ref) => {
  const [tapProgress, setTapProgress] = useState(0);
  const [pulseHeartScale, setPulseHeartScale] = useState(1);
  const [isTappingLikes, setIsTappingLikes] = useState(false);

  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  // Trigger explosion and reset progress when progress reaches 100%
  useEffect(() => {
    if (tapProgress >= 100) {
      if (likeParticlesRef.current) {
        likeParticlesRef.current.triggerExplosion(targetCoords.x, targetCoords.y);
      }
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setTapProgress(0);
      }, 1500);
    }
  }, [tapProgress, targetCoords.x, targetCoords.y, likeParticlesRef]);

  useImperativeHandle(ref, () => ({
    onTapLike: () => {
      setIsTappingLikes(true);
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      tapTimerRef.current = setTimeout(() => {
        setIsTappingLikes(false);
      }, 2500);
    },
    onHeartArrival: (count: number = 1) => {
      // Pulse and grow the big overlay heart in top of host profile!
      setPulseHeartScale(1.45);
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = setTimeout(() => {
        setPulseHeartScale(1.0);
      }, 120);

      setIsTappingLikes(true);
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      tapTimerRef.current = setTimeout(() => {
        setIsTappingLikes(false);
      }, 2500);

      setTapProgress(prev => Math.min(100, prev + 1 * count));
    },
    getTapProgress: () => tapProgress
  }), [tapProgress, targetCoords.x, targetCoords.y, likeParticlesRef]);

  return (
    <div 
      ref={elementRef}
      onClick={() => hostProfile && showUserProfile(hostProfile.uid)}
      className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-0.5 pr-0 border border-white/10 shadow-lg scale-90 origin-left cursor-pointer group hover:bg-black/60 transition-all font-sans relative"
    >
      <div className="relative flex items-center justify-center">
        <NobleFrame tier={hostProfile?.nobleTitle || 'None'} size={32}>
          <img src={hostProfile?.photoURL || 'https://i.pravatar.cc/150?u=host'} alt="Host" className="w-full h-full object-cover rounded-full" />
        </NobleFrame>
      </div>
      <div className="flex flex-col px-1.5 min-w-[60px] select-none h-[22px] justify-center relative">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-white text-[10px] font-bold leading-none truncate max-w-[80px]">
            {hostProfile?.displayName || 'keep it secret'}
          </span>
          {activePrivateCall && (
            <span className="text-[6px] bg-pink-500 text-white px-1 rounded-full font-black uppercase leading-none">Private</span>
          )}

          {hostProfile?.nobleTitle && hostProfile.nobleTitle !== 'None' && (
            <NobleBadge tier={hostProfile.nobleTitle as any} size="sm" />
          )}
          {hostProfile?.familyName && hostProfile?.familyLevel && (
            <FamilyBadge familyName={hostProfile.familyName} familyLevel={hostProfile.familyLevel} />
          )}
        </div>

        {/* DYNAMIC VISIBILITY AREA UNDER NAME: Beans Figure by default, Sparkly Progress Bar when tapping */}
        <div className="h-[10px] flex items-center overflow-visible mt-0.5 relative">
          <AnimatePresence mode="wait">
            {!isTappingLikes ? (
              <motion.div 
                key="beans-counter"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="flex items-center gap-0.5"
              >
                <Coins size={8} className="text-yellow-400 shrink-0" />
                <span className="text-yellow-400 text-[8px] font-black leading-none">
                  {hostProfile?.beans || 8931}
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="likes-progress"
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="flex items-center gap-1 relative h-[10px]"
              >
                {/* DYNAMIC HEART AT BEGINNING OF PROGRESS BAR */}
                {/* Placed at beginning of the progress bar dynamically. */}
                {/* Grows heavier/bigger on user tap to overlap portrait and streamer name. */}
                {isTappingLikes && (
                  <div
                    key="beginning-progress-heart"
                    className="absolute left-[-15px] top-[-11px] z-30 filter drop-shadow-[0_2px_6px_rgba(244,63,94,0.95)] pointer-events-none transition-all duration-150 ease-out animate-wiggle-heart"
                    style={{
                      transform: `scale(${(1.2 + (tapProgress / 100) * 1.5) * pulseHeartScale})`,
                      opacity: 1,
                    }}
                  >
                    <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24">
                      <defs>
                        <clipPath id="badge-left-clip">
                          <rect x="0" y="0" width="12" height="24" />
                        </clipPath>
                        <clipPath id="badge-right-clip">
                          <rect x="12" y="0" width="12" height="24" />
                        </clipPath>

                        <linearGradient id="3d-badge-left" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffb3cc" />
                          <stop offset="45%" stopColor="#ff4081" />
                          <stop offset="100%" stopColor="#e91e63" />
                        </linearGradient>

                        <linearGradient id="3d-badge-right" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c2185b" />
                          <stop offset="100%" stopColor="#880e4f" />
                        </linearGradient>
                      </defs>

                      <g>
                        {/* Shaded/Darker base drop underlay */}
                        <path 
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          fill="rgba(0,0,0,0.2)"
                          transform="translate(1, 1)"
                        />
                        {/* Left Side: Lit and Bright */}
                        <path 
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          fill="url(#3d-badge-left)"
                          clipPath="url(#badge-left-clip)"
                        />
                        {/* Right Side: Shaded and Shadowed */}
                        <path 
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          fill="url(#3d-badge-right)"
                          clipPath="url(#badge-right-clip)"
                        />
                      </g>

                      {/* Glossy Left shoulder circle */}
                      <ellipse cx="7" cy="6.5" rx="2" ry="1" transform="rotate(-25, 7, 6.5)" fill="white" fillOpacity="0.75" />
                    </svg>
                  </div>
                )}

                <div className="h-[6px] w-[44px] bg-neutral-950 rounded-full overflow-hidden border border-white/10 flex items-center ml-1 relative shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.85)]">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-full animate-pulse transition-all duration-300 ease-out relative"
                    style={{ width: `${tapProgress}%` }}
                  >
                    {/* Top glass highlight reflection strip */}
                    <div className="absolute top-[0.5px] left-0 right-0 h-[1.2px] bg-white/40 rounded-full" />
                    {/* Bottom shade strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1.2px] bg-black/30 rounded-full" />
                  </div>
                </div>
                <span className="text-pink-300 text-[8px] font-black shrink-0 font-mono leading-none ml-0.5">
                  {Math.round(tapProgress)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

HostProfileBadge.displayName = 'HostProfileBadge';
