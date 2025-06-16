'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Calendar, 
  Tag, 
  User, 
  Image,
  ArrowLeft,
  Globe,
  Clock,
  Send
} from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';

interface PostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  category: string;
  tags: string[];
  personaId?: string;
  scheduledFor?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
}

interface Persona {
  id: string;
  name: string;
  description: string;
  voice: string;
}

export default function NewContentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    category: 'tech',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    featuredImage: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [personas] = useState<Persona[]>([
    { 
      id: 'sage', 
      name: 'The Snarky Sage', 
      description: 'Witty and sharp-tongued',
      voice: 'Sarcastic, insightful, cutting'
    },
    { 
      id: 'buddy', 
      name: 'The Down-to-Earth Buddy', 
      description: 'Friendly and relatable',
      voice: 'Casual, warm, encouraging'
    },
    { 
      id: 'cynic', 
      name: 'The Dry Cynic', 
      description: 'Pessimistically hilarious',
      voice: 'Deadpan, cynical, darkly funny'
    },
  ]);

  const categories = [
    'tech', 'finance', 'drama', 'wholesome', 'chaos', 'viral', 'gaming', 'lifestyle'
  ];

  // Auto-generate slug from title
  useEffect(() => {
    if (postData.title && !postData.slug) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setPostData(prev => ({ ...prev, slug }));
    }
  }, [postData.title, postData.slug]);

  // Auto-generate meta title from title
  useEffect(() => {
    if (postData.title && !postData.metaTitle) {
      setPostData(prev => ({ 
        ...prev, 
        metaTitle: postData.title.slice(0, 60) + (postData.title.length > 60 ? '...' : '')
      }));
    }
  }, [postData.title, postData.metaTitle]);

  const handleSave = async (status: 'draft' | 'published' | 'scheduled' = postData.status) => {
    setSaving(true);
    try {
      const payload = {
        ...postData,
        status,
        updatedAt: new Date().toISOString(),
      };

      // This would save to actual API endpoint
      console.log('Saving post:', payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (status === 'published') {
        router.push('/admin/content');
      }
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isValid = postData.title.trim() && postData.content.trim();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600 mt-1">
              Draft auto-saved • Last saved 2 minutes ago
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          
          <button
            onClick={() => handleSave('draft')}
            disabled={!isValid || saving}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button
            onClick={() => handleSave('published')}
            disabled={!isValid || saving}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {!previewMode ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your post title..."
                  className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 pb-3 focus:outline-none focus:border-orange-500 placeholder-gray-400"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={postData.excerpt}
                  onChange={(e) => setPostData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of your post..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <RichTextEditor
                  value={postData.content}
                  onChange={(content) => setPostData(prev => ({ ...prev, content }))}
                  placeholder="Start writing your story..."
                  minHeight="500px"
                />
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="bg-white rounded-lg shadow-lg p-8">
              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{postData.title || 'Untitled Post'}</h1>
                {postData.excerpt && (
                  <p className="text-xl text-gray-600 mb-8 font-medium">{postData.excerpt}</p>
                )}
                <div dangerouslySetInnerHTML={{ __html: postData.content || '<p>No content yet...</p>' }} />
              </article>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={postData.status}
                  onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {postData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    value={postData.scheduledFor || ''}
                    onChange={(e) => setPostData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={postData.slug}
                  onChange={(e) => setPostData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories & Tags</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={postData.category}
                  onChange={(e) => setPostData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {postData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Persona Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Writer Persona</h3>
            
            <div className="space-y-3">
              {personas.map(persona => (
                <label key={persona.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="persona"
                    value={persona.id}
                    checked={postData.personaId === persona.id}
                    onChange={(e) => setPostData(prev => ({ ...prev, personaId: e.target.value }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{persona.name}</div>
                    <div className="text-sm text-gray-600">{persona.description}</div>
                    <div className="text-xs text-gray-500 italic">{persona.voice}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={postData.metaTitle || ''}
                  onChange={(e) => setPostData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO title..."
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(postData.metaTitle || '').length}/60 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={postData.metaDescription || ''}
                  onChange={(e) => setPostData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description..."
                  maxLength={160}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(postData.metaDescription || '').length}/160 characters
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}