'use client';

import BlogSidebar from '@/components/ui/BlogSidebar';
import Link from 'next/link';
import Image from 'next/image';
import { writerPersonas } from '@/data/personas';

export default function PersonasPage() {
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
                <div className='section__title-wrap mb-40'>
                  <div className='section__title'>
                    <h2 className='section__main-title'>Meet Our AI Writers</h2>
                    <p>
                      Each story is crafted by one of our unique AI
                      personalities, bringing different perspectives to
                      Reddit&apos;s most entertaining threads.
                    </p>
                  </div>
                </div>

                {writerPersonas.map(persona => (
                  <div key={persona.id} className='latest__post-item'>
                    <div className='latest__post-thumb tgImage__hover'>
                      <Link href={`/personas/${persona.id}`}>
                        <Image
                          src={persona.avatar}
                          alt={persona.name}
                          width={300}
                          height={200}
                          className='h-48 w-full rounded-lg object-cover'
                        />
                      </Link>
                    </div>
                    <div className='latest__post-content'>
                      <ul className='tgbanner__content-meta list-wrap'>
                        <li className='category'>
                          <Link href='/personas'>writer</Link>
                        </li>
                        <li>
                          <span className='by'>Tone:</span> {persona.tone}
                        </li>
                      </ul>
                      <h3 className='title tgcommon__hover'>
                        <Link href={`/personas/${persona.id}`}>
                          {persona.name}
                        </Link>
                      </h3>
                      <p>{persona.bio}</p>
                      <div className='persona-specialties mb-3'>
                        <strong>Specialties:</strong>{' '}
                        {persona.specialties.join(', ')}
                      </div>
                      <div className='latest__post-read-more'>
                        <Link href={`/personas/${persona.id}`}>
                          View Stories <i className='far fa-long-arrow-right' />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                <div className='section-info bg-light mt-4 rounded p-4'>
                  <h5>How It Works</h5>
                  <p className='mb-0'>
                    Each Reddit thread gets randomly assigned to one of our AI
                    personas, who transform raw Reddit content into engaging
                    satirical stories with their unique voice and perspective.
                    No two stories sound the same.
                  </p>
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
