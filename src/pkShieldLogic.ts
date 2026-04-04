import type { ShieldTier } from './types';
export type { ShieldTier };

/**
 * 🛡️ PK SHIELD LOGIC
 * Strategic defense mechanism in PK Battles to absorb "damage" (opponent score).
 */

export interface PKShield {
  tier: ShieldTier;
  costBeans: number;
  absorptionRate: number; // Percentage of opponent's score to block (e.g., 0.5 = 50%)
  maxAbsorption: number; // Maximum points the shield can absorb before breaking
  duration: number; // Active duration in seconds
  color: string;
  glowColor: string;
}

export const PK_SHIELDS: Record<ShieldTier, PKShield> = {
  'Light': {
    tier: 'Light',
    costBeans: 1500,
    absorptionRate: 0.3, // Blocks 30% of incoming score
    maxAbsorption: 5000,
    duration: 10,
    color: '#4ade80', // Green
    glowColor: 'rgba(74, 222, 128, 0.5)',
  },
  'Standard': {
    tier: 'Standard',
    costBeans: 2500,
    absorptionRate: 0.5, // Blocks 50% of incoming score
    maxAbsorption: 15000,
    duration: 15,
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  'Heavy': {
    tier: 'Heavy',
    costBeans: 5000,
    absorptionRate: 0.7, // Blocks 70% of incoming score
    maxAbsorption: 50000,
    duration: 20,
    color: '#8b5cf6', // Purple
    glowColor: 'rgba(139, 92, 246, 0.5)',
  },
  'Emergency': {
    tier: 'Emergency',
    costBeans: 10000,
    absorptionRate: 1.0, // Blocks 100% of incoming score
    maxAbsorption: 100000,
    duration: 5, // Short but powerful
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
};

/**
 * 1. calculateShieldedScore
 * Calculates how much score actually passes through a shield.
 */
export const calculateShieldedScore = (
  incomingScore: number, 
  shield: PKShield, 
  currentAbsorbed: number
): { passedScore: number; newlyAbsorbed: number; isBroken: boolean } => {
  const potentialAbsorption = Math.min(
    incomingScore * shield.absorptionRate,
    shield.maxAbsorption - currentAbsorbed
  );

  const passedScore = incomingScore - potentialAbsorption;
  const newlyAbsorbed = currentAbsorbed + potentialAbsorption;
  const isBroken = newlyAbsorbed >= shield.maxAbsorption;

  return { passedScore, newlyAbsorbed, isBroken };
};

/**
 * 2. getShieldRemainingPercent
 * Helper to show shield "health" in the UI.
 */
export const getShieldRemainingPercent = (shield: PKShield, absorbed: number): number => {
  return Math.max(0, 100 - (absorbed / shield.maxAbsorption) * 100);
};
