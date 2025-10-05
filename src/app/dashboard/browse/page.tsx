'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Download, 
  Coins,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileImage,
  FileVideo,
  File,
  RefreshCw,
  Link as LinkIcon,
  Eye,
  Info,
  Clock,
  User
} from 'lucide-react'

// Types from order-v3
interface StockInfo {
  id: string
  title: string
  source: string
  cost: number
  ext: string
  name: string
  author: string
  sizeInBytes: number
  thumbnail: string
}

interface OrderStatus {
  taskId: string
  status: 'processing' | 'ready' | 'error'
  downloadLink?: string
  fileName?: string
  linkType?: string
}

interface UserPoints {
  currentPoints: number
  totalEarned: number
  totalSpent: number
}

interface DownloadHistory {
  id: string
  title: string
  source: string
  downloadedAt: string
  cost: number
  thumbnail?: string
}

const supportedSites = [
  { name: 'Shutterstock', domain: 'shutterstock.com', cost: '1-5 points', active: true, color: 'bg-red-100 text-red-800' },
  { name: 'Adobe Stock', domain: 'stock.adobe.com', cost: '1-8 points', active: true, color: 'bg-blue-100 text-blue-800' },
  { name: 'Freepik', domain: 'freepik.com', cost: '0.15 points', active: true, color: 'bg-green-100 text-green-800' },
  { name: 'Unsplash', domain: 'unsplash.com', cost: '0.1 points', active: true, color: 'bg-gray-100 text-gray-800' },
  { name: 'Pexels', domain: 'pexels.com', cost: '0.1 points', active: true, color: 'bg-purple-100 text-purple-800' },
  { name: 'iStock', domain: 'istockphoto.com', cost: '2-16 points', active: true, color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Getty Images', domain: 'gettyimages.com', cost: '16+ points', active: true, color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Vecteezy', domain: 'vecteezy.com', cost: '0.3 points', active: true, color: 'bg-pink-100 text-pink-800' }
]

