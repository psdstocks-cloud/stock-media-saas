'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { ArrowLeft, Download, ExternalLink, Loader2, CheckCircle, AlertCircle, Sparkles, Zap, Star, Search, CreditCard } from 'lucide-react'

interface FileInfo {
  site: string
  id: string
  title: string
  cost: number
  previewUrl: string
  isAvailable: boolean
  error?: string
}

export default function DownloadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inputUrl, setInputUrl] = useState('')
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [orderResult, setOrderResult] = useState<{
    success: boolean
    orderId?: string
    error?: string
    warning?: string
  } | null>(null)
  const [orderStatus, setOrderStatus] = useState<{
    status: string
    downloadUrl?: string
    fileName?: string
  } | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [pageState, setPageState] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'unhealthy'>('checking')
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setApiHealth('healthy')
        } else {
          setApiHealth('unhealthy')
          console.error('API health check failed:', response.status)
        }
      } catch (error) {
        setApiHealth('unhealthy')
        console.error('API health check error:', error)
      }
    }

    checkApiHealth()
  }, [])

  const loadRecentOrders = useCallback(async () => {
    try {
      // Add cache control to prevent excessive calls
      const response = await fetch('/api/orders', {
        headers: {
          'Cache-Control': 'max-age=30' // Cache for 30 seconds
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders?.slice(0, 5) || [])
        console.log('📦 Recent orders loaded:', data.orders?.length || 0)
      } else {
        console.warn('⚠️ Failed to load recent orders:', response.status)
      }
    } catch (error) {
      console.error('💥 Error loading recent orders:', error)
    }
  }, [])

  // Debounced orders loading to prevent excessive calls
  useEffect(() => {
    if (!isInitialized || isLoadingOrders) return
    
    const timeoutId = setTimeout(() => {
      setIsLoadingOrders(true)
      loadRecentOrders().finally(() => {
        setIsLoadingOrders(false)
      })
    }, 1000) // 1 second delay

    return () => clearTimeout(timeoutId)
  }, [isInitialized, loadRecentOrders, isLoadingOrders])

  // Simplified and robust authentication flow
  useEffect(() => {
    console.log('🔐 Auth Status Check:', { status, hasSession: !!session, pageState })
    
    // Handle loading state
    if (status === 'loading') {
      setPageState('loading')
      return
    }

    // Handle unauthenticated state
    if (status === 'unauthenticated' || !session) {
      console.log('❌ User not authenticated, redirecting to login')
      setPageState('unauthenticated')
      router.push('/login')
      return
    }

    // Handle authenticated state
    if (status === 'authenticated' && session) {
      console.log('✅ User authenticated successfully')
      setPageState('authenticated')
      setError(null)
      setIsInitialized(true)
    }
  }, [status, session, router])

  // Timeout handler for loading state
  useEffect(() => {
    if (pageState === 'loading') {
      const timeout = setTimeout(() => {
        console.error('⏰ Authentication timeout after 5 seconds')
        setPageState('error')
        setError('Authentication timeout. Please try refreshing the page.')
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [pageState])

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    setError(null)
    setPageState('loading')
    // Force re-authentication
    window.location.reload()
  }, [])

  // Memoize expensive computations
  const isOrderButtonDisabled = useMemo(() => {
    return ordering || !fileInfo || !fileInfo.isAvailable
  }, [ordering, fileInfo])

  const shouldShowPricingRedirect = useMemo(() => {
    return orderResult?.error?.toLowerCase().includes('insufficient points')
  }, [orderResult?.error])

  const handlePreview = async () => {
    if (!inputUrl || !inputUrl.trim()) return

    setLoading(true)
    setFileInfo(null)
    setOrderResult(null)
    setOrderStatus(null)

    try {
      const response = await fetch('/api/file-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setFileInfo(data.fileInfo)
      } else {
        setFileInfo({
          site: 'unknown',
          id: 'unknown',
          title: 'Preview Failed',
          cost: 0,
          previewUrl: 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Preview+Failed',
          isAvailable: false,
          error: data.error || 'Failed to process URL'
        })
      }
    } catch (error) {
      console.error('Error getting file preview:', error)
      setFileInfo({
        site: 'unknown',
        id: 'unknown',
        title: 'Network Error',
        cost: 0,
        previewUrl: 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Network+Error',
        isAvailable: false,
        error: 'Network error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkOrderStatus = useCallback(async (orderId: string) => {
    const maxAttempts = 10 // Reduced from 20
    let attempts = 0
    let isPolling = true
    
    const checkStatus = async () => {
      if (!isPolling) return // Prevent multiple concurrent polls
      
      try {
        attempts++
        console.log(`🔍 Checking order status (${attempts}/${maxAttempts}):`, orderId)
        
        const response = await fetch(`/api/orders/${orderId}/status`)
        const data = await response.json()
        
        if (data.success && data.order) {
          setOrderStatus({
            status: data.order.status,
            downloadUrl: data.order.downloadUrl,
            fileName: data.order.fileName
          })
          
          if (data.order.status === 'COMPLETED' && data.order.downloadUrl) {
            console.log('✅ Order completed with download link:', data.order.downloadUrl)
            isPolling = false
            return
          }
          
          if (data.order.status === 'FAILED') {
            console.log('❌ Order failed, stopping polling')
            isPolling = false
            return
          }
        }
        
        // Only continue polling if we haven't exceeded max attempts and order is still processing
        if (attempts < maxAttempts && isPolling) {
          setTimeout(checkStatus, 10000) // Increased from 6000ms to 10000ms
        } else {
          isPolling = false
          console.log('⏰ Order status polling stopped after max attempts')
        }
      } catch (error) {
        console.error('💥 Error checking order status:', error)
        if (attempts < maxAttempts && isPolling) {
          setTimeout(checkStatus, 10000)
        } else {
          isPolling = false
        }
      }
    }
    
    // Start polling after 5 seconds instead of 3
    setTimeout(checkStatus, 5000)
    
    // Return cleanup function
    return () => {
      isPolling = false
    }
  }, [])

  const handleOrder = async () => {
    if (!fileInfo || !fileInfo.isAvailable) return

    setOrdering(true)
    setOrderResult(null)
    setOrderStatus(null)

    try {
      const response = await fetch('/api/place-stock-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileInfo }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderResult({
          success: true,
          orderId: data.order.id,
          warning: data.warning,
          error: data.order.status === 'FAILED' ? data.message : undefined
        })
        
        if (data.order.id && data.order.status === 'PROCESSING') {
          checkOrderStatus(data.order.id)
        }
      } else {
        setOrderResult({
          success: false,
          error: data.error || 'Failed to place order'
        })
        
        // If it's an insufficient points error, show pricing redirect
        if (data.error && data.error.toLowerCase().includes('insufficient points')) {
          // The error display will handle showing the pricing redirect
        }
      }
    } catch (error) {
      console.error('Error placing order:', error)
      
      let errorMessage = 'Network error occurred'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.'
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setOrderResult({
        success: false,
        error: errorMessage
      })
    } finally {
      setOrdering(false)
    }
  }

  // Enhanced loading and error states
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Loading Download Center</h2>
          <p className="text-gray-300 text-lg">Please wait while we prepare everything...</p>
          <div className="mt-4 text-sm text-gray-400">
            {retryCount > 0 && `Retry attempt ${retryCount}`}
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-red-200 text-lg mb-6">
            {error || 'There was an issue loading the page. Please try again.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl font-bold text-lg"
            >
              🔄 Retry
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl font-bold text-lg"
            >
              🔑 Go to Login
            </button>
          </div>
          {retryCount > 2 && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                💡 If the problem persists, try clearing your browser cache or contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (pageState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-300 text-lg mb-6">
            Please log in to access the download center.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl font-bold text-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Safety check - if we're not properly authenticated, show loading
  if (pageState !== 'authenticated' || !session || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Initializing...</h2>
          <p className="text-gray-300 text-lg">Setting up your download center</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Status indicator */}
      <div className={`fixed top-4 right-4 text-white px-4 py-2 rounded-full z-50 font-semibold text-sm shadow-lg backdrop-blur-sm border ${
        apiHealth === 'healthy' 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400/30'
          : apiHealth === 'unhealthy'
          ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-400/30'
          : 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400/30'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            apiHealth === 'healthy' 
              ? 'bg-white animate-pulse'
              : apiHealth === 'unhealthy'
              ? 'bg-white animate-pulse'
              : 'bg-white animate-spin'
          }`}></div>
          {apiHealth === 'healthy' && 'Download Center Active'}
          {apiHealth === 'unhealthy' && 'Service Issues Detected'}
          {apiHealth === 'checking' && 'Checking Services...'}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Download Media
                  </h1>
                  <p className="text-gray-300 text-xl mt-2">Access premium stock content instantly with our advanced platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Modern URL Input */}
          <div className="mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-2">
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste any stock media URL here (Shutterstock, Adobe Stock, etc.)"
                    className="flex-1 px-6 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg font-medium"
                    style={{ color: 'white' }}
                    disabled={loading}
                  />
                  <button
                    onClick={handlePreview}
                    disabled={loading || !inputUrl || !inputUrl.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Preview
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Preview Card */}
          {fileInfo && (
            <div className="relative group mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                <div className="flex gap-8">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative group/image">
                      <img
                        src={fileInfo.previewUrl}
                        alt={fileInfo.title}
                        className="w-48 h-48 object-cover rounded-2xl shadow-2xl border-2 border-white/20 group-hover/image:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/192x192/4F46E5/FFFFFF?text=Preview+Unavailable'
                        }}
                      />
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {fileInfo.title}
                      </h2>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="text-lg font-medium capitalize">{fileInfo.site}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-lg font-mono bg-white/10 px-3 py-1 rounded-lg">
                          #{fileInfo.id}
                        </span>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-blue-300 text-sm font-semibold uppercase tracking-wide">Cost</span>
                        </div>
                        <span className="text-2xl font-bold text-green-400">
                          {fileInfo.cost} points
                        </span>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-purple-300 text-sm font-semibold uppercase tracking-wide">Status</span>
                        </div>
                        {fileInfo.isAvailable ? (
                          <span className="flex items-center gap-2 text-green-400 font-bold text-lg">
                            <CheckCircle className="w-5 h-5" />
                            Available
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-400 font-bold text-lg">
                            <AlertCircle className="w-5 h-5" />
                            {fileInfo.error || 'Unavailable'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Button */}
                    {fileInfo.isAvailable && (
                      <div className="mb-8">
                        <button
                          onClick={handleOrder}
                          disabled={isOrderButtonDisabled}
                          className="w-full px-8 py-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 font-bold text-xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-green-500/25"
                        >
                          {ordering ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              Placing Order...
                            </>
                          ) : (
                            <>
                              <Download className="w-6 h-6" />
                              🚀 Order for {fileInfo.cost} points
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Order Result */}
                    {orderResult && (
                      <div className={`p-6 rounded-2xl border-2 ${
                        orderResult.success && !orderResult.error
                          ? 'bg-green-500/10 border-green-400/30' 
                          : 'bg-red-500/10 border-red-400/30'
                      }`}>
                        <div className="flex items-center gap-4 mb-4">
                          {orderResult.success && !orderResult.error ? (
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className={`text-xl font-bold ${
                              orderResult.success && !orderResult.error ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {orderResult.success && !orderResult.error ? 'Order Placed Successfully!' : 'Order Failed'}
                            </h3>
                            {orderResult.success && orderResult.orderId && (
                              <p className="text-green-300 text-sm font-mono mt-1">
                                Order ID: {orderResult.orderId}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {orderResult.warning && (
                          <p className="text-yellow-300 text-sm p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                            ⚠️ {orderResult.warning}
                          </p>
                        )}
                        
                        {orderResult.error && (
                          <div className="space-y-3">
                            <p className="text-red-300 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                              ❌ {orderResult.error}
                            </p>
                            {shouldShowPricingRedirect && (
                              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                  </div>
                                  <h4 className="text-blue-300 font-bold text-lg">Need More Points?</h4>
                                </div>
                                <p className="text-blue-200 text-sm mb-4">
                                  Get more points to continue downloading premium content. Choose from our flexible pricing plans.
                                </p>
                                <button
                                  onClick={() => router.push('/dashboard/pricing')}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  View Pricing Plans
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Status and Download Button */}
                    {orderStatus && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-blue-400" />
                              </div>
                              <span className="text-blue-300 text-sm font-semibold uppercase tracking-wide">Order Status</span>
                            </div>
                            <p className="text-white text-lg font-bold mb-1">
                              {orderStatus.status}
                            </p>
                            {orderStatus.fileName && (
                              <p className="text-blue-200 text-sm">
                                File: {orderStatus.fileName}
                              </p>
                            )}
                          </div>
                          {orderStatus.status === 'COMPLETED' && orderStatus.downloadUrl && (
                            <a
                              href={orderStatus.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-3 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                              <Download className="w-5 h-5" />
                              Download File
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <div className="relative group mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-blue-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Recent Orders</h2>
                  </div>
                  <p className="text-gray-300 text-xl">Your latest downloads and orders</p>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                      <div className="flex items-center gap-6">
                        <div className="relative group/image">
                          <img
                            src={order.imageUrl || 'https://via.placeholder.com/60x60/4F46E5/FFFFFF?text=IMG'}
                            alt={order.title}
                            className="w-16 h-16 object-cover rounded-2xl border-2 border-white/20 group-hover/image:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-bold text-xl mb-1">{order.title}</p>
                          <p className="text-gray-300 text-sm">
                            {order.stockSite?.displayName} • {order.cost} points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                            : order.status === 'PROCESSING'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                        }`}>
                          {order.status}
                        </span>
                        {order.status === 'COMPLETED' && order.downloadUrl && (
                          <a
                            href={order.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-110 shadow-lg"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Supported Sites */}
          <div className="relative group mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Supported Sites</h2>
                </div>
                <p className="text-gray-300 text-xl">Access content from 40+ premium stock media platforms</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Shutterstock',
                  'Dreamstime', 
                  'Adobe Stock',
                  '123RF',
                  'Depositphotos',
                  'Freepik',
                  'Vecteezy',
                  'Rawpixel',
                  'Storyblocks',
                  'Motion Array',
                  'Artlist',
                  'Epidemic Sound',
                  'UI8',
                  'Craftwork',
                  'Icons8',
                  'Flaticon'
                ].map((site) => (
                  <div key={site} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">{site}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">⚡ How it Works</h2>
                </div>
                <p className="text-gray-300 text-xl">Simple, fast, and secure - get your media in 3 easy steps</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
                    <ExternalLink className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">1. Paste URL</h3>
                  <p className="text-purple-200 leading-relaxed">
                    Copy any stock media URL and paste it into our smart input field
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">2. Preview & Order</h3>
                  <p className="text-purple-200 leading-relaxed">
                    Get an instant preview, confirm details, and place your order securely
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">3. Download</h3>
                  <p className="text-purple-200 leading-relaxed">
                    Get your high-quality file instantly with a fresh download link
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
