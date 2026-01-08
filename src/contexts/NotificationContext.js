import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { message } from 'antd';
import Pusher from 'pusher-js';
import api, { API_URL } from '../config/api';

// Singleton Pusher instance
let pusherInstance = null;

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [displayedNotifications, setDisplayedNotifications] = useState(() => {
    const saved = localStorage.getItem('displayedNotifications');
    return new Set(saved ? JSON.parse(saved) : []);
  });
  const channelRef = useRef(null);
  const userIdRef = useRef(null);
  const userRoleRef = useRef(null);
  const notificationQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    localStorage.setItem('displayedNotifications', JSON.stringify([...displayedNotifications]));
  }, [displayedNotifications]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      if (isMountedRef.current) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const processNotificationQueue = useCallback(() => {
    if (isProcessingQueueRef.current || notificationQueueRef.current.length === 0) return;
    isProcessingQueueRef.current = true;

    const notification = notificationQueueRef.current.shift();
    message.info({
      content: notification.message,
      duration: 5,
      onClick: () => markAsRead(notification.id),
    });

    setTimeout(() => {
      isProcessingQueueRef.current = false;
      processNotificationQueue();
    }, 1000);
  }, [markAsRead]);

  const fetchNotifications = useCallback(async () => {
    if (!userIdRef.current || !userRoleRef.current) {
      console.log('Skipping notification fetch - user credentials not available');
      return;
    }

    try {
      const response = await api.get(`/notifications?user_id=${userIdRef.current}&user_role=${userRoleRef.current}`);
      if (isMountedRef.current) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  const initializeSocket = useCallback((userId, userRole) => {
    if (!userId || !userRole || !isMountedRef.current) {
      console.log('Skipping Pusher initialization - missing credentials or unmounted');
      return;
    }

    if (userIdRef.current === userId && userRoleRef.current === userRole && pusherInstance) {
      console.log('Pusher already initialized with same credentials');
      return;
    }

    // Clean up any existing connection
    cleanupSocket();

    userIdRef.current = userId;
    userRoleRef.current = userRole;

    try {
      pusherInstance = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
        cluster: process.env.REACT_APP_PUSHER_CLUSTER,
        authEndpoint: `${API_URL}/pusher/auth`,
        auth: {
          params: { user_id: userId, user_role: userRole },
          withCredentials: true,
        },
        enabledTransports: ['ws', 'wss'],
        disabledTransports: ['xhr_streaming', 'xhr_polling'],
        activityTimeout: 60000,
        pongTimeout: 30000,
      });

      const channelName = `private-notifications-${userId}-${userRole}`;
      channelRef.current = pusherInstance.subscribe(channelName);

      channelRef.current.bind('pusher:subscription_succeeded', () => {
        console.log('Successfully subscribed to Pusher channel:', channelName);
        fetchNotifications();
      });

      channelRef.current.bind('pusher:subscription_error', (error) => {
        console.warn('Pusher subscription error:', error);
      });

      pusherInstance.connection.bind('state_change', ({ previous, current }) => {
        console.log(`Pusher connection state changed: {previous: '${previous}', current: '${current}'}`);
      });

      channelRef.current.bind('notification', (notification) => {
        if (!isMountedRef.current || !userIdRef.current || !userRoleRef.current) {
          console.log('Skipping notification processing - unmounted or missing credentials');
          return;
        }

        console.log('Received Pusher notification:', notification);
        setNotifications(prev => {
          const existingIndex = prev.findIndex(n => n.id === notification.id);
          let updated;
          if (existingIndex >= 0) {
            updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...notification };
          } else {
            updated = [notification, ...prev].slice(0, 100);
          }
          return updated;
        });

        if (!notification.is_read && notification.event_type !== 'NEW_MESSAGE') {
          setUnreadCount(prev => prev + 1);
          setDisplayedNotifications(prev => {
            const newSet = new Set(prev);
            newSet.add(notification.id);
            if (newSet.size > 100) {
              const iterator = newSet.values();
              for (let i = 0; i < newSet.size - 100; i++) {
                newSet.delete(iterator.next().value);
              }
            }
            return newSet;
          });
          notificationQueueRef.current.push(notification);
          processNotificationQueue();
        }
      });
    } catch (error) {
      console.error('Error initializing Pusher:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNotifications, processNotificationQueue]);

  const cleanupSocket = useCallback(() => {
    try {
      if (pusherInstance) {
        console.log('Disconnecting Pusher instance');
        pusherInstance.disconnect();
        pusherInstance = null;
      }
      channelRef.current = null;
      userIdRef.current = null;
      userRoleRef.current = null;
    } catch (error) {
      console.warn('Error during socket cleanup:', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Only cleanup on full app unmount
      cleanupSocket();
    };
  }, [cleanupSocket]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    initializeSocket,
    cleanupSocket,
  }), [notifications, unreadCount, markAsRead, initializeSocket, cleanupSocket]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => useContext(NotificationContext);