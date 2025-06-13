'use client';

import Link from 'next/link';
import Menu from './Menu';
import MobileMenu from './MobileMenu';
import Sidebar from './Sidebar';

interface Header1Props {
  _handleMobileMenuOpen?: () => void; // Prefixed since unused
  _handleMobileMenuClose?: () => void; // Prefixed since unused
  scroll?: boolean;
  _langToggle?: boolean; // Prefixed since unused
  _handleLangToggle?: () => void; // Prefixed since unused
  _handleSidebarOpen?: () => void; // Prefixed since unused
  handleSidebarClose?: () => void;
  _isDarkMode?: boolean; // Prefixed since unused
}

const Header1: React.FC<Header1Props> = ({
  _handleMobileMenuOpen,
  _handleMobileMenuClose,
  scroll,
  _langToggle,
  _handleLangToggle,
  _handleSidebarOpen,
  handleSidebarClose,
  _isDarkMode,
}) => {
  return (
    <>
      <header
        className={`header-area header-style-1 header-height-1 ${
          scroll ? 'sticky-bar' : ''
        }`}
      >
        <div className='container-fluid'>
          <div className='header-align'>
            <div className='header-left'>
              <div className='logo'>
                <Link href='/'>
                  <img
                    className='d-inline-block'
                    src='/assets/imgs/template/logo.svg'
                    alt='ThreadJuice'
                  />
                </Link>
              </div>
            </div>
            <div className='header-nav'>
              <nav className='nav-main-menu d-none d-xl-block'>
                <Menu />
              </nav>
              <div className='burger-icon burger-icon-white'>
                <span className='burger-icon-top' />
                <span className='burger-icon-mid' />
                <span className='burger-icon-bottom' />
              </div>
            </div>
            <div className='header-right'>
              <div className='header-action-2'>
                <div className='header-action-icon-2'>
                  <Link href='/search'>
                    <img
                      className='svgInject'
                      alt='search'
                      src='/assets/imgs/template/icons/icon-search.svg'
                    />
                  </Link>
                </div>
                <div className='header-action-icon-2'>
                  <Link href='/wishlist'>
                    <img
                      className='svgInject'
                      alt='wishlist'
                      src='/assets/imgs/template/icons/icon-heart.svg'
                    />
                    <span className='pro-count blue'>2</span>
                  </Link>
                </div>
                <div className='header-action-icon-2'>
                  <Link className='mini-cart-icon' href='/cart'>
                    <img
                      alt='cart'
                      src='/assets/imgs/template/icons/icon-cart.svg'
                    />
                    <span className='pro-count blue'>2</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu />
      {handleSidebarClose && <Sidebar handleSidebarClose={handleSidebarClose} />}
    </>
  );
};

export default Header1;
