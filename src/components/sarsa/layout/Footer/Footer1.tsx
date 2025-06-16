import Link from 'next/link';

export default function Footer1() {
  return (
    <>
      <footer className='footer-area black-bg'>
        <div className='container'>
          <div className='footer__top-wrap'>
            <div className='row'>
              <div className='col-xl-2 col-lg-3 col-md-4 col-sm-6'>
                <div className='footer__widget'>
                  <h4 className='fw-title'>Categories</h4>
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
                    <li>
                      <Link href='/category/business'>Business</Link>
                    </li>
                    <li>
                      <Link href='/category/science'>Science</Link>
                    </li>
                    <li>
                      <Link href='/category/health'>Health</Link>
                    </li>
                    <li>
                      <Link href='/category/news'>News</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-xl-2 col-lg-3 col-md-4 col-sm-6'>
                <div className='footer__widget'>
                  <h4 className='fw-title'>Personas</h4>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/personas/snarky-sage'>The Snarky Sage</Link>
                    </li>
                    <li>
                      <Link href='/personas/down-to-earth-buddy'>
                        Down-to-Earth Buddy
                      </Link>
                    </li>
                    <li>
                      <Link href='/personas/dry-cynic'>The Dry Cynic</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-xl-2 col-lg-3 col-md-4 col-sm-6'>
                <div className='footer__widget'>
                  <h4 className='fw-title'>Popular</h4>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='#'>Trending Stories</Link>
                    </li>
                    <li>
                      <Link href='#'>Viral Content</Link>
                    </li>
                    <li>
                      <Link href='#'>Hot Topics</Link>
                    </li>
                    <li>
                      <Link href='#'>Reddit Gold</Link>
                    </li>
                    <li>
                      <Link href='#'>Community Picks</Link>
                    </li>
                    <li>
                      <Link href='#'>Weekly Highlights</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-xl-2 col-lg-3 col-md-4 col-sm-6'>
                <div className='footer__widget'>
                  <h4 className='fw-title'>About</h4>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='/about'>Our Story</Link>
                    </li>
                    <li>
                      <Link href='#'>How It Works</Link>
                    </li>
                    <li>
                      <Link href='#'>Content Policy</Link>
                    </li>
                    <li>
                      <Link href='#'>Privacy Policy</Link>
                    </li>
                    <li>
                      <Link href='#'>Terms of Use</Link>
                    </li>
                    <li>
                      <Link href='#'>Contact Us</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-xl-2 col-lg-3 col-md-4 col-sm-6'>
                <div className='footer__widget'>
                  <h4 className='fw-title'>Features</h4>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='#'>AI Summarization</Link>
                    </li>
                    <li>
                      <Link href='#'>Custom Avatars</Link>
                    </li>
                    <li>
                      <Link href='#'>Video Generation</Link>
                    </li>
                    <li>
                      <Link href='#'>Quiz Creator</Link>
                    </li>
                    <li>
                      <Link href='#'>Share Tools</Link>
                    </li>
                    <li>
                      <Link href='#'>Analytics</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-xl-2 col-lg-3 col-md-4 col-sm-6'>
                <div className='footer__widget'>
                  <h4 className='fw-title'>Trending In</h4>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='#'>AI & Tech</Link>
                    </li>
                    <li>
                      <Link href='#'>Gaming</Link>
                    </li>
                    <li>
                      <Link href='#'>Memes</Link>
                    </li>
                    <li>
                      <Link href='#'>Crypto</Link>
                    </li>
                    <li>
                      <Link href='#'>Movies & TV</Link>
                    </li>
                    <li>
                      <Link href='#'>Sports</Link>
                    </li>
                    <li>
                      <Link href='#'>Science</Link>
                    </li>
                    <li>
                      <Link href='#'>World News</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className='footer__logo-wrap'>
            <div className='row align-items-center'>
              <div className='col-lg-3 col-md-4'>
                <div className='footer__logo logo'>
                  <Link href='/'>
                    <img
                      src='/assets/img/brand/1x/Logotype-White.png'
                      alt='ThreadJuice'
                    />
                  </Link>
                </div>
              </div>
              <div className='col-lg-9 col-md-8'>
                <div className='footer__social'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-facebook-f' /> Facebook{' '}
                        <span>25K</span>
                      </Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-twitter' /> Twitter{' '}
                        <span>44K</span>
                      </Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-youtube' /> Youtube{' '}
                        <span>91K</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className='footer__copyright'>
            <div className='row'>
              <div className='col-lg-6'>
                <div className='copyright__text'>
                  <p>
                    ThreadJuice - Reddit to Viral Stories -{' '}
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='copyright__menu'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='#'>Contact Us</Link>
                    </li>
                    <li>
                      <Link href='#'>Terms of Use</Link>
                    </li>
                    <li>
                      <Link href='#'>Privacy Policy</Link>
                    </li>
                    <li>
                      <Link href='#'>API</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
