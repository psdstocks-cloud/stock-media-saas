'use client'

import { useState } from 'react'
import { Download, Search, CheckCircle, AlertCircle, Loader2, ExternalLink, Sparkles, Zap, Star } from 'lucide-react'

interface FileInfo {
  site: string
  id: string
  title: string
  cost: number
  previewUrl: string
  isAvailable: boolean
  error?: string
}

interface FilePreviewProps {
  url?: string
  onOrderPlaced?: (orderId: string) => void
}

export default function FilePreview({ url, onOrderPlaced }: FilePreviewProps) {
  const [inputUrl, setInputUrl] = useState(url)
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

  const checkOrderStatus = async (orderId: string) => {
    const maxAttempts = 20 // Check for 2 minutes
    let attempts = 0
    
    const checkStatus = async () => {
      try {
        attempts++
        const response = await fetch(`/api/orders/${orderId}/status`)
        const data = await response.json()
        
        if (data.success && data.order) {
          setOrderStatus({
            status: data.order.status,
            downloadUrl: data.order.downloadUrl,
            fileName: data.order.fileName
          })
          
          if (data.order.status === 'COMPLETED' && data.order.downloadUrl) {
            console.log('Order completed with download link:', data.order.downloadUrl)
            return // Stop checking
          }
        }
        
        // Continue checking if not completed and under max attempts
        if (attempts < maxAttempts && (!data.order || data.order.status !== 'COMPLETED')) {
          setTimeout(checkStatus, 6000) // Check every 6 seconds
        }
      } catch (error) {
        console.error('Error checking order status:', error)
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000)
        }
      }
    }
    
    // Start checking after 3 seconds
    setTimeout(checkStatus, 3000)
  }

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
        onOrderPlaced?.(data.order.id)
        
        // Start checking order status for download link only if processing
        if (data.order.id && data.order.status === 'PROCESSING') {
          checkOrderStatus(data.order.id)
        }
      } else {
        setOrderResult({
          success: false,
          error: data.error || 'Failed to place order'
        })
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

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Debug indicator */}
      <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded z-50">
        UI V2.0 - Modern Design Active
      </div>
      
      {/* Modern Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
              Download Stock Media
            </h1>
            <p className="text-gray-300 text-xl">
              Premium content at your fingertips
            </p>
          </div>
        </div>
      </div>

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
        <div className="relative group">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
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
                      disabled={ordering}
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
                    orderResult.success 
                      ? 'bg-green-500/10 border-green-400/30' 
                      : 'bg-red-500/10 border-red-400/30'
                  }`}>
                    <div className="flex items-center gap-4 mb-4">
                      {orderResult.success ? (
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
                      <p className="text-red-300 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                        ❌ {orderResult.error}
                      </p>
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
    </div>
  )
}