import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { 
  ChevronLeft, Crown, Clock, Shield, Zap, Star, 
  History, CreditCard, Sparkles, Award, Info,
  CheckCircle2, AlertCircle, TrendingUp, Gem
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';
import { getUserNobleStatus, UserNobleStatus } from '../nobleLogic';
import { NOBLE_LEVELS, NobleTier } from '../NobleTypes';
import { checkExpirationAlerts, getRenewalCost, formatExpirationCountdown } from '../NobleExpirationSystem';

export default function NobleCenterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nobleStatus, setNobleStatus] = useState<UserNobleStatus | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);
          
          // Calculate Noble Status
          const lastPurchase = userData.lastNoblePurchaseDate?.toDate() || new Date();
          const status = getUserNobleStatus(userData.totalDiamondsSpent || 0, lastPurchase);
          setNobleStatus(status);

          // Fetch History (Mock for now or fetch from transactions)
          const historySnap = await getDocs(
            query(
              collection(db, `users/${auth.currentUser.uid}/transactions`), 
              where('type', '==', 'noble_purchase'),
              orderBy('timestamp', 'desc'),
              limit(5)
            )
          );
          setHistory(historySnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (error) {
        console.error("Error fetching noble data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const alert = nobleStatus ? checkExpirationAlerts(nobleStatus) : null;

  return (
    <div className="flex flex-col bg-[#0a0a0a] h-full overflow-hidden text-white">
      {/* Header */}
      <header className="flex-none bg-gradient-to-b from-slate-900 to-black pt-6 pb-4 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex items-start justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">Noble Center</h1>
          <button className="p-2 bg-white/10 rounded-full text-white/60 hover:text-white">
            <Info size={20} />
          </button>
        </div>

        {/* Current Status Card */}
        <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl border-2 border-white/10",
                nobleStatus?.currentTier !== 'None' ? "bg-gradient-to-br from-yellow-400 to-orange-600" : "bg-white/5"
              )}>
                <Crown size={32} className={nobleStatus?.currentTier !== 'None' ? "text-white" : "text-white/20"} />
              </div>
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight">
                  {nobleStatus?.currentTier === 'None' ? 'No Noble Status' : nobleStatus?.currentTier}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-white/40" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {nobleStatus?.currentTier === 'None' ? 'Inactive' : formatExpirationCountdown(nobleStatus?.daysRemaining || 0)}
                  </span>
                </div>
              </div>
            </div>
            {nobleStatus?.currentTier !== 'None' && (
              <div className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                Active
              </div>
            )}
          </div>

          {alert?.shouldAlert && (
            <div className={cn(
              "p-4 rounded-2xl flex items-start gap-3 mb-6 border",
              alert.severity === 'high' ? "bg-red-500/10 border-red-500/20 text-red-400" :
              alert.severity === 'medium' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
              "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
            )}>
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">{alert.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => showToast("Renewal coming soon! 💎", 'info')}
              className="py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
            >
              Renew Now
            </button>
            <button 
              onClick={() => showToast("Upgrade coming soon! 🚀", 'info')}
              className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-white/10 active:scale-95 transition-all"
            >
              Upgrade Tier
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20">
        {/* Next Tier Progress */}
        {nobleStatus?.nextTier && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Next Tier Progress</h3>
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">{nobleStatus.nextTier}</span>
            </div>
            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gem size={16} className="text-cyan-400" />
                  <span className="text-xl font-black italic">{nobleStatus.diamondsNeededForNext.toLocaleString()}</span>
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Diamonds to unlock</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-600" 
                  style={{ width: `${Math.max(10, 100 - (nobleStatus.diamondsNeededForNext / 1000))}%` }} 
                />
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Noble Privileges</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Zap, title: 'Entrance Animation', desc: 'Special welcome effect when you enter any room.', color: 'text-cyan-400' },
              { icon: Shield, title: 'Premium Frame', desc: 'Exclusive golden frame for your profile picture.', color: 'text-yellow-400' },
              { icon: TrendingUp, title: 'Gifting Boost', desc: 'Earn 1.5x more intimacy points when gifting.', color: 'text-green-400' },
              { icon: Star, title: 'Exclusive Badges', desc: 'Unique Noble badge displayed on your profile.', color: 'text-purple-400' }
            ].map((benefit, i) => (
              <div key={i} className="bg-white/5 p-5 rounded-[2rem] border border-white/10 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center", benefit.color)}>
                  <benefit.icon size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black italic uppercase tracking-tight text-white">{benefit.title}</span>
                  <span className="text-[10px] text-white/40 leading-tight">{benefit.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Subscription History</h3>
          <div className="bg-white/5 rounded-[2.5rem] p-2 border border-white/10">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-[2rem] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-yellow-500">
                    <History size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black italic uppercase text-white">Renewal: {item.tier}</span>
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                      {item.timestamp?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-white italic">-{item.amount}</div>
                  <div className="text-[8px] text-white/20 uppercase tracking-widest">Diamonds</div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                  <History size={32} />
                </div>
                <p className="text-xs text-white/40 font-medium italic uppercase tracking-widest">No history found</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex-none p-4 bg-black border-t border-white/10">
        <button 
          onClick={() => showToast("Customer Support coming soon! 🎧", 'info')}
          className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
        >
          <Award size={18} />
          Contact Noble Support
        </button>
      </div>
    </div>
  );
}
