'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  Clock,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled';
  author: string;
  authorId: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
  views: number;
  excerpt: string;
  persona?: {
    id: string;
    name: string;
  };
}

export default function ContentManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'draft' | 'published' | 'scheduled'
  >('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // This would fetch from actual API endpoint
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'AI Takes Over Reddit: The Drama Nobody Saw Coming',
          slug: 'ai-takes-over-reddit-drama',
          status: 'published',
          author: 'The Snarky Sage',
          authorId: 'sage-1',
          category: 'tech',
          tags: ['AI', 'Reddit', 'Drama'],
          createdAt: '2024-06-15T10:00:00Z',
          updatedAt: '2024-06-15T10:30:00Z',
          publishedAt: '2024-06-15T11:00:00Z',
          views: 2500,
          excerpt:
            'When AI started moderating r/funny, nobody expected the chaos that followed...',
          persona: { id: 'sage', name: 'The Snarky Sage' },
        },
        {
          id: '2',
          title: 'Crypto Bros Discover Touch Grass: A Scientific Study',
          slug: 'crypto-bros-discover-touch-grass',
          status: 'draft',
          author: 'The Down-to-Earth Buddy',
          authorId: 'buddy-1',
          category: 'finance',
          tags: ['Crypto', 'Reddit', 'Wholesome'],
          createdAt: '2024-06-14T15:00:00Z',
          updatedAt: '2024-06-15T09:00:00Z',
          views: 0,
          excerpt:
            'Local crypto enthusiast shocked to discover that grass has texture...',
          persona: { id: 'buddy', name: 'The Down-to-Earth Buddy' },
        },
        {
          id: '3',
          title: 'Karen vs Manager: The Ultimate Showdown',
          slug: 'karen-vs-manager-ultimate-showdown',
          status: 'scheduled',
          author: 'The Dry Cynic',
          authorId: 'cynic-1',
          category: 'drama',
          tags: ['Karen', 'Drama', 'Chaos'],
          createdAt: '2024-06-13T12:00:00Z',
          updatedAt: '2024-06-15T08:00:00Z',
          scheduledFor: '2024-06-16T16:00:00Z',
          views: 0,
          excerpt:
            'In a retail showdown for the ages, one Karen meets her match...',
          persona: { id: 'cynic', name: 'The Dry Cynic' },
        },
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'publish' | 'draft') => {
    // Implement bulk actions
    // console.log(`Bulk ${action} for posts:`, selectedPosts);
    setSelectedPosts([]);
  };

  const getStatusBadge = (status: Post['status']) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600'></div>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Content Management
          </h1>
          <p className='mt-2 text-gray-600'>
            Create, edit, and manage your posts and articles.
          </p>
        </div>
        <a
          href='/admin/content/new'
          className='flex items-center rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700'
        >
          <Plus className='mr-2 h-4 w-4' />
          New Post
        </a>
      </div>

      {/* Filters and Search */}
      <div className='mb-6 rounded-lg bg-white shadow'>
        <div className='border-b border-gray-200 p-6'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <input
                  type='text'
                  placeholder='Search posts...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500'
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className='sm:w-48'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className='w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500'
              >
                <option value='all'>All Status</option>
                <option value='published'>Published</option>
                <option value='draft'>Draft</option>
                <option value='scheduled'>Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className='border-b border-gray-200 bg-orange-50 p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-700'>
                {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''}{' '}
                selected
              </span>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleBulkAction('publish')}
                  className='rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700'
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className='rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700'
                >
                  Draft
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className='rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-gray-50'>
                <th className='w-12 p-4 text-left'>
                  <input
                    type='checkbox'
                    checked={
                      selectedPosts.length === filteredPosts.length &&
                      filteredPosts.length > 0
                    }
                    onChange={handleSelectAll}
                    className='rounded'
                  />
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Title
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Author
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Status
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Category
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Views
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Date
                </th>
                <th className='p-4 text-left font-medium text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr
                  key={post.id}
                  className='border-b border-gray-100 hover:bg-gray-50'
                >
                  <td className='p-4'>
                    <input
                      type='checkbox'
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className='rounded'
                    />
                  </td>
                  <td className='p-4'>
                    <div>
                      <h3 className='font-medium text-gray-900'>
                        {post.title}
                      </h3>
                      <p className='mt-1 text-sm text-gray-600'>
                        {post.excerpt}
                      </p>
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center'>
                      <User className='mr-2 h-4 w-4 text-gray-400' />
                      <span className='text-sm text-gray-900'>
                        {post.author}
                      </span>
                    </div>
                  </td>
                  <td className='p-4'>
                    <span className={getStatusBadge(post.status)}>
                      {post.status.charAt(0).toUpperCase() +
                        post.status.slice(1)}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='text-sm capitalize text-gray-900'>
                      {post.category}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span className='text-sm text-gray-900'>
                      {post.views.toLocaleString()}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center text-sm text-gray-600'>
                      <Calendar className='mr-1 h-4 w-4' />
                      {post.status === 'scheduled' && post.scheduledFor
                        ? formatDate(post.scheduledFor)
                        : formatDate(post.updatedAt)}
                    </div>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center space-x-2'>
                      <button
                        className='p-1 text-gray-400 hover:text-blue-600'
                        title='Preview'
                      >
                        <Eye className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-gray-400 hover:text-orange-600'
                        title='Edit'
                      >
                        <Edit3 className='h-4 w-4' />
                      </button>
                      <button
                        className='p-1 text-gray-400 hover:text-red-600'
                        title='Delete'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className='py-12 text-center'>
            <FileText className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-medium text-gray-900'>
              No posts found
            </h3>
            <p className='text-gray-600'>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first post.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
