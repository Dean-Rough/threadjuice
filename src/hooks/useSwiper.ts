'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Swiper types
interface SwiperOptions {
  slidesPerView?: number | 'auto';
  spaceBetween?: number;
  loop?: boolean;
  autoplay?: {
    delay?: number;
    disableOnInteraction?: boolean;
    pauseOnMouseEnter?: boolean;
  } | boolean;
  pagination?: {
    el?: string;
    clickable?: boolean;
    dynamicBullets?: boolean;
  } | boolean;
  navigation?: {
    nextEl?: string;
    prevEl?: string;
  } | boolean;
  scrollbar?: {
    el?: string;
    draggable?: boolean;
  } | boolean;
  breakpoints?: Record<number, Partial<SwiperOptions>>;
  direction?: 'horizontal' | 'vertical';
  effect?: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'cards' | 'creative';
  speed?: number;
  grabCursor?: boolean;
  centeredSlides?: boolean;
  initialSlide?: number;
  watchOverflow?: boolean;
  on?: Record<string, (...args: any[]) => void>;
}

interface SwiperInstance {
  slideNext: (speed?: number, runCallbacks?: boolean) => void;
  slidePrev: (speed?: number, runCallbacks?: boolean) => void;
  slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
  update: () => void;
  destroy: () => void;
  autoplay?: {
    start: () => void;
    stop: () => void;
    pause: () => void;
    resume: () => void;
  };
  activeIndex: number;
  realIndex: number;
  slides: HTMLElement[];
}

export interface UseSwiperReturn {
  swiperRef: React.RefObject<HTMLDivElement | null>;
  swiperInstance: SwiperInstance | null;
  slideNext: () => void;
  slidePrev: () => void;
  slideTo: (index: number) => void;
  startAutoplay: () => void;
  stopAutoplay: () => void;
  update: () => void;
  destroy: () => void;
  isReady: boolean;
  currentSlide: number;
  error: Error | null;
}

export function useSwiper(options: SwiperOptions = {}): UseSwiperReturn {
  const swiperRef = useRef<HTMLDivElement>(null);
  const swiperInstanceRef = useRef<SwiperInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Default options
  const defaultOptions: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: false,
    grabCursor: true,
    watchOverflow: true,
    speed: 400,
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
    },
    ...options,
  };

  // Initialize Swiper
  useEffect(() => {
    if (!swiperRef.current) return;

    let swiperInstance: SwiperInstance | null = null;

    const initSwiper = async () => {
      try {
        // Dynamically import Swiper modules
        const { Swiper } = await import('swiper');
        const { Navigation, Pagination, Scrollbar, Autoplay, EffectFade, EffectCube, EffectCoverflow, EffectFlip, EffectCards, EffectCreative } = await import('swiper/modules');

        // Configure modules based on options
        const modules = [];
        if (defaultOptions.navigation) modules.push(Navigation);
        if (defaultOptions.pagination) modules.push(Pagination);
        if (defaultOptions.scrollbar) modules.push(Scrollbar);
        if (defaultOptions.autoplay) modules.push(Autoplay);
        
        // Add effect modules
        switch (defaultOptions.effect) {
          case 'fade':
            modules.push(EffectFade);
            break;
          case 'cube':
            modules.push(EffectCube);
            break;
          case 'coverflow':
            modules.push(EffectCoverflow);
            break;
          case 'flip':
            modules.push(EffectFlip);
            break;
          case 'cards':
            modules.push(EffectCards);
            break;
          case 'creative':
            modules.push(EffectCreative);
            break;
        }

        if (swiperRef.current) {
          swiperInstance = new Swiper(swiperRef.current, {
            ...defaultOptions,
            modules,
            on: {
              slideChange: (swiper) => {
                setCurrentSlide(swiper.activeIndex);
                defaultOptions.on?.slideChange?.(swiper);
              },
              init: (swiper) => {
                setCurrentSlide(swiper.activeIndex);
                defaultOptions.on?.init?.(swiper);
              },
              ...defaultOptions.on,
            },
          }) as SwiperInstance;

          swiperInstanceRef.current = swiperInstance;
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize Swiper');
        setError(error);
        console.error('Swiper initialization failed:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initSwiper, 100);

    return () => {
      clearTimeout(timer);
      if (swiperInstance) {
        swiperInstance.destroy();
      }
      swiperInstanceRef.current = null;
      setIsReady(false);
    };
  }, []);

  // Slide navigation functions
  const slideNext = useCallback(() => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideNext();
    }
  }, []);

  const slidePrev = useCallback(() => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slidePrev();
    }
  }, []);

  const slideTo = useCallback((index: number) => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.slideTo(index);
    }
  }, []);

  // Autoplay controls
  const startAutoplay = useCallback(() => {
    if (swiperInstanceRef.current?.autoplay) {
      swiperInstanceRef.current.autoplay.start();
    }
  }, []);

  const stopAutoplay = useCallback(() => {
    if (swiperInstanceRef.current?.autoplay) {
      swiperInstanceRef.current.autoplay.stop();
    }
  }, []);

  // Update function
  const update = useCallback(() => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.update();
    }
  }, []);

  // Destroy function
  const destroy = useCallback(() => {
    if (swiperInstanceRef.current) {
      swiperInstanceRef.current.destroy();
      swiperInstanceRef.current = null;
      setIsReady(false);
    }
  }, []);

  return {
    swiperRef,
    swiperInstance: swiperInstanceRef.current,
    slideNext,
    slidePrev,
    slideTo,
    startAutoplay,
    stopAutoplay,
    update,
    destroy,
    isReady,
    currentSlide,
    error,
  };
}

export default useSwiper;