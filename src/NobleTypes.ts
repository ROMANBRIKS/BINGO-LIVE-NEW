/**
 * 👑 NOBLE SYSTEM TYPES
 * Defines the tiers, requirements, and visual properties for the VIP Noble system.
 */

export type NobleTier = 
  | 'None'
  | 'Knight'
  | 'Viscount'
  | 'Earl'
  | 'Marquis'
  | 'Baron'
  | 'Viscount Elite'
  | 'Earl Elite'
  | 'Duke'
  | 'Grand Duke'
  | 'Archduke'
  | 'Prince'
  | 'Crown Prince'
  | 'King'
  | 'Emperor'
  | 'Great Emperor'
  | 'Legendary Emperor'
  | 'Supreme Emperor'
  | 'Overlord'
  | 'Demi-God'
  | 'God of War'
  | 'Celestial God'
  | 'Global God';

export interface NobleLevel {
  tier: NobleTier;
  femaleTitle?: string;
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
  'Knight': {
    tier: 'Knight',
    femaleTitle: 'Dame',
    rank: 1,
    minDiamonds: 7000,
    color: '#cd7f32',
    glowColor: 'rgba(205, 127, 50, 0.3)',
    badgeIcon: '🛡️',
    entranceDuration: 5,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.02
  },
  'Viscount': {
    tier: 'Viscount',
    femaleTitle: 'Viscountess',
    rank: 2,
    minDiamonds: 17000,
    color: '#b87333',
    glowColor: 'rgba(184, 115, 51, 0.3)',
    badgeIcon: '🗡️',
    entranceDuration: 5,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.04
  },
  'Earl': {
    tier: 'Earl',
    femaleTitle: 'Countess',
    rank: 3,
    minDiamonds: 31000,
    color: '#a0522d',
    glowColor: 'rgba(160, 82, 45, 0.3)',
    badgeIcon: '🏹',
    entranceDuration: 5,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.06
  },
  'Marquis': {
    tier: 'Marquis',
    femaleTitle: 'Marchioness',
    rank: 4,
    minDiamonds: 60000,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    badgeIcon: '🔱',
    entranceDuration: 8,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.08
  },
  'Baron': {
    tier: 'Baron',
    femaleTitle: 'Baroness',
    rank: 5,
    minDiamonds: 120000,
    color: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.4)',
    badgeIcon: '🏰',
    entranceDuration: 8,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.10
  },
  'Viscount Elite': {
    tier: 'Viscount Elite',
    femaleTitle: 'Viscountess Elite',
    rank: 6,
    minDiamonds: 180000,
    color: '#1d4ed8',
    glowColor: 'rgba(29, 78, 216, 0.4)',
    badgeIcon: '⚔️',
    entranceDuration: 8,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.12
  },
  'Earl Elite': {
    tier: 'Earl Elite',
    femaleTitle: 'Countess Elite',
    rank: 7,
    minDiamonds: 240000,
    color: '#1e40af',
    glowColor: 'rgba(30, 64, 175, 0.4)',
    badgeIcon: '🦅',
    entranceDuration: 8,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.15
  },
  'Duke': {
    tier: 'Duke',
    femaleTitle: 'Duchess',
    rank: 8,
    minDiamonds: 300000,
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    badgeIcon: '👑',
    entranceDuration: 12,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.20
  },
  'Grand Duke': {
    tier: 'Grand Duke',
    femaleTitle: 'Grand Duchess',
    rank: 9,
    minDiamonds: 450000,
    color: '#ffcc00',
    glowColor: 'rgba(255, 204, 0, 0.5)',
    badgeIcon: '🎖️',
    entranceDuration: 12,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.25
  },
  'Archduke': {
    tier: 'Archduke',
    femaleTitle: 'Archduchess',
    rank: 10,
    minDiamonds: 630000,
    color: '#ffb700',
    glowColor: 'rgba(255, 183, 0, 0.5)',
    badgeIcon: '🏅',
    entranceDuration: 15,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.30
  },
  'Prince': {
    tier: 'Prince',
    femaleTitle: 'Princess',
    rank: 11,
    minDiamonds: 660000,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    badgeIcon: '🤴',
    entranceDuration: 20,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.40
  },
  'Crown Prince': {
    tier: 'Crown Prince',
    femaleTitle: 'Crown Princess',
    rank: 12,
    minDiamonds: 810000,
    color: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.6)',
    badgeIcon: '💍',
    entranceDuration: 20,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.50
  },
  'King': {
    tier: 'King',
    femaleTitle: 'Queen',
    rank: 13,
    minDiamonds: 930000,
    color: '#7e22ce',
    glowColor: 'rgba(126, 34, 206, 0.6)',
    badgeIcon: '👑',
    entranceDuration: 25,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.60
  },
  'Emperor': {
    tier: 'Emperor',
    femaleTitle: 'Empress',
    rank: 14,
    minDiamonds: 965000,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    badgeIcon: '💎',
    entranceDuration: 30,
    hasPremiumFrame: true,
    giftingPowerBoost: 1.80
  },
  'Great Emperor': {
    tier: 'Great Emperor',
    femaleTitle: 'Great Empress',
    rank: 15,
    minDiamonds: 1210000,
    color: '#db2777',
    glowColor: 'rgba(219, 39, 119, 0.7)',
    badgeIcon: '✨',
    entranceDuration: 30,
    hasPremiumFrame: true,
    giftingPowerBoost: 2.00
  },
  'Legendary Emperor': {
    tier: 'Legendary Emperor',
    femaleTitle: 'Legendary Empress',
    rank: 16,
    minDiamonds: 1455000,
    color: '#be185d',
    glowColor: 'rgba(190, 24, 93, 0.7)',
    badgeIcon: '📜',
    entranceDuration: 35,
    hasPremiumFrame: true,
    giftingPowerBoost: 2.20
  },
  'Supreme Emperor': {
    tier: 'Supreme Emperor',
    femaleTitle: 'Supreme Empress',
    rank: 17,
    minDiamonds: 1700000,
    color: '#9d174d',
    glowColor: 'rgba(157, 23, 77, 0.7)',
    badgeIcon: '🔥',
    entranceDuration: 40,
    hasPremiumFrame: true,
    giftingPowerBoost: 2.50
  },
  'Overlord': {
    tier: 'Overlord',
    femaleTitle: 'Overlady',
    rank: 18,
    minDiamonds: 1980000,
    color: '#831843',
    glowColor: 'rgba(131, 24, 67, 0.8)',
    badgeIcon: '👹',
    entranceDuration: 45,
    hasPremiumFrame: true,
    giftingPowerBoost: 2.80
  },
  'Demi-God': {
    tier: 'Demi-God',
    femaleTitle: 'Demi-Goddess',
    rank: 19,
    minDiamonds: 2020000,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.9)',
    badgeIcon: '⚡',
    entranceDuration: 50,
    hasPremiumFrame: true,
    giftingPowerBoost: 3.00
  },
  'God of War': {
    tier: 'God of War',
    femaleTitle: 'Goddess of War',
    rank: 20,
    minDiamonds: 2420000,
    color: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.9)',
    badgeIcon: '⚔️',
    entranceDuration: 55,
    hasPremiumFrame: true,
    giftingPowerBoost: 3.50
  },
  'Celestial God': {
    tier: 'Celestial God',
    femaleTitle: 'Celestial Goddess',
    rank: 21,
    minDiamonds: 2820000,
    color: '#7e22ce',
    glowColor: 'rgba(126, 34, 206, 1.0)',
    badgeIcon: '🌌',
    entranceDuration: 60,
    hasPremiumFrame: true,
    giftingPowerBoost: 4.00
  },
  'Global God': {
    tier: 'Global God',
    femaleTitle: 'Global Goddess',
    rank: 22,
    minDiamonds: 3180000,
    color: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 1.0)',
    badgeIcon: '🌎',
    entranceDuration: 90,
    hasPremiumFrame: true,
    giftingPowerBoost: 5.00
  }
};
