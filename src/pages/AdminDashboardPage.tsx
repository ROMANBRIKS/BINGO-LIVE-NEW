import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, query, where, onSnapshot, doc, getDoc, 
  updateDoc, orderBy, limit, collectionGroup, setDoc, deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Room, PrivateCallRequest, UserProfile, Gift } from '../types';
import { DEFAULT_POPULAR_GIFTS } from '../constants/gifts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Users, Video, Phone, Eye, EyeOff, 
  Search, Filter, ChevronRight, AlertTriangle, 
  Activity, BarChart3, Lock, Unlock, Settings, Zap,
  Gift as GiftIcon, Plus, Trash2, Upload, Clock, Save, X, Diamond, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminDashboardPage() {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [privateCalls, setPrivateCalls] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLive: 0,
    totalPrivate: 0,
    totalUsers: 0,
    reports: 0
  });
  const [isGhostMode, setIsGhostMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'main' | 'rooms' | 'private' | 'reports' | 'gifts' | 'features' | 'eggs'>('main');
  const [features, setFeatures] = useState<any[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [easterEggs, setEasterEggs] = useState<any[]>([]);
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [isAddingEgg, setIsAddingEgg] = useState(false);
  const [isUploadingGift, setIsUploadingGift] = useState(false);
  const [isUploadingEgg, setIsUploadingEgg] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [editingEgg, setEditingEgg] = useState<any | null>(null);
  const giftFileInputRef = React.useRef<HTMLInputElement>(null);
  const eggFileInputRef = React.useRef<HTMLInputElement>(null);
  const [giftForm, setGiftForm] = useState<Partial<Gift>>({
    name: '',
    cost: 0,
    image: '🎁',
    animationType: 'standard',
    category: 'Popular',
    isFlash: false
  });
  const [eggForm, setEggForm] = useState<any>({
    name: '',
    image: '🥚',
    rewardType: 'beans',
    rewardValue: 10,
    rarity: 'common',
    isEnabled: true
  });

  // Security Check: Only admins allowed
  useEffect(() => {
    const isAdminUser = (profile?.role === 'admin') || 
                       (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                       (user?.email === 'rogershep101@gmail.com');

    if (profile && !isAdminUser) {
      showToast("Access Denied: Admin only area.", 'error');
      navigate('/');
    }
  }, [profile, user, navigate, showToast]);

  // Helper to check admin status for effects
  const isAdmin = (profile?.role === 'admin') || 
                  (user?.uid === 'YDnNAkdp5sYRs8YNN8K22576UO33') || 
                  (user?.email === 'rogershep101@gmail.com');

  // Fetch Active Rooms
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'rooms'), where('status', '==', 'live'));
    const unsub = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setActiveRooms(rooms);
      setStats(prev => ({ ...prev, totalLive: rooms.length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });

    return () => unsub();
  }, [isAdmin]);

  // Fetch Private Calls (Active and Pending)
  useEffect(() => {
    if (!isAdmin) return;

    // Listen to all private calls across all rooms
    const q = query(collectionGroup(db, 'private_calls'), orderBy('createdAt', 'desc'), limit(50));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrivateCalls(calls);
      setStats(prev => ({ ...prev, totalPrivate: calls.filter((c: any) => c.status === 'active').length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'private_calls_group');
    });

    return () => unsub();
  }, [isAdmin]);

  // Fetch Features
  useEffect(() => {
    if (!isAdmin) return;

    const unsub = onSnapshot(collection(db, 'features'), (snapshot) => {
      const featureList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeatures(featureList);

      // Seed features if they don't exist
      const requiredFeatures = ['polls', 'chaos_events', 'easter_eggs', 'predictions'];
      requiredFeatures.forEach(async (id) => {
        if (!featureList.find(f => f.id === id)) {
          await setDoc(doc(db, 'features', id), {
            id,
            mode: 'off',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      });
    }, (error) => {
      console.error("Error initializing features:", error);
      handleFirestoreError(error, OperationType.LIST, 'features');
    });

    return () => unsub();
  }, [isAdmin]);

  // Fetch Easter Eggs
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'easter_eggs'), orderBy('rewardValue', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const eggList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEasterEggs(eggList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'easter_eggs');
    });

    return () => unsub();
  }, [isAdmin]);

  const handleSaveEgg = async () => {
    if (!eggForm.name || !eggForm.image) {
      showToast("Please fill in all required fields", 'warning');
      return;
    }

    try {
      const eggId = editingEgg?.id || `egg_${Date.now()}`;
      await setDoc(doc(db, 'easter_eggs', eggId), {
        ...eggForm,
        id: eggId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      showToast(`Easter Egg ${editingEgg ? 'updated' : 'added'} successfully`, 'success');
      setIsAddingEgg(false);
      setEditingEgg(null);
    } catch (error) {
      console.error("Error saving egg:", error);
      showToast("Failed to save Easter Egg", 'error');
    }
  };

  const handleDeleteEgg = async (eggId: string) => {
    if (!window.confirm("Are you sure you want to delete this Easter Egg?")) return;
    try {
      await deleteDoc(doc(db, 'easter_eggs', eggId));
      showToast("Easter Egg deleted", 'info');
      setIsAddingEgg(false);
      setEditingEgg(null);
    } catch (error) {
      showToast("Error deleting egg", 'error');
    }
  };

  const handleEggImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEgg(true);
    try {
      const storageRef = ref(storage, `eggs/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEggForm({ ...eggForm, image: url });
      showToast("Egg icon uploaded!", 'success');
    } catch (error) {
      showToast("Upload failed", 'error');
    } finally {
      setIsUploadingEgg(false);
    }
  };

  const handleManualDrop = async (roomId: string, egg: any) => {
    if (egg.isEnabled === false) {
      showToast("This egg is currently disabled!", 'warning');
      return;
    }
    try {
      const dropId = `drop_${Date.now()}`;
      const dropRef = doc(db, `rooms/${roomId}/egg_drops`, dropId);
      
      await setDoc(dropRef, {
        id: dropId,
        eggId: egg.id,
        eggImage: egg.image,
        rewardType: egg.rewardType,
        rewardValue: egg.rewardValue,
        x: Math.floor(Math.random() * 80) + 10, // 10% to 90%
        y: Math.floor(Math.random() * 60) + 20, // 20% to 80%
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString() // 1 minute
      });

      showToast(`Egg dropped in room ${roomId.slice(0, 6)}!`, 'success');
    } catch (error) {
      console.error("Drop failed:", error);
      showToast("Failed to drop egg", 'error');
    }
  };

  const updateFeatureMode = async (featureId: string, mode: 'on' | 'off' | 'auto') => {
    try {
      await setDoc(doc(db, 'features', featureId), { mode }, { merge: true });
      showToast(`Feature ${featureId} set to ${mode}`, 'success');
    } catch (error) {
      showToast("Error updating feature", 'error');
    }
  };

  // Fetch Gifts
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'gifts'), orderBy('cost', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const giftList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift));
      
      // Merge with default gifts
      // If a gift with the same ID exists in DB, it overrides the default
      const dbIds = new Set(giftList.map(g => g.id));
      const mergedGifts = [
        ...giftList,
        ...DEFAULT_POPULAR_GIFTS.filter(g => !dbIds.has(g.id))
      ];
      
      setGifts(mergedGifts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gifts');
    });

    return () => unsub();
  }, [isAdmin]);

  const handleGiftUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGift(true);
    try {
      const storageRef = ref(storage, `gifts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setGiftForm(prev => ({ ...prev, image: url }));
      showToast("Gift image uploaded! 🖼️", 'success');
    } catch (error) {
      console.error("Gift upload error:", error);
      showToast("Failed to upload gift image", 'error');
    } finally {
      setIsUploadingGift(false);
    }
  };

  const handleSaveGift = async () => {
    if (!giftForm.name || !giftForm.cost || !giftForm.image) {
      showToast("Please fill in all required fields", 'error');
      return;
    }

    try {
      const giftId = editingGift?.id || `gift_${Date.now()}`;
      const giftRef = doc(db, 'gifts', giftId);
      
      await setDoc(giftRef, {
        ...giftForm,
        id: giftId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      showToast(`Gift ${editingGift ? 'updated' : 'added'} successfully!`, 'success');
      setIsAddingGift(false);
      setEditingGift(null);
      setGiftForm({
        name: '',
        cost: 0,
        image: '🎁',
        animationType: 'standard',
        category: 'Popular',
        isFlash: false
      });
    } catch (error) {
      console.error("Error saving gift:", error);
      showToast("Failed to save gift", 'error');
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!window.confirm("Are you sure you want to delete this gift?")) return;
    
    try {
      const giftRef = doc(db, 'gifts', giftId);
      await deleteDoc(giftRef); 
      showToast("Gift deleted permanently", 'info');
      setIsAddingGift(false);
      setEditingGift(null);
    } catch (error) {
      showToast("Error deleting gift", 'error');
    }
  };

  const toggleGhostMode = () => {
    setIsGhostMode(!isGhostMode);
    showToast(`Ghost Mode ${!isGhostMode ? 'Activated' : 'Deactivated'}`, 'info');
  };

  const investigateRoom = (roomId: string) => {
    // Navigate to room with ghost mode flag
    navigate(`/room/${roomId}?ghost=${isGhostMode}`);
  };

  if (!profile || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 select-none">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <Shield className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Admin Dashboard</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Master Control Center</p>
          </div>
        </div>

        <button 
          onClick={toggleGhostMode}
          className={cn(
            "px-6 py-3 rounded-2xl flex items-center gap-3 transition-all border",
            isGhostMode 
              ? "bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
              : "bg-white/5 border-white/10 text-white/40"
          )}
        >
          {isGhostMode ? <Eye size={18} /> : <EyeOff size={18} />}
          <span className="text-xs font-black uppercase italic tracking-widest">
            Ghost Mode: {isGhostMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Live Rooms', value: stats.totalLive, icon: Video, color: 'text-cyan-400' },
          { label: 'Private Calls', value: stats.totalPrivate, icon: Phone, color: 'text-pink-400' },
          { label: 'Active Users', value: '1.2k', icon: Users, color: 'text-green-400' },
          { label: 'Reports', value: '0', icon: AlertTriangle, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={18} className={stat.color} />
              <Activity size={14} className="text-white/10" />
            </div>
            <div className="text-2xl font-black italic">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs / Breadcrumbs */}
      <div className="flex items-center gap-4 mb-8">
        {activeTab !== 'main' && (
          <button 
            onClick={() => setActiveTab('main')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10">
              <ChevronRight className="rotate-180" size={16} />
            </div>
            <span className="text-xs font-black uppercase italic tracking-widest">Back to Menu</span>
          </button>
        )}
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'main', label: 'Dashboard Home', icon: Activity },
            { id: 'features', label: 'Feature Control', icon: Settings, highlight: true },
            { id: 'rooms', label: 'Live Rooms', icon: Video },
            { id: 'private', label: 'Private Calls', icon: Phone },
            { id: 'gifts', label: 'Gift Management', icon: GiftIcon },
            { id: 'reports', label: 'Reports', icon: AlertTriangle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-2 px-4 flex items-center gap-2 transition-all relative whitespace-nowrap",
                activeTab === tab.id ? "text-white" : "text-white/20",
                (tab as any).highlight && activeTab !== tab.id && "text-cyan-400/60"
              )}
            >
              <tab.icon size={16} className={cn((tab as any).highlight && activeTab !== tab.id && "animate-pulse")} />
              <span className="text-[10px] font-black uppercase italic tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'features', label: 'Feature Control', icon: Settings, desc: 'Manage Polls, Chaos, Predictions', color: 'bg-cyan-500/10 text-cyan-500' },
              { id: 'rooms', label: 'Live Room Manager', icon: Video, desc: 'Monitor and moderate active streams', color: 'bg-red-500/10 text-red-500' },
              { id: 'private', label: 'Private Call Center', icon: Phone, desc: 'Track active private sessions', color: 'bg-pink-500/10 text-pink-500' },
              { id: 'gifts', label: 'Gift & Store', icon: GiftIcon, desc: 'Upload and manage platform gifts', color: 'bg-yellow-500/10 text-yellow-500' },
              { id: 'eggs', label: 'Easter Eggs', icon: Sparkles, desc: 'Design surprise drops and rewards', color: 'bg-purple-500/10 text-purple-500' },
              { id: 'reports', label: 'Safety & Reports', icon: AlertTriangle, desc: 'Review user reports and violations', color: 'bg-orange-500/10 text-orange-500' },
            ].map(item => (
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className="bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] p-8 text-left group transition-all hover:border-white/20"
              >
                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all group-hover:scale-110", item.color)}>
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2 tracking-tight">{item.label}</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-6">{item.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
                  Open Section <ChevronRight size={14} />
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'polls', label: 'Control Stream Votes (Polls)', icon: BarChart3, description: 'Allow streamers to create live polls' },
              { id: 'chaos_events', label: 'Live Chaos Events', icon: Zap, description: 'Trigger 2x rewards or special drops' },
              { id: 'easter_eggs', label: 'Hidden Easter Egg Drops', icon: Sparkles, description: 'Random gift spawns in streams' },
              { id: 'predictions', label: 'Prediction System', icon: Activity, description: 'Allow users to bet on stream outcomes' },
            ].map(feature => {
              const currentFeature = features.find(f => f.id === feature.id);
              const currentMode = currentFeature?.mode || 'off';

              return (
                <div key={feature.id} className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black uppercase italic mb-2 tracking-tight">{feature.label}</h3>
                  <p className="text-xs text-white/40 mb-8 leading-relaxed">{feature.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                    {['off', 'on', 'auto'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => updateFeatureMode(feature.id, mode as any)}
                        className={cn(
                          "py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                          currentMode === mode 
                            ? "bg-white text-black shadow-xl" 
                            : "text-white/20 hover:text-white/40"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {activeRooms.map(room => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={room.id}
                className="bg-[#1a1a1a] border border-white/10 rounded-[1.5rem] overflow-hidden group"
              >
                <div className="aspect-video relative">
                  <img 
                    src={`https://picsum.photos/seed/${room.hostUid}/400/225`} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 bg-red-500 rounded-md flex items-center gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase italic">LIVE</span>
                    </div>
                    <div className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md flex items-center gap-1">
                      <Users size={8} className="text-white/60" />
                      <span className="text-[8px] font-black">{room.viewerCount}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[10px] font-black uppercase italic tracking-tight truncate">{room.title}</h3>
                      <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">Host: {room.hostUid.slice(0, 6)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => {
                          if (easterEggs.length === 0) {
                            showToast("Create an Easter Egg first!", 'warning');
                            return;
                          }
                          // Drop a random egg for now or first one
                          handleManualDrop(room.id, easterEggs[0]);
                        }}
                        className="w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all flex-shrink-0"
                        title="Drop Easter Egg"
                      >
                        <Sparkles size={14} />
                      </button>
                      <button 
                        onClick={() => investigateRoom(room.id)}
                        className="w-7 h-7 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all flex-shrink-0"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {activeRooms.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                <Video size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase italic tracking-widest">No active rooms found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'private' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase italic">Live Private Sessions</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{privateCalls.filter(c => c.status === 'active').length} Active Calls</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {privateCalls.length === 0 ? (
                <div className="bg-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-white/10">
                  <Phone size={48} className="text-white/10 mb-4" />
                  <p className="text-white/40 font-black uppercase italic tracking-widest">No private call activity found</p>
                </div>
              ) : (
                privateCalls.map(call => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={call.id} 
                    className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 hover:border-white/10 transition-all"
                  >
                    <div className="flex -space-x-4">
                      <div className="relative">
                        <img src={call.viewerPhoto} className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-900" referrerPolicy="no-referrer" />
                        <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-[8px] font-black px-1.5 py-0.5 rounded-full text-black uppercase">User</div>
                      </div>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center border-2 border-slate-900 text-pink-500 overflow-hidden">
                          {call.hostPhoto ? (
                            <img src={call.hostPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Video size={20} />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-pink-500 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white uppercase">Host</div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black italic uppercase text-white">{call.viewerName}</span>
                        <ChevronRight size={14} className="text-white/20" />
                        <span className="font-black italic uppercase text-pink-500">{call.hostName || 'Host'}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-white/20" />
                          <span className="text-[10px] font-bold text-white/60">{call.duration} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Diamond size={12} className="text-cyan-400" />
                          <span className="text-[10px] font-black text-cyan-400 italic">{call.totalCost || call.fee}</span>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          call.status === 'active' ? "bg-emerald-500/20 text-emerald-400" :
                          call.status === 'pending' ? "bg-yellow-500/20 text-yellow-500" :
                          "bg-white/5 text-white/20"
                        )}>
                          {call.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => investigateRoom(call.roomId)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Monitor
                      </button>
                      {call.status === 'active' && (
                        <button 
                          onClick={() => showToast("Force ending session...", 'warning')}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          End Session
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'eggs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase italic">Easter Egg Factory</h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Design surprise drops and platform rewards</p>
              </div>
              <button 
                onClick={() => {
                  setEditingEgg(null);
                  setEggForm({
                    name: '',
                    image: '🥚',
                    rewardType: 'beans',
                    rewardValue: 10,
                    rarity: 'common',
                    isEnabled: true
                  });
                  setIsAddingEgg(true);
                }}
                className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-105 transition-all"
              >
                <Plus size={18} />
                Design New Egg
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {easterEggs.map(egg => (
                <motion.div 
                  key={egg.id}
                  onDoubleClick={() => {
                    setEditingEgg(egg);
                    setEggForm(egg);
                    setIsAddingEgg(true);
                  }}
                  className="bg-[#1a1a1a] border border-white/5 rounded-[2rem] p-4 group relative cursor-pointer"
                >
                  <div className="aspect-square flex items-center justify-center mb-3 bg-white/5 rounded-2xl relative overflow-hidden">
                    {egg.image.startsWith('http') ? (
                      <img src={egg.image} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-4xl">{egg.image}</span>
                    )}
                    <div className={cn(
                      "absolute top-2 right-2 text-[6px] font-black px-1.5 py-0.5 rounded uppercase",
                      egg.rarity === 'legendary' ? "bg-yellow-500 text-black" :
                      egg.rarity === 'rare' ? "bg-purple-500 text-white" :
                      "bg-white/10 text-white/40"
                    )}>
                      {egg.rarity}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-black uppercase italic truncate">{egg.name}</div>
                    <div className="flex items-center justify-center gap-1 text-purple-400 text-[10px] font-bold">
                      <Sparkles size={10} />
                      {egg.rewardValue} {egg.rewardType}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await setDoc(doc(db, 'easter_eggs', egg.id), {
                            isEnabled: !egg.isEnabled
                          }, { merge: true });
                          showToast(`Egg ${!egg.isEnabled ? 'enabled' : 'disabled'}`, 'info');
                        } catch (error) {
                          showToast("Failed to toggle status", 'error');
                        }
                      }}
                      className={cn(
                        "w-8 h-4 rounded-full relative transition-colors duration-300",
                        egg.isEnabled ? "bg-green-500" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300",
                        egg.isEnabled ? "left-4.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                  
                  {/* Global Drop Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (egg.isEnabled === false) {
                        showToast("Enable the egg first!", 'warning');
                        return;
                      }
                      if (activeRooms.length === 0) {
                        showToast("No active rooms to drop into!", 'warning');
                        return;
                      }
                      activeRooms.forEach(room => handleManualDrop(room.id, egg));
                      showToast(`Global Drop: ${egg.name} dropped in ${activeRooms.length} rooms!`, 'success');
                    }}
                    disabled={egg.isEnabled === false}
                    className={cn(
                      "mt-3 w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                      egg.isEnabled === false 
                        ? "bg-white/5 border-white/10 text-white/20 cursor-not-allowed" 
                        : "bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white border-purple-500/20"
                    )}
                  >
                    Global Drop
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gifts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase italic">Gift Inventory</h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Manage platform-wide gifts and flash events</p>
              </div>
              <button 
                onClick={() => {
                  setEditingGift(null);
                  setGiftForm({
                    name: '',
                    cost: 0,
                    image: '🎁',
                    animationType: 'standard',
                    category: 'Popular',
                    isFlash: false
                  });
                  setIsAddingGift(true);
                }}
                className="px-6 py-3 bg-cyan-500 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:scale-105 transition-all"
              >
                <Plus size={18} />
                Add New Gift
              </button>
            </div>

            {/* Gift Grid by Category */}
            {['Popular', 'Noble', 'Event', 'Flash', 'Local', 'Fun', 'Shields', 'Treasure', 'Activity'].map(category => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{category} Gifts</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                   <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {gifts.filter(g => g.category === category).map(gift => (
                    <motion.div 
                      layoutId={gift.id}
                      key={gift.id}
                      onDoubleClick={() => {
                        setEditingGift(gift);
                        setGiftForm(gift);
                        setIsAddingGift(true);
                      }}
                      className="bg-[#1a1a1a] border border-white/5 rounded-[1.25rem] p-2 group relative cursor-pointer active:scale-95 transition-transform"
                    >
                      <div className="aspect-square flex items-center justify-center mb-1 bg-white/5 rounded-xl relative overflow-hidden">
                        {gift.image.startsWith('http') || gift.image.startsWith('/') ? (
                          <img src={gift.image} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-xl">{gift.image}</span>
                        )}
                        {gift.isFlash && (
                          <div className="absolute top-1 right-1 bg-red-500 text-[5px] font-black px-1 py-0.5 rounded uppercase flex items-center gap-0.5">
                            <Clock size={6} />
                            Flash
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black uppercase italic truncate">{gift.name}</div>
                        <div className="flex items-center justify-center gap-0.5 text-yellow-500 text-[8px] font-bold">
                          <Diamond size={8} />
                          {gift.cost}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button 
                    onClick={() => {
                      setGiftForm(prev => ({ ...prev, category }));
                      setIsAddingGift(true);
                    }}
                    className="aspect-square border-2 border-dashed border-white/5 rounded-[1.25rem] flex flex-col items-center justify-center gap-1 text-white/10 hover:text-white/20 hover:border-white/10 transition-all"
                  >
                    <Plus size={16} />
                    <span className="text-[6px] font-black uppercase tracking-widest">Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Egg Modal */}
        <AnimatePresence>
          {isAddingEgg && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-[3rem] w-full max-w-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black uppercase italic">{editingEgg ? 'Edit Egg' : 'Design Egg'}</h2>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Surprise Drop Configuration</p>
                    </div>
                    <button onClick={() => setIsAddingEgg(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center relative group overflow-hidden">
                        {isUploadingEgg ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
                        ) : (
                          <>
                            {eggForm.image.startsWith('http') ? (
                              <img src={eggForm.image} className="w-20 h-20 object-contain" />
                            ) : (
                              <span className="text-5xl">{eggForm.image}</span>
                            )}
                            <button 
                              onClick={() => eggFileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1"
                            >
                              <Upload size={20} />
                              <span className="text-[8px] font-black uppercase">Upload</span>
                            </button>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={eggFileInputRef} 
                          onChange={handleEggImageUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Egg Name</label>
                          <input 
                            type="text"
                            value={eggForm.name}
                            onChange={e => setEggForm({ ...eggForm, name: e.target.value })}
                            placeholder="e.g. Golden Mystery Egg"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Emoji Icon (Fallback)</label>
                          <input 
                            type="text"
                            value={eggForm.image.startsWith('http') ? '🥚' : eggForm.image}
                            onChange={e => setEggForm({ ...eggForm, image: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Reward Value</label>
                        <div className="relative">
                          <input 
                            type="number"
                            value={eggForm.rewardValue}
                            onChange={e => setEggForm({ ...eggForm, rewardValue: parseInt(e.target.value) })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none"
                          />
                          <Diamond className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400" size={14} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Reward Type</label>
                        <select 
                          value={eggForm.rewardType}
                          onChange={e => setEggForm({ ...eggForm, rewardType: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-purple-500 transition-all outline-none appearance-none"
                        >
                          <option value="beans">Beans</option>
                          <option value="diamonds">Diamonds</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Rarity Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['common', 'rare', 'legendary'].map(r => (
                          <button
                            key={r}
                            onClick={() => setEggForm({ ...eggForm, rarity: r })}
                            className={cn(
                              "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              eggForm.rarity === r 
                                ? "bg-purple-500 border-purple-400 text-white" 
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <div className="text-xs font-black uppercase italic">Active Status</div>
                        <div className="text-[8px] text-white/40 font-black uppercase tracking-widest">Enable this egg for automatic and manual drops</div>
                      </div>
                      <button
                        onClick={() => setEggForm({ ...eggForm, isEnabled: !eggForm.isEnabled })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-colors duration-300",
                          eggForm.isEnabled ? "bg-green-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                          eggForm.isEnabled ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    {editingEgg && (
                      <button 
                        onClick={() => handleDeleteEgg(editingEgg.id)}
                        className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                    <button 
                      onClick={() => setIsAddingEgg(false)}
                      className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveEgg}
                      className="flex-1 py-4 bg-purple-500 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {editingEgg ? 'Update Egg' : 'Save Design'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add/Edit Gift Modal */}
        <AnimatePresence>
          {isAddingGift && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-[3rem] w-full max-w-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black uppercase italic">{editingGift ? 'Edit Gift' : 'Add New Gift'}</h2>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Platform Asset Configuration</p>
                    </div>
                    <button onClick={() => setIsAddingGift(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Image/Emoji Upload */}
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl border border-white/10 overflow-hidden">
                        {isUploadingGift ? (
                          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        ) : giftForm.image?.startsWith('http') ? (
                          <img src={giftForm.image} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                        ) : (
                          giftForm.image || '🎁'
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Gift Asset (Emoji or URL)</label>
                        <input 
                          type="text"
                          value={giftForm.image}
                          onChange={e => setGiftForm({ ...giftForm, image: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-cyan-500 transition-all outline-none"
                          placeholder="Enter emoji or image URL"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="file" 
                            ref={giftFileInputRef} 
                            onChange={handleGiftUpload} 
                            className="hidden" 
                            accept="image/*" 
                          />
                          <button 
                            onClick={() => giftFileInputRef.current?.click()}
                            disabled={isUploadingGift}
                            className="flex-1 py-2 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                          >
                            <Upload size={12} /> {isUploadingGift ? 'Uploading...' : 'Upload File'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Gift Name</label>
                        <input 
                          type="text"
                          value={giftForm.name}
                          onChange={e => setGiftForm({ ...giftForm, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-cyan-500 transition-all outline-none"
                          placeholder="e.g. Magic Rose"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Cost (Diamonds)</label>
                        <input 
                          type="number"
                          value={giftForm.cost}
                          onChange={e => setGiftForm({ ...giftForm, cost: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-cyan-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</label>
                        <select 
                          value={giftForm.category}
                          onChange={e => setGiftForm({ ...giftForm, category: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-cyan-500 transition-all outline-none appearance-none"
                        >
                          <option value="Popular">Popular</option>
                          <option value="Noble">Noble</option>
                          <option value="Event">Event</option>
                          <option value="Flash">Flash</option>
                          <option value="Local">Local</option>
                          <option value="Fun">Fun</option>
                          <option value="Shields">Shields</option>
                          <option value="Treasure">Treasure</option>
                          <option value="Activity">Activity</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Animation Type</label>
                        <select 
                          value={giftForm.animationType}
                          onChange={e => setGiftForm({ ...giftForm, animationType: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-cyan-500 transition-all outline-none appearance-none"
                        >
                          <option value="standard">Standard</option>
                          <option value="fullscreen">Fullscreen</option>
                          <option value="special">Special Effect</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          giftForm.isFlash ? "bg-red-500 text-white" : "bg-white/10 text-white/20"
                        )}>
                          <Clock size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase italic">Flash Gift Mode</div>
                          <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Limited time availability</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setGiftForm({ ...giftForm, isFlash: !giftForm.isFlash })}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all",
                          giftForm.isFlash ? "bg-red-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          giftForm.isFlash ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    {editingGift && (
                      <button 
                        onClick={() => handleDeleteGift(editingGift.id)}
                        className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                    <button 
                      onClick={() => setIsAddingGift(false)}
                      className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveGift}
                      className="flex-1 py-4 bg-cyan-500 text-white rounded-2xl font-black uppercase italic text-xs tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      {editingGift ? 'Update Gift' : 'Add to Store'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
