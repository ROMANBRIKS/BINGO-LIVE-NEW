import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from '../firebase';

// Request permission and get FCM token
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return null;
    }

    if (!(await isSupported())) {
      console.warn('FCM Messaging is not supported in this browser environment');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const messaging = getMessaging(app);
    const vapidKey = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || undefined;

    const token = await getToken(messaging, {
      vapidKey
    });

    console.log('FCM Token generated successfully:', token);

    // Send token to server
    await fetch('/api/register-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, fcmToken: token })
    });

    return token;
  } catch (error) {
    console.error('Failed to get notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const listenForMessages = async (callback: (payload: any) => void) => {
  try {
    if (!(await isSupported())) {
      return;
    }
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (error) {
    console.error('Failed to listen for foreground messages:', error);
  }
};
