'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Filter, Grid, List, Search, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FilterItem {
  id: string;
  name: string;
  count: number;
  icon?: React.ReactElement;
}

interface CategoryFilterProps {
  items: any[];
  onFilter: (filteredItems: any[]) => void;
  categories: FilterItem[];
  layout?: 'grid' | 'list';
  showSearch?: boolean;
  showLayoutToggle?: boolean;
  animated?: boolean;
}

export default function CategoryFilter({
  items,
  onFilter,
  categories,
  layout = 'grid',
  showSearch = true,
  showLayoutToggle = true,
  animated = true,
}: CategoryFilterProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentLayout, setCurrentLayout] = useState<'grid' | 'list'>(layout);
  const [isFiltering, setIsFiltering] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Isotope-like filtering
  useEffect(() => {
    applyFilters();
  }, [activeFilter, searchTerm, items]);

  const applyFilters = () => {
    setIsFiltering(true);

    // Simulate loading delay for smooth animations
    setTimeout(
      () => {
        let filteredItems = [...items];

        // Apply category filter
        if (activeFilter !== 'all') {
          filteredItems = filteredItems.filter(
            item =>
              item.category?.toLowerCase() === activeFilter ||
              item.group?.toLowerCase() === activeFilter
          );
        }

        // Apply search filter
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(
            item =>
              item.title?.toLowerCase().includes(searchLower) ||
              item.category?.toLowerCase().includes(searchLower) ||
              item.author?.toLowerCase().includes(searchLower)
          );
        }

        onFilter(filteredItems);
        setIsFiltering(false);
      },
      animated ? 300 : 0
    );
  };

  const handleCategoryFilter = (categoryId: string) => {
    setActiveFilter(categoryId);

    // Add animation class to container
    if (animated && filterContainerRef.current) {
      filterContainerRef.current.classList.add('filtering');
      setTimeout(() => {
        filterContainerRef.current?.classList.remove('filtering');
      }, 300);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleLayout = () => {
    setCurrentLayout(currentLayout === 'grid' ? 'list' : 'grid');
  };

  const getFilteredCount = () => {
    let count = items.length;

    if (activeFilter !== 'all') {
      count = items.filter(
        item =>
          item.category?.toLowerCase() === activeFilter ||
          item.group?.toLowerCase() === activeFilter
      ).length;
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const categoryFiltered =
        activeFilter !== 'all'
          ? items.filter(
              item =>
                item.category?.toLowerCase() === activeFilter ||
                item.group?.toLowerCase() === activeFilter
            )
          : items;

      count = categoryFiltered.filter(
        item =>
          item.title?.toLowerCase().includes(searchLower) ||
          item.category?.toLowerCase().includes(searchLower) ||
          item.author?.toLowerCase().includes(searchLower)
      ).length;
    }

    return count;
  };

  return (
    <div className='category-filter' ref={filterContainerRef}>
      <div className='filter-controls'>
        <div className='row align-items-center'>
          {/* Search Bar */}
          {showSearch && (
            <div className='col-lg-4 col-md-6 mb-3'>
              <div className='search-input-group position-relative'>
                <Search size={18} className='search-icon position-absolute' />
                <input
                  type='text'
                  className='form-control search-input'
                  placeholder='Search viral content...'
                  value={searchTerm}
                  onChange={e => handleSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className='clear-search position-absolute'
                    onClick={clearSearch}
                    aria-label='Clear search'
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Categories */}
          <div className='col-lg-6 col-md-6 mb-3'>
            <div className='filter-categories'>
              <div className='category-tabs d-flex flex-wrap gap-2'>
                <button
                  className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter('all')}
                >
                  <Filter size={14} className='me-1' />
                  All ({items.length})
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`filter-tab ${activeFilter === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    {category.icon && (
                      <span className='me-1'>{category.icon}</span>
                    )}
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Layout Toggle & Results Count */}
          <div className='col-lg-2 col-md-12 mb-3'>
            <div className='filter-actions d-flex align-items-center justify-content-end'>
              {/* Results Count */}
              <div className='results-count me-3'>
                <span className='text-muted'>
                  {isFiltering ? (
                    <span className='flex items-center'>
                      <LoadingSpinner size="sm" text="Filtering..." />
                    </span>
                  ) : (
                    `${getFilteredCount()} results`
                  )}
                </span>
              </div>

              {/* Layout Toggle */}
              {showLayoutToggle && (
                <div className='layout-toggle'>
                  <button
                    className={`layout-btn ${currentLayout === 'grid' ? 'active' : ''}`}
                    onClick={() => setCurrentLayout('grid')}
                    title='Grid View'
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    className={`layout-btn ${currentLayout === 'list' ? 'active' : ''}`}
                    onClick={() => setCurrentLayout('list')}
                    title='List View'
                  >
                    <List size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(activeFilter !== 'all' || searchTerm) && (
          <div className='active-filters mb-3'>
            <div className='d-flex align-items-center flex-wrap gap-2'>
              <span className='active-filters-label'>Active filters:</span>

              {activeFilter !== 'all' && (
                <span className='filter-badge'>
                  Category: {categories.find(c => c.id === activeFilter)?.name}
                  <button
                    className='remove-filter ms-1'
                    onClick={() => handleCategoryFilter('all')}
                    aria-label='Remove category filter'
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className='filter-badge'>
                  Search: "{searchTerm}"
                  <button
                    className='remove-filter ms-1'
                    onClick={clearSearch}
                    aria-label='Remove search filter'
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                className='clear-all-filters text-danger'
                onClick={() => {
                  setActiveFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Loading Overlay */}
      {isFiltering && animated && (
        <div className='filter-loading-overlay'>
          <div className='filter-loading-content'>
            <LoadingSpinner size="md" text="Applying filters..." />
          </div>
        </div>
      )}

      <style jsx>{`
        .category-filter {
          position: relative;
        }

        .search-input-group {
          position: relative;
        }

        .search-icon {
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 2;
        }

        .search-input {
          padding-left: 40px;
          padding-right: 40px;
          border-radius: 25px;
          border: 2px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: var(--tg-theme-primary);
          box-shadow: 0 0 0 0.2rem rgba(255, 107, 53, 0.25);
        }

        .clear-search {
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          z-index: 2;
        }

        .filter-tab {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .filter-tab:hover {
          border-color: var(--tg-theme-primary);
          background: rgba(255, 107, 53, 0.1);
        }

        .filter-tab.active {
          background: var(--tg-theme-primary);
          border-color: var(--tg-theme-primary);
          color: white;
        }

        .layout-btn {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          padding: 8px 12px;
          margin-left: 2px;
          transition: all 0.3s ease;
        }

        .layout-btn:first-child {
          border-radius: 6px 0 0 6px;
          margin-left: 0;
        }

        .layout-btn:last-child {
          border-radius: 0 6px 6px 0;
        }

        .layout-btn.active {
          background: var(--tg-theme-primary);
          border-color: var(--tg-theme-primary);
          color: white;
        }

        .filter-badge {
          background: rgba(255, 107, 53, 0.1);
          color: var(--tg-theme-primary);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
        }

        .remove-filter {
          background: none;
          border: none;
          color: inherit;
          padding: 0;
          margin-left: 4px;
        }

        .clear-all-filters {
          background: none;
          border: none;
          font-size: 12px;
          text-decoration: underline;
        }

        .filter-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 8px;
        }

        .filter-loading-content {
          text-align: center;
        }

        .filtering {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        @media (max-width: 768px) {
          .filter-categories {
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 8px;
          }

          .category-tabs {
            flex-wrap: nowrap !important;
          }

          .search-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
}
