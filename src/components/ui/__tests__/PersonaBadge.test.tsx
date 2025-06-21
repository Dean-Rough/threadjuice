/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PersonaBadge, type PersonaBadgeProps } from '../PersonaBadge';

// Mock Next.js components
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ src, alt, onError, ...props }: any) => (
    <img src={src} alt={alt} onError={onError} {...props} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('PersonaBadge', () => {
  const mockAuthor = {
    id: 'snarky-sage',
    name: 'The Snarky Sage',
    avatar: '/avatars/snarky-sage.jpg',
    tone: 'sarcastic and deadpan',
  };

  const defaultProps: PersonaBadgeProps = {
    author: mockAuthor,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders persona badge with all elements', () => {
    render(<PersonaBadge {...defaultProps} />);

    expect(screen.getByTestId('persona-badge')).toBeInTheDocument();
    expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
    expect(screen.getByText('sarcastic and deadpan')).toBeInTheDocument();
    expect(screen.getByAltText('The Snarky Sage')).toBeInTheDocument();
  });

  it('links to persona detail page', () => {
    render(<PersonaBadge {...defaultProps} />);

    const authorLink = screen.getByRole('link', { name: 'The Snarky Sage' });
    expect(authorLink).toHaveAttribute('href', '/personas/snarky-sage');
  });

  it('displays avatar when provided', () => {
    render(<PersonaBadge {...defaultProps} />);

    const avatar = screen.getByAltText('The Snarky Sage');
    expect(avatar).toHaveAttribute('src', '/avatars/snarky-sage.jpg');
  });

  it('handles missing avatar gracefully', () => {
    const authorWithoutAvatar = { ...mockAuthor, avatar: undefined };
    render(<PersonaBadge author={authorWithoutAvatar} />);

    expect(screen.queryByAltText('The Snarky Sage')).not.toBeInTheDocument();
    expect(screen.getByTestId('persona-badge')).toContainHTML(
      'bg-gradient-to-br'
    );
  });

  it('handles avatar error gracefully', () => {
    render(<PersonaBadge {...defaultProps} />);

    const avatar = screen.getByAltText('The Snarky Sage');
    fireEvent.error(avatar);

    expect(avatar.style.display).toBe('none');
  });

  it('can hide avatar when showAvatar is false', () => {
    render(<PersonaBadge {...defaultProps} showAvatar={false} />);

    expect(screen.queryByAltText('The Snarky Sage')).not.toBeInTheDocument();
    expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
  });

  it('can hide tone when showTone is false', () => {
    render(<PersonaBadge {...defaultProps} showTone={false} />);

    expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
    expect(screen.queryByText('sarcastic and deadpan')).not.toBeInTheDocument();
  });

  it('applies small size classes correctly', () => {
    render(<PersonaBadge {...defaultProps} size='sm' />);

    const badge = screen.getByTestId('persona-badge');
    expect(badge).toContainHTML('text-sm');
  });

  it('applies medium size classes correctly (default)', () => {
    render(<PersonaBadge {...defaultProps} size='md' />);

    const badge = screen.getByTestId('persona-badge');
    expect(badge).toContainHTML('text-base');
  });

  it('applies large size classes correctly', () => {
    render(<PersonaBadge {...defaultProps} size='lg' />);

    const badge = screen.getByTestId('persona-badge');
    expect(badge).toContainHTML('text-lg');
  });

  it('applies custom className when provided', () => {
    render(<PersonaBadge {...defaultProps} className='custom-class' />);

    const badge = screen.getByTestId('persona-badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('shows both avatar and tone by default', () => {
    render(<PersonaBadge {...defaultProps} />);

    expect(screen.getByAltText('The Snarky Sage')).toBeInTheDocument();
    expect(screen.getByText('sarcastic and deadpan')).toBeInTheDocument();
  });

  it('displays fallback User icon when no avatar', () => {
    const authorWithoutAvatar = { ...mockAuthor, avatar: undefined };
    render(<PersonaBadge author={authorWithoutAvatar} />);

    const badge = screen.getByTestId('persona-badge');
    expect(badge).toContainHTML(
      'bg-gradient-to-br from-blue-400 to-purple-500'
    );
  });

  it('handles long author names with truncation', () => {
    const authorWithLongName = {
      ...mockAuthor,
      name: 'The Really Long Author Name That Should Be Truncated',
    };
    render(<PersonaBadge author={authorWithLongName} />);

    const authorElement = screen.getByText(
      'The Really Long Author Name That Should Be Truncated'
    );
    expect(authorElement).toHaveClass('truncate');
  });

  it('handles long tone descriptions with truncation', () => {
    const authorWithLongTone = {
      ...mockAuthor,
      tone: 'A very long tone description that should be truncated to prevent layout issues',
    };
    render(<PersonaBadge author={authorWithLongTone} />);

    const toneElement = screen.getByText(
      'A very long tone description that should be truncated to prevent layout issues'
    );
    expect(toneElement).toHaveClass('truncate');
  });

  it('uses correct image dimensions for different sizes', () => {
    const { rerender } = render(<PersonaBadge {...defaultProps} size='sm' />);
    let avatar = screen.getByAltText('The Snarky Sage');
    expect(avatar).toHaveAttribute('width', '24');
    expect(avatar).toHaveAttribute('height', '24');

    rerender(<PersonaBadge {...defaultProps} size='md' />);
    avatar = screen.getByAltText('The Snarky Sage');
    expect(avatar).toHaveAttribute('width', '32');
    expect(avatar).toHaveAttribute('height', '32');

    rerender(<PersonaBadge {...defaultProps} size='lg' />);
    avatar = screen.getByAltText('The Snarky Sage');
    expect(avatar).toHaveAttribute('width', '40');
    expect(avatar).toHaveAttribute('height', '40');
  });
});
