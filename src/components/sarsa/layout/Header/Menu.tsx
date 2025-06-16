'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeSwitch from '../../elements/ThemeSwitch';

interface MenuProps {
  handleMobileMenuOpen: () => void;
  handleSidebarOpen: () => void;
  offCanvasNav?: boolean;
  logoAlt?: boolean;
  white?: boolean;
}

export default function Menu({
  handleMobileMenuOpen,
  handleSidebarOpen,
  offCanvasNav,
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
              />
            </Link>
            <Link href='/' className='logo-light'>
              <img
                src='/assets/img/brand/1x/Logotype-White.png'
                alt='ThreadJuice'
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
                    src={`/assets/img/brand/1x/${white ? 'Logotype-White' : 'Logotype-Dark'}.png`}
                    alt='ThreadJuice'
                  />
                </Link>
              </div>
            </div>
          )}
          {offCanvasNav && (
            <div className='offcanvas-toggle' onClick={handleSidebarOpen}>
              <a href='#'>
                <i className='flaticon-menu-bar' />
              </a>
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
                  <li
                    className={
                      pathname === '/category/technology' ? 'active' : ''
                    }
                  >
                    <Link href='/category/technology'>Technology</Link>
                  </li>
                  <li
                    className={
                      pathname === '/category/lifestyle' ? 'active' : ''
                    }
                  >
                    <Link href='/category/lifestyle'>Lifestyle</Link>
                  </li>
                  <li
                    className={pathname === '/category/travel' ? 'active' : ''}
                  >
                    <Link href='/category/travel'>Travel</Link>
                  </li>
                  <li
                    className={
                      pathname === '/category/entertainment' ? 'active' : ''
                    }
                  >
                    <Link href='/category/entertainment'>Entertainment</Link>
                  </li>
                </ul>
              </li>
              <li className='menu-item-has-children'>
                <Link href='#'>Personas</Link>
                <ul className='sub-menu'>
                  <li
                    className={
                      pathname === '/personas/snarky-sage' ? 'active' : ''
                    }
                  >
                    <Link href='/personas/snarky-sage'>The Snarky Sage</Link>
                  </li>
                  <li
                    className={
                      pathname === '/personas/down-to-earth-buddy'
                        ? 'active'
                        : ''
                    }
                  >
                    <Link href='/personas/down-to-earth-buddy'>
                      Down-to-Earth Buddy
                    </Link>
                  </li>
                  <li
                    className={
                      pathname === '/personas/dry-cynic' ? 'active' : ''
                    }
                  >
                    <Link href='/personas/dry-cynic'>The Dry Cynic</Link>
                  </li>
                </ul>
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
                <Link href='/dashboard'>
                  <i className='far fa-user' />
                </Link>
              </li>
              <li className='header-search'>
                <Link href='#'>
                  <i
                    className={`${searchToggle ? 'far fa-search fa-times' : 'far fa-search'} `}
                    onClick={searchHandle}
                  />
                </Link>
                <div className='header__style-two'>
                  <div
                    className={`header__top-search ${searchToggle ? 'd-block' : 'd-none'}`}
                  >
                    <form action='#'>
                      <input type='text' placeholder='Search stories...' />
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
