import React, { useState, useEffect } from 'react';
import { 
  Mic, Users, Radio, Signal, Plus, Search, X, 
  ChevronRight, Sparkles, Volume2, Globe, Heart, Shield, Landmark, Play, Calendar,
  Check, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface SpacesTabContentProps {
  isLight: boolean;
  profile: UserProfile | null;
  onShowProfile: (uid: string) => void;
  navigate: (path: string) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  firebaseRooms: Room[];
  setActiveTab?: (tab: string) => void;
}

export interface SimulatedSpace {
  id: string;
  title: string;
  hostName: string;
  hostPhotoURL: string;
  hostLevel: number;
  category: string;
  activeSpeakers: string[]; // names
  viewerCount: number;
  likes: number;
  topicTag: string;
  speakingUid: string;
}

export const INITIAL_SIMULATED_SPACES: SimulatedSpace[] = [
  {
    id: 'sim-space-1',
    title: 'Talking Tech, AI & Startup Culture 🌍🤖',
    hostName: 'Agency.Boss',
    hostPhotoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150',
    hostLevel: 60,
    category: 'Tech Gist',
    activeSpeakers: ['Agency.Boss', 'DinoFan', 'AlphaCoder'],
    viewerCount: 421,
    likes: 1890,
    topicTag: '#TechGist',
    speakingUid: 'host_agency'
  },
  {
    id: 'sim-space-2',
    title: 'Late Night Chill & Acoustic Jams 🎸💤',
    hostName: 'Aria.Vocalist',
    hostPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
    hostLevel: 48,
    category: 'Music Live',
    activeSpeakers: ['Aria.Vocalist', 'GuitarGamer', 'SweetSoprano'],
    viewerCount: 310,
    likes: 840,
    topicTag: '#CozyAcoustic',
    speakingUid: 'host_aria_us'
  },
  {
    id: 'sim-space-3',
    title: 'Weekly Dating Matchmaking Show ❤️ Get Connected!',
    hostName: 'Dating.King',
    hostPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    hostLevel: 42,
    category: 'Dating Match',
    activeSpeakers: ['Dating.King', 'SingleLady_NG', 'PrinceCharming'],
    viewerCount: 512,
    likes: 2400,
    topicTag: '#Relationship',
    speakingUid: 'host_dating'
  },
  {
    id: 'sim-space-4',
    title: 'Bigo verified Creator Gist & Target Hunt 🎯',
    hostName: 'Ada Bekee.',
    hostPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=350',
    hostLevel: 55,
    category: 'Creator Lounge',
    activeSpeakers: ['Ada Bekee.', 'Target.Hunter', 'Boss_Man_VIP'],
    viewerCount: 885,
    likes: 12500,
    topicTag: '#VoiceChat',
    speakingUid: 'host_adabekee'
  },
  {
    id: 'sim-space-5',
    title: 'Gamer Connect! Esports Talk & Tournaments 🎮🏆',
    hostName: 'DJ.Leo.Vibes',
    hostPhotoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300',
    hostLevel: 39,
    category: 'Gaming',
    activeSpeakers: ['DJ.Leo.Vibes', 'ClashMaster', 'NoobWhale'],
    viewerCount: 198,
    likes: 620,
    topicTag: '#GamingLife',
    speakingUid: 'host_neon_dj_leo'
  }
];

export const TARGETED_PEOPLE = {
  agency: [
    { uid: 'ag-1', name: 'Director Stella', level: 95, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', online: true },
    { uid: 'ag-2', name: 'Kyle (VIP Talent)', level: 78, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', online: true },
    { uid: 'ag-3', name: 'Official Host Mel', level: 62, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', online: false },
    { uid: 'ag-4', name: 'Talent Manager Sophie', level: 50, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', online: true },
    { uid: 'ag-5', name: 'Creator Ada Bekee', level: 55, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', online: true }
  ],
  friends: [
    { uid: 'fr-1', name: 'BratzDollz 💋', level: 22, photo: 'https://picsum.photos/seed/bratz/200', online: true },
    { uid: 'fr-2', name: 'Austin 🦂', level: 68, photo: 'https://picsum.photos/seed/austin/200', online: false },
    { uid: 'fr-3', name: 'Princess 🫶', level: 12, photo: 'https://picsum.photos/seed/princess/200', online: true },
    { uid: 'fr-4', name: 'Melanin 💦', level: 9, photo: 'https://picsum.photos/seed/melanin/200', online: true }
  ],
  family: [
    { uid: 'fa-1', name: 'Family Boss (Founder)', level: 75, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', online: true },
    { uid: 'fa-2', name: 'Gifty Sweetheart', level: 15, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', online: true },
    { uid: 'fa-3', name: 'King Goldie', level: 35, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', online: false }
  ],
  fans: [
    { uid: 'fn-1', name: 'Fanatic88', level: 4, photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', online: true },
    { uid: 'fn-2', name: 'ActiveStalker', level: 11, photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', online: true },
    { uid: 'fn-3', name: 'SuperLighter', level: 18, photo: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=150', online: true }
  ]
};

export function SpacesTabContent({
  isLight,
  profile,
  onShowProfile,
  navigate,
  showToast,
  firebaseRooms,
  setActiveTab
}: SpacesTabContentProps) {
  // Creator form state
  const [showForm, setShowForm] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState('#VoiceChat');
  const [roomAccess, setRoomAccess] = useState<'public' | 'private' | 'family' | 'agency' | 'friends' | 'fans'>('public');
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'popular' | 'conversations'>('all');

  // Interactive Target settings
  const [subMeetingPrivacy, setSubMeetingPrivacy] = useState<'public' | 'private'>('private');
  const [selectedUids, setSelectedUids] = useState<Record<string, boolean>>({});
  const [scheduleMode, setScheduleMode] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDay, setScheduledDay] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('18:00');

  // Speaking indicator loops (randomly changes who is talking)
  const [currentSpeakerHash, setCurrentSpeakerHash] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const speakers: Record<string, string> = {};
      INITIAL_SIMULATED_SPACES.forEach(space => {
        const randomIndex = Math.floor(Math.random() * space.activeSpeakers.length);
        speakers[space.id] = space.activeSpeakers[randomIndex];
      });
      setCurrentSpeakerHash(speakers);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Filter actual Firebase audio rooms
  const activeFirebaseSpaces = firebaseRooms.filter(r => r.type === 'audio-live' && r.status === 'live');

  // Combined audio list
  const allAudioSpaces = [
    ...activeFirebaseSpaces.map(r => ({
      id: r.id,
      title: r.title,
      hostName: r.hostName || 'Host_' + r.hostUid.substring(0, 4),
      hostPhotoURL: r.hostPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      hostLevel: 15,
      category: 'Audio Live',
      activeSpeakers: [r.hostName || 'Host', ...(r.guests || []).map(g => typeof g === 'string' ? g : (g as any).uid || 'Speaker')],
      viewerCount: r.viewerCount || 1,
      likes: r.likes || 0,
      topicTag: '#AudioLive',
      speakingUid: r.hostUid,
      isFirebase: true
    })),
    ...INITIAL_SIMULATED_SPACES.map(s => ({
      ...s,
      isFirebase: false
    }))
  ];

  // Apply search filtering
  const filteredSpaces = allAudioSpaces.filter(s => {
    const term = searchText.toLowerCase();
    const matchTerm = s.title.toLowerCase().includes(term) || 
                      s.hostName.toLowerCase().includes(term) || 
                      s.topicTag.toLowerCase().includes(term);
    
    if (!matchTerm) return false;

    if (subFilter === 'popular') {
      return s.viewerCount > 300;
    }
    if (subFilter === 'conversations') {
      return s.activeSpeakers.length > 2;
    }
    return true;
  });

  const handleLaunchSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      showToast("Please log in to start a Space! 🎙️", "warning");
      return;
    }
    if (!spaceTitle.trim()) {
      showToast("Please provide a name or topic for your Space! ✍️", "warning");
      return;
    }

    setIsDeploying(true);
    try {
      // Calculate scheduled time string
      let schedTimeStr = '';
      if (scheduleMode === 'scheduled') {
        if (scheduledDay === 'today') {
          schedTimeStr = `Today ${scheduledTime}`;
        } else if (scheduledDay === 'tomorrow') {
          schedTimeStr = `Tomorrow ${scheduledTime}`;
        } else {
          schedTimeStr = `${customDate} ${scheduledTime}`;
        }
      }

      // Generate a room ID
      const targetRoomId = 'space-' + Math.random().toString(36).substring(2, 11);

      // Determine who is invited
      const isTargetedType = roomAccess === 'agency' || roomAccess === 'friends' || roomAccess === 'family' || roomAccess === 'fans';
      const audienceKey = roomAccess === 'friends' ? 'friends' : (roomAccess as any);
      
      let inviteesUids: string[] = [];
      let inviteesNames: string[] = [];
      
      if (isTargetedType && TARGETED_PEOPLE[audienceKey]) {
        TARGETED_PEOPLE[audienceKey].forEach(p => {
          // If selectedUids is empty for this set, default all to invited, or if explicitly true
          const isInvited = selectedUids[p.uid] !== false;
          if (isInvited) {
            inviteesUids.push(p.uid);
            inviteesNames.push(p.name);
          }
        });
      }

      const inviteData = {
        senderUid: profile.uid,
        senderName: profile.displayName,
        senderPhoto: profile.photoURL || '',
        title: spaceTitle.trim() + ` 🎙️ (${selectedTag})`,
        category: roomAccess === 'friends' ? 'direct' : roomAccess, // map to chats, family, agency, fans
        isScheduled: scheduleMode === 'scheduled',
        scheduledTime: schedTimeStr,
        meetingAccess: subMeetingPrivacy,
        roomId: targetRoomId,
        status: scheduleMode === 'scheduled' ? 'pending' : 'live',
        invitedUids: inviteesUids,
        createdAt: serverTimestamp()
      };

      // 1. Write the notification/invitation to public board
      await addDoc(collection(db, 'spaces_invitations'), inviteData);

      // 2. If it is an Agency meeting, also feed into agency notices for the bulletin board
      if (roomAccess === 'agency') {
        await addDoc(collection(db, 'agency_notices'), {
          agencyId: profile.agencyId || profile.uid || 'agency-main',
          agencyName: 'Agency Star Core',
          title: `MEETING: ${spaceTitle.trim()}`,
          content: `${profile.displayName} has invited ${inviteesNames.length > 0 ? inviteesNames.join(', ') : 'everyone'} to a ${scheduleMode === 'scheduled' ? 'scheduled Space on' + schedTimeStr : 'live active Space meeting now!'}`,
          creatorName: profile.displayName,
          creatorPhoto: profile.photoURL || '',
          creatorUid: profile.uid,
          createdAt: serverTimestamp(),
          type: scheduleMode === 'scheduled' ? 'scheduled' : 'instant',
          scheduledAt: schedTimeStr,
          privacy: subMeetingPrivacy,
          passcode: subMeetingPrivacy === 'private' ? '8899' : ''
        });
      }

      if (scheduleMode === 'scheduled') {
        showToast(`📅 Space meeting "${spaceTitle}" successfully scheduled! Invites sent via Inboxes.`, "success");
        setShowForm(false);
        setSpaceTitle('');
        setSelectedUids({});
      } else {
        // Instant Live Room creation
        const roomData = {
          hostUid: profile.uid,
          hostName: profile.displayName,
          hostPhotoURL: profile.photoURL || '',
          title: spaceTitle.trim() + ` 🎙️ (${selectedTag})`,
          status: 'live',
          type: 'audio-live',
          currentBeans: 0,
          viewerCount: 1,
          guests: [],
          seats: [
            { seatId: 1, uid: profile.uid, name: profile.displayName, photoURL: profile.photoURL || '', status: 'occupied' },
            { seatId: 2, uid: null, status: 'empty' },
            { seatId: 3, uid: null, status: 'empty' },
            { seatId: 4, uid: null, status: 'empty' }
          ],
          isPrivate: subMeetingPrivacy === 'private',
          accessType: roomAccess,
          createdAt: serverTimestamp(),
          pkStatus: 'idle',
          latitude: 6.45,
          longitude: 3.42,
          locationName: 'Lagos Main Space'
        };

        const docRef = await addDoc(collection(db, 'rooms'), roomData);
        showToast(`🎙️ Space "${spaceTitle}" launched! You are live!`, "success");
        navigate(`/room/${docRef.id}?mode=host`);
        setShowForm(false);
        setSpaceTitle('');
        setSelectedUids({});
      }
    } catch (err) {
      console.error(err);
      showToast("Could not deploy Space. Check authorization.", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleJoinSpace = (space: any) => {
    if (space.isFirebase) {
      navigate(`/room/${space.id}?from=spaces`);
    } else {
      // Simulate launching custom voice seat inside the room page
      showToast(`Entering simulated voice space with co-hosts! 🎧`, "info");
      navigate(`/room/${space.id}?from=spaces&simulated=true`);
    }
  };

  const trendingTags = ['#VoiceChat', '#Social', '#Music', '#Relationship', '#TechGist', '#CryptoBeans', '#GamingLife'];

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Exit Spaces Button Box */}
      <div className="px-4 pt-3 pb-1 flex justify-start">
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (setActiveTab) {
              setActiveTab('Popular');
              showToast("Returned to Main Feed!", "success");
            } else {
              navigate('/');
            }
          }}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider border shadow-md transition-all backdrop-blur-md",
            isLight 
              ? "bg-stone-50 text-stone-900 border-stone-200 hover:bg-stone-100" 
              : "bg-zinc-900/90 border-zinc-805 text-zinc-300 hover:text-white hover:bg-zinc-800"
          )}
        >
          <X size={11} className="stroke-[3] text-rose-500" />
          <span>Exit Spaces & Go Home</span>
        </motion.button>
      </div>

      {/* Dynamic Voice Banner Card */}
      <div className="px-4 pt-4">
        <div className={cn(
          "relative overflow-hidden rounded-3xl p-5 border shadow-lg",
          isLight 
            ? "bg-stone-900 border-stone-800 text-stone-100" 
            : "bg-gradient-to-br from-indigo-950 via-[#13111C] to-slate-900 border-zinc-800/80 text-white"
        )}>
          {/* Ambient light pulse */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

          <div className="flex justify-between items-start">
            <div className="space-y-1.5 max-w-[70%]">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 select-none relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Low-Latency Audio Network</span>
              </div>
              <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">BINGO Voice Spaces</h2>
              <p className="text-[11px] leading-snug opacity-75">
                Host intimate voice panel podcasts, discover weekly topic trends, co-host with up to 9 guests, or join as a listener instantly!
              </p>
            </div>

            {/* Launch button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-cyan-400 hover:bg-cyan-300 text-black px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider shadow-md border border-cyan-300/30 font-sans"
            >
              <Mic size={14} className="stroke-[3]" />
              <span>Host Space</span>
            </motion.button>
          </div>

          {/* Styled micro waveform panel to reinforce audio mood */}
          <div className="flex items-end gap-1 h-5 mt-4 opacity-50 select-none">
            <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <div className="w-1.5 h-5 bg-cyan-400 rounded-full animate-bounce" />
            <div className="w-1.5 h-2 bg-pink-500 rounded-full animate-pulse" />
            <div className="w-1.5 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <div className="w-1.5 h-1 bg-[#00ff66] rounded-full" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#00ff66] pl-1 select-none leading-none">Voice stream online</span>
          </div>
        </div>
      </div>

      {/* Launcher dialog overlay (Clubhouse Style Slide-in modal template) */}
      <AnimatePresence>
        {showForm && (
          <div 
            onClick={() => setShowForm(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 hover:cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className={cn(
                "w-full max-w-md rounded-3xl p-6 border shadow-2xl relative cursor-default",
                isLight ? "bg-white border-stone-200 text-stone-900" : "bg-[#16151c] border-zinc-800 text-white"
              )}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowForm(false)}
                className={cn(
                  "absolute top-4 right-4 p-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform",
                  isLight ? "hover:bg-stone-100 text-stone-500" : "hover:bg-zinc-800 text-zinc-400"
                )}
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-cyan-400/20 rounded-xl text-cyan-400">
                  <Mic size={20} className="stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase italic tracking-tight">Launch Audio Space</h3>
                  <p className="text-[10px] opacity-60">Create a real-time digital voice parlor</p>
                </div>
              </div>

              <form onSubmit={handleLaunchSpace} className="space-y-4">
                {/* Topic Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">What do you want to talk about?</label>
                  <input
                    type="text"
                    value={spaceTitle}
                    onChange={(e) => setSpaceTitle(e.target.value)}
                    placeholder="Enter Space name or conversation topic..."
                    maxLength={70}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-xs font-semibold border focus:outline-hidden focus:ring-2 focus:ring-cyan-400",
                      isLight 
                        ? "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400" 
                        : "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500"
                    )}
                  />
                </div>

                {/* Tag Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Category Topic Ring</label>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all select-none",
                          selectedTag === tag
                            ? "bg-cyan-400 text-black font-extrabold ring-1 ring-cyan-200/50"
                            : (isLight ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800")
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience / Privacy Selection Grid */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Target Audience Access</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone can join' },
                      { id: 'private', label: 'Private', icon: Shield, desc: 'Co-hosts only' },
                      { id: 'family', label: 'Family Only', icon: Landmark, desc: 'To Family feed' },
                      { id: 'agency', label: 'Agency Only', icon: Sparkles, desc: 'Agency mates' },
                      { id: 'friends', label: 'Friends', icon: Users, desc: 'Only followers' },
                      { id: 'fans', label: 'Fans Lounge', icon: Heart, desc: 'Your support' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRoomAccess(opt.id as any);
                          // Reset checklist when switching
                          setSelectedUids({});
                        }}
                        className={cn(
                          "p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer",
                          roomAccess === opt.id
                            ? "border-cyan-400 bg-cyan-400/5 shadow-inner animate-pulse"
                            : (isLight ? "border-stone-200 hover:bg-stone-50" : "border-zinc-800 hover:bg-[#1f1e26]")
                        )}
                      >
                        <opt.icon size={13} className={cn("mb-1", roomAccess === opt.id ? "text-cyan-400 animate-bounce" : "opacity-60")} />
                        <span className="text-[9px] font-bold uppercase tracking-tight leading-none">{opt.label}</span>
                        <span className="text-[6.5px] opacity-40 mt-0.5 leading-none">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highly Dynamic Sub-configuration for selective audiences */}
                {(roomAccess === 'agency' || roomAccess === 'friends' || roomAccess === 'family' || roomAccess === 'fans') && (
                  <div className={cn(
                    "p-3 rounded-2xl border space-y-2.5 max-h-[250px] overflow-y-auto scrollbar-hide",
                    isLight ? "bg-stone-50 border-stone-150" : "bg-black/35 border-zinc-900"
                  )}>
                    
                    {/* Sub-toggle: Public or Private conversation access */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9.5px] font-black uppercase tracking-wider opacity-85">Meeting Visibility</span>
                      <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5">
                        <button
                          type="button"
                          onClick={() => setSubMeetingPrivacy('public')}
                          className={cn(
                            "px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md tracking-wider transition-all",
                            subMeetingPrivacy === 'public' ? "bg-cyan-400 text-black shadow-sm" : "text-zinc-500 hover:text-white"
                          )}
                        >
                          Public
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubMeetingPrivacy('private')}
                          className={cn(
                            "px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md tracking-wider transition-all",
                            subMeetingPrivacy === 'private' ? "bg-cyan-400 text-black shadow-sm" : "text-zinc-500 hover:text-white"
                          )}
                        >
                          Private
                        </button>
                      </div>
                    </div>

                    {/* Checkboxes of members inside this group */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                          Select Invitees ({roomAccess})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const group = roomAccess === 'friends' ? 'friends' : roomAccess;
                            const currentList = TARGETED_PEOPLE[group as keyof typeof TARGETED_PEOPLE] || [];
                            const allChecked = currentList.every(p => selectedUids[p.uid] !== false);
                            const nextState: Record<string, boolean> = {};
                            currentList.forEach(p => {
                              nextState[p.uid] = !allChecked;
                            });
                            setSelectedUids(nextState);
                          }}
                          className="text-[8px] font-black uppercase tracking-wider text-cyan-400 hover:underline"
                        >
                          Toggle All
                        </button>
                      </div>

                      <div className="space-y-1 bg-black/20 rounded-xl p-1.5 border border-white/[0.03]">
                        {(TARGETED_PEOPLE[roomAccess === 'friends' ? 'friends' : (roomAccess as any)] || []).map((p: any) => {
                          const isChecked = selectedUids[p.uid] !== false;
                          return (
                            <div 
                              key={p.uid}
                              onClick={() => {
                                setSelectedUids(prev => ({
                                  ...prev,
                                  [p.uid]: !isChecked
                                }));
                              }}
                              className={cn(
                                "flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-left",
                                isChecked 
                                  ? (isLight ? "bg-cyan-50 border-cyan-250 text-stone-900" : "bg-cyan-950/10 border-cyan-500/20 text-white") 
                                  : (isLight ? "bg-stone-50/50 border-stone-200/50 text-stone-600" : "bg-zinc-90 w-40/40 border-zinc-800 text-zinc-400")
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <img 
                                    src={p.photo} 
                                    className="w-5.5 h-5.5 rounded-full object-cover border border-white/10" 
                                    alt="member"
                                    referrerPolicy="no-referrer"
                                  />
                                  {p.online && (
                                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-[#16151c]" />
                                  )}
                                </div>
                                <div className="leading-tight">
                                  <span className="text-[10px] font-black block leading-none">{p.name}</span>
                                  <span className="text-[6.5px] font-mono text-zinc-500 uppercase font-bold">Lv.{p.level}</span>
                                </div>
                              </div>

                              <div className={cn(
                                "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all",
                                isChecked 
                                  ? "bg-cyan-400 border-cyan-400 text-black scale-105" 
                                  : (isLight ? "border-stone-300" : "border-zinc-700 bg-black/40")
                              )}>
                                {isChecked && <Check size={10} className="stroke-[4] text-black" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline settings: Instant vs Scheduled */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-85">Timing Planning</span>
                        <div className="flex p-0.5 bg-black/45 rounded-lg border border-white/5">
                          <button
                            type="button"
                            onClick={() => setScheduleMode('instant')}
                            className={cn(
                              "px-2 py-0.5 text-[8px] font-black uppercase rounded-md transition-all",
                              scheduleMode === 'instant' ? "bg-cyan-400 text-black font-extrabold" : "text-zinc-500 hover:text-white"
                            )}
                          >
                            Instant
                          </button>
                          <button
                            type="button"
                            onClick={() => setScheduleMode('scheduled')}
                            className={cn(
                              "px-2 py-0.5 text-[8px] font-black uppercase rounded-md transition-all",
                              scheduleMode === 'scheduled' ? "bg-cyan-400 text-black font-extrabold" : "text-zinc-500 hover:text-white"
                            )}
                          >
                            Schedule
                          </button>
                        </div>
                      </div>

                      {/* Schedule fields */}
                      {scheduleMode === 'scheduled' && (
                        <div className="p-2 bg-black/40 rounded-xl border border-white/5 space-y-2">
                          <div className="flex gap-1">
                            {['today', 'tomorrow', 'custom'].map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => setScheduledDay(day as any)}
                                className={cn(
                                  "flex-1 py-1 rounded text-[8px] font-black uppercase border transition-all",
                                  scheduledDay === day
                                    ? "bg-cyan-400 text-black border-cyan-400"
                                    : "border-zinc-800 text-zinc-500 hover:text-white"
                                )}
                              >
                                {day}
                              </button>
                            ))}
                          </div>

                          {scheduledDay === 'custom' && (
                            <input
                              type="date"
                              value={customDate}
                              onChange={(e) => setCustomDate(e.target.value)}
                              className="w-full px-2 py-1 text-[9px] font-bold uppercase rounded bg-zinc-950 border border-zinc-800 text-cyan-400 focus:outline-none"
                            />
                          )}

                          <div className="flex items-center justify-between gap-1 pt-1">
                            <span className="text-[8.5px] font-black uppercase text-zinc-500">Pick Meeting Time</span>
                            <input
                              type="time"
                              value={scheduledTime}
                              onChange={(e) => setScheduledTime(e.target.value)}
                              className="px-2 py-0.5 text-[9.5px] font-mono font-black rounded bg-zinc-950 border border-zinc-800 text-cyan-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* Actions Row */}
                <div className="flex gap-2.5 pt-1 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowForm(false)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all cursor-pointer text-center",
                      isLight 
                        ? "border-stone-300 text-stone-700 bg-stone-100 hover:bg-stone-200" 
                        : "border-zinc-800 text-zinc-400 bg-zinc-900 hover:text-white"
                    )}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isDeploying}
                    className="flex-[2] bg-cyan-400 hover:bg-cyan-300 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isDeploying ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                      <>
                        {scheduleMode === 'scheduled' ? (
                          <>
                            <Calendar size={13} className="stroke-[3]" />
                            <span>Schedule</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={13} className="stroke-[3]" />
                            <span>Launch Now</span>
                          </>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Control bar: Search & Filters */}
      <div className="px-4 pt-6 pb-2.5 flex items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 y-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search voice topics, speakers or hosts..."
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-xl text-[11px] font-medium border focus:outline-hidden focus:ring-1 focus:ring-cyan-400/40",
              isLight 
                ? "bg-zinc-50 border-zinc-200 text-stone-900 placeholder-zinc-400" 
                : "bg-[#18181b]/80 border-zinc-800/80 text-white placeholder-zinc-500"
            )}
          />
          {searchText && (
            <button 
              onClick={() => setSearchText('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-800/10 rounded-full"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Filter sub-selector */}
        <div className={cn(
          "flex items-center p-0.5 rounded-lg border",
          isLight ? "bg-stone-100 border-zinc-200" : "bg-[#18181b]/80 border-zinc-800/80"
        )}>
          {[
            { id: 'all', label: 'Active' },
            { id: 'popular', label: 'Trending' },
            { id: 'conversations', label: 'Panels' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSubFilter(opt.id as any)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all select-none leading-none",
                subFilter === opt.id
                  ? (isLight ? "bg-white text-stone-950 shadow-xs" : "bg-zinc-800 text-white")
                  : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Space list */}
      <div className="px-4 py-2 space-y-4">
        <div className="flex items-center justify-between select-none">
          <span className={cn("text-xs font-black uppercase tracking-wider flex items-center gap-1", isLight ? "text-zinc-600" : "text-zinc-400")}>
            <Radio size={12} className="text-cyan-400 animate-pulse shrink-0" />
            <span>Active voice discussions ({filteredSpaces.length})</span>
          </span>
        </div>

        {/* BINGO Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSpaces.map((space) => {
            const currentSpeaker = currentSpeakerHash[space.id] || space.hostName;

            return (
              <motion.div
                key={space.id}
                whileHover={{ y: -2 }}
                onClick={() => handleJoinSpace(space)}
                className={cn(
                  "p-5 rounded-3xl border cursor-pointer hover:shadow-lg transition-all relative flex flex-col justify-between group",
                  isLight 
                    ? "bg-white border-stone-100 hover:bg-stone-50" 
                    : "bg-[#18171f]/95 border-zinc-800/80 hover:bg-[#201f28]"
                )}
              >
                {/* Space Header info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                      <Signal size={10} className="text-cyan-400 animate-pulse stroke-[3.5]" />
                      <span className="text-[8.5px] font-black uppercase text-cyan-400 tracking-wider">Twitter Space</span>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      {space.isFirebase && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] font-black text-[7px] uppercase tracking-widest">
                          Real Live
                        </span>
                      )}
                      <span className="text-[9.5px] font-black uppercase text-zinc-500 tracking-widest">
                        {space.topicTag}
                      </span>
                    </div>
                  </div>

                  {/* Title Statement */}
                  <h3 className={cn(
                    "text-sm font-black tracking-tight leading-snug uppercase group-hover:text-cyan-400 transition-colors mb-3.5 pr-2",
                    isLight ? "text-stone-900" : "text-white"
                  )}>
                    {space.title}
                  </h3>

                  {/* Conversational Seat Bubble visuals */}
                  <div className="flex flex-col gap-2.5 mb-5 bg-black/10 dark:bg-black/35 p-3 rounded-2xl border border-white/5">
                    {/* Visualizer showing talking indicator wave */}
                    <div className="flex items-center gap-3">
                      {/* Host avatar */}
                      <div className="relative shrink-0 select-none">
                        <img
                          src={space.hostPhotoURL}
                          alt={space.hostName}
                          className={cn(
                            "w-10 h-10 rounded-full object-cover transition-transform",
                            currentSpeaker === space.hostName ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#18171f]" : ""
                          )}
                        />
                        {/* Mic voice bubble overlays */}
                        {currentSpeaker === space.hostName && (
                          <div className="absolute -bottom-1 -right-1 bg-cyan-400 text-black p-0.5 rounded-full shadow-md animate-bounce">
                            <Mic size={9} className="stroke-[3.5]" />
                          </div>
                        )}
                      </div>

                      {/* Speaker title, active status */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("text-[11px] font-black tracking-tight truncate", isLight ? "text-stone-850" : "text-zinc-200")}>
                            {space.hostName}
                          </span>
                          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Sparkles size={6} className="text-white fill-white" />
                            <span className="text-[7px] font-bold text-white leading-none">Lv.{space.hostLevel}</span>
                          </div>
                          <span className="text-[8.5px] text-zinc-500 font-extrabold uppercase">HOST</span>
                        </div>

                        {/* Speech indicator text simulation */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Volume2 size={10} className="text-cyan-400 shrink-0" />
                          <span className="text-[9.5px] italic text-zinc-400 truncate tracking-tight">
                            {currentSpeaker === space.hostName ? "Speaking live..." : `Listening to ${currentSpeaker}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Listening Speaker Stack Bubble */}
                    <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2.5 mt-0.5">
                      <div className="flex items-center gap-1 text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>Panelists:</span>
                      </div>
                      
                      {/* Speakers row with neat stack wrap */}
                      <div className="flex items-center gap-1">
                        {space.activeSpeakers.slice(0, 4).map((name, i) => (
                          <div
                            key={name}
                            className={cn(
                              "text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight transition-all",
                              currentSpeaker === name
                                ? "bg-cyan-400 text-black shadow-md border border-cyan-400/20"
                                : "bg-zinc-800 text-zinc-400"
                            )}
                          >
                            🎙️ {name}
                          </div>
                        ))}
                        {space.activeSpeakers.length > 4 && (
                          <span className="text-[8px] font-bold text-zinc-500 pl-1">
                            +{space.activeSpeakers.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom stats layout */}
                <div className="flex items-center justify-between pt-1 select-none border-t border-zinc-800/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Users size={11} className="text-cyan-400/70" />
                      <span className="text-[10px] font-mono font-bold leading-none">{space.viewerCount} list.</span>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-400">
                      <Heart size={11} className="text-pink-400/70" />
                      <span className="text-[10px] font-mono font-bold leading-none">{space.likes}</span>
                    </div>
                  </div>

                  <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Listen Live</span>
                    <ChevronRight size={10} className="stroke-[3]" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty list search guard */}
        {filteredSpaces.length === 0 && (
          <div className="text-center py-16 text-zinc-500 italic text-xs select-none w-full">
            No active BINGO voice spaces match the search phrase...
            <p className="text-[10px] opacity-70 tracking-wide mt-1 uppercase">Try starting your own space spotlight!</p>
          </div>
        )}
      </div>
    </div>
  );
}
