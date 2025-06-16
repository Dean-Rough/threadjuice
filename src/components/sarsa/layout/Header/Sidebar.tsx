import Link from 'next/link';

interface SidebarProps {
  handleSidebarClose: () => void;
}

export default function Sidebar({ handleSidebarClose }: SidebarProps) {
  return (
    <>
      <div className='offCanvas__wrap'>
        <div className='offCanvas__body'>
          <div className='offCanvas__toggle' onClick={handleSidebarClose}>
            <i className='flaticon-addition' />
          </div>
          <div className='offCanvas__content'>
            <div className='offCanvas__logo logo'>
              <Link href='/' className='logo-dark'>
                <img
                  src='/assets/img/brand/1x/Logotype-Dark.png'
                  alt='ThreadJuice'
                />
              </Link>
              <Link href='/' className='logo-light'>
                <img
                  src='/assets/img/brand/1x/Logotype-White.png'
                  alt='ThreadJuice'
                />
              </Link>
            </div>
            <p>
              Transform Reddit threads into viral stories with custom personas
              and engaging content.
            </p>
            <ul className='offCanvas__instagram list-wrap'>
              <li>
                <Link
                  href='/assets/img/blog/blog01.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog01.jpg' alt='img' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog02.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog02.jpg' alt='img' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog03.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog03.jpg' alt='img' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog04.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog04.jpg' alt='img' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog05.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog05.jpg' alt='img' />
                </Link>
              </li>
              <li>
                <Link
                  href='/assets/img/blog/blog06.jpg'
                  className='popup-image'
                >
                  <img src='/assets/img/blog/blog06.jpg' alt='img' />
                </Link>
              </li>
            </ul>
          </div>
          <div className='offCanvas__contact'>
            <h4 className='title'>Get In Touch</h4>
            <ul className='offCanvas__contact-list list-wrap'>
              <li>
                <i className='fas fa-envelope-open' />
                <Link href='/mailto:info@threadjuice.com'>
                  info@threadjuice.com
                </Link>
              </li>
              <li>
                <i className='fas fa-map-marker-alt' /> Creating viral content
                everywhere
              </li>
            </ul>
            <ul className='offCanvas__social list-wrap'>
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
                  <i className='fab fa-youtube' />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='offCanvas__overlay' onClick={handleSidebarClose} />
    </>
  );
}
