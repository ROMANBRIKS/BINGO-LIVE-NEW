import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, Users, Radio, Calendar, Flame, ChevronRight, HelpCircle, Award } from 'lucide-react';

interface LiveAnalyticsModalProps {
  onClose: () => void;
  displayName: string;
}

export function LiveAnalyticsModal({ onClose, displayName }: LiveAnalyticsModalProps) {
  const [activeRange, setActiveRange] = useState<'Today' | 'Weekly' | 'Monthly' | 'Targets'>('Weekly');
  const [selectedTierId, setSelectedTierId] = useState<string>('S3');
  const [simulationBeans, setSimulationBeans] = useState<number>(58500);

  // Hardcoded some beautiful high-fidelity mock stream stats matching real Bingo live dashboards
  const analyticsData = {
    Today: {
      time: "182 mins",
      fans: "+4",
      beans: "1,420 Beans",
      diamonds: "115 Spent",
      chartPoints: [25, 40, 95, 120, 85, 190, 140, 280],
      peakViewers: 280
    },
    Weekly: {
      time: "1,240 mins",
      fans: "+182",
      beans: "11,200 Beans",
      diamonds: "950 Spent",
      chartPoints: [110, 240, 180, 420, 310, 580, 490, 720],
      peakViewers: 720
    },
    Monthly: {
      time: "5,400 mins",
      fans: "+920",
      beans: "58,500 Beans",
      diamonds: "4,600 Spent",
      chartPoints: [320, 480, 890, 1100, 950, 1420, 1680, 2240],
      peakViewers: 2240
    }
  };

  const QUOTA_TIERS = [
    { id: 'S1', name: 'S1 Tier (Standard)', pointsRequired: 180000, multiplier: 1, salary: 1200, isPromo: false },
    { id: 'S2', name: 'S2 Tier (Standard)', pointsRequired: 300000, multiplier: 1, salary: 2100, isPromo: false },
    { id: 'S3', name: 'S3 Tier (Promotional)', pointsRequired: 600000, multiplier: 3, salary: 4500, isPromo: true },
    { id: 'S4', name: 'S4 Tier (Standard)', pointsRequired: 800000, multiplier: 1, salary: 6200, isPromo: false },
    { id: 'S6', name: 'S6 Tier (Promotional)', pointsRequired: 1200000, multiplier: 3, salary: 10000, isPromo: true },
  ];

  const currentData = activeRange !== 'Targets' ? analyticsData[activeRange] : analyticsData.Monthly;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-md bg-[#0F1319] text-[#E4F2F3] rounded-[2.5rem] border border-cyan-900/40 overflow-hidden shadow-2xl z-10 flex flex-col p-6 space-y-5"
        id="live-analytics-dashboard-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-[#00E5FF]">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Host Insights</span>
              <h3 className="text-base font-black text-white leading-none">Live Streaming Data</h3>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection Row for stats range */}
        <div className="bg-[#181D26] p-1 rounded-xl flex gap-1">
          {(['Today', 'Weekly', 'Monthly', 'Targets'] as const).map(range => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${
                activeRange === range 
                  ? "bg-[#00E5FF] text-black shadow-sm" 
                  : "text-gray-400 hover:text-white bg-transparent"
              }`}
            >
              {range === 'Targets' ? 'Targets ⚡' : range}
            </button>
          ))}
        </div>        {activeRange === 'Targets' ? (
          <div className="space-y-3.5 overflow-y-auto max-h-[50vh] pr-1">
            {/* Explanatory card of how Bingo psychological weights work */}
            <div className="bg-gradient-to-r from-[#0E1A29] to-[#0A121E] border border-cyan-800/20 p-3 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-lg bg-cyan-400/10 text-[#00cbd6] mt-0.5 shrink-0 select-none">
                  <Flame size={14} className="fill-[#00cbd6]" />
                </div>
                <div className="space-y-0.5 select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00E5FF]">Bingo Quota Multiplier Rule</span>
                  <p className="text-[10px] text-gray-300 leading-snug">
                    A gift's cash balance stays 1-to-1 in your wallet (<strong className="text-white font-bold">1 Diamond = 1 Bean</strong>). However, promo tiers weight your target progress bar at a <strong className="text-white font-bold">3x multiplier rate</strong> so high payouts are far more achievable!
                  </p>
                </div>
              </div>
            </div>

            {/* Selector Grid for Quota Tiers */}
            <div className="space-y-1.5 select-none text-left">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block pl-1">Quota Target Level</span>
              <div className="grid grid-cols-5 gap-1.5">
                {QUOTA_TIERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTierId(t.id)}
                    className={`py-1.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                      selectedTierId === t.id
                        ? "bg-cyan-500/10 text-[#00E5FF] border-[#00CBD6]/50 shadow-xs scale-[1.03]"
                        : "bg-[#141A24] text-gray-400 border-transparent hover:border-gray-855"
                    }`}
                  >
                    <span className="text-[11px]">{t.id}</span>
                    <span className={`text-[7px] font-extrabold px-1 py-0.2 rounded mt-0.5 ${t.isPromo ? "bg-cyan-500/10 text-cyan-400" : "bg-gray-800 text-gray-400"}`}>
                      {t.isPromo ? "3x Boost" : "Standard"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tier Specifications Card */}
            {(() => {
              const selectedTier = QUOTA_TIERS.find(t => t.id === selectedTierId) || QUOTA_TIERS[2];
              
              // Base Monthly Earnings
              const currentMonthlyBeans = 58500;
              const currentPoints = currentMonthlyBeans * selectedTier.multiplier;
              const pointsRequired = selectedTier.pointsRequired;
              const progressPercent = Math.min(100, Math.round((currentPoints / pointsRequired) * 100));
              
              const pointsRemaining = Math.max(0, pointsRequired - currentPoints);
              const beansRemaining = Math.ceil(pointsRemaining / selectedTier.multiplier);
              
              return (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-[#12161D] border border-cyan-950/40 p-3.5 rounded-2xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[13px] font-black text-white">{selectedTier.name}</h4>
                        <span className="text-[9px] text-gray-500 block">Unlocked Monthly Salary Contract</span>
                      </div>
                      <span className="text-xs font-black text-[#00E5FF] bg-cyan-400/10 px-2 py-0.5 rounded font-mono">
                        ${selectedTier.salary.toLocaleString()} /mo
                      </span>
                    </div>

                    {/* Progress Indicator Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] leading-none">
                        <span className="text-gray-400 font-medium">Accumulated Progress:</span>
                        <span className="font-extrabold text-[#00E5FF] font-mono">{progressPercent}% Locked</span>
                      </div>
                      
                      <div className="h-2 w-full bg-[#181D26] rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${
                            selectedTier.isPromo 
                              ? "bg-gradient-to-r from-[#00E5FF] to-teal-400" 
                              : "bg-gradient-to-r from-blue-500 to-[#00CBD6]"
                          }`}
                        />
                      </div>

                      <div className="flex justify-between text-[8px] text-gray-500 leading-none pt-0.5 font-mono">
                        <span>{currentPoints.toLocaleString()} progress pts</span>
                        <span>Goal: {pointsRequired.toLocaleString()} pts</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/30">
                      <div>
                        <span className="text-[8px] text-gray-500 uppercase block">Progress Weight</span>
                        <span className="text-[10px] font-bold text-white">
                          {selectedTier.isPromo ? "⚡ 3x Quota Multiplier" : "⚙️ 1x Standard Weight"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-gray-500 uppercase block">Physical Beans To Collect</span>
                        <span className={`text-[10px] font-black font-mono ${beansRemaining === 0 ? "text-green-400" : "text-[#FFC200]"}`}>
                          {beansRemaining === 0 ? "Goal Met! 🎉" : `${beansRemaining.toLocaleString()} Beans`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Simulation Slider */}
                  <div className="bg-[#12161D] border border-cyan-950/40 p-3.5 rounded-2xl space-y-2.5 text-left">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block pl-1">Quota Projection Simulator</span>
                    
                    <div className="flex justify-between items-center bg-[#171D27]/80 px-2.5 py-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-300">Set Expected Beans:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1000"
                          max="1000000"
                          step="5000"
                          value={simulationBeans}
                          onChange={(e) => setSimulationBeans(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 bg-transparent text-right font-mono font-black text-xs text-[#00E5FF] border-b border-cyan-900 focus:outline-none"
                        />
                        <span className="text-[8px] text-gray-400 font-bold uppercase">Beans</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="450000"
                      step="5000"
                      value={simulationBeans}
                      onChange={(e) => setSimulationBeans(parseInt(e.target.value))}
                      className="w-full accent-[#00E5FF] cursor-pointer h-1.5 bg-[#181D26] rounded-lg appearance-none"
                    />

                    <div className="grid grid-cols-2 gap-2 text-center pt-1 select-none">
                      <div className="bg-[#181D26]/40 p-2 rounded-xl border border-gray-800/10">
                        <span className="text-[7.5px] text-gray-400 uppercase block leading-none mb-1">Standard (1x) Points</span>
                        <span className="text-[11px] font-extrabold text-white font-mono">
                          {simulationBeans.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="bg-cyan-500/5 p-2 rounded-xl border border-[#00CBD6]/15">
                        <span className="text-[7.5px] text-cyan-400 uppercase block leading-none mb-1">Promo S3/S6 (3x) Points</span>
                        <span className="text-[11px] font-black text-gradient bg-clip-text bg-gradient-to-r from-teal-400 to-[#00E5FF] font-mono">
                          {(simulationBeans * 3).toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            {/* Top summary card */}
            <div className="bg-gradient-to-br from-[#121A26] to-[#0D131D] border border-cyan-900/30 p-4 rounded-2xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-3 border-b border-gray-800/60 pb-2 text-left">
                <span className="text-[10px] font-bold text-[#00E5FF] tracking-wider uppercase">Overview</span>
                <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1 font-mono">
                  <Calendar size={11} /> Since last interval
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Live Minutes</span>
                  <span className="block text-xl font-extrabold text-white text-glow-cyan">{currentData.time}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium">New Fans</span>
                  <span className="block text-xl font-extrabold text-white">{currentData.fans}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Beans Earned</span>
                  <span className="block text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 font-mono">
                    {currentData.beans}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Peak Viewers</span>
                  <span className="block text-xl font-extrabold text-cyan-400 font-mono">
                    🔥 {currentData.peakViewers}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Line Chart inside high fidelity container */}
            <div className="bg-[#12161D] border border-cyan-950/40 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-[#00E5FF]" /> Live Audience Rating Curve
                </span>
                <span className="text-[10px] text-gray-500 font-mono">Peak Max {currentData.peakViewers}</span>
              </div>

              {/* SVG Line Chart */}
              <div className="h-28 w-full bg-[#181D26]/40 rounded-xl relative p-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="300" y2="25" stroke="#FFFFFF" strokeOpacity="0.04" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#FFFFFF" strokeOpacity="0.04" strokeDasharray="3,3" />
                  <line x1="0" y1="75" x2="300" y2="75" stroke="#FFFFFF" strokeOpacity="0.04" strokeDasharray="3,3" />

                  {/* Gradient fill */}
                  <path
                    d={`M 0,100 Q 40,${100 - (currentData.chartPoints[0]/3)} 80,${100 - (currentData.chartPoints[1]/3)} T 160,${100 - (currentData.chartPoints[3]/3)} T 240,${100 - (currentData.chartPoints[5]/3)} T 300,${100 - (currentData.chartPoints[7]/3)} L 300,100 Z`}
                    fill="url(#chartGrad)"
                  />

                  {/* Real Line Curve */}
                  <path
                    d={`M 0,100 Q 40,${100 - (currentData.chartPoints[0]/3)} 80,${100 - (currentData.chartPoints[1]/3)} T 160,${100 - (currentData.chartPoints[3]/3)} T 240,${100 - (currentData.chartPoints[5]/3)} T 300,${100 - (currentData.chartPoints[7]/3)}`}
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Interactive Dots on peak values */}
                  <circle cx="240" cy={`${100 - (currentData.chartPoints[5]/3)}`} r="5" fill="#00E5FF" stroke="#0F1319" strokeWidth="1.5" />
                  <circle cx="300" cy={`${100 - (currentData.chartPoints[7]/3)}`} r="5" fill="#00E5FF" stroke="#0F1319" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="text-[9px] text-gray-500 flex justify-between px-1">
                <span>Interval Start</span>
                <span>Stream Peak</span>
                <span>Current Realtime</span>
              </div>
            </div>
          </>
        )}

        {/* Level Ranks & Rewards progress details */}
        <div className="bg-[#12161D] border border-cyan-950/40 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-400">
              <Award size={18} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block leading-none mb-1">Signed Level</span>
              <span className="text-xs font-black text-white">Tier C Rising Streamer</span>
            </div>
          </div>
          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded font-bold uppercase font-mono tracking-wider">
            1.2x Multiplier
          </span>
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-105 rounded-full text-black font-extrabold text-sm tracking-wide shadow-md active:scale-98 transition-all"
        >
          Check Settlement Details
        </button>
      </motion.div>
    </div>
  );
}
