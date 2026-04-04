import { Room, PKForfeit, ForfeitType } from './types';

/**
 * ⚔️ PK ENHANCED LOGIC
 * This utility adds high-stakes competitive features: Snipe Windows and Forfeit Consequences.
 */

/**
 * 1. isSnipeWindow
 * Checks if the PK is in the "Snipe" phase (e.g., the last 30-60 seconds).
 * During this time, gifting power is often boosted to encourage last-minute competition.
 */
export const isSnipeWindow = (pkEndTime: string, windowSeconds: number = 60): boolean => {
  const end = new Date(pkEndTime).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  
  return diff > 0 && diff <= windowSeconds * 1000;
};

/**
 * 2. getSnipeMultiplier
 * Returns a score multiplier during the Snipe window.
 */
export const getSnipeMultiplier = (pkEndTime: string): number => {
  return isSnipeWindow(pkEndTime) ? 1.5 : 1.0;
};

/**
 * 3. generateRandomForfeit
 * Selects a random forfeit for the losing streamer.
 */
export const generateRandomForfeit = (): PKForfeit => {
  const forfeits: PKForfeit[] = [
    { id: '1', type: 'Pushups', description: 'Do 10 Pushups', duration: 60 },
    { id: '2', type: 'Sing a Song', description: 'Sing a 30-second song', duration: 30 },
    { id: '3', type: 'Dance', description: 'Perform a victory/loss dance', duration: 45 },
    { id: '4', type: 'Funny Face', description: 'Make a funny face for 15 seconds', duration: 15 },
    { id: '5', type: 'Shoutout', description: 'Give a 1-minute shoutout to the winner', duration: 60 },
  ];
  
  const randomIndex = Math.floor(Math.random() * forfeits.length);
  return forfeits[randomIndex];
};

/**
 * 4. calculateFinalPKResult
 * Determines the winner and assigns a forfeit.
 */
export const calculateFinalPKResult = (room: Room): {
  winnerUid: string | null;
  loserUid: string | null;
  forfeit: PKForfeit | null;
  isDraw: boolean;
} => {
  const score = room.pkScore || 0;
  const oppScore = room.pkOpponentScore || 0;
  
  if (score === oppScore) {
    return { winnerUid: null, loserUid: null, forfeit: null, isDraw: true };
  }
  
  const isHostWinner = score > oppScore;
  return {
    winnerUid: isHostWinner ? room.hostUid : room.pkOpponentUid || 'opponent',
    loserUid: isHostWinner ? room.pkOpponentUid || 'opponent' : room.hostUid,
    forfeit: generateRandomForfeit(),
    isDraw: false
  };
};
