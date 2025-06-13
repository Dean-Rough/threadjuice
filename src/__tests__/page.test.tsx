import { render, screen } from '@testing-library/react';
import Home from '../app/page';

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='signed-in'>{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='signed-out'>{children}</div>
  ),
}));

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);

    const heading = screen.getByText(/Transform Reddit into/i);
    expect(heading).toBeInTheDocument();
  });

  it('shows sign up message when signed out', () => {
    render(<Home />);

    const signUpMessage = screen.getByText(
      /Sign up to start creating viral content/i
    );
    expect(signUpMessage).toBeInTheDocument();
  });

  it('shows welcome message when signed in', () => {
    render(<Home />);

    const welcomeMessage = screen.getByText(/Welcome to ThreadJuice/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});
