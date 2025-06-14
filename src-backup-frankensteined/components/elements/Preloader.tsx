'use client';

import { useEffect, useState } from 'react';

interface PreloaderProps {
  duration?: number;
  className?: string;
}

export const Preloader: React.FC<PreloaderProps> = ({
  duration = 1500,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div id='preloader' className={className}>
      <div id='loading-center'>
        <div id='loading-center-absolute'>
          <div className='object' id='object_one' />
          <div className='object' id='object_two' />
          <div className='object' id='object_three' />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
