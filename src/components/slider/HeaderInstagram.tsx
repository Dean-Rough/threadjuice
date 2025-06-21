'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const instagramImages = [
  '/assets/img/instagram/insta01.jpg',
  '/assets/img/instagram/insta02.jpg',
  '/assets/img/instagram/insta03.jpg',
  '/assets/img/instagram/insta04.jpg',
  '/assets/img/instagram/insta05.jpg',
  '/assets/img/instagram/insta06.jpg',
];

export default function HeaderInstagram() {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={5}
        spaceBetween={0}
        loop={true}
        pagination={{
          clickable: true,
          el: '.block-gallery-pagination',
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          575: {
            slidesPerView: 2,
            spaceBetween: 0,
          },
          767: {
            slidesPerView: 3,
            spaceBetween: 0,
          },
          991: {
            slidesPerView: 4,
            spaceBetween: 0,
          },
          1199: {
            slidesPerView: 4,
            spaceBetween: 0,
          },
          1350: {
            slidesPerView: 5,
            spaceBetween: 0,
          },
        }}
        className='swiper-wrapper'
      >
        {instagramImages.map((src, index) => (
          <SwiperSlide key={index}>
            <div className='header__instagram-item'>
              <a href='#' className='popup-image'>
                <Image 
                  src={src} 
                  alt={`Instagram image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
