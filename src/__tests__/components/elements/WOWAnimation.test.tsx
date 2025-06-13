import { render, screen, waitFor } from '@testing-library/react';
import { WOWAnimation } from '@/components/elements/WOWAnimation';

// Mock WOW.js
jest.mock('wowjs', () => ({
  WOW: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
  })),
}));

describe('WOWAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <WOWAnimation>
        <div data-testid="test-child">Test Content</div>
      </WOWAnimation>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default animation classes and attributes', () => {
    render(
      <WOWAnimation>
        <div>Content</div>
      </WOWAnimation>
    );

    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper).toHaveClass('wow', 'fadeInUp');
    expect(wrapper).toHaveAttribute('data-wow-delay', '0s');
    expect(wrapper).toHaveAttribute('data-wow-duration', '1s');
    expect(wrapper).toHaveAttribute('data-wow-offset', '100');
  });

  it('applies custom animation and timing props', () => {
    render(
      <WOWAnimation 
        animation="fadeInLeft"
        delay="0.5s"
        duration="2s"
        offset={200}
      >
        <div>Content</div>
      </WOWAnimation>
    );

    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper).toHaveClass('wow', 'fadeInLeft');
    expect(wrapper).toHaveAttribute('data-wow-delay', '0.5s');
    expect(wrapper).toHaveAttribute('data-wow-duration', '2s');
    expect(wrapper).toHaveAttribute('data-wow-offset', '200');
  });

  it('applies custom className', () => {
    render(
      <WOWAnimation className="custom-class">
        <div>Content</div>
      </WOWAnimation>
    );

    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper).toHaveClass('wow', 'fadeInUp', 'custom-class');
  });

  it('initializes WOW.js on mount', async () => {
    const { WOW } = await import('wowjs');
    const mockWOWInstance = {
      init: jest.fn(),
    };
    (WOW as jest.Mock).mockReturnValue(mockWOWInstance);

    render(
      <WOWAnimation>
        <div>Content</div>
      </WOWAnimation>
    );

    await waitFor(() => {
      expect(WOW).toHaveBeenCalledWith({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 100,
        mobile: true,
        live: true,
      });
      expect(mockWOWInstance.init).toHaveBeenCalled();
    });
  });

  it('handles WOW.js load failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Mock import failure
    jest.doMock('wowjs', () => {
      throw new Error('Module not found');
    });

    render(
      <WOWAnimation>
        <div>Content</div>
      </WOWAnimation>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'WOW.js failed to load:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});