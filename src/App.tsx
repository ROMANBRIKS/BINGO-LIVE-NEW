import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, limit, orderBy, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, Room, Gift, Transaction } from './types';
import { cn } from './lib/utils';
import { getDeviceType, isIOS, isAndroid, getBrowserName } from './lib/device';
import { 
  Video, 
  Mic, 
  Gift as GiftIcon, 
  Users, 
  Trophy, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Home as HomeIcon,
  Search,
  MessageSquare,
  Heart,
  Share2,
  Shield,
  Zap,
  Crown,
  Diamond,
  Coins,
  Wallet,
  Briefcase,
  Calendar,
  ShoppingBag,
  FileText,
  Star,
  CheckCircle,
  Users2,
  ChevronRight,
  Bell,
  BarChart2,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Components ---

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = doc(db, 'users', u.uid);
        try {
          const snap = await getDoc(userDoc);
          if (snap.exists()) {
            const existingProfile = snap.data() as UserProfile;
            if (u.email === 'rogershep101@gmail.com' && existingProfile.role !== 'admin') {
              await updateDoc(userDoc, { role: 'admin' });
              existingProfile.role = 'admin';
            }
            setProfile(existingProfile);
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Anonymous',
              photoURL: u.photoURL || '',
              diamonds: 100, // Welcome bonus
              beans: 0,
              role: u.email === 'rogershep101@gmail.com' ? 'admin' : 'user',
              nobleTitle: 'none',
              level: 1,
              friends: 0,
              following: 0,
              fans: 0,
              totalDiamondsSpent: 0,
              totalBeansEarned: 0,
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            };
            await setDoc(userDoc, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const seedData = async () => {
      const roomsSnap = await getDoc(doc(db, 'rooms', 'seed_check'));
      if (!roomsSnap.exists()) {
        // Seed some rooms
        const sampleRooms = [
          { id: 'room1', hostUid: 'host1', title: '🔥 TOP GLOBAL PK - JOIN NOW!', status: 'live', type: 'video', currentBeans: 1200, viewerCount: 450, guests: [], isPrivate: false },
          { id: 'room2', hostUid: 'host2', title: 'Late Night Vibes & Music 🎵', status: 'live', type: 'audio', currentBeans: 850, viewerCount: 120, guests: [], isPrivate: false },
          { id: 'room3', hostUid: 'host3', title: 'Official Bingo Live Gala 💎', status: 'live', type: 'video', currentBeans: 5000, viewerCount: 1200, guests: [], isPrivate: false },
          { id: 'room4', hostUid: 'host4', title: 'Multi-Guest Chat Room (12 Slots)', status: 'live', type: 'audio', currentBeans: 300, viewerCount: 85, guests: [], isPrivate: false },
        ];
        
        for (const r of sampleRooms) {
          await setDoc(doc(db, 'rooms', r.id), r);
        }
        
        // Seed some gifts
        const sampleGifts = [
          { id: 'rose', name: 'Rose', cost: 1, animationType: 'float' },
          { id: 'diamond', name: 'Diamond', cost: 10, animationType: 'sparkle' },
          { id: 'car', name: 'Supercar', cost: 1000, animationType: 'drive' },
          { id: 'castle', name: 'Castle', cost: 5000, animationType: 'build' },
        ];
        
        for (const g of sampleGifts) {
          await setDoc(doc(db, 'gifts', g.id), g);
        }

        await setDoc(doc(db, 'rooms', 'seed_check'), { seeded: true });
      }
    };
    
    if (profile?.role === 'admin') {
      seedData();
    }
  }, [profile]);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const Navbar = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black tracking-tighter text-orange-500 italic">BINGO LIVE</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <Link to="/" className="hover:text-white transition-colors">Explore</Link>
          <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link to="/agencies" className="hover:text-white transition-colors">Agencies</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="flex items-center gap-1 text-blue-400 font-bold text-xs">
              <Diamond size={14} />
              {profile.diamonds}
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1 text-orange-400 font-bold text-xs">
              <Coins size={14} />
              {profile.beans}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden hover:scale-105 transition-transform"
        >
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon className="w-full h-full p-2 text-white/40" />
          )}
        </button>
      </div>
    </nav>
  );
};

