import { doc, getDoc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SVIP_TIERS, UserSVIPStatus, SVIPTier } from '../SVIPTypes';

export class SVIPManager {
  /**
   * Assigns an SVIP tier to a user and calculates all expiration dates.
   */
  static async assignSVIPTier(userId: string, tierName: string, durationDays: number): Promise<boolean> {
    const tier = SVIP_TIERS[tierName];
    if (!tier) throw new Error(`Invalid SVIP tier name: ${tierName}`);

    const activationDate = new Date();
    const expirationDate = new Date(activationDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const privilegeExpirations: Record<string, string> = {};
    if (tier.privilege_durations) {
      for (const [priv, days] of Object.entries(tier.privilege_durations)) {
        const privExp = new Date(activationDate.getTime() + days * 24 * 60 * 60 * 1000);
        privilegeExpirations[priv] = privExp.toISOString();
      }
    }

    const svipStatus: UserSVIPStatus = {
      tier: tierName,
      activationDate: activationDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      privilegeExpirations,
      status: 'active'
    };

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { svipStatus });
    
    return true;
  }

  /**
   * Retrieves the current SVIP status for a user, handling automatic expiration.
   */
  static async getUserSVIPInfo(userId: string): Promise<UserSVIPStatus | null> {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) return null;

    const data = userSnap.data();
    const svipStatus: UserSVIPStatus | undefined = data.svipStatus;

    if (!svipStatus || svipStatus.status === 'expired') return null;

    const now = new Date();
    const expirationDate = new Date(svipStatus.expirationDate);

    if (now > expirationDate) {
      await this.removeSVIPTier(userId);
      return null;
    }

    return svipStatus;
  }

  /**
   * Checks if a user has a specific privilege active.
   */
  static async hasPrivilege(userId: string, privilegeName: string): Promise<boolean> {
    const svipInfo = await this.getUserSVIPInfo(userId);
    if (!svipInfo) return false;

    const tier = SVIP_TIERS[svipInfo.tier];
    if (!tier) return false;

    // Check if the tier generally has this privilege
    const hasBasePrivilege = (tier.privileges as any)[privilegeName];
    if (!hasBasePrivilege) return false;

    // Check if it's a time-limited privilege
    const privExpStr = svipInfo.privilegeExpirations[privilegeName];
    if (privExpStr) {
      const now = new Date();
      const privExp = new Date(privExpStr);
      if (now > privExp) return false;
    }

    return true;
  }

  /**
   * Gets the diamond discount percentage for a user.
   */
  static async getDiamondDiscount(userId: string): Promise<number> {
    const svipInfo = await this.getUserSVIPInfo(userId);
    if (!svipInfo) return 0;

    const tier = SVIP_TIERS[svipInfo.tier];
    return tier ? tier.diamond_discount_percent : 0;
  }

  /**
   * Removes the SVIP status from a user.
   */
  static async removeSVIPTier(userId: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'svipStatus.status': 'expired'
    });
    return true;
  }
}
