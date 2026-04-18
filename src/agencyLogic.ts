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
  Junior: { minEarnings: 0, commissionBonus: 0, label: 'Junior' },
  Senior: { minEarnings: 10000, commissionBonus: 0.02, label: 'Senior' },
  Elite: { minEarnings: 50000, commissionBonus: 0.05, label: 'Elite' },
  Master: { minEarnings: 200000, commissionBonus: 0.1, label: 'Master' },
};

export function getTierForEarnings(earnings: number): 'Junior' | 'Senior' | 'Elite' | 'Master' {
  if (earnings >= AGENCY_TIERS.Master.minEarnings) return 'Master';
  if (earnings >= AGENCY_TIERS.Elite.minEarnings) return 'Elite';
  if (earnings >= AGENCY_TIERS.Senior.minEarnings) return 'Senior';
  return 'Junior';
}

export async function calculateAgencyCommission(streamerUid: string, amount: number) {
  try {
    const memberDoc = await getDoc(doc(db, 'agency_members', streamerUid));
    if (!memberDoc.exists()) return 0;

    const memberData = memberDoc.data() as AgencyMember;
    const agencyDoc = await getDoc(doc(db, 'agencies', memberData.agencyId));
    if (!agencyDoc.exists()) return 0;

    const agencyData = agencyDoc.data() as Agency;
    
    // Base commission
    let totalRate = agencyData.commissionRate;
    
    // Add Tier Bonus
    const tierConfig = AGENCY_TIERS[memberData.tier];
    totalRate += tierConfig.commissionBonus;

    const commission = amount * totalRate;

    // Update agency earnings
    await updateDoc(doc(db, 'agencies', memberData.agencyId), {
      totalEarnings: increment(commission)
    });

    // Update member earnings and check for tier upgrade
    const newEarnings = (memberData.totalEarnings || 0) + amount;
    const newTier = getTierForEarnings(newEarnings);

    await updateDoc(doc(db, 'agency_members', streamerUid), {
      totalEarnings: increment(amount),
      commissionPaid: increment(commission),
      tier: newTier
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
