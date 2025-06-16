/**
 * @jest-environment jsdom
 */

import { 
  notificationService, 
  formatNotificationTime, 
  getNotificationIcon, 
  getNotificationColor,
  type Notification 
} from '../notifications';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Notification API
const mockNotification = jest.fn();
Object.defineProperty(window, 'Notification', {
  value: mockNotification,
  configurable: true
});

// Mock permission
Object.defineProperty(mockNotification, 'permission', {
  value: 'granted',
  writable: true
});

mockNotification.requestPermission = jest.fn().mockResolvedValue('granted');

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // Clear the service's internal state
    notificationService.clearAll();
  });

  it('initializes with empty notifications when no stored data', () => {
    const notifications = notificationService.getNotifications();
    expect(Array.isArray(notifications)).toBe(true);
  });

  it('creates a new notification', async () => {
    const notification = {
      type: 'comment' as const,
      title: 'New Comment',
      message: 'Someone commented on your post',
      userId: 'user-1'
    };

    await notificationService.createNotification(notification);

    const notifications = notificationService.getNotifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0]).toMatchObject({
      ...notification,
      read: false
    });
    expect(notifications[0]).toHaveProperty('id');
    expect(notifications[0]).toHaveProperty('createdAt');
  });

  it('marks notification as read', async () => {
    const notification = {
      type: 'like' as const,
      title: 'New Like',
      message: 'Someone liked your post',
      userId: 'user-1'
    };

    await notificationService.createNotification(notification);
    const notifications = notificationService.getNotifications();
    const notificationId = notifications[0].id;

    notificationService.markAsRead(notificationId);

    const updatedNotifications = notificationService.getNotifications();
    expect(updatedNotifications[0].read).toBe(true);
  });

  it('marks all notifications as read', async () => {
    await notificationService.createNotification({
      type: 'comment' as const,
      title: 'Comment 1',
      message: 'Message 1',
      userId: 'user-1'
    });

    await notificationService.createNotification({
      type: 'like' as const,
      title: 'Like 1',
      message: 'Message 2',
      userId: 'user-1'
    });

    notificationService.markAllAsRead();

    const notifications = notificationService.getNotifications();
    expect(notifications.every(n => n.read)).toBe(true);
  });

  it('deletes notification', async () => {
    await notificationService.createNotification({
      type: 'comment' as const,
      title: 'Test',
      message: 'Test message',
      userId: 'user-1'
    });

    const notifications = notificationService.getNotifications();
    const notificationId = notifications[0].id;

    notificationService.deleteNotification(notificationId);

    const updatedNotifications = notificationService.getNotifications();
    expect(updatedNotifications.length).toBe(0);
  });

  it('clears all notifications', async () => {
    await notificationService.createNotification({
      type: 'comment' as const,
      title: 'Test 1',
      message: 'Message 1',
      userId: 'user-1'
    });

    await notificationService.createNotification({
      type: 'like' as const,
      title: 'Test 2',
      message: 'Message 2',
      userId: 'user-1'
    });

    notificationService.clearAll();

    const notifications = notificationService.getNotifications();
    expect(notifications.length).toBe(0);
  });

  it('returns correct unread count', async () => {
    await notificationService.createNotification({
      type: 'comment' as const,
      title: 'Test 1',
      message: 'Message 1',
      userId: 'user-1'
    });

    await notificationService.createNotification({
      type: 'like' as const,
      title: 'Test 2',
      message: 'Message 2',
      userId: 'user-1'
    });

    expect(notificationService.getUnreadCount()).toBe(2);

    const notifications = notificationService.getNotifications();
    notificationService.markAsRead(notifications[0].id);

    expect(notificationService.getUnreadCount()).toBe(1);
  });

  it('subscribes to notification updates', (done) => {
    const callback = jest.fn((notifications) => {
      if (callback.mock.calls.length === 1) {
        // First call should have existing notifications
        expect(Array.isArray(notifications)).toBe(true);
      } else if (callback.mock.calls.length === 2) {
        // Second call should have new notification
        expect(notifications.length).toBeGreaterThan(0);
        done();
      }
    });

    const unsubscribe = notificationService.subscribe(callback);

    // Create a notification to trigger the callback
    notificationService.createNotification({
      type: 'comment' as const,
      title: 'Test',
      message: 'Test message',
      userId: 'user-1'
    });

    // Clean up
    unsubscribe();
  });

  it('updates preferences', () => {
    const newPreferences = {
      comments: false,
      likes: true,
      email: true
    };

    notificationService.updatePreferences(newPreferences);

    const preferences = notificationService.getPreferences();
    expect(preferences.comments).toBe(false);
    expect(preferences.likes).toBe(true);
    expect(preferences.email).toBe(true);
  });

  it('respects notification preferences', async () => {
    // Disable comment notifications
    notificationService.updatePreferences({ comments: false });

    await notificationService.createNotification({
      type: 'comment' as const,
      title: 'Test Comment',
      message: 'This should not be created',
      userId: 'user-1'
    });

    const notifications = notificationService.getNotifications();
    expect(notifications.length).toBe(0);
  });

  it('saves and loads notifications from localStorage', async () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'comment' as const,
        title: 'Test',
        message: 'Test message',
        userId: 'user-1',
        createdAt: '2024-06-15T10:00:00Z',
        read: false
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockNotifications));

    // Create a new service instance to test loading
    const testService = new (notificationService.constructor as any)();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('threadjuice_notifications');
  });

  it('saves preferences to localStorage', () => {
    const preferences = { comments: false, likes: true };
    notificationService.updatePreferences(preferences);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'threadjuice_notification_preferences',
      expect.stringContaining('"comments":false')
    );
  });

  it('creates notifications with correct metadata', async () => {
    await notificationService.notifyComment('post-1', 'Test Post', 'John Doe', 'comment-1');

    const notifications = notificationService.getNotifications();
    const notification = notifications[0];

    expect(notification).toMatchObject({
      type: 'comment',
      title: 'New Comment',
      message: 'John Doe commented on your post "Test Post"',
      metadata: {
        postId: 'post-1',
        postTitle: 'Test Post',
        commentId: 'comment-1'
      }
    });
  });

  it('creates like notifications', async () => {
    await notificationService.notifyLike('post', 'post-1', 'Jane Doe', 'Test Post');

    const notifications = notificationService.getNotifications();
    const notification = notifications[0];

    expect(notification).toMatchObject({
      type: 'like',
      title: 'New Like',
      message: 'Jane Doe liked your post on "Test Post"'
    });
  });

  it('creates reply notifications', async () => {
    await notificationService.notifyReply('comment-1', 'post-1', 'Bob Smith', 'Test Post');

    const notifications = notificationService.getNotifications();
    const notification = notifications[0];

    expect(notification).toMatchObject({
      type: 'reply',
      title: 'New Reply',
      message: 'Bob Smith replied to your comment on "Test Post"'
    });
  });

  it('creates trending notifications', async () => {
    await notificationService.notifyTrending('post-1', 'Viral Post');

    const notifications = notificationService.getNotifications();
    const notification = notifications[0];

    expect(notification).toMatchObject({
      type: 'trending',
      title: 'Trending Alert',
      message: 'Your post "Viral Post" is trending! 🔥'
    });
  });

  it('creates mention notifications', async () => {
    await notificationService.notifyMention('post-1', 'Test Post', 'Alice Cooper', 'comment-1');

    const notifications = notificationService.getNotifications();
    const notification = notifications[0];

    expect(notification).toMatchObject({
      type: 'mention',
      title: 'You were mentioned',
      message: 'Alice Cooper mentioned you in "Test Post"'
    });
  });

  it('requests browser notification permission', async () => {
    const result = await notificationService.requestPermission();
    
    expect(mockNotification.requestPermission).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('shows browser notification when enabled', async () => {
    notificationService.updatePreferences({ push: true });
    
    await notificationService.createNotification({
      type: 'comment' as const,
      title: 'Test Notification',
      message: 'Test message',
      userId: 'user-1'
    });

    expect(mockNotification).toHaveBeenCalledWith('Test Notification', {
      body: 'Test message',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: expect.any(String),
      data: {
        url: undefined
      }
    });
  });

  it('limits notifications to 100', async () => {
    // Create 105 notifications
    for (let i = 0; i < 105; i++) {
      await notificationService.createNotification({
        type: 'comment' as const,
        title: `Test ${i}`,
        message: `Message ${i}`,
        userId: 'user-1'
      });
    }

    const notifications = notificationService.getNotifications();
    expect(notifications.length).toBe(100);
  });

  it('gets notifications with pagination', async () => {
    // Create some notifications
    for (let i = 0; i < 10; i++) {
      await notificationService.createNotification({
        type: 'comment' as const,
        title: `Test ${i}`,
        message: `Message ${i}`,
        userId: 'user-1'
      });
    }

    const firstPage = notificationService.getNotifications(5, 0);
    expect(firstPage.length).toBe(5);

    const secondPage = notificationService.getNotifications(5, 5);
    expect(secondPage.length).toBe(5);

    // Ensure they're different notifications
    expect(firstPage[0].id).not.toBe(secondPage[0].id);
  });
});

