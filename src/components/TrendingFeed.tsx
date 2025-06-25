'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import CommentModal from '@/components/features/CommentModal';
import { FeedAd } from '@/components/ads';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image_url?: string;
  personas?: {
    name: string;
    avatar_url: string;
    tone: string;
  };
  persona?: {
    name: string;
    avatar_url: string;
    tone: string;
  };
  category?: string;
  view_count?: number;
  comment_count?: number;
  share_count?: number;
  bookmark_count?: number;
  created_at?: string;
  trending?: boolean;
  featured?: boolean;
}

export const TrendingFeed = React.memo(function TrendingFeed() {
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const {
    data: postsResponse,
    isLoading,
    error,
  } = usePosts({
    limit: 12,
  });

  const handleCommentClick = useCallback(
    (e: React.MouseEvent, postId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedPostId(postId);
      setCommentModalOpen(true);
    },
    []
  );

  const handleShareClick = useCallback((e: React.MouseEvent, post: Post) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/blog/${post.slug}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/blog/${post.slug}`
      );
      // Could add a toast notification here
    }
  }, []);

  // Memoize posts to prevent unnecessary re-renders - ALL hooks must be before conditionals
  const posts = useMemo(
    () => postsResponse?.posts || [],
    [postsResponse?.posts]
  );

  // Memoize mixed content creation - expensive operation
  const mixedContent = useMemo(() => {
    if (posts.length === 0) return [];

    const mixedContent: Array<{
      type: 'post' | 'ad';
      data?: Post;
      index?: number;
    }> = [];

    posts.forEach((post, index) => {
      // Add the post
      mixedContent.push({ type: 'post', data: post, index });

      // Add ad every 10th position (after 9th, 19th, 29th items, etc.)
      if ((index + 1) % 10 === 0) {
        mixedContent.push({ type: 'ad', index: index + 1 });
      }
    });

    return mixedContent;
  }, [posts]);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='mobile-grid md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className='touch-focus h-64'>
              <CardHeader className='mobile-spacing'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </CardHeader>
              <CardContent className='mobile-spacing'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-5/6' />
                  <Skeleton className='h-4 w-4/6' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className='p-8 text-center'>
        <CardContent>
          <h3 className='mb-2 text-lg font-semibold text-destructive'>
            Error Loading Content
          </h3>
          <p className='text-muted-foreground'>
            Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className='p-8 text-center'>
        <CardContent>
          <h3 className='mb-2 text-lg font-semibold'>No Posts Found</h3>
          <p className='text-muted-foreground'>
            Check back soon for viral content!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 3x4 Bento Grid with integrated ads */}
      <div className='grid auto-rows-[320px] grid-cols-3 gap-4'>
        {mixedContent.map((item, gridIndex) => {
          const cardClasses = 'col-span-1 row-span-1';

          if (item.type === 'ad') {
            return (
              <div key={`ad-${item.index}`} className={cardClasses}>
                <FeedAd position={item.index} className='h-full' />
              </div>
            );
          }

          const post = item.data!;
          return (
            <React.Fragment key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className={`touch-focus ${cardClasses}`}
              >
                <Card className='touch-target group relative h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg'>
                  {/* Full Background Image */}
                  {post.image_url && (
                    <div className='absolute inset-0'>
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        loading='lazy'
                      />
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className='relative flex h-full flex-col'>
                    {/* Top Third - Black Background for Title */}
                    <div className='flex-none bg-black/90 p-4'>
                      <h3 className='text-base font-extrabold leading-tight tracking-tight text-white transition-colors group-hover:text-orange-300'>
                        {post.title}
                      </h3>
                    </div>

                    {/* Middle - Category and Trending Pills over image */}
                    <div className='flex flex-1 items-start p-4'>
                      <div className='flex items-center gap-2'>
                        {post.category && (
                          <span className='tag-pill !px-3 !py-1 !text-xs'>
                            {post.category}
                          </span>
                        )}
                        {post.trending && (
                          <span className='tag-pill !bg-orange-500 !px-3 !py-1 !text-xs hover:!bg-orange-600'>
                            Hot
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom - Slim Black Band with Stats */}
                    <div className='engagement-mono flex items-center justify-between bg-black/90 px-4 py-2 text-xs text-white'>
                      <div className='flex items-center gap-3'>
                        {post.view_count && post.view_count > 0 && (
                          <div className='flex items-center gap-1'>
                            <Eye className='h-3 w-3' />
                            <span>{post.view_count.toLocaleString()}</span>
                          </div>
                        )}

                        <button
                          onClick={e => handleCommentClick(e, post.id)}
                          className='flex items-center gap-1 transition-colors hover:text-orange-400'
                        >
                          <MessageCircle className='h-3 w-3' />
                          <span>{post.comment_count || 0}</span>
                        </button>
                      </div>

                      <button
                        onClick={e => handleShareClick(e, post)}
                        className='flex items-center gap-1 transition-colors hover:text-green-400'
                      >
                        <Share2 className='h-3 w-3' />
                        <span>{post.share_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* Comment Modal */}
      {selectedPostId && (
        <CommentModal
          postId={selectedPostId}
          isOpen={commentModalOpen}
          onClose={() => setCommentModalOpen(false)}
        />
      )}
    </div>
  );
});
