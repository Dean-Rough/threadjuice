import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TrendingFeed from '@/components/features/TrendingFeed';
import { getPostsByCategory, getAllCategories } from '@/data/mockPosts';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    view?: 'grid' | 'list' | 'masonry';
    sort?: 'newest' | 'popular' | 'trending';
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${categoryName} Posts | ThreadJuice`,
    description: `Discover viral Reddit threads in ${categoryName} transformed into engaging stories by our AI personas.`,
    openGraph: {
      title: `${categoryName} Posts | ThreadJuice`,
      description: `Discover viral Reddit threads in ${categoryName} transformed into engaging stories by our AI personas.`,
      type: 'website',
    },
    keywords: `${categoryName}, Reddit, viral threads, AI stories, ThreadJuice`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { view = 'grid', sort = 'newest', page = '1' } = await searchParams;

  const posts = getPostsByCategory(category);
  const allCategories = getAllCategories();

  if (posts.length === 0) {
    notFound();
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const currentPage = parseInt(page);
  const postsPerPage = 12;
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Sort posts based on sort parameter
  const sortedPosts = [...paginatedPosts].sort((a, b) => {
    switch (sort) {
      case 'popular':
        return (b.redditMetrics?.upvotes || 0) - (a.redditMetrics?.upvotes || 0);
      case 'trending':
        return (b.redditMetrics?.engagementRate || 0) - (a.redditMetrics?.engagementRate || 0);
      default: // newest
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }
  });

  return (
    <>
      {/* Category Header - Sarsa Layout 2 */}
      <section
        className='category-header-area pb-40 pt-60'
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className='container'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-30'>
            <ol className='breadcrumb mb-0'>
              <li className='breadcrumb-item'>
                <Link href='/' className='text-decoration-none'>
                  Home
                </Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/categories' className='text-decoration-none'>
                  Categories
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                {categoryName}
              </li>
            </ol>
          </nav>

          {/* Category Title & Description */}
          <div className='row align-items-center'>
            <div className='col-lg-8'>
              <div className='category-header-content'>
                <h1 className='category-title mb-15'>{categoryName} Stories</h1>
                <p className='category-description mb-20 text-muted'>
                  Viral Reddit threads in {categoryName.toLowerCase()}{' '}
                  transformed into engaging stories by our AI writing personas.
                  Stay updated with the latest discussions and trending topics.
                </p>
                <div className='category-stats'>
                  <span className='badge me-3 bg-primary'>
                    {posts.length} {posts.length === 1 ? 'Story' : 'Stories'}
                  </span>
                  <span className='small text-muted'>
                    Updated daily with fresh Reddit content
                  </span>
                </div>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='category-actions text-lg-end'>
                {/* Sort Options */}
                <div className='dropdown'>
                  <button
                    className='btn btn-outline-secondary dropdown-toggle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    Sort by {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                  <ul className='dropdown-menu'>
                    <li>
                      <a
                        className={`dropdown-item ${sort === 'newest' ? 'active' : ''}`}
                        href={`/category/${category}?view=${view}&sort=newest&page=1`}
                      >
                        Newest
                      </a>
                    </li>
                    <li>
                      <a
                        className={`dropdown-item ${sort === 'popular' ? 'active' : ''}`}
                        href={`/category/${category}?view=${view}&sort=popular&page=1`}
                      >
                        Most Popular
                      </a>
                    </li>
                    <li>
                      <a
                        className={`dropdown-item ${sort === 'trending' ? 'active' : ''}`}
                        href={`/category/${category}?view=${view}&sort=trending&page=1`}
                      >
                        Trending
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive Content - Sarsa Layout 2 */}
      <section className='category-archive-area pb-80 pt-40'>
        <div className='container'>
          <div className='row'>
            {/* Main Content */}
            <div className='col-lg-9'>
              {/* View Controls */}
              <div className='archive-controls mb-40'>
                <div className='row align-items-center'>
                  <div className='col-md-6'>
                    <div className='results-count'>
                      <span className='text-muted'>
                        Showing {startIndex + 1}-
                        {Math.min(endIndex, posts.length)} of {posts.length}{' '}
                        stories
                      </span>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='view-controls d-flex justify-content-md-end gap-2'>
                      <a
                        href={`/category/${category}?view=grid&sort=${sort}&page=${page}`}
                        className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      >
                        Grid
                      </a>
                      <a
                        href={`/category/${category}?view=list&sort=${sort}&page=${page}`}
                        className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      >
                        List
                      </a>
                      <a
                        href={`/category/${category}?view=masonry&sort=${sort}&page=${page}`}
                        className={`btn btn-sm ${view === 'masonry' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      >
                        Masonry
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              <TrendingFeed
                layout={view}
                showFilters={false}
                postsPerPage={postsPerPage}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='pagination-area mt-50'>
                  <nav aria-label='Posts pagination'>
                    <ul className='pagination justify-content-center'>
                      {/* Previous Page */}
                      <li
                        className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                      >
                        <a
                          className='page-link'
                          href={
                            currentPage > 1
                              ? `/category/${category}?view=${view}&sort=${sort}&page=${currentPage - 1}`
                              : '#'
                          }
                        >
                          Previous
                        </a>
                      </li>

                      {/* Page Numbers */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                            >
                              <a
                                className='page-link'
                                href={`/category/${category}?view=${view}&sort=${sort}&page=${pageNum}`}
                              >
                                {pageNum}
                              </a>
                            </li>
                          );
                        }
                      )}

                      {/* Next Page */}
                      <li
                        className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                      >
                        <a
                          className='page-link'
                          href={
                            currentPage < totalPages
                              ? `/category/${category}?view=${view}&sort=${sort}&page=${currentPage + 1}`
                              : '#'
                          }
                        >
                          Next
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='col-lg-3'>
              <div className='category-sidebar'>
                {/* Category Navigation */}
                <div className='sidebar-widget categories-widget mb-40'>
                  <div className='widget-header mb-20'>
                    <h4 className='widget-title'>Browse Categories</h4>
                  </div>
                  <div className='categories-list'>
                    {allCategories.map(cat => (
                      <a
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className={`category-item d-flex justify-content-between align-items-center text-decoration-none mb-10 rounded p-2 ${
                          cat.slug === category
                            ? 'bg-primary text-white'
                            : 'text-dark'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span
                          className={`badge ${cat.slug === category ? 'bg-white text-primary' : 'bg-light'}`}
                        >
                          {cat.count}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Trending in Category */}
                <div className='sidebar-widget trending-widget mb-40'>
                  <div className='widget-header mb-20'>
                    <h4 className='widget-title'>Trending in {categoryName}</h4>
                  </div>
                  <div className='trending-list'>
                    {posts
                      .sort(
                        (a, b) =>
                          (b.redditMetrics?.engagementRate || 0) -
                          (a.redditMetrics?.engagementRate || 0)
                      )
                      .slice(0, 5)
                      .map((post, index) => (
                        <div key={post.id} className='trending-item mb-15'>
                          <div className='d-flex'>
                            <div className='trending-number me-3'>
                              <span className='badge bg-primary'>
                                {index + 1}
                              </span>
                            </div>
                            <div className='trending-content'>
                              <h6 className='trending-title mb-5'>
                                <a
                                  href={`/posts/${post.slug}`}
                                  className='text-decoration-none text-dark'
                                >
                                  {post.title.length > 50
                                    ? `${post.title.substring(0, 50)}...`
                                    : post.title}
                                </a>
                              </h6>
                              <div className='trending-meta small text-muted'>
                                <span>
                                  {(post.redditMetrics?.upvotes || 0).toLocaleString()}{' '}
                                  upvotes
                                </span>
                                <span className='mx-2'>•</span>
                                <span>
                                  {post.redditMetrics?.engagementRate || 0}%
                                  engagement
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Newsletter Widget */}
                <div className='sidebar-widget newsletter-widget'>
                  <div className='newsletter-widget-content bg-dark rounded p-4 text-white'>
                    <h5 className='widget-title mb-15 text-white'>
                      Get {categoryName} Updates
                    </h5>
                    <p className='text-white-50 small mb-20'>
                      Never miss trending {categoryName.toLowerCase()} threads
                      from Reddit.
                    </p>
                    <form className='newsletter-form'>
                      <div className='mb-15'>
                        <input
                          type='email'
                          className='form-control'
                          placeholder='Your email'
                          required
                        />
                      </div>
                      <button
                        type='submit'
                        className='btn btn-primary btn-sm w-100'
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
