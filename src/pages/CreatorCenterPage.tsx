import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Megaphone, Crown, ShieldCheck, AlertTriangle, 
  GraduationCap, Headset, Contact2, CheckCircle2, XCircle,
  Video, Sparkles, Star, Heart, Trophy, Flame, Swords,
  Users, RotateCw, Gamepad2, PartyPopper, Gift, Phone, Music,
  Dog, CalendarHeart, Zap, Hand, Ticket, Settings, Briefcase,
  Camera, Smile, Columns2, ZoomIn, Key, Mic2, Youtube, MonitorUp,
  Newspaper, UserPlus, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GoLiveModal } from '../components/GoLiveModal';
import { AnimatePresence } from 'framer-motion';
import { ARPreviewModal } from '../components/ARPreviewModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Agency, UserProfile } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

const ServiceCard = ({ icon: Icon, label, color }: { icon: any, label: string, color: string }) => {
  const { showToast } = useToast();
  return (
    <div 
      onClick={() => showToast(`${label} feature coming soon! 🛠️`, 'info')}
      className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
        <Icon size={24} />
      </div>
      <span className="text-[11px] font-bold text-slate-700 text-center leading-tight uppercase tracking-tight">{label}</span>
    </div>
  );
};

const ExampleImage = ({ src, label, status }: { src: string, label: string, status: 'good' | 'ng' }) => (
  <div className="flex flex-col gap-2">
    <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
      <img src={src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className="absolute bottom-2 right-2">
        {status === 'good' ? (
          <div className="bg-teal-500 text-white rounded-full p-0.5">
            <CheckCircle2 size={16} />
          </div>
        ) : (
          <div className="bg-pink-500 text-white rounded-full p-0.5">
            <XCircle size={16} />
          </div>
        )}
      </div>
    </div>
    <span className="text-[10px] font-medium text-slate-400 text-center">{label}</span>
  </div>
);

const InteractiveToolsSection = ({ onOpenGoLive, onOpenARPreview, onOpenTransform }: { onOpenGoLive: () => void, onOpenARPreview: () => void, onOpenTransform: () => void }) => {
  const { showToast } = useToast();
  return (
    <div className="space-y-4 pt-8 border-t border-slate-50">
      <h3 className="font-black italic uppercase tracking-tight text-slate-900">Interactive Tools</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        Various room tools and games to choose from
      </p>
      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl space-y-8">
        {/* Room Tools */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Room Tools</h4>
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: Dog, label: 'Virtual Avatar', badge: 'New' },
              { icon: Sparkles, label: 'AI Coach', badge: 'New' },
              { icon: Camera, label: 'Camera' },
              { icon: Sparkles, label: 'Beauty' },
              { icon: Smile, label: 'Mask' },
              { icon: Columns2, label: 'Mirror' },
              { icon: RotateCw, label: 'Flip' },
              { icon: ZoomIn, label: 'Zoom in' },
              { icon: Zap, label: 'Flash' },
              { icon: Key, label: 'Key Settings' },
              { icon: Mic2, label: 'Singing Mode' },
              { icon: Youtube, label: 'Youtube' },
              { icon: MonitorUp, label: 'Share Screen' },
              { icon: Megaphone, label: 'DIY Notify', badge: 1 },
              { icon: Music, label: 'Music' },
              { icon: Phone, label: 'Line' },
              { icon: Dog, label: 'Pet' },
              { icon: CalendarHeart, label: 'Date' },
            ].map((tool) => (
              <div 
                key={tool.label} 
                onClick={() => {
                  if (tool.label === 'Virtual Avatar' || tool.label === 'AI Coach') {
                    onOpenGoLive();
                  } else if (tool.label === 'Beauty' || tool.label === 'Mask' || tool.label === 'Camera') {
                    onOpenARPreview();
                  } else if (tool.label === 'Mirror' || tool.label === 'Flip' || tool.label === 'Zoom in') {
                    onOpenTransform();
                  } else {
                    showToast(`${tool.label} feature coming soon! 🛠️`, 'info');
                  }
                }}
                className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-transform"
              >
                <div className="relative w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors">
                  <tool.icon size={20} />
                  {tool.badge && (
                    <div className={cn(
                      "absolute -top-1 -right-1 px-1.5 py-0.5 text-[6px] font-black uppercase italic tracking-tighter rounded-full border-2 border-white shadow-sm",
                      tool.badge === 'New' ? "bg-cyan-500 text-white" : "bg-pink-500 text-white"
                    )}>
                      {tool.badge}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-400 text-center leading-tight group-hover:text-slate-900">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Tools */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Other Tools</h4>
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: Video, label: 'Recorder' },
              { icon: Newspaper, label: 'Viewer\'s Info' },
              { icon: UserPlus, label: 'Newcomers' },
              { icon: Gift, label: 'Gift Sound' },
              { icon: Heart, label: 'Wish lists' },
              { icon: Ticket, label: 'Fan Lottery' },
            ].map((tool) => (
              <div 
                key={tool.label} 
                onClick={() => showToast(`${tool.label} feature coming soon! 🛠️`, 'info')}
                className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-500 transition-colors">
                  <tool.icon size={20} />
                </div>
                <span className="text-[9px] font-bold text-slate-400 text-center leading-tight group-hover:text-slate-900">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Play Center */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Play Center</h4>
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: '🎨', label: 'Draw Guess', color: 'bg-blue-100' },
              { icon: '🎡', label: 'Turntable', color: 'bg-indigo-100' },
              { icon: '🎰', label: 'Big Winner', color: 'bg-purple-100' },
              { icon: '⚔️', label: 'Group PK', color: 'bg-pink-100' },
              { icon: '🦖', label: 'Dino', color: 'bg-cyan-100' },
              { icon: '💰', label: 'Earn Money', color: 'bg-orange-100' },
              { icon: '📘', label: 'Guide', color: 'bg-yellow-100' },
              { icon: '🏆', label: 'PK Qualifying', color: 'bg-slate-100' },
              { icon: '🎁', label: 'Gift Wall', color: 'bg-violet-100' },
              { icon: '🤝', label: 'Match', color: 'bg-cyan-100' },
              { icon: '🦀', label: 'Craw', color: 'bg-blue-100' },
            ].map((game) => (
              <div 
                key={game.label} 
                onClick={() => showToast(`${game.label} feature coming soon! 🎮`, 'info')}
                className="flex flex-col items-center gap-2 group cursor-pointer active:scale-90 transition-transform"
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-md transition-shadow", game.color)}>
                  {game.icon}
                </div>
                <span className="text-[9px] font-black text-slate-400 text-center leading-tight group-hover:text-slate-900">{game.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreatorCenterPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Live');
  const [tutorialTab, setTutorialTab] = useState('Live Skills');
  const [isGoLiveModalOpen, setIsGoLiveModalOpen] = useState(false);
  const [isARPreviewOpen, setIsARPreviewOpen] = useState(false);
  const [isTransformOpen, setIsTransformOpen] = useState(false);
  const [arInitialTab, setArInitialTab] = useState<'beauty' | 'magic' | 'transform'>('beauty');
  const [agency, setAgency] = useState<Agency | null>(null);
  const [agencyHosts, setAgencyHosts] = useState<UserProfile[]>([]);
  const [isLoadingAgency, setIsLoadingAgency] = useState(false);

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (!profile || profile.role !== 'agency') return;
      
      setIsLoadingAgency(true);
      try {
        const agencySnap = await getDocs(query(collection(db, 'agencies'), where('ownerUid', '==', profile.uid), limit(1)));
        if (!agencySnap.empty) {
          const agencyData = agencySnap.docs[0].data() as Agency;
          setAgency(agencyData);
          
          const hostsSnap = await getDocs(query(collection(db, 'users'), where('agencyId', '==', agencyData.id), orderBy('totalBeansEarned', 'desc'), limit(10)));
          setAgencyHosts(hostsSnap.docs.map(d => d.data() as UserProfile));
        }
      } catch (error) {
        console.error("Error fetching agency data:", error);
      } finally {
        setIsLoadingAgency(false);
      }
    };

    if (activeTab === 'Agency') {
      fetchAgencyData();
    }
  }, [activeTab, profile]);

  const [showAR, setShowAR] = useState(false);
  const [showTransform, setShowTransform] = useState(false);
  const [showGoLive, setShowGoLive] = useState(false);

  const handleToolAction = (label: string) => {
    switch (label) {
      case 'Beauty':
      case 'Mask':
      case 'Camera':
      case 'Flash':
        setShowAR(true);
        break;
      case 'Mirror':
      case 'Flip':
      case 'Zoom':
        setShowTransform(true);
        break;
      case 'Virtual Avatar':
      case 'AI Coach':
        setShowGoLive(true);
        break;
      case 'Singing Mode':
        showToast("Singing Mode Toggled! 🎤", 'success');
        break;
      case 'Youtube':
        showToast("Youtube Watching Together feature coming soon! 📺", 'info');
        break;
      case 'Music':
        showToast("Music Player feature coming soon! 🎵", 'info');
        break;
      default:
        showToast(`${label} feature coming soon! 🛠️`, 'info');
    }
  };

  const services = [
    { icon: Megaphone, label: 'Check my events', color: 'bg-cyan-50 text-cyan-500' },
    { icon: Sparkles, label: 'Earnings Center', color: 'bg-orange-50 text-orange-500', path: '/earnings-dashboard' },
    { icon: Crown, label: 'Host level', color: 'bg-teal-50 text-teal-500' },
    { icon: ShieldCheck, label: 'Apply for official hosts', color: 'bg-blue-50 text-blue-500' },
    { icon: Users, label: 'Family Center', color: 'bg-orange-50 text-orange-500', path: '/family-dashboard' },
    { icon: Heart, label: 'Fan Club Center', color: 'bg-pink-50 text-pink-500', path: '/fan-club-center' },
    { icon: GraduationCap, label: 'Host Academy', color: 'bg-indigo-50 text-indigo-500' },
    { icon: Headset, label: 'Customer Services', color: 'bg-sky-50 text-sky-500' },
    { icon: Contact2, label: 'Real name authentication', color: 'bg-emerald-50 text-emerald-500' },
  ];

  const tutorialTabs = ['Live Skills', 'Single Live', 'Multi-guest Live', 'Virtual Live', 'Game Live'];

  const playCenterIcons = [
    { icon: Swords, label: 'PK', color: 'bg-orange-500' },
    { icon: Users, label: 'Team PK', color: 'bg-blue-500' },
    { icon: Heart, label: 'FansPK', color: 'bg-pink-500' },
    { icon: Trophy, label: 'Top Supporter', color: 'bg-yellow-500' },
    { icon: RotateCw, label: 'SPIN', color: 'bg-indigo-500' },
    { icon: Gamepad2, label: 'Big Winner', color: 'bg-purple-500' },
    { icon: Heart, label: 'Wish lists', color: 'bg-rose-500' },
    { icon: PartyPopper, label: 'Party', color: 'bg-amber-500' },
    { icon: Trophy, label: 'PK Qualifying', color: 'bg-slate-700' },
    { icon: Gift, label: 'Gift Wall', color: 'bg-violet-500' },
    { icon: Phone, label: 'Line', color: 'bg-sky-500' },
    { icon: Dog, label: 'Pet', color: 'bg-teal-500' },
    { icon: CalendarHeart, label: 'Date', color: 'bg-fuchsia-500' },
    { icon: Zap, label: 'Match', color: 'bg-cyan-500' },
    { icon: Hand, label: 'Craw', color: 'bg-blue-600' },
    { icon: Ticket, label: 'Fan Lottery', color: 'bg-orange-600' },
  ];

  return (
    <div className="flex flex-col bg-[#121212] h-full overflow-hidden select-none">
      {/* Fixed Top Navigation */}
      <header className="flex-none bg-[#1a1a1a] w-full border-b border-white/10">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-black text-white tracking-tighter uppercase">BINGO LIVE</h1>
          <button onClick={() => navigate(-1)} className="p-1.5 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
        </div>
        
        <div className="flex px-4 gap-8">
          {['Live', 'Agency'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-2 text-[10px] font-black uppercase italic tracking-widest transition-all relative",
                activeTab === tab ? "text-white" : "text-white/20"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-16 sm:pb-8 bg-[#F8F9FA]">
        {activeTab === 'Live' ? (
          <>
            {/* April Data Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-800">April data</h2>
                <button className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  Live Data <ChevronRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900">0</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Live minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900">7</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">New Fans</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900">0</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">New Beans</span>
                </div>
              </div>
            </div>

            {/* Live Tools */}
            <section className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Live Tools</h2>
              <div className="space-y-2">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">Cover Adjustment</span>
                      <span className="text-[10px] text-slate-400">Adjust your cover to get more exposure</span>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all">
                    Change
                  </button>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-500">
                      <Video size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">Live Preview</span>
                      <span className="text-[10px] text-slate-400">Fans can reserve your next Live</span>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all">
                    Create
                  </button>
                </div>
              </div>
            </section>

            {/* Live Services */}
            <section className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Live Services</h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Megaphone, label: 'Check my events', color: 'bg-cyan-50 text-cyan-500' },
                  { icon: Crown, label: 'Host level', color: 'bg-teal-50 text-teal-500' },
                  { icon: ShieldCheck, label: 'Apply for official hosts', color: 'bg-blue-50 text-blue-500' },
                  { icon: AlertTriangle, label: 'Account Violations', color: 'bg-pink-50 text-pink-500' },
                  { icon: GraduationCap, label: 'Host Academy', color: 'bg-indigo-50 text-indigo-500' },
                  { icon: Headset, label: 'Customer Services', color: 'bg-sky-50 text-sky-500' },
                ].map((service) => (
                  <div 
                    key={service.label}
                    onClick={() => showToast(`${service.label} feature coming soon! 🛠️`, 'info')}
                    className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", service.color)}>
                      <service.icon size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-700 text-center leading-tight uppercase tracking-tight">{service.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Live Tutorial */}
            <section className="space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Live Tutorial</h2>
              
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                {tutorialTabs.map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setTutorialTab(tab)}
                    className={cn(
                      "px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all whitespace-nowrap snap-center",
                      tutorialTab === tab ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                {tutorialTab === 'Live Skills' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">1. Live settings</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Set a catchy cover and title to attract users to your live stream.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Streaming Setting</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Requirement and instruction for high quality cover<br/>
                          1) Please upload a high quality photo and place yourself in the center<br/>
                          2) An emphasize on makeup and bodyshape will boost the exposure<br/>
                          3) Hashtags that relate to streaming's content will boost the views
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <ExampleImage src="https://picsum.photos/seed/cover1/300/300" label="Highlight your figure" status="good" />
                        <ExampleImage src="https://picsum.photos/seed/cover2/300/300" label="High-quality photo" status="good" />
                        <ExampleImage src="https://picsum.photos/seed/cover3/300/300" label="Appealing make-up" status="good" />
                        <ExampleImage src="https://picsum.photos/seed/cover4/300/300" label="Blurred or dark" status="ng" />
                        <ExampleImage src="https://picsum.photos/seed/cover5/300/300" label="Blocked figure" status="ng" />
                        <ExampleImage src="https://picsum.photos/seed/cover6/300/300" label="Not real human" status="ng" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">NG situations:</h4>
                      <ul className="space-y-2">
                        {[
                          "Logos from other apps appear on the cover",
                          "Black & white, bruel or low quality photos",
                          "Any other content that against Bingo Live Community Regulation, such as naked, inappropriate dressing, smoking, violance or gambling"
                        ].map((text, i) => (
                          <li key={text} className="flex gap-3 text-xs text-slate-400 leading-tight">
                            <span className="font-bold text-slate-900">{i + 1})</span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">1. How to get more audiences</h4>
                      <ul className="space-y-3">
                        {[
                          "Feature yourself on your cover photo, and pick a title related to the Live;",
                          "Welcome your audiences when they enter your room, and express gratitude to those who send gifts in time;",
                          "Try to impress your audiences by showing your talents or sharing some amazing experience or fun facts about yourself;",
                          "Use Live tools to your advantage, and always stay interactive with your audiences;",
                          "Stay connected with those who are active, and chat them through messages."
                        ].map((text, i) => (
                          <li key={text} className="flex gap-3 text-xs text-slate-400 leading-tight">
                            <span className="font-bold text-slate-900">{i + 1})</span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">2. How to get more followers</h4>
                      <ul className="space-y-3">
                        {[
                          "Invite audiences to follow your account during Live. Followers will be notified by Broadcast Reminder when you go live;",
                          "Post frequently in Bar or Communities so that users are able to follow you through your posts."
                        ].map((text, i) => (
                          <li key={text} className="flex gap-3 text-xs text-slate-400 leading-tight">
                            <span className="font-bold text-slate-900">{i + 1})</span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">3. How to improve your Live quality</h4>
                      <ul className="space-y-3">
                        {[
                          "Set up a clean and fancy background;",
                          "Get music playing in the background to set ambience;",
                          "Highlight yourself by setting up some lightings;",
                          "Get everything, i.e., costumes, makeups, topics and yourself ready before going Live."
                        ].map((text, i) => (
                          <li key={text} className="flex gap-3 text-xs text-slate-400 leading-tight">
                            <span className="font-bold text-slate-900">{i + 1})</span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {tutorialTab === 'Single Live' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">1. Live settings</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Set a catchy cover and title to attract users to your live stream.
                      </p>
                      <div className="aspect-[9/16] bg-slate-900 rounded-[3rem] overflow-hidden border-8 border-slate-800 relative shadow-2xl">
                        <img src="https://picsum.photos/seed/livebg/400/800" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 p-6 flex flex-col">
                          <div className="flex justify-end">
                            <XCircle className="text-white/40" size={24} />
                          </div>
                          <div className="mt-8 bg-black/40 backdrop-blur-md rounded-3xl p-4 border border-white/10 space-y-4">
                            <div className="flex gap-4">
                              <div className="relative">
                                <img src="https://picsum.photos/seed/host/100/100" className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute bottom-0 right-0 bg-black/60 text-[8px] text-white px-1 rounded">Edit</div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="text-white text-sm font-bold italic uppercase">Hi, come in and chat</div>
                                <div className="flex gap-2">
                                  <div className="bg-white/10 px-2 py-1 rounded-lg text-[8px] text-white flex items-center gap-1">
                                    <Users size={8} /> Public <ChevronLeft size={8} className="rotate-270" />
                                  </div>
                                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase">
                              <span>Select tag</span>
                              <ChevronLeft size={12} className="rotate-270" />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase bg-white/5 p-2 rounded-xl">
                              <span>Create Live time</span>
                              <ChevronLeft size={12} className="rotate-270" />
                            </div>
                          </div>
                          <div className="mt-auto mb-8">
                            <div className="w-full py-4 bg-cyan-400 rounded-full text-center text-white font-black uppercase italic tracking-widest text-sm shadow-lg">Go Live</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-50">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">2. Gift Wishlist</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Set your gift wish list, so your audience will know.
                      </p>
                      <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/10 shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-white font-black italic uppercase tracking-tight">Wishlist of the broadcaster</span>
                            <span className="text-[8px] text-white/40 uppercase tracking-widest">The wishlist will expire after the broadcast ends</span>
                          </div>
                          <button className="text-white/40"><Settings size={16} /></button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { name: 'Treasure Hunt', val: 32, max: 40, color: 'bg-yellow-400', img: 'https://picsum.photos/seed/gift1/100/100' },
                            { name: 'Surprise', val: 14, max: 50, color: 'bg-cyan-400', img: 'https://picsum.photos/seed/gift2/100/100' },
                            { name: 'Piano Love', val: 223, max: 44, color: 'bg-pink-400', img: 'https://picsum.photos/seed/gift3/100/100' }
                          ].map((gift, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-3 flex flex-col items-center gap-2 border border-white/5">
                              <img src={gift.img} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                              <div className="text-[8px] text-white font-bold text-center leading-tight">{gift.name}</div>
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", gift.color)} style={{ width: `${Math.min(100, (gift.val/gift.max)*100)}%` }} />
                              </div>
                              <div className="text-[8px] font-black italic text-white">
                                <span className={gift.color.replace('bg-', 'text-')}>{gift.val}</span>
                                <span className="text-white/40">/{gift.max}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white/10 overflow-hidden">
                              <img src={`https://picsum.photos/seed/supporter${i}/64/64`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                        <div className="text-center text-[8px] font-black uppercase tracking-widest text-white/40">
                          <span className="text-yellow-400">20</span> viewers have supported the broadcaster
                        </div>
                      </div>
                    </div>
                    <InteractiveToolsSection 
                      onOpenGoLive={() => setIsGoLiveModalOpen(true)} 
                      onOpenARPreview={() => {
                        setArInitialTab('beauty');
                        setIsARPreviewOpen(true);
                      }}
                      onOpenTransform={() => {
                        setArInitialTab('transform');
                        setIsARPreviewOpen(true);
                      }}
                    />
                  </>
                )}

                {tutorialTab === 'Multi-guest Live' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">1. Live settings</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Choose Multi-guest voice room.
                      </p>
                      <div className="aspect-[9/16] bg-[#1a1a2e] rounded-[3rem] overflow-hidden border-8 border-slate-800 relative shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/20 to-black/60" />
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 opacity-40">
                          <img src="https://picsum.photos/seed/astronaut/400/400" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="absolute inset-0 p-6 flex flex-col">
                          <div className="flex justify-end"><XCircle className="text-white/40" size={24} /></div>
                          <div className="mt-8 bg-black/40 backdrop-blur-md rounded-3xl p-4 border border-white/10 space-y-4">
                            <div className="flex gap-4">
                              <img src="https://picsum.photos/seed/room/100/100" className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                              <div className="flex-1 space-y-2">
                                <div className="text-white text-sm font-bold italic uppercase">Hi, come in and chat</div>
                                <div className="flex gap-2">
                                  <div className="bg-white/10 px-2 py-1 rounded-lg text-[8px] text-white flex items-center gap-1">
                                    <Users size={8} /> Public <ChevronLeft size={8} className="rotate-270" />
                                  </div>
                                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-12 grid grid-cols-4 gap-4">
                            <div className="aspect-square rounded-full border-2 border-cyan-400 p-0.5">
                              <img src="https://picsum.photos/seed/guest1/100/100" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            {[...Array(7)].map((_, i) => (
                              <div key={i} className="aspect-square rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/20">
                                <Users size={16} />
                              </div>
                            ))}
                          </div>
                          <div className="mt-auto mb-8">
                            <div className="w-full py-4 bg-cyan-400 rounded-full text-center text-white font-black uppercase italic tracking-widest text-sm shadow-lg">Go Live</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-50">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">2. Guest Management</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        You can invite audiences to Voice Chat.
                      </p>
                      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-500 to-purple-600" />
                        <div className="relative z-10 flex flex-col items-center pt-8">
                          <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4">
                            <img src="https://picsum.photos/seed/ella/200/200" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-black italic uppercase text-slate-900">Ella Reese</span>
                              <span className="bg-pink-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">♀ 25</span>
                              <span className="bg-teal-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">Lv 10</span>
                            </div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">ID: 86062581 • Macedonia</div>
                          </div>
                          <div className="grid grid-cols-4 gap-6 w-full mt-8 border-t border-slate-50 pt-6">
                            {[
                              { label: 'Fans', val: '528' },
                              { label: 'Following', val: '67' },
                              { label: 'Beans', val: '854' },
                              { label: 'Friend', val: '156' }
                            ].map((stat, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <span className="font-black italic text-slate-900">{stat.val}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3 w-full mt-8">
                            <button className="py-3 bg-cyan-400 text-white rounded-2xl font-black uppercase italic text-[10px] tracking-widest">+ Follow</button>
                            <button className="py-3 bg-white border border-cyan-400 text-cyan-400 rounded-2xl font-black uppercase italic text-[10px] tracking-widest flex items-center justify-center gap-2">
                              <Users size={14} /> Invite
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <InteractiveToolsSection 
                      onOpenGoLive={() => setIsGoLiveModalOpen(true)} 
                      onOpenARPreview={() => {
                        setArInitialTab('beauty');
                        setIsARPreviewOpen(true);
                      }}
                      onOpenTransform={() => {
                        setArInitialTab('transform');
                        setIsARPreviewOpen(true);
                      }}
                    />
                  </>
                )}

                {tutorialTab === 'Virtual Live' && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black italic uppercase tracking-tight text-slate-900">1. Virtual Avatar Setup</h3>
                        <span className="bg-cyan-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Active Now</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Customize your virtual character to express your unique style. No camera needed!
                      </p>
                      <div className="aspect-[9/16] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] overflow-hidden border-8 border-slate-800 relative shadow-2xl">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center relative group">
                            <Dog size={80} className="text-white" />
                            <div className="absolute -bottom-2 bg-cyan-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Active</div>
                          </div>
                          <div className="mt-8 grid grid-cols-4 gap-3 px-6">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className={cn(
                                "aspect-square rounded-xl border-2 flex items-center justify-center transition-all",
                                i === 0 ? "border-cyan-400 bg-white/20" : "border-white/10 bg-black/20"
                              )}>
                                <Sparkles size={16} className={i === 0 ? "text-cyan-400" : "text-white/20"} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="absolute bottom-10 left-0 right-0 px-8">
                          <div 
                            onClick={() => setIsGoLiveModalOpen(true)}
                            className="w-full py-4 bg-white text-slate-900 rounded-full text-center font-black uppercase italic tracking-widest text-sm shadow-xl cursor-pointer active:scale-95 transition-all"
                          >
                            Confirm Avatar
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-50">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">2. Virtual Backgrounds</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Choose an immersive environment for your virtual broadcast.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'Cyberpunk City', img: 'https://picsum.photos/seed/cyber/400/300' },
                          { name: 'Magic Forest', img: 'https://picsum.photos/seed/forest/400/300' },
                          { name: 'Space Station', img: 'https://picsum.photos/seed/space/400/300' },
                          { name: 'Cozy Room', img: 'https://picsum.photos/seed/room/400/300' }
                        ].map((bg, i) => (
                          <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-slate-100">
                            <img src={bg.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white text-[10px] font-black uppercase italic tracking-widest">{bg.name}</div>
                            {i === 0 && (
                              <div className="absolute top-2 right-2 bg-cyan-400 text-white p-1 rounded-full">
                                <CheckCircle2 size={12} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <InteractiveToolsSection 
                      onOpenGoLive={() => setIsGoLiveModalOpen(true)} 
                      onOpenARPreview={() => {
                        setArInitialTab('beauty');
                        setIsARPreviewOpen(true);
                      }}
                      onOpenTransform={() => {
                        setArInitialTab('transform');
                        setIsARPreviewOpen(true);
                      }}
                    />
                  </>
                )}

                {tutorialTab === 'Game Live' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">1. Select Your Game</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Choose the game you want to stream to your audience.
                      </p>
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-black italic uppercase tracking-tight">Popular Games</span>
                          <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">View All</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { name: 'PUBG Mobile', img: 'https://picsum.photos/seed/pubg/200/200' },
                            { name: 'Free Fire', img: 'https://picsum.photos/seed/ff/200/200' },
                            { name: 'Mobile Legends', img: 'https://picsum.photos/seed/ml/200/200' }
                          ].map((game, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                                <img src={game.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="text-[8px] text-white font-bold text-center leading-tight">{game.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-white/5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-cyan-400">
                                <Zap size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white text-[10px] font-black uppercase tracking-tight">Stream Quality</span>
                                <span className="text-[8px] text-white/40">1080p • 60fps</span>
                              </div>
                            </div>
                            <ChevronLeft size={16} className="text-white/20 rotate-270" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-purple-400">
                                <Settings size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white text-[10px] font-black uppercase tracking-tight">Overlay Settings</span>
                                <span className="text-[8px] text-white/40">Custom HUD enabled</span>
                              </div>
                            </div>
                            <ChevronLeft size={16} className="text-white/20 rotate-270" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-50">
                      <h3 className="font-black italic uppercase tracking-tight text-slate-900">2. Game Overlay</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Interact with your fans while playing without leaving the game.
                      </p>
                      <div className="aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border-4 border-slate-800 relative shadow-xl">
                        <img src="https://picsum.photos/seed/gameplay/800/450" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-white font-black uppercase italic tracking-widest">Live 00:42:15</span>
                        </div>
                        <div className="absolute bottom-4 left-4 w-48 space-y-2">
                          <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-cyan-400 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[8px] text-cyan-400 font-bold">Alex:</span>
                              <span className="text-[8px] text-white leading-tight">Nice headshot! 🔥</span>
                            </div>
                          </div>
                          <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-pink-400 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[8px] text-pink-400 font-bold">Sarah:</span>
                              <span className="text-[8px] text-white leading-tight">Sent a Heart! ❤️</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Users size={16} />
                          </div>
                          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                            <Gamepad2 size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <InteractiveToolsSection 
                      onOpenGoLive={() => setIsGoLiveModalOpen(true)} 
                      onOpenARPreview={() => {
                        setArInitialTab('beauty');
                        setIsARPreviewOpen(true);
                      }}
                      onOpenTransform={() => {
                        setArInitialTab('transform');
                        setIsARPreviewOpen(true);
                      }}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Play Center */}
            <section className="space-y-4">
              <div className="flex items-center justify-between ml-2">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Play Center</h2>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Various play styles</span>
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                  {playCenterIcons.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => showToast(`${item.label} feature coming soon! 🎮`, 'info')}
                      className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-active:scale-95",
                        item.color
                      )}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight text-center leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center space-y-8">
            <div className="w-48 h-48 bg-white rounded-3xl shadow-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-50" />
              <img src="https://picsum.photos/seed/agent/400/400" className="w-32 h-32 object-contain relative z-10" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">Be a BINGO LIVE agent</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Share the platform profits<br/>
                Get host recruitment and management tools
              </p>
            </div>
            <div className="w-full space-y-3">
              <button className="w-full py-4 bg-cyan-400 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-lg shadow-cyan-400/20 active:scale-[0.98] transition-all">
                Apply to become an agent
              </button>
              <button className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase italic tracking-widest text-sm active:scale-[0.98] transition-all">
                Apply to be an administrator/agent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Go Live Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 z-50 sm:bottom-8">
        <button 
          onClick={() => setIsGoLiveModalOpen(true)}
          className="w-full max-w-md mx-auto py-5 bg-cyan-400 text-white rounded-full font-black uppercase italic tracking-[0.2em] shadow-[0_15px_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          Go Live
        </button>
      </div>

      <AnimatePresence>
        {isGoLiveModalOpen && (
          <GoLiveModal onClose={() => setIsGoLiveModalOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isARPreviewOpen && (
          <ARPreviewModal 
            isOpen={isARPreviewOpen} 
            onClose={() => setIsARPreviewOpen(false)} 
            initialTab={arInitialTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
