'use client';

import { useRef } from 'react';
import { Loader2, RefreshCw, Zap } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'fade';
  color?: 'primary' | 'secondary' | 'accent' | 'gray';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  animate?: boolean; // For entrance animation
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  color = 'primary',
  text,
  className = '',
  fullScreen = false,
  animate = true,
}: LoadingSpinnerProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);

  // Pure CSS animation classes
  const getAnimationClass = () => {
    if (!animate) return '';
    return 'animate-fade-in';
  };

  // Size configurations
  const sizeConfig = {
    sm: { spinner: 'w-4 h-4', text: 'text-sm', container: 'gap-2' },
    md: { spinner: 'w-6 h-6', text: 'text-base', container: 'gap-3' },
    lg: { spinner: 'w-8 h-8', text: 'text-lg', container: 'gap-4' },
    xl: { spinner: 'w-12 h-12', text: 'text-xl', container: 'gap-4' },
  };

  // Color configurations
  const colorConfig = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    gray: 'text-gray-500',
  };

  const { spinner: spinnerSize, text: textSize, container: containerGap } = sizeConfig[size];
  const colorClass = colorConfig[color];

  // Spinner variants
  const renderSpinner = () => {
    const baseClass = `${spinnerSize} ${colorClass}`;

    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${containerGap}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${spinnerSize} ${colorClass.replace('text-', 'bg-')} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`${baseClass} animate-pulse`}>
            <Zap className="w-full h-full" />
          </div>
        );

      case 'bounce':
        return (
          <div className={`${baseClass} animate-bounce`}>
            <RefreshCw className="w-full h-full" />
          </div>
        );

      case 'fade':
        return (
          <div className={`${baseClass} animate-pulse`}>
            <div className={`w-full h-full ${colorClass.replace('text-', 'bg-')} rounded-full`} />
          </div>
        );

      default:
        return (
          <Loader2 className={`${baseClass} animate-spin`} />
        );
    }
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'
    : `flex items-center justify-center ${containerGap}`;

  return (
    <div
      ref={spinnerRef}
      className={`${containerClass} ${getAnimationClass()} ${className}`}
      data-testid="loading-spinner"
      role="status"
      aria-label={text || 'Loading'}
    >
      {renderSpinner()}
      
      {text && (
        <span className={`${textSize} ${colorClass} font-medium`}>
          {text}
        </span>
      )}
      
      {/* Screen reader text */}
      <span className="sr-only">
        {text || 'Loading content...'}
      </span>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;