'use client';

import Link from 'next/link';

interface SidebarProps {
  handleSidebarClose: () => void;
}

export default function Sidebar({ handleSidebarClose }: SidebarProps) {
  return (
    <>
      <div className='offCanvas__wrap'>
        <div className='offCanvas__body'>
          <div className='offCanvas__toggle' onClick={handleSidebarClose}>
            <i className='flaticon-addition' />
          </div>
          <div className='offCanvas__content'>
            <div className='offCanvas__logo logo'>
              <Link href='/' className='logo-dark'>
                <img
                  src='/assets/img/brand/1x/Logotype-Dark.png'
                  alt='ThreadJuice'
                  style={{ height: '28px', width: 'auto' }}
                />
              </Link>
              <Link href='/' className='logo-light'>
                <img
                  src='/assets/img/brand/1x/Logotype-Dark.png'
                  alt='ThreadJuice'
                  style={{ height: '28px', width: 'auto' }}
                />
              </Link>
            </div>
            <p>
              ThreadJuice transforms trending Reddit threads into viral content
              with AI-powered storytelling and interactive features.
            </p>
            <ul className='offCanvas__instagram list-wrap'>
              <li>
                <Link
                  href='/assets/img/blog/blog01.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog01.jpg' alt='Thread Preview' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog02.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog02.jpg' alt='Thread Preview' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog03.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog03.jpg' alt='Thread Preview' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog04.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog04.jpg' alt='Thread Preview' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog05.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog05.jpg' alt='Thread Preview' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog06.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog06.jpg' alt='Thread Preview' />
                </Link>
              </li>
            </ul>
          </div>
          <div className='offCanvas__contact'>
            <h4 className='title'>Get In Touch</h4>
            <ul className='offCanvas__contact-list list-wrap'>
              <li>
                <i className='fas fa-envelope-open' />
                <Link href='mailto:hello@threadjuice.com'>
                  hello@threadjuice.com
                </Link>
              </li>
              <li>
                <i className='fab fa-reddit' />
                <Link href='https://reddit.com/r/threadjuice'>
                  r/threadjuice
                </Link>
              </li>
              <li>
                <i className='fas fa-globe' /> San Francisco, CA
              </li>
            </ul>
            <ul className='offCanvas__social list-wrap'>
              <li>
                <Link href='#'>
                  <i className='fab fa-twitter' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-reddit' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-youtube' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-tiktok' />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='offCanvas__overlay' onClick={handleSidebarClose} />
    </>
  );
}
