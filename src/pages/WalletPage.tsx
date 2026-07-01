import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Mail, X, HelpCircle, FileText, Check, Award, Crown, Gift, HelpCircle as HelpIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

type WalletTab = 'Diamonds' | 'Beans';

interface DiamondPkg {
  id: number;
  diamonds: number;
  bonus: number;
  price: number;
  originalPrice: number | null;
  isHot?: boolean;
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<WalletTab>('Diamonds');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number>(1); // Default to 40+20 package
  const [isRecharging, setIsRecharging] = useState(false);
  const [isWalletExpanded, setIsWalletExpanded] = useState(true);

  // Custom Ad & Salary settings read from Firestore features collection
  const [adBeansMode, setAdBeansMode] = useState<string>('off');
  const [fallbackSalaryRate, setFallbackSalaryRate] = useState<number>(20);

  useEffect(() => {
    const loadFeatureSettings = async () => {
      try {
        const adFeatureDoc = await getDoc(doc(db, 'features', 'ad_beans'));
        if (adFeatureDoc.exists()) {
          const data = adFeatureDoc.data();
          setAdBeansMode(data.mode || 'off');
          setFallbackSalaryRate(Number(data.fallbackSalaryRate) ?? 20);
        }
      } catch (e) {
        console.error("Skipped loading ad beans features:", e);
      }
    };
    loadFeatureSettings();
  }, []);

