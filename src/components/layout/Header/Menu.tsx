'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

const ThemeSwitch = dynamic(() => import('../../elements/ThemeSwitch'), {
  ssr: false,
});

interface MenuProps {
  handleMobileMenuOpen?: () => void;
  handleSidebarOpen?: () => void;
  logoAlt?: boolean;
  white?: boolean;
}

export default function Menu({
  handleMobileMenuOpen,
  handleSidebarOpen,
  logoAlt,
  white,
}: MenuProps) {
  const pathname = usePathname();
  const [searchToggle, setSearchToggle] = useState(false);
  const searchHandle = () => setSearchToggle(!searchToggle);

  return (
    <>
      <div className='tgmenu__wrap'>
        <nav className='tgmenu__nav'>
          <div className='logo d-block d-lg-none'>
            <Link href='/' className='logo-dark'>
              <img
                src='/assets/img/brand/1x/Logotype-Dark.png'
                alt='ThreadJuice'
                style={{ height: '24px', width: 'auto' }}
              />
            </Link>
            <Link href='/' className='logo-light'>
              <img
                src='/assets/img/brand/1x/Logotype-Dark.png'
                alt='ThreadJuice'
                style={{ height: '24px', width: 'auto' }}
              />
            </Link>
          </div>
          {logoAlt && (
            <div className='d-flex align-items-center gap-4'>
              <div className='offcanvas-toggle' onClick={handleSidebarOpen}>
                <Link href='#'>
                  <i className='flaticon-menu-bar' />
                </Link>
              </div>
              <div className='logo'>
                <Link href='/'>
                  <img
                    src='/assets/img/brand/1x/Lockup.png'
                    alt='ThreadJuice'
                    style={{ height: '32px', width: 'auto' }}
                  />
                </Link>
              </div>
            </div>
          )}
          <div className='tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex'>
            <ul className='navigation'>
              <li className={pathname === '/' ? 'active' : ''}>
                <Link href='/'>Home</Link>
              </li>
              <li className='menu-item-has-children'>
                <Link href='#'>Categories</Link>
                <ul className='sub-menu'>
                  <li className={pathname === '/technology' ? 'active' : ''}>
                    <Link href='/technology'>🔬 Technology</Link>
                  </li>
                  <li className={pathname === '/entertainment' ? 'active' : ''}>
                    <Link href='/entertainment'>🎬 Entertainment</Link>
                  </li>
                  <li className={pathname === '/news' ? 'active' : ''}>
                    <Link href='/news'>📡 News</Link>
                  </li>
                  <li className={pathname === '/lifestyle' ? 'active' : ''}>
                    <Link href='/lifestyle'>🌟 Lifestyle</Link>
                  </li>
                  <li className={pathname === '/science' ? 'active' : ''}>
                    <Link href='/science'>🧪 Science</Link>
                  </li>
                </ul>
              </li>
              <li className={pathname === '/trending' ? 'active' : ''}>
                <Link href='/trending'>🔥 Trending</Link>
              </li>
              <li className={pathname === '/viral' ? 'active' : ''}>
                <Link href='/viral'>⚡ Viral</Link>
              </li>
              <li className={pathname === '/about' ? 'active' : ''}>
                <Link href='/about'>About</Link>
              </li>
            </ul>
          </div>
          <div className='tgmenu__action'>
            <ul className='list-wrap'>
              <li className='mode-switcher'>
                <ThemeSwitch />
              </li>
              <li className='user'>
                <UserButton afterSignOutUrl='/' />
              </li>
              <li className='header-search'>
                <Link href='#'>
                  <i
                    className={`${
                      searchToggle ? 'far fa-search fa-times' : 'far fa-search'
                    }`}
                    onClick={searchHandle}
                  />
                </Link>
                <div className='header__style-two'>
                  <div
                    className={`header__top-search ${
                      searchToggle ? 'd-block' : 'd-none'
                    }`}
                  >
                    <form action='#'>
                      <input type='text' placeholder='Search ThreadJuice...' />
                    </form>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        <div className='mobile-nav-toggler' onClick={handleMobileMenuOpen}>
          <i className='fas fa-bars' />
        </div>
      </div>
    </>
  );
}
