import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans, GeistMono } from 'geist/font';

// Load why-did-you-render in development
if (process.env.NODE_ENV === 'development') {
  import('../lib/whydidyourender');
}

// Geist fonts: GeistSans for headers/body, GeistMono for tags/buttons

export const metadata = {
  title: 'ThreadJuice - Reddit to Viral Content Engine',
  description: 'Transform Reddit threads into viral content with AI ✨',
  keywords: ['reddit', 'content', 'viral', 'nextjs', 'ai'],
  authors: [{ name: 'Dean Newton' }],
  creator: 'Dean Newton',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://threadjuice.com',
    title: 'ThreadJuice - Reddit to Viral Content Engine',
    description: 'Transform Reddit threads into viral content with AI ✨',
    siteName: 'ThreadJuice',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreadJuice - Reddit to Viral Content Engine',
    description: 'Transform Reddit threads into viral content with AI ✨',
    creator: '@threadjuice',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' className='scroll-smooth'>
        <head>
          {/* Sarsa CSS */}
          <link rel='stylesheet' href='/assets/css/bootstrap.min.css' />
          <link rel='stylesheet' href='/assets/css/animate.min.css' />
          <link rel='stylesheet' href='/assets/css/magnific-popup.css' />
          <link rel='stylesheet' href='/assets/css/fontawesome-all.min.css' />
          <link rel='stylesheet' href='/assets/css/flaticon.css' />
          <link rel='stylesheet' href='/assets/css/swiper-bundle.css' />
          <link rel='stylesheet' href='/assets/css/slick.css' />
          <link rel='stylesheet' href='/assets/css/spacing.css' />
          <link rel='stylesheet' href='/assets/css/main.css' />
          <link rel='stylesheet' href='/assets/css/imageRevealHover.css' />
        </head>
        <body
          className={`${GeistSans.className} ${GeistMono.variable} antialiased`}
          style={
            {
              '--font-geist-sans': GeistSans.style.fontFamily,
              '--font-geist-mono': GeistMono.style.fontFamily,
            } as React.CSSProperties
          }
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
