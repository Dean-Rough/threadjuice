'use client';

import Marquee from 'react-fast-marquee';

interface FastMarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  speed?: number;
  delay?: number;
  loop?: number;
  gradient?: boolean;
  gradientColor?: string;
  gradientWidth?: number;
  pauseOnHover?: boolean;
  pauseOnClick?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const FastMarquee: React.FC<FastMarqueeProps> = ({
  children,
  direction = 'left',
  speed = 50,
  delay = 0,
  loop = 0,
  gradient = true,
  gradientColor = 'white',
  gradientWidth = 200,
  pauseOnHover = false,
  pauseOnClick = false,
  className = '',
  style,
}) => {
  return (
    <div className={`fast-marquee ${className}`.trim()}>
      <Marquee
        direction={direction}
        speed={speed}
        delay={delay}
        loop={loop}
        gradient={gradient}
        gradientColor={gradientColor}
        gradientWidth={gradientWidth}
        pauseOnHover={pauseOnHover}
        pauseOnClick={pauseOnClick}
        style={style}
      >
        {children}
      </Marquee>
    </div>
  );
};

export default FastMarquee;