const GiftingModal = ({ hostUid, roomId, onClose }: { hostUid: string, roomId: string, onClose: () => void }) => {
  const { profile } = useAuth();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'gifts'), orderBy('cost', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setGifts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Gift)));
    });
    return () => unsub();
  }, []);

  const sendGift = async (gift: Gift) => {
    if (!profile || profile.diamonds < gift.cost || sending) return;
    setSending(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const hostRef = doc(db, 'users', hostUid);
      const roomRef = doc(db, 'rooms', roomId);
      
      await updateDoc(userRef, { 
        diamonds: increment(-gift.cost),
        totalDiamondsSpent: increment(gift.cost)
      });
      
      await updateDoc(hostRef, { 
        beans: increment(gift.cost),
        totalBeansEarned: increment(gift.cost)
      });

      await updateDoc(roomRef, {
        currentBeans: increment(gift.cost)
      });

      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        text: `sent a ${gift.name}! 🎁`,
        uid: profile.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        timestamp: serverTimestamp(),
        isGift: true,
        giftId: gift.id
      });

      await addDoc(collection(db, 'transactions'), {
        fromUid: profile.uid,
        toUid: hostUid,
        amount: gift.cost,
        type: 'gift',
        timestamp: serverTimestamp(),
        giftId: gift.id
      });

      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gifting');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-[100] p-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="w-full max-w-lg bg-[#111] rounded-t-3xl p-6 border-t border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic uppercase tracking-tight">Send a Gift</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">Close</button>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {gifts.map(gift => (
            <button 
              key={gift.id}
              onClick={() => sendGift(gift)}
              disabled={profile!.diamonds < gift.cost || sending}
              className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <GiftIcon size={24} className="text-orange-500" />
              </div>
              <span className="text-[10px] font-bold text-white/60">{gift.name}</span>
              <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black">
                <Diamond size={10} />
                {gift.cost}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Diamond size={16} className="text-blue-400" />
            <span className="font-bold">{profile?.diamonds}</span>
          </div>
          <button className="text-orange-500 font-bold text-sm">RECHARGE</button>
        </div>
      </motion.div>
    </div>
  );
};

