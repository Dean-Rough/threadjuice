'use client';

import { TrendingFeed } from '@/components/TrendingFeed';
import { HeroCarousel } from '@/components/HeroCarousel';
import { usePopularPosts, useMostSharedPosts } from '@/hooks/usePopularPosts';
import { HeaderAd, SidebarAd } from '@/components/ads';
import { TrendingUp, Trophy, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { data: popularData, isLoading: popularLoading } = usePopularPosts(5);
  const { data: sharedData, isLoading: sharedLoading } = useMostSharedPosts(5);

  const popularPosts = popularData?.posts || [];
  const sharedPosts = sharedData?.posts || [];

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Header Ad - High visibility placement */}
      <HeaderAd />

      {/* Main Layout - Sidebar starts right after hero */}
      <div className='container mx-auto px-4'>
        <div className='grid gap-6 md:gap-8 lg:grid-cols-4'>
          {/* Main Content Area - 3 columns of 4x4 grid */}
          <div className='py-6 md:py-8 lg:col-span-3'>
            <TrendingFeed />
          </div>

          {/* Sidebar - 1 column reserved, starts right after hero */}
          <div className='py-6 md:py-8 lg:col-span-1'>
            <div className='sticky top-4 space-y-6'>
              {/* Sidebar Ads */}
              <SidebarAd />
              {/* Top 5 Popular Posts */}
              <div className='mb-6 rounded-lg border bg-card p-6'>
                <h3 className='mb-4 flex items-center gap-2 text-lg font-extrabold text-foreground'>
                  <Trophy className='h-5 w-5 text-orange-500' />
                  Today's Top 5
                </h3>
                <div className='space-y-4'>
                  {popularLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className='flex animate-pulse items-start space-x-3 p-3'
                        >
                          <div className='h-8 w-8 rounded-full bg-muted' />
                          <div className='flex-1 space-y-2'>
                            <div className='h-4 w-3/4 rounded bg-muted' />
                            <div className='h-3 w-1/2 rounded bg-muted' />
                          </div>
                        </div>
                      ))
                    : popularPosts.map((post, index) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className='touch-target touch-focus block flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-accent'
                        >
                          <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground'>
                            {index + 1}
                          </div>
                          <div className='flex-1'>
                            <p className='mb-1 text-sm font-medium leading-tight text-foreground'>
                              {post.title}
                            </p>
                            <p className='font-mono text-xs text-muted-foreground'>
                              {post.view_count.toLocaleString()} views
                            </p>
                          </div>
                        </Link>
                      ))}
                </div>
              </div>

              {/* Top 5 Shared Posts */}
              <div className='rounded-lg border bg-card p-6'>
                <h3 className='mb-4 flex items-center gap-2 text-lg font-extrabold text-foreground'>
                  <Share2 className='h-5 w-5 text-orange-500' />
                  Top Shared
                </h3>
                <div className='space-y-4'>
                  {sharedLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className='flex animate-pulse items-start space-x-3 p-3'
                        >
                          <div className='h-6 w-6 rounded-full bg-muted' />
                          <div className='flex-1 space-y-2'>
                            <div className='h-4 w-3/4 rounded bg-muted' />
                            <div className='h-3 w-1/2 rounded bg-muted' />
                          </div>
                        </div>
                      ))
                    : sharedPosts.map((post, index) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className='block flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-accent'
                        >
                          <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 font-mono text-xs font-bold text-white'>
                            {index + 1}
                          </div>
                          <div className='flex-1'>
                            <p className='mb-1 text-sm font-medium leading-tight text-foreground'>
                              {post.title}
                            </p>
                            <p className='font-mono text-xs text-muted-foreground'>
                              {post.share_count.toLocaleString()} shares
                            </p>
                          </div>
                        </Link>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
