import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useIsotope } from '@/hooks/useIsotope';

// Mock isotope-layout
const mockDestroy = jest.fn();
const mockArrange = jest.fn();
const mockReloadItems = jest.fn();
const mockLayout = jest.fn();

const mockIsotope = jest.fn().mockImplementation(() => ({
  destroy: mockDestroy,
  arrange: mockArrange,
  reloadItems: mockReloadItems,
  layout: mockLayout,
}));

jest.mock('isotope-layout', () => ({
  __esModule: true,
  default: mockIsotope,
}));

describe('useIsotope', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.filter).toBe('*');
    expect(result.current.containerRef.current).toBe(null);
  });

  it('should initialize with custom filter', () => {
    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
        filter: '.category-1',
      })
    );

    expect(result.current.filter).toBe('.category-1');
  });

  it('should initialize Isotope when component mounts', async () => {
    // Mock DOM element
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
        layoutMode: 'masonry',
      })
    );

    // Wait for async initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockIsotope).toHaveBeenCalledWith(mockElement, {
      itemSelector: '.item',
      layoutMode: 'masonry',
      masonry: {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
      },
      filter: '*',
      sortBy: undefined,
      sortAscending: true,
    });
  });

  it('should update filter when updateFilter is called', async () => {
    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    act(() => {
      result.current.updateFilter('.category-2');
    });

    expect(result.current.filter).toBe('.category-2');
  });

  it('should call arrange when filter changes', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Update filter
    act(() => {
      result.current.updateFilter('.category-3');
    });

    expect(mockArrange).toHaveBeenCalledWith({ filter: '.category-3' });
  });

  it('should call reloadItems and layout when reloadItems is called', () => {
    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    act(() => {
      result.current.reloadItems();
    });

    expect(mockReloadItems).toHaveBeenCalled();
    expect(mockLayout).toHaveBeenCalled();
  });

  it('should call layout when layout is called', () => {
    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    act(() => {
      result.current.layout();
    });

    expect(mockLayout).toHaveBeenCalled();
  });

  it('should call arrange with options when arrange is called', () => {
    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    const arrangeOptions = { filter: '.test', sortBy: 'name' };

    act(() => {
      result.current.arrange(arrangeOptions);
    });

    expect(mockArrange).toHaveBeenCalledWith(arrangeOptions);
  });

  it('should handle initialization error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockIsotope.mockImplementationOnce(() => {
      throw new Error('Isotope initialization failed');
    });

    const { result } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to initialize Isotope:', 
      expect.any(Error)
    );
    expect(result.current.isLoaded).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should cleanup Isotope on unmount', () => {
    const { unmount } = renderHook(() => 
      useIsotope({
        itemSelector: '.item',
      })
    );

    unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });

  it('should initialize with custom masonry options', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    const masonryOptions = {
      columnWidth: 200,
      gutter: 20,
    };

    renderHook(() => 
      useIsotope({
        itemSelector: '.item',
        layoutMode: 'masonry',
        masonry: masonryOptions,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockIsotope).toHaveBeenCalledWith(mockElement, {
      itemSelector: '.item',
      layoutMode: 'masonry',
      masonry: masonryOptions,
      filter: '*',
      sortBy: undefined,
      sortAscending: true,
    });
  });

  it('should initialize with custom sort options', async () => {
    const mockElement = document.createElement('div');
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement });

    renderHook(() => 
      useIsotope({
        itemSelector: '.item',
        sortBy: 'date',
        sortAscending: false,
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockIsotope).toHaveBeenCalledWith(mockElement, {
      itemSelector: '.item',
      layoutMode: 'masonry',
      masonry: {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
      },
      filter: '*',
      sortBy: 'date',
      sortAscending: false,
    });
  });
});