export default function BrowsePage() {
  // State management
  const [userPoints, setUserPoints] = useState<UserPoints>({ currentPoints: 0, totalEarned: 0, totalSpent: 0 })
  const [stockUrl, setStockUrl] = useState('')
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [progress, setProgress] = useState(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([])

  useEffect(() => {
    loadUserPoints()
    loadDownloadHistory()
    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [pollingInterval])

  const loadUserPoints = async () => {
    try {
      const response = await fetch('/api/points', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summary) {
          setUserPoints(data.summary)
        }
      }
    } catch (error) {
      console.error('Failed to load points:', error)
    }
  }

  const loadDownloadHistory = async () => {
    try {
      const response = await fetch('/api/downloads/history', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setDownloadHistory(data.downloads || [])
        }
      }
    } catch (error) {
      console.error('Failed to load download history:', error)
    }
  }

  const extractSiteAndId = (url: string) => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      // Map domain to site identifier
      const siteMap = {
        'shutterstock.com': 'shutterstock',
        'www.shutterstock.com': 'shutterstock',
        'stock.adobe.com': 'adobestock',
        'freepik.com': 'freepik',
        'unsplash.com': 'unsplash',
        'pexels.com': 'pexels',
        'istockphoto.com': 'istock',
        'www.istockphoto.com': 'istock',
        'gettyimages.com': 'gettyimages',
        'vecteezy.com': 'vecteezy',
        'flaticon.com': 'flaticon',
        'rawpixel.com': 'rawpixel'
      }
      
      // Find matching site
      const site = Object.entries(siteMap).find(([domain]) => 
        hostname === domain || hostname.includes(domain)
      )?.[1]
      
      // Extract ID from URL path - handle different URL patterns
      let id = ''
      
      if (hostname.includes('shutterstock.com')) {
        // For Shutterstock: extract from /image-photo/title-ID or just the ID at the end
        const match = url.match(/-(\d+)(?:\?|$)/)
        id = match ? match[1] : ''
      } else if (hostname.includes('stock.adobe.com')) {
        // For Adobe Stock: extract ID from various patterns
        const match = url.match(/\/(\d+)(?:\?|$)/)
        id = match ? match[1] : ''
      } else {
        // Generic extraction for other sites
        const pathParts = urlObj.pathname.split('/').filter(Boolean)
        id = pathParts[pathParts.length - 1]?.split('-')[0] || pathParts[pathParts.length - 1] || ''
      }
      
      console.log('Extracted:', { site, id, url, hostname })
      return { site, id }
    } catch (error) {
      console.error('URL parsing error:', error)
      return { site: null, id: null }
    }
  }

  // Step 1: Get stock information
  const handleGetStockInfo = async () => {
    if (!stockUrl.trim()) {
      setError('Please enter a valid stock media URL')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setStep(1)
    setProgress(25)

    try {
      const { site, id } = extractSiteAndId(stockUrl)
      
      if (!site || !id) {
        throw new Error('Could not extract site and ID from URL. Please check the URL format.')
      }

      console.log('Getting stock info for:', { site, id, url: stockUrl })

      const response = await fetch('/api/stock/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ site, id, url: stockUrl })
      })

      const data = await response.json()
      console.log('Stock info response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get stock information')
      }

      if (data.success && data.stockInfo) {
        setStockInfo(data.stockInfo)
        setStep(2)
        setProgress(50)
        setSuccess('Stock information loaded successfully!')
      } else {
        throw new Error(data.message || 'Invalid response from stock API')
      }
    } catch (err) {
      console.error('Stock info error:', err)
      setError(err instanceof Error ? err.message : 'Failed to get stock information')
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Place order
  const handlePlaceOrder = async () => {
    if (!stockInfo) return

    if (userPoints.currentPoints < stockInfo.cost) {
      setError(`Insufficient points. You need ${stockInfo.cost} points but only have ${userPoints.currentPoints}`)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setStep(3)
    setProgress(75)

    try {
      const { site, id } = extractSiteAndId(stockUrl)
      
      console.log('Placing order with:', { site, id, url: stockUrl, cost: stockInfo.cost })
      
      const response = await fetch('/api/stock/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          site, 
          id, 
          url: stockUrl, 
          cost: stockInfo.cost 
        })
      })

      const data = await response.json()
      console.log('Order API response:', { status: response.status, data })

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to place order'
        
        if (data.details) {
          if (typeof data.details === 'string') {
            errorMessage += `: ${data.details}`
          } else if (data.details.message) {
            errorMessage += `: ${data.details.message}`
          }
        }
        
        throw new Error(errorMessage)
      }

      if (data.success && data.taskId) {
        setOrderStatus({ 
          taskId: data.taskId, 
          status: 'processing' 
        })
        setStep(4)
        setProgress(85)
        setSuccess('Order placed successfully! Processing your download...')
        
        // Start polling for status
        startStatusPolling(data.taskId)
        
        // Reload points to show deduction
        loadUserPoints()
        
        console.log('Order placed successfully:', data.taskId)
      } else {
        throw new Error(data.message || 'Invalid response from order API')
      }
    } catch (err) {
      console.error('Order placement failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Poll order status
  const startStatusPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        console.log('Polling status for task:', taskId)
        
        const response = await fetch('/api/stock/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ taskId })
        })

        const data = await response.json()
        console.log('Status response:', data)

        if (data.success) {
          if (data.status === 'ready' || data.status === 'completed') {
            setOrderStatus(prev => prev ? { ...prev, status: 'ready' } : null)
            setProgress(100)
            setSuccess('Your download is ready!')
            clearInterval(interval)
            setPollingInterval(null)
            
            // Auto-generate download link
            setTimeout(() => {
              handleGenerateDownload()
            }, 1000)
          } else if (data.status === 'error' || data.status === 'failed') {
            setOrderStatus(prev => prev ? { ...prev, status: 'error' } : null)
            setError('Order processing failed. Please try again.')
            clearInterval(interval)
            setPollingInterval(null)
          }
          // Continue polling for 'processing' status
        }
      } catch (err) {
        console.error('Status polling error:', err)
      }
    }, 5000) // Poll every 5 seconds

    setPollingInterval(interval)
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
      setPollingInterval(null)
      if (orderStatus?.status === 'processing') {
        setError('Processing timeout. Please contact support.')
      }
    }, 300000) // 5 minutes
  }

  // Step 4: Generate download link
  const handleGenerateDownload = async () => {
    if (!orderStatus?.taskId) return

    setLoading(true)
    setError('')

    try {
      console.log('Generating download for task:', orderStatus.taskId)
      
      const response = await fetch('/api/stock/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          taskId: orderStatus.taskId,
          responseType: 'any'
        })
      })

      const data = await response.json()
      console.log('Download response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download link')
      }

      if (data.success && data.downloadLink) {
        setOrderStatus(prev => prev ? {
          ...prev,
          downloadLink: data.downloadLink,
          fileName: data.fileName,
          linkType: data.linkType
        } : null)
        
        setSuccess('Download link generated! Click to download your file.')
        
        // Auto-download
        const link = document.createElement('a')
        link.href = data.downloadLink
        link.download = data.fileName || 'stock-media-file'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Reload download history
        loadDownloadHistory()
      } else {
        throw new Error(data.message || 'Invalid response from download API')
      }
    } catch (err) {
      console.error('Download generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate download link')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStockUrl('')
    setStockInfo(null)
    setOrderStatus(null)
    setError('')
    setSuccess('')
    setStep(1)
    setProgress(0)
    setLoading(false)
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  const getFileIcon = (ext: string) => {
    if (!ext) return <File className="h-4 w-4" />
    const lower = ext.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(lower)) {
      return <FileImage className="h-4 w-4" />
    }
    if (['mp4', 'avi', 'mov', 'webm'].includes(lower)) {
      return <FileVideo className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Request Stock Media</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter a stock media URL to preview and download with your points
          </p>
        </div>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="font-semibold text-orange-800 dark:text-orange-200">
                  {userPoints.currentPoints} Points Available
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Ready for downloads
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className={step >= 1 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>Enter URL</span>
              <span className={step >= 2 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>Get Info</span>
              <span className={step >= 3 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>Place Order</span>
              <span className={step >= 4 ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>Download</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Input & Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* URL Input */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5" />
                <span>Stock Media URL</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the stock media URL here&#10;&#10;Example:&#10;https://www.shutterstock.com/image-photo/..."
                value={stockUrl}
                onChange={(e) => setStockUrl(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={loading || step > 2}
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleGetStockInfo}
                  disabled={loading || !stockUrl.trim() || step > 2}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {loading && step === 1 ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Get Preview
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={loading}
                  className="px-3"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported Sites */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Supported Sites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {supportedSites.map((site) => (
                  <div key={site.domain} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${site.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <div className="font-medium text-sm">{site.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{site.domain}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${site.color}`}>
                      {site.cost}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Downloads */}
          {downloadHistory.length > 0 && (
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Downloads</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {downloadHistory.slice(0, 3).map((download) => (
                    <div key={download.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      {download.thumbnail ? (
                        <img 
                          src={download.thumbnail} 
                          alt={download.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <FileImage className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{download.title}</div>
                        <div className="text-xs text-gray-500">{download.source} • {download.cost} points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview & Status */}
        <div className="xl:col-span-2 space-y-6">
          {/* Stock Info Preview */}
          {stockInfo && (
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Preview</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      {stockInfo.cost} Points
                    </Badge>
                    <Badge variant="outline">
                      {stockInfo.source}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stockInfo.thumbnail && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={stockInfo.thumbnail} 
                      alt={stockInfo.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-tight">
                      {stockInfo.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{stockInfo.author || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Info className="h-3 w-3" />
                        <span>{stockInfo.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(stockInfo.ext)}
                      <span>
                        <div className="font-medium">Format</div>
                        <div className="text-gray-500">{stockInfo.ext || 'Unknown'}</div>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4" />
                      <span>
                        <div className="font-medium">Size</div>
                        <div className="text-gray-500">
                          {stockInfo.sizeInBytes ? formatFileSize(stockInfo.sizeInBytes) : 'Unknown'}
                        </div>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-orange-500" />
                      <span>
                        <div className="font-medium">Cost</div>
                        <div className="text-orange-600 font-semibold">{stockInfo.cost} points</div>
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={loading || step > 3 || userPoints.currentPoints < stockInfo.cost}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                    size="lg"
                  >
                    {loading && step === 3 ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {userPoints.currentPoints < stockInfo.cost 
                      ? `Need ${stockInfo.cost - userPoints.currentPoints} More Points`
                      : `Download for ${stockInfo.cost} Points`
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Status */}
          {orderStatus && (
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="font-medium">Task ID:</span>
                  <code className="text-sm bg-white dark:bg-gray-700 px-3 py-1 rounded border">
                    {orderStatus.taskId}
                  </code>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Status:</span>
                  {orderStatus.status === 'processing' && (
                    <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing...
                    </Badge>
                  )}
                  {orderStatus.status === 'ready' && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready for Download
                    </Badge>
                  )}
                  {orderStatus.status === 'error' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Processing Failed
                    </Badge>
                  )}
                </div>

                {orderStatus.status === 'processing' && (
                  <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      Your order is being processed. This usually takes 30-90 seconds. Please wait while we prepare your download...
                    </AlertDescription>
                  </Alert>
                )}

                {orderStatus.status === 'ready' && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        Great! Your file is ready for download. Click the button below to get your file.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={handleGenerateDownload}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Generate Download Link
                    </Button>
                    
                    {orderStatus.downloadLink && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">Download Ready!</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {orderStatus.fileName || 'Your file is ready'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(orderStatus.downloadLink, '_blank')}
                            className="border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {orderStatus.status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      There was an error processing your order. Your points have been refunded. Please try again or contact support if the issue persists.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help & Tips */}
          {!stockInfo && !orderStatus && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700 dark:text-blue-300 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold">1</div>
                  <p>Copy the URL from any supported stock media site</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold">2</div>
                  <p>Paste it above and click "Get Preview" to see details and pricing</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold">3</div>
                  <p>Click "Download" and wait for processing (30-90 seconds)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold">4</div>
                  <p>Get your high-quality file without watermarks!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}