'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SidePostItem {
  id: number;
  image: string;
  category: string;
  title: string;
}

const sidePostData: SidePostItem[] = [
  {
    id: 1,
    image: '/assets/img/category/side_post01.jpg',
    category: 'Technology',
    title: 'Tips for helping to make an your startup a success',
  },
  {
    id: 2,
    image: '/assets/img/category/side_post02.jpg',
    category: 'Travel',
    title: 'Tips for helping to make an your startup a success',
  },
  {
    id: 3,
    image: '/assets/img/category/side_post03.jpg',
    category: 'Gaming',
    title: 'Tips for helping to make an your startup a success',
  },
];

export default function SidePostSlider() {
  return (
    <>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
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
        className='sidePost-active'
      >
        {sidePostData.map(item => (
          <SwiperSlide key={item.id} className='sidePost__item'>
            <div className='relative h-[200px] w-[300px] overflow-hidden rounded-lg'>
              <Image
                src={item.image}
                alt={item.title}
                fill
                className='object-cover'
              />
              <div className='absolute inset-0 bg-black/40' />
              <div className='sidePost__content absolute bottom-4 left-4 right-4 text-white'>
                <Link
                  href='/blog'
                  className='tag mb-2 inline-block rounded bg-orange-500 px-2 py-1 text-xs'
                >
                  {item.category}
                </Link>
                <h5 className='title tgcommon__hover text-white hover:text-orange-400'>
                  <Link href={`/blog/${item.id}`}>{item.title}</Link>
                </h5>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
