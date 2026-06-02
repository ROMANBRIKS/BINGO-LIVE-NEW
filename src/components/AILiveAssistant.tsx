import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Heart, Zap, X, ChevronRight, MessageCircle, Info, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

export interface StreamStats {
  viewerCount: number;
  likeCount: number;
  giftCount: number;
  followCount: number;
  duration: number; // in seconds
}

export const AILiveAssistant = ({ 
  stats, 
  onAction,
  room,
  messages = []
}: { 
  stats: StreamStats, 
  onAction: (action: string) => void,
  room?: any,
  messages?: any[]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [advice, setAdvice] = useState<string[]>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [performance, setPerformance] = useState<'low' | 'medium' | 'high'>('medium');

  // 1. Generate client-side tips based on stream stats
  useEffect(() => {
    const newAdvice: string[] = [];
    
    if (stats.viewerCount < 10) {
      newAdvice.push("Share your stream to social media to attract more viewers! 📢");
      setPerformance('low');
    } else if (stats.viewerCount > 50) {
      newAdvice.push("Great job! Keep interacting with your top fans. 💖");
      setPerformance('high');
    } else {
      setPerformance('medium');
    }

    if (stats.likeCount < 100 && stats.duration > 300) {
      newAdvice.push("Ask your viewers to double-tap for likes! ❤️");
    }

    if (stats.giftCount === 0 && stats.duration > 600) {
      newAdvice.push("Try starting a PK battle to encourage gifting! ⚔️");
    }

    setAdvice(newAdvice);
  }, [stats]);

  const messagesRef = React.useRef(messages);
  const roomRef = React.useRef(room);
  const statsRef = React.useRef(stats);

  // Keep references fresh without rebuilding effect scope
  useEffect(() => {
    messagesRef.current = messages;
    roomRef.current = room;
    statsRef.current = stats;
  }, [messages, room, stats]);

  // 2. Fetch Gemini tips in real-time with automatic 60-second polling and absolute rate-limit safety
  useEffect(() => {
    if (!room?.id) {
      // Setup some default AI tips if not a room
      setAiTips([
        "Welcome new viewers by name to boost return rates! 👋",
        "Set an interactive comment goal to increase page authority! 📈"
      ]);
      return;
    }

    let isMounted = true;
    const generateAITips = async () => {
      setLoadingAI(true);
      try {
        const currentMessages = messagesRef.current || [];
        const currentRoom = roomRef.current || {};
        const currentStats = statsRef.current;
        const recentMessages = currentMessages.slice(-15).map(m => `${m.senderName}: ${m.text}`).join('\n');
        
        const prompt = `You are an AI Streamer Coach. Analyze the following stream statistics and recent chat messages, and provide 2 short, highly engaging, actionable tips (max 15 words each) to help the streamer expand their audience and encourage gifting (beans).
        
        Stream Title: ${currentRoom?.title || 'Live Stream'}
        Viewer Count: ${currentStats.viewerCount}
        Total Earnings: ${currentStats.giftCount} gifts
        Likes: ${currentStats.likeCount}
        
        Recent Chat Context:
        ${recentMessages || 'No messages yet'}

        Format your response as a JSON array of strings: ["tip 1", "tip 2"]`;

        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            responseMimeType: "application/json"
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        const score = await response.json();
        const data = JSON.parse(score.text || '[]');
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAiTips(data);
        }
      } catch (e) {
        console.error("Gemini Live Coach proxy error:", e);
        if (isMounted) {
          // Fallback default coaching advice
          setAiTips([
            "Greet new members explicitly to boost active viewer return-rates! 👋",
            "Ask a fun open question to start a quick chat debate! 💬"
          ]);
        }
      } finally {
        if (isMounted) {
          setLoadingAI(false);
        }
      }
    };

    // Initial triggers on load
    generateAITips();

    // Sane, rate-compliant 60s interval
    const interval = setInterval(generateAITips, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [room?.id]);

  const combinedAdvice = [...advice, ...aiTips];

  return (
    <div className="fixed bottom-32 right-4 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-72 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-400 rounded-xl flex items-center justify-center">
                    <Brain size={16} className="text-black" />
                  </div>
                  <h3 className="text-sm font-black italic uppercase tracking-tight text-white">AI Stream Coach</h3>
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
                  {combinedAdvice.length > 0 ? (
                    combinedAdvice.map((item, i) => (
                      <motion.div 
                        key={`${item}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 bg-cyan-400/5 border border-cyan-400/10 rounded-xl"
                      >
                        <Info size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] font-bold text-white/80 leading-relaxed">{item}</p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-[11px] text-white/40 italic">Analyzing stream performance... 🔍</p>
                  )}
                  {loadingAI && (
                    <div className="flex items-center gap-1.5 pl-1 py-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Coaching...</span>
                    </div>
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
          isOpen ? "bg-white text-black animate-none" : "bg-gradient-to-br from-cyan-400 to-blue-500 text-white animate-pulse"
        )}
      >
        <Sparkles size={24} />
        {!isOpen && combinedAdvice.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-[#121212] flex items-center justify-center text-[10px] font-black text-white">
            {combinedAdvice.length}
          </span>
        )}
      </motion.button>
    </div>
  );
};
