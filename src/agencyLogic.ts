import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Agency {
  id: string;
  name: string;
  ownerUid: string;
  commissionRate: number; // 0-1 (e.g. 0.1 for 10%)
  memberCount: number;
  totalEarnings: number;
  createdAt: any;
}

export interface AgencyMember {
  uid: string;
  agencyId: string;
  joinedAt: any;
  totalEarnings: number;
  commissionPaid: number;
  tier: 'Junior' | 'Senior' | 'Elite' | 'Master';
}

export const AGENCY_TIERS = {
  Junior: { minEarnings: 0, commissionBonus: 0 },
  Senior: { minEarnings: 10000, commissionBonus: 0.02 },
  Elite: { minEarnings: 50000, commissionBonus: 0.05 },
  Master: { minEarnings: 200000, commissionBonus: 0.1 },
};

export async function calculateAgencyCommission(streamerUid: string, amount: number) {
  try {
    const memberDoc = await getDoc(doc(db, 'agency_members', streamerUid));
    if (!memberDoc.exists()) return 0;

    const memberData = memberDoc.data() as AgencyMember;
    const agencyDoc = await getDoc(doc(db, 'agencies', memberData.agencyId));
    if (!agencyDoc.exists()) return 0;

    const agencyData = agencyDoc.data() as Agency;
    const commission = amount * agencyData.commissionRate;

    // Update agency earnings
    await updateDoc(doc(db, 'agencies', memberData.agencyId), {
      totalEarnings: increment(commission)
    });

    // Update member commission paid
    await updateDoc(doc(db, 'agency_members', streamerUid), {
      commissionPaid: increment(commission)
    });

    return commission;
  } catch (error) {
    console.error("Error calculating agency commission:", error);
    return 0;
  }
}

export async function recruitStreamer(agencyId: string, streamerUid: string) {
  try {
    await setDoc(doc(db, 'agency_members', streamerUid), {
      agencyId,
      joinedAt: serverTimestamp(),
      totalEarnings: 0,
      commissionPaid: 0,
      tier: 'Junior'
    });

    await updateDoc(doc(db, 'agencies', agencyId), {
      memberCount: increment(1)
    });

    return true;
  } catch (error) {
    console.error("Error recruiting streamer:", error);
    return false;
  }
}
