import { doc, getDoc, updateDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Family, Room } from './types';

/**
 * Calculates the family contribution multiplier based on the current room state.
 * @param room The current room object, which may contain PK status.
 * @returns A multiplier (1.2x base, 1.5x during PK battles).
 */
export const getFamilyMultiplier = (room: Room | null): number => {
  if (!room) return 1.2;
  
  // PK Battle Multiplier: 1.5x
  if (room.pkStatus === 'battling' && room.pkEndTime) {
    const endTime = new Date(room.pkEndTime).getTime();
    if (endTime > Date.now()) {
      return 1.5;
    }
  }
  
  // Base Multiplier: 1.2x
  return 1.2;
};

/**
 * Calculates the final points to be contributed to the family pool.
 * @param basePoints The original points (usually diamond cost).
 * @param room The current room object.
 * @returns The multiplied points.
 */
export const calculateFamilyContribution = (basePoints: number, room: Room | null): number => {
  const multiplier = getFamilyMultiplier(room);
  return Math.floor(basePoints * multiplier);
};

export async function calculateFamilyBonuses(familyId: string, pkScore: number) {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (!familyDoc.exists()) return 0;

    const familyData = familyDoc.data() as Family;
    // Family level bonus: 1% per level
    const bonusMultiplier = 1 + (familyData.level * 0.01);
    return Math.floor(pkScore * bonusMultiplier);
  } catch (error) {
    console.error("Error calculating family bonuses:", error);
    return pkScore;
  }
}

export async function contributeToFamily(uid: string, familyId: string, amount: number) {
  try {
    // Update family total points
    await updateDoc(doc(db, 'families', familyId), {
      totalDiamondsSpent: increment(amount)
    });

    // Update member contribution
    const memberRef = doc(db, `families/${familyId}/members`, uid);
    
    // Fetch profile fallback details just in case document doesn't exist yet
    const userSnap = await getDoc(doc(db, 'users', uid)).catch(() => null);
    const userData = userSnap?.exists() ? userSnap.data() : null;

    await setDoc(memberRef, {
      uid,
      displayName: userData?.displayName || 'Member',
      photoURL: userData?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
      role: 'member',
      joinedAt: serverTimestamp(),
      contributionPoints: increment(amount)
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error contributing to family:", error);
    return false;
  }
}

export async function checkFamilyDailyCheckIn(uid: string, familyId: string) {
  try {
    const memberRef = doc(db, `families/${familyId}/members`, uid);
    const memberDoc = await getDoc(memberRef);
    
    if (memberDoc.exists()) {
      const data = memberDoc.data();
      const lastCheckIn = data.lastCheckIn?.toDate ? data.lastCheckIn.toDate() : (data.lastCheckIn ? new Date(data.lastCheckIn) : null);
      const today = new Date();
      
      if (!lastCheckIn || lastCheckIn.toDateString() !== today.toDateString()) {
        await updateDoc(memberRef, {
          lastCheckIn: serverTimestamp(),
          contributionPoints: increment(50) // Daily check-in reward
        });
        return { success: true, reward: 50 };
      }
    }
    return { success: false, message: "Already checked in today!" };
  } catch (error) {
    console.error("Error in family check-in:", error);
    return { success: false, message: "Check-in failed." };
  }
}
