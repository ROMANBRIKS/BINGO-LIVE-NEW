import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection } from './firebase';

// Test Firestore connection on boot
testConnection();

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      console.warn('Service Worker registration skipped inside the Google AI Studio iframe environment to avoid cookie-redirect errors.');
      return;
    }

    navigator.serviceWorker.register('/firebase-messaging-sw.js', { type: 'module' })
      .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
      .catch((err) => console.warn('Service Worker registration skipped or failed:', err.message));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
