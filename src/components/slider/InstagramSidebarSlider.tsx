'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const sidebarImages = [
  '/assets/img/instagram/side_insta01.jpg',
  '/assets/img/instagram/side_insta02.jpg',
  '/assets/img/instagram/side_insta03.jpg',
  '/assets/img/instagram/side_insta04.jpg',
];

export default function InstagramSidebarSlider() {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={4}
        spaceBetween={0}
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
          },
          575: {
            slidesPerView: 2,
          },
          767: {
            slidesPerView: 3,
          },
          991: {
            slidesPerView: 3,
          },
          1199: {
            slidesPerView: 3,
          },
          1350: {
            slidesPerView: 3,
          },
        }}
        className='swiper-wrapper'
      >
        {sidebarImages.map((src, index) => (
          <SwiperSlide key={index}>
            <Link href='https://www.instagram.com/' target='_blank'>
              <Image
                src={src}
                alt={`Instagram sidebar image ${index + 1}`}
                width={150}
                height={150}
                className='h-auto w-full object-cover'
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
