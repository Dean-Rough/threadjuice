import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IsotopeFilter } from '@/components/elements/IsotopeFilter';

// Mock isotope-layout
jest.mock('isotope-layout', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      arrange: jest.fn(),
      destroy: jest.fn(),
    })),
  };
});

describe('IsotopeFilter', () => {
  const mockChildren = (
    <>
      <div className="isotope-item technology">Tech Item 1</div>
      <div className="isotope-item design">Design Item 1</div>
      <div className="isotope-item technology">Tech Item 2</div>
    </>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children and filter buttons', () => {
    render(
      <IsotopeFilter filters={['technology', 'design']}>
        {mockChildren}
      </IsotopeFilter>
    );

    expect(screen.getByText('Tech Item 1')).toBeInTheDocument();
    expect(screen.getByText('Design Item 1')).toBeInTheDocument();
    expect(screen.getByText('Tech Item 2')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Technology' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
  });

  it('applies default active filter to "All" button', () => {
    render(
      <IsotopeFilter filters={['technology', 'design']}>
        {mockChildren}
      </IsotopeFilter>
    );

    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'Technology' })).not.toHaveClass('active');
  });

  it('applies custom default filter', () => {
    render(
      <IsotopeFilter filters={['technology', 'design']} defaultFilter="technology">
        {mockChildren}
      </IsotopeFilter>
    );

    expect(screen.getByRole('button', { name: 'Technology' })).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active');
  });

  it('applies custom className', () => {
    const { container } = render(
      <IsotopeFilter filters={['technology']} className="custom-isotope">
        {mockChildren}
      </IsotopeFilter>
    );

    const wrapper = container.querySelector('.isotope-wrapper');
    expect(wrapper).toHaveClass('isotope-wrapper', 'custom-isotope');
  });

  it('changes active filter when button is clicked', async () => {
    render(
      <IsotopeFilter filters={['technology', 'design']}>
        {mockChildren}
      </IsotopeFilter>
    );

    const technologyButton = screen.getByRole('button', { name: 'Technology' });
    fireEvent.click(technologyButton);

    expect(technologyButton).toHaveClass('active');
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active');
  });

  it('initializes Isotope on mount', async () => {
    const IsotopeConstructor = require('isotope-layout').default;
    
    render(
      <IsotopeFilter filters={['technology']}>
        {mockChildren}
      </IsotopeFilter>
    );

    await waitFor(() => {
      expect(IsotopeConstructor).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({
          itemSelector: '.isotope-item',
          layoutMode: 'masonry',
          masonry: {
            columnWidth: '.isotope-sizer',
            gutter: '.isotope-gutter-sizer',
          },
          percentPosition: true,
          animationOptions: {
            duration: 750,
            easing: 'linear',
          },
        })
      );
    });
  });

  it('applies custom itemSelector and layoutMode', async () => {
    const IsotopeConstructor = require('isotope-layout').default;
    
    render(
      <IsotopeFilter 
        filters={['technology']} 
        itemSelector=".custom-item"
        layoutMode="fitRows"
      >
        {mockChildren}
      </IsotopeFilter>
    );

    await waitFor(() => {
      expect(IsotopeConstructor).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({
          itemSelector: '.custom-item',
          layoutMode: 'fitRows',
        })
      );
    });
  });

  it('includes sizing elements for masonry layout', () => {
    const { container } = render(
      <IsotopeFilter filters={['technology']}>
        {mockChildren}
      </IsotopeFilter>
    );

    expect(container.querySelector('.isotope-sizer')).toBeInTheDocument();
    expect(container.querySelector('.isotope-gutter-sizer')).toBeInTheDocument();
  });

  it('destroys Isotope instance on unmount', async () => {
    const mockDestroy = jest.fn();
    const IsotopeConstructor = require('isotope-layout').default;
    IsotopeConstructor.mockReturnValue({
      arrange: jest.fn(),
      destroy: mockDestroy,
    });

    const { unmount } = render(
      <IsotopeFilter filters={['technology']}>
        {mockChildren}
      </IsotopeFilter>
    );

    await waitFor(() => {
      expect(IsotopeConstructor).toHaveBeenCalled();
    });

    unmount();

    expect(mockDestroy).toHaveBeenCalled();
  });

  it('handles Isotope load failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock Isotope to throw an error
    const IsotopeConstructor = require('isotope-layout').default;
    IsotopeConstructor.mockImplementation(() => {
      throw new Error('Isotope failed to load');
    });

    render(
      <IsotopeFilter filters={['technology']}>
        {mockChildren}
      </IsotopeFilter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Isotope failed to load:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});