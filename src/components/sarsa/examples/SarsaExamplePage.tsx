'use client';

import Link from 'next/link';
import { Layout } from '../index';
import dynamic from 'next/dynamic';

const TrendingSlider = dynamic(
  () => import('../slider/TrendingSlider').then(mod => mod.default),
  {
    ssr: false,
  }
);

export default function SarsaExamplePage() {
  return (
    <Layout
      headerStyle={1}
      footerStyle={1}
      headTitle='ThreadJuice - Sarsa Integration Example'
    >
      {/* Hero Banner */}
      <section className='banner-area banner-bg'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-12'>
              <div className='banner-content'>
                <h1 className='title'>Welcome to ThreadJuice</h1>
                <p>
                  Transform Reddit threads into viral stories with custom
                  personas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Stories Slider */}
      <section className='trending-post-area section-py-120'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-xl-6'>
              <div className='section-title mb-40 text-center'>
                <span className='sub-title'>Hot Topics</span>
                <h2 className='title'>Trending Stories</h2>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
              <TrendingSlider showItem={3} />
              <div className='block-gallery-pagination' />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className='latest-post-area gray-bg section-py-120'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-8'>
              <div className='latest-post-wrap'>
                <h3>Latest Viral Content</h3>
                <p>
                  Discover the most engaging Reddit threads transformed into
                  shareable stories by our AI-powered personas.
                </p>

                {/* Sample content cards would go here */}
                <div className='row'>
                  <div className='col-md-6'>
                    <div className='card mb-4'>
                      <div className='card-body'>
                        <h5 className='card-title'>The Snarky Sage</h5>
                        <p className='card-text'>
                          Delivers witty takes on trending topics with perfect
                          comedic timing.
                        </p>
                        <img
                          src='/assets/img/personas/snarky-sage.png'
                          alt='Snarky Sage'
                          className='img-fluid'
                          style={{ maxWidth: '60px' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='card mb-4'>
                      <div className='card-body'>
                        <h5 className='card-title'>Down-to-Earth Buddy</h5>
                        <p className='card-text'>
                          Your friendly guide through complex topics with
                          relatable explanations.
                        </p>
                        <img
                          src='/assets/img/personas/down-to-earth-buddy.png'
                          alt='Down-to-Earth Buddy'
                          className='img-fluid'
                          style={{ maxWidth: '60px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='sidebar-wrap'>
                <div className='sidebar-widget'>
                  <h4 className='widget-title'>Categories</h4>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/category/technology'>Technology</Link>
                    </li>
                    <li>
                      <Link href='/category/lifestyle'>Lifestyle</Link>
                    </li>
                    <li>
                      <Link href='/category/travel'>Travel</Link>
                    </li>
                    <li>
                      <Link href='/category/entertainment'>Entertainment</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
