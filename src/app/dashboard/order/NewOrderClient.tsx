'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Link as LinkIcon, 
  Coins,
  ShoppingCart,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { UnifiedOrderItem, UnifiedOrderItemData } from '@/components/dashboard/UnifiedOrderItem'
import PointsOverview from '@/components/dashboard/PointsOverview'
import OrderItemSkeleton from '@/components/dashboard/OrderItemSkeleton'
import EmptyState from '@/components/dashboard/EmptyState'
import useUserStore from '@/stores/userStore'

// Removed fetcher - using direct fetch calls

export default function NewOrderClient() {
  const [urls, setUrls] = useState('')
  const [items, setItems] = useState<UnifiedOrderItemData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const searchParams = useSearchParams()

  // Use centralized user store for points
  const { points: userPoints, updatePoints } = useUserStore()

  // Function to fetch info for URLs
  const processUrls = useCallback(async (urlList: string[]) => {
    if (urlList.length === 0) {
      toast.error('Please enter at least one URL')
      return
    }

    if (urlList.length > 5) {
      toast.error('Maximum 5 URLs allowed per order')
      return
    }

    setIsLoading(true)
    setItems([])

    try {
      const results = await Promise.all(
        urlList.map(async (url) => {
          try {
            const response = await fetch(`/api/stock-info?url=${encodeURIComponent(url)}`)
            if (!response.ok) throw new Error('Network error')
            const data = await response.json()
            if (!data.success) throw new Error(data.error || 'Failed to parse')
            
            return {
              url,
              parsedData: data.data.parsedData,
              stockSite: data.data.stockSite,
              stockInfo: data.data.stockInfo,
              status: 'ready' as const
            }
          } catch (error) {
            return {
              url,
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )
      
      setItems(results)
      const successfulItems = results.filter(item => item.status === 'ready')
      
      if (successfulItems.length === 0) {
        toast.error('No URLs could be processed. Please check the URLs and try again.')
      } else if (successfulItems.length < results.length) {
        toast.success(`${successfulItems.length} of ${results.length} URLs processed successfully`)
      } else {
        toast.success(`${successfulItems.length} URLs processed successfully`)
      }
    } catch (error) {
      console.error('Error processing URLs:', error)
      toast.error('Failed to process URLs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle URL input
  const handleParseUrls = () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
    
    processUrls(urlList)
  }

  // Load URLs from search params
  useEffect(() => {
    const urlsParam = searchParams.get('urls')
    if (urlsParam) {
      try {
        const decodedUrls = JSON.parse(decodeURIComponent(urlsParam))
        if (Array.isArray(decodedUrls)) {
          setUrls(decodedUrls.join('\n'))
          processUrls(decodedUrls)
        }
      } catch (e) {
        console.error('Failed to parse URLs from params', e)
      }
    }
  }, [searchParams, processUrls])

  // Order handling
  const handlePlaceOrder = async (itemsToOrder: UnifiedOrderItemData[]) => {
    const totalCost = itemsToOrder.reduce((acc, item) => acc + (item.stockInfo?.points || 0), 0)

    if (userPoints === null || userPoints < totalCost) {
      toast.error(`Insufficient points. You need ${totalCost} points but only have ${userPoints || 0}`)
      return
    }
    
    setIsProcessing(true)
    
    // Set status to 'ordering' for visual feedback
    setItems(currentItems =>
      currentItems.map(item =>
        itemsToOrder.some(orderItem => orderItem.url === item.url)
          ? { ...item, status: 'ordering' as const }
          : item
      )
    )

    try {
      const orderPayload = itemsToOrder.map(item => ({
        url: item.url,
        site: item.stockSite?.name || item.parsedData?.source,
        id: item.stockInfo?.id || item.parsedData?.id,
        title: item.stockInfo?.title || 'Unknown',
        cost: item.stockInfo?.points || 0,
        imageUrl: item.stockInfo?.image
      }))

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      const result = await response.json()

      if (result.success && result.orders) {
        toast.success(`${result.orders.length} order(s) placed successfully! Now processing...`)
        // Update points in centralized store
        const newPoints = userPoints - totalCost
        updatePoints(newPoints)
        
        // Update items to 'processing'
        setItems(currentItems =>
          currentItems.map(item => {
            const orderedItem = result.orders.find((o: any) => o.originalUrl === item.url)
            return orderedItem ? { 
              ...item, 
              status: 'processing' as const, 
              orderId: orderedItem.id,
              progress: 0
            } : item
          })
        )

        // Simulate processing progress
        const processingItems = itemsToOrder.map(item => item.url)
        let progress = 0
        const progressInterval = setInterval(() => {
          progress += 10
          setItems(currentItems =>
            currentItems.map(item =>
              processingItems.includes(item.url) && item.status === 'processing'
                ? { ...item, progress: Math.min(progress, 90) }
                : item
            )
          )
          
          if (progress >= 90) {
            clearInterval(progressInterval)
            // Simulate completion after a delay
            setTimeout(() => {
              setItems(currentItems =>
                currentItems.map(item =>
                  processingItems.includes(item.url) && item.status === 'processing'
                    ? { 
                        ...item, 
                        status: 'completed' as const, 
                        progress: 100,
                        downloadUrl: `https://example.com/download/${item.orderId}` // Mock download URL
                      }
                    : item
                )
              )
              toast.success('All orders completed! Download links are now available.')
            }, 2000)
          }
        }, 500)

      } else {
        toast.error(result.error || 'Failed to place orders.')
        // Revert status to 'ready' on failure
        setItems(currentItems =>
          currentItems.map(item =>
            itemsToOrder.some(orderItem => orderItem.url === item.url)
              ? { ...item, status: 'ready' as const, error: result.error }
              : item
          )
        )
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error('Failed to place orders. Please try again.')
      // Revert status to 'ready' on error
      setItems(currentItems =>
        currentItems.map(item =>
          itemsToOrder.some(orderItem => orderItem.url === item.url)
            ? { ...item, status: 'ready' as const, error: 'Network error' }
            : item
        )
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveItem = (url: string) => {
    setItems(currentItems => currentItems.filter(item => item.url !== url))
  }

  const readyItems = items.filter(item => item.status === 'ready')
  const totalCost = readyItems.reduce((acc, item) => acc + (item.stockInfo?.points || 0), 0)
  const orderedItems = items.filter(item => item.status !== 'ready' && item.status !== 'failed')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Create New Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* URL Input Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Enter Stock Media URLs
              </CardTitle>
              <Typography variant="body" className="text-white/70">
                Paste up to 5 URLs (one per line) from supported stock media sites.
              </Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="https://www.shutterstock.com/image-photo/example-1234567890
https://depositphotos.com/example-345678"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="min-h-[200px] bg-white/5 border-white/30 text-white placeholder:text-white/50 resize-none"
              />
              <div className="flex gap-3">
                <Button 
                  onClick={handleParseUrls}
                  disabled={isLoading || !urls.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing URLs...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Get File Information
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Items
              </CardTitle>
              <Typography variant="body" className="text-white/70">
                {items.length} items • {readyItems.length} ready to order • {orderedItems.length} ordered
              </Typography>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  // Show skeleton loaders while processing URLs
                  Array.from({ length: 3 }).map((_, index) => (
                    <OrderItemSkeleton key={`skeleton-${index}`} />
                  ))
                ) : items.length === 0 ? (
                  <EmptyState 
                    type="no-items" 
                    onAction={() => setUrls('')}
                    actionText="Add URLs"
                  />
                ) : readyItems.length === 0 && orderedItems.length > 0 ? (
                  <EmptyState 
                    type="all-ordered" 
                    onAction={() => setUrls('')}
                    actionText="Add More URLs"
                  />
                ) : (
                  items.map((item, index) => (
                    <UnifiedOrderItem 
                      key={item.url + index} 
                      item={item} 
                      onOrder={() => handlePlaceOrder([item])} 
                      onRemove={handleRemoveItem}
                      userPoints={userPoints || 0}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Bulk Order Section */}
          {readyItems.length > 0 && (
            <div className="mt-6 flex justify-between items-center gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="text-right">
                <Typography variant="h3" className="text-white font-bold">
                  {readyItems.length} Item(s) Ready to Order
                </Typography>
                <Typography variant="body" className="text-white/70">
                  Total Cost: {totalCost} Points
                </Typography>
              </div>
              <Button 
                onClick={() => handlePlaceOrder(readyItems)} 
                size="lg"
                disabled={isProcessing || (userPoints || 0) < totalCost}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Order All
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Points Overview */}
          <PointsOverview />

          {/* Order Summary */}
          {items.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
                <Typography variant="body" className="text-white/70">
                  Current order breakdown
                </Typography>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Transaction Summary */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/20 mb-4">
                  <h3 className="font-bold text-lg mb-3 text-white">Transaction Summary</h3>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between text-white/90">
                      <span>Your Current Balance:</span>
                      <span className="font-medium text-white">{userPoints?.toLocaleString() || '...'} Points</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Total Cost of this Order:</span>
                      <span className="font-medium text-red-300">- {totalCost} Points</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 mt-3">
                      <div className="flex justify-between font-bold text-lg text-white">
                        <span>Balance After Purchase:</span>
                        <span className="text-green-300">{(userPoints || 0) - totalCost} Points</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-white/90">
                    <span>Total Items:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Ready to Order:</span>
                    <span className="font-medium text-green-300">{readyItems.length}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Processing/Ordered:</span>
                    <span className="font-medium text-blue-300">{orderedItems.length}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Failed:</span>
                    <span className="font-medium text-red-300">{items.filter(item => item.status === 'failed').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
