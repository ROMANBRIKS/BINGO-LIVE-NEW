import React from 'react';
import { LevelBadge } from './LevelBadge';
import { cn } from '../lib/utils';
import { WingedHeart } from './WingedHeart';

interface ChatMessageProps {
  message?: any;
  displayName?: string;
  text?: string;
  level?: number;
  nobleTitle?: string;
  hostName?: string;
  hostPhoto?: string;
  hostLevel?: number;
  type?: 'chat' | 'join' | 'like' | 'system' | 'follow' | 'welcome' | 'follow-prompt';
  onFollow?: () => void;
  isFollowing?: boolean;
}

export const ChatMessage = React.memo((props: ChatMessageProps) => {
  const msg = props.message || props;
  const { 
    displayName, 
    text, 
    level, 
    nobleTitle, 
    hostName, 
    hostLevel, 
    type = 'chat', 
    onFollow, 
    isFollowing 
  } = msg;
  
  const isHighLevel = (level || 0) >= 50;

  if (type === 'follow-prompt') {
    return (
      <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <LevelBadge level={level} />
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10">
          <p className="text-[11px] text-white/90">
            <span className="font-bold text-[#00e5ff]">{displayName}</span> {text}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isFollowing) onFollow?.();
            }}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center min-w-[60px]",
              isFollowing 
                ? "bg-pink-500 text-white shadow-pink-500/20" 
                : "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-500/20"
            )}
          >
            {isFollowing ? <WingedHeart size={16} fill="currentColor" /> : "Follow"}
          </button>
        </div>
      </div>
    );
  }

  if (type === 'join') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300">
        <LevelBadge level={level} />
        {nobleTitle && nobleTitle !== 'none' && (
          <span className="text-[8px] bg-yellow-500 text-black font-black px-1 rounded-sm uppercase italic">
            {nobleTitle}
          </span>
        )}
        <span className="text-[11px] font-bold text-white/90">
          <span className="text-[#00e5ff]">{displayName}</span> joined the room
        </span>
      </div>
    );
  }

  if (type === 'welcome') {
    return (
      <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <LevelBadge level={hostLevel || 1} />
        <p className="text-xs drop-shadow-md text-white">
          <span className="font-bold text-white/80">{hostName}:</span> {text}
        </p>
      </div>
    );
  }

  if (type === 'follow') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-500/20 animate-in fade-in slide-in-from-left-2 duration-300">
        <LevelBadge level={level} />
        <span className="text-[11px] font-bold text-white">{displayName}</span>
        <span className="text-[11px] text-white/90">followed the host.</span>
        <span className="text-[11px]">✨</span>
      </div>
    );
  }

  if (type === 'like') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-2 px-3 py-1 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/20 animate-in fade-in slide-in-from-left-2 duration-300">
        <span className="text-[11px] font-bold text-white">{displayName}</span>
        <span className="text-[11px] text-white/90">sent a like to the host.</span>
        <span className="text-[11px]">❤️</span>
      </div>
    );
  }

  if (type === 'system') {
    return (
      <div className="flex items-start gap-2 mb-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px]">🤖</span>
        </div>
        <p className="text-[11px] text-white/90 leading-relaxed">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
      <LevelBadge level={level} />
      <p className={cn(
        "text-xs drop-shadow-md",
        isHighLevel ? "text-yellow-200 font-medium" : "text-white"
      )}>
        <span className={cn(
          "font-bold",
          isHighLevel ? "text-yellow-400" : "text-white/80"
        )}>{displayName}:</span> {text}
      </p>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
