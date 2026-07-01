import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, HelpCircle, Users, Clock, Trophy, 
  Shield, Star, Sparkles, TrendingUp, Info
} from 'lucide-react';
import { Family, FamilyMember } from '../types';
import { cn } from '../lib/utils';
import { getFamilyRankInfo, getMonthlyTarget } from '../lib/familyLogic';

interface FamilyDetailsPopupProps {
  family: Family;
  onClose: () => void;
}

export const FamilyDetailsPopup_Old: React.FC<FamilyDetailsPopupProps> = ({ family, onClose }) => {
  const rankInfo = getFamilyRankInfo(family.combatPoints || 0);
  const monthlyTarget = family.monthlyTarget || getMonthlyTarget(rankInfo.globalLevel);
  const monthlyPoints = family.monthlyPoints || 0;
  const daysLeft = 7; // This should ideally come from a scheduled reset logic
  const memberLimit = family.memberLimit || 360;

  const members: FamilyMember[] = [
    { uid: '1', displayName: 'Leader', photoURL: 'https://i.pravatar.cc/100?u=f1', role: 'leader', joinedAt: new Date(), contributionPoints: 5000 },
    { uid: '2', displayName: 'Member 2', photoURL: 'https://i.pravatar.cc/100?u=f2', role: 'member', joinedAt: new Date(), contributionPoints: 3000 },
    { uid: '3', displayName: 'Member 3', photoURL: 'https://i.pravatar.cc/100?u=f3', role: 'member', joinedAt: new Date(), contributionPoints: 2500 },
    { uid: '4', displayName: 'Member 4', photoURL: 'https://i.pravatar.cc/100?u=f4', role: 'member', joinedAt: new Date(), contributionPoints: 1500 },
    { uid: '5', displayName: 'Member 5', photoURL: 'https://i.pravatar.cc/100?u=f5', role: 'member', joinedAt: new Date(), contributionPoints: 1000 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 font-roboto"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full h-full md:max-w-md bg-[#0d1117] overflow-hidden flex flex-col"
      >
        {/* Navigation Header */}
        <div className="p-4 flex items-center">
          <button onClick={onClose} className="text-white/80">
            <ChevronLeft size={32} />
          </button>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[17px] font-bold text-white">Apr 23, 2026</span>
            <span className="text-[13px] text-white/40">12:56 PM</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
          {/* Main Card */}
          <div className="relative mt-4 bg-gradient-to-b from-[#2d333b] to-[#1c2128] rounded-[24px] border border-white/10 p-5 shadow-2xl">
            {/* Top Hexagon Avatar (Cloned from screenshot) */}
            <div className="flex flex-col items-center -mt-12 mb-4">
              <div className="relative w-32 h-32">
                {/* Hexagon Border */}
                <div className="absolute inset-0 bg-[#e3b341] clip-path-hexagon filter drop-shadow-[0_0_10px_rgba(227,179,65,0.4)]" />
                <div className="absolute inset-[3px] bg-[#1c2128] clip-path-hexagon" />
                <div className="absolute inset-[6px] bg-[#e3b341] clip-path-hexagon" />
                <div className="absolute inset-[8px] bg-white clip-path-hexagon overflow-hidden">
                  <img src="https://img.icons8.com/color/144/sword.png" className="w-full h-full object-contain p-2" />
                </div>
              </div>
              <h2 className="mt-4 text-[#e3b341] text-[15px] font-black uppercase tracking-widest">{family.name}</h2>
            </div>

            {/* Motto - Large Bold White Caps */}
            <div className="flex items-start justify-between px-2 mb-8">
              <p className="text-white text-[19px] font-[900] leading-[1.3] flex-1">
                {family.description}
              </p>
              <ChevronRight className="text-white/20 mt-2 ml-4 flex-shrink-0" size={24} />
            </div>

            {/* Rank Row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-24 h-24 flex-shrink-0">
                {/* Large Gold Shield Emblem */}
                <img 
                  src="https://img.icons8.com/color/144/warrior-shield.png" 
                  className="w-full h-full object-contain" 
                  alt="Rank Badge" 
                />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-1">
                  <span className="text-[#e3b341] text-[18px] font-black uppercase italic">{rankInfo.tier} {rankInfo.level}</span>
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#e3b341] mt-1" />
                </div>

                {/* Beveled Combat Bar (The exact UI from screenshot) */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#e3b341] rotate-45" />
                  <div className="flex-1 h-3.5 bg-black/60 rounded-full border border-white/20 relative overflow-hidden flex items-center justify-center p-[2px]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${rankInfo.progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-amber-600 to-[#e3b341] rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-black text-white/90 tracking-tighter">
                        <TrendingUp size={8} className="inline mr-1" /> {family.combatPoints || 0}/{rankInfo.pointsForNextLevel}
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-indigo-600 rounded-sm flex items-center justify-center shadow-lg">
                    <Shield size={12} className="text-white fill-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-[1px] bg-white/5 w-full my-6" />

            {/* Targets Row */}
            <div className="px-2 space-y-4">
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="text-white text-[12px] font-bold uppercase tracking-wider">Target Points this month</span>
                <HelpCircle size={14} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#e3b341] rounded shadow-lg flex items-center justify-center">
                    <Sparkles size={12} className="text-[#1c2128]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#e3b341] text-2xl font-black">{monthlyPoints}</span>
                    <span className="text-white/20 text-sm font-black">/ {monthlyTarget}</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white/20 mt-1" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#e3b341] text-[12px] font-black bg-white/5 px-2.5 py-1 rounded-full">
                  <Clock size={12} />
                  <span>7 Day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Members Container Section */}
          <div className="mt-4 bg-[#1c2128] rounded-[24px] border border-white/10 p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-white text-[20px] font-black">Family members</span>
                <span className="text-white/20 text-[16px] font-bold">{family.memberCount} / {memberLimit}</span>
              </div>
              <ChevronRight className="text-white/20" size={24} />
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {members.map((member, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <div className={cn(
                    "w-16 h-16 rounded-full overflow-hidden",
                    i === 0 ? "border-[3px] border-amber-500" : "border-2 border-white/5"
                  )}>
                    <img src={member.photoURL} className="w-full h-full object-cover" />
                  </div>
                  {i === 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-[#1c2128] shadow-xl">
                      <Trophy size={10} className="text-white fill-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CSS for hexagon clip path */}
        <style dangerouslySetInnerHTML={{ __html: `
          .clip-path-hexagon {
            clip-path: polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%);
          }
        `}} />
      </motion.div>
    </motion.div>
  );
};
