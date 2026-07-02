import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Trophy, Star, Clock, Flame, Shield, 
  Sparkles, CheckCircle2, ChevronRight, MessageSquare, 
  Gift, Swords, Users, Zap, TrendingUp, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { ClipRecorder } from './ClipRecorder';
import { HighlightsGallery } from './HighlightsGallery';

interface StreamerTaskCenterProps {
  onClose: () => void;
  streamDuration?: number; // In seconds, passed from GoLivePage or RoomPage
  beansEarned?: number;     // Beans earned during current session
  pkBattlesPlayed?: number; // Count of PK battles played during session
  chatMessageCount?: number; // Host's sent messages count
  defaultTab?: 'Daily' | 'Weekly' | 'Milestones' | 'Clips';
}

interface Task {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardBeans: number;
  claimed: boolean;
  icon: any;
  color: string;
}

export function StreamerTaskCenter({ 
  onClose, 
  streamDuration = 320, // default dummy values if not provided
  beansEarned = 150,
  pkBattlesPlayed = 1,
  chatMessageCount = 2,
  defaultTab = 'Daily'
}: StreamerTaskCenterProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Milestones' | 'Clips'>(defaultTab);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [beansClaimedCount, setBeansClaimedCount] = useState(0);

  // Load and sync tasks with current stream stats
  useEffect(() => {
    if (!profile) return;
    
    const storageKey = `streamer_tasks_${profile.uid}`;
    const savedTasksRaw = localStorage.getItem(storageKey);
    
    // Initial standard task list with current stats mapped
    const defaultTasks: Task[] = [
      {
        id: 'stream_time',
        title: 'Broadcast Milestone',
        description: 'Broadcast live for at least 5 minutes',
        target: 300, // 5 mins in seconds
        current: streamDuration,
        rewardBeans: 100,
        claimed: false,
        icon: Clock,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      },
      {
        id: 'receive_gift',
        title: 'Receive Gift Combo',
        description: 'Collect at least 50 Beans from stream gifts',
        target: 50,
        current: beansEarned,
        rewardBeans: 150,
        claimed: false,
        icon: Gift,
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
      },
      {
        id: 'host_messages',
        title: 'Active Interaction',
        description: 'Send at least 3 chat messages as the host',
        target: 3,
        current: chatMessageCount,
        rewardBeans: 50,
        claimed: false,
        icon: MessageSquare,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      },
      {
        id: 'pk_battle',
        title: 'PK Challenger',
        description: 'Participate in at least 1 PK battle',
        target: 1,
        current: pkBattlesPlayed,
        rewardBeans: 200,
        claimed: false,
        icon: Swords,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      }
    ];

    if (savedTasksRaw) {
      try {
        const parsed = JSON.parse(savedTasksRaw) as Task[];
        // Sync the dynamic current progress from live session with saved claims
        const synced = defaultTasks.map(defTask => {
          const matchedSaved = parsed.find(t => t.id === defTask.id);
          if (matchedSaved) {
            return {
              ...defTask,
              claimed: matchedSaved.claimed,
              // If not claimed, let progress update in real time
              current: matchedSaved.claimed ? defTask.target : Math.min(defTask.target, defTask.current)
            };
          }
          return defTask;
        });
        setTasks(synced);
      } catch (e) {
        setTasks(defaultTasks);
      }
    } else {
      setTasks(defaultTasks);
    }
  }, [profile, streamDuration, beansEarned, pkBattlesPlayed, chatMessageCount]);

  const saveTasksState = (updatedTasks: Task[]) => {
    if (!profile) return;
    const storageKey = `streamer_tasks_${profile.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
  };

  const handleClaim = async (taskId: string, reward: number) => {
    if (!profile) return;

    try {
      // 1. Update Firestore Database
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        beans: increment(reward),
        totalBeansEarned: increment(reward)
      });

      // 2. Update Local state
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, claimed: true, current: t.target };
        }
        return t;
      });
      setTasks(updated);
      saveTasksState(updated);
      
      setBeansClaimedCount(prev => prev + reward);
      showToast(`Missions completed! +${reward} Beans credited to your balance! 🎙️💎`, 'success');
    } catch (err) {
      console.error('Error claiming streamer task:', err);
      showToast('Connection delay. Please try again!', 'error');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none font-sans">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="relative w-full max-w-md bg-[#0b0f14] text-slate-100 rounded-[2.5rem] border border-cyan-500/20 overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] z-10 flex flex-col max-h-[85vh]"
      >
        {/* Top visual neon header effect */}
        <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500" />
        
        {/* Header bar */}
        <div className="p-6 shrink-0 flex items-center justify-between border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#00E5FF]/20 to-[#00E5FF]/5 rounded-xl flex items-center justify-center border border-[#00E5FF]/20 text-[#00E5FF]">
              <Trophy size={18} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block leading-none mb-1">Streamer Panel</span>
              <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Task Center</h3>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Level & Wallet Split Banner */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#121922] to-[#0d121a] border border-cyan-500/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <span className="font-mono text-xs font-black">Lv.{profile?.level || 1}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">Anchor Wallet</span>
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5 font-mono">
                ⭐ {profile?.beans?.toLocaleString() || 0} <span className="text-[10px] text-[#00cbd6] font-normal uppercase tracking-wider">Beans</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">Session Profit</span>
            <span className="text-xs font-extrabold text-emerald-400 font-mono">+{beansEarned} 🔥</span>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="px-6 mt-4 shrink-0">
          <div className="bg-[#141a24] p-1 rounded-xl flex gap-1">
            {(['Daily', 'Weekly', 'Milestones', 'Clips'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                "flex-1 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all",
                  activeTab === tab 
                    ? "bg-[#00E5FF] text-black shadow-sm font-extrabold" 
                    : "text-slate-400 hover:text-white bg-transparent"
                )}
              >
                {tab === 'Daily' ? 'Daily' : tab === 'Weekly' ? 'Weekly' : tab === 'Milestones' ? 'Milestones' : 'Clips'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content List Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar space-y-3.5">
          {activeTab === 'Daily' && (
            <div className="space-y-3">
              {tasks.map(task => {
                const isCompleted = task.current >= task.target;
                const progressPercent = Math.min(100, Math.round((task.current / task.target) * 100));
                
                return (
                  <div 
                    key={task.id} 
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col gap-3",
                      task.claimed 
                        ? "bg-black/20 border-white/[0.02] opacity-60" 
                        : "bg-[#141a24] border-white/[0.03] hover:border-white/[0.06]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", task.color)}>
                          <task.icon size={18} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-black text-white uppercase tracking-tight">{task.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium leading-snug mt-0.5">{task.description}</p>
                        </div>
                      </div>

                      {/* Right-aligned reward Beans badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-extrabold text-amber-400 font-mono">+{task.rewardBeans} Beans</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Reward</span>
                      </div>
                    </div>

                    {/* Progress Bar & Buttons */}
                    <div className="flex items-center gap-4 justify-between pt-1">
                      <div className="flex-1 space-y-1 text-left">
                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                          <span>Progress</span>
                          <span>
                            {task.id === 'stream_time' 
                              ? `${formatTime(task.current)} / ${formatTime(task.target)}` 
                              : `${task.current} / ${task.target}`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isCompleted ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" : "bg-[#00E5FF]"
                            )}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Interaction Actions */}
                      <div className="shrink-0">
                        {task.claimed ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] rounded-lg text-slate-500 text-[9px] font-black uppercase tracking-wider border border-white/5">
                            <CheckCircle2 size={12} className="text-slate-500" />
                            Claimed
                          </div>
                        ) : isCompleted ? (
                          <button
                            onClick={() => handleClaim(task.id, task.rewardBeans)}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 active:scale-95 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_3px_12px_rgba(16,185,129,0.3)]"
                          >
                            Claim
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-white/5 text-slate-500 border border-white/5 font-black uppercase text-[10px] tracking-widest rounded-xl cursor-not-allowed"
                          >
                            To Do
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'Weekly' && (
            <div className="space-y-3 text-center py-4 select-none">
              <div className="w-12 h-12 rounded-full bg-cyan-400/5 border border-cyan-400/15 flex items-center justify-center text-cyan-400 mx-auto mb-3">
                <Clock size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Weekly Streamer Marathon</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed mt-1">
                Accumulate streaming milestones throughout the calendar week to unlock exclusive corporate salary tiers and premium profile badges!
              </p>

              {/* Weekly Stat Rows */}
              <div className="grid grid-cols-2 gap-2 mt-5 text-left">
                <div className="bg-[#141a24] p-3 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-wider block">Weekly Target Hour</span>
                  <span className="font-mono text-xs font-black text-white block">4.5 / 10 Hours</span>
                  <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div className="bg-[#141a24] p-3 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[8px] uppercase text-slate-500 font-extrabold tracking-wider block">Weekly Beans Target</span>
                  <span className="font-mono text-xs font-black text-[#00cbd6] block">1,850 / 5,000 Beans</span>
                  <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '37%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Milestones' && (
            <div className="space-y-3.5 select-none">
              {/* Creator level milestones */}
              <div className="bg-[#141a24] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400 shrink-0">
                    <Star size={16} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-black text-white uppercase tracking-tight">Ecosystem Veteran</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Reach profile Experience Level 15</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 block font-bold uppercase">Reward</span>
                  <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest font-sans">Gold Badge 🎖️</span>
                </div>
              </div>

              <div className="bg-[#141a24] p-4 rounded-2xl border border-white/5 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-400/10 border border-purple-400/20 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                    <Shield size={16} />
                  </div>
                  <div className="text-left">
                    <h5 className="text-xs font-black text-white uppercase tracking-tight">S-Tier Commission Contract</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Amass 630,000 Lifetime Beans</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 block font-bold uppercase">Status</span>
                  <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest font-sans">In Progress 🛡️</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Clips' && (
            <div className="space-y-4">
              <ClipRecorder 
                streamerId={profile?.uid || 'default_streamer'} 
                onClipSaved={(clipId) => {
                  showToast('Highlight clip successfully saved to server! 🌟', 'success');
                }}
              />
              <div className="mt-4 pt-4 border-t border-white/[0.05]">
                <HighlightsGallery streamerId={profile?.uid || 'default_streamer'} />
              </div>
            </div>
          )}
        </div>

        {/* Action Bottom Section */}
        <div className="p-6 bg-black/30 border-t border-white/[0.04] flex items-center justify-between shrink-0">
          <div className="text-left select-none">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1">Missions status</span>
            <p className="text-xs font-bold text-slate-300">Keep active to boost visibility!</p>
          </div>
          
          <button
            onClick={() => {
              showToast('Broadcaster tip: Active interaction boosts your algorithm multiplier! 📈', 'info');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-[#00cbd6] hover:text-cyan-300 transition-colors flex items-center gap-1 active:scale-95"
          >
            Algorithm Tips <ChevronRight size={12} className="stroke-[2.5]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
