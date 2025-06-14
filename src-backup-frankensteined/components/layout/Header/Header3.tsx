'use client';

import Link from 'next/link';
import { Menu } from './Menu';
import { MobileMenu } from './MobileMenu';
import { ThemeSwitch } from '../../elements/ThemeSwitch';

interface Header3Props {
  scroll: boolean;
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  langToggle: boolean;
  handleLangToggle: () => void;
  handleSidebarClose: () => void;
  handleSidebarOpen: () => void;
  isDarkMode?: boolean;
}

// Minimal header for post reading and clean layouts
export const Header3: React.FC<Header3Props> = ({
  scroll,
  handleMobileMenuOpen,
  handleMobileMenuClose,
  langToggle,
  handleLangToggle,
  handleSidebarClose,
  handleSidebarOpen,
  isDarkMode = false,
}) => {
  return (
    <>
      <header className='header-style-three'>
        <div className={`header__minimal ${scroll ? 'sticky-menu' : ''}`}>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-lg-2 col-md-6 col-6'>
                <div className='header__minimal-logo logo'>
                  <Link
                    href='/'
                    className={isDarkMode ? 'logo-light' : 'logo-dark'}
                  >
                    <img
                      src={
                        isDarkMode
                          ? '/assets/img/logo/w_logo.png'
                          : '/assets/img/logo/logo.png'
                      }
                      alt='ThreadJuice Logo'
                      width={120}
                      height={40}
                    />
                  </Link>
                </div>
              </div>

              <div className='col-lg-8 d-none d-lg-block'>
                <div className='header__minimal-menu'>
                  <nav className='header__menu-box'>
                    <Menu />
                  </nav>
                </div>
              </div>

              <div className='col-lg-2 col-md-6 col-6'>
                <div className='header__minimal-action'>
                  <ul className='list-wrap'>
                    <li>
                      <ThemeSwitch />
                    </li>
                    <li className='d-lg-none'>
                      <button
                        type='button'
                        className='menu-toggle'
                        onClick={handleMobileMenuOpen}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className='mobile-menu'>
          <nav className='menu-box'>
            <div className='close-btn' onClick={handleMobileMenuClose}>
              <i className='fas fa-times'></i>
            </div>
            <div className='nav-logo'>
              <Link href='/'>
                <img
                  src='/assets/img/logo/logo.png'
                  alt='ThreadJuice'
                  width={120}
                  height={40}
                />
              </Link>
            </div>
            <div className='menu-outer'>
              <MobileMenu />
            </div>
          </nav>
        </div>
        <div className='menu-backdrop' onClick={handleMobileMenuClose}></div>
      </header>
    </>
  );
};

export default Header3;
