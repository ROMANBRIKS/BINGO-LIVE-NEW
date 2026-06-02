import React from 'react';
import { LevelBadge } from './LevelBadge';
import { cn } from '../lib/utils';
import { WingedHeart } from './WingedHeart';
import { Plus, Heart } from 'lucide-react';
import { FanClubBadge } from './FanClubBadge';
import { NobleFrame } from './NobleFrame';
import { FamilyBadge } from './FamilyBadge';
import { NobleBadge } from './NobleBadge';
import { SVIPBadge } from './SVIPBadge';
import { NobleTier } from '../NobleTypes';

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
  onClick?: () => void;
  onTextClick?: (displayName: string) => void;
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
    fanClubLevel,
    fanClubHostName,
    photoURL,
    familyName,
    familyLevel,
    svipTier
  } = msg;

  const onFollow = props.onFollow || msg.onFollow;
  const isFollowing = props.isFollowing || msg.isFollowing;
  const onLike = props.onLike || msg.onLike;
  const onJoinGuest = props.onJoinGuest || msg.onJoinGuest;
  const onClick = props.onClick || msg.onClick;
  const onTextClick = props.onTextClick || msg.onTextClick;
  
  const isHighLevel = (level || 0) >= 50;

  const renderMessageTextWithTags = (inputText: string | undefined) => {
    if (!inputText) return null;
    const parts = inputText.split(/(@[a-zA-Z0-9.\-_øøøøøø]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <span 
            key={i} 
            onClick={(e) => {
              e.stopPropagation();
              if (onTextClick) {
                onTextClick(username);
              }
            }}
            className="text-[#00e5ff] font-bold hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const wrapWithClick = (content: React.ReactNode) => (
    <div onClick={onClick} className={cn(onClick && "cursor-pointer active:opacity-70 transition-opacity")}>
      {content}
    </div>
  );

  if (type === 'follow-prompt') {
    return wrapWithClick(
      <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <p className="text-[12px] text-white drop-shadow-md font-medium px-1">
          Follow <span className="text-[#00e5ff] font-bold">{displayName}</span> to get LIVE notifications
        </p>
        {!isFollowing && (
          <div 
            className="inline-flex items-center gap-2 bg-[#00bfa5] pl-1 pr-1 py-1 rounded-full shadow-lg w-fit group cursor-pointer active:scale-95 transition-transform" 
            onClick={(e) => {
              e.stopPropagation();
              onFollow?.();
            }}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
              <img src={hostPhoto || 'https://i.pravatar.cc/100'} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-tighter px-1">Follow me</span>
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <Plus size={14} className="text-[#00bfa5]" strokeWidth={4} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'like-prompt') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-3 mb-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        <p className="text-[10px] text-white/90 leading-relaxed">
          Tap like to give the host a little energy!
        </p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          className="flex items-center gap-1 px-3 py-1 bg-black/40 border border-white/10 rounded-full text-[9px] font-bold text-white active:scale-95 transition-transform"
        >
          <span className="text-pink-500 text-[11px]">💗</span>
          Like
        </button>
      </div>
    );
  }

  if (type === 'guest-live-prompt') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-3 mb-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        <div className="flex flex-col">
          <p className="text-[10px] text-white/90 leading-relaxed">
            Wanna meet with the broadcaster? Click to join the
          </p>
          <p className="text-[10px] text-white/90 leading-relaxed">
            Guest Live !
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onJoinGuest?.();
          }}
          className="px-4 py-1.5 bg-[#00e5ff] text-white rounded-full text-[9px] font-bold active:scale-95 transition-transform"
        >
          Join
        </button>
      </div>
    );
  }

  if (type === 'join') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300">
        <NobleFrame tier={nobleTitle || 'None'} size={22}>
          <img src={photoURL || 'https://i.pravatar.cc/100'} className="w-full h-full object-cover rounded-full" alt="" />
        </NobleFrame>
        {nobleTitle && nobleTitle !== 'None' && <NobleBadge tier={nobleTitle} size="sm" />}
        {svipTier && <SVIPBadge tier={svipTier} size="sm" />}
        {level && <LevelBadge level={level} />}
        {fanClubLevel && fanClubHostName && <FanClubBadge level={fanClubLevel} hostName={fanClubHostName} />}
        {familyName && familyLevel && <FamilyBadge familyName={familyName} familyLevel={familyLevel} />}
        <span className="text-[10px] font-bold text-[#00e5ff]">
          {displayName}
        </span>
        <span className="text-[10px] text-white/90">joined</span>
      </div>
    );
  }

  if (type === 'welcome') {
    return wrapWithClick(
      <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
        <LevelBadge level={hostLevel || 1} />
        <p className="text-[11px] drop-shadow-md text-white">
          <span className="font-bold text-white/80">{hostName}:</span> {renderMessageTextWithTags(text)}
        </p>
      </div>
    );
  }

  if (type === 'follow') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300">
        {nobleTitle && nobleTitle !== 'None' && <NobleBadge tier={nobleTitle} size="sm" />}
        {svipTier && <SVIPBadge tier={svipTier} size="sm" />}
        {level && <LevelBadge level={level} />}
        {fanClubLevel && fanClubHostName && <FanClubBadge level={fanClubLevel} hostName={fanClubHostName} />}
        {familyName && familyLevel && <FamilyBadge familyName={familyName} familyLevel={familyLevel} />}
        <p className="text-[10px] text-white/90">
          <span className="font-bold text-[#00e5ff]">{displayName}</span> : followed the anchor.
        </p>
      </div>
    );
  }

  if (type === 'like') {
    return wrapWithClick(
      <div className="inline-flex flex-col gap-1 mb-1 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 w-fit">
          <p className="text-[10px] text-white/90">
            <span className="font-bold text-[#00e5ff]">{displayName}</span> sent a like to the host.
          </p>
        </div>
        <span className="text-[12px] ml-2">💗</span>
      </div>
    );
  }

  if (type === 'system') {
    const isNew = text?.startsWith('New');
    const isContribution = text?.includes('contributed');
    
    return wrapWithClick(
      <div className={cn(
        "inline-flex items-center gap-2 mb-1 px-3 py-1 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full",
        isNew ? "bg-black/30" : "bg-black/30"
      )}>
        {isNew && (
          <span className="px-2 py-0.5 bg-yellow-500 text-[8px] font-black text-white uppercase rounded-full leading-none">
            New
          </span>
        )}
        <p className="text-[10px] text-white/90 leading-relaxed">
          {isNew ? text.replace('New', '').trim() : text}
        </p>
        {isContribution && <span className="text-[10px]">🔥 +10</span>}
      </div>
    );
  }

  if (type === 'gift') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/30 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
        {nobleTitle && nobleTitle !== 'None' && <NobleBadge tier={nobleTitle} size="sm" />}
        {svipTier && <SVIPBadge tier={svipTier} size="sm" />}
        {level && <LevelBadge level={level} />}
        {fanClubLevel && fanClubHostName && <FanClubBadge level={fanClubLevel} hostName={fanClubHostName} />}
        {familyName && familyLevel && <FamilyBadge familyName={familyName} familyLevel={familyLevel} />}
        <p className="text-[11px] leading-relaxed text-pink-200">
          <span className="font-bold text-[#00e5ff] mr-1">{displayName}</span>
          {text}
        </p>
        <span className="text-[14px]">🎁</span>
        {msg.shieldAbsorbedValue > 0 && (
          <span className="text-[9px] bg-red-600 text-white rounded-full px-1.5 py-0.5 font-black uppercase tracking-widest border border-red-500/50 animate-pulse ml-1 shrink-0 flex items-center gap-0.5">
            🛡️ Blocked -{msg.shieldAbsorbedValue}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 mb-1 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full">
      {/* Small profile photo for chat messages */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0 cursor-pointer active:scale-90 transition-transform"
      >
        <img 
          src={photoURL || `https://i.pravatar.cc/100?u=${displayName || 'star'}`} 
          className="w-full h-full object-cover" 
          alt="" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Badges & Name Zone - tapping here pops up the mini profile */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="inline-flex items-center gap-1 flex-wrap cursor-pointer"
      >
        {nobleTitle && nobleTitle !== 'None' && <NobleBadge tier={nobleTitle} size="sm" />}
        {svipTier && <SVIPBadge tier={svipTier} size="sm" />}
        {level && <LevelBadge level={level} />}
        {fanClubLevel && fanClubHostName && <FanClubBadge level={fanClubLevel} hostName={fanClubHostName} />}
        {familyName && familyLevel && <FamilyBadge familyName={familyName} familyLevel={familyLevel} />}
        
        <span className="font-bold text-[#00e5ff] mr-0.5 text-[11px] leading-relaxed select-none">
          {displayName} :
        </span>
      </div>

      {/* Message Text Zone - tapping here triggers auto-tagging response! */}
      <span 
        onClick={(e) => {
          e.stopPropagation();
          if (onTextClick && displayName) {
            onTextClick(displayName);
          } else {
            onClick?.();
          }
        }}
        className={cn(
          "drop-shadow-md text-[11px] leading-relaxed cursor-pointer hover:bg-white/10 rounded px-1 -mx-1 transition-colors",
          isHighLevel ? "text-yellow-200 font-medium" : "text-white/90"
        )}
      >
        {renderMessageTextWithTags(text)}
      </span>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
