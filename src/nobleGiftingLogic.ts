import { UserProfile } from './types';
import { NOBLE_LEVELS, NobleTier } from './NobleTypes';

/**
 * 👑 NOBLE GIFTING LOGIC
 * This utility applies gifting power multipliers and visual effects based on the user's Noble tier.
 */

/**
 * 1. calculateGiftingPower
 * Takes a gift's base value and multiplies it by the user's Noble boost.
 * @param baseValue - The original diamond/point value of the gift
 * @param user - The UserProfile of the sender
 * @returns The final "weight" or power of the gift in PK battles/scoring
 */
export const calculateGiftingPower = (baseValue: number, user: UserProfile): number => {
  const nobleTier: NobleTier = user.nobleTitle || 'None';
  const levelData = NOBLE_LEVELS[nobleTier];
  
  if (!levelData) return baseValue;
  
  // Apply the multiplier (e.g., 1.5x for King, 3.0x for Global God)
  return Math.floor(baseValue * levelData.giftingPowerBoost);
};

/**
 * 2. getGiftingEffect
 * Logic to determine if a gift should have extra "sparkle" or "shine" animations 
 * based on the user's rank. Higher tiers unlock more premium visual effects.
 */
export const getGiftingEffect = (user: UserProfile): { 
  hasSparkle: boolean; 
  hasShine: boolean; 
  effectColor: string;
} => {
  const nobleTier: NobleTier = user.nobleTitle || 'None';
  const levelData = NOBLE_LEVELS[nobleTier];

  return {
    // Sparkle unlocked at Grand Duke (Rank 3) and above
    hasSparkle: levelData.rank >= 3,
    // Shine unlocked at King (Rank 5) and above
    hasShine: levelData.rank >= 5,
    effectColor: levelData.color
  };
};

/**
 * 3. formatPowerDisplay
 * A helper to show users their current boost (e.g., "+50% Power") in the gifting UI.
 */
export const formatPowerDisplay = (user: UserProfile): string => {
  const nobleTier: NobleTier = user.nobleTitle || 'None';
  const levelData = NOBLE_LEVELS[nobleTier];
  
  if (!levelData || levelData.giftingPowerBoost <= 1) {
    return "";
  }

  const percentage = Math.round((levelData.giftingPowerBoost - 1) * 100);
  return `+${percentage}% Power`;
};
