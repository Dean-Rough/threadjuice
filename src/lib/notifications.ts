// Notification System for ThreadJuice
// Handles real-time notifications for user interactions

export interface Notification {
  id: string;
  type: 'comment' | 'like' | 'reply' | 'mention' | 'follow' | 'post_liked' | 'trending';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
  read: boolean;
  userId: string;
  triggerUserId?: string;
  triggerUserName?: string;
  metadata?: {
    postId?: string;
    postTitle?: string;
    commentId?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  comments: boolean;
  likes: boolean;
  replies: boolean;
  mentions: boolean;
  follows: boolean;
  trending: boolean;
  email: boolean;
  push: boolean;
  digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
}

class NotificationService {
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = {
    comments: true,
    likes: true,
    replies: true,
    mentions: true,
    follows: true,
    trending: false,
    email: false,
    push: true,
    digest: 'immediate'
  };

  constructor() {
    this.loadNotifications();
    this.loadPreferences();
    this.setupMockNotifications();
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers.add(callback);
    callback(this.notifications);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  // Load notifications from storage
  private loadNotifications() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('threadjuice_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    }
  }

  // Save notifications to storage
  private saveNotifications() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('threadjuice_notifications', JSON.stringify(this.notifications));
    }
  }

  // Load preferences from storage
  private loadPreferences() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('threadjuice_notification_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    }
  }

