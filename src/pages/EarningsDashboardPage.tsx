import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, Wallet, CreditCard, History, TrendingUp, 
  DollarSign, ArrowUpRight, ArrowDownLeft, Info,
  CheckCircle2, AlertCircle, Zap, ShieldCheck, 
  Banknote, Landmark, Settings, HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function EarningsDashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'History' | 'Withdraw'>('Overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);

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

  const beansToDollar = (beans: number) => (beans / 1000).toFixed(2);

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
        <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-2 mb-8">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Available Balance</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <Zap size={24} fill="currentColor" />
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter">
                {profile?.totalBeansEarned?.toLocaleString() || '0'}
              </h2>
            </div>
            <span className="text-sm font-black text-emerald-400 uppercase italic tracking-widest">
              ≈ ${beansToDollar(profile?.totalBeansEarned || 0)} USD
            </span>
          </div>

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
                  <span className="text-[10px] font-black uppercase tracking-widest">Conversion Rate</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic">
                  1,000 Beans = $1.00 USD. Minimum withdrawal is 50,000 Beans ($50.00).
                </p>
              </div>

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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-black italic uppercase tracking-widest placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-400 font-black italic">BEANS</div>
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Balance: {profile?.totalBeansEarned?.toLocaleString()}</span>
                    <button className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Max Amount</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Select Method</label>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Landmark size={20} className="text-emerald-400" />
                      <span className="text-sm font-bold text-white uppercase italic tracking-tight">PayPal (****@gmail.com)</span>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                </div>

                <button 
                  onClick={() => showToast("Withdrawal request submitted! 💸", 'success')}
                  className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase italic tracking-widest text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Confirm Withdrawal
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
