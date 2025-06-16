import { Metadata } from 'next';
import Link from 'next/link';
import ThreadJuiceLayout from '@/components/layout/ThreadJuiceLayout';
import { AlertCircle, Home, Search, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description:
    'The page you are looking for could not be found. Explore trending Reddit stories and viral content on ThreadJuice.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <ThreadJuiceLayout headerStyle={5}>
      <section className='not-found-area pt-100 pb-100'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-8 text-center'>
              <div className='not-found-content'>
                {/* 404 Icon */}
                <div className='not-found-icon mb-30'>
                  <AlertCircle size={120} className='text-primary' />
                </div>

                {/* 404 Title */}
                <h1 className='not-found-title mb-20'>Oops! Page Not Found</h1>

                {/* 404 Description */}
                <p className='not-found-description text-muted fs-5 mb-40'>
                  The page you&apos;re looking for seems to have gone viral and
                  disappeared into the Reddit void. Don&apos;t worry though, we
                  have plenty of other engaging content for you to explore.
                </p>

                {/* Action Buttons */}
                <div className='not-found-actions mb-50'>
                  <Link href='/' className='btn btn-primary btn-lg me-3'>
                    <Home size={20} className='me-2' />
                    Back to Home
                  </Link>
                  <Link
                    href='/trending'
                    className='btn btn-outline-primary btn-lg'
                  >
                    <TrendingUp size={20} className='me-2' />
                    View Trending
                  </Link>
                </div>

                {/* Search Suggestion */}
                <div className='search-suggestion'>
                  <p className='text-muted mb-20'>
                    Or try searching for something specific:
                  </p>
                  <form className='search-form d-flex justify-content-center'>
                    <div className='input-group' style={{ maxWidth: '400px' }}>
                      <input
                        type='text'
                        className='form-control form-control-lg'
                        placeholder='Search viral threads...'
                      />
                      <button
                        className='btn btn-outline-secondary'
                        type='submit'
                      >
                        <Search size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Content Suggestions */}
          <div className='row justify-content-center mt-80'>
            <div className='col-lg-10'>
              <div className='popular-suggestions'>
                <h3 className='mb-40 text-center'>Popular Right Now</h3>
                <div className='row'>
                  <div className='col-md-4 mb-30'>
                    <div className='suggestion-card h-100 rounded border bg-white p-4'>
                      <h5 className='card-title mb-15'>🔥 Trending Stories</h5>
                      <p className='card-text text-muted mb-20'>
                        Discover the hottest Reddit threads transformed into
                        engaging narratives.
                      </p>
                      <Link
                        href='/trending'
                        className='btn btn-outline-primary btn-sm'
                      >
                        Explore Trending
                      </Link>
                    </div>
                  </div>
                  <div className='col-md-4 mb-30'>
                    <div className='suggestion-card h-100 rounded border bg-white p-4'>
                      <h5 className='card-title mb-15'>🤖 AI Personas</h5>
                      <p className='card-text text-muted mb-20'>
                        Meet our AI writers and explore their unique
                        perspectives on viral content.
                      </p>
                      <Link
                        href='/personas'
                        className='btn btn-outline-primary btn-sm'
                      >
                        Meet Personas
                      </Link>
                    </div>
                  </div>
                  <div className='col-md-4 mb-30'>
                    <div className='suggestion-card h-100 rounded border bg-white p-4'>
                      <h5 className='card-title mb-15'>📚 Categories</h5>
                      <p className='card-text text-muted mb-20'>
                        Browse stories by topic - from technology to
                        entertainment and beyond.
                      </p>
                      <Link
                        href='/categories'
                        className='btn btn-outline-primary btn-sm'
                      >
                        Browse Categories
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ThreadJuiceLayout>
  );
}
