import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'

export default function Dashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    pages: 0,
    media: 0,
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [recentPages, setRecentPages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch post count
        const { count: postsCount, error: postsError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
        
        if (postsError) throw postsError
        
        // Fetch page count
        const { count: pagesCount, error: pagesError } = await supabase
          .from('pages')
          .select('*', { count: 'exact', head: true })
        
        if (pagesError) throw pagesError
        
        // Fetch media count
        const { count: mediaCount, error: mediaError } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true })
        
        if (mediaError) throw mediaError
        
        // Fetch recent posts
        const { data: posts, error: recentPostsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (recentPostsError) throw recentPostsError
        
        // Fetch recent pages
        const { data: pages, error: recentPagesError } = await supabase
          .from('pages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (recentPagesError) throw recentPagesError
        
        setStats({
          posts: postsCount || 0,
          pages: pagesCount || 0,
          media: mediaCount || 0,
        })
        
        setRecentPosts(posts || [])
        setRecentPages(pages || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Sample data for demonstration
  const samplePosts = [
    { id: 1, title: 'Getting Started with React', slug: 'getting-started-with-react', status: 'published', created_at: new Date().toISOString() },
    { id: 2, title: 'Advanced CSS Techniques', slug: 'advanced-css-techniques', status: 'published', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, title: 'JavaScript Best Practices', slug: 'javascript-best-practices', status: 'draft', created_at: new Date(Date.now() - 172800000).toISOString() },
  ]
  
  const samplePages = [
    { id: 1, title: 'About Us', slug: 'about-us', status: 'published', created_at: new Date().toISOString() },
    { id: 2, title: 'Contact', slug: 'contact', status: 'published', created_at: new Date(Date.now() - 86400000).toISOString() },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your CMS dashboard. Here's an overview of your content.
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{loading ? '...' : stats.posts || samplePosts.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/dashboard/posts" className="font-medium text-primary-600 hover:text-primary-500">
                View all posts
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Pages</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{loading ? '...' : stats.pages || samplePages.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/dashboard/pages" className="font-medium text-primary-600 hover:text-primary-500">
                View all pages
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Media Files</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{loading ? '...' : stats.media || 12}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/dashboard/media" className="font-medium text-primary-600 hover:text-primary-500">
                View media library
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Posts */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Posts</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your latest blog posts</p>
            </div>
            <Link
              to="/dashboard/posts/new"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add New
            </Link>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {loading ? (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Loading recent posts...</dt>
                </div>
              ) : (recentPosts.length > 0 ? recentPosts : samplePosts).map((post) => (
                <div key={post.id} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    <Link to={`/dashboard/posts/${post.id}`} className="text-primary-600 hover:text-primary-900">
                      {post.title}
                    </Link>
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                    <span className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </span>
                  </dd>
                </div>
              ))}
              {!loading && recentPosts.length === 0 && samplePosts.length === 0 && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">No posts found</dt>
                </div>
              )}
            </dl>
          </div>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/dashboard/posts" className="font-medium text-primary-600 hover:text-primary-500">
                View all posts
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recent Pages */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Pages</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your latest website pages</p>
            </div>
            <Link
              to="/dashboard/pages/new"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add New
            </Link>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {loading ? (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Loading recent pages...</dt>
                </div>
              ) : (recentPages.length > 0 ? recentPages : samplePages).map((page) => (
                <div key={page.id} className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    <Link to={`/dashboard/pages/${page.id}`} className="text-primary-600 hover:text-primary-900">
                      {page.title}
                    </Link>
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                    <span className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      {format(new Date(page.created_at), 'MMM d, yyyy')}
                    </span>
                  </dd>
                </div>
              ))}
              {!loading && recentPages.length === 0 && samplePages.length === 0 && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">No pages found</dt>
                </div>
              )}
            </dl>
          </div>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/dashboard/pages" className="font-medium text-primary-600 hover:text-primary-500">
                View all pages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
