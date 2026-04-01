import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { Gift as GiftIcon, Diamond, X } from 'lucide-react';

export const GiftingModal = ({ hostUid, roomId, onClose }: { hostUid: string, roomId: string, onClose: () => void }) => {
  const { profile } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gifts'), (snap) => {
      if (snap.empty) {
        // Default gifts if none in DB
        setGifts([
          { id: 'kiss', name: 'Kiss', cost: 99, image: '💋', animationType: 'kiss' },
          { id: 'flower', name: 'Flower', cost: 10, image: '🌹', animationType: 'flower' },
          { id: '1', name: 'Rose', cost: 1, image: '🌹', animationType: 'standard' },
          { id: '2', name: 'Heart', cost: 10, image: '❤️', animationType: 'standard' },
          { id: '3', name: 'Diamond', cost: 100, image: '💎', animationType: 'standard' },
          { id: '4', name: 'Car', cost: 1000, image: '🚗', animationType: 'standard' },
          { id: '5', name: 'Rocket', cost: 5000, image: '🚀', animationType: 'standard' },
          { id: '6', name: 'Castle', cost: 10000, image: '🏰', animationType: 'standard' },
          { id: '7', name: 'Planet', cost: 50000, image: '🪐', animationType: 'standard' },
          { id: '8', name: 'Universe', cost: 100000, image: '🌌', animationType: 'standard' },
        ]);
      } else {
        setGifts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Gift)));
      }
    });
    return () => unsub();
  }, []);

  const sendGift = async (gift: Gift) => {
    if (!profile || profile.diamonds < gift.cost || sending) return;
    setSending(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const hostRef = doc(db, 'users', hostUid);
      const roomRef = doc(db, 'rooms', roomId);

      // Update user diamonds
      await setDoc(userRef, {
        diamonds: increment(-gift.cost),
        totalDiamondsSpent: increment(gift.cost)
      }, { merge: true });

      // Update host beans
      await setDoc(hostRef, {
        beans: increment(gift.cost),
        totalBeansEarned: increment(gift.cost)
      }, { merge: true });

      // Update room beans
      await updateDoc(roomRef, {
        currentBeans: increment(gift.cost),
        pkScore: increment(gift.cost)
      });

      // Add message to chat
      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        text: `sent a ${gift.name}! 🎁`,
        uid: profile.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        timestamp: serverTimestamp(),
        isGift: true,
        giftId: gift.id,
        animationType: gift.animationType
      });

      // Add transaction
      await addDoc(collection(db, 'transactions'), {
        fromUid: profile.uid,
        toUid: hostUid,
        amount: gift.cost,
        type: 'gift',
        timestamp: serverTimestamp(),
        giftId: gift.id
      });

      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gifting');
    } finally {
      setSending(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[100] p-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="w-full max-w-lg bg-[#111] rounded-t-3xl p-6 border-t border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic uppercase tracking-tight">Send a Gift</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">Close</button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {gifts.map(gift => (
            <button 
              key={gift.id}
              onClick={() => sendGift(gift)}
              disabled={profile!.diamonds < gift.cost || sending}
              className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {gift.image ? (
                  <span className="text-2xl">{gift.image}</span>
                ) : (
                  <GiftIcon size={24} className="text-orange-500" />
                )}
              </div>
              <span className="text-[10px] font-bold text-white/60">{gift.name}</span>
              <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black">
                <Diamond size={10} />
                {gift.cost}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Diamond size={16} className="text-blue-400" />
            <span className="font-bold">{profile?.diamonds}</span>
          </div>
          <button 
            onClick={handleRecharge}
            className="text-orange-500 font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
          >
            RECHARGE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
