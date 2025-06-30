import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import PostDetail from '@/components/features/PostDetail';
import { getSupabaseClient } from '@/lib/database';
import { generateSEOData, generateMetaTags } from '@/lib/seo/auto-seo';
import { optimizeForAISearch } from '@/lib/seo/ai-search-optimization';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: post, error } = await getSupabaseClient()
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    return {
      title: 'Post Not Found | ThreadJuice',
      description: 'The requested story could not be found.'
    };
  }

  // Generate SEO data
  const seoData = generateSEOData(post);
  
  // Generate meta tags
  const metaTags = generateMetaTags(seoData, post);
  
  return metaTags;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const { data: post, error } = await getSupabaseClient()
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Generate SEO and AI search data
  const seoData = generateSEOData(post);
  const aiSearchData = await optimizeForAISearch(post);

  // Track view
  await getSupabaseClient()
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id);

  return (
    <>
      {/* Structured Data for SEO and AI Search */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            seoData.jsonLd,
            ...aiSearchData.structuredData
          ])
        }}
      />
      {/* Breadcrumb Navigation */}
      <section
        className='breadcrumb-area pb-20 pt-20'
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className='container'>
          <nav aria-label='breadcrumb'>
            <ol className='breadcrumb mb-0'>
              <li className='breadcrumb-item'>
                <Link href='/' className='text-decoration-none'>
                  Home
                </Link>
              </li>
              <li className='breadcrumb-item'>
                <Link
                  href={`/category/${post.category.toLowerCase()}`}
                  className='text-decoration-none'
                >
                  {post.category}
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                {post.title.length > 50
                  ? `${post.title.substring(0, 50)}...`
                  : post.title}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Article Content - Sarsa Layout 3 */}
      <section className='post-details-area'>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col-lg-8'>
              <PostDetail postId={post.id} />
            </div>
            <div className='col-lg-4'>
              {/* Sidebar can go here if needed */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
