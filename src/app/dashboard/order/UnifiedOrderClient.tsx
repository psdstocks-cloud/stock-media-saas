'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Link as LinkIcon, 
  Coins,
  ShoppingCart,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import UnifiedOrderItem, { OrderItemData, OrderStatus } from '@/components/dashboard/UnifiedOrderItem'

type OrderStep = 'input' | 'confirmation'

export default function UnifiedOrderClient() {
  const [step, setStep] = useState<OrderStep>('input')
  const [urls, setUrls] = useState('')
  const [items, setItems] = useState<OrderItemData[]>([])
  const [orderStatuses, setOrderStatuses] = useState<Map<string, OrderStatus>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Fetch user points on mount
  useEffect(() => {
    fetchUserPoints()
  }, [])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setUserPoints(data.points || 0)
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

    const urlList = urls.split('\n').map(url => url.trim()).filter(url => url.length > 0)
    
    // Check link limit (maximum 5 links)
    if (urlList.length > 5) {
      toast.error(`Maximum 5 links allowed per order. You entered ${urlList.length} links. Please remove ${urlList.length - 5} links and try again.`)
      return
    }

    setIsLoading(true)
    
    const initialItems: OrderItemData[] = urlList.map(url => ({
      url,
      parsedData: null,
      stockSite: null,
      stockInfo: null,
      success: false
    }))
    
    setItems(initialItems)

    // Parse each URL and fetch stock info
    const results = await Promise.allSettled(
      urlList.map(async (url) => {
        try {
          const response = await fetch('/api/stock-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          })

          if (!response.ok) {
            throw new Error('Failed to fetch stock info')
          }

          const data = await response.json()
          if (!data.success) {
            throw new Error(data.error || 'Invalid response')
          }

          return {
            url,
            parsedData: data.data.parsedData,
            stockSite: data.data.stockSite,
            stockInfo: data.data.stockInfo,
            success: true
          }
        } catch (error) {
          return {
            url,
            parsedData: null,
            stockSite: null,
            stockInfo: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    // Update items with results
    const updatedItems = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          url: urlList[index],
          parsedData: null,
          stockSite: null,
          stockInfo: null,
          success: false,
          error: result.reason?.message || 'Failed to process URL'
        }
      }
    })

    setItems(updatedItems)
    setIsLoading(false)

    const successfulItems = updatedItems.filter(item => item.success)
    if (successfulItems.length > 0) {
      setStep('confirmation')
      toast.success(`Successfully processed ${successfulItems.length} out of ${urlList.length} URLs`)
    } else {
      toast.error('Failed to parse any URLs. Please check the URLs and try again.')
    }
  }

  const handleOrderItem = async (item: OrderItemData) => {
    if (!item.success || !item.stockInfo || !item.parsedData) {
      toast.error('Invalid item for ordering')
      return
    }

    const itemKey = `${item.parsedData.source}-${item.parsedData.id}`
    if (orderStatuses.has(itemKey)) {
      toast.error('This item is already being processed')
      return
    }

    try {
      const orderData = {
        url: item.url,
        site: item.parsedData.source,
        id: item.parsedData.id,
        title: item.stockInfo.title,
        cost: item.stockInfo.points,
        imageUrl: item.stockInfo.image
      }
      
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to place order')
      }
      
      const data = await response.json()
      
      if (!data.success || !data.orders || data.orders.length === 0) {
        throw new Error(data.error || 'Failed to create order')
      }
      
      const firstOrder = data.orders[0]
      const newOrderStatus: OrderStatus = {
        id: firstOrder.id,
        status: firstOrder.status || 'PENDING',
        downloadUrl: firstOrder.downloadUrl
      }

      // Add order status to tracking
      setOrderStatuses(prev => new Map(prev).set(itemKey, newOrderStatus))
      
      // Start polling for this order
      startOrderStatusPolling(firstOrder.id, itemKey)
      
      // Update user points
      await fetchUserPoints()
      
      toast.success(`Order placed successfully! ${item.stockInfo.title} is being processed.`)
    } catch (error) {
      console.error('Order error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
    }
  }

  const handleRemoveItem = (itemToRemove: OrderItemData) => {
    setItems(prev => prev.filter(item => item.url !== itemToRemove.url))
    
    // Also remove from order tracking if it was ordered
    if (itemToRemove.parsedData) {
      const itemKey = `${itemToRemove.parsedData.source}-${itemToRemove.parsedData.id}`
      setOrderStatuses(prev => {
        const newMap = new Map(prev)
        newMap.delete(itemKey)
        return newMap
      })
    }
  }

  const startOrderStatusPolling = (orderId: string, itemKey: string) => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.order) {
            const updatedStatus: OrderStatus = {
              id: orderId,
              status: data.order.status,
              downloadUrl: data.order.downloadUrl,
              error: data.order.error
            }
            
            setOrderStatuses(prev => new Map(prev).set(itemKey, updatedStatus))
            
            // Stop polling if completed or failed
            if (data.order.status === 'COMPLETED' || data.order.status === 'FAILED') {
              if (pollingInterval) {
                clearInterval(pollingInterval)
                setPollingInterval(null)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error)
      }
    }

    // Poll every 3 seconds
    const interval = setInterval(pollStatus, 3000)
    setPollingInterval(interval)
    
    // Poll immediately
    pollStatus()
  }

  const handleOrderAll = async () => {
    const successfulItems = items.filter(item => item.success && !orderStatuses.has(`${item.parsedData?.source}-${item.parsedData?.id}`))
    
    if (successfulItems.length === 0) {
      toast.error('No items available to order')
      return
    }

    const totalPoints = successfulItems.reduce((sum, item) => sum + (item.stockInfo?.points || 0), 0)
    if (userPoints < totalPoints) {
      toast.error(`Insufficient points. You need ${totalPoints} points but only have ${userPoints}`)
      return
    }

    // Order all items sequentially
    for (const item of successfulItems) {
      await handleOrderItem(item)
      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const successfulItems = items.filter(item => item.success)
  const failedItems = items.filter(item => !item.success)
  const orderedCount = Array.from(orderStatuses.keys()).length
  const totalPoints = successfulItems.reduce((sum, item) => sum + (item.stockInfo?.points || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Order Stock Media</h1>
            <p className="text-white/70 text-lg">Paste your stock media URLs and order them instantly</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-8 mb-8">
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
              <span className="text-sm font-medium">Confirm & Order</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Input Step */}
              {step === 'input' && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Enter Stock Media URLs
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Paste your stock media URLs (one per line, maximum 5 links)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="https://www.shutterstock.com/image-photo/example-123456
https://stock.adobe.com/example-789012
https://depositphotos.com/example-345678"
                      value={urls}
                      onChange={(e) => setUrls(e.target.value)}
                      className="min-h-[200px] bg-white/5 border-white/30 text-white placeholder:text-white/50 resize-none"
                    />
                    <Button 
                      onClick={parseUrls}
                      disabled={isLoading || !urls.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? 'Processing URLs...' : 'Get File Information'}
                    </Button>
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
                      Review your items and place orders individually or all at once
                      <div className="mt-2 text-sm text-blue-300">
                        {items.length} items • {successfulItems.length} ready to order • {orderedCount} ordered
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Items List */}
                    <div className="space-y-4">
                      {items.map((item, index) => {
                        const itemKey = item.parsedData ? `${item.parsedData.source}-${item.parsedData.id}` : item.url
                        const orderStatus = orderStatuses.get(itemKey)
                        
                        return (
                          <UnifiedOrderItem
                            key={item.url}
                            item={item}
                            orderStatus={orderStatus}
                            userPoints={userPoints}
                            isProcessing={isProcessing}
                            onOrder={handleOrderItem}
                            onRemove={handleRemoveItem}
                          />
                        )
                      })}
                    </div>

                    {/* Bulk Order Button */}
                    {successfulItems.length > 1 && orderedCount < successfulItems.length && (
                      <div className="flex justify-between items-center pt-6 border-t border-white/20">
                        <div>
                          <Typography variant="body" className="text-white font-medium">
                            Order all remaining items
                          </Typography>
                          <Typography variant="caption" className="text-white/60">
                            {successfulItems.length - orderedCount} items • {totalPoints - Array.from(orderStatuses.values()).reduce((sum, status) => sum + 10, 0)} points total
                          </Typography>
                        </div>
                        <Button
                          onClick={handleOrderAll}
                          disabled={isProcessing || userPoints < (totalPoints - Array.from(orderStatuses.values()).reduce((sum, status) => sum + 10, 0))}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Order All ({totalPoints - Array.from(orderStatuses.values()).reduce((sum, status) => sum + 10, 0)} pts)
                        </Button>
                      </div>
                    )}

                    {/* Back Button */}
                    <div className="pt-6 border-t border-white/20">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep('input')
                          setItems([])
                          setOrderStatuses(new Map())
                          if (pollingInterval) {
                            clearInterval(pollingInterval)
                            setPollingInterval(null)
                          }
                        }}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Start Over
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Points Overview */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Coins className="h-5 w-5 mr-2" />
                    Your Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {userPoints.toLocaleString()}
                    </div>
                    <div className="text-white/60 text-sm">Available Points</div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              {step === 'confirmation' && items.length > 0 && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-white/80">
                      <span>Total Items:</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Ready to Order:</span>
                      <span>{successfulItems.length - orderedCount}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Already Ordered:</span>
                      <span>{orderedCount}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Failed:</span>
                      <span>{failedItems.length}</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 flex justify-between text-white font-medium">
                      <span>Total Cost:</span>
                      <span>{totalPoints - Array.from(orderStatuses.values()).reduce((sum, status) => sum + 10, 0)} points</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
