'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MobileMenuProps {
  handleMobileMenuClose: () => void;
  openClass?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  handleMobileMenuClose,
  openClass,
}) => {
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
              />
            </Link>
            <Link href='/' className='logo-light'>
              <img
                src='/assets/img/brand/1x/Logotype-White.png'
                alt='ThreadJuice'
              />
            </Link>
          </div>
          <div className='tgmobile__search'>
            <form action='#'>
              <input type='text' placeholder='Search stories...' />
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
                    <Link href='/category/technology'>Technology</Link>
                  </li>
                  <li>
                    <Link href='/category/lifestyle'>Lifestyle</Link>
                  </li>
                  <li>
                    <Link href='/category/travel'>Travel</Link>
                  </li>
                  <li>
                    <Link href='/category/entertainment'>Entertainment</Link>
                  </li>
                </ul>
                <div
                  className={`dropdown-btn ${isActive.key === 'categories' ? 'open' : ''}`}
                >
                  <span className='plus-line' />
                </div>
              </li>
              <li
                className='menu-item-has-children'
                onClick={() => handleToggle('personas')}
              >
                <Link href='#'>Personas</Link>
                <ul
                  className='sub-menu'
                  style={
                    isActive.key === 'personas'
                      ? { display: 'block' }
                      : { display: 'none' }
                  }
                >
                  <li>
                    <Link href='/personas/snarky-sage'>The Snarky Sage</Link>
                  </li>
                  <li>
                    <Link href='/personas/down-to-earth-buddy'>
                      Down-to-Earth Buddy
                    </Link>
                  </li>
                  <li>
                    <Link href='/personas/dry-cynic'>The Dry Cynic</Link>
                  </li>
                </ul>
                <div
                  className={`dropdown-btn ${isActive.key === 'personas' ? 'open' : ''}`}
                >
                  <span className='plus-line' />
                </div>
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
                  <i className='fab fa-facebook-f' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-twitter' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-instagram' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-linkedin-in' />
                </Link>
              </li>
              <li>
                <Link href='#'>
                  <i className='fab fa-youtube' />
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
};

export default MobileMenu;
