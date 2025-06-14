'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  slug: string;
  isFeatured?: boolean;
  tags: string[];
}

interface FeaturedCarouselProps {
  posts: FeaturedPost[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  slidesToShow?: number;
  className?: string;
  variant?: 'hero' | 'cards' | 'compact';
}

export function FeaturedCarousel({
  posts,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  slidesToShow = 1,
  className = '',
  variant = 'hero',
}: FeaturedCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const totalSlides = Math.ceil(posts.length / slidesToShow);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isHovered && totalSlides > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isHovered, totalSlides, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getCurrentPosts = () => {
    const startIndex = currentSlide * slidesToShow;
    return posts.slice(startIndex, startIndex + slidesToShow);
  };

  const renderHeroVariant = () => (
    <div
      ref={carouselRef}
      className={`sarsa-featured-carousel sarsa-featured-carousel--hero ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role='region'
      aria-label='Featured posts carousel'
      tabIndex={0}
    >
      <div className='sarsa-featured-carousel__container'>
        <div
          className='sarsa-featured-carousel__track'
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            width: `${totalSlides * 100}%`,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const slideStartIndex = slideIndex * slidesToShow;
            const slidePosts = posts.slice(
              slideStartIndex,
              slideStartIndex + slidesToShow
            );

            return (
              <div
                key={slideIndex}
                className='sarsa-featured-carousel__slide'
                style={{ width: `${100 / totalSlides}%` }}
              >
                {slidePosts.map(post => (
                  <article
                    key={post.id}
                    className='sarsa-featured-carousel__hero-card'
                  >
                    <div className='sarsa-featured-carousel__hero-image'>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className='object-cover'
                        priority={slideIndex === 0}
                      />
                      <div className='sarsa-featured-carousel__hero-overlay' />
                    </div>

                    <div className='sarsa-featured-carousel__hero-content'>
                      <div className='sarsa-featured-carousel__hero-meta'>
                        <span className='sarsa-featured-carousel__category'>
                          {post.category}
                        </span>
                        <div className='sarsa-featured-carousel__tags'>
                          {post.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              className='sarsa-featured-carousel__tag'
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h2 className='sarsa-featured-carousel__hero-title'>
                        <Link
                          href={`/post/${post.slug}`}
                          className='sarsa-featured-carousel__hero-link'
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className='sarsa-featured-carousel__hero-excerpt'>
                        {post.excerpt}
                      </p>

                      <div className='sarsa-featured-carousel__hero-footer'>
                        <div className='sarsa-featured-carousel__author'>
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={32}
                            height={32}
                            className='rounded-full'
                          />
                          <span className='sarsa-featured-carousel__author-name'>
                            {post.author.name}
                          </span>
                        </div>

                        <div className='sarsa-featured-carousel__post-meta'>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{post.readTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalSlides > 1 && (
          <>
            <button
              className='sarsa-featured-carousel__arrow sarsa-featured-carousel__arrow--prev'
              onClick={goToPrevious}
              aria-label='Previous slide'
            >
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>

            <button
              className='sarsa-featured-carousel__arrow sarsa-featured-carousel__arrow--next'
              onClick={goToNext}
              aria-label='Next slide'
            >
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          </>
        )}

        {/* Play/Pause Button */}
        {autoPlay && totalSlides > 1 && (
          <button
            className='sarsa-featured-carousel__play-pause'
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            {isPlaying ? (
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 9v6m4-6v6'
                />
              </svg>
            ) : (
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15'
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Dots Pagination */}
      {showDots && totalSlides > 1 && (
        <div className='sarsa-featured-carousel__dots'>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`sarsa-featured-carousel__dot ${
                index === currentSlide
                  ? 'sarsa-featured-carousel__dot--active'
                  : ''
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCardsVariant = () => (
    <div
      ref={carouselRef}
      className={`sarsa-featured-carousel sarsa-featured-carousel--cards ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role='region'
      aria-label='Featured posts carousel'
      tabIndex={0}
    >
      <div className='sarsa-featured-carousel__header'>
        <h2 className='sarsa-featured-carousel__title'>Featured Stories</h2>

        {/* Controls */}
        <div className='sarsa-featured-carousel__controls'>
          {autoPlay && (
            <button
              className='sarsa-featured-carousel__control-btn'
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          )}

          {showArrows && totalSlides > 1 && (
            <>
              <button
                className='sarsa-featured-carousel__control-btn'
                onClick={goToPrevious}
                aria-label='Previous slide'
              >
                ←
              </button>
              <button
                className='sarsa-featured-carousel__control-btn'
                onClick={goToNext}
                aria-label='Next slide'
              >
                →
              </button>
            </>
          )}
        </div>
      </div>

      <div className='sarsa-featured-carousel__cards-container'>
        <div
          className='sarsa-featured-carousel__cards-track'
          style={{
            transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
          }}
        >
          {posts.map(post => (
            <article
              key={post.id}
              className='sarsa-featured-carousel__card'
              style={{ minWidth: `${100 / slidesToShow}%` }}
            >
              <div className='sarsa-featured-carousel__card-image'>
                <Image
                  src={post.image}
                  alt={post.title}
                  width={300}
                  height={200}
                  className='h-full w-full object-cover'
                />
                <div className='sarsa-featured-carousel__card-badge'>
                  {post.category}
                </div>
              </div>

              <div className='sarsa-featured-carousel__card-content'>
                <h3 className='sarsa-featured-carousel__card-title'>
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className='sarsa-featured-carousel__card-excerpt'>
                  {post.excerpt}
                </p>

                <div className='sarsa-featured-carousel__card-footer'>
                  <div className='sarsa-featured-carousel__card-author'>
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={24}
                      height={24}
                      className='rounded-full'
                    />
                    <span>{post.author.name}</span>
                  </div>

                  <span className='sarsa-featured-carousel__card-read-time'>
                    {post.readTime}m
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {showDots && totalSlides > 1 && (
        <div className='sarsa-featured-carousel__dots'>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`sarsa-featured-carousel__dot ${
                index === currentSlide
                  ? 'sarsa-featured-carousel__dot--active'
                  : ''
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderCompactVariant = () => (
    <div
      ref={carouselRef}
      className={`sarsa-featured-carousel sarsa-featured-carousel--compact ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role='region'
      aria-label='Featured posts carousel'
      tabIndex={0}
    >
      <div className='sarsa-featured-carousel__compact-track'>
        {getCurrentPosts().map(post => (
          <article
            key={post.id}
            className='sarsa-featured-carousel__compact-item'
          >
            <div className='sarsa-featured-carousel__compact-image'>
              <Image
                src={post.image}
                alt={post.title}
                width={80}
                height={80}
                className='h-full w-full rounded object-cover'
              />
            </div>

            <div className='sarsa-featured-carousel__compact-content'>
              <span className='sarsa-featured-carousel__compact-category'>
                {post.category}
              </span>
              <h4 className='sarsa-featured-carousel__compact-title'>
                <Link href={`/post/${post.slug}`}>{post.title}</Link>
              </h4>
              <div className='sarsa-featured-carousel__compact-meta'>
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{post.readTime}m</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalSlides > 1 && (
        <div className='sarsa-featured-carousel__compact-controls'>
          <button
            className='sarsa-featured-carousel__compact-arrow'
            onClick={goToPrevious}
            aria-label='Previous slide'
          >
            ←
          </button>

          <div className='sarsa-featured-carousel__compact-dots'>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`sarsa-featured-carousel__compact-dot ${
                  index === currentSlide
                    ? 'sarsa-featured-carousel__compact-dot--active'
                    : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            className='sarsa-featured-carousel__compact-arrow'
            onClick={goToNext}
            aria-label='Next slide'
          >
            →
          </button>
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'cards':
      return renderCardsVariant();
    case 'compact':
      return renderCompactVariant();
    default:
      return renderHeroVariant();
  }
}
