'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThreadJuiceLayout from '@/components/layout/ThreadJuiceLayout';
import TrendingSlider from '@/components/slider/TrendingSlider';
import data from '@/util/blogData';

export default function Home() {
  const [isOpen, setOpen] = useState(false);

  return (
    <ThreadJuiceLayout headerStyle={3}>
      {/* Hero Banner */}
      <section className='tgbanner__area'>
        <div className='container'>
          <div className='tgbanner__grid'>
            <div className='tgbanner__post big-post'>
              <div className='tgbanner__thumb tgImage__hover'>
                <Link href='/posts/time-travel-theory'>
                  <img
                    src='/assets/img/blog/blog01.jpg'
                    alt='Viral Reddit Thread'
                  />
                </Link>
              </div>
              <div className='tgbanner__content'>
                <ul className='tgbanner__content-meta list-wrap'>
                  <li className='category'>
                    <Link href='/technology'>🔬 Technology</Link>
                  </li>
                  <li>
                    <span className='by'>By</span>{' '}
                    <Link href='/personas/snarky-sage'>The Snarky Sage</Link>
                  </li>
                  <li>🔥 Viral • 24.5k upvotes</li>
                </ul>
                <h2 className='title tgcommon__hover'>
                  <Link href='/posts/time-travel-theory'>
                    🚀 This Reddit physicist just broke time travel theory and
                    the internet can't handle it
                  </Link>
                </h2>
              </div>
            </div>
            <div className='tgbanner__side-post'>
              <div className='tgbanner__post small-post'>
                <div className='tgbanner__thumb tgImage__hover'>
                  <Link href='/posts/ai-relationship-advice'>
                    <img
                      src='/assets/img/blog/blog02.jpg'
                      alt='AI Reddit Bot'
                    />
                  </Link>
                </div>
                <div className='tgbanner__content'>
                  <ul className='tgbanner__content-meta list-wrap'>
                    <li className='category'>
                      <Link href='/technology'>🤖 AI Drama</Link>
                    </li>
                  </ul>
                  <h2 className='title tgcommon__hover'>
                    <Link href='/posts/ai-relationship-advice'>
                      AI bot gives better relationship advice than humans,
                      Reddit loses its mind
                    </Link>
                  </h2>
                </div>
              </div>
              <div className='tgbanner__post small-post'>
                <div className='tgbanner__thumb tgImage__hover'>
                  <Link href='/posts/crypto-pizza-disaster'>
                    <img src='/assets/img/blog/blog03.jpg' alt='Crypto Pizza' />
                  </Link>
                </div>
                <div className='tgbanner__content'>
                  <ul className='tgbanner__content-meta list-wrap'>
                    <li className='category'>
                      <Link href='/finance'>💸 Crypto Fails</Link>
                    </li>
                  </ul>
                  <h2 className='title tgcommon__hover'>
                    <Link href='/posts/crypto-pizza-disaster'>
                      $50k crypto pizza order goes wrong, gas fees cost more
                      than a Tesla
                    </Link>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Reddit Threads */}
      <section className='trending-post-area section__hover-line pt-25'>
        <div className='container'>
          <div className='section__title-wrap mb-40'>
            <div className='row align-items-end'>
              <div className='col-sm-6'>
                <div className='section__title'>
                  <span className='section__sub-title'>🔥 Hot on Reddit</span>
                  <h3 className='section__main-title'>Trending Threads</h3>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='section__read-more text-sm-end text-start'>
                  <Link href='/trending'>
                    More Viral Posts <i className='far fa-long-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='trending__slider'>
            <div className='swiper-container trending-active'>
              <TrendingSlider showItem={4} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured ThreadJuice Stories */}
      <section className='featured-post-area section__hover-line pt-75'>
        <div className='container'>
          <div className='section__title-wrap mb-40'>
            <div className='row align-items-end'>
              <div className='col-sm-6'>
                <div className='section__title'>
                  <span className='section__sub-title'>
                    ✨ ThreadJuice Originals
                  </span>
                  <h3 className='section__main-title'>AI-Enhanced Stories</h3>
                </div>
              </div>
              <div className='col-sm-6'>
                <div className='section__read-more text-sm-end text-start'>
                  <Link href='/featured'>
                    More Featured Stories{' '}
                    <i className='far fa-long-arrow-right' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className='row'>
            {data.slice(8, 14).map((item, i) => (
              <div className='col-lg-4 col-sm-6' key={i}>
                <div className='featured__post'>
                  <div
                    className='featured__thumb'
                    style={{
                      backgroundImage: `url(/assets/img/blog/${item.img})`,
                    }}
                  >
                    #{item.id}
                  </div>
                  <div className='featured__content'>
                    <ul className='tgbanner__content-meta list-wrap'>
                      <li className='category'>
                        <Link href='/category/viral'>🚀 {item.category}</Link>
                      </li>
                      <li>
                        <span className='by'>By</span>{' '}
                        <Link href='/personas'>AI Persona</Link>
                      </li>
                    </ul>
                    <h4 className='title tgcommon__hover'>
                      <Link href={`/posts/${item.id}`}>
                        🔥 {item.title} (Reddit thread goes viral)
                      </Link>
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - ThreadJuice Style */}
      <section className='newsletter-area pb-80'>
        <div className='container'>
          <div className='newsletter__wrap'>
            <div className='row align-items-center'>
              <div className='col-xl-5 col-lg-6'>
                <div className='newsletter__title'>
                  <span className='sub-title'>🚀 Stay Updated</span>
                  <h4 className='title'>
                    Get notified when Reddit threads go viral
                  </h4>
                </div>
              </div>
              <div className='col-xl-7 col-lg-6'>
                <div className='newsletter__form-wrap'>
                  <form action='#' className='newsletter__form'>
                    <div className='newsletter__form-grp'>
                      <input
                        type='email'
                        placeholder='Your email for viral alerts...'
                        required
                      />
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id='flexCheckDefault'
                        />
                        <label
                          className='form-check-label'
                          htmlFor='flexCheckDefault'
                        >
                          I want daily viral thread summaries
                        </label>
                      </div>
                    </div>
                    <button className='btn' type='submit'>
                      <span className='text'>Join ThreadJuice</span>{' '}
                      <i className='fas fa-paper-plane' />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ThreadJuiceLayout>
  );
}
