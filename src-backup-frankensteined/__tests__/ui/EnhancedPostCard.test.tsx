import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostCard } from '@/components/ui/PostCard';
import { Post } from '@/types/database';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock WOWAnimation component
jest.mock('@/components/elements/WOWAnimation', () => ({
  WOWAnimation: ({ children, className, animation, delay }: any) => (
    <div
      data-testid='wow-animation'
      data-animation={animation}
      data-delay={delay}
      className={className}
    >
      {children}
    </div>
  ),
}));

// Mock badge components
jest.mock('@/components/ui/PersonaBadge', () => ({
  PersonaBadge: ({ persona, variant }: any) => (
    <div data-testid='persona-badge' data-variant={variant}>
      {persona.name}
    </div>
  ),
}));

jest.mock('@/components/ui/CategoryBadge', () => ({
  CategoryBadge: ({ category, variant }: any) => (
    <div data-testid='category-badge' data-variant={variant}>
      {category}
    </div>
  ),
}));

jest.mock('@/components/ui/TrendingBadge', () => ({
  TrendingBadge: ({ score, variant }: any) => (
    <div data-testid='trending-badge' data-variant={variant}>
      Trending: {score}
    </div>
  ),
}));

describe('Enhanced PostCard', () => {
  const mockPost: Post = {
    id: '1',
    slug: 'test-post',
    title: 'Test Post Title',
    hook: 'This is a test post description that serves as a hook.',
    content: { text: 'Post content' },
    featured_image: 'https://example.com/image.jpg',
    category: 'Technology',
    persona_id: 'persona-1',
    trending_score: 75,
    view_count: 1250,
    share_count: 89,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    event_id: 'event-1',
    published: true,
    status: 'published',
    reddit_thread_id: 'reddit-123',
    word_count: 500,
    reading_time: 3,
    seo_title: 'SEO Title',
    seo_description: 'SEO Description',
    social_image: 'https://example.com/social.jpg',
  };

  it('should render with all components when fully configured', () => {
    render(
      <PostCard
        post={mockPost}
        showExcerpt={true}
        showMeta={true}
        showPersona={true}
        variant='magazine'
      />
    );

    // Check WOWAnimation wrapper
    const wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveAttribute('data-animation', 'fadeInUp');
    expect(wowAnimation).toHaveClass('sarsa-post-card--magazine');

    // Check title and link
    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    const titleLink = screen.getByRole('link', { name: mockPost.title });
    expect(titleLink).toHaveAttribute('href', `/posts/${mockPost.slug}`);

    // Check featured image
    const image = screen.getByRole('img', { name: mockPost.title });
    expect(image).toHaveAttribute('src', mockPost.featured_image);
    expect(image).toHaveAttribute('loading', 'lazy');

    // Check excerpt
    expect(screen.getByText(mockPost.hook!)).toBeInTheDocument();

    // Check badges
    expect(screen.getByTestId('category-badge')).toBeInTheDocument();
    expect(screen.getByTestId('trending-badge')).toBeInTheDocument();
    expect(screen.getByTestId('persona-badge')).toBeInTheDocument();
  });

  it('should apply correct variant classes', () => {
    const { rerender } = render(<PostCard post={mockPost} variant='compact' />);
    let wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveClass('sarsa-post-card--compact');

    rerender(<PostCard post={mockPost} variant='minimal' />);
    wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveClass('sarsa-post-card--minimal');

    rerender(<PostCard post={mockPost} variant='featured' />);
    wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveClass('sarsa-post-card--featured');
  });

  it('should render without optional elements when flags are false', () => {
    render(
      <PostCard
        post={mockPost}
        showExcerpt={false}
        showMeta={false}
        showPersona={false}
      />
    );

    expect(screen.queryByText(mockPost.hook!)).not.toBeInTheDocument();
    expect(screen.queryByTestId('persona-badge')).not.toBeInTheDocument();
    expect(screen.queryByText('min read')).not.toBeInTheDocument();
  });

  it('should handle post without featured image', () => {
    const postWithoutImage = { ...mockPost, featured_image: null };
    render(<PostCard post={postWithoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByTestId('category-badge')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trending-badge')).not.toBeInTheDocument();
  });

  it('should handle post without category', () => {
    const postWithoutCategory = { ...mockPost, category: null };
    render(<PostCard post={postWithoutCategory} />);

    expect(screen.queryByTestId('category-badge')).not.toBeInTheDocument();
  });

  it('should only show trending badge for high scoring posts', () => {
    const { rerender } = render(
      <PostCard post={{ ...mockPost, trending_score: 30 }} />
    );
    expect(screen.queryByTestId('trending-badge')).not.toBeInTheDocument();

    rerender(<PostCard post={{ ...mockPost, trending_score: 60 }} />);
    expect(screen.getByTestId('trending-badge')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<PostCard post={mockPost} showMeta={true} />);

    // Check that date is formatted (Jan 15, 2024)
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('should calculate and display reading time', () => {
    render(<PostCard post={mockPost} showMeta={true} />);

    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it('should display view and share counts with proper formatting', () => {
    render(<PostCard post={mockPost} showMeta={true} />);

    expect(screen.getByText('1,250')).toBeInTheDocument(); // view count
    expect(screen.getByText('89')).toBeInTheDocument(); // share count
  });

  it('should handle zero counts gracefully', () => {
    const postWithZeroCounts = {
      ...mockPost,
      view_count: 0,
      share_count: 0,
    };

    render(<PostCard post={postWithZeroCounts} showMeta={true} />);

    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('should handle missing counts gracefully', () => {
    const postWithNullCounts = {
      ...mockPost,
      view_count: null,
      share_count: null,
    };

    render(<PostCard post={postWithNullCounts} showMeta={true} />);

    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('should apply custom animation delay', () => {
    render(<PostCard post={mockPost} animationDelay={500} />);

    const wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveAttribute('data-delay', '500');
  });

  it('should apply custom className', () => {
    const customClass = 'custom-post-card';
    render(<PostCard post={mockPost} className={customClass} />);

    const wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveClass(customClass);
  });

  it('should have proper semantic HTML structure', () => {
    render(<PostCard post={mockPost} showMeta={true} />);

    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass('sarsa-post-card__wrapper');

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('sarsa-post-card__title');

    const time = screen.getByRole('generic', { name: /jan 15, 2024/i });
    expect(time?.closest('time')).toHaveAttribute(
      'dateTime',
      mockPost.created_at
    );
  });

  it('should handle post without hook gracefully', () => {
    const postWithoutHook = { ...mockPost, hook: null };
    render(<PostCard post={postWithoutHook} showExcerpt={true} />);

    expect(screen.queryByText(mockPost.hook!)).not.toBeInTheDocument();
  });

  it('should render correct badge variants', () => {
    render(<PostCard post={mockPost} showPersona={true} />);

    const categoryBadge = screen.getByTestId('category-badge');
    expect(categoryBadge).toHaveAttribute('data-variant', 'overlay');

    const trendingBadge = screen.getByTestId('trending-badge');
    expect(trendingBadge).toHaveAttribute('data-variant', 'overlay');

    const personaBadge = screen.getByTestId('persona-badge');
    expect(personaBadge).toHaveAttribute('data-variant', 'compact');
  });

  it('should handle complex content for reading time calculation', () => {
    const postWithComplexContent = {
      ...mockPost,
      content: {
        sections: [
          { text: 'First section with many words to calculate reading time' },
          {
            text: 'Second section with even more words to test the calculation',
          },
        ],
      },
    };

    render(<PostCard post={postWithComplexContent} showMeta={true} />);

    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it('should have proper CSS classes for styling', () => {
    render(
      <PostCard post={mockPost} variant='magazine' className='custom-class' />
    );

    const wowAnimation = screen.getByTestId('wow-animation');
    expect(wowAnimation).toHaveClass(
      'sarsa-post-card',
      'sarsa-post-card--magazine',
      'custom-class'
    );
  });

  it('should include proper Font Awesome icons', () => {
    render(<PostCard post={mockPost} showMeta={true} />);

    const dateIcon = screen
      .getByRole('article')
      .querySelector('.far.fa-calendar-alt');
    expect(dateIcon).toBeInTheDocument();

    const clockIcon = screen
      .getByRole('article')
      .querySelector('.far.fa-clock');
    expect(clockIcon).toBeInTheDocument();

    const eyeIcon = screen.getByRole('article').querySelector('.far.fa-eye');
    expect(eyeIcon).toBeInTheDocument();

    const shareIcon = screen
      .getByRole('article')
      .querySelector('.far.fa-share-alt');
    expect(shareIcon).toBeInTheDocument();
  });
});
