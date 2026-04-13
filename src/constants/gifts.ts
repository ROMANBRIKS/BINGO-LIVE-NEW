import { Gift } from '../types';

export const DEFAULT_POPULAR_GIFTS: Gift[] = [
  // Special Animated Gifts
  { id: 'kiss', name: 'Kiss', cost: 99, image: '💋', animationType: 'kiss', category: 'Popular' },
  { id: 'flower_special', name: 'Rose', cost: 10, image: '🌹', animationType: 'flower', category: 'Popular' },
  // First set of gifts
  { id: 'dino_gift_box', name: 'Dino Gift Box', cost: 1, image: '/assets/dino_gift_box.png', animationType: 'standard', category: 'Popular' },
  { id: 'crystal_ball', name: 'Crystal Ball', cost: 100, image: '🔮', animationType: 'standard', category: 'Popular' },
  { id: 'time_shards', name: 'Time Shards', cost: 1000, image: '💎', animationType: 'standard', category: 'Popular' },
  { id: 'red_carpet_dinner', name: 'Red Carpet Dinner', cost: 3000, image: '💃', animationType: 'standard', category: 'Popular' },
  { id: 'thunder_bike', name: 'Thunder Bike', cost: 10000, image: '🏍️', animationType: 'standard', category: 'Popular' },
  { id: 'curly_blast', name: 'Curly Blast', cost: 1, image: '🎉', animationType: 'standard', category: 'Popular' },
  { id: 'hat_trick', name: 'Hat Trick', cost: 100, image: '🎩', animationType: 'standard', category: 'Popular' },
  { id: 'firework', name: 'Firework', cost: 1000, image: '🎆', animationType: 'standard', category: 'Popular' },
  // Second set of gifts
  { id: 'sky_copter', name: 'Sky Copter', cost: 100, image: '🚁', animationType: 'standard', category: 'Popular' },
  { id: 'hot_gifts', name: 'HOT gifts', cost: 100, image: '🎁', animationType: 'standard', category: 'Popular' },
  { id: 'golden_rose', name: 'Golden Rose', cost: 100, image: '🌹', animationType: 'standard', category: 'Popular' },
  { id: 'flower', name: 'Flower', cost: 1, image: '🌷', animationType: 'standard', category: 'Popular' },
  { id: 'ghost_rider', name: 'GHOST RIDER by...', cost: 39999, image: '💀', animationType: 'standard', category: 'Popular' },
  { id: 'golden_pop', name: 'Golden Pop', cost: 100, image: '🍾', animationType: 'standard', category: 'Popular' },
  { id: 'gold', name: 'Gold', cost: 10, image: '💰', animationType: 'standard', category: 'Popular' },
  { id: 'pink_diamond', name: 'Pink Diamond', cost: 100, image: '💖', animationType: 'standard', category: 'Popular' },
];
