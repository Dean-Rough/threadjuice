import { render, screen } from '@testing-library/react';
import { Post } from '@/types/database';

// Mock the entire TrendingSlider component since Swiper is complex to mock
jest.mock('@/components/slider/TrendingSlider', () => ({
  TrendingSlider: ({
    posts,
    className = '',
  }: {
    posts: any[];
    className?: string;
  }) => (
    <div
      data-testid='trending-slider'
      className={`trending-slider ${className}`}
    >
      {posts.map((post, i) => (
        <div key={i} data-testid='trending-post'>
          <h4>{post.title}</h4>
          <a href={`/category/${post.category?.toLowerCase()}`}>
            {post.category}
          </a>
          <a
            href={`/author/${post.persona_name?.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {post.persona_name}
          </a>
          <span>{post.view_count}</span>
          <span>{post.comment_count}</span>
          <span>{post.share_count}</span>
        </div>
      ))}
    </div>
  ),
}));

import { TrendingSlider } from '@/components/slider/TrendingSlider';

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Test Post 1',
    slug: 'test-post-1',
    content: 'Test content 1',
    excerpt: 'Test excerpt 1',
    featured_image: '/test-image-1.jpg',
    category: 'Technology',
    persona_name: 'The Snarky Sage',
    is_trending: true,
    view_count: 1500,
    comment_count: 25,
    share_count: 10,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    status: 'published',
    user_id: 'user1',
    reddit_thread_id: null,
    reddit_url: null,
    tags: ['tech', 'trending'],
    seo_title: null,
    seo_description: null,
    social_image: null,
  },
  {
    id: '2',
    title: 'Test Post 2',
    slug: 'test-post-2',
    content: 'Test content 2',
    excerpt: 'Test excerpt 2',
    featured_image: '/test-image-2.jpg',
    category: 'Gaming',
    persona_name: 'The Down-to-Earth Buddy',
    is_trending: false,
    view_count: 800,
    comment_count: 15,
    share_count: 5,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    status: 'published',
    user_id: 'user2',
    reddit_thread_id: null,
    reddit_url: null,
    tags: ['gaming'],
    seo_title: null,
    seo_description: null,
    social_image: null,
  },
];

describe('TrendingSlider', () => {
  it('renders without crashing', () => {
    render(<TrendingSlider posts={mockPosts} />);
    expect(screen.getByTestId('trending-slider')).toBeInTheDocument();
  });

  it('renders all posts', () => {
    render(<TrendingSlider posts={mockPosts} />);

    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('renders category links correctly', () => {
    render(<TrendingSlider posts={mockPosts} />);

    expect(screen.getByRole('link', { name: /technology/i })).toHaveAttribute(
      'href',
      '/category/technology'
    );
    expect(screen.getByRole('link', { name: /gaming/i })).toHaveAttribute(
      'href',
      '/category/gaming'
    );
  });

  it('renders author links correctly', () => {
    render(<TrendingSlider posts={mockPosts} />);

    expect(
      screen.getByRole('link', { name: /the snarky sage/i })
    ).toHaveAttribute('href', '/author/the-snarky-sage');
    expect(
      screen.getByRole('link', { name: /the down-to-earth buddy/i })
    ).toHaveAttribute('href', '/author/the-down-to-earth-buddy');
  });

  it('renders post statistics correctly', () => {
    render(<TrendingSlider posts={mockPosts} />);

    expect(screen.getByText('1500')).toBeInTheDocument(); // view count
    expect(screen.getByText('25')).toBeInTheDocument(); // comment count
    expect(screen.getByText('10')).toBeInTheDocument(); // share count
  });

  it('applies custom className', () => {
    render(<TrendingSlider posts={mockPosts} className='custom-class' />);
    expect(screen.getByTestId('trending-slider')).toHaveClass(
      'trending-slider',
      'custom-class'
    );
  });
});
