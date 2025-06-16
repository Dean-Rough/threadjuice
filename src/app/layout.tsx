import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { GeistSans, GeistMono } from 'geist/font';

// Load why-did-you-render in development
if (process.env.NODE_ENV === 'development') {
  import('../lib/whydidyourender');
}

// Geist fonts: GeistSans for headers/body, GeistMono for tags/buttons

export const metadata = {
  metadataBase: new URL('https://threadjuice.com'),
  title: {
    default: 'ThreadJuice - AI-Powered Reddit Content Engine',
    template: '%s | ThreadJuice',
  },
  description:
    'Discover viral Reddit threads transformed into engaging stories by AI personas. Stay updated with trending discussions, analysis, and insights from across Reddit.',
  keywords: [
    'ThreadJuice',
    'Reddit content',
    'viral threads',
    'AI content generation',
    'Reddit stories',
    'trending discussions',
    'AI personas',
    'content transformation',
    'social media trends',
    'Reddit analysis',
  ],
  authors: [{ name: 'Dean Newton', url: 'https://threadjuice.com' }],
  creator: 'ThreadJuice',
  publisher: 'ThreadJuice',
  category: 'Technology',
  classification: 'Content Platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://threadjuice.com',
    title: 'ThreadJuice - AI-Powered Reddit Content Engine',
    description:
      'Discover viral Reddit threads transformed into engaging stories by AI personas.',
    siteName: 'ThreadJuice',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ThreadJuice - AI-Powered Reddit Content Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThreadJuice - AI-Powered Reddit Content Engine',
    description:
      'Discover viral Reddit threads transformed into engaging stories by AI personas.',
    creator: '@threadjuice',
    site: '@threadjuice',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'google-site-verification-token',
    yandex: 'yandex-verification-token',
    other: {
      'msvalidate.01': 'bing-site-verification-token',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang='en' className='scroll-smooth'>
        <head></head>
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
