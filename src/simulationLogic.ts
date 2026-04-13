import { UserProfile } from './types';
import { NobleTier } from './NobleTypes';

/**
 * 🤖 SIMULATION LOGIC
 * Handles simulated chat messages, joins, and follows.
 */

export const SIMULATED_USERS: { name: string; level?: number; nobleTier?: NobleTier }[] = [
  { name: 'Dark Matters2.o', level: undefined, nobleTier: 'Baron' },
  { name: 'hanafi', level: 4, nobleTier: 'None' },
  { name: 'DD', level: undefined, nobleTier: 'King' },
  { name: 'Deji', level: 8, nobleTier: 'None' },
  { name: 'Sherryluv', level: 12, nobleTier: 'Emperor' },
  { name: 'CoolCat', level: 5, nobleTier: 'None' },
  { name: 'StreamFan', level: 2, nobleTier: 'None' },
  { name: 'Global God 1', level: 50, nobleTier: 'Global God' },
  { name: 'Duke John', level: 20, nobleTier: 'Duke' },
  { name: 'Grand Duke Mike', level: 35, nobleTier: 'Grand Duke' },
  { name: 'Archduke Sarah', level: 45, nobleTier: 'Archduke' },
  { name: 'King Arthur', level: 60, nobleTier: 'King' },
  { name: 'Emperor Nero', level: 70, nobleTier: 'Emperor' },
  { name: 'Baroness', level: 15, nobleTier: 'Baron' }
];

export const SIMULATED_CHAT_MESSAGES = [
  'Nice stream! 🔥',
  'Hello everyone!',
  'Looking good today!',
  'Wow, amazing content!',
  'Love the energy here!',
  'Can you play some music?',
  'Sending some love! ❤️',
  'Keep up the great work!',
  'This is my favorite channel!',
  'Hello from the other side! 👋'
];

export const generateSimulatedMessage = (hostProfile: UserProfile | null) => {
  const userObj = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)];
  const user = userObj.name;
  const level = userObj.level || Math.floor(Math.random() * 10) + 1;

  const rand = Math.random();
  let type: 'chat' | 'join' | 'follow' | 'like-prompt' | 'guest-live-prompt' | 'mic-request' | 'gift' = 'chat';
  let text = SIMULATED_CHAT_MESSAGES[Math.floor(Math.random() * SIMULATED_CHAT_MESSAGES.length)];

  if (rand > 0.99) {
    type = 'mic-request';
    text = 'requested to join the mic';
  } else if (rand > 0.98) {
    type = 'guest-live-prompt';
    text = 'Wanna meet with the broadcaster? Click to join the Guest Live!';
  } else if (rand > 0.95) {
    type = 'like-prompt';
    text = 'Tap like to give the host a little energy!';
  } else if (rand > 0.85) {
    type = 'gift';
    const gifts = [
      { name: 'Rose', icon: '🌹' },
      { name: 'Finger Heart', icon: '🫰' },
      { name: 'Diamond', icon: '💎' },
      { name: 'Crown', icon: '👑' },
      { name: 'Gift Box', icon: '🎁' }
    ];
    const gift = gifts[Math.floor(Math.random() * gifts.length)];
    const quantities = [1, 1, 1, 10, 10, 99];
    const qty = quantities[Math.floor(Math.random() * quantities.length)];
    text = `sent ${qty}x ${gift.name}! ${gift.icon}`;
    
    return {
      id: 'sim-' + Math.random().toString(36).substr(2, 9),
      displayName: user,
      text,
      type,
      level,
      nobleTier: userObj.nobleTier || 'None',
      timestamp: Date.now(),
      isGift: true,
      giftName: gift.name,
      giftImage: gift.icon,
      quantity: qty,
      photoURL: `https://i.pravatar.cc/150?u=${user}`
    };
  } else if (rand > 0.7) {
    type = 'follow';
    text = 'followed the anchor';
  } else if (rand > 0.5) {
    type = 'join';
    text = 'joined';
    // If it's a join, 50% chance to pick a noble user specifically
    if (Math.random() > 0.5) {
      const nobleUsers = SIMULATED_USERS.filter(u => u.nobleTier && u.nobleTier !== 'None');
      if (nobleUsers.length > 0) {
        const pickedNoble = nobleUsers[Math.floor(Math.random() * nobleUsers.length)];
        return {
          id: 'sim-' + Math.random().toString(36).substr(2, 9),
          displayName: pickedNoble.name,
          text,
          type,
          level: pickedNoble.level || Math.floor(Math.random() * 30) + 10,
          nobleTier: pickedNoble.nobleTier,
          timestamp: Date.now(),
          hostPhoto: hostProfile?.photoURL,
          hostName: hostProfile?.displayName,
          isNew: Math.random() > 0.7,
          photoURL: `https://i.pravatar.cc/150?u=${pickedNoble.name}`,
          fanClubLevel: Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 1 : undefined,
          fanClubHostName: hostProfile?.displayName || 'Anchor',
          isSuperFan: Math.random() > 0.95,
          familyName: Math.random() > 0.7 ? ['LEGENDS', 'ROYALS', 'ELITE', 'VIBES'][Math.floor(Math.random() * 4)] : undefined,
          familyLevel: Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 1 : undefined
        };
      }
    }
  }

  return {
    id: 'sim-' + Math.random().toString(36).substr(2, 9),
    displayName: user,
    text,
    type,
    level,
    nobleTier: userObj.nobleTier || 'None',
    timestamp: Date.now(),
    hostPhoto: hostProfile?.photoURL,
    hostName: hostProfile?.displayName,
    isNew: type === 'join' && Math.random() > 0.7,
    photoURL: `https://i.pravatar.cc/150?u=${user}`,
    fanClubLevel: Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 1 : undefined,
    fanClubHostName: hostProfile?.displayName || 'Anchor',
    isSuperFan: Math.random() > 0.95,
    familyName: Math.random() > 0.7 ? ['LEGENDS', 'ROYALS', 'ELITE', 'VIBES'][Math.floor(Math.random() * 4)] : undefined,
    familyLevel: Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 1 : undefined
  };
};
