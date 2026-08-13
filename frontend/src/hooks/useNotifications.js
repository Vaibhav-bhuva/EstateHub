import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getUnread();
      setUnreadCount(res.data.unread || 0);
    } catch { /* silent */ }
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationService.get({ limit: 20 });
      setNotifications(res.data.docs || []);
      setUnreadCount(res.data.docs?.filter(n => !n.isRead).length || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return { notifications, unreadCount, loading, fetchAll, markRead, markAllRead };
};
