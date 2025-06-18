'use client';

import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, MessageCircle, Share2, TrendingUp } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  image_url?: string;
  personas?: {
    name: string;
    avatar_url: string;
    tone: string;
  };
  category?: string;
  view_count?: number;
  share_count?: number;
  created_at?: string;
  trending?: boolean;
  featured?: boolean;
}

export function TrendingFeed() {
  const { data: postsResponse, isLoading, error } = usePosts({
    trending: true,
    limit: 12,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
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
      <Card className="p-8 text-center">
        <CardContent>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Content
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const posts = postsResponse?.posts || [];

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">No Posts Found</h3>
          <p className="text-muted-foreground">
            Check back soon for viral content!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {posts.length} viral {posts.length === 1 ? 'story' : 'stories'}
        </p>
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3 text-orange-500" />
          Trending Now
        </Badge>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: Post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="group hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
            {/* Image */}
            {post.image_url && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <CardContent className="p-4">
              {/* Title with new styling */}
              <div className="tracking-tight text-med font-bold line-clamp-2 group-hover:text-primary transition-colors mb-3">
                {post.title}
              </div>

              {/* Category and Trending Badge */}
              <div className="flex items-center gap-2 mb-3">
                {post.category && (
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                )}
                {post.trending && (
                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                    Hot
                  </Badge>
                )}
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {post.view_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.view_count.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{Math.floor(Math.random() * 200) + 50}</span>
                </div>
                
                {post.share_count && (
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    <span>{post.share_count}</span>
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}