  // Verification & Binding dialog states for high-fidelity Bingo clones
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showBindModal, setShowBindModal] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState<'exchange' | 'history' | null>(null);

  // Form inputs for phone & email
  const [phoneCode, setPhoneCode] = useState('+234');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isBinding, setIsBinding] = useState(false);

  const handleBindSecurely = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!phoneNumberInput.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsBinding(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, {
        phoneNumber: `${phoneCode}${phoneNumberInput.replace(/\s+/g, '')}`,
        email: emailInput.trim(),
      }, { merge: true });

      showToast("Account securely bound! Phone & Email linked successfully. 🔐", "success");
      setShowBindModal(false);
      setShowNoticeModal(false);

      // Fast-forward to action
      if (noticeTarget === 'exchange') {
        navigate('/earnings-dashboard');
      } else if (noticeTarget === 'history') {
        navigate('/withdrawal-history');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to bind account.", "error");
    } finally {
      setIsBinding(false);
    }
  };

  // Exact Bingo Packages from Screenshot
  const diamondPackages: DiamondPkg[] = [
    { id: 0, diamonds: 2, bonus: 20, price: 0.07, originalPrice: null },
    { id: 1, diamonds: 40, bonus: 20, price: 0.99, originalPrice: 1.40, isHot: true },
    { id: 2, diamonds: 284, bonus: 28, price: 6.99, originalPrice: null },
    { id: 3, diamonds: 815, bonus: 30, price: 19.99, originalPrice: null },
    { id: 4, diamonds: 3715, bonus: 30, price: 89.99, originalPrice: null },
  ];

  const currentPkg = diamondPackages.find(p => p.id === selectedPackage) || diamondPackages[1];

  const handleRecharge = async () => {
    if (!profile) {
      showToast("Please log in first", "error");
      return;
    }
    setIsRecharging(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const totalDiamondsBought = currentPkg.diamonds + currentPkg.bonus;
      const purchaseId = `pur_${Date.now()}`;

      // 1. Update user diamonds balance atomically
      await setDoc(userRef, {
        diamonds: increment(totalDiamondsBought)
      }, { merge: true });

      // 2. Log store purchase in global auditing path
      const purchaseRef = doc(db, 'purchases', purchaseId);
      await setDoc(purchaseRef, {
        id: purchaseId,
        userId: profile.uid,
        userName: profile.displayName || 'Anonymous User',
        diamondsBought: totalDiamondsBought,
        priceUSD: currentPkg.price,
        timestamp: new Date().toISOString()
      });

      // 3. Log sub-transaction for user ledger
      const txRef = doc(db, `users/${profile.uid}/transactions`, purchaseId);
      await setDoc(txRef, {
        id: purchaseId,
        amount: totalDiamondsBought,
        type: 'purchase',
        priceUSD: currentPkg.price,
        timestamp: new Date().toISOString()
      });

      showToast(`Successfully purchased ${totalDiamondsBought} Diamonds! 💎`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to complete diamond purchase", 'error');
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E2022] font-sans antialiased select-none flex flex-col pb-32">
      {/* Fixed Sticky Header exactly as per Screenshot with center Back arrow & Center Title */}
      <header className="bg-white px-4 pt-10 pb-3 flex flex-col border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="relative flex items-center justify-center w-full h-10">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 p-2 active:scale-95 transition-transform"
            id="back-wallet-btn"
          >
            <ChevronLeft size={24} className="text-[#1E2022]" />
          </button>
          <span className="text-lg font-bold text-[#1E2022]">Wallet</span>
        </div>

        {/* Dynamic Underlined Tabs with thick black indicator centered below active option */}
        <div className="flex justify-start gap-8 mt-2 px-2">
          {['Diamonds', 'Beans'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as WalletTab);
                  // Quick aesthetic transition
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 300);
                }}
                className={cn(
                  "text-[15px] font-bold pb-2 transition-all relative",
                  isActive ? "text-[#1E2022] font-extrabold" : "text-[#909399]"
                )}
                id={`tab-${tab.toLowerCase()}`}
              >
                {tab}
                {isActive && (
                  <motion.div 
                    layoutId="walletUnderlineIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[4px] bg-[#1E2022] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Primary Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="w-8 h-8 border-3 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : activeTab === 'Diamonds' ? (
            <motion.div
              key="diamonds-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Peach gradient balance block exactly matching layout and background hues */}
              <div className="bg-gradient-to-br from-[#FFF5EC] to-[#FFEAD2] border border-[#FFDECE] rounded-[1.5rem] p-6 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Stylized polygon diamond in gold */}
                      <div className="w-8 h-8 bg-[#FFA800]/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                      </div>
                      <span className="text-4xl font-extrabold text-[#111111] tracking-tight">
                        {profile?.diamonds || 0}
                      </span>
                    </div>
                    {/* Account Balance trigger link */}
                    <button className="flex items-center gap-0.5 text-[#FFA46B] text-[13px] font-bold text-left hover:opacity-85 active:scale-95 duration-100 mt-2">
                      Account Balance <ChevronRight size={13} className="stroke-[3]" />
                    </button>
                  </div>

                  {/* Top-Right Double Red-Orange Ledger/History Icons */}
                  <div className="flex items-center gap-2 absolute top-0 right-0">
                    <button className="w-8 h-8 rounded-full bg-[#FFF2E8] text-[#FF5A00] flex items-center justify-center hover:bg-[#FFE3D0] transition-colors" title="Diamond History">
                      <FileText size={16} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-[#FFF2E8] text-[#FF5A00] flex items-center justify-center hover:bg-[#FFE3D0] transition-colors" title="Transaction Settings">
                      <span className="text-xs font-bold">$</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Wallet section with expand indicator */}
              <div className="bg-white rounded-3xl p-4 border border-gray-100/80 shadow-sm space-y-4">
                <button 
                  onClick={() => setIsWalletExpanded(!isWalletExpanded)}
                  className="w-full flex items-center justify-between font-bold text-sm text-[#606266]"
                >
                  <div className="flex items-center gap-2">
                    {/* Google Wallet custom multi-brand badge */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-100">
                      <img 
                        src="https://www.gstatic.com/images/branding/product/1x/wallet_48dp.png" 
                        alt="Google Wallet" 
                        className="w-4 h-4 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[12px] font-black tracking-tight text-[#1E2022]">Google Wallet</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={cn("text-gray-400 transition-transform duration-200", isWalletExpanded && "rotate-90")} />
                </button>

                {isWalletExpanded && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {diamondPackages.map((pkg) => {
                      const isSelected = selectedPackage === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={cn(
                            "bg-white border-[1.5px] rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all relative overflow-hidden min-h-[96px]",
                            isSelected 
                              ? "border-[#FF567D] bg-[#FFF8FA] shadow-sm transform scale-[1.02]" 
                              : "border-gray-100 text-gray-700 hover:border-gray-200"
                          )}
                          id={`diamond-pkg-${pkg.id}`}
                        >
                          {/* "HOT" Badge overlayed top-left inside red borders */}
                          {pkg.isHot && (
                            <div className="absolute top-0 left-0 bg-[#FF567D] text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg uppercase italic tracking-wider">
                              HOT
                            </div>
                          )}

                          <div className="flex flex-col items-center mt-1">
                            <div className="flex items-center gap-1">
                              <span className="text-sm">💎</span>
                              <span className="text-base font-extrabold text-[#111111]">{pkg.diamonds}</span>
                              <span className="text-xs text-[#FF5A00] font-black">+{pkg.bonus}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center w-full mt-2">
                            {pkg.originalPrice && (
                              <span className="text-[9px] text-[#C0C4CC] line-through">USD {pkg.originalPrice.toFixed(2)}</span>
                            )}
                            <span className="text-[11px] font-extrabold text-[#909399]">USD {pkg.price}</span>
                          </div>

                          {/* Authentic bottom-right triangle checkmark flag if selected */}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#FF567D] rounded-tl-xl flex items-center justify-center">
                              <Check size={10} className="text-white stroke-[4]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recharge Pack login bonus drawer wrapper */}
              <div className="bg-[#FFF8F2] border border-[#FFEDE0] rounded-[1.5rem] p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[#A86430]">Recharge Pack</span>
                    {/* Pink/Red Login Bonus Capsule Label */}
                    <span className="bg-[#FF4D4F] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight scale-90">
                      Login Bonus
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-[#A86430]/60 stroke-[3]" />
                </div>

                {/* Symmetrical list of gifts included in pack with light theme trigger */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: '💎', label: 'x20', title: 'Diamonds' },
                    { icon: '👑', label: 'x10d', title: 'Crown Ring' },
                    { icon: '🏎️', label: 'x10d', title: 'Race Car' },
                    { icon: '🪙', label: 'x5', title: 'Gold Medal' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-between border border-[#FFF0E2] text-center min-h-[96px]">
                      <span className="text-2xl mt-1 select-none">{item.icon}</span>
                      <div className="flex flex-col items-center w-full">
                        <span className="text-[11px] font-black text-[#111111] leading-none mb-1">{item.label}</span>
                        <button 
                          onClick={() => showToast(`Claiming your daily ${item.title}! 🎁`, "success")}
                          className="w-full py-1 text-[8px] bg-[#00E5FF] hover:bg-[#00D4EC] text-white font-black uppercase rounded-full tracking-tighter"
                        >
                          Get Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky cyan custom pill action button fixed precisely to bottom viewport */}
              <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 border-t border-gray-100 z-50 flex justify-center shadow-lg">
                <button
                  disabled={isRecharging}
                  onClick={handleRecharge}
                  className="w-full max-w-md py-3.5 bg-[#00E5FF] hover:bg-[#00D4EC] active:scale-[0.98] transition-all text-white font-extrabold rounded-full flex flex-col items-center justify-center shadow-md shadow-[#00E5FF]/20"
                >
                  {isRecharging ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[15px] font-extrabold tracking-wide uppercase leading-tight">
                        Get 💎 {currentPkg.diamonds + currentPkg.bonus}
                      </span>
                      <span className="text-[11px] font-bold text-white/80 uppercase">
                        Total: USD {currentPkg.price}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="beans-tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {(() => {
                const getDynamicHostSalaryBeans = (beansEarned: number, isUnderAgency: boolean) => {
                  if (beansEarned <= 0) return 0;
                  
                  const tiers = [
                    { target: 1600000, salary: 6400 * 210 },
                    { target: 1200000, salary: 5200 * 210 },
                    { target: 900000, salary: 4000 * 210 },
                    { target: 780000, salary: 3520 * 210 },
                    { target: 600000, salary: 2800 * 210 },
                    { target: 420000, salary: 2000 * 210 },
                    { target: 300000, salary: 1480 * 210 },
                    { target: 240000, salary: 1200 * 210 },
                    { target: 180000, salary: 920 * 210 },
                    { target: 150000, salary: 780 * 210 },
                    { target: 100000, salary: 540 * 210 },
                    { target: 70000, salary: 380 * 210 },
                    { target: 50000, salary: 280 * 210 },
                    { target: 32000, salary: 180 * 210 },
                    { target: 15000, salary: 88 * 210 },
                    { target: 8000, salary: 48 * 210 },
                    { target: 5000, salary: 32 * 210 },
                    { target: 2500, salary: 16 * 210 },
                  ];

                  // 1. Find the highest tier actually surpassed (beansEarned >= tier.target)
                  const surpassedTier = tiers.find(t => beansEarned >= t.target);

                  // 2. Find target tier they were aiming for (immediate tier above surpassedTier)
                  let targetTier = tiers[0];
                  if (surpassedTier) {
                    const sIdx = tiers.indexOf(surpassedTier);
                    if (sIdx > 0) {
                      targetTier = tiers[sIdx - 1];
                    } else {
                      targetTier = surpassedTier; // Already hit max tier (1.6M)
                    }
                  } else {
                    targetTier = tiers[tiers.length - 1]; // Aiming for lowest tier (2.5K)
                  }

                  const surpassedSalary = surpassedTier ? surpassedTier.salary : 0;
                  const surpassedTarget = surpassedTier ? surpassedTier.target : 0;
                  const targetSalary = targetTier.salary;
                  const targetBeans = targetTier.target;

                  // Exceeded highest tier fully
                  if (beansEarned >= tiers[0].target) {
                    return isUnderAgency ? tiers[0].salary : tiers[0].salary * 0.50;
                  }

                  // Fully hit targetBeans
                  if (beansEarned >= targetBeans) {
                    return isUnderAgency ? targetSalary : targetSalary * 0.50;
                  }

                  // Under-target performance (between surpassedTarget and targetBeans)
                  const surplusFraction = (beansEarned - surpassedTarget) / (targetBeans - surpassedTarget);
                  const potentialSurplusSalary = (targetSalary - surpassedSalary) * surplusFraction;

                  if (isUnderAgency) {
                    // Signed Agency Host: get 100% of fallback salary + 50% split on the potential progressive surplus on top
                    return surpassedSalary + (potentialSurplusSalary * 0.50);
                  } else {
                    // Solo Host: gets 50% of fallback salary + 25% of the potential progressive surplus on top
                    return (surpassedSalary * 0.50) + (potentialSurplusSalary * 0.25);
                  }
                };

                const giftBeans = profile?.beans || 0;
                const isUnderAgency = Boolean(profile?.agencyId);
                const salaryBeansBonus = getDynamicHostSalaryBeans(profile?.totalBeansEarned || 0, isUnderAgency);
                const adBeansUnlocked = adBeansMode === 'on';
                const adBeansCount = adBeansUnlocked ? (profile?.adBeans || 0) : 0;
                const aggregateBalance = giftBeans + salaryBeansBonus + adBeansCount;
                const beansToDollar = (b: number) => (b / 210).toFixed(2);

                return (
                  <>
                    {/* Soft warm peach-orange gradient card matching Screenshots exactly */}
                    <div className="bg-gradient-to-br from-[#feead3] to-[#fed3be] border border-[#fed3be] rounded-[1.5rem] p-6 relative overflow-hidden shadow-sm">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-1.5 text-[#A86430]">
                          <span className="text-[12px] font-extrabold uppercase tracking-tight">Aggregate Wallet Balance</span>
                          <button className="p-0.5 text-[#A86430]/60 hover:text-[#A86430] transition-colors">
                            <HelpIcon size={14} className="stroke-[2.5]" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-4xl font-extrabold text-[#111111] tracking-tight">
                            {aggregateBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                          {/* Top right floating Ledger/Document report statement trigger */}
                          <button className="w-8 h-8 rounded-full bg-white/40 text-[#A86430] flex items-center justify-center hover:bg-white/60 transition-colors" title="Earnings History">
                            <FileText size={16} />
                          </button>
                        </div>
                        <span className="text-xs font-black text-[#A86430] uppercase italic tracking-widest mt-1">
                          Total Combined ≈ ${beansToDollar(aggregateBalance)} USD
                        </span>

                        {/* Symmetrical 3-Column Breakdown split */}
                        <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-4 mt-3 text-xs text-center">
                          <div className="space-y-0.5 border-r border-white/20 pr-1">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-tight block">🎁 Gift Beans</span>
                            <span className="text-xs font-black text-emerald-600">{giftBeans.toLocaleString()}</span>
                            <span className="block text-[8px] font-medium text-gray-650 uppercase">≈ ${beansToDollar(giftBeans)}</span>
                          </div>

                          <div className="space-y-0.5 border-r border-white/20 px-1">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-tight block">💼 Base Salary</span>
                            <span className={cn("text-xs font-black", salaryBeansBonus > 0 ? "text-cyan-600" : "text-gray-400")}>
                              {salaryBeansBonus.toLocaleString()}
                            </span>
                            <span className="block text-[8px] font-medium text-gray-650 uppercase">≈ ${beansToDollar(salaryBeansBonus)}</span>
                          </div>

                          <div className="space-y-0.5 pl-1">
                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-tight block">🎥 Ad Beans</span>
                            {adBeansUnlocked ? (
                              <>
                                <span className="text-xs font-black text-amber-600">{(profile?.adBeans || 0).toLocaleString()}</span>
                                <span className="block text-[8px] font-medium text-gray-650 uppercase">≈ ${beansToDollar(profile?.adBeans || 0)}</span>
                              </>
                            ) : (
                              <div className="py-0.5">
                                <span className="inline-block px-1 py-0.5 bg-amber-500/15 text-amber-600 text-[6px] font-black tracking-widest rounded uppercase">
                                  COMING SOON
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Action Rows */}
              <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm divide-y divide-gray-100">
                <button 
                  onClick={() => {
                    const hasPhone = profile?.phoneNumber;
                    const hasEmail = profile?.email;
                    if (!hasPhone || !hasEmail) {
                      setNoticeTarget('exchange');
                      setShowNoticeModal(true);
                    } else {
                      navigate('/earnings-dashboard');
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors active:scale-99/100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFEEDC] text-[#FF9E2A] flex items-center justify-center font-bold">
                      $
                    </div>
                    <span className="text-sm font-bold text-gray-800">exchange rewards</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 stroke-[2.5]" />
                </button>

                <button 
                  onClick={() => {
                    const hasPhone = profile?.phoneNumber;
                    const hasEmail = profile?.email;
                    if (!hasPhone || !hasEmail) {
                      setNoticeTarget('history');
                      setShowNoticeModal(true);
                    } else {
                      navigate('/withdrawal-history');
                    }
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors active:scale-99/100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E5F3FF] text-[#0076FF] flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-800">Withdrawal History</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 stroke-[2.5]" />
                </button>
              </div>

              {/* Cyan Bind Email Promotional Banner as in Screenshot */}
              <div className="bg-[#EFFFFA] border border-[#DEFFF4] rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E0FCF4] text-[#00E5FF] rounded-xl flex items-center justify-center shadow-inner">
                    <Mail size={20} className="stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-[#111111]">Bind your Email</span>
                    <span className="text-[11px] text-[#A3ADB4] font-medium leading-none mt-1">Get personalized recommendations!</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <button 
                    onClick={() => showToast("Please input your email when requested securely.", "info")}
                    className="px-4 py-1.5 bg-[#00E5FF] text-white text-xs font-black rounded-full uppercase tracking-tight duration-100 hover:bg-[#00D4EC] active:scale-95"
                  >
                    Enter
                  </button>
                  <button className="text-gray-300 hover:text-gray-500 p-0.5">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Exact cloned FAQ and withdrawal rules from Screenshot */}
              <div className="space-y-6 pt-2 pb-14 text-[#606266] text-xs">
                {/* Section 1 */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#1E2022] text-sm">set password for exchanging rewards and diamonds</h4>
                  <ul className="space-y-1 text-[#909399] leading-relaxed list-inside">
                    <li>1. After setting password, beans and diamonds can only be exchanged by user who knows the password.</li>
                    <li>
                      2. If you forget or need to reset your password, please contact us via <span className="text-[#00E5FF] font-black cursor-pointer underline">Feedback</span> on your profile page.
                    </li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#1E2022] text-sm">What are beans?</h4>
                  <ul className="space-y-1 text-[#909399] leading-relaxed">
                    <li>1. Beans can be exchanged to diamonds</li>
                    <li>2. Beans can be exchanged to rewards</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#1E2022] text-sm">Exchange rules</h4>
                  <p className="text-[#909399] leading-relaxed">
                    1. The maximum daily withdrawal amount is USD100, and users cannot withdraw any more on the day after withdrawing USD100.
                  </p>
                  <p className="text-[#909399] leading-relaxed">
                    2. How to increase daily withdrawal limit?<br />
                    The actual daily withdrawal amount will be limited by the withdrawal channel you choose. The normal daily withdrawal rules are as follows:
                  </p>

                  {/* Clean white tabular data replica as per Screenshot 2 */}
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-2 shadow-sm">
                    {/* Header */}
                    <div className="grid grid-cols-2 bg-gray-50/70 border-b border-gray-100 p-3 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <span>New beans of the month</span>
                      <span>Next month's daily withdrawal amount</span>
                    </div>
                    {/* Rows */}
                    <div className="divide-y divide-gray-50 text-[11px] font-bold text-gray-600">
                      {[
                        { beans: "0-10000", amount: "$100" },
                        { beans: "10001-30000", amount: "$200" },
                        { beans: "30001-60000", amount: "$500" },
                        { beans: "60001-180000", amount: "$1500" },
                        { beans: "180001-999999999", amount: "$5000" },
                      ].map((row, i) => (
                        <div key={i} className="grid grid-cols-2 p-3 hover:bg-gray-50/40">
                          <span className="font-semibold text-gray-700">{row.beans}</span>
                          <span className="font-black text-[#00E5FF]">{row.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rules list contd */}
                  <ul className="space-y-1 text-[#909399] leading-relaxed pt-2">
                    <li>3. The audit time of bean is within 3 working days.</li>
                    <li>4. Estimated arrival amount and processing fee are subject to the actual credited amount.</li>
                  </ul>
                </div>

                {/* Closing IM Notice */}
                <p className="text-[#A3ADB4] italic leading-relaxed pt-2 border-t border-gray-100">
                  Under certain circumstances, we will notify the change or update of the Bean redemption rules in advance through IM. Please pay attention to the IM notification.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notice Gating Dialog Cloned from Screenshot 2 */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2rem] max-w-[320px] w-full p-6 text-center shadow-2xl relative"
          >
            {/* Top Close Icon X */}
            <button 
              onClick={() => setShowNoticeModal(false)}
              className="absolute right-5 top-5 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <X size={18} className="stroke-[2.5]" />
            </button>

            {/* Title: lowercase bold lowercase structure exactly like Logo */}
            <h3 className="text-xl font-black text-[#1E2022] tracking-tighter mt-2">notice</h3>

            {/* Body */}
            <p className="text-xs text-[#606266] leading-relaxed max-w-[220px] mx-auto mt-4 mb-6">
              connect your phone number to protect BINGO LIVE account
            </p>

            {/* Buttons stacked elegantly */}
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => {
                  setShowNoticeModal(false);
                  setShowBindModal(true);
                }}
                className="w-full py-3 bg-[#00E5FF] hover:bg-[#00D4EC] text-white rounded-full font-bold text-sm tracking-wide shadow-sm active:scale-98 transition-transform"
              >
                connect
              </button>
              
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="w-full py-3 bg-white hover:bg-gray-50 text-[#909399] rounded-full font-bold text-sm tracking-wide border border-gray-100"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Account Bind overlay form */}
      {showBindModal && (
        <div className="fixed inset-0 bg-black/50 z-[101] flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.form 
            onSubmit={handleBindSecurely}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white rounded-[2rem] max-w-[340px] w-full p-6 shadow-2xl relative space-y-4"
          >
            <button 
              type="button"
              onClick={() => setShowBindModal(false)}
              className="absolute right-5 top-5 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
            >
              <X size={18} className="stroke-[2.5]" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-[#1E2022] uppercase tracking-wide">secure account bind</h3>
              <p className="text-[11px] text-[#A3ADB4] leading-relaxed mt-1">
                Link phone & email securely to execute bean exchange.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Phone select and input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block ml-1">Phone Number</label>
                <div className="flex gap-2">
                  <select 
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-3 text-xs font-bold text-gray-700 outline-none focus:border-[#00D4EC]"
                  >
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+254">🇰🇪 +254</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+966">🇸🇦 +966</option>
                  </select>
                  <input 
                    type="tel"
                    placeholder="phone number"
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-[#00D4EC]"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block ml-1">Email Address</label>
                <input 
                  type="email"
                  placeholder="your.email@domain.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-[#00D4EC]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                type="submit"
                disabled={isBinding}
                className="w-full py-3.5 bg-[#00E5FF] hover:bg-[#00D4EC] text-white rounded-full font-bold text-sm shadow-sm flex items-center justify-center gap-1.5 duration-100 disabled:opacity-50"
              >
                {isBinding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Bind Account Securely'}
              </button>
              
              <button 
                type="button"
                onClick={() => setShowBindModal(false)}
                className="w-full py-3.5 bg-white hover:bg-gray-50 text-[#909399] rounded-full font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
