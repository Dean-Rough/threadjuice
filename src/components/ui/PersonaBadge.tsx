'use client';

import Link from 'next/link';
import { Persona } from '@/types/database';

interface PersonaBadgeProps {
  persona:
    | Persona
    | { name: string; target_audience?: string; avatar_url?: string };
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  showDescription?: boolean;
  linkToProfile?: boolean;
}

export const PersonaBadge: React.FC<PersonaBadgeProps> = ({
  persona,
  variant = 'default',
  className = '',
  showDescription = false,
  linkToProfile = true,
}) => {
  const badgeClasses =
    `persona-badge persona-badge--${variant} ${className}`.trim();
  const authorSlug = persona.name?.toLowerCase().replace(/\s+/g, '-');

  const BadgeContent = () => (
    <div className='persona-badge__content'>
      <div className='persona-badge__avatar'>
        <img
          src={persona.avatar_url || '/assets/img/others/avatar.png'}
          alt={`${persona.name} avatar`}
          className='persona-badge__avatar-image'
          loading='lazy'
        />
      </div>

      <div className='persona-badge__info'>
        <h4 className='persona-badge__name'>{persona.name || 'Anonymous'}</h4>

        {showDescription && persona.target_audience && (
          <p className='persona-badge__description'>{persona.target_audience}</p>
        )}
      </div>
    </div>
  );

  if (!linkToProfile || !authorSlug) {
    return (
      <div className={badgeClasses}>
        <BadgeContent />
      </div>
    );
  }

  return (
    <Link href={`/author/${authorSlug}`} className={badgeClasses}>
      <BadgeContent />
    </Link>
  );
};

export default PersonaBadge;
