import { render, screen, fireEvent } from '@testing-library/react';
import { UIProvider, useUI } from '@/contexts/UIContext';

// Test component that uses the UI context
function TestComponent() {
  const {
    mobileMenuOpen,
    sidebarOpen,
    toggleMobileMenu,
    toggleSidebar,
    setMobileMenuOpen,
    setSidebarOpen,
  } = useUI();

  return (
    <div>
      <div data-testid='mobile-menu-state'>
        {mobileMenuOpen ? 'Menu Open' : 'Menu Closed'}
      </div>
      <div data-testid='sidebar-state'>
        {sidebarOpen ? 'Sidebar Open' : 'Sidebar Closed'}
      </div>
      <button data-testid='toggle-mobile' onClick={toggleMobileMenu}>
        Toggle Mobile Menu
      </button>
      <button data-testid='toggle-sidebar' onClick={toggleSidebar}>
        Toggle Sidebar
      </button>
      <button
        data-testid='set-mobile-true'
        onClick={() => setMobileMenuOpen(true)}
      >
        Open Mobile Menu
      </button>
      <button
        data-testid='set-sidebar-false'
        onClick={() => setSidebarOpen(false)}
      >
        Close Sidebar
      </button>
    </div>
  );
}

describe('UIContext', () => {
  it('should provide default state', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('mobile-menu-state')).toHaveTextContent(
      'Menu Closed'
    );
    expect(screen.getByTestId('sidebar-state')).toHaveTextContent(
      'Sidebar Closed'
    );
  });

  it('should toggle mobile menu state', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const toggleButton = screen.getByTestId('toggle-mobile');
    const stateDisplay = screen.getByTestId('mobile-menu-state');

    expect(stateDisplay).toHaveTextContent('Menu Closed');

    fireEvent.click(toggleButton);
    expect(stateDisplay).toHaveTextContent('Menu Open');

    fireEvent.click(toggleButton);
    expect(stateDisplay).toHaveTextContent('Menu Closed');
  });

  it('should toggle sidebar state', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const toggleButton = screen.getByTestId('toggle-sidebar');
    const stateDisplay = screen.getByTestId('sidebar-state');

    expect(stateDisplay).toHaveTextContent('Sidebar Closed');

    fireEvent.click(toggleButton);
    expect(stateDisplay).toHaveTextContent('Sidebar Open');

    fireEvent.click(toggleButton);
    expect(stateDisplay).toHaveTextContent('Sidebar Closed');
  });

  it('should set mobile menu state directly', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const setButton = screen.getByTestId('set-mobile-true');
    const stateDisplay = screen.getByTestId('mobile-menu-state');

    expect(stateDisplay).toHaveTextContent('Menu Closed');

    fireEvent.click(setButton);
    expect(stateDisplay).toHaveTextContent('Menu Open');
  });

  it('should set sidebar state directly', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const toggleButton = screen.getByTestId('toggle-sidebar');
    const setButton = screen.getByTestId('set-sidebar-false');
    const stateDisplay = screen.getByTestId('sidebar-state');

    // First open the sidebar
    fireEvent.click(toggleButton);
    expect(stateDisplay).toHaveTextContent('Sidebar Open');

    // Then close it directly
    fireEvent.click(setButton);
    expect(stateDisplay).toHaveTextContent('Sidebar Closed');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUI must be used within a UIProvider');

    consoleSpy.mockRestore();
  });
});
