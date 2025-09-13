'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { ComprehensiveUrlParser } from '@/lib/comprehensive-url-parser'
import { ModernLoadingBar } from '@/components/ui/ModernLoadingBar'

interface FileInfo {
  id: string
  site: string
  title: string
  previewUrl: string
  image?: string
  cost: number
  size?: string
  format?: string
  author?: string
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
  const [supportedSites, setSupportedSites] = useState<any[]>([])
  const [isLoadingSites, setIsLoadingSites] = useState(true)
  
  // Loading bar state
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState<'analyzing' | 'processing' | 'downloading' | 'completed'>('analyzing')
  
  // Debounce timer for URL changes
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [session, setSession] = useState<any>(null)

  // Filter sites based on search query
  const filteredSites = supportedSites.filter(site => 
    site.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        console.log('Session data:', data)
        
        if (data.user) {
          setSession(data)
          setIsAuthenticated(true)
          loadUserData(data.user)
        } else {
          console.log('No user found, redirecting to login')
          // Add a small delay to show the loading state
          setTimeout(() => {
            router.push('/login')
          }, 1000)
      }
    } catch (error) {
        console.error('Auth check failed:', error)
        // Add a small delay to show the loading state
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [router])

  // Load supported sites from API
  useEffect(() => {
    const loadSupportedSites = async () => {
      try {
        setIsLoadingSites(true)
        const response = await fetch('/api/supported-sites')
        const data = await response.json()
        
        if (data.success && data.sites) {
          setSupportedSites(data.sites)
        } else {
          console.error('Failed to load supported sites:', data)
      }
    } catch (error) {
        console.error('Error loading supported sites:', error)
      } finally {
        setIsLoadingSites(false)
    }
  }

    loadSupportedSites()
  }, [])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  // Debug fileInfo state changes
  useEffect(() => {
    console.log('fileInfo state changed:', fileInfo)
  }, [fileInfo])

  // Load user points and recent orders
  const loadUserData = useCallback(async (user?: any) => {
    const userId = user?.id || session?.user?.id
    if (!userId) return
    
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

  // Auto-preview URL when pasted or typed - contact API
  const handleUrlChange = useCallback(async (url: string) => {
    console.log('=== handleUrlChange START ===')
    console.log('handleUrlChange called with:', url)
    console.log('Current loading state:', isLoading)
    
    if (!url.trim()) {
      console.log('Empty URL, clearing file info')
    setFileInfo(null)
      setError(null)
      return
    }

    // Check if it looks like a URL
    if (!url.match(/^https?:\/\//)) {
      console.log('Invalid URL format:', url)
      setFileInfo(null)
      setError(null)
      return
    }

    console.log('Starting API call for URL:', url)
    setError(null)
    setIsLoading(true)

    // Parse URL with comprehensive parser
    const parsedData = ComprehensiveUrlParser.parseUrl(url)
    console.log('Parsed data:', parsedData)

    try {

      if (parsedData) {
        console.log('Contacting API with parsed data:', parsedData)
        console.log('API endpoint URL:', '/api/file-preview')
        console.log('Request payload:', JSON.stringify({ 
          url: url, 
          parsedData: parsedData 
        }))
        
        // Contact API to get real file preview with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log('API call timed out after 10 seconds')
          controller.abort()
        }, 10000) // 10 second timeout
        
        console.log('Making fetch request...')
      const response = await fetch('/api/file-preview', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: url, 
            parsedData: parsedData 
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        console.log('Fetch request completed')
        console.log('API response status:', response.status)
        console.log('API response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const data = await response.json()
          console.log('API response data:', data)
          console.log('Response success:', data.success)
          console.log('Response fileInfo:', data.fileInfo)
          
          if (data.success && data.fileInfo) {
            console.log('Setting file info:', data.fileInfo)
            console.log('File info type:', typeof data.fileInfo)
            console.log('File info keys:', Object.keys(data.fileInfo))
            console.log('File info details:', JSON.stringify(data.fileInfo, null, 2))
            setFileInfo(data.fileInfo)
            console.log('File info state set successfully')
            console.log('Set fileInfo with data:', data.fileInfo)
          } else {
            console.error('API returned error or missing data:')
            console.error('Success:', data.success)
            console.error('FileInfo:', data.fileInfo)
            console.error('Error:', data.error)
            throw new Error(data.error || 'Failed to get file preview from API')
          }
        } else {
          const errorData = await response.json()
          console.error('API request failed:', response.status, errorData)
          throw new Error(errorData.error || `API request failed with status ${response.status}`)
        }
      } else {
        console.log('URL parsing failed for:', url)
        setFileInfo(null)
        setError('Unsupported URL format. Please use a valid stock media URL.')
      }
    } catch (error) {
      console.error('Error getting file preview:', error)
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('API call timed out, using fallback')
        setError('Request timed out. Using fallback preview.')
      } else {
        console.log('API call failed, using fallback')
        setError(error instanceof Error ? error.message : 'Failed to get file preview. Using fallback.')
      }
      
      // Fallback: Create mock file info if API fails
      if (parsedData) {
        console.log('Creating fallback file info for:', parsedData)
        const fallbackFileInfo = {
          id: parsedData.id,
          site: parsedData.source,
          title: `${parsedData.source.charAt(0).toUpperCase() + parsedData.source.slice(1)} - ${parsedData.id}`,
          previewUrl: 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
          image: 'https://images.unsplash.com/photo-1506905925346-14bda5d4c4c0?w=400&h=300&fit=crop',
          cost: 10,
          size: 'Unknown',
          format: 'Unknown',
          author: 'Unknown',
          isAvailable: true
        }
        setFileInfo(fallbackFileInfo)
        console.log('Set fallback file info:', fallbackFileInfo)
      } else {
        setFileInfo(null)
        setError('Unsupported URL format. Please use a valid stock media URL.')
      }
    } finally {
      console.log('Setting loading to false')
      setIsLoading(false)
    }
  }, [])

  // Handle paste event - immediate processing
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    console.log('=== PASTE EVENT START ===')
    const pastedText = e.clipboardData.getData('text')
    console.log('Paste event:', pastedText)
    console.log('Pasted text length:', pastedText.length)
    setInputUrl(pastedText)
    
    // Clear existing timer
    if (debounceTimer) {
      console.log('Clearing existing debounce timer')
      clearTimeout(debounceTimer)
    }
    
    // Process immediately for paste events
    if (pastedText.match(/^https?:\/\//)) {
      console.log('Processing paste immediately for:', pastedText)
      console.log('Calling handleUrlChange...')
      handleUrlChange(pastedText)
    } else {
      console.log('Pasted text does not match URL pattern')
    }
    console.log('=== PASTE EVENT END ===')
  }, [handleUrlChange, debounceTimer])

