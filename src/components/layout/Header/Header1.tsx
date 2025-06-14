'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Menu from './Menu';
import MobileMenu from './MobileMenu';
import Sidebar from './Sidebar';

interface Header1Props {
  scroll: boolean;
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  langToggle: boolean;
  handleLangToggle: () => void;
  handleSidebarClose: () => void;
  handleSidebarOpen: () => void;
}

const Header1 = ({
  scroll,
  handleMobileMenuOpen,
  handleMobileMenuClose,
  langToggle,
  handleLangToggle,
  handleSidebarClose,
  handleSidebarOpen,
}: Header1Props) => {
  return (
    <>
      <header>
        <div className='header__top'>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-lg-4 col-md-6 col-sm-6 order-lg-0 order-2'>
                <div className='header__top-search'>
                  <form action='#'>
                    <input type='text' placeholder='Search viral threads...' />
                  </form>
                </div>
              </div>
              <div className='col-lg-4 col-md-3 order-lg-2 d-none d-md-block order-0'>
                <div className='header__top-logo logo text-lg-center'>
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
              </div>
              <div className='col-lg-4 col-md-3 col-sm-6 d-none d-sm-block order-3'>
                <div className='header__top-right'>
                  <ul className='list-wrap'>
                    <SignedOut>
                      <li className='news-btn'>
                        <SignInButton>
                          <button className='btn'>
                            <span className='btn-text'>Sign In</span>
                          </button>
                        </SignInButton>
                      </li>
                    </SignedOut>
                    <SignedIn>
                      <li className='user-profile'>
                        <UserButton
                          afterSignOutUrl='/'
                          appearance={{
                            elements: {
                              avatarBox: 'w-8 h-8',
                            },
                          }}
                        />
                      </li>
                    </SignedIn>
                    <li className='sidebar__menu'>
                      <div
                        className='sidebar__menu-btn'
                        onClick={handleSidebarOpen}
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={scroll ? 'tgmenu__wrap sticky-menu' : 'tgmenu__wrap'}>
          <div className='container'>
            <div className='row'>
              <div className='col-12'>
                <div className='tgmenu__navbar'>
                  <div className='tgmenu__navbar-logo logo d-block d-md-none'>
                    <Link href='/' className='logo-dark'>
                      <img src='/assets/img/logo/logo.png' alt='ThreadJuice' />
                    </Link>
                    <Link href='/' className='logo-light'>
                      <img
                        src='/assets/img/logo/w_logo.png'
                        alt='ThreadJuice'
                      />
                    </Link>
                  </div>
                  <div className='tgmenu__main-menu d-none d-lg-block'>
                    <nav className='tgmenu__nav'>
                      <Menu />
                    </nav>
                  </div>
                  <div className='tgmenu__action d-none d-md-block'>
                    <ul className='list-wrap'>
                      <li className='trending-post-btn'>
                        <Link href='/trending'>
                          <i className='flaticon-fire' />
                          Trending
                        </Link>
                      </li>
                      <li className='mode-switcher'>
                        <button
                          className='mode-switcher__btn'
                          id='mode-switcher__btn'
                        >
                          <i className='flaticon-sun-1' />
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div
                    className='mobile-nav-toggler d-lg-none'
                    onClick={handleMobileMenuOpen}
                  >
                    <i className='fas fa-bars' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu handleMobileMenuClose={handleMobileMenuClose} />
      <Sidebar handleSidebarClose={handleSidebarClose} />
    </>
  );
};

export default Header1;
