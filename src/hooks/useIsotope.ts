'use client';

import { useEffect, useRef, useState } from 'react';

interface IsotopeOptions {
  itemSelector: string;
  layoutMode?: 'masonry' | 'fitRows' | 'cellsByRow';
  masonry?: {
    columnWidth?: number | string;
    gutter?: number | string;
  };
  filter?: string;
  sortBy?: string;
  sortAscending?: boolean;
}

interface IsotopeInstance {
  arrange: (options?: { filter?: string; sortBy?: string }) => void;
  reloadItems: () => void;
  layout: () => void;
  destroy: () => void;
}

export const useIsotope = (options: IsotopeOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isotopeRef = useRef<IsotopeInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState(options.filter || '*');

  useEffect(() => {
    let isMounted = true;

    const initIsotope = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const Isotope = (await import('isotope-layout')).default;

        if (!containerRef.current || !isMounted) return;

        isotopeRef.current = new Isotope(containerRef.current, {
          itemSelector: options.itemSelector,
          layoutMode: options.layoutMode || 'masonry',
          masonry: options.masonry || {
            columnWidth: '.grid-sizer',
            gutter: '.gutter-sizer',
          },
          filter: filter,
          sortBy: options.sortBy,
          sortAscending: options.sortAscending !== false,
        });

        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.warn('Failed to initialize Isotope:', error);
      }
    };

    if (typeof window !== 'undefined') {
      initIsotope();
    }

    return () => {
      isMounted = false;
      if (isotopeRef.current) {
        isotopeRef.current.destroy();
        isotopeRef.current = null;
      }
    };
  }, [options.itemSelector, options.layoutMode, options.masonry, options.sortBy, options.sortAscending]);

  // Handle filter changes
  useEffect(() => {
    if (isotopeRef.current && isLoaded) {
      isotopeRef.current.arrange({ filter });
    }
  }, [filter, isLoaded]);

  const updateFilter = (newFilter: string) => {
    setFilter(newFilter);
  };

  const reloadItems = () => {
    if (isotopeRef.current) {
      isotopeRef.current.reloadItems();
      isotopeRef.current.layout();
    }
  };

  const layout = () => {
    if (isotopeRef.current) {
      isotopeRef.current.layout();
    }
  };

  const arrange = (arrangeOptions?: { filter?: string; sortBy?: string }) => {
    if (isotopeRef.current) {
      isotopeRef.current.arrange(arrangeOptions);
    }
  };

  return {
    containerRef,
    isLoaded,
    filter,
    updateFilter,
    reloadItems,
    layout,
    arrange,
  };
};

export default useIsotope;