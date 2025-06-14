'use client';

import Menu from './Menu';
import MobileMenu from './MobileMenu';
import Sidebar from './Sidebar';

interface Header3Props {
  scroll?: boolean;
  handleMobileMenuOpen: () => void;
  handleMobileMenuClose: () => void;
  handleSidebarClose: () => void;
  handleSidebarOpen: () => void;
}

export default function Header3({
  scroll,
  handleMobileMenuOpen,
  handleMobileMenuClose,
  handleSidebarClose,
  handleSidebarOpen,
}: Header3Props) {
  return (
    <>
      <header className='header__style-two header__style-three'>
        <div
          id='header-fixed-height'
          className={`${scroll ? 'active-height' : ''}`}
        />
        <div
          id='sticky-header'
          className={`tg-header__area ${scroll ? 'sticky-menu' : ''}`}
        >
          <div className='container'>
            <div className='row'>
              <div className='col-12'>
                <Menu
                  handleMobileMenuOpen={handleMobileMenuOpen}
                  handleSidebarOpen={handleSidebarOpen}
                  logoAlt={true}
                  white={false}
                />
                <MobileMenu handleMobileMenuClose={handleMobileMenuClose} />
              </div>
            </div>
          </div>
        </div>
        <Sidebar handleSidebarClose={handleSidebarClose} />
      </header>
    </>
  );
}
