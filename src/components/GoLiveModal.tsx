import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, X, Sparkles, Camera, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const GoLiveModal = ({ onClose }: { onClose: () => void }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartBroadcast = async () => {
    if (!profile || loading) return;
    setLoading(true);
    try {
      const roomData = {
        hostUid: profile.uid,
        title: title || `${profile.displayName}'s Live Stream`,
        status: 'live',
        type: 'video',
        currentBeans: 0,
        viewerCount: 0,
        guests: [],
        isPrivate: false,
        createdAt: serverTimestamp(),
        pkStatus: 'idle'
      };

      const docRef = await addDoc(collection(db, 'rooms'), roomData);
      navigate(`/room/${docRef.id}`);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to start broadcast. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(249,115,22,0.3)] rotate-6">
            <Video size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-2">Go Live</h2>
          <p className="text-white/40 text-sm">Set your stream title and start broadcasting to your fans!</p>
        </div>

        <div className="space-y-6 mb-8 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 ml-2">Stream Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you up to?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 transition-all font-bold italic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2">
              <Camera size={20} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase text-white/40">HD Video</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2">
              <Mic size={20} className="text-green-400" />
              <span className="text-[10px] font-black uppercase text-white/40">Stereo Audio</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleStartBroadcast}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-black uppercase italic tracking-widest shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Start Broadcast
              <Sparkles size={20} fill="currentColor" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
