'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import data from '@/util/blogData';
import Link from 'next/link';
import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

export default function PopularSlider2() {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={3}
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
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1350: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        className='swiper-wrapper'
      >
        {data.slice(101, 105).map((item, i) => (
          <SwiperSlide key={i}>
            <div className='trending__post'>
              <div className='trending__post-thumb tgImage__hover'>
                <Link href='/blog' className='tags'>
                  {item.category}
                </Link>
                <Link href={`/blog/${item.id}`} className='image'>
                  <Image
                    src={`/assets/img/${item.group}/${item.img}`}
                    alt={item.title || 'Popular post image'}
                    width={300}
                    height={200}
                    className="w-full h-auto object-cover"
                  />
                </Link>
              </div>
              <div className='trending__post-content'>
                <h3 className='post--count'>0{i + 1}</h3>
                <h4 className='title tgcommon__hover'>
                  <Link href={`/blog/${item.id}`}>{item.title}</Link>
                </h4>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
