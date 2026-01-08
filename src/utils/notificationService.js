import Pusher from 'pusher-js';

class NotificationService {
  constructor() {
    this.pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
      encrypted: true,
      authEndpoint: '/api/pusher/auth'
    });
    this.channel = null;
    this.listeners = new Set();
  }

  subscribe(userId, userRole, onNotification) {
    if (this.channel) {
      this.unsubscribe();
    }

    const channelName = `private-user-${userId}-${userRole}`;
    this.channel = this.pusher.subscribe(channelName);
    this.channel.bind('new_notification', (notification) => {
      // Notify all registered listeners
      this.listeners.forEach(listener => listener(notification));
      // Call the specific callback if provided
      if (onNotification) {
        onNotification(notification);
      }
    });
  }

  unsubscribe() {
    if (this.channel) {
      this.channel.unbind_all();
      this.channel.unsubscribe();
      this.channel = null;
    }
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }
}

// Create a singleton instance
export const notificationService = new NotificationService(); 