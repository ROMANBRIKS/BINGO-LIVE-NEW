import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Settings, MessageSquare, Plus, Send, Users, Sparkles, Flame, Check, Globe, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface GroupChat {
  id: string;
  title: string;
  count: number;
  rank?: number;
  members: string[];
  isCreatedByUser?: boolean;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  avatar: string;
  time: string;
  isOwn?: boolean;
}

interface HotTakeDashboardProps {
  onBack: () => void;
}

export const HotTakeDashboard = ({ onBack }: HotTakeDashboardProps) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'hot' | 'my-groups'>('hot');
  const [activeGroup, setActiveGroup] = useState<GroupChat | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Group list matching screenshot and adding mock data
  const [groups, setGroups] = useState<GroupChat[]>([
    {
      id: 'world-cup',
      title: 'World Cup 2026',
      count: 1629,
      rank: 1,
      members: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'
      ]
    },
    {
      id: 'watch-matches',
      title: 'Watch Matches Together',
      count: 624,
      rank: 2,
      members: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100'
      ]
    },
    {
      id: 'daily-chat',
      title: 'Daily Chat',
      count: 606,
      rank: 3,
      members: [
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      ]
    },
    {
      id: 'south-africa',
      title: 'South Africa Fans',
      count: 410,
      rank: 4,
      members: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      ]
    },
    {
      id: 'argentina',
      title: 'Argentina Fans',
      count: 359,
      rank: 5,
      members: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
      ]
    },
    {
      id: 'spain',
      title: 'Spain Fans',
      count: 451,
      rank: 6,
      members: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100'
      ]
    },
    {
      id: 'portugal',
      title: 'Portugal Fans',
      count: 429,
      rank: 7,
      members: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      ]
    }
  ]);

  // Sample bots data to simulate lively chat discussion
  const mockChatUsers = [
    { name: 'GamerKid 🎮', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80' },
    { name: 'Zoe ✨', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80' },
    { name: 'BossMan 💼', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80' },
    { name: 'Goddess 🌹', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80' },
    { name: 'StarGazer 💫', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80' },
  ];

  const mockReplies = [
    "Yes, absolutely agreed! Who is streaming this live?",
    "OMG I didn't see that coming! 😮🔥",
    "Let's support our local team, let's go guys!",
    "Can anyone send a gift? Let's drop some support!",
    "Hahaha that is hilarious 😂",
    "Drop your predictions below, who is winning?",
    "Sending positive energy to everyone in this group chat!"
  ];

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeGroup]);

  // Handle Join or Open Group Chat
  const handleOpenGroup = (group: GroupChat) => {
    setActiveGroup(group);
    
    // Seed messages if none exist
    if (!messages[group.id]) {
      setMessages(prev => ({
        ...prev,
        [group.id]: [
          {
            id: 'init-1',
            sender: 'GamerKid 🎮',
            text: `Welcome to the ${group.title} discussion! Let's keep the energy high! 🔥🗣️`,
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80',
            time: '12:05'
          },
          {
            id: 'init-2',
            sender: 'Zoe ✨',
            text: `Who is watching the live matches today? So excited!`,
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
            time: '12:06'
          }
        ]
      }));
    }
  };

  // Send Message with Auto simulated replies
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeGroup) return;
    
    const groupId = activeGroup.id;
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: profile?.displayName || 'Anonymous User',
      text: inputMessage.trim(),
      avatar: profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), userMessage]
    }));
    setInputMessage('');

    // Simulate auto-replies in 1.5 seconds to make the group feel fully interactive
    setTimeout(() => {
      const randomUser = mockChatUsers[Math.floor(Math.random() * mockChatUsers.length)];
      const randomText = mockReplies[Math.floor(Math.random() * mockReplies.length)];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: randomUser.name,
        text: randomText,
        avatar: randomUser.avatar,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), botMessage]
      }));
    }, 1500);
  };

  // Handle Create Group Chat
  const handleCreateGroup = () => {
    if (!newGroupTitle.trim()) return;
    
    const id = `user-group-${Date.now()}`;
    const newGroup: GroupChat = {
      id,
      title: newGroupTitle.trim(),
      count: 1,
      members: [
        profile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
      ],
      isCreatedByUser: true
    };

    setGroups(prev => [newGroup, ...prev]);
    setNewGroupTitle('');
    setShowCreateModal(false);
    setActiveTab('my-groups');
    
    // Automatically open the newly created group chat
    handleOpenGroup(newGroup);
  };

  const filteredGroups = activeTab === 'hot' 
    ? groups.filter(g => !g.isCreatedByUser) 
    : groups.filter(g => g.isCreatedByUser || g.id === 'world-cup' || g.id === 'watch-matches');

  return (
    <div className="fixed inset-0 bg-[#12121e] z-[80] flex flex-col text-white font-sans overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {!activeGroup ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1 flex flex-col overflow-hidden h-full"
          >
            {/* Header */}
            <div className="flex-none p-4 flex items-center justify-between border-b border-white/5 bg-[#171725]/80 backdrop-blur-md">
              <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                <ChevronLeft size={24} />
              </button>
              <span className="font-extrabold text-sm uppercase tracking-widest text-zinc-100">Hot take 🔥</span>
              <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <Settings size={20} className="text-zinc-400 hover:text-white" />
              </button>
            </div>

            {/* Dynamic Banner matching Image 6 */}
            <div className="flex-none p-5 bg-gradient-to-br from-[#1c1c30] to-[#12121e] border-b border-white/5 flex items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#ffd166]/10 rounded-full blur-2xl" />
              <div className="text-left space-y-1 z-10">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-3xl font-black italic tracking-tighter text-[#ffd166] drop-shadow-[0_2px_10px_rgba(255,209,102,0.2)]">Hot take</h1>
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Join ongoing live hot topics & debates</p>
              </div>

              {/* Big Yellow Bubble Logo with '#' from Image 6 */}
              <div className="relative z-10">
                <div className="w-[84px] h-[78px] bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-[2rem] flex items-center justify-center shadow-[0_10px_25px_rgba(245,158,11,0.4)] border border-yellow-300/30 transform hover:scale-105 transition-transform">
                  <span className="text-white text-5xl font-black tracking-tighter font-mono italic">#</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#12121e] animate-ping" />
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex-none flex bg-[#161625] border-b border-white/5">
              {[
                { id: 'hot', label: 'Hot Topics 🔥' },
                { id: 'my-groups', label: 'My Groups 💬' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                    activeTab === tab.id ? "border-[#ffd166] text-[#ffd166]" : "border-transparent text-white/40 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Groups Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
              {/* Floating Create CTA */}
              <div className="flex justify-between items-center bg-[#17172c]/60 p-4 rounded-3xl border border-white/5 shadow-md">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#ffd166] block">Have a unique hot take?</span>
                  <p className="text-[9px] text-zinc-400 mt-0.5">Start your own custom labeled group chat box!</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus size={11} strokeWidth={4} /> Create Group
                </button>
              </div>

              {/* Group list matching Image 6 */}
              <div className="space-y-3">
                {filteredGroups.map((group) => (
                  <div 
                    key={group.id}
                    onClick={() => handleOpenGroup(group)}
                    className="p-4 bg-[#1b1b2f]/60 hover:bg-[#1b1b2f]/90 border border-white/5 rounded-3.5xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4 text-left">
                      {/* Ranked index from Image 6 */}
                      {group.rank && (
                        <span className={cn(
                          "w-5 font-black font-sans text-sm italic",
                          group.rank === 1 ? "text-red-500" :
                          group.rank === 2 ? "text-orange-400" :
                          group.rank === 3 ? "text-yellow-400" : "text-zinc-500"
                        )}>
                          {group.rank}
                        </span>
                      )}

                      {/* Collage Avatar Grid for Members */}
                      <div className="grid grid-cols-2 gap-0.5 w-[44px] h-[44px] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                        {group.members.slice(0, 4).map((mUrl, index) => (
                          <img 
                            key={index} 
                            src={mUrl} 
                            className="w-full h-full object-cover" 
                            alt="member"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>

                      {/* Group Meta Info */}
                      <div>
                        <h4 className="text-xs font-black text-zinc-100 flex items-center gap-1.5">
                          {group.title}
                          {group.isCreatedByUser && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[6.5px] uppercase font-black">Admin</span>
                          )}
                        </h4>
                        <span className="text-[10px] text-zinc-400 mt-0.5 block">
                          {group.count} people discussing...
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                        <MessageSquare size={14} />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredGroups.length === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <span className="text-2xl">💤</span>
                    <p className="text-xs text-zinc-500">No custom groups created yet. Create one now!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Active Group Chat Box Screen */
          <motion.div 
            key="chatbox"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 flex flex-col overflow-hidden h-full bg-[#0d0d14]"
          >
            {/* Group Header */}
            <div className="flex-none p-4 flex items-center justify-between border-b border-white/5 bg-[#171725]/90 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveGroup(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-left">
                  <span className="text-[8px] uppercase tracking-widest font-black text-[#ffd166] flex items-center gap-1 leading-none">
                    <Flame size={9} className="text-[#ffd166]" /> HOT TAKE DISCUSSION
                  </span>
                  <h3 className="text-xs font-black text-white leading-tight mt-0.5">{activeGroup.title}</h3>
                </div>
              </div>
              
              {/* Members horizontal collage indicator */}
              <div className="flex -space-x-2 overflow-hidden items-center">
                {activeGroup.members.slice(0, 3).map((m, i) => (
                  <img 
                    key={i} 
                    src={m} 
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0d0d14] object-cover" 
                    alt="m" 
                    referrerPolicy="no-referrer"
                  />
                ))}
                <span className="text-[8px] font-bold text-zinc-400 pl-2">+{activeGroup.count}</span>
              </div>
            </div>

            {/* Messages Scroll Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center py-2">
                <span className="px-3 py-1 bg-white/5 border border-white/[0.03] text-[8px] font-black uppercase text-zinc-500 tracking-wider rounded-full">
                  ⚠️ This is a public real-time debate forum
                </span>
              </div>

              {(messages[activeGroup.id] || []).map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2 text-left max-w-[85%]",
                    msg.isOwn ? "ml-auto flex-row-reverse text-right" : "mr-auto"
                  )}
                >
                  <img 
                    src={msg.avatar} 
                    className="w-8 h-8 rounded-full object-cover border border-white/10" 
                    alt="avatar"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    {!msg.isOwn && (
                      <span className="text-[9px] font-black text-cyan-400/90 block mb-0.5 pl-1">
                        {msg.sender}
                      </span>
                    )}
                    <div className={cn(
                      "p-3 rounded-2xl text-[11.5px] font-medium leading-relaxed break-words shadow-md",
                      msg.isOwn 
                        ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-black font-extrabold rounded-br-none" 
                        : "bg-[#181827] text-zinc-200 border border-white/5 rounded-bl-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[7.5px] font-mono text-zinc-600 block mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Footer */}
            <div className="flex-none bg-[#131320] border-t border-white/5 p-4 flex items-center gap-2">
              <input 
                type="text"
                placeholder="Type your hot take opinion... 💬"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center justify-center text-black font-black cursor-pointer transition-all shrink-0"
              >
                <Send size={16} className="fill-black ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Group Creation Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#171725] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Sparkles size={18} className="animate-pulse" />
                <span className="font-black text-xs uppercase tracking-wider">Start a New Hot Take</span>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Group Chat Title</label>
              <input 
                type="text"
                placeholder="e.g. Spain vs Portugal Debate 🔥"
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                maxLength={45}
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <p className="text-[8px] text-zinc-500">Must be a clear topic/title so other users can search and join easily.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-white/5 bg-transparent hover:bg-white/5 rounded-2xl text-[10px] uppercase font-black tracking-widest text-zinc-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup}
                disabled={!newGroupTitle.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 disabled:opacity-40 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-yellow-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Check size={12} strokeWidth={4} /> Create Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
