import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Trophy, Flame, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { useToast } from '../context/ToastContext';
import { claimTreasureLuckyPack } from '../treasureChestLogic';

interface TreasureChestDisplayProps {
  roomId: string;
  isHost: boolean;
  userProfile: UserProfile | null;
}

export const TreasureChestDisplay: React.FC<TreasureChestDisplayProps> = ({ roomId, isHost, userProfile }) => {
  const [chestData, setChestData] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [claiming, setClaiming] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'rooms', roomId, 'features', 'treasureChest'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setChestData(d);
        if (d.claimActive && d.claimEndsAt) {
          const remaining = Math.max(0, Math.floor((d.claimEndsAt - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}/features/treasureChest`);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (!chestData?.claimActive || !chestData?.claimEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((chestData.claimEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chestData?.claimActive, chestData?.claimEndsAt]);

  const handleClaim = async () => {
    if (!userProfile) {
      showToast('Please log in to claim!', 'error');
      return;
    }
    if (claiming) return;
    setClaiming(true);
    try {
      const res: any = await claimTreasureLuckyPack(roomId, userProfile.uid, userProfile.displayName || 'Anonymous User');
      if (res.success) {
        showToast(`🎉 Claimed successfully! You received 🪙 ${res.reward} Coins!`, 'success');
      } else {
        showToast(res.error || 'Failed to claim lucky pack.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error claiming pack.', 'error');
    } finally {
      setClaiming(false);
    }
  };

  if (!chestData) return null;

  const currentProgress = chestData.currentProgress || 0;
  const goals = chestData.goals || [];
  const nextGoal = goals.find((g: any) => !g.isCompleted) || goals[goals.length - 1];
  const progressPercent = Math.min(100, (currentProgress / nextGoal.targetDiamonds) * 100);

  const isClaimActive = chestData.claimActive && timeLeft > 0 && (chestData.remainingPrizes || 0) > 0;
  const hasClaimed = userProfile && chestData.claimedUsers?.includes(userProfile.uid);

  return (
    <div className="absolute left-4 top-[calc(env(safe-area-inset-top,0px)+125px)] md:top-[180px] z-40 pointer-events-auto">
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          "flex items-center gap-2 rounded-2xl p-1.5 border cursor-pointer transition-all group",
          isClaimActive 
            ? "bg-yellow-500/20 border-yellow-400/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-bounce" 
            : "bg-black/40 border-white/10 hover:bg-black/60"
        )}
      >
        <div className="relative">
          <motion.div 
            animate={isClaimActive ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: 'mirror' }}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
              isClaimActive 
                ? "bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 shadow-yellow-500/40" 
                : "bg-gradient-to-br from-yellow-400 to-orange-600 shadow-yellow-500/20"
            )}
          >
            <Gift size={20} className={cn("text-white", isClaimActive && "animate-pulse")} />
          </motion.div>
          
          {isClaimActive && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border border-black uppercase tracking-wider animate-pulse">
              LIVE
            </span>
          )}
        </div>
        
        <div className="flex flex-col pr-2">
          <div className="flex items-center justify-between gap-4">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isClaimActive ? "text-yellow-400" : "text-white/60"
            )}>
              {isClaimActive ? '🎁 CLAIM ACTIVE!' : 'Treasure Chest'}
            </span>
            <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">
              {isClaimActive ? `${timeLeft}s Left` : nextGoal.rewardName}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: isClaimActive ? '100%' : `${progressPercent}%` }}
                className={cn(
                  "h-full rounded-full",
                  isClaimActive 
                    ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500" 
                    : "bg-gradient-to-r from-yellow-400 to-orange-500"
                )}
              />
            </div>
            <span className="text-[9px] font-black italic text-white/90">
              {isClaimActive ? '100%' : `${Math.floor(progressPercent)}%`}
            </span>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-14 left-0 w-64 bg-[#1a1a1a] rounded-[2rem] border border-white/10 shadow-2xl p-4 overflow-hidden z-[60]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Chest Progress</h3>
                <Trophy size={14} className="text-yellow-500" />
              </div>

              {/* LIVE CLAIM PANEL */}
              {isClaimActive ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold border border-yellow-500/30 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-yellow-400 tracking-wider">Lucky Grab Pool Live!</span>
                    <span className="text-[8px] text-white/40 uppercase font-black tracking-widest mt-0.5">
                      {chestData.remainingPrizes || 0} / 20 Packs Remaining
                    </span>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={claiming || hasClaimed}
                    className={cn(
                      "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md",
                      hasClaimed
                        ? "bg-green-500/20 text-green-400 border border-green-500/30 font-extrabold cursor-not-allowed"
                        : "bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-yellow-500/30 active:scale-95"
                    )}
                  >
                    {claiming ? 'GRABBING...' : hasClaimed ? 'CLAIMED ✓' : 'GRAB COINS 🎁'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
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
              )}

              <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                  <span>Current Basin</span>
                  <span className="text-white">{currentProgress.toLocaleString()} 💎</span>
                </div>
                <div className="flex items-center gap-1.5 text-[7px] text-white/30 uppercase font-black leading-tight tracking-wider">
                  <AlertCircle size={8} />
                  <span>Chest charges on every gift sent!</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
