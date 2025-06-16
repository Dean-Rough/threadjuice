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
  Edit3
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
  className = '' 
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'stats' | 'settings'>('overview');
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
      newsletters: false
    }
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
        joinedDate: '2024-03-15T00:00:00Z'
      };

      // Mock recent activity
      const mockActivity: UserActivity[] = [
        {
          id: '1',
          type: 'comment',
          postTitle: 'AI Takes Over Reddit: The Drama Nobody Saw Coming',
          postSlug: 'ai-takes-over-reddit-drama',
          timestamp: '2024-06-15T14:30:00Z',
          content: 'This is exactly what I expected when AI started taking over moderation!'
        },
        {
          id: '2',
          type: 'like',
          postTitle: 'Crypto Bros Discover Touch Grass: A Scientific Study',
          postSlug: 'crypto-bros-discover-touch-grass',
          timestamp: '2024-06-15T13:45:00Z'
        },
        {
          id: '3',
          type: 'bookmark',
          postTitle: 'Karen vs Manager: The Ultimate Showdown',
          postSlug: 'karen-vs-manager-showdown',
          timestamp: '2024-06-15T12:20:00Z'
        },
        {
          id: '4',
          type: 'read',
          postTitle: 'The Great Pineapple Pizza Debate Resurfaces',
          postSlug: 'pineapple-pizza-debate',
          timestamp: '2024-06-15T11:15:00Z'
        },
        {
          id: '5',
          type: 'share',
          postTitle: 'Elon Musk\'s Latest Twitter Antics Explained',
          postSlug: 'elon-musk-twitter-antics',
          timestamp: '2024-06-15T10:30:00Z'
        }
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
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));

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
      share: Share2
    };
    return icons[type];
  };

  const getActivityColor = (type: UserActivity['type']) => {
    const colors = {
      read: 'text-blue-600',
      comment: 'text-green-600',
      like: 'text-red-600',
      bookmark: 'text-yellow-600',
      share: 'text-purple-600'
    };
    return colors[type];
  };

  const handleSaveProfile = () => {
    // In real app, save to API
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profileData.username}</h2>
              <p className="text-gray-600 mt-1">{profileData.bio}</p>
              {profileData.location && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {profileData.location}
                </p>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.postsRead}</div>
              <div className="text-sm text-gray-600">Posts Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.commentsPosted}</div>
              <div className="text-sm text-gray-600">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.likesGiven}</div>
              <div className="text-sm text-gray-600">Likes Given</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.bookmarks}</div>
              <div className="text-sm text-gray-600">Bookmarks</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">
                    <span className="capitalize">{activity.type}</span>{activity.type === 'comment' ? 'ed on' : activity.type === 'like' ? 'd' : activity.type === 'bookmark' ? 'ed' : activity.type === 'read' ? '' : 'd'} 
                    <a href={`/posts/${activity.postSlug}`} className="text-orange-600 hover:text-orange-700 font-medium ml-1">
                      {activity.postTitle}
                    </a>
                  </div>
                  {activity.content && (
                    <div className="text-sm text-gray-600 mt-1 italic">"{activity.content}"</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      {stats && (
        <>
          {/* Engagement Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posts Read</span>
                  <span className="font-semibold text-gray-900">{stats.postsRead}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Comments Posted</span>
                  <span className="font-semibold text-gray-900">{stats.commentsPosted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes Given</span>
                  <span className="font-semibold text-gray-900">{stats.likesGiven}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Items Bookmarked</span>
                  <span className="font-semibold text-gray-900">{stats.bookmarks}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reading Streak</span>
                  <span className="font-semibold text-orange-600">{stats.streakDays} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Spent Reading</span>
                  <span className="font-semibold text-gray-900">{formatTimeSpent(stats.totalTimeSpent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorite Topic</span>
                  <span className="font-semibold text-purple-600">{stats.favoriteTopic}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">{formatDate(stats.joinedDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Award className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="font-medium text-gray-900">Active Reader</div>
                  <div className="text-sm text-gray-600">Read 100+ posts</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Conversationalist</div>
                  <div className="text-sm text-gray-600">Posted 50+ comments</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Trend Spotter</div>
                  <div className="text-sm text-gray-600">Early reader of viral posts</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {isOwnProfile && (
        <>
          {/* Profile Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Public Email</div>
                  <div className="text-sm text-gray-600">Show your email address on your profile</div>
                </div>
                <button
                  onClick={() => setProfileData(prev => ({ 
                    ...prev, 
                    isEmailPublic: !prev.isEmailPublic 
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    profileData.isEmailPublic ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profileData.isEmailPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(profileData.notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-sm text-gray-600">
                      Receive notifications for {key.toLowerCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileData(prev => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        [key]: !value
                      }
                    }))}
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
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {renderSettingsTab()}
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'activity', label: 'Activity', icon: TrendingUp },
            { id: 'stats', label: 'Statistics', icon: Award },
            ...(isOwnProfile ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      <span className="capitalize">{activity.type}</span>{activity.type === 'comment' ? 'ed on' : activity.type === 'like' ? 'd' : activity.type === 'bookmark' ? 'ed' : activity.type === 'read' ? '' : 'd'} 
                      <a href={`/posts/${activity.postSlug}`} className="text-orange-600 hover:text-orange-700 font-medium ml-1">
                        {activity.postTitle}
                      </a>
                    </div>
                    {activity.content && (
                      <div className="text-sm text-gray-600 mt-1 italic">"{activity.content}"</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">{formatTimeAgo(activity.timestamp)}</div>
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