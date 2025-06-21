'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Autoplay,
  Navigation,
  Pagination,
  EffectFade,
  Thumbs,
} from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';
import { getRandomPersona, WriterPersona } from '@/data/personas';
import data from '@/util/blogData';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  MessageCircle,
  Share2,
  Clock,
  TrendingUp,
  Star,
  ExternalLink,
} from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';

interface FeaturedPost {
  id: number;
  title: string;
  img: string;
  group: string;
  category: string;
  trending: boolean;
  persona: WriterPersona;
  excerpt: string;
  engagement: {
    views: string;
    comments: number;
    shares: number;
  };
  readingTime: number;
  featured: boolean;
  redditSource?: string;
}

interface FeaturedCarouselProps {
  autoplay?: boolean;
  showThumbs?: boolean;
  effect?: 'slide' | 'fade';
  loop?: boolean;
  slidesPerView?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  height?: string;
}

export default function FeaturedCarousel({
  autoplay = true,
  showThumbs = false,
  effect = 'slide',
  loop = true,
  slidesPerView = 1,
  showNavigation = true,
  showPagination = true,
  height = '500px',
}: FeaturedCarouselProps) {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate featured posts from sample data
    const featured = data.slice(0, 5).map(post => ({
      ...post,
      persona: getRandomPersona(),
      excerpt: generateExcerpt(post.title),
      engagement: {
        views: `${Math.floor(Math.random() * 100) + 20}.${Math.floor(Math.random() * 9)}k`,
        comments: Math.floor(Math.random() * 800) + 200,
        shares: Math.floor(Math.random() * 300) + 100,
      },
      readingTime: Math.floor(Math.random() * 8) + 4,
      featured: true,
      redditSource: `r/${getRandomSubreddit()}`,
    }));

    setFeaturedPosts(featured);
    // Remove setTimeout - set loading to false immediately
    setIsLoading(false);
  }, []);

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.realIndex);
  };

  if (isLoading) {
    return (
      <div
        className='featured-carousel-loading flex items-center justify-center'
        style={{ height }}
      >
        <LoadingSpinner size='lg' text='Loading viral highlights...' />
      </div>
    );
  }

  return (
    <div className='featured-carousel'>
      <div className='carousel-header d-flex justify-content-between align-items-center mb-3'>
        <div>
          <h2 className='carousel-title mb-1'>Featured Viral Content</h2>
          <p className='carousel-subtitle mb-0 text-muted'>
            The hottest Reddit threads transformed into engaging stories
          </p>
        </div>
        <div className='carousel-controls d-flex align-items-center gap-2'>
          {autoplay && (
            <button
              className='control-btn'
              onClick={toggleAutoplay}
              title={isPlaying ? 'Pause autoplay' : 'Resume autoplay'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          )}
          <div className='slide-counter'>
            <span className='current-slide'>{activeIndex + 1}</span>
            <span className='separator'>/</span>
            <span className='total-slides'>{featuredPosts.length}</span>
          </div>
        </div>
      </div>

      <div className='carousel-main position-relative'>
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade, Thumbs]}
          slidesPerView={slidesPerView}
          spaceBetween={30}
          loop={loop}
          effect={effect}
          thumbs={showThumbs ? { swiper: thumbsSwiper } : undefined}
          autoplay={
            isPlaying
              ? {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          navigation={
            showNavigation
              ? {
                  nextEl: '.carousel-next',
                  prevEl: '.carousel-prev',
                }
              : false
          }
          pagination={
            showPagination
              ? {
                  el: '.carousel-pagination',
                  clickable: true,
                  dynamicBullets: true,
                }
              : false
          }
          onSlideChange={handleSlideChange}
          className='featured-swiper'
          style={{ height }}
        >
          {featuredPosts.map((post, index) => (
            <SwiperSlide key={post.id}>
              <div className='featured-slide position-relative'>
                {/* Background Image */}
                <div className='slide-bg'>
                  <Image
                    src={`/assets/img/${post.group}/${post.img}`}
                    alt={post.title}
                    fill
                    className='slide-image'
                  />
                  <div className='slide-overlay'></div>
                </div>

                {/* Content */}
                <div className='slide-content position-absolute'>
                  <div className='h-100 container'>
                    <div className='row h-100 align-items-center'>
                      <div className='col-lg-8 col-xl-7'>
                        <div className='slide-text'>
                          {/* Meta Info */}
                          <div className='slide-meta mb-3'>
                            <div className='d-flex align-items-center flex-wrap gap-3'>
                              <span className='category-badge'>
                                <Star size={14} className='me-1' />
                                Featured
                              </span>
                              <span className='trending-badge'>
                                <TrendingUp size={14} className='me-1' />
                                {post.category}
                              </span>
                              <span className='reading-time'>
                                <Clock size={14} className='me-1' />
                                {post.readingTime} min read
                              </span>
                              {post.redditSource && (
                                <span className='reddit-source'>
                                  <ExternalLink size={14} className='me-1' />
                                  {post.redditSource}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <h1 className='slide-title mb-3'>
                            <Link href={`/posts/${post.id}`}>{post.title}</Link>
                          </h1>

                          {/* Excerpt */}
                          <p className='slide-excerpt mb-4'>{post.excerpt}</p>

                          {/* Author & Engagement */}
                          <div className='slide-footer d-flex align-items-center justify-content-between'>
                            <div className='author-info d-flex align-items-center'>
                              <Image
                                src={post.persona.avatar}
                                alt={post.persona.name}
                                width={48}
                                height={48}
                                className='author-avatar me-3'
                              />
                              <div>
                                <h6 className='author-name mb-0'>
                                  <Link href={`/personas/${post.persona.id}`}>
                                    {post.persona.name}
                                  </Link>
                                </h6>
                                <small className='author-role'>
                                  {post.persona.tone} voice
                                </small>
                              </div>
                            </div>

                            <div className='engagement-stats d-flex align-items-center gap-3'>
                              <span className='stat-item'>
                                <Eye size={16} className='me-1' />
                                {post.engagement.views}
                              </span>
                              <span className='stat-item'>
                                <MessageCircle size={16} className='me-1' />
                                {post.engagement.comments}
                              </span>
                              <span className='stat-item'>
                                <Share2 size={16} className='me-1' />
                                {post.engagement.shares}
                              </span>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className='slide-cta mt-4'>
                            <Link
                              href={`/posts/${post.id}`}
                              className='btn btn-primary btn-lg'
                            >
                              Read Full Story
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {isPlaying && index === activeIndex && (
                  <div className='slide-progress'>
                    <div className='progress-bar'></div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation */}
        {showNavigation && (
          <>
            <button className='carousel-nav carousel-prev'>
              <ChevronLeft size={24} />
            </button>
            <button className='carousel-nav carousel-next'>
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Pagination */}
        {showPagination && <div className='carousel-pagination'></div>}
      </div>

      {/* Thumbnails */}
      {showThumbs && (
        <div className='carousel-thumbs mt-3'>
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={5}
            watchSlidesProgress={true}
            className='thumbs-swiper'
            breakpoints={{
              320: { slidesPerView: 2 },
              480: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
          >
            {featuredPosts.map(post => (
              <SwiperSlide key={`thumb-${post.id}`}>
                <div className='thumb-slide'>
                  <Image
                    src={`/assets/img/${post.group}/${post.img}`}
                    alt={post.title}
                    width={120}
                    height={80}
                    className='thumb-image'
                  />
                  <div className='thumb-overlay'>
                    <h6 className='thumb-title'>
                      {post.title.slice(0, 40)}...
                    </h6>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      <style jsx>{`
        .featured-carousel {
          position: relative;
        }

        .carousel-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--tg-heading-color);
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--tg-heading-color);
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: var(--tg-theme-primary);
          border-color: var(--tg-theme-primary);
          color: white;
        }

        .slide-counter {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          color: var(--tg-heading-color);
        }

        .featured-slide {
          height: 100%;
          overflow: hidden;
          border-radius: 12px;
        }

        .slide-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.6) 100%
          );
        }

        .slide-content {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .category-badge,
        .trending-badge,
        .reading-time,
        .reddit-source {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .slide-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: white;
          margin-bottom: 1rem;
        }

        .slide-title a {
          color: inherit;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .slide-title a:hover {
          color: var(--tg-theme-primary);
        }

        .slide-excerpt {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        .author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .author-name a {
          color: white;
          text-decoration: none;
          font-weight: 600;
        }

        .author-role {
          color: rgba(255, 255, 255, 0.7);
          text-transform: capitalize;
        }

        .engagement-stats .stat-item {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        .carousel-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .carousel-nav:hover {
          background: var(--tg-theme-primary);
          border-color: var(--tg-theme-primary);
        }

        .carousel-prev {
          left: 20px;
        }

        .carousel-next {
          right: 20px;
        }

        .carousel-pagination {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .slide-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          z-index: 3;
        }

        .progress-bar {
          height: 100%;
          background: var(--tg-theme-primary);
          width: 0;
          animation: slideProgress 5s linear infinite;
        }

        @keyframes slideProgress {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .thumb-slide {
          position: relative;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }

        .thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 8px;
        }

        .thumb-title {
          color: white;
          font-size: 0.75rem;
          margin: 0;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .slide-title {
            font-size: 2rem;
          }

          .carousel-nav {
            display: none;
          }

          .slide-footer {
            flex-direction: column;
            gap: 1rem;
          }

          .engagement-stats {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

// Helper functions
function generateExcerpt(title: string): string {
  const excerpts = [
    'This viral Reddit thread started innocent enough, but quickly spiraled into something absolutely fascinating. What began as a simple question unleashed a torrent of responses that will restore your faith in internet humanity.',
    "You won't believe how this seemingly ordinary Reddit post became the most engaging thread of the week. The comments section turned into a masterclass in storytelling and human connection.",
    'From zero to viral in under 6 hours - this Reddit thread captured hearts and minds across the internet. The story that unfolds in the comments is both heartwarming and utterly unexpected.',
    'This is why we love Reddit: what started as casual conversation evolved into something profound. The community responses will make you laugh, cry, and question everything you thought you knew.',
    "Sometimes the internet gets it absolutely right. This Reddit thread proves that among all the chaos, there's still room for genuine human moments that bring us together.",
  ];

  return excerpts[Math.floor(Math.random() * excerpts.length)];
}

function getRandomSubreddit(): string {
  const subreddits = [
    'AskReddit',
    'todayilearned',
    'funny',
    'pics',
    'worldnews',
    'gaming',
    'aww',
    'mildlyinteresting',
    'Showerthoughts',
    'LifeProTips',
    'science',
    'technology',
    'movies',
    'music',
    'books',
  ];

  return subreddits[Math.floor(Math.random() * subreddits.length)];
}
