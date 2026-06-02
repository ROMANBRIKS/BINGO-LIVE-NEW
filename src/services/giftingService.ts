import { 
  doc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  increment, 
  runTransaction 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Gift, UserProfile, ShieldTier } from '../types';
import { calculateGiftingPower } from '../nobleGiftingLogic';
import { calculateFamilyContribution } from '../familyLogic';
import { calculateWealthLevel } from '../wealthLogic';
import { PK_SHIELDS, calculateShieldedScore } from '../pkShieldLogic';
import { AGENCY_TIERS, getTierForEarnings, getAgencyCommissionRateForTier } from '../agencyLogic';
import { TREASURE_GOALS } from '../treasureChestLogic';
import { getLevelFromPoints } from '../fanClubLogic';

interface GiftTransactionResult {
  success: boolean;
  totalCost: number;
  giftingPower: number;
  newSenderDiamonds: number;
  fanClubLevel: number;
  isNewJoinFanClub: boolean;
  treasureGoalCompleted: boolean;
  completedTreasureGoal: any | null;
  shieldAbsorbedValue?: number;
}

/**
 * 🎁 THE UNIFIED GIFTING TRANSACTION PIPELINE (Nexus Gifting Loop)
 * Coordinates atomic state changes across all connected subsystems with strict transactional guarantees.
 */
