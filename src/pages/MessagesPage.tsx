import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, MessageCircle, User, Video, Users, Heart, Signal, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface MessageItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isLive?: boolean;
  isOnline?: boolean;
  unreadCount?: number;
  badges?: {
    type: 'level' | 'gender' | 'verified' | 'icon';
    value: string | number;
    color?: string;
  }[];
  heartCount?: number;
}

const messages: MessageItem[] = [
  {
    id: '1',
    name: 'BIGO Official',
    avatar: 'https://picsum.photos/seed/bigo/200',
    lastMessage: 'Messages from BIGO Live Official',
    time: '',
    unreadCount: 5,
    badges: [{ type: 'verified', value: 'V' }]
  },
  {
    id: '2',
    name: '👄BratzDollz💋',
    avatar: 'https://picsum.photos/seed/bratz/200',
    lastMessage: 'We are friends',
    time: '4h ago',
    unreadCount: 1,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }, { type: 'level', value: 22, color: 'from-pink-500 to-purple-500' }]
  },
  {
    id: '3',
    name: 'Austin 🦂',
    avatar: 'https://picsum.photos/seed/austin/200',
    lastMessage: 'I know this may come across lik...',
    time: '9h ago',
    badges: [
      { type: 'gender', value: 'male', color: 'bg-blue-500' },
      { type: 'level', value: 68, color: 'from-blue-400 to-indigo-600' }
    ]
  },
  {
    id: '4',
    name: 'Princess 🫶',
    avatar: 'https://picsum.photos/seed/princess/200',
    lastMessage: 'how much for a prt?',
    time: '22h ago',
    isLive: true,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '5',
    name: 'Melanin💦',
    avatar: 'https://picsum.photos/seed/melanin/200',
    lastMessage: 'Without face',
    time: '22h ago',
    unreadCount: 1,
    heartCount: 50,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '6',
    name: 'Oyediran Bose',
    avatar: '',
    lastMessage: "I'm in Nigeria, Osun.",
    time: '23h ago',
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '7',
    name: 'come to mummy',
    avatar: 'https://picsum.photos/seed/mummy/200',
    lastMessage: 'We are friends',
    time: '23h ago',
    unreadCount: 1,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '8',
    name: 'ℳ a𝓎ℒℯ',
    avatar: 'https://picsum.photos/seed/mayle/200',
    lastMessage: 'we gotta talk',
    time: '23h ago',
    isLive: true,
    heartCount: 50,
    badges: [
      { type: 'icon', value: 'coin' },
      { type: 'level', value: 51, color: 'from-purple-500 to-indigo-500' }
    ]
  }
];

const Badge = ({ badge }: { badge: MessageItem['badges'][0] }) => {
  if (badge.type === 'verified') {
    return (
      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center ml-1">
        <span className="text-[10px] font-bold text-white italic">V</span>
      </div>
    );
  }
  if (badge.type === 'gender') {
    return (
      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center ml-1", badge.color)}>
        <span className="text-[8px] text-white">{badge.value === 'male' ? '♂' : '♀'}</span>
      </div>
    );
  }
  if (badge.type === 'level') {
    return (
      <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ml-1 bg-gradient-to-r shadow-sm", badge.color)}>
        <div className="w-2 h-2 bg-white/20 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
        <span className="text-[9px] font-bold text-white">{badge.value}</span>
      </div>
    );
  }
  if (badge.type === 'icon' && badge.value === 'coin') {
    return (
      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ml-1 bg-orange-500/20 border border-orange-500/30">
        <div className="w-2 h-2 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-[6px] text-white font-bold">C</span>
        </div>
        <span className="text-[9px] font-bold text-orange-500">25</span>
      </div>
    );
  }
  return null;
};

export default function MessagesPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white select-none overflow-hidden">
      {/* Header */}
      <header className="flex-none px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-gray-400">Realmatch</span>
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1" />
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="w-4 h-0.5 bg-white rounded-full mt-0.5" />
        </div>

        <button className="p-1">
          <Menu size={24} />
        </button>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className="flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors cursor-pointer"
            onClick={() => msg.isLive && navigate(`/room/${msg.id}`)}
          >
            {/* Avatar Section */}
            <div className="relative shrink-0">
              {msg.avatar ? (
                <div className={cn(
                  "w-14 h-14 rounded-full overflow-hidden border-2 border-transparent",
                  msg.isLive && "border-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.3)]"
                )}>
                  <img 
                    src={msg.avatar} 
                    alt={msg.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-teal-800 flex items-center justify-center text-xl font-bold">
                  {msg.name.charAt(0)}
                </div>
              )}

              {/* Notification Badge */}
              {msg.unreadCount && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
                  <span className="text-[10px] font-bold text-white">{msg.unreadCount}</span>
                </div>
              )}

              {/* Live Signal Icon */}
              {msg.isLive && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00f2ff] rounded-full flex items-center justify-center border-2 border-[#121212]">
                  <Signal size={10} className="text-black" />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="text-base font-bold truncate max-w-[150px]">{msg.name}</h3>
                <div className="flex items-center">
                  {msg.badges?.map((badge, idx) => (
                    <Badge key={idx} badge={badge} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{msg.lastMessage}</p>
            </div>

            {/* Right Side Section */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[11px] text-gray-600">{msg.time}</span>
              {msg.heartCount && (
                <div className="flex items-center gap-0.5 bg-pink-500/10 px-1.5 py-0.5 rounded-full border border-pink-500/20">
                  <Heart size={8} className="text-pink-500 fill-pink-500" />
                  <span className="text-[10px] font-bold text-pink-500">{msg.heartCount}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation (Placeholder, should be shared) */}
      <footer className="flex-none bg-[#1a1a1a] border-t border-white/5 px-4 py-2 flex items-center justify-between">
        <div className="flex flex-col items-center gap-1 opacity-50" onClick={() => navigate('/')}>
          <Video size={24} />
          <span className="text-[10px]">Live</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50">
          <Users size={24} />
          <span className="text-[10px]">Party</span>
        </div>
        <div className="relative -mt-8">
          <div className="w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-400/20">
            <Video size={28} className="text-black" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-white relative">
          <div className="relative">
            <MessageCircle size={24} className="fill-white" />
            <div className="absolute -top-2 -right-3 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#1a1a1a]">
              24
            </div>
          </div>
          <span className="text-[10px] font-bold">Chats</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="relative">
            <User size={24} />
            <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-[#1a1a1a]" />
          </div>
          <span className="text-[10px]">Me</span>
        </div>
      </footer>
    </div>
  );
}
