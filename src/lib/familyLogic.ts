/**
 * Family Progression Logic
 * Define tiers, levels, and point thresholds for families to climb.
 */

export interface RankInfo {
  tier: string;
  level: string; // e.g., 'III'
  currentPointsInLevel: number;
  pointsForNextLevel: number;
  totalPointsForThisLevel: number;
  progressPercent: number;
  globalLevel: number;
}

export const TIERS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'King'];
export const SUB_LEVELS = ['V', 'IV', 'III', 'II', 'I']; // Bingo uses V (lowest) to I (highest)

/**
 * Combat Points thresholds for each global level (1-35)
 * Tier 0 (Bronze): 1, 2, 3, 4, 5
 * Tier 1 (Silver): 6, 7, 8, 9, 10
 * Tier 2 (Gold): 11, 12, 13, 14, 15
 */
const BASE_XP = 50000;
const GROWTH_FACTOR = 1.45;

export const getThresholdForLevel = (level: number): number => {
  if (level <= 1) return 0;
  // Exponential scaling for a harder climb at higher levels
  return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, level - 1));
};

export const getFamilyRankInfo = (totalPoints: number): RankInfo => {
  let globalLevel = 1;
  while (totalPoints >= getThresholdForLevel(globalLevel + 1) && globalLevel < 35) {
    globalLevel++;
  }

  const currentThreshold = getThresholdForLevel(globalLevel);
  const nextThreshold = getThresholdForLevel(globalLevel + 1);
  
  const tierIndex = Math.floor((globalLevel - 1) / 5);
  const subLevelIndex = 4 - ((globalLevel - 1) % 5);
  
  const tier = TIERS[Math.min(tierIndex, TIERS.length - 1)];
  const level = SUB_LEVELS[subLevelIndex];

  const currentPointsInLevel = totalPoints - currentThreshold;
  const totalPointsForThisLevel = nextThreshold - currentThreshold;
  const progressPercent = (currentPointsInLevel / totalPointsForThisLevel) * 100;

  return {
    tier,
    level,
    currentPointsInLevel,
    pointsForNextLevel: nextThreshold,
    totalPointsForThisLevel,
    progressPercent: Math.min(progressPercent, 100),
    globalLevel
  };
};

/**
 * Monthly Target Logic
 * Usually based on the Family's current level or tier.
 */
export const getMonthlyTarget = (globalLevel: number): number => {
  const baseTarget = 100000;
  return Math.floor(baseTarget * Math.pow(1.25, globalLevel - 1));
};
