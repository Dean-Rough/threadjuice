'use client';

import Link from 'next/link';

interface Footer3Props {
  footerClass?: string;
  logoWhite?: boolean;
}

export const Footer3: React.FC<Footer3Props> = ({ footerClass, logoWhite }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer-area footer-style-three ${footerClass || ''}`}>
      {/* Minimal Footer */}
      <div className='footer-minimal'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-4'>
              <div className='footer-logo logo'>
                <Link href='/'>
                  <img
                    src={
                      logoWhite
                        ? '/assets/img/logo/w_logo.png'
                        : '/assets/img/logo/logo.png'
                    }
                    alt='ThreadJuice'
                  />
                </Link>
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='footer-menu text-center'>
                <ul className='list-wrap'>
                  <li>
                    <Link href='/about'>About</Link>
                  </li>
                  <li>
                    <Link href='/contact'>Contact</Link>
                  </li>
                  <li>
                    <Link href='/privacy'>Privacy</Link>
                  </li>
                  <li>
                    <Link href='/terms'>Terms</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='footer-social text-end'>
                <ul className='list-wrap'>
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
            </div>
          </div>

          <div className='footer-minimal-bottom'>
            <div className='row'>
              <div className='col-lg-12'>
                <div className='copyright-text text-center'>
                  <p>
                    © {currentYear} ThreadJuice. All rights reserved. |
                    Transforming viral Reddit content into engaging stories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer3;
