/**
 * 💖 FAN CLUB LOGIC
 * Manages the social bonding system between streamers and their top supporters.
 */

export interface FanClubMember {
  uid: string;
  hostUid: string;
  level: number;
  intimacyPoints: number;
  lastCheckIn: number; // Timestamp
  isSuperFan: boolean;
}

export interface FanClubLevel {
  level: number;
  pointsRequired: number;
  badgeColor: string;
  perks: string[];
}

/**
 * 1. FAN CLUB LEVELS CONFIG
 * Defines the progression and rewards for each tier.
 */
export const FAN_CLUB_LEVELS: FanClubLevel[] = [
  { level: 1, pointsRequired: 0, badgeColor: '#94a3b8', perks: ['Basic Badge'] },
  { level: 10, pointsRequired: 5000, badgeColor: '#4ade80', perks: ['Green Badge', 'Chat Highlight'] },
  { level: 30, pointsRequired: 50000, badgeColor: '#3b82f6', perks: ['Blue Badge', 'Priority Queue'] },
  { level: 60, pointsRequired: 250000, badgeColor: '#a855f7', perks: ['Purple Badge', 'Exclusive Emotes'] },
  { level: 90, pointsRequired: 1000000, badgeColor: '#f59e0b', perks: ['Gold Badge', 'Super Fan Entrance'] },
];

/**
 * 2. calculateIntimacyPoints
 * Logic for earning points through various interactions.
 */
export const calculateIntimacyPoints = (type: 'gifting' | 'watching' | 'checkin', value: number = 0): number => {
  switch (type) {
    case 'gifting':
      // 10 points per diamond gifted
      return value * 10;
    case 'watching':
      // 5 points per minute watched
      return Math.floor(value / 60) * 5;
    case 'checkin':
      // 100 points for daily check-in
      return 100;
    default:
      return 0;
  }
};

/**
 * 3. getLevelFromPoints
 * Determines the fan club level based on total intimacy points.
 */
export const getLevelFromPoints = (points: number): number => {
  // Simple square root curve for leveling
  return Math.floor(Math.sqrt(points / 50)) + 1;
};

/**
 * 4. getBadgeStyle
 * Returns the color and label for the fan club badge based on level.
 */
export const getBadgeStyle = (level: number): { color: string; label: string } => {
  const tier = [...FAN_CLUB_LEVELS].reverse().find(l => level >= l.level) || FAN_CLUB_LEVELS[0];
  return {
    color: tier.badgeColor,
    label: `FAN ${level}`
  };
};
