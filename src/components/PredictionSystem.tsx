import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  X, 
  Check, 
  Clock, 
  Trophy, 
  AlertCircle, 
  Coins, 
  ChevronRight,
  Plus,
  BarChart3,
  Zap
} from 'lucide-react';
import { predictionService, Prediction, Bet } from '../services/predictionService';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

interface PredictionSystemProps {
  roomId: string;
  isHost: boolean;
  userProfile: any;
}

export const PredictionSystem: React.FC<PredictionSystemProps> = ({ roomId, isHost, userProfile }) => {
  const { showToast } = useToast();
  const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [showBetPanel, setShowBetPanel] = useState(false);
  const [userBet, setUserBet] = useState<Bet | null>(null);
  const [featureMode, setFeatureMode] = useState<'on' | 'off' | 'auto'>('on');

  // Form State
  const [question, setQuestion] = useState('');
  const [sideYes, setSideYes] = useState('Yes');
  const [sideNo, setSideNo] = useState('No');
  const [model, setModel] = useState<1 | 2>(1);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);

  const isUserVIP = (userProfile?.nobleTitle && userProfile?.nobleTitle !== 'None') || 
                    (userProfile?.svipStatus && userProfile?.svipStatus.status === 'active');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'features', 'predictions'), (snap) => {
      if (snap.exists()) {
        setFeatureMode(snap.data().mode || 'on');
      }
    });
    return () => unsub();
  }, []);

  // Listen for active prediction
  useEffect(() => {
    if (featureMode === 'off') return;
    const q = query(
      collection(db, 'predictions'), 
      where('roomId', '==', roomId),
      where('status', 'in', ['open', 'closed'])
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActivePrediction(snapshot.docs[0].data() as Prediction);
      } else {
        setActivePrediction(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'predictions');
    });

    return () => unsubscribe();
  }, [roomId]);

  // Listen for user's bet on active prediction
  useEffect(() => {
    if (!activePrediction || !userProfile) return;

    const q = query(
      collection(db, 'bets'),
      where('predictionId', '==', activePrediction.id),
      where('userId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setUserBet(snapshot.docs[0].data() as Bet);
      } else {
        setUserBet(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bets');
    });

    return () => unsubscribe();
  }, [activePrediction, userProfile]);

  const handleCreate = async () => {
    if (!question) return;
    try {
      await predictionService.createPrediction({
        roomId,
        hostUid: userProfile.uid,
        question,
        sideYes,
        sideNo,
        model,
        targetMultiplier: model === 2 ? targetMultiplier : undefined
      });
      setShowCreator(false);
      setQuestion('');
      showToast("Prediction started! 🎯", 'success');
    } catch (error) {
      showToast("Failed to start prediction", 'error');
    }
  };

  const handleBet = async (side: 'yes' | 'no', amount: number) => {
    if (!activePrediction) return;
    try {
      await predictionService.placeBet(userProfile.uid, activePrediction.id, side, amount);
      showToast(`Bet placed on ${side === 'yes' ? activePrediction.sideYes : activePrediction.sideNo}! 🚀`, 'success');
    } catch (error: any) {
      showToast(error.message || "Failed to place bet", 'error');
    }
  };

  const handleSettle = async (winningSide: 'yes' | 'no') => {
    if (!activePrediction) return;
    try {
      showToast("Settling prediction... ⏳", 'info');
      await predictionService.settlePrediction(activePrediction.id, winningSide);
      showToast("Prediction settled! 🏆", 'success');
    } catch (error) {
      showToast("Failed to settle prediction", 'error');
    }
  };

  if (featureMode === 'off') return null;

  return (
    <div className="relative">
      {/* Floating Toggle Button */}
      <button 
        onClick={() => isHost ? setShowCreator(true) : setShowBetPanel(true)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
          activePrediction 
            ? "bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse" 
            : "bg-black/40 backdrop-blur-md border border-white/10"
        )}
      >
        <TrendingUp size={24} className={activePrediction ? "text-white" : "text-white/60"} />
      </button>

      {/* Host Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowCreator(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }} 
              className="relative w-full max-w-md bg-[#1a1a2e] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <Plus size={24} className="text-cyan-400" />
                  New Prediction
                </h3>
                <button onClick={() => setShowCreator(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} className="text-white/40" />
                </button>
              </div>

              {activePrediction ? (
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-xs font-bold text-white/40 uppercase mb-2">Active Prediction</p>
                    <p className="text-lg font-black text-white mb-4">{activePrediction.question}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleSettle('yes')}
                        className="p-4 bg-green-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                      >
                        {activePrediction.sideYes} Wins
                      </button>
                      <button 
                        onClick={() => handleSettle('no')}
                        className="p-4 bg-red-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                      >
                        {activePrediction.sideNo} Wins
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Question</label>
                    <input 
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g. Will I win this PK?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Option A</label>
                      <input 
                        value={sideYes}
                        onChange={(e) => setSideYes(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-green-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Option B</label>
                      <input 
                        value={sideNo}
                        onChange={(e) => setSideNo(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-red-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Payout Model</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setModel(1)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-left",
                          model === 1 ? "bg-cyan-400/10 border-cyan-400" : "bg-white/5 border-white/10"
                        )}
                      >
                        <p className="text-xs font-black text-white uppercase">Standard</p>
                        <p className="text-[8px] text-white/40 mt-1">Pool split. Safe for all users.</p>
                      </button>
                      <button 
                        onClick={() => setModel(2)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-left relative overflow-hidden",
                          model === 2 ? "bg-purple-400/10 border-purple-400" : "bg-white/5 border-white/10"
                        )}
                      >
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-purple-500 rounded-md">
                          <p className="text-[6px] font-black text-white uppercase">VIP</p>
                        </div>
                        <p className="text-xs font-black text-white uppercase">Boosted</p>
                        <p className="text-[8px] text-white/40 mt-1">Dynamic odds. Exclusive to VIP members.</p>
                      </button>
                    </div>
                  </div>

                  {model === 2 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Max Boost ({targetMultiplier}x)</label>
                        <span className="text-[8px] font-bold text-purple-400 uppercase">Range: 1.1x - {targetMultiplier}x</span>
                      </div>
                      <input 
                        type="range"
                        min="1.1"
                        max="5.0"
                        step="0.1"
                        value={targetMultiplier}
                        onChange={(e) => setTargetMultiplier(parseFloat(e.target.value))}
                        className="w-full accent-purple-400"
                      />
                    </div>
                  )}

                  <button 
                    onClick={handleCreate}
                    disabled={!question}
                    className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    Launch Prediction
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Viewer Betting Panel */}
      <AnimatePresence>
        {showBetPanel && activePrediction && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowBetPanel(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }} 
              className="relative w-full max-w-md bg-[#1a1a2e] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Live Prediction</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Accepting Bets</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowBetPanel(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} className="text-white/40" />
                </button>
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-8">
                <p className="text-lg font-black text-white text-center mb-6">{activePrediction.question}</p>
                
                {/* Progress Bar */}
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-2 flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(activePrediction.totalYes / (activePrediction.totalYes + activePrediction.totalNo || 1)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  />
                  <div className="flex-1 bg-gradient-to-r from-red-400 to-red-600" />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-green-400">{activePrediction.sideYes} ({activePrediction.totalYes})</span>
                  <span className="text-red-400">{activePrediction.sideNo} ({activePrediction.totalNo})</span>
                </div>
              </div>

              {userBet ? (
                <div className="p-6 bg-cyan-400/10 rounded-3xl border border-cyan-400/20 text-center">
                  <Zap size={32} className="mx-auto text-cyan-400 mb-3" />
                  <p className="text-xs font-bold text-white uppercase mb-1">You've placed your bet!</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">
                    {userBet.amount} Diamonds on <span className={userBet.side === 'yes' ? "text-green-400" : "text-red-400"}>
                      {userBet.side === 'yes' ? activePrediction.sideYes : activePrediction.sideNo}
                    </span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[8px] text-white/40 uppercase tracking-widest">Estimated Payout</p>
                    <p className="text-lg font-black text-cyan-400">
                      {activePrediction.model === 1 
                        ? Math.floor(userBet.amount * (1 + (activePrediction[userBet.side === 'yes' ? 'totalNo' : 'totalYes'] * 0.9 / (activePrediction[userBet.side === 'yes' ? 'totalYes' : 'totalNo'] || 1))))
                        : `Est. ${Math.floor(userBet.amount * 1.1)} - ${Math.floor(userBet.amount * (activePrediction.targetMultiplier || 2.0))} 💎`
                      }
                      {activePrediction.model === 1 && " 💎"}
                    </p>
                    {activePrediction.model === 2 && (
                      <p className="text-[6px] text-white/20 uppercase mt-1 font-black">Final boost depends on bank health</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePrediction.model === 2 && !isUserVIP && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-3">
                      <Trophy size={20} className="text-purple-400 flex-shrink-0" />
                      <p className="text-[8px] font-bold text-white uppercase leading-relaxed">
                        This is a <span className="text-purple-400">Boosted Prediction</span>. 
                        Upgrade to <span className="text-purple-400">VIP/Noble</span> to participate!
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Choose your side</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleBet('yes', 100)}
                      disabled={activePrediction.model === 2 && !isUserVIP}
                      className="group relative p-6 bg-white/5 border border-white/10 rounded-3xl overflow-hidden active:scale-95 transition-all disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors" />
                      <p className="text-xs font-black text-white uppercase mb-1">{activePrediction.sideYes}</p>
                      <p className="text-[8px] text-green-400 font-bold uppercase">Bet 100 💎</p>
                    </button>
                    <button 
                      onClick={() => handleBet('no', 100)}
                      disabled={activePrediction.model === 2 && !isUserVIP}
                      className="group relative p-6 bg-white/5 border border-white/10 rounded-3xl overflow-hidden active:scale-95 transition-all disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />
                      <p className="text-xs font-black text-white uppercase mb-1">{activePrediction.sideNo}</p>
                      <p className="text-[8px] text-red-400 font-bold uppercase">Bet 100 💎</p>
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[8px] text-white/20 uppercase font-black tracking-widest">
                    <AlertCircle size={10} />
                    <span>{activePrediction.model === 1 ? "Winners split losers' pool after 10% fee" : "Guaranteed boost for VIP members"}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
