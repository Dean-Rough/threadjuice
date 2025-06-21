'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Heart,
  Filter,
} from 'lucide-react';
import { getAllPosts, getPostsByPersona } from '@/data/mockPosts';
import { getAllPersonas } from '@/data/personas';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoaded && !isSignedIn) {
    redirect('/sign-in');
  }

  if (!isLoaded) {
    return (
      <>
        <div className='container py-5'>
          <div className='text-center'>
            <div className='spinner-border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  const posts = getAllPosts();
  const personas = getAllPersonas();

  // Calculate dashboard stats
  const totalPosts = posts.length;
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalEngagement = posts.reduce(
    (sum, post) => sum + post.redditMetrics.upvotes,
    0
  );
  const avgEngagementRate = (
    posts.reduce((sum, post) => sum + post.redditMetrics.engagementRate, 0) /
    posts.length
  ).toFixed(1);

  // Recent posts
  const recentPosts = posts
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 5);

  // Top performing posts
  const topPosts = posts.sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <>
      {/* Dashboard Header - Sarsa Layout 4 */}
      <section
        className='dashboard-header-area pb-30 pt-40'
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-lg-8'>
              <div className='dashboard-header-content'>
                <h1 className='dashboard-title mb-10'>
                  Welcome back, {user?.firstName || 'Admin'}
                </h1>
                <p className='dashboard-subtitle mb-0 text-muted'>
                  Manage your viral Reddit content and track performance metrics
                </p>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='dashboard-actions text-lg-end'>
                <button className='btn btn-primary me-2'>
                  <Plus size={16} className='me-2' />
                  New Post
                </button>
                <button className='btn btn-outline-secondary'>
                  <Settings size={16} className='me-2' />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Navigation */}
      <section className='dashboard-nav-area'>
        <div className='container'>
          <div className='dashboard-nav-tabs'>
            <nav className='nav nav-tabs border-0'>
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 size={16} className='me-2' />
                Overview
              </button>
              <button
                className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                <FileText size={16} className='me-2' />
                Posts
              </button>
              <button
                className={`nav-link ${activeTab === 'personas' ? 'active' : ''}`}
                onClick={() => setActiveTab('personas')}
              >
                <Users size={16} className='me-2' />
                Personas
              </button>
              <button
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <TrendingUp size={16} className='me-2' />
                Analytics
              </button>
            </nav>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className='dashboard-content-area pb-80 pt-40'>
        <div className='container'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className='row mb-40'>
                <div className='col-lg-3 col-sm-6 mb-30'>
                  <div className='stats-card rounded border bg-white p-4'>
                    <div className='d-flex align-items-center'>
                      <div className='stats-icon me-3 rounded bg-primary bg-opacity-10 p-3'>
                        <FileText size={24} className='text-primary' />
                      </div>
                      <div className='stats-content'>
                        <h3 className='stats-number mb-0'>{totalPosts}</h3>
                        <p className='stats-label mb-0 text-muted'>
                          Total Posts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-lg-3 col-sm-6 mb-30'>
                  <div className='stats-card rounded border bg-white p-4'>
                    <div className='d-flex align-items-center'>
                      <div className='stats-icon bg-success me-3 rounded bg-opacity-10 p-3'>
                        <Eye size={24} className='text-success' />
                      </div>
                      <div className='stats-content'>
                        <h3 className='stats-number mb-0'>
                          {totalViews.toLocaleString()}
                        </h3>
                        <p className='stats-label mb-0 text-muted'>
                          Total Views
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-lg-3 col-sm-6 mb-30'>
                  <div className='stats-card rounded border bg-white p-4'>
                    <div className='d-flex align-items-center'>
                      <div className='stats-icon bg-warning me-3 rounded bg-opacity-10 p-3'>
                        <Heart size={24} className='text-warning' />
                      </div>
                      <div className='stats-content'>
                        <h3 className='stats-number mb-0'>
                          {totalEngagement.toLocaleString()}
                        </h3>
                        <p className='stats-label mb-0 text-muted'>
                          Total Upvotes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-lg-3 col-sm-6 mb-30'>
                  <div className='stats-card rounded border bg-white p-4'>
                    <div className='d-flex align-items-center'>
                      <div className='stats-icon bg-info me-3 rounded bg-opacity-10 p-3'>
                        <TrendingUp size={24} className='text-info' />
                      </div>
                      <div className='stats-content'>
                        <h3 className='stats-number mb-0'>
                          {avgEngagementRate}%
                        </h3>
                        <p className='stats-label mb-0 text-muted'>
                          Avg Engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='row'>
                <div className='col-lg-8'>
                  <div className='dashboard-widget mb-30 rounded border bg-white p-4'>
                    <div className='widget-header d-flex justify-content-between align-items-center mb-20'>
                      <h4 className='widget-title mb-0'>Recent Posts</h4>
                      <a
                        href='/dashboard?tab=posts'
                        className='btn btn-sm btn-outline-primary'
                      >
                        View All
                      </a>
                    </div>
                    <div className='widget-content'>
                      {recentPosts.map(post => (
                        <div
                          key={post.id}
                          className='post-item d-flex align-items-center border-bottom py-3'
                        >
                          <div className='post-image me-3'>
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              width={60}
                              height={60}
                              className='rounded'
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className='post-content flex-grow-1'>
                            <h6 className='post-title mb-5'>
                              <a
                                href={`/posts/${post.slug}`}
                                className='text-decoration-none text-dark'
                              >
                                {post.title.length > 60
                                  ? `${post.title.substring(0, 60)}...`
                                  : post.title}
                              </a>
                            </h6>
                            <div className='post-meta small text-muted'>
                              <span>{post.persona.name}</span>
                              <span className='mx-2'>•</span>
                              <span>
                                {new Date(
                                  post.publishedAt
                                ).toLocaleDateString()}
                              </span>
                              <span className='mx-2'>•</span>
                              <span>{post.views.toLocaleString()} views</span>
                            </div>
                          </div>
                          <div className='post-actions'>
                            <div className='dropdown'>
                              <button
                                className='btn btn-sm btn-outline-secondary dropdown-toggle'
                                data-bs-toggle='dropdown'
                              >
                                Actions
                              </button>
                              <ul className='dropdown-menu'>
                                <li>
                                  <a
                                    className='dropdown-item'
                                    href={`/posts/${post.slug}`}
                                  >
                                    View
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className='dropdown-item'
                                    href={`/admin/posts/${post.id}/edit`}
                                  >
                                    Edit
                                  </a>
                                </li>
                                <li>
                                  <hr className='dropdown-divider' />
                                </li>
                                <li>
                                  <a
                                    className='dropdown-item text-danger'
                                    href='#'
                                  >
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='col-lg-4'>
                  <div className='dashboard-widget mb-30 rounded border bg-white p-4'>
                    <div className='widget-header mb-20'>
                      <h4 className='widget-title mb-0'>Top Performing</h4>
                    </div>
                    <div className='widget-content'>
                      {topPosts.map((post, index) => (
                        <div
                          key={post.id}
                          className='top-post-item d-flex align-items-center mb-15'
                        >
                          <div className='rank-number me-3'>
                            <span className='badge bg-primary'>
                              {index + 1}
                            </span>
                          </div>
                          <div className='post-info'>
                            <h6 className='post-title mb-5'>
                              <a
                                href={`/posts/${post.slug}`}
                                className='text-decoration-none text-dark'
                              >
                                {post.title.length > 40
                                  ? `${post.title.substring(0, 40)}...`
                                  : post.title}
                              </a>
                            </h6>
                            <div className='post-stats small text-muted'>
                              <span>{post.views.toLocaleString()} views</span>
                              <span className='mx-2'>•</span>
                              <span>
                                {post.redditMetrics.upvotes.toLocaleString()}{' '}
                                upvotes
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className='posts-management'>
              <div className='posts-header d-flex justify-content-between align-items-center mb-30'>
                <h3>Manage Posts</h3>
                <div className='posts-actions'>
                  <button className='btn btn-outline-secondary me-2'>
                    <Filter size={16} className='me-2' />
                    Filter
                  </button>
                  <button className='btn btn-primary'>
                    <Plus size={16} className='me-2' />
                    New Post
                  </button>
                </div>
              </div>

              <div className='posts-table rounded border bg-white'>
                <div className='table-responsive'>
                  <table className='table-hover mb-0 table'>
                    <thead className='bg-light'>
                      <tr>
                        <th>Title</th>
                        <th>Persona</th>
                        <th>Category</th>
                        <th>Views</th>
                        <th>Upvotes</th>
                        <th>Published</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.slice(0, 10).map(post => (
                        <tr key={post.id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Image
                                src={post.featuredImage}
                                alt={post.title}
                                width={40}
                                height={40}
                                className='me-3 rounded'
                                style={{ objectFit: 'cover' }}
                              />
                              <div>
                                <h6 className='mb-0'>
                                  {post.title.length > 50
                                    ? `${post.title.substring(0, 50)}...`
                                    : post.title}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>{post.persona.name}</td>
                          <td>
                            <span className='badge bg-light text-dark'>
                              {post.category}
                            </span>
                          </td>
                          <td>{post.views.toLocaleString()}</td>
                          <td>{post.redditMetrics.upvotes.toLocaleString()}</td>
                          <td>
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className='dropdown'>
                              <button
                                className='btn btn-sm btn-outline-secondary dropdown-toggle'
                                data-bs-toggle='dropdown'
                              >
                                Actions
                              </button>
                              <ul className='dropdown-menu'>
                                <li>
                                  <a
                                    className='dropdown-item'
                                    href={`/posts/${post.slug}`}
                                  >
                                    View
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className='dropdown-item'
                                    href={`/admin/posts/${post.id}/edit`}
                                  >
                                    Edit
                                  </a>
                                </li>
                                <li>
                                  <hr className='dropdown-divider' />
                                </li>
                                <li>
                                  <a
                                    className='dropdown-item text-danger'
                                    href='#'
                                  >
                                    Delete
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Personas Tab */}
          {activeTab === 'personas' && (
            <div className='personas-management'>
              <div className='personas-header d-flex justify-content-between align-items-center mb-30'>
                <h3>AI Writing Personas</h3>
                <button className='btn btn-primary'>
                  <Plus size={16} className='me-2' />
                  New Persona
                </button>
              </div>

              <div className='row'>
                {personas.map(persona => {
                  const personaPosts = getPostsByPersona(persona.id);
                  return (
                    <div key={persona.id} className='col-lg-4 col-md-6 mb-30'>
                      <div className='persona-card h-100 rounded border bg-white p-4'>
                        <div className='persona-header mb-20 text-center'>
                          <Image
                            src={persona.avatar}
                            alt={persona.name}
                            width={80}
                            height={80}
                            className='rounded-circle mb-15'
                          />
                          <h5 className='persona-name mb-5'>{persona.name}</h5>
                          <span className='badge bg-primary'>
                            {persona.specialty}
                          </span>
                        </div>
                        <div className='persona-stats mb-20'>
                          <div className='row text-center'>
                            <div className='col-6'>
                              <div className='stat-item'>
                                <h6 className='stat-number mb-0'>
                                  {personaPosts.length}
                                </h6>
                                <small className='text-muted'>Posts</small>
                              </div>
                            </div>
                            <div className='col-6'>
                              <div className='stat-item'>
                                <h6 className='stat-number mb-0'>
                                  {personaPosts
                                    .reduce((sum, post) => sum + post.views, 0)
                                    .toLocaleString()}
                                </h6>
                                <small className='text-muted'>Views</small>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className='persona-bio small mb-20 text-muted'>
                          {persona.bio}
                        </p>
                        <div className='persona-actions'>
                          <button className='btn btn-outline-primary btn-sm me-2'>
                            Edit
                          </button>
                          <button className='btn btn-outline-secondary btn-sm'>
                            View Posts
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className='analytics-dashboard'>
              <h3 className='mb-30'>Analytics Overview</h3>

              <div className='row'>
                <div className='col-12'>
                  <div className='analytics-placeholder rounded border bg-white p-5 text-center'>
                    <BarChart3 size={64} className='mb-20 text-muted' />
                    <h4>Analytics Dashboard</h4>
                    <p className='text-muted'>
                      Detailed analytics and reporting features will be
                      implemented in Phase 4. This will include traffic
                      analysis, engagement metrics, and performance tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
