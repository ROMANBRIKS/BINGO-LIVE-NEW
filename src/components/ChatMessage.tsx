import React from 'react';
import { LevelBadge } from './LevelBadge';
import { cn } from '../lib/utils';
import { WingedHeart } from './WingedHeart';
import { Plus, Heart } from 'lucide-react';

interface ChatMessageProps {
  message?: any;
  displayName?: string;
  text?: string;
  level?: number;
  nobleTitle?: string;
  hostName?: string;
  hostPhoto?: string;
  hostLevel?: number;
  type?: 'chat' | 'join' | 'like' | 'system' | 'follow' | 'welcome' | 'follow-prompt' | 'like-prompt' | 'guest-live-prompt' | 'gift';
  onFollow?: () => void;
  isFollowing?: boolean;
  onLike?: () => void;
  onJoinGuest?: () => void;
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
  } = msg;

  const onFollow = props.onFollow || msg.onFollow;
  const isFollowing = props.isFollowing || msg.isFollowing;
  const onLike = props.onLike || msg.onLike;
  const onJoinGuest = props.onJoinGuest || msg.onJoinGuest;
  
  const isHighLevel = (level || 0) >= 50;

  if (type === 'follow-prompt') {
    return (
      <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <p className="text-[14px] text-white drop-shadow-md font-medium px-1">
          Follow <span className="text-[#00e5ff] font-bold">{displayName}</span> to get LIVE notifications
        </p>
        {!isFollowing && (
          <div 
            className="inline-flex items-center gap-2 bg-[#00bfa5] pl-1 pr-1 py-1 rounded-full shadow-lg w-fit group cursor-pointer active:scale-95 transition-transform" 
            onClick={onFollow}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
              <img src={hostPhoto || 'https://i.pravatar.cc/100'} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[12px] font-black text-white uppercase tracking-tighter px-1">Follow me</span>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Plus size={16} className="text-[#00bfa5]" strokeWidth={4} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'like-prompt') {
    return (
      <div className="inline-flex items-center gap-3 mb-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        <p className="text-[11px] text-white/90 leading-relaxed">
          Tap like to give the host a little energy!
        </p>
        <button 
          onClick={onLike}
          className="flex items-center gap-1 px-3 py-1 bg-black/40 border border-white/10 rounded-full text-[10px] font-bold text-white active:scale-95 transition-transform"
        >
          <span className="text-pink-500 text-xs">💗</span>
          Like
        </button>
      </div>
    );
  }

  if (type === 'guest-live-prompt') {
    return (
      <div className="inline-flex items-center gap-3 mb-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        <div className="flex flex-col">
          <p className="text-[11px] text-white/90 leading-relaxed">
            Wanna meet with the broadcaster? Click to join the
          </p>
          <p className="text-[11px] text-white/90 leading-relaxed">
            Guest Live !
          </p>
        </div>
        <button 
          onClick={onJoinGuest}
          className="px-4 py-1.5 bg-[#00e5ff] text-white rounded-full text-[10px] font-bold active:scale-95 transition-transform"
        >
          Join
        </button>
      </div>
    );
  }

  if (type === 'join') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300">
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
      <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300">
        {level && <LevelBadge level={level} />}
        <p className="text-[11px] text-white/90">
          <span className="font-bold text-[#00e5ff]">{displayName}</span> : followed the anchor.
        </p>
        {!isFollowing && (
          <button 
            onClick={onFollow}
            className="px-3 py-1 bg-[#00e5ff] text-white rounded-full text-[9px] font-bold active:scale-95 transition-transform"
          >
            Follow
          </button>
        )}
      </div>
    );
  }

  if (type === 'like') {
    return (
      <div className="inline-flex flex-col gap-1 mb-1 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 w-fit">
          <p className="text-[11px] text-white/90">
            <span className="font-bold text-[#00e5ff]">{displayName}</span> sent a like to the host.
          </p>
        </div>
        <span className="text-[14px] ml-2">💗</span>
      </div>
    );
  }

  if (type === 'system') {
    const isNew = text?.startsWith('New');
    const isContribution = text?.includes('contributed');
    
    return (
      <div className={cn(
        "inline-flex items-center gap-2 mb-1 px-3 py-1 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full",
        isNew ? "bg-black/30" : "bg-black/30"
      )}>
        {isNew && (
          <span className="px-2 py-0.5 bg-yellow-500 text-[9px] font-black text-white uppercase rounded-full leading-none">
            New
          </span>
        )}
        <p className="text-[11px] text-white/90 leading-relaxed">
          {isNew ? text.replace('New', '').trim() : text}
        </p>
        {isContribution && <span className="text-[11px]">🔥 +10</span>}
      </div>
    );
  }

  if (type === 'gift') {
    return (
      <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/30 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
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
    <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
      {level && <LevelBadge level={level} />}
      <p className="text-[11px] leading-relaxed">
        <span className="font-bold text-[#00e5ff] mr-1">{displayName} :</span>
        <span className={cn(
          "drop-shadow-md",
          isHighLevel ? "text-yellow-200 font-medium" : "text-white/90"
        )}>{text}</span>
      </p>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
