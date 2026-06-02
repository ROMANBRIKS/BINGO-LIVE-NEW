import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Heart, Signal, Shield, Star, Lock, Globe, Calendar, Megaphone, Bell, Video, VolumeX, X, Home as HomeIcon, Trophy, Users, Flame, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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
    name: 'BINGO Official',
    avatar: 'https://picsum.photos/seed/bingo/200',
    lastMessage: 'Messages from BINGO Live Official',
    time: '',
    unreadCount: 5,
    isOnline: true,
    badges: [{ type: 'verified', value: 'V' }]
  },
  {
    id: '2',
    name: '👄BratzDollz💋',
    avatar: 'https://picsum.photos/seed/bratz/200',
    lastMessage: 'We are friends',
    time: '4h ago',
    unreadCount: 1,
    isOnline: true,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }, { type: 'level', value: 22, color: 'from-pink-500 to-purple-500' }]
  },
  {
    id: '3',
    name: 'Austin 🦂',
    avatar: 'https://picsum.photos/seed/austin/200',
    lastMessage: 'I know this may come across lik...',
    time: '9h ago',
    isOnline: false,
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
    isOnline: true,
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
    isOnline: true,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '6',
    name: 'Oyediran Bose',
    avatar: '',
    lastMessage: "I'm in Nigeria, Osun.",
    time: '23h ago',
    isOnline: false,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '7',
    name: 'come to mummy',
    avatar: 'https://picsum.photos/seed/mummy/200',
    lastMessage: 'We are friends',
    time: '23h ago',
    unreadCount: 1,
    isOnline: true,
    badges: [{ type: 'gender', value: 'female', color: 'bg-pink-500' }]
  },
  {
    id: '8',
    name: 'ℳ a𝓎ℒℯ',
    avatar: 'https://picsum.photos/seed/mayle/200',
    lastMessage: 'we gotta talk',
    time: '23h ago',
    isLive: true,
    isOnline: true,
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
      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center ml-1 font-sans">
        <span className="text-[10px] font-bold text-white italic">V</span>
      </div>
    );
  }
  if (badge.type === 'gender') {
    return (
      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center ml-1", badge.color)}>
        <span className="text-[8px] text-white leading-none">{badge.value === 'male' ? '♂' : '♀'}</span>
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

export default function ChatsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Tab control inside private communications dashboard
  const [inboxTab, setInboxTab] = useState<'chats' | 'agency'>('chats');
  const [agencyNotices, setAgencyNotices] = useState<any[]>([]);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);

  useEffect(() => {
    const agencyId = profile?.role === 'agency' ? profile?.uid : profile?.agencyId;
    if (!agencyId) return;

    const noticesQuery = query(collection(db, 'agency_notices'), where('agencyId', '==', agencyId));
    const unsub = onSnapshot(noticesQuery, (snap) => {
      const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort newest notices first
      loaded.sort((a: any, b: any) => {
        const aSec = a.createdAt?.seconds || 0;
        const bSec = b.createdAt?.seconds || 0;
        return bSec - aSec;
      });
      setAgencyNotices(loaded);
    }, (err) => {
      console.warn("Notices load warning on inbox hub:", err);
    });

    return () => unsub();
  }, [profile?.agencyId, profile?.role, profile?.uid]);

  const handleAvatarClick = (e: React.MouseEvent, msg: MessageItem) => {
    e.stopPropagation();
    if (msg.isLive) {
      navigate(`/room/${msg.id}`);
    } else {
      navigate(`/profile/${msg.id}`);
    }
  };

  const handleRowClick = (msg: MessageItem) => {
    navigate(`/chats/${msg.id}`);
  };

  const currentAgencyId = profile?.role === 'agency' ? profile?.uid : profile?.agencyId;

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none text-left">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase">BINGO LIVE</h1>
          <button 
            onClick={() => setShowSidebarDrawer(true)}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-8 px-4 pb-1">
          <button 
            onClick={() => navigate('/chats')}
            className="flex flex-col items-center cursor-pointer text-left"
          >
            <span className="text-xs font-bold text-white/40 hover:text-white transition-colors">Realmatch</span>
          </button>
          <div className="flex flex-col items-center cursor-pointer relative">
            <span className="text-xs font-bold text-white">Messages</span>
            {agencyNotices.length > 0 && inboxTab !== 'agency' && (
              <div className="absolute -top-1 -right-2 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
            )}
            <div className="w-full h-0.5 bg-white rounded-full mt-1" />
          </div>
        </div>

        {/* Tab selector to keep corporate communications separated */}
        <div className="flex bg-[#161616] border-t border-white/5">
          <button
            onClick={() => setInboxTab('chats')}
            className={cn(
              "flex-1 py-3 text-center text-xs font-black uppercase tracking-widest border-b-2 transition-all",
              inboxTab === 'chats' ? "border-[#00f2ff] text-[#00f2ff]" : "border-transparent text-white/40 hover:text-white"
            )}
          >
            Direct Chats 💬
          </button>
          <button
            onClick={() => setInboxTab('agency')}
            className={cn(
              "flex-1 py-3 text-center text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-1.5",
              inboxTab === 'agency' ? "border-rose-500 text-rose-400" : "border-transparent text-white/40 hover:text-white"
            )}
          >
            Agency Board 🛡️
            {agencyNotices.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase border border-rose-500/15">
                {agencyNotices.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content viewport */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {inboxTab === 'chats' ? (
          <div>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className="flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
                onClick={() => handleRowClick(msg)}
              >
                {/* Avatar Section */}
                <div 
                  className="relative shrink-0"
                  onClick={(e) => handleAvatarClick(e, msg)}
                >
                  {msg.avatar ? (
                    <div className={cn(
                      "w-12 h-12 rounded-full overflow-hidden border-2 border-transparent",
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
                    <div className="w-12 h-12 rounded-full bg-teal-800 flex items-center justify-center text-lg font-bold">
                      {msg.name.charAt(0)}
                    </div>
                  )}

                  {/* Notification Badge */}
                  {msg.unreadCount && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
                      <span className="text-[10px] font-bold text-white">{msg.unreadCount}</span>
                    </div>
                  )}

                  {/* Online Dot */}
                  {msg.isOnline && !msg.isLive && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212]" />
                  )}

                  {/* Live Signal Icon */}
                  {msg.isLive && (
                    <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#00f2ff] rounded-full flex items-center justify-center border-2 border-[#121212]">
                      <Signal size={9} className="text-black" />
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center">
                    <h3 className="text-sm font-bold truncate max-w-[150px] text-zinc-100">{msg.name}</h3>
                    <div className="flex items-center">
                      {msg.badges?.map((badge, idx) => (
                        <Badge key={idx} badge={badge} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{msg.lastMessage}</p>
                </div>

                {/* Right Side Section */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-gray-600">{msg.time}</span>
                  {msg.heartCount && (
                    <div className="flex items-center gap-0.5 bg-pink-500/10 px-1.5 py-0.5 rounded-full border border-pink-500/20">
                      <Heart size={8} className="text-pink-500 fill-pink-500" />
                      <span className="text-[9px] font-bold text-pink-500">{msg.heartCount}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* AGENCY EXCLUSIVE BULLETIN BOARD */
          <div className="p-4 space-y-4">
            {!currentAgencyId ? (
              <div className="p-8 text-center bg-white/5 border border-white/5 rounded-3xl space-y-2">
                <Shield size={32} className="mx-auto text-white/20" />
                <h4 className="text-xs font-black uppercase text-zinc-400">Not Subscribed to any Agency</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Only verified agency streamers receive corporate announcements, live board meetings, and official agendas.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/creator-center')}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Manage Agency in Creator Center
                  </button>
                </div>
              </div>
            ) : agencyNotices.length === 0 ? (
              <div className="p-12 text-center bg-white/5 border border-white/5 rounded-3xl space-y-2">
                <Bell size={28} className="mx-auto text-rose-500/40 animate-bounce" />
                <h4 className="text-xs font-black uppercase text-white/40">Clean Slate</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  There are no official messages or spaces scheduled right now. Check back later!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black uppercase text-rose-400 tracking-wider">🔒 Corporate Directives ({agencyNotices.length})</span>
                  <span className="text-[8px] bg-rose-500/15 border border-rose-500/20 px-2 py-0.5 text-rose-400 uppercase font-bold rounded-full">Secure Inbox</span>
                </div>

                {agencyNotices.map((notice) => {
                  const isLiveSpace = notice.type === 'instant';
                  return (
                    <div 
                      key={notice.id} 
                      className={cn(
                        "p-4 bg-white/5 border rounded-3xl text-left space-y-3 relative overflow-hidden transition-all",
                        isLiveSpace ? "border-rose-500/30 bg-rose-950/5 shadow-lg shadow-rose-950/10" : "border-white/10"
                      )}
                    >
                      {/* Background branding flair */}
                      <div className="absolute right-0 top-0 opacity-[0.03] rotate-12 pointer-events-none">
                        <Shield size={100} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={notice.creatorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notice.creatorUid}`} 
                            className="w-8 h-8 rounded-full border border-white/10 object-cover" 
                            alt="director"
                          />
                          <div>
                            <div className="text-xs font-extrabold text-neutral-200 flex items-center gap-1">
                              {notice.creatorName}
                              <span className="text-[8px] text-rose-400 font-extrabold tracking-widest font-sans">[DIRECTOR]</span>
                            </div>
                            <span className="text-[8.5px] uppercase font-bold text-white/40 leading-none">
                              {notice.agencyName}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isLiveSpace ? (
                            <span className="px-2 py-0.5 text-[8.5px] font-black uppercase text-rose-400 bg-rose-950/30 border border-rose-500/20 rounded animate-pulse">
                              LIVE MEETING 🎙️
                            </span>
                          ) : notice.type === 'scheduled' ? (
                            <span className="px-2 py-0.5 text-[8.5px] font-black uppercase text-amber-400 bg-amber-950/20 border border-amber-500/15 rounded">
                              SHEDULED MEETING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8.5px] font-black uppercase text-zinc-400 bg-neutral-900 border border-white/5 rounded">
                              MEMO NOTICE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-white px-0.5 uppercase tracking-wide leading-tight">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-neutral-300 leading-normal font-sans font-medium">
                          {notice.content}
                        </p>
                      </div>

                      {notice.privacy === 'private' && (
                        <div className="p-2 bg-black/40 rounded-2xl flex items-center justify-between border border-white/5 text-[9.5px]">
                          <span className="font-extrabold text-[#00f2ff]/30 uppercase tracking-widest text-[8px]">🔐 CLOSED GATED PASSCODE</span>
                          <span className="font-mono font-black text-[#00f2ff] tracking-[0.2em]">{notice.passcode || '1234'}</span>
                        </div>
                      )}

                      {notice.type === 'scheduled' && notice.scheduledAt && (
                        <div className="p-2 bg-black/40 rounded-2xl flex items-center justify-between border border-white/5 text-[9.5px]">
                          <span className="font-extrabold text-amber-500/30 uppercase tracking-widest text-[8px]">⏰ CALENDAR TIME</span>
                          <span className="font-mono font-black text-amber-400">{notice.scheduledAt.replace('T', ' ')}</span>
                        </div>
                      )}

                      {/* Direct meeting space call CTA link to jump standard broadcaster center */}
                      {isLiveSpace && (
                        <button
                          onClick={() => navigate(`/room/${notice.creatorUid}`)}
                          className="w-full py-2.5 bg-rose-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-1 shadow-lg shadow-rose-500/10 active:scale-[0.99] transition-transform animate-bounce"
                        >
                          <Video size={13} />
                          Join Live Agency Space Now ➔
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sliding Mobile Sidebar Drawer */}
      {showSidebarDrawer && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity"
            onClick={() => setShowSidebarDrawer(false)}
          />
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-[#1a1a1a] z-[101] shadow-2xl p-6 flex flex-col justify-between border-r border-white/10 text-left select-none"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center font-black text-xs text-white uppercase italic">
                    B
                  </div>
                  <span className="text-sm font-black text-white tracking-widest uppercase italic">BINGO LIVE</span>
                </div>
                <button 
                  onClick={() => setShowSidebarDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1">
                {[
                  { icon: HomeIcon, label: 'Live Streams', path: '/' },
                  { icon: Trophy, label: 'Top Leaders', path: '/leaderboard' },
                  { icon: Users, label: 'Following Feed', path: '/following' },
                  { icon: Star, label: 'VIP Services', path: '/vip' },
                  { icon: Flame, label: 'PK Matches', path: '/pk' },
                  { icon: TrendingUp, label: 'Hot Streams', path: '/hot' },
                ].map((item) => (
                  <button 
                    key={item.path}
                    onClick={() => {
                      setShowSidebarDrawer(false);
                      navigate(item.path);
                    }}
                    className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-wider"
                  >
                    <item.icon size={18} className="text-[#00f2ff]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Credits / Settings Redirect */}
            <div className="border-t border-white/5 pt-4 text-[9px] font-mono text-white/30 space-y-2">
              <p className="uppercase tracking-widest">Bingo Live Workspace Edition</p>
              <button 
                onClick={() => {
                  setShowSidebarDrawer(false);
                  navigate('/profile');
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-[10px] font-black uppercase text-white tracking-wider"
              >
                Go to Me Settings ➔
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
