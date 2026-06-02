import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X, Trophy, Users, Zap, Star, Play, Award, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { useToast } from '../context/ToastContext';

export interface MiniGame {
  id: string;
  name: string;
  icon: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  reward: string;
  color: string;
}

const MINI_GAMES: MiniGame[] = [
  { id: 'dice', name: 'Lucky Dice', icon: '🎲', description: 'Roll the dice and win diamonds!', minPlayers: 1, maxPlayers: 10, reward: 'Diamonds', color: 'bg-orange-500' },
  { id: 'quiz', name: 'Trivia Quiz', icon: '❓', description: 'Test your knowledge with fans!', minPlayers: 2, maxPlayers: 50, reward: 'Beans', color: 'bg-blue-500' },
  { id: 'roulette', name: 'Spin & Win', icon: '🎡', description: 'Spin the wheel for prizes!', minPlayers: 1, maxPlayers: 1, reward: 'Exclusive Badges', color: 'bg-purple-500' },
  { id: 'race', name: 'Star Race', icon: '🏎️', description: 'Compete to reach the goal!', minPlayers: 2, maxPlayers: 8, reward: 'Level XP', color: 'bg-cyan-500' },
];

interface MiniGameCenterProps {
  onStartGame: (game: MiniGame) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  roomId?: string;
  profile?: UserProfile | null;
}

