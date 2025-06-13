'use client';

import Link from 'next/link';

interface CategoryBadgeProps {
  category: string;
  variant?: 'default' | 'outlined' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  linkToCategory?: boolean;
  count?: number;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  variant = 'default',
  size = 'medium',
  className = '',
  linkToCategory = true,
  count,
}) => {
  const badgeClasses =
    `category-badge category-badge--${variant} category-badge--${size} ${className}`.trim();
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');

  const BadgeContent = () => (
    <>
      <span className='category-badge__text'>{category}</span>
      {count !== undefined && (
        <span className='category-badge__count'>({count})</span>
      )}
    </>
  );

  if (!linkToCategory) {
    return (
      <span className={badgeClasses}>
        <BadgeContent />
      </span>
    );
  }

  return (
    <Link href={`/category/${categorySlug}`} className={badgeClasses}>
      <BadgeContent />
    </Link>
  );
};

export default CategoryBadge;
