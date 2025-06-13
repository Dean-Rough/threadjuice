'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const MobileMenu: React.FC = () => {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path) || false;
  };

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <ul className='navigation'>
      <li className={isActive('/') ? 'current' : ''}>
        <Link href='/'>Home</Link>
      </li>

      <li className={`dropdown ${isActive('/category') ? 'current' : ''}`}>
        <a
          href='#'
          onClick={e => {
            e.preventDefault();
            toggleDropdown('categories');
          }}
        >
          Categories
          <span
            className={`dropdown-btn ${activeDropdown === 'categories' ? 'open' : ''}`}
          >
            <i className='fas fa-angle-down'></i>
          </span>
        </a>
        <ul className={activeDropdown === 'categories' ? 'show' : ''}>
          <li>
            <Link href='/category/tifu'>TIFU</Link>
          </li>
          <li>
            <Link href='/category/aita'>AITA</Link>
          </li>
          <li>
            <Link href='/category/public-freakouts'>Public Freakouts</Link>
          </li>
          <li>
            <Link href='/category/relationship-drama'>Relationship Drama</Link>
          </li>
          <li>
            <Link href='/category/work-stories'>Work Stories</Link>
          </li>
          <li>
            <Link href='/category/internet-culture'>Internet Culture</Link>
          </li>
          <li>
            <Link href='/category/tech-fails'>Tech Fails</Link>
          </li>
          <li>
            <Link href='/category/life-hacks'>Life Hacks</Link>
          </li>
          <li>
            <Link href='/category/conspiracy-theories'>
              Conspiracy Theories
            </Link>
          </li>
          <li>
            <Link href='/category/wholesome'>Wholesome</Link>
          </li>
        </ul>
      </li>

      <li className={isActive('/trending') ? 'current' : ''}>
        <Link href='/trending'>Trending</Link>
      </li>

      <li className={`dropdown ${isActive('/features') ? 'current' : ''}`}>
        <a
          href='#'
          onClick={e => {
            e.preventDefault();
            toggleDropdown('features');
          }}
        >
          Features
          <span
            className={`dropdown-btn ${activeDropdown === 'features' ? 'open' : ''}`}
          >
            <i className='fas fa-angle-down'></i>
          </span>
        </a>
        <ul className={activeDropdown === 'features' ? 'show' : ''}>
          <li>
            <Link href='/quiz'>Take a Quiz</Link>
          </li>
          <li>
            <Link href='/personas'>Meet the Personas</Link>
          </li>
          <li>
            <Link href='/reddit-integration'>Reddit Integration</Link>
          </li>
        </ul>
      </li>

      <li
        className={`dropdown ${isActive('/about') || isActive('/contact') ? 'current' : ''}`}
      >
        <a
          href='#'
          onClick={e => {
            e.preventDefault();
            toggleDropdown('about');
          }}
        >
          About
          <span
            className={`dropdown-btn ${activeDropdown === 'about' ? 'open' : ''}`}
          >
            <i className='fas fa-angle-down'></i>
          </span>
        </a>
        <ul className={activeDropdown === 'about' ? 'show' : ''}>
          <li>
            <Link href='/about'>About ThreadJuice</Link>
          </li>
          <li>
            <Link href='/contact'>Contact Us</Link>
          </li>
          <li>
            <Link href='/privacy'>Privacy Policy</Link>
          </li>
          <li>
            <Link href='/terms'>Terms of Service</Link>
          </li>
        </ul>
      </li>

      <li>
        <Link href='/dashboard'>Dashboard</Link>
      </li>
    </ul>
  );
};

export default MobileMenu;
