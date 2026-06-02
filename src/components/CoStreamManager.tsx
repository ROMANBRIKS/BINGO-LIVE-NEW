import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, Phone, Video, PhoneOff, Sparkles, LogOut, Loader2, Plus, VolumeX, Mic
} from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CoStreamManagerProps {
  roomId: string;
  isHost: boolean;
  hostUid: string;
}

interface CoStreamSeat {
  uid: string;
  displayName: string;
  photoURL: string;
  type: 'video' | 'audio';
  joinedAt: number;
}

interface CoStreamRequest {
  uid: string;
  displayName: string;
  photoURL: string;
  type: 'video' | 'audio';
  status: 'pending' | 'accepted' | 'rejected';
}

export function CoStreamManager({ roomId, isHost, hostUid }: CoStreamManagerProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [seat1, setSeat1] = useState<CoStreamSeat | null>(null);
  const [seat2, setSeat2] = useState<CoStreamSeat | null>(null);
  const [requests, setRequests] = useState<Record<string, CoStreamRequest>>({});
  
  // Selection popup states
  const [activeSelectSeat, setActiveSelectSeat] = useState<1 | 2 | null>(null);
  const [showHostRequests, setShowHostRequests] = useState<1 | 2 | null>(null);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Subscribe to room real-time data
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId);

    const unsub = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSeat1(data.guestSeat1 || null);
        setSeat2(data.guestSeat2 || null);
        setRequests(data.coStreamRequests || {});
      }
    });

    return () => unsub();
  }, [roomId]);

  // Handle local camera stream when the current user goes live in a Seat as 'video'
  useEffect(() => {
    const isCurrentUserSeat1 = seat1?.uid === profile?.uid && seat1?.type === 'video';
    const isCurrentUserSeat2 = seat2?.uid === profile?.uid && seat2?.type === 'video';

    if (isCurrentUserSeat1 || isCurrentUserSeat2) {
      if (!localMediaStream) {
        navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 160 }, audio: true })
          .then(stream => {
            setLocalMediaStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.warn("Could not access camera for guest co-stream: ", err);
          });
      }
    } else {
      // Clean up stream if not co-streaming
      if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
        setLocalMediaStream(null);
      }
    }

    return () => {
      if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [seat1, seat2, profile]);

  // Side Effect to attach local webcam track
  useEffect(() => {
    if (localMediaStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localMediaStream;
    }
  }, [localMediaStream]);

  // Request to join co-stream
  const handleSendRequest = async (seatIdx: 1 | 2, callType: 'video' | 'audio') => {
    if (!profile) {
      showToast("Access Required: Log in to join the stream.", 'error');
      return;
    }
    
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const requestPayload: CoStreamRequest = {
        uid: profile.uid,
        displayName: profile.displayName || 'Guest User',
        photoURL: profile.photoURL || '',
        type: callType,
        status: 'pending'
      };

      // Set key in coStreamRequests
      await updateDoc(roomRef, {
        [`coStreamRequests.${profile.uid}`]: requestPayload
      });

      showToast(`Request sent for ${callType} co-stream! Waiting for host... 📡`, 'success');
      setActiveSelectSeat(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to initiate join request.", 'error');
    }
  };

  // Withdraw pending requests
  const handleCancelRequest = async () => {
    if (!profile) return;
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        [`coStreamRequests.${profile.uid}.status`]: 'rejected'
      });
      showToast("Your co-stream request was withdrawn", 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Host Action: Accept a participant into a specific seat
  const handleAcceptParticipant = async (seatIdx: 1 | 2, request: CoStreamRequest) => {
    if (!isHost) return;
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const seatPayload: CoStreamSeat = {
        uid: request.uid,
        displayName: request.displayName,
        photoURL: request.photoURL,
        type: request.type,
        joinedAt: Date.now()
      };

      const updateKey = seatIdx === 1 ? 'guestSeat1' : 'guestSeat2';

      await updateDoc(roomRef, {
        [updateKey]: seatPayload,
        [`coStreamRequests.${request.uid}.status`]: 'accepted'
      });

      showToast(`Approved ${request.displayName}! Seat ${seatIdx} is now active 🟢`, 'success');
      setShowHostRequests(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to fill guest seat.", 'error');
    }
  };

  // Host Action: Decline participant request
  const handleDeclineParticipant = async (request: CoStreamRequest) => {
    if (!isHost) return;
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        [`coStreamRequests.${request.uid}.status`]: 'rejected'
      });
      showToast(`Declined join request from ${request.displayName}`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Disconnect self or another user from stream
  const handleHangupSeat = async (seatIdx: 1 | 2, seatUser: CoStreamSeat) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const updateKey = seatIdx === 1 ? 'guestSeat1' : 'guestSeat2';

      await updateDoc(roomRef, {
        [updateKey]: null,
        [`coStreamRequests.${seatUser.uid}.status`]: 'rejected'
      });

      showToast("Disconnected from live co-stream", 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const pendingRequests = Object.values(requests).filter(r => r.status === 'pending');
  const myPendingRequest = profile ? requests[profile.uid] : null;

  // Render profile avatar/first letter filling the transparent card (for Audio Mode)
  const renderProfileFill = (user: CoStreamSeat) => {
    const firstLetter = user.displayName ? user.displayName.charAt(0).toUpperCase() : '?';
    
    if (user.photoURL) {
      return (
        <img 
          src={user.photoURL} 
          alt={user.displayName}
          className="w-full h-full object-cover transition-all"
          referrerPolicy="no-referrer"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center text-white text-xl font-bold uppercase transition-all">
        {firstLetter}
      </div>
    );
  };

  // Render the circular button when empty (showing own profile letter or placeholder + Join icon)
  const renderEmptyButtonInner = () => {
    if (!profile) {
      return (
        <div className="w-[52px] h-[52px] rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-sm font-bold text-white uppercase">
          +
        </div>
      );
    }

    const firstLetter = profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'D';

    if (profile.photoURL) {
      return (
        <img 
          src={profile.photoURL} 
          alt={profile.displayName || ''} 
          className="w-[52px] h-[52px] rounded-full object-cover border-2 border-white/20 shadow-lg"
          referrerPolicy="no-referrer"
        />
      );
    }

    return (
      <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center border-2 border-white/20 text-base font-black text-black uppercase shadow-lg">
        {firstLetter}
      </div>
    );
  };

  const getSeatHTML = (seatIdx: 1 | 2, seatData: CoStreamSeat | null) => {
    const isMe = profile && seatData && profile.uid === seatData.uid;

    return (
      <div className="relative" key={seatIdx}>
        <AnimatePresence mode="wait">
          {seatData ? (
            /* ================== OCCUPIED STATE ================== */
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-[96px] h-[96px] md:w-[108px] md:h-[108px] rounded-[1.6rem] bg-[#09090b] border border-white/20 relative overflow-hidden group shadow-lg"
            >
              {/* Media Content Area */}
              {seatData.type === 'video' ? (
                // Video Mode: local webcam or simulated preview
                isMe ? (
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover rounded-[1.75rem] bg-black"
                  />
                ) : (
                  <div className="w-full h-full relative bg-zinc-950">
                    {/* Simulated live camera track view */}
                    <img 
                      src={`https://picsum.photos/seed/${seatData.uid}/200/200`}
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2 text-[10px] font-bold text-cyan-400">
                      <div className="flex items-center gap-1 select-none text-[8px] tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                        CAM
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Audio Mode: profile picture/letter fills the entire card
                <div className="w-full h-full relative text-white">
                  {renderProfileFill(seatData)}
                  {/* Subtle audio indicator layout overlay */}
                  <div className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded-md text-[10px] text-green-400 flex items-center gap-1">
                    <Mic size={10} />
                    <span>Live</span>
                  </div>
                </div>
              )}

              {/* Status label overlay on active seats */}
              <div className="absolute top-0 left-0 right-0 bg-black/40 backdrop-blur-[1px] py-1 px-2 text-center text-[9px] text-zinc-100 font-extrabold tracking-wider truncate uppercase">
                {seatData.displayName}
              </div>

              {/* Control Overlays: End live streams */}
              {(isHost || isMe) && (
                <button 
                  onClick={() => handleHangupSeat(seatIdx, seatData)}
                  className="absolute inset-0 bg-red-600/95 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                  title="Hang Up"
                >
                  <PhoneOff size={14} className="animate-pulse" />
                  <span className="text-[6px] font-black uppercase tracking-wider mt-0.5">End</span>
                </button>
              )}
            </motion.div>
          ) : (
            /* ================== EMPTY STATE ================== */
            <div className="relative">
              {myPendingRequest && myPendingRequest.status === 'pending' ? (
                <motion.div 
                  onClick={handleCancelRequest}
                  className="w-[96px] h-[96px] md:w-[108px] md:h-[108px] rounded-[1.6rem] bg-white/[0.03] border border-amber-400/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/[0.08]"
                  title="Withdraw Pending Join Request"
                >
                  <Loader2 size={24} className="text-amber-400 animate-spin" />
                  <span className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wider">
                    Pending
                  </span>
                  <span className="text-[9px] text-zinc-400 hover:text-red-400 font-bold uppercase tracking-wider">Cancel</span>
                </motion.div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (isHost) {
                      setShowHostRequests(seatIdx);
                    } else {
                      setActiveSelectSeat(seatIdx);
                    }
                  }}
                  className="w-[96px] h-[96px] md:w-[108px] md:h-[108px] rounded-[1.6rem] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex flex-col items-center justify-center relative cursor-pointer group shadow-lg"
                >
                  {/* Circle with first letter inside or current avatar */}
                  {renderEmptyButtonInner()}
                  <span className="text-[11px] font-black text-white/50 group-hover:text-white transition-colors tracking-widest mt-2">
                    + JOIN
                  </span>

                  {/* Red notification dots on Empty Seat (For Hosts receiving Requests) */}
                  {isHost && pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-black animate-ping" />
                  )}
                </motion.button>
              )}

              {/* ACTION DIALOGS / POPUPS */}
              {/* Option Selector Popup (Audio Vs Video) for Viewers */}
              <AnimatePresence>
                {activeSelectSeat === seatIdx && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className="absolute right-[5vw] top-0 bg-[#09090b] border border-white/20 rounded-xl p-1.5 shadow-2xl z-[200] flex flex-col gap-1 min-w-[100px]"
                  >
                    <div className="px-1.5 py-0.5 text-[6px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 whitespace-nowrap">
                      Choose Call Mode
                    </div>
                    <button 
                      onClick={() => handleSendRequest(seatIdx, 'video')}
                      className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-white/5 rounded-md text-[8px] text-cyan-400 font-extrabold uppercase text-left transition-colors"
                    >
                      <Video size={10} />
                      Video Call
                    </button>
                    <button 
                      onClick={() => handleSendRequest(seatIdx, 'audio')}
                      className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-white/5 rounded-md text-[8px] text-green-400 font-extrabold uppercase text-left transition-colors"
                    >
                      <Phone size={10} />
                      Audio Only
                    </button>
                    <button 
                      onClick={() => setActiveSelectSeat(null)}
                      className="w-full text-center py-0.5 text-zinc-500 hover:text-white rounded text-[7px]"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Host Candidate Accept Dialog */}
              <AnimatePresence>
                {showHostRequests === seatIdx && isHost && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-20 top-0 bg-[#0c0c0d] border border-white/10 rounded-[1.5rem] p-3 shadow-2xl z-[200] w-64 text-left"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                      <h4 className="text-[9px] font-black text-white uppercase tracking-widest">
                        Requests Seat {seatIdx}
                      </h4>
                      <button onClick={() => setShowHostRequests(null)} className="text-zinc-500 hover:text-white">
                        <X size={10} />
                      </button>
                    </div>

                    {pendingRequests.length === 0 ? (
                      <p className="text-[8px] text-zinc-500 font-extrabold text-center py-4">
                        No pending join applications
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {pendingRequests.map(req => (
                          <div 
                            key={req.uid}
                            className="bg-white/[0.02] border border-white/5 rounded-lg p-1.5 flex items-center justify-between gap-1.5 hover:bg-white/5 transition-colors"
                          >
                            <div className="min-w-0 flex-1 flex items-center gap-1.5">
                              {req.photoURL ? (
                                <img src={req.photoURL} alt="" className="w-5 h-5 rounded object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                  {req.displayName.slice(0,1)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[9px] font-black text-white truncate leading-none mb-0.5">
                                  {req.displayName}
                                </p>
                                <p className="text-[6.5px] font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-0.5">
                                  {req.type === 'video' ? <Video size={6} /> : <Phone size={6} />}
                                  {req.type} Call
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-0.5 shrink-0">
                              <button 
                                onClick={() => handleAcceptParticipant(seatIdx, req)}
                                className="w-5 h-5 bg-green-500 hover:bg-green-400 text-black rounded flex items-center justify-center cursor-pointer"
                                title="Approve"
                              >
                                <Check size={8} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={() => handleDeclineParticipant(req)}
                                className="w-5 h-5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded flex items-center justify-center cursor-pointer"
                                title="Decline"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const isMeJoined = (seat1?.uid === profile?.uid) || (seat2?.uid === profile?.uid);

  const renderSeats = () => {
    const elements: React.ReactNode[] = [];

    // 1. Show occupied seat 1 if any
    if (seat1) {
      elements.push(getSeatHTML(1, seat1));
    }

    // 2. Show occupied seat 2 if any
    if (seat2) {
      elements.push(getSeatHTML(2, seat2));
    }

    // 3. Render at most one empty join trigger if the user hasn't joined yet
    const bothOccupied = seat1 && seat2;
    if (!isMeJoined && !bothOccupied) {
      if (!seat1) {
        elements.push(getSeatHTML(1, null));
      } else {
        elements.push(getSeatHTML(2, null));
      }
    }

    return <>{elements}</>;
  };

  return (
    <div className="absolute bottom-[72px] right-4 z-[100] flex flex-col gap-3 pointer-events-auto items-end">
      {renderSeats()}
    </div>
  );
}
