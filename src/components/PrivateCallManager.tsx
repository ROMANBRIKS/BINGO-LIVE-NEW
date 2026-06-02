import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, X, Check, Clock, Shield, Zap, 
  MessageSquare, User, Heart, Star, AlertCircle,
  PhoneCall, PhoneOff, PhoneIncoming, PhoneOutgoing,
  Video, Mic
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, PrivateCallRequest } from '../types';
import { useToast } from '../context/ToastContext';
import { PRIVATE_CALL_FEE_AUDIO, PRIVATE_CALL_FEE_VIDEO, calculatePrivateCallCost } from '../privateCallLogic';
import { getTierForEarnings, getAgencyCommissionRateForTier } from '../agencyLogic';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, getDoc, updateDoc, addDoc, collection, serverTimestamp, query, where, increment, setDoc } from 'firebase/firestore';
import { FamilyBadge } from './FamilyBadge';
import { Family } from '../types';

interface PrivateCallManagerProps {
  roomId: string;
  hostUid: string;
  isHost: boolean;
  userProfile: UserProfile | null;
  hostProfile: UserProfile | null;
}

export const PrivateCallManager: React.FC<PrivateCallManagerProps> = ({ 
  roomId, 
  hostUid, 
  isHost, 
  userProfile,
  hostProfile
}) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [duration, setDuration] = useState(5); // Default 5 mins
  const [selectedType, setSelectedType] = useState<'audio' | 'video' | null>(null);
  const [viewerFamily, setViewerFamily] = useState<Family | null>(null);
  const [hostFamily, setHostFamily] = useState<Family | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!activeCall?.startedAt) return;
    
    const startTime = activeCall.startedAt.toMillis ? activeCall.startedAt.toMillis() : Date.now();
    const durationMs = (activeCall.duration || 5) * 60 * 1000;
    const endTime = startTime + durationMs;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);
      
      if (diff <= 0) {
        clearInterval(interval);
        if (isHost) handleEndCall(activeCall.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall, isHost]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!activeCall) {
      setViewerFamily(null);
      setHostFamily(null);
      return;
    }

    // 1. Fetch Viewer Family
    let viewerFamUnsub = () => {};
    const fetchViewerInfo = async () => {
      const vDoc = await getDoc(doc(db, 'users', activeCall.viewerUid));
      if (vDoc.exists()) {
        const vData = vDoc.data() as UserProfile;
        if (vData.familyId) {
          viewerFamUnsub = onSnapshot(doc(db, 'families', vData.familyId), (fSnap) => {
            if (fSnap.exists()) setViewerFamily({ id: fSnap.id, ...fSnap.data() } as Family);
          });
        }
      }
    };

    // 2. Fetch Host Family
    let hostFamUnsub = () => {};
    const fetchHostInfo = async () => {
      const hDoc = await getDoc(doc(db, 'users', activeCall.hostUid));
      if (hDoc.exists()) {
        const hData = hDoc.data() as UserProfile;
        if (hData.familyId) {
          hostFamUnsub = onSnapshot(doc(db, 'families', hData.familyId), (fSnap) => {
            if (fSnap.exists()) setHostFamily({ id: fSnap.id, ...fSnap.data() } as Family);
          });
        }
      }
    };

    fetchViewerInfo();
    fetchHostInfo();

    return () => {
      viewerFamUnsub();
      hostFamUnsub();
    };
  }, [activeCall]);

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
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/private_calls`);
    });

    return () => unsubscribe();
  }, [roomId, isHost]);

  const handleRequestCall = async (type: 'audio' | 'video') => {
    if (!userProfile || !auth.currentUser) return;
    
    setIsRequesting(true);
    const fee = type === 'video' ? PRIVATE_CALL_FEE_VIDEO : PRIVATE_CALL_FEE_AUDIO;
    try {
      await addDoc(collection(db, `rooms/${roomId}/private_calls`), {
        roomId,
        hostUid,
        hostName: hostProfile?.displayName || 'Host',
        hostPhoto: hostProfile?.photoURL || '',
        viewerUid: auth.currentUser.uid,
        viewerName: userProfile.displayName,
        viewerPhoto: userProfile.photoURL,
        status: 'pending',
        duration,
        type,
        fee,
        totalCost: calculatePrivateCallCost(duration, type),
        createdAt: serverTimestamp()
      });
      showToast(`Private ${type} call request sent! 📞`, 'success');
      setShowSelector(false);
      setSelectedType(null);
    } catch (error) {
      console.error("Error requesting private call:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAcceptCall = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    try {
      const viewerRef = doc(db, 'users', request.viewerUid);
      const hostRef = doc(db, 'users', request.hostUid);
      
      // Deduct diamonds from viewer
      await updateDoc(viewerRef, {
        diamonds: increment(-request.totalCost || 0),
        totalDiamondsSpent: increment(request.totalCost || 0)
      });

      // Add beans to host
      await updateDoc(hostRef, {
        beans: increment(request.totalCost || 0),
        totalBeansEarned: increment(request.totalCost || 0)
      });

      // Agency System Calculations for Private Calls
      try {
        const agencyMemberRef = doc(db, 'agency_members', request.hostUid);
        const agencyMemberSnap = await getDoc(agencyMemberRef);
        if (agencyMemberSnap.exists()) {
          const memberData = agencyMemberSnap.data();
          const agencyId = memberData.agencyId;
          if (agencyId) {
            const agencyRef = doc(db, 'agencies', agencyId);
            const agencySnap = await getDoc(agencyRef);
            if (agencySnap.exists()) {
              const agencyData = agencySnap.data();
              const commissionRate = agencyData.commissionRate || 0.10;
              const commission = Math.floor((request.totalCost || 0) * commissionRate);

              if (commission > 0) {
                // Compute updated agency tier
                const newAgencyEarnings = (agencyData.totalEarnings || 0) + commission;
                const newAgencyTier = getTierForEarnings(newAgencyEarnings);
                const newAgencyCommissionRate = getAgencyCommissionRateForTier(newAgencyTier);

                // Update agency data
                await updateDoc(agencyRef, {
                  totalEarnings: increment(commission),
                  commissionRate: newAgencyCommissionRate
                });

                // Update agency member metrics
                const newMemberEarnings = (memberData.totalEarnings || 0) + (request.totalCost || 0);
                const newMemberTier = getTierForEarnings(newMemberEarnings);
                await updateDoc(agencyMemberRef, {
                  totalEarnings: increment(request.totalCost || 0),
                  tier: newMemberTier
                });

                // Increment the Agency Owner's user balance
                if (agencyData.ownerUid) {
                  const ownerRef = doc(db, 'users', agencyData.ownerUid);
                  await updateDoc(ownerRef, {
                    beans: increment(commission),
                    totalBeansEarned: increment(commission)
                  }).catch(err => console.error("Agency owner private call split fail:", err));
                }
              }
            }
          }
        }
      } catch (agencyErr) {
        console.error("Error processing agency commission for private call:", agencyErr);
      }

      // Update call status
      await updateDoc(doc(db, `rooms/${roomId}/private_calls`, requestId), {
        status: 'active',
        startedAt: serverTimestamp()
      });

      // Family Contribution
      const viewerDoc = await getDoc(viewerRef);
      if (viewerDoc.exists()) {
        const vData = viewerDoc.data() as UserProfile;
        if (vData.familyId) {
          const familyRef = doc(db, 'families', vData.familyId);
          const memberRef = doc(db, `families/${vData.familyId}/members`, vData.uid);
          
          await updateDoc(familyRef, {
            totalDiamondsSpent: increment(request.totalCost || 0)
          }).catch(err => console.error("Family update error:", err));

          await setDoc(memberRef, {
            uid: vData.uid,
            displayName: vData.displayName || 'Member',
            photoURL: vData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
            role: 'member',
            joinedAt: serverTimestamp(),
            contributionPoints: increment(request.totalCost || 0)
          }, { merge: true }).catch(err => console.error("Family member update error:", err));
        }
      }

      showToast("Private call started! 💎", 'success');
    } catch (error) {
      console.error("Error accepting call:", error);
      showToast("Failed to start call. Check balance.", 'error');
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
    <div className="relative flex flex-col items-end">
      {/* Viewer Side: Request Button */}
      {!isHost && !activeCall && (
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {showSelector && (
              <motion.div 
                initial={{ opacity: 0, x: 10, scale: 0.85, y: "-50%" }}
                animate={{ opacity: 1, x: 0, scale: 0.95, y: "-50%" }}
                exit={{ opacity: 0, x: 10, scale: 0.85, y: "-50%" }}
                className="absolute right-[52px] top-1/2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col gap-1.5 min-w-[92px] shadow-2xl z-50"
              >
                <div className="flex items-center justify-between px-0.5 mb-0.5">
                  <span className="text-[6.5px] font-black uppercase tracking-widest text-white/40">Private Call</span>
                  <button onClick={() => setShowSelector(false)} className="text-white/20 hover:text-white cursor-pointer">
                    <X size={8} />
                  </button>
                </div>

                <div className="flex gap-1">
                  {/* Video Option */}
                  <button 
                    onClick={() => {
                      setSelectedType('video');
                      handleRequestCall('video');
                    }}
                    disabled={isRequesting}
                    className="flex-1 flex flex-col items-center gap-0.5 p-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all group/btn cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-pink-500/20 rounded-md flex items-center justify-center text-pink-500 group-hover/btn:scale-110 transition-transform">
                      <Video size={11} fill="currentColor" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[6px] font-black uppercase text-white/60">Video</span>
                      <span className="text-[6.5px] font-black italic text-pink-500">{PRIVATE_CALL_FEE_VIDEO}/m</span>
                    </div>
                  </button>

                  {/* Audio Option */}
                  <button 
                    onClick={() => {
                      setSelectedType('audio');
                      handleRequestCall('audio');
                    }}
                    disabled={isRequesting}
                    className="flex-1 flex flex-col items-center gap-0.5 p-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all group/btn cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-md flex items-center justify-center text-emerald-400 group-hover/btn:scale-110 transition-transform">
                      <Mic size={11} fill="currentColor" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[6px] font-black uppercase text-white/60">Audio</span>
                      <span className="text-[6.5px] font-black italic text-emerald-400">{PRIVATE_CALL_FEE_AUDIO}/m</span>
                    </div>
                  </button>
                </div>

                <div className="px-0.5 pt-0.5">
                  <div className="flex items-center justify-between text-[6px] font-black uppercase tracking-widest text-white/20 mb-1">
                    <span>Duration</span>
                    <span className="text-white/60">{duration}m</span>
                  </div>
                  <div className="flex gap-1">
                    {[5, 10, 20].map(d => (
                      <button 
                        key={d}
                        onClick={() => setDuration(d)}
                        className={cn(
                          "flex-1 py-0 px-0.5 rounded text-[6px] font-black transition-all cursor-pointer",
                          duration === d ? "bg-white/20 text-white" : "bg-white/5 text-white/20"
                        )}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="flex flex-col items-center gap-1 group relative animate-none"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform relative z-10 border border-white/10">
              <Phone size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase text-center relative z-10">Private</span>
          </button>
        </div>
      )}

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
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">
                    Private {requests[0].type || 'Call'}
                  </span>
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
              
              {/* Family Connection Indicator */}
              {(viewerFamily || hostFamily) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                >
                  <Shield size={12} className="text-yellow-500" fill="currentColor" />
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                    {viewerFamily && hostFamily ? "Tribe Alliance Active" : "Family Contribution Live"}
                  </span>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-ping" />
                </motion.div>
              )}

              <div className="text-4xl font-black italic tracking-tighter text-white">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl relative">
                  <img src={activeCall.viewerPhoto} className="w-full h-full object-cover" />
                  {viewerFamily && (
                    <div className="absolute bottom-1 right-1">
                      <FamilyBadge familyName={viewerFamily.name} familyLevel={viewerFamily.level} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black italic uppercase tracking-tight text-white/60">{activeCall.viewerName}</span>
                  {viewerFamily && (
                    <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest mt-0.5">{viewerFamily.name}</span>
                  )}
                </div>
              </div>

              <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800 flex items-center justify-center relative">
                  {activeCall.hostPhoto ? (
                    <img src={activeCall.hostPhoto} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-white/20" />
                  )}
                  {hostFamily && (
                    <div className="absolute bottom-1 right-1">
                      <FamilyBadge familyName={hostFamily.name} familyLevel={hostFamily.level} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black italic uppercase tracking-tight text-white/60">{activeCall.hostName || 'Host'}</span>
                  {hostFamily && (
                    <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mt-0.5">{hostFamily.name}</span>
                  )}
                </div>
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
