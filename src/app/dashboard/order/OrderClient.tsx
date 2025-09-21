'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Link as LinkIcon, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Coins,
  ShoppingCart,
  ExternalLink,
  FileImage,
  FileText,
  FileVideo,
  FileMusic,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Types
interface PreOrderItem {
  url: string
  parsedData?: {
    source: string
    id: string
  } | null
  stockSite?: {
    id: string
    name: string
    displayName: string
    cost: number
  } | null
  stockInfo?: {
    title: string
    type: string
    previewUrl?: string
    price: number
    points: number
  } | null
  success: boolean
  error?: string
}

interface ConfirmedOrder {
  id: string
  title: string
  source: string
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
  estimatedTime?: string
  points: number
}

type OrderStep = 'input' | 'confirmation' | 'progress'

export default function OrderClient() {
  const [step, setStep] = useState<OrderStep>('input')
  const [urls, setUrls] = useState('')
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([])
  const [confirmedOrders, setConfirmedOrders] = useState<ConfirmedOrder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [isTrackingProgress, setIsTrackingProgress] = useState(false)
  const router = useRouter()

  // Fetch user points on mount
  useEffect(() => {
    fetchUserPoints()
  }, [])

  // Poll order status when in progress step
  useEffect(() => {
    if (step === 'progress' && confirmedOrders.length > 0) {
      setIsTrackingProgress(true)
      const interval = setInterval(() => {
        pollOrderStatus()
      }, 5000) // Poll every 5 seconds

      return () => {
        clearInterval(interval)
        setIsTrackingProgress(false)
      }
    }
  }, [step, confirmedOrders])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setUserPoints(data.data?.currentPoints || 0)
      }
    } catch (error) {
      console.error('Error fetching user points:', error)
    }
  }

  const parseUrls = async () => {
    if (!urls.trim()) {
      toast.error('Please enter at least one URL')
      return
    }

    setIsLoading(true)
    const urlList = urls.split('\n').map(url => url.trim()).filter(url => url.length > 0)
    const items: PreOrderItem[] = urlList.map(url => ({
      url,
      parsedData: null,
      stockSite: null,
      stockInfo: null,
      success: false
    }))
    
    setPreOrderItems(items)

    // Parse each URL and fetch stock info
    const results = await Promise.allSettled(
      urlList.map(async (url, index) => {
        try {
          const response = await fetch('/api/stock-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || errorData.error || 'Failed to fetch stock info')
          }

          const data = await response.json()
          console.log('Debug - API response for URL:', url)
          console.log('Debug - API response data:', JSON.stringify(data, null, 2))
          return { index, data }
        } catch (error) {
          return { index, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      })
    )

    // Update items with results
    const updatedItems = [...items]
    console.log('Debug - Processing results:', results)
    console.log('Debug - Initial items:', items)
    
    results.forEach((result, index) => {
      console.log(`Debug - Processing result ${index}:`, result)
      if (result.status === 'fulfilled') {
        const { data, error } = result.value
        console.log(`Debug - Result ${index} data:`, data)
        console.log(`Debug - Result ${index} error:`, error)
        
        if (error) {
          updatedItems[index] = {
            ...updatedItems[index],
            success: false,
            error
          }
        } else {
          console.log(`Debug - Creating item ${index} with data:`, JSON.stringify(data, null, 2))
          console.log(`Debug - data.parsedData:`, data.parsedData)
          console.log(`Debug - data.stockSite:`, data.stockSite)
          console.log(`Debug - data.stockInfo:`, data.stockInfo)
          
          const newItem = {
            ...updatedItems[index],
            parsedData: data.parsedData,
            stockSite: data.stockSite,
            stockInfo: {
              ...data.stockInfo,
              title: `${data.parsedData?.source || 'unknown'}-${data.parsedData?.id || 'unknown'}`
            },
            success: true
          }
          
          console.log(`Debug - Created item ${index}:`, JSON.stringify(newItem, null, 2))
          updatedItems[index] = newItem
        }
      } else {
        console.log(`Debug - Result ${index} rejected:`, result.reason)
        updatedItems[index] = {
          ...updatedItems[index],
          success: false,
          error: 'Failed to process URL'
        }
      }
    })

    console.log('Debug - Final updatedItems:', JSON.stringify(updatedItems, null, 2))
    setPreOrderItems(updatedItems)
    setIsLoading(false)

    // Move to confirmation step if we have at least one successful item
    const successfulItems = updatedItems.filter(item => item.success)
    if (successfulItems.length > 0) {
      setStep('confirmation')
      toast.success(`Successfully parsed ${successfulItems.length} of ${urlList.length} URLs`)
    } else {
      toast.error('Failed to parse any URLs. Please check the URLs and try again.')
    }
  }

  const confirmOrder = async () => {
    const successfulItems = preOrderItems.filter(item => item.success)
    if (successfulItems.length === 0) {
      toast.error('No valid items to order')
      return
    }

    const totalPoints = successfulItems.reduce((sum, item) => sum + (item.stockInfo?.points || 0), 0)
    if (userPoints < totalPoints) {
      toast.error(`Insufficient points. You need ${totalPoints} points but only have ${userPoints}`)
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: successfulItems.map(item => ({
            url: item.url,
            source: item.parsedData?.source,
            id: item.parsedData?.id,
            points: item.stockInfo?.points || 10
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to place order')
      }

      const data = await response.json()
      
      // Convert to confirmed orders format
      const orders: ConfirmedOrder[] = data.orders?.map((order: any) => ({
        id: order.id,
        title: order.fileName || 'Unknown File',
        source: order.stockSite?.name || 'Unknown',
        status: 'PENDING',
        points: order.cost || 10,
        estimatedTime: '2-5 minutes'
      })) || []

      setConfirmedOrders(orders)
      setStep('progress')
      
      // Update user points
      await fetchUserPoints()
      
      toast.success(`Order placed successfully! ${orders.length} items are being processed.`)
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
    } finally {
      setIsProcessing(false)
    }
  }

  const pollOrderStatus = async () => {
    try {
      const statusPromises = confirmedOrders.map(order => 
        fetch(`/api/orders/${order.id}/status`)
      )
      
      const responses = await Promise.all(statusPromises)
      const statusData = await Promise.all(
        responses.map(response => response.json())
      )

      // Update orders with new status
      const updatedOrders = confirmedOrders.map((order, index) => {
        const statusInfo = statusData[index]
        if (statusInfo && statusInfo.order) {
          return {
            ...order,
            status: statusInfo.order.status,
            downloadUrl: statusInfo.order.downloadUrl,
            estimatedTime: statusInfo.estimatedTime
          }
        }
        return order
      })

      setConfirmedOrders(updatedOrders)

      // Check for status changes and show notifications
      updatedOrders.forEach((order, index) => {
        const oldOrder = confirmedOrders[index]
        if (oldOrder.status !== order.status) {
          if (order.status === 'READY' || order.status === 'COMPLETED') {
            toast.success(`${order.title} is ready for download!`, {
              duration: 5000,
              icon: '🎉'
            })
          } else if (order.status === 'FAILED') {
            toast.error(`${order.title} failed to process`, {
              duration: 5000,
              icon: '❌'
            })
          }
        }
      })

      // Stop tracking if all orders are complete
      const allComplete = updatedOrders.every(order => 
        order.status === 'COMPLETED' || order.status === 'FAILED'
      )
      
      if (allComplete) {
        setIsTrackingProgress(false)
        toast.success('All orders completed!', { icon: '✅' })
      }
    } catch (error) {
      console.error('Error polling order status:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    if (!type) return <FileText className="h-4 w-4" />
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
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full"
    
    switch (status) {
      case 'PENDING':
        return (
          <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-300 border-yellow-500/30`}>
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'PROCESSING':
        return (
          <Badge className={`${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/30`}>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case 'READY':
      case 'COMPLETED':
        return (
          <Badge className={`${baseClasses} bg-green-500/20 text-green-300 border-green-500/30`}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge className={`${baseClasses} bg-red-500/20 text-red-300 border-red-500/30`}>
            <X className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className={`${baseClasses} bg-gray-500/20 text-gray-300 border-gray-500/30`}>
            {status}
          </Badge>
        )
    }
  }

  const totalPoints = preOrderItems
    .filter(item => item.success)
    .reduce((sum, item) => sum + (item.stockInfo?.points || 0), 0)

  // Debug logging
  console.log('Debug - preOrderItems:', preOrderItems)
  console.log('Debug - successful items:', preOrderItems.filter(item => item.success))
  console.log('Debug - totalPoints:', totalPoints)

  const canPlaceOrder = userPoints >= totalPoints && totalPoints > 0

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step === 'input' ? 'text-white' : 'text-white/50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'input' ? 'bg-blue-500' : 'bg-white/20'
          }`}>
            <span className="text-sm font-bold">1</span>
          </div>
          <span className="text-sm font-medium">Enter URLs</span>
        </div>
        <ArrowRight className="h-4 w-4 text-white/30" />
        <div className={`flex items-center space-x-2 ${step === 'confirmation' ? 'text-white' : 'text-white/50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'confirmation' ? 'bg-blue-500' : 'bg-white/20'
          }`}>
            <span className="text-sm font-bold">2</span>
          </div>
          <span className="text-sm font-medium">Confirm Order</span>
        </div>
        <ArrowRight className="h-4 w-4 text-white/30" />
        <div className={`flex items-center space-x-2 ${step === 'progress' ? 'text-white' : 'text-white/50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'progress' ? 'bg-blue-500' : 'bg-white/20'
          }`}>
            <span className="text-sm font-bold">3</span>
          </div>
          <span className="text-sm font-medium">Track Progress</span>
        </div>
      </div>

      {/* Input Step */}
      {step === 'input' && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <LinkIcon className="h-5 w-5 mr-2" />
              Enter Stock Media URLs
            </CardTitle>
            <CardDescription className="text-white/70">
              Paste URLs from supported stock media sites, one per line
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://www.shutterstock.com/image-photo/beautiful-landscape-mountains-1234567890&#10;https://www.gettyimages.com/detail/photo/portrait-person-1234567890&#10;https://www.unsplash.com/photos/1234567890"
              className="min-h-32 bg-white/5 border-white/20 text-white placeholder:text-white/50"
              disabled={isLoading}
            />
            
            <div className="flex justify-between items-center">
              <Typography variant="caption" className="text-white/60">
                Enter multiple URLs separated by new lines
              </Typography>
              <Button
                onClick={parseUrls}
                disabled={isLoading || !urls.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Get File Information
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Step */}
      {step === 'confirmation' && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Confirm Your Order
            </CardTitle>
            <CardDescription className="text-white/70">
              Review your items and confirm the purchase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items List */}
            <div className="space-y-4">
              {preOrderItems.filter(item => item.success).map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                  <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                    {item.stockInfo?.previewUrl ? (
                      <img 
                        src={item.stockInfo.previewUrl} 
                        alt={item.stockInfo.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      getTypeIcon(item.stockInfo?.type || 'image')
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Typography variant="body" className="text-white font-medium truncate">
                      {item.stockInfo?.title || 'Unknown File'}
                    </Typography>
                    <Typography variant="caption" className="text-white/60">
                      {item.stockSite?.displayName || 'Unknown Source'}
                    </Typography>
                  </div>
                  
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {item.stockInfo?.points || 10} points
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Failed Items */}
            {preOrderItems.filter(item => !item.success && item.error).length > 0 && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  <div className="font-medium mb-2">Failed to process {preOrderItems.filter(item => !item.success && item.error).length} URLs:</div>
                  {preOrderItems.filter(item => !item.success && item.error).map((item, index) => (
                    <div key={index} className="text-sm">
                      • {item.url} - {item.error}
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Order Summary */}
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Typography variant="body" className="text-white/80">
                  Total Cost
                </Typography>
                <Typography variant="h4" className="text-white font-semibold">
                  {totalPoints.toLocaleString()} points
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body" className="text-white/80">
                  Your Balance
                </Typography>
                <Typography variant="body" className="text-white">
                  {userPoints.toLocaleString()} points
                </Typography>
              </div>
              <div className="flex justify-between items-center">
                <Typography variant="body" className="text-white/80">
                  After Purchase
                </Typography>
                <Typography variant="body" className="text-white">
                  {(userPoints - totalPoints).toLocaleString()} points
                </Typography>
              </div>
            </div>

            {/* Insufficient Points Warning */}
            {!canPlaceOrder && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  <div className="space-y-2">
                    <div>
                      Insufficient points. You need {totalPoints.toLocaleString()} points but only have {userPoints.toLocaleString()}.
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push('/pricing')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Coins className="h-4 w-4 mr-1" />
                        Add Points
                      </Button>
                      <Typography variant="caption" className="text-red-300">
                        You need {(totalPoints - userPoints).toLocaleString()} more points
                      </Typography>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to URLs
              </Button>
              
              <Button
                onClick={confirmOrder}
                disabled={!canPlaceOrder || isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Place Order
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Step */}
      {step === 'progress' && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Download className="h-5 w-5 mr-2" />
              Order Progress
              {isTrackingProgress && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-400" />
              )}
            </CardTitle>
            <CardDescription className="text-white/70">
              {isTrackingProgress ? 'Live tracking enabled' : 'All orders completed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {confirmedOrders.map((order, index) => (
              <div key={order.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                  <FileImage className="h-8 w-8 text-white/60" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Typography variant="body" className="text-white font-medium truncate">
                    {order.title}
                  </Typography>
                  <Typography variant="caption" className="text-white/60">
                    {order.source} • {order.points} points
                  </Typography>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.status)}
                  
                  {order.status === 'READY' && order.downloadUrl && (
                    <Button
                      size="sm"
                      onClick={() => window.open(order.downloadUrl, '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Progress Info */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center text-white/80 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  {isTrackingProgress 
                    ? 'Orders are being processed. This page will update automatically.'
                    : 'All orders have been completed.'
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('input')
                  setUrls('')
                  setPreOrderItems([])
                  setConfirmedOrders([])
                }}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Place New Order
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}