const GoLiveModal = ({ onClose }: { onClose: () => void }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'audio'>('video');
  const [loading, setLoading] = useState(false);

  const startStream = async () => {
    if (!profile || !title.trim() || loading) return;
    setLoading(true);
    try {
      const roomId = profile.uid;
      await setDoc(doc(db, 'rooms', roomId), {
        id: roomId,
        hostUid: profile.uid,
        title: title,
        status: 'live',
        type: type,
        currentBeans: 0,
        viewerCount: 1,
        guests: [],
        isPrivate: false,
        createdAt: serverTimestamp()
      });
      onClose();
      navigate(`/room/${roomId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rooms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#111] rounded-3xl p-8 border border-white/10"
      >
        <h2 className="text-3xl font-black italic uppercase mb-8">Go Live</h2>
        
        <div className="space-y-6 mb-8">
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Stream Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you doing today?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setType('video')}
              className={cn(
                "flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                type === 'video' ? "bg-orange-500/20 border-orange-500 text-orange-500" : "bg-white/5 border-white/10 text-white/40"
              )}
            >
              <Video size={24} />
              <span className="text-xs font-bold uppercase">Video</span>
            </button>
            <button 
              onClick={() => setType('audio')}
              className={cn(
                "flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                type === 'audio' ? "bg-orange-500/20 border-orange-500 text-orange-500" : "bg-white/5 border-white/10 text-white/40"
              )}
            >
              <Mic size={24} />
              <span className="text-xs font-bold uppercase">Audio</span>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-white/5 font-bold text-white/60 hover:bg-white/10 transition-colors">Cancel</button>
          <button 
            onClick={startStream}
            disabled={!title.trim() || loading}
            className="flex-1 py-4 rounded-2xl bg-orange-500 font-black text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'START NOW'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LeaderboardPage = () => {
  const [topSpenders, setTopSpenders] = useState<UserProfile[]>([]);
  const [topEarners, setTopEarners] = useState<UserProfile[]>([]);
  const [tab, setTab] = useState<'spenders' | 'earners'>('spenders');

  useEffect(() => {
    const qSpenders = query(collection(db, 'users'), orderBy('totalDiamondsSpent', 'desc'), limit(10));
    const qEarners = query(collection(db, 'users'), orderBy('totalBeansEarned', 'desc'), limit(10));

    const unsubSpenders = onSnapshot(qSpenders, (snap) => {
      setTopSpenders(snap.docs.map(d => d.data() as UserProfile));
    });
    const unsubEarners = onSnapshot(qEarners, (snap) => {
      setTopEarners(snap.docs.map(d => d.data() as UserProfile));
    });

    return () => {
      unsubSpenders();
      unsubEarners();
    };
  }, []);

  const data = tab === 'spenders' ? topSpenders : topEarners;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-5xl font-black italic uppercase tracking-tighter">Leaderboard</h2>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setTab('spenders')}
            className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", tab === 'spenders' ? "bg-white text-black" : "text-white/40 hover:text-white")}
          >
            Top Spenders
          </button>
          <button 
            onClick={() => setTab('earners')}
            className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all", tab === 'earners' ? "bg-white text-black" : "text-white/40 hover:text-white")}
          >
            Top Earners
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((user, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={user.uid} 
            className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 group hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-6">
              <span className={cn(
                "text-2xl font-black italic w-8",
                index === 0 ? "text-orange-500" : index === 1 ? "text-blue-400" : index === 2 ? "text-green-400" : "text-white/20"
              )}>
                {index + 1}
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-white/10 p-0.5">
                <img src={user.photoURL} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-bold text-lg">{user.displayName}</p>
                <div className="flex items-center gap-2">
                  <div className="bg-orange-500/20 text-orange-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">LV. {Math.floor(Math.random() * 100)}</div>
                  {user.nobleTitle !== 'none' && <div className="bg-blue-500/20 text-blue-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{user.nobleTitle}</div>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                {tab === 'spenders' ? <Diamond size={16} className="text-blue-400" /> : <Coins size={16} className="text-orange-500" />}
                <span className="text-xl font-black">{tab === 'spenders' ? user.totalDiamondsSpent : user.totalBeansEarned}</span>
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{tab === 'spenders' ? 'Diamonds Spent' : 'Beans Earned'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [showGoLive, setShowGoLive] = useState(false);
  const location = useLocation();

  return (
    <>
      <aside className="fixed left-0 top-16 bottom-0 w-20 md:w-64 bg-black/40 border-r border-white/10 hidden sm:flex flex-col p-4 gap-2">
        <SidebarItem icon={<HomeIcon size={20} />} label="Home" to="/" active={location.pathname === '/'} />
        <SidebarItem icon={<Trophy size={20} />} label="Leaderboard" to="/leaderboard" active={location.pathname === '/leaderboard'} />
        <SidebarItem icon={<Users size={20} />} label="Following" to="/following" active={location.pathname === '/following'} />
        <div className="my-4 border-t border-white/5" />
        <SidebarItem icon={<Crown size={20} />} label="VIP Noble" to="/vip" active={location.pathname === '/vip'} />
        <SidebarItem icon={<Shield size={20} />} label="Agency Center" to="/agency-center" active={location.pathname === '/agency-center'} />
        
        <div className="mt-auto">
          <button 
            onClick={() => setShowGoLive(true)}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Go Live</span>
          </button>
        </div>
      </aside>
      {showGoLive && <GoLiveModal onClose={() => setShowGoLive(false)} />}
    </>
  );
};

const SidebarItem = ({ icon, label, to, active = false }: { icon: any, label: string, to: string, active?: boolean }) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all group",
      active ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
    )}
  >
    <div className={cn("transition-transform group-hover:scale-110", active && "text-orange-500")}>{icon}</div>
    <span className="hidden md:inline font-medium">{label}</span>
  </Link>
);

const LandingPage = () => {
  const { signIn } = useAuth();
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white mb-6 uppercase leading-none">
          Live <span className="text-orange-500">Bingo</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/40 font-medium mb-12 max-w-xl mx-auto">
          The next generation of live entertainment. Connect, gift, and grow your agency on the world's most rewarding platform.
        </p>
        <button 
          onClick={signIn}
          className="px-12 py-5 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition-transform active:scale-95 flex items-center gap-3 mx-auto"
        >
          <Zap fill="currentColor" />
          START STREAMING
        </button>
      </motion.div>

      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-20">
        <div className="flex flex-col items-center gap-2">
          <Crown size={48} />
          <span className="text-xs font-bold uppercase tracking-widest">VIP Noble</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Trophy size={48} />
          <span className="text-xs font-bold uppercase tracking-widest">Leaderboard</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Shield size={48} />
          <span className="text-xs font-bold uppercase tracking-widest">Secure</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <GiftIcon size={48} />
          <span className="text-xs font-bold uppercase tracking-widest">Gifting</span>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), where('status', '==', 'live'), limit(20));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Room)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'rooms'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black italic uppercase tracking-tight">Live Now</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors">All</button>
          <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors">Video</button>
          <button className="px-4 py-2 rounded-lg bg-white/5 text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors">Audio</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/20">
          <Video size={64} className="mb-4" />
          <p className="text-xl font-bold italic uppercase">No live streams right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

const RoomCard = ({ room }: { room: Room }) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/room/${room.id}`)}
      className="group relative aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden cursor-pointer border border-white/10"
    >
      <img 
        src={`https://picsum.photos/seed/${room.id}/600/800`} 
        alt={room.title} 
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
          Live
        </div>
        <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Users size={10} />
          {room.viewerCount}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1">{room.title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 border border-white/20" />
          <span className="text-white/60 text-xs font-medium">Host Name</span>
        </div>
      </div>
    </motion.div>
  );
};

