'use client';

import Link from 'next/link';
import { Menu } from './Menu';
import { MobileMenu } from './MobileMenu';
import { Sidebar } from './Sidebar';
import { ThemeSwitch } from '../../elements/ThemeSwitch';

interface Header2Props {
  scroll: boolean;
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  langToggle: boolean;
  handleLangToggle: () => void;
  handleSidebarClose: () => void;
  handleSidebarOpen: () => void;
  isDarkMode?: boolean;
}

export const Header2: React.FC<Header2Props> = ({
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
      <header className='header-style-two'>
        {/* Header Top Bar */}
        <div className='header__top-bar'>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-lg-6'>
                <div className='header__top-left'>
                  <ul className='list-wrap'>
                    <li>
                      <i className='far fa-clock'></i>
                      <span>Updated Every Hour</span>
                    </li>
                    <li>
                      <i className='fas fa-fire'></i>
                      <span>Trending Now</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='header__top-right'>
                  <div className='header__top-social'>
                    <ul className='list-wrap'>
                      <li>
                        <a href='#'>
                          <i className='fab fa-facebook-f'></i>
                        </a>
                      </li>
                      <li>
                        <a href='#'>
                          <i className='fab fa-twitter'></i>
                        </a>
                      </li>
                      <li>
                        <a href='#'>
                          <i className='fab fa-instagram'></i>
                        </a>
                      </li>
                      <li>
                        <a href='#'>
                          <i className='fab fa-reddit'></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <ThemeSwitch />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={`header__menu-wrap ${scroll ? 'sticky-menu' : ''}`}>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-xl-2 col-lg-2'>
                <div className='header__menu-logo logo'>
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
                      width={140}
                      height={45}
                    />
                  </Link>
                </div>
              </div>

              <div className='col-xl-7 col-lg-7'>
                <div className='header__menu-center'>
                  <nav className='header__menu-box'>
                    <Menu />
                  </nav>
                </div>
              </div>

              <div className='col-xl-3 col-lg-3'>
                <div className='header__menu-action'>
                  <ul className='list-wrap'>
                    <li className='header-search'>
                      <button
                        type='button'
                        className='search-open-btn'
                        onClick={() => {
                          const searchBox = document.querySelector(
                            '.header-search-form'
                          );
                          searchBox?.classList.toggle('open');
                        }}
                      >
                        <i className='fas fa-search'></i>
                      </button>
                      <div className='header-search-form'>
                        <form action='/search' method='GET'>
                          <input
                            type='text'
                            name='q'
                            placeholder='Search ThreadJuice...'
                          />
                          <button type='submit'>
                            <i className='fas fa-search'></i>
                          </button>
                        </form>
                        <button
                          type='button'
                          className='search-close-btn'
                          onClick={() => {
                            const searchBox = document.querySelector(
                              '.header-search-form'
                            );
                            searchBox?.classList.remove('open');
                          }}
                        >
                          <i className='fas fa-times'></i>
                        </button>
                      </div>
                    </li>

                    <li className='offCanvas-menu'>
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
                    <i className='fab fa-facebook-f'></i>
                  </a>
                </li>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-twitter'></i>
                  </a>
                </li>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-instagram'></i>
                  </a>
                </li>
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-reddit'></i>
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

export default Header2;
