/**
 * 💰 WEALTH LEVEL LOGIC
 * Calculates user levels (1-119) based on total diamonds spent.
 * The curve is exponential, making higher levels significantly harder to reach.
 */

import { WEALTH_LEVELS } from './constants/wealthLevels';

export const MAX_WEALTH_LEVEL = 119;

/**
 * Calculates the level based on total diamonds spent.
 * Uses the pre-calculated WEALTH_LEVELS array from the mapping file.
 */
export const calculateWealthLevel = (totalDiamondsSpent: number): number => {
  if (totalDiamondsSpent < WEALTH_LEVELS[1]) return 0;
  
  // Find the highest level where the requirement is met
  for (let i = WEALTH_LEVELS.length - 1; i >= 0; i--) {
    if (totalDiamondsSpent >= WEALTH_LEVELS[i]) {
      return i;
    }
  }
  
  return 0;
};

/**
 * Gets the total diamonds required to reach a specific level.
 */
export const getDiamondsForLevel = (level: number): number => {
  const safeLevel = Math.min(MAX_WEALTH_LEVEL, Math.max(0, level));
  return WEALTH_LEVELS[safeLevel];
};

/**
 * Gets the VIP tier (1-6) based on the wealth level.
 * Ranges:
 * V1: 1-9
 * V2: 10-29
 * V3: 30-49
 * V4: 50-59
 * V5: 60-89
 * V6: 90-119
 */
export const getVIPTier = (level: number): number => {
  if (level <= 0) return 0;
  if (level >= 90) return 6;
  if (level >= 60) return 5;
  if (level >= 50) return 4;
  if (level >= 30) return 3;
  if (level >= 10) return 2;
  return 1;
};
