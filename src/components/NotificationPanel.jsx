import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Send } from 'lucide-react';
import './NotificationPanel.css';
import { webhookService } from '../services/webhookService';

export default function NotificationPanel({ recommendations, weather }) {
  const [notifications, setNotifications] = useState([]);
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [webhookStatus, setWebhookStatus] = useState('');

  useEffect(() => {
    if (enabled && recommendations) {
      createNotifications();
    }
  }, [recommendations, enabled]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
  }, [enabled]);

  const createNotifications = () => {
    const newNotifications = [];

    if (recommendations.alerts && recommendations.alerts.length > 0) {
      recommendations.alerts.forEach((alert, idx) => {
        newNotifications.push({
          id: `alert-${idx}-${Date.now()}`,
          type: 'alert',
          message: alert,
          timestamp: new Date(),
          read: false
        });
      });
    }

    if (recommendations.items && recommendations.items.length > 0) {
      newNotifications.push({
        id: `items-${Date.now()}`,
        type: 'reminder',
        message: `Don't forget: ${recommendations.items.join(', ')}`,
        timestamp: new Date(),
        read: false
      });
    }

    setNotifications(prev => {
      const existing = prev.filter(n => n.read);
      return [...newNotifications, ...existing].slice(0, 10);
    });

    // Request browser notification permission
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Send browser notification for critical alerts
    if (enabled && 'Notification' in window && Notification.permission === 'granted') {
      if (recommendations.alerts && recommendations.alerts.length > 0) {
        const alert = recommendations.alerts[0];
        new Notification('Weather Alert', {
          body: alert,
          icon: '/vite.svg',
          tag: 'weather-alert'
        });
      }
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleNotifications = () => {
    setEnabled(!enabled);
    if (!enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const sendToDiscord = async () => {
    const webhookUrl = localStorage.getItem('webhookUrl');

    if (!webhookUrl) {
      setWebhookStatus('웹훅 URL을 설정에서 먼저 등록해주세요.');
      setTimeout(() => setWebhookStatus(''), 3000);
      return;
    }

    try {
      setWebhookStatus('전송 중...');
      await webhookService.sendWeatherNotification(webhookUrl, weather, recommendations);
      setWebhookStatus('✅ 디스코드로 전송 완료!');
      setTimeout(() => setWebhookStatus(''), 3000);
    } catch (error) {
      console.error('Failed to send to Discord:', error);
      setWebhookStatus('❌ 전송 실패. 웹훅 URL을 확인해주세요.');
      setTimeout(() => setWebhookStatus(''), 3000);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <div className="notification-title">
          <Bell size={20} />
          <h3>알림</h3>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <div className="notification-actions">
          <button
            onClick={sendToDiscord}
            className="discord-btn"
            title="디스코드로 전송"
          >
            <Send size={18} />
          </button>
          <button
            onClick={toggleNotifications}
            className={`toggle-btn ${enabled ? 'enabled' : 'disabled'}`}
            title={enabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {enabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="clear-btn">
              모두 지우기
            </button>
          )}
        </div>
      </div>

      {webhookStatus && (
        <div className="webhook-status-notification">
          {webhookStatus}
        </div>
      )}

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">알림 없음</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
            >
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {notification.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="mark-read-btn"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {recommendations && recommendations.summary && (
        <div className="notification-summary">
          <h4>오늘의 요약</h4>
          <p>{recommendations.summary}</p>
        </div>
      )}
    </div>
  );
}
