import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, collection, addDoc, serverTimestamp, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift } from '../types';
import { useAuth } from '../context/AuthContext';
import { Diamond, ChevronRight, User } from 'lucide-react';

/**
 * 🎁 THE GIFT STICKERS (PORTABLE ASSETS)
 * These are the high-gloss, refined assets extracted from your images.
 */
const DINO_GIFT    = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/NYdvnoUoguvbTBGA.png";
const CRYSTAL_BALL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/buicnyIEGLBXiCge.png";
const TIME_SHARDS  = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/XyNZGqWmbObCVagZ.png";
const RED_CARPET   = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/mkoUMgiZfjvjmbiU.png";
const THUNDER_BIKE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/YwakyBcxPMYJBxfT.png";
const CURLY_BLAST  = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/nLHINkDFwArokIdX.png";
const HAT_TRICK    = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/vQYIkSGzbKPwLXuK.png";
const FIREWORK     = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/UEclFRDMGLRZyxMB.png";
const SKY_COPTER   = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/ZYnFxUSysWtHIYRu.png";
const HOT_GIFT     = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/IhhjYHWdVkYvtwcs.png";
const GOLDEN_ROSE  = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/OSExlfpXfWKZQDKA.png";
const FLOWER       = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/aPuClVFQkIFPVBYD.png";
const GHOST_RIDER  = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/faEaqvKolTMxwMrp.png";
const GOLDEN_POP   = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/TNynXdtFIWOMCeYk.png";
const GOLD_BARS    = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/DFzXhLohanrTPJxs.png";
const PINK_DIAMOND = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663037426737/yhnNwjFdngvIfkZn.png";

const POPULAR_GIFTS: Gift[] = [
  { id: 'dino_gift_box', name: 'Dino Gift Box', cost: 1, image: DINO_GIFT, animationType: 'standard', isNew: true },
  { id: 'crystal_ball', name: 'Crystal Ball', cost: 100, image: CRYSTAL_BALL, animationType: 'standard', isNew: true },
  { id: 'time_shards', name: 'Time Shards', cost: 1000, image: TIME_SHARDS, animationType: 'standard', isNew: true },
  { id: 'red_carpet_dinner', name: 'Red Carpet Dinner', cost: 3000, image: RED_CARPET, animationType: 'standard', isNew: true },
  { id: 'thunder_bike', name: 'Thunder Bike', cost: 10000, image: THUNDER_BIKE, animationType: 'standard', isNew: true },
  { id: 'curly_blast', name: 'Curly Blast', cost: 1, image: CURLY_BLAST, animationType: 'standard', isNew: false },
  { id: 'hat_trick', name: 'Hat Trick', cost: 100, image: HAT_TRICK, animationType: 'standard', isNew: false },
  { id: 'firework', name: 'Firework', cost: 1000, image: FIREWORK, animationType: 'standard', isNew: true },
  { id: 'sky_copter', name: 'Sky Copter', cost: 100, image: SKY_COPTER, animationType: 'standard', isNew: true },
  { id: 'hot_gifts', name: 'HOT gifts', cost: 100, image: HOT_GIFT, animationType: 'standard', isNew: false, isHot: true },
  { id: 'golden_rose', name: 'Golden Rose', cost: 100, image: GOLDEN_ROSE, animationType: 'standard', isNew: false },
  { id: 'flower', name: 'Flower', cost: 1, image: FLOWER, animationType: 'standard', isNew: false },
  { id: 'ghost_rider', name: 'GHOST RIDER', cost: 39999, image: GHOST_RIDER, animationType: 'standard', isNew: true },
  { id: 'golden_pop', name: 'Golden Pop', cost: 100, image: GOLDEN_POP, animationType: 'standard', isNew: false },
  { id: 'gold', name: 'Gold', cost: 10, image: GOLD_BARS, animationType: 'standard', isNew: false },
  { id: 'pink_diamond', name: 'Pink Diamond', cost: 100, image: PINK_DIAMOND, animationType: 'standard', isNew: false },
];

const TABS = ['Popular', 'Activity', 'Local', 'Fun', 'Treasure'];

