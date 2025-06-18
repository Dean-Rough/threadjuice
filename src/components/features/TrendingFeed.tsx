'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePosts, usePostsByCategory } from '@/hooks/usePosts';
import { getRandomPersona, WriterPersona } from '@/data/personas';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { CATEGORIES, getCategoryIcon, getCategoryEmoji } from '@/constants/categories';
import {
  Flame,
  Eye,
  MessageCircle,
  Share2,
  Filter,
} from 'lucide-react';

// Updated interface to match API response
interface Post {
  id: number;
  title: string;
  img: string;
  group: string;
  trending: boolean;
  category: string;
  author: string;
  date: string;
  persona?: WriterPersona;
  engagement?: {
    views: string;
    comments: number;
    shares: number;
  };
}

interface TrendingFeedProps {
  layout?: 'grid' | 'list' | 'masonry';
  postsPerPage?: number;
  showFilters?: boolean;
  featured?: boolean;
}

export default function TrendingFeed({
  layout = 'grid',
  postsPerPage = 12,
  showFilters = true,
  featured = false,
}: TrendingFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Use React Query hooks for data fetching
  const { 
    data: postsResponse, 
    isLoading, 
    error,
    isError,
    isPending
  } = usePosts({ 
    featured, 
    trending: !featured,
    limit: postsPerPage 
  });

  // Debug logging
  console.log('TrendingFeed render state:', {
    isLoading,
    isPending,
    isError,
    error: error?.message,
    postsResponse,
    hasData: !!postsResponse?.posts?.length
  });

  // Use category-specific query when filter is active
  const { 
    data: categoryPostsResponse, 
    isLoading: categoryLoading 
  } = usePostsByCategory(
    activeFilter !== 'all' ? activeFilter : '', 
    postsPerPage
  );

  // Determine which data to use
  const posts = activeFilter === 'all' 
    ? postsResponse?.posts || [] 
    : categoryPostsResponse || [];

  const currentLoading = activeFilter === 'all' ? (isLoading || isPending) : categoryLoading;

  // Add personas and engagement data to posts if not present
  // Use deterministic engagement based on post ID for consistency
  const postsWithMetadata = posts.map(post => {
    // Generate deterministic engagement based on post ID for SEO consistency
    const postId = post.id || 1;
    const seed = postId * 12345; // Simple seeding
    
    return {
      ...post,
      persona: post.persona || getRandomPersona(),
      engagement: post.engagement || {
        views: `${Math.floor((seed % 45) + 5)}.${Math.floor((seed % 9) + 1)}k`,
        comments: Math.floor((seed % 450) + 50),
        shares: Math.floor((seed % 175) + 25),
      },
    };
  });

  // Use centralized category definitions
  const categories = CATEGORIES.map(cat => cat.id);

  const handleFilter = (category: string) => {
    setActiveFilter(category);
    // The actual filtering happens via React Query hooks above
  };

  // Handle loading states
  if (currentLoading) {
    return (
      <div className='trending-feed-loading py-12 text-center'>
        <LoadingSpinner size="lg" text="Loading viral content..." />
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className='trending-feed-error py-12 text-center'>
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Content</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  // Use the processed posts with metadata
  const filteredPosts = postsWithMetadata;

  return (
    <div className='trending-feed'>
      {/* Filter Bar */}
      {showFilters && (
        <div className='filter-bar mb-4'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex-1'>
              <div className='filter-buttons'>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`px-4 py-2 mb-2 mr-2 rounded-lg font-medium transition-colors ${
                      activeFilter === category
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white'
                    }`}
                    onClick={() => handleFilter(category)}
                  >
                    {category === 'all' ? (
                      <>
                        <Flame size={16} className='mr-1' />
                        All
                      </>
                    ) : (
                      <>
                        {React.createElement(getCategoryIcon(category), { size: 16, className: 'mr-1' })} {category}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className='lg:text-right'>
              <div className='feed-meta'>
                <span className='text-gray-500'>
                  {filteredPosts.length} viral{' '}
                  {filteredPosts.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Post (if enabled) */}
      {featured && filteredPosts.length > 0 && (
        <div className='featured-post mb-12'>
          <div className='grid lg:grid-cols-12 gap-6'>
            <div className='lg:col-span-8'>
              <div className='featured-post-card relative'>
                <div className='featured-post-thumb'>
                  <Link href={`/posts/${filteredPosts[0].id}`}>
                    <Image
                      src={`/assets/img/${filteredPosts[0].group}/${filteredPosts[0].img}`}
                      alt={filteredPosts[0].title}
                      width={800}
                      height={400}
                      className='w-full h-96 object-cover rounded'
                      priority
                    />
                  </Link>
                  <div className='featured-badge absolute left-0 top-0 m-3'>
                    <span className='bg-red-600 text-white px-3 py-1 rounded text-sm font-medium'>⚡ FEATURED</span>
                  </div>
                </div>
                <div className='featured-post-content mt-3'>
                  <div className='meta-info mb-2'>
                    <span className='category mr-3'>
                      <Link
                        href={`/category/${filteredPosts[0].category.toLowerCase()}`}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        🔥 {filteredPosts[0].category}
                      </Link>
                    </span>
                    <span className='author'>
                      By{' '}
                      <Link href={`/personas/${filteredPosts[0].persona.id}`} className="text-blue-600 hover:text-blue-700">
                        {filteredPosts[0].persona.name}
                      </Link>
                    </span>
                  </div>
                  <h2 className='featured-title text-2xl font-bold text-gray-900 hover:text-orange-600 mb-2'>
                    <Link href={`/posts/${filteredPosts[0].id}`}>
                      {filteredPosts[0].title} (Reddit viral thread)
                    </Link>
                  </h2>
                  <p className='featured-excerpt text-gray-600 mb-4'>
                    {filteredPosts[0].persona.bio}
                  </p>
                  <div className='engagement-stats flex space-x-4 text-sm text-gray-500'>
                    <span className='flex items-center'>
                      <Eye size={14} className='mr-1' />
                      {filteredPosts[0].engagement.views}
                    </span>
                    <span className='flex items-center'>
                      <MessageCircle size={14} className='mr-1' />
                      {filteredPosts[0].engagement.comments}
                    </span>
                    <span className='flex items-center'>
                      <Share2 size={14} className='mr-1' />
                      {filteredPosts[0].engagement.shares}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='lg:col-span-4'>
              {/* Trending sidebar content could go here */}
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className={`posts-grid layout-${layout}`}>
        <div className={`${layout === 'masonry' ? 'masonry-grid' : layout === 'list' ? 'space-y-6' : 'grid lg:grid-cols-3 md:grid-cols-2 gap-6'}`}>
          {filteredPosts.slice(featured ? 1 : 0).map((post, index) => (
            <div
              key={post.id}
              className={`post-item ${layout === 'list' ? 'w-full' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <article
                className={`post-card h-100 ${layout === 'list' ? 'post-card-horizontal' : ''}`}
              >
                {layout === 'list' ? (
                  // Horizontal layout for list view
                  <div className='flex h-full bg-white rounded-lg shadow-sm overflow-hidden'>
                    <div className='w-1/3 md:w-1/4'>
                      <div className='post-thumb relative'>
                        <Link href={`/posts/${post.id}`}>
                          <Image
                            src={`/assets/img/${post.group}/${post.img}`}
                            alt={post.title}
                            width={320}
                            height={192}
                            className='w-full h-48 object-cover'
                          />
                        </Link>
                        {post.trending && (
                          <div className='trending-badge absolute top-2 right-2'>
                            <span className='bg-yellow-500 text-black px-2 py-1 rounded text-sm font-medium'>
                              🔥 TRENDING
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='post-content h-full flex flex-col p-4'>
                        <div className='meta-info mb-2'>
                          <span className='category mr-3'>
                            <Link
                              href={`/category/${post.category.toLowerCase()}`}
                              className='text-orange-600 hover:text-orange-700'
                            >
                              {getCategoryEmoji(post.category)} {post.category}
                            </Link>
                          </span>
                          <span className='author text-gray-500'>
                            By{' '}
                            <Link href={`/personas/${post.persona.id}`} className='text-blue-600 hover:text-blue-700'>
                              {post.persona.name}
                            </Link>
                          </span>
                        </div>
                        <h4 className='post-title flex-grow font-semibold text-gray-900 hover:text-orange-600'>
                          <Link href={`/posts/${post.id}`}>
                            {post.title} (Reddit viral thread)
                          </Link>
                        </h4>
                        <div className='engagement-stats mt-auto text-sm text-gray-500 flex space-x-4'>
                          <span className='flex items-center'>
                            <Eye size={14} className='mr-1' />
                            {post.engagement.views}
                          </span>
                          <span className='flex items-center'>
                            <MessageCircle size={14} className='mr-1' />
                            {post.engagement.comments}
                          </span>
                          <span className='flex items-center'>
                            <Share2 size={14} className='mr-1' />
                            {post.engagement.shares}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Vertical layout for grid/masonry view
                  <div className='bg-white rounded-lg shadow-sm overflow-hidden h-full'>
                    <div className='post-thumb relative'>
                      <Link href={`/posts/${post.id}`}>
                        <Image
                          src={`/assets/img/${post.group}/${post.img}`}
                          alt={post.title}
                          width={400}
                          height={192}
                          className='w-full h-48 object-cover'
                        />
                      </Link>
                      {post.trending && (
                        <div className='trending-badge absolute top-2 right-2'>
                          <span className='bg-yellow-500 text-black px-2 py-1 rounded text-sm font-medium'>🔥 TRENDING</span>
                        </div>
                      )}
                      <div className='post-overlay absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent'>
                        <span className='category text-white font-medium text-sm'>
                          <Link
                            href={`/category/${post.category.toLowerCase()}`}
                            className='hover:text-orange-300'
                          >
                            {getCategoryEmoji(post.category)} {post.category}
                          </Link>
                        </span>
                      </div>
                    </div>
                    <div className='post-content p-4 flex-1 flex flex-col'>
                      <div className='meta-info mb-2'>
                        <span className='author text-gray-500 text-sm'>
                          By{' '}
                          <Link href={`/personas/${post.persona.id}`} className='text-blue-600 hover:text-blue-700'>
                            {post.persona.name}
                          </Link>
                        </span>
                      </div>
                      <h5 className='post-title font-semibold text-gray-900 hover:text-orange-600 flex-grow'>
                        <Link href={`/posts/${post.id}`}>{post.title}</Link>
                      </h5>
                      <div className='engagement-stats mt-4 text-sm text-gray-500 flex space-x-4'>
                        <span className='flex items-center'>
                          <Eye size={14} className='mr-1' />
                          {post.engagement.views}
                        </span>
                        <span className='flex items-center'>
                          <MessageCircle size={14} className='mr-1' />
                          {post.engagement.comments}
                        </span>
                        <span className='flex items-center'>
                          <Share2 size={14} className='mr-1' />
                          {post.engagement.shares}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className='load-more mt-12 text-center'>
        <button className='px-8 py-3 border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white rounded-lg font-semibold text-lg transition-colors'>
          Load More Viral Content
        </button>
      </div>
    </div>
  );
}

