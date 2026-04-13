import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, UserPlus, Lock, X, Coins, Crown } from 'lucide-react';
import { GuestSeat } from '../types';
import { cn } from '../lib/utils';
import { updateDoc, doc } from 'firebase/firestore';
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
}

export const EnhancedGuestSeat: React.FC<EnhancedGuestSeatProps> = ({
  seat,
  seatId,
  roomId,
  isHost,
  guestProfile,
  coinContribution,
  onSeatChange
}) => {
  const handleAction = async (action: 'kick' | 'mute' | 'lock') => {
    const roomRef = doc(db, 'rooms', roomId);
    // Logic to update seat state based on action
    // This is simplified for the example
    if (onSeatChange) onSeatChange();
  };

  return (
    <motion.div 
      layout
      className={cn(
        "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group",
        seat.status === 'occupied' ? "border-cyan-400/30 bg-slate-800" : "border-white/5 bg-white/5"
      )}
    >
      {/* Background / Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        {seat.status === 'occupied' ? (
          <div className="relative w-full h-full">
            <img 
              src={guestProfile?.photoURL || `https://i.pravatar.cc/150?u=${seat.uid}`} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        ) : seat.status === 'locked' ? (
          <Lock size={20} className="text-white/20" />
        ) : (
          <UserPlus size={20} className="text-white/10 group-hover:text-white/20 transition-colors" />
        )}
      </div>

      {/* Top Info: Contribution */}
      {seat.status === 'occupied' && (
        <div className="absolute top-1 left-1 right-1 flex justify-between items-start z-10">
          <div className="bg-black/60 backdrop-blur-md rounded-lg px-1.5 py-0.5 flex items-center gap-1 border border-white/10">
            <Coins size={8} className="text-yellow-400" />
            <span className="text-[8px] font-black italic text-yellow-400">{coinContribution.toLocaleString()}</span>
          </div>
          {isHost && (
            <button 
              onClick={() => handleAction('kick')}
              className="w-5 h-5 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Bottom Info: Name & Status */}
      <div className="absolute bottom-1 left-1 right-1 z-10">
        {seat.status === 'occupied' ? (
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-white truncate drop-shadow-md uppercase tracking-tight">
              {guestProfile?.displayName || 'Guest'}
            </span>
            <div className="flex items-center gap-1">
              {seat.isMuted ? <MicOff size={8} className="text-red-500" /> : <Mic size={8} className="text-cyan-400" />}
              {seat.type === 'video' && <Video size={8} className="text-pink-500" />}
            </div>
          </div>
        ) : (
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest text-center block">
            {seat.status === 'locked' ? 'Locked' : `Seat ${seatId + 1}`}
          </span>
        )}
      </div>

      {/* Host Controls for Empty Seats */}
      {isHost && seat.status !== 'occupied' && (
        <button 
          onClick={() => handleAction('lock')}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            {seat.status === 'locked' ? <Lock size={16} /> : <Lock size={16} className="opacity-40" />}
          </div>
        </button>
      )}
    </motion.div>
  );
};
