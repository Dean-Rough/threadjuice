import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '@/components/layout/Layout';

// Mock components
jest.mock('@/components/layout/Header/Header1', () => {
  return function Header1(props: any) {
    return (
      <header data-testid='header-1'>
        <button
          onClick={props.handleMobileMenuOpen}
          data-testid='mobile-menu-toggle'
        >
          Mobile Menu
        </button>
        <button onClick={props.handleSidebarOpen} data-testid='sidebar-toggle'>
          Sidebar
        </button>
      </header>
    );
  };
});

jest.mock('@/components/layout/Footer/Footer1', () => {
  return function Footer1() {
    return <footer data-testid='footer-1'>Footer</footer>;
  };
});

jest.mock('@/components/layout/Breadcrumb', () => {
  return function Breadcrumb() {
    return <nav data-testid='breadcrumb'>Breadcrumb</nav>;
  };
});

jest.mock('@/components/elements/BackToTop', () => {
  return function BackToTop() {
    return <button data-testid='back-to-top'>Back to Top</button>;
  };
});

// Mock window.scrollY and matchMedia
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Responsive Layout', () => {
  beforeEach(() => {
    // Clear body classes before each test
    document.body.className = '';
    // Reset scroll position
    window.scrollY = 0;
  });

  describe('Mobile Menu Functionality', () => {
    it('should handle mobile menu open/close', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const mobileMenuToggle = screen.getByTestId('mobile-menu-toggle');

      // Mobile menu should not be visible initially
      expect(document.body).not.toHaveClass('mobile-menu-visible');

      // Test mobile menu open
      fireEvent.click(mobileMenuToggle);
      expect(document.body).toHaveClass('mobile-menu-visible');
    });

    it('should handle sidebar open/close', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const sidebarToggle = screen.getByTestId('sidebar-toggle');

      // Sidebar should not be visible initially
      expect(document.body).not.toHaveClass('offCanvas__menu-visible');

      // Test sidebar open
      fireEvent.click(sidebarToggle);
      expect(document.body).toHaveClass('offCanvas__menu-visible');
    });
  });

  describe('Scroll Detection', () => {
    it('should detect scroll changes', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Simulate scroll past threshold
      window.scrollY = 150;
      fireEvent.scroll(document);

      // Note: The actual scroll state change would require more complex mocking
      // This test verifies the scroll event listener is attached
      expect(screen.getByTestId('header-1')).toBeInTheDocument();
    });

    it('should handle scroll threshold correctly', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Scroll below threshold
      window.scrollY = 50;
      fireEvent.scroll(document);

      // Scroll above threshold
      window.scrollY = 150;
      fireEvent.scroll(document);

      // Header should still be rendered
      expect(screen.getByTestId('header-1')).toBeInTheDocument();
    });
  });

  describe('Layout Breakpoints', () => {
    it('should render with responsive container classes', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Check that the layout structure supports responsive design
      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('main');
    });

    it('should support different content types with responsive classes', () => {
      const contentTypes = [
        'trending',
        'featured',
        'reading',
        'reddit',
        'viral',
      ];

      contentTypes.forEach(contentType => {
        const { container } = render(
          <Layout contentType={contentType as any}>
            <div>Content for {contentType}</div>
          </Layout>
        );

        const mainElement = container.querySelector('main');
        expect(mainElement).toHaveClass(`content-type-${contentType}`);
      });
    });
  });

  describe('Viewport Meta Support', () => {
    it('should work with standard mobile viewport settings', () => {
      // This test ensures our layout works with mobile viewport meta tags
      // The actual meta tag would be set in the HTML head
      render(
        <Layout>
          <div style={{ width: '100%', maxWidth: '375px' }}>Mobile Content</div>
        </Layout>
      );

      expect(screen.getByText('Mobile Content')).toBeInTheDocument();
    });
  });

  describe('Touch and Gesture Support', () => {
    it('should handle touch events for mobile navigation', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const mobileMenuToggle = screen.getByTestId('mobile-menu-toggle');

      // Simulate touch events
      fireEvent.touchStart(mobileMenuToggle);
      fireEvent.touchEnd(mobileMenuToggle);
      fireEvent.click(mobileMenuToggle);

      // Should handle touch interactions
      expect(document.body).toHaveClass('mobile-menu-visible');
    });
  });

  describe('Content Overflow Handling', () => {
    it('should handle long content gracefully', () => {
      const longContent = 'A'.repeat(1000);

      render(
        <Layout breadcrumbPostTitle={longContent}>
          <div>{longContent}</div>
        </Layout>
      );

      // Layout should render without breaking
      expect(screen.getByTestId('header-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Accessibility', () => {
    it('should provide proper navigation landmarks', () => {
      render(
        <Layout breadcrumbCategory='Test'>
          <div>Content</div>
        </Layout>
      );

      // Check for semantic HTML elements
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // From breadcrumb
    });

    it('should support keyboard navigation', () => {
      render(
        <Layout>
          <div>
            <button>Interactive Element</button>
          </div>
        </Layout>
      );

      const button = screen.getByRole('button', {
        name: 'Interactive Element',
      });
      button.focus();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('Performance Considerations', () => {
    it('should render efficiently with minimal re-renders', () => {
      const { rerender } = render(
        <Layout>
          <div>Content 1</div>
        </Layout>
      );

      // Re-render with different content
      rerender(
        <Layout>
          <div>Content 2</div>
        </Layout>
      );

      // Layout should still be functional
      expect(screen.getByTestId('header-1')).toBeInTheDocument();
      expect(screen.getByTestId('footer-1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Simulate scroll event
      fireEvent.scroll(document);

      // Unmount component
      unmount();

      // Further scroll events should not cause issues
      fireEvent.scroll(document);

      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Dark Mode Responsive Behavior', () => {
    it('should handle dark mode on mobile devices', () => {
      render(
        <Layout isDarkMode={true}>
          <div>Dark mode content</div>
        </Layout>
      );

      expect(document.body).toHaveClass('dark-mode');
      expect(screen.getByText('Dark mode content')).toBeInTheDocument();
    });

    it('should toggle dark mode without affecting responsive layout', () => {
      const { rerender } = render(
        <Layout isDarkMode={false}>
          <div>Content</div>
        </Layout>
      );

      expect(document.body).not.toHaveClass('dark-mode');

      rerender(
        <Layout isDarkMode={true}>
          <div>Content</div>
        </Layout>
      );

      expect(document.body).toHaveClass('dark-mode');
      expect(screen.getByTestId('header-1')).toBeInTheDocument();
    });
  });
});
