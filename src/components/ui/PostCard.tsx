'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import { PersonaBadge } from './PersonaBadge';
import { CategoryBadge } from './CategoryBadge';
import { TrendingBadge } from './TrendingBadge';

export interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: 'viral' | 'trending' | 'chaos' | 'wholesome' | 'drama';
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    tone: string;
  };
  publishedAt: string;
  readTime?: number;
  viewCount?: number;
  commentCount?: number;
  shareCount?: number;
  isViral?: boolean;
  tags?: string[];
  className?: string;
}

export function PostCard({
  id,
  title,
  excerpt,
  slug,
  category,
  featuredImage,
  author,
  publishedAt,
  readTime = 3,
  viewCount = 0,
  commentCount = 0,
  shareCount = 0,
  isViral = false,
  tags = [],
  className = '',
}: PostCardProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <article className={`latest__post-item tgImage__hover ${className}`} data-testid="post-card">
      {/* Featured Image */}
      <div className="latest__post-thumb">
        <Link href={`/blog/${slug}`}>
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              width={400}
              height={250}
              className="w-full h-[250px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/img/lifestyle/life_style01.jpg';
              }}
            />
          ) : (
            <div className="w-full h-[250px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </Link>
        
        {/* Trending Badge Overlay */}
        {isViral && (
          <div className="absolute top-3 left-3">
            <TrendingBadge />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="latest__post-content">
        {/* Meta Information */}
        <ul className="tgbanner__content-meta list-wrap mb-3">
          <li className="category">
            <CategoryBadge category={category} />
          </li>
          <li className="author">
            <PersonaBadge author={author} />
          </li>
          <li className="date">
            <Clock className="w-4 h-4 inline mr-1" />
            {formatDate(publishedAt)}
          </li>
          <li className="read-time">
            {readTime} min read
          </li>
        </ul>

        {/* Title */}
        <h3 className="title tgcommon__hover mb-3">
          <Link 
            href={`/blog/${slug}`}
            className="text-xl font-bold leading-tight hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{formatCount(viewCount)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{formatCount(commentCount)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Share2 className="w-4 h-4" />
              <span>{formatCount(shareCount)}</span>
            </span>
          </div>
        </div>

        {/* Read More Button */}
        <div className="latest__post-read-more">
          <Link 
            href={`/blog/${slug}`}
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors font-medium"
          >
            Read Full Story
            <i className="far fa-long-arrow-right ml-2" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PostCard;