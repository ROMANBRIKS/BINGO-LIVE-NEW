import { UserProfile } from './types';

/**
 * 📞 PRIVATE CALL LOGIC
 * Handles private call requests and status.
 */

export const PRIVATE_CALL_FEE = 100; // Diamonds per minute

export const calculatePrivateCallCost = (durationInMinutes: number) => {
  return durationInMinutes * PRIVATE_CALL_FEE;
};

export const createPrivateCallRequest = (roomId: string, hostUid: string, viewer: UserProfile) => {
  return {
    roomId,
    hostUid,
    viewerUid: viewer.uid,
    viewerName: viewer.displayName,
    viewerPhoto: viewer.photoURL,
    status: 'pending' as const,
    fee: PRIVATE_CALL_FEE,
    createdAt: new Date()
  };
};
