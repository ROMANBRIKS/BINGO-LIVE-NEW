import React, { useState, useEffect } from 'react';
import { 
  collection, query, where, onSnapshot, addDoc, 
  serverTimestamp, doc, updateDoc, increment, setDoc, getDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, functions, callFunction } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Clock, CheckCircle2, X, Plus, Send, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  status: 'active' | 'closed' | 'settled';
  createdAt: any;
  expiresAt: any;
  totalVotes: number;
}

interface PollSystemProps {
  roomId: string;
  isHost: boolean;
}

export const PollSystem: React.FC<PollSystemProps> = ({ roomId, isHost }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60); // seconds
  const [featureMode, setFeatureMode] = useState<'on' | 'off' | 'auto'>('on');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'features', 'polls'), (snap) => {
      if (snap.exists()) {
        setFeatureMode(snap.data().mode || 'on');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!roomId || featureMode === 'off') return;

    const q = query(
      collection(db, 'rooms', roomId, 'polls'),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const pollData = { id: snap.docs[0].id, ...snap.docs[0].data() } as Poll;
        setActivePoll(pollData);
      } else {
        setActivePoll(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/polls`);
    });

    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (!activePoll || !profile) return;

    const voteRef = doc(db, 'rooms', roomId, 'polls', activePoll.id, 'votes', profile.uid);
    const unsub = onSnapshot(voteRef, (snap) => {
      if (snap.exists()) {
        setUserVote(snap.data().optionId);
      } else {
        setUserVote(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}/polls/${activePoll.id}/votes/${profile.uid}`);
    });

    return () => unsub();
  }, [activePoll?.id, profile?.uid, roomId]);

  const handleCreatePoll = async () => {
    if (!newQuestion.trim() || newOptions.some(o => !o.trim())) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      const pollData = {
        question: newQuestion,
        options: newOptions.map((text, i) => ({ id: `opt_${i}`, text, votes: 0 })),
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + duration * 1000),
        totalVotes: 0
      };

      await addDoc(collection(db, 'rooms', roomId, 'polls'), pollData);
      setShowCreate(false);
      setNewQuestion('');
      setNewOptions(['', '']);
      showToast("Poll started! 📊", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}/polls`);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!profile || !activePoll || userVote) return;

    try {
      const voteOnPoll = callFunction(functions, 'voteOnPoll');
      await voteOnPoll({ 
        pollId: activePoll.id, 
        optionId, 
        coins: 10 
      });

      showToast("Vote recorded! ✅", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `rooms/${roomId}/polls/${activePoll.id}/votes/${profile.uid}`);
    }
  };

  const handleStreamerBoost = async (optionId: string) => {
    if (!profile || !activePoll || !isHost) return;

    try {
      const boostFn = callFunction(functions, 'streamerBoost');
      await boostFn({ 
        pollId: activePoll.id, 
        optionId, 
        amount: 500 
      });

      showToast("Streamer Boost applied! 🔥", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `rooms/${roomId}/polls/${activePoll.id}/boost`);
    }
  };

  const closePoll = async () => {
    if (!activePoll) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'polls', activePoll.id), {
        status: 'closed'
      });
      showToast("Poll closed", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/polls/${activePoll.id}`);
    }
  };

  if (featureMode === 'off') return null;
  if (!activePoll && !isHost) return null;

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-cyan-400" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Live Poll</h3>
        </div>
        {isHost && !activePoll && (
          <button 
            onClick={() => setShowCreate(true)}
            className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
        {isHost && activePoll && (
          <button 
            onClick={closePoll}
            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showCreate ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <input 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50"
            />
            {newOptions.map((opt, i) => (
              <input 
                key={i}
                value={opt}
                onChange={(e) => {
                  const updated = [...newOptions];
                  updated[i] = e.target.value;
                  setNewOptions(updated);
                }}
                placeholder={`Option ${i + 1}`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500/50"
              />
            ))}
            <div className="flex gap-2">
              <button 
                onClick={() => setNewOptions([...newOptions, ''])}
                className="flex-1 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
              >
                ADD OPTION
              </button>
              <button 
                onClick={handleCreatePoll}
                className="flex-1 py-2 bg-cyan-500 text-black rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                START POLL
              </button>
            </div>
            <button 
              onClick={() => setShowCreate(false)}
              className="w-full py-1 text-[10px] text-white/40 uppercase font-bold"
            >
              Cancel
            </button>
          </motion.div>
        ) : activePoll ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <p className="text-sm font-bold leading-tight">{activePoll.question}</p>
            <div className="space-y-2">
              {activePoll.options.map((option) => {
                const percentage = activePoll.totalVotes > 0 
                  ? Math.round((option.votes / activePoll.totalVotes) * 100) 
                  : 0;
                const isSelected = userVote === option.id;

                return (
                  <div key={option.id} className="relative">
                    <button
                      key={option.id}
                      onClick={() => handleVote(option.id)}
                      disabled={!!userVote}
                      className={cn(
                        "w-full relative h-10 rounded-xl overflow-hidden border transition-all",
                        isSelected ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/10 bg-white/5",
                        !userVote && "hover:bg-white/10 active:scale-[0.98]"
                      )}
                    >
                      {/* Progress Bar */}
                      <div 
                        className={cn(
                          "absolute inset-y-0 left-0 transition-all duration-1000",
                          isSelected ? "bg-cyan-500/20" : "bg-white/5"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                      
                      <div className="absolute inset-0 px-3 flex items-center justify-between text-xs">
                        <span className={cn("font-medium", isSelected && "text-cyan-400")}>
                          {option.text}
                        </span>
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle2 size={12} className="text-cyan-400" />}
                          <span className="font-bold opacity-60">{percentage}%</span>
                        </div>
                      </div>
                    </button>
                    {isHost && (
                      <button 
                        onClick={() => handleStreamerBoost(option.id)}
                        className="absolute -right-2 -top-2 p-1 bg-yellow-500 text-black rounded-full shadow-lg hover:scale-110 transition-transform z-20"
                        title="Streamer Boost"
                      >
                        <Zap size={10} fill="currentColor" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase">
              <span>{activePoll.totalVotes} Votes</span>
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>Active</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-white/40 font-medium italic">No active poll</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
