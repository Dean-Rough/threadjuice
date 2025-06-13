import { render, screen } from '@testing-library/react';
import Layout, { ContentType } from '@/components/layout/Layout';
import { Post } from '@/types/database';

// Mock the header and footer components
jest.mock('@/components/layout/Header/Header1', () => {
  return function Header1(props: any) {
    return <header data-testid="header-1" data-props={JSON.stringify(props)}>Header 1</header>;
  };
});

jest.mock('@/components/layout/Header/Header2', () => {
  return function Header2(props: any) {
    return <header data-testid="header-2" data-props={JSON.stringify(props)}>Header 2</header>;
  };
});

jest.mock('@/components/layout/Header/Header3', () => {
  return function Header3(props: any) {
    return <header data-testid="header-3" data-props={JSON.stringify(props)}>Header 3</header>;
  };
});

jest.mock('@/components/layout/Header/Header4', () => {
  return function Header4(props: any) {
    return <header data-testid="header-4" data-props={JSON.stringify(props)}>Header 4</header>;
  };
});

jest.mock('@/components/layout/Header/Header5', () => {
  return function Header5(props: any) {
    return <header data-testid="header-5" data-props={JSON.stringify(props)}>Header 5</header>;
  };
});

jest.mock('@/components/layout/Footer/Footer1', () => {
  return function Footer1() {
    return <footer data-testid="footer-1">Footer 1</footer>;
  };
});

jest.mock('@/components/layout/Footer/Footer2', () => {
  return function Footer2() {
    return <footer data-testid="footer-2">Footer 2</footer>;
  };
});

jest.mock('@/components/layout/Footer/Footer3', () => {
  return function Footer3() {
    return <footer data-testid="footer-3">Footer 3</footer>;
  };
});

jest.mock('@/components/layout/Breadcrumb', () => {
  return function Breadcrumb(props: any) {
    return <nav data-testid="breadcrumb" data-props={JSON.stringify(props)}>Breadcrumb</nav>;
  };
});

jest.mock('@/components/elements/BackToTop', () => {
  return function BackToTop() {
    return <button data-testid="back-to-top">Back to Top</button>;
  };
});

describe('Layout System', () => {
  const mockPost: Partial<Post> = {
    id: 'test-post-1',
    title: 'Test Post Title',
    category: 'test-category',
    layout_style: 2,
    subreddit: 'AskReddit',
  };

  beforeEach(() => {
    // Clear body classes before each test
    document.body.className = '';
  });

  describe('Content Type Layout Selection', () => {
    it('should use trending layout for trending content', () => {
      render(
        <Layout contentType="trending">
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
    });

    it('should use featured layout for featured content', () => {
      render(
        <Layout contentType="featured">
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-2')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
    });

    it('should use reading layout for reading content', () => {
      render(
        <Layout contentType="reading">
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-3')).toBeInTheDocument();
      expect(screen.getByTestId('footer-2')).toBeInTheDocument();
    });

    it('should use reddit layout for reddit content', () => {
      render(
        <Layout contentType="reddit">
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-4')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
    });

    it('should use viral layout for viral content', () => {
      render(
        <Layout contentType="viral">
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-5')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
    });

    it('should use default layout for default content', () => {
      render(
        <Layout contentType="default">
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
    });
  });

  describe('Post Data Layout Selection', () => {
    it('should use post layout_style when provided', () => {
      render(
        <Layout post={mockPost} contentType="trending">
          <div>Content</div>
        </Layout>
      );

      // Should use layout_style: 2 from post, not trending (1)
      expect(screen.getByTestId('header-2')).toBeInTheDocument();
      expect(screen.getByTestId('footer-2')).toBeInTheDocument();
    });

    it('should handle high layout_style numbers correctly', () => {
      const postWithHighStyle: Partial<Post> = {
        ...mockPost,
        layout_style: 5,
      };

      render(
        <Layout post={postWithHighStyle}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-5')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument(); // High numbers default to footer 1
    });
  });

  describe('Explicit Style Override', () => {
    it('should use explicit headerStyle and footerStyle when provided', () => {
      render(
        <Layout 
          headerStyle={3} 
          footerStyle={3} 
          post={mockPost} 
          contentType="viral"
        >
          <div>Content</div>
        </Layout>
      );

      // Should use explicit styles, ignoring post and contentType
      expect(screen.getByTestId('header-3')).toBeInTheDocument();
      expect(screen.getByTestId('footer-3')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Integration', () => {
    it('should render breadcrumb when breadcrumbCategory is provided', () => {
      render(
        <Layout breadcrumbCategory="Test Category">
          <div>Content</div>
        </Layout>
      );

      const breadcrumb = screen.getByTestId('breadcrumb');
      expect(breadcrumb).toBeInTheDocument();
      
      const breadcrumbProps = JSON.parse(breadcrumb.getAttribute('data-props') || '{}');
      expect(breadcrumbProps.breadcrumbCategory).toBe('Test Category');
    });

    it('should render breadcrumb with post data when post is provided', () => {
      render(
        <Layout post={mockPost}>
          <div>Content</div>
        </Layout>
      );

      const breadcrumb = screen.getByTestId('breadcrumb');
      expect(breadcrumb).toBeInTheDocument();
      
      const breadcrumbProps = JSON.parse(breadcrumb.getAttribute('data-props') || '{}');
      expect(breadcrumbProps.breadcrumbCategory).toBe('test-category');
      expect(breadcrumbProps.breadcrumbPostTitle).toBe('Test Post Title');
    });

    it('should not render breadcrumb when no category or post is provided', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();
    });
  });

  describe('Main Content Area', () => {
    it('should apply content-type CSS class to main element', () => {
      const { container } = render(
        <Layout contentType="reddit">
          <div>Content</div>
        </Layout>
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('main', 'content-type-reddit');
    });

    it('should apply default content-type when none specified', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('main', 'content-type-default');
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode class to body when isDarkMode is true', () => {
      render(
        <Layout isDarkMode={true}>
          <div>Content</div>
        </Layout>
      );

      expect(document.body).toHaveClass('dark-mode');
    });

    it('should remove dark mode class when isDarkMode is false', () => {
      // First set dark mode
      document.body.classList.add('dark-mode');
      
      render(
        <Layout isDarkMode={false}>
          <div>Content</div>
        </Layout>
      );

      expect(document.body).not.toHaveClass('dark-mode');
    });

    it('should pass isDarkMode to header props', () => {
      render(
        <Layout isDarkMode={true}>
          <div>Content</div>
        </Layout>
      );

      const header = screen.getByTestId('header-1');
      const headerProps = JSON.parse(header.getAttribute('data-props') || '{}');
      expect(headerProps.isDarkMode).toBe(true);
    });
  });

  describe('Component Rendering', () => {
    it('should render all core layout components', () => {
      render(
        <Layout>
          <div data-testid="page-content">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
      expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });

    it('should pass basic props to header components', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const header = screen.getByTestId('header-1');
      const headerProps = JSON.parse(header.getAttribute('data-props') || '{}');
      
      // Test serializable props only (functions can't be JSON serialized)
      expect(headerProps).toHaveProperty('scroll');
      expect(headerProps).toHaveProperty('langToggle');
      expect(headerProps).toHaveProperty('isDarkMode');
      expect(headerProps.scroll).toBe(false);
      expect(headerProps.langToggle).toBe(false);
      expect(headerProps.isDarkMode).toBe(false);
    });
  });
});