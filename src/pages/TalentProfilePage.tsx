import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  ExternalLink, 
  Download, 
  Play, 
  Heart, 
  ShieldCheck,
  Globe,
  Sparkles
} from 'lucide-react';
import { LevelBadge } from '../components/LevelBadge';
import { NobleBadge } from '../components/NobleBadge';

export default function TalentProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTalent = async () => {
      setLoading(true);
      try {
        // In a real app, you'd probably search by username field, but here we'll assume the URL param is the UID for simplicity
        // or search the 'users' collection where customUsername == username
        const q = query(collection(db, 'users'), limit(50));
        const snap = await getDocs(q);
        
        // Simulating search for matching username
        const talent = snap.docs.find(d => d.id.substring(0, 8) === username) || snap.docs[0];
        
        if (talent) {
          setProfile({ uid: talent.id, ...talent.data() } as UserProfile);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTalent();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black uppercase mb-4 italic">Talent Not Found</h2>
      <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-black font-black rounded-xl">HOME</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-400 selection:text-black">
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${profile.uid}/1200/800`} 
          className="w-full h-full object-cover opacity-40 blur-sm scale-110" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="max-w-xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        {/* Profile Card */}
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-full border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] overflow-hidden bg-[#1a1a1a]"
            >
              <img src={profile.photoURL || `https://picsum.photos/seed/${profile.uid}/200`} className="w-full h-full object-cover" />
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black p-2 rounded-full shadow-xl">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">{profile.displayName}</h1>
              <LevelBadge level={profile.level} />
            </div>
            <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-black uppercase tracking-widest leading-none">
              <Globe size={12} />
              <span>Verified Bingo King • UK Region</span>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-1 bg-[#111] border border-white/5 rounded-2xl p-4">
            <div className="text-center">
              <p className="text-xl font-black italic">{profile.fans}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Fans</p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-xl font-black italic">{Math.floor(profile.totalBeansEarned / 1000)}K</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Gifts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black italic">#{10 + (profile.uid.length % 90)}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Ranking</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button 
              className="w-full bg-amber-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(251,191,36,0.2)] flex items-center justify-center gap-3 active:scale-95 transition-all group"
              onClick={() => window.location.href = '/'}
            >
              <Play size={20} fill="black" />
              <span>Watch Live Now</span>
            </button>
            <button className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
              <Download size={20} />
              <span>Download Bingo App</span>
            </button>
          </div>

          {/* Gifting Portfolio / Clips */}
          <div className="space-y-4 pt-10 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Sparkles size={14} /> Gifting Portfolio
              </h3>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-tighter italic">12 exclusive clips</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[9/16] rounded-xl bg-[#111] border border-white/5 overflow-hidden relative group cursor-pointer shadow-lg">
                  <img 
                    src={`https://picsum.photos/seed/clip${i}/400/700`} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-orange-500" />
                      <span className="text-[10px] font-black text-white italic">{(20 + i * 15)}K Views</span>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={24} fill="white" className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="mt-20 pt-10 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-40 grayscale group hover:grayscale-0 transition-all cursor-pointer">
            <img src="/logo.png" className="w-6 h-6 invert" />
            <span className="text-sm font-black tracking-tighter uppercase italic">Bingo Live</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 underline underline-offset-8 cursor-pointer hover:text-amber-400/40 transition-colors">Join the Elite Community</p>
        </div>
      </div>
    </div>
  );
}
