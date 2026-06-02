import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, HelpCircle, ArrowUp, ArrowDown, Globe, Users, Shield, Award, Zap, Percent, Star } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface RegionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostProfile: any;
  roomBeans: number;
}

interface LeaderboardItem {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  score: number;
  isLive: boolean;
  trend?: 'up' | 'down' | 'same';
}

type ModeTab = 'Region' | 'Agency';
type HorizonTab = 'Hourly' | 'Daily' | 'Weekly';
type GeographicRegion = 'North America' | 'Middle East' | 'Southeast Asia' | 'West Europe';

export const RegionListModal: React.FC<RegionListModalProps> = ({ 
  isOpen, 
  onClose, 
  hostProfile, 
  roomBeans 
}) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  // High level modes: "Region List" rankings or "Agency & Guild" competitions
  const [activeMode, setActiveMode] = useState<ModeTab>('Region');
  const [activeTab, setActiveTab] = useState<HorizonTab>('Daily');
  const [activeRegion, setActiveRegion] = useState<GeographicRegion>('North America');

  // Interactive local states for dynamic Bingo contribution
  const [myDailyScore, setMyDailyScore] = useState(354);
  const [myHourlyScore, setMyHourlyScore] = useState(0);
  const [myWeeklyScore, setMyWeeklyScore] = useState(2264);

  // Agency specific dynamic progress stats
  const [agencyMonthlyBeans, setAgencyMonthlyBeans] = useState(845390);
  const [guildBattlePoints, setGuildBattlePoints] = useState(42900);

  const getMyScore = () => {
    switch (activeTab) {
      case 'Hourly': return myHourlyScore;
      case 'Weekly': return myWeeklyScore;
      case 'Daily': default: return myDailyScore;
    }
  };

  const setMyScoreLocal = (newScore: number) => {
    switch (activeTab) {
      case 'Hourly':
        setMyHourlyScore(newScore);
        break;
      case 'Weekly':
        setMyWeeklyScore(newScore);
        break;
      case 'Daily':
      default:
        setMyDailyScore(newScore);
        break;
    }
  };

  // Lists matching active selected geographic region
  const regionRasters: Record<GeographicRegion, Record<HorizonTab, LeaderboardItem[]>> = {
    'North America': {
      Hourly: [
        { id: 'na_h1', rank: 1, name: '💵ASANWA💰', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150', score: 26189, isLive: true, trend: 'up' },
        { id: 'na_h2', rank: 2, name: 'ANIBERRY🫧🔥', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', score: 19369, isLive: true, trend: 'down' },
        { id: 'na_h3', rank: 3, name: 'King Dan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150', score: 16436, isLive: true, trend: 'down' },
        { id: 'na_h4', rank: 4, name: 'Laurie🤍', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150', score: 10010, isLive: true },
        { id: 'na_h5', rank: 5, name: 'Cookie 🍪🛰️', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150', score: 4045, isLive: true },
      ],
      Daily: [
        { id: 'na_d1', rank: 1, name: 'ANIBERRY🫧🔥', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', score: 58638, isLive: true },
        { id: 'na_d2', rank: 2, name: '💵ASANWA💰', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150', score: 31765, isLive: true },
        { id: 'na_d3', rank: 3, name: 'Tytania Fae𓍢ִ໋✨', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150', score: 16628, isLive: false },
        { id: 'na_d4', rank: 4, name: 'King Dan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150', score: 16436, isLive: true },
        { id: 'na_d5', rank: 5, name: 'Laurie🤍', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150', score: 16143, isLive: false },
      ],
      Weekly: [
        { id: 'na_w1', rank: 1, name: 'Vivian💎👑', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150', score: 273412, isLive: true },
        { id: 'na_w2', rank: 2, name: '🤍Favour💸', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150', score: 249680, isLive: true },
        { id: 'na_w3', rank: 3, name: '🖤V C 💀', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150', score: 170992, isLive: false },
        { id: 'na_w4', rank: 4, name: 'La♑sie 🔱👑', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150', score: 152039, isLive: false },
        { id: 'na_w5', rank: 5, name: 'Mamacita Vee🍓💀', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150', score: 149639, isLive: false },
      ]
    },
    'Middle East': {
      Hourly: [
        { id: 'me_h1', rank: 1, name: 'Habibi_Live👑', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', score: 48500, isLive: true, trend: 'up' },
        { id: 'me_h2', rank: 2, name: 'Yara_DXB🕊️', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150', score: 32410, isLive: true },
        { id: 'me_h3', rank: 3, name: 'Fahad_VIP', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150', score: 15900, isLive: false }
      ],
      Daily: [
        { id: 'me_d1', rank: 1, name: 'Habibi_Live👑', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', score: 92400, isLive: true },
        { id: 'me_d2', rank: 2, name: 'Yara_DXB🕊️', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150', score: 71100, isLive: true }
      ],
      Weekly: [
        { id: 'me_w1', rank: 1, name: 'Sultan_Riyadh💎', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', score: 684000, isLive: true }
      ]
    },
    'Southeast Asia': {
      Hourly: [
        { id: 'sea_h1', rank: 1, name: 'Niki_SG🇸🇬', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150', score: 14200, isLive: true },
        { id: 'sea_h2', rank: 2, name: 'IndoLover🔥', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', score: 11090, isLive: true }
      ],
      Daily: [
        { id: 'sea_d1', rank: 1, name: 'Niki_SG🇸🇬', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150', score: 43200, isLive: true }
      ],
      Weekly: [
        { id: 'sea_w1', rank: 1, name: 'BountyHunter🌏', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150', score: 320900, isLive: false }
      ]
    },
    'West Europe': {
      Hourly: [
        { id: 'we_h1', rank: 1, name: 'Chloe_Paris🥐', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150', score: 21900, isLive: true }
      ],
      Daily: [
        { id: 'we_d1', rank: 1, name: 'Chloe_Paris🥐', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150', score: 48900, isLive: true }
      ],
      Weekly: [
        { id: 'we_w1', rank: 1, name: 'EuroBeats🎧', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', score: 298000, isLive: true }
      ]
    }
  };

  const getActiveList = (): LeaderboardItem[] => {
    const regionObj = regionRasters[activeRegion] || regionRasters['North America'];
    return regionObj[activeTab] || [];
  };

  const getCountdownText = () => {
    switch (activeTab) {
      case 'Hourly': return '00 d 00 h 29 m';
      case 'Weekly': return '02 d 21 h 29 m';
      case 'Daily': default: return '00 d 21 h 29 m';
    }
  };

  const currentList = getActiveList();
  const top1Score = currentList[0]?.score || 100000;
  const entryListScore = currentList[currentList.length - 1]?.score || 1000;
  const myCurrentScore = getMyScore();

  const toGetTop1Count = Math.max(1, top1Score - myCurrentScore + 1);
  const toGetOnListCount = Math.max(1, entryListScore - myCurrentScore + 1);

  // Send support flowers & trigger interconnected agency commission routing
  const handleBoostSupport = async (type: 'top1' | 'list', rosesNeeded: number) => {
    if (!profile) {
      showToast('Please sign in to send support!', 'error');
      return;
    }

    try {
      const costPerRose = 1; 
      // Ensure users get dynamic boosting up to 100 or actual needed roses
      const totalCost = Math.min(rosesNeeded, 150); 

      if (profile.diamonds < totalCost) {
        showToast(`Need 💎 ${totalCost} Diamonds to send ${totalCost} Roses!`, 'error');
        return;
      }

      // Deduct diamonds
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        diamonds: increment(-totalCost),
        totalDiamondsSpent: increment(totalCost)
      });

      // Update local values instantly for real-time gratification
      setMyScoreLocal(myCurrentScore + totalCost);
      setAgencyMonthlyBeans(prev => prev + totalCost);
      setGuildBattlePoints(prev => prev + totalCost * 3); // 3x multiplier boost into live guild war points!

      // Boost host's in-room currentBeans and stream heat
      if (hostProfile?.uid) {
        const roomRef = doc(db, 'rooms', hostProfile.roomId || 'active');
        await updateDoc(roomRef, {
          currentBeans: increment(totalCost),
          popularity: increment(totalCost * 2)
        }).catch(() => {});

        // Broadcast gift into public chat room message
        await addDoc(collection(db, 'rooms', hostProfile.roomId || 'active', 'messages'), {
          uid: profile.uid,
          displayName: profile.displayName || 'Anonymous Support',
          text: `sent 🌹 x${totalCost} support flowers! Intertwined boost: Individual Rank +24, Guild Battler +${totalCost * 3} XP! ⚡🏆`,
          timestamp: serverTimestamp(),
          type: 'gift'
        }).catch(() => {});
      }

      showToast(`🎉 Sent 🌹 x${totalCost}! Standard 15% Agency commission routed to Infinity Talent ledger!`, 'success');

    } catch (err: any) {
      showToast(err.message || 'Error occurred during gifting support.', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          {/* Bottom Drawer Sheet styled strictly like Bingo Live */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md mx-auto bg-[#fbfbfa] rounded-t-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh] h-[720px] pointer-events-auto"
          >
            {/* Grabber indicator bar */}
            <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />

            {/* Sticky Navigation Mode Tabs Header */}
            <div className="px-6 py-1 flex items-center justify-between border-b border-stone-100 shrink-0">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveMode('Region')}
                  className={`py-2 text-[15px] font-black tracking-wide relative ${
                    activeMode === 'Region' ? 'text-cyan-500' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Region Rankings
                  {activeMode === 'Region' && (
                    <motion.div layoutId="activeModeLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-500 rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveMode('Agency')}
                  className={`py-2 text-[15px] font-black tracking-wide relative flex items-center gap-1 ${
                    activeMode === 'Agency' ? 'text-amber-500' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Agency & Guild
                  <span className="bg-[#ff407f] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase scale-90">PK</span>
                  {activeMode === 'Agency' && (
                    <motion.div layoutId="activeModeLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Geolocation selector bubble when in Region model */}
                {activeMode === 'Region' && (
                  <select 
                    value={activeRegion}
                    onChange={(e) => setActiveRegion(e.target.value as GeographicRegion)}
                    className="text-[10px] font-black tracking-wide border border-stone-200 rounded-full text-stone-700 bg-white/50 px-2 py-1 outline-none focus:border-cyan-400 transition"
                  >
                    <option value="North America">🌎 N. America</option>
                    <option value="Middle East">🇦🇪 Mid East</option>
                    <option value="Southeast Asia">🇸🇬 SE Asia</option>
                    <option value="West Europe">🇪🇺 W. Europe</option>
                  </select>
                )}
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pb-28 min-h-0">
              {activeMode === 'Region' ? (
                /* ==================================== REGION RANKINGS MODE ==================================== */
                <div>
                  {/* Rookie Banner */}
                  <div className="px-5 mt-4 mb-3">
                    <div className="bg-[#fff2f6] border border-[#ffebf1] rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#ffe6ee] transition-colors">
                      <div className="flex items-center gap-1.5 animate-pulse">
                        <span className="bg-[#ff407f] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider uppercase">Live</span>
                        <span className="text-[#ff407f] text-xs font-black italic tracking-wide">Rookie Leaderboard Sprint</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#ff407f]/45 text-[10px] font-black uppercase tracking-wider">Top1</span>
                        <div className="w-5 h-5 rounded-full border border-[#ffc4d7]/60 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100" className="w-[100%] h-[100%] object-cover" alt="avatar" />
                        </div>
                        <span className="text-[#ff407f] font-black text-xs">&gt;</span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Timing tabs */}
                  <div className="px-5 mb-3 flex items-center justify-between">
                    <div className="flex bg-stone-100 rounded-full p-0.5">
                      {(['Hourly', 'Daily', 'Weekly'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-1 rounded-full text-[10.5px] font-black tracking-widest uppercase transition-all duration-200 select-none cursor-pointer ${
                            activeTab === tab 
                              ? 'bg-white text-stone-900 shadow-sm' 
                              : 'text-stone-400 hover:text-stone-600'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => showToast('Rules: Local and regional support boosts individual streamer exposure multiplier. Gifting counts toward Agency Monthly Target bonus!', 'info')}
                      className="text-stone-400 hover:text-stone-600 transition"
                    >
                      <HelpCircle size={17} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Time limit text banner */}
                  <div className="px-5 mb-4 text-[11px] font-black text-stone-400 flex items-center gap-2 select-none">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Sprint Clock: <span className="font-mono text-stone-700 bg-white border border-stone-200 px-1.5 py-0.5 rounded shadow-sm">{getCountdownText()}</span>
                  </div>

                  {/* Top 3 podium list layout if Hourly */}
                  {activeTab === 'Hourly' && currentList.length >= 3 ? (
                    <div className="px-5 mb-5">
                      <div className="grid grid-cols-3 gap-3 items-end pt-5 pb-4 px-2 rounded-3xl bg-[#fafafa] border border-stone-100">
                        {/* 2nd place column */}
                        <div className="text-center flex flex-col items-center">
                          <div className="text-[10px] text-red-500 font-extrabold flex items-center justify-center leading-none mb-1 gap-1">
                            <ArrowDown size={9} strokeWidth={2} />{1.2}x
                          </div>
                          <div className="relative w-14 h-14">
                            <div className="absolute inset-x-0 -top-2 flex justify-center -space-x-1">
                              <span className="text-[14px]">🪽</span>
                              <span className="text-[10px] bg-slate-400 text-white px-1 rounded-full border border-white font-black">2</span>
                              <span className="text-[14px] scale-x-[-1]">🪽</span>
                            </div>
                            <div className="w-14 h-14 rounded-full border-[2px] border-slate-400 p-0.5 bg-white overflow-hidden shadow-md">
                              <img src={currentList[1].avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                            </div>
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00e1cf] text-white text-[6px] px-1 py-0.5 rounded-full border border-white tracking-widest font-black leading-none">
                              LIVE
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-stone-800 truncate mt-3 w-16 block">{currentList[1].name}</span>
                          <span className="text-[10px] text-amber-500 font-bold font-mono mt-0.5">🪙{currentList[1].score.toLocaleString()}</span>
                        </div>

                        {/* 1st place column */}
                        <div className="text-center flex flex-col items-center">
                          <div className="text-[10px] text-green-500 font-extrabold flex items-center justify-center leading-none mb-1 gap-1 animate-bounce">
                            <ArrowUp size={9} strokeWidth={2} />{1.5}x
                          </div>
                          <div className="relative w-18 h-18">
                            <div className="absolute inset-x-0 -top-3.5 flex flex-col items-center">
                              <span className="text-[16px] mb-[-4px]">👑</span>
                              <span className="text-[10px] bg-amber-400 text-white px-1.5 rounded-full border border-white font-black shadow-sm">1</span>
                            </div>
                            <div className="w-18 h-18 rounded-full border-[3px] border-amber-400 p-0.5 bg-white overflow-hidden shadow-lg">
                              <img src={currentList[0].avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                            </div>
                            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#00e1cf] text-white text-[6px] px-1.5 py-0.5 rounded-full border border-white tracking-widest font-black leading-none">
                              LIVE
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-stone-900 truncate mt-3.5 w-20 block">{currentList[0].name}</span>
                          <span className="text-[10.5px] text-amber-500 font-extrabold font-mono mt-0.5">🪙{currentList[0].score.toLocaleString()}</span>
                        </div>

                        {/* 3rd place column */}
                        <div className="text-center flex flex-col items-center">
                          <div className="text-[10px] text-red-500 font-extrabold flex items-center justify-center leading-none mb-1 gap-1">
                            <ArrowDown size={9} strokeWidth={2} />{1.1}x
                          </div>
                          <div className="relative w-14 h-14">
                            <div className="absolute inset-x-0 -top-2 flex justify-center -space-x-1">
                              <span className="text-[14px]">🪶</span>
                              <span className="text-[10px] bg-[#d39a75] text-white px-1 rounded-full border border-white font-black">3</span>
                              <span className="text-[14px] scale-x-[-1]">🪶</span>
                            </div>
                            <div className="w-14 h-14 rounded-full border-[2px] border-[#d39a75] p-0.5 bg-white overflow-hidden shadow-md">
                              <img src={currentList[2].avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                            </div>
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00e1cf] text-white text-[6px] px-1 py-0.5 rounded-full border border-white tracking-widest font-black leading-none">
                              LIVE
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-stone-800 truncate mt-3 w-16 block">{currentList[2].name}</span>
                          <span className="text-[10px] text-amber-500 font-bold font-mono mt-0.5">🪙{currentList[2].score.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Remaining hours lists */}
                      <div className="space-y-3.5 mt-5">
                        {currentList.slice(3).map(item => (
                          <div key={item.id} className="flex items-center justify-between px-2 bg-white rounded-xl p-2.5 border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-black text-stone-400 w-4">{item.rank}</span>
                              <div className="relative w-10 h-10">
                                <img src={item.avatar} className="w-10 h-10 rounded-full object-cover border border-stone-200" alt="avatar" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00e1cf] text-white text-[5px] px-1 rounded-full border border-white tracking-widest font-black leading-none py-0.5">
                                  LIVE
                                </div>
                              </div>
                              <span className="text-[12px] font-bold text-stone-800">{item.name}</span>
                            </div>
                            <div className="text-[11.5px] font-bold text-stone-500 font-mono flex items-center gap-1">
                              <span>🪙</span>{item.score.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Standard dynamic list raster (Daily, Weekly) */
                    <div className="px-5 space-y-3.5">
                      {currentList.map(item => {
                        const isGold = item.rank === 1;
                        const isSilver = item.rank === 2;
                        const isBronze = item.rank === 3;

                        return (
                          <div key={item.id} className="flex items-center justify-between bg-white rounded-2xl p-3 border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-6 flex items-center justify-center">
                                {isGold ? (
                                  <span className="text-lg">🥇</span>
                                ) : isSilver ? (
                                  <span className="text-lg">🥈</span>
                                ) : isBronze ? (
                                  <span className="text-lg">🥉</span>
                                ) : (
                                  <span className="text-[11px] font-black text-stone-400">{item.rank}</span>
                                )}
                              </div>

                              <div className="relative w-11 h-11">
                                {isGold && <span className="absolute -top-3 -left-1 text-[13px] rotate-[-15deg] z-10">👑</span>}
                                <div className={`w-11 h-11 rounded-full p-[1.5px] ${
                                  isGold ? 'bg-amber-400' : isSilver ? 'bg-slate-300' : isBronze ? 'bg-[#d39a75]' : 'bg-stone-100'
                                } overflow-hidden`}>
                                  <img src={item.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
                                </div>
                                {item.isLive && (
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#00e1cf] text-white text-[5px] px-1 rounded-full border border-white tracking-widest font-black leading-none whitespace-nowrap pt-[1px] shadow-sm">
                                    LIVE
                                  </div>
                                )}
                              </div>

                              <span className="text-[12px] font-extrabold text-[#111]">{item.name}</span>
                            </div>

                            <div className="flex items-center gap-1 text-[12px] font-black text-amber-500 font-mono">
                              <span>🪙</span>{item.score.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sticky User Standings Footer indicator inside sub-contents */}
                  <div className="px-5 mt-6 border-t border-stone-200 pt-4">
                    <div className="flex items-center justify-between bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-2xl p-3.5 shadow-inner">
                      <div className="flex items-center gap-3">
                        <span className="text-stone-400 font-black text-[10px] w-6 text-center">99+</span>
                        <div className="w-11 h-11 rounded-full p-[1.5px] bg-[#00e1cf] overflow-hidden shadow-md">
                          <img 
                            src={hostProfile?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150"} 
                            className="w-full h-full object-cover rounded-full" 
                            alt="avatar" 
                          />
                        </div>
                        <div>
                          <span className="text-[12px] font-black text-stone-900 leading-none">LovieDovie🕊️</span>
                          <span className="text-[8px] font-black uppercase bg-stone-200 text-stone-700 block px-1.5 py-0.5 rounded tracking-wide w-max mt-1">Hostess</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-[12px] font-black text-amber-500 font-mono">
                          <span>🪙</span>{myCurrentScore.toLocaleString()}
                        </div>
                        <span className="text-[7.5px] font-black uppercase text-cyan-500 tracking-wider mt-0.5">Active Region Rank</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================================== AGENCY & GUILD MATCH PORTAL ==================================== */
                <div className="px-5 mt-4 space-y-5">
                  
                  {/* Signed Agency Card */}
                  <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-5 border border-white/5 shadow-xl relative overflow-hidden">
                    {/* Metallic glow accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                          <Shield size={22} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black tracking-wide">Infinity Talent Agency</h4>
                          <span className="bg-amber-400 text-stone-950 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">Rank #12 • S-Tier Elite</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-amber-300 font-black tracking-widest uppercase">Member</span>
                    </div>

                    {/* Target Meter Progress */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-stone-300">Monthly Targets Split Bonus Progress:</span>
                        <span className="font-mono text-amber-300">{agencyMonthlyBeans.toLocaleString()} / 1,000,000 Beans</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(agencyMonthlyBeans / 1000000) * 100}%` }}
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" 
                        />
                      </div>
                      <p className="text-[9px] text-stone-400 italic">Target completion awards hostess an extra 15% platforms rebate, increasing the total share to 65%!</p>
                    </div>
                  </div>

                  {/* Intertwined Mechanics Flow Box */}
                  <div className="bg-white rounded-3xl p-4 border border-stone-100 shadow-sm space-y-3.5">
                    <h5 className="text-xs font-black uppercase text-stone-800 tracking-wider flex items-center gap-1.5 border-b border-stone-50 pb-2">
                      <Percent size={14} className="text-cyan-500" /> Accounting split & Ledger
                    </h5>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Streamer Net split (85%)</span>
                        <span className="text-sm font-extrabold text-stone-800">85% / 🪙 {(totalCost => totalCost * 0.85) (0)} Direct Payout</span>
                      </div>
                      <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                        <span className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Agency cut (15%)</span>
                        <span className="text-sm font-extrabold text-cyan-600">15% Routed Ledger</span>
                      </div>
                    </div>

                    <div className="bg-[#eefcfc] p-3 rounded-2xl text-[10px] leading-relaxed text-stone-600 flex items-start gap-2">
                      <Zap size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                      <span>Every support flower gifted increments rankings **AND** automatically splits commission directly to the Agency's certified contract balances. No manual invoice required!</span>
                    </div>
                  </div>

                  {/* Live Guild Battle PK Matches (Guild vs Guild Tournament) */}
                  <div className="bg-gradient-to-b from-rose-50 to-white/60 border border-[#ffe6ee] rounded-3xl p-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-1 right-2 animate-bounce">
                      <span className="text-lg">⚔️</span>
                    </div>
                    
                    <span className="bg-[#ff407f] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Active Tournament Match</span>
                    <h5 className="text-sm font-black text-stone-800 mt-2">Active: Mid-Year Global Agency Showdown</h5>
                    
                    {/* Live score comparative bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wide">
                        <div className="flex items-center gap-1 text-[#ff407f]">
                          <span className="w-2 h-2 rounded-full bg-[#ff407f] animate-ping" />
                          <span>Infinity Agency (Ours)</span>
                        </div>
                        <span className="text-stone-400">vs</span>
                        <span className="text-[#3b82f6]">Starline Talents</span>
                      </div>

                      <div className="flex items-center justify-between text-[13px] font-mono font-black mt-1">
                        <span className="text-[#ff407f]">{guildBattlePoints.toLocaleString()} PTS</span>
                        <span className="text-stone-400">—</span>
                        <span className="text-[#3b82f6]">39,800 PTS</span>
                      </div>

                      {/* Progressive duel slider block */}
                      <div className="w-full h-3 bg-stone-100 rounded-full flex overflow-hidden border border-stone-200">
                        {/* Our battle bar */}
                        <div className="bg-gradient-to-r from-red-400 to-[#ff407f] h-full" style={{ width: `${(guildBattlePoints / (guildBattlePoints + 39800)) * 100}%` }} />
                        {/* Opponent battle bar */}
                        <div className="bg-blue-400 h-full flex-1" />
                      </div>

                      <div className="text-[9px] text-[#ff407f] font-bold text-center italic mt-1.5 uppercase">
                        ⭐ Send Support flowers to inflate battle power with 3XP multiplier! ⭐
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Floating Pill CTA Bar (Unified action trigger in both modes) */}
            <div className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-stone-100 p-4 shrink-0 z-40 flex gap-2">
              
              <button
                onClick={() => handleBoostSupport('top1', toGetTop1Count)}
                className="flex-1 bg-gradient-to-r from-[#11e8d1] to-[#01cbbd] text-white hover:brightness-105 active:scale-95 transition-all py-2.5 rounded-full flex flex-col justify-center items-center cursor-pointer shadow-md shadow-cyan-400/15 text-center select-none"
              >
                <span className="text-[13px] font-black tracking-tight flex items-center gap-1">
                  🌹 x{toGetTop1Count.toLocaleString()}
                </span>
                <span className="text-[8.5px] font-extrabold uppercase opacity-90 tracking-widest mt-0.5">To Get Top1</span>
              </button>

              <button
                onClick={() => handleBoostSupport('list', toGetOnListCount)}
                className="flex-1 bg-gradient-to-r from-[#11e8d1] to-[#01cbbd] text-white hover:brightness-105 active:scale-95 transition-all py-2.5 rounded-full flex flex-col justify-center items-center cursor-pointer shadow-md shadow-cyan-400/15 text-center select-none"
              >
                <span className="text-[13px] font-black tracking-tight flex items-center gap-1">
                  🌹 x{toGetOnListCount.toLocaleString()}
                </span>
                <span className="text-[8.5px] font-extrabold uppercase opacity-90 tracking-widest mt-0.5">To Get On The List</span>
              </button>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
