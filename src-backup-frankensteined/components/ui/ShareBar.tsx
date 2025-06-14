'use client';

import { useState } from 'react';
import { WOWAnimation } from '@/components/elements/WOWAnimation';

interface ShareBarProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'floating' | 'compact' | 'magazine';
  showLabels?: boolean;
  animated?: boolean;
  shareCount?: number;
}

export const ShareBar: React.FC<ShareBarProps> = ({
  url,
  title,
  description = '',
  className = '',
  variant = 'horizontal',
  showLabels = true,
  animated = false,
  shareCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    reddit: `https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    telegram: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'width=600,height=400');
    }
  };

  const shareBarClasses =
    `sarsa-share-bar sarsa-share-bar--${variant} ${className}`.trim();

  const socialPlatforms = [
    {
      key: 'facebook',
      icon: 'fab fa-facebook-f',
      label: 'Facebook',
      color: '#1877f2',
    },
    {
      key: 'twitter',
      icon: 'fab fa-twitter',
      label: 'Twitter',
      color: '#1da1f2',
    },
    {
      key: 'linkedin',
      icon: 'fab fa-linkedin-in',
      label: 'LinkedIn',
      color: '#0077b5',
    },
    {
      key: 'reddit',
      icon: 'fab fa-reddit-alien',
      label: 'Reddit',
      color: '#ff4500',
    },
    {
      key: 'whatsapp',
      icon: 'fab fa-whatsapp',
      label: 'WhatsApp',
      color: '#25d366',
    },
  ];

  const renderShareButton = (platform: (typeof socialPlatforms)[0]) => (
    <button
      key={platform.key}
      onClick={() => handleShare(platform.key)}
      onMouseEnter={() => setHovered(platform.key)}
      onMouseLeave={() => setHovered(null)}
      className={`sarsa-share-bar__button sarsa-share-bar__button--${platform.key} ${
        hovered === platform.key ? 'sarsa-share-bar__button--hovered' : ''
      }`}
      style={{ '--platform-color': platform.color } as React.CSSProperties}
      aria-label={`Share on ${platform.label}`}
      title={`Share on ${platform.label}`}
    >
      <i className={platform.icon} />
      {showLabels && (
        <span className='sarsa-share-bar__button-text'>{platform.label}</span>
      )}
    </button>
  );

  const shareBarContent = (
    <div className='sarsa-share-bar__container'>
      {shareCount !== undefined && (
        <div className='sarsa-share-bar__count'>
          <span className='sarsa-share-bar__count-number'>
            {shareCount.toLocaleString()}
          </span>
          <span className='sarsa-share-bar__count-label'>Shares</span>
        </div>
      )}

      <div className='sarsa-share-bar__header'>
        <span className='sarsa-share-bar__label'>Share this post</span>
      </div>

      <div className='sarsa-share-bar__buttons'>
        {socialPlatforms.map(renderShareButton)}

        <button
          onClick={handleCopyLink}
          onMouseEnter={() => setHovered('copy')}
          onMouseLeave={() => setHovered(null)}
          className={`sarsa-share-bar__button sarsa-share-bar__button--copy ${
            copied ? 'sarsa-share-bar__button--copied' : ''
          } ${hovered === 'copy' ? 'sarsa-share-bar__button--hovered' : ''}`}
          aria-label='Copy link'
          title={copied ? 'Link copied!' : 'Copy link'}
        >
          <i className={copied ? 'fas fa-check' : 'fas fa-copy'} />
          {showLabels && (
            <span className='sarsa-share-bar__button-text'>
              {copied ? 'Copied!' : 'Copy'}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  if (animated) {
    return (
      <WOWAnimation animation='slideInUp' className={shareBarClasses}>
        {shareBarContent}
      </WOWAnimation>
    );
  }

  return <div className={shareBarClasses}>{shareBarContent}</div>;
};

export default ShareBar;
