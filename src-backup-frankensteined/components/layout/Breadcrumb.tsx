'use client';

import Link from 'next/link';

interface BreadcrumbProps {
  breadcrumbCategory?: string;
  breadcrumbPostTitle?: string;
  subreddit?: string;
  persona?: string;
  customPath?: Array<{ label: string; href: string }>;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  breadcrumbCategory,
  breadcrumbPostTitle,
  subreddit,
  persona,
  customPath,
}) => {
  return (
    <section className='breadcrumb-area'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='breadcrumb-content'>
              <nav aria-label='breadcrumb'>
                <ol className='breadcrumb'>
                  <li className='breadcrumb-item'>
                    <Link href='/'>
                      <i className='fas fa-home'></i>
                      Home
                    </Link>
                  </li>

                  {/* Custom path takes precedence */}
                  {customPath ? (
                    customPath.map((item, index) => (
                      <li key={index} className='breadcrumb-item'>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))
                  ) : (
                    <>
                      {/* Subreddit navigation (for Reddit content) */}
                      {subreddit && (
                        <li className='breadcrumb-item'>
                          <Link href={`/r/${subreddit}`}>
                            <i className='fab fa-reddit'></i>
                            r/{subreddit}
                          </Link>
                        </li>
                      )}

                      {/* Category navigation */}
                      {breadcrumbCategory && (
                        <li className='breadcrumb-item'>
                          <Link
                            href={`/category/${breadcrumbCategory.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {breadcrumbCategory}
                          </Link>
                        </li>
                      )}

                      {/* Persona/Author navigation */}
                      {persona && (
                        <li className='breadcrumb-item'>
                          <Link
                            href={`/author/${persona.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <i className='fas fa-user'></i>
                            {persona}
                          </Link>
                        </li>
                      )}
                    </>
                  )}

                  {/* Current page (post title) */}
                  {breadcrumbPostTitle && (
                    <li className='breadcrumb-item active' aria-current='page'>
                      {breadcrumbPostTitle.length > 60
                        ? `${breadcrumbPostTitle.substring(0, 60)}...`
                        : breadcrumbPostTitle}
                    </li>
                  )}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;
