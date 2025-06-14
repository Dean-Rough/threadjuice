'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface TrendingTopic {
  id: string;
  text: string;
  url: string;
  category: string;
  trending: boolean;
  growth?: number; // percentage
  icon?: string;
}

interface TrendingMarqueeProps {
  topics: TrendingTopic[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  showIcons?: boolean;
  showGrowth?: boolean;
  className?: string;
  variant?: 'default' | 'ticker' | 'compact' | 'news';
}

export function TrendingMarquee({
  topics,
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  showIcons = true,
  showGrowth = true,
  className = '',
  variant = 'default',
}: TrendingMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Speed mapping to CSS animation duration
  const speedMap = {
    slow: '60s',
    normal: '30s',
    fast: '15s',
  };

  // Duplicate topics for seamless scrolling
  const duplicatedTopics = [...topics, ...topics];

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  const getAnimationStyle = () => {
    const duration = speedMap[speed];
    const animationDirection = direction === 'right' ? 'reverse' : 'normal';

    return {
      animationDuration: duration,
      animationDirection,
      animationPlayState: isPaused || !isVisible ? 'paused' : 'running',
    };
  };

  const renderDefaultVariant = () => (
    <div
      ref={marqueeRef}
      className={`sarsa-trending-marquee sarsa-trending-marquee--default ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='sarsa-trending-marquee__header'>
        <div className='sarsa-trending-marquee__label'>
          <span className='sarsa-trending-marquee__icon'>🔥</span>
          <span className='sarsa-trending-marquee__text'>Trending Now</span>
        </div>
      </div>

      <div className='sarsa-trending-marquee__container'>
        <div
          ref={contentRef}
          className='sarsa-trending-marquee__content'
          style={getAnimationStyle()}
        >
          {duplicatedTopics.map((topic, index) => (
            <Link
              key={`${topic.id}-${index}`}
              href={topic.url}
              className='sarsa-trending-marquee__item'
            >
              {showIcons && topic.icon && (
                <span className='sarsa-trending-marquee__item-icon'>
                  {topic.icon}
                </span>
              )}
              <span className='sarsa-trending-marquee__item-text'>
                {topic.text}
              </span>
              {showGrowth && topic.growth && (
                <span className='sarsa-trending-marquee__item-growth'>
                  +{topic.growth}%
                </span>
              )}
              <span className='sarsa-trending-marquee__item-category'>
                {topic.category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTickerVariant = () => (
    <div
      ref={marqueeRef}
      className={`sarsa-trending-marquee sarsa-trending-marquee--ticker ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='sarsa-trending-marquee__ticker-label'>
        <span className='sarsa-trending-marquee__ticker-icon'>📰</span>
        <span className='sarsa-trending-marquee__ticker-text'>BREAKING</span>
      </div>

      <div className='sarsa-trending-marquee__ticker-container'>
        <div
          ref={contentRef}
          className='sarsa-trending-marquee__ticker-content'
          style={getAnimationStyle()}
        >
          {duplicatedTopics.map((topic, index) => (
            <Link
              key={`${topic.id}-${index}`}
              href={topic.url}
              className='sarsa-trending-marquee__ticker-item'
            >
              <span className='sarsa-trending-marquee__ticker-separator'>
                •
              </span>
              <span className='sarsa-trending-marquee__ticker-item-text'>
                {topic.text}
              </span>
              {topic.trending && (
                <span className='sarsa-trending-marquee__ticker-trending'>
                  🔥
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompactVariant = () => (
    <div
      ref={marqueeRef}
      className={`sarsa-trending-marquee sarsa-trending-marquee--compact ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='sarsa-trending-marquee__compact-container'>
        <div
          ref={contentRef}
          className='sarsa-trending-marquee__compact-content'
          style={getAnimationStyle()}
        >
          {duplicatedTopics.map((topic, index) => (
            <Link
              key={`${topic.id}-${index}`}
              href={topic.url}
              className='sarsa-trending-marquee__compact-item'
            >
              {showIcons && topic.icon && (
                <span className='sarsa-trending-marquee__compact-icon'>
                  {topic.icon}
                </span>
              )}
              <span className='sarsa-trending-marquee__compact-text'>
                {topic.text}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNewsVariant = () => (
    <div
      ref={marqueeRef}
      className={`sarsa-trending-marquee sarsa-trending-marquee--news ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='sarsa-trending-marquee__news-header'>
        <div className='sarsa-trending-marquee__news-label'>
          <span className='sarsa-trending-marquee__news-live'></span>
          <span className='sarsa-trending-marquee__news-text'>LIVE</span>
        </div>
        <div className='sarsa-trending-marquee__news-time'>16:40</div>
      </div>

      <div className='sarsa-trending-marquee__news-container'>
        <div
          ref={contentRef}
          className='sarsa-trending-marquee__news-content'
          style={getAnimationStyle()}
        >
          {duplicatedTopics.map((topic, index) => (
            <Link
              key={`${topic.id}-${index}`}
              href={topic.url}
              className='sarsa-trending-marquee__news-item'
            >
              <span className='sarsa-trending-marquee__news-category'>
                {topic.category}:
              </span>
              <span className='sarsa-trending-marquee__news-text'>
                {topic.text}
              </span>
              {topic.trending && (
                <span className='sarsa-trending-marquee__news-trending'>
                  ↗️ TRENDING
                </span>
              )}
              <span className='sarsa-trending-marquee__news-separator'>|</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // Control functions for external access
  const pause = () => setIsPaused(true);
  const play = () => setIsPaused(false);
  const toggle = () => setIsPaused(!isPaused);

  // Expose control functions via ref
  useEffect(() => {
    if (marqueeRef.current) {
      (marqueeRef.current as any).pause = pause;
      (marqueeRef.current as any).play = play;
      (marqueeRef.current as any).toggle = toggle;
    }
  }, []);

  switch (variant) {
    case 'ticker':
      return renderTickerVariant();
    case 'compact':
      return renderCompactVariant();
    case 'news':
      return renderNewsVariant();
    default:
      return renderDefaultVariant();
  }
}
