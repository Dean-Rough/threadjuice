'use client';

interface TrendingBadgeProps {
  variant?: 'default' | 'fire' | 'bolt' | 'star';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  animated?: boolean;
  text?: string;
}

export const TrendingBadge: React.FC<TrendingBadgeProps> = ({
  variant = 'default',
  size = 'medium',
  className = '',
  animated = true,
  text = 'Trending',
}) => {
  const badgeClasses =
    `trending-badge trending-badge--${variant} trending-badge--${size} ${animated ? 'trending-badge--animated' : ''} ${className}`.trim();

  const getIcon = () => {
    switch (variant) {
      case 'fire':
        return <i className='fas fa-fire' />;
      case 'bolt':
        return <i className='fas fa-bolt' />;
      case 'star':
        return <i className='fas fa-star' />;
      default:
        return <i className='fas fa-trending-up' />;
    }
  };

  return (
    <span className={badgeClasses} title='This content is trending'>
      <span className='trending-badge__icon'>{getIcon()}</span>
      <span className='trending-badge__text'>{text}</span>
    </span>
  );
};

export default TrendingBadge;
