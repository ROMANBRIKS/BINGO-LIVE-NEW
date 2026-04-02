import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, collection, addDoc, serverTimestamp, increment, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift } from '../types';
import { useAuth } from '../context/AuthContext';
import { Diamond, ChevronRight, User } from 'lucide-react';

// Combined gift data from screenshots for the "Popular" tab
const POPULAR_GIFTS: Gift[] = [
  // Special Animated Gifts
  { id: 'kiss', name: 'Kiss', cost: 99, image: '💋', animationType: 'kiss' },
  { id: 'flower_special', name: 'Rose', cost: 10, image: '🌹', animationType: 'flower' },
  // First set of gifts
  { id: 'dino_gift_box', name: 'Dino Gift Box', cost: 1, image: '/assets/dino_gift_box.png', animationType: 'standard' },
  { id: 'crystal_ball', name: 'Crystal Ball', cost: 100, image: '🔮', animationType: 'standard' },
  { id: 'time_shards', name: 'Time Shards', cost: 1000, image: '💎', animationType: 'standard' },
  { id: 'red_carpet_dinner', name: 'Red Carpet Dinner', cost: 3000, image: '💃', animationType: 'standard' },
  { id: 'thunder_bike', name: 'Thunder Bike', cost: 10000, image: '🏍️', animationType: 'standard' },
  { id: 'curly_blast', name: 'Curly Blast', cost: 1, image: '🎉', animationType: 'standard' },
  { id: 'hat_trick', name: 'Hat Trick', cost: 100, image: '🎩', animationType: 'standard' },
  { id: 'firework', name: 'Firework', cost: 1000, image: '🎆', animationType: 'standard' },
  // Second set of gifts
  { id: 'sky_copter', name: 'Sky Copter', cost: 100, image: '🚁', animationType: 'standard' },
  { id: 'hot_gifts', name: 'HOT gifts', cost: 100, image: '🎁', animationType: 'standard' },
  { id: 'golden_rose', name: 'Golden Rose', cost: 100, image: '🌹', animationType: 'standard' },
  { id: 'flower', name: 'Flower', cost: 1, image: '🌷', animationType: 'standard' },
  { id: 'ghost_rider', name: 'GHOST RIDER by...', cost: 39999, image: '💀', animationType: 'standard' },
  { id: 'golden_pop', name: 'Golden Pop', cost: 100, image: '🍾', animationType: 'standard' },
  { id: 'gold', name: 'Gold', cost: 10, image: '💰', animationType: 'standard' },
  { id: 'pink_diamond', name: 'Pink Diamond', cost: 100, image: '💖', animationType: 'standard' },
];

const TABS = ['Popular', 'Activity', 'Local', 'Fun', 'Treasure'];

export const GiftingModal = ({ hostUid, roomId, onClose }: { hostUid: string, roomId: string, onClose: () => void }) => {
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

      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        text: `sent ${quantity}x ${selectedGift.name}! 🎁`,
        uid: profile.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        timestamp: serverTimestamp(),
        isGift: true,
        giftId: selectedGift.id,
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
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
              <Diamond size={12} className="text-gray-300" />
              <span className="text-xs font-bold text-white">1</span>
            </div>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-[20%] h-full bg-gradient-to-r from-gray-400 to-white" />
            </div>
            <span className="text-[10px] text-white/60">+1 wealth points</span>
            <ChevronRight size={14} className="text-white/40" />
          </div>
          <div className="flex items-center gap-1 ml-4 bg-white/5 px-3 py-1 rounded-full">
            <User size={14} className="text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">Me</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-2 py-2 gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-white border-b-2 border-white' : 'text-white/40'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto p-2">
            <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center">
              <div className="w-3 h-3 border border-white/20 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Gift Grid - Horizontal Scroll to the Right */}
        <div className="flex overflow-x-auto scrollbar-hide p-4 gap-x-4 min-h-[200px]">
          {activeTab === 'Popular' && POPULAR_GIFTS.map(gift => (
            <button 
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              className={`flex-none w-[72px] flex flex-col items-center relative group ${
                selectedGift?.id === gift.id ? 'scale-105' : ''
              }`}
            >
              {selectedGift?.id === gift.id && (
                <div className="absolute inset-0 bg-white/10 rounded-xl -m-2" />
              )}
              <div className="relative">
                <div className="w-16 h-16 flex items-center justify-center mb-1">
                  {gift.image.startsWith('/') || gift.image.startsWith('http') ? (
                    <img 
                      src={gift.image} 
                      className="w-14 h-14 object-contain group-hover:scale-110 transition-transform" 
                      alt={gift.name} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        // Fallback to a default emoji if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          const span = document.createElement('span');
                          span.className = "text-4xl group-hover:scale-110 transition-transform inline-block";
                          span.innerText = "🎁";
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform inline-block">{gift.image}</span>
                  )}
                </div>
                {['dino_gift_box', 'crystal_ball', 'time_shards', 'red_carpet_dinner', 'thunder_bike', 'sky_copter', 'ghost_rider'].includes(gift.id) && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-bold px-1 rounded uppercase">New</div>
                )}
              </div>
              <span className="text-[10px] text-white/90 text-center line-clamp-1 mb-0.5">{gift.name}</span>
              <div className="flex items-center gap-0.5 text-white/40 text-[10px]">
                <Diamond size={8} />
                {gift.cost}
              </div>
            </button>
          ))}
          {activeTab !== 'Popular' && (
            <div className="w-full py-10 text-center text-white/40 text-sm">
              No gifts available in this category yet.
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Diamond size={16} className="text-yellow-500" />
              <span className="text-lg font-bold text-white">{profile?.diamonds || 0}</span>
            </div>
            <button 
              onClick={handleRecharge}
              className="text-[10px] font-black text-orange-500 uppercase tracking-widest border border-orange-500/20 px-2 py-1 rounded-lg hover:bg-orange-500/10 transition-colors"
            >
              Recharge
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
            <div className="flex items-center gap-1 px-2">
              {quantities.map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
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
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:bg-gray-600 text-white px-8 py-2 rounded-full font-bold text-sm transition-all active:scale-95"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
