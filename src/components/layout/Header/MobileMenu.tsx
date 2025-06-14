'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MobileMenuProps {
  handleMobileMenuClose: () => void;
}

export default function MobileMenu({ handleMobileMenuClose }: MobileMenuProps) {
  const [isActive, setIsActive] = useState({
    status: false,
    key: '',
  });

  const handleToggle = (key: string) => {
    if (isActive.key === key) {
      setIsActive({
        status: false,
        key: '',
      });
    } else {
      setIsActive({
        status: true,
        key,
      });
    }
  };

  return (
    <>
      <div className='tgmobile__menu'>
        <nav className='tgmobile__menu-box'>
          <div className='close-btn' onClick={handleMobileMenuClose}>
            <i className='fas fa-times' />
          </div>
          <div className='nav-logo'>
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
          <div className='tgmobile__search'>
            <form action='#'>
              <input type='text' placeholder='Search ThreadJuice...' />
              <button>
                <i className='far fa-search' />
              </button>
            </form>
          </div>
          <div className='tgmobile__menu-outer'>
            <ul className='navigation'>
              <li>
                <Link href='/'>Home</Link>
              </li>
              <li
                className='menu-item-has-children'
                onClick={() => handleToggle('categories')}
              >
                <Link href='#'>Categories</Link>
                <ul
                  className='sub-menu'
                  style={
                    isActive.key === 'categories'
                      ? { display: 'block' }
                      : { display: 'none' }
                  }
                >
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
                <div
                  className={`dropdown-btn ${
                    isActive.key === 'categories' ? 'open' : ''
                  }`}
                >
                  <span className='plus-line' />
                </div>
              </li>
              <li>
                <Link href='/trending'>🔥 Trending</Link>
              </li>
              <li>
                <Link href='/viral'>⚡ Viral</Link>
              </li>
              <li>
                <Link href='/about'>About</Link>
              </li>
            </ul>
          </div>
          <div className='social-links'>
            <ul className='list-wrap'>
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
        </nav>
      </div>
      <div
        className='tgmobile__menu-backdrop'
        onClick={handleMobileMenuClose}
      />
    </>
  );
}
