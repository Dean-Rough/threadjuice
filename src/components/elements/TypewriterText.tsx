'use client';

import { useEffect, useRef, useState } from 'react';

export interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  delayBetween?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  texts,
  speed = 100,
  deleteSpeed = 50,
  delayBetween = 2000,
  loop = true,
  cursor = true,
  cursorChar = '|',
  className = '',
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor) return;

    const blinkCursor = () => {
      setShowCursor((prev) => !prev);
      cursorTimeoutRef.current = setTimeout(blinkCursor, 500);
    };

    cursorTimeoutRef.current = setTimeout(blinkCursor, 500);

    return () => {
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [cursor]);

  // Typewriter effect
  useEffect(() => {
    if (texts.length === 0) return;

    const currentText = texts[currentIndex];
    
    const typeText = () => {
      if (isDeleting) {
        // Deleting characters
        if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
          timeoutRef.current = setTimeout(typeText, deleteSpeed);
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          setCurrentIndex((prev) => {
            const nextIndex = (prev + 1) % texts.length;
            if (nextIndex === 0 && !loop) {
              onComplete?.();
              return prev;
            }
            return nextIndex;
          });
        }
      } else {
        // Typing characters
        if (displayText.length < currentText.length) {
          setDisplayText((prev) => currentText.slice(0, prev.length + 1));
          timeoutRef.current = setTimeout(typeText, speed);
        } else {
          // Finished typing, wait then start deleting (if looping)
          if (loop || currentIndex < texts.length - 1) {
            timeoutRef.current = setTimeout(() => {
              setIsDeleting(true);
              typeText();
            }, delayBetween);
          } else {
            onComplete?.();
          }
        }
      }
    };

    timeoutRef.current = setTimeout(typeText, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayText, currentIndex, isDeleting, texts, speed, deleteSpeed, delayBetween, loop, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span className={className} data-testid="typewriter-text">
      {displayText}
      {cursor && (
        <span 
          className={`typewriter-cursor ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}

export default TypewriterText;