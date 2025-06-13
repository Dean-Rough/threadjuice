'use client';

import { WOWAnimation } from '@/components/elements/WOWAnimation';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'sarsa';
  className?: string;
  text?: string;
  animated?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'default',
  className = '',
  text,
  animated = true,
}) => {
  const spinnerClasses =
    `sarsa-loading-spinner sarsa-loading-spinner--${size} sarsa-loading-spinner--${variant} ${className}`.trim();

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className='sarsa-loading-spinner__dots'>
            <div className='sarsa-loading-spinner__dot sarsa-loading-spinner__dot--1'></div>
            <div className='sarsa-loading-spinner__dot sarsa-loading-spinner__dot--2'></div>
            <div className='sarsa-loading-spinner__dot sarsa-loading-spinner__dot--3'></div>
          </div>
        );

      case 'pulse':
        return (
          <div className='sarsa-loading-spinner__pulse'>
            <div className='sarsa-loading-spinner__pulse-ring sarsa-loading-spinner__pulse-ring--1'></div>
            <div className='sarsa-loading-spinner__pulse-ring sarsa-loading-spinner__pulse-ring--2'></div>
            <div className='sarsa-loading-spinner__pulse-ring sarsa-loading-spinner__pulse-ring--3'></div>
          </div>
        );

      case 'bars':
        return (
          <div className='sarsa-loading-spinner__bars'>
            <div className='sarsa-loading-spinner__bar sarsa-loading-spinner__bar--1'></div>
            <div className='sarsa-loading-spinner__bar sarsa-loading-spinner__bar--2'></div>
            <div className='sarsa-loading-spinner__bar sarsa-loading-spinner__bar--3'></div>
            <div className='sarsa-loading-spinner__bar sarsa-loading-spinner__bar--4'></div>
          </div>
        );

      case 'sarsa':
        return (
          <div className='sarsa-loading-spinner__sarsa'>
            <div className='sarsa-loading-spinner__logo'>
              <div className='sarsa-loading-spinner__logo-inner'>
                <span>T</span>
                <span>J</span>
              </div>
            </div>
            <div className='sarsa-loading-spinner__wave'>
              <div className='sarsa-loading-spinner__wave-bar'></div>
              <div className='sarsa-loading-spinner__wave-bar'></div>
              <div className='sarsa-loading-spinner__wave-bar'></div>
              <div className='sarsa-loading-spinner__wave-bar'></div>
              <div className='sarsa-loading-spinner__wave-bar'></div>
            </div>
          </div>
        );

      default:
        return (
          <div className='sarsa-loading-spinner__circle'>
            <svg className='sarsa-loading-spinner__svg' viewBox='0 0 50 50'>
              <circle
                className='sarsa-loading-spinner__path'
                cx='25'
                cy='25'
                r='20'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeMiterlimit='10'
              />
            </svg>
          </div>
        );
    }
  };

  const content = (
    <div className="sarsa-loading-spinner__container" role='status' aria-live='polite'>
      {renderSpinner()}
      {text && <span className='sarsa-loading-spinner__text'>{text}</span>}
      <span className='sr-only'>Loading...</span>
    </div>
  );

  if (animated) {
    return (
      <WOWAnimation animation="zoomIn" className={spinnerClasses}>
        {content}
      </WOWAnimation>
    );
  }

  return (
    <div className={spinnerClasses}>
      {content}
    </div>
  );
};

export default LoadingSpinner;
