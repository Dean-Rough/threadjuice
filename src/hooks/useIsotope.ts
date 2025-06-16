'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Types for Isotope
interface IsotopeOptions {
  itemSelector?: string;
  layoutMode?: 'masonry' | 'fitRows' | 'cellsByRow' | 'masonryHorizontal' | 'fitColumns' | 'cellsByColumn' | 'horiz' | 'vert';
  masonry?: {
    columnWidth?: number | string;
    gutter?: number | string;
  };
  fitRows?: {
    gutter?: number | string;
  };
  getSortData?: Record<string, string | ((element: Element) => string | number)>;
  sortBy?: string;
  sortAscending?: boolean;
  filter?: string;
  animationEngine?: 'best-available' | 'css' | 'jquery';
  animationOptions?: {
    duration?: number;
    easing?: string;
    queue?: boolean;
  };
  stamp?: string;
  resize?: boolean;
  initLayout?: boolean;
}

interface IsotopeInstance {
  arrange: (options?: { filter?: string; sortBy?: string }) => void;
  layout: () => void;
  reloadItems: () => void;
  destroy: () => void;
  insert: (elements: Element | Element[]) => void;
  remove: (elements: Element | Element[]) => void;
  stamp: (elements: Element | Element[]) => void;
  unstamp: (elements: Element | Element[]) => void;
}

export interface UseIsotopeReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isotopeInstance: IsotopeInstance | null;
  filter: (filterValue: string) => void;
  sort: (sortBy: string) => void;
  layout: () => void;
  destroy: () => void;
  isReady: boolean;
  error: Error | null;
}

export function useIsotope(options: IsotopeOptions = {}): UseIsotopeReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const isotopeRef = useRef<IsotopeInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Default options
  const defaultOptions: IsotopeOptions = {
    itemSelector: '.isotope-item',
    layoutMode: 'masonry',
    masonry: {
      columnWidth: '.isotope-item',
      gutter: 20,
    },
    animationEngine: 'best-available',
    animationOptions: {
      duration: 400,
      easing: 'linear',
      queue: false,
    },
    resize: true,
    initLayout: true,
    ...options,
  };

  // Initialize Isotope
  useEffect(() => {
    if (!containerRef.current) return;

    let isotopeInstance: IsotopeInstance | null = null;

    const initIsotope = async () => {
      try {
        // Dynamically import Isotope
        const Isotope = (await import('isotope-layout')).default;
        
        if (containerRef.current) {
          isotopeInstance = new Isotope(containerRef.current, defaultOptions) as IsotopeInstance;
          isotopeRef.current = isotopeInstance;
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize Isotope');
        setError(error);
        console.error('Isotope initialization failed:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initIsotope, 100);

    return () => {
      clearTimeout(timer);
      if (isotopeInstance) {
        isotopeInstance.destroy();
      }
      isotopeRef.current = null;
      setIsReady(false);
    };
  }, []);

  // Filter function
  const filter = useCallback((filterValue: string) => {
    if (isotopeRef.current) {
      isotopeRef.current.arrange({ filter: filterValue });
    }
  }, []);

  // Sort function
  const sort = useCallback((sortBy: string) => {
    if (isotopeRef.current) {
      isotopeRef.current.arrange({ sortBy });
    }
  }, []);

  // Layout function
  const layout = useCallback(() => {
    if (isotopeRef.current) {
      isotopeRef.current.layout();
    }
  }, []);

  // Destroy function
  const destroy = useCallback(() => {
    if (isotopeRef.current) {
      isotopeRef.current.destroy();
      isotopeRef.current = null;
      setIsReady(false);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isotopeRef.current) {
        setTimeout(() => {
          isotopeRef.current?.layout();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    containerRef,
    isotopeInstance: isotopeRef.current,
    filter,
    sort,
    layout,
    destroy,
    isReady,
    error,
  };
}

export default useIsotope;