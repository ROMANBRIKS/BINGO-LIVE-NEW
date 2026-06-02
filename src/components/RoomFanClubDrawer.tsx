import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Sparkles, Star, Users, CheckCircle2, 
  Calendar, Gift, ChevronUp, ChevronRight, Award
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { getBadgeStyle, getLevelFromPoints, FAN_CLUB_LEVELS } from '../fanClubLogic';
import { useToast } from '../context/ToastContext';

interface RoomFanClubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hostUid: string;
  hostName: string;
  senderUid: string;
  senderProfile: any;
  fanClubMember: any;
  onJoinSuccess?: () => void;
  onCheckInSuccess?: () => void;
}

export const RoomFanClubDrawer: React.FC<RoomFanClubDrawerProps> = ({
  isOpen,
  onClose,
  hostUid,
  hostName,
  senderUid,
  senderProfile,
  fanClubMember,
  onJoinSuccess,
  onCheckInSuccess
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [totalMembersCount, setTotalMembersCount] = useState(0);

  // Load basic fan club stats
  useEffect(() => {
    if (!isOpen || !hostUid) return;
    const loadStats = async () => {
      try {
        const statsRef = doc(db, 'fan_clubs', hostUid);
        const snap = await getDoc(statsRef);
        if (snap.exists()) {
          setTotalMembersCount(snap.data().memberCount || 0);
        } else {
          setTotalMembersCount(0);
        }
      } catch (err) {
        console.error("Error loading club stats:", err);
      }
    };
    loadStats();
  }, [isOpen, hostUid]);

  if (!isOpen) return null;

  // 1. Join Fan Club Routine
  const joinClub = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const userRef = doc(db, 'users', senderUid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const diamonds = userData.diamonds || 0;
      const joinFee = 10; // 10 diamonds join fee as standard in Bingo Live.

      if (diamonds < joinFee) {
        showToast("Insufficient diamonds. Purchase diamonds first!", "error");
        setLoading(false);
        return;
      }

      // 2. Perform membership creation
      const memberKey = `${hostUid}_${senderUid}`;
      const fanMemberRef = doc(db, 'fan_club_members', memberKey);
      
      await setDoc(fanMemberRef, {
        uid: senderUid,
        hostUid: hostUid,
        level: 1,
        intimacyPoints: 10,
        lastCheckIn: 0,
        isSuperFan: false,
        joinedAt: Date.now()
      });

      // Deduct sender Diamonds
      await updateDoc(userRef, {
        diamonds: increment(-joinFee),
        totalDiamondsSpent: increment(joinFee)
      });

      // Update streamer's global Club counters
      const clubRef = doc(db, 'fan_clubs', hostUid);
      const clubSnap = await getDoc(clubRef);
      if (clubSnap.exists()) {
        await updateDoc(clubRef, {
          memberCount: increment(1)
        });
      } else {
        await setDoc(clubRef, {
          hostUid: hostUid,
          hostName: hostName,
          memberCount: 1,
          createdAt: serverTimestamp()
        });
      }

      showToast(`Welcome to ${hostName}'s Fan Club! 💖 Badge unlocked.`, 'success');
      
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'fanClub/joinClub');
    } finally {
      setLoading(false);
    }
  };

  // 2. Daily Check-In Routine
  const performCheckIn = async () => {
    if (loading || !fanClubMember) return;
    setLoading(true);

    const now = Date.now();
    const lastCheckTime = fanClubMember.lastCheckIn || 0;
    const elligible = now - lastCheckTime > 24 * 60 * 60 * 1000;

    if (!elligible && lastCheckTime !== 0) {
      showToast("Already checked in today! Come back tomorrow. ⏰", "info");
      setLoading(false);
      return;
    }

    try {
      const memberKey = `${hostUid}_${senderUid}`;
      const fanMemberRef = doc(db, 'fan_club_members', memberKey);
      
      const checkInBonusPoints = 100; // 100 intimacy experience
      const updatedIntimacy = (fanClubMember.intimacyPoints || 0) + checkInBonusPoints;
      const newLevel = getLevelFromPoints(updatedIntimacy);

      await updateDoc(fanMemberRef, {
        intimacyPoints: increment(checkInBonusPoints),
        level: newLevel,
        lastCheckIn: now,
        isSuperFan: newLevel >= 10
      });

      showToast(`Checked-In Successfully! +100 Intimacy Points Earned 📈`, "success");
      
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'fanClub/checkIn');
    } finally {
      setLoading(false);
    }
  };

  const badgeStyle = getBadgeStyle(fanClubMember?.level || 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end pointer-events-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="w-full bg-[#161618] rounded-t-[2.5rem] border-t border-white/10 p-6 space-y-6 max-h-[85%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Indicator */}
        <div className="mx-auto w-12 h-1.5 bg-white/10 rounded-full" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart size={20} className="text-white fill-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white italic uppercase tracking-wider">{hostName}'s Fan Club</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
                <Users size={10} className="text-pink-400" />
                {totalMembersCount} Dedicated Members
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Member Status Overview Card */}
        {fanClubMember ? (
          <div className="bg-gradient-to-br from-pink-500/15 via-rose-500/5 to-transparent border border-pink-500/20 rounded-[2rem] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={senderProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderUid}`} 
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10" 
                  alt="Avatar"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{senderProfile?.displayName || "Viewer"}</span>
                    <span 
                      className="text-[9px] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-tighter"
                      style={{ backgroundColor: badgeStyle.color }}
                    >
                      {badgeStyle.label}
                    </span>
                  </div>
                  <span className="block text-[9px] text-white/40 uppercase tracking-widest mt-0.5">
                    Member Rank: Level {fanClubMember.level}
                  </span>
                </div>
              </div>

              {/* Check in option */}
              <button
                onClick={performCheckIn}
                disabled={loading}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-wider rounded-xl shadow-lg shadow-pink-500/10 flex items-center gap-1.5 transition-all"
              >
                <Calendar size={12} />
                Daily Check-In
              </button>
            </div>

            {/* EXP Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                <span>Intimacy Progress</span>
                <span>{fanClubMember.intimacyPoints} Points</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (fanClubMember.intimacyPoints % 500) / 5)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-[2rem] border border-white/10 p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-pink-500/15 text-pink-500 rounded-2xl flex items-center justify-center mx-auto border border-pink-500/20">
              <Award size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-white font-black uppercase italic tracking-wider text-xs">Unlock Host's Fan Club</h3>
              <p className="text-[10px] text-white/40 max-w-[240px] mx-auto leading-relaxed">
                Join the club to display exclusive dynamic chat badges, get live entrance welcomes, and gain priority queueing.
              </p>
            </div>

            <button
              onClick={joinClub}
              disabled={loading}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-black uppercase italic tracking-widest text-xs rounded-xl shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles size={14} className="animate-pulse" />
              {loading ? "Joining..." : "Join with 10 Diamonds"}
            </button>
          </div>
        )}

        {/* Perks Progression Section */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 px-1">Exclusive Level Benefits</h3>
          <div className="grid grid-cols-1 gap-2">
            {FAN_CLUB_LEVELS.map((tier) => (
              <div 
                key={tier.level}
                className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="text-[9px] text-white font-black py-1 px-3.5 rounded-full uppercase tracking-tighter"
                    style={{ backgroundColor: tier.badgeColor }}
                  >
                    LV.{tier.level}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">{tier.perks.join(', ')}</h4>
                    <span className="text-[8px] text-white/30 uppercase tracking-widest">Requires {tier.pointsRequired || "0"} Intimacy pts</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};
