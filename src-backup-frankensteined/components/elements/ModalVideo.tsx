'use client';

import { useEffect } from 'react';

interface ModalVideoProps {
  channel: 'youtube' | 'vimeo' | 'custom';
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  autoplay?: boolean;
  allowFullScreen?: boolean;
  width?: number;
  height?: number;
}

const ModalVideo: React.FC<ModalVideoProps> = ({
  channel,
  videoId,
  isOpen,
  onClose,
  autoplay = true,
  allowFullScreen = true,
  width = 854,
  height = 480,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const getVideoUrl = () => {
    switch (channel) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}`;
      default:
        return videoId; // Assume videoId is a full URL for custom
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
      onClick={onClose}
    >
      <div
        className='relative rounded-lg bg-white shadow-lg'
        onClick={e => e.stopPropagation()}
        style={{ width: Math.min(width, window.innerWidth - 40) }}
      >
        <button
          className='absolute -top-10 right-0 text-2xl text-white hover:text-gray-300'
          onClick={onClose}
          aria-label='Close video'
        >
          ×
        </button>
        <div className='relative' style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={getVideoUrl()}
            width={width}
            height={height}
            frameBorder='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen={allowFullScreen}
            className='absolute left-0 top-0 h-full w-full rounded-lg'
            title='Video player'
          />
        </div>
      </div>
    </div>
  );
};

export default ModalVideo;
