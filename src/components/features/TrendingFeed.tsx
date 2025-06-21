'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePosts, usePostsByCategory } from '@/hooks/usePosts';
import { getRandomPersona, WriterPersona } from '@/data/personas';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  CATEGORIES,
  getCategoryIcon,
  getCategoryEmoji,
} from '@/constants/categories';
import { Flame, Eye, MessageCircle, Share2, Filter } from 'lucide-react';

import { Post as ApiPost } from '@/services/postService';

interface TrendingFeedProps {
  layout?: 'grid' | 'list' | 'masonry';
  postsPerPage?: number;
  showFilters?: boolean;
  featured?: boolean;
  category?: string;
  author?: string;
}

export default function TrendingFeed({
  layout = 'grid',
  postsPerPage = 12,
  showFilters = true,
  featured = false,
  category,
  author,
}: TrendingFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string>(category || 'all');

  // Use React Query hooks for data fetching
  const {
    data: postsResponse,
    isLoading,
    error,
    isError,
    isPending,
  } = usePosts({
    category: category || (activeFilter !== 'all' ? activeFilter : undefined),
    author,
    featured,
    trending: !featured,
    limit: postsPerPage,
  });

  // Get the posts data from the API response
  const posts = postsResponse?.posts || [];
  const currentLoading = isLoading || isPending;

  // Add personas and engagement data to posts if not present
  const postsWithMetadata = posts.map(post => {
    const postIdHash = String(post.id).slice(-6); // Use last 6 chars of UUID for seeding
    const seed = parseInt(postIdHash, 16) || 12345;

    return {
      ...post,
      persona: getRandomPersona(),
      engagement: {
        views: `${Math.floor((seed % 45) + 5)}.${Math.floor((seed % 9) + 1)}k`,
        comments: post.comment_count,
        shares: post.share_count,
      },
      // Map API fields to component expectations
      img: post.image_url || '/assets/img/lifestyle/life_style01.jpg',
      group: post.category,
      date: new Date(post.created_at).toLocaleDateString(),
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
        <LoadingSpinner size='lg' text='Loading viral content...' />
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className='trending-feed-error py-12 text-center'>
        <h3 className='mb-2 text-xl font-semibold text-red-600'>
          Error Loading Content
        </h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
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
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex-1'>
              <div className='filter-buttons'>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`mb-2 mr-2 rounded-lg px-4 py-2 font-medium transition-colors ${
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
                        {React.createElement(getCategoryIcon(category), {
                          size: 16,
                          className: 'mr-1',
                        })}{' '}
                        {category}
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
          <div className='grid gap-6 lg:grid-cols-12'>
            <div className='lg:col-span-8'>
              <div className='featured-post-card relative'>
                <div className='featured-post-thumb'>
                  <Link href={`/posts/${filteredPosts[0].id}`}>
                    <Image
                      src={filteredPosts[0].imageUrl || '/assets/img/lifestyle/life_style01.jpg'}
                      alt={filteredPosts[0].title}
                      width={800}
                      height={400}
                      className='h-96 w-full rounded object-cover'
                      priority
                    />
                  </Link>
                  <div className='featured-badge absolute left-0 top-0 m-3'>
                    <span className='rounded bg-red-600 px-3 py-1 text-sm font-medium text-white'>
                      ⚡ FEATURED
                    </span>
                  </div>
                </div>
                <div className='featured-post-content mt-3'>
                  <div className='meta-info mb-2'>
                    <span className='category mr-3'>
                      <Link
                        href={`/category/${filteredPosts[0].category.toLowerCase()}`}
                        className='text-orange-600 hover:text-orange-700'
                      >
                        🔥 {filteredPosts[0].category}
                      </Link>
                    </span>
                    <span className='author'>
                      By{' '}
                      <Link
                        href={`/personas/${filteredPosts[0].persona.id}`}
                        className='text-blue-600 hover:text-blue-700'
                      >
                        {filteredPosts[0].persona.name}
                      </Link>
                    </span>
                  </div>
                  <h2 className='featured-title mb-2 text-2xl font-bold text-gray-900 hover:text-orange-600'>
                    <Link href={`/posts/${filteredPosts[0].id}`}>
                      {filteredPosts[0].title} (Reddit viral thread)
                    </Link>
                  </h2>
                  <p className='featured-excerpt mb-4 text-gray-600'>
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
        <div
          className={`${layout === 'masonry' ? 'masonry-grid' : layout === 'list' ? 'space-y-6' : 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}`}
        >
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
                  <div className='flex h-full overflow-hidden rounded-lg bg-white shadow-sm'>
                    <div className='w-1/3 md:w-1/4'>
                      <div className='post-thumb relative'>
                        <Link href={`/posts/${post.id}`}>
                          <Image
                            src={post.imageUrl || '/assets/img/lifestyle/life_style01.jpg'}
                            alt={post.title}
                            width={320}
                            height={192}
                            className='h-48 w-full object-cover'
                          />
                        </Link>
                        {post.trending && (
                          <div className='trending-badge absolute right-2 top-2'>
                            <span className='rounded bg-yellow-500 px-2 py-1 text-sm font-medium text-black'>
                              🔥 TRENDING
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='post-content flex h-full flex-col p-4'>
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
                            <Link
                              href={`/personas/${post.persona.id}`}
                              className='text-blue-600 hover:text-blue-700'
                            >
                              {post.persona.name}
                            </Link>
                          </span>
                        </div>
                        <h4 className='post-title flex-grow font-semibold text-gray-900 hover:text-orange-600'>
                          <Link href={`/posts/${post.id}`}>
                            {post.title} (Reddit viral thread)
                          </Link>
                        </h4>
                        <div className='engagement-stats mt-auto flex space-x-4 text-sm text-gray-500'>
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
                  <div 
                    className='h-full overflow-hidden rounded-lg shadow-sm relative'
                    style={{
                      backgroundImage: `url(${post.imageUrl || '/assets/img/lifestyle/life_style01.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Dark overlay for readability */}
                    <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 rounded-lg' />
                    
                    {/* Content */}
                    <div className='relative h-full flex flex-col'>
                      {post.trending && (
                        <div className='trending-badge absolute right-2 top-2 z-10'>
                          <span className='rounded bg-yellow-500 px-2 py-1 text-sm font-medium text-black'>
                            🔥 TRENDING
                          </span>
                        </div>
                      )}
                      
                      <div className='flex-1 flex flex-col justify-end p-4'>
                        <div className='category mb-2'>
                          <Link
                            href={`/category/${post.category.toLowerCase()}`}
                            className='text-orange-400 hover:text-orange-300 text-sm font-medium'
                          >
                            {getCategoryEmoji(post.category)} {post.category}
                          </Link>
                        </div>
                        
                        <h5 className='post-title mb-2 font-bold text-white hover:text-orange-300'>
                          <Link href={`/posts/${post.id}`}>{post.title}</Link>
                        </h5>
                        
                        <div className='meta-info mb-3'>
                          <span className='author text-sm text-gray-300'>
                            By{' '}
                            <Link
                              href={`/personas/${post.persona.id}`}
                              className='text-orange-400 hover:text-orange-300'
                            >
                              {post.persona.name}
                            </Link>
                          </span>
                        </div>
                        
                        <div className='engagement-stats flex space-x-4 text-sm text-gray-300'>
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
                )}
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className='load-more mt-12 text-center'>
        <button className='rounded-lg border border-orange-600 px-8 py-3 text-lg font-semibold text-orange-600 transition-colors hover:bg-orange-600 hover:text-white'>
          Load More Viral Content
        </button>
      </div>
    </div>
  );
}
