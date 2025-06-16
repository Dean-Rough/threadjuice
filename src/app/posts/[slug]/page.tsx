import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ThreadJuiceLayout from '@/components/layout/ThreadJuiceLayout';
import PostDetail from '@/components/features/PostDetail';
import { mockPosts } from '@/data/mockPosts';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = mockPosts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = mockPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <ThreadJuiceLayout>
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
    </ThreadJuiceLayout>
  );
}
