'use client';

import { getPersonaById } from '@/data/personas';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PersonaDetailPageProps {
  params: {
    id: string;
  };
}

export default function PersonaDetailPage({ params }: PersonaDetailPageProps) {
  const persona = getPersonaById(params.id);
  
  if (!persona) {
    notFound();
  }
  
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-12'>
          <nav aria-label="breadcrumb" className='mb-4'>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/personas">Personas</Link>
              </li>
              <li className="breadcrumb-item active">{persona.name}</li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className='row'>
        <div className='col-lg-8 col-md-12'>
          <div className='persona-detail-card p-5 border rounded'>
            <div className='persona-header d-flex align-items-center mb-4'>
              <div className='persona-avatar me-4'>
                <img 
                  src={persona.avatar}
                  alt={persona.name}
                  className='rounded-circle'
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  onError={(e) => {
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
                {persona.specialties.map((specialty, index) => (
                  <span key={index} className='badge badge-outline me-2 mb-2'>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            
            <div className='persona-style mb-4'>
              <h5>Writing Style Guide</h5>
              <div className='style-prompt-box p-3 bg-light rounded'>
                <p className='mb-0'>{persona.stylePrompt}</p>
              </div>
            </div>
            
            <div className='sample-content'>
              <h5>Sample Content by {persona.name}</h5>
              <div className='sample-box p-3 border-start border-primary'>
                <p className='fst-italic text-muted mb-2'>
                  "Coming soon: See how {persona.name} transforms Reddit threads into viral content..."
                </p>
                <small className='text-muted'>
                  Sample content will be generated once the GPT content pipeline is implemented
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