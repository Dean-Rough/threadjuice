'use client';

import Link from 'next/link';

export default function Footer1() {
  return (
    <footer className='footer-area footer-style-one'>
      <div className='footer-top'>
        <div className='container'>
          <div className='row'>
            <div className='col-xl-3 col-lg-4 col-md-6'>
              <div className='footer-widget'>
                <div className='fw-logo'>
                  <Link href='/'>
                    <img
                      src='/assets/img/brand/1x/Lockup.png'
                      alt='ThreadJuice'
                      style={{ height: 'auto', width: 'auto' }}
                    />
                  </Link>
                </div>
                <div className='footer-content'>
                  <p>
                    ThreadJuice transforms trending Reddit threads into viral
                    content with AI-powered storytelling, custom avatars, and
                    interactive features.
                  </p>
                  <div className='footer-social'>
                    <Link href='#'>
                      <i className='fab fa-twitter' />
                    </Link>
                    <Link href='#'>
                      <i className='fab fa-reddit' />
                    </Link>
                    <Link href='#'>
                      <i className='fab fa-youtube' />
                    </Link>
                    <Link href='#'>
                      <i className='fab fa-discord' />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-xl-2 col-lg-3 col-md-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Categories</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/technology'>🔬 Technology</Link>
                    </li>
                    <li>
                      <Link href='/entertainment'>🎬 Entertainment</Link>
                    </li>
                    <li>
                      <Link href='/news'>📡 News</Link>
                    </li>
                    <li>
                      <Link href='/lifestyle'>🌟 Lifestyle</Link>
                    </li>
                    <li>
                      <Link href='/science'>🧪 Science</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='col-xl-2 col-lg-3 col-md-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Features</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/trending'>🔥 Trending</Link>
                    </li>
                    <li>
                      <Link href='/viral'>⚡ Viral Posts</Link>
                    </li>
                    <li>
                      <Link href='/personas'>AI Personas</Link>
                    </li>
                    <li>
                      <Link href='/quiz'>Interactive Quizzes</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='col-xl-2 col-lg-3 col-md-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Company</h4>
                <div className='footer-link'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/about'>About Us</Link>
                    </li>
                    <li>
                      <Link href='/how-it-works'>How It Works</Link>
                    </li>
                    <li>
                      <Link href='/contact'>Contact</Link>
                    </li>
                    <li>
                      <Link href='/privacy'>Privacy Policy</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='col-xl-3 col-lg-4 col-md-6'>
              <div className='footer-widget'>
                <h4 className='fw-title'>Stay Updated</h4>
                <div className='footer-newsletter'>
                  <p>Get viral thread alerts</p>
                  <form action='#' className='footer-newsletter-form'>
                    <input type='email' placeholder='Enter your email' />
                    <button type='submit'>
                      <i className='fas fa-paper-plane' />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='footer-bottom'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-md-6'>
              <div className='copyright-text'>
                <p>&copy; 2025 ThreadJuice. All rights reserved.</p>
              </div>
            </div>
            <div className='col-md-6'>
              <div className='footer-bottom-menu'>
                <ul className='list-wrap'>
                  <li>
                    <Link href='/terms'>Terms</Link>
                  </li>
                  <li>
                    <Link href='/privacy'>Privacy</Link>
                  </li>
                  <li>
                    <Link href='/cookies'>Cookies</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
