'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  color: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  showCounts?: boolean;
  variant?: 'pills' | 'tabs' | 'dropdown' | 'sidebar';
  className?: string;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  showCounts = true,
  variant = 'pills',
  className = '',
}: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeItem = categories.find(cat => cat.slug === activeCategory);

  useEffect(() => {
    if (variant === 'dropdown') {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.sarsa-category-filter__dropdown')) {
          setIsDropdownOpen(false);
        }
      };

      if (isDropdownOpen) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }
  }, [isDropdownOpen, variant]);

  const renderPills = () => (
    <div
      className={`sarsa-category-filter sarsa-category-filter--pills ${className}`}
    >
      <div className='sarsa-category-filter__scroll-container'>
        <div className='sarsa-category-filter__pills'>
          <button
            onClick={() => onCategoryChange('all')}
            className={`sarsa-category-filter__pill ${
              activeCategory === 'all'
                ? 'sarsa-category-filter__pill--active'
                : ''
            }`}
          >
            <span className='sarsa-category-filter__pill-text'>All</span>
            {showCounts && (
              <span className='sarsa-category-filter__pill-count'>
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            )}
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`sarsa-category-filter__pill ${
                activeCategory === category.slug
                  ? 'sarsa-category-filter__pill--active'
                  : ''
              }`}
              style={
                activeCategory === category.slug
                  ? {
                      backgroundColor: category.color,
                      borderColor: category.color,
                      color: 'white',
                    }
                  : { borderColor: category.color, color: category.color }
              }
            >
              {category.icon && (
                <span className='sarsa-category-filter__pill-icon'>
                  {category.icon}
                </span>
              )}
              <span className='sarsa-category-filter__pill-text'>
                {category.name}
              </span>
              {showCounts && (
                <span className='sarsa-category-filter__pill-count'>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div
      className={`sarsa-category-filter sarsa-category-filter--tabs ${className}`}
    >
      <div className='sarsa-category-filter__tabs-container'>
        <div className='sarsa-category-filter__tabs'>
          <button
            onClick={() => onCategoryChange('all')}
            className={`sarsa-category-filter__tab ${
              activeCategory === 'all'
                ? 'sarsa-category-filter__tab--active'
                : ''
            }`}
          >
            <span className='sarsa-category-filter__tab-text'>All</span>
            {showCounts && (
              <span className='sarsa-category-filter__tab-count'>
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            )}
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`sarsa-category-filter__tab ${
                activeCategory === category.slug
                  ? 'sarsa-category-filter__tab--active'
                  : ''
              }`}
            >
              {category.icon && (
                <span className='sarsa-category-filter__tab-icon'>
                  {category.icon}
                </span>
              )}
              <span className='sarsa-category-filter__tab-text'>
                {category.name}
              </span>
              {showCounts && (
                <span className='sarsa-category-filter__tab-count'>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDropdown = () => (
    <div
      className={`sarsa-category-filter sarsa-category-filter--dropdown ${className}`}
    >
      <div className='sarsa-category-filter__dropdown'>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className='sarsa-category-filter__dropdown-trigger'
        >
          <div className='sarsa-category-filter__dropdown-selected'>
            {activeItem?.icon && (
              <span className='sarsa-category-filter__dropdown-icon'>
                {activeItem.icon}
              </span>
            )}
            <span className='sarsa-category-filter__dropdown-text'>
              {activeItem?.name || 'All Categories'}
            </span>
            {showCounts && activeItem && (
              <span className='sarsa-category-filter__dropdown-count'>
                {activeItem.count}
              </span>
            )}
          </div>
          <svg
            className={`sarsa-category-filter__dropdown-arrow ${
              isDropdownOpen
                ? 'sarsa-category-filter__dropdown-arrow--open'
                : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className='sarsa-category-filter__dropdown-menu'>
            {categories.length > 8 && (
              <div className='sarsa-category-filter__dropdown-search'>
                <input
                  type='text'
                  placeholder='Search categories...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='sarsa-category-filter__dropdown-search-input'
                />
              </div>
            )}

            <div className='sarsa-category-filter__dropdown-options'>
              <button
                onClick={() => {
                  onCategoryChange('all');
                  setIsDropdownOpen(false);
                }}
                className={`sarsa-category-filter__dropdown-option ${
                  activeCategory === 'all'
                    ? 'sarsa-category-filter__dropdown-option--active'
                    : ''
                }`}
              >
                <span className='sarsa-category-filter__dropdown-option-text'>
                  All Categories
                </span>
                {showCounts && (
                  <span className='sarsa-category-filter__dropdown-option-count'>
                    {categories.reduce((sum, cat) => sum + cat.count, 0)}
                  </span>
                )}
              </button>

              {filteredCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.slug);
                    setIsDropdownOpen(false);
                  }}
                  className={`sarsa-category-filter__dropdown-option ${
                    activeCategory === category.slug
                      ? 'sarsa-category-filter__dropdown-option--active'
                      : ''
                  }`}
                >
                  <div className='sarsa-category-filter__dropdown-option-content'>
                    {category.icon && (
                      <span className='sarsa-category-filter__dropdown-option-icon'>
                        {category.icon}
                      </span>
                    )}
                    <span className='sarsa-category-filter__dropdown-option-text'>
                      {category.name}
                    </span>
                  </div>
                  {showCounts && (
                    <span className='sarsa-category-filter__dropdown-option-count'>
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div
      className={`sarsa-category-filter sarsa-category-filter--sidebar ${className}`}
    >
      <div className='sarsa-category-filter__sidebar'>
        <h3 className='sarsa-category-filter__sidebar-title'>Categories</h3>

        <div className='sarsa-category-filter__sidebar-options'>
          <button
            onClick={() => onCategoryChange('all')}
            className={`sarsa-category-filter__sidebar-option ${
              activeCategory === 'all'
                ? 'sarsa-category-filter__sidebar-option--active'
                : ''
            }`}
          >
            <span className='sarsa-category-filter__sidebar-option-text'>
              All
            </span>
            {showCounts && (
              <span className='sarsa-category-filter__sidebar-option-count'>
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            )}
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`sarsa-category-filter__sidebar-option ${
                activeCategory === category.slug
                  ? 'sarsa-category-filter__sidebar-option--active'
                  : ''
              }`}
            >
              <div className='sarsa-category-filter__sidebar-option-content'>
                {category.icon && (
                  <span
                    className='sarsa-category-filter__sidebar-option-icon'
                    style={{ color: category.color }}
                  >
                    {category.icon}
                  </span>
                )}
                <span className='sarsa-category-filter__sidebar-option-text'>
                  {category.name}
                </span>
              </div>
              {showCounts && (
                <span className='sarsa-category-filter__sidebar-option-count'>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'tabs':
      return renderTabs();
    case 'dropdown':
      return renderDropdown();
    case 'sidebar':
      return renderSidebar();
    default:
      return renderPills();
  }
}
