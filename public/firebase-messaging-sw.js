import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getMessaging, onBackgroundMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

// Fetch the existing Firebase configuration dynamically so the user doesn't have to manually update this file!
fetch('/firebase-applet-config.json')
  .then((response) => response.json())
  .then((config) => {
    const app = initializeApp(config);
    const messaging = getMessaging(app);

    // Background message handler
    onBackgroundMessage(messaging, (payload) => {
      console.log('Background message received in Service Worker:', payload);
      
      const notificationTitle = payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/bingo-icon.png',
        badge: '/bingo-badge.png',
        data: payload.data || {},
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'Open' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  })
  .catch((err) => {
    console.error('Failed to load dynamic Firebase configuration in service worker:', err);
  });

// Click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.openWindow(url)
  );
});
