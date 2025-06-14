'use client';

import { useEffect, useState, ReactNode } from 'react';
import BackToTop from '../elements/BackToTop';
import Breadcrumb from './Breadcrumb';
import Footer1 from './Footer/Footer1';
import Header1 from './Header/Header1';
import Header3 from './Header/Header3';

interface ThreadJuiceLayoutProps {
  children: ReactNode;
  headerStyle?: number;
  footerStyle?: number;
  breadcrumbCategory?: string;
  breadcrumbPostTitle?: string;
  footerClass?: string;
  logoWhite?: boolean;
}

const ThreadJuiceLayout = ({
  children,
  headerStyle = 1,
  footerStyle = 1,
  breadcrumbCategory,
  breadcrumbPostTitle,
  footerClass,
  logoWhite,
}: ThreadJuiceLayoutProps) => {
  const handleMobileMenuOpen = () => {
    document.body.classList.add('mobile-menu-visible');
  };

  const handleMobileMenuClose = () => {
    document.body.classList.remove('mobile-menu-visible');
  };

  const handleSidebarOpen = () => {
    document.body.classList.add('offCanvas__menu-visible');
  };

  const handleSidebarClose = () => {
    document.body.classList.remove('offCanvas__menu-visible');
  };

  // Language Toggle
  const [langToggle, setLangToggle] = useState(false);
  const handleLangToggle = () => setLangToggle(!langToggle);

  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollCheck = window.scrollY > 100;
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scroll]);

  const renderHeader = () => {
    const headerProps = {
      handleMobileMenuOpen,
      handleMobileMenuClose,
      scroll,
      handleSidebarOpen,
      handleSidebarClose,
    };

    switch (headerStyle) {
      case 3:
        return <Header3 {...headerProps} />;
      case 1:
      default:
        return (
          <Header1
            {...headerProps}
            langToggle={langToggle}
            handleLangToggle={handleLangToggle}
          />
        );
    }
  };

  return (
    <>
      {renderHeader()}

      <main className='main'>
        {breadcrumbCategory && (
          <Breadcrumb
            breadcrumbCategory={breadcrumbCategory}
            breadcrumbPostTitle={breadcrumbPostTitle}
          />
        )}

        {children}
      </main>

      <Footer1 />
      <BackToTop />
    </>
  );
};

export default ThreadJuiceLayout;
