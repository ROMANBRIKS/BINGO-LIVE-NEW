import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, BarChart2, Crown, Star, Shield, Trophy, Diamond } from 'lucide-react';
import { cn } from '../lib/utils';

interface Honor {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  points: number;
  date: string;
  theme: 'gold' | 'blue' | 'magenta' | 'teal';
  status: 'active' | 'ended';
}

const HONORS: Honor[] = [
  {
    id: '10th-anniversary',
    title: 'BINGO 10TH ANNIVERSARY',
    subtitle: 'Event in Progress',
    description: 'Bingo 10th Anniversary Commemorative Medal',
    image: 'https://picsum.photos/seed/medal1/400/400',
    points: 100,
    date: '2026.04.03 earned',
    theme: 'gold',
    status: 'active'
  },
  {
    id: 'gala-2025',
    title: 'GALA 2025 FAMILY TOURNAMENT',
    subtitle: 'Event ended',
    description: 'Gala 2025 Family Championship Trophy',
    image: 'https://picsum.photos/seed/medal2/400/400',
    points: 250,
    date: '2025.12.15 earned',
    theme: 'blue',
    status: 'ended'
  },
  {
    id: 'mid-year-2025',
    title: '2025 MID-YEAR GALA',
    subtitle: 'Event ended',
    description: '2025 Mid-Year Host Championship',
    image: 'https://picsum.photos/seed/medal3/400/400',
    points: 150,
    date: '2025.06.20 earned',
    theme: 'teal',
    status: 'ended'
  },
  {
    id: '9th-anniversary',
    title: 'BINGO 9TH ANNIVERSARY',
    subtitle: 'Event ended',
    description: 'Bingo 9th Anniversary Commemorative Medal',
    image: 'https://picsum.photos/seed/medal4/400/400',
    points: 100,
    date: '2025.04.03 earned',
    theme: 'magenta',
    status: 'ended'
  }
];

export default function HonorHallPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMainTab, setActiveMainTab] = useState<'Honors' | 'Wealth Ranking' | 'Charm Ranking'>('Honors');
  const [timeRange, setTimeRange] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  const currentHonor = HONORS[currentIndex];

  const themeColors = {
    gold: 'from-yellow-400 via-yellow-200 to-yellow-600',
    blue: 'from-blue-400 via-blue-200 to-blue-600',
    teal: 'from-teal-400 via-teal-200 to-teal-600',
    magenta: 'from-pink-400 via-pink-200 to-pink-600'
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden">
        {/* Cosmic Portal Effect */}
        <motion.div 
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 1.5, 10], 
            rotate: [0, 180, 360, 720],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-yellow-500/20 via-white/40 to-blue-500/20 blur-[100px]"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
          transition={{ duration: 3, times: [0, 0.2, 0.8, 1] }}
          className="relative z-10 text-center"
        >
          <h1 className="text-4xl font-black italic tracking-[0.3em] text-white mb-4">HONOR HALL</h1>
          <p className="text-yellow-400 font-black uppercase tracking-[0.5em] text-xs">Your Moment of Honor</p>
        </motion.div>

        {/* Cinematic Light Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between z-50">
        <button onClick={() => navigate('/profile')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-black italic tracking-[0.2em] uppercase">Honor Hall</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><BarChart2 size={20} /></button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Share2 size={20} /></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-col border-b border-white/5 bg-[#121212]">
        <div className="flex items-center gap-6 px-6 py-2 overflow-x-auto no-scrollbar">
          {['Honors', 'Wealth Ranking', 'Charm Ranking'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveMainTab(tab as any)}
              className={cn(
                "whitespace-nowrap text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all",
                activeMainTab === tab ? "text-white border-yellow-400" : "text-white/20 border-transparent"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {activeMainTab !== 'Honors' && (
          <div className="flex items-center justify-center gap-8 py-3 bg-black/20">
            {['Daily', 'Weekly', 'Monthly'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                  timeRange === range ? "text-yellow-400" : "text-white/20 hover:text-white/40"
                )}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-y-auto scrollbar-hide">
        {activeMainTab === 'Honors' ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHonor.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -50 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="relative w-full max-w-md flex flex-col items-center"
              >
                {/* Background Glow */}
                <div className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] opacity-30 rounded-full bg-gradient-to-r",
                  themeColors[currentHonor.theme]
                )} />

                {/* The Medal/Trophy */}
                <div className="relative z-10 mb-12 group">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotateY: [0, 10, 0, -10, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    {/* 3D-style Medal Representation */}
                    <div className={cn(
                      "w-48 h-48 rounded-full bg-gradient-to-br p-1 shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                      themeColors[currentHonor.theme]
                    )}>
                      <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                        <img 
                          src={currentHonor.image} 
                          alt={currentHonor.title}
                          className="w-32 h-32 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        />
                      </div>
                    </div>
                    
                    {/* Shine Effect */}
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                    />
                  </motion.div>

                  {/* Pedestal */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-md" />
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-40 h-24 bg-[#1a1a1a] border-x border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col items-center pt-4">
                    <div className="w-24 h-1 bg-white/5 rounded-full mb-2" />
                    <div className="w-16 h-1 bg-white/5 rounded-full" />
                  </div>
                </div>

                {/* Info Section */}
                <div className="text-center z-20 mt-16">
                  <h3 className="text-2xl font-black italic tracking-tight mb-2">{currentHonor.title}</h3>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em] mb-6",
                    currentHonor.status === 'active' ? "text-yellow-400" : "text-white/40"
                  )}>
                    {currentHonor.subtitle}
                  </p>
                  
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between gap-8">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Honor</p>
                        <p className="text-sm font-bold">{currentHonor.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Points</p>
                        <p className="text-xl font-black italic text-yellow-400">{currentHonor.points}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">D</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Dark Matters2.o</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{currentHonor.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <button 
                onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : HONORS.length - 1))}
                className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white pointer-events-auto transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => setCurrentIndex(prev => (prev < HONORS.length - 1 ? prev + 1 : 0))}
                className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white pointer-events-auto transition-all active:scale-90 rotate-180"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Ranking List */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((rank) => (
              <div key={rank} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-black italic",
                  rank === 1 ? "bg-yellow-400 text-black" :
                  rank === 2 ? "bg-slate-400 text-black" :
                  rank === 3 ? "bg-orange-700 text-white" :
                  "text-white/20"
                )}>
                  {rank}
                </span>
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                  <img src={`https://picsum.photos/seed/rank${rank}/100/100`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-black italic uppercase tracking-tight text-sm">User {rank}</p>
                  <div className="flex items-center gap-1 text-[10px] font-black text-yellow-400">
                    {activeMainTab === 'Wealth Ranking' ? <Diamond size={10} /> : <Star size={10} />}
                    {(1000000 / rank).toLocaleString()}
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black uppercase rounded-full">Follow</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Progress */}
      <div className="p-8 flex justify-center gap-2">
        {HONORS.map((_, i) => (
          <div 
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === currentIndex ? "w-8 bg-yellow-400" : "w-2 bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
