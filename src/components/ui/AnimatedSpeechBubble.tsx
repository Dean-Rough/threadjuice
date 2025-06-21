'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { X } from 'lucide-react';
import JuiceboxCharacter from './JuiceboxCharacter';

export interface AnimatedSpeechBubbleProps {
  message: string;
  autoShow?: boolean;
  showDelay?: number;
  autoHide?: boolean;
  hideDelay?: number;
  onDismiss?: () => void;
  className?: string;
  position?: 'left' | 'right' | 'center';
}

export default function AnimatedSpeechBubble({
  message,
  autoShow = true,
  showDelay = 3000,
  autoHide = false,
  hideDelay = 15000,
  onDismiss,
  className = "",
  position = 'right'
}: AnimatedSpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(!autoShow);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-show with delay
  useEffect(() => {
    if (autoShow && !isDismissed) {
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, showDelay);

      return () => clearTimeout(showTimer);
    }
  }, [autoShow, showDelay, isDismissed]);

  // Auto-hide with delay
  useEffect(() => {
    if (autoHide && isVisible && !isDismissed) {
      const hideTimer = setTimeout(() => {
        handleDismiss();
      }, hideDelay);

      return () => clearTimeout(hideTimer);
    }
  }, [autoHide, hideDelay, isVisible, isDismissed, handleDismiss]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);
    setIsAnimating(false);
    onDismiss?.();
  }, [onDismiss]);

  if (isDismissed || !isVisible) return null;

  const positionClasses = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    center: 'flex-col items-center'
  };

  const bubbleClasses = {
    left: 'ml-4',
    right: 'mr-4', 
    center: 'mt-4'
  };

  const tailClasses = {
    left: 'bubble-tail-left',
    right: 'bubble-tail-right',
    center: 'bubble-tail-bottom'
  };

  return (
    <div 
      className={`terrys-metaphor-corner fixed bottom-8 right-8 z-50 max-w-md ${className}`}
      style={{
        animation: isAnimating ? 'slideInRight 0.5s ease-out, bounceIn 0.3s ease-out 0.5s' : 'none'
      }}
    >
      <div className={`flex items-end ${positionClasses[position]} gap-2`}>
        {/* Juicebox Character */}
        <div className="flex-shrink-0">
          <JuiceboxCharacter size="lg" animated={isAnimating} />
        </div>

        {/* Speech Bubble */}
        <div className={`speech-bubble relative ${bubbleClasses[position]}`}>
          {/* Bubble Container */}
          <div className="relative bg-white dark:bg-slate-800 border-2 border-orange-400 rounded-2xl p-4 shadow-lg max-w-sm">
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md"
              aria-label="Dismiss Terry&apos;s comment"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Header */}
            <div className="mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400">
                Terry&apos;s Metaphor Corner
              </h4>
            </div>

            {/* Message Content */}
            <div className="text-sm leading-relaxed text-foreground">
              {isAnimating ? (
                <TypeAnimation
                  sequence={[message]}
                  wrapper="div"
                  speed={75}
                  cursor={false}
                  style={{ 
                    whiteSpace: 'pre-line',
                    fontStyle: 'italic'
                  }}
                />
              ) : (
                <div className="italic" style={{ whiteSpace: 'pre-line' }}>
                  {message}
                </div>
              )}
            </div>

            {/* Attribution */}
            <div className="mt-3 pt-2 border-t border-orange-200 dark:border-orange-800">
              <p className="text-xs text-muted-foreground">
                — The Terry
              </p>
            </div>
          </div>

          {/* Speech Bubble Tail */}
          <div className={`absolute ${tailClasses[position]}`}>
            {position === 'right' && (
              <div 
                className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-orange-400"
                style={{
                  right: '100%',
                  bottom: '20px'
                }}
              />
            )}
            {position === 'left' && (
              <div 
                className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[15px] border-l-orange-400"
                style={{
                  left: '100%',
                  bottom: '20px'
                }}
              />
            )}
            {position === 'center' && (
              <div 
                className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-orange-400"
                style={{
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}