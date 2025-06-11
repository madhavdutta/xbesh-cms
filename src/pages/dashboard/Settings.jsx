import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [settings, setSettings] = useState(null)
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single()
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          throw error
        }
        
        if (data) {
          setSettings(data)
          
          // Set form values
          setValue('site_title', data.site_title)
          setValue('site_description', data.site_description)
          setValue('site_logo', data.site_logo)
          setValue('site_favicon', data.site_favicon)
          setValue('footer_text', data.footer_text)
          setValue('posts_per_page', data.posts_per_page)
          setValue('disqus_shortname', data.disqus_shortname)
          setValue('google_analytics_id', data.google_analytics_id)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSettings()
  }, [setValue])
  
  const onSubmit = async (data) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update(data)
          .eq('id', settings.id)
        
        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase
          .from('settings')
          .insert([data])
        
        if (error) throw error
      }
      
      setSuccess('Settings saved successfully!')
    } catch (err) {
      console.error('Error saving settings:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  
  // Default settings for demonstration
  const defaultSettings = {
    site_title: 'My CMS',
    site_description: 'A powerful content management system',
    site_logo: 'https://tailwindui.com/img/logos/mark.svg?color=primary&shade=600',
    site_favicon: '/favicon.svg',
    footer_text: '© 2023 My CMS. All rights reserved.',
    posts_per_page: 10,
    disqus_shortname: '',
    google_analytics_id: '',
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your website settings
          </p>
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
      
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-8 divide-y divide-gray-200" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about your website.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="site_title" className="block text-sm font-medium text-gray-700">
                  Site Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="site_title"
                    id="site_title"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={settings?.site_title || defaultSettings.site_title}
                    {...register('site_title', { required: 'Site title is required' })}
                  />
                  {errors.site_title && (
                    <p className="mt-2 text-sm text-red-600">{errors.site_title.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="site_description" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="site_description"
                    name="site_description"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    defaultValue={settings?.site_description || defaultSettings.site_description}
                    {...register('site_description')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  A brief description of your website. This will be used in search results and social media shares.
                </p>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="site_logo" className="block text-sm font-medium text-gray-700">
                  Site Logo URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="site_logo"
                    id="site_logo"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={settings?.site_logo || defaultSettings.site_logo}
                    {...register('site_logo')}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="site_favicon" className="block text-sm font-medium text-gray-700">
                  Site Favicon URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="site_favicon"
                    id="site_favicon"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={settings?.site_favicon || defaultSettings.site_favicon}
                    {...register('site_favicon')}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="footer_text" className="block text-sm font-medium text-gray-700">
                  Footer Text
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="footer_text"
                    id="footer_text"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={settings?.footer_text || defaultSettings.footer_text}
                    {...register('footer_text')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Content Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how your content is displayed.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="posts_per_page" className="block text-sm font-medium text-gray-700">
                  Posts Per Page
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="posts_per_page"
                    id="posts_per_page"
                    min="1"
                    max="50"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={settings?.posts_per_page || defaultSettings.posts_per_page}
                    {...register('posts_per_page', {
                      required: 'Posts per page is required',
                      min: { value: 1, message: 'Minimum value is 1' },
                      max: { value: 50, message: 'Maximum value is 50' },
                    })}
                  />
                  {errors.posts_per_page && (
                    <p className="mt-2 text-sm text-red-600">{errors.posts_per_page.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Integrations</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect your website with third-party services.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="disqus_shortname" className="block text-sm font-medium text-gray-700">
                  Disqus Shortname
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="disqus_shortname"
                    id="disqus_shortname"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    defaultValue={settings?.disqus_shortname || defaultSettings.disqus_shortname}
                    {...register('disqus_shortname')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Leave empty to disable comments.
                </p>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="google_analytics_id" className="block text-sm font-medium text-gray-700">
                  Google Analytics ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="google_analytics_id"
                    id="google_analytics_id"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                    defaultValue={settings?.google_analytics_id || defaultSettings.google_analytics_id}
                    {...register('google_analytics_id')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Leave empty to disable analytics.
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
              onClick={() => {
                // Reset form to initial values
                if (settings) {
                  setValue('site_title', settings.site_title)
                  setValue('site_description', settings.site_description)
                  setValue('site_logo', settings.site_logo)
                  setValue('site_favicon', settings.site_favicon)
                  setValue('footer_text', settings.footer_text)
                  setValue('posts_per_page', settings.posts_per_page)
                  setValue('disqus_shortname', settings.disqus_shortname)
                  setValue('google_analytics_id', settings.google_analytics_id)
                }
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
