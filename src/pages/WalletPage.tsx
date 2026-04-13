import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Diamond, History, ChevronRight, Mail, X, Info, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

type WalletTab = 'Diamonds' | 'Beans';

export default function WalletPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<WalletTab>('Diamonds');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(1); // Default to 40 diamonds

  const diamondPackages = [
    { id: 0, diamonds: 2, price: 0.07 },
    { id: 1, diamonds: 40, price: 0.99, isHot: true },
    { id: 2, diamonds: 284, price: 6.99 },
    { id: 3, diamonds: 815, price: 19.99 },
    { id: 4, diamonds: 3715, price: 89.99 },
  ];

  const withdrawalRules = [
    { range: '0-10000', amount: '$100' },
    { range: '10001-30000', amount: '$200' },
    { range: '30001-60000', amount: '$500' },
    { range: '60001-180000', amount: '$1500' },
    { range: '180001-999999999', amount: '$5000' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white text-gray-900 select-none flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 pt-12 pb-2 flex flex-col border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-8 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <div className="flex gap-8">
            {(['Diamonds', 'Beans'] as WalletTab[]).map(tab => (
              <button 
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsLoading(true);
                }}
                className={cn(
                  "text-lg font-bold transition-all relative pb-2",
                  activeTab === tab ? "text-gray-900" : "text-gray-400"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="walletTabUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 space-y-4"
            >
              {activeTab === 'Diamonds' ? (
                <>
                  {/* Diamond Balance Card */}
                  <div className="bg-gradient-to-br from-[#ffcc80] to-[#ffab91] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <Diamond size={24} className="text-yellow-400" fill="currentColor" />
                          <span className="text-4xl font-black italic tracking-tighter text-white drop-shadow-sm">
                            {profile?.diamonds || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/90 font-bold text-sm">
                          <span>Account Balance</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                      <button className="p-2 bg-white/20 rounded-xl text-white active:scale-95 transition-transform">
                        <FileText size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Google Wallet Section */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                          <img src="https://www.gstatic.com/images/branding/product/1x/wallet_48dp.png" alt="Wallet" className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-gray-600">Google Wallet</span>
                      </div>
                      <button className="text-gray-400">
                        <Info size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {diamondPackages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={cn(
                            "bg-white border-2 rounded-2xl p-4 flex flex-col items-center gap-1 transition-all relative overflow-hidden",
                            selectedPackage === pkg.id ? "border-pink-500 shadow-md" : "border-gray-100"
                          )}
                        >
                          {pkg.isHot && (
                            <div className="absolute top-0 left-0 bg-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg uppercase italic">
                              HOT
                            </div>
                          )}
                          <div className="flex items-center gap-1 mb-1">
                            <Diamond size={16} className="text-yellow-400" fill="currentColor" />
                            <span className="text-sm font-black italic">{pkg.diamonds}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">USD {pkg.price}</span>
                          
                          {selectedPackage === pkg.id && (
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-pink-500 rounded-tl-2xl flex items-center justify-center">
                              <div className="w-2 h-2 border-2 border-white border-t-transparent border-l-transparent rotate-45 mb-1 ml-1" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                    <button className="w-full py-4 bg-cyan-400 text-white font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-cyan-400/20 active:scale-[0.98] transition-all">
                      Get {diamondPackages[selectedPackage].diamonds} diamonds Total: USD {diamondPackages[selectedPackage].price}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Beans Balance Card */}
                  <div className="bg-gradient-to-br from-[#fff176] to-[#ffb74d] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Current estimated total earnings</p>
                          <Info size={12} className="text-white/60" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl font-black italic tracking-tighter text-white drop-shadow-sm">
                            ≈ $0
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/90 font-bold text-sm">
                          <span>current beans</span>
                          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center ml-1">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                          </div>
                          <span className="text-yellow-900/60 font-black">0</span>
                        </div>
                      </div>
                      <button className="p-2 bg-white/20 rounded-xl text-white active:scale-95 transition-transform">
                        <FileText size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                          <Diamond size={16} fill="currentColor" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">exchange rewards</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300" />
                    </button>
                    <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                          <History size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Withdrawal History</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300" />
                    </button>
                  </div>

                  {/* Bind Email Banner */}
                  <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-100">
                        <Mail size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Bind your Email</span>
                        <span className="text-[10px] text-gray-400">Get personalized recommendations!</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 bg-cyan-400 text-white rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform">Enter</button>
                      <button className="p-1 text-gray-300"><X size={16} /></button>
                    </div>
                  </div>

                  {/* Info Sections */}
                  <div className="space-y-6 pt-4 pb-10">
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-gray-800">set password for exchanging rewards and diamonds</h4>
                      <div className="text-[11px] text-gray-500 space-y-2 leading-relaxed">
                        <p>1. After setting password, beans and diamonds can only be exchanged by user who knows the password.</p>
                        <p>2. If you forget or need to reset your password, please contact us via <span className="text-cyan-500 font-bold cursor-pointer">Feedback</span> on your profile page</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-gray-800">What are beans?</h4>
                      <div className="text-[11px] text-gray-500 space-y-1 leading-relaxed">
                        <p>1. Beans can be exchanged to diamonds</p>
                        <p>2. Beans can be exchanged to rewards</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-gray-800">Exchange rules</h4>
                      <div className="text-[11px] text-gray-500 space-y-2 leading-relaxed mb-2">
                        <p>1. The maximum daily withdrawal amount is USD100, and users cannot withdraw any more on the day after withdrawing USD100.</p>
                        <p>2. How to increase daily withdrawal limit? The actual daily withdrawal amount will be limited by the withdrawal channel you choose. The normal daily withdrawal rules are as follows:</p>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-100">
                          <div className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">New beans of the month</div>
                          <div className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Next month's daily withdrawal amount</div>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {withdrawalRules.map((rule, i) => (
                            <div key={i} className="grid grid-cols-2">
                              <div className="p-3 text-[11px] font-bold text-gray-600">{rule.range}</div>
                              <div className="p-3 text-[11px] font-black text-cyan-500">{rule.amount}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1 leading-relaxed">
                        <p>3. The audit time of bean is within 3 working days.</p>
                        <p>4. Estimated arrival amount and processing fee are subject to the actual credited amount.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
