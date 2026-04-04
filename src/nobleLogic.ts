import { NobleTier, NOBLE_LEVELS } from './NobleTypes';
/**
🧠 NOBLE SYSTEM LOGIC
This file handles the "brain" of the Noble system:
calculating tiers, checking expiration, and finding next levels.
*/
export interface UserNobleStatus {
currentTier: NobleTier;
nextTier: NobleTier | null;
diamondsNeededForNext: number;
daysRemaining: number;
isExpired: boolean;
}
/**
Calculates a user's Noble tier based on their total diamond spending.
@param totalDiamondsSpent The user's lifetime or monthly diamond spend.
@returns The highest NobleTier they qualify for.
*/
export const calculateNobleTier = (totalDiamondsSpent: number): NobleTier => {
const tiers: NobleTier[] = [
'Global God',
'Emperor',
'King',
'Archduke',
'Grand Duke',
'Duke',
'Baron'
];
for (const tier of tiers) {
if (totalDiamondsSpent >= NOBLE_LEVELS[tier].minDiamonds) {
return tier;
}
}
return 'None';
};
/**
Gets the detailed Noble status for a user.
@param totalDiamondsSpent The user's current spend.
@param lastPurchaseDate The date of their last diamond purchase or tier renewal.
@returns A UserNobleStatus object with all the logic.
*/
export const getUserNobleStatus = (
totalDiamondsSpent: number,
lastPurchaseDate: Date
): UserNobleStatus => {
const currentTier = calculateNobleTier(totalDiamondsSpent);
// Expiration Logic (BIGO Rule: 30-day cycle)
const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
const now = new Date();
const timeSinceLastPurchase = now.getTime() - lastPurchaseDate.getTime();
const daysRemaining = Math.max(0, Math.floor((thirtyDaysInMs - timeSinceLastPurchase) / (1000 * 60 * 60 * 24)));
const isExpired = timeSinceLastPurchase > thirtyDaysInMs;
// Next Tier Logic
const tierList: NobleTier[] = ['None', 'Baron', 'Duke', 'Grand Duke', 'Archduke', 'King', 'Emperor', 'Global God'];
const currentIndex = tierList.indexOf(currentTier);
const nextTier = currentIndex < tierList.length - 1 ? tierList[currentIndex + 1] : null;
let diamondsNeededForNext = 0;
if (nextTier) {
diamondsNeededForNext = Math.max(0, NOBLE_LEVELS[nextTier].minDiamonds - totalDiamondsSpent);
}
return {
currentTier: isExpired ? 'None' : currentTier,
nextTier,
diamondsNeededForNext,
daysRemaining,
isExpired
};
};
/**
Checks if a user has specific Noble perks.
@param tier The user's current Noble tier.
@param perk The perk to check for.
@returns boolean
*/
export const hasNoblePerk = (tier: NobleTier, perk: 'entranceAnimation' | 'premiumFrame' | 'giftingBoost'): boolean => {
if (tier === 'None') return false;
const level = NOBLE_LEVELS[tier];
switch (perk) {
case 'entranceAnimation': return level.entranceDuration > 0;
case 'premiumFrame': return level.hasPremiumFrame;
case 'giftingBoost': return level.giftingPowerBoost > 1;
default: return false;
}
};
