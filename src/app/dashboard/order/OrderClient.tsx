'use client'

import { useEffect } from 'react'
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
  FileVideo,
  FileMusic
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useOrderStore } from '@/stores/orderStore'

export default function OrderClient() {
  const {
    urls,
    isLoading,
    preOrderItems,
    isConfirming,
    userPoints,
    setUrls,
    parseUrls,
    confirmOrder,
    clearOrder,
    removePreOrderItem,
    getTotalPoints,
    getSuccessfulItems,
    getFailedItems,
    canPlaceOrder,
    setUserPoints
  } = useOrderStore()

  // Fetch user points on component mount
  useEffect(() => {
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

    fetchUserPoints()
  }, [setUserPoints])

  const handleGetFileInfo = async () => {
    try {
      const result = await parseUrls()
      
      // Show summary toast
      if (result.successCount > 0) {
        toast.success(`Successfully parsed ${result.successCount} URL${result.successCount !== 1 ? 's' : ''}`)
      }
      if (result.errorCount > 0) {
        toast.error(`Failed to parse ${result.errorCount} URL${result.errorCount !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      console.error('Error processing URLs:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process URLs. Please try again.')
    }
  }

  const handleConfirmOrder = async () => {
    try {
      const orders = await confirmOrder()
      toast.success(`Successfully placed ${orders.length} order${orders.length !== 1 ? 's' : ''}!`)
      
      // Redirect to orders page after a delay
      setTimeout(() => {
        window.location.href = '/dashboard?tab=orders'
      }, 2000)
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.')
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
          <LinkIcon className="inline h-8 w-8 mr-3 text-purple-400" />
          Stock Media Order
        </Typography>
        <Typography variant="p" className="text-gray-300 text-lg">
          Paste stock media URLs to get file information and place orders
        </Typography>
        
        {/* User Points Display */}
        <div className="mt-4">
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            <Coins className="h-3 w-3 mr-1" />
            Current Points: {userPoints.toLocaleString()}
          </Badge>
        </div>
      </div>

      {/* Step 1: URL Input */}
      {preOrderItems.length === 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Media URLs
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter one or more stock media URLs (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="https://www.shutterstock.com/image-photo/...&#10;https://www.gettyimages.com/detail/photo/...&#10;https://stock.adobe.com/images/..."
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                rows={8}
              />
              
              <Button
                onClick={handleGetFileInfo}
                disabled={isLoading || !urls.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting File Information...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Get File Information
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Processing URLs...</CardTitle>
            <CardDescription className="text-gray-300">
              Fetching file information for your URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg bg-white/10" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4 bg-white/10" />
                      <Skeleton className="h-3 w-1/2 bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Confirmation View */}
      {preOrderItems.length > 0 && !isLoading && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Order Confirmation
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Review your items before placing the order
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={clearOrder}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pre-order Items */}
              {preOrderItems.map((item, index) => (
                <div key={index} className="border border-white/10 rounded-lg p-4">
                  {item.success && item.stockInfo && item.stockSite ? (
                    <div className="space-y-3">
                      {/* Success Item */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Typography variant="small" className="text-green-400">
                            Ready to order
                          </Typography>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePreOrderItem(index)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Item Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Preview Image */}
                        <div>
                          <img
                            src={item.stockInfo.thumbnailUrl}
                            alt={item.stockInfo.title}
                            className="w-full h-32 object-cover rounded-lg bg-gray-800"
                          />
                        </div>

                        {/* Item Info */}
                        <div className="lg:col-span-2 space-y-3">
                          <div>
                            <Typography variant="h5" className="text-white flex items-center gap-2">
                              {getTypeIcon(item.stockInfo.type)}
                              {item.stockInfo.title}
                            </Typography>
                            <Typography variant="small" className="text-gray-400">
                              {item.stockSite.displayName}
                            </Typography>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Typography variant="label" className="text-gray-300">Type</Typography>
                              <Typography variant="p" className="text-white">
                                {item.stockInfo.type}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="label" className="text-gray-300">Price</Typography>
                              <Typography variant="p" className="text-white font-semibold">
                                ${item.stockInfo.price}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="label" className="text-gray-300">Points Required</Typography>
                              <Typography variant="p" className="text-white font-semibold text-purple-400">
                                {item.stockInfo.points.toLocaleString()}
                              </Typography>
                            </div>
                            <div>
                              <Typography variant="label" className="text-gray-300">Author</Typography>
                              <Typography variant="p" className="text-white">
                                {item.stockInfo.author.name}
                              </Typography>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(item.url, '_blank')}
                              className="border-white/30 text-white hover:bg-white/10"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Original
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Failed Item */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <Typography variant="small" className="text-red-400">
                            Failed to parse
                          </Typography>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePreOrderItem(index)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <Typography variant="small" className="text-red-300 mb-2">
                          URL: {item.url}
                        </Typography>
                        <Typography variant="small" className="text-red-300">
                          Error: {item.error || 'Unknown error occurred'}
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Order Summary */}
              {getSuccessfulItems().length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <Typography variant="h5" className="text-white mb-3 flex items-center">
                    <Coins className="h-5 w-5 mr-2" />
                    Order Summary
                  </Typography>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Typography variant="label" className="text-gray-300">Items</Typography>
                      <Typography variant="p" className="text-white font-semibold">
                        {getSuccessfulItems().length} item{getSuccessfulItems().length !== 1 ? 's' : ''}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="label" className="text-gray-300">Total Points</Typography>
                      <Typography variant="p" className="text-white font-semibold text-purple-400">
                        {getTotalPoints().toLocaleString()}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="label" className="text-gray-300">Your Balance</Typography>
                      <Typography variant="p" className="text-white font-semibold">
                        {userPoints.toLocaleString()}
                      </Typography>
                    </div>
                  </div>

                  {/* Insufficient Points Alert */}
                  {!canPlaceOrder() && (
                    <Alert className="bg-orange-500/10 border-orange-500/20 mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-orange-300">
                        Insufficient points. You need {getTotalPoints().toLocaleString()} points but only have {userPoints.toLocaleString()}.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearOrder}
                      className="flex-1 border-white/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={!canPlaceOrder() || isConfirming}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      {isConfirming ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Confirm & Place Order ({getTotalPoints().toLocaleString()} points)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supported Sites Info */}
      {preOrderItems.length === 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Supported Sites</CardTitle>
            <CardDescription className="text-gray-300">
              We support URLs from these major stock media platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['Shutterstock', 'Getty Images', 'Adobe Stock', 'Unsplash', 'Pexels', 'Pixabay', '123RF', 'Dreamstime', 'iStock', 'Freepik', 'Pond5', 'Storyblocks', 'Envato Elements', 'Canva', 'Vecteezy', 'Bigstock'].map((site) => (
                <span key={site} className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm border border-white/20">
                  {site}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
