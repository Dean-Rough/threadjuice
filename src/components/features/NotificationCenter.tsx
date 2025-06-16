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
  Trash2
} from 'lucide-react';
import { 
  notificationService, 
  formatNotificationTime, 
  getNotificationColor,
  type Notification,
  type NotificationPreferences
} from '@/lib/notifications';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
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
    digest: 'immediate'
  });

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((newNotifications) => {
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
      trending: TrendingUp
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

  const handleUpdatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
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
          className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Settings</h4>
                <div className="space-y-2">
                  {Object.entries(preferences).slice(0, 6).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <button
                        onClick={() => handleUpdatePreferences({ [key]: !value })}
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
                      className="w-full mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                    >
                      Enable Browser Notifications
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    You'll see updates about comments, likes, and more here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Notification Icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${
                            !notification.read ? 'bg-blue-100' : ''
                          }`}>
                            <Icon className={`w-4 h-4 ${colorClass}`} />
                          </div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm ${
                                  !notification.read ? 'font-medium text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 text-blue-600 hover:text-blue-700 rounded"
                                    title="Mark as read"
                                  >
                                    <CheckCheck className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  title="Delete"
                                >
                                  <X className="w-3 h-3" />
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
                                  console.log('Navigate to:', notification.actionUrl);
                                }}
                                className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium"
                              >
                                View →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 5 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}