  // Handle URL input change - with debounce
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    console.log('Input change:', url)
    setInputUrl(url)
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Debounce only for typing, not paste
    if (url.trim() && url.match(/^https?:\/\//)) {
      const timer = setTimeout(() => {
        console.log('Debounced input handling for:', url)
        handleUrlChange(url)
      }, 1500) // 1.5 second debounce for typing
      setDebounceTimer(timer)
    } else if (!url.trim()) {
      // Clear immediately if empty
      setFileInfo(null)
      setError(null)
    }
  }, [handleUrlChange, debounceTimer])

  // Direct download function - deduct points and get download link
  const handleDirectDownload = useCallback(async () => {
    if (!fileInfo || !session?.user?.id) return

    // Start loading bar for download
    setShowLoadingBar(true)
    setLoadingProgress(0)
    setLoadingStatus('processing')
    setError(null)
    setIsOrdering(true)

    try {
      // Step 1: Place order and deduct points (30%)
      setLoadingProgress(30)
      setLoadingStatus('processing')
      
      console.log('Placing order for:', {
        url: inputUrl,
        site: fileInfo.site,
        id: fileInfo.id,
        title: fileInfo.title,
        cost: fileInfo.cost
      })
      
      const response = await fetch('/api/place-stock-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl,
          site: fileInfo.site,
          id: fileInfo.id,
          title: fileInfo.title,
          cost: fileInfo.cost,
          imageUrl: fileInfo.previewUrl || fileInfo.image
        })
      })

      const data = await response.json()
      console.log('Order response:', data)

      if (data.success) {
        // Step 2: Get download link (70%)
        setLoadingProgress(70)
        setLoadingStatus('downloading')
        
        // Wait a moment for order processing
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try to get the download link
        if (data.orderId) {
          const downloadResponse = await fetch(`/api/orders/${data.orderId}/status`)
          const downloadData = await downloadResponse.json()
          
          if (downloadData.order?.downloadUrl) {
            // Open download link
            window.open(downloadData.order.downloadUrl, '_blank', 'noopener,noreferrer')
          }
        }
        
        // Step 3: Complete (100%)
        setLoadingProgress(100)
        setLoadingStatus('completed')
        
        setSuccess('Download started! Your file is being downloaded.')
        
        // Hide loading bar after completion
        setTimeout(() => {
          setShowLoadingBar(false)
          setFileInfo(null)
          setInputUrl('')
          loadUserData() // Reload user data to update points and orders
        }, 2000)
      } else {
        throw new Error(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setError(error instanceof Error ? error.message : 'Failed to place order. Please try again.')
      setShowLoadingBar(false)
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
  if (!isInitialized) {
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
          }}>Checking authentication...</h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem',
            margin: '0.5rem 0 0 0'
          }}>Please wait while we verify your session</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (isInitialized && !isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <>
      {/* Modern Loading Bar */}
      <ModernLoadingBar
        isVisible={showLoadingBar}
        progress={loadingProgress}
        status={loadingStatus}
        onComplete={() => setShowLoadingBar(false)}
      />
      
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
              
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  placeholder="Paste your stock media URL - preview will appear automatically"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    paddingRight: isLoading ? '3rem' : '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: isLoading ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '1rem',
                    backdropFilter: 'blur(8px)',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onFocus={(e) => {
                    if (!isLoading) {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                {isLoading && (
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}>
                    <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                    Getting preview...
                      </div>
                )}
                    </div>

              {/* File Preview Section */}
              {(() => {
                console.log('Checking fileInfo for preview:', fileInfo, 'Boolean:', !!fileInfo)
                return null
              })()}
              
              {fileInfo && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '2px solid #00ff00',
                  margin: '1rem 0',
                  minHeight: '200px'
                }}>
                  {(() => {
                    console.log('Rendering file preview with fileInfo:', fileInfo)
                    return null
                  })()}
                  <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1rem' }}>
                    🎉 FILE PREVIEW IS WORKING! 🎉
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '0.5rem',
                        background: `url(${fileInfo.previewUrl}) center/cover`,
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }} />
                      <div>
                        <h4 style={{
                          color: 'white',
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {fileInfo.title}
                        </h4>
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.875rem',
                          margin: 0
                        }}>
                          {fileInfo.site} • {fileInfo.format} • {fileInfo.size}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        color: '#10b981',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {fileInfo.cost} points
                      </div>
                      <button
                        onClick={handleDirectDownload}
                        disabled={isOrdering || !fileInfo.isAvailable}
                        style={{
                          background: fileInfo.isAvailable 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'rgba(107, 114, 128, 0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: fileInfo.isAvailable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          if (fileInfo.isAvailable) {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
                          }
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {isOrdering ? (
                          <>
                            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download style={{ width: '1rem', height: '1rem' }} />
                            Download Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {fileInfo.error && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#fca5a5',
                      fontSize: '0.875rem',
                      marginTop: '1rem'
                    }}>
                      {fileInfo.error}
                    </div>
                  )}
                </div>
              )}

              {/* Supported Sites - 2025 Trendy Design */}
              <div style={{ marginBottom: '2rem' }}>
                {/* Header Section */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)'
                }}>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      <ExternalLink style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
                      Supported Stock Sites
                    </h3>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                      margin: '0.5rem 0 0 0'
                    }}>
                      Access premium stock media from 30+ trusted platforms
                    </p>
                  </div>

                  {/* View Mode Toggle */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    padding: '0.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{
                        padding: '0.75rem 1.25rem',
                        background: viewMode === 'grid' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: viewMode === 'grid' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{
                        padding: '0.75rem 1.25rem',
                        background: viewMode === 'list' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: viewMode === 'list' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                    >
                      List
                    </button>
                      </div>
                    </div>

                {/* Search Section */}
                <div style={{
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}>
                  <input
                    type="text"
                    placeholder="Search sites by name or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem 1rem 3rem',
                      borderRadius: '1rem',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      backdropFilter: 'blur(20px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'
                      e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.boxShadow = 'none'
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <Search style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1.25rem',
                    height: '1.25rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }} />
                          </div>

                {/* Results Count */}
                <div style={{
                  marginBottom: '1.5rem',
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500'
                }}>
                  {isLoadingSites ? 'Loading sites...' : 
                   searchQuery ? `Found ${filteredSites.length} sites` : 
                   `Showing all ${supportedSites.length} supported sites`}
                      </div>
                      
                {/* Loading State */}
                {isLoadingSites ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '4rem',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      borderTop: '3px solid #10b981',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ marginLeft: '1rem', fontSize: '1.125rem' }}>Loading supported sites...</span>
                          </div>
                ) : (
                  <>
                    {/* Sites Container - 2025 Trendy Scrolling */}
                    <div 
                      style={{
                        display: viewMode === 'grid' ? 'grid' : 'flex',
                        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(320px, 1fr))' : 'none',
                        flexDirection: viewMode === 'list' ? 'column' : 'row',
                        gap: '1rem',
                        marginBottom: '2rem',
                        ...(viewMode === 'list' && {
                          maxHeight: '500px',
                          overflowY: 'auto',
                          paddingRight: '0.5rem',
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(16, 185, 129, 0.3) transparent'
                        })
                      }}
                    >
                      {filteredSites.map((site, index) => (
                        <a
                          key={site.name}
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: viewMode === 'list' ? '1rem 1.25rem' : '1.25rem',
                            background: viewMode === 'list' 
                              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
                            borderRadius: viewMode === 'list' ? '0.75rem' : '1rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textDecoration: 'none',
                            color: 'white',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            ...(viewMode === 'list' && {
                              marginBottom: '0.75rem'
                            })
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = viewMode === 'list' 
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 100%)'
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.2)'
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = viewMode === 'list'
                              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)'
                            e.currentTarget.style.transform = 'translateY(0) scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {/* 2025 Gradient Accent */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #f59e0b)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                          }} />
                          
                          <div style={{ flex: 1, zIndex: 1, display: 'flex', alignItems: 'center' }}>
                            {/* Site Icon */}
                            {site.icon && (
                              <div style={{
                                width: viewMode === 'list' ? '40px' : '48px',
                                height: viewMode === 'list' ? '40px' : '48px',
                                marginRight: '1rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(20px)',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}>
                                <img 
                                  src={`/assets/icons/${site.icon?.replace('.png', '.svg')}`}
                                  alt={`${site.displayName} icon`}
                                  style={{
                                    width: viewMode === 'list' ? '24px' : '28px',
                                    height: viewMode === 'list' ? '24px' : '28px',
                                    objectFit: 'contain'
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const parent = e.currentTarget.parentElement
                                    if (parent) {
                                      parent.innerHTML = '<div style="color: rgba(255, 255, 255, 0.8); font-size: 16px; font-weight: bold;">📁</div>'
                                    }
                                  }}
                                />
                      </div>
                    )}

                            {/* Site Info */}
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: viewMode === 'list' ? '1rem' : '1.125rem',
                                fontWeight: '700',
                                marginBottom: '0.5rem',
                                background: 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}>
                                {site.displayName}
                            </div>
                              <div style={{
                                fontSize: viewMode === 'list' ? '0.875rem' : '0.9rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                wordBreak: 'break-all',
                                opacity: 0.9
                              }}>
                                {site.url}
                            </div>
                          </div>
                        </div>
                        
                          {/* Points Badge */}
                          <div style={{
                            textAlign: 'right',
                            marginLeft: '1rem',
                            zIndex: 1
                          }}>
                            <div style={{
                              fontSize: viewMode === 'list' ? '0.875rem' : '1rem',
                              fontWeight: '800',
                              color: '#ffffff',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              padding: '0.5rem 1rem',
                              borderRadius: '0.75rem',
                              marginBottom: '0.5rem',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                              {site.cost} pts
                      </div>
                            <ExternalLink style={{
                              width: viewMode === 'list' ? '1rem' : '1.125rem',
                              height: viewMode === 'list' ? '1rem' : '1.125rem',
                              color: 'rgba(255, 255, 255, 0.6)',
                              transition: 'color 0.3s ease'
                            }} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                )}

                {/* No Results */}
                {!isLoadingSites && filteredSites.length === 0 && searchQuery && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Search style={{ width: '3rem', height: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      No sites found matching "{searchQuery}"
                              </div>
                    <div style={{ fontSize: '0.875rem' }}>
                      Try searching by site name or URL
                            </div>
                          </div>
                )}

                {/* Pricing Note */}
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backdropFilter: 'blur(20px)'
                }}>
                  <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#10b981',
                      marginBottom: '0.5rem'
                    }}>
                      All sites included in your subscription
                        </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'rgba(16, 185, 129, 0.9)',
                      lineHeight: '1.5'
                    }}>
                      No additional fees - just use your points to download from any supported site. Each download costs exactly 10 points regardless of the original site's pricing.
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
                        onClick={handleDirectDownload}
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

    </div>
    </>
  )
}