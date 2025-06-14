import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSwiper } from '@/hooks/useSwiper';

// Mock Swiper modules
const mockSlideNext = jest.fn();
const mockSlidePrev = jest.fn();
const mockSlideTo = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();
const mockAutoplayStart = jest.fn();
const mockAutoplayStop = jest.fn();

const mockSwiperInstance = {
  slideNext: mockSlideNext,
  slidePrev: mockSlidePrev,
  slideTo: mockSlideTo,
  update: mockUpdate,
  destroy: mockDestroy,
  autoplay: {
    start: mockAutoplayStart,
    stop: mockAutoplayStop,
  },
  realIndex: 0,
};

const mockSwiper = jest.fn().mockImplementation(() => mockSwiperInstance);
const mockRegister = jest.fn();

jest.mock('swiper', () => ({
  Swiper: mockSwiper,
  Navigation: jest.fn(),
  Pagination: jest.fn(),
  Autoplay: jest.fn(),
  EffectFade: jest.fn(),
  EffectCube: jest.fn(),
  EffectCoverflow: jest.fn(),
  EffectFlip: jest.fn(),
}));

jest.mock('swiper/element/bundle', () => ({
  register: mockRegister,
}));

describe('useSwiper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSwiper());

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.activeIndex).toBe(0);
    expect(result.current.swiperRef.current).toBe(null);
  });

  it('should initialize Swiper with default options', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    renderHook(() => useSwiper());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(mockSwiper).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        slidesPerView: 1,
        spaceBetween: 30,
        loop: false,
        direction: 'horizontal',
        effect: 'slide',
        autoplay: false,
        pagination: false,
        navigation: false,
      })
    );
  });

  it('should initialize Swiper with custom options', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const options = {
      slidesPerView: 3,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        clickable: true,
        dynamicBullets: true,
      },
      navigation: true,
      effect: 'fade' as const,
    };

    renderHook(() => useSwiper(options));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSwiper).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        slidesPerView: 3,
        spaceBetween: 20,
        loop: true,
        effect: 'fade',
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      })
    );
  });

  it('should call slideNext when slideNext is called', () => {
    const { result } = renderHook(() => useSwiper());

    act(() => {
      result.current.slideNext();
    });

    expect(mockSlideNext).toHaveBeenCalled();
  });

  it('should call slidePrev when slidePrev is called', () => {
    const { result } = renderHook(() => useSwiper());

    act(() => {
      result.current.slidePrev();
    });

    expect(mockSlidePrev).toHaveBeenCalled();
  });

  it('should call slideTo when slideTo is called', () => {
    const { result } = renderHook(() => useSwiper());

    act(() => {
      result.current.slideTo(2);
    });

    expect(mockSlideTo).toHaveBeenCalledWith(2);
  });

  it('should call update when update is called', () => {
    const { result } = renderHook(() => useSwiper());

    act(() => {
      result.current.update();
    });

    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should call autoplay start when startAutoplay is called', () => {
    const { result } = renderHook(() => useSwiper());

    act(() => {
      result.current.startAutoplay();
    });

    expect(mockAutoplayStart).toHaveBeenCalled();
  });

  it('should call autoplay stop when stopAutoplay is called', () => {
    const { result } = renderHook(() => useSwiper());

    act(() => {
      result.current.stopAutoplay();
    });

    expect(mockAutoplayStop).toHaveBeenCalled();
  });

  it('should update activeIndex when slide changes', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const { result } = renderHook(() => useSwiper());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Get the slide change callback
    const slideChangeCallback = mockSwiper.mock.calls[0][1].on.slideChange;

    // Mock realIndex change
    mockSwiperInstance.realIndex = 2;

    act(() => {
      slideChangeCallback();
    });

    expect(result.current.activeIndex).toBe(2);
  });

  it('should handle initialization error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockSwiper.mockImplementationOnce(() => {
      throw new Error('Swiper initialization failed');
    });

    const { result } = renderHook(() => useSwiper());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to initialize Swiper:',
      expect.any(Error)
    );
    expect(result.current.isLoaded).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should cleanup Swiper on unmount', () => {
    const { unmount } = renderHook(() => useSwiper());

    unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });

  it('should include correct modules based on options', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const options = {
      autoplay: { delay: 1000 },
      effect: 'cube' as const,
    };

    renderHook(() => useSwiper(options));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const swiperCall = mockSwiper.mock.calls[0];
    expect(swiperCall[1].modules).toEqual(
      expect.arrayContaining([
        expect.anything(), // Navigation
        expect.anything(), // Pagination
        expect.anything(), // Autoplay
        expect.anything(), // EffectCube
      ])
    );
  });

  it('should use custom breakpoints if provided', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const customBreakpoints = {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 4 },
    };

    renderHook(() => useSwiper({ breakpoints: customBreakpoints }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSwiper).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        breakpoints: customBreakpoints,
      })
    );
  });

  it('should not call functions when swiper instance is not available', () => {
    const { result } = renderHook(() => useSwiper());

    // These should not throw errors
    act(() => {
      result.current.slideNext();
      result.current.slidePrev();
      result.current.slideTo(1);
      result.current.update();
      result.current.startAutoplay();
      result.current.stopAutoplay();
    });

    // Functions should not be called when instance is null
    expect(mockSlideNext).not.toHaveBeenCalled();
    expect(mockSlidePrev).not.toHaveBeenCalled();
    expect(mockSlideTo).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockAutoplayStart).not.toHaveBeenCalled();
    expect(mockAutoplayStop).not.toHaveBeenCalled();
  });
});
