import { NobleTier, NOBLE_LEVELS } from './NobleTypes';
import { getUserNobleStatus, UserNobleStatus } from './nobleLogic';

/**
 * ⏰ NOBLE EXPIRATION SYSTEM
 * File: NobleExpirationSystem.ts
 * 
 * This system handles the 30-day renewal cycle and prepares 
 * alerts for the 7, 3, and 1-day marks.
 */

export interface ExpirationAlert {
  shouldAlert: boolean;
  message: string;
  daysRemaining: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Checks if a user needs a renewal reminder based on the BIGO 30-day rule.
 * @param status The current UserNobleStatus from NobleLogic.ts
 * @returns An ExpirationAlert object with the message and severity.
 */
export const checkExpirationAlerts = (status: UserNobleStatus): ExpirationAlert => {
  const { currentTier, daysRemaining, isExpired } = status;

  if (currentTier === 'None' || isExpired) {
    return {
      shouldAlert: false,
      message: '',
      daysRemaining: 0,
      severity: 'low'
    };
  }

  // BIGO Rule: Alerts at 7, 3, and 1 days
  let shouldAlert = false;
  let severity: 'low' | 'medium' | 'high' = 'low';
  let message = '';

  if (daysRemaining === 1) {
    shouldAlert = true;
    severity = 'high';
    message = `⚠️ Final Day! Your ${currentTier} status expires tomorrow. Renew now to keep your glossy perks!`;
  } else if (daysRemaining <= 3) {
    shouldAlert = true;
    severity = 'medium';
    message = `🔔 Your ${currentTier} status expires in ${daysRemaining} days. Don't lose your entrance animation!`;
  } else if (daysRemaining <= 7) {
    shouldAlert = true;
    severity = 'low';
    message = `ℹ️ Reminder: Your ${currentTier} status expires in ${daysRemaining} days. Renew to stay Noble.`;
  }

  return { shouldAlert, message, daysRemaining, severity };
};

/**
 * Calculates the diamonds needed to renew the current tier for another 30 days.
 * @param tier The user's current Noble tier.
 * @returns The diamond cost for renewal.
 */
export const getRenewalCost = (tier: NobleTier): number => {
  if (tier === 'None') return 0;
  // Usually, renewal is the same as the minimum requirement for that tier
  return NOBLE_LEVELS[tier].minDiamonds;
};

/**
 * Formats a display string for the expiration countdown.
 * @param daysRemaining Number of days left.
 * @returns A user-friendly countdown string.
 */
export const formatExpirationCountdown = (daysRemaining: number): string => {
  if (daysRemaining === 0) return 'Expires today';
  if (daysRemaining === 1) return 'Expires tomorrow';
  return `${daysRemaining} days left`;
};
