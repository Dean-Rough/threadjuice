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
  MessageSquare,
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
    {
      id: 1,
      type: 'post',
      title: 'New viral post about AI trends',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'quiz',
      title: 'Quiz "Are you a tech guru?" completed',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'comment',
      title: 'New comment on "Reddit Drama Explained"',
      time: '6 hours ago',
    },
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
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Create Quiz',
      href: '/admin/quizzes/new',
      icon: MessageSquare,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Upload Media',
      href: '/admin/media/upload',
      icon: Image,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'View Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='mt-2 text-gray-600'>
          Welcome back! Here's what's happening with your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-blue-100 p-2'>
              <FileText className='h-6 w-6 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Posts</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.totalPosts}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-green-100 p-2'>
              <TrendingUp className='h-6 w-6 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Published</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.publishedPosts}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-yellow-100 p-2'>
              <Clock className='h-6 w-6 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Drafts</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.draftPosts}
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow'>
          <div className='flex items-center'>
            <div className='rounded-lg bg-purple-100 p-2'>
              <Users className='h-6 w-6 text-purple-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Views</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='mb-8'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className={`${action.color} block rounded-lg p-6 text-white transition-colors`}
            >
              <action.icon className='mb-3 h-8 w-8' />
              <h3 className='font-semibold'>{action.title}</h3>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity & Analytics */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Recent Activity */}
        <div className='rounded-lg bg-white shadow'>
          <div className='border-b border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Recent Activity
            </h2>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              {recentActivity.map(activity => (
                <div key={activity.id} className='flex items-start space-x-3'>
                  <div className='rounded bg-gray-100 p-1'>
                    {activity.type === 'post' && (
                      <FileText className='h-4 w-4 text-gray-600' />
                    )}
                    {activity.type === 'quiz' && (
                      <MessageSquare className='h-4 w-4 text-gray-600' />
                    )}
                    {activity.type === 'comment' && (
                      <MessageSquare className='h-4 w-4 text-gray-600' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm text-gray-900'>{activity.title}</p>
                    <p className='text-xs text-gray-500'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className='rounded-lg bg-white shadow'>
          <div className='border-b border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Performance Overview
            </h2>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Engagement Rate</span>
                  <span className='font-medium'>{stats.avgEngagement}%</span>
                </div>
                <div className='mt-1 h-2 w-full rounded-full bg-gray-200'>
                  <div
                    className='h-2 rounded-full bg-green-500'
                    style={{ width: `${stats.avgEngagement}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Quizzes Active</span>
                  <span className='font-medium'>{stats.totalQuizzes}</span>
                </div>
              </div>

              <div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Media Files</span>
                  <span className='font-medium'>{stats.mediaFiles}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
