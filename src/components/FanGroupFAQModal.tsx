import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Award, Play, MessageCircle, Gift, Diamond, Shield, Clock, Heart, Trash2, Calendar, Lock } from 'lucide-react';

interface FanGroupFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FanGroupFAQModal: React.FC<FanGroupFAQModalProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>('q1');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const loyaltyLevels = [
    { name: 'Lv1-Lv5', bg: 'bg-[#9ca3af]', text: 'text-white', points: '1-84' },
    { name: 'Lv6-Lv10', bg: 'bg-[#10b981]', text: 'text-white', points: '85-399' },
    { name: 'Lv11-Lv15', bg: 'bg-[#14b8a6]', text: 'text-white', points: '400-1949' },
    { name: 'Lv16-Lv20', bg: 'bg-[#06b6d4]', text: 'text-white', points: '1950-9559' },
    { name: 'Lv21-Lv25', bg: 'bg-[#3b82f6]', text: 'text-white', points: '9560-42599' },
    { name: 'Lv26-Lv30', bg: 'bg-[#8b5cf6]', text: 'text-white', points: '42600-319999' },
    { name: 'Lv31-Lv35', bg: 'bg-[#ec4899]', text: 'text-white', points: '320000-2018078' },
    { name: 'Lv36-Lv40', bg: 'bg-[#ef4444]', text: 'text-white', points: '2018079-7500000' },
    { name: 'Lv41-Lv45', bg: 'bg-[#f59e0b]', text: 'text-white', points: '7500001-37000000' },
    { name: 'Lv46-Lv50', bg: 'bg-[#06b6d4]', text: 'text-cyan-900 border border-cyan-400 animate-pulse', points: '37000001+' },
  ];

  const packagesList = [
    { title: 'Taillight', icon: '🚗' },
    { title: 'Pendant', icon: '🏅' },
    { title: 'Video call frame', icon: '🖼️' },
    { title: 'Badge', icon: '📛' },
    { title: 'Entrance effect', icon: '✨' },
    { title: 'Free gift', icon: '🎁' },
    { title: 'Loyalty gift (+5)', icon: '💝' },
    { title: 'Super loyalty gift (+50)', icon: '⚡' },
    { title: 'Bullet MSG Skin', icon: '💬' },
    { title: 'Message Bubble', icon: '💭' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] cursor-pointer"
          />

          {/* Modal Container: Matches screenshot style with exact heights */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full sm:max-w-md h-[88vh] sm:h-[80vh] bg-white rounded-t-[24px] sm:rounded-[24px] overflow-hidden shadow-2xl z-10 flex flex-col font-sans border border-slate-100"
          >
            {/* White Nav Header Bar */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-slate-100 select-none bg-white">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100/80 active:scale-95 transition-all cursor-pointer"
              >
                {/* Custom Left chevron back arrow `<` */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-700"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              
              <h1 className="text-[17px] font-extrabold text-[#1f2937] tracking-tight">
                Fan group FAQ
              </h1>

              {/* Balancer placeholder for alignment */}
              <div className="w-8 h-8" />
            </div>

            {/* Custom Interactive Purple-Blue Banner from Screenshot */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#ec4899] px-6 py-6 pb-7 select-none text-left">
              {/* Abstract decorative floating circles/hearts in background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl pointer-events-none rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-rose-400/20 blur-xl pointer-events-none rounded-full" />
              
              {/* Banner title / description exactly matching user screenshot */}
              <h2 className="text-white text-[19px] font-black tracking-wide leading-snug pr-8 mb-1.5 drop-shadow-sm">
                Fan group monthly battle
              </h2>
              <p className="text-white/95 text-[12.5px] font-semibold leading-relaxed max-w-[92%] drop-shadow-xs">
                Increase points of the fan group to assist the broadcaster to become the Popular Broadcaster winner
              </p>
            </div>

            {/* Scrollable Accordion FAQ List Area */}
            <div className="flex-1 overflow-y-auto bg-white divide-y divide-[#f4f4f5]">
              
              {/* Q1 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q1')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: What is a fan group?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q1' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q1' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-6 pb-5 pt-3.5 text-[#52525b] text-[12.5px] font-medium leading-relaxed select-none">
                        Stand out amongst other users and join your favorite hosts' fan group to catch their attention! Join the group to show your loyalty and obtain fan medals and privileges
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q2 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q2')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: How to create a fan group? And how to join?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q2' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q2' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-6 pb-5 pt-3.5 text-[#52525b] text-[12.5px] font-medium leading-relaxed space-y-2 select-none">
                        <p>
                          Start your own fan group once the host level reaches Rookie I. Unlock fan medals in your "Profile". Anyone (including hosts) can join the fan group.
                        </p>
                        <p>
                          Join by clicking on the "fan group" medal in the host's livestream, following and gifting 2 diamonds.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q3 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q3')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: What is fan level and its privileges?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q3' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q3' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/60 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-5 pb-5 pt-4 space-y-5 text-[12px] text-slate-600 select-none">
                        {/* Box 1: Fan level privileges */}
                        <div className="bg-[#f0fdfa]/75 border border-teal-100 rounded-2xl p-4 text-slate-700">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
                              <Shield size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="font-extrabold text-[12.5px] text-[#0f766e]">Fan level privileges</span>
                          </div>
                          <p className="leading-relaxed font-semibold">
                            Fan level means loyalty to the host. The higher level you reach, the easier to gain the host's attention.
                          </p>
                        </div>

                        {/* Box 2: How to upgrade your fan level */}
                        <div className="bg-[#f5f3ff]/75 border border-purple-100 rounded-2xl p-4 text-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                              <Award size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="font-extrabold text-[12.5px] text-[#6d28d9]">How to upgrade your fan level</span>
                          </div>
                          <p className="leading-relaxed font-semibold mb-3">
                            Complete daily loyalty tasks to gain loyalty points, upgrade levels and unlock more privileges!
                          </p>
                          
                          <div className="h-px bg-purple-100/80 my-2" />

                          <div className="space-y-2 text-[11.5px] text-slate-600 font-medium">
                            <p className="text-slate-500 uppercase font-black text-[9px] tracking-wider mb-1">Loyalty tasks:</p>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">1.</span>
                              <span>A fan group member can get 10 loyalty points per 5 minutes by watching livestream. The upper limit is 30 loyalty points per day.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">2.</span>
                              <span>A fan group member can get 10 loyalty points for the first comment message every day.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">3.</span>
                              <span>Gifting 1 diamonds=1 loyalty point (10 extra points for the first gift). The higher the fan level, the higher the daily upper limit of loyalty points.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">4.</span>
                              <span>Send Loyalty gift to generate 5 loyalty points，Send Super loyalty gift to generate 50 loyalty points</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">5.</span>
                              <span>In Version 6.1 or later, gifting to hosts in the 1v1 message will also increase the loyalty points of the fan group.</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="text-purple-500 font-bold">6.</span>
                              <span>In Version 6.3 or later, gifting in the Bar will also increase the loyalty points.</span>
                            </div>
                          </div>
                        </div>

                        {/* Row of visual tasks icons */}
                        <div className="grid grid-cols-5 gap-1.5 text-center mt-2">
                          <div className="bg-white border border-slate-100 rounded-xl p-1.5 flex flex-col items-center justify-between h-20 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                              <Clock size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 scale-95 leading-none">Watch Live 5m</span>
                            <span className="text-[7.5px] bg-[#fb923c]/10 text-[#ea580c] px-1 rounded font-extrabold">+10 pt</span>
                          </div>

                          <div className="bg-white border border-slate-100 rounded-xl p-1.5 flex flex-col items-center justify-between h-20 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-500 animate-pulse">
                              <MessageCircle size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 scale-95 leading-none">Send Chat Msg</span>
                            <span className="text-[7.5px] bg-[#f87171]/10 text-[#dc2626] px-1 rounded font-extrabold">+10 pt</span>
                          </div>

                          <div className="bg-white border border-slate-100 rounded-xl p-1.5 flex flex-col items-center justify-between h-20 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                              <Gift size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 scale-95 leading-none">Send Gifts</span>
                            <span className="text-[7.5px] bg-[#c084fc]/10 text-[#9333ea] px-1 rounded font-extrabold">1 D = 1 pt</span>
                          </div>

                          <div className="bg-white border border-slate-100 rounded-xl p-1.5 flex flex-col items-center justify-between h-20 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                              <Heart size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 scale-95 leading-none font-bold">Loyalty Gift</span>
                            <span className="text-[7.5px] bg-[#f472b6]/10 text-[#db2777] px-1 rounded font-extrabold">+5 pt</span>
                          </div>

                          <div className="bg-white border border-slate-100 rounded-xl p-1.5 flex flex-col items-center justify-between h-20 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                              <Diamond size={12} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 scale-95 leading-none">Super Loyalty</span>
                            <span className="text-[7.5px] bg-[#22d3ee]/10 text-[#0891b2] px-1 rounded font-extrabold">+50 pt</span>
                          </div>
                        </div>

                        {/* What are the privileges for different level list */}
                        <div className="space-y-2 mt-4">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">What are the privileges for different level?</span>
                          
                          {/* Beautiful exact visual table mirroring the video */}
                          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-[#f8fafc] px-4 py-2 flex items-center justify-between text-slate-500 font-extrabold text-[10px] uppercase border-b border-slate-100">
                              <span className="w-1/3 text-left">Level</span>
                              <span className="w-1/3 text-center">Medal</span>
                              <span className="w-1/3 text-right">Loyalty Points</span>
                            </div>
                            <div className="divide-y divide-slate-50 text-[11px] font-semibold text-slate-700 bg-white">
                              {loyaltyLevels.map((lvl) => (
                                <div key={lvl.name} className="px-4 py-2 flex items-center justify-between">
                                  <span className="w-1/3 font-extrabold text-[#334155]">{lvl.name}</span>
                                  <div className="w-1/3 flex justify-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase ${lvl.bg} ${lvl.text}`}>
                                      ABCDEF
                                    </span>
                                  </div>
                                  <span className="w-1/3 text-right font-bold text-slate-500">{lvl.points}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Daily gift package */}
                        <div className="space-y-2.5 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500">
                              <span className="text-[9.5px]">⭐</span>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Daily gift package</span>
                          </div>
                          <p className="leading-relaxed font-medium text-[11px] text-slate-500">
                            After upgrading to V5.18, fan group packs will be associated with users' fan medal level, users will receive today's pack after watching the hosts' (of the fan group) livestream for 5 minutes and the pack can be used in the host's livestream only.
                          </p>

                          {/* Grid matching circular badges list */}
                          <div className="grid grid-cols-5 gap-2 text-center mt-2.5">
                            {packagesList.map((pkg, idx) => (
                              <div key={idx} className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-xl p-1 h-14 shadow-xs">
                                <span className="text-[15px] filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">{pkg.icon}</span>
                                <span className="text-[7.5px] font-bold text-slate-500 mt-1 scale-90 leading-tight origin-center whitespace-pre-wrap">{pkg.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q4 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q4')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: What is the connection between fan medal level and loyalty?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q4' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q4' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-5 pb-5 pt-3.5 space-y-3.5 select-none">
                        <p className="text-[#52525b] text-[12.5px] font-semibold leading-relaxed px-1">
                          The fan medal level corresponds exactly to cumulative loyalty points. As you earn loyalty, your level rises, unlocking higher tier frames:
                        </p>
                        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          <div className="bg-[#f8fafc] px-4 py-2 flex items-center justify-between text-slate-500 font-extrabold text-[10px] uppercase border-b border-slate-100">
                            <span className="w-1/3 text-left">Level</span>
                            <span className="w-1/3 text-center">Medal</span>
                            <span className="w-1/3 text-right">Loyalty Points</span>
                          </div>
                          <div className="divide-y divide-slate-50 text-[11px] font-semibold text-slate-700 bg-white">
                            {loyaltyLevels.map((lvl) => (
                              <div key={lvl.name} className="px-4 py-2 flex items-center justify-between">
                                <span className="w-1/3 font-extrabold text-[#334155]">{lvl.name}</span>
                                <div className="w-1/3 flex justify-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase ${lvl.bg} ${lvl.text}`}>
                                    ABCDEF
                                  </span>
                                </div>
                                <span className="w-1/3 text-right font-bold text-slate-500">{lvl.points}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q5 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q5')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: Will the fan medal be removed?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q5' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q5' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-6 pb-5 pt-3.5 text-[#52525b] text-[12.5px] font-semibold leading-relaxed space-y-2.5 select-none">
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 font-black">1.</span>
                          <span>If loyalty points are not added for 7 consecutive days, then the loyalty point will be decreased and the fan medal will be downgraded. Loyalty points will be decreased by 10 every day. The medal will be removed when the loyalty point drops to 0, by which you will need to join the fan group again.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 font-black">2.</span>
                          <span>After upgrading to V5.18, the fan medal will be frozen and can't be applied if no loyalty points were generated in past 7 days</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-500 font-black">3.</span>
                          <span>Generate loyalty points to apply the fan medal</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q6 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q6')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: What is fan group monthly battle?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q6' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q6' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-6 pb-5 pt-3.5 text-[#52525b] text-[12.5px] font-semibold leading-relaxed space-y-2 select-none">
                        <div className="flex items-start gap-2">
                          <span className="text-indigo-500 font-extrabold">1.</span>
                          <span>The fan group monthly battle contains monthly regional leaderboard and monthly global leaderboard.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-indigo-500 font-extrabold">2.</span>
                          <span>Monthly regional leaderboard is based on the monthly loyalty points of the fan group in that region. Top-ranked hosts may receive huge rewards (please refer to the page for detail)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-indigo-500 font-extrabold">3.</span>
                          <span>Monthly global leaderboard is based on the monthly loyalty points of the fan group in the globe. TOP200 hosts will be on the list!</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q7 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q7')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: What is the fan group target?
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q7' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q7' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-6 pb-5 pt-3.5 text-[#52525b] text-[12.5px] font-semibold leading-relaxed space-y-2 select-none">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 font-extrabold">1.</span>
                          <span>Hosts and their fans complete a task together every day and get rewards. (Hosts will gain popularity, and fans will share rewards)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 font-extrabold">2.</span>
                          <span>Completion of daily loyalty tasks and introduction of new members will facilitate the process of fan group target!</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Q8 */}
              <div className="bg-white">
                <button
                  onClick={() => toggleSection('q8')}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                >
                  <span className="text-[#27272a] font-bold text-[13.5px] tracking-tight leading-snug">
                    Q: Cautions
                  </span>
                  <ChevronDown
                    size={15}
                    strokeWidth={2.5}
                    className={`text-slate-400/80 transition-transform duration-300 ${openSection === 'q8' ? 'rotate-180 text-[#818cf8]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openSection === 'q8' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden bg-[#fafafa]/40 text-left border-t border-[#f4f4f5]/60"
                    >
                      <div className="px-6 pb-5 pt-3.5 text-[#52525b] text-[12.5px] font-semibold leading-relaxed space-y-2 select-none">
                        <div className="flex items-start gap-2">
                          <span className="text-rose-500 font-extrabold">1.</span>
                          <span>Fan medals will not be visible in Livehouse.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-rose-500 font-extrabold">2.</span>
                          <span>Users who unfollow, block or remove a broadcaster will automatically be removed from the fan group and vice versa</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-rose-500 font-extrabold">3.</span>
                          <span>Star List and Guardian medals will be prioritized over fan medals.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
