'use client';

import { useEffect, useRef } from 'react';

interface WOWAnimationProps {
  children: React.ReactNode;
  animation?: string;
  delay?: string;
  duration?: string;
  offset?: number;
  className?: string;
}

export const WOWAnimation: React.FC<WOWAnimationProps> = ({
  children,
  animation = 'fadeInUp',
  delay = '0s',
  duration = '1s',
  offset = 100,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadWOW = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { WOW } = await import('wowjs');
          const wow = new WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: offset,
            mobile: true,
            live: true,
          });
          wow.init();
        } catch (error) {
          console.warn('WOW.js failed to load:', error);
        }
      }
    };

    loadWOW();
  }, [offset]);

  return (
    <div
      ref={elementRef}
      className={`wow ${animation} ${className}`.trim()}
      data-wow-delay={delay}
      data-wow-duration={duration}
      data-wow-offset={offset}
    >
      {children}
    </div>
  );
};

export default WOWAnimation;