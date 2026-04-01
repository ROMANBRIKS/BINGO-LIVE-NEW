import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ComingSoonPage({ title }: { title: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full" />
        <Sparkles size={80} className="text-cyan-400 relative z-10 animate-pulse" />
      </div>
      
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-white">
        {title} <span className="text-cyan-400">Coming Soon</span>
      </h1>
      
      <p className="text-white/40 text-sm max-w-xs mb-12 leading-relaxed">
        We're working hard to bring you the best {title.toLowerCase()} experience. Stay tuned for updates!
      </p>
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all active:scale-95"
      >
        <ArrowLeft size={20} />
        Go Back
      </button>
    </div>
  );
}
