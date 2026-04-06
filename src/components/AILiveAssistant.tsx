import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Heart, Zap, X, ChevronRight, MessageCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export interface StreamStats {
  viewerCount: number;
  likeCount: number;
  giftCount: number;
  followCount: number;
  duration: number; // in seconds
}

export const AILiveAssistant = ({ stats, onAction }: { stats: StreamStats, onAction: (action: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [advice, setAdvice] = useState<string[]>([]);
  const [performance, setPerformance] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    // Logic to generate advice based on stats
    const newAdvice: string[] = [];
    
    if (stats.viewerCount < 10) {
      newAdvice.push("Share your stream to social media to attract more viewers! 📢");
      setPerformance('low');
    } else if (stats.viewerCount > 50) {
      newAdvice.push("Great job! Keep interacting with your top fans. 💖");
      setPerformance('high');
    }

    if (stats.likeCount < 100 && stats.duration > 300) {
      newAdvice.push("Ask your viewers to double-tap for likes! ❤️");
    }

    if (stats.giftCount === 0 && stats.duration > 600) {
      newAdvice.push("Try starting a PK battle to encourage gifting! ⚔️");
    }

    setAdvice(newAdvice);
  }, [stats]);

  return (
    <div className="fixed bottom-32 right-4 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-72 bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-400 rounded-xl flex items-center justify-center">
                    <Sparkles size={16} className="text-black" />
                  </div>
                  <h3 className="text-sm font-black italic uppercase tracking-tight text-white">AI Assistant</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Performance</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      performance === 'high' ? "bg-green-500/20 text-green-500" :
                      performance === 'medium' ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-red-500/20 text-red-500"
                    )}>
                      {performance === 'high' ? 'Excellent' : performance === 'medium' ? 'Stable' : 'Needs Work'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: performance === 'high' ? '90%' : performance === 'medium' ? '50%' : '20%' }}
                      className={cn(
                        "h-full rounded-full",
                        performance === 'high' ? "bg-green-500" :
                        performance === 'medium' ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Real-time Advice</span>
                  {advice.length > 0 ? (
                    advice.map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-cyan-400/5 border border-cyan-400/10 rounded-xl"
                      >
                        <Info size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] font-bold text-white/80 leading-relaxed">{item}</p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-[11px] text-white/40 italic">Analyzing stream performance... 🔍</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onAction('share')}
                    className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                  >
                    <Zap size={16} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Boost Viewers</span>
                  </button>
                  <button 
                    onClick={() => onAction('pk')}
                    className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                  >
                    <TrendingUp size={16} className="text-pink-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Start PK</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all relative",
          isOpen ? "bg-white text-black" : "bg-cyan-400 text-black"
        )}
      >
        <Sparkles size={24} />
        {!isOpen && advice.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#121212] flex items-center justify-center text-[8px] font-bold text-white">
            {advice.length}
          </span>
        )}
      </motion.button>
    </div>
  );
};
