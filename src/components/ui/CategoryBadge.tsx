'use client';

import Link from 'next/link';
import { TrendingUp, Zap, Flame, Heart, Users } from 'lucide-react';

export interface CategoryBadgeProps {
  category: 'viral' | 'trending' | 'chaos' | 'wholesome' | 'drama';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'subtle';
  showIcon?: boolean;
  isClickable?: boolean;
  className?: string;
}

export function CategoryBadge({
  category,
  size = 'md',
  variant = 'filled',
  showIcon = true,
  isClickable = true,
  className = '',
}: CategoryBadgeProps) {
  // Category configurations
  const categoryConfig = {
    viral: {
      label: 'Viral',
      icon: Zap,
      colors: {
        filled: 'bg-red-500 text-white',
        outline: 'border-red-500 text-red-600 border',
        subtle: 'bg-red-50 text-red-600',
      },
      hoverColors: 'hover:bg-red-600',
    },
    trending: {
      label: 'Trending',
      icon: TrendingUp,
      colors: {
        filled: 'bg-orange-500 text-white',
        outline: 'border-orange-500 text-orange-600 border',
        subtle: 'bg-orange-50 text-orange-600',
      },
      hoverColors: 'hover:bg-orange-600',
    },
    chaos: {
      label: 'Chaos',
      icon: Flame,
      colors: {
        filled: 'bg-purple-500 text-white',
        outline: 'border-purple-500 text-purple-600 border',
        subtle: 'bg-purple-50 text-purple-600',
      },
      hoverColors: 'hover:bg-purple-600',
    },
    wholesome: {
      label: 'Wholesome',
      icon: Heart,
      colors: {
        filled: 'bg-green-500 text-white',
        outline: 'border-green-500 text-green-600 border',
        subtle: 'bg-green-50 text-green-600',
      },
      hoverColors: 'hover:bg-green-600',
    },
    drama: {
      label: 'Drama',
      icon: Users,
      colors: {
        filled: 'bg-pink-500 text-white',
        outline: 'border-pink-500 text-pink-600 border',
        subtle: 'bg-pink-50 text-pink-600',
      },
      hoverColors: 'hover:bg-pink-600',
    },
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  const config = categoryConfig[category];
  const sizes = sizeConfig[size];
  const IconComponent = config.icon;

  const baseClasses = `
    inline-flex items-center font-medium rounded-full transition-colors
    ${sizes.container} ${sizes.gap} ${config.colors[variant]}
    ${isClickable && variant === 'filled' ? config.hoverColors : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {showIcon && <IconComponent className={sizes.icon} />}
      <span>{config.label}</span>
    </>
  );

  if (isClickable) {
    return (
      <Link
        href={`/category/${category}`}
        className={baseClasses}
        data-testid='category-badge'
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={baseClasses} data-testid='category-badge'>
      {content}
    </span>
  );
}

export default CategoryBadge;
