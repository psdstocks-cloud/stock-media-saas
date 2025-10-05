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
  Star, 
  Clock,
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
  Info
} from 'lucide-react'

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

const supportedSites = [
  { name: 'Shutterstock', id: 'shutterstock', cost: '1-5 points', active: true },
  { name: 'Adobe Stock', id: 'adobestock', cost: '1-8 points', active: true },
  { name: 'Freepik', id: 'freepik', cost: '0.15 points', active: true },
  { name: 'Unsplash', id: 'unsplash', cost: '0.1 points', active: true },
  { name: 'Pexels', id: 'pexels', cost: '0.1 points', active: true },
  { name: 'iStock', id: 'istock', cost: '2-16 points', active: true },
  { name: 'Getty Images', id: 'gettyimages', cost: '16+ points', active: true },
  { name: 'Vecteezy', id: 'vecteezy', cost: '0.3 points', active: true },
  { name: 'Flaticon', id: 'flaticon', cost: '0.25 points', active: true },
  { name: 'Rawpixel', id: 'rawpixel', cost: '0.5 points', active: true }
]

export default function BrowsePage() {
  const [userPoints, setUserPoints] = useState<UserPoints>({ currentPoints: 0, totalEarned: 0, totalSpent: 0 })
  const [stockUrl, setStockUrl] = useState('')
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [progress, setProgress] = useState(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadUserPoints()
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
    setStep(1)
    setProgress(25)

    try {
      const { site, id } = extractSiteAndId(stockUrl)
      
      if (!site || !id) {
        throw new Error('Could not extract site and ID from URL')
      }

      const response = await fetch('/api/stock/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ site, id, url: stockUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get stock information')
      }

      if (data.success && data.stockInfo) {
        setStockInfo(data.stockInfo)
        setStep(2)
        setProgress(50)
      } else {
        throw new Error(data.message || 'Invalid response from stock API')
      }
    } catch (err) {
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
    setStep(2)
    setProgress(75)

    try {
      const { site, id } = extractSiteAndId(stockUrl)
      
      const response = await fetch('/api/stock/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ site, id, url: stockUrl, cost: stockInfo.cost })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      if (data.success && data.taskId) {
        setOrderStatus({ 
          taskId: data.taskId, 
          status: 'processing' 
        })
        setStep(3)
        setProgress(85)
        
        // Start polling for status
        startStatusPolling(data.taskId)
        
        // Reload points to show deduction
        loadUserPoints()
      } else {
        throw new Error(data.message || 'Invalid response from order API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Poll order status
  const startStatusPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/stock/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ taskId })
        })

        const data = await response.json()

        if (data.success) {
          if (data.status === 'ready') {
            setOrderStatus(prev => prev ? { ...prev, status: 'ready' } : null)
            setStep(4)
            setProgress(100)
            clearInterval(interval)
            setPollingInterval(null)
          } else if (data.status === 'error') {
            setOrderStatus(prev => prev ? { ...prev, status: 'error' } : null)
            setError('Order processing failed')
            clearInterval(interval)
            setPollingInterval(null)
          }
        }
      } catch (err) {
        console.error('Status polling error:', err)
      }
    }, 3000) // Poll every 3 seconds

    setPollingInterval(interval)
  }

  // Step 4: Generate download link
  const handleGenerateDownload = async () => {
    if (!orderStatus?.taskId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stock/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          taskId: orderStatus.taskId,
          responseType: 'any' // Get direct download link ASAP
        })
      })

      const data = await response.json()

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
        
        // Trigger download
        window.open(data.downloadLink, '_blank')
      } else {
        throw new Error(data.message || 'Invalid response from download API')
      }
    } catch (err) {
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
        
        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
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
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className={step >= 1 ? 'text-orange-600 dark:text-orange-400' : ''}>Enter URL</span>
              <span className={step >= 2 ? 'text-orange-600 dark:text-orange-400' : ''}>Get Info</span>
              <span className={step >= 3 ? 'text-orange-600 dark:text-orange-400' : ''}>Place Order</span>
              <span className={step >= 4 ? 'text-orange-600 dark:text-orange-400' : ''}>Download</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* URL Input */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <LinkIcon className="h-5 w-5" />
                <span>Stock Media URL</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the stock media URL here (e.g., https://www.shutterstock.com/image-photo/...)"
                value={stockUrl}
                onChange={(e) => setStockUrl(e.target.value)}
                className="min-h-[100px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                disabled={loading || step > 1}
              />
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleGetStockInfo}
                  disabled={loading || !stockUrl.trim() || step > 1}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
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
                  className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported Sites */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Star className="h-5 w-5" />
                <span>Supported Sites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {supportedSites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{site.name}</span>
                    <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                      {site.cost}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Info Preview */}
          {stockInfo && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                    <Eye className="h-5 w-5" />
                    <span>Preview</span>
                  </div>
                  <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                    {stockInfo.cost} Points
                  </Badge>
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
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {stockInfo.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      by {stockInfo.author || 'Unknown'} • {stockInfo.source}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      {getFileIcon(stockInfo.ext)}
                      <span>Format: {stockInfo.ext || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <Info className="h-4 w-4" />
                      <span>Size: {stockInfo.sizeInBytes ? `${(stockInfo.sizeInBytes / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={loading || step > 2 || userPoints.currentPoints < stockInfo.cost}
                    className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                    size="lg"
                  >
                    {loading && step === 2 ? (
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
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                  <Clock className="h-5 w-5" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Task ID:</span>
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                    {orderStatus.taskId}
                  </code>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  {orderStatus.status === 'processing' && (
                    <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing...
                    </Badge>
                  )}
                  {orderStatus.status === 'ready' && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                  {orderStatus.status === 'error' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>

                {orderStatus.status === 'processing' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your order is being processed. This usually takes 30-60 seconds. Please wait...
                    </AlertDescription>
                  </Alert>
                )}

                {orderStatus.status === 'ready' && (
                  <div className="space-y-3">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your file is ready for download!
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={handleGenerateDownload}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
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
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">Download Ready!</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {orderStatus.fileName || 'Your file'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(orderStatus.downloadLink, '_blank')}
                            className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}