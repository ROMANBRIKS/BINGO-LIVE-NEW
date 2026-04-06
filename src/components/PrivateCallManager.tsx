import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, X, Check, Clock, Shield, Zap, 
  MessageSquare, User, Heart, Star, AlertCircle,
  PhoneCall, PhoneOff, PhoneIncoming, PhoneOutgoing
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, PrivateCallRequest } from '../types';
import { useToast } from '../context/ToastContext';
import { PRIVATE_CALL_FEE, calculatePrivateCallCost } from '../privateCallLogic';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, addDoc, collection, serverTimestamp, query, where } from 'firebase/firestore';

interface PrivateCallManagerProps {
  roomId: string;
  hostUid: string;
  isHost: boolean;
  userProfile: UserProfile | null;
}

export const PrivateCallManager: React.FC<PrivateCallManagerProps> = ({ 
  roomId, 
  hostUid, 
  isHost, 
  userProfile 
}) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [duration, setDuration] = useState(5); // Default 5 mins

  useEffect(() => {
    if (!roomId || !auth.currentUser) return;

    // Listen for requests for this room, filtered by user role to match security rules
    const q = query(
      collection(db, `rooms/${roomId}/private_calls`),
      isHost 
        ? where('hostUid', '==', auth.currentUser.uid)
        : where('viewerUid', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const callData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setRequests(callData.filter(c => c.status === 'pending'));
      setActiveCall(callData.find(c => c.status === 'active'));
    }, (error) => {
      console.error("PrivateCall snapshot error:", error);
    });

    return () => unsubscribe();
  }, [roomId, isHost]);

  const handleRequestCall = async () => {
    if (!userProfile || !auth.currentUser) return;
    
    setIsRequesting(true);
    try {
      await addDoc(collection(db, `rooms/${roomId}/private_calls`), {
        roomId,
        hostUid,
        viewerUid: auth.currentUser.uid,
        viewerName: userProfile.displayName,
        viewerPhoto: userProfile.photoURL,
        status: 'pending',
        duration,
        fee: PRIVATE_CALL_FEE,
        totalCost: calculatePrivateCallCost(duration),
        createdAt: serverTimestamp()
      });
      showToast("Private call request sent! 📞", 'success');
    } catch (error) {
      console.error("Error requesting private call:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAcceptCall = async (requestId: string) => {
    try {
      await updateDoc(doc(db, `rooms/${roomId}/private_calls`, requestId), {
        status: 'active',
        startedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const handleRejectCall = async (requestId: string) => {
    try {
      await updateDoc(doc(db, `rooms/${roomId}/private_calls`, requestId), {
        status: 'rejected'
      });
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  };

  const handleEndCall = async (callId: string) => {
    try {
      await updateDoc(doc(db, `rooms/${roomId}/private_calls`, callId), {
        status: 'ended',
        endedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  return (
    <div className="relative">
      {/* Viewer Side: Request Button */}
      {!isHost && !activeCall && (
        <button 
          onClick={() => setIsRequesting(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <Phone size={20} fill="currentColor" />
          </div>
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Private</span>
        </button>
      )}

      {/* Viewer Side: Request Modal */}
      <AnimatePresence>
        {isRequesting && !isHost && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-400">
                  <PhoneCall size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Private Call</h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Request a one-on-one private session with the host.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Duration</span>
                  <span className="text-sm font-black italic text-emerald-400">{duration} Minutes</span>
                </div>
                <div className="flex gap-2">
                  {[5, 10, 20, 30].map(d => (
                    <button 
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-black italic text-xs transition-all",
                        duration === d ? "bg-emerald-500 text-black" : "bg-white/5 text-white/40 border border-white/5"
                      )}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Cost</span>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-xl font-black italic text-white">{calculatePrivateCallCost(duration)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Rate</span>
                  <div className="text-xs font-bold text-white/60">{PRIVATE_CALL_FEE}/min</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setIsRequesting(false)}
                  className="py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-white/10 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRequestCall}
                  className="py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Send Request
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Host Side: Incoming Requests */}
      <AnimatePresence>
        {isHost && requests.length > 0 && !activeCall && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-[100]"
          >
            <div className="bg-slate-900 rounded-[2rem] p-6 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 flex items-center gap-4">
              <div className="relative">
                <img src={requests[0].viewerPhoto} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500" />
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                  New
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black italic uppercase tracking-tight text-white text-sm">{requests[0].viewerName}</span>
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">Private Call</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={10} className="text-white/40" />
                    <span className="text-[10px] font-bold text-white/40">{requests[0].duration}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400">{requests[0].totalCost}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleRejectCall(requests[0].id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={() => handleAcceptCall(requests[0].id)}
                  className="p-3 bg-emerald-500 text-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Overlay (Both Sides) */}
      <AnimatePresence>
        {activeCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8"
          >
            <div className="absolute top-12 flex flex-col items-center gap-4">
              <div className="bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-full text-xs font-black uppercase italic tracking-[0.3em] border border-emerald-500/20 animate-pulse">
                Private Session Active
              </div>
              <div className="text-4xl font-black italic tracking-tighter text-white">
                04:59
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                  <img src={activeCall.viewerPhoto} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-black italic uppercase tracking-tight text-white/60">{activeCall.viewerName}</span>
              </div>
              <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 flex items-center justify-center">
                  <User size={48} className="text-white/20" />
                </div>
                <span className="text-sm font-black italic uppercase tracking-tight text-white/60">Host</span>
              </div>
            </div>

            <div className="absolute bottom-20 flex gap-8">
              <button className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
                <MessageSquare size={24} />
              </button>
              <button 
                onClick={() => handleEndCall(activeCall.id)}
                className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 active:scale-90 transition-all"
              >
                <PhoneOff size={32} fill="currentColor" />
              </button>
              <button className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 transition-all">
                <Shield size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
