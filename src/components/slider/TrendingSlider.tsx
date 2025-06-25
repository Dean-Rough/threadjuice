'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import data from '@/util/blogData';
import Link from 'next/link';
import Image from 'next/image';
import { getRandomPersona } from '@/data/personas';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TrendingSiderProps {
  showItem?: number;
}

export default function TrendingSlider({ showItem = 4 }: TrendingSiderProps) {
  return (
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
      {data.slice(0, 8).map((item, i) => {
        const persona = getRandomPersona();
        return (
          <SwiperSlide key={i}>
            <div className='trending__post'>
              <div className='trending__post-thumb tgImage__hover'>
                <Link href='#' className='addWish'>
                  <i className='fal fa-heart' />
                </Link>
                <Link href={`/posts/${item.id}`}>
                  <Image
                    src={`/assets/img/${item.group}/${item.img}`}
                    alt={item.title}
                    width={400}
                    height={250}
                    className='h-auto w-full object-cover'
                  />
                </Link>
              </div>
              <div className='trending__post-content'>
                <ul className='tgbanner__content-meta list-wrap'>
                  <li className='category'>
                    <Link href='/category/viral'>🔥 {item.category}</Link>
                  </li>
                  <li>
                    <span className='by'>By</span>{' '}
                    <Link href={`/personas/${persona.id}`}>{persona.name}</Link>
                  </li>
                </ul>
                <h4 className='title tgcommon__hover'>
                  <Link href={`/posts/${item.id}`}>
                    {item.title} (Reddit viral thread)
                  </Link>
                </h4>
                <ul className='post__activity list-wrap'>
                  <li>
                    <i className='fal fa-signal' />{' '}
                    {Math.floor(Math.random() * 10) + 1}.
                    {Math.floor(Math.random() * 9)}k
                  </li>
                  <li>
                    <Link href={`/posts/${item.id}`}>
                      <i className='fal fa-comment-dots' />{' '}
                      {Math.floor(Math.random() * 500) + 50}
                    </Link>
                  </li>
                  <li>
                    <i className='fal fa-share-alt' />{' '}
                    {Math.floor(Math.random() * 100) + 10}
                  </li>
                </ul>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
