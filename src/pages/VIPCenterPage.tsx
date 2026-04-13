import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Info, ChevronRight, Star, Crown, Rocket, Bell, 
  MessageSquare, Gift, Eye, Zap, Smartphone, Mic, ShieldX,
  Users2, Trophy, Layout, User as UserIcon, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type VIPLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface Privilege {
  id: string;
  icon: any;
  label: string;
  description: string;
  category: 'personal' | 'live' | 'other';
  visual?: React.ReactNode;
}

const VIPStar = ({ className, color = "#cd7f32", level = 1, isIridescent = false }: { className?: string, color?: string, level?: number, isIridescent?: boolean }) => (
  <svg viewBox="0 0 200 200" className={className}>
    <defs>
      <linearGradient id={`starGradient-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
        {isIridescent ? (
          <>
            <motion.stop 
              offset="0%" 
              animate={{ stopColor: ['#3b82f6', '#a855f7', '#ec4899', '#ffd700', '#3b82f6'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.stop 
              offset="50%" 
              animate={{ stopColor: ['#ffffff', '#fdfcfb', '#ffffff'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.stop 
              offset="100%" 
              animate={{ stopColor: ['#ec4899', '#ffd700', '#3b82f6', '#a855f7', '#ec4899'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </>
        ) : (
          <>
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
          </>
        )}
      </linearGradient>
      <filter id={`glow-${level}`}>
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <motion.path
      d="M100 20 L120 80 L180 100 L120 120 L100 180 L80 120 L20 100 L80 80 Z"
      fill={`url(#starGradient-${level})`}
      filter={`url(#glow-${level})`}
      animate={{
        rotateY: [0, 360],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <motion.path
      d="M100 50 L110 90 L150 100 L110 110 L100 150 L90 110 L50 100 L90 90 Z"
      fill="white"
      opacity="0.3"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </svg>
);

export default function VIPCenterPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<VIPLevel>(1);
  const [selectedPrivilegeId, setSelectedPrivilegeId] = useState('medal');

  const levels: VIPLevel[] = [1, 2, 3, 4, 5, 6];

  const levelConfigs: Record<number, { color: string; range: string; description?: string; isIridescent?: boolean; secondaryColor?: string }> = {
    1: { color: "#cd7f32", range: "For LV.1-LV.9" },
    2: { color: "#3b82f6", range: "For LV.10-LV.29", description: "Exclusive live room privileges, accelerated level growth" },
    3: { color: "#ffd700", range: "For LV.30-LV.49", description: "Exclusive live room privileges, accelerated level growth" },
    4: { color: "#a855f7", range: "For LV.50-LV.59", description: "Exclusive live room privileges, accelerated level growth" },
    5: { color: "#ec4899", range: "For LV.60-LV.89", description: "Exclusive live room privileges, accelerated level growth", isIridescent: true },
    6: { color: "#a855f7", range: "For LV.90-LV.119", description: "Ultimate platform privileges, maximum level status", secondaryColor: "#ec4899" },
  };

  const config = levelConfigs[level];

  const privileges: Privilege[] = [
    { 
      id: 'medal', 
      icon: Star, 
      label: 'VIP Medal', 
      description: 'Enjoy exclusive VIP medals',
      category: 'personal',
      visual: <VIPStar className="w-48 h-48" color={config.color} level={level} isIridescent={config.isIridescent || level === 6} />
    },
    { 
      id: 'suit', 
      icon: UserIcon, 
      label: 'VIP Suit', 
      description: 'Enjoy VIP outfit set',
      category: 'personal',
      visual: (
        <div className="w-64 bg-[#1a1a1a] rounded-xl p-4 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-black text-black",
                  level === 1 ? "bg-[#cd7f32]" : 
                  level === 2 ? "bg-[#3b82f6]" :
                  level === 3 ? "bg-[#ffd700]" :
                  level === 4 ? "bg-[#a855f7]" : 
                  level === 6 ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899]" : "bg-[#ec4899]"
                )}>V{level}</div>
              </div>
              <div className="h-2 w-16 bg-white/5 rounded mt-2" />
            </div>
          </div>
        </div>
      )
    },
    { 
      id: 'boost', 
      icon: Rocket, 
      label: 'Level-up boost', 
      description: `Earn an extra ${level >= 6 ? 10 : 5}% wealth value for faster leveling up.`,
      category: 'live',
      visual: (
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Rocket size={80} style={{ color: config.color }} className="fill-current opacity-20" />
          <Rocket size={80} style={{ color: config.color }} className="absolute inset-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full blur-sm" />
        </motion.div>
      )
    },
    { 
      id: 'mystery', 
      icon: ShieldX, 
      label: 'Mystery Man Privilege', 
      description: `Enjoy ${level >= 6 ? 3 : level >= 5 ? 1 : 0} days of mystery man privilege each month during the validity period.`,
      category: 'live',
      visual: (
        <div className="relative">
          <div className="w-32 h-32 bg-white/5 rounded-full border-4 border-white/10 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <UserIcon size={64} className="text-white/20" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="w-12 h-12 bg-black rounded-full border-2 border-white/20 flex items-center justify-center">
                <span className="text-xl">🕵️‍♂️</span>
              </div>
            </div>
          </div>
          {level >= 5 && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-4 border-2 border-dashed rounded-full"
              style={{ borderColor: config.color }}
            />
          )}
        </div>
      )
    },
    { 
      id: 'invisibility', 
      icon: Eye, 
      label: 'Wealth Invisibility Privilege', 
      description: `Enjoy ${level >= 6 ? 3 : level >= 5 ? 2 : level === 4 ? 1 : 0} days of free stealth privileges each month during the validity period.`,
      category: 'live',
      visual: (
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-40 h-24 bg-gradient-to-br from-purple-600 to-black rounded-full border-2 flex items-center justify-center relative overflow-hidden"
            style={{ borderColor: config.color }}
          >
            <div className="absolute inset-0 bg-white/5" />
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20" />
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20" />
            </div>
            <Star size={16} className="absolute top-2 right-8 text-yellow-400 fill-yellow-400" />
          </motion.div>
        </div>
      )
    },
    { 
      id: 'notification', 
      icon: Bell, 
      label: 'Activation Notification', 
      description: `Activate VIP in the live room to enjoy the Activation Notification: visible in ${level >= 6 ? 'live rooms across the entire platform' : level >= 4 ? 'multiple live rooms' : 'this live room'}.`,
      category: 'live',
      visual: (
        <div className="w-72 bg-black/40 backdrop-blur-md border rounded-lg p-3 flex items-center justify-between gap-3" style={{ borderColor: `${config.color}4d` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <p className="text-[10px] font-medium">
              <span style={{ color: config.color }}>Dino</span> activated <span style={{ color: config.color }}>VIP{level}</span> in Dino's live room!
            </p>
          </div>
          {level >= 4 && (
            <div className="px-2 py-1 bg-[#ffd700] rounded text-[8px] font-black text-black">JOIN</div>
          )}
        </div>
      )
    },
    { 
      id: 'entry', 
      icon: Zap, 
      label: 'Entry Notification', 
      description: 'Gain exclusive VIP entry effects.',
      category: 'live',
      visual: (
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 300 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="flex flex-col items-center"
          >
            {level === 1 ? (
              <div className="relative">
                <Smartphone size={48} style={{ color: config.color }} />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-black rounded-full border border-white/20" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black rounded-full border border-white/20" />
              </div>
            ) : level <= 3 ? (
              <div className="relative">
                <div className="w-28 h-10 bg-white/10 rounded-lg skew-x-[-25deg] border-2 relative overflow-hidden" style={{ borderColor: config.color }}>
                  {level === 3 && (
                    <motion.div 
                      animate={{ x: [-100, 200] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />
                  )}
                </div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-black rounded-full border-2" style={{ borderColor: config.color }} />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-black rounded-full border-2" style={{ borderColor: config.color }} />
              </div>
            ) : level === 4 ? (
              <div className="relative">
                {/* Yacht Body */}
                <div className="w-36 h-12 bg-white rounded-b-[2rem] border-2 relative overflow-hidden shadow-[0_10px_20px_rgba(168,85,247,0.4)]" style={{ borderColor: config.color }}>
                  <div className="absolute top-0 left-0 w-full h-4 bg-white/20 border-b border-white/10" />
                  <div className="absolute top-1 right-4 w-8 h-2 bg-black/20 rounded-full" />
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -bottom-2 left-0 right-0 h-4 bg-purple-500/40 blur-md"
                  />
                </div>
                {/* Yacht Cabin */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/90 rounded-t-3xl border-2 border-b-0" style={{ borderColor: config.color }}>
                  <div className="absolute top-2 left-2 right-2 h-3 bg-blue-400/30 rounded-t-xl" />
                </div>
              </div>
            ) : level === 5 ? (
              <div className="relative">
                {/* Helicopter Body */}
                <div className="w-24 h-12 bg-[#1a1a1a] rounded-full border-2 relative shadow-2xl" style={{ borderColor: config.color }}>
                  {/* Main Rotor */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full blur-[1px]"
                  />
                  {/* Tail */}
                  <div className="absolute top-2 -left-12 w-14 h-3 bg-[#1a1a1a] border-2 border-r-0 rounded-l-full" style={{ borderColor: config.color }}>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full border-white/20"
                    />
                  </div>
                  {/* Cockpit */}
                  <div className="absolute top-1 right-2 w-10 h-6 bg-blue-400/20 rounded-full border border-white/10" />
                  {/* Skids */}
                  <div className="absolute -bottom-3 left-4 right-4 h-1 bg-white/40 rounded-full" />
                  <div className="absolute -bottom-3 left-6 w-1 h-3 bg-white/20" />
                  <div className="absolute -bottom-3 right-6 w-1 h-3 bg-white/20" />
                </div>
                {/* Searchlight */}
                <motion.div 
                  animate={{ opacity: [0.2, 0.8, 0.2], x: [-10, 10, -10] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full blur-xl"
                />
              </div>
            ) : level === 6 ? (
              <div className="relative">
                {/* Private Jet Body */}
                <div className="w-40 h-10 bg-white rounded-full border-2 relative shadow-2xl overflow-hidden" style={{ borderColor: config.color }}>
                  <div className="absolute top-0 left-0 w-full h-4 bg-white/20" />
                  <div className="absolute top-2 left-10 flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-2 h-2 bg-blue-400/20 rounded-full" />
                    ))}
                  </div>
                  <motion.div 
                    animate={{ x: [-100, 200] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </div>
                {/* Wings */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-white rounded-full border-2" style={{ borderColor: config.color }} />
                {/* Tail Fin */}
                <div className="absolute -top-4 left-4 w-8 h-8 bg-white border-2 border-b-0 rounded-t-lg skew-x-[20deg]" style={{ borderColor: config.color }} />
                {/* Engine Glow */}
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute top-2 -left-4 w-6 h-6 bg-purple-500/40 rounded-full blur-md"
                />
                {/* Trail */}
                <div className="absolute top-4 -left-20 flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                      className="text-white/40 text-[8px]"
                    >
                      ✦
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 px-3 py-1 bg-black/60 rounded-full border text-[10px] whitespace-nowrap" style={{ borderColor: `${config.color}80` }}>
              User name is coming
            </div>
          </motion.div>
        </div>
      )
    },
    { 
      id: 'ranking', 
      icon: Trophy, 
      label: 'Top Audience Ranking', 
      description: 'Priority display on the live room leaderboard.',
      category: 'live',
      visual: (
        <div className="w-64 bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10">
          <div className="p-3 border-b border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">Leaderboard</div>
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("p-3 flex items-center gap-3", i === 1 && "bg-white/5")}>
              <span className={cn("text-xs font-black", i === 1 ? "text-white" : "text-white/20")} style={i === 1 ? { color: config.color } : {}}>{i}</span>
              <div className="w-6 h-6 rounded-full bg-white/5" />
              <div className="flex-1 h-2 bg-white/10 rounded" />
              {i === 1 && <div className="px-1 py-0.5 rounded text-[6px] font-black text-black" style={{ backgroundColor: config.color }}>V{level}</div>}
            </div>
          ))}
        </div>
      )
    },
    { 
      id: 'bullet', 
      icon: MessageSquare, 
      label: 'Bullet Privileges', 
      description: `Users can enjoy ${level >= 6 ? 25 : level >= 5 ? 20 : 5} free bullet chats each day.`,
      category: 'live',
      visual: (
        <div className="w-full h-12 bg-black/20 relative overflow-hidden flex items-center">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-2 px-4 py-1 rounded-full border"
            style={{ 
              background: `linear-gradient(to right, ${config.color}4d, transparent)`,
              borderColor: `${config.color}4d`
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/20" />
            <span className="text-[10px] font-bold whitespace-nowrap">VIP Bullet Message!</span>
          </motion.div>
        </div>
      )
    },
    { 
      id: 'bubble', 
      icon: Layout, 
      label: 'Comment Bubble', 
      description: 'Have a VIP exclusive comment bubble.',
      category: 'live',
      visual: (
        <div className="flex flex-col gap-2">
          <div className="bg-[#1a1a1a] border rounded-2xl rounded-tl-none p-3 max-w-[200px] relative" style={{ borderColor: `${config.color}4d` }}>
            <div className="absolute -top-2 -left-2 px-1 py-0.5 rounded text-[6px] font-black text-black" style={{ backgroundColor: config.color }}>V{level}</div>
            <p className="text-xs">Dino excited to be here!</p>
          </div>
          <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 max-w-[150px]">
            <p className="text-xs text-white/60">Hello</p>
          </div>
        </div>
      )
    },
    { 
      id: 'gifts', 
      icon: Gift, 
      label: 'VIP Gifts', 
      description: 'Unlock exclusive gifts',
      category: 'live',
      visual: (
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-32 h-32 rounded-xl flex items-center justify-center shadow-2xl relative" style={{ background: `linear-gradient(to bottom, ${config.color}, #000)` }}>
            <div className="absolute inset-2 border border-white/20 rounded-lg" />
            {level >= 6 ? (
              <div className="relative">
                <div className="w-16 h-20 bg-yellow-400/20 rounded-t-full border-2 border-yellow-400/40 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-400/40 rounded-full -mt-2" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-yellow-400/20 rounded-full" />
              </div>
            ) : (
              <Crown size={48} className="text-white/80" />
            )}
          </div>
        </motion.div>
      )
    },
    { 
      id: 'frame', 
      icon: Smartphone, 
      label: 'Solo Live Video Call Frame', 
      description: 'Have a VIP exclusive video call frame.',
      category: 'live',
      visual: (
        <div className="w-32 h-48 bg-black rounded-2xl border-4 relative overflow-hidden" style={{ borderColor: config.color }}>
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute inset-2 border border-white/10 rounded-xl" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/10" />
        </div>
      )
    },
    { 
      id: 'audio', 
      icon: Mic, 
      label: 'Multi-Room Audio Circle', 
      description: 'Have a VIP exclusive audio circle',
      category: 'live',
      visual: (
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <UserIcon size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
          </div>
          <motion.div 
            animate={config.isIridescent ? { 
              rotate: 360,
              borderColor: ['#3b82f6', '#a855f7', '#ec4899', '#ffd700', '#3b82f6']
            } : { rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-2 border-dashed rounded-full"
            style={{ borderColor: config.color }}
          />
        </div>
      )
    },
    { 
      id: 'visitor', 
      icon: Eye, 
      label: 'Visitor Privileges', 
      description: 'Check the information of 200 visitors',
      category: 'other',
      visual: (
        <div className="relative">
          <Eye size={80} style={{ color: config.color }} />
          <motion.div 
            animate={config.isIridescent ? { 
              scale: [1, 1.2, 1],
              backgroundColor: ['#3b82f6', '#a855f7', '#ec4899', '#ffd700', '#3b82f6']
            } : { scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full blur-md opacity-60" 
            style={{ backgroundColor: config.color }}
          />
        </div>
      )
    },
    { 
      id: 'realmatch', 
      icon: Users2, 
      label: 'Realmatch Privileges', 
      description: 'Enjoy 1,000 card-swiping opportunities each day.',
      category: 'other',
      visual: (
        <div className="flex gap-2">
          {[1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ rotate: i === 1 ? [-5, 5, -5] : [5, -5, 5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-32 bg-white/10 rounded-xl border-2 flex items-center justify-center relative"
              style={{ borderColor: config.color }}
            >
              <div className="w-12 h-12 rounded-full bg-white/5" />
              <div className="absolute top-2 left-2 px-1 bg-green-500 rounded text-[6px] font-black">HI!</div>
            </motion.div>
          ))}
          <motion.div 
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500"
          >
            ❤️
          </motion.div>
        </div>
      )
    },
    { 
      id: 'starhunt', 
      icon: Star, 
      label: 'Star Hunt Privileges', 
      description: 'When participating in the Star Hunt game, you can enjoy the privilege of doubled chances to win the grand prize.',
      category: 'other',
      visual: (
        <div className="flex -space-x-4">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -10 * i, 0] }}
              transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
              className="w-20 h-28 rounded-lg border border-white/20 shadow-xl flex items-center justify-center"
              style={{ background: `linear-gradient(to bottom right, ${config.color}, #000)` }}
            >
              <Star size={24} className="text-white/40" />
            </motion.div>
          ))}
        </div>
      )
    },
    { 
      id: 'prediction', 
      icon: TrendingUp, 
      label: 'Boosted Predictions', 
      description: 'Gain exclusive access to Model 2 predictions with dynamic multipliers for higher potential payouts.',
      category: 'other',
      visual: (
        <div className="relative">
          <TrendingUp size={80} style={{ color: config.color }} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 rounded-full blur-2xl"
          />
        </div>
      )
    }
  ];

  const selectedPrivilege = privileges.find(p => p.id === selectedPrivilegeId) || privileges[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col select-none">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{config.range}</p>
              <h1 className="text-xl font-black italic tracking-tight">V{level}</h1>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-[10px] font-black text-white/60">VIP Diamonds 0 (0 to be released)</span>
            <ChevronRight size={14} className="text-white/20" />
          </button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-32 overflow-y-auto">
        {/* Hero Section */}
        <div className="px-6 flex flex-col items-center mb-8">
          <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full blur-3xl opacity-30" style={{ background: `linear-gradient(to bottom, ${config.color}, transparent)` }} />
            <VIPStar className="w-full h-full" color={config.color} level={level} isIridescent={config.isIridescent} />
            <div className="absolute bottom-0 w-48 h-4 bg-black/40 blur-xl rounded-full" />
          </div>
          {config.description && (
            <motion.p 
              key={level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs font-bold text-white/60 mt-4 max-w-[200px]"
            >
              {config.description}
            </motion.p>
          )}
        </div>

        {/* Level Selector */}
        <div className="px-6 mb-12">
          <div className="relative h-1 bg-white/5 rounded-full mb-6">
            <div 
              className="absolute h-full rounded-full transition-all duration-500"
              style={{ width: `${((level - 1) / 5) * 100}%`, backgroundColor: config.color }}
            />
            <div className="absolute inset-0 flex justify-between -top-1.5">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className="relative group"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    level === l ? "border-white scale-125 shadow-lg" : 
                    level > l ? "" : "bg-black border-white/10"
                  )} style={{ 
                    backgroundColor: level >= l ? levelConfigs[l].color : 'transparent',
                    borderColor: level === l ? 'white' : level > l ? levelConfigs[l].color : 'rgba(255,255,255,0.1)',
                    boxShadow: level === l ? `0 0 15px ${config.color}` : 'none'
                  }} />
                  <span className={cn(
                    "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black transition-colors",
                    level === l ? "text-white" : "text-white/20"
                  )}>
                    V{l}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privilege Detail Card */}
        <div className="px-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: `linear-gradient(to right, transparent, ${config.color}, transparent)` }} />
            
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: config.color }}>
                {selectedPrivilege.category === 'personal' ? 'Personal Privileges' : 
                 selectedPrivilege.category === 'live' ? 'Live Room Privileges' : 'Other Privileges'}
              </p>
              <div className="h-px w-12 mx-auto" style={{ backgroundColor: `${config.color}4d` }} />
            </div>

            <div className="h-48 flex items-center justify-center mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedPrivilege.id}-${level}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                >
                  {selectedPrivilege.visual}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black italic flex items-center justify-center gap-2">
                <span style={{ color: config.color }}>✦</span>
                {selectedPrivilege.label}
                <span style={{ color: config.color }}>✦</span>
              </h3>
              <p className="text-sm text-white/40 font-medium leading-relaxed max-w-[240px]">
                {selectedPrivilege.description}
              </p>
            </div>
          </div>
        </div>

        {/* Icon Sub-Navigator */}
        <div className="px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 pb-4">
            {privileges.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrivilegeId(p.id)}
                className={cn(
                  "flex-none w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border",
                  selectedPrivilegeId === p.id 
                    ? "border-white/20 text-black shadow-lg" 
                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                )}
                style={selectedPrivilegeId === p.id ? { 
                  backgroundColor: config.color,
                  boxShadow: `0 0 20px ${config.color}4d`
                } : {}}
              >
                <p.icon size={24} />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
        <button 
          className="w-full py-4 text-black font-black text-lg uppercase italic tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-transform"
          style={{ 
            background: `linear-gradient(to right, #000, ${config.color}, #000)`,
            boxShadow: `0 10px 30px ${config.color}4d`
          }}
        >
          Purchase
        </button>
      </div>
    </div>
  );
}
