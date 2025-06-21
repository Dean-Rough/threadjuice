import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPersonas } from '@/data/personas';
import Image from 'next/image';
import {
  Brain,
  Zap,
  Target,
  Users,
  Globe,
  TrendingUp,
  Quote,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ThreadJuice | AI-Powered Reddit Content Engine',
  description:
    'Learn how ThreadJuice transforms viral Reddit threads into engaging stories using AI personas. Discover our mission to make viral content accessible and entertaining.',
  openGraph: {
    title: 'About ThreadJuice | AI-Powered Reddit Content Engine',
    description:
      'Learn how ThreadJuice transforms viral Reddit threads into engaging stories using AI personas.',
    type: 'website',
  },
  keywords:
    'ThreadJuice, AI content, Reddit, viral threads, content transformation, AI personas',
};

export default function AboutPage() {
  const personas = getAllPersonas();

  return (
    <>
      {/* Hero Section - Minimal Layout 5 */}
      <section className='about-hero-area pt-100 pb-80'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-8 text-center'>
              <div className='about-hero-content'>
                <h1 className='hero-title mb-20'>
                  Transforming Reddit into
                  <span className='text-primary'> Engaging Stories</span>
                </h1>
                <p className='hero-description mb-30 fs-5 text-muted'>
                  ThreadJuice is an AI-powered content engine that discovers
                  viral Reddit threads and transforms them into compelling,
                  shareable stories through our unique AI personas.
                </p>
                <div className='hero-stats'>
                  <div className='row text-center'>
                    <div className='col-md-4'>
                      <div className='stat-item'>
                        <h3 className='stat-number mb-5 text-primary'>10K+</h3>
                        <p className='stat-label mb-0 text-muted'>
                          Threads Processed
                        </p>
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='stat-item'>
                        <h3 className='stat-number mb-5 text-primary'>8</h3>
                        <p className='stat-label mb-0 text-muted'>
                          AI Personas
                        </p>
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <div className='stat-item'>
                        <h3 className='stat-number mb-5 text-primary'>95%</h3>
                        <p className='stat-label mb-0 text-muted'>
                          Accuracy Rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        className='mission-area pb-60 pt-60'
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-6'>
              <div className='mission-content'>
                <h2 className='section-title mb-20'>Our Mission</h2>
                <p className='mb-20 text-muted'>
                  Reddit is a goldmine of fascinating stories, debates, and
                  insights. But with millions of posts daily, the best content
                  often gets buried. ThreadJuice solves this by using advanced
                  AI to identify, curate, and transform viral threads into
                  accessible, engaging narratives.
                </p>
                <p className='mb-30 text-muted'>
                  Our AI personas don&apos;t just summarize content—they analyze
                  context, capture nuance, and present stories in distinct
                  voices that make complex threads digestible and entertaining.
                </p>
                <div className='mission-features'>
                  <div className='feature-item d-flex align-items-center mb-15'>
                    <Brain size={20} className='me-3 text-primary' />
                    <span>AI-powered content analysis and transformation</span>
                  </div>
                  <div className='feature-item d-flex align-items-center mb-15'>
                    <Target size={20} className='me-3 text-primary' />
                    <span>Curated selection of truly viral content</span>
                  </div>
                  <div className='feature-item d-flex align-items-center mb-15'>
                    <Zap size={20} className='me-3 text-primary' />
                    <span>Real-time processing and publication</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-6'>
              <div className='mission-image text-center'>
                <div className='rounded-4 bg-primary bg-opacity-10 p-5'>
                  <Globe size={120} className='mb-20 text-primary' />
                  <h4 className='mb-10'>Making Viral Content Accessible</h4>
                  <p className='mb-0 text-muted'>
                    Bridging the gap between Reddit&apos;s raw discussions and
                    mainstream content consumption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='how-it-works-area pb-60 pt-80'>
        <div className='container'>
          <div className='row justify-content-center mb-50'>
            <div className='col-lg-8 text-center'>
              <h2 className='section-title mb-15'>How ThreadJuice Works</h2>
              <p className='text-muted'>
                Our sophisticated AI pipeline transforms Reddit threads into
                engaging stories in four key steps
              </p>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-3 col-md-6 mb-30'>
              <div className='process-step text-center'>
                <div
                  className='step-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-20 bg-primary text-white'
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className='fw-bold'>1</span>
                </div>
                <h5 className='step-title mb-15'>Discovery</h5>
                <p className='step-description text-muted'>
                  Our AI monitors high-engagement subreddits, identifying
                  threads with viral potential based on upvote velocity, comment
                  engagement, and discussion quality.
                </p>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-30'>
              <div className='process-step text-center'>
                <div
                  className='step-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-20 bg-primary text-white'
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className='fw-bold'>2</span>
                </div>
                <h5 className='step-title mb-15'>Analysis</h5>
                <p className='step-description text-muted'>
                  Advanced natural language processing analyzes thread context,
                  key participants, narrative arc, and emotional tone to
                  understand the full story.
                </p>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-30'>
              <div className='process-step text-center'>
                <div
                  className='step-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-20 bg-primary text-white'
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className='fw-bold'>3</span>
                </div>
                <h5 className='step-title mb-15'>Transformation</h5>
                <p className='step-description text-muted'>
                  Our AI personas craft engaging narratives, maintaining the
                  original thread&apos;s essence while making it accessible to
                  broader audiences.
                </p>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-30'>
              <div className='process-step text-center'>
                <div
                  className='step-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-20 bg-primary text-white'
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className='fw-bold'>4</span>
                </div>
                <h5 className='step-title mb-15'>Publication</h5>
                <p className='step-description text-muted'>
                  Stories are published with proper attribution, source links,
                  and optimized for social sharing across multiple platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Personas Section */}
      <section
        className='personas-showcase-area pb-80 pt-60'
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className='container'>
          <div className='row justify-content-center mb-50'>
            <div className='col-lg-8 text-center'>
              <h2 className='section-title mb-15'>Meet Our AI Personas</h2>
              <p className='text-muted'>
                Each persona brings a unique voice and perspective to content
                transformation
              </p>
            </div>
          </div>

          <div className='row'>
            {personas.slice(0, 6).map(persona => (
              <div key={persona.id} className='col-lg-4 col-md-6 mb-30'>
                <div className='persona-showcase-card h-100 rounded border bg-white p-4'>
                  <div className='persona-header mb-20 text-center'>
                    <Image
                      src={persona.avatar}
                      alt={persona.name}
                      className='rounded-circle mb-15'
                      width={60}
                      height={60}
                    />
                    <h5 className='persona-name mb-5'>{persona.name}</h5>
                    <span className='badge bg-primary bg-opacity-10 text-primary'>
                      {persona.specialty}
                    </span>
                  </div>
                  <div className='persona-quote mb-15'>
                    <Quote size={20} className='mb-10 text-primary' />
                    <p className='fst-italic mb-0 text-muted'>
                      &quot;{persona.sampleQuote}&quot;
                    </p>
                  </div>
                  <p className='persona-description small text-muted'>
                    {persona.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-30 text-center'>
            <Link href='/personas' className='btn btn-primary'>
              Meet All Personas
              <ArrowRight size={16} className='ms-2' />
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className='values-area pb-60 pt-80'>
        <div className='container'>
          <div className='row justify-content-center mb-50'>
            <div className='col-lg-8 text-center'>
              <h2 className='section-title mb-15'>Our Values</h2>
              <p className='text-muted'>
                The principles that guide how we approach content creation and
                community respect
              </p>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-4 col-md-6 mb-30'>
              <div className='value-item text-center'>
                <Users size={48} className='mb-20 text-primary' />
                <h5 className='value-title mb-15'>Community First</h5>
                <p className='value-description text-muted'>
                  We always credit original Reddit authors and link back to
                  source threads, ensuring the community gets recognition for
                  their contributions.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6 mb-30'>
              <div className='value-item text-center'>
                <Target size={48} className='mb-20 text-primary' />
                <h5 className='value-title mb-15'>Accuracy & Context</h5>
                <p className='value-description text-muted'>
                  Our AI preserves the original intent and context of
                  discussions, never misrepresenting opinions or creating
                  misleading narratives.
                </p>
              </div>
            </div>
            <div className='col-lg-4 col-md-6 mb-30'>
              <div className='value-item text-center'>
                <TrendingUp size={48} className='mb-20 text-primary' />
                <h5 className='value-title mb-15'>Quality Over Quantity</h5>
                <p className='value-description text-muted'>
                  We curate only the most engaging, insightful, and truly viral
                  content, maintaining high standards for what deserves
                  transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='cta-area pb-80 pt-60'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-8 text-center'>
              <div className='cta-content rounded-4 bg-primary p-5 text-white'>
                <h3 className='cta-title mb-15 text-white'>
                  Ready to Experience Viral Content Differently?
                </h3>
                <p className='cta-description text-white-50 mb-25'>
                  Join thousands of readers who discover the best of Reddit
                  through our AI-crafted stories.
                </p>
                <div className='cta-actions'>
                  <Link href='/' className='btn btn-light me-3'>
                    Explore Stories
                  </Link>
                  <Link href='/newsletter' className='btn btn-outline-light'>
                    Subscribe to Updates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
