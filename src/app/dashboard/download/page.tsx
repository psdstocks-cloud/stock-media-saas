'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Search, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { UrlParser } from '@/lib/url-parser'

interface FileInfo {
  id: string
  site: string
  title: string
  previewUrl: string
  cost: number
  isAvailable: boolean
  error?: string
}

interface Order {
  id: string
  title: string
  cost: number
  status: string
  downloadUrl?: string
  createdAt: string
  stockSite: {
    displayName: string
  }
}

export default function DownloadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [inputUrl, setInputUrl] = useState('')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [isLoadingPoints, setIsLoadingPoints] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Comprehensive list of all supported sites
  const allSupportedSites = [
    // Premium Sites
    { name: 'Shutterstock', url: 'https://www.shutterstock.com', cost: 0.37 },
    { name: 'Adobe Stock', url: 'https://stock.adobe.com', cost: 0.25 },
    { name: 'Getty Images', url: 'https://www.gettyimages.com', cost: 0.5 },
    { name: 'Alamy', url: 'https://www.alamy.com', cost: 16.0 },
    { name: 'Envato Elements', url: 'https://elements.envato.com', cost: 0.35 },
    { name: 'UI8', url: 'https://ui8.net', cost: 2.0 },
    { name: 'Craftwork', url: 'https://craftwork.design', cost: 1.0 },
    { name: 'Pixelsquid', url: 'https://pixelsquid.com', cost: 0.65 },
    
    // Popular Sites
    { name: 'Freepik', url: 'https://www.freepik.com', cost: 0.15 },
    { name: 'Flaticon', url: 'https://www.flaticon.com', cost: 0.15 },
    { name: 'Vecteezy', url: 'https://www.vecteezy.com', cost: 0.2 },
    { name: 'Rawpixel', url: 'https://www.rawpixel.com', cost: 0.2 },
    { name: 'Motion Array', url: 'https://motionarray.com', cost: 0.2 },
    { name: 'IconScout', url: 'https://iconscout.com', cost: 0.2 },
    { name: 'Soundstripe', url: 'https://soundstripe.com', cost: 0.2 },
    { name: 'Epidemic Sound', url: 'https://epidemicsound.com', cost: 0.2 },
    
    // Additional Sites
    { name: 'Depositphotos', url: 'https://depositphotos.com', cost: 0.3 },
    { name: '123RF', url: 'https://www.123rf.com', cost: 0.25 },
    { name: 'iStock', url: 'https://www.istockphoto.com', cost: 0.4 },
    { name: 'Dreamstime', url: 'https://www.dreamstime.com', cost: 0.2 },
    { name: 'Pixabay', url: 'https://pixabay.com', cost: 0.1 },
    { name: 'Unsplash', url: 'https://unsplash.com', cost: 0.1 },
    { name: 'Pexels', url: 'https://www.pexels.com', cost: 0.1 },
    { name: 'Creative Fabrica', url: 'https://www.creativefabrica.com', cost: 0.4 },
    { name: 'Pixel Buddha', url: 'https://pixelbuddha.net', cost: 0.4 },
    { name: 'Pixeden', url: 'https://pixeden.com', cost: 0.4 },
    { name: 'Artlist', url: 'https://artlist.io', cost: 0.5 },
    { name: 'Footage Crate', url: 'https://footagecrate.com', cost: 0.8 },
    { name: 'Deezzy', url: 'https://deeezy.com', cost: 0.2 },
    { name: 'Yellow Images', url: 'https://yellowimages.com', cost: 10.0 },
    { name: 'Storyblocks', url: 'https://www.storyblocks.com', cost: 0.3 },
    { name: 'Pond5', url: 'https://www.pond5.com', cost: 0.5 },
    { name: 'Videoblocks', url: 'https://www.videoblocks.com', cost: 0.3 },
    { name: 'Canva', url: 'https://www.canva.com', cost: 0.2 },
    { name: 'Figma', url: 'https://www.figma.com', cost: 0.3 },
    { name: 'Sketch', url: 'https://www.sketch.com', cost: 0.3 },
    { name: '123RF', url: 'https://www.123rf.com', cost: 0.25 },
    { name: 'Bigstock', url: 'https://www.bigstockphoto.com', cost: 0.3 },
    { name: 'Agefotostock', url: 'https://www.agefotostock.com', cost: 0.4 },
    { name: 'Westend61', url: 'https://www.westend61.de', cost: 0.5 },
    { name: 'Mauritius', url: 'https://www.mauritius-images.com', cost: 0.4 },
    { name: 'Imagebank', url: 'https://www.imagebank.se', cost: 0.3 },
    { name: 'Photocase', url: 'https://www.photocase.com', cost: 0.2 },
    { name: 'Plainpicture', url: 'https://www.plainpicture.com', cost: 0.4 },
    { name: '123RF', url: 'https://www.123rf.com', cost: 0.25 },
    { name: 'Bigstock', url: 'https://www.bigstockphoto.com', cost: 0.3 },
    { name: 'Agefotostock', url: 'https://www.agefotostock.com', cost: 0.4 },
    { name: 'Westend61', url: 'https://www.westend61.de', cost: 0.5 },
    { name: 'Mauritius', url: 'https://www.mauritius-images.com', cost: 0.4 },
    { name: 'Imagebank', url: 'https://www.imagebank.se', cost: 0.3 },
    { name: 'Photocase', url: 'https://www.photocase.com', cost: 0.2 },
    { name: 'Plainpicture', url: 'https://www.plainpicture.com', cost: 0.4 }
  ]

  // Filter sites based on search query
  const filteredSites = allSupportedSites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load user data when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadUserData()
    }
  }, [status, session])

  // Load user points and recent orders
  const loadUserData = useCallback(async () => {
    if (!session?.user?.id) return
    
    setIsLoadingPoints(true)
    
    try {
      // Load points (now works with session)
      const pointsResponse = await fetch('/api/points')
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json()
        console.log('Points data received:', pointsData)
        setUserPoints(pointsData.balance?.currentPoints || 0)
      } else {
        console.error('Failed to load points:', pointsResponse.status, await pointsResponse.text())
        setUserPoints(0) // Set to 0 if failed to load
      }

      // Load recent orders
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData.orders?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setUserPoints(0) // Set to 0 if error occurred
    } finally {
      setIsLoadingPoints(false)
    }
  }, [session?.user?.id])

  // Parse URL and get file info
  const handleUrlSubmit = useCallback(async () => {
    if (!inputUrl.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setFileInfo(null)

    try {
      // First try our advanced URL parser
      const parsedData = UrlParser.parseUrl(inputUrl)
      console.log('Parsed data:', parsedData)

      if (parsedData) {
        // Use our advanced parser
        const response = await fetch('/api/file-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: inputUrl, 
            parsedData: parsedData 
          })
        })

        if (response.ok) {
          const data = await response.json()
          setFileInfo(data.fileInfo)
        } else {
          throw new Error('Failed to get file preview')
        }
      } else {
        // Fallback to original API
        const response = await fetch('/api/file-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl })
        })

        if (response.ok) {
          const data = await response.json()
          setFileInfo(data.fileInfo)
        } else {
          throw new Error('Failed to get file preview')
        }
      }
    } catch (error) {
      console.error('Error getting file preview:', error)
      setError('Failed to analyze URL. Please check the URL and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [inputUrl])

  // Handle paste event
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    setInputUrl(pastedText)
    
    // Auto-analyze if it looks like a URL
    if (pastedText.match(/^https?:\/\//)) {
      setTimeout(() => handleUrlSubmit(), 100)
    }
  }, [handleUrlSubmit])

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    if (!fileInfo || !session?.user?.id) return

    setIsOrdering(true)
    setError(null)

    try {
      const response = await fetch('/api/place-stock-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl,
          site: fileInfo.site,
          id: fileInfo.id,
          title: fileInfo.title,
          cost: fileInfo.cost,
          imageUrl: fileInfo.previewUrl
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Order placed successfully! Download will be ready shortly.')
        setFileInfo(null)
        setInputUrl('')
        // Reload user data to update points and orders
        loadUserData()
      } else {
        setError(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setError('Failed to place order. Please try again.')
    } finally {
      setIsOrdering(false)
    }
  }, [fileInfo, inputUrl, loadUserData])

  // Handle download
  const handleDownload = useCallback(async (order: Order) => {
    try {
      if (order.downloadUrl) {
        window.open(order.downloadUrl, '_blank', 'noopener,noreferrer')
      } else {
        // Regenerate download link
        const response = await fetch(`/api/orders/${order.id}/regenerate-link`, {
          method: 'POST'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.downloadUrl) {
            window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
          }
        }
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      setError('Failed to download file. Please try again.')
    }
  }, [])

  // Show loading state
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ 
            width: '3rem', 
            height: '3rem', 
            color: 'white', 
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: 0
          }}>Loading...</h2>
        </div>
      </div>
    )
  }

  // Show not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: '1rem',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <ArrowLeft style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  <Download style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #ffffff, #e0e7ff, #f3e8ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                  }}>
                    Download Center V2.0
                  </h1>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.25rem',
                    margin: '0.5rem 0 0 0'
                  }}>
                    Access premium stock content instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '1rem',
              padding: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white'
              }}>
                <CreditCard style={{ width: '1.25rem', height: '1.25rem' }} />
                {isLoadingPoints ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Loader2 style={{ 
                      width: '1rem', 
                      height: '1rem', 
                      animation: 'spin 1s linear infinite' 
                    }} />
                    <span style={{ fontWeight: '600' }}>Loading...</span>
                  </div>
                ) : (
                  <span style={{ fontWeight: '600' }}>{userPoints} Points</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* URL Input Section */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Search style={{ width: '1.5rem', height: '1.5rem' }} />
                Paste Stock URL
              </h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Paste your stock media URI"
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      backdropFilter: 'blur(8px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={isLoading || !inputUrl.trim()}
                    style={{
                      padding: '1rem 2rem',
                      background: isLoading ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '0.75rem',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    {isLoading ? (
                      <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>
              </div>

              {/* Supported Sites - Enhanced with Search & View Options */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <ExternalLink style={{ width: '1.25rem', height: '1.25rem' }} />
                    Supported Stock Sites & Pricing
                  </h3>
                  
                  {/* View Mode Toggle */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    padding: '0.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: viewMode === 'list' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      List
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Search sites by name or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '0.875rem',
                      backdropFilter: 'blur(8px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                {/* Results Count */}
                <div style={{
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  {searchQuery ? `Found ${filteredSites.length} sites` : `Showing all ${allSupportedSites.length} supported sites`}
                </div>

                {/* Sites Grid/List */}
                <div style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'none',
                  flexDirection: viewMode === 'list' ? 'column' : 'row',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  {filteredSites.map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textDecoration: 'none',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.25rem'
                        }}>
                          {site.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          wordBreak: 'break-all'
                        }}>
                          {site.url}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right',
                        marginLeft: '1rem'
                      }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#ffffff',
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          marginBottom: '0.25rem'
                        }}>
                          {site.cost} pts
                        </div>
                        <ExternalLink style={{
                          width: '0.75rem',
                          height: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.5)'
                        }} />
                      </div>
                    </a>
                  ))}
                </div>

                {/* No Results */}
                {filteredSites.length === 0 && searchQuery && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <Search style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.875rem' }}>
                      No sites found matching "{searchQuery}"
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Try searching by site name or URL
                    </div>
                  </div>
                )}

                {/* Pricing Note */}
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
                  <div>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#10b981',
                      marginBottom: '0.25rem'
                    }}>
                      All sites included in your subscription
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(16, 185, 129, 0.8)'
                    }}>
                      No additional fees - just use your points to download from any supported site
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#fca5a5'
                }}>
                  <AlertCircle style={{ width: '1rem', height: '1rem' }} />
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#86efac'
                }}>
                  <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                  {success}
                </div>
              )}

              {/* File Preview */}
              {fileInfo && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={fileInfo.previewUrl}
                          alt={fileInfo.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '0.75rem'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                            if (nextElement) {
                              nextElement.style.display = 'flex'
                            }
                          }}
                        />
                        <div style={{
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '1.5rem'
                        }}>
                          ?
                        </div>
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: 'white',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {fileInfo.title}
                        </h3>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.875rem',
                          margin: 0
                        }}>
                          {fileInfo.site} • {fileInfo.cost} points
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isOrdering || !fileInfo.isAvailable || (isLoadingPoints ? true : userPoints < fileInfo.cost)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: isOrdering || !fileInfo.isAvailable || (isLoadingPoints ? true : userPoints < fileInfo.cost) 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          cursor: isOrdering || !fileInfo.isAvailable || (isLoadingPoints ? true : userPoints < fileInfo.cost) 
                            ? 'not-allowed' 
                            : 'pointer',
                          fontSize: '1rem',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isOrdering && fileInfo.isAvailable && !isLoadingPoints && userPoints >= fileInfo.cost) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)'
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isOrdering && fileInfo.isAvailable && !isLoadingPoints && userPoints >= fileInfo.cost) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)'
                            e.currentTarget.style.transform = 'scale(1)'
                          }
                        }}
                      >
                        {isOrdering ? (
                          <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                        ) : isLoadingPoints ? (
                          'Loading Points...'
                        ) : userPoints < fileInfo.cost ? (
                          `Need ${fileInfo.cost - userPoints} more points`
                        ) : (
                          'Download Now'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {fileInfo.isAvailable && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#86efac',
                      fontSize: '0.875rem'
                    }}>
                      <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                      <span>Available for download</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Sidebar */}
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock style={{ width: '1.25rem', height: '1.25rem' }} />
                Recent Orders
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentOrders.length === 0 ? (
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    padding: '2rem 0'
                  }}>
                    No recent orders
                  </p>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'white',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {order.title}
                          </h4>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.75rem',
                            margin: 0
                          }}>
                            {order.stockSite.displayName} • {order.cost} points
                          </p>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: order.status === 'COMPLETED' ? '#86efac' : '#fbbf24',
                          textTransform: 'uppercase'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      
                      {order.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(order)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <Download style={{ width: '0.75rem', height: '0.75rem' }} />
                          Download
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}