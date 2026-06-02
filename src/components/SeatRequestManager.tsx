import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Check, UserPlus, Mic, Video, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { approveSeatRequest } from '../seatManagementLogic';
import { NobleBadge } from './NobleBadge';

const NOBLE_WEIGHTS: Record<string, number> = {
  'Global God': 100,
  'Emperor': 90,
  'King': 85,
  'Archduke': 80,
  'Grand Duke': 75,
  'Duke': 70,
  'Baron': 60,
  'None': 0
};

interface SeatRequestManagerProps {
  roomId: string;
  isHost: boolean;
  onRequestsChange?: (count: number) => void;
}

export const SeatRequestManager: React.FC<SeatRequestManagerProps> = ({ roomId, isHost, onRequestsChange }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    if (!isHost) return;
    const unsub = onSnapshot(collection(db, 'rooms', roomId, 'seatRequests'), (snap) => {
      const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort priority Noble users first
      reqs.sort((a: any, b: any) => {
        const pA = NOBLE_WEIGHTS[a.nobleTier || 'None'] || 0;
        const pB = NOBLE_WEIGHTS[b.nobleTier || 'None'] || 0;
        if (pA !== pB) return pB - pA;
        
        // Secondary sort by level
        const lvlA = a.level || 1;
        const lvlB = b.level || 1;
        if (lvlA !== lvlB) return lvlB - lvlA;

        // Fallback to entry timestamp order
        return (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0);
      });

      setRequests(reqs);
      if (onRequestsChange) onRequestsChange(reqs.length);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/seatRequests`);
    });
    return () => unsub();
  }, [roomId, isHost, onRequestsChange]);

  if (!isHost || requests.length === 0) return null;

  const handleApprove = async (req: any) => {
    // Find first empty seat
    const roomSnap = await getDoc(doc(db, 'rooms', roomId));
    if (roomSnap.exists()) {
      const seats = roomSnap.data().seats || [];
      const emptySeatIdx = seats.findIndex((s: any) => s.status === 'empty');
      if (emptySeatIdx !== -1) {
        await approveSeatRequest(roomId, req.uid, emptySeatIdx);
      }
    }
  };

  const handleReject = async (req: any) => {
    await deleteDoc(doc(db, 'rooms', roomId, 'seatRequests', req.uid));
  };

  return (
    <div className="relative pointer-events-auto">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setShowRequests(!showRequests)}
        className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-black shadow-lg shadow-cyan-400/20 active:scale-95 transition-transform relative"
      >
        <Users size={24} />
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
          {requests.length}
        </div>
      </motion.button>

      <AnimatePresence>
        {showRequests && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 w-72 bg-[#1a1a1a] rounded-[2rem] border border-white/10 shadow-2xl p-4 z-50"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Seat Requests</h3>
              <button onClick={() => setShowRequests(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {requests.map((req) => (
                <div key={req.id} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                      <img src={req.photoURL || `https://i.pravatar.cc/100?u=${req.uid}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black italic text-white uppercase tracking-tight truncate max-w-[100px]">
                          {req.displayName}
                        </span>
                        {req.nobleTier && req.nobleTier !== 'None' && (
                          <div className="scale-75 origin-left shrink-0">
                            <NobleBadge tier={req.nobleTier} size="sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {req.type === 'video' ? <Video size={10} className="text-pink-500" /> : <Mic size={10} className="text-cyan-400" />}
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Level {req.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleReject(req)}
                      className="w-8 h-8 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-xl flex items-center justify-center transition-all"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={() => handleApprove(req)}
                      className="w-8 h-8 bg-cyan-400 text-black rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/20 active:scale-90 transition-all"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
