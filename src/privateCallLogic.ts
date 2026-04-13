import { UserProfile } from './types';

/**
 * 📞 PRIVATE CALL LOGIC
 * Handles private call requests and status.
 */

export const PRIVATE_CALL_FEE_AUDIO = 100; // Diamonds per minute for audio
export const PRIVATE_CALL_FEE_VIDEO = 250; // Diamonds per minute for video

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