export const processGiftTransaction = async (
  senderUid: string,
  hostUid: string,
  roomId: string,
  gift: Gift,
  quantity: number,
  activeTab: string,
  snipeMultiplier: number,
  svipDiscount: number
): Promise<GiftTransactionResult> => {
  const isSimulatedRoom = !roomId || roomId === 'shyne_featured' || roomId.startsWith('host_') || roomId.startsWith('sim_') || roomId.includes('featured');
  if (isSimulatedRoom) {
    const totalCost = Math.floor(gift.cost * quantity * (1 - svipDiscount / 100));
    return {
      success: true,
      totalCost,
      giftingPower: gift.cost * quantity,
      newSenderDiamonds: 100000, // Simulated plenty of diamonds since offline mock
      fanClubLevel: 1,
      isNewJoinFanClub: false,
      treasureGoalCompleted: false,
      completedTreasureGoal: null,
      shieldAbsorbedValue: 0
    };
  }

  const userRef = doc(db, 'users', senderUid);
  const hostRef = doc(db, 'users', hostUid);
  const roomRef = doc(db, 'rooms', roomId);
  const agencyMemberRef = doc(db, 'agency_members', hostUid);
  const fanClubMemberRef = doc(db, 'fan_club_members', `${hostUid}_${senderUid}`);
  const treasureChestRef = doc(db, 'rooms', roomId, 'features', 'treasureChest');

  try {
    const result = await runTransaction(db, async (transaction) => {
      // 1. READ CHANNELS
      const senderSnap = await transaction.get(userRef);
      const hostSnap = await transaction.get(hostRef);
      const roomSnap = await transaction.get(roomRef);
      const agencyMemberSnap = await transaction.get(agencyMemberRef);
      const fanClubMemberSnap = await transaction.get(fanClubMemberRef);
      const treasureChestSnap = await transaction.get(treasureChestRef);

      if (!senderSnap.exists()) {
        throw new Error("Sender user profile does not exist.");
      }
      if (!hostSnap.exists()) {
        throw new Error("Host user profile does not exist.");
      }
      if (!roomSnap.exists()) {
        throw new Error("Live stream room does not exist.");
      }

      const senderData = senderSnap.data() as UserProfile;
      const hostData = hostSnap.data() as UserProfile;
      const roomData = roomSnap.data();

      // 2. TRANSACTION AND COST VERIFICATION
      const totalCost = Math.floor(gift.cost * quantity * (1 - svipDiscount / 100));
      const senderDiamonds = senderData.diamonds || 0;

      if (senderDiamonds < totalCost) {
        throw new Error("Insufficient diamonds to complete gifting transaction.");
      }

      // 3. NOBLE AND WEALTH CALCULATIONS
      let giftingPower = Math.floor(calculateGiftingPower(gift.cost * quantity, senderData) * snipeMultiplier);
      const newTotalSpent = (senderData.totalDiamondsSpent || 0) + totalCost;
      const newWealthLvl = calculateWealthLevel(newTotalSpent);

      // 4. SHIELD MITIGATION (Opponent Defense)
      const oShield = roomData?.pkOpponentShieldTier ? PK_SHIELDS[roomData.pkOpponentShieldTier as ShieldTier] : null;
      const oShieldActive = oShield && roomData?.pkOpponentShieldEndTime && new Date(roomData.pkOpponentShieldEndTime).getTime() > Date.now();
      let currentOpponentShieldAbsorbed = roomData?.pkOpponentShieldAbsorbed || 0;
      let newOpponentShieldAbsorbed = currentOpponentShieldAbsorbed;
      let shieldAbsorbedValue = 0;

      if (oShieldActive && oShield) {
        const { passedScore, newlyAbsorbed } = calculateShieldedScore(giftingPower, oShield, currentOpponentShieldAbsorbed);
        shieldAbsorbedValue = Math.floor(newlyAbsorbed - currentOpponentShieldAbsorbed);
        giftingPower = passedScore;
        newOpponentShieldAbsorbed = newlyAbsorbed;
      }

      // 5. AGENCY SYSTEM CALCULATIONS
      let agencyRef = null;
      let commission = 0;
      let newMemberTier = 'Junior';
      let isAgencyMember = false;
      let newAgencyCommissionRate = 0.10;

      if (agencyMemberSnap.exists()) {
        const memberData = agencyMemberSnap.data();
        const agencyId = memberData.agencyId;
        const currentTier = memberData.tier || 'Junior';

        if (agencyId) {
          const agencyDocRef = doc(db, 'agencies', agencyId);
          const agencySnap = await transaction.get(agencyDocRef);

          if (agencySnap.exists()) {
            isAgencyMember = true;
            agencyRef = agencyDocRef;
            const agencyData = agencySnap.data();
            
            // Commission computed based on agency tier bonus
            let totalRate = agencyData.commissionRate || 0.10;
            const tierConfig = AGENCY_TIERS[currentTier as keyof typeof AGENCY_TIERS] || AGENCY_TIERS.Junior;
            totalRate += tierConfig.commissionBonus;
            
            commission = totalCost * totalRate;
            
            const newMemberEarnings = (memberData.totalEarnings || 0) + totalCost;
            newMemberTier = getTierForEarnings(newMemberEarnings);

            // Compute dynamic parent Agency's commission Rate based on updated overall earnings
            const newAgencyEarnings = (agencyData.totalEarnings || 0) + commission;
            const newAgencyTier = getTierForEarnings(newAgencyEarnings);
            newAgencyCommissionRate = getAgencyCommissionRateForTier(newAgencyTier);
          }
        }
      }

      // 6. FAN CLUB CALCULATIONS (Intimacy)
      const intimacyGain = totalCost * 10;
      let newIntimacy = intimacyGain;
      let isNewJoinFanClub = true;

      if (fanClubMemberSnap.exists()) {
        const fm = fanClubMemberSnap.data();
        newIntimacy = (fm.intimacyPoints || 0) + intimacyGain;
        isNewJoinFanClub = false;
      }
      const fanClubLevel = getLevelFromPoints(newIntimacy);

      // 7. TREASURE CHEST PROGRESSION
      const treasureValue = gift.cost * quantity;
      let newTreasureProgress = treasureValue;
      let totalTreasureGifts = quantity;
      let treasureGoals = TREASURE_GOALS.map(g => ({ ...g, currentDiamonds: 0, isCompleted: false }));
      let completedTreasureGoal = null;

      if (treasureChestSnap.exists()) {
        const tc = treasureChestSnap.data();
        newTreasureProgress = (tc.currentProgress || 0) + treasureValue;
        totalTreasureGifts = (tc.totalGifts || 0) + quantity;
        if (tc.goals && Array.isArray(tc.goals)) {
          treasureGoals = tc.goals.map((g: any) => ({ ...g }));
        }
      }

      for (let i = 0; i < treasureGoals.length; i++) {
        const goal = treasureGoals[i];
        if (!goal.isCompleted && newTreasureProgress >= goal.targetDiamonds) {
          goal.isCompleted = true;
          completedTreasureGoal = goal;
        }
      }

      // 8. WRITE STAGE (MUTATIONS)
      // A. Update Sender Diamonds and Wealth level
      transaction.update(userRef, {
        diamonds: increment(-totalCost),
        totalDiamondsSpent: increment(totalCost),
        level: newWealthLvl
      });

      // B. Update Host Beans and general earnings
      transaction.set(hostRef, {
        beans: increment(totalCost),
        totalBeansEarned: increment(totalCost)
      }, { merge: true });

      // C. Update Room statistics & Active Shields
      const roomUpdates: any = {
        currentBeans: increment(totalCost),
        pkScore: increment(giftingPower)
      };

      if (newOpponentShieldAbsorbed !== currentOpponentShieldAbsorbed) {
        roomUpdates.pkOpponentShieldAbsorbed = newOpponentShieldAbsorbed;
      }

      if (activeTab === 'Shields') {
        const tier = gift.id as ShieldTier;
        const shield = PK_SHIELDS[tier];
        const endTime = new Date(Date.now() + shield.duration * 1000).toISOString();
        
        roomUpdates.pkShieldTier = tier;
        roomUpdates.pkShieldAbsorbed = 0;
        roomUpdates.pkShieldEndTime = endTime;
      }

      transaction.update(roomRef, roomUpdates);

      // D. Update Agency balances and progression if present
      if (isAgencyMember && agencyRef) {
        transaction.update(agencyRef, {
          totalEarnings: increment(commission),
          commissionRate: newAgencyCommissionRate
        });
        transaction.update(agencyMemberRef, {
          totalEarnings: increment(totalCost),
          commissionPaid: increment(commission),
          tier: newMemberTier
        });
      }

      // E. Update Sender Fan Club membership details
      transaction.set(fanClubMemberRef, {
        uid: senderUid,
        hostUid: hostUid,
        level: fanClubLevel,
        intimacyPoints: newIntimacy,
        lastCheckIn: Date.now(),
        isSuperFan: fanClubLevel >= 10
      }, { merge: true });

      // F. Update Room Treasure Basin Progress
      transaction.set(treasureChestRef, {
        currentProgress: newTreasureProgress,
        totalGifts: totalTreasureGifts,
        goals: treasureGoals,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      return {
        success: true,
        totalCost,
        giftingPower,
        newSenderDiamonds: senderDiamonds - totalCost,
        fanClubLevel,
        isNewJoinFanClub,
        treasureGoalCompleted: !!completedTreasureGoal,
        completedTreasureGoal,
        shieldAbsorbedValue
      };
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'giftingService/processGiftTransaction');
    throw error;
  }
};
