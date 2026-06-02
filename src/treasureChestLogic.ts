import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface TreasureGoal {
  id: string;
  targetDiamonds: number;
  currentDiamonds: number;
  rewardName: string;
  rewardValue: number;
  isCompleted: boolean;
}

export const TREASURE_GOALS: Omit<TreasureGoal, 'currentDiamonds' | 'isCompleted'>[] = [
  { id: 'goal_1', targetDiamonds: 1000, rewardName: 'Bronze Chest', rewardValue: 100 },
  { id: 'goal_2', targetDiamonds: 5000, rewardName: 'Silver Chest', rewardValue: 500 },
  { id: 'goal_3', targetDiamonds: 20000, rewardName: 'Gold Chest', rewardValue: 2500 },
  { id: 'goal_4', targetDiamonds: 100000, rewardName: 'Diamond Chest', rewardValue: 15000 },
];

export const initializeTreasureChest = async (roomId: string) => {
  const chestRef = doc(db, 'rooms', roomId, 'features', 'treasureChest');
  const chestSnap = await getDoc(chestRef);

  if (!chestSnap.exists()) {
    await setDoc(chestRef, {
      currentProgress: 0,
      totalGifts: 0,
      goals: TREASURE_GOALS.map(g => ({ ...g, currentDiamonds: 0, isCompleted: false })),
      lastUpdated: serverTimestamp()
    });
  }
};

export const updateTreasureProgress = async (roomId: string, giftCost: number, quantity: number) => {
  const totalValue = giftCost * quantity;
  const chestRef = doc(db, 'rooms', roomId, 'features', 'treasureChest');
  
  const chestSnap = await getDoc(chestRef);
  if (!chestSnap.exists()) {
    await initializeTreasureChest(roomId);
  }

  const freshSnap = await getDoc(chestRef);
  const data = freshSnap.data();
  if (!data) return { goalCompleted: false };

  const newProgress = (data.currentProgress || 0) + totalValue;
  const updatedGoals = [...data.goals];
  let completedGoal: any | null = null;

  let claimActive = data.claimActive || false;
  let claimEndsAt = data.claimEndsAt || null;
  let remainingPrizes = data.remainingPrizes || 0;
  let claimedUsers = data.claimedUsers || [];
  let prizePoolValue = data.prizePoolValue || 0;
  let activeChestId = data.activeChestId || '';

  for (let i = 0; i < updatedGoals.length; i++) {
    const goal = updatedGoals[i];
    if (!goal.isCompleted && newProgress >= goal.targetDiamonds) {
      goal.isCompleted = true;
      completedGoal = goal;
      
      claimActive = true;
      claimEndsAt = Date.now() + 60 * 1000; // 60 seconds grab countdown
      remainingPrizes = 20; // Up to 20 users can join
      claimedUsers = [];
      prizePoolValue = goal.rewardValue;
      activeChestId = goal.id;
    }
  }

  const updatePayload: any = {
    currentProgress: newProgress,
    totalGifts: increment(quantity),
    goals: updatedGoals,
    lastUpdated: serverTimestamp()
  };

  if (completedGoal) {
    updatePayload.claimActive = claimActive;
    updatePayload.claimEndsAt = claimEndsAt;
    updatePayload.remainingPrizes = remainingPrizes;
    updatePayload.claimedUsers = claimedUsers;
    updatePayload.prizePoolValue = prizePoolValue;
    updatePayload.activeChestId = activeChestId;
  }

  await updateDoc(chestRef, updatePayload);

  return {
    goalCompleted: !!completedGoal,
    completedGoal,
    newProgress
  };
};

import { runTransaction } from 'firebase/firestore';

export const claimTreasureLuckyPack = async (roomId: string, userUid: string, userDisplayName: string) => {
  const chestRef = doc(db, 'rooms', roomId, 'features', 'treasureChest');
  const userRef = doc(db, 'users', userUid);

  try {
    return await runTransaction(db, async (transaction) => {
      const chestSnap = await transaction.get(chestRef);
      if (!chestSnap.exists()) throw new Error('Treasure chest is not active');
      
      const chestData = chestSnap.data();
      if (!chestData.claimActive) throw new Error('Claim session has already ended or is not active');
      
      const now = Date.now();
      const endsAt = chestData.claimEndsAt;
      if (endsAt && now > endsAt) {
        transaction.update(chestRef, { claimActive: false });
        throw new Error('Chest claim countdown has ended');
      }

      const claimedIds = chestData.claimedUsers || [];
      if (claimedIds.includes(userUid)) {
        throw new Error('You have already claimed a lucky pack from this chest!');
      }

      const left = chestData.remainingPrizes || 0;
      if (left <= 0) {
        transaction.update(chestRef, { claimActive: false });
        throw new Error('All lucky packs from this chest have been claimed!');
      }

      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User account not found');

      // Generate random coin reward: 20 to 100 free play coins for bets
      const randomCoinReward = Math.floor(Math.random() * 81) + 20;

      const updatedClaimed = [...claimedIds, userUid];
      const isStillActive = left - 1 > 0;

      transaction.update(chestRef, {
        remainingPrizes: left - 1,
        claimedUsers: updatedClaimed,
        claimActive: isStillActive
      });

      transaction.update(userRef, {
        coins: increment(randomCoinReward)
      });

      // Write direct system notification inside chat log
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        uid: 'system',
        displayName: 'TREASURE',
        text: `🎉 ${userDisplayName} grabbed a Chest Lucky Pack and earned 🪙 ${randomCoinReward} Coins!`,
        timestamp: serverTimestamp(),
        type: 'chat',
        level: 1
      });

      return { success: true, reward: randomCoinReward };
    });
  } catch (error: any) {
    console.warn("Claim pack error:", error.message);
    return { success: false, error: error.message };
  }
};
