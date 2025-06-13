'use client';

import Link from 'next/link';

interface SidebarProps {
  handleSidebarClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ handleSidebarClose }) => {
  return (
    <div className='offCanvas__wrap'>
      <div className='offCanvas__body'>
        <div className='offCanvas__top'>
          <div className='offCanvas__logo logo'>
            <Link href='/'>
              <img src='/assets/img/logo/logo.png' alt='ThreadJuice' />
            </Link>
          </div>
          <div className='offCanvas__toggle' onClick={handleSidebarClose}>
            <i className='fas fa-times'></i>
          </div>
        </div>

        <div className='offCanvas__content'>
          <h2 className='title'>ThreadJuice</h2>
          <p className='desc'>
            Discover viral Reddit content transformed into engaging, shareable
            stories by our AI-powered personas. From TIFU tales to AITA
            dilemmas, we bring you the internet's most captivating discussions.
          </p>

          <div className='offCanvas__contact'>
            <h4 className='small-title'>Contact Info</h4>
            <ul className='offCanvas__contact-list list-wrap'>
              <li>
                <a href='mailto:hello@threadjuice.com'>hello@threadjuice.com</a>
              </li>
              <li>
                <a href='/about'>About ThreadJuice</a>
              </li>
              <li>
                <a href='/contact'>Get in Touch</a>
              </li>
            </ul>
          </div>

          <div className='offCanvas__newsletter'>
            <h4 className='small-title'>Newsletter</h4>
            <form action='#' className='offCanvas__newsletter-form'>
              <input
                type='email'
                placeholder='Get latest updates...'
                required
              />
              <button type='submit'>
                <i className='fas fa-paper-plane'></i>
              </button>
            </form>
            <p>Subscribe to stay updated with viral content!</p>
          </div>

          <div className='offCanvas__social'>
            <h4 className='small-title'>Follow Us</h4>
            <ul className='offCanvas__social-list list-wrap'>
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
                  <i className='fab fa-linkedin-in'></i>
                </a>
              </li>
              <li>
                <a href='#' target='_blank' rel='noopener noreferrer'>
                  <i className='fab fa-reddit'></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className='offCanvas__overly' onClick={handleSidebarClose}></div>
    </div>
  );
};

export default Sidebar;
