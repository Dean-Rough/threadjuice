'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  image_url?: string;
  view_count?: number;
  comment_count?: number;
  share_count?: number;
}

// Max title length for consistent layout
const MAX_TITLE_LENGTH = 80;

export const HeroCarousel = React.memo(function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: postsResponse } = usePosts({
    featured: true,
    limit: 5,
  });

  // Memoize featured posts to prevent unnecessary re-renders
  const featuredPosts = useMemo(() => {
    return postsResponse?.posts?.slice(0, 5) || [];
  }, [postsResponse?.posts]);

  // Memoize slide navigation to prevent recreation
  const goToNextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % featuredPosts.length);
  }, [featuredPosts.length]);

  // Auto-cycle through slides - optimized
  useEffect(() => {
    if (featuredPosts.length <= 1) return;

    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, [goToNextSlide, featuredPosts.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Memoize current post and title processing - moved before conditional return
  const currentPost = useMemo(
    () => featuredPosts[currentSlide],
    [featuredPosts, currentSlide]
  );

  const truncatedTitle = useMemo(() => {
    if (!currentPost?.title) return '';
    return currentPost.title.length > MAX_TITLE_LENGTH
      ? currentPost.title.substring(0, MAX_TITLE_LENGTH) + '...'
      : currentPost.title;
  }, [currentPost?.title]);

  if (featuredPosts.length === 0) {
    return (
      <section className='bg-gradient-to-r from-orange-600 to-orange-500 py-8 text-white md:py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl'>
            <div className='animate-pulse'>
              <div className='mb-3 h-6 rounded bg-white/20 md:mb-4 md:h-8'></div>
              <div className='mb-4 h-8 rounded bg-white/20 md:mb-6 md:h-12'></div>
              <div className='h-3 w-1/2 rounded bg-white/20 md:h-4'></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='relative h-[500px] overflow-hidden md:h-[600px]'>
      {/* Background Image */}
      <div className='absolute inset-0'>
        <Image
          src={
            currentPost?.image_url ||
            '/assets/img/blog/blog01.jpg'
          }
          alt={currentPost?.title || 'Hero background'}
          fill
          className='object-cover transition-all duration-1000 ease-in-out'
          priority
          sizes='(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent'></div>
        <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent'></div>
      </div>

      {/* Content */}
      <div className='relative z-10 flex h-full items-center text-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl'>
            {/* Trending Badge */}
            <div className='mb-3 md:mb-4'>
              <span className='rounded-full bg-orange-500 px-3 py-2 font-mono text-xs font-bold md:px-4 md:text-sm'>
                Trending #{currentSlide + 1}
              </span>
            </div>

            {/* Main Title - Clickable */}
            <Link
              href={`/blog/${currentPost?.slug}`}
              className='mb-4 block cursor-pointer transition-opacity hover:opacity-90 md:mb-6'
            >
              <h1 className='text-2xl font-extrabold leading-tight md:text-4xl lg:text-5xl xl:text-6xl'>
                {truncatedTitle}
              </h1>
            </Link>

            {/* Excerpt */}
            <p className='mb-6 line-clamp-2 max-w-3xl text-base opacity-90 md:mb-8 md:line-clamp-3 md:text-xl lg:text-2xl'>
              {currentPost?.excerpt}
            </p>

            {/* Stats - Real data with mono font */}
            <div className='engagement-mono flex flex-wrap items-center gap-3 text-xs md:gap-6 md:text-sm'>
              <span className='rounded-full bg-white/20 px-2 py-1 font-mono md:px-3'>
                {currentPost?.view_count
                  ? `${currentPost.view_count.toLocaleString()} views`
                  : '0 views'}
              </span>
              <span className='font-mono'>
                {currentPost?.comment_count
                  ? `${currentPost.comment_count.toLocaleString()} comments`
                  : '0 comments'}
              </span>
              <span className='hidden font-mono sm:inline'>
                {currentPost?.share_count
                  ? `${currentPost.share_count.toLocaleString()} shares`
                  : '0 shares'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots - Smaller */}
      <div className='absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transform md:bottom-8 md:left-auto md:right-8 md:translate-x-0'>
        <div className='flex space-x-2'>
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 md:h-2.5 md:w-2.5 ${
                index === currentSlide
                  ? 'scale-125 bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
