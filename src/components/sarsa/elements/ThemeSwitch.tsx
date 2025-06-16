'use client';

import { useEffect, useState } from 'react';

export default function ThemeSwitch() {
  const [toggleTheme, setToggleTheme] = useState<string>('light-theme');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme from localStorage on client side
    const savedTheme = localStorage.getItem('toggleTheme') || 'light-theme';
    setToggleTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('toggleTheme', toggleTheme);
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(toggleTheme);
    }
  }, [toggleTheme, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleThemeToggle = () => {
    setToggleTheme(prev =>
      prev === 'light-theme' ? 'dark-theme' : 'light-theme'
    );
  };

  return (
    <>
      <nav className='switcher__tab' onClick={handleThemeToggle}>
        <span className='switcher__btn light-mode'>
          <i className='flaticon-sun' />
        </span>
        <span className='switcher__mode' />
        <span className='switcher__btn dark-mode'>
          <i className='flaticon-moon' />
        </span>
      </nav>
    </>
  );
}