describe('Notification Helper Functions', () => {
  it('formats notification time correctly', () => {
    const now = new Date();
    
    // Just now
    const justNow = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(formatNotificationTime(justNow)).toBe('just now');

    // Minutes ago
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatNotificationTime(fiveMinutesAgo)).toBe('5m ago');

    // Hours ago
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatNotificationTime(twoHoursAgo)).toBe('2h ago');

    // Days ago
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatNotificationTime(threeDaysAgo)).toBe('3d ago');

    // Weeks ago (should show date)
    const twoWeeksAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatNotificationTime(twoWeeksAgo)).toMatch(/\d+\/\d+\/\d+/);
  });

  it('returns correct notification icons', () => {
    expect(getNotificationIcon('comment')).toBe('💬');
    expect(getNotificationIcon('like')).toBe('❤️');
    expect(getNotificationIcon('reply')).toBe('↩️');
    expect(getNotificationIcon('mention')).toBe('👋');
    expect(getNotificationIcon('follow')).toBe('👥');
    expect(getNotificationIcon('trending')).toBe('🔥');
    expect(getNotificationIcon('unknown' as any)).toBe('📢');
  });

  it('returns correct notification colors', () => {
    expect(getNotificationColor('comment')).toBe('text-blue-600');
    expect(getNotificationColor('like')).toBe('text-red-600');
    expect(getNotificationColor('reply')).toBe('text-green-600');
    expect(getNotificationColor('mention')).toBe('text-purple-600');
    expect(getNotificationColor('follow')).toBe('text-indigo-600');
    expect(getNotificationColor('trending')).toBe('text-orange-600');
    expect(getNotificationColor('unknown' as any)).toBe('text-gray-600');
  });
});