  // Save preferences to storage
  private savePreferences() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('threadjuice_notification_preferences', JSON.stringify(this.preferences));
    }
  }

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    // Map notification types to preference keys
    const typeMapping: Record<string, keyof NotificationPreferences> = {
      'comment': 'comments',
      'like': 'likes',
      'reply': 'replies',
      'mention': 'mentions',
      'follow': 'follows',
      'post_liked': 'likes',
      'trending': 'trending'
    };

    const preferenceKey = typeMapping[notification.type];
    
    // Check if this type of notification is enabled
    if (preferenceKey && !this.preferences[preferenceKey]) {
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveNotifications();
    this.notifySubscribers();

    // Show browser notification if enabled
    if (this.preferences.push) {
      this.showBrowserNotification(newNotification);
    }

    // In real app, also send to server for persistence across devices
    console.log('Created notification:', newNotification);
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        data: {
          url: notification.actionUrl
        }
      });
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifySubscribers();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
    this.notifySubscribers();
  }

  // Delete notification
  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifySubscribers();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifySubscribers();
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications with pagination
  getNotifications(limit?: number, offset?: number): Notification[] {
    let notifications = [...this.notifications];
    
    if (offset) {
      notifications = notifications.slice(offset);
    }
    
    if (limit) {
      notifications = notifications.slice(0, limit);
    }
    
    return notifications;
  }

  // Update preferences
  updatePreferences(newPreferences: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  // Get current preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Setup mock notifications for demo
  private setupMockNotifications() {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'comment',
        title: 'New Comment',
        message: 'TechEnthusiast2024 commented on your post "AI Takes Over Reddit"',
        actionUrl: '/posts/ai-takes-over-reddit-drama#comment-1',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        read: false,
        userId: 'current-user',
        triggerUserId: 'user-1',
        triggerUserName: 'TechEnthusiast2024',
        metadata: {
          postId: '1',
          postTitle: 'AI Takes Over Reddit: The Drama Nobody Saw Coming',
          commentId: '1'
        }
      },
      {
        id: '2',
        type: 'like',
        title: 'New Like',
        message: 'RedditLurker liked your comment',
        actionUrl: '/posts/crypto-bros-discover-touch-grass#comment-5',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        read: false,
        userId: 'current-user',
        triggerUserId: 'user-2',
        triggerUserName: 'RedditLurker',
        metadata: {
          postId: '2',
          commentId: '5'
        }
      },
      {
        id: '3',
        type: 'reply',
        title: 'New Reply',
        message: 'CuriousUser replied to your comment',
        actionUrl: '/posts/ai-takes-over-reddit-drama#comment-3',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        read: true,
        userId: 'current-user',
        triggerUserId: 'user-3',
        triggerUserName: 'CuriousUser',
        metadata: {
          postId: '1',
          commentId: '3'
        }
      },
      {
        id: '4',
        type: 'trending',
        title: 'Trending Alert',
        message: 'Your post "Karen vs Manager" is trending! 🔥',
        actionUrl: '/posts/karen-vs-manager-showdown',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        read: true,
        userId: 'current-user',
        metadata: {
          postId: '3',
          postTitle: 'Karen vs Manager: The Ultimate Showdown'
        }
      }
    ];

    // Only add mock notifications if no notifications exist
    if (this.notifications.length === 0) {
      this.notifications = mockNotifications;
      this.saveNotifications();
    }
  }

  // Helper methods for creating specific types of notifications
  async notifyComment(postId: string, postTitle: string, commenterName: string, commentId: string) {
    await this.createNotification({
      type: 'comment',
      title: 'New Comment',
      message: `${commenterName} commented on your post "${postTitle}"`,
      actionUrl: `/posts/${postId}#comment-${commentId}`,
      userId: 'current-user', // In real app, get from context
      triggerUserName: commenterName,
      metadata: { postId, postTitle, commentId }
    });
  }

  async notifyLike(targetType: 'post' | 'comment', targetId: string, likerName: string, postTitle?: string) {
    await this.createNotification({
      type: 'like',
      title: 'New Like',
      message: `${likerName} liked your ${targetType}${postTitle ? ` on "${postTitle}"` : ''}`,
      actionUrl: targetType === 'post' ? `/posts/${targetId}` : `/posts/${targetId}#comment-${targetId}`,
      userId: 'current-user',
      triggerUserName: likerName,
      metadata: { targetType, targetId, postTitle }
    });
  }

  async notifyReply(commentId: string, postId: string, replierName: string, postTitle: string) {
    await this.createNotification({
      type: 'reply',
      title: 'New Reply',
      message: `${replierName} replied to your comment on "${postTitle}"`,
      actionUrl: `/posts/${postId}#comment-${commentId}`,
      userId: 'current-user',
      triggerUserName: replierName,
      metadata: { commentId, postId, postTitle }
    });
  }

  async notifyTrending(postId: string, postTitle: string) {
    await this.createNotification({
      type: 'trending',
      title: 'Trending Alert',
      message: `Your post "${postTitle}" is trending! 🔥`,
      actionUrl: `/posts/${postId}`,
      userId: 'current-user',
      metadata: { postId, postTitle }
    });
  }

  async notifyMention(postId: string, postTitle: string, mentionerName: string, commentId?: string) {
    await this.createNotification({
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentionerName} mentioned you${postTitle ? ` in "${postTitle}"` : ''}`,
      actionUrl: commentId ? `/posts/${postId}#comment-${commentId}` : `/posts/${postId}`,
      userId: 'current-user',
      triggerUserName: mentionerName,
      metadata: { postId, postTitle, commentId }
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export helper function to format time ago
export function formatNotificationTime(dateString: string): string {
  const now = new Date();
  const notificationDate = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return notificationDate.toLocaleDateString();
}

// Export helper to get notification icon
export function getNotificationIcon(type: Notification['type']): string {
  const icons = {
    comment: '💬',
    like: '❤️',
    reply: '↩️',
    mention: '👋',
    follow: '👥',
    post_liked: '❤️',
    trending: '🔥'
  };
  return icons[type] || '📢';
}

// Export helper to get notification color
export function getNotificationColor(type: Notification['type']): string {
  const colors = {
    comment: 'text-blue-600',
    like: 'text-red-600',
    reply: 'text-green-600',
    mention: 'text-purple-600',
    follow: 'text-indigo-600',
    post_liked: 'text-red-600',
    trending: 'text-orange-600'
  };
  return colors[type] || 'text-gray-600';
}