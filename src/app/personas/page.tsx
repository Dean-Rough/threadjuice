'use client';

import { writerPersonas } from '@/data/personas';
import Link from 'next/link';

export default function PersonasPage() {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-12'>
          <div className='section__title-wrap text-center mb-4'>
            <h2 className='section__title'>Our Writer Personas</h2>
            <p className='section__sub-title'>
              Meet the satirical voices behind ThreadJuice's viral content transformation
            </p>
          </div>
        </div>
      </div>
      
      <div className='row'>
        {writerPersonas.map((persona) => (
          <div key={persona.id} className='col-lg-6 col-md-6 mb-4'>
            <div className='persona-card p-4 border rounded'>
              <div className='persona-header d-flex align-items-center mb-3'>
                <div className='persona-avatar me-3'>
                  <img 
                    src={persona.avatar}
                    alt={persona.name}
                    className='rounded-circle'
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/img/blog/blog01.jpg'; // Fallback image
                    }}
                  />
                </div>
                <div>
                  <h4 className='persona-name mb-1'>{persona.name}</h4>
                  <span className={`badge badge-${persona.tone} mb-2`}>
                    {persona.tone}
                  </span>
                </div>
              </div>
              
              <p className='persona-bio mb-3'>{persona.bio}</p>
              
              <div className='persona-specialties mb-3'>
                <small className='text-muted'>Specialties:</small>
                <div className='mt-1'>
                  {persona.specialties.map((specialty, index) => (
                    <span key={index} className='badge badge-outline me-1'>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link 
                href={`/personas/${persona.id}`}
                className='btn btn-outline-primary btn-sm'
              >
                View Writing Style
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className='row mt-5'>
        <div className='col-12 text-center'>
          <div className='persona-info-box p-4 bg-light rounded'>
            <h5>How It Works</h5>
            <p className='mb-0'>
              Each Reddit thread gets randomly assigned to one of these eight personas, 
              who transform raw Reddit content into engaging satirical stories with their unique voice and perspective.
              No two stories sound the same.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}