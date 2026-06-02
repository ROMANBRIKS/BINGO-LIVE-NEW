import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, addDoc, serverTimestamp, increment, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Diamond, ChevronRight, User, Zap, Users, Sparkles, Send, Flame, Trophy, Check } from 'lucide-react';
import { calculateGiftingPower, formatPowerDisplay } from '../nobleGiftingLogic';
import { SVIPManager } from '../lib/svipLogic';
import { getSnipeMultiplier, isSnipeWindow } from '../pkEnhancedLogic';
import { PK_SHIELDS, ShieldTier, calculateShieldedScore } from '../pkShieldLogic';
import { calculateWealthLevel } from '../wealthLogic';
import { DEFAULT_POPULAR_GIFTS } from '../constants/gifts';
import { calculateFamilyContribution, getFamilyMultiplier } from '../familyLogic';
import { calculateAgencyCommission } from '../agencyLogic';
import { processGiftTransaction } from '../services/giftingService';

const TABS = ['Popular', 'Activity', 'Local', 'Fun', 'Treasure', 'Shields'];

// High-end preset quantities with iconic cultural titles to matches premium look
const COMBO_PRESETS = [
  { value: 1, label: 'Single', icon: '👍' },
  { value: 10, label: 'Heart', icon: '❤️' },
  { value: 99, label: 'Lucky', icon: '🍀' },
  { value: 188, label: 'Wow', icon: '🔥' },
  { value: 520, label: 'Love', icon: '💖' },
  { value: 999, label: 'Mega', icon: '👑' },
];

