'use client';

import { useState, useEffect } from 'react';
import { usePosts } from '@/hooks/usePosts';

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  hero_image?: string;
  view_count?: number;
  share_count?: number;
}

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
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPosts.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (featuredPosts.length === 0) {
    return (
      <section className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-4"></div>
              <div className="h-12 bg-white/20 rounded mb-6"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentPost = featuredPosts[currentSlide];

  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentPost?.hero_image}
          alt={currentPost?.title}
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          key={currentSlide} // Force re-render for smooth transition
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Trending Badge */}
            <div className="mb-4">
              <span className="bg-orange-500 px-4 py-2 rounded-full text-sm font-bold">
                Trending #{currentSlide + 1}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              {currentPost?.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl">
              {currentPost?.excerpt}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {currentPost?.view_count ? `${currentPost.view_count.toLocaleString()} views` : '89.2k views'}
              </span>
              <span>{Math.floor(Math.random() * 500) + 200} comments</span>
              <span>{currentPost?.share_count || Math.floor(Math.random() * 100) + 50} shares</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 right-8 z-20">
        <div className="flex space-x-3">
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
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