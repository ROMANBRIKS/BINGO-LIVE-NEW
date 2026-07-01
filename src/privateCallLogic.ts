import { UserProfile } from './types';

/**
 * 📞 PRIVATE CALL LOGIC
 * Handles private call requests and status.
 */

// 210 diamonds or 210 beans equals 1.00 USD.
// Half a dollar ($0.50) per minute for video calls = 105 diamonds/beans per minute.
// A quarter of a dollar ($0.25) per minute for audio calls = 52.5 (rounded to 52) diamonds/beans per minute.
export const PRIVATE_CALL_FEE_AUDIO = 52; // Diamonds per minute for audio
export const PRIVATE_CALL_FEE_VIDEO = 105; // Diamonds per minute for video

export const calculatePrivateCallCost = (durationInMinutes: number, type: 'audio' | 'video' = 'audio') => {
  const fee = type === 'video' ? PRIVATE_CALL_FEE_VIDEO : PRIVATE_CALL_FEE_AUDIO;
  return durationInMinutes * fee;
};

export const createPrivateCallRequest = (roomId: string, hostUid: string, viewer: UserProfile, type: 'audio' | 'video' = 'audio') => {
  const fee = type === 'video' ? PRIVATE_CALL_FEE_VIDEO : PRIVATE_CALL_FEE_AUDIO;
  return {
    roomId,
    hostUid,
    viewerUid: viewer.uid,
    viewerName: viewer.displayName,
    viewerPhoto: viewer.photoURL,
    status: 'pending' as const,
    type,
    fee,
    createdAt: new Date()
  };
};
