import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Bell, Play, Heart, MessageCircle, Share2, X, Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface LiveUser {
  id: string;
  name: string;
  avatar: string;
  isLive?: boolean;
}

interface MissedUser {
  id: string;
  name: string;
  timeAgo: string;
  avatar: string;
  updatesCount?: number;
  clips?: {
    id: string;
    videoUrl?: string;
    hearts: number;
    title: string;
    bgGradient: string;
  }[];
}

interface FollowingStreamActivityProps {
  onBack: () => void;
}

export const FollowingStreamActivity = ({ onBack }: FollowingStreamActivityProps) => {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedClip, setSelectedClip] = useState<{ user: MissedUser; clip: any } | null>(null);
  const [clipLikes, setClipLikes] = useState<Record<string, number>>({});
  const [likedClips, setLikedClips] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [clipComments, setClipComments] = useState<Record<string, { sender: string; text: string }[]>>({});
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Sample data from images
  const liveUsers: LiveUser[] = [
    { id: 'creamy', name: 'Creamy GB...', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' },
    { id: 'miracle', name: '5kMIRACLE...', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' },
    { id: 'babyface', name: 'bãbγfãcε...', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120' },
    { id: 'sweet', name: '🔥 Sweet S...', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120' },
    { id: 'av', name: 'Av', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
  ];

  const missedUsers: MissedUser[] = [
    { id: 'vhickie', name: 'Vhickie 🏨', timeAgo: 'Live 1 minute ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: 'candy', name: '🍒 CANDY❤️ BERR...', timeAgo: 'Live 16 minutes ago', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150' },
    { id: 'selected', name: 'selected💕💘', timeAgo: 'Live 16 minutes ago', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150' },
    { id: 'bubble', name: '🦋🎲bubble ♟️', timeAgo: 'Live 23 minutes ago', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150' },
    {
      id: 'panda',
      name: 'sexy panda ❤️ 🐼',
      timeAgo: 'Live 34 minutes ago',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      updatesCount: 2,
      clips: [
        { id: 'p1', hearts: 31, title: 'Dancing challenge 💃', bgGradient: 'from-purple-900 to-indigo-950' },
        { id: 'p2', hearts: 6, title: 'Thank you for gifts 💖', bgGradient: 'from-rose-900 to-amber-950' },
      ]
    },
    {
      id: 'cookie',
      name: 'Cookie 🍪 📡',
      timeAgo: 'Live 37 minutes ago',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      updatesCount: 6,
      clips: [
        { id: 'c1', hearts: 14, title: 'POV: host sing ✨', bgGradient: 'from-teal-900 to-neutral-900' },
        { id: 'c2', hearts: 42, title: 'Mega combo react 🎁', bgGradient: 'from-amber-900 to-indigo-900' },
      ]
    },
    { id: 'africanqueen', name: 'AfricanQueen👑❤️', timeAgo: 'Live 39 minutes ago', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', updatesCount: 5 },
    {
      id: 'goddess',
      name: 'Gift d Goddess 💦',
      timeAgo: 'Live 57 minutes ago',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      updatesCount: 6,
      clips: [
        { id: 'g1', hearts: 89, title: 'High energy night 🔥', bgGradient: 'from-red-950 to-orange-950' },
        { id: 'g2', hearts: 34, title: 'Late conversation 💤', bgGradient: 'from-violet-950 to-emerald-950' },
      ]
    },
    { id: 'hanan', name: 'Hanan', timeAgo: 'Live 1 hour ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'dollar', name: '😡 ĐØ£AⓇ🐨BBY🦅', timeAgo: 'Live 1 hour ago', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150' },
    { id: 'empress', name: '🦋 Empress👑', timeAgo: 'Live 1 hour ago', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
    { id: 'adesuwa', name: '🎀 Adesuwa🎀', timeAgo: 'Live 1 hour ago', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', updatesCount: 4 }
  ];

  const handleTriggerNotification = () => {
    setNotificationsEnabled(true);
  };

  const handleOpenClip = (user: MissedUser, clip: any) => {
    setSelectedClip({ user, clip });
    setIsPlaying(true);
    // Initialize standard comments if none exist
    if (!clipComments[clip.id]) {
      setClipComments(prev => ({
        ...prev,
        [clip.id]: [
          { sender: 'LiveFan99', text: 'This highlight is absolute gold! 💖' },
          { sender: 'VIP_Boss', text: 'Love the stream setup' },
          { sender: 'AgileStreamer', text: 'Awesome vibes from the host!' }
        ]
      }));
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    if (!selectedClip) return;
    const clipId = selectedClip.clip.id;
    
    // Add floating heart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setFloatingHearts(prev => [...prev, { id: Date.now(), x, y }]);
    
    if (!likedClips[clipId]) {
      setLikedClips(prev => ({ ...prev, [clipId]: true }));
      setClipLikes(prev => ({ ...prev, [clipId]: (prev[clipId] || selectedClip.clip.hearts) + 1 }));
    }
    
    // Clean up hearts
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => Date.now() - h.id < 1000));
    }, 1000);
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedClip) return;
    const clipId = selectedClip.clip.id;
    
    setClipComments(prev => ({
      ...prev,
      [clipId]: [
        ...(prev[clipId] || []),
        { sender: 'You', text: commentInput.trim() }
      ]
    }));
    setCommentInput('');
  };

  const currentLikes = selectedClip ? (clipLikes[selectedClip.clip.id] || selectedClip.clip.hearts) : 0;
  const isCurrentLiked = selectedClip ? likedClips[selectedClip.clip.id] : false;

  return (
    <div className="fixed inset-0 bg-[#0a0a0e] z-[80] flex flex-col text-white font-sans overflow-hidden select-none">
      {/* Header */}
      <div className="flex-none p-4 flex items-center justify-between border-b border-white/5 bg-[#0f0f15]/90 backdrop-blur-md">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <span className="font-extrabold text-sm uppercase tracking-widest text-zinc-100">Following Stream Activity</span>
        <div className="w-8" /> {/* Spacer to align title */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Enable Notification Banner */}
        {!notificationsEnabled && (
          <div className="bg-[#121420] border border-blue-500/10 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black uppercase text-zinc-200">Enable Notifications</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">Don't miss out on live stream updates from creators!</p>
              </div>
            </div>
            <button 
              onClick={handleTriggerNotification}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-[9px] uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer shrink-0"
            >
              Enable Now
            </button>
          </div>
        )}

        {/* They are live now horizontal bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">🔴 THEY'RE LIVE NOW, DON'T MISS OUT!</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {liveUsers.map((u) => (
              <div 
                key={u.id} 
                onClick={() => navigate(`/room/live-${u.id}`)}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
              >
                <div className="relative">
                  <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 animate-pulse-subtle shadow-lg">
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="w-full h-full object-cover rounded-full border-2 border-[#0a0a0e]" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-black uppercase rounded-full tracking-wider scale-90">
                    LIVE
                  </div>
                </div>
                <span className="text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors">{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Live Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">📅 RECENTLY LIVE</span>
          </div>
          <div className="space-y-4">
            {missedUsers.map((user) => (
              <div key={user.id} className="p-4 bg-[#11111a]/80 border border-white/[0.03] rounded-3.5xl space-y-3 text-left shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border border-white/10" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        {user.name}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-500">{user.timeAgo}</span>
                    </div>
                  </div>
                  {user.updatesCount && (
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {user.updatesCount} New Updates
                    </span>
                  )}
                </div>

                {/* Clip Highlights if any */}
                {user.clips && user.clips.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {user.clips.map((clip) => (
                      <div 
                        key={clip.id}
                        onClick={() => handleOpenClip(user, clip)}
                        className={cn(
                          "relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md group border border-white/5 bg-gradient-to-tr",
                          clip.bgGradient
                        )}
                      >
                        {/* Abstract Stream Highlights Preview Overlay */}
                        <div className="absolute inset-0 opacity-40 mix-blend-color-dodge bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} />
                        
                        {/* Play Icon Circle */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white active:scale-90 transition-transform">
                            <Play size={14} className="fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Text and stats banner */}
                        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-left">
                          <p className="text-[9px] font-extrabold text-white truncate">{clip.title}</p>
                          <div className="flex items-center justify-between mt-1 text-[8px] text-zinc-400">
                            <span className="font-mono text-pink-400 font-extrabold">❤️ {clipLikes[clip.id] || clip.hearts}</span>
                            <span className="text-[7px] uppercase font-black text-blue-300">WATCH NOW</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Screen Theater Clip Player Overlay */}
      <AnimatePresence>
        {selectedClip && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black z-[90] flex flex-col"
          >
            {/* Top Close Control */}
            <div className="absolute top-4 inset-x-0 px-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <img 
                  src={selectedClip.user.avatar} 
                  className="w-8 h-8 rounded-full border border-white/20 object-cover" 
                  alt="avatar"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[11px] font-black text-white block">{selectedClip.user.name}</span>
                  <span className="text-[7px] font-mono text-zinc-400 block uppercase tracking-wider">{selectedClip.user.timeAgo}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClip(null)}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulated Live Stream Video Box */}
            <div 
              onClick={handleDoubleTap}
              className={cn(
                "flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-br select-none",
                selectedClip.clip.bgGradient
              )}
            >
              {/* Spinning/pulsing graphic simulation to act as continuous video loop */}
              <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-2xl animate-spin-slow" />
              <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-pink-500/20 to-orange-500/20 blur-xl animate-pulse" />
              
              <div className="z-10 flex flex-col items-center justify-center gap-3">
                <Sparkles size={48} className="text-[#00f2ff] animate-bounce" />
                <span className="text-xs uppercase tracking-widest font-black text-white/50">Playing Highlight Clip</span>
                <span className="text-sm font-extrabold italic text-center px-6 text-cyan-200">"{selectedClip.clip.title}"</span>
              </div>

              {/* Floating Hearts Animation overlay */}
              {floatingHearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ opacity: 1, scale: 0.8, y: heart.y }}
                  animate={{ opacity: 0, scale: 1.8, y: heart.y - 120, rotate: Math.random() * 30 - 15 }}
                  transition={{ duration: 0.8 }}
                  className="absolute pointer-events-none z-30"
                  style={{ left: heart.x }}
                >
                  <Heart size={44} className="text-pink-500 fill-pink-500 filter drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                </motion.div>
              ))}

              {/* Floating Live Reactions (e.g. users sending hearts/gifts) */}
              <div className="absolute bottom-36 left-4 max-w-[240px] z-20 space-y-2 pointer-events-none text-left">
                {/* Standard floating logs */}
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                  <span>Streamer got <span className="text-amber-400 font-bold">Lollipop 🍭</span> gift combo!</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] text-zinc-300 border border-white/5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Host is on Fire streak ⚔️🔥</span>
                </div>
              </div>

              {/* Sidebar controls for liking, comments, etc. */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-4 z-20">
                {/* Like Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const clipId = selectedClip.clip.id;
                    setLikedClips(prev => ({ ...prev, [clipId]: !isCurrentLiked }));
                    setClipLikes(prev => ({ 
                      ...prev, 
                      [clipId]: isCurrentLiked 
                        ? (prev[clipId] || selectedClip.clip.hearts) - 1 
                        : (prev[clipId] || selectedClip.clip.hearts) + 1 
                    }));
                  }}
                  className="flex flex-col items-center gap-0.5 cursor-pointer"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center border transition-all active:scale-90",
                    isCurrentLiked 
                      ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20" 
                      : "bg-black/40 border-white/10 text-white hover:bg-black/50"
                  )}>
                    <Heart size={20} className={isCurrentLiked ? "fill-white" : ""} />
                  </div>
                  <span className="text-[10px] font-black text-white/90">{currentLikes}</span>
                </button>

                {/* Comments button indicator */}
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-11 h-11 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black text-white/90">
                    {(clipComments[selectedClip.clip.id] || []).length}
                  </span>
                </div>

                {/* Share Option */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Share Link copied: bingo-live.com/clips/${selectedClip.clip.id}`);
                  }}
                  className="w-11 h-11 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform cursor-pointer"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Tap to like hint */}
              <div className="absolute inset-x-0 bottom-24 text-center pointer-events-none text-[9px] font-black uppercase text-white/40 tracking-widest">
                Double Tap Screen to Send Hearts ❤️
              </div>
            </div>

            {/* Comments Drawer / Keyboard section inside theater */}
            <div className="flex-none bg-[#0a0a0f] border-t border-white/5 p-4 flex flex-col gap-3">
              {/* Messages feed list */}
              <div className="max-h-[140px] overflow-y-auto space-y-2 flex flex-col text-left scrollbar-hide">
                {(clipComments[selectedClip.clip.id] || []).map((cmt, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed">
                    <span className="font-extrabold text-[#00f2ff] mr-1.5">{cmt.sender}:</span>
                    <span className="text-zinc-300 font-sans">{cmt.text}</span>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.03]">
                <input 
                  type="text"
                  placeholder="Say something sweet... 💬"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 rounded-2xl px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 disabled:opacity-40 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl shrink-0 cursor-pointer transition-all active:scale-95"
                >
                  Comment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
