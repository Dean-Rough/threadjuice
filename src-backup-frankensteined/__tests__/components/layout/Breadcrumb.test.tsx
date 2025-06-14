import { render, screen } from '@testing-library/react';
import Breadcrumb from '@/components/layout/Breadcrumb';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function Link({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Breadcrumb Component', () => {
  describe('Basic Functionality', () => {
    it('should render home breadcrumb by default', () => {
      render(<Breadcrumb />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Home').closest('a')).toHaveAttribute(
        'href',
        '/'
      );
    });

    it('should render category breadcrumb when provided', () => {
      render(<Breadcrumb breadcrumbCategory='Technology' />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Technology').closest('a')).toHaveAttribute(
        'href',
        '/category/technology'
      );
    });

    it('should render post title as active breadcrumb', () => {
      render(
        <Breadcrumb
          breadcrumbCategory='Technology'
          breadcrumbPostTitle='Test Post Title'
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();

      const activeItem = screen.getByText('Test Post Title');
      expect(activeItem).toBeInTheDocument();
      expect(activeItem.closest('li')).toHaveClass('breadcrumb-item', 'active');
      expect(activeItem.closest('li')).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Reddit Integration', () => {
    it('should render subreddit breadcrumb when provided', () => {
      render(<Breadcrumb subreddit='AskReddit' />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('r/AskReddit')).toBeInTheDocument();
      expect(screen.getByText('r/AskReddit').closest('a')).toHaveAttribute(
        'href',
        '/r/AskReddit'
      );
    });

    it('should render subreddit with category and post title', () => {
      render(
        <Breadcrumb
          subreddit='TodayILearned'
          breadcrumbCategory='Education'
          breadcrumbPostTitle='TIL something amazing'
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('r/TodayILearned')).toBeInTheDocument();
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('TIL something amazing')).toBeInTheDocument();
    });
  });

  describe('Persona Integration', () => {
    it('should render persona breadcrumb when provided', () => {
      render(<Breadcrumb persona='The Snarky Sage' />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('The Snarky Sage')).toBeInTheDocument();
      expect(screen.getByText('The Snarky Sage').closest('a')).toHaveAttribute(
        'href',
        '/author/the-snarky-sage'
      );
    });

    it('should render persona with category', () => {
      render(
        <Breadcrumb
          persona='The Down-to-Earth Buddy'
          breadcrumbCategory='Relationships'
          breadcrumbPostTitle='Dating advice post'
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Relationships')).toBeInTheDocument();
      expect(screen.getByText('The Down-to-Earth Buddy')).toBeInTheDocument();
      expect(screen.getByText('Dating advice post')).toBeInTheDocument();
    });
  });

  describe('Custom Path', () => {
    it('should render custom path when provided', () => {
      const customPath = [
        { label: 'Trending', href: '/trending' },
        { label: 'This Week', href: '/trending/week' },
      ];

      render(<Breadcrumb customPath={customPath} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Trending')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();

      expect(screen.getByText('Trending').closest('a')).toHaveAttribute(
        'href',
        '/trending'
      );
      expect(screen.getByText('This Week').closest('a')).toHaveAttribute(
        'href',
        '/trending/week'
      );
    });

    it('should use custom path instead of category/subreddit when provided', () => {
      const customPath = [{ label: 'Custom', href: '/custom' }];

      render(
        <Breadcrumb
          customPath={customPath}
          breadcrumbCategory='Should Not Show'
          subreddit='ShouldNotShow'
          persona='Should Not Show'
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument();
      expect(screen.queryByText('r/ShouldNotShow')).not.toBeInTheDocument();
    });
  });

  describe('Long Title Truncation', () => {
    it('should truncate long post titles', () => {
      const longTitle =
        'This is a very long post title that should be truncated because it exceeds the character limit for breadcrumb display';

      render(<Breadcrumb breadcrumbPostTitle={longTitle} />);

      const titleElement = screen.getByText(
        /This is a very long post title that should be truncated/
      );
      expect(titleElement.textContent).toMatch(/\.\.\.$/);
      expect(titleElement.textContent?.length).toBeLessThan(longTitle.length);
    });

    it('should not truncate short post titles', () => {
      const shortTitle = 'Short title';

      render(<Breadcrumb breadcrumbPostTitle={shortTitle} />);

      expect(screen.getByText(shortTitle)).toBeInTheDocument();
    });
  });

  describe('Category URL Formatting', () => {
    it('should format category names with spaces correctly', () => {
      render(<Breadcrumb breadcrumbCategory='Relationship Drama' />);

      const categoryLink = screen.getByText('Relationship Drama').closest('a');
      expect(categoryLink).toHaveAttribute(
        'href',
        '/category/relationship-drama'
      );
    });

    it('should format category names with special characters', () => {
      render(<Breadcrumb breadcrumbCategory='Today I F***ed Up' />);

      const categoryLink = screen.getByText('Today I F***ed Up').closest('a');
      expect(categoryLink).toHaveAttribute(
        'href',
        '/category/today-i-f***ed-up'
      );
    });
  });

  describe('Persona URL Formatting', () => {
    it('should format persona names with spaces correctly', () => {
      render(<Breadcrumb persona='The Dry Cynic' />);

      const personaLink = screen.getByText('The Dry Cynic').closest('a');
      expect(personaLink).toHaveAttribute('href', '/author/the-dry-cynic');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Breadcrumb
          breadcrumbCategory='Technology'
          breadcrumbPostTitle='Test Post'
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'breadcrumb');

      const breadcrumbList = screen.getByRole('list');
      expect(breadcrumbList).toHaveClass('breadcrumb');

      const activeItem = screen.getByText('Test Post').closest('li');
      expect(activeItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Icon Display', () => {
    it('should display home icon', () => {
      render(<Breadcrumb />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink?.querySelector('i')).toHaveClass('fas', 'fa-home');
    });

    it('should display Reddit icon for subreddit', () => {
      render(<Breadcrumb subreddit='AskReddit' />);

      const subredditLink = screen.getByText('r/AskReddit').closest('a');
      expect(subredditLink?.querySelector('i')).toHaveClass('fab', 'fa-reddit');
    });

    it('should display user icon for persona', () => {
      render(<Breadcrumb persona='Test Author' />);

      const personaLink = screen.getByText('Test Author').closest('a');
      expect(personaLink?.querySelector('i')).toHaveClass('fas', 'fa-user');
    });
  });
});