const Sparkle = ({ delay, color = "#fff" }: { delay: number, color?: string }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.2, 0], 
      opacity: [0, 0.8, 0],
      rotate: [0, 45, 90]
    }}
    transition={{ 
      duration: 2, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute w-1.5 h-1.5 rounded-full z-20 pointer-events-none"
    style={{
      backgroundColor: color,
      boxShadow: `0 0 10px ${color}`,
      top: `${Math.random() * 60 + 20}%`,
      left: `${Math.random() * 60 + 20}%`,
    }}
  />
);

export const GiftingModal = ({ hostUid, roomId, onClose, onGiftSent }: { hostUid: string, roomId: string, onClose: () => void, onGiftSent?: (gift: Gift, quantity: number) => void }) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sending, setSending] = useState(false);

  const quantities = [1, 10, 99, 188, 999];

  const handleRecharge = async () => {
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        diamonds: increment(1000)
      }, { merge: true });
      alert("Recharged 1,000 Diamonds! 💎");
    } catch (error) {
      console.error("Recharge error:", error);
    }
  };

  const sendGift = async () => {
    if (!profile || !selectedGift || profile.diamonds < (selectedGift.cost * quantity) || sending) return;
    setSending(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const hostRef = doc(db, 'users', hostUid);
      const roomRef = doc(db, 'rooms', roomId);
      const totalCost = selectedGift.cost * quantity;

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
        pkScore: increment(totalCost)
      });

      if (onGiftSent) {
        onGiftSent(selectedGift, quantity);
      }

      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        text: `sent ${quantity}x ${selectedGift.name}! 🎁`,
        uid: profile.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        timestamp: serverTimestamp(),
        isGift: true,
        giftId: selectedGift.id,
        giftImage: selectedGift.image,
        quantity: quantity,
        animationType: selectedGift.animationType
      });

      await addDoc(collection(db, 'transactions'), {
        fromUid: profile.uid,
        toUid: hostUid,
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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end justify-center z-[100]" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full bg-gradient-to-b from-[#222] to-[#111] rounded-t-[40px] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 px-4 py-1.5 rounded-full flex items-center gap-2 border border-cyan-500/30">
              <Diamond size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]" />
              <span className="text-sm font-black text-white tracking-tighter">LV.1</span>
            </div>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-[150px] shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "35%" }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]" 
              />
            </div>
            <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Exp: 35/150</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-5 py-2 rounded-full border border-yellow-500/20 shadow-lg">
            <User size={16} className="text-yellow-500" />
            <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">Elite</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 py-1 gap-4 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-black transition-all relative uppercase tracking-[0.15em] ${
                activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/40'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline-glow" className="absolute bottom-1 left-4 right-4 h-1 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)]" />
              )}
            </button>
          ))}
        </div>

        {/* Gift Grid */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-8 p-6 overflow-y-auto scrollbar-hide min-h-[350px] bg-black/20">
          {activeTab === 'Popular' && POPULAR_GIFTS.map(gift => (
            <button 
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              className={`flex flex-col items-center relative transition-all duration-500 group ${
                selectedGift?.id === gift.id ? 'scale-110 z-20' : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
            >
              <AnimatePresence>
                {selectedGift?.id === gift.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[24px] -m-3 shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/20 backdrop-blur-xl" 
                  />
                )}
              </AnimatePresence>

              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                {(gift.isNew || gift.isHot || selectedGift?.id === gift.id) && (
                  <>
                    <Sparkle delay={0} color={gift.isHot ? "#ff8c00" : "#00f2ff"} />
                    <Sparkle delay={0.8} color="#fff" />
                    <Sparkle delay={1.5} color={gift.isNew ? "#ff4d4f" : "#fff"} />
                  </>
                )}
                
                <img 
                  src={gift.image} 
                  alt={gift.name}
                  className={`w-full h-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)] transition-all duration-700 ${
                    selectedGift?.id === gift.id 
                      ? 'brightness-125 saturate-125 scale-110 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] rotate-2' 
                      : 'brightness-110 group-hover:brightness-125'
                  }`}
                />
                
                {gift.isNew && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-[#ff4d4f] to-[#b90e0e] text-[8px] font-black px-2 py-0.5 rounded-lg uppercase text-white shadow-xl border border-white/30 rotate-12">New</div>
                )}
                {gift.isHot && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-[#ff8c00] to-[#e85d04] text-[8px] font-black px-2 py-0.5 rounded-lg uppercase text-white shadow-xl border border-white/30 -rotate-12">Hot</div>
                )}
              </div>
              
              <span className="text-[10px] text-white/90 text-center line-clamp-1 mb-1 font-black uppercase tracking-tighter group-hover:text-white">{gift.name}</span>
              <div className="flex items-center gap-1 text-cyan-400 text-[9px] font-black bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                <Diamond size={9} className="text-cyan-400" />
                {gift.cost}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-2xl flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-[16px] border border-white/10 shadow-inner">
              <Diamond size={20} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
              <span className="text-xl font-black text-white tracking-tighter">{profile?.diamonds || 0}</span>
            </div>
            <button 
              onClick={handleRecharge}
              className="text-[10px] font-black text-orange-500 uppercase tracking-widest border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500/10 transition-colors"
            >
              Recharge
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white/5 rounded-[20px] p-1.5 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-1 px-1">
              {quantities.map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`w-9 h-9 rounded-[14px] flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    quantity === q 
                      ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-[0_10px_20px_rgba(6,182,212,0.5)] scale-110' 
                      : 'text-white/20 hover:text-white/60'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <button 
              onClick={sendGift}
              disabled={!selectedGift || sending || (profile?.diamonds || 0) < (selectedGift.cost * quantity)}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-20 disabled:grayscale text-white px-10 py-3 rounded-[16px] font-black text-sm transition-all active:scale-95 shadow-[0_15px_35px_rgba(6,182,212,0.5)] uppercase tracking-[0.2em] border border-white/30"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
