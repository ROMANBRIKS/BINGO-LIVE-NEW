import React, { useState } from 'react';
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
  type?: 'chat' | 'join' | 'like' | 'system' | 'follow' | 'welcome' | 'follow-prompt' | 'like-prompt' | 'guest-live-prompt' | 'gift' | 'follow-contribution' | 'follow-join-fan-club';
  onFollow?: () => void;
  isFollowing?: boolean;
  onLike?: () => void;
  onJoinGuest?: () => void;
  onClick?: () => void;
  onTextClick?: (displayName: string) => void;
}

export function translatePhrase(inputText: string): string {
  if (!inputText) return '';
  const normalized = inputText.trim().toLowerCase();
  
  const dictionary: Record<string, string> = {
    "مرحباً يا بطل": "Hello, leader/champion!",
    "كيف حالك يا بطل؟": "How are you doing, leader?",
    "بث رائع وصوت جميل": "Awesome broadcast and amazing voice!",
    "أحب هذا البث المباشر": "I really love this live stream!",
    "أنت ممتاز جدا": "You are absolutely phenomenal!",
    "شكرا لك": "Thank you so much!",
    "أهلاً بك": "Welcome aboard!",
    "كيف حالك اليوم يا صاحبي؟": "How are you doing today, my friend?",
    "مرحباً": "Hello / Welcome!",
    "جميل جدا": "Beautiful / Very nice!",
    
    "你好，主播": "Hello, streamer!",
    "这个直播太棒了！": "This live stream is super amazing!",
    "谢谢你送的礼物": "Thank you for the wonderful gift!",
    "你是最棒的": "You are absolutely the best!",
    "加油": "Go for it! Keep pushing!",
    "喜欢你的歌声": "I love your singing voice!",
    
    "kamusta lods?": "How are you, boss?",
    "galing naman sumayaw!": "Wow, what an incredible dancer!",
    "salamat sa stream!": "Thank you for the awesome stream!",
    "lodi talaga kita": "You are truly my idol/role model!",
    "pa-shoutout naman dyan": "Please give me a shoutout!",
    
    "schöner stream!": "Lovely live stream!",
    "wie geht es dir?": "How are you doing today?",
    "vielen dank!": "Thank you very much!",
    "das ist super": "That is absolutely super!",
    "guten abend": "Good evening!",
    
    "boa transmissão!": "Great broadcast!",
    "obrigado por tudo!": "Thank you for everything!",
    "amei a live": "I absolutely loved this stream!",
    "você é incrível": "You are amazing!",
  };

  if (dictionary[normalized]) return dictionary[normalized];

  for (const [key, value] of Object.entries(dictionary)) {
    if (normalized.includes(key)) return value;
  }

  if (/[\u0600-\u06FF]/.test(inputText)) {
    return '[Arabic translated]: "Peace and greetings! This is such a wonderful room! Keep up the amazing stream!"';
  }
  if (/[\u4e00-\u9fa5]/.test(inputText)) {
    return '[Chinese translated]: "Greetings! I am really enjoying this live session. Sending support to the broadcaster!"';
  }
  if (/\b(lods|lodi|salamat|kamusta|naman|galing)\b/i.test(inputText)) {
    return '[Tagalog translated]: "Greetings boss! This is a fantastic show, great job!"';
  }
  if (/[\u1780-\u17FF]/.test(inputText)) {
    return '[Khmer translated]: "Hello! What a beautiful stream! Sending greetings from Cambodia!"';
  }
  
  return `[Translated]: "${inputText} (Welcome to BINGO LIVE!)"`;
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

  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslateToggle = () => {
    if (translatedText) {
      setTranslatedText(null);
    } else {
      setIsTranslating(true);
      setTimeout(() => {
        setTranslatedText(translatePhrase(text || ''));
        setIsTranslating(false);
      }, 300);
    }
  };
  
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
      <div className="inline-flex items-center gap-1.5 mb-0.5 px-1.5 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
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
      <div className="flex items-center gap-2 mb-0.5 px-1.5 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
        <LevelBadge level={hostLevel || 1} />
        <p className="text-[11px] drop-shadow-md text-white">
          <span className="font-bold text-[#ff4d99]">{hostName}:</span> {renderMessageTextWithTags(text)}
        </p>
      </div>
    );
  }

  if (type === 'follow-contribution') {
    return wrapWithClick(
      <p className="text-[12px] text-amber-300 leading-relaxed font-bold select-none text-left animate-in fade-in slide-in-from-left-2 duration-300 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)] px-1.5 py-0.5">
        👉 Followed anchor: <span className="text-orange-400 font-extrabold">🔥 +160 Heat</span>
      </p>
    );
  }

  if (type === 'follow-join-fan-club') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-1.5 mb-0.5 px-1.5 py-0.5 text-left cursor-pointer pointer-events-auto select-none hover:bg-white/5 rounded-lg active:scale-98 transition-all animate-in fade-in slide-in-from-left-2 duration-300 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
        <span className="text-[10px] text-[#ff4d99] animate-pulse">💝</span>
        <p className="text-[11px] text-[#ff80bf] font-bold leading-normal flex items-center flex-wrap gap-1">
          Followed the host! Click to join fan group for exclusive badge & chat themes!
          <span className="text-[#ff4d99] font-black text-xs">&gt;</span>
        </p>
      </div>
    );
  }

  if (type === 'follow') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-1.5 mb-0.5 px-1.5 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
        {nobleTitle && nobleTitle !== 'None' && <NobleBadge tier={nobleTitle} size="sm" />}
        {svipTier && <SVIPBadge tier={svipTier} size="sm" />}
        {level && <LevelBadge level={level} />}
        {fanClubLevel && fanClubHostName && <FanClubBadge level={fanClubLevel} hostName={fanClubHostName} />}
        {familyName && familyLevel && <FamilyBadge familyName={familyName} familyLevel={familyLevel} />}
        <p className="text-[10px] text-white/90">
          <span className="font-bold text-[#00e5ff]">{displayName}</span> followed the host!
        </p>
      </div>
    );
  }

  if (type === 'like') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-1.5 mb-0.5 px-1.5 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
        <p className="text-[10px] text-white/90">
          <span className="font-bold text-[#00e5ff]">{displayName}</span> liked the post!
        </p>
        <span className="text-[12px]">💗</span>
      </div>
    );
  }

  if (type === 'system') {
    const isNew = text?.startsWith('New');
    const isContribution = text?.includes('contributed');
    
    return wrapWithClick(
      <div className="inline-flex items-center gap-2 mb-0.5 px-1.5 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
        {isNew && (
          <span className="px-1.5 py-0.5 bg-yellow-500 text-[8px] font-black text-zinc-950 uppercase rounded leading-none shrink-0">
            System
          </span>
        )}
        <p className="text-[10.5px] text-[#ffa726] font-bold leading-relaxed">
          {isNew ? text.replace('New', '').trim() : text}
        </p>
        {isContribution && <span className="text-[10px] text-amber-400 font-extrabold ml-1 shrink-0">🔥 +10</span>}
      </div>
    );
  }

  if (type === 'gift') {
    return wrapWithClick(
      <div className="inline-flex items-center gap-1.5 mb-0.5 px-2 py-0.5 bg-pink-500/10 border border-pink-500/15 rounded-lg animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
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
    <div className="flex flex-col gap-1 items-start mb-0.5 px-1.5 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300 w-fit max-w-full drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-1.5 flex-wrap">
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
            "drop-shadow-md text-[11px] leading-relaxed cursor-pointer hover:bg-white/10 rounded px-1 transition-colors",
            isHighLevel ? "text-yellow-200 font-medium" : "text-white/90"
          )}
        >
          {renderMessageTextWithTags(text)}
        </span>

        {/* Translate button */}
        {text && text.trim() && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTranslateToggle();
            }}
            className="text-[8.5px] text-cyan-400 hover:text-[#2af5ff] transition-all ml-1.5 focus:outline-none uppercase font-black tracking-wider cursor-pointer bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded"
          >
            {isTranslating ? "..." : translatedText ? "hide" : "🌐 Translate"}
          </button>
        )}
      </div>

      {/* Render Dynamic Translation Segment below local layout */}
      {translatedText && (
        <div className="mt-0.5 pl-6 pr-2 py-0.5 text-[10.5px] italic text-[#2af5ff] font-medium animate-in fade-in slide-in-from-top-1 duration-200 border-l border-cyan-400/50">
          {translatedText}
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
