import React from 'react';
import { LevelBadge } from './LevelBadge';
import { cn } from '../lib/utils';
import { WingedHeart } from './WingedHeart';
import { Plus } from 'lucide-react';

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
    hostPhoto,
    type = 'chat', 
    onFollow, 
    isFollowing 
  } = msg;
  
  const isHighLevel = (level || 0) >= 50;

  if (type === 'follow-prompt') {
    if (isFollowing) return null;
    return (
      <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/5 w-fit">
          <p className="text-[11px] text-white/90">
            Follow <span className="font-bold text-[#00e5ff]">{displayName}</span> to get LIVE notifications
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#00bfa5] px-1.5 py-1 rounded-full shadow-lg w-fit group cursor-pointer active:scale-95 transition-transform" onClick={onFollow}>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
            <img src={hostPhoto || 'https://i.pravatar.cc/100'} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-tighter">Follow me</span>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Plus size={14} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'join') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300">
        {level && <LevelBadge level={level} />}
        <span className="text-[11px] font-bold text-[#00e5ff]">
          {displayName}
        </span>
        <span className="text-[11px] text-white/90">joined</span>
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
      <div className="inline-flex items-start gap-2 mb-1.5 px-3 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        <p className="text-[11px] text-[#00e5ff] font-medium leading-relaxed">
          {text}
        </p>
      </div>
    );
  }

  if (type === 'gift') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-1.5 px-3 py-1.5 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/30 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        {level && <LevelBadge level={level} />}
        <p className="text-[11px] leading-relaxed text-pink-200">
          <span className="font-bold text-[#00e5ff] mr-1">{displayName}</span>
          {text}
        </p>
        <span className="text-[14px]">🎁</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 mb-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
      {level && <LevelBadge level={level} />}
      <p className="text-[11px] leading-relaxed">
        <span className="font-bold text-[#00e5ff] mr-1">{displayName}</span>
        <span className={cn(
          "drop-shadow-md",
          isHighLevel ? "text-yellow-200 font-medium" : "text-white/90"
        )}>{text}</span>
      </p>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
