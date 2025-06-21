'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  TrendingUp,
  Award,
  Settings,
  Bell,
  Lock,
  Mail,
  Globe,
  Eye,
  EyeOff,
  Edit3,
} from 'lucide-react';

interface UserStats {
  postsRead: number;
  commentsPosted: number;
  likesGiven: number;
  bookmarks: number;
  streakDays: number;
  totalTimeSpent: number; // in minutes
  favoriteTopic: string;
  joinedDate: string;
}

interface UserActivity {
  id: string;
  type: 'read' | 'comment' | 'like' | 'bookmark' | 'share';
  postTitle: string;
  postSlug: string;
  timestamp: string;
  content?: string; // For comments
}

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
  className?: string;
}

export default function UserProfile({
  userId = 'current-user',
  isOwnProfile = true,
  className = '',
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'stats' | 'settings'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'ThreadJuiceUser',
    bio: 'Passionate about viral content and internet culture. Love discovering the stories behind the memes!',
    location: 'San Francisco, CA',
    website: 'https://mysite.com',
    email: 'user@example.com',
    isEmailPublic: false,
    notificationSettings: {
      comments: true,
      likes: true,
      follows: true,
      newsletters: false,
    },
  });

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Mock user stats
      const mockStats: UserStats = {
        postsRead: 342,
        commentsPosted: 89,
        likesGiven: 1250,
        bookmarks: 45,
        streakDays: 23,
        totalTimeSpent: 4320, // 72 hours
        favoriteTopic: 'Tech Drama',
        joinedDate: '2024-03-15T00:00:00Z',
      };

      // Mock recent activity
      const mockActivity: UserActivity[] = [
        {
          id: '1',
          type: 'comment',
          postTitle: 'AI Takes Over Reddit: The Drama Nobody Saw Coming',
          postSlug: 'ai-takes-over-reddit-drama',
          timestamp: '2024-06-15T14:30:00Z',
          content:
            'This is exactly what I expected when AI started taking over moderation!',
        },
        {
          id: '2',
          type: 'like',
          postTitle: 'Crypto Bros Discover Touch Grass: A Scientific Study',
          postSlug: 'crypto-bros-discover-touch-grass',
          timestamp: '2024-06-15T13:45:00Z',
        },
        {
          id: '3',
          type: 'bookmark',
          postTitle: 'Karen vs Manager: The Ultimate Showdown',
          postSlug: 'karen-vs-manager-showdown',
          timestamp: '2024-06-15T12:20:00Z',
        },
        {
          id: '4',
          type: 'read',
          postTitle: 'The Great Pineapple Pizza Debate Resurfaces',
          postSlug: 'pineapple-pizza-debate',
          timestamp: '2024-06-15T11:15:00Z',
        },
        {
          id: '5',
          type: 'share',
          postTitle: &quot;Elon Musk&apos;s Latest Twitter Antics Explained&quot;,
          postSlug: 'elon-musk-twitter-antics',
          timestamp: '2024-06-15T10:30:00Z',
        },
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - activityDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: UserActivity['type']) => {
    const icons = {
      read: Eye,
      comment: MessageSquare,
      like: Heart,
      bookmark: Bookmark,
      share: Share2,
    };
    return icons[type];
  };

  const getActivityColor = (type: UserActivity['type']) => {
    const colors = {
      read: 'text-blue-600',
      comment: 'text-green-600',
      like: 'text-red-600',
      bookmark: 'text-yellow-600',
      share: 'text-purple-600',
    };
    return colors[type];
  };

  const handleSaveProfile = () => {
    // In real app, save to API
    // Development logging only
    if (process.env.NODE_ENV === 'development') {
      // console.log('Saving profile:', profileData);
    }
    setIsEditing(false);
  };

  const renderOverviewTab = () => (
    <div className='space-y-6'>
      {/* Profile Info */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-orange-100'>
              <User className='h-10 w-10 text-orange-600' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                {profileData.username}
              </h2>
              <p className='mt-1 text-gray-600'>{profileData.bio}</p>
              {profileData.location && (
                <p className='mt-2 flex items-center text-sm text-gray-500'>
                  <Globe className='mr-1 h-4 w-4' />
                  {profileData.location}
                </p>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(true)}
              className='flex items-center space-x-1 text-gray-600 hover:text-gray-900'
            >
              <Edit3 className='h-4 w-4' />
              <span>Edit</span>
            </button>
          )}
        </div>

        {stats && (
          <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.postsRead}
              </div>
              <div className='text-sm text-gray-600'>Posts Read</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.commentsPosted}
              </div>
              <div className='text-sm text-gray-600'>Comments</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {stats.likesGiven}
              </div>
              <div className='text-sm text-gray-600'>Likes Given</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {stats.bookmarks}
              </div>
              <div className='text-sm text-gray-600'>Bookmarks</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          Recent Activity
        </h3>
        <div className='space-y-3'>
          {recentActivity.slice(0, 5).map(activity => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className='flex items-start space-x-3'>
                <Icon
                  className={`mt-0.5 h-5 w-5 ${getActivityColor(activity.type)}`}
                />
                <div className='flex-1'>
                  <div className='text-sm text-gray-900'>
                    <span className='capitalize'>{activity.type}</span>
                    {activity.type === 'comment'
                      ? 'ed on'
                      : activity.type === 'like'
                        ? 'd'
                        : activity.type === 'bookmark'
                          ? 'ed'
                          : activity.type === 'read'
                            ? ''
                            : 'd'}
                    <a
                      href={`/posts/${activity.postSlug}`}
                      className='ml-1 font-medium text-orange-600 hover:text-orange-700'
                    >
                      {activity.postTitle}
                    </a>
                  </div>
                  {activity.content && (
                    <div className='mt-1 text-sm italic text-gray-600'>
                      "{activity.content}"
                    </div>
                  )}
                  <div className='mt-1 text-xs text-gray-500'>
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className='space-y-6'>
      {stats && (
        <>
          {/* Engagement Stats */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Engagement Statistics
            </h3>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Posts Read</span>
                  <span className='font-semibold text-gray-900'>
                    {stats.postsRead}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Comments Posted</span>
                  <span className='font-semibold text-gray-900'>
                    {stats.commentsPosted}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Likes Given</span>
                  <span className='font-semibold text-gray-900'>
                    {stats.likesGiven}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Items Bookmarked</span>
                  <span className='font-semibold text-gray-900'>
                    {stats.bookmarks}
                  </span>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Reading Streak</span>
                  <span className='font-semibold text-orange-600'>
                    {stats.streakDays} days
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Time Spent Reading</span>
                  <span className='font-semibold text-gray-900'>
                    {formatTimeSpent(stats.totalTimeSpent)}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Favorite Topic</span>
                  <span className='font-semibold text-purple-600'>
                    {stats.favoriteTopic}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Member Since</span>
                  <span className='font-semibold text-gray-900'>
                    {formatDate(stats.joinedDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Achievements
            </h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <div className='flex items-center space-x-3 rounded-lg bg-yellow-50 p-3'>
                <Award className='h-8 w-8 text-yellow-600' />
                <div>
                  <div className='font-medium text-gray-900'>Active Reader</div>
                  <div className='text-sm text-gray-600'>Read 100+ posts</div>
                </div>
              </div>
              <div className='flex items-center space-x-3 rounded-lg bg-blue-50 p-3'>
                <MessageSquare className='h-8 w-8 text-blue-600' />
                <div>
                  <div className='font-medium text-gray-900'>
                    Conversationalist
                  </div>
                  <div className='text-sm text-gray-600'>
                    Posted 50+ comments
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-3 rounded-lg bg-green-50 p-3'>
                <TrendingUp className='h-8 w-8 text-green-600' />
                <div>
                  <div className='font-medium text-gray-900'>Trend Spotter</div>
                  <div className='text-sm text-gray-600'>
                    Early reader of viral posts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className='space-y-6'>
      {isOwnProfile && (
        <>
          {/* Profile Settings */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Profile Information
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Username
                </label>
                <input
                  type='text'
                  value={profileData.username}
                  onChange={e =>
                    setProfileData(prev => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={e =>
                    setProfileData(prev => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Location
                  </label>
                  <input
                    type='text'
                    value={profileData.location}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Website
                  </label>
                  <input
                    type='url'
                    value={profileData.website}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Privacy Settings
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-medium text-gray-900'>Public Email</div>
                  <div className='text-sm text-gray-600'>
                    Show your email address on your profile
                  </div>
                </div>
                <button
                  onClick={() =>
                    setProfileData(prev => ({
                      ...prev,
                      isEmailPublic: !prev.isEmailPublic,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    profileData.isEmailPublic ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profileData.isEmailPublic
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              Notification Preferences
            </h3>
            <div className='space-y-4'>
              {Object.entries(profileData.notificationSettings).map(
                ([key, value]) => (
                  <div key={key} className='flex items-center justify-between'>
                    <div>
                      <div className='font-medium capitalize text-gray-900'>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Receive notifications for {key.toLowerCase()}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setProfileData(prev => ({
                          ...prev,
                          notificationSettings: {
                            ...prev.notificationSettings,
                            [key]: !value,
                          },
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-end'>
            <button
              onClick={handleSaveProfile}
              className='rounded-md bg-orange-600 px-6 py-2 text-white hover:bg-orange-700'
            >
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600'></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-4xl ${className}`}>
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white'>
            <div className='border-b border-gray-200 p-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ×
                </button>
              </div>
            </div>
            <div className='p-6'>{renderSettingsTab()}</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className='mb-6 border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'activity', label: 'Activity', icon: TrendingUp },
            { id: 'stats', label: 'Statistics', icon: Award },
            ...(isOwnProfile
              ? [{ id: 'settings', label: 'Settings', icon: Settings }]
              : []),
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon className='h-4 w-4' />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'activity' && (
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900'>
            All Activity
          </h3>
          <div className='space-y-4'>
            {recentActivity.map(activity => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className='flex items-start space-x-3 rounded-lg bg-gray-50 p-3'
                >
                  <Icon
                    className={`mt-0.5 h-5 w-5 ${getActivityColor(activity.type)}`}
                  />
                  <div className='flex-1'>
                    <div className='text-sm text-gray-900'>
                      <span className='capitalize'>{activity.type}</span>
                      {activity.type === 'comment'
                        ? 'ed on'
                        : activity.type === 'like'
                          ? 'd'
                          : activity.type === 'bookmark'
                            ? 'ed'
                            : activity.type === 'read'
                              ? ''
                              : 'd'}
                      <a
                        href={`/posts/${activity.postSlug}`}
                        className='ml-1 font-medium text-orange-600 hover:text-orange-700'
                      >
                        {activity.postTitle}
                      </a>
                    </div>
                    {activity.content && (
                      <div className='mt-1 text-sm italic text-gray-600'>
                        "{activity.content}"
                      </div>
                    )}
                    <div className='mt-2 text-xs text-gray-500'>
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeTab === 'stats' && renderStatsTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </div>
  );
}
