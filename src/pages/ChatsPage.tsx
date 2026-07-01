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
  const [inboxTab, setInboxTab] = useState<'chats' | 'family' | 'agency' | 'fans'>('chats');
  const [agencyNotices, setAgencyNotices] = useState<any[]>([]);
  const [spacesInvitations, setSpacesInvitations] = useState<any[]>([]);
  const [remindedIds, setRemindedIds] = useState<Record<string, boolean>>({});
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);

  useEffect(() => {
    const qInvitations = query(collection(db, 'spaces_invitations'));
    const unsub = onSnapshot(qInvitations, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpacesInvitations(docs);
    }, (err) => {
      console.warn("Could not load spaces invitations: ", err);
    });
    return () => unsub();
  }, []);

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
        <div className="flex bg-[#161616] border-t border-white/5 overflow-x-auto scrollbar-hide">
          {[
            { id: 'chats', label: 'Direct 💬', activeColor: 'border-[#00f2ff] text-[#00f2ff]' },
            { id: 'family', label: 'Family 🏠', activeColor: 'border-emerald-500 text-emerald-400' },
            { id: 'agency', label: 'Agency 🛡️', activeColor: 'border-rose-500 text-rose-400' },
            { id: 'fans', label: 'Fans 💖', activeColor: 'border-purple-500 text-purple-400' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInboxTab(tab.id as any)}
              className={cn(
                "flex-1 min-w-[80px] py-3 text-center text-[10px] font-black uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer",
                inboxTab === tab.id ? tab.activeColor : "border-transparent text-white/40 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content viewport */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {inboxTab === 'chats' ? (
          <div className="space-y-4">
            {/* Direct Spaces / Meetings Section */}
            {(() => {
              const directInvites = [
                ...spacesInvitations.filter(i => i.category === 'direct'),
                {
                  id: "default-inv-1",
                  senderName: "👄BratzDollz💋",
                  senderPhoto: "https://picsum.photos/seed/bratz/200",
                  title: "Chitchat with BratzDollz 💋 🎙️ (#GirlsTalk)",
                  category: "direct",
                  isScheduled: true,
                  scheduledTime: "Today @ 21:00",
                  meetingAccess: "private",
                  roomId: "bratz-private-meet",
                  status: "pending"
                }
              ];
              return directInvites.length > 0 && (
                <div className="px-4 pt-4 border-b border-white/5 pb-4 space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#00f2ff] tracking-widest block">🎙️ Direct Spaces & Meeting Invitations</span>
                  <div className="space-y-2.5">
                    {directInvites.map((invite: any) => {
                      const isReminded = remindedIds[invite.id];
                      const isLive = invite.status === 'live';
                      return (
                        <div 
                          key={invite.id} 
                          className={cn(
                            "p-3.5 rounded-2xl border transition-all relative overflow-hidden text-left",
                            isLive 
                              ? "bg-cyan-950/10 border-cyan-400/40 shadow-md shadow-cyan-950/20 animate-pulse-subtle" 
                              : "bg-[#18181f] border-zinc-800"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <img 
                                src={invite.senderPhoto || "https://picsum.photos/seed/avatar/150"} 
                                className="w-8 h-8 rounded-full border border-white/10 object-cover shrink-0" 
                                alt="host"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="text-[11px] font-black text-white flex items-center gap-1 leading-none">
                                  {invite.senderName}
                                  {isLive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />}
                                </span>
                                <span className="text-[7.5px] text-zinc-500 uppercase font-black leading-none">Spaces Participant</span>
                              </div>
                            </div>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                              isLive ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"
                            )}>
                              {isLive ? "LIVE" : "SCHEDULED"}
                            </span>
                          </div>

                          <div className="mt-2.5 space-y-2">
                            <p className="text-[11.5px] font-extrabold text-[#00f2ff]/90 leading-snug">{invite.title}</p>
                            
                            <div className="flex items-center justify-between text-[10px] bg-black/30 p-2 rounded-xl border border-white/5">
                              <span className="text-zinc-500 text-[8px] font-black uppercase tracking-wider">Planned Timing:</span>
                              <span className="font-mono text-cyan-400 font-extrabold">{invite.scheduledTime || 'Instant'}</span>
                            </div>
                          </div>

                          {/* CTAs */}
                          <div className="mt-3 flex items-center gap-2">
                            {!isLive ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRemindedIds(prev => ({ ...prev, [invite.id]: !isReminded }));
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border flex-1 text-center",
                                    isReminded 
                                      ? "bg-transparent text-green-400 border-green-500/30" 
                                      : "bg-cyan-400 text-black border-cyan-400 shadow-md"
                                  )}
                                >
                                  {isReminded ? "Reminded ✓" : "Remind Me 🔔"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSpacesInvitations(prev => 
                                      prev.map(i => i.id === invite.id ? { ...i, status: 'live' } : i)
                                    );
                                    // if static, force status to live locally
                                    if (invite.id.startsWith("default-")) {
                                      invite.status = 'live';
                                      // Trigger re-render by bumping state
                                      setRemindedIds(prev => ({ ...prev }));
                                    }
                                  }}
                                  className="px-2.5 py-1.5 border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-center"
                                >
                                  Start Early
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => navigate(`/room/${invite.roomId}?from=spaces`)}
                                className="w-full py-2 bg-[#00f2ff] hover:bg-cyan-300 text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-1 shadow-lg active:scale-[0.99] transition-all animate-bounce"
                              >
                                Join Live Talk Now 🎙️➔
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* General Chats List */}
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
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.lastMessage}</p>
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
          </div>
        ) : inboxTab === 'family' ? (
          /* FAMILY EXCLUSIVE COMMUNICATIONS PANEL */
          <div className="p-4 space-y-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <HomeIcon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Golden Family Circle</h4>
                  <p className="text-[8px] text-zinc-500">Coordinate and support your inner streaming household</p>
                </div>
              </div>
              
              {/* Family Memos Block */}
              <div className="p-2.5 bg-black/45 rounded-xl border border-white/5 space-y-1 text-[9.5px]">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-zinc-400">👑 Family Leader:</span>
                  <span className="text-amber-400 font-mono">Family.Boss</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Daily Gifting Points:</span>
                  <span className="text-zinc-300 font-bold">489,500</span>
                </div>
                <p className="text-[8px] text-emerald-400/80 italic mt-1 leading-snug">
                  "Notice: Sunday streak review is mandatory for all co-hosts!"
                </p>
              </div>
            </div>

            {/* Family Spaces List */}
            {(() => {
              const familyInvites = [
                ...spacesInvitations.filter(i => i.category === 'family'),
                {
                  id: "default-inv-2",
                  senderName: "Family Boss",
                  senderPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                  title: "Sunday Family Gist & Daily Streaks 🏠 🎙️ (#Family)",
                  category: "family",
                  isScheduled: true,
                  scheduledTime: "Tomorrow @ 15:30",
                  meetingAccess: "public",
                  roomId: "family-boss-meet",
                  status: "pending"
                }
              ];
              return (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">🎙️ Family Voice Rooms ({familyInvites.length})</span>
                  </div>

                  {familyInvites.map((invite: any) => {
                    const isReminded = remindedIds[invite.id];
                    const isLive = invite.status === 'live';
                    return (
                      <div 
                        key={invite.id} 
                        className={cn(
                          "p-3.5 rounded-2xl border transition-all relative overflow-hidden text-left",
                          isLive 
                            ? "bg-emerald-950/10 border-emerald-400/40 shadow-inner" 
                            : "bg-[#141816]/70 border-zinc-800"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <img src={invite.senderPhoto} className="w-8 h-8 rounded-full object-cover border border-[#22c55e]/20" alt="avatar" />
                            <div>
                              <div className="text-[10px] font-black text-neutral-100 flex items-center gap-1.5 leading-none">
                                {invite.senderName}
                                {isLive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />}
                              </div>
                              <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-bold">Family Household</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                            isLive ? "bg-green-500/10 text-green-400 animate-pulse" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {isLive ? "LIVE" : "PENDING"}
                          </span>
                        </div>

                        <p className="text-[11.5px] font-extrabold text-emerald-400/90 mt-2 leading-snug">{invite.title}</p>
                        
                        <div className="flex items-center justify-between text-[10px] bg-black/45 p-2 rounded-xl mt-2 border border-white/5">
                          <span className="text-zinc-500 text-[8px] font-mono font-black uppercase">Schedule Hour:</span>
                          <span className="font-mono text-emerald-400 font-extrabold">{invite.scheduledTime}</span>
                        </div>

                        <div className="mt-3.5 flex gap-2">
                          {!isLive ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setRemindedIds(prev => ({ ...prev, [invite.id]: !isReminded }))}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border flex-1 text-center",
                                  isReminded 
                                    ? "bg-transparent text-green-400 border-green-500/35" 
                                    : "bg-emerald-500 text-black border-emerald-500"
                                )}
                              >
                                {isReminded ? "Reminded ✓" : "Remind Me 🔔"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSpacesInvitations(prev => 
                                    prev.map(i => i.id === invite.id ? { ...i, status: 'live' } : i)
                                  );
                                  if (invite.id.startsWith("default-")) {
                                    invite.status = 'live';
                                    setRemindedIds(prev => ({ ...prev }));
                                  }
                                }}
                                className="px-2.5 py-1.5 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-center"
                              >
                                Start Early
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => navigate(`/room/${invite.roomId}?from=spaces`)}
                              className="w-full py-2 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                              Join Family Parlor Now ➔
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : inboxTab === 'agency' ? (
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
            ) : (
              <div className="space-y-4">
                {/* Agency Scheduled voice rooms */}
                {(() => {
                  const agencyInvites = [
                    ...spacesInvitations.filter(i => i.category === 'agency'),
                    {
                      id: "default-inv-3",
                      senderName: "Director Stella",
                      senderPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
                      title: "Official Agency Target Planning 🎖️ 🎙️ (#CoreBriefing)",
                      category: "agency",
                      isScheduled: false,
                      scheduledTime: "Live Now",
                      meetingAccess: "private",
                      roomId: "agency-live-stellar",
                      status: "live"
                    }
                  ];
                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">🎙️ Agency Strategic Meetings ({agencyInvites.length})</span>
                      </div>

                      {agencyInvites.map((invite: any) => {
                        const isReminded = remindedIds[invite.id];
                        const isLive = invite.status === 'live';
                        return (
                          <div 
                            key={invite.id} 
                            className={cn(
                              "p-3.5 rounded-2xl border transition-all relative overflow-hidden text-left",
                              isLive 
                                ? "bg-rose-950/10 border-rose-500/40 shadow-inner" 
                                : "bg-[#1c1414]/70 border-zinc-850"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <img src={invite.senderPhoto} className="w-8 h-8 rounded-full object-cover border border-rose-500/25" alt="host" />
                                <div>
                                  <div className="text-[10px] font-black text-neutral-100 flex items-center gap-1 leading-none">
                                    {invite.senderName}
                                    {isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                                  </div>
                                  <span className="text-[6.5px] font-mono text-rose-400 uppercase tracking-widest leading-none font-bold">Agency Owner</span>
                                </div>
                              </div>
                              <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                isLive ? "bg-rose-500/10 text-rose-400" : "bg-zinc-800 text-zinc-400"
                              )}>
                                {isLive ? "LIVE" : "PENDING"}
                              </span>
                            </div>

                            <p className="text-[11.5px] font-black text-rose-400/90 mt-2 leading-snug">{invite.title}</p>
                            
                            <div className="flex items-center justify-between text-[10px] bg-black/45 p-2 rounded-xl mt-2 border border-white/5">
                              <span className="text-zinc-500 text-[8px] font-mono font-black uppercase">Meeting Hour:</span>
                              <span className="font-mono text-rose-400 font-extrabold">{invite.scheduledTime}</span>
                            </div>

                            <div className="mt-3 flex gap-2">
                              {!isLive ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setRemindedIds(prev => ({ ...prev, [invite.id]: !isReminded }))}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border flex-1 text-center",
                                      isReminded 
                                        ? "bg-transparent text-green-400 border-green-500/35" 
                                        : "bg-rose-500 text-black border-rose-500"
                                    )}
                                  >
                                    {isReminded ? "Reminded ✓" : "Remind Me 🔔"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSpacesInvitations(prev => 
                                        prev.map(i => i.id === invite.id ? { ...i, status: 'live' } : i)
                                      );
                                      if (invite.id.startsWith("default-")) {
                                        invite.status = 'live';
                                        setRemindedIds(prev => ({ ...prev }));
                                      }
                                    }}
                                    className="px-2.5 py-1.5 border border-rose-500/20 text-rose-450 hover:bg-rose-500/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-center"
                                  >
                                    Start Early
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => navigate(`/room/${invite.roomId}?from=spaces`)}
                                  className="w-full py-2 bg-rose-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                >
                                  Join Agency Meeting Space Now ➔
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Legacy notice list */}
                <div className="flex items-center justify-between border-b border-white/5 pb-1 mt-4">
                  <span className="text-[10px] font-black uppercase text-[#00f2ff] tracking-wider">🔒 Corporate Bulletin Archive ({agencyNotices.length})</span>
                </div>

                {agencyNotices.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 border border-white/5 rounded-3xl space-y-1">
                    <Bell size={20} className="mx-auto text-rose-500/30" />
                    <h4 className="text-[10px] font-black uppercase text-white/40">No corporate notices</h4>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                                <span className="px-2 py-0.5 text-[8.5px] font-black uppercase text-amber-400 bg-amber-955/20 border border-amber-500/15 rounded">
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
        ) : (
          /* FANS EXCLUSIVE LOUNGE PANEL */
          <div className="p-4 space-y-4">
            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-3xl space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 rounded-xl text-purple-400">
                  <Heart size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Fans Club Core</h4>
                  <p className="text-[8px] text-zinc-500 font-bold">Review warm support letters and host interactive spaces</p>
                </div>
              </div>

              {/* Static fan board details */}
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1 text-[9.5px]">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Total Active Supporters:</span>
                  <span className="text-purple-400 font-mono font-black">24,800 Users</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Stars Contributed:</span>
                  <span className="text-amber-400 font-black">Lv.4 Diamond Club ✨</span>
                </div>
              </div>
            </div>

            {/* Fan Invitations Cards List */}
            {(() => {
              const fanInvites = [
                ...spacesInvitations.filter(i => i.category === 'fans'),
                {
                  id: "default-inv-4",
                  senderName: "Fanatic88",
                  senderPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
                  title: "Lighter Fans Monthly Appreciation 💖 🎙️ (#FansClub)",
                  category: "fans",
                  isScheduled: true,
                  scheduledTime: "Today @ 18:00",
                  meetingAccess: "public",
                  roomId: "fans-live-meet-today",
                  status: "pending"
                }
              ];
              return (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase text-purple-450 tracking-wider">🎙️ Interactive Fans Spaces ({fanInvites.length})</span>
                  </div>

                  {fanInvites.map((invite: any) => {
                    const isReminded = remindedIds[invite.id];
                    const isLive = invite.status === 'live';
                    return (
                      <div 
                        key={invite.id} 
                        className={cn(
                          "p-4 rounded-2xl border transition-all relative overflow-hidden text-left",
                          isLive 
                            ? "bg-purple-950/10 border-purple-500/40 shadow-inner animate-pulse-subtle" 
                            : "bg-[#18141c]/70 border-zinc-850"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <img src={invite.senderPhoto} className="w-8 h-8 rounded-full object-cover border border-purple-500/25 animate-pulse" alt="host" />
                            <div>
                              <div className="text-[10px] font-bold text-neutral-100 flex items-center gap-1 leading-none">
                                {invite.senderName}
                                {isLive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />}
                              </div>
                              <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-black block">Star Supporter</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                            isLive ? "bg-purple-500/10 text-purple-400" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {isLive ? "LIVE" : "PENDING"}
                          </span>
                        </div>

                        <p className="text-[11.5px] font-black text-purple-400/90 mt-2 leading-snug">{invite.title}</p>
                        
                        <div className="flex items-center justify-between text-[10px] bg-black/45 p-2 rounded-xl mt-2 border border-white/5">
                          <span className="text-zinc-500 text-[8px] font-mono font-black uppercase">Schedule Hour:</span>
                          <span className="font-mono text-purple-400 font-extrabold">{invite.scheduledTime}</span>
                        </div>

                        <div className="mt-3 flex gap-2">
                          {!isLive ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setRemindedIds(prev => ({ ...prev, [invite.id]: !isReminded }))}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border flex-1 text-center font-bold",
                                  isReminded 
                                    ? "bg-transparent text-green-400 border-green-500/35" 
                                    : "bg-purple-500 text-black border-purple-500"
                                )}
                              >
                                {isReminded ? "Reminded ✓" : "Remind Me 🔔"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSpacesInvitations(prev => 
                                    prev.map(i => i.id === invite.id ? { ...i, status: 'live' } : i)
                                  );
                                  if (invite.id.startsWith("default-")) {
                                    invite.status = 'live';
                                    setRemindedIds(prev => ({ ...prev }));
                                  }
                                }}
                                className="px-2.5 py-1.5 border border-purple-500/20 text-purple-400 hover:bg-purple-500/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-center"
                              >
                                Start Early
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => navigate(`/room/${invite.roomId}?from=spaces`)}
                              className="w-full py-2 bg-purple-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform font-bold"
                            >
                              Join Fans Lounge Space Now ➔
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Fan Messages Feed */}
            <div className="space-y-1 block mt-4 border-t border-white/5 pt-3">
              <span className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest block pb-1 text-left">✉️ Fan Support Mails</span>
              {[
                { name: "Fanatic88", text: "Can't wait for your next PK! You're going to win! ⚔️🔥", time: "12m ago" },
                { name: "ActiveStalker", text: "I bought 50 coins today to drop gifts on you! 💎💎", time: "1h ago" },
                { name: "SuperLighter", text: "Your acoustic jam session yesterday was the absolute best! 🎸💤", time: "5h ago" }
              ].map((mail, i) => (
                <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-left">
                  <div>
                    <span className="font-extrabold text-[10px] text-zinc-350 block leading-none">{mail.name}</span>
                    <p className="text-[11px] text-zinc-400 mt-1 font-sans">{mail.text}</p>
                  </div>
                  <span className="text-[7.5px] font-mono font-medium text-zinc-600 shrink-0">{mail.time}</span>
                </div>
              ))}
            </div>
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
