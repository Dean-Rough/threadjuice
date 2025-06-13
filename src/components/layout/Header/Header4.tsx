'use client';

import Link from 'next/link';
import { Menu } from './Menu';
import { MobileMenu } from './MobileMenu';
import { Sidebar } from './Sidebar';
import { ThemeSwitch } from '../../elements/ThemeSwitch';

interface Header4Props {
  scroll: boolean;
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  langToggle: boolean;
  handleLangToggle: () => void;
  handleSidebarClose: () => void;
  handleSidebarOpen: () => void;
  isDarkMode?: boolean;
}

// Tech-focused header for Reddit content and technical discussions
export const Header4: React.FC<Header4Props> = ({
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
      <header className='header-style-four'>
        {/* Breaking News Ticker */}
        <div className='header__breaking-news'>
          <div className='container-fluid'>
            <div className='breaking-news-wrap'>
              <div className='breaking-news-label'>
                <span>🔥 Trending</span>
              </div>
              <div className='breaking-news-content'>
                <div className='breaking-news-inner'>
                  <span>
                    Latest viral Reddit threads • TIFU stories • AITA dilemmas •
                    Public freakouts •{' '}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={`header__tech-wrap ${scroll ? 'sticky-menu' : ''}`}>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-xl-2 col-lg-3'>
                <div className='header__tech-logo logo'>
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
                      width={130}
                      height={42}
                    />
                  </Link>
                </div>
              </div>

              <div className='col-xl-6 col-lg-6 d-none d-lg-block'>
                <div className='header__tech-menu'>
                  <nav className='header__menu-box'>
                    <Menu />
                  </nav>
                </div>
              </div>

              <div className='col-xl-4 col-lg-3'>
                <div className='header__tech-action'>
                  <ul className='list-wrap'>
                    <li className='header-search'>
                      <div className='header-search-wrap'>
                        <form action='/search' method='GET'>
                          <input
                            type='text'
                            name='q'
                            placeholder='Search Reddit threads, TIFU, AITA...'
                          />
                          <button type='submit'>
                            <i className='fas fa-search'></i>
                          </button>
                        </form>
                      </div>
                    </li>

                    <li>
                      <ThemeSwitch />
                    </li>

                    <li className='header-btn'>
                      <Link href='/dashboard' className='btn'>
                        Dashboard
                      </Link>
                    </li>

                    <li className='offCanvas-menu d-lg-none'>
                      <button
                        type='button'
                        className='menu-tigger'
                        onClick={handleSidebarOpen}
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
            <div className='social-links'>
              <ul className='clearfix list-wrap'>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-reddit'></i>
                  </a>
                </li>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-twitter'></i>
                  </a>
                </li>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-discord'></i>
                  </a>
                </li>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-github'></i>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className='menu-backdrop' onClick={handleMobileMenuClose}></div>
      </header>

      {/* Sidebar */}
      <Sidebar handleSidebarClose={handleSidebarClose} />
    </>
  );
};

export default Header4;
