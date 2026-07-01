import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, addDoc, serverTimestamp, increment, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Diamond, ChevronRight, User, Zap, Users, Sparkles, Send, Flame, Trophy, Check, X } from 'lucide-react';
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

  // Swipe Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const [dragDirection, setDragDirection] = useState(0); // -1 for left, 1 for right

  // Reset page when activeTab changes
  useEffect(() => {
    setCurrentPage(0);
    setDragDirection(0);
  }, [activeTab]);

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
    <div className="fixed inset-0 bg-black/15 flex items-end justify-center z-[110]" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 340 }}
        className="w-full max-w-md bg-neutral-950/95 border-t border-neutral-800 rounded-t-[20px] overflow-hidden flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Segment: Compact Details & Power Indicators */}
        <div className="px-3 py-1 bg-neutral-900/40 border-b border-neutral-800/60 flex items-center justify-between text-[8px] select-none">
          <div className="flex items-center gap-1 flex-1 max-w-[55%]">
            <Trophy size={8} className="text-yellow-400 shrink-0" />
            <span className="font-extrabold uppercase text-neutral-400">Power:</span>
            <div className="flex-1 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: selectedGift ? '100%' : '35%' }}
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500" 
              />
            </div>
            <span className="text-neutral-300 font-black truncate">
              {profile ? formatPowerDisplay(profile) || '1x' : '1x'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-bold">
            Swipe <span>↑</span> to send instantly!
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-cyan-950/30 border border-cyan-900/20 px-1.5 py-0.2 rounded">
              <User size={8} className="text-cyan-400 shrink-0" />
              <span className="font-black uppercase tracking-tight text-cyan-300 max-w-[45px] truncate leading-none">
                {room.hostName || 'Anchor'}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white p-0.5 rounded transition-colors flex items-center justify-center shrink-0 border border-neutral-700"
              title="Close panel"
            >
              <X size={7} strokeWidth={4} />
            </button>
          </div>
        </div>

        {/* Recipient Multi-Selector Strip - Bubble Chips */}
        <div className="bg-neutral-950 border-b border-neutral-900 px-3 py-1.5 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1 select-none">
              <span className="w-1 h-1 bg-cyan-455 rounded-full animate-ping" />
              Recipients
            </span>
            <button 
              onClick={toggleAllTargets}
              className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded transition-all border ${
                isAllSelected 
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-550 text-white border-transparent'
                  : 'bg-neutral-900 text-neutral-550 border-neutral-800'
              }`}
            >
              {isAllSelected ? '🎁 AllSelected' : 'Select All'}
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {availableTargets.map((target) => {
              const isSelected = selectedTargets.includes(target.uid);
              return (
                <button
                  key={target.uid}
                  onClick={() => {
                    toggleTarget(target.uid);
                    playSynthesizedHapticSound(isSelected ? 300 : 450);
                  }}
                  className="flex items-center gap-1.5 bg-neutral-900/40 border border-neutral-850 rounded-full pl-1 pr-2 py-0.5 shrink-0 group relative"
                >
                  <div className="relative">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center p-[1px] transition-all duration-300 relative ${
                        isSelected 
                          ? 'bg-gradient-to-tr from-cyan-400 to-pink-500 shadow-[0_0_4px_rgba(6,182,212,0.4)]' 
                          : 'bg-neutral-800'
                      }`}
                    >
                      <img 
                        src={target.photoURL} 
                        alt={target.displayName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover border border-neutral-950" 
                      />
                    </div>

                    {isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-black">
                        <Check size={5} strokeWidth={5} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[8px] font-black text-neutral-300 truncate max-w-[50px]">
                      {target.displayName}
                    </span>
                    <span className="text-[6px] font-extrabold text-cyan-400 uppercase scale-90 origin-left mt-0.2">
                      {target.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex items-center px-2 py-0.5 bg-neutral-900/10 gap-0.5 border-b border-neutral-900/60 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                playSynthesizedHapticSound(300);
              }}
              className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wide relative transition-all ${
                activeTab === tab ? 'text-cyan-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <span className="relative z-10">{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute bottom-0 left-1 right-1 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Inner Scrolling Gift Grid - Highly Compressed */}
        {(() => {
          const categoryItems = (() => {
            if (activeTab === 'Shields') {
              return Object.values(PK_SHIELDS).map(shield => ({
                id: shield.tier,
                name: `${shield.tier} Shield`,
                cost: shield.costBeans,
                image: '🛡️',
                animationType: 'standard',
                isShield: true,
                shield: shield
              }));
            }
            const list = dynamicGifts.filter(g => g.category === activeTab);
            if (activeTab === 'Popular' && list.length === 0) {
              return DEFAULT_POPULAR_GIFTS;
            }
            return list;
          })();

          const itemsPerPage = 8;
          const pageCount = Math.ceil(categoryItems.length / itemsPerPage) || 1;
          const safeCurrentPage = Math.min(currentPage, pageCount - 1);
          const pageItems = categoryItems.slice(safeCurrentPage * itemsPerPage, (safeCurrentPage + 1) * itemsPerPage);

          if (categoryItems.length === 0) {
            return (
              <div className="bg-neutral-950/40 p-6 min-h-[120px] flex flex-col items-center justify-center text-center">
                <Sparkles className="text-neutral-700 mb-1.5" size={14} />
                <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-500">
                  Category Empty
                </p>
                <p className="text-[7.5px] text-neutral-600 mt-0.5">
                  New custom items will load from active host events!
                </p>
              </div>
            );
          }

          return (
            <div className="relative bg-neutral-950/40 p-2.5 pb-1 min-h-[145px] flex flex-col justify-between overflow-hidden select-none">
              <div className="relative overflow-hidden flex-1 min-h-[110px]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`${activeTab}-${safeCurrentPage}`}
                    initial={{ opacity: 0, x: dragDirection > 0 ? 100 : -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dragDirection > 0 ? -100 : 100 }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4}
                    onDragEnd={(e, info) => {
                      const swipeThreshold = 40;
                      if (info.offset.x < -swipeThreshold && safeCurrentPage < pageCount - 1) {
                        setDragDirection(1);
                        setCurrentPage(safeCurrentPage + 1);
                        playSynthesizedHapticSound(280);
                      } else if (info.offset.x > swipeThreshold && safeCurrentPage > 0) {
                        setDragDirection(-1);
                        setCurrentPage(safeCurrentPage - 1);
                        playSynthesizedHapticSound(280);
                      }
                    }}
                    className="w-full grid grid-cols-4 gap-y-1.5 gap-x-1.5 touch-pan-y"
                  >
                    {pageItems.map((item: any) => {
                      const isShield = item.isShield;
                      const isSelected = selectedGift?.id === item.id;
                      const gift = item;

                      if (isShield) {
                        const shield = item.shield;
                        return (
                          <div key={shield.tier} className="relative flex flex-col items-center">
                            <motion.button 
                              drag="y"
                              dragConstraints={{ top: 0, bottom: 0 }}
                              dragElastic={{ top: 0.6, bottom: 0.1 }}
                              onDragEnd={(e, info) => {
                                if (info.offset.y < -40) {
                                  const mappedGift: any = {
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
                              className={`w-full py-1.5 rounded-xl flex flex-col items-center relative transition-all duration-305 ${
                                isSelected 
                                  ? 'bg-neutral-900/80 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)] scale-102' 
                                  : 'bg-neutral-950/70 border border-neutral-900/60 hover:border-neutral-800'
                              }`}
                            >
                              <div className="relative z-10 w-7 h-7 flex items-center justify-center">
                                <span className="text-lg select-none pointer-events-none drop-shadow-md" style={{ color: shield.color }}>🛡️</span>
                                <span className="absolute -top-1 -right-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-[5px] font-black px-1.2 py-0.2 rounded-full uppercase tracking-tighter text-white">
                                  Def
                                </span>
                              </div>

                              <span className="relative z-10 text-[7.5px] font-black text-neutral-200 tracking-tight text-center px-0.5 truncate w-full mt-0.5">
                                {shield.tier}
                              </span>

                              <div className="relative z-10 flex items-center gap-0.5 mt-0.5">
                                <Diamond size={5} className="text-cyan-400 shrink-0" />
                                <span className="text-[7.5px] font-black text-neutral-400">{shield.costBeans}</span>
                              </div>

                              <div className="relative z-10 text-[6.5px] font-black uppercase text-blue-400 mt-0.5">
                                {Math.round(shield.absorptionRate * 100)}%
                              </div>
                            </motion.button>
                          </div>
                        );
                      }

                      // Standard Gift
                      return (
                        <div key={gift.id} className="relative flex flex-col items-center">
                          <motion.button 
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0.6, bottom: 0.1 }}
                            onDragEnd={(e, info) => {
                              if (info.offset.y < -40) {
                                handleFastSwipeSend(gift);
                              }
                            }}
                            onClick={() => {
                              setSelectedGift(gift);
                              playSynthesizedHapticSound(350);
                            }}
                            className={`w-full py-1.5 rounded-xl flex flex-col items-center relative transition-all duration-305 ${
                              isSelected 
                                ? 'bg-neutral-900/80 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)] scale-102' 
                                : 'bg-neutral-950 border border-neutral-900 hover:border-neutral-850'
                            }`}
                          >
                            {isSelected && (
                              <motion.div 
                                layoutId="breathingOrb" 
                                className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-sm" 
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                            )}
                            
                            {/* Gift Visual Display */}
                            <div className="relative z-10 w-7 h-7 flex items-center justify-center">
                              {gift.image.startsWith('/') || gift.image.startsWith('http') ? (
                                <img 
                                  src={gift.image} 
                                  className="w-6 h-6 object-contain drop-shadow-md select-none pointer-events-none" 
                                  alt={gift.name} 
                                  referrerPolicy="no-referrer" 
                                />
                              ) : (
                                <span className="text-lg select-none pointer-events-none drop-shadow-md">{gift.image}</span>
                              )}
                              
                              {(gift.isFlash || ['dino_gift_box', 'crystal_ball', 'time_shards', 'red_carpet_dinner', 'thunder_bike'].includes(gift.id)) && (
                                <span className="absolute -top-1 -right-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-[5px] font-black px-1.2 py-0.2 rounded-full uppercase tracking-tighter text-white">
                                  {gift.isFlash ? 'Flash' : 'Hot'}
                                </span>
                              )}
                            </div>

                            <span className="relative z-10 text-[7.5px] font-extrabold text-neutral-300 tracking-tight line-clamp-1 text-center px-1 mt-0.5">
                              {gift.name}
                            </span>

                            <div className="relative z-10 flex items-center gap-0.5 mt-0.5">
                              <Diamond size={5} className="text-cyan-400 shrink-0" />
                              <span className="text-[7.5px] font-black text-neutral-400">
                                {svipDiscount > 0 ? (
                                  <span className="flex items-center gap-0.5">
                                    <span className="line-through text-neutral-600 text-[6px]">{gift.cost}</span>
                                    <span className="text-cyan-300 font-bold">{Math.floor(gift.cost * (1 - svipDiscount / 100))}</span>
                                  </span>
                                ) : gift.cost}
                              </span>
                            </div>
                          </motion.button>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Elegant Visual Dots Page Indicators */}
              {pageCount > 1 && (
                <div className="flex justify-center items-center gap-1.5 pt-1 pb-0.5 bg-neutral-950/10 select-none pointer-events-auto">
                  {Array.from({ length: pageCount }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDragDirection(idx > safeCurrentPage ? 1 : -1);
                        currentPage !== idx && setCurrentPage(idx);
                        playSynthesizedHapticSound(300);
                      }}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        safeCurrentPage === idx 
                          ? 'w-3 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]' 
                          : 'w-1 bg-neutral-700 hover:bg-neutral-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Selected Gift Informational Banner */}
        {selectedGift && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-3 py-1 bg-gradient-to-r from-cyan-950/20 via-neutral-900/60 to-indigo-950/20 border-t border-b border-neutral-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{selectedGift.image.startsWith('/') || selectedGift.image.startsWith('http') ? '🎁' : selectedGift.image}</span>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white uppercase tracking-tight">{selectedGift.name}</span>
                <span className="text-[7px] font-bold text-neutral-500">
                  Multiplier: <span className="text-cyan-400">x{familyMultiplier} Family bonus active</span>
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-[7px] font-black text-neutral-500 uppercase block">Total Cost</span>
              <div className="flex items-center gap-0.5 justify-end">
                <Diamond size={6} className="text-yellow-500 shrink-0" />
                <span className="text-[10.5px] font-black text-yellow-400">
                  {Math.floor(selectedGift.cost * quantity * (1 - svipDiscount / 100))}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Floating Bubble Canvas */}
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
        <div className="p-2.5 bg-neutral-900/40 border-t border-neutral-800/80 flex items-center justify-between gap-2.5">
          
          {/* User Wallet */}
          <div className="flex flex-col gap-0.5 shrink-0">
            <div className="flex items-center gap-1 select-none">
              <Diamond size={13} className="text-yellow-500 fill-yellow-500 animate-pulse shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white leading-none">
                  {profile?.diamonds || 0}
                </span>
                <span className="text-[6.5px] font-extrabold uppercase text-neutral-500 tracking-wider">Diamonds</span>
              </div>
            </div>

            <button 
              onClick={handleRecharge}
              className="px-1.5 py-0.2 text-[7.5px] font-black uppercase tracking-wider text-orange-400 bg-orange-950/40 border border-orange-850/30 rounded hover:bg-orange-900/60 transition-colors inline-flex items-center justify-center leading-none"
            >
              Recharge
            </button>
          </div>

          {/* Dynamic Combo Controller vs Multi-preset sends */}
          {selectedGift ? (
            <div className="flex-1 flex items-center justify-end gap-2">
              
              {/* Preset pill dropdown selection panel */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-0.5 flex items-center gap-0.5">
                {COMBO_PRESETS.slice(0, 4).map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setQuantity(preset.value);
                      playSynthesizedHapticSound(250);
                    }}
                    title={preset.label}
                    className={`w-6 h-6 rounded-lg flex flex-col items-center justify-center transition-all ${
                      quantity === preset.value 
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black' 
                        : 'text-neutral-500 hover:text-neutral-300 font-extrabold'
                    }`}
                  >
                    <span className="text-[7.5px] leading-tight font-black">{preset.value}</span>
                    <span className="text-[6.5px] font-bold leading-none">{preset.icon}</span>
                  </button>
                ))}
              </div>

              {/* Bigo Style COMBOS / Hold Continuous Trigger */}
              <div className="relative shrink-0">
                {/* SVG Progress countdown border ring */}
                <svg className="absolute -inset-1 w-[44px] h-[44px] -rotate-90 pointer-events-none z-10">
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    fill="none"
                    stroke="#171717"
                    strokeWidth="2"
                  />
                  {comboTimeLeft > 0 && (
                    <circle
                      cx="22"
                      cy="22"
                      r="19"
                      fill="none"
                      stroke="url(#comboGlowGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="120"
                      strokeDashoffset={(120 - (120 * comboTimeLeft) / 100)}
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
                  className={`w-[36px] h-[36px] rounded-full flex flex-col items-center justify-center relative select-none z-0 overflow-hidden ${
                    comboTimeLeft > 0 
                      ? 'bg-gradient-to-b from-cyan-400 via-pink-500 to-amber-500 text-white shadow-[0_0_10px_rgba(236,72,153,0.55)]' 
                      : 'bg-gradient-to-b from-neutral-800 to-neutral-700 hover:from-neutral-700 border border-neutral-700/80 text-white/50'
                  }`}
                >
                  <Flame size={10} fill="currentColor" className="text-white shrink-0" />
                  <span className="text-[7px] font-black tracking-tighter uppercase leading-none mt-0.5">
                    {comboCount > 0 ? `x${comboCount}` : 'Hold'}
                  </span>
                </motion.button>
              </div>

              {/* Standard Send Button */}
              <button
                onClick={sendGift}
                disabled={sending || (profile?.diamonds || 0) < Math.floor(selectedGift.cost * quantity * (1 - svipDiscount / 100)) * selectedTargets.length}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:bg-neutral-800 text-white h-7.5 px-3 rounded-lg font-black text-[10px] transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-cyan-950/30 shrink-0"
              >
                {sending ? '...' : <><Send size={9} className="fill-white" /> Send {quantity}{selectedTargets.length > 1 ? ` (${selectedTargets.length})` : ''}</>}
              </button>
            </div>
          ) : (
            <div className="flex-1 py-1 text-right text-[8.5px] font-black uppercase text-neutral-500 tracking-wider">
              👈 Select Item to send
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

