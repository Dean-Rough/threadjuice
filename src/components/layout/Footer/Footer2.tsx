'use client';

import Link from 'next/link';

interface Footer2Props {
  footerClass?: string;
}

export const Footer2: React.FC<Footer2Props> = ({ footerClass }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer-area footer-style-two ${footerClass || ''}`}>
      {/* Main Footer */}
      <div className='footer-top'>
        <div className='container'>
          <div className='row'>
            {/* About Section */}
            <div className='col-xl-4 col-lg-4 col-md-6'>
              <div className='footer-widget'>
                <div className='footer-logo logo'>
                  <Link href='/'>
                    <img src='/assets/img/logo/w_logo.png' alt='ThreadJuice' />
                  </Link>
                </div>
                <div className='footer-content'>
                  <p>
                    ThreadJuice brings you the most viral Reddit content,
                    expertly curated and transformed into engaging stories by
                    our AI personas.
                  </p>
                  <div className='footer-info'>
                    <ul className='list-wrap'>
                      <li>
                        <i className='fas fa-envelope'></i>
                        <a href='mailto:hello@threadjuice.com'>
                          hello@threadjuice.com
                        </a>
                      </li>
                      <li>
                        <i className='fas fa-clock'></i>
                        <span>Updated Every Hour</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className='col-xl-2 col-lg-3 col-md-6 col-sm-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Popular</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/category/tifu'>TIFU Stories</Link>
                    </li>
                    <li>
                      <Link href='/category/aita'>AITA Dilemmas</Link>
                    </li>
                    <li>
                      <Link href='/category/public-freakouts'>
                        Public Freakouts
                      </Link>
                    </li>
                    <li>
                      <Link href='/category/relationship-drama'>
                        Relationship Drama
                      </Link>
                    </li>
                    <li>
                      <Link href='/trending'>Trending Now</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className='col-xl-2 col-lg-2 col-md-6 col-sm-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Resources</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/quiz'>Take Quiz</Link>
                    </li>
                    <li>
                      <Link href='/personas'>Meet Personas</Link>
                    </li>
                    <li>
                      <Link href='/api'>API Access</Link>
                    </li>
                    <li>
                      <Link href='/help'>Help Center</Link>
                    </li>
                    <li>
                      <Link href='/feedback'>Feedback</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Newsletter & Social */}
            <div className='col-xl-4 col-lg-3 col-md-12'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Stay Connected</h4>
                <div className='footer-newsletter'>
                  <p>Get viral content delivered to your inbox!</p>
                  <form action='#' method='POST' className='newsletter-form'>
                    <div className='form-group'>
                      <input
                        type='email'
                        name='email'
                        placeholder='Your email address'
                        required
                      />
                      <button type='submit' className='newsletter-btn'>
                        <i className='fas fa-paper-plane'></i>
                      </button>
                    </div>
                  </form>
                </div>
                <div className='footer-social'>
                  <h5 className='social-title'>Follow Us</h5>
                  <ul className='social-links list-wrap'>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className='footer-bottom'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-md-6'>
              <div className='copyright-text'>
                <p>© {currentYear} ThreadJuice. All rights reserved.</p>
              </div>
            </div>
            <div className='col-md-6'>
              <div className='footer-bottom-menu'>
                <ul className='list-wrap'>
                  <li>
                    <Link href='/privacy'>Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href='/terms'>Terms of Service</Link>
                  </li>
                  <li>
                    <Link href='/contact'>Contact</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer2;
