import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Upload, 
  ChevronRight, 
  Smartphone, 
  ArrowRight, 
  Trophy, 
  Zap, 
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function MigrationPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms = [
    { id: 'bigo', name: 'Bigo Live', color: 'from-cyan-400 to-cyan-600', icon: '💎' },
    { id: 'tiktok', name: 'TikTok', color: 'from-pink-500 to-black', icon: '🎵' },
    { id: 'tango', name: 'Tango Live', color: 'from-orange-400 to-orange-600', icon: '💃' },
    { id: 'poppo', name: 'Poppo Live', color: 'from-purple-500 to-purple-700', icon: '🎪' },
    { id: 'chamet', name: 'Chamet', color: 'from-indigo-500 to-indigo-700', icon: '✨' },
    { id: 'yalla', name: 'Yalla', color: 'from-emerald-400 to-emerald-600', icon: '🏆' },
  ];

  const migrationBenefits = [
    { title: "Status Match", desc: "Keep your Noble title or Gifter level prestige.", icon: Trophy },
    { title: "Revenue Boost", desc: "Start with 65% payout instead of 60% for 30 days.", icon: Zap },
    { title: "Algorithm Push", desc: "Get priority spotlight on the homepage for 7 days.", icon: Sparkles },
    { title: "Migration Badge", desc: "Exclusive profile frame identifying your veteran status.", icon: ShieldCheck },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload an image file.", 'error');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Real Upload to Firebase Storage
      const storagePath = `migration_proofs/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Real Firestore Entry for Verification
      await addDoc(collection(db, 'migration_requests'), {
        uid: user.uid,
        userName: profile?.displayName || 'Anonymous',
        platform: selectedPlatform,
        proofUrl: downloadURL,
        status: 'pending',
        createdAt: serverTimestamp(),
        matchedRank: 'King (Pending Audit)'
      });

      // Show professional scanning state
      setTimeout(() => {
        setIsUploading(false);
        setStep(3);
        showToast("Verification request submitted successfully!", 'success');
      }, 2000);

    } catch (error) {
      console.error("Migration upload error:", error);
      showToast("Submission failed. Please check your connection.", 'error');
      setIsUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col select-none">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
      {/* Header */}
      <header className="flex-none p-4 flex items-center gap-4 bg-[#111] border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <h1 className="text-xl font-black tracking-tighter uppercase italic">Migration Center</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        {/* Progress Tracker */}
        <div className="flex justify-between mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500",
                step >= s ? "bg-amber-400 text-black scale-110 shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "bg-[#1a1a1a] text-white/40 border border-white/5"
              )}
            >
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase italic leading-none">Welcome to the New World</h2>
                <p className="text-white/40 text-sm">Select the platform you are migrating from to start your status match.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setStep(2);
                    }}
                    className="relative group overflow-hidden p-6 rounded-2xl bg-[#111] border border-white/5 text-left transition-all hover:border-amber-400/50"
                  >
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br", p.color)} />
                    <span className="text-3xl mb-4 block">{p.icon}</span>
                    <span className="text-sm font-black uppercase tracking-widest">{p.name}</span>
                    <ChevronRight size={16} className="absolute bottom-6 right-6 opacity-40 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <Info size={14} /> Migration Perks
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {migrationBenefits.map((b, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-none w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <b.icon size={18} className="text-white/60" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">{b.title}</h4>
                        <p className="text-xs text-white/40 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase italic leading-none">Security Handshake</h2>
                <p className="text-white/40 text-sm">Follow these two steps to verify your ownership.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111] p-6 rounded-2xl border border-amber-400/20 relative overflow-hidden group">
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="flex-none w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-xs">1</div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-sm font-black uppercase">Update your {selectedPlatform} Bio</h4>
                      <p className="text-xs text-white/40 mb-3">Copy this code into your {selectedPlatform} bio temporarily.</p>
                      <div className="bg-black/50 p-2 sm:p-3 rounded-xl border border-white/5 font-mono text-cyan-400 text-[10px] sm:text-xs flex justify-between items-center gap-2 overflow-hidden shadow-inner">
                        <span className="truncate flex-1 tracking-tight">VERIFIED_BINGO_{profile?.uid?.substring(0, 8)}</span>
                        <button 
                          className="bg-white/10 px-3 py-2 rounded-lg text-white font-black text-[9px] sm:text-[10px] tracking-widest hover:bg-white/20 transition-all shrink-0 border border-white/10"
                          onClick={() => {
                            navigator.clipboard.writeText(`VERIFIED_BINGO_${profile?.uid?.substring(0, 8)}`);
                            showToast("Code copied to clipboard!", 'success');
                          }}
                        >
                          COPY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                  <div className="flex gap-4 items-start">
                    <div className="flex-none w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-black text-xs">2</div>
                    <div className="space-y-4 flex-1">
                      <h4 className="text-sm font-black uppercase">Upload Proof of Spending</h4>
                      <p className="text-xs text-white/40 leading-relaxed">
                        Upload a screenshot of your Profile and Recharge page. Our AI will scan for your spending history and Noble title.
                      </p>
                      
                      <button 
                        onClick={triggerUpload}
                        disabled={isUploading}
                        className={cn(
                          "w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative",
                          isUploading && "pointer-events-none"
                        )}
                      >
                        {isUploading ? (
                          <>
                            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest text-cyan-400 animate-pulse">Scanning...</p>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/20 overflow-hidden">
                              <motion.div 
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                className="h-full w-1/3 bg-cyan-400"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="text-white/20" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Drop Screenshot Here</p>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
              >
                Change Platform
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10 py-10"
            >
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-black uppercase italic leading-none">Status Matched!</h2>
                <p className="text-white/40 text-sm uppercase tracking-widest font-black italic">Bigo Marquis → Bingo King</p>
              </div>

              <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-[1px] rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <Trophy className="text-amber-400/20" size={80} />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Your New Rank</p>
                      <h4 className="text-4xl font-black uppercase italic leading-none tracking-tighter">KING TITLE</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-white/40 uppercase tracking-widest font-bold">Migration Discount</span>
                        <span className="font-black text-amber-400">25.0% OFF</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-white/40 uppercase tracking-widest font-bold">Sign-on Bonus</span>
                        <span className="font-black text-green-400">65% PAYOUT</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-white/40 uppercase tracking-widest font-bold">Expiring In</span>
                        <span className="font-black italic text-pink-500 uppercase tracking-tight">30 DAYS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
              >
                Enter the Kingdom
              </button>

              <div className="text-center">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black leading-relaxed">
                  To retain this status, meet your 30-day <br /> target in the Creator Center.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="p-10 text-center flex-none">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/5">Bingo Migration Protocol v1.0</p>
      </footer>
    </div>
  );
}
