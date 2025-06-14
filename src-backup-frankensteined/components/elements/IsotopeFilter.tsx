'use client';

import { useEffect, useRef, useState } from 'react';

interface IsotopeFilterProps {
  children: React.ReactNode;
  filters: string[];
  defaultFilter?: string;
  className?: string;
  itemSelector?: string;
  layoutMode?: 'masonry' | 'fitRows' | 'vertical';
}

export const IsotopeFilter: React.FC<IsotopeFilterProps> = ({
  children,
  filters,
  defaultFilter = '*',
  className = '',
  itemSelector = '.isotope-item',
  layoutMode = 'masonry',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isotopeRef = useRef<any>(null);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  useEffect(() => {
    const initIsotope = async () => {
      if (typeof window !== 'undefined' && containerRef.current) {
        try {
          const Isotope = (await import('isotope-layout')).default;

          isotopeRef.current = new Isotope(containerRef.current, {
            itemSelector,
            layoutMode,
            masonry: {
              columnWidth: '.isotope-sizer',
              gutter: '.isotope-gutter-sizer',
            },
            percentPosition: true,
            animationOptions: {
              duration: 750,
              easing: 'linear',
            },
          });

          // Initial layout
          if (defaultFilter !== '*') {
            isotopeRef.current.arrange({ filter: defaultFilter });
          }
        } catch (error) {
          console.warn('Isotope failed to load:', error);
        }
      }
    };

    initIsotope();

    return () => {
      if (isotopeRef.current) {
        isotopeRef.current.destroy();
      }
    };
  }, [defaultFilter, itemSelector, layoutMode]);

  const handleFilterChange = (filter: string) => {
    if (isotopeRef.current) {
      setActiveFilter(filter);
      isotopeRef.current.arrange({
        filter: filter === '*' ? '*' : `.${filter}`,
      });
    }
  };

  return (
    <div className={`isotope-wrapper ${className}`.trim()}>
      {/* Filter Buttons */}
      <div className='isotope-filters'>
        <button
          className={`filter-btn ${activeFilter === '*' ? 'active' : ''}`}
          onClick={() => handleFilterChange('*')}
          type='button'
        >
          All
        </button>
        {filters.map(filter => (
          <button
            key={filter}
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => handleFilterChange(filter)}
            type='button'
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Isotope Container */}
      <div ref={containerRef} className='isotope-container'>
        {/* Sizing elements for masonry layout */}
        <div className='isotope-sizer'></div>
        <div className='isotope-gutter-sizer'></div>
        {children}
      </div>
    </div>
  );
};

export default IsotopeFilter;
