import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrendingFeed from '@/components/features/TrendingFeed';

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className, priority }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-priority={priority}
        data-testid="optimized-image"
      />
    );
  };
});

// Mock data
jest.mock('@/util/blogData', () => [
  {
    id: 1,
    title: 'Test Post 1',
    img: 'test1.jpg',
    group: 'tech',
    trending: true,
    category: 'Technology',
    author: 'Test Author',
    date: '2024-01-01',
  },
  {
    id: 2,
    title: 'Test Post 2',
    img: 'test2.jpg',
    group: 'gaming',
    trending: false,
    category: 'Gaming',
    author: 'Test Author',
    date: '2024-01-02',
  },
]);

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

// Mock React Query hooks
jest.mock('@/hooks/usePosts', () => ({
  usePosts: jest.fn(() => ({
    data: {
      posts: [
        {
          id: 1,
          title: 'Test Post 1',
          img: 'test1.jpg',
          group: 'tech',
          trending: true,
          category: 'Technology',
          author: 'Test Author',
          date: '2024-01-01',
        },
        {
          id: 2,
          title: 'Test Post 2',
          img: 'test2.jpg',
          group: 'gaming',
          trending: false,
          category: 'Gaming',
          author: 'Test Author',
          date: '2024-01-02',
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

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Image Optimization in TrendingFeed', () => {
  it('should use next/image for featured post images', () => {
    render(
      <TestWrapper>
        <TrendingFeed featured={true} postsPerPage={2} />
      </TestWrapper>
    );
    
    const images = screen.getAllByTestId('optimized-image');
    
    // Should have at least one image for featured post
    expect(images.length).toBeGreaterThan(0);
    
    // Featured image should have priority
    const featuredImage = images.find(img => 
      img.getAttribute('data-priority') === 'true'
    );
    expect(featuredImage).toBeTruthy();
    
    // Check image properties
    expect(featuredImage).toHaveAttribute('width', '800');
    expect(featuredImage).toHaveAttribute('height', '400');
    expect(featuredImage).toHaveAttribute('src', '/assets/img/tech/test1.jpg');
    expect(featuredImage).toHaveAttribute('alt', 'Test Post 1');
  });

  it('should use next/image for grid layout images', () => {
    render(
      <TestWrapper>
        <TrendingFeed layout="grid" postsPerPage={2} />
      </TestWrapper>
    );
    
    const images = screen.getAllByTestId('optimized-image');
    
    // Should have images for grid posts
    expect(images.length).toBeGreaterThan(0);
    
    // Check grid image dimensions
    const gridImages = images.filter(img => 
      img.getAttribute('width') === '400' && 
      img.getAttribute('height') === '192'
    );
    expect(gridImages.length).toBeGreaterThan(0);
    
    // Verify image sources
    gridImages.forEach(img => {
      expect(img.getAttribute('src')).toMatch(/^\/assets\/img\/[a-z]+\/test[0-9]+\.jpg$/);
    });
  });

  it('should use next/image for list layout images', () => {
    render(<TrendingFeed layout="list" postsPerPage={2} />);
    
    const images = screen.getAllByTestId('optimized-image');
    
    // Should have images for list posts
    expect(images.length).toBeGreaterThan(0);
    
    // Check list image dimensions
    const listImages = images.filter(img => 
      img.getAttribute('width') === '320' && 
      img.getAttribute('height') === '192'
    );
    expect(listImages.length).toBeGreaterThan(0);
    
    // Verify responsive classes
    listImages.forEach(img => {
      expect(img).toHaveClass('w-full', 'h-48', 'object-cover');
    });
  });

  it('should have proper alt text for accessibility', () => {
    render(<TrendingFeed postsPerPage={2} />);
    
    const images = screen.getAllByTestId('optimized-image');
    
    images.forEach(img => {
      const altText = img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
      expect(altText).toMatch(/Test Post [0-9]/);
    });
  });

  it('should use correct image paths', () => {
    render(<TrendingFeed postsPerPage={2} />);
    
    const images = screen.getAllByTestId('optimized-image');
    
    images.forEach(img => {
      const src = img.getAttribute('src');
      expect(src).toMatch(/^\/assets\/img\/[a-z]+\/[a-z0-9]+\.jpg$/);
    });
  });

  it('should handle images without featured flag', () => {
    render(<TrendingFeed featured={false} postsPerPage={2} />);
    
    const images = screen.getAllByTestId('optimized-image');
    
    // No image should have priority when not featured
    const priorityImages = images.filter(img => 
      img.getAttribute('data-priority') === 'true'
    );
    expect(priorityImages.length).toBe(0);
  });

  it('should maintain image aspect ratios with object-cover', () => {
    render(<TrendingFeed postsPerPage={2} />);
    
    const images = screen.getAllByTestId('optimized-image');
    
    images.forEach(img => {
      expect(img).toHaveClass('object-cover');
    });
  });

  it('should use appropriate image sizes for different layouts', () => {
    // Test grid layout
    const { rerender } = render(<TrendingFeed layout="grid" postsPerPage={1} />);
    let images = screen.getAllByTestId('optimized-image');
    expect(images[0]).toHaveAttribute('width', '400');
    expect(images[0]).toHaveAttribute('height', '192');

    // Test list layout
    rerender(<TrendingFeed layout="list" postsPerPage={1} />);
    images = screen.getAllByTestId('optimized-image');
    expect(images[0]).toHaveAttribute('width', '320');
    expect(images[0]).toHaveAttribute('height', '192');

    // Test featured layout
    rerender(<TrendingFeed featured={true} postsPerPage={1} />);
    images = screen.getAllByTestId('optimized-image');
    const featuredImage = images.find(img => 
      img.getAttribute('data-priority') === 'true'
    );
    expect(featuredImage).toHaveAttribute('width', '800');
    expect(featuredImage).toHaveAttribute('height', '400');
  });
});