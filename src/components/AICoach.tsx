import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Brain, TrendingUp, Zap, AlertCircle, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Room, Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const AICoach = ({ room, messages, onClose }: { room: Room, messages: Message[], onClose: () => void }) => {
  const [feedback, setFeedback] = useState<string>('Analyzing your stream performance...');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    engagement: 'High',
    lighting: 'Good',
    audio: 'Clear'
  });

  const getAIFeedback = async () => {
    if (!process.env.GEMINI_API_KEY) return;
    setLoading(true);
    try {
      const recentMessages = messages.slice(-10).map(m => `${m.senderName}: ${m.text}`).join('\n');
      const prompt = `You are an AI Streamer Coach. Analyze the following stream data and provide 3 short, punchy, actionable tips for the host to improve engagement and revenue.
      
      Stream Title: ${room.title}
      Current Viewers: ${room.viewerCount}
      Current Beans (Earnings): ${room.currentBeans}
      Recent Chat:
      ${recentMessages}
      
      Format your response as a JSON object with:
      {
        "feedback": "overall summary",
        "tips": ["tip 1", "tip 2", "tip 3"]
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || '{}');
      setFeedback(data.feedback || 'Keep up the great energy!');
      setSuggestions(data.tips || []);
    } catch (error) {
      console.error("AI Coach Error:", error);
      setFeedback("Focus on interacting with your top gifters to boost engagement!");
      setSuggestions([
        "Welcome new viewers by name",
        "Set a bean goal for the next 10 minutes",
        "Ask a question to start a chat debate"
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAIFeedback();
    const interval = setInterval(getAIFeedback, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      className="w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <h3 className="text-sm font-black uppercase italic tracking-wider text-white">AI Coach</h3>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Real-time Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
              <TrendingUp size={12} className="text-green-400 mx-auto mb-1" />
              <p className="text-[8px] font-black uppercase text-white/40">Engage</p>
              <p className="text-[10px] font-bold text-white">{stats.engagement}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
              <Zap size={12} className="text-yellow-400 mx-auto mb-1" />
              <p className="text-[8px] font-black uppercase text-white/40">Light</p>
              <p className="text-[10px] font-bold text-white">{stats.lighting}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 text-center border border-white/5">
              <AlertCircle size={12} className="text-blue-400 mx-auto mb-1" />
              <p className="text-[8px] font-black uppercase text-white/40">Audio</p>
              <p className="text-[10px] font-bold text-white">{stats.audio}</p>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-cyan-400 shrink-0 mt-1" />
              <p className="text-xs text-cyan-100/80 leading-relaxed italic">
                {loading ? "Analyzing..." : feedback}
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Live Tips</p>
            {suggestions.map((tip, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 rounded-xl p-3 border border-white/5 flex gap-3 items-center group hover:bg-white/10 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 group-hover:bg-cyan-500 transition-colors">
                  {i + 1}
                </div>
                <p className="text-[11px] text-white/70 font-medium leading-tight">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 p-4 flex items-center justify-center gap-2">
        <MessageSquare size={14} className="text-white/20" />
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Coaching Active</p>
      </div>
    </motion.div>
  );
};
