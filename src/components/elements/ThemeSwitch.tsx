'use client';

import { useEffect, useState } from 'react';

export const ThemeSwitch: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setIsDarkMode(initialTheme === 'dark');

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.body.classList.toggle('dark-mode', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);

    // Save to localStorage
    localStorage.setItem('theme', newTheme);

    // Apply to document
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.classList.toggle('dark-mode', newTheme === 'dark');
  };

  return (
    <div className='theme-switch'>
      <button
        type='button'
        className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        aria-label='Toggle dark mode'
      >
        <span className='theme-toggle-inner'>
          <span className='theme-toggle-icon sun'>
            <i className='fas fa-sun'></i>
          </span>
          <span className='theme-toggle-icon moon'>
            <i className='fas fa-moon'></i>
          </span>
        </span>
      </button>
    </div>
  );
};

export default ThemeSwitch;
