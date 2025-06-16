'use client';

import React from 'react';
import { getPersonaById } from '@/data/personas';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PersonaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PersonaDetailPage({ params }: PersonaDetailPageProps) {
  // Since this is a client component, we need to handle the Promise differently
  const [id, setId] = React.useState<string | null>(null);
  const [persona, setPersona] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    params.then(p => {
      setId(p.id);
      const foundPersona = getPersonaById(p.id);
      setPersona(foundPersona);
      setLoading(false);
      if (!foundPersona) {
        notFound();
      }
    });
  }, [params]);

  if (loading || !id || !persona) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-12'>
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/'>Home</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/personas'>Personas</Link>
              </li>
              <li className='breadcrumb-item active'>{persona.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-8 col-md-12'>
          <div className='persona-detail-card rounded border p-5'>
            <div className='persona-header d-flex align-items-center mb-4'>
              <div className='persona-avatar me-4'>
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className='rounded-circle'
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                  }}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/img/blog/blog01.jpg'; // Fallback image
                  }}
                />
              </div>
              <div>
                <h1 className='persona-name mb-2'>{persona.name}</h1>
                <span className={`badge badge-${persona.tone} mb-2 me-2`}>
                  {persona.tone}
                </span>
                <p className='persona-bio lead'>{persona.bio}</p>
              </div>
            </div>

            <div className='persona-specialties mb-4'>
              <h5>Specialties</h5>
              <div className='mt-2'>
                {persona.specialties.map((specialty: string, index: number) => (
                  <span key={index} className='badge badge-outline mb-2 me-2'>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className='persona-style mb-4'>
              <h5>Writing Style Guide</h5>
              <div className='style-prompt-box bg-light rounded p-3'>
                <p className='mb-0'>{persona.stylePrompt}</p>
              </div>
            </div>

            <div className='sample-content'>
              <h5>Sample Content by {persona.name}</h5>
              <div className='sample-box border-start border-primary p-3'>
                <p className='fst-italic text-muted mb-2'>
                  &quot;Coming soon: See how {persona.name} transforms Reddit
                  threads into viral content...&quot;
                </p>
                <small className='text-muted'>
                  Sample content will be generated once the GPT content pipeline
                  is implemented
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className='col-lg-4 col-md-12'>
          <div className='sidebar-content'>
            <div className='widget mb-4'>
              <h6 className='widget-title'>Quick Stats</h6>
              <div className='stats-list'>
                <div className='stat-item d-flex justify-content-between mb-2'>
                  <span>Tone:</span>
                  <span className='fw-bold'>{persona.tone}</span>
                </div>
                <div className='stat-item d-flex justify-content-between mb-2'>
                  <span>Specialties:</span>
                  <span className='fw-bold'>{persona.specialties.length}</span>
                </div>
                <div className='stat-item d-flex justify-content-between mb-2'>
                  <span>Style:</span>
                  <span className='fw-bold'>Satirical</span>
                </div>
              </div>
            </div>

            <div className='widget'>
              <h6 className='widget-title'>Other Personas</h6>
              <Link href='/personas' className='btn btn-outline-primary w-100'>
                View All Personas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