export const GiftingModal = ({ room, seats, onClose, onGiftSent }: { room: any, seats?: any[], onClose: () => void, onGiftSent?: (gift: Gift, quantity: number) => void }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const isSimulatedRoom = !room?.id || room.id === 'shyne_featured' || room.id.startsWith('host_') || room.id.startsWith('sim_') || room.id.includes('featured');
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sending, setSending] = useState(false);
  const [svipDiscount, setSvipDiscount] = useState(0);
  const [dynamicGifts, setDynamicGifts] = useState<Gift[]>([]);

  // Multi-Target recipient list state
  const [selectedTargets, setSelectedTargets] = useState<string[]>([room.hostUid]);

  // Construct target options from stream metadata
  const availableTargets = React.useMemo(() => {
    const list: Array<{ uid: string; displayName: string; photoURL: string; role: string }> = [];
    
    // 1. Host
    list.push({
      uid: room.hostUid,
      displayName: room.hostName || "Host",
      photoURL: room.hostPhotoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      role: 'Anchor'
    });

    // 2. PK rival
    if (room.pkStatus === 'battling') {
      list.push({
        uid: room.pkOpponentUid || 'opponent_live',
        displayName: "M.ø.l.l.y",
        photoURL: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
        role: 'Opponent'
      });
    }

    // 3. Seated stream guests
    if (seats && Array.isArray(seats)) {
      seats.forEach((seat, idx) => {
        if (seat.status === 'occupied' && seat.uid) {
          list.push({
            uid: seat.uid,
            displayName: seat.displayName || `Seat ${idx + 1}`,
            photoURL: seat.photoURL || `https://i.pravatar.cc/150?u=${seat.uid}`,
            role: `Seat ${idx + 1}`
          });
        }
      });
    }

    return list;
  }, [room, seats]);

  // Multi targeting select handoffs
  const toggleTarget = (uid: string) => {
    setSelectedTargets(prev => {
      if (prev.includes(uid)) {
        if (prev.length === 1) return prev; // Cannot deselect last recipient
        return prev.filter(x => x !== uid);
      } else {
        return [...prev, uid];
      }
    });
  };

  const isAllSelected = selectedTargets.length === availableTargets.length;
  const toggleAllTargets = () => {
    if (isAllSelected) {
      setSelectedTargets([room.hostUid]);
    } else {
      setSelectedTargets(availableTargets.map(t => t.uid));
    }
  };

  // Combo Machine States
  const [comboCount, setComboCount] = useState(0);
  const [comboTimeLeft, setComboTimeLeft] = useState(0); // 0 to 100
  const [bubbles, setBubbles] = useState<Array<{ id: number, x: number, char: string }>>([]);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  // Fetch Dynamic Gifts
  useEffect(() => {
    const q = query(collection(db, 'gifts'), orderBy('cost', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const giftList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Gift))
        .filter(g => (g as any).status !== 'deleted'); // Handle soft delete
      setDynamicGifts(giftList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gifts');
    });
    return () => unsub();
  }, []);

  const familyMultiplier = getFamilyMultiplier(room);

  useEffect(() => {
    if (profile) {
      SVIPManager.getDiamondDiscount(profile.uid).then(setSvipDiscount);
    }
  }, [profile]);

  const pkEndTime = room.pkEndTime;
  const isSnipe = pkEndTime ? isSnipeWindow(pkEndTime) : false;
  const snipeMultiplier = pkEndTime ? getSnipeMultiplier(pkEndTime) : 1.0;

  // Countdown timer thread for combo expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (comboTimeLeft > 0) {
      interval = setInterval(() => {
        setComboTimeLeft(prev => {
          if (prev <= 2) {
            setComboCount(0);
            return 0;
          }
          return prev - 2; // Decays by 2% each 100ms (totals 5s)
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [comboTimeLeft]);

  // Clean memory for floating particles
  useEffect(() => {
    if (bubbles.length > 20) {
      setBubbles(prev => prev.slice(-15));
    }
  }, [bubbles]);

  const handleRecharge = async () => {
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        diamonds: increment(1000)
      }, { merge: true });
      showToast("Recharged 1,000 Diamonds! 💎", 'success');
    } catch (error) {
      console.error("Recharge error:", error);
    }
  };

  const playSynthesizedHapticSound = (frequency: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Ignored if client holds audio restrictions
    }
  };

  // Fast swipe handler
  const handleFastSwipeSend = async (gift: Gift) => {
    if (!profile) return;
    const finalCost = Math.floor(gift.cost * (1 - svipDiscount / 100)) * selectedTargets.length;
    if (profile.diamonds < finalCost) {
      showToast("Insufficient diamonds for swipe! 💎", 'error');
      return;
    }

    playSynthesizedHapticSound(500);
    showToast(`🚀 Fast-Swiped: ${gift.name}!`, 'success');

    // Spawn swipe trail bubble
    const giftChar = gift.image.startsWith('/') || gift.image.startsWith('http') ? '🎁' : gift.image;
    setBubbles(prev => [...prev, {
      id: Math.random() + Date.now(),
      x: (Math.random() - 0.5) * 60,
      char: giftChar
    }]);

    try {
      for (const targetUid of selectedTargets) {
        const result = await processGiftTransaction(
          profile.uid,
          targetUid,
          room.id,
          gift,
          1,
          activeTab,
          snipeMultiplier,
          svipDiscount
        );

        if (result.success) {
          const matchedTarget = availableTargets.find(t => t.uid === targetUid);
          const targetName = matchedTarget ? matchedTarget.displayName : "User";

          if (!isSimulatedRoom) {
            await addDoc(collection(db, `rooms/${room.id}/messages`), {
              text: `fast-swiped 1x ${gift.name} to ${targetName}! 🚀☄️`,
              uid: profile.uid,
              displayName: profile.displayName,
              photoURL: profile.photoURL,
              svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
              familyId: profile.familyId || null,
              familyName: profile.familyName || null,
              timestamp: serverTimestamp(),
              isGift: true,
              giftId: gift.id,
              giftImage: gift.image,
              quantity: 1,
              animationType: gift.animationType,
              animationUrl: (gift as any).animationUrl || null,
              giftType: (gift as any).giftType || null,
              cost: gift.cost || 0,
              nobleTier: profile.nobleTitle || 'None',
              fanClubLevel: result.fanClubLevel,
              fanClubHostName: targetName,
              shieldAbsorbedValue: result.shieldAbsorbedValue || 0
            });
          }
        }
      }
      
      if (onGiftSent) onGiftSent(gift, 1);
    } catch (error) {
      console.error(error);
    }
  };

  // Combo Tick Trigger (Fires precisely 1x of chosen gift)
  const handleComboTrigger = async () => {
    if (!profile || !selectedGift) return;

    const finalCost = Math.floor(selectedGift.cost * (1 - svipDiscount / 100)) * selectedTargets.length;
    if (profile.diamonds < finalCost) {
      showToast("Out of Diamonds! Tap Recharge to keep going! 💎", 'error');
      setComboCount(0);
      setComboTimeLeft(0);
      isHoldingRef.current = false;
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    const nextCombo = comboCount + 1;
    setComboCount(nextCombo);
    setComboTimeLeft(100); // refresh the countdown bar to full 5s

    // Play pitch-climbing harmonic synth
    playSynthesizedHapticSound(440 + (nextCombo * 8));

    // Spawn floating particle
    const isImage = selectedGift.image.startsWith('/') || selectedGift.image.startsWith('http');
    const giftChar = isImage ? '🎁' : selectedGift.image;
    setBubbles(prev => [...prev, {
      id: Math.random() + Date.now(),
      x: (Math.random() - 0.5) * 60,
      char: giftChar
    }]);

    try {
      for (const targetUid of selectedTargets) {
        const result = await processGiftTransaction(
          profile.uid,
          targetUid,
          room.id,
          selectedGift,
          1,
          activeTab,
          snipeMultiplier,
          svipDiscount
        );

        if (result.success) {
          const matchedTarget = availableTargets.find(t => t.uid === targetUid);
          const targetName = matchedTarget ? matchedTarget.displayName : "User";

          // Add to stream message history as a dynamic Combo message
          if (!isSimulatedRoom) {
            await addDoc(collection(db, `rooms/${room.id}/messages`), {
              text: `sent Combo x${nextCombo} of ${selectedGift.name} to ${targetName}! 🔥⚡`,
              uid: profile.uid,
              displayName: profile.displayName,
              photoURL: profile.photoURL,
              svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
              familyId: profile.familyId || null,
              familyName: profile.familyName || null,
              timestamp: serverTimestamp(),
              isGift: true,
              giftId: selectedGift.id,
              giftImage: selectedGift.image,
              quantity: 1,
              animationType: selectedGift.animationType,
              animationUrl: (selectedGift as any).animationUrl || null,
              giftType: (selectedGift as any).giftType || null,
              cost: selectedGift.cost || 0,
              nobleTier: profile.nobleTitle || 'None',
              fanClubLevel: result.fanClubLevel,
              fanClubHostName: targetName,
              shieldAbsorbedValue: result.shieldAbsorbedValue || 0
            });
          }
        }
      }

      if (onGiftSent) onGiftSent(selectedGift, 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Hold continuous trigger
  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (sending || !selectedGift) return;
    
    isHoldingRef.current = true;
    handleComboTrigger(); // instant first send
    
    holdTimerRef.current = setInterval(() => {
      if (isHoldingRef.current) {
        handleComboTrigger();
      }
    }, 380); // Fire rate: once per 380ms
  };

  const handleHoldEnd = () => {
    isHoldingRef.current = false;
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Standard multi-quantity sender (Send Button)
  const sendGift = async () => {
    if (!profile || !selectedGift || sending) return;
    const singleCost = Math.floor(selectedGift.cost * quantity * (1 - svipDiscount / 100));
    const finalCost = singleCost * selectedTargets.length;

    if (profile.diamonds < finalCost) {
      showToast("Insufficient diamonds to send this batch! 💎", 'error');
      return;
    }

    setSending(true);
    playSynthesizedHapticSound(380);

    try {
      for (const targetUid of selectedTargets) {
        const result = await processGiftTransaction(
          profile.uid,
          targetUid,
          room.id,
          selectedGift,
          quantity,
          activeTab,
          snipeMultiplier,
          svipDiscount
        );

        if (result.success) {
          if (profile.familyId && !isSimulatedRoom) {
            const familyPoints = calculateFamilyContribution(selectedGift.cost * quantity, room);
            const familyRef = doc(db, 'families', profile.familyId);
            const memberRef = doc(db, `families/${profile.familyId}/members`, profile.uid);
            
            await updateDoc(familyRef, {
              totalDiamondsSpent: increment(familyPoints)
            }).catch(err => console.error("Family update error:", err));

            await setDoc(memberRef, {
              uid: profile.uid,
              displayName: profile.displayName || 'Member',
              photoURL: profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
              role: 'member',
              joinedAt: serverTimestamp(),
              contributionPoints: increment(familyPoints)
            }, { merge: true }).catch(err => console.error("Family member update error:", err));
          }

          if (result.isNewJoinFanClub) {
            showToast(`Welcome to the Fan Club! 💖 Club badge unlocked.`, 'success');
          }

          if (result.treasureGoalCompleted && result.completedTreasureGoal) {
            showToast(`🎁 ${result.completedTreasureGoal.rewardName} Unlocked!`, 'success');
          }

          const matchedTarget = availableTargets.find(t => t.uid === targetUid);
          const targetName = matchedTarget ? matchedTarget.displayName : "User";

          if (!isSimulatedRoom) {
            await addDoc(collection(db, `rooms/${room.id}/messages`), {
              text: `sent ${quantity}x ${selectedGift.name} to ${targetName}! 🎁✨`,
              uid: profile.uid,
              displayName: profile.displayName,
              photoURL: profile.photoURL,
              svipTier: profile.svipStatus?.status === 'active' ? profile.svipStatus.tier : null,
              familyId: profile.familyId || null,
              familyName: profile.familyName || null,
              timestamp: serverTimestamp(),
              isGift: true,
              giftId: selectedGift.id,
              giftImage: selectedGift.image,
              quantity: quantity,
              animationType: selectedGift.animationType,
              animationUrl: (selectedGift as any).animationUrl || null,
              giftType: (selectedGift as any).giftType || null,
              cost: selectedGift.cost || 0,
              nobleTier: profile.nobleTitle || 'None',
              fanClubLevel: result.fanClubLevel,
              fanClubHostName: targetName,
              shieldAbsorbedValue: result.shieldAbsorbedValue || 0
            });

            await addDoc(collection(db, 'transactions'), {
              fromUid: profile.uid,
              toUid: targetUid,
              amount: result.totalCost,
              type: 'gift',
              timestamp: serverTimestamp(),
              giftId: selectedGift.id,
              quantity: quantity
            });
          }
        }
      }

      if (onGiftSent) {
        onGiftSent(selectedGift, quantity);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gifting');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[110] backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 24, stiffness: 320 }}
        className="w-full max-w-lg bg-neutral-950/95 border-t border-neutral-800 rounded-t-[28px] overflow-hidden flex flex-col shadow-[0_-15px_40px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Segment: Target Anchor Details & Gifting Power Indicators */}
        <div className="px-4 py-2.5 bg-neutral-900/40 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1 bg-neutral-800/60 px-2 py-0.5 rounded-full select-none">
              <Trophy size={10} className="text-yellow-400" />
              Gift Power
            </span>
            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: selectedGift ? '100%' : '35%' }}
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500" 
              />
            </div>
            <span className="text-[9px] font-extrabold text-neutral-300">
              {profile ? formatPowerDisplay(profile) || 'Basic power' : 'Load...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-4 bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-0.5 rounded-full">
            <User size={10} className="text-cyan-400 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-tight text-cyan-300">
              Host: {room.hostName || 'Anchor'}
            </span>
          </div>
        </div>

        {/* Swipe-Up Prompt Floating Hint */}
        <div className="text-[8px] font-bold text-center text-neutral-500 py-1 bg-neutral-900/10 border-b border-neutral-900 select-none">
          ✨ TIP : Swipe UP on any gift card to fast-send 1x instantly!
        </div>

        {/* Recipient Multi-Selector Strip */}
        <div className="bg-neutral-950 border-b border-neutral-900 px-4 py-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
              Target Recipient(s)
            </span>
            <button 
              onClick={toggleAllTargets}
              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-all border ${
                isAllSelected 
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white border-transparent shadow-sm'
                  : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300'
              }`}
            >
              {isAllSelected ? '🎁 Gifting All' : 'Select All'}
            </button>
          </div>
          <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none">
            {availableTargets.map((target) => {
              const isSelected = selectedTargets.includes(target.uid);
              return (
                <button
                  key={target.uid}
                  onClick={() => {
                    toggleTarget(target.uid);
                    playSynthesizedHapticSound(isSelected ? 300 : 450);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group relative"
                >
                  <div className="relative">
                    <motion.div 
                      className={`w-11 h-11 rounded-full flex items-center justify-center p-[2px] transition-all duration-300 relative ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' 
                          : 'bg-neutral-800'
                      }`}
                    >
                      <img 
                        src={target.photoURL} 
                        alt={target.displayName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover border border-neutral-950" 
                      />
                    </motion.div>

                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-neutral-950 flex items-center justify-center shadow-md shadow-black/80"
                      >
                        <Check size={8} strokeWidth={4} className="text-white" />
                      </motion.div>
                    )}
                  </div>

                  <span className="text-[9px] font-black tracking-tight text-neutral-300 truncate w-14 text-center leading-none">
                    {target.displayName}
                  </span>
                  
                  <span className={`text-[8px] font-extrabold uppercase px-1 rounded scale-90 leading-none py-0.5 ${
                    target.role === 'Anchor' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : target.role === 'Opponent' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {target.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex items-center px-3 py-1 bg-neutral-900/20 gap-1 border-b border-neutral-900/80 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                playSynthesizedHapticSound(300);
              }}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider relative transition-all ${
                activeTab === tab ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <span className="relative z-10">{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_-2px_10px_rgba(6,182,212,0.6)]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Inner Scrolling Gift Inventory Grid */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 p-4 min-h-[170px] max-h-[290px] overflow-y-auto bg-neutral-950/40 custom-scrollbar">
          
          {/* Dynamic Loaded database gifts */}
          {dynamicGifts.filter(g => g.category === activeTab).map(gift => (
            <div key={gift.id} className="relative flex flex-col items-center">
              <motion.button 
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.6, bottom: 0.1 }}
                onDragEnd={(e, info) => {
                  if (info.offset.y < -55) {
                    handleFastSwipeSend(gift);
                  }
                }}
                onClick={() => {
                  setSelectedGift(gift);
                  playSynthesizedHapticSound(350);
                }}
                className={`w-full py-2.5 rounded-2xl flex flex-col items-center relative transition-all duration-300 ${
                  selectedGift?.id === gift.id 
                    ? 'bg-neutral-900/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-102' 
                    : 'bg-neutral-950 border border-neutral-900 hover:border-neutral-800'
                }`}
              >
                {selectedGift?.id === gift.id && (
                  <motion.div 
                    layoutId="breathingOrb" 
                    className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-sm" 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                
                {/* Gift Visual Display */}
                <div className="relative z-10 w-11 h-11 flex items-center justify-center mb-1">
                  {gift.image.startsWith('/') || gift.image.startsWith('http') ? (
                    <img 
                      src={gift.image} 
                      className="w-9 h-9 object-contain drop-shadow-md select-none pointer-events-none" 
                      alt={gift.name} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span className="text-2xl select-none pointer-events-none drop-shadow-md">{gift.image}</span>
                  )}
                  
                  {gift.isFlash && (
                    <span className="absolute -top-1 -right-2 bg-gradient-to-r from-rose-500 to-orange-500 text-[6px] font-black px-1 py-0.2 rounded-full uppercase tracking-tighter text-white">
                      Flash
                    </span>
                  )}
                </div>

                <span className="relative z-10 text-[9px] font-extrabold text-neutral-300 tracking-tight line-clamp-1 text-center px-1">
                  {gift.name}
                </span>

                <div className="relative z-10 flex items-center gap-0.5 mt-0.5">
                  <Diamond size={6} className="text-cyan-400 shrink-0" />
                  <span className="text-[8px] font-black text-neutral-400">
                    {svipDiscount > 0 ? (
                      <span className="flex items-center gap-0.5">
                        <span className="line-through text-neutral-600 text-[7px]">{gift.cost}</span>
                        <span className="text-cyan-300 font-bold">{Math.floor(gift.cost * (1 - svipDiscount / 100))}</span>
                      </span>
                    ) : gift.cost}
                  </span>
                </div>
              </motion.button>
            </div>
          ))}

          {/* Hardcoded system default gifts fallback when dynamic pool is empty */}
          {activeTab === 'Popular' && dynamicGifts.filter(g => g.category === 'Popular').length === 0 && DEFAULT_POPULAR_GIFTS.map(gift => (
            <div key={gift.id} className="relative flex flex-col items-center">
              <motion.button 
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.6, bottom: 0.1 }}
                onDragEnd={(e, info) => {
                  if (info.offset.y < -55) {
                    handleFastSwipeSend(gift);
                  }
                }}
                onClick={() => {
                  setSelectedGift(gift);
                  playSynthesizedHapticSound(350);
                }}
                className={`w-full py-2.5 rounded-2xl flex flex-col items-center relative transition-all duration-300 ${
                  selectedGift?.id === gift.id 
                    ? 'bg-neutral-900/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-102' 
                    : 'bg-neutral-950 border border-neutral-900 hover:border-neutral-800'
                }`}
              >
                {selectedGift?.id === gift.id && (
                  <motion.div 
                    layoutId="breathingOrb" 
                    className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-sm animate-pulse" 
                  />
                )}
                
                <div className="relative z-10 w-11 h-11 flex items-center justify-center mb-1">
                  {gift.image.startsWith('/') || gift.image.startsWith('http') ? (
                    <img 
                      src={gift.image} 
                      className="w-9 h-9 object-contain drop-shadow-md select-none pointer-events-none" 
                      alt={gift.name} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span className="text-2xl select-none pointer-events-none drop-shadow-md">{gift.image}</span>
                  )}
                  {['dino_gift_box', 'crystal_ball', 'time_shards', 'red_carpet_dinner', 'thunder_bike'].includes(gift.id) && (
                    <span className="absolute -top-1 -right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-[6px] font-black px-1 py-0.2 rounded-full uppercase tracking-tighter text-white">
                      Hot
                    </span>
                  )}
                </div>

                <span className="relative z-10 text-[9px] font-extrabold text-neutral-300 tracking-tight line-clamp-1 text-center px-1">
                  {gift.name}
                </span>

                <div className="relative z-10 flex items-center gap-0.5 mt-0.5">
                  <Diamond size={6} className="text-cyan-400 shrink-0" />
                  <span className="text-[8px] font-black text-neutral-400">
                    {svipDiscount > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-neutral-600 text-[7px]">{gift.cost}</span>
                        <span className="text-cyan-300 font-bold">{Math.floor(gift.cost * (1 - svipDiscount / 100))}</span>
                      </span>
                    ) : gift.cost}
                  </span>
                </div>
              </motion.button>
            </div>
          ))}

          {/* PK Shield Defenses category list */}
          {activeTab === 'Shields' && Object.values(PK_SHIELDS).map(shield => (
            <div key={shield.tier} className="relative flex flex-col items-center">
              <motion.button 
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.6, bottom: 0.1 }}
                onDragEnd={(e, info) => {
                  if (info.offset.y < -55) {
                    const mappedGift: Gift = {
                      id: shield.tier,
                      name: `${shield.tier} Shield`,
                      cost: shield.costBeans,
                      image: '🛡️',
                      animationType: 'standard'
                    };
                    handleFastSwipeSend(mappedGift);
                  }
                }}
                onClick={() => {
                  setSelectedGift({
                    id: shield.tier,
                    name: `${shield.tier} Shield`,
                    cost: shield.costBeans,
                    image: '🛡️',
                    animationType: 'standard'
                  });
                  playSynthesizedHapticSound(350);
                }}
                className={`w-full py-2.5 rounded-2xl flex flex-col items-center relative transition-all duration-300 ${
                  selectedGift?.id === shield.tier 
                    ? 'bg-neutral-900/80 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-102' 
                    : 'bg-neutral-950 border border-neutral-900'
                }`}
              >
                <div className="relative z-10 w-12 h-12 flex items-center justify-center mb-1">
                  <span className="text-3xl select-none pointer-events-none drop-shadow-md" style={{ color: shield.color }}>🛡️</span>
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-[6px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter text-white">
                    Def
                  </span>
                </div>

                <span className="relative z-10 text-[9px] font-black text-neutral-200 tracking-tight text-center px-1">
                  {shield.tier} Shield
                </span>

                <div className="relative z-10 flex items-center gap-0.5 mt-0.5">
                  <Diamond size={6} className="text-cyan-400 shrink-0" />
                  <span className="text-[8px] font-black text-neutral-400">{shield.costBeans}</span>
                </div>

                <div className="relative z-10 text-[7px] font-black uppercase text-blue-400 mt-1">
                  {Math.round(shield.absorptionRate * 100)}% Absorbed
                </div>
              </motion.button>
            </div>
          ))}

          {/* Empty categories status */}
          {!['Popular', 'Shields'].includes(activeTab) && (
            <div className="col-span-4 py-12 flex flex-col items-center justify-center text-center">
              <Sparkles className="text-neutral-700 mb-2" size={18} />
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">
                Category Empty
              </p>
              <p className="text-[8px] text-neutral-600 mt-1">
                New custom items will be loaded from live host campaigns!
              </p>
            </div>
          )}
        </div>

        {/* Selected Gift Informational Banner - Premium Bigo Details */}
        {selectedGift && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-4 py-2 bg-gradient-to-r from-cyan-950/20 via-neutral-900 to-indigo-950/20 border-t border-b border-neutral-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedGift.image.startsWith('/') || selectedGift.image.startsWith('http') ? '🎁' : selectedGift.image}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-tight">{selectedGift.name}</span>
                <span className="text-[7.5px] font-bold text-neutral-400">
                  Weigth Multiplier: <span className="text-cyan-400">x{familyMultiplier} Family bonus active</span>
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[8px] font-black text-neutral-500 uppercase block">Total Cost</span>
              <div className="flex items-center gap-0.5 justify-end">
                <Diamond size={8} className="text-yellow-500 shrink-0" />
                <span className="text-xs font-black text-yellow-400">
                  {Math.floor(selectedGift.cost * quantity * (1 - svipDiscount / 100))}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Bubble Canvas behind the Combo Button */}
        <div className="absolute right-8 bottom-32 w-16 h-40 pointer-events-none overflow-hidden z-50">
          <AnimatePresence>
            {bubbles.map(b => (
              <motion.div
                key={b.id}
                initial={{ y: 80, x: b.x, scale: 0.6, rotate: 0, opacity: 1 }}
                animate={{ 
                  y: -150, 
                  x: b.x + (Math.sin(b.id) * 30), 
                  scale: [0.8, 1.4, 0.9], 
                  rotate: [0, 45, -45],
                  opacity: [0.8, 1, 0] 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="absolute text-2xl select-none filter drop-shadow-[0_4px_10px_rgba(6,182,212,0.6)]"
              >
                {b.char}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Control Bar Area: Wallet & Sends */}
        <div className="p-4 bg-neutral-900/40 border-t border-neutral-800/80 flex items-center justify-between gap-4">
          
          {/* User Wallet */}
          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-1.5 select-none">
              <Diamond size={16} className="text-yellow-500 fill-yellow-500 animate-pulse shrink-0" />
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white leading-none">
                  {profile?.diamonds || 0}
                </span>
                <span className="text-[7.5px] font-extrabold uppercase text-neutral-500 tracking-wider">Diamonds</span>
              </div>
            </div>

            <button 
              onClick={handleRecharge}
              className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest text-orange-400 bg-orange-950/40 border border-orange-850/30 rounded-md hover:bg-orange-900/60 transition-colors inline-flex items-center justify-center"
            >
              Recharge
            </button>
          </div>

          {/* Dynamic Combo Controller vs Multi-preset sends */}
          {selectedGift ? (
            <div className="flex-1 flex items-center justify-end gap-3">
              
              {/* Preset pill dropdown selection panel */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-1 flex items-center gap-1">
                {COMBO_PRESETS.slice(0, 4).map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setQuantity(preset.value);
                      playSynthesizedHapticSound(250);
                    }}
                    title={preset.label}
                    className={`w-8 h-8 rounded-xl flex flex-col items-center justify-center transition-all ${
                      quantity === preset.value 
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black' 
                        : 'text-neutral-500 hover:text-neutral-300 font-extrabold'
                    }`}
                  >
                    <span className="text-[8px] leading-tight font-black">{preset.value}</span>
                    <span className="text-[6.5px] font-bold leading-none">{preset.icon}</span>
                  </button>
                ))}
              </div>

              {/* Bigo Style COMBOS / Hold Continuous Trigger */}
              <div className="relative">
                {/* SVG Progress countdown border ring */}
                <svg className="absolute -inset-1.5 w-[56px] h-[56px] -rotate-90 pointer-events-none z-10">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#171717"
                    strokeWidth="3"
                  />
                  {comboTimeLeft > 0 && (
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="url(#comboGlowGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="150"
                      strokeDashoffset={(150 - (150 * comboTimeLeft) / 100)}
                      style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                  )}
                  <defs>
                    <linearGradient id="comboGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Main COMBO Tap & Hold button */}
                <motion.button
                  onMouseDown={handleHoldStart}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={handleHoldStart}
                  onTouchEnd={handleHoldEnd}
                  animate={comboTimeLeft > 0 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className={`w-[44px] h-[44px] rounded-full flex flex-col items-center justify-center relative select-none z-0 overflow-hidden ${
                    comboTimeLeft > 0 
                      ? 'bg-gradient-to-b from-cyan-400 via-pink-500 to-amber-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' 
                      : 'bg-gradient-to-b from-neutral-800 to-neutral-700 hover:from-neutral-700 border border-neutral-700/80 text-white/50'
                  }`}
                >
                  <Flame size={12} fill="currentColor" className="text-white shrink-0" />
                  <span className="text-[7.5px] font-black tracking-tighter uppercase leading-none mt-0.5">
                    {comboCount > 0 ? `x${comboCount}` : 'Hold'}
                  </span>
                </motion.button>
              </div>

              {/* Standard Send Button */}
              <button
                onClick={sendGift}
                disabled={sending || (profile?.diamonds || 0) < Math.floor(selectedGift.cost * quantity * (1 - svipDiscount / 100)) * selectedTargets.length}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:bg-neutral-800 text-white h-9 px-4 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-cyan-950/30"
              >
                {sending ? '...' : <><Send size={10} className="fill-white" /> Send {quantity} {selectedTargets.length > 1 ? `(to ${selectedTargets.length})` : ''}</>}
              </button>
            </div>
          ) : (
            <div className="flex-1 py-4 text-right text-[10px] font-black uppercase text-neutral-500 tracking-wider">
              👈 Select an Item to send
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

