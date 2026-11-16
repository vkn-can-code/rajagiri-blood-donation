import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Notifications.module.css'; // We'll create this CSS next
import Spinner from '../common/Spinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Update local state to show it as read
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Notifications</h1>
      
      {isLoading ? <Spinner /> : (
        <div className={styles.list}>
          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`${styles.notificationItem} ${notif.is_read ? styles.read : styles.unread}`}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              >
                <div className={styles.icon}>
                  {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div className={styles.content}>
                  <p className={styles.message}>{notif.message}</p>
                  <span className={styles.date}>{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
                {!notif.is_read && <span className={styles.dot}>•</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;