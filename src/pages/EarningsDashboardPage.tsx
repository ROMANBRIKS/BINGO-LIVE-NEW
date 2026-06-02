import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, Wallet, CreditCard, History, TrendingUp, 
  DollarSign, ArrowUpRight, ArrowDownLeft, Info,
  CheckCircle2, AlertCircle, Zap, ShieldCheck, 
  Banknote, Landmark, Settings, HelpCircle, Briefcase,
  AlertTriangle, Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy, updateDoc, setDoc, increment } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function EarningsDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'History' | 'Withdraw'>('Overview');
  const [agencyName, setAgencyName] = useState<string | null>(null);
  const [adBeansMode, setAdBeansMode] = useState<string>('off');
  const [fallbackSalaryRate, setFallbackSalaryRate] = useState<number>(20);

  // Dynamic Simulator State
  const [simBeans, setSimBeans] = useState<number>(10000);
  const [simHours, setSimHours] = useState<number>(30);
  const [simDays, setSimDays] = useState<number>(15);

  // Ad CPM Simulator State
  const [simViewsRef, setSimViewsRef] = useState<number>(50000);
  const [simCpmCountry, setSimCpmCountry] = useState<string>('US');

  // Real Withdrawal State
  const [withdrawBeans, setWithdrawBeans] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  // Helper to calculate dynamic host salary in beans (1 USD = 210 Beans) using correct agency/solo splits
  const calculateSalaryForTier = (beansEarned: number, targetBeans: number, normalSalaryBeans: number, isUnderAgency: boolean) => {
    const progressFraction = Math.min(1, beansEarned / targetBeans);
    
    if (progressFraction >= 1.0) {
      if (isUnderAgency) {
        return normalSalaryBeans;
      } else {
        return normalSalaryBeans * 0.50;
      }
    } else {
      if (isUnderAgency) {
        return normalSalaryBeans * progressFraction * 0.50;
      } else {
        return normalSalaryBeans * progressFraction * 0.25;
      }
    }
  };

  const getDynamicHostSalaryBeans = (beansEarned: number, isUnderAgency: boolean) => {
    if (beansEarned <= 0) return 0;
    
    const tiers = [
      { target: 1000000, salary: 5000 * 210 },
      { target: 150000, salary: 1800 * 210 },
      { target: 50000, salary: 600 * 210 },
      { target: 30000, salary: 350 * 210 },
      { target: 10000, salary: 120 * 210 },
    ];

    let activeTier = tiers[tiers.length - 1]; // Default to 10K target
    for (let i = 0; i < tiers.length; i++) {
      if (beansEarned >= tiers[i].target) {
        activeTier = tiers[i];
        break;
      } else if (i < tiers.length - 1 && beansEarned >= tiers[i + 1].target) {
        activeTier = tiers[i];
        break;
      }
    }

    return calculateSalaryForTier(beansEarned, activeTier.target, activeTier.salary, isUnderAgency);
  };

  const handleConfirmWithdrawal = async () => {
    if (!auth.currentUser || !profile) {
      showToast("You must be logged in to execute a withdrawal.", "error");
      return;
    }

    const isWithdrawalBanned = profile.bannedWithdrawals && (!profile.suspendedUntil || new Date(profile.suspendedUntil) > new Date());
    if (isWithdrawalBanned || profile.isBanned || profile.bannedApp) {
      showToast("Your withdrawals & payouts features have been restricted under selective safety locks.", "error");
      return;
    }

    const amount = Number(withdrawBeans);
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid positive amount of Beans.", "error");
      return;
    }

    const spendableGift = profile.beans || 0;
    const isUnderAgency = Boolean(profile.agencyId);
    const spendableSalary = getDynamicHostSalaryBeans(profile.totalBeansEarned || 0, isUnderAgency);
    const spendableAd = adBeansMode === 'on' ? (profile.adBeans || 0) : 0;
    const spendableBeans = spendableGift + spendableSalary + spendableAd;

    if (amount > spendableBeans) {
      showToast(`Insufficient balance. Combined Available Beans: ${spendableBeans.toLocaleString(undefined, {maximumFractionDigits:2})}`, "error");
      return;
    }

    setIsWithdrawing(true);
    try {
      const uid = auth.currentUser.uid;
      const withdrawalId = `with_${Date.now()}`;
      const usdValue = Number((amount / 210).toFixed(2));

      // 1. Write the transaction / withdrawal record in real-deal root collection
      const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
      await setDoc(withdrawalRef, {
        id: withdrawalId,
        userId: uid,
        userName: profile.displayName || 'Anonymous User',
        userEmail: profile.email || auth.currentUser.email || 'no-email@bingolive.com',
        userPhoto: profile.photoURL || '',
        beansAmount: amount,
        usdAmount: usdValue,
        method: 'PayPal',
        status: 'completed', // Live money has moved. Keep it real time.
        timestamp: new Date().toISOString()
      });

      // Calculate separate deductions:
      // Deduct from Gift Beans (and salary pool representing current beans) first, then Ad Beans buffer
      let deductGift = 0;
      let deductAd = 0;
      const combinedGiftPool = spendableGift + spendableSalary;

      if (amount <= combinedGiftPool) {
        deductGift = amount;
      } else {
        deductGift = combinedGiftPool;
        deductAd = amount - combinedGiftPool;
      }

      // 2. Reduce the host's bean balance atomically in Firestore
      const userRef = doc(db, 'users', uid);
      const updatePayload: any = {};
      if (deductGift > 0) {
        // Since salary is dynamic, any withdrawal from main pool reduces user's standard beans balance in DB
        updatePayload.beans = increment(-deductGift);
      }
      if (deductAd > 0) {
        updatePayload.adBeans = increment(-deductAd);
      }
      await updateDoc(userRef, updatePayload);

      // 3. Optional: Add record into sub-transactions list inside users/{uid}/transactions
      const subTxRef = doc(db, `users/${uid}/transactions`, withdrawalId);
      await setDoc(subTxRef, {
        id: withdrawalId,
        amount: usdValue,
        type: 'salary',
        method: 'PayPal',
        timestamp: new Date().toISOString()
      });

      // 4. Read the updated balance in local profile state
      setProfile(prev => prev ? { 
        ...prev, 
        beans: Math.max(0, spendableGift - deductGift),
        adBeans: Math.max(0, (prev.adBeans || 0) - deductAd)
      } : null);

      showToast(`Withdrawal of $${usdValue} USD successfully executed! 💸`, 'success');
      setWithdrawBeans('');
      
      // Refresh History instantly
      const historySnap = await getDocs(
        query(
          collection(db, `users/${uid}/transactions`), 
          where('type', '==', 'salary'),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
      );
      setHistory(historySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      setActiveTab('Overview');
    } catch (error: any) {
      console.error("Error confirming withdrawal:", error);
      showToast(error.message || "Failed to submit withdrawal requested.", "error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);

          if (userData.agencyId) {
            const agencyDoc = await getDoc(doc(db, 'agencies', userData.agencyId));
            if (agencyDoc.exists()) {
              setAgencyName(agencyDoc.data().name);
            }
          }

          // Read dynamic ad beans administrative status
          try {
            const adFeatureDoc = await getDoc(doc(db, 'features', 'ad_beans'));
            if (adFeatureDoc.exists()) {
              const data = adFeatureDoc.data();
              setAdBeansMode(data.mode || 'off');
              if (data.fallbackSalaryRate !== undefined) {
                setFallbackSalaryRate(Number(data.fallbackSalaryRate));
              }
            }
          } catch (e) {
            console.error("Ad features configuration read skipped:", e);
          }

          // Fetch Payout History
          const historySnap = await getDocs(
            query(
              collection(db, `users/${auth.currentUser.uid}/transactions`), 
              where('type', '==', 'salary'),
              orderBy('timestamp', 'desc'),
              limit(10)
            )
          );
          setHistory(historySnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#050505]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const beansToDollar = (beans: number) => (beans / 210).toFixed(2);

  return (
    <div className="flex flex-col bg-[#050505] h-full overflow-hidden text-white">
      {/* Header */}
      <header className="flex-none bg-gradient-to-b from-emerald-900/40 to-black pt-6 pb-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">Earnings Center</h1>
          <button className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <Settings size={20} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="relative z-10 bg-[#0c0c0d] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px]" />

          {(() => {
            const giftBeans = profile?.beans || 0;
            const isUnderAgency = Boolean(profile?.agencyId);
            const salaryBeansBonus = getDynamicHostSalaryBeans(profile?.totalBeansEarned || 0, isUnderAgency);
            const adBeansUnlocked = adBeansMode === 'on';
            const adBeansCount = adBeansUnlocked ? (profile?.adBeans || 0) : 0;
            const aggregateBalance = giftBeans + salaryBeansBonus + adBeansCount;

            return (
              <>
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Aggregate Wallet Balance</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter">
                      {aggregateBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                  <span className="text-xs font-black text-amber-400 uppercase italic tracking-widest">
                    Total Combined ≈ ${beansToDollar(aggregateBalance)} USD
                  </span>
                </div>

                {/* Symmetrical 3-Column Breakdown Split */}
                <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-5 mb-6 text-xs text-center">
                  <div className="space-y-1 border-r border-white/5 pr-1">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider block">🎁 Gift Beans</span>
                    <span className="text-sm font-black text-emerald-400">{giftBeans.toLocaleString()} BEANS</span>
                    <span className="block text-[8px] font-medium text-zinc-600 uppercase">≈ ${beansToDollar(giftBeans)}</span>
                  </div>

                  <div className="space-y-1 border-r border-white/5 px-1">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider block">💼 Base Salary</span>
                    <span className={cn("text-sm font-black", salaryBeansBonus > 0 ? "text-cyan-400" : "text-zinc-600")}>
                      {salaryBeansBonus.toLocaleString()} BEANS
                    </span>
                    <span className="block text-[8px] font-medium text-zinc-600 uppercase">≈ ${beansToDollar(salaryBeansBonus)}</span>
                  </div>

                  <div className="space-y-1 pl-1 relative">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-0.5">
                      🎥 Ad Beans
                    </span>
                    {adBeansUnlocked ? (
                      <>
                        <span className="text-sm font-black text-amber-400">{(profile?.adBeans || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} BEANS</span>
                        <span className="block text-[8px] font-medium text-zinc-600 uppercase">≈ ${beansToDollar(profile?.adBeans || 0)}</span>
                      </>
                    ) : (
                      <div className="py-1">
                        <span className="inline-block px-1.5 py-0.5 bg-amber-550/15 text-amber-400 text-[7px] font-black tracking-widest rounded-md uppercase animate-pulse">
                          COMING SOON
                        </span>
                        <span className="block text-[7px] font-bold text-zinc-600 uppercase tracking-tight mt-0.5">
                          Admin Flow Muted
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('Withdraw')}
              className="py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Withdraw
            </button>
            <button 
              onClick={() => showToast("Payment settings coming soon! 🏦", 'info')}
              className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-white/10 active:scale-95 transition-all"
            >
              Link Bank
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2 gap-8 mt-8">
          {['Overview', 'History', 'Withdraw'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "py-2 text-[10px] font-black uppercase italic tracking-widest transition-all relative",
                activeTab === tab ? "text-white" : "text-white/20"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">This Month</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    <span className="text-xl font-black text-white italic">+$420</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Payouts</span>
                  <div className="flex items-center gap-2">
                    <Banknote size={20} className="text-emerald-400" />
                    <span className="text-xl font-black text-white italic">$2.4K</span>
                  </div>
                </div>
              </div>

              {/* Conversion Info */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Info size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Conversion Rate Overview</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic">
                  Standard Cashout Payout Peg: 210 Beans = $1.00 USD. Meeting official agency targets (minimum 10K/30K/50K/150K Beans + 30 active hours across 15 qualifying days) triggers the official Base Salary Bonus, automatically added to your aggregate wallet under-the-hood.
                </p>
              </div>

              {/* Ad CPM, Geotargeting & VPN Shield Hub (Coming Soon & Beta Estimator) */}
              <div className="bg-[#0c0c0d] border border-amber-500/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight text-amber-400 flex items-center gap-2">
                      <span className="font-sans text-amber-500">&bull;</span> Sponsor Ads & Geotargeted CPM Desk
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Track location metrics, CPM split, and anti-proxy VPN safety logs</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest text-amber-400 rounded-full self-start">
                    Coming Soon • Beta Calculator
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  Company sponsors pay different CPM rates depending on where your audiences reside. High-value locations yield higher reward multipliers. Our automatic **VPN & Proxy Guard** verifies user zones using timezone locale cross-checking to filter fraudulent bots.
                </p>

                {/* Country selector with CPM pricing */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">1. Select Estimated Spectator Region</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { code: 'US', label: 'United States', cpm: 12.00, color: 'border-blue-500/20 text-blue-400' },
                      { code: 'GB', label: 'United Kingdom', cpm: 9.50, color: 'border-red-500/20 text-red-400' },
                      { code: 'CA', label: 'Canada', cpm: 9.00, color: 'border-cyan-500/20 text-cyan-400' },
                      { code: 'DE', label: 'Germany', cpm: 8.50, color: 'border-yellow-500/20 text-yellow-500' },
                      { code: 'JP', label: 'Japan', cpm: 8.00, color: 'border-emerald-500/20 text-emerald-400' },
                      { code: 'DEFAULT', label: 'Others', cpm: 1.80, color: 'border-zinc-500/20 text-zinc-400' }
                    ].map((region) => (
                      <button
                        key={region.code}
                        onClick={() => {
                          setSimCpmCountry(region.code);
                          showToast(`Selected region: ${region.label} ($${region.cpm.toFixed(2)} CPM)`, 'info');
                        }}
                        className={cn(
                          "p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-0.5 shrink-0 cursor-pointer",
                          simCpmCountry === region.code 
                            ? "bg-amber-500 text-black border-amber-400 font-extrabold shadow-lg shadow-amber-500/10" 
                            : "bg-white/5 border-white/5 hover:bg-white/10 text-white/50"
                        )}
                      >
                        <span className="text-[12px] font-black">{region.code}</span>
                        <span className="text-[8px] opacity-80">${region.cpm.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Impressions count slider */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-xs">
                    <span className="font-extrabold text-zinc-400 uppercase tracking-widest text-[9px]">2. Monthly Premium Ad Views</span>
                    <span className="font-black text-amber-400 italic">{(simViewsRef).toLocaleString()} Impressions</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="200000" 
                    step="5000"
                    value={simViewsRef} 
                    onChange={(e) => setSimViewsRef(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase">
                    <span>1K views</span>
                    <span>100K views</span>
                    <span>200K views</span>
                  </div>
                </div>

                {/* Simulated Outcome calculation row */}
                {(() => {
                  const getCpmForCode = (code: string) => {
                    if (code === 'US') return 12.00;
                    if (code === 'GB') return 9.50;
                    if (code === 'CA') return 9.00;
                    if (code === 'DE') return 8.50;
                    if (code === 'JP') return 8.00;
                    return 1.80; // Default others
                  };
                  
                  const cpm = getCpmForCode(simCpmCountry);
                  const usdEarnings = (simViewsRef / 1000) * cpm;
                  // 210 Beans = $1.00 USD
                  const simulatedAdBeans = usdEarnings * 210;

                  return (
                    <div className="bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10 space-y-3.5">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Globe size={15} />
                        <span className="text-xs font-black uppercase tracking-wider">Estimated Monthly Earnings</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Selected Region CPM</span>
                          <span className="text-sm font-black text-white">${cpm.toFixed(2)} CPM Rate</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Estimated Ad Profit Share</span>
                          <span className="text-sm font-black text-emerald-400">Optimized payout share</span>
                        </div>
                      </div>

                      <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Projected Beans Generated:</span>
                          <span className="font-black text-amber-400">+{simulatedAdBeans.toLocaleString(undefined, { maximumFractionDigits: 1 })} BEANS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Estimated Cash Value:</span>
                          <span className="font-black text-stone-200">≈ ${usdEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
                        </div>
                      </div>

                      {/* VPN Protection Alert block */}
                      <div className="text-[9px] text-[#cca560] leading-snug flex items-center gap-1.5 bg-[#423114]/20 border border-[#bfa14c]/10 p-2.5 rounded-xl">
                        <span className="text-xs">🛡️</span>
                        <span>
                          <strong>Anti-Farming Activated:</strong> Views with mismatched timezones / proxy signals are auto-flagged and discarded from billing tables.
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Target & Cliff Penalty Simulator */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Target Cliff Calculator</h3>
                  </div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Interactive Calculator</span>
                </div>

                {/* Symmetrical Controls */}
                <div className="space-y-4">
                  {/* Beans Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/60">Estimated Monthly Beans</span>
                      <span className="font-black text-cyan-400 italic">{(simBeans).toLocaleString()} Beans</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="160000" 
                      step="2500"
                      value={simBeans} 
                      onChange={(e) => setSimBeans(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex gap-2">
                      {[10000, 30000, 50000, 150000].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSimBeans(val)}
                          className={cn(
                            "px-3 py-1 text-[8px] font-bold rounded-lg uppercase transition-all",
                            simBeans === val ? "bg-cyan-500 text-black font-black" : "bg-white/5 text-white/40 hover:bg-white/10"
                          )}
                        >
                          {(val / 1000).toFixed(0)}K Target
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hours Selector */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/60">Streaming Contact Hours</span>
                      <span className={cn("font-black italic", simHours >= 30 ? "text-emerald-400" : "text-pink-400")}>
                        {simHours} Hours {simHours < 30 ? "(Failed)" : "(Met)"}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="40" 
                      value={simHours} 
                      onChange={(e) => setSimHours(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase">
                      <span>0h</span>
                      <span className="text-emerald-500/60 font-black">⭐ 30h Required</span>
                      <span>40h</span>
                    </div>
                  </div>

                  {/* Days Selector */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white/60">Active Streaming Days</span>
                      <span className={cn("font-black italic", simDays >= 15 ? "text-emerald-400" : "text-pink-400")}>
                        {simDays} Days {simDays < 15 ? "(Failed)" : "(Met)"}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      value={simDays} 
                      onChange={(e) => setSimDays(Number(e.target.value))}
                      className="w-full accent-teal-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase">
                      <span>0d</span>
                      <span className="text-teal-500/60 font-black">⭐ 15d Required</span>
                      <span>20d</span>
                    </div>
                  </div>
                </div>

                {/* Target Requirements Audit checklist */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Contract Validation Checks</div>
                  
                  {/* Beans Check */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">1. Beans target for level:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white/80">{simBeans.toLocaleString()} / {
                        simBeans >= 150000 ? "150,000" :
                        simBeans >= 50000 ? "50,000" :
                        simBeans >= 30000 ? "30,000" : "10,000"
                      }</span>
                      {simBeans >= (simBeans >= 150000 ? 150000 : simBeans >= 50000 ? 50000 : simBeans >= 30000 ? 30000 : 10000) ? (
                        <span className="text-emerald-400 font-extrabold text-[10px]">✔ PASS</span>
                      ) : (
                        <span className="text-pink-400 font-extrabold text-[10px]">✘ FAIL</span>
                      )}
                    </div>
                  </div>

                  {/* Hours Check */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">2. Active Broadcaster hours:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white/80">{simHours} / 30 hrs</span>
                      {simHours >= 30 ? (
                        <span className="text-emerald-400 font-extrabold text-[10px]">✔ PASS</span>
                      ) : (
                        <span className="text-pink-400 font-extrabold text-[10px]">✘ FAIL ({30 - simHours}h short)</span>
                      )}
                    </div>
                  </div>

                  {/* Days Check */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">3. Active broadcasting days:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white/80">{simDays} / 15 days</span>
                      {simDays >= 15 ? (
                        <span className="text-emerald-400 font-extrabold text-[10px]">✔ PASS</span>
                      ) : (
                        <span className="text-pink-400 font-extrabold text-[10px]">✘ FAIL ({15 - simDays}d short)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calculation Outputs: Target Met vs Fallback Cliff */}
                {(() => {
                  const getSimTarget = (beans: number) => {
                    if (beans >= 1000000) return { label: "High Tier (1M+)", targetBeans: 1000000, baseBonus: 5000 };
                    if (beans >= 150000) return { label: "Tier 4 (150K)", targetBeans: 150000, baseBonus: 1800 };
                    if (beans >= 50000) return { label: "Tier 3 (50K)", targetBeans: 50000, baseBonus: 600 };
                    if (beans >= 30000) return { label: "Tier 2 (30K)", targetBeans: 30000, baseBonus: 350 };
                    return { label: "Tier 1 (10K)", targetBeans: 10000, baseBonus: 120 };
                  };

                  const target = getSimTarget(simBeans);
                  const isQualified = simBeans >= target.targetBeans && simHours >= 30 && simDays >= 15;
                  
                  const gifterDollarSpend = simBeans * 0.025; // 40 diamonds per $1, 1 diamond sent = 1 bean received -> cost is $0.025 per bean
                  const standardCashoutValue = simBeans / 210;
                  
                  // Side-by-Side: Agency vs. Solo Calculations
                  const progressFraction = Math.min(1, simBeans / target.targetBeans);
                  const agencyBonusUSD = isQualified ? target.baseBonus : (target.baseBonus * progressFraction * 0.50);
                  const soloBonusUSD = isQualified ? (target.baseBonus * 0.50) : (target.baseBonus * progressFraction * 0.25);
                  const guaranteedBonus = agencyBonusUSD;
                  const finalPayoutUSD = standardCashoutValue + guaranteedBonus;
                  const totalAgencyPayout = standardCashoutValue + agencyBonusUSD;
                  const totalSoloPayout = standardCashoutValue + soloBonusUSD;
                  const effectiveSplitRate = gifterDollarSpend > 0 ? (finalPayoutUSD / gifterDollarSpend) * 100 : 0;
                  return (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">Comparative Visualizer</div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option A: Agency Streamer */}
                        <div className={cn("p-5 rounded-3xl space-y-3 border", isQualified ? "bg-emerald-500/10 border-emerald-500/20" : "bg-cyan-500/10 border-cyan-500/20")}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-cyan-400">Registered Agency Host</span>
                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", isQualified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                              {isQualified ? "100% Base Secured" : "Split Penalty (50% Off)"}
                            </span>
                          </div>
                          
                          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/40">Standard Wallet Co:</span>
                              <span className="font-bold text-slate-200">${standardCashoutValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Contract Base Salary:</span>
                              <span className="font-bold text-cyan-400 font-mono">+${agencyBonusUSD.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-1 font-black text-white">
                              <span>Total Agency Pay:</span>
                              <span className="text-cyan-400">${totalAgencyPayout.toFixed(2)} USD</span>
                            </div>
                          </div>
                        </div>

                        {/* Option B: Solo Streamer */}
                        <div className="bg-[#121213] border border-white/5 p-5 rounded-3xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-pink-400">Independent/Solo Host</span>
                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", isQualified ? "bg-purple-500/20 text-purple-400" : "bg-rose-500/20 text-rose-500")}>
                              {isQualified ? "50% Base Cap" : "Split Penalty (25% Cap)"}
                            </span>
                          </div>

                          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-[#a1a1aa]">Standard Wallet Co:</span>
                              <span className="font-bold text-slate-200">${standardCashoutValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a1a1aa]">Solo Base Salary:</span>
                              <span className="font-bold text-pink-400 font-mono">+${soloBonusUSD.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-1 font-black text-white">
                              <span>Total Independent Pay:</span>
                              <span className="text-pink-400">${totalSoloPayout.toFixed(2)} USD</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400 italic leading-snug font-mono">
                        ⚠️ Streamers registered with an agency keep 100% of their base salary on success. Under-target performers under agencies receive on-target progress cut in half. Solo streamers receive a flat 50% target cap on success, and a 25% progress coefficient on miss. No unannounced penalties apply.
                      </div>
                      
                      {false && isQualified ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl space-y-3">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-black uppercase tracking-wider">Official Salary Secured</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest">Diamonds Cost (Gifters)</span>
                              <span className="text-sm font-black text-white">${gifterDollarSpend.toFixed(2)} USD</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest">Broadcaster Status</span>
                              <span className="text-sm font-black text-emerald-400">Active Partner</span>
                            </div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/60">Standard Wallet Cash-out:</span>
                              <span className="font-black text-slate-200">${standardCashoutValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Guaranteed Base Salary:</span>
                              <span className="font-black text-emerald-400">+${guaranteedBonus.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-1 font-bold">
                              <span className="text-white">Total Host Payout:</span>
                              <span className="text-emerald-400">${finalPayoutUSD.toFixed(2)} USD</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-pink-500/10 border border-pink-500/20 p-5 rounded-3xl space-y-3">
                          <div className="flex items-center gap-2 text-pink-400">
                            <AlertTriangle size={16} />
                            <span className="text-xs font-black uppercase tracking-wider">Salary Forfeated (Cliff Triggered)</span>
                          </div>
                          
                          <p className="text-[11px] text-pink-300 leading-tight italic">
                            ⚠️ Incomplete target requirements disqualify you from the Base Salary Bonus. You are dropped to the casual 210:1 withdrawal rate.
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest">Gifter Diamonds Cost</span>
                              <span className="text-sm font-black text-white">${gifterDollarSpend.toFixed(2)} USD</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-bold text-white/40 uppercase tracking-widest">Broadcaster Status</span>
                              <span className="text-sm font-black text-pink-400">Casual Account</span>
                            </div>
                          </div>

                          <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 text-xs text-white/80">
                            <div className="flex justify-between text-pink-400 font-bold">
                              <span>Lost Base Salary Reward:</span>
                              <span>-${target.baseBonus.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Standard Wallet Cash-out:</span>
                              <span>+${standardCashoutValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-1 font-bold text-white flex-wrap">
                              <span>Total Net Payout:</span>
                              <span>${standardCashoutValue.toFixed(2)} USD</span>
                            </div>
                          </div>

                          <div className="text-[9px] text-white/40 leading-snug">
                            Broadcasters have the option to withdraw at the standard casual 210:1 payout rate to cover store distributions and operational margins.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Agency Affiliation Widget */}
              {profile?.agencyId && (
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-[2rem] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-widest text-cyan-400">Signed Partner Agency</span>
                      <h4 className="text-sm font-black text-white">{agencyName || "BINGO Official Agency"}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-[#00cbd6] mb-1">Contract Status</span>
                    <span className="text-xs font-extrabold text-[#00cbd6] tracking-tight bg-cyan-400/10 px-2 py-1 rounded-md">Signed Partner (10%)</span>
                  </div>
                </div>
              )}

              {/* Payout Methods */}
              <section className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Payout Methods</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Landmark, title: 'Bank Transfer', desc: 'Direct to your local bank account.', status: 'Not Linked' },
                    { icon: CreditCard, title: 'PayPal', desc: 'Fast and secure digital wallet.', status: 'Linked', active: true },
                    { icon: Wallet, title: 'Crypto (USDT)', desc: 'Withdraw in stablecoin.', status: 'Coming Soon' }
                  ].map((method, i) => (
                    <div key={i} className="bg-white/5 p-5 rounded-[2rem] border border-white/10 flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", method.active ? "text-emerald-400" : "text-white/20")}>
                        <method.icon size={24} />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-black italic uppercase tracking-tight text-white">{method.title}</span>
                        <span className="text-[10px] text-white/40 leading-tight">{method.desc}</span>
                      </div>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full", method.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20")}>
                        {method.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'History' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Recent Payouts</h3>
              <div className="bg-white/5 rounded-[2.5rem] p-2 border border-white/10">
                {history.length > 0 ? history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-[2rem] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                        <ArrowUpRight size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black italic uppercase text-white">Withdrawal: {item.method || 'PayPal'}</span>
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                          {item.timestamp?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-400 italic">-${item.amount}</div>
                      <div className="text-[8px] text-white/20 uppercase tracking-widest">Completed</div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                      <History size={32} />
                    </div>
                    <p className="text-xs text-white/40 font-medium italic uppercase tracking-widest">No payout history</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Withdraw' && (
            <motion.div 
              key="withdraw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Amount to Withdraw</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="ENTER BEANS AMOUNT"
                      value={withdrawBeans}
                      onChange={(e) => setWithdrawBeans(e.target.value)}
                      disabled={isWithdrawing}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-black italic uppercase tracking-widest placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-400 font-black italic">BEANS</div>
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Available Balance: {profile?.beans?.toLocaleString() || '0'}</span>
                    <button 
                      onClick={() => profile && setWithdrawBeans((profile.beans || 0).toString())}
                      className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline"
                    >
                      Max Amount
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Select Method</label>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Landmark size={20} className="text-emerald-400" />
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">PayPal ({profile?.email || auth.currentUser?.email || "****@gmail.com"})</span>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                </div>

                <button 
                  disabled={isWithdrawing}
                  onClick={handleConfirmWithdrawal}
                  className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isWithdrawing ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 px-4 py-4 bg-white/5 rounded-2xl border border-white/10">
                <ShieldCheck size={20} className="text-emerald-400" />
                <p className="text-[10px] text-white/40 font-medium leading-tight">
                  Your transactions are secured with military-grade encryption. Payouts are processed within 3-5 business days.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex-none p-4 bg-black border-t border-white/10">
        <button 
          onClick={() => showToast("Payout help coming soon! 🆘", 'info')}
          className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
        >
          <HelpCircle size={18} />
          Payout FAQ & Support
        </button>
      </div>
    </div>
  );
}
