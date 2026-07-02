import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './PushNotificationTester.css';

export const PushNotificationTester: React.FC = () => {
  const [targetUserId, setTargetUserId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const sendTestNotification = async () => {
    if (!targetUserId || !message) {
      showToast('Please fill in both the User ID and message fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          title: 'Test Broadcast Alert 🔴',
          body: message,
          type: 'test',
          url: '/'
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send notification');
      }
      
      showToast('Push notification successfully dispatched via Firebase Admin! 📨', 'success');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      showToast(error.message || 'Failed to dispatch push notification.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-tester" id="push-notification-tester-container">
      <div className="tester-header">
        <span className="icon">📨</span>
        <h4>Test Push Notification</h4>
      </div>
      <p className="tester-description">
        Send a real-time push notification through Firebase to any registered User ID.
      </p>
      <div className="form-group">
        <input
          type="text"
          placeholder="Target User ID"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          className="tester-input"
        />
        <input
          type="text"
          placeholder="Notification Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="tester-input"
        />
      </div>
      <button onClick={sendTestNotification} disabled={loading} className="tester-btn">
        {loading ? 'Sending Request...' : 'Send Push Notification'}
      </button>
    </div>
  );
};
