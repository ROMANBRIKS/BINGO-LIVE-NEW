import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, addDoc, 
  serverTimestamp, doc, updateDoc, increment, setDoc, getDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Coins, Gift } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChaosEvent {
  id: string;
  type: '2x_gifts' | 'double_votes' | 'bonus_drop';
  status: 'active' | 'ended';
  endTime: any;
}

interface ChaosEventsProps {
  roomId: string;
}

export const ChaosEvents: React.FC<ChaosEventsProps> = ({ roomId }) => {
  const [activeEvent, setActiveEvent] = useState<ChaosEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [featureMode, setFeatureMode] = useState<'on' | 'off' | 'auto'>('on');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'features', 'chaos_events'), (snap) => {
      if (snap.exists()) {
        setFeatureMode(snap.data().mode || 'on');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!roomId || featureMode === 'off') return;

    const q = query(
      collection(db, 'rooms', roomId, 'chaos_events'),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const eventData = { id: snap.docs[0].id, ...snap.docs[0].data() } as ChaosEvent;
        setActiveEvent(eventData);
      } else {
        setActiveEvent(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/chaos_events`);
    });

    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (!activeEvent) return;

    const interval = setInterval(() => {
      const end = activeEvent.endTime?.toMillis ? activeEvent.endTime.toMillis() : new Date(activeEvent.endTime).getTime();
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        // Optionally update status to ended if we are the host, but here we just let it expire
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent]);

  if (featureMode === 'off') return null;
  if (!activeEvent || timeLeft <= 0) return null;

  const getEventDetails = () => {
    switch (activeEvent.type) {
      case '2x_gifts':
        return {
          title: '2X GIFT REWARDS',
          icon: Gift,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50'
        };
      case 'double_votes':
        return {
          title: 'DOUBLE VOTES',
          icon: Zap,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/20',
          border: 'border-cyan-500/50'
        };
      case 'bonus_drop':
        return {
          title: 'BONUS COIN DROP',
          icon: Coins,
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/50'
        };
      default:
        return {
          title: 'CHAOS EVENT',
          icon: Sparkles,
          color: 'text-purple-400',
          bg: 'bg-purple-500/20',
          border: 'border-purple-500/50'
        };
    }
  };

  const details = getEventDetails();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-lg",
          details.bg, details.border
        )}
      >
        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
          <details.icon size={16} className={details.color} />
        </div>
        <div>
          <div className={cn("text-[10px] font-black uppercase tracking-widest", details.color)}>
            {details.title}
          </div>
          <div className="text-xs font-bold tabular-nums">
            ENDS IN {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div className="ml-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      </motion.div>
    </AnimatePresence>
  );
};
