'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Image, 
  BarChart3, 
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  MessageSquare
} from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalQuizzes: number;
  mediaFiles: number;
  totalViews: number;
  avgEngagement: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalQuizzes: 0,
    mediaFiles: 0,
    totalViews: 0,
    avgEngagement: 0,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'post', title: 'New viral post about AI trends', time: '2 hours ago' },
    { id: 2, type: 'quiz', title: 'Quiz "Are you a tech guru?" completed', time: '4 hours ago' },
    { id: 3, type: 'comment', title: 'New comment on "Reddit Drama Explained"', time: '6 hours ago' },
  ]);

  useEffect(() => {
    // Load dashboard stats
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // This would fetch from actual API endpoints
      setStats({
        totalPosts: 42,
        publishedPosts: 38,
        draftPosts: 4,
        totalQuizzes: 8,
        mediaFiles: 156,
        totalViews: 12500,
        avgEngagement: 85.4,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const quickActions = [
    { 
      title: 'Create New Post', 
      href: '/admin/content/new', 
      icon: FileText, 
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    { 
      title: 'Create Quiz', 
      href: '/admin/quizzes/new', 
      icon: MessageSquare, 
      color: 'bg-green-500 hover:bg-green-600' 
    },
    { 
      title: 'Upload Media', 
      href: '/admin/media/upload', 
      icon: Image, 
      color: 'bg-purple-500 hover:bg-purple-600' 
    },
    { 
      title: 'View Analytics', 
      href: '/admin/analytics', 
      icon: BarChart3, 
      color: 'bg-orange-500 hover:bg-orange-600' 
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-6 block transition-colors`}
            >
              <action.icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold">{action.title}</h3>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-1 bg-gray-100 rounded">
                    {activity.type === 'post' && <FileText className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'quiz' && <MessageSquare className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'comment' && <MessageSquare className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className="font-medium">{stats.avgEngagement}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.avgEngagement}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quizzes Active</span>
                  <span className="font-medium">{stats.totalQuizzes}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Media Files</span>
                  <span className="font-medium">{stats.mediaFiles}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}