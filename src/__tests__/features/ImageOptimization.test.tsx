import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrendingFeed from '@/components/features/TrendingFeed';

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    width,
    height,
    className,
    priority,
  }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-priority={priority}
        data-testid='optimized-image'
      />
    );
  };
});

// Mock React Query hooks
jest.mock('@/hooks/usePosts', () => ({
  usePosts: jest.fn(() => ({
    data: {
      posts: [
        {
          id: 1,
          title: 'Test Post 1',
          image_url: '/assets/img/tech/test1.jpg',
          group: 'tech',
          trending: true,
          category: 'Technology',
          author: 'Test Author',
          created_at: '2024-01-01T00:00:00Z',
          comment_count: 42,
          share_count: 13,
        },
        {
          id: 2,
          title: 'Test Post 2',
          image_url: '/assets/img/gaming/test2.jpg',
          group: 'gaming',
          trending: false,
          category: 'Gaming',
          author: 'Test Author',
          created_at: '2024-01-02T00:00:00Z',
          comment_count: 25,
          share_count: 8,
        },
      ],
      total: 2,
      hasMore: false,
    },
    isLoading: false,
    error: null,
  })),
  usePostsByCategory: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

// Mock personas
jest.mock('@/data/personas', () => ({
  getRandomPersona: () => ({
    id: 'test-persona',
    name: 'Test Persona',
    bio: 'Test bio',
    avatar: 'test-avatar.jpg',
    style: 'Test style',
  }),
}));

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Image Optimization in TrendingFeed', () => {
  it('should use next/image for featured post images', () => {
    render(
      <TestWrapper>
        <TrendingFeed featured={true} postsPerPage={2} />
      </TestWrapper>
    );

    const featuredImages = screen.getAllByTestId('optimized-image');

    // Should have at least one image for featured post
    expect(featuredImages.length).toBeGreaterThan(0);

    // Featured image should have priority
    const featuredImage = featuredImages.find(
      img => img.getAttribute('data-priority') === 'true'
    );
    expect(featuredImage).toBeTruthy();

    // Check image properties
    expect(featuredImage).toHaveAttribute('width', '800');
    expect(featuredImage).toHaveAttribute('height', '400');
    expect(featuredImage).toHaveAttribute('src', '/assets/img/tech/test1.jpg');
    expect(featuredImage).toHaveAttribute('alt', 'Test Post 1');
  });

  it('should use background images for grid layout (not next/image)', () => {
    render(
      <TestWrapper>
        <TrendingFeed layout='grid' postsPerPage={2} />
      </TestWrapper>
    );

    // Grid layout uses background images, not <img> tags
    const backgroundImageDivs = screen.getAllByRole('article');
    expect(backgroundImageDivs.length).toBeGreaterThan(0);

    // Check that the first post has the correct background image
    const firstPostCard = backgroundImageDivs[0].querySelector(
      'div[style*="background-image"]'
    );
    expect(firstPostCard).toBeTruthy();
    expect(firstPostCard).toHaveStyle(
      'background-image: url("/assets/img/tech/test1.jpg")'
    );
  });

  it('should use next/image for list layout images', () => {
    render(
      <TestWrapper>
        <TrendingFeed layout='list' postsPerPage={2} />
      </TestWrapper>
    );

    const images = screen.getAllByTestId('optimized-image');

    // Should have images for list posts
    expect(images.length).toBeGreaterThan(0);

    // Check list image dimensions
    const listImages = images.filter(
      img =>
        img.getAttribute('width') === '320' &&
        img.getAttribute('height') === '192'
    );
    expect(listImages.length).toBeGreaterThan(0);

    // Verify responsive classes
    listImages.forEach(img => {
      expect(img).toHaveClass('w-full', 'h-48', 'object-cover');
    });
  });

  it('should have proper alt text for next/image components', () => {
    render(
      <TestWrapper>
        <TrendingFeed layout='list' postsPerPage={2} />
      </TestWrapper>
    );

    const images = screen.getAllByTestId('optimized-image');

    images.forEach(img => {
      const altText = img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
      expect(altText).toMatch(/Test Post [0-9]/);
    });
  });

  it('should use correct image paths for next/image components', () => {
    render(
      <TestWrapper>
        <TrendingFeed layout='list' postsPerPage={2} />
      </TestWrapper>
    );

    const images = screen.getAllByTestId('optimized-image');

    images.forEach(img => {
      const src = img.getAttribute('src');
      expect(src).toMatch(/^\/assets\/img\/(tech|gaming)\/test[0-9]+\.jpg$/);
    });
  });

  it('should handle images without featured flag', () => {
    render(
      <TestWrapper>
        <TrendingFeed featured={false} layout='list' postsPerPage={2} />
      </TestWrapper>
    );

    const images = screen.getAllByTestId('optimized-image');

    // No image should have priority when not featured
    const priorityImages = images.filter(
      img => img.getAttribute('data-priority') === 'true'
    );
    expect(priorityImages.length).toBe(0);
  });

  it('should maintain image aspect ratios with object-cover for next/image', () => {
    render(
      <TestWrapper>
        <TrendingFeed layout='list' postsPerPage={2} />
      </TestWrapper>
    );

    const images = screen.getAllByTestId('optimized-image');

    images.forEach(img => {
      expect(img).toHaveClass('object-cover');
    });
  });

  it('should use appropriate image sizes for different layouts', () => {
    // Test list layout
    const { rerender } = render(
      <TestWrapper>
        <TrendingFeed layout='list' postsPerPage={1} />
      </TestWrapper>
    );
    let images = screen.getAllByTestId('optimized-image');
    expect(images[0]).toHaveAttribute('width', '320');
    expect(images[0]).toHaveAttribute('height', '192');

    // Test featured layout
    rerender(
      <TestWrapper>
        <TrendingFeed featured={true} postsPerPage={1} />
      </TestWrapper>
    );
    images = screen.getAllByTestId('optimized-image');
    const featuredImage = images.find(
      img => img.getAttribute('data-priority') === 'true'
    );
    expect(featuredImage).toHaveAttribute('width', '800');
    expect(featuredImage).toHaveAttribute('height', '400');
  });

  it('should use background images for grid and masonry layouts', () => {
    const { rerender } = render(
      <TestWrapper>
        <TrendingFeed layout='grid' postsPerPage={2} />
      </TestWrapper>
    );

    // Check grid layout uses background images
    let backgroundImageDivs = screen.getAllByRole('article');
    expect(backgroundImageDivs.length).toBeGreaterThan(0);

    let firstPostCard = backgroundImageDivs[0].querySelector(
      'div[style*="background-image"]'
    );
    expect(firstPostCard).toBeTruthy();

    // Test masonry layout
    rerender(
      <TestWrapper>
        <TrendingFeed layout='masonry' postsPerPage={2} />
      </TestWrapper>
    );

    backgroundImageDivs = screen.getAllByRole('article');
    expect(backgroundImageDivs.length).toBeGreaterThan(0);

    firstPostCard = backgroundImageDivs[0].querySelector(
      'div[style*="background-image"]'
    );
    expect(firstPostCard).toBeTruthy();
  });
});
