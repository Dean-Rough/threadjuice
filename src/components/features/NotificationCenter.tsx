'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  X,
  MessageSquare,
  Heart,
  Reply,
  AtSign,
  UserPlus,
  TrendingUp,
  Settings,
  MoreHorizontal,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import {
  notificationService,
  formatNotificationTime,
  getNotificationColor,
  type Notification,
  type NotificationPreferences,
} from '@/lib/notifications';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({
  className = '',
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    comments: true,
    likes: true,
    replies: true,
    mentions: true,
    follows: true,
    trending: false,
    email: false,
    push: true,
    digest: 'immediate',
  });

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(newNotifications => {
      setNotifications(newNotifications);
    });

    // Load preferences
    setPreferences(notificationService.getPreferences());

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      comment: MessageSquare,
      like: Heart,
      reply: Reply,
      mention: AtSign,
      follow: UserPlus,
      post_liked: Heart,
      trending: TrendingUp,
    };
    return icons[type] || Bell;
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
  };

  const handleClearAll = () => {
    notificationService.clearAll();
  };

  const handleUpdatePreferences = (
    newPreferences: Partial<NotificationPreferences>
  ) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    notificationService.updatePreferences(updated);
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      handleUpdatePreferences({ push: true });
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Notification Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='relative rounded-lg p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500'
        >
          <Bell className='h-6 w-6' />
          {unreadCount > 0 && (
            <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className='absolute right-0 top-full z-50 mt-2 max-h-[500px] w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 p-4'>
              <div className='flex items-center space-x-2'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className='rounded-full bg-red-100 px-2 py-1 text-xs text-red-800'>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className='rounded p-1 text-gray-400 hover:text-gray-600'
                  title='Settings'
                >
                  <Settings className='h-4 w-4' />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className='rounded p-1 text-gray-400 hover:text-gray-600'
                  title='Close'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className='border-b border-gray-200 bg-gray-50 p-4'>
                <h4 className='mb-3 text-sm font-medium text-gray-900'>
                  Notification Settings
                </h4>
                <div className='space-y-2'>
                  {Object.entries(preferences)
                    .slice(0, 6)
                    .map(([key, value]) => (
                      <label
                        key={key}
                        className='flex items-center justify-between text-sm'
                      >
                        <span className='capitalize text-gray-700'>
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdatePreferences({ [key]: !value })
                          }
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                            value ? 'bg-orange-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </label>
                    ))}

                  {!preferences.push && 'Notification' in window && (
                    <button
                      onClick={requestNotificationPermission}
                      className='mt-2 w-full rounded bg-orange-600 px-3 py-1 text-xs text-white hover:bg-orange-700'
                    >
                      Enable Browser Notifications
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            {notifications.length > 0 && (
              <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3'>
                <button
                  onClick={handleMarkAllAsRead}
                  className='flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700'
                >
                  <CheckCheck className='h-3 w-3' />
                  <span>Mark all read</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className='flex items-center space-x-1 text-xs text-red-600 hover:text-red-700'
                >
                  <Trash2 className='h-3 w-3' />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className='max-h-80 overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='p-8 text-center'>
                  <Bell className='mx-auto mb-3 h-12 w-12 text-gray-300' />
                  <p className='text-sm text-gray-500'>No notifications yet</p>
                  <p className='mt-1 text-xs text-gray-400'>
                    You&apos;ll see updates about comments, likes, and more here
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-gray-100'>
                  {notifications.map(notification => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className='flex items-start space-x-3'>
                          {/* Notification Icon */}
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 ${
                              !notification.read ? 'bg-blue-100' : ''
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${colorClass}`} />
                          </div>

                          {/* Notification Content */}
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <p
                                  className={`text-sm ${
                                    !notification.read
                                      ? 'font-medium text-gray-900'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p className='mt-1 text-xs text-gray-500'>
                                  {formatNotificationTime(
                                    notification.createdAt
                                  )}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className='ml-2 flex items-center space-x-1'>
                                {!notification.read && (
                                  <button
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                    className='rounded p-1 text-blue-600 hover:text-blue-700'
                                    title='Mark as read'
                                  >
                                    <CheckCheck className='h-3 w-3' />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDeleteNotification(notification.id)
                                  }
                                  className='rounded p-1 text-gray-400 hover:text-red-600'
                                  title='Delete'
                                >
                                  <X className='h-3 w-3' />
                                </button>
                              </div>
                            </div>

                            {/* Action Button */}
                            {notification.actionUrl && (
                              <button
                                onClick={() => {
                                  if (!notification.read) {
                                    handleMarkAsRead(notification.id);
                                  }
                                  // In real app, navigate to the URL
                                  // Development logging only
                                  if (process.env.NODE_ENV === 'development') {
                                    // console.log('Navigate to:', notification.actionUrl);
                                  }
                                }}
                                className='mt-2 text-xs font-medium text-orange-600 hover:text-orange-700'
                              >
                                View →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className='absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 transform rounded-full bg-blue-600'></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className='border-t border-gray-200 bg-gray-50 p-3 text-center'>
                <button className='text-xs font-medium text-orange-600 hover:text-orange-700'>
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
