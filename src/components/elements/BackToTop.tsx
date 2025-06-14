'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100 && !hasScrolled) {
        setHasScrolled(true);
      } else if (window.scrollY < 100 && hasScrolled) {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [hasScrolled]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {hasScrolled && (
        <button
          className='scroll__top scroll-to-target open'
          onClick={scrollToTop}
          style={{ position: 'fixed', zIndex: 2147483647 }}
          aria-label='Scroll to top'
        >
          <i className='fas fa-angle-up'></i>
        </button>
      )}
    </>
  );
}
