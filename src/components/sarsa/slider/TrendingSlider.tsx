'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Mock data structure for now
const mockData = [
  {
    id: 1,
    title:
      'Reddit user discovers mind-blowing life hack that changes everything',
    category: 'Lifestyle',
    author: 'The Snarky Sage',
    img: 'blog01.jpg',
    group: 'blog',
    trending: true,
    views: '2.1k',
    comments: 89,
    shares: 45,
  },
  {
    id: 2,
    title:
      'Tech company accidentally reveals the future of AI in leaked documents',
    category: 'Technology',
    author: 'Down-to-Earth Buddy',
    img: 'blog02.jpg',
    group: 'blog',
    trending: false,
    views: '1.8k',
    comments: 156,
    shares: 78,
  },
  {
    id: 3,
    title: 'Travel blogger exposes tourist trap that nobody talks about',
    category: 'Travel',
    author: 'The Dry Cynic',
    img: 'blog03.jpg',
    group: 'blog',
    trending: true,
    views: '3.2k',
    comments: 234,
    shares: 123,
  },
  {
    id: 4,
    title: 'Gaming community uncovers hidden easter egg after 10 years',
    category: 'Gaming',
    author: 'The Snarky Sage',
    img: 'blog04.jpg',
    group: 'blog',
    trending: false,
    views: '1.5k',
    comments: 67,
    shares: 34,
  },
];

interface TrendingSliderProps {
  showItem?: number;
}

export default function TrendingSlider({ showItem = 3 }: TrendingSliderProps) {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={showItem}
        spaceBetween={30}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: '.block-gallery-pagination',
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 30,
          },
          575: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
          767: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          991: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1199: {
            slidesPerView: showItem,
            spaceBetween: 30,
          },
          1350: {
            slidesPerView: showItem,
            spaceBetween: 30,
          },
        }}
        className='swiper-wrapper'
      >
        {mockData.map((item, i) => (
          <SwiperSlide key={i}>
            <div className='trending__post'>
              <div className='trending__post-thumb tgImage__hover'>
                <Link href='/#' className='addWish'>
                  <i className='fal fa-heart' />
                </Link>
                <Link href={`/posts/${item.id}`}>
                  <img
                    src={`/assets/img/${item.group}/${item.img}`}
                    alt={item.title}
                  />
                </Link>
                {item.trending && (
                  <span className='is_trend'>
                    <i className='fas fa-bolt' />
                  </span>
                )}
              </div>
              <div className='trending__post-content'>
                <ul className='tgbanner__content-meta list-wrap'>
                  <li className='category'>
                    <Link href={`/category/${item.category.toLowerCase()}`}>
                      {item.category}
                    </Link>
                  </li>
                  <li>
                    <span className='by'>By</span>{' '}
                    <Link
                      href={`/personas/${item.author.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.author}
                    </Link>
                  </li>
                </ul>
                <h4 className='title tgcommon__hover'>
                  <Link href={`/posts/${item.id}`}>{item.title}</Link>
                </h4>
                <ul className='post__activity list-wrap'>
                  <li>
                    <i className='fal fa-signal' /> {item.views}
                  </li>
                  <li>
                    <Link href={`/posts/${item.id}`}>
                      <i className='fal fa-comment-dots' /> {item.comments}
                    </Link>
                  </li>
                  <li>
                    <i className='fal fa-share-alt' /> {item.shares}
                  </li>
                </ul>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
