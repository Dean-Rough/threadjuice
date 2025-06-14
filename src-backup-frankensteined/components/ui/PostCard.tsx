'use client';

import Link from 'next/link';
import { Post } from '@/types/database';
import { WOWAnimation } from '@/components/elements/WOWAnimation';
import { PersonaBadge } from './PersonaBadge';
import { CategoryBadge } from './CategoryBadge';
import { TrendingBadge } from './TrendingBadge';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured' | 'magazine' | 'minimal';
  className?: string;
  showExcerpt?: boolean;
  showMeta?: boolean;
  showPersona?: boolean;
  animationDelay?: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'default',
  className = '',
  showExcerpt = true,
  showMeta = true,
  showPersona = false,
  animationDelay = 0,
}) => {
  const cardClasses =
    `sarsa-post-card sarsa-post-card--${variant} ${className}`.trim();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate reading time estimate
  const estimateReadingTime = (content: any) => {
    if (!content || typeof content !== 'object') return 1;
    const wordCount = JSON.stringify(content).split(' ').length;
    return Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute
  };

  return (
    <WOWAnimation
      animation='fadeInUp'
      delay={animationDelay}
      className={cardClasses}
    >
      <article className='sarsa-post-card__wrapper'>
        {/* Featured Image with Overlay */}
        {post.featured_image && (
          <div className='sarsa-post-card__image-container'>
            <Link
              href={`/posts/${post.slug}`}
              className='sarsa-post-card__image-link'
            >
              <div className='sarsa-post-card__image-wrapper'>
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className='sarsa-post-card__image'
                  loading='lazy'
                />
                <div className='sarsa-post-card__image-overlay' />
              </div>
            </Link>

            {/* Badges Container */}
            <div className='sarsa-post-card__badges'>
              {post.category && (
                <CategoryBadge category={post.category} variant='overlay' />
              )}

              {post.trending_score > 50 && (
                <TrendingBadge score={post.trending_score} variant='overlay' />
              )}
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className='sarsa-post-card__content'>
          {/* Title */}
          <h3 className='sarsa-post-card__title'>
            <Link
              href={`/posts/${post.slug}`}
              className='sarsa-post-card__title-link'
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {showExcerpt && post.hook && (
            <p className='sarsa-post-card__excerpt'>{post.hook}</p>
          )}

          {/* Persona Badge */}
          {showPersona && post.persona_id && (
            <div className='sarsa-post-card__persona'>
              <PersonaBadge
                persona={{
                  id: post.persona_id,
                  name: 'Writer', // This would come from a join in real usage
                  avatar_url: '/avatars/default.png',
                }}
                variant='compact'
              />
            </div>
          )}

          {/* Meta Information */}
          {showMeta && (
            <div className='sarsa-post-card__meta'>
              <div className='sarsa-post-card__meta-primary'>
                <time
                  className='sarsa-post-card__date'
                  dateTime={post.created_at}
                >
                  <i className='far fa-calendar-alt' />
                  {formatDate(post.created_at)}
                </time>

                <span className='sarsa-post-card__read-time'>
                  <i className='far fa-clock' />
                  {estimateReadingTime(post.content)} min read
                </span>
              </div>

              <div className='sarsa-post-card__meta-secondary'>
                <div className='sarsa-post-card__stats'>
                  <span className='sarsa-post-card__stat sarsa-post-card__views'>
                    <i className='far fa-eye' />
                    <span className='sarsa-post-card__stat-count'>
                      {post.view_count ? post.view_count.toLocaleString() : '0'}
                    </span>
                  </span>

                  <span className='sarsa-post-card__stat sarsa-post-card__shares'>
                    <i className='far fa-share-alt' />
                    <span className='sarsa-post-card__stat-count'>
                      {post.share_count
                        ? post.share_count.toLocaleString()
                        : '0'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </WOWAnimation>
  );
};

export default PostCard;
