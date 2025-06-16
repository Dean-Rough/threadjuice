'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, TrendingUp, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react';

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
      description: 'AI-powered curation finds the most engaging Reddit threads and transforms them into shareable stories.',
    },
    {
      icon: Zap,
      title: 'Instant Story Generation',
      description: 'Our GPT-4 writers create compelling narratives with unique persona voices in seconds.',
    },
    {
      icon: Users,
      title: 'Diverse Writer Personas',
      description: 'Eight distinct writing personalities bring different perspectives to every story.',
    },
  ];

  const testimonials = [
    {
      quote: "ThreadJuice helps me discover the most interesting stories from Reddit without the endless scrolling.",
      author: "Sarah K.",
      role: "Content Creator",
    },
    {
      quote: "The AI writers are surprisingly engaging. It's like having a curated news feed with personality.",
      author: "Mike R.",
      role: "Marketing Manager",
    },
    {
      quote: "Finally, a way to stay updated on internet culture without getting lost in rabbit holes.",
      author: "Jessica L.",
      role: "Social Media Manager",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/img/logo/logo.svg"
              alt="ThreadJuice"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-gray-900">ThreadJuice</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/blog" className="text-gray-700 hover:text-orange-600">
              Stories
            </Link>
            <Link href="/personas" className="text-gray-700 hover:text-orange-600">
              Writers
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600">
              About
            </Link>
            <Link
              href="/auth/sign-up"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            From Reddit to
            <span className="text-orange-600 block">Viral Stories</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover trending Reddit threads transformed into engaging stories by AI writers with distinct personalities. 
            Stay entertained and informed without the endless scrolling.
          </p>

          {/* Email Capture */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto mb-12">
            {isSubscribed ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to ThreadJuice!
                </h3>
                <p className="text-gray-600">
                  Check your email for your first curated story collection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Get Early Access
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Join Waitlist
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Join 1,000+ readers getting the best stories daily
                </p>
              </form>
            )}
          </div>

          {/* Preview Image */}
          <div className="relative">
            <Image
              src="/assets/img/landing/app-preview.jpg"
              alt="ThreadJuice App Preview"
              width={800}
              height={500}
              className="rounded-2xl shadow-2xl mx-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why ThreadJuice?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We transform the chaos of Reddit into curated, engaging stories that inform and entertain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From trending Reddit threads to viral stories in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Discovers Trends
              </h3>
              <p className="text-gray-600">
                Our AI monitors popular subreddits and identifies the most engaging threads
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Writers Create Stories
              </h3>
              <p className="text-gray-600">
                Our AI personas transform raw threads into engaging narratives with unique voices
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-purple-600 font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                You Get Entertained
              </h3>
              <p className="text-gray-600">
                Receive curated, entertaining stories without the endless scrolling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Readers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Content Diet?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who've upgraded from endless scrolling to curated entertainment.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Reading Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/assets/img/logo/w_logo.svg"
                  alt="ThreadJuice"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold">ThreadJuice</span>
              </div>
              <p className="text-gray-400">
                Transforming Reddit threads into viral stories with AI writers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white">Stories</Link></li>
                <li><Link href="/personas" className="hover:text-white">Writers</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://twitter.com/threadjuice" className="hover:text-white">Twitter</a></li>
                <li><a href="https://reddit.com/r/threadjuice" className="hover:text-white">Reddit</a></li>
                <li><a href="mailto:hello@threadjuice.com" className="hover:text-white">Email</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ThreadJuice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}