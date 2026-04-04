/**
 * 👑 NOBLE SYSTEM TYPES
 * Defines the tiers, requirements, and visual properties for the VIP Noble system.
 */

export type NobleTier = 
  | 'None'
  | 'Baron' 
  | 'Duke' 
  | 'Grand Duke' 
  | 'Archduke' 
  | 'King' 
  | 'Emperor' 
  | 'Global God';

export interface NobleLevel {
  tier: NobleTier;
  rank: number;
  minDiamonds: number;
  color: string;
  glowColor: string;
  badgeIcon: string;
  entranceDuration: number; // in seconds
  hasPremiumFrame: boolean;
  giftingPowerBoost: number; // multiplier
}

export const NOBLE_LEVELS: Record<NobleTier, NobleLevel> = {
  'None': {
    tier: 'None',
    rank: 0,
    minDiamonds: 0,
    color: '#9ca3af',
    glowColor: 'transparent',
    badgeIcon: '',
    entranceDuration: 0,
    hasPremiumFrame: false,
    giftingPowerBoost: 1
  },
  'Baron': {
    tier: 'Baron',
    rank: 1,
    minDiamonds: 1000,
    color: '#cd7f32', // Bronze/Copper
    glowColor: 'rgba(205, 127, 50, 0.4)',
    badgeIcon: '🛡️',
    entranceDuration: 5,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.05
  },
  'Duke': {
    tier: 'Duke',
    rank: 2,
    minDiamonds: 30000,
    color: '#c0c0c0', // Silver
    glowColor: 'rgba(192, 192, 192, 0.5)',
    badgeIcon: '⚔️',
    entranceDuration: 10,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.1
  },
  'Grand Duke': {
    tier: 'Grand Duke',
    rank: 3,
    minDiamonds: 60000,
    color: '#ffd700', // Gold
    glowColor: 'rgba(255, 215, 0, 0.6)',
    badgeIcon: '🎖️',
    entranceDuration: 15,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.2
  },
  'Archduke': {
    tier: 'Archduke',
    rank: 4,
    minDiamonds: 120000,
    color: '#e5e4e2', // Platinum
    glowColor: 'rgba(229, 228, 226, 0.7)',
    badgeIcon: '🏅',
    entranceDuration: 25,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.3
  },
  'King': {
    tier: 'King',
    rank: 5,
    minDiamonds: 500000,
    color: '#ff4d4f', // Royal Red
    glowColor: 'rgba(255, 77, 79, 0.8)',
    badgeIcon: '👑',
    entranceDuration: 30,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.5
  },
  'Emperor': {
    tier: 'Emperor',
    rank: 6,
    minDiamonds: 1000000,
    color: '#722ed1', // Imperial Purple
    glowColor: 'rgba(114, 46, 209, 0.9)',
    badgeIcon: '💎',
    entranceDuration: 40,
    hasPremiumFrame: true,
    giftingPowerBoost: 2.0
  },
  'Global God': {
    tier: 'Global God',
    rank: 7,
    minDiamonds: 3000000,
    color: '#00d8ff', // Celestial Blue
    glowColor: 'rgba(0, 216, 255, 1)',
    badgeIcon: '🌌',
    entranceDuration: 60,
    hasPremiumFrame: true,
    giftingPowerBoost: 3.0
  }
};
