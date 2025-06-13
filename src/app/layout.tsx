import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'ThreadJuice - Reddit to Viral Content Engine',
  description:
    'Transform Reddit threads into shareable viral content with AI-powered personas',
  keywords: ['Reddit', 'viral content', 'TIFU', 'AITA', 'social media', 'AI'],
  authors: [{ name: 'ThreadJuice Team' }],
  openGraph: {
    title: 'ThreadJuice - Reddit to Viral Content Engine',
    description: 'Transform Reddit threads into shareable viral content',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreadJuice - Reddit to Viral Content Engine',
    description: 'Transform Reddit threads into shareable viral content',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' data-theme='light'>
        <head>
          {/* Sarsa CSS */}
          <link rel='stylesheet' href='/assets/css/bootstrap.min.css' />
          <link rel='stylesheet' href='/assets/css/fontawesome-all.min.css' />
          <link rel='stylesheet' href='/assets/css/flaticon.css' />
          <link rel='stylesheet' href='/assets/css/animate.min.css' />
          <link rel='stylesheet' href='/assets/css/magnific-popup.css' />
          <link rel='stylesheet' href='/assets/css/slick.css' />
          <link rel='stylesheet' href='/assets/css/swiper-bundle.css' />
          <link rel='stylesheet' href='/assets/css/main.css' />
          <link rel='stylesheet' href='/assets/css/spacing.css' />

          {/* Favicon */}
          <link rel='icon' href='/favicon.ico' />
          <link rel='apple-touch-icon' href='/favicon.png' />
        </head>
        <body className='body-wrapper'>
          {children}

          {/* Sarsa Scripts */}
          <Script
            src='/assets/js/vendor/jquery-3.6.0.min.js'
            strategy='beforeInteractive'
          />
          <Script
            src='/assets/js/bootstrap.min.js'
            strategy='afterInteractive'
          />
          <Script
            src='/assets/js/isotope.pkgd.min.js'
            strategy='afterInteractive'
          />
          <Script
            src='/assets/js/imagesloaded.pkgd.min.js'
            strategy='afterInteractive'
          />
          <Script
            src='/assets/js/jquery.magnific-popup.min.js'
            strategy='afterInteractive'
          />
          <Script
            src='/assets/js/jquery.odometer.min.js'
            strategy='afterInteractive'
          />
          <Script
            src='/assets/js/jquery.appear.js'
            strategy='afterInteractive'
          />
          <Script src='/assets/js/slick.min.js' strategy='afterInteractive' />
          <Script src='/assets/js/ajax-form.js' strategy='afterInteractive' />
          <Script src='/assets/js/wow.min.js' strategy='afterInteractive' />
          <Script src='/assets/js/main.js' strategy='afterInteractive' />
        </body>
      </html>
    </ClerkProvider>
  );
}
