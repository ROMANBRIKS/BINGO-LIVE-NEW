import { UserProfile } from './types';

/**
 * 🤝 FOLLOW SYSTEM LOGIC
 * Handles follow-related messages and prompts.
 */

export const THANK_YOU_MESSAGES = [
  `Thanks for the follow, {user}! ❤️`,
  `Welcome to the family, {user}! 🙏`,
  `Glad to have you here, {user}! 🌟`,
  `Thanks for the support, {user}! ✨`,
  `Welcome! Thanks for the follow, {user}! 💖`
];

export const getRandomThankYouMessage = (user: string) => {
  const msg = THANK_YOU_MESSAGES[Math.floor(Math.random() * THANK_YOU_MESSAGES.length)];
  return msg.replace('{user}', user);
};

export const createThankYouMessage = (user: string, hostProfile: UserProfile | null) => {
  return {
    id: 'sim-thank-' + Math.random().toString(36).substr(2, 9),
    hostName: hostProfile?.displayName || 'Anchor',
    hostLevel: hostProfile?.level || 1,
    text: getRandomThankYouMessage(user),
    type: 'welcome' as const,
    timestamp: Date.now()
  };
};

export const createInitialFollowPrompt = (roomId: string, hostProfile: UserProfile | null) => {
  return {
    id: 'follow-prompt-initial-' + roomId,
    type: 'follow-prompt' as const,
    displayName: hostProfile?.displayName || 'the host',
    hostPhoto: hostProfile?.photoURL,
    timestamp: Date.now()
  };
};
