'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Download, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Search,
  CreditCard,
  Clock,
  ArrowLeft,
  Sparkles,
  Zap,
  Star
} from 'lucide-react'
import { UrlParser, ParsedUrl } from '@/lib/url-parser'

interface FileInfo {
  id: string
  site: string
  title: string
  cost: number
  previewUrl: string
  isAvailable: boolean
  error?: string
}

interface Order {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  title: string
  cost: number
  downloadUrl?: string
  fileName?: string
  createdAt: string
  stockSite: {
    name: string
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load user data on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      loadUserData()
    }
  }, [status, session])

  // Load user points and recent orders
  const loadUserData = useCallback(async () => {
    try {
      // Load points
      const pointsResponse = await fetch('/api/points')
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json()
        setUserPoints(pointsData.currentPoints || 0)
      }

      // Load recent orders
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData.orders?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

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
      // First, try to parse with our advanced parser
      const parsedUrl = UrlParser.parseUrl(inputUrl)
      
      if (!parsedUrl) {
        // Fallback to API if our parser doesn't support the URL
        const response = await fetch('/api/file-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl })
        })

        if (!response.ok) {
          throw new Error('Failed to get file preview')
        }

        const data = await response.json()
        setFileInfo(data.fileInfo)
      } else {
        // Use our parsed data to create file info
        const response = await fetch('/api/file-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: inputUrl,
            parsedData: parsedUrl
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get file preview')
        }

        const data = await response.json()
        setFileInfo(data.fileInfo)
      }
    } catch (error) {
      console.error('Error getting file preview:', error)
      setError('Failed to process URL. Please check the format and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [inputUrl])

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    if (!fileInfo) return

    setIsOrdering(true)
    setError(null)
    setSuccess(null)

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
          previewUrl: fileInfo.previewUrl
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Order placed successfully! Processing your download...')
        setFileInfo(null)
        setInputUrl('')
        loadUserData() // Refresh user data
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
        </div>
      </div>
    )
  }

  // Show not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
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
                  Download Center V2.0
                </h1>
                <p className="text-gray-300 text-xl mt-2">
                  Access premium stock content instantly
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white">
                <CreditCard className="w-5 h-5" />
                <span className="font-semibold">{userPoints} Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* URL Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Search className="w-6 h-6" />
                Paste Stock URL
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste your stock media URL here..."
                    className="flex-1 px-6 py-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={isLoading || !inputUrl.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Analyze'
                    )}
                  </button>
                </div>

                {/* Supported Sites */}
                <div className="text-sm text-gray-300">
                  <p className="mb-2">Supported sites:</p>
                  <div className="flex flex-wrap gap-2">
                    {UrlParser.getSupportedSites().slice(0, 8).map((site) => (
                      <span
                        key={site}
                        className="px-3 py-1 bg-white/10 rounded-full text-xs"
                      >
                        {site}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs">
                      +{UrlParser.getSupportedSites().length - 8} more
                    </span>
                  </div>
                </div>
              </div>

              {/* File Preview */}
              {fileInfo && (
                <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div className="flex items-start gap-6">
                    <img
                      src={fileInfo.previewUrl}
                      alt={fileInfo.title}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {fileInfo.title}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {fileInfo.site} • {fileInfo.cost} points
                      </p>
                      {fileInfo.error ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="w-5 h-5" />
                          <span>{fileInfo.error}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span>Available for download</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isOrdering || !fileInfo.isAvailable || userPoints < fileInfo.cost}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        {isOrdering ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : userPoints < fileInfo.cost ? (
                          'Insufficient Points'
                        ) : (
                          'Download Now'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {success && (
                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">{success}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock className="w-5 h-5" />
                Recent Orders
              </h3>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm truncate">
                          {order.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-500/20 text-green-400'
                            : order.status === 'PROCESSING'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : order.status === 'FAILED'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-3">
                        {order.stockSite.displayName} • {order.cost} points
                      </p>
                      {order.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(order)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}