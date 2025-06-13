'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Link from 'next/link';
import { Post } from '@/types/database';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface PopularSliderProps {
  posts: Post[];
  className?: string;
}

export const PopularSlider: React.FC<PopularSliderProps> = ({
  posts,
  className = '',
}) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className={`popular-slider ${className}`}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        className='popular-swiper'
      >
        {posts.map(post => (
          <SwiperSlide key={post.id}>
            <div className='popular-post-card'>
              <div className='post-thumb'>
                <Link href={`/post/${post.slug}`}>
                  <img
                    src={post.featured_image || '/assets/imgs/placeholder.jpg'}
                    alt={post.title}
                    className='img-fluid'
                  />
                </Link>
                <div className='post-category'>
                  <Link href={`/category/${post.category}`}>
                    {post.category}
                  </Link>
                </div>
              </div>
              <div className='post-content'>
                <h3 className='post-title'>
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                </h3>
                <div className='post-meta'>
                  <span className='post-date'>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className='post-views'>{post.view_count} views</span>
                </div>
                <p className='post-excerpt'>{post.hook}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PopularSlider;
