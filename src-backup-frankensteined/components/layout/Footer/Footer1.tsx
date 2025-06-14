'use client';

import Link from 'next/link';

export const Footer1: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='footer-area'>
      {/* Newsletter Section */}
      <div className='newsletter-area'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-12'>
              <div className='newsletter-wrap'>
                <div className='newsletter-content'>
                  <h2 className='title'>Get the Latest Viral Content</h2>
                  <p>
                    Subscribe to ThreadJuice and never miss the hottest Reddit
                    threads, TIFU stories, and AITA dilemmas.
                  </p>
                </div>
                <div className='newsletter-form'>
                  <form action='#' method='POST'>
                    <div className='form-group'>
                      <input
                        type='email'
                        name='email'
                        placeholder='Enter your email address'
                        required
                      />
                      <button type='submit' className='btn newsletter-btn'>
                        <span className='btn-text'>Subscribe</span>
                        <i className='fas fa-paper-plane'></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className='footer-top'>
        <div className='container'>
          <div className='row'>
            {/* About ThreadJuice */}
            <div className='col-xl-3 col-lg-4 col-md-6'>
              <div className='footer-widget'>
                <div className='footer-logo logo'>
                  <Link href='/'>
                    <img src='/assets/img/logo/w_logo.png' alt='ThreadJuice' />
                  </Link>
                </div>
                <div className='footer-content'>
                  <p>
                    ThreadJuice transforms viral Reddit content into engaging,
                    shareable stories. Discover the internet's most captivating
                    discussions through our AI-powered personas.
                  </p>
                  <div className='footer-social'>
                    <h4 className='title'>Follow Us:</h4>
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
                      <li>
                        <a href='#' target='_blank' rel='noopener noreferrer'>
                          <i className='fab fa-youtube'></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className='col-xl-2 col-lg-3 col-md-6 col-sm-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Quick Links</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/trending'>Trending</Link>
                    </li>
                    <li>
                      <Link href='/categories'>Categories</Link>
                    </li>
                    <li>
                      <Link href='/quiz'>Take Quiz</Link>
                    </li>
                    <li>
                      <Link href='/personas'>Personas</Link>
                    </li>
                    <li>
                      <Link href='/about'>About Us</Link>
                    </li>
                    <li>
                      <Link href='/contact'>Contact</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className='col-xl-2 col-lg-3 col-md-6 col-sm-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Categories</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/category/tifu'>TIFU</Link>
                    </li>
                    <li>
                      <Link href='/category/aita'>AITA</Link>
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
                      <Link href='/category/work-stories'>Work Stories</Link>
                    </li>
                    <li>
                      <Link href='/category/wholesome'>Wholesome</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className='col-xl-2 col-lg-2 col-md-6 col-sm-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Support</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/help'>Help Center</Link>
                    </li>
                    <li>
                      <Link href='/privacy'>Privacy Policy</Link>
                    </li>
                    <li>
                      <Link href='/terms'>Terms of Service</Link>
                    </li>
                    <li>
                      <Link href='/cookies'>Cookie Policy</Link>
                    </li>
                    <li>
                      <Link href='/feedback'>Feedback</Link>
                    </li>
                    <li>
                      <Link href='/report'>Report Content</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className='col-xl-3 col-lg-4 col-md-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Contact Info</h4>
                <div className='footer-contact'>
                  <ul className='list-wrap'>
                    <li>
                      <div className='footer-contact-info'>
                        <div className='contact-icon'>
                          <i className='fas fa-envelope'></i>
                        </div>
                        <div className='contact-content'>
                          <p>
                            <a href='mailto:hello@threadjuice.com'>
                              hello@threadjuice.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className='footer-contact-info'>
                        <div className='contact-icon'>
                          <i className='fas fa-globe'></i>
                        </div>
                        <div className='contact-content'>
                          <p>
                            <a
                              href='https://threadjuice.com'
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              www.threadjuice.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className='footer-contact-info'>
                        <div className='contact-icon'>
                          <i className='fas fa-clock'></i>
                        </div>
                        <div className='contact-content'>
                          <p>Content updated every hour</p>
                        </div>
                      </div>
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
            <div className='col-lg-6'>
              <div className='copyright-text'>
                <p>© {currentYear} ThreadJuice. All rights reserved.</p>
              </div>
            </div>
            <div className='col-lg-6'>
              <div className='footer-bottom-menu'>
                <ul className='list-wrap'>
                  <li>
                    <Link href='/privacy'>Privacy</Link>
                  </li>
                  <li>
                    <Link href='/terms'>Terms</Link>
                  </li>
                  <li>
                    <Link href='/cookies'>Cookies</Link>
                  </li>
                  <li>
                    <Link href='/sitemap'>Sitemap</Link>
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

export default Footer1;
