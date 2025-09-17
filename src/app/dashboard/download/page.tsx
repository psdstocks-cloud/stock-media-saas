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
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComprehensiveUrlParser } from '../../../lib/comprehensive-url-parser'
import { ModernLoadingBar } from '../../../components/ui/ModernLoadingBar'

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

  // Check authentication and URL parameters on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Starting authentication check...')
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch('/api/auth/session', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Session data received:', data)
        
        if (data.user) {
          console.log('User authenticated:', data.user.email)
          setSession(data)
          setIsAuthenticated(true)
          loadUserData(data.user)
        } else {
          console.log('No user found, redirecting to login')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Auth check timed out')
        }
        router.push('/login')
      } finally {
        console.log('Setting isInitialized to true')
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [router])

  // Handle URL parameter from main dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlParam = urlParams.get('url')
    
    if (urlParam) {
      console.log('URL parameter found:', urlParam)
      setInputUrl(urlParam)
      handleUrlChange(urlParam)
    }
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
        console.log('API response headers:', response.headers)
        
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

  // Direct download function - deduct points and get download link
  const handleDirectDownload = useCallback(async () => {
    if (!fileInfo || !session?.user?.id) return

    // Start loading bar for download
    setShowLoadingBar(true)
    setLoadingProgress(0)
    setLoadingStatus('analyzing')
    setError(null)
    setIsOrdering(true)

    try {
      // Step 1: Analyzing file (10%)
      setLoadingProgress(10)
      setLoadingStatus('analyzing')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Step 2: Validating order (25%)
      setLoadingProgress(25)
      setLoadingStatus('processing')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('Placing order for:', {
        url: inputUrl,
        site: fileInfo.site,
        id: fileInfo.id,
        title: fileInfo.title,
        cost: fileInfo.cost
      })
      
      // Step 3: Placing order (50%)
      setLoadingProgress(50)
      setLoadingStatus('processing')
      
      const response = await fetch('/api/place-stock-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileInfo: {
            url: inputUrl,
            site: fileInfo.site,
            id: fileInfo.id,
            title: fileInfo.title,
            cost: fileInfo.cost,
            imageUrl: fileInfo.previewUrl || fileInfo.image,
            previewUrl: fileInfo.previewUrl,
            image: fileInfo.image,
            size: fileInfo.size,
            format: fileInfo.format,
            author: fileInfo.author,
            isAvailable: fileInfo.isAvailable
          }
        })
      })

      const data = await response.json()
      console.log('Order response:', data)

      if (data.success) {
        // Step 4: Processing order (70%)
        setLoadingProgress(70)
        setLoadingStatus('processing')
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Step 5: Generating download link (85%)
        setLoadingProgress(85)
        setLoadingStatus('downloading')
        
        // Try to get the download link with retries
        if (data.orderId) {
          let downloadUrl = null
          let retries = 0
          const maxRetries = 5 // Reduced retries for faster response
          
          // Step 6: Waiting for download link (90%)
          setLoadingProgress(90)
          setLoadingStatus('downloading')
          
          // Keep trying to get download link
          while (!downloadUrl && retries < maxRetries) {
            try {
              const downloadResponse = await fetch(`/api/orders/${data.orderId}/status`)
              const downloadData = await downloadResponse.json()
              
              console.log('Order status response:', downloadData)
              
              if (downloadData.order?.downloadUrl) {
                downloadUrl = downloadData.order.downloadUrl
                break
              }
              
              // Wait before next retry
              await new Promise(resolve => setTimeout(resolve, 1000)) // Faster retries
              retries++
              
              // Update progress during retries
              const retryProgress = 90 + (retries * 2)
              setLoadingProgress(Math.min(retryProgress, 95))
              
            } catch (error) {
              console.error('Error fetching download link:', error)
              await new Promise(resolve => setTimeout(resolve, 1000))
              retries++
            }
          }
          
          if (downloadUrl) {
            // Step 7: Opening download (95%)
            setLoadingProgress(95)
            setLoadingStatus('downloading')
            
            // Open download link
            window.open(downloadUrl, '_blank', 'noopener,noreferrer')
            
            // Step 8: Complete (100%)
            setLoadingProgress(100)
            setLoadingStatus('completed')
            
            setSuccess('Download started! Your file is being downloaded.')
            
            // Hide loading bar after successful download
            setTimeout(() => {
              setShowLoadingBar(false)
              setFileInfo(null)
              setInputUrl('')
              loadUserData() // Reload user data to update points and orders
            }, 3000)
          } else {
            // Use mock download as fallback
            console.log('Using mock download as fallback for order:', data.orderId)
            
            // Step 7: Opening mock download (95%)
            setLoadingProgress(95)
            setLoadingStatus('downloading')
            
            // Open mock download link
            const mockDownloadUrl = `/api/mock-download/${data.orderId}`
            window.open(mockDownloadUrl, '_blank', 'noopener,noreferrer')
            
            // Step 8: Complete (100%)
            setLoadingProgress(100)
            setLoadingStatus('completed')
            
            setSuccess('Download started! Your file is being downloaded.')
            
            // Hide loading bar after successful download
            setTimeout(() => {
              setShowLoadingBar(false)
              setFileInfo(null)
              setInputUrl('')
              loadUserData() // Reload user data to update points and orders
            }, 3000)
          }
        } else {
          // No order ID - complete immediately
          setLoadingProgress(100)
          setLoadingStatus('completed')
          
          setSuccess('Order placed successfully! Download link will be available shortly.')
          
          // Hide loading bar after completion
          setTimeout(() => {
            setShowLoadingBar(false)
            setFileInfo(null)
            setInputUrl('')
            loadUserData() // Reload user data to update points and orders
          }, 3000)
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Checking authentication...</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your session
          </p>
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
        onClose={() => {
          setShowLoadingBar(false)
          setFileInfo(null)
          setInputUrl('')
          loadUserData()
        }}
      />
      
      <div className="space-y-8">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
                <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Download Center
                </h1>
              <p className="text-muted-foreground">
                Process and download your stock media files
                  </p>
              </div>
            </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <CreditCard className="h-4 w-4" />
                {isLoadingPoints ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="font-medium">{userPoints} Points</span>
            )}
            </div>
          </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* File Preview Section */}
          <div className="lg:col-span-2">
            {fileInfo ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${fileInfo.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-muted-foreground">
                        {fileInfo.isAvailable ? 'Ready to Download' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {fileInfo.cost} Points
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Preview Image */}
                    <div className="relative">
                      <div 
                        className="w-full h-48 rounded-lg bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${fileInfo.image || fileInfo.previewUrl})`
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded text-xs font-medium">
                        {fileInfo.format || 'Unknown'}
                      </div>
                    </div>

                    {/* File Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{fileInfo.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          {fileInfo.site}
                        </div>
                        {fileInfo.size && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-secondary rounded-full" />
                            {fileInfo.size}
                          </div>
                        )}
                        {fileInfo.author && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            {fileInfo.author}
                          </div>
                        )}
                      </div>
                    </div>

                      {/* Download Button */}
                      <Button
                        onClick={handleDirectDownload}
                        disabled={isOrdering || !fileInfo.isAvailable}
                        className="w-full h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        {isOrdering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Now
                          </>
                        )}
                      </Button>
                  
                  {fileInfo.error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                      {fileInfo.error}
                    </div>
                  )}
                </div>
                  </div>
                </CardContent>
              </Card>
            ) : inputUrl ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                  <h3 className="text-lg font-medium mb-2">Analyzing URL</h3>
                  <p className="text-muted-foreground">
                    Getting file information and preview...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                  <h3 className="text-lg font-medium mb-2">No URL provided</h3>
                  <p className="text-muted-foreground mb-4">
                    Please paste a stock media URL on the main dashboard to get started
                  </p>
                  <Button onClick={() => router.push('/dashboard')} variant="outline">
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Orders Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent orders
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                    <div
                      key={order.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{order.title}</h4>
                            <p className="text-xs text-muted-foreground">
                            {order.stockSite.displayName} • {order.cost} points
                  </p>
                </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            order.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.status}
                        </span>
                  </div>
                      
                      {order.status === 'COMPLETED' && (
                          <Button
                          onClick={() => handleDownload(order)}
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs"
                          >
                            <Download className="mr-1 h-3 w-3" />
                          Download
                          </Button>
                      )}
                </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
        </div>
        )}
    </div>
    </>
  )
}