import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type GameType = 'TapBattle' | 'Voting' | 'TruthOrDare';
export type GameStatus = 'waiting' | 'active' | 'finished';

export interface MiniGame {
  id: string;
  type: GameType;
  status: GameStatus;
  startTime: number;
  endTime: number;
  participants: string[];
  scores: Record<string, number>;
  config: Record<string, any>;
}

interface MiniGameOverlayProps {
  game: MiniGame;
  currentUserUid: string;
  onTap: () => void;
}

/**
 * 🎮 MINI-GAME OVERLAY COMPONENT
 * A high-energy UI component that sits on top of the live stream when a game is active.
 */
export const MiniGameOverlay: React.FC<MiniGameOverlayProps> = ({ 
  game, 
  currentUserUid, 
  onTap 
}) => {
  if (game.status === 'waiting') return null;

  // Helper to get leaderboard
  const getGameLeaderboard = (game: MiniGame, limit: number = 3) => {
    return Object.entries(game.scores)
      .map(([uid, score]) => ({ uid, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const leaderboard = getGameLeaderboard(game, 3);
  const timeLeft = Math.max(0, Math.floor((game.endTime - Date.now()) / 1000));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute inset-x-0 bottom-40 z-[120] flex flex-col items-center pointer-events-none"
      >
        {/* 1. Game Header & Timer */}
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-lg shadow-lg animate-pulse">
            🕹️
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
              {game.type} BATTLE
            </span>
            <span className="text-sm font-black text-white">{timeLeft}s REMAINING</span>
          </div>
        </div>

        {/* 2. Real-time Leaderboard */}
        <div className="w-full max-w-[240px] flex flex-col gap-1.5 mb-6">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.uid}
              layout
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg border ${
                entry.uid === currentUserUid ? 'bg-[#00e5ff]/20 border-[#00e5ff]/40' : 'bg-black/40 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/40">#{index + 1}</span>
                <span className="text-[11px] font-bold text-white truncate max-w-[100px]">
                  {entry.uid === currentUserUid ? 'YOU' : `User_${entry.uid.substring(0, 4)}`}
                </span>
              </div>
              <span className="text-[11px] font-black text-[#ffc400]">{entry.score} pts</span>
            </motion.div>
          ))}
        </div>

        {/* 3. Main Action Button (Only if active) */}
        {game.status === 'active' && (
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onTap}
            className="pointer-events-auto w-24 h-24 rounded-full bg-gradient-to-tr from-[#00e5ff] to-[#00d4ff] shadow-[0_0_30px_rgba(0,229,255,0.6)] flex flex-col items-center justify-center border-4 border-white/30 active:brightness-110"
          >
            <span className="text-2xl">⚡</span>
            <span className="text-[11px] font-black text-white uppercase tracking-tighter">TAP!</span>
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
