import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, addDoc, 
  serverTimestamp, doc, updateDoc, increment, setDoc, getDoc, deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface EggDrop {
  id: string;
  eggId: string;
  eggImage: string;
  rewardType: 'beans' | 'diamonds';
  rewardValue: number;
  x: number;
  y: number;
  expiresAt: any;
  status: 'active' | 'collected' | 'expired';
}

interface EasterEggDropsProps {
  roomId: string;
}

export const EasterEggDrops: React.FC<EasterEggDropsProps> = ({ roomId }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeEggs, setActiveEggs] = useState<EggDrop[]>([]);
  const [featureMode, setFeatureMode] = useState<'on' | 'off' | 'auto'>('on');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'features', 'easter_eggs'), (snap) => {
      if (snap.exists()) {
        setFeatureMode(snap.data().mode || 'on');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!roomId || featureMode === 'off') return;

    const q = query(
      collection(db, 'rooms', roomId, 'egg_drops'),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snap) => {
      const eggs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EggDrop));
      setActiveEggs(eggs.filter(egg => {
        const expiry = egg.expiresAt?.toMillis ? egg.expiresAt.toMillis() : new Date(egg.expiresAt).getTime();
        return expiry > Date.now();
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/egg_drops`);
    });

    return () => unsub();
  }, [roomId, featureMode]);

  const claimEgg = async (egg: EggDrop) => {
    if (!profile) return;

    try {
      const eggRef = doc(db, 'rooms', roomId, 'egg_drops', egg.id);
      
      // Atomic update to prevent double claim
      await updateDoc(eggRef, {
        status: 'collected',
        collectedBy: profile.uid,
        collectedAt: serverTimestamp()
      });

      // Update user balance
      const field = egg.rewardType === 'diamonds' ? 'diamonds' : 'beans';
      await updateDoc(doc(db, 'users', profile.uid), {
        [field]: increment(egg.rewardValue)
      });

      showToast(`Surprise! You found ${egg.rewardValue} ${egg.rewardType}! ✨`, "success");
    } catch (error) {
      console.error("Claim failed:", error);
      // If update fails, it likely means someone else claimed it or it expired
    }
  };

  if (featureMode === 'off') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence>
        {activeEggs.map((egg) => (
          <motion.button
            key={egg.id}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              default: { duration: 0.3 }
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => claimEgg(egg)}
            className="absolute pointer-events-auto w-16 h-16 flex items-center justify-center"
            style={{ 
              left: `${egg.x}%`, 
              top: `${egg.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 group-hover:opacity-60 animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-md w-14 h-14 rounded-3xl border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                {egg.eggImage.startsWith('http') ? (
                  <img src={egg.eggImage} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-3xl">{egg.eggImage}</span>
                )}
                
                {/* Sparkle effects */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-dashed border-white/20 rounded-3xl"
                />
              </div>
              <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-5 h-5 animate-bounce" />
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};
