import React from 'react';
import { motion } from 'framer-motion';
import { GuestSeat as GuestSeatType } from '../types';

interface GuestSeatProps {
  seat: GuestSeatType;
  onSeatClick: (seat: GuestSeatType) => void;
  guestProfile?: {
    displayName: string;
    photoURL: string;
  };
}

/**
 * 🪑 GUEST SEAT COMPONENT
 * Represents a single seat in the 12-guest multi-room grid.
 */
export const GuestSeat: React.FC<GuestSeatProps> = ({ seat, onSeatClick, guestProfile }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSeatClick(seat)}
      className={`relative w-full aspect-square rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
        seat.status === 'occupied' 
          ? 'border-[#00e5ff] bg-[#00e5ff]/10 shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
          : seat.status === 'locked'
          ? 'border-red-500/50 bg-red-500/10'
          : 'border-white/20 bg-black/20 hover:border-white/40'
      }`}
    >
      {/* Seat ID / Label */}
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-black/60 rounded-full border border-white/20 flex items-center justify-center z-10">
        <span className="text-[10px] font-black text-white/80">{seat.seatId}</span>
      </div>

      {/* Content based on status */}
      {seat.status === 'occupied' ? (
        <div className="relative w-full h-full p-0.5 overflow-hidden rounded-full">
          <img 
            src={guestProfile?.photoURL || `https://picsum.photos/seed/${seat.uid}/64/64`} 
            alt={guestProfile?.displayName || 'Guest'}
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Mute Indicator */}
          {seat.isMuted && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <span className="text-[14px]">🔇</span>
            </div>
          )}
          {/* Media Type Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center border border-white/20">
            <span className="text-[10px]">{seat.type === 'video' ? '📹' : '🎙️'}</span>
          </div>
        </div>
      ) : seat.status === 'locked' ? (
        <span className="text-lg opacity-50">🔒</span>
      ) : (
        <span className="text-xl opacity-30">+</span>
      )}
    </motion.div>
  );
};
