'use client';

import { useState, useEffect } from 'react';
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

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: postsResponse } = usePosts({
    featured: true,
    limit: 5,
  });

  const posts = postsResponse?.posts || [];
  const featuredPosts = posts.slice(0, 5);

  // Auto-cycle through slides
  useEffect(() => {
    if (featuredPosts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPosts.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

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

  const currentPost = featuredPosts[currentSlide];

  // Truncate title if too long
  const truncatedTitle = currentPost?.title
    ? currentPost.title.length > MAX_TITLE_LENGTH
      ? currentPost.title.substring(0, MAX_TITLE_LENGTH) + '...'
      : currentPost.title
    : '';

  return (
    <section className='relative h-[500px] overflow-hidden md:h-[600px]'>
      {/* Background Image */}
      <div className='absolute inset-0'>
        <Image
          src={currentPost?.imageUrl || currentPost?.image_url || '/assets/img/blog/blog01.jpg'}
          alt={currentPost?.title || 'Hero background'}
          fill
          className='object-cover transition-all duration-1000 ease-in-out'
          key={currentSlide} // Force re-render for smooth transition
          priority
          sizes='100vw'
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
              className='block mb-4 md:mb-6 transition-opacity hover:opacity-90 cursor-pointer'
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
}
