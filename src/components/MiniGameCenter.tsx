import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X, Trophy, Users, Zap, Star, ChevronRight, Play, Award } from 'lucide-react';
import { cn } from '../lib/utils';

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

export const MiniGameCenter = ({ onStartGame, isOpen: externalIsOpen, onToggle }: { onStartGame: (game: MiniGame) => void, isOpen?: boolean, onToggle?: () => void }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;
  const [activeTab, setActiveTab] = useState<'Games' | 'Leaderboard' | 'History'>('Games');

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
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
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
                      "pb-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
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
                  MINI_GAMES.map((game, i) => (
                    <motion.div 
                      key={game.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
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
                          onClick={() => onStartGame(game)}
                          className="p-2 bg-purple-500 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : activeTab === 'Leaderboard' ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                    <Trophy size={48} className="text-yellow-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Leaderboard coming soon!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                    <Award size={48} className="text-cyan-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No game history yet.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {externalIsOpen === undefined && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all relative",
            isOpen ? "bg-white text-black" : "bg-purple-500 text-white"
          )}
        >
          <Gamepad2 size={24} />
        </motion.button>
      )}
    </div>
  );
};
