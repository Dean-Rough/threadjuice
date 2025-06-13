'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Menu: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path) || false;
  };

  return (
    <div className='menu-list'>
      <ul className='navigation clearfix'>
        <li className={isActive('/') ? 'current' : ''}>
          <Link href='/'>Home</Link>
        </li>

        <li className={`dropdown ${isActive('/category') ? 'current' : ''}`}>
          <a href='#'>Categories</a>
          <ul>
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
              <Link href='/category/relationship-drama'>
                Relationship Drama
              </Link>
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
          <a href='#'>Features</a>
          <ul>
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
          <a href='#'>About</a>
          <ul>
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
      </ul>
    </div>
  );
};

export default Menu;
