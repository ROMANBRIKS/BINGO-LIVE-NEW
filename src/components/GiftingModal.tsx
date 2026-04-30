import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, collection, addDoc, serverTimestamp, increment, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Diamond, ChevronRight, User, Zap, Users } from 'lucide-react';
import { calculateGiftingPower, formatPowerDisplay } from '../nobleGiftingLogic';
import { SVIPManager } from '../lib/svipLogic';
import { getSnipeMultiplier, isSnipeWindow } from '../pkEnhancedLogic';
import { PK_SHIELDS, ShieldTier, calculateShieldedScore } from '../pkShieldLogic';

// Combined gift data from screenshots for the "Popular" tab
// Moved to src/constants/gifts.ts

const TABS = ['Popular', 'Activity', 'Local', 'Fun', 'Treasure', 'Shields'];

import { DEFAULT_POPULAR_GIFTS } from '../constants/gifts';
import { calculateFamilyContribution, getFamilyMultiplier } from '../familyLogic';

export const GiftingModal = ({ room, onClose, onGiftSent }: { room: any, onClose: () => void, onGiftSent?: (gift: Gift, quantity: number) => void }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sending, setSending] = useState(false);
  const [svipDiscount, setSvipDiscount] = useState(0);
  const [dynamicGifts, setDynamicGifts] = useState<Gift[]>([]);

  // Fetch Dynamic Gifts
  React.useEffect(() => {
    const q = query(collection(db, 'gifts'), orderBy('cost', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const giftList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Gift))
        .filter(g => (g as any).status !== 'deleted'); // Handle soft delete
      
      // If no gifts in DB, we could use POPULAR_GIFTS as fallback or just show empty
      setDynamicGifts(giftList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gifts');
    });
    return () => unsub();
  }, []);

  const familyMultiplier = getFamilyMultiplier(room);

  React.useEffect(() => {
    if (profile) {
      SVIPManager.getDiamondDiscount(profile.uid).then(setSvipDiscount);
    }
  }, [profile]);

  const pkEndTime = room.pkEndTime;
  const isSnipe = pkEndTime ? isSnipeWindow(pkEndTime) : false;
  const snipeMultiplier = pkEndTime ? getSnipeMultiplier(pkEndTime) : 1.0;

  const quantities = [1, 10, 99, 188, 999];

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

  const sendGift = async () => {
    if (!profile || !selectedGift || profile.diamonds < (selectedGift.cost * quantity) || sending) return;
    setSending(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const hostRef = doc(db, 'users', room.hostUid);
      const roomRef = doc(db, 'rooms', room.id);
      const totalCost = Math.floor(selectedGift.cost * quantity * (1 - svipDiscount / 100));
      let giftingPower = Math.floor(calculateGiftingPower(selectedGift.cost * quantity, profile) * snipeMultiplier);

      // Family Contribution Logic
      const familyPoints = calculateFamilyContribution(selectedGift.cost * quantity, room);

      // Apply Opponent Shield to Current Gift
      const oShield = room.pkOpponentShieldTier ? PK_SHIELDS[room.pkOpponentShieldTier] : null;
      const oShieldActive = oShield && room.pkOpponentShieldEndTime && new Date(room.pkOpponentShieldEndTime).getTime() > Date.now();

      if (oShieldActive) {
        const { passedScore, newlyAbsorbed } = calculateShieldedScore(giftingPower, oShield, room.pkOpponentShieldAbsorbed || 0);
        giftingPower = passedScore;
        
        // Update Opponent Shield Absorption
        await updateDoc(roomRef, {
          pkOpponentShieldAbsorbed: newlyAbsorbed
        });
      }

      await setDoc(userRef, {
        diamonds: increment(-totalCost),
        totalDiamondsSpent: increment(totalCost)
      }, { merge: true });

      await setDoc(hostRef, {
        beans: increment(totalCost),
        totalBeansEarned: increment(totalCost)
      }, { merge: true });

      await updateDoc(roomRef, {
        currentBeans: increment(totalCost),
        pkScore: increment(giftingPower)
      });

      // Update Family Contribution if user is in a family
      if (profile.familyId) {
        const familyRef = doc(db, 'families', profile.familyId);
        const memberRef = doc(db, `families/${profile.familyId}/members`, profile.uid);
        
        await updateDoc(familyRef, {
          totalDiamondsSpent: increment(familyPoints)
        }).catch(err => console.error("Family update error:", err));

        await updateDoc(memberRef, {
          contributionPoints: increment(familyPoints)
        }).catch(err => console.error("Family member update error:", err));
      }

      // Handle Shield Activation (Buying a shield for the current host)
      if (activeTab === 'Shields' && selectedGift) {
        const tier = selectedGift.id as ShieldTier;
        const shield = PK_SHIELDS[tier];
        const endTime = new Date(Date.now() + shield.duration * 1000).toISOString();
        
        await updateDoc(roomRef, {
          pkShieldTier: tier,
          pkShieldAbsorbed: 0,
          pkShieldEndTime: endTime
        });
      }

      if (onGiftSent) {
        onGiftSent(selectedGift, quantity);
      }

      // Update Treasure Chest Progress
      try {
        const { updateTreasureProgress } = await import('../treasureChestLogic');
        const treasureResult = await updateTreasureProgress(
          room.id,
          selectedGift.cost,
          quantity
        );

        if (treasureResult.goalCompleted && treasureResult.completedGoal) {
          showToast(
            `🎁 ${treasureResult.completedGoal.rewardName} Unlocked!`,
            'success'
          );
        }
      } catch (error) {
        console.error("Treasure chest update error:", error);
      }

      await addDoc(collection(db, `rooms/${room.id}/messages`), {
        text: `sent ${quantity}x ${selectedGift.name}! 🎁`,
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
        nobleTier: profile.nobleTitle || 'None'
      });

      await addDoc(collection(db, 'transactions'), {
        fromUid: profile.uid,
        toUid: room.hostUid,
        amount: totalCost,
        type: 'gift',
        timestamp: serverTimestamp(),
        giftId: selectedGift.id,
        quantity: quantity
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gifting');
    } finally {
      setSending(false);
      onClose(); // Auto-close after sending
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full bg-[#1a1a1a] rounded-t-[24px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Bar Area */}
        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-1">
            <div className="bg-white/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Diamond size={10} className="text-gray-300" />
              <span className="text-[10px] font-bold text-white">1</span>
            </div>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[20%] h-full bg-gradient-to-r from-gray-400 to-white" />
            </div>
            <span className="text-[9px] text-white/60">+1 wealth points</span>
            <ChevronRight size={12} className="text-white/40" />
          </div>
          <div className="flex items-center gap-1 ml-3 bg-white/5 px-2 py-0.5 rounded-full">
            <User size={12} className="text-yellow-500" />
            <span className="text-[10px] font-bold text-yellow-500">Me</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-2 py-1 gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-white border-b-2 border-white' : 'text-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto p-1.5">
            <div className="w-4 h-4 border border-white/20 rounded flex items-center justify-center">
              <div className="w-2.5 h-2.5 border border-white/20 rounded-sm" />
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto scrollbar-hide p-3 gap-x-3 min-h-[150px]">
          {/* Dynamic Gifts from DB */}
          {dynamicGifts.filter(g => g.category === activeTab).map(gift => (
            <button 
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              className={`flex-none w-[50px] flex flex-col items-center relative group ${
                selectedGift?.id === gift.id ? 'scale-105' : ''
              }`}
            >
              {selectedGift?.id === gift.id && (
                <div className="absolute inset-0 bg-white/10 rounded-lg -m-1" />
              )}
              <div className="relative">
                <div className="w-11 h-11 flex items-center justify-center mb-0.5">
                  {gift.image.startsWith('/') || gift.image.startsWith('http') ? (
                    <img 
                      src={gift.image} 
                      className="w-9 h-9 object-contain group-hover:scale-110 transition-transform" 
                      alt={gift.name} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <span className="text-xl group-hover:scale-110 transition-transform inline-block">{gift.image}</span>
                  )}
                </div>
                {gift.isFlash && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-[6px] font-bold px-0.5 rounded uppercase">Flash</div>
                )}
              </div>
              <span className="text-[8px] text-white/90 text-center line-clamp-1 mb-0.5">{gift.name}</span>
              <div className="flex items-center gap-0.5 text-white/40 text-[7px]">
                <Diamond size={6} />
                {svipDiscount > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="line-through opacity-50">{gift.cost}</span>
                    <span className="text-cyan-400 font-bold">{Math.floor(gift.cost * (1 - svipDiscount / 100))}</span>
                  </span>
                ) : gift.cost}
              </div>
            </button>
          ))}

          {/* Fallback to hardcoded Popular gifts if DB is empty for Popular tab */}
          {activeTab === 'Popular' && dynamicGifts.filter(g => g.category === 'Popular').length === 0 && DEFAULT_POPULAR_GIFTS.map(gift => (
            <button 
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              className={`flex-none w-[50px] flex flex-col items-center relative group ${
                selectedGift?.id === gift.id ? 'scale-105' : ''
              }`}
            >
              {selectedGift?.id === gift.id && (
                <div className="absolute inset-0 bg-white/10 rounded-lg -m-1" />
              )}
              <div className="relative">
                <div className="w-11 h-11 flex items-center justify-center mb-0.5">
                  {gift.image.startsWith('/') || gift.image.startsWith('http') ? (
                    <img 
                      src={gift.image} 
                      className="w-9 h-9 object-contain group-hover:scale-110 transition-transform" 
                      alt={gift.name} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        // Fallback to a default emoji if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          const span = document.createElement('span');
                          span.className = "text-xl group-hover:scale-110 transition-transform inline-block";
                          span.innerText = "🎁";
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xl group-hover:scale-110 transition-transform inline-block">{gift.image}</span>
                  )}
                </div>
                {['dino_gift_box', 'crystal_ball', 'time_shards', 'red_carpet_dinner', 'thunder_bike', 'sky_copter', 'ghost_rider'].includes(gift.id) && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-[6px] font-bold px-0.5 rounded uppercase">New</div>
                )}
              </div>
              <span className="text-[8px] text-white/90 text-center line-clamp-1 mb-0.5">{gift.name}</span>
              <div className="flex items-center gap-0.5 text-white/40 text-[7px]">
                <Diamond size={6} />
                {svipDiscount > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="line-through opacity-50">{gift.cost}</span>
                    <span className="text-cyan-400 font-bold">{Math.floor(gift.cost * (1 - svipDiscount / 100))}</span>
                  </span>
                ) : gift.cost}
              </div>
            </button>
          ))}
          {activeTab === 'Shields' && Object.values(PK_SHIELDS).map(shield => (
            <button 
              key={shield.tier}
              onClick={() => setSelectedGift({
                id: shield.tier,
                name: `${shield.tier} Shield`,
                cost: shield.costBeans,
                image: '🛡️',
                animationType: 'standard'
              })}
              className={`flex-none w-[70px] flex flex-col items-center relative group ${
                selectedGift?.id === shield.tier ? 'scale-105' : ''
              }`}
            >
              {selectedGift?.id === shield.tier && (
                <div className="absolute inset-0 bg-white/10 rounded-lg -m-1.5" />
              )}
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center mb-0.5">
                  <span className="text-3xl group-hover:scale-110 transition-transform inline-block" style={{ color: shield.color }}>🛡️</span>
                </div>
                <div className="absolute -top-1 -right-1 bg-blue-500 text-[7px] font-bold px-1 rounded uppercase">Shield</div>
              </div>
              <span className="text-[9px] text-white/90 text-center line-clamp-1 mb-0.5">{shield.tier} Shield</span>
              <div className="flex items-center gap-0.5 text-white/40 text-[8px]">
                <Diamond size={7} />
                {shield.costBeans}
              </div>
              <div className="text-[7px] text-white/30 mt-0.5">
                {Math.round(shield.absorptionRate * 100)}% Block
              </div>
            </button>
          ))}
          {!['Popular', 'Shields'].includes(activeTab) && (
            <div className="w-full py-8 text-center text-white/40 text-xs">
              No gifts available in this category yet.
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-3 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Diamond size={14} className="text-yellow-500" />
                <span className="text-base font-bold text-white">{profile?.diamonds || 0}</span>
              </div>
              {profile && formatPowerDisplay(profile) && (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-0.5 text-[8px] font-black text-cyan-400 uppercase tracking-tighter">
                    <Zap size={8} fill="currentColor" />
                    {formatPowerDisplay(profile)}
                    {isSnipe && <span className="text-red-500 ml-1">x1.5 Snipe!</span>}
                  </div>
                  {profile.familyId && (
                    <div className="flex items-center gap-0.5 text-[8px] font-black text-yellow-500 uppercase tracking-tighter">
                      <Users size={8} fill="currentColor" />
                      Family Multiplier: x{familyMultiplier}
                    </div>
                  )}
                </div>
              )}
              {!formatPowerDisplay(profile) && isSnipe && (
                <div className="flex items-center gap-0.5 text-[8px] font-black text-red-500 uppercase tracking-tighter">
                  <Zap size={8} fill="currentColor" />
                  Snipe Window x1.5!
                </div>
              )}
            </div>
            <button 
              onClick={handleRecharge}
              className="text-[9px] font-black text-orange-500 uppercase tracking-widest border border-orange-500/20 px-1.5 py-0.5 rounded-md hover:bg-orange-500/10 transition-colors"
            >
              Recharge
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 rounded-full p-1">
            <div className="flex items-center gap-0.5 px-1.5">
              {quantities.map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    quantity === q ? 'bg-cyan-500 text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <button 
              onClick={sendGift}
              disabled={!selectedGift || sending || (profile?.diamonds || 0) < (selectedGift.cost * quantity)}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:bg-gray-600 text-white px-5 py-1.5 rounded-full font-bold text-xs transition-all active:scale-95"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
