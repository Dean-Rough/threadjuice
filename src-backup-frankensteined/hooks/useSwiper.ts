'use client';

import { useEffect, useRef, useState } from 'react';

interface SwiperOptions {
  slidesPerView?: number | 'auto';
  spaceBetween?: number;
  loop?: boolean;
  autoplay?: {
    delay: number;
    disableOnInteraction?: boolean;
  };
  pagination?: {
    clickable?: boolean;
    dynamicBullets?: boolean;
  };
  navigation?: boolean;
  breakpoints?: Record<
    number,
    {
      slidesPerView?: number;
      spaceBetween?: number;
    }
  >;
  effect?: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip';
  direction?: 'horizontal' | 'vertical';
}

interface SwiperInstance {
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number) => void;
  update: () => void;
  destroy: () => void;
  autoplay: {
    start: () => void;
    stop: () => void;
  };
}

export const useSwiper = (options: SwiperOptions = {}) => {
  const swiperRef = useRef<HTMLDivElement>(null);
  const swiperInstanceRef = useRef<SwiperInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initSwiper = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const {
          Swiper,
          Navigation,
          Pagination,
          Autoplay,
          EffectFade,
          EffectCube,
          EffectCoverflow,
          EffectFlip,
        } = await import('swiper');
        const { register } = await import('swiper/element/bundle');

        // Register Swiper custom elements
        register();

        if (!swiperRef.current || !isMounted) return;

        // Configure modules based on options
        const modules = [Navigation, Pagination];
        if (options.autoplay) modules.push(Autoplay);
        if (options.effect === 'fade') modules.push(EffectFade);
        if (options.effect === 'cube') modules.push(EffectCube);
        if (options.effect === 'coverflow') modules.push(EffectCoverflow);
        if (options.effect === 'flip') modules.push(EffectFlip);

        swiperInstanceRef.current = new Swiper(swiperRef.current, {
          modules,
          slidesPerView: options.slidesPerView || 1,
          spaceBetween: options.spaceBetween || 30,
          loop: options.loop || false,
          direction: options.direction || 'horizontal',
          effect: options.effect || 'slide',

          // Autoplay configuration
          autoplay: options.autoplay
            ? {
                delay: options.autoplay.delay,
                disableOnInteraction:
                  options.autoplay.disableOnInteraction !== false,
              }
            : false,

          // Pagination configuration
          pagination: options.pagination
            ? {
                el: '.swiper-pagination',
                clickable: options.pagination.clickable !== false,
                dynamicBullets: options.pagination.dynamicBullets || false,
              }
            : false,

          // Navigation configuration
          navigation: options.navigation
            ? {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }
            : false,

          // Responsive breakpoints
          breakpoints: options.breakpoints || {
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
              spaceBetween: 40,
            },
          },

          // Event callbacks
          on: {
            slideChange: () => {
              if (swiperInstanceRef.current && isMounted) {
                setActiveIndex(swiperInstanceRef.current.realIndex || 0);
              }
            },
          },
        }) as unknown as SwiperInstance;

        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.warn('Failed to initialize Swiper:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initSwiper();
    }

    return () => {
      isMounted = false;
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy();
        swiperInstanceRef.current = null;
      }
    };
  }, []);

  const slideNext = () => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideNext();
    }
  };

  const slidePrev = () => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slidePrev();
    }
  };

  const slideTo = (index: number) => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideTo(index);
    }
  };

  const update = () => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.update();
    }
  };

  const startAutoplay = () => {
    if (swiperInstanceRef.current?.autoplay) {
      swiperInstanceRef.current.autoplay.start();
    }
  };

  const stopAutoplay = () => {
    if (swiperInstanceRef.current?.autoplay) {
      swiperInstanceRef.current.autoplay.stop();
    }
  };

  return {
    swiperRef,
    isLoaded,
    activeIndex,
    slideNext,
    slidePrev,
    slideTo,
    update,
    startAutoplay,
    stopAutoplay,
  };
};

export default useSwiper;
