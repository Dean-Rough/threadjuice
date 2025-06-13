'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Link from 'next/link';
import { Post } from '@/types/database';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TrendingSliderProps {
  posts: Post[];
}

const TrendingSlider: React.FC<TrendingSliderProps> = ({ posts }) => {
  return (
    <div className='trending-slider'>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4000,
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
        className='trending-swiper'
      >
        {posts.map(post => (
          <SwiperSlide key={post.id}>
            <div className='trending-post-card'>
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
                {post.trending_score > 50 && (
                  <span className='trending-badge'>
                    <i className='fas fa-fire' />
                  </span>
                )}
              </div>
              <div className='post-content'>
                <h3 className='post-title'>
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                </h3>
                <div className='post-meta'>
                  <span className='post-author'>By ThreadJuice</span>
                  <span className='post-date'>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
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

export default TrendingSlider;
