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

  const data = (await getDoc(chestRef)).data();
  if (!data) return { goalCompleted: false };

  const newProgress = (data.currentProgress || 0) + totalValue;
  const updatedGoals = [...data.goals];
  let completedGoal: TreasureGoal | null = null;

  for (let i = 0; i < updatedGoals.length; i++) {
    const goal = updatedGoals[i];
    if (!goal.isCompleted && newProgress >= goal.targetDiamonds) {
      goal.isCompleted = true;
      completedGoal = goal;
      // In a real app, you'd distribute rewards here
    }
  }

  await updateDoc(chestRef, {
    currentProgress: newProgress,
    totalGifts: increment(quantity),
    goals: updatedGoals,
    lastUpdated: serverTimestamp()
  });

  return {
    goalCompleted: !!completedGoal,
    completedGoal,
    newProgress
  };
};
