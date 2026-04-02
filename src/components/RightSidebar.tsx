import React from 'react';
import { TrendingUp, Users, Star, Flame } from 'lucide-react';

export const RightSidebar = React.memo(() => {
  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-80 bg-black/40 backdrop-blur-xl border-l border-white/5 flex-col p-6 z-40 shrink-0 gap-8">
      {/* Trending Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-orange-500">
          <TrendingUp size={18} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Trending Now</h3>
        </div>
        <div className="space-y-3">
          {['#FridayVibes', '#PKBattle', '#KaraokeNight', '#GamingPro'].map((tag, i) => (
            <div key={i} className="group cursor-pointer">
              <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{tag}</p>
              <p className="text-[10px] text-white/20 uppercase tracking-widest">12.4k viewers</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Hosts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Star size={18} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Recommended</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="flex items-center gap-3 group cursor-pointer active:scale-95 transition-all"
            >
              <div className="relative">
                <img src={`https://picsum.photos/seed/rec${i}/64/64`} className="w-10 h-10 rounded-full border border-white/10 group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white/80 truncate group-hover:text-white transition-colors">Star Creator {i}</p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">Music • 5.2k fans</p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-colors">Follow</button>
            </div>
          ))}
        </div>
      </div>

      {/* Download App Promo */}
      <div className="mt-auto bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10 space-y-4">
          <h4 className="text-sm font-black uppercase italic leading-tight">Watch on the go!</h4>
          <p className="text-[10px] text-white/60 leading-relaxed">Download the BINGO LIVE app for the full experience.</p>
          <button className="w-full bg-white text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            Get App
          </button>
        </div>
      </div>
    </aside>
  );
});

RightSidebar.displayName = 'RightSidebar';
