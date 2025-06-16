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
  Clock
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');
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
          excerpt: 'When AI started moderating r/funny, nobody expected the chaos that followed...',
          persona: { id: 'sage', name: 'The Snarky Sage' }
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
          excerpt: 'Local crypto enthusiast shocked to discover that grass has texture...',
          persona: { id: 'buddy', name: 'The Down-to-Earth Buddy' }
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
          excerpt: 'In a retail showdown for the ages, one Karen meets her match...',
          persona: { id: 'cynic', name: 'The Dry Cynic' }
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.status === filterStatus;
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
    console.log(`Bulk ${action} for posts:`, selectedPosts);
    setSelectedPosts([]);
  };

  const getStatusBadge = (status: Post['status']) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage your posts and articles.</p>
        </div>
        <a 
          href="/admin/content/new" 
          className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </a>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="p-4 bg-orange-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Draft
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-900">Title</th>
                <th className="text-left p-4 font-medium text-gray-900">Author</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Category</th>
                <th className="text-left p-4 font-medium text-gray-900">Views</th>
                <th className="text-left p-4 font-medium text-gray-900">Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{post.author}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={getStatusBadge(post.status)}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-900 capitalize">{post.category}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-900">{post.views.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {post.status === 'scheduled' && post.scheduledFor 
                        ? formatDate(post.scheduledFor)
                        : formatDate(post.updatedAt)
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-orange-600"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first post.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}