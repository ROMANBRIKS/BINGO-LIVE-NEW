import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Trophy, 
  ChevronRight, 
  Calendar, 
  Video, 
  UserPlus, 
  MessageCircle, 
  Share2, 
  Gift, 
  Zap, 
  CreditCard, 
  X,
  Star,
  Lock,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'Active Tasks' | 'LIVE PASS' | 'Diamond Mission';

export default function TaskCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Active Tasks');
  const [showSplash, setShowSplash] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [diamondTab, setDiamondTab] = useState<'Daily' | 'Weekly'>('Daily');

  const [signedIn, setSignedIn] = useState(false);

  const tutorialMessages = [
    "The more tasks you complete, the more donuts you earn, which can be fed to your pet.",
    "Feeding your pet helps it level up and unlock exclusive badges and rewards!",
    "Check the LIVE PASS for seasonal rewards. Premium members get 5x more value!",
    "Complete Diamond Missions to earn extra currency and special gift packs."
  ];

  const handleNextTutorial = () => {
    if (tutorialStep < tutorialMessages.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      setTutorialStep(-1); // Finish tutorial
    }
  };

  const handleSignIn = () => {
    if (!signedIn) {
      setSignedIn(true);
      // In a real app, we'd update the database here
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-[100] flex flex-col font-sans overflow-hidden">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-gradient-to-b from-[#e0f7fa] to-[#ffffff] flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={() => setShowSplash(false)}
              className="absolute top-12 right-6 text-[#8e9aaf] text-sm font-bold active:scale-95 transition-transform"
            >
              Skip
            </button>
            
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-[#5d4037] text-xl font-black">All-New Pet Features Now Available</h1>
              <p className="text-[#ffb300] text-sm font-bold uppercase tracking-widest">Your Level Title</p>
            </div>

            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-48 h-48 bg-gradient-to-b from-[#9c27b0] to-[#673ab7] rounded-[2rem] flex flex-col items-center justify-center p-4 shadow-xl">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#ffeb3b" className="text-[#ffeb3b]" />)}
                </div>
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2">
                   <img src="https://picsum.photos/seed/pet/100/100" alt="Pet" className="w-20 h-20 object-contain" />
                </div>
                <span className="text-white font-black text-xl italic uppercase tracking-tighter">Challenger</span>
              </div>
            </motion.div>

            <button 
              onClick={() => setShowSplash(false)}
              className="mt-12 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center border border-gray-200 shadow-lg active:scale-90 transition-transform"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white pt-12 pb-2 px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform"><ChevronLeft size={24} className="text-gray-800" /></button>
          <div className="flex gap-8">
            {(['Active Tasks', 'LIVE PASS', 'Diamond Mission'] as Tab[]).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-sm font-bold transition-all relative pb-2",
                  activeTab === tab ? "text-gray-900" : "text-gray-400"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
          <button className="p-1 active:scale-90 transition-transform"><MoreHorizontal size={24} className="text-gray-800" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] pb-10">
        {activeTab === 'Active Tasks' && (
          <div className="p-4 space-y-4">
            {/* Pet Section */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 relative overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">D</div>
                <div className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Lv.1</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-cyan-400" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">0/100</span>
                </div>
              </div>

              <div className="flex flex-col items-center py-8">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-40 h-48 bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] rounded-full flex items-center justify-center shadow-inner relative"
                >
                  <div className="absolute inset-4 border-4 border-white/30 rounded-full border-dashed" />
                  <img src="https://picsum.photos/seed/egg/200/200" alt="Egg" className="w-32 h-32 object-contain" />
                </motion.div>
                
                <div className="mt-4 flex items-center gap-4">
                  <button className="flex flex-col items-center gap-1 active:scale-95 transition-transform">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <Trophy size={18} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">List</span>
                  </button>
                  <button className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 active:scale-95 transition-transform">
                    <span className="text-sm font-black text-gray-800">0g</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Tutorial Ghost */}
              {tutorialStep >= 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-[#263238]/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 z-10 shadow-2xl">
                  <div className="w-12 h-12 shrink-0">
                    <img src="https://picsum.photos/seed/ghost/100/100" alt="Ghost" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold leading-relaxed">
                      {tutorialMessages[tutorialStep]}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {tutorialMessages.map((_, i) => (
                        <div key={i} className={cn("h-1 rounded-full transition-all", i === tutorialStep ? "w-4 bg-cyan-400" : "w-1 bg-white/20")} />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={handleNextTutorial}
                    className="bg-white text-gray-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    {tutorialStep === tutorialMessages.length - 1 ? 'Got it' : 'Next'}
                  </button>
                </div>
              )}
            </div>

            {/* Challenger Rank */}
            <button className="w-full bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-50 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9c27b0] to-[#673ab7] rounded-xl flex items-center justify-center shadow-lg">
                  <img src="https://picsum.photos/seed/rank/50/50" alt="Rank" className="w-8 h-8 object-contain" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black italic uppercase tracking-tight text-gray-800">Challenger</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience Points 11290</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>

            {/* Monthly Benefits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Monthly Benefits</h4>
                <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1 active:opacity-60 transition-opacity">Details <ChevronRight size={12} /></button>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                <div className="min-w-[160px] bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                    <CreditCard size={20} className="text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-800 leading-tight">Recharge Coupon</p>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Out of Stock</span>
                  </div>
                </div>
                <div className="min-w-[160px] bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
                    <Gift size={20} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-800 leading-tight">Pet Gift Pack</p>
                    <button className="mt-1 px-3 py-1 bg-cyan-400 text-white rounded-full text-[9px] font-black uppercase active:scale-95 transition-transform">Claim</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign-in Rewards */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <Calendar size={14} className="text-white" />
                  </div>
                  <h4 className="text-sm font-black italic uppercase tracking-tight text-gray-800">Sign-in Rewards</h4>
                </div>
                <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1 active:opacity-60 transition-opacity">Calendar <ChevronRight size={12} /></button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { day: 'Today', icon: '🎁', active: true },
                  { day: '4.7', icon: '📦', active: false },
                  { day: '4.8', icon: '💎', active: false },
                  { day: '4.9', icon: '🎟️', active: false },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-full aspect-square rounded-2xl flex items-center justify-center text-xl shadow-sm border transition-all",
                      item.active ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-100"
                    )}>
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{item.day}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSignIn}
                disabled={signedIn}
                className={cn(
                  "w-full py-4 font-black uppercase tracking-[0.2em] rounded-full shadow-lg active:scale-95 transition-all",
                  signedIn ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-cyan-400 text-white"
                )}
              >
                {signedIn ? 'Signed In' : 'Sign in'}
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Task Rewards</h4>
              <div className="space-y-2">
                {[
                  { icon: <Video className="text-cyan-400" />, title: 'Watch live for 15s', progress: '0/1', rewards: ['+5g', '+10'] },
                  { icon: <UserPlus className="text-pink-400" />, title: 'Follow other users', progress: '0/10', rewards: ['+5g', '+10'] },
                  { icon: <MessageCircle className="text-blue-400" />, title: 'Chat in live room', progress: '0/10', rewards: ['+5g', '+10'] },
                  { icon: <Share2 className="text-orange-400" />, title: 'Share live room', progress: '0/5', rewards: ['+5g', '+10'] },
                ].map((task, i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center">
                        {task.icon}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800">{task.title} ({task.progress})</h5>
                        <div className="flex gap-2 mt-1">
                          {task.rewards.map((r, idx) => (
                            <span key={idx} className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                              {r.includes('g') ? '🍩' : '⭐'} {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-cyan-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-transform">Go</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LIVE PASS' && (
          <div className="p-4 space-y-6">
            <div className={cn(
              "rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl transition-all duration-500",
              isPremium ? "bg-gradient-to-br from-[#ffd700] to-[#ff8c00]" : "bg-gradient-to-br from-[#4a148c] to-[#7b1fa2]"
            )}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {isPremium ? 'Premium Pass' : 'Live Pass'}
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    <Clock size={12} />
                    Ends in: 4d 5h 42m
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-black italic">5</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Lv.5</span>
                      <span>8950/9600</span>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full transition-all duration-1000",
                        isPremium ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]",
                        "w-[85%]"
                      )} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 active:bg-white/20 transition-colors">Points Rule</button>
                  <button 
                    onClick={() => setIsPremium(!isPremium)}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all",
                      isPremium ? "bg-white text-orange-500" : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                    )}
                  >
                    {isPremium ? 'Active' : 'Premium Pass'}
                  </button>
                </div>
              </div>
            </div>

            {/* Rewards Table */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
                <div className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Level</div>
                <div className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Free</div>
                <div className={cn(
                  "p-4 text-[10px] font-black uppercase tracking-widest text-center transition-colors",
                  isPremium ? "text-orange-500" : "text-purple-600"
                )}>Premium</div>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { lv: 1, free: null, premium: '🎁' },
                  { lv: 2, free: '🎫', premium: '🎟️' },
                  { lv: 3, free: '⭐', premium: '💎' },
                  { lv: 4, free: null, premium: '📦' },
                  { lv: 5, free: '🎁', premium: '🏎️' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 items-center min-h-[80px]">
                    <div className="flex flex-col items-center justify-center border-r border-gray-50 h-full">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black italic text-gray-400">{row.lv}</div>
                    </div>
                    <div className="flex items-center justify-center border-r border-gray-50 h-full p-2">
                      {row.free ? (
                         <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm">{row.free}</div>
                      ) : <Lock size={16} className="text-gray-200" />}
                    </div>
                    <div className={cn(
                      "flex items-center justify-center h-full p-2 transition-colors",
                      isPremium ? "bg-orange-50/30" : "bg-purple-50/30"
                    )}>
                      <div className={cn(
                        "w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-md border relative transition-all",
                        isPremium ? "border-orange-100 scale-110" : "border-purple-100"
                      )}>
                        {row.premium}
                        {!isPremium && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                            <Lock size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Diamond Mission' && (
          <div className="p-4 space-y-6">
            {/* Diamond Progress */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="60" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle cx="64" cy="64" r="60" fill="none" stroke="#00e5ff" strokeWidth="8" strokeDasharray="377" strokeDashoffset="100" strokeLinecap="round" />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-gray-800">4</span>
                  <div className="w-6 h-6 bg-cyan-400 rounded-lg flex items-center justify-center mt-1">
                    <Zap size={14} className="text-white" fill="white" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Complete 2 more tasks to get</p>
              <button className="px-10 py-3 bg-gray-100 text-gray-400 rounded-full text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-transform">Receive</button>
            </div>

            {/* Mission Tabs */}
            <div className="space-y-4">
              <div className="flex gap-6 px-2">
                <button 
                  onClick={() => setDiamondTab('Daily')}
                  className={cn(
                    "text-sm font-black italic uppercase tracking-tight relative pb-1 transition-colors",
                    diamondTab === 'Daily' ? "text-gray-800" : "text-gray-400"
                  )}
                >
                  Daily Mission
                  {diamondTab === 'Daily' && <motion.div layoutId="diamondTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                </button>
                <button 
                  onClick={() => setDiamondTab('Weekly')}
                  className={cn(
                    "text-sm font-black italic uppercase tracking-tight relative pb-1 transition-colors",
                    diamondTab === 'Weekly' ? "text-gray-800" : "text-gray-400"
                  )}
                >
                  Weekly Mission
                  {diamondTab === 'Weekly' && <motion.div layoutId="diamondTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                </button>
              </div>

              <div className="space-y-3">
                {(diamondTab === 'Daily' ? [
                  { icon: '🎁', title: 'Send any Gift and consume 20 diamonds', progress: '0/20', path: '/store' },
                  { icon: '💰', title: 'Recharge 160 diamonds', progress: '0/160', path: '/wallet' },
                  { icon: '📺', title: 'Watch live for 3 minutes', progress: '3/3', completed: true, path: '/' },
                ] : [
                  { icon: '💎', title: 'Recharge 1000 diamonds total', progress: '450/1000', path: '/wallet' },
                  { icon: '🔥', title: 'Win 5 PK battles', progress: '2/5', path: '/pk' },
                  { icon: '👑', title: 'Become a Noble member', progress: '0/1', path: '/noble-center' },
                ]).map((mission, i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                        {mission.icon}
                      </div>
                      <div className="max-w-[160px]">
                        <h5 className="text-[11px] font-bold text-gray-800 leading-tight mb-1">{mission.title}</h5>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn("h-full bg-cyan-400", mission.completed ? "w-full" : "w-1/3")} />
                          </div>
                          <span className="text-[9px] font-bold text-gray-400">{mission.progress}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => mission.path && navigate(mission.path)}
                      className={cn(
                        "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                        mission.completed ? "bg-gray-100 text-gray-400" : "bg-white border border-cyan-400 text-cyan-400"
                      )}
                    >
                      {mission.completed ? 'Claimed' : 'To Finish'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
  return <ChevronRight size={size} className={cn("rotate-90", className)} />;
}

function ChatMessage({ message }: { message: any }) {
  return (
    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/5">
      <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-[8px] font-black text-white">
        {message.level}
      </div>
      <span className="text-[10px] font-bold text-white/60">{message.displayName}:</span>
      <span className="text-[10px] font-medium text-white">{message.text}</span>
    </div>
  );
}
