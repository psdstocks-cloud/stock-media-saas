'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { 
  Search, 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Link as LinkIcon,
  Zap,
  CreditCard,
  FileImage,
  FileVideo,
  FileMusic
} from 'lucide-react'
import toast from 'react-hot-toast'
import OrderProgressTracker from '@/components/dashboard/OrderProgressTracker'

interface ParsedData {
  source: string
  id: string
  url: string
}

interface StockSite {
  id: string
  name: string
  displayName: string
  cost: number
  isActive: boolean
}

interface StockInfo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  previewUrl: string
  type: string
  category: string
  license: string
  price: number
  points: number
  size: string
  dimensions: { width: number; height: number }
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  createdAt: string
  rating: number
  downloadCount: number
  isAvailable: boolean
  downloadUrl: string
}

interface OrderResponse {
  success: boolean
  message?: string
  order?: {
    id: string
    status: string
    downloadUrl?: string
    estimatedTime?: string
  }
}

export default function OrderPageClient() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [stockSite, setStockSite] = useState<StockSite | null>(null)
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderResponse | null>(null)
  const [userPoints, setUserPoints] = useState(0)
  const [showProgressTracker, setShowProgressTracker] = useState(false)

  // Fetch user points on component mount
  useEffect(() => {
    fetchUserPoints()
  }, [])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setUserPoints(data.data?.currentPoints || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error)
    }
  }

  const handleUrlParse = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setIsLoading(true)
    setParsedData(null)
    setStockSite(null)
    setStockInfo(null)
    setOrderStatus(null)

    try {
      const response = await fetch('/api/stock-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setParsedData(data.parsedData)
        setStockSite(data.stockSite)
        setStockInfo(data.stockInfo)
        toast.success('URL parsed successfully!')
      } else {
        toast.error(data.message || 'Failed to parse URL')
      }
    } catch (error) {
      console.error('URL parsing error:', error)
      toast.error('Failed to parse URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!stockInfo || !stockSite) {
      toast.error('No stock information available')
      return
    }

    if (userPoints < stockInfo.points) {
      toast.error('Insufficient points. Please purchase more points.')
      router.push('/dashboard?tab=subscription')
      return
    }

    setIsOrdering(true)

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          source: parsedData?.source,
          assetId: parsedData?.id,
          title: stockInfo.title,
          price: stockInfo.price,
          points: stockInfo.points,
          type: stockInfo.type,
          thumbnailUrl: stockInfo.thumbnailUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOrderStatus(data)
        toast.success('Order placed successfully!')
        
        // Update user points
        setUserPoints(prev => prev - stockInfo.points)
        
        // Show progress tracker
        if (data.order?.id) {
          setShowProgressTracker(true)
        }
        
        // Redirect to orders tab after a longer delay to allow progress tracking
        setTimeout(() => {
          router.push('/dashboard?tab=orders')
        }, 10000)
      } else {
        toast.error(data.message || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order placement error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsOrdering(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'photo':
      case 'image':
        return <FileImage className="h-4 w-4" />
      case 'video':
        return <FileVideo className="h-4 w-4" />
      case 'audio':
      case 'music':
        return <FileMusic className="h-4 w-4" />
      default:
        return <FileImage className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <Typography variant="h1" className="text-4xl font-bold text-white mb-4">
          <Zap className="inline h-8 w-8 mr-3 text-yellow-400" />
          Stock Media Order
        </Typography>
        <Typography variant="p" className="text-gray-300 text-lg">
          Paste any stock media URL to download instantly
        </Typography>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            Current Points: {userPoints.toLocaleString()}
          </Badge>
        </div>
      </div>

      {/* URL Input Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            Media URL
          </CardTitle>
          <CardDescription className="text-gray-300">
            Paste the URL of any stock media from supported sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://www.shutterstock.com/image-photo/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlParse()}
            />
            <Button
              onClick={handleUrlParse}
              disabled={isLoading || !url.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isLoading ? 'Parsing...' : 'Parse URL'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parsing Results */}
      {parsedData && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              URL Parsed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="label" className="text-gray-300">Source Site</Typography>
                <Typography variant="p" className="text-white font-semibold">
                  {stockSite?.displayName || parsedData.source}
                </Typography>
              </div>
              <div>
                <Typography variant="label" className="text-gray-300">Asset ID</Typography>
                <Typography variant="p" className="text-white font-mono text-sm">
                  {parsedData.id}
                </Typography>
              </div>
            </div>
            <div className="mt-4">
              <Typography variant="label" className="text-gray-300">Original URL</Typography>
              <div className="flex items-center gap-2 mt-1">
                <Typography variant="p" className="text-blue-400 text-sm truncate">
                  {parsedData.url}
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(parsedData.url, '_blank')}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Information */}
      {stockInfo && stockSite && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {getTypeIcon(stockInfo.type)}
              <span className="ml-2">{stockInfo.title}</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              {stockInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview Image */}
              <div>
                <img
                  src={stockInfo.thumbnailUrl}
                  alt={stockInfo.title}
                  className="w-full h-48 object-cover rounded-lg bg-gray-800"
                />
              </div>
              
              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="label" className="text-gray-300">Price</Typography>
                  <Typography variant="p" className="text-white font-semibold">
                    ${stockInfo.price}
                  </Typography>
                </div>
                
                <div className="flex items-center justify-between">
                  <Typography variant="label" className="text-gray-300">Points Required</Typography>
                  <Typography variant="p" className="text-white font-semibold">
                    {stockInfo.points.toLocaleString()}
                  </Typography>
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="label" className="text-gray-300">Type</Typography>
                  <Badge variant="outline" className="text-white border-white/20">
                    {stockInfo.type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="label" className="text-gray-300">Size</Typography>
                  <Typography variant="p" className="text-white">
                    {stockInfo.dimensions.width} × {stockInfo.dimensions.height}
                  </Typography>
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="label" className="text-gray-300">Author</Typography>
                  <Typography variant="p" className="text-white">
                    {stockInfo.author.name}
                  </Typography>
                </div>

                {/* Order Button */}
                <div className="pt-4">
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isOrdering || userPoints < stockInfo.points}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {isOrdering ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : userPoints < stockInfo.points ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Insufficient Points
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Place Order ({stockInfo.points.toLocaleString()} points)
                      </>
                    )}
                  </Button>
                  
                  {userPoints < stockInfo.points && (
                    <Alert className="mt-3 bg-orange-500/10 border-orange-500/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-orange-300">
                        You need {stockInfo.points.toLocaleString()} points but only have {userPoints.toLocaleString()}. 
                        <Button
                          variant="link"
                          onClick={() => router.push('/dashboard?tab=subscription')}
                          className="text-orange-300 p-0 h-auto ml-1"
                        >
                          Purchase more points
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Progress Tracker */}
      {showProgressTracker && orderStatus?.order?.id && (
        <OrderProgressTracker
          orderId={orderStatus.order.id}
          onComplete={() => {
            toast.success('Order completed! You can now download your media.')
          }}
          onError={(error) => {
            toast.error(error)
          }}
        />
      )}

      {/* Order Status */}
      {orderStatus && !showProgressTracker && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {orderStatus.success ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 text-red-400" />
              )}
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatus.success && orderStatus.order ? (
              <div className="space-y-4">
                <Alert className="bg-green-500/10 border-green-500/20">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-300">
                    {orderStatus.message || 'Order placed successfully!'}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="label" className="text-gray-300">Order ID</Typography>
                    <Typography variant="p" className="text-white font-mono">
                      {orderStatus.order.id}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="label" className="text-gray-300">Status</Typography>
                    <Badge variant="outline" className="text-white border-white/20">
                      {orderStatus.order.status}
                    </Badge>
                  </div>
                </div>

                {orderStatus.order.downloadUrl && (
                  <div className="pt-4">
                    <Button
                      onClick={() => window.open(orderStatus.order.downloadUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Now
                    </Button>
                  </div>
                )}

                <Typography variant="p" className="text-gray-300 text-center">
                  Redirecting to your orders in 3 seconds...
                </Typography>
              </div>
            ) : (
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-300">
                  {orderStatus.message || 'Order failed. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supported Sites Info */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Supported Sites</CardTitle>
          <CardDescription className="text-gray-300">
            We support URLs from these major stock media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Shutterstock', 'Getty Images', 'Adobe Stock', 'Unsplash', 'Pexels', 'Pixabay', '123RF', 'Dreamstime', 'iStock', 'Freepik', 'Pond5', 'Storyblocks', 'Envato Elements', 'Canva', 'Vecteezy', 'Bigstock'].map((site) => (
              <Badge key={site} variant="outline" className="text-gray-300 border-white/20">
                {site}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
