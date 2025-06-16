'use client';

import { TrendingUp, Flame, Zap, Star } from 'lucide-react';

export interface TrendingBadgeProps {
  variant?: 'fire' | 'lightning' | 'star' | 'trending';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  text?: string;
  className?: string;
}

export function TrendingBadge({
  variant = 'fire',
  size = 'md',
  animated = true,
  text,
  className = '',
}: TrendingBadgeProps) {
  // Variant configurations
  const variantConfig = {
    fire: {
      icon: Flame,
      colors: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
      defaultText: 'HOT',
    },
    lightning: {
      icon: Zap,
      colors: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      defaultText: 'VIRAL',
    },
    star: {
      icon: Star,
      colors: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      defaultText: 'FEATURED',
    },
    trending: {
      icon: TrendingUp,
      colors: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      defaultText: 'TRENDING',
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
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  const config = variantConfig[variant];
  const sizes = sizeConfig[size];
  const IconComponent = config.icon;
  const displayText = text || config.defaultText;

  // Animation classes
  const animationClasses = animated ? {
    fire: 'animate-pulse',
    lightning: 'animate-bounce',
    star: 'animate-pulse',
    trending: 'animate-pulse',
  }[variant] : '';

  return (
    <div
      className={`
        inline-flex items-center font-bold rounded-full shadow-lg
        ${sizes.container} ${sizes.gap} ${config.colors} ${animationClasses}
        ${className}
      `.trim()}
      data-testid="trending-badge"
    >
      <IconComponent 
        className={`${sizes.icon} ${animated ? 'animate-pulse' : ''}`} 
      />
      <span className="tracking-wide">
        {displayText}
      </span>
      
      {/* Sparkle effect for enhanced visual appeal */}
      {animated && (
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
}

export default TrendingBadge;