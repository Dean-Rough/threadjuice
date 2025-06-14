'use client';

import { useState, useCallback } from 'react';
import { Post } from '@/types/database';
import { PostCard } from '@/components/ui/PostCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WOWAnimation } from '@/components/elements/WOWAnimation';
import { useIsotope } from '@/hooks/useIsotope';

interface TrendingFeedProps {
  posts: Post[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  layout?: 'grid' | 'masonry' | 'magazine' | 'minimal';
  showFilters?: boolean;
  className?: string;
  itemsPerPage?: number;
}

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

const defaultFilters: FilterOption[] = [
  { label: 'All Posts', value: '*' },
  { label: 'Technology', value: '.technology' },
  { label: 'Lifestyle', value: '.lifestyle' },
  { label: 'Entertainment', value: '.entertainment' },
  { label: 'News', value: '.news' },
  { label: 'Sports', value: '.sports' },
];

export const TrendingFeed: React.FC<TrendingFeedProps> = ({
  posts,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  layout = 'masonry',
  showFilters = true,
  className = '',
  itemsPerPage = 12,
}) => {
  const [activeFilter, setActiveFilter] = useState('*');
  const [displayCount, setDisplayCount] = useState(itemsPerPage);

  const { containerRef, isLoaded, updateFilter } = useIsotope({
    itemSelector: '.sarsa-feed-item',
    layoutMode: layout === 'masonry' ? 'masonry' : 'fitRows',
    masonry: {
      columnWidth: '.sarsa-feed-item',
      gutter: 30,
    },
  });

  const handleFilterChange = useCallback(
    (filter: string) => {
      setActiveFilter(filter);
      updateFilter(filter);
    },
    [updateFilter]
  );

  const handleLoadMore = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      setDisplayCount(prev => prev + itemsPerPage);
    }
  }, [onLoadMore, itemsPerPage]);

  // Calculate filter counts
  const filtersWithCounts = defaultFilters.map(filter => ({
    ...filter,
    count:
      filter.value === '*'
        ? posts.length
        : posts.filter(
            post =>
              post.category?.toLowerCase() === filter.value.replace('.', '')
          ).length,
  }));

  const displayedPosts = posts.slice(0, displayCount);
  const canLoadMore = hasMore || displayCount < posts.length;

  const feedClasses =
    `sarsa-trending-feed sarsa-trending-feed--${layout} ${className}`.trim();

  return (
    <section className={feedClasses}>
      <div className='sarsa-trending-feed__container'>
        {/* Section Header */}
        <WOWAnimation
          animation='fadeInUp'
          className='sarsa-trending-feed__header'
        >
          <div className='sarsa-trending-feed__title-area'>
            <h2 className='sarsa-trending-feed__title'>
              <span className='sarsa-trending-feed__title-icon'>🔥</span>
              Trending Now
            </h2>
            <p className='sarsa-trending-feed__subtitle'>
              Discover the most viral stories and discussions from across the
              web
            </p>
          </div>
        </WOWAnimation>

        {/* Filters */}
        {showFilters && (
          <WOWAnimation
            animation='fadeInUp'
            delay={200}
            className='sarsa-trending-feed__filters'
          >
            <div className='sarsa-trending-feed__filter-header'>
              <span className='sarsa-trending-feed__filter-label'>
                Filter by Category:
              </span>
            </div>
            <div className='sarsa-trending-feed__filter-buttons'>
              {filtersWithCounts.map((filter, index) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`sarsa-trending-feed__filter-btn ${
                    activeFilter === filter.value
                      ? 'sarsa-trending-feed__filter-btn--active'
                      : ''
                  }`}
                  data-wow-delay={`${300 + index * 100}ms`}
                >
                  <span className='sarsa-trending-feed__filter-text'>
                    {filter.label}
                  </span>
                  {filter.count !== undefined && (
                    <span className='sarsa-trending-feed__filter-count'>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </WOWAnimation>
        )}

        {/* Feed Grid */}
        <div
          ref={containerRef}
          className='sarsa-trending-feed__grid'
          data-layout={layout}
        >
          {/* Grid Sizer for Isotope */}
          <div className='sarsa-feed-item sarsa-feed-sizer'></div>

          {displayedPosts.map((post, index) => {
            const categoryClass = post.category
              ? `${post.category.toLowerCase()}`
              : 'uncategorized';

            return (
              <div
                key={post.id}
                className={`sarsa-feed-item sarsa-feed-item--${layout} ${categoryClass}`}
                data-category={categoryClass}
              >
                <PostCard
                  post={post}
                  variant={layout === 'magazine' ? 'magazine' : 'default'}
                  showExcerpt={layout !== 'minimal'}
                  showMeta={true}
                  showPersona={layout === 'magazine'}
                  animationDelay={index * 100}
                  className='sarsa-trending-feed__post'
                />
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='sarsa-trending-feed__loading'>
            <LoadingSpinner
              variant='sarsa'
              text='Loading trending posts...'
              animated={true}
            />
          </div>
        )}

        {/* Load More Button */}
        {canLoadMore && !isLoading && (
          <WOWAnimation
            animation='fadeInUp'
            className='sarsa-trending-feed__load-more'
          >
            <button
              onClick={handleLoadMore}
              className='sarsa-trending-feed__load-more-btn'
              disabled={isLoading}
            >
              <span className='sarsa-trending-feed__load-more-text'>
                Load More Posts
              </span>
              <i className='sarsa-trending-feed__load-more-icon fas fa-chevron-down'></i>
            </button>
          </WOWAnimation>
        )}

        {/* Empty State */}
        {posts.length === 0 && !isLoading && (
          <WOWAnimation
            animation='fadeIn'
            className='sarsa-trending-feed__empty'
          >
            <div className='sarsa-trending-feed__empty-content'>
              <div className='sarsa-trending-feed__empty-icon'>📭</div>
              <h3 className='sarsa-trending-feed__empty-title'>
                No trending posts yet
              </h3>
              <p className='sarsa-trending-feed__empty-text'>
                Check back later for the latest viral content and discussions
              </p>
            </div>
          </WOWAnimation>
        )}

        {/* Stats Bar */}
        <div className='sarsa-trending-feed__stats'>
          <div className='sarsa-trending-feed__stats-item'>
            <span className='sarsa-trending-feed__stats-number'>
              {posts.length.toLocaleString()}
            </span>
            <span className='sarsa-trending-feed__stats-label'>
              Total Posts
            </span>
          </div>
          <div className='sarsa-trending-feed__stats-item'>
            <span className='sarsa-trending-feed__stats-number'>
              {displayedPosts.filter(p => p.trending_score > 70).length}
            </span>
            <span className='sarsa-trending-feed__stats-label'>Hot Topics</span>
          </div>
          <div className='sarsa-trending-feed__stats-item'>
            <span className='sarsa-trending-feed__stats-number'>
              {displayedPosts
                .reduce((acc, p) => acc + (p.view_count || 0), 0)
                .toLocaleString()}
            </span>
            <span className='sarsa-trending-feed__stats-label'>
              Total Views
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingFeed;
