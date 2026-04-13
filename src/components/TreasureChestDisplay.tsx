import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, TrendingUp, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface TreasureChestDisplayProps {
  roomId: string;
  isHost: boolean;
}

export const TreasureChestDisplay: React.FC<TreasureChestDisplayProps> = ({ roomId, isHost }) => {
  const [chestData, setChestData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'rooms', roomId, 'features', 'treasureChest'), (snap) => {
      if (snap.exists()) {
        setChestData(snap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}/features/treasureChest`);
    });
    return () => unsub();
  }, [roomId]);

  if (!chestData) return null;

  const currentProgress = chestData.currentProgress || 0;
  const goals = chestData.goals || [];
  const nextGoal = goals.find((g: any) => !g.isCompleted) || goals[goals.length - 1];
  const progressPercent = Math.min(100, (currentProgress / nextGoal.targetDiamonds) * 100);

  return (
    <div className="absolute left-4 top-[180px] z-40 pointer-events-auto">
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 cursor-pointer hover:bg-black/60 transition-all group"
      >
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
            <Gift size={20} className="text-white" />
          </div>
          {progressPercent >= 100 && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border border-black shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
          )}
        </div>
        
        <div className="flex flex-col pr-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Treasure Chest</span>
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{nextGoal.rewardName}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              />
            </div>
            <span className="text-[10px] font-black italic text-white/90">{Math.floor(progressPercent)}%</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-14 left-0 w-64 bg-[#1a1a1a] rounded-[2rem] border border-white/10 shadow-2xl p-4 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Chest Progress</h3>
                <Trophy size={14} className="text-yellow-500" />
              </div>

              <div className="space-y-3">
                {goals.map((goal: any, i: number) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between p-2 rounded-xl border transition-all",
                    goal.isCompleted ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5"
                  )}>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center",
                        goal.isCompleted ? "bg-green-500 text-white" : "bg-white/10 text-white/40"
                      )}>
                        <Sparkles size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tight text-white/80">{goal.rewardName}</span>
                        <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">{goal.targetDiamonds.toLocaleString()} 💎</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-[10px] font-black italic",
                        goal.isCompleted ? "text-green-500" : "text-white/20"
                      )}>
                        {goal.isCompleted ? 'CLAIMED' : `+${goal.rewardValue}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>Total Contributions</span>
                  <span className="text-white">{currentProgress.toLocaleString()} 💎</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
