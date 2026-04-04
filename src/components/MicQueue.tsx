import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, MicOff, UserPlus, X, Lock, Unlock, MoreVertical, Trash2 } from 'lucide-react';
import { GuestSeat, MicRequest, UserProfile } from '../types';
import { GuestSeat as GuestSeatComponent } from './GuestSeat';
import { cn } from '../lib/utils';

interface MicQueueProps {
  isHost: boolean;
  seats: GuestSeat[];
  micQueue: MicRequest[];
  onJoinRequest: (type: 'audio' | 'video') => void;
  onAssignSeat: (seatId: number, request: MicRequest) => void;
  onRemoveGuest: (seatId: number) => void;
  onToggleMute: (seatId: number) => void;
  onToggleLock: (seatId: number) => void;
}

export const MicQueue: React.FC<MicQueueProps> = ({
  isHost,
  seats,
  micQueue,
  onJoinRequest,
  onAssignSeat,
  onRemoveGuest,
  onToggleMute,
  onToggleLock,
}) => {
  const [showQueue, setShowQueue] = React.useState(false);
  const [selectedSeat, setSelectedSeat] = React.useState<number | null>(null);

  return (
    <div className="w-full bg-black/40 backdrop-blur-md rounded-3xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Multi-Guest ({seats.filter(s => s.status === 'occupied').length}/12)</h3>
        </div>
        {isHost && micQueue.length > 0 && (
          <button 
            onClick={() => setShowQueue(true)}
            className="relative p-2 bg-orange-500 rounded-full text-white shadow-lg hover:scale-110 active:scale-90 transition-all"
          >
            <UserPlus size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center border border-black">
              {micQueue.length}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {seats.map((seat) => (
          <div key={seat.seatId} className="relative group">
            <GuestSeatComponent 
              seat={seat}
              onSeatClick={(seat) => {
                if (seat.status === 'occupied') {
                  if (isHost) setSelectedSeat(seat.seatId);
                } else if (seat.status === 'empty' && !isHost) {
                  onJoinRequest('audio');
                }
              }}
            />
            
            {/* Seat Label */}
            <div className="mt-1 text-center">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">
                {seat.status === 'occupied' ? 'Guest' : seat.status === 'locked' ? 'Locked' : 'Empty'}
              </span>
            </div>

            {/* Host Controls Popover */}
            <AnimatePresence>
              {selectedSeat === seat.seatId && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      onToggleMute(seat.seatId);
                      setSelectedSeat(null);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 text-white/80 transition-colors"
                  >
                    {seat.isMuted ? <Mic size={14} /> : <MicOff size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{seat.isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      onToggleLock(seat.seatId);
                      setSelectedSeat(null);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 text-white/80 transition-colors"
                  >
                    {seat.status === 'locked' ? <Unlock size={14} /> : <Lock size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{seat.status === 'locked' ? 'Unlock' : 'Lock'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      onRemoveGuest(seat.seatId);
                      setSelectedSeat(null);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Kick</span>
                  </button>
                  <div className="h-px bg-white/5" />
                  <button 
                    onClick={() => setSelectedSeat(null)}
                    className="w-full p-2 text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-white/40"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Request Queue Modal */}
      <AnimatePresence>
        {showQueue && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-black italic uppercase tracking-tight">Mic Requests</h2>
                <button onClick={() => setShowQueue(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {micQueue.length === 0 ? (
                  <div className="py-12 text-center">
                    <Mic size={48} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-black uppercase tracking-widest text-xs">No pending requests</p>
                  </div>
                ) : (
                  micQueue.map((req) => (
                    <div key={req.uid} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <img src={req.photoURL} className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                          <p className="text-sm font-black italic uppercase">{req.displayName}</p>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{req.type} Request</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const emptySeat = seats.find(s => s.status === 'empty');
                            if (emptySeat) {
                              onAssignSeat(emptySeat.seatId, req);
                            } else {
                              alert("No empty seats available!");
                            }
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
