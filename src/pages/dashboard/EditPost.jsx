import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import slugify from 'slugify'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [slug, setSlug] = useState('')
  const [autoSlug, setAutoSlug] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm()
  
  const title = watch('title')
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        if (data) {
          setPost(data)
          setContent(data.content || '')
          setSlug(data.slug || '')
          
          // Set form values
          setValue('title', data.title)
          setValue('excerpt', data.excerpt)
          setValue('status', data.status)
          setValue('featured_image', data.featured_image)
          setValue('meta_title', data.meta_title)
          setValue('meta_description', data.meta_description)
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchPost()
    }
  }, [id, setValue])
  
  useEffect(() => {
    if (autoSlug && title) {
      const generatedSlug = slugify(title, { lower: true, strict: true })
      setSlug(generatedSlug)
    }
  }, [title, autoSlug])
  
  const handleSlugChange = (e) => {
    setAutoSlug(false)
    setSlug(e.target.value)
  }
  
  const onSubmit = async (data) => {
    try {
      setSaving(true)
      setError(null)
      
      const postData = {
        ...data,
        content,
        slug,
        updated_at: new Date(),
      }
      
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', id)
      
      if (error) throw error
      
      navigate('/dashboard/posts')
    } catch (err) {
      console.error('Error updating post:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!post && !loading) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Post not found</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>The post you're looking for doesn't exist or you don't have permission to view it.</p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => navigate('/dashboard/posts')}
            >
              Go back to posts
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => navigate('/dashboard/posts')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div className="mt-1 flex items-center">
                  <input
                    id="auto-slug"
                    name="auto-slug"
                    type="checkbox"
                    checked={autoSlug}
                    onChange={() => setAutoSlug(!autoSlug)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-slug" className="ml-2 block text-sm text-gray-500">
                    Auto-generate from title
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt
                </label>
                <div className="mt-1">
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    {...register('excerpt')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  A short summary of your post. If left empty, it will be generated from the content.
                </p>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="mt-1">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-64 sm:h-96"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
                  Featured Image URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="featured_image"
                    id="featured_image"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                    {...register('featured_image')}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('status')}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">SEO Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Optimize your post for search engines.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="meta_title"
                    id="meta_title"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('meta_title')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Leave blank to use the post title.
                </p>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    {...register('meta_description')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Leave blank to use the post excerpt.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => navigate('/dashboard/posts')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
