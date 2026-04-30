import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Plus, Sparkles, Wand2, Info } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';

interface FamilyCreatePopupProps {
  onClose: () => void;
}

export const FamilyCreatePopup: React.FC<FamilyCreatePopupProps> = ({ onClose }) => {
  const { showToast } = useToast();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);
    try {
      // 1. Create the family document
      const familyRef = await addDoc(collection(db, 'families'), {
        name: name.trim(),
        description: description.trim(),
        badge: 'https://img.icons8.com/color/96/sword.png', // Default badge
        ownerUid: user.uid,
        memberCount: 1,
        memberLimit: 100,
        totalDiamondsSpent: 0,
        combatPoints: 0,
        monthlyPoints: 0,
        monthlyTarget: 100000,
        level: 1,
        tier: 'Bronze',
        createdAt: serverTimestamp()
      });

      // 2. Update the user document
      await updateDoc(doc(db, 'users', user.uid), {
        familyId: familyRef.id,
        familyName: name.trim()
      });

      showToast('Family created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error("Error creating family:", error);
      showToast('Failed to create family', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
      >
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 flex flex-col justify-end">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-[20px] shadow-lg flex items-center justify-center mb-4">
            <Shield size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Establish Your Tribe</h2>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Found a new family today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Family Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2 MUCH IC3"
                  maxLength={20}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <Sparkles size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Family Motto / Motto</label>
              <div className="relative">
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your family stand for?"
                  rows={3}
                  maxLength={150}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
                <Wand2 size={18} className="absolute right-5 bottom-5 text-slate-200" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
              <Info size={16} className="text-indigo-600" />
            </div>
            <p className="text-[11px] font-bold text-indigo-900/60 leading-relaxed">
              Founding a family costs 0 Diamonds right now. You will become the <span className="text-indigo-600">Family Leader</span> and can invite up to 100 members.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                <span>CREATE FAMILY</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
