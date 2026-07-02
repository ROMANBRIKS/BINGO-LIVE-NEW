import React, { useEffect } from 'react';
import { listenForMessages } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

export const NotificationListener: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    listenForMessages((payload) => {
      console.log('Foreground FCM notification received:', payload);
      
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';
      
      showToast(`${title}: ${body}`, 'info', 5000);
    });
  }, [showToast]);

  return null;
};
