'use client';

import Link from 'next/link';

interface BreadcrumbProps {
  breadcrumbCategory?: string;
  breadcrumbPostTitle?: string;
}

export default function Breadcrumb({
  breadcrumbCategory,
  breadcrumbPostTitle,
}: BreadcrumbProps) {
  return (
    <section className='breadcrumb-area'>
      <div className='container'>
        <div className='row'>
          <div className='col-12'>
            <div className='breadcrumb-content'>
              <nav aria-label='breadcrumb'>
                <ol className='breadcrumb'>
                  <li className='breadcrumb-item'>
                    <Link href='/'>Home</Link>
                  </li>
                  {breadcrumbCategory && (
                    <li className='breadcrumb-item'>
                      <Link
                        href={`/category/${breadcrumbCategory.toLowerCase()}`}
                      >
                        {breadcrumbCategory}
                      </Link>
                    </li>
                  )}
                  {breadcrumbPostTitle && (
                    <li className='breadcrumb-item active' aria-current='page'>
                      {breadcrumbPostTitle}
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
}
