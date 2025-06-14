import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
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
          {/* FontAwesome for icons - loaded via CDN */}
          <link
            rel='stylesheet'
            href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
            crossOrigin='anonymous'
          />

          {/* Favicon */}
          <link rel='icon' href='/favicon.ico' />
          <link rel='apple-touch-icon' href='/favicon.png' />
        </head>
        <body className='bg-gray-50 antialiased'>{children}</body>
      </html>
    </ClerkProvider>
  );
}
