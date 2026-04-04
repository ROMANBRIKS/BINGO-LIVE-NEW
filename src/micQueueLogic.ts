import { UserProfile, GuestSeat, MicRequest } from './types';

/**
 * 🎙️ MIC QUEUE LOGIC
 * This utility manages the multi-guest system, allowing up to 12 participants 
 * to join a room via audio or video.
 */

/**
 * 1. initializeSeats
 * Creates an array of 12 empty seats for a new multi-guest room.
 */
export const initializeSeats = (totalSeats: number = 12): GuestSeat[] => {
  return Array.from({ length: totalSeats }, (_, i) => ({
    seatId: i + 1,
    uid: null,
    status: 'empty',
    type: 'audio',
    isMuted: false,
  }));
};

/**
 * 2. handleMicRequest
 * Adds a user to the request queue.
 */
export const handleMicRequest = (
  currentQueue: MicRequest[], 
  user: UserProfile, 
  type: 'audio' | 'video'
): MicRequest[] => {
  // Check if user is already in the queue
  if (currentQueue.some(req => req.uid === user.uid)) return currentQueue;

  const newRequest: MicRequest = {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    timestamp: Date.now(),
    type: type,
    nobleTier: user.nobleTitle,
  };

  return [...currentQueue, newRequest];
};

/**
 * 3. assignSeat
 * Assigns a user from the queue to an available seat.
 */
export const assignSeat = (
  seats: GuestSeat[], 
  seatId: number, 
  userUid: string,
  type: 'audio' | 'video'
): GuestSeat[] => {
  return seats.map(seat => {
    if (seat.seatId === seatId) {
      return {
        ...seat,
        uid: userUid,
        status: 'occupied',
        type: type,
        isMuted: false,
      };
    }
    return seat;
  });
};

/**
 * 4. removeGuest
 * Removes a guest from a seat and makes it empty.
 */
export const removeGuest = (seats: GuestSeat[], seatId: number): GuestSeat[] => {
  return seats.map(seat => {
    if (seat.seatId === seatId) {
      return {
        ...seat,
        uid: null,
        status: 'empty',
        isMuted: false,
      };
    }
    return seat;
  });
};

/**
 * 5. toggleMute
 * Toggles the mute status of a guest in a seat.
 */
export const toggleMute = (seats: GuestSeat[], seatId: number): GuestSeat[] => {
  return seats.map(seat => {
    if (seat.seatId === seatId) {
      return {
        ...seat,
        isMuted: !seat.isMuted,
      };
    }
    return seat;
  });
};
