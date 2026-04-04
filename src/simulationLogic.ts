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
  { name: 'Global God 1', level: 50, nobleTier: 'Global God' }
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
  let type: 'chat' | 'join' | 'follow' | 'like-prompt' | 'guest-live-prompt' | 'mic-request' = 'chat';
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
  } else if (rand > 0.8) {
    type = 'follow';
    text = 'followed the anchor';
  } else if (rand > 0.5) {
    type = 'join';
    text = 'joined';
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
    isNew: type === 'join' && Math.random() > 0.7
  };
};
