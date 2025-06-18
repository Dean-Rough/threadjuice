'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIState {
  mobileMenuOpen: boolean;
  sidebarOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const value = {
    mobileMenuOpen,
    sidebarOpen,
    setMobileMenuOpen,
    setSidebarOpen,
    toggleMobileMenu,
    toggleSidebar,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

export default UIContext;