export const MiniGameCenter = ({ 
  onStartGame, 
  isOpen: externalIsOpen, 
  onToggle,
  roomId,
  profile 
}: MiniGameCenterProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;
  const [activeTab, setActiveTab] = useState<'Games' | 'Leaderboard' | 'History'>('Games');
  
  const { showToast } = useToast();

  // Internal Gameplay state
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [betSize, setBetSize] = useState<number>(50); // Default 50 Diamonds
  const [diceOption, setDiceOption] = useState<'Even' | 'Odd' | 'Lucky6'>('Even');
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<{ value1: number; value2: number; won: boolean; text: string; payout: number } | null>(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<{ won: boolean; text: string; payout: number; sliceName: string } | null>(null);

  // Play Dice function
  const handleRollDice = async () => {
    if (!profile) {
      showToast('Please log in to bet and roll!', 'error');
      return;
    }
    if (profile.diamonds < betSize) {
      showToast(`Insufficient Diamonds! You only have 💎 ${profile.diamonds}.`, 'error');
      return;
    }
    if (isRolling) return;
    
    setIsRolling(true);
    setDiceResult(null);

    try {
      // 1. Deduct bet size
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        diamonds: increment(-betSize),
        totalDiamondsSpent: increment(betSize)
      });

      // 2. Treat 2% of bet as a direct contribution to Room Popularity and Stream Heat
      const heatContributed = Math.max(1, Math.floor(betSize * 0.02));
      const chatMsgText = `bet 💎 ${betSize} on Lucky Dice and boosted stream heat by 🔥 +${heatContributed}!`;

      if (roomId) {
        // Increment global room popularity
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          popularity: increment(heatContributed),
          currentBeans: increment(heatContributed)
        }).catch(err => console.error("Room popularity increment fail:", err));

        // Add automated message to Chat
        await addDoc(collection(db, 'rooms', roomId, 'messages'), {
          uid: 'system_games',
          displayName: '🎮 GAME_CENTER',
          text: `${profile.displayName} ${chatMsgText}`,
          timestamp: serverTimestamp(),
          type: 'chat',
          isContribution: true
        }).catch(err => console.error("Add match game message fail:", err));
      }

      // 3. Roll dice (staggered animation)
      setTimeout(async () => {
        const val1 = Math.floor(Math.random() * 6) + 1;
        const val2 = Math.floor(Math.random() * 6) + 1;
        const total = val1 + val2;
        const isSumEven = total % 2 === 0;

        let won = false;
        let pMultiplier = 0;
        let resultLabel = '';

        if (diceOption === 'Even') {
          if (isSumEven) {
            won = true;
            pMultiplier = 1.9;
            resultLabel = `Won! Dice: ${val1} & ${val2} (Total: ${total} - Even)`;
          } else {
            resultLabel = `Lost! Dice: ${val1} & ${val2} (Total: ${total} - Odd)`;
          }
        } else if (diceOption === 'Odd') {
          if (!isSumEven) {
            won = true;
            pMultiplier = 1.9;
            resultLabel = `Won! Dice: ${val1} & ${val2} (Total: ${total} - Odd)`;
          } else {
            resultLabel = `Lost! Dice: ${val1} & ${val2} (Total: ${total} - Even)`;
          }
        } else if (diceOption === 'Lucky6') {
          if (val1 === 6 || val2 === 6) {
            won = true;
            pMultiplier = 3.5;
            resultLabel = `Lucky 6! Dice rolled ${val1} & ${val2} containing 6! 🎉`;
          } else {
            resultLabel = `Lost! Dice: ${val1} & ${val2} (No 6s)`;
          }
        }

        const payout = won ? Math.floor(betSize * pMultiplier) : 0;

        // Apply winnings if any
        if (won && payout > 0) {
          await updateDoc(userRef, {
            diamonds: increment(payout)
          });
          showToast(`🏆 Combined WIN! You received 💎 +${payout} Diamonds!`, 'success');
        } else {
          showToast(`Better luck next roll!`, 'info');
        }

        setDiceResult({
          value1: val1,
          value2: val2,
          won,
          text: resultLabel,
          payout
        });
        setIsRolling(false);
      }, 1500);

    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Error occurred during roll.', 'error');
      setIsRolling(false);
    }
  };

  // Play Roulette Wheel function
  const handleSpinRoulette = async () => {
    if (!profile) {
      showToast('Please log in to bet and spin!', 'error');
      return;
    }
    if (profile.diamonds < betSize) {
      showToast(`Insufficient Diamonds! You only have 💎 ${profile.diamonds}.`, 'error');
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    try {
      // 1. Deduct bet size
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        diamonds: increment(-betSize),
        totalDiamondsSpent: increment(betSize)
      });

      // 2. Treat 2% of bet as a direct contribution to Room Popularity and Stream Heat
      const heatContributed = Math.max(1, Math.floor(betSize * 0.02));
      const chatMsgText = `bet 💎 ${betSize} on Spin & Win Roulette and boosted stream heat by 🔥 +${heatContributed}!`;

      if (roomId) {
        // Increment global room popularity
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          popularity: increment(heatContributed),
          currentBeans: increment(heatContributed)
        }).catch(err => console.error("Room popularity increment fail:", err));

        // Add automated message to Chat
        await addDoc(collection(db, 'rooms', roomId, 'messages'), {
          uid: 'system_games',
          displayName: '🎮 GAME_CENTER',
          text: `${profile.displayName} ${chatMsgText}`,
          timestamp: serverTimestamp(),
          type: 'chat',
          isContribution: true
        }).catch(err => console.error("Add roulette game message fail:", err));
      }

      // 3. Spin wheel logic
      setTimeout(async () => {
        const rand = Math.random();
        let won = false;
        let multiplier = 0;
        let text = '';
        let sliceName = '';

        if (rand < 0.45) {
          multiplier = 0;
          won = false;
          sliceName = '0x Bubble';
          text = 'Unlucky spin! Bubble burst.';
        } else if (rand < 0.75) {
          multiplier = 1.2;
          won = true;
          sliceName = '1.2x Star';
          text = 'Nice spin! 1.2x returns.';
        } else if (rand < 0.92) {
          multiplier = 2.0;
          won = true;
          sliceName = '2.0x Double';
          text = 'Excellent! Double payouts!';
        } else {
          multiplier = 5.0;
          won = true;
          sliceName = '5.0x Mega Gold';
          text = '⭐ GRAND JACKPOT 5X! ⭐';
        }

        const payout = won ? Math.floor(betSize * multiplier) : 0;

        // Apply winnings if any
        if (won && payout > 0) {
          await updateDoc(userRef, {
            diamonds: increment(payout)
          });
          showToast(`🎉 WIN! You received 💎 +${payout}!`, 'success');
        } else {
          showToast('Try spin again!', 'info');
        }

        setSpinResult({
          won,
          text,
          payout,
          sliceName
        });
        setIsSpinning(false);
      }, 1500);

    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Error occurred during spin.', 'error');
      setIsSpinning(false);
    }
  };

  return (
    <div className="fixed bottom-32 left-4 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 left-0 w-80 bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mt-16 blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Gamepad2 size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-black italic uppercase tracking-tight text-white">Mini-Games</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-white/5">
                {['Games', 'Leaderboard', 'History'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "pb-2 text-[10px] font-black uppercase tracking-widest transition-all relative cursor-pointer",
                      activeTab === tab ? "text-white" : "text-white/20"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="gameTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="max-h-80 overflow-y-auto scrollbar-hide space-y-4">
                {activeTab === 'Games' ? (
                  selectedGame ? (
                    /* 🎮 ACTIVE GAME PLAYROOM SCREEN */
                    <div className="space-y-4">
                      {/* Back button */}
                      <button 
                        onClick={() => {
                          setSelectedGame(null);
                          setDiceResult(null);
                          setSpinResult(null);
                        }} 
                        className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-purple-400 hover:text-purple-300 transition-colors cursor-pointer text-left"
                      >
                        <ArrowLeft size={12} />
                        <span>All Games List</span>
                      </button>

                      {/* Game Brief Header */}
                      <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                        <span className="text-2xl">{selectedGame.icon}</span>
                        <div className="text-left">
                          <h4 className="text-xs font-black uppercase text-white tracking-wider leading-none mb-0.5">{selectedGame.name}</h4>
                          <p className="text-[9px] text-white/40 leading-tight">{selectedGame.description}</p>
                        </div>
                      </div>

                      {/* Bet Size Picker */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Select Wager Size</span>
                        <div className="grid grid-cols-5 gap-1">
                          {[10, 50, 100, 250, 500].map(amt => (
                            <button
                              key={amt}
                              onClick={() => {
                                setBetSize(amt);
                                setDiceResult(null);
                                setSpinResult(null);
                              }}
                              className={cn(
                                "py-1.5 text-[9px] font-bold rounded-xl border transition-all cursor-pointer",
                                betSize === amt 
                                  ? "bg-purple-500 text-white border-purple-400 font-black shadow-md shadow-purple-500/20" 
                                  : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                              )}
                            >
                              💎 {amt}
                            </button>
                          ))}
                        </div>
                        <p className="text-[7.5px] font-bold text-yellow-500 uppercase tracking-widest leading-none mt-1">
                          🛡️ 2% (🔥 {Math.max(1, Math.floor(betSize * 0.02))} Heat) immediately boosts show heat!
                        </p>
                      </div>

                      {/* GAME SPECIFIC GRAPHICAL VIEW */}
                      {selectedGame.id === 'dice' ? (
                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-3 text-center space-y-4">
                          <div className="flex gap-1 justify-center">
                            {(['Even', 'Odd', 'Lucky6'] as const).map(opt => (
                              <button
                                key={opt}
                                onClick={() => {
                                  setDiceOption(opt);
                                  setDiceResult(null);
                                }}
                                className={cn(
                                  "px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all cursor-pointer",
                                  diceOption === opt 
                                    ? "bg-orange-500 text-white border-orange-400 shadow-sm font-black"
                                    : "bg-black/30 text-white/50 border-white/5 hover:text-white"
                                )}
                              >
                                {opt === 'Even' ? 'EVEN (2,4,6)' : opt === 'Odd' ? 'ODD (1,3,5)' : 'LUCKY 6 (x3.5)'}
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-center items-center gap-4 py-1">
                            <motion.div 
                              animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 1, repeat: isRolling ? Infinity : 0 }}
                              className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-300 flex items-center justify-center text-slate-800 text-lg font-black"
                            >
                              {isRolling ? '❓' : diceResult?.value1 || '🎲'}
                            </motion.div>
                            <motion.div 
                              animate={isRolling ? { rotate: [0, -90, -180, -270, -360], scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 1, repeat: isRolling ? Infinity : 0 }}
                              className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-300 flex items-center justify-center text-slate-800 text-lg font-black"
                            >
                              {isRolling ? '❓' : diceResult?.value2 || '🎲'}
                            </motion.div>
                          </div>

                          {diceResult && (
                            <div className={cn(
                              "text-[10px] font-black uppercase tracking-wider p-2 rounded-xl text-center",
                              diceResult.won ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                              {diceResult.text}
                              {diceResult.won && <div className="text-[8px] font-bold mt-0.5 text-green-300">💎 +{diceResult.payout} diamonds won!</div>}
                            </div>
                          )}

                          <button
                            onClick={handleRollDice}
                            disabled={isRolling}
                            className={cn(
                              "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all active:scale-95 shadow-lg select-none cursor-pointer",
                              isRolling ? "bg-amber-500/50 cursor-not-allowed text-stone-700" : "bg-gradient-to-r from-orange-400 to-amber-500 hover:brightness-110 shadow-orange-500/20"
                            )}
                          >
                            {isRolling ? 'Rolling Dice...' : 'ROLL DICE 🎲'}
                          </button>
                        </div>
                      ) : selectedGame.id === 'roulette' ? (
                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-3 text-center space-y-4">
                          <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-black/40 rounded-full border border-white/10 overflow-hidden shadow-inner">
                            <div className="absolute top-1 w-1.5 h-3 bg-red-500 z-10 rounded-full" />
                            <motion.div 
                              animate={isSpinning ? { rotate: [0, 720, 1440, 2160, 2520 + Math.random() * 360] } : {}}
                              transition={{ duration: 1.5, ease: 'easeInOut' }}
                              className="w-[90%] h-[90%] rounded-full bg-gradient-to-tr from-purple-800 via-indigo-900 to-slate-900 border border-white/5 flex items-center justify-center relative overflow-hidden text-[9px] text-white/60 font-black"
                            >
                              <div className="absolute inset-0 border-r border-white/15 rotate-45" />
                              <div className="absolute inset-0 border-r border-white/15 rotate-90" />
                              <div className="absolute inset-0 border-r border-white/15 rotate-135" />
                              <div className="absolute inset-0 border-r border-white/15 rotate-180" />
                              <span className="z-10 bg-black/45 px-2 py-1 rounded-full text-[8px] border border-white/10 animate-pulse">🎡</span>
                            </motion.div>
                          </div>

                          {spinResult && (
                            <div className={cn(
                              "text-[10px] font-black uppercase tracking-wider p-2 rounded-xl text-center",
                              spinResult.won ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                              Landed: {spinResult.sliceName}
                              <div className="text-[8px] font-bold mt-0.5 text-white/80">{spinResult.text}</div>
                              {spinResult.won && <div className="text-[8px] font-bold mt-0.5 text-green-300">💎 +{spinResult.payout} diamonds won!</div>}
                            </div>
                          )}

                          <button
                            onClick={handleSpinRoulette}
                            disabled={isSpinning}
                            className={cn(
                              "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all active:scale-95 shadow-lg select-none cursor-pointer",
                              isSpinning ? "bg-indigo-500/50 cursor-not-allowed text-stone-700" : "bg-gradient-to-r from-purple-400 to-pink-500 hover:brightness-110 shadow-purple-500/20"
                            )}
                          >
                            {isSpinning ? 'SPINNING WHEEL...' : 'SPIN THE WHEEL 🎡'}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 text-center space-y-3">
                          <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Lobby Race Event Live</p>
                          <p className="text-[9px] text-white/50 leading-relaxed text-left">This multiplier-race relies on active streamer speed and reactions! Invite in-room gamers to enter the lobby.</p>
                          <button
                            onClick={() => {
                              showToast("Race queue is ready! Waiting for more in-room lobby players.", "info");
                            }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-6 rounded-full text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer pointer-events-auto"
                          >
                            JOIN LOBBY QUEUE 🏎️
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 🕹️ MINI-GAMES LIST */
                    MINI_GAMES.map((game, i) => (
                      <motion.div 
                        key={game.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedGame(game)}
                        className="group p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg", game.color)}>
                            {game.icon}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs font-black italic uppercase tracking-tight text-white">{game.name}</h4>
                            <p className="text-[9px] text-white/40 leading-relaxed">{game.description}</p>
                            <div className="flex items-center gap-3 pt-1">
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-white/20">
                                <Users size={8} />
                                <span>{game.minPlayers}-{game.maxPlayers} Players</span>
                              </div>
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-yellow-500/60">
                                <Zap size={8} />
                                <span>{game.reward}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGame(game);
                            }}
                            className="p-2 bg-purple-500 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )
                ) : activeTab === 'Leaderboard' ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                    <Trophy size={48} className="text-yellow-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Leaderboard coming soon!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                    <Award size={48} className="text-cyan-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">No game history yet.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
