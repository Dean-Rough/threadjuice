'use client';

import { ReactNode, useEffect, useState } from 'react';
import BackToTop from '../elements/BackToTop';
import Breadcrumb from './Breadcrumb';
import Footer1 from './Footer/Footer1';
import Footer2 from './Footer/Footer2';
import Footer3 from './Footer/Footer3';
import Header1 from './Header/Header1';
import Header2 from './Header/Header2';
import Header3 from './Header/Header3';
import Header4 from './Header/Header4';
import Header5 from './Header/Header5';
import { Post } from '@/types/database';

type ContentType =
  | 'trending'
  | 'featured'
  | 'reading'
  | 'reddit'
  | 'viral'
  | 'default';

interface LayoutProps {
  children: ReactNode;
  headerStyle?: number;
  footerStyle?: number;
  breadcrumbCategory?: string;
  breadcrumbPostTitle?: string;
  footerClass?: string;
  _headTitle?: string;
  logoWhite?: boolean;
  isDarkMode?: boolean;
  post?: Partial<Post>;
  contentType?: ContentType;
}

const Layout = ({
  headerStyle,
  footerStyle,
  children,
  breadcrumbCategory,
  breadcrumbPostTitle,
  footerClass,
  _headTitle,
  logoWhite,
  isDarkMode = false,
  post,
  contentType,
}: LayoutProps) => {
  const [scroll, setScroll] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [langToggle, setLangToggle] = useState(false);

  const handleMobileMenuOpen = () => {
    setMobileMenuVisible(true);
    document.body.classList.add('mobile-menu-visible');
  };

  const handleMobileMenuClose = () => {
    setMobileMenuVisible(false);
    document.body.classList.remove('mobile-menu-visible');
  };

  const handleSidebarOpen = () => {
    setSidebarVisible(true);
    document.body.classList.add('offCanvas__menu-visible');
  };

  const handleSidebarClose = () => {
    setSidebarVisible(false);
    document.body.classList.remove('offCanvas__menu-visible');
  };

  const handleLangToggle = () => setLangToggle(!langToggle);

  // Intelligent layout selection based on content type and post data
  const getLayoutConfiguration = () => {
    // If explicit styles are provided, use them
    if (headerStyle && footerStyle) {
      return { headerStyle, footerStyle };
    }

    // If post data is available, use layout_style from post
    if (post?.layout_style) {
      return {
        headerStyle: post.layout_style,
        footerStyle: post.layout_style <= 3 ? post.layout_style : 1,
      };
    }

    // Content type based layout selection
    switch (contentType) {
      case 'trending':
        return { headerStyle: 1, footerStyle: 1 }; // Main news layout
      case 'featured':
        return { headerStyle: 2, footerStyle: 1 }; // Magazine style
      case 'reading':
        return { headerStyle: 3, footerStyle: 2 }; // Minimal layout
      case 'reddit':
        return { headerStyle: 4, footerStyle: 1 }; // Tech-focused
      case 'viral':
        return { headerStyle: 5, footerStyle: 1 }; // Social media style
      default:
        return { headerStyle: 1, footerStyle: 1 }; // Default layout
    }
  };

  const { headerStyle: computedHeaderStyle, footerStyle: computedFooterStyle } =
    getLayoutConfiguration();

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

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    return () => {
      document.body.classList.remove('dark-mode');
    };
  }, [isDarkMode]);

  const headerProps = {
    handleMobileMenuOpen,
    handleMobileMenuClose,
    scroll,
    langToggle,
    handleLangToggle,
    handleSidebarOpen,
    handleSidebarClose,
    isDarkMode,
  };

  const renderHeader = () => {
    switch (computedHeaderStyle) {
      case 1:
        return <Header1 {...headerProps} />;
      case 2:
        return <Header2 {...headerProps} />;
      case 3:
        return <Header3 {...headerProps} />;
      case 4:
        return <Header4 {...headerProps} />;
      case 5:
        return <Header5 {...headerProps} />;
      default:
        return <Header1 {...headerProps} />;
    }
  };

  const renderFooter = () => {
    switch (computedFooterStyle) {
      case 2:
        return <Footer2 footerClass={footerClass} />;
      case 3:
        return <Footer3 footerClass={footerClass} logoWhite={logoWhite} />;
      default:
        return <Footer1 />;
    }
  };

  return (
    <>
      {renderHeader()}

      <main className={`main content-type-${contentType || 'default'}`}>
        {(breadcrumbCategory || post?.category) && (
          <Breadcrumb
            breadcrumbCategory={breadcrumbCategory || post?.category || ''}
            breadcrumbPostTitle={breadcrumbPostTitle || post?.title}
          />
        )}
        {children}
      </main>

      {renderFooter()}
      <BackToTop />
    </>
  );
};

export default Layout;
export type { ContentType };

/**
 * Layout System Documentation
 *
 * Header Styles:
 * 1. Header1 - Main news layout (trending posts, homepage)
 * 2. Header2 - Magazine style (featured content, curated posts)
 * 3. Header3 - Minimal (post reading, clean article view)
 * 4. Header4 - Tech-focused (Reddit content, discussion threads)
 * 5. Header5 - Social media style (viral content, shareable posts)
 *
 * Footer Styles:
 * 1. Footer1 - Default ThreadJuice footer (newsletter, categories, links)
 * 2. Footer2 - Alternative layout
 * 3. Footer3 - Minimal footer (for reading-focused pages)
 *
 * Content Types:
 * - trending: High-traffic posts, trending Reddit content
 * - featured: Curated content, editorial picks
 * - reading: Full article view, long-form content
 * - reddit: Reddit-focused content, comment threads
 * - viral: Social media optimized, shareable content
 * - default: Standard layout fallback
 *
 * Layout Selection Priority:
 * 1. Explicit headerStyle/footerStyle props (highest priority)
 * 2. Post.layout_style from database
 * 3. contentType mapping
 * 4. Default layout (fallback)
 */
