'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  TrendingUp,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

/**
 * Marketing landing page for ThreadJuice public launch
 * Features email capture, product demos, and conversion tracking
 */
export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');

        // Track conversion
        if (typeof window !== 'undefined' && (window as any).va) {
          (window as any).va('track', 'Newsletter Signup', { email });
        }
      }
    } catch (error) {
      console.error('Newsletter signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Viral Content Discovery',
      description:
        'AI-powered curation finds the most engaging Reddit threads and transforms them into shareable stories.',
    },
    {
      icon: Zap,
      title: 'Instant Story Generation',
      description:
        'Our gpt-4o writers create compelling narratives with unique persona voices in seconds.',
    },
    {
      icon: Users,
      title: 'Diverse Writer Personas',
      description:
        'Eight distinct writing personalities bring different perspectives to every story.',
    },
  ];

  const testimonials = [
    {
      quote:
        'ThreadJuice helps me discover the most interesting stories from Reddit without the endless scrolling.',
      author: 'Sarah K.',
      role: 'Content Creator',
    },
    {
      quote:
        "The AI writers are surprisingly engaging. It's like having a curated news feed with personality.",
      author: 'Mike R.',
      role: 'Marketing Manager',
    },
    {
      quote:
        'Finally, a way to stay updated on internet culture without getting lost in rabbit holes.',
      author: 'Jessica L.',
      role: 'Social Media Manager',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-cream-50 to-orange-50'>
      {/* Header */}
      <header className='container mx-auto px-4 py-6'>
        <nav className='flex items-center justify-between'>
          <Link href='/' className='flex items-center space-x-2'>
            <Image
              src='/assets/img/logo/logo.svg'
              alt='ThreadJuice'
              width={40}
              height={40}
              className='h-10 w-10'
            />
            <span className='text-2xl font-bold text-gray-900'>
              ThreadJuice
            </span>
          </Link>
          <div className='hidden items-center space-x-6 md:flex'>
            <Link href='/blog' className='text-gray-700 hover:text-orange-600'>
              Stories
            </Link>
            <Link
              href='/personas'
              className='text-gray-700 hover:text-orange-600'
            >
              Writers
            </Link>
            <Link href='/about' className='text-gray-700 hover:text-orange-600'>
              About
            </Link>
            <Link
              href='/auth/sign-up'
              className='rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700'
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-16 text-center'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-6 text-5xl font-bold text-gray-900 md:text-6xl'>
            From Reddit to
            <span className='block text-orange-600'>Viral Stories</span>
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-gray-600'>
            Discover trending Reddit threads transformed into engaging stories
            by AI writers with distinct personalities. Stay entertained and
            informed without the endless scrolling.
          </p>

          {/* Email Capture */}
          <div className='mx-auto mb-12 max-w-md rounded-2xl bg-white p-8 shadow-xl'>
            {isSubscribed ? (
              <div className='text-center'>
                <CheckCircle className='mx-auto mb-4 h-16 w-16 text-green-500' />
                <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                  Welcome to ThreadJuice!
                </h3>
                <p className='text-gray-600'>
                  Check your email for your first curated story collection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit}>
                <h3 className='mb-4 text-xl font-semibold text-gray-900'>
                  Get Early Access
                </h3>
                <div className='flex flex-col gap-3 sm:flex-row'>
                  <input
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='Enter your email'
                    className='flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                    required
                  />
                  <button
                    type='submit'
                    disabled={isLoading}
                    className='flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700 disabled:opacity-50'
                  >
                    {isLoading ? (
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    ) : (
                      <>
                        <Mail className='mr-2 h-5 w-5' />
                        Join Waitlist
                      </>
                    )}
                  </button>
                </div>
                <p className='mt-3 text-sm text-gray-500'>
                  Join 1,000+ readers getting the best stories daily
                </p>
              </form>
            )}
          </div>

          {/* Preview Image */}
          <div className='relative'>
            <Image
              src='/assets/img/landing/app-preview.jpg'
              alt='ThreadJuice App Preview'
              width={800}
              height={500}
              className='mx-auto rounded-2xl shadow-2xl'
              placeholder='blur'
              blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='bg-white py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-4xl font-bold text-gray-900'>
              Why ThreadJuice?
            </h2>
            <p className='mx-auto max-w-2xl text-xl text-gray-600'>
              We transform the chaos of Reddit into curated, engaging stories
              that inform and entertain.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className='p-6 text-center'>
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100'>
                    <Icon className='h-8 w-8 text-orange-600' />
                  </div>
                  <h3 className='mb-3 text-xl font-semibold text-gray-900'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600'>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='bg-gray-50 py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-4xl font-bold text-gray-900'>
              How It Works
            </h2>
            <p className='text-xl text-gray-600'>
              From trending Reddit threads to viral stories in three simple
              steps
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600'>
                1
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                AI Discovers Trends
              </h3>
              <p className='text-gray-600'>
                Our AI monitors popular subreddits and identifies the most
                engaging threads
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600'>
                2
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                Writers Create Stories
              </h3>
              <p className='text-gray-600'>
                Our AI personas transform raw threads into engaging narratives
                with unique voices
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600'>
                3
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                You Get Entertained
              </h3>
              <p className='text-gray-600'>
                Receive curated, entertaining stories without the endless
                scrolling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='bg-white py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-4xl font-bold text-gray-900'>
              What Our Readers Say
            </h2>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            {testimonials.map((testimonial, index) => (
              <div key={index} className='rounded-xl bg-gray-50 p-6'>
                <p className='mb-4 italic text-gray-700'>
                  &quot;{testimonial.quote}&quot;
                </p>
                <div>
                  <p className='font-semibold text-gray-900'>
                    {testimonial.author}
                  </p>
                  <p className='text-sm text-gray-500'>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-r from-orange-600 to-red-600 py-20'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-4 text-4xl font-bold text-white'>
            Ready to Transform Your Content Diet?
          </h2>
          <p className='mx-auto mb-8 max-w-2xl text-xl text-orange-100'>
            Join thousands of readers who&apos;ve upgraded from endless scrolling to
            curated entertainment.
          </p>
          <Link
            href='/auth/sign-up'
            className='inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-orange-600 transition-colors hover:bg-gray-100'
          >
            Start Reading Now
            <ArrowRight className='ml-2 h-5 w-5' />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 py-12 text-white'>
        <div className='container mx-auto px-4'>
          <div className='grid gap-8 md:grid-cols-4'>
            <div>
              <div className='mb-4 flex items-center space-x-2'>
                <Image
                  src='/assets/img/logo/w_logo.svg'
                  alt='ThreadJuice'
                  width={32}
                  height={32}
                  className='h-8 w-8'
                />
                <span className='text-xl font-bold'>ThreadJuice</span>
              </div>
              <p className='text-gray-400'>
                Transforming Reddit threads into viral stories with AI writers.
              </p>
            </div>

            <div>
              <h4 className='mb-4 font-semibold'>Product</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/blog' className='hover:text-white'>
                    Stories
                  </Link>
                </li>
                <li>
                  <Link href='/personas' className='hover:text-white'>
                    Writers
                  </Link>
                </li>
                <li>
                  <Link href='/about' className='hover:text-white'>
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-semibold'>Company</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/privacy' className='hover:text-white'>
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href='/terms' className='hover:text-white'>
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href='/contact' className='hover:text-white'>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-semibold'>Connect</h4>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a
                    href='https://twitter.com/threadjuice'
                    className='hover:text-white'
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href='https://reddit.com/r/threadjuice'
                    className='hover:text-white'
                  >
                    Reddit
                  </a>
                </li>
                <li>
                  <a
                    href='mailto:hello@threadjuice.com'
                    className='hover:text-white'
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-8 border-t border-gray-800 pt-8 text-center text-gray-400'>
            <p>&copy; 2024 ThreadJuice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
