'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import data from '@/util/blogData';
import Link from 'next/link';
import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function TechnologySlider() {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={true}
        loop={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: '.block-gallery-pagination',
        }}
        className='row tgslider__active'
      >
        {data.slice(72, 75).map((item, i) => (
          <SwiperSlide className='col-12' key={i}>
            <div className='tgslider__item'>
              <div className='tgslider__thumb tgImage__hover'>
                <Link href={`/blog/${item.id}`}>
                  <Image
                    src={`/assets/img/${item.group}/${item.img}`}
                    alt={item.title || 'Technology post image'}
                    width={800}
                    height={500}
                    className='h-auto w-full object-cover'
                  />
                </Link>
              </div>
              <div
                className='tgslider__content'
                data-animation-in='tg-fadeInUp'
                data-delay-in='.1'
              >
                <ul className='tgbanner__content-meta list-wrap'>
                  <li className='category'>
                    <Link href='/blog'>{item.category}</Link>
                  </li>
                  <li>
                    <span className='by'>By</span>{' '}
                    <Link href='/blog'>alonso d.</Link>
                  </li>
                  <li>nov 22, 2022</li>
                </ul>
                <h2 className='title tgcommon__hover'>
                  <Link href={`/blog/${item.id}`}>{item.title}</Link>
                </h2>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
