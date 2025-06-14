'use client';

import Link from 'next/link';
import { Menu } from './Menu';
import { MobileMenu } from './MobileMenu';
import { ThemeSwitch } from '../../elements/ThemeSwitch';

interface Header5Props {
  scroll: boolean;
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  langToggle: boolean;
  handleLangToggle: () => void;
  handleSidebarClose: () => void;
  handleSidebarOpen: () => void;
  isDarkMode?: boolean;
}

// Social media style header for viral content
export const Header5: React.FC<Header5Props> = ({
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
      <header className='header-style-five'>
        {/* Social Header */}
        <div className={`header__social-wrap ${scroll ? 'sticky-menu' : ''}`}>
          <div className='container-fluid'>
            <div className='row align-items-center'>
              <div className='col-xl-3 col-lg-3'>
                <div className='header__social-logo logo'>
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
                      width={110}
                      height={38}
                    />
                  </Link>
                </div>
              </div>

              <div className='col-xl-6 col-lg-6 d-none d-lg-block'>
                <div className='header__social-menu'>
                  <nav className='header__menu-box'>
                    <Menu />
                  </nav>
                </div>
              </div>

              <div className='col-xl-3 col-lg-3'>
                <div className='header__social-action'>
                  <ul className='list-wrap'>
                    <li className='social-share'>
                      <button
                        type='button'
                        className='social-toggle'
                        onClick={() => {
                          const socialBox =
                            document.querySelector('.social-share-box');
                          socialBox?.classList.toggle('open');
                        }}
                      >
                        <i className='fas fa-share-alt'></i>
                        Share
                      </button>
                      <div className='social-share-box'>
                        <ul className='list-wrap'>
                          <li>
                            <a
                              href='#'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <i className='fab fa-facebook-f'></i>
                            </a>
                          </li>
                          <li>
                            <a
                              href='#'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <i className='fab fa-twitter'></i>
                            </a>
                          </li>
                          <li>
                            <a
                              href='#'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <i className='fab fa-instagram'></i>
                            </a>
                          </li>
                          <li>
                            <a
                              href='#'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <i className='fab fa-reddit'></i>
                            </a>
                          </li>
                          <li>
                            <a
                              href='#'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <i className='fab fa-tiktok'></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </li>

                    <li>
                      <ThemeSwitch />
                    </li>

                    <li className='search-btn'>
                      <button
                        type='button'
                        className='search-open-btn'
                        onClick={() => {
                          const searchForm = document.querySelector(
                            '.header-search-popup'
                          );
                          searchForm?.classList.add('open');
                        }}
                      >
                        <i className='fas fa-search'></i>
                      </button>
                    </li>

                    <li className='menu-btn d-lg-none'>
                      <button
                        type='button'
                        className='menu-tigger'
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

        {/* Search Popup */}
        <div className='header-search-popup'>
          <div className='search-popup-wrap'>
            <button
              type='button'
              className='search-close-btn'
              onClick={() => {
                const searchForm = document.querySelector(
                  '.header-search-popup'
                );
                searchForm?.classList.remove('open');
              }}
            >
              <i className='fas fa-times'></i>
            </button>
            <form action='/search' method='GET' className='search-popup-form'>
              <input
                type='text'
                name='q'
                placeholder='What viral content are you looking for?'
                autoFocus
              />
              <button type='submit'>
                <i className='fas fa-search'></i>
              </button>
            </form>
            <div className='search-popup-suggestions'>
              <h4>Popular Searches:</h4>
              <ul>
                <li>
                  <Link href='/search?q=TIFU'>TIFU Stories</Link>
                </li>
                <li>
                  <Link href='/search?q=AITA'>AITA Dilemmas</Link>
                </li>
                <li>
                  <Link href='/search?q=public+freakout'>Public Freakouts</Link>
                </li>
                <li>
                  <Link href='/search?q=relationship+drama'>
                    Relationship Drama
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='search-popup-overlay'></div>
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
                <li>
                  <a href='#' target='_blank' rel='noopener noreferrer'>
                    <i className='fab fa-tiktok'></i>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className='menu-backdrop' onClick={handleMobileMenuClose}></div>
      </header>
    </>
  );
};

export default Header5;
