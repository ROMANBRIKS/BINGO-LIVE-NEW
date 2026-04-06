import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Family, FamilyMember } from './types';

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
      totalPoints: increment(amount)
    });

    // Update member contribution
    const memberRef = doc(db, `families/${familyId}/members`, uid);
    await updateDoc(memberRef, {
      contributionPoints: increment(amount)
    });

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
      const lastCheckIn = data.lastCheckIn?.toDate();
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
