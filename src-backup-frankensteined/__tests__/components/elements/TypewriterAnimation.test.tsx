import { render, screen } from '@testing-library/react';
import { TypewriterAnimation } from '@/components/elements/TypewriterAnimation';

// Mock typewriter-effect
jest.mock('typewriter-effect', () => {
  return function MockTypewriter({ onInit, options }: any) {
    const mockTypewriter = {
      start: jest.fn(),
      typeString: jest.fn(),
      deleteAll: jest.fn(),
    };

    // Simulate the onInit callback
    if (onInit) {
      setTimeout(() => onInit(mockTypewriter), 0);
    }

    return (
      <div data-testid='typewriter-mock'>
        {options.strings?.[0] || 'Mock Typewriter'}
      </div>
    );
  };
});

describe('TypewriterAnimation', () => {
  it('renders with default props', () => {
    render(<TypewriterAnimation strings={['Hello World', 'Welcome']} />);

    expect(screen.getByTestId('typewriter-mock')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TypewriterAnimation strings={['Test']} className='custom-typewriter' />
    );

    const wrapper = container.querySelector('.typewriter-animation');
    expect(wrapper).toHaveClass('typewriter-animation', 'custom-typewriter');
  });

  it('passes correct options to Typewriter component', () => {
    const strings = ['First String', 'Second String'];

    render(
      <TypewriterAnimation
        strings={strings}
        autoStart={false}
        loop={false}
        delay={100}
        deleteSpeed={50}
      />
    );

    expect(screen.getByTestId('typewriter-mock')).toBeInTheDocument();
    expect(screen.getByText('First String')).toBeInTheDocument();
  });

  it('calls custom onInit function when provided', async () => {
    const mockOnInit = jest.fn();

    render(<TypewriterAnimation strings={['Test']} onInit={mockOnInit} />);

    // Wait for the setTimeout in the mock
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockOnInit).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.any(Function),
        typeString: expect.any(Function),
        deleteAll: expect.any(Function),
      })
    );
  });

  it('handles multiple strings', () => {
    const strings = ['String 1', 'String 2', 'String 3'];

    render(<TypewriterAnimation strings={strings} />);

    expect(screen.getByTestId('typewriter-mock')).toBeInTheDocument();
    expect(screen.getByText('String 1')).toBeInTheDocument();
  });
});
