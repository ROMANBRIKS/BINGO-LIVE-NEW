import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../services/notificationService';
import './NotificationPrompt.css';

interface NotificationPromptProps {
  userId: string;
  onPermissionGranted?: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ userId, onPermissionGranted }) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    } else {
      setSupported(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermission(userId);
      if (token) {
        setPermissionState('granted');
        if (onPermissionGranted) onPermissionGranted();
      } else {
        // Refresh permission state
        if ('Notification' in window) {
          setPermissionState(Notification.permission);
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return null; // Don't show if not supported
  }

  if (permissionState === 'granted') {
    return (
      <div className="notification-prompt granted" id="noti-prompt-granted">
        <span className="icon">🔔</span> Notifications enabled
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="notification-prompt denied" id="noti-prompt-denied">
        <span className="icon">🔕</span> Notifications blocked. Please enable in your browser settings.
      </div>
    );
  }

  return (
    <div className="notification-prompt default" id="noti-prompt-default">
      <span className="prompt-text">🔔 Get alerts for live streams, gifts, and more!</span>
      <button onClick={handleEnableNotifications} disabled={loading} className="enable-btn">
        {loading ? 'Requesting...' : 'Enable Notifications'}
      </button>
    </div>
  );
};