const PermissionGuide = ({ onClose }: { onClose: () => void }) => {
  const [requesting, setRequesting] = useState(false);
  const deviceType = getDeviceType();
  const isIos = isIOS();
  const isAndr = isAndroid();
  const browser = getBrowserName();

  const grantAll = async () => {
    setRequesting(true);
    try {
      // Trigger Camera & Mic prompt
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.log('Media prompt failed or denied', e);
      }

      // Trigger Location prompt
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(resolve, resolve, { timeout: 3000 });
      });

      // Close the guide - the parent will retry automatically
      onClose();
    } catch (err) {
      console.error('Permission request process failed', err);
      onClose(); // Still close so user can try manual steps
    } finally {
      setRequesting(false);
    }
  };

  const getInstructions = () => {
    if (isIos) {
      return [
        { title: "Tap the 'AA' or Lock Icon", detail: "In Safari's address bar, tap the 'AA' or lock icon on the left." },
        { title: "Website Settings", detail: "Select 'Website Settings' from the menu." },
        { title: "Allow Camera & Mic", detail: "Set Camera, Microphone, and Location to 'Allow'." },
        { title: "Reload Page", detail: "Refresh the page to start your live stream." }
      ];
    }
    if (isAndr) {
      return [
        { title: "Tap the Lock Icon", detail: "Tap the lock icon next to the URL in Chrome." },
        { title: "Permissions", detail: "Tap 'Permissions' or 'Site settings'." },
        { title: "Toggle Switches", detail: "Ensure Camera, Microphone, and Location are turned ON." },
        { title: "Refresh", detail: "Pull down to refresh or tap the reload button." }
      ];
    }
    return [
      { title: "Click the Lock Icon", detail: "Click the lock icon in your browser's address bar." },
      { title: "Site Settings", detail: "Go to 'Site settings' or toggle the switches directly." },
      { title: "System Settings", detail: "On macOS: System Settings > Privacy & Security. On Windows: Settings > Privacy > Camera/Microphone. Ensure your browser is allowed." },
      { title: "Refresh Page", detail: "Reload the application to apply changes." }
    ];
  };

  const instructions = getInstructions();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#111] rounded-3xl p-8 border border-white/10 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
          <X size={24} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6">
          <Shield size={32} className="text-orange-500" />
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black italic uppercase">Permission Guide</h2>
            <span className="bg-white/10 text-[10px] font-bold px-2 py-0.5 rounded text-white/60 uppercase">
              {isIos ? 'iOS' : isAndr ? 'Android' : 'Desktop'}
            </span>
          </div>
          <p className="text-white/40 text-sm">
            We detected you're on {isIos ? 'an iPhone/iPad' : isAndr ? 'an Android device' : 'a computer'}. 
            Follow these steps to enable your camera and mic.
          </p>
        </div>

        <button 
          onClick={grantAll}
          disabled={requesting}
          className="w-full mb-10 py-4 bg-orange-500 text-white font-black rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {requesting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={20} fill="currentColor" />
              GRANT ACCESS NOW
            </>
          )}
        </button>

        <div className="space-y-6">
          {instructions.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold shrink-0 border border-white/10">{i + 1}</div>
              <div>
                <p className="font-bold text-sm mb-1">{step.title}</p>
                <p className="text-white/40 text-xs leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const VideoStream = ({ isHost, roomId, hostUid }: { isHost: boolean; roomId: string; hostUid: string }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (isHost) {
      const startStream = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Your browser does not support camera/microphone access. Please use a modern browser like Chrome or Safari.');
          return;
        }

        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true
          });
          setStream(mediaStream);
          setError(null); // Clear any previous errors
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err: any) {
          console.error('Error accessing media devices:', err);
          const isPermissionError = 
            err.name === 'NotAllowedError' || 
            err.name === 'PermissionDeniedError' || 
            (err.message && err.message.toLowerCase().includes('permission denied'));

          if (isPermissionError) {
            setError('Permission denied. Your browser or system is blocking access to the camera and microphone.');
            setShowGuide(true); // Auto-show the guide for permission denials
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError('No camera or microphone found. Please connect your devices and try again.');
          } else {
            setError(`Error: ${err.message || 'Could not access camera/microphone.'}`);
          }
        }
      };
      startStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isHost, retryTrigger]);

  if (error) {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center h-full">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Shield size={40} className="text-red-500" />
        </div>
        <p className="text-white font-bold text-lg mb-2">Access Required</p>
        <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">{error}</p>
        <button 
          onClick={() => setShowGuide(true)}
          className="px-8 py-3 bg-white text-black font-black rounded-xl hover:scale-105 transition-transform"
        >
          HOW TO ENABLE
        </button>
        {showGuide && (
          <PermissionGuide 
            onClose={() => {
              setShowGuide(false);
              setRetryTrigger(prev => prev + 1); // Auto-retry when guide is closed
            }} 
          />
        )}
      </div>
    );
  }

  if (isHost) {
    return (
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase animate-pulse">
          Live
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${roomId}/1280/720`} 
          className="w-full h-full object-cover opacity-20 blur-xl"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="text-center z-10">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center animate-pulse">
            <Video size={40} className="text-orange-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
            <Zap size={14} className="text-white" fill="currentColor" />
          </div>
        </div>
        <p className="text-white font-black italic uppercase text-xl tracking-widest mb-2">Live Stream</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Receiving Data...</p>
        </div>
      </div>
    </div>
  );
};

const RoomPage = () => {
  const { roomId } = useParams();
  const { profile } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [showGifts, setShowGifts] = useState(false);

  useEffect(() => {
    if (!roomId || !profile?.uid) return;
    
    // Increment viewer count
    const roomRef = doc(db, 'rooms', roomId);
    updateDoc(roomRef, {
      viewerCount: increment(1)
    }).catch(err => console.error('Error incrementing viewer count', err));

    return () => {
      // Decrement viewer count on leave
      updateDoc(roomRef, {
        viewerCount: increment(-1)
      }).catch(err => console.error('Error decrementing viewer count', err));
    };
  }, [roomId, profile?.uid]); // Only depend on UID, not the whole profile object

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = onSnapshot(doc(db, 'rooms', roomId), (snap) => {
      if (snap.exists()) setRoom({ id: snap.id, ...snap.data() } as Room);
    });

    const q = query(collection(db, `rooms/${roomId}/messages`), orderBy('timestamp', 'desc'), limit(50));
    const unsubMsgs = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
    });

    return () => {
      unsubRoom();
      unsubMsgs();
    };
  }, [roomId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile || !roomId) return;
    
    try {
      await addDoc(collection(db, `rooms/${roomId}/messages`), {
        text: input,
        uid: profile.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        timestamp: serverTimestamp(),
      });
      setInput('');
    } catch (error) {
      console.error('Send message error', error);
    }
  };

  const endStream = async () => {
    if (!roomId || !profile || profile.uid !== room?.hostUid) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), { status: 'ended' });
    } catch (error) {
      console.error('End stream error', error);
    }
  };

  if (!room) return <div className="p-24 text-center">Loading stream...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={`https://picsum.photos/seed/${room.id}/1920/1080`} 
            className="w-full h-full object-cover opacity-20 blur-xl" // Reduced opacity and blur for performance
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 aspect-video w-full max-w-5xl bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
          {room.status === 'ended' ? (
            <div className="text-center">
              <Video size={80} className="mx-auto mb-4 text-white/20" />
              <p className="text-white font-black italic uppercase text-2xl mb-2">Stream Ended</p>
              <p className="text-white/40 text-sm">Total Beans Earned: {room.currentBeans}</p>
              <button onClick={() => window.history.back()} className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl">Go Back</button>
            </div>
          ) : (
            <VideoStream isHost={profile?.uid === room.hostUid} roomId={room.id} hostUid={room.hostUid} />
          )}
          
          {/* Stream Overlay (Only if live) */}
          {room.status === 'live' && (
            <>
              <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-orange-500 p-0.5">
                  <img src={`https://picsum.photos/seed/${room.hostUid}/100/100`} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Host Name</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">ID: {room.hostUid.substring(0, 8)}</span>
                    <div className="bg-orange-500/20 text-orange-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">LV. 42</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6 flex gap-2 z-20">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                  <Users size={14} className="text-white/60" />
                  <span className="text-white font-bold text-xs">{room.viewerCount}</span>
                </div>
                <div className="bg-orange-500/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-orange-500/20">
                  <Coins size={14} className="text-orange-500" />
                  <span className="text-orange-500 font-bold text-xs">{room.currentBeans}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Bar */}
        {room.status === 'live' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10">
            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Mic size={24} />
            </button>
            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Video size={24} />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            {profile?.uid === room.hostUid ? (
              <button onClick={endStream} className="px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-black transition-colors">END STREAM</button>
            ) : (
              <button 
                onClick={() => setShowGifts(true)}
                className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black flex items-center gap-2 transition-colors"
              >
                <GiftIcon size={20} />
                SEND GIFT
              </button>
            )}
            <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <Share2 size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="w-full lg:w-96 bg-[#0a0a0a] border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black italic uppercase text-sm tracking-widest text-white/60">Live Chat</h3>
          <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
            <Zap size={12} fill="currentColor" />
            9.4k
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map(msg => (
            <div key={msg.id} className="flex gap-3 items-start">
              <img src={msg.photoURL} className="w-8 h-8 rounded-full bg-white/10" referrerPolicy="no-referrer" />
              <div>
                <p className="text-xs font-bold text-white/40 mb-0.5">{msg.displayName}</p>
                <div className={cn(
                  "px-3 py-2 rounded-2xl rounded-tl-none text-sm",
                  msg.isGift ? "bg-orange-500/20 text-orange-500 border border-orange-500/20 font-bold italic" : "bg-white/5 text-white/80"
                )}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {room.status === 'live' && (
          <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say something..."
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400">
                <Zap size={20} fill="currentColor" />
              </button>
            </div>
          </form>
        )}
      </div>

      {showGifts && <GiftingModal hostUid={room.hostUid} roomId={room.id} onClose={() => setShowGifts(false)} />}
    </div>
  );
};

const ProfilePage = () => {
  const { profile, logout } = useAuth();
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  if (!profile) return null;

  const menuItems = [
    { icon: <Briefcase size={20} className="text-cyan-400" />, label: 'Creator Center', extra: 'gs$7.2 Estimat >' },
    { icon: <Calendar size={20} className="text-cyan-400" />, label: 'Event Center', badge: true },
    { icon: <Wallet size={20} className="text-pink-400" />, label: 'Wallet' },
    { icon: <ShoppingBag size={20} className="text-orange-400" />, label: 'Item Bag', extra: 'PROPS STORE' },
    { icon: <FileText size={20} className="text-cyan-400" />, label: 'Post' },
    { icon: <Star size={20} className="text-orange-400" />, label: 'SVIP' },
    { icon: <CheckCircle size={20} className="text-orange-400" />, label: 'Task Center', extra: 'Challenger' },
    { icon: <Users2 size={20} className="text-pink-400" />, label: 'Fans Group' },
    { icon: <TrendingUp size={20} className="text-cyan-400" />, label: 'Ranking', extra: 'STAR LIST' },
    { icon: <Shield size={20} className="text-blue-400" />, label: 'Permission Settings', onClick: () => setShowPermissionGuide(true) },
    { icon: <HelpCircle size={20} className="text-pink-400" />, label: 'Help & Feedback' },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen text-slate-900 pb-20">
      {showPermissionGuide && <PermissionGuide onClose={() => setShowPermissionGuide(false)} />}
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">18:35</span>
          <Mic size={16} />
        </div>
        <div className="flex items-center gap-4">
          <Settings size={22} className="text-slate-600" />
          <UserIcon size={22} className="text-slate-600" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-xl font-bold tracking-wider mb-6">{profile.displayName}</h2>
        
        {/* Stats */}
        <div className="flex justify-around w-full px-8 mb-8">
          <div className="text-center">
            <p className="text-lg font-bold">{profile.friends || 17}</p>
            <p className="text-xs text-slate-400">Friends</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{profile.following || 81}</p>
            <p className="text-xs text-slate-400">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{profile.fans || 172} <span className="text-red-500 text-[10px]">+166</span></p>
            <p className="text-xs text-slate-400">Fans</p>
          </div>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-6">
        <div className="bg-cyan-50 rounded-xl p-3 flex flex-col items-center justify-center border border-cyan-100">
          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white mb-1">
            <Shield size={20} />
          </div>
          <span className="text-cyan-500 text-xs font-bold">Lv.{profile.level || 1}</span>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center border border-orange-100">
          <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white mb-1">
            <span className="text-lg font-black">V</span>
          </div>
          <span className="text-orange-500 text-[10px] font-bold">Purchase VIP</span>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center border border-orange-100">
          <div className="flex -space-x-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-slate-200 border border-white" />
            <div className="w-6 h-6 rounded-full bg-slate-300 border border-white" />
            <div className="w-6 h-6 rounded-full bg-slate-400 border border-white" />
          </div>
          <span className="text-orange-500 text-xs font-bold">Family</span>
        </div>
      </div>

      {/* Menu List */}
      <div className="border-t border-slate-100">
        {menuItems.map((item, idx) => (
          <div 
            key={idx} 
            onClick={item.onClick}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer",
              idx === 1 && "border-b-8 border-slate-50",
              idx === 4 && "border-b-8 border-slate-50",
              idx === 7 && "border-b-8 border-slate-50"
            )}
          >
            <div className="flex items-center gap-4">
              {item.icon}
              <span className="font-medium text-slate-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.extra && (
                <span className={cn(
                  "text-xs",
                  item.extra.includes('PROPS') ? "bg-cyan-400 text-white px-2 py-0.5 rounded text-[8px] font-bold" : 
                  item.extra.includes('STAR LIST') ? "bg-orange-400 text-white px-2 py-0.5 rounded text-[8px] font-bold italic" :
                  "text-slate-400"
                )}>
                  {item.extra}
                </span>
              )}
              {item.badge && (
                <div className="w-16 h-8 bg-blue-500 rounded-lg overflow-hidden">
                  <img src="https://picsum.photos/seed/event/64/32" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              {item.label === 'Task Center' && (
                <span className="bg-pink-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold">Challenger</span>
              )}
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button (Custom Addition) */}
      <div className="p-4">
        <button 
          onClick={logout}
          className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-red-50 text-red-500 transition-all"
        >
          Log Out
        </button>
      </div>

      {/* Bottom Nav Simulation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-2">
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <HomeIcon size={24} />
          <span className="text-[10px]">Live</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <Mic size={24} />
          <span className="text-[10px]">Party</span>
        </div>
        <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-white -mt-6 border-4 border-white shadow-lg">
          <Video size={24} />
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400 relative">
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">32</span>
          <span className="text-[10px]">Chats</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-cyan-400">
          <UserIcon size={24} />
          <span className="text-[10px]">Me</span>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="pt-16 flex">
        <Sidebar />
        <main className="flex-1 sm:ml-20 md:ml-64 min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <Shield size={64} className="mx-auto mb-6 text-red-500" />
            <h2 className="text-2xl font-black uppercase italic mb-4">Something went wrong</h2>
            <p className="text-white/40 text-sm mb-8">
              {this.state.error?.message || "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl"
            >
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- App ---
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
