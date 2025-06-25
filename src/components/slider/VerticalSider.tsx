'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import Image from 'next/image';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const trendingData = [
  {
    id: 1,
    image: '/assets/img/category/trending_thumb01.png',
    title: "How to climb the career latter and don't waste your youth...",
  },
  {
    id: 2,
    image: '/assets/img/category/trending_thumb02.png',
    title: 'Observable universes each of which would comprise...',
  },
];

export default function VerticalSider() {
  return (
    <>
      <Swiper
        direction={'vertical'}
        modules={[Pagination]}
        slidesPerView={1}
        pagination={{
          clickable: true,
        }}
        className='tgslider__trending-active'
      >
        {trendingData.map(item => (
          <SwiperSlide key={item.id} className='tgslider__trending-item'>
            <div className='tgslider__trending-thumb'>
              <Link href={`/blog/${item.id}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={150}
                  height={100}
                  className='h-auto w-full object-cover'
                />
              </Link>
            </div>
            <div className='tgslider__trending-content'>
              <h6 className='title'>
                <Link href={`/blog/${item.id}`}>{item.title}</Link>
              </h6>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
