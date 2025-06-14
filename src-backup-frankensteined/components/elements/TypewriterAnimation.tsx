'use client';

import { useEffect, useRef } from 'react';
import Typewriter from 'typewriter-effect';

interface TypewriterAnimationProps {
  strings: string[];
  autoStart?: boolean;
  loop?: boolean;
  delay?: number;
  deleteSpeed?: number;
  className?: string;
  onInit?: (typewriter: any) => void;
}

export const TypewriterAnimation: React.FC<TypewriterAnimationProps> = ({
  strings,
  autoStart = true,
  loop = true,
  delay = 50,
  deleteSpeed = 25,
  className = '',
  onInit,
}) => {
  const typewriterRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={typewriterRef}
      className={`typewriter-animation ${className}`.trim()}
    >
      <Typewriter
        options={{
          strings,
          autoStart,
          loop,
          delay,
          deleteSpeed,
          cursor: '|',
          skipAddStyles: false,
        }}
        onInit={typewriter => {
          if (onInit) {
            onInit(typewriter);
          } else {
            typewriter.start();
          }
        }}
      />
    </div>
  );
};

export default TypewriterAnimation;
