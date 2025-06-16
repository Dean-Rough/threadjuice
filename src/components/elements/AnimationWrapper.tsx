'use client';

import { useEffect, useRef, ReactNode } from 'react';

export interface AnimationWrapperProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounceIn' | 'fadeInUp' | 'fadeInDown';
  delay?: number;
  duration?: number;
  offset?: number;
  once?: boolean;
  className?: string;
}

export function AnimationWrapper({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 1000,
  offset = 100,
  once = true,
  className = '',
}: AnimationWrapperProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === 'undefined') return;

    // Check if WOW.js is available
    let WOWInstance: any = null;

    const initializeWOW = async () => {
      try {
        const { WOW } = await import('wowjs');
        
        // Add WOW.js classes to element
        element.classList.add('wow', animation);
        
        if (delay > 0) {
          element.style.animationDelay = `${delay}ms`;
        }
        
        if (duration !== 1000) {
          element.style.animationDuration = `${duration}ms`;
        }

        // Initialize WOW.js
        WOWInstance = new WOW({
          boxClass: 'wow',
          animateClass: 'animated',
          offset: offset,
          mobile: true,
          live: true,
          callback: (box: Element) => {
            // Animation completed callback
          },
          scrollContainer: null,
        });

        WOWInstance.init();
      } catch (error) {
        console.warn('WOW.js failed to load, falling back to CSS animations:', error);
        
        // Fallback to CSS animations
        element.classList.add('animate-in');
        
        // Add custom CSS animation classes
        const animationMap: Record<string, string> = {
          fadeIn: 'animate-fade-in',
          slideInUp: 'animate-slide-in-up',
          slideInDown: 'animate-slide-in-down',
          slideInLeft: 'animate-slide-in-left',
          slideInRight: 'animate-slide-in-right',
          zoomIn: 'animate-zoom-in',
          bounceIn: 'animate-bounce-in',
          fadeInUp: 'animate-fade-in-up',
          fadeInDown: 'animate-fade-in-down',
        };
        
        const animationClass = animationMap[animation] || 'animate-fade-in';
        element.classList.add(animationClass);
      }
    };

    initializeWOW();

    return () => {
      if (WOWInstance) {
        // Clean up WOW instance if needed
        element.classList.remove('wow', animation, 'animated');
      }
    };
  }, [animation, delay, duration, offset, once]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

export default AnimationWrapper;