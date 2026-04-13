import React, { useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, addDoc, 
  serverTimestamp, doc, updateDoc, increment, setDoc, getDoc, getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface FeatureAutoManagerProps {
  roomId: string;
  isHost: boolean;
}

export const FeatureAutoManager: React.FC<FeatureAutoManagerProps> = ({ roomId, isHost }) => {
  useEffect(() => {
    if (!roomId || !isHost) return;

    const intervals: { [key: string]: NodeJS.Timeout } = {};

    const unsub = onSnapshot(collection(db, 'features'), (snapshot) => {
      snapshot.docs.forEach((featureDoc) => {
        const feature = { id: featureDoc.id, ...featureDoc.data() } as any;
        
        // Clear existing interval for this feature if it exists
        if (intervals[feature.id]) {
          clearInterval(intervals[feature.id]);
          delete intervals[feature.id];
        }

        if (feature.mode === 'auto') {
          const runAuto = async () => {
            if (feature.id === 'easter_eggs') {
              await spawnRandomEgg(roomId);
            } else if (feature.id === 'chaos_events') {
              await triggerRandomChaosEvent(roomId);
            }
          };

          // Run once initially after a short delay
          setTimeout(runAuto, 5000 + Math.random() * 10000);

          // Set interval for subsequent runs (every 2-5 minutes)
          intervals[feature.id] = setInterval(runAuto, 120000 + Math.random() * 180000);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'features');
    });

    return () => {
      unsub();
      Object.values(intervals).forEach(clearInterval);
    };
  }, [roomId, isHost]);

  const spawnRandomEgg = async (roomId: string) => {
    try {
      // Fetch enabled egg definitions
      const q = query(collection(db, 'easter_eggs'), where('isEnabled', '==', true));
      const snap = await getDocs(q);
      
      let eggToDrop;
      
      if (snap.empty) {
        // Fallback if no eggs are enabled
        eggToDrop = {
          id: 'auto_egg',
          image: '🥚',
          rewardType: 'beans',
          rewardValue: 10
        };
      } else {
        const eggs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        eggToDrop = eggs[Math.floor(Math.random() * eggs.length)];
      }

      const eggData = {
        eggId: eggToDrop.id,
        eggImage: eggToDrop.image,
        rewardType: eggToDrop.rewardType,
        rewardValue: eggToDrop.rewardValue,
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 60) + 20,
        status: 'active',
        expiresAt: new Date(Date.now() + 30000).toISOString(), // 30 seconds
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'rooms', roomId, 'egg_drops'), eggData);
    } catch (e) {
      console.error("Auto spawn egg error", e);
    }
  };

  const triggerRandomChaosEvent = async (roomId: string) => {
    try {
      // Check if there's already an active event
      const q = query(collection(db, 'rooms', roomId, 'chaos_events'), where('status', '==', 'active'));
      const snap = await getDoc(doc(db, 'rooms', roomId)); // Just to check room exists
      
      const types: any[] = ['2x_gifts', 'double_votes', 'bonus_drop'];
      const eventData = {
        type: types[Math.floor(Math.random() * types.length)],
        status: 'active',
        endTime: new Date(Date.now() + 60000), // 1 minute
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'rooms', roomId, 'chaos_events'), eventData);
    } catch (e) {
      console.error("Auto trigger chaos error", e);
    }
  };

  return null;
};
