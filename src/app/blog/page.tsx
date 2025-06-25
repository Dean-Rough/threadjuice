'use client';

import BlogSidebar from '@/components/ui/BlogSidebar';
import Link from 'next/link';
import Image from 'next/image';

export default function Blog() {
  return (
    <>
      <section className='blog-details-area pb-100 pt-80'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-1'>
              <div className='blog-details-social'>
                <ul className='list-wrap'>
                  <li>
                    <Link href='#'>
                      <i className='fab fa-facebook-f' />
                    </Link>
                  </li>
                  <li>
                    <Link href='#'>
                      <i className='fab fa-twitter' />
                    </Link>
                  </li>
                  <li>
                    <Link href='#'>
                      <i className='fab fa-linkedin-in' />
                    </Link>
                  </li>
                  <li>
                    <Link href='#'>
                      <i className='fab fa-reddit' />
                    </Link>
                  </li>
                  <li>
                    <Link href='#'>
                      <i className='fas fa-share' />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='col-xl-8 col-lg-7'>
              <div className='blog-post-wrapper'>
                <div className='latest__post-item'>
                  <div className='latest__post-thumb tgImage__hover'>
                    <Link href='/blog/1'>
                      <Image
                        src='/assets/img/lifestyle/life_style01.jpg'
                        alt='img'
                        width={400}
                        height={300}
                      />
                    </Link>
                  </div>
                  <div className='latest__post-content'>
                    <ul className='tgbanner__content-meta list-wrap'>
                      <li className='category'>
                        <Link href='/blog'>viral</Link>
                      </li>
                      <li>
                        <span className='by'>By</span>{' '}
                        <Link href='/personas/snarky-sage'>
                          The Snarky Sage
                        </Link>
                      </li>
                      <li>2 hours ago</li>
                    </ul>
                    <h3 className='title tgcommon__hover'>
                      <Link href='/blog/1'>
                        AITA for telling my roommate her TikTok dances are
                        ruining my Zoom calls?
                      </Link>
                    </h3>
                    <p>
                      Reddit user discovers their roommate&apos;s viral dance
                      practice sessions are creating chaos during important work
                      meetings. The drama unfolds as boundaries clash with
                      social media ambitions in this millennial nightmare that
                      has everyone picking sides.
                    </p>
                    <div className='latest__post-read-more'>
                      <Link href='/blog/1'>
                        Read Full Story{' '}
                        <i className='far fa-long-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className='latest__post-item'>
                  <div className='latest__post-thumb tgImage__hover'>
                    <Link href='/blog/2'>
                      <Image
                        src='/assets/img/lifestyle/life_style02.jpg'
                        alt='img'
                        width={400}
                        height={300}
                      />
                    </Link>
                  </div>
                  <div className='latest__post-content'>
                    <ul className='tgbanner__content-meta list-wrap'>
                      <li className='category'>
                        <Link href='/blog'>trending</Link>
                      </li>
                      <li>
                        <span className='by'>By</span>{' '}
                        <Link href='/personas/down-to-earth-buddy'>
                          The Down-to-Earth Buddy
                        </Link>
                      </li>
                      <li>4 hours ago</li>
                    </ul>
                    <h3 className='title tgcommon__hover'>
                      <Link href='/blog/2'>
                        Guy finds $20 in old jacket, Reddit helps him invest it
                        into $2000
                      </Link>
                    </h3>
                    <p>
                      What started as a simple jacket check turned into the
                      investment opportunity of a lifetime. Follow this
                      wholesome journey as r/personalfinance guides one lucky
                      Redditor through the basics of smart money management.
                    </p>
                    <div className='latest__post-read-more'>
                      <Link href='/blog/2'>
                        Read Full Story{' '}
                        <i className='far fa-long-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className='latest__post-item'>
                  <div className='latest__post-thumb tgImage__hover'>
                    <Link href='/blog/3'>
                      <Image
                        src='/assets/img/lifestyle/life_style03.jpg'
                        alt='img'
                        width={400}
                        height={300}
                      />
                    </Link>
                  </div>
                  <div className='latest__post-content'>
                    <ul className='tgbanner__content-meta list-wrap'>
                      <li className='category'>
                        <Link href='/blog'>chaos</Link>
                      </li>
                      <li>
                        <span className='by'>By</span>{' '}
                        <Link href='/personas/dry-cynic'>The Dry Cynic</Link>
                      </li>
                      <li>6 hours ago</li>
                    </ul>
                    <h3 className='title tgcommon__hover'>
                      <Link href='/blog/3'>
                        Office worker accidentally CC&apos;s entire company on
                        resignation email
                      </Link>
                    </h3>
                    <p>
                      A simple typo turns into corporate entertainment as one
                      employee&apos;s brutally honest resignation letter reaches
                      1,247 coworkers instead of just HR. The chaos that ensued
                      will restore your faith in workplace drama.
                    </p>
                    <div className='latest__post-read-more'>
                      <Link href='/blog/3'>
                        Read Full Story{' '}
                        <i className='far fa-long-arrow-right' />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className='pagination__wrap'>
                  <ul className='list-wrap'>
                    <li className='active'>
                      <Link href='#'>01</Link>
                    </li>
                    <li>
                      <Link href='#'>02</Link>
                    </li>
                    <li>
                      <Link href='#'>...</Link>
                    </li>
                    <li>
                      <Link href='#'>06</Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fas fa-angle-double-right' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='col-xl-3 col-lg-4 col-md-6'>
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
