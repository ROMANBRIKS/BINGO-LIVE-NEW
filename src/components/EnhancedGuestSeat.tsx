import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, UserPlus, Lock, X, Coins, Crown, Plus } from 'lucide-react';
import { GuestSeat } from '../types';
import { cn } from '../lib/utils';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface EnhancedGuestSeatProps {
  seat: GuestSeat;
  seatId: number;
  roomId: string;
  isHost: boolean;
  guestProfile?: {
    displayName: string;
    photoURL?: string;
    level: number;
  };
  coinContribution: number;
  onSeatChange?: () => void;
  onShowProfile?: (uid: string) => void;
}

export const EnhancedGuestSeat: React.FC<EnhancedGuestSeatProps> = ({
  seat,
  seatId,
  roomId,
  isHost,
  guestProfile,
  coinContribution,
  onSeatChange,
  onShowProfile
}) => {
  const [fetchedProfile, setFetchedProfile] = React.useState<{ displayName: string; photoURL?: string; level?: number } | null>(null);

  React.useEffect(() => {
    if (seat.status === 'occupied' && seat.uid) {
      const userRef = doc(db, 'users', seat.uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setFetchedProfile({
            displayName: data.displayName || 'Guest',
            photoURL: data.photoURL || '',
            level: data.level || 1,
          });
        } else {
          setFetchedProfile({
            displayName: 'Guest',
            photoURL: '',
            level: 1,
          });
        }
      }).catch(err => {
        console.error('Error fetching guest profile:', err);
      });
    } else {
      setFetchedProfile(null);
    }
  }, [seat.status, seat.uid]);

  const handleAction = async (action: 'kick' | 'mute' | 'lock') => {
    // Basic trigger
    if (onSeatChange) onSeatChange();
  };

  const displayName = fetchedProfile?.displayName || guestProfile?.displayName || 'Guest';
  const photoURL = fetchedProfile?.photoURL || guestProfile?.photoURL || `https://i.pravatar.cc/150?u=${seat.uid}`;
  const level = fetchedProfile?.level || guestProfile?.level || 1;

  return (
    <motion.div 
      layout
      onClick={() => {
        if (seat.status === 'occupied' && seat.uid && onShowProfile) {
          onShowProfile(seat.uid);
        }
      }}
      className={cn(
        "relative w-[88px] h-[92px] rounded-xl overflow-hidden border transition-all duration-300 group cursor-pointer shadow-lg",
        seat.status === 'occupied' 
          ? "border-white/10 bg-black/45 hover:bg-black/60" 
          : "border-dashed border-white/10 bg-black/20 hover:bg-black/35"
      )}
    >
      {/* Top Left Point/Bean Counter (Pink Gem Style) */}
      {seat.status === 'occupied' && (
        <div className="absolute top-1 left-1.5 flex items-center gap-0.5 px-1 py-0.5 bg-black/40 rounded-full z-10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] shadow-[0_0_4px_#ff2a85]" />
          <span className="text-[9px] font-bold text-white scale-[0.8] origin-left select-none">
            {coinContribution}
          </span>
        </div>
      )}

      {/* Main Container for Avatar */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 pb-4">
        {seat.status === 'occupied' ? (
          <div className="relative w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <img 
              src={photoURL} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              alt=""
            />
          </div>
        ) : seat.status === 'locked' ? (
          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-white/5">
            <Lock size={14} className="text-white/30" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/15 group-hover:bg-white/10 transition-colors">
            <UserPlus size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
          </div>
        )}
      </div>

      {/* Bottom Info Row: Name (Truncated) & Mic Status Badge */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between z-10 select-none bg-gradient-to-t from-black/50 to-transparent pt-1 px-0.5">
        {seat.status === 'occupied' ? (
          <>
            <div className="flex items-center gap-0.5 min-w-0 flex-1">
              <span className="text-[9px] font-bold bg-yellow-400 text-stone-900 px-0.5 rounded leading-none scale-[0.8] origin-left">
                {level}
              </span>
              <span className="text-[10px] font-medium text-white/90 truncate pr-0.5 drop-shadow">
                {displayName}
              </span>
            </div>
            <div className="flex-shrink-0">
              {seat.isMuted ? (
                <MicOff size={10} className="text-rose-500 fill-rose-500/10" />
              ) : (
                <Mic size={10} className="text-white/90" />
              )}
            </div>
          </>
        ) : (
          <span className="text-[9px] font-medium text-white/35 w-full text-center truncate">
            {seat.status === 'locked' ? 'Locked' : `Seat ${seatId + 1}`}
          </span>
        )}
      </div>

      {/* Host Action HUD overlay on Hover */}
      {isHost && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {seat.status === 'occupied' ? (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAction('kick'); }}
              className="px-1.5 py-1 bg-red-600 rounded text-[9px] font-black text-white hover:bg-red-700 active:scale-95 transition-all uppercase"
            >
              Kick
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); handleAction('lock'); }}
              className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white"
            >
              {seat.status === 'locked' ? <Lock size={12} className="text-white" /> : <Lock size={12} className="opacity-50" />}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
