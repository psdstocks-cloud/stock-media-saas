'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Typography } from '@/components/ui/typography';
import { 
  Link as LinkIcon, 
  ShoppingCart,
  AlertCircle,
  Loader2,
  CheckCircle,
  Download,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UnifiedOrderItem, UnifiedOrderItemData, OrderStatus } from '@/components/dashboard/UnifiedOrderItem';
import PointsOverview from '@/components/dashboard/PointsOverview';
import useUserStore from '@/stores/userStore';

type OrderStep = 'input' | 'confirmation';

export default function OrderClient() {
  const [urls, setUrls] = useState('');
  const [items, setItems] = useState<UnifiedOrderItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<OrderStep>('input');
  const searchParams = useSearchParams();

  // Use centralized user store for points
  const { points: userPoints, updatePoints } = useUserStore();

  // Function to fetch info for URLs
  const processUrls = useCallback(async (urlList: string[]) => {
    if (urlList.length === 0) {
      toast.error('Please enter at least one URL');
      return;
    }

    if (urlList.length > 5) {
      toast.error('Maximum 5 links allowed per order.');
      return;
    }

    setIsLoading(true);
    
    try {
      const results = await Promise.all(
        urlList.map(async (url) => {
          try {
            const response = await fetch(`/api/stock-info?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Network error');
            }
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to parse');
            
            return {
              ...data.data,
              url,
              status: 'ready' as OrderStatus,
              success: true
            };
          } catch (error: any) {
            return {
              url,
              status: 'failed' as OrderStatus,
              error: error.message,
              success: false
            };
          }
        })
      );

      setItems(results);
      
      const successfulItems = results.filter(item => item.status === 'ready');
      if (successfulItems.length === 0) {
        toast.error('No URLs could be processed. Please check the URLs and try again.');
      } else if (successfulItems.length < results.length) {
        toast.success(`${successfulItems.length} of ${results.length} URLs processed successfully`);
      } else {
        toast.success(`${successfulItems.length} URLs processed successfully`);
      }
      
      if (successfulItems.length > 0) {
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Error processing URLs:', error);
      toast.error('Failed to process URLs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle URL processing from search params
  useEffect(() => {
    const urlsParam = searchParams.get('urls');
    if (urlsParam) {
      try {
        const decodedUrls = JSON.parse(decodeURIComponent(urlsParam));
        if (Array.isArray(decodedUrls)) {
          processUrls(decodedUrls);
        }
      } catch (e) {
        console.error('Failed to parse URLs from params', e);
      }
    }
  }, [searchParams, processUrls]);

  // Order handling
  const handlePlaceOrder = async (itemsToOrder: UnifiedOrderItemData[]) => {
    const totalCost = itemsToOrder.reduce((acc, item) => acc + (item.stockInfo?.points || 0), 0);

    if (userPoints === null || userPoints < totalCost) {
      toast.error(`Insufficient points. You need ${totalCost} points but only have ${userPoints || 0}`);
      return;
    }
    
    setIsProcessing(true);
    
    // Set status to 'ordering' for visual feedback
    setItems(currentItems =>
      currentItems.map(item =>
        itemsToOrder.some(orderItem => orderItem.url === item.url)
          ? { ...item, status: 'ordering' as OrderStatus }
          : item
      )
    );

    const orderPayload = itemsToOrder.map(item => ({
      url: item.url,
      site: item.parsedData?.source,
      id: item.parsedData?.id,
      title: item.stockInfo?.title,
      cost: item.stockInfo?.points,
      imageUrl: item.stockInfo?.image,
    }));

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (result.success && result.orders) {
        toast.success(`${result.orders.length} order(s) placed successfully! Now processing...`);
        
        // Update points in centralized store
        const newPoints = (userPoints || 0) - totalCost;
        updatePoints(newPoints);
        
        // Update items to 'processing'
        setItems(currentItems =>
          currentItems.map(item => {
            const orderedItem = result.orders.find((o: any) => o.originalUrl === item.url);
            return orderedItem ? { 
              ...item, 
              status: 'processing' as OrderStatus, 
              orderId: orderedItem.id 
            } : item;
          })
        );
      } else {
        toast.error(result.error || 'Failed to place orders.');
        setItems(currentItems =>
          currentItems.map(item =>
            itemsToOrder.some(orderItem => orderItem.url === item.url)
              ? { ...item, status: 'ready' as OrderStatus, error: result.error }
              : item
          )
        );
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'An unexpected error occurred during order placement.');
      setItems(currentItems =>
        currentItems.map(item =>
          itemsToOrder.some(orderItem => orderItem.url === item.url)
            ? { ...item, status: 'ready' as OrderStatus, error: error.message }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (url: string) => {
    setItems(currentItems => currentItems.filter(item => item.url !== url));
  };

  // const updateItemStatus = useCallback((orderId: string, newStatus: OrderStatus, downloadUrl?: string) => {
  //   setItems(currentItems =>
  //     currentItems.map(item =>
  //       item.orderId === orderId
  //         ? { ...item, status: newStatus, downloadUrl: downloadUrl || item.downloadUrl }
  //         : item
  //     )
  //   );
  // }, []);

  // Computed values
  const readyItems = useMemo(() => items.filter(item => item.status === 'ready' && item.success), [items]);
  const processingItems = useMemo(() => items.filter(item => item.status === 'processing' || item.status === 'ordering'), [items]);
  const completedItems = useMemo(() => items.filter(item => item.status === 'completed'), [items]);
  const failedItems = useMemo(() => items.filter(item => item.status === 'failed'), [items]);

  const totalCostForReadyItems = useMemo(() => {
    return readyItems.reduce((acc, item) => acc + (item.stockInfo?.points || 0), 0);
  }, [readyItems]);

  useEffect(() => {
    // Subscribe to SSE for each processing item
    const eventSources: EventSource[] = []
    items.forEach((it) => {
      if ((it.status === 'processing' || it.status === 'ordering') && it.orderId) {
        const es = new EventSource(`/api/orders/${it.orderId}/stream`)
        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data)
            setItems((current) => current.map(ci => ci.orderId === data.orderId ? {
              ...ci,
              status: (data.status?.toLowerCase?.() || ci.status) as any,
              progress: typeof data.progress === 'number' ? data.progress : ci.progress,
              downloadUrl: data.downloadUrl || ci.downloadUrl,
              success: data.status === 'COMPLETED' ? true : ci.success
            } : ci))
          } catch {}
        }
        es.onerror = () => {
          es.close()
        }
        eventSources.push(es)
      }
    })
    return () => {
      eventSources.forEach(es => es.close())
    }
  }, [items])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Create New Order</h1>
      {/* Low balance banner */}
      {userPoints !== null && totalCostForReadyItems > 0 && userPoints < totalCostForReadyItems && (
        <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Typography variant="body" className="text-yellow-200 font-medium">
                Low balance: You need {totalCostForReadyItems} points but only have {userPoints}.
              </Typography>
              <Typography variant="caption" className="text-yellow-300/80">
                Shortfall: {(totalCostForReadyItems - (userPoints || 0))} points
              </Typography>
            </div>
            <Button
              onClick={() => {
                // Redirect to pricing; could append query with suggested pack later
                window.location.href = '/pricing'
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Coins className="h-4 w-4 mr-2" />
              Buy points
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'input' && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Enter Stock Media URLs
                </CardTitle>
                <CardDescription className="text-white/70">
                  Paste up to 5 URLs (one per line) from supported stock media sites.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your URLs here, one per line. E.g., https://www.shutterstock.com/image-photo/example-123456789&#10;https://depositphotos.com/example-345678"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  rows={8}
                  className="min-h-[200px] bg-white/5 border-white/30 text-white placeholder:text-white/50 resize-none"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => processUrls(urls.split('\n').map(url => url.trim()).filter(Boolean))}
                    disabled={isLoading || !urls.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Getting Info...
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
          )}

          {step === 'confirmation' && (
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Your Order
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Review your items and confirm the purchase.
                    <div className="mt-2 text-sm text-blue-300">
                      Maximum 5 links allowed per order ({items.length}/5)
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: Math.min(urls.split('\n').filter(Boolean).length, 5) || 1 }).map((_, index) => (
                        <div key={`skeleton-${index}`} className="animate-pulse">
                          <div className="bg-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 bg-white/20 rounded-md"></div>
                              <div className="flex-grow">
                                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-white/20 rounded w-1/2"></div>
                              </div>
                              <div className="w-32 h-10 bg-white/20 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : items.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-white/50 mx-auto mb-4" />
                        <p className="text-white/70">No items to display</p>
                      </div>
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

                  {readyItems.length > 0 && (
                    <div className="flex justify-between items-center pt-6 border-t border-white/20">
                      <div>
                        <Typography variant="body" className="text-white font-medium">
                          {readyItems.length} Item(s) Ready to Order
                        </Typography>
                        <Typography variant="caption" className="text-white/70">
                          Total Cost: <span className="font-semibold text-yellow-300">{totalCostForReadyItems} Points</span>
                        </Typography>
                      </div>
                      <Button 
                        onClick={() => handlePlaceOrder(readyItems)} 
                        size="lg"
                        disabled={isProcessing || (userPoints || 0) < totalCostForReadyItems}
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Ordering All...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Order All ({totalCostForReadyItems} pts)
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center pt-6 border-t border-white/20">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep('input');
                        setUrls('');
                        setItems([]);
                      }}
                      disabled={isProcessing}
                      className="px-8 py-3 border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Input
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                      <span className="font-medium text-red-300">- {totalCostForReadyItems} Points</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 mt-3">
                      <div className="flex justify-between font-bold text-lg text-white">
                        <span>Balance After Purchase:</span>
                        <span className="text-green-300">{(userPoints || 0) - totalCostForReadyItems} Points</span>
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
                    <span className="font-medium text-blue-300">{processingItems.length}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Completed:</span>
                    <span className="font-medium text-emerald-300">{completedItems.length}</span>
                  </div>
                  <div className="flex justify-between text-white/90">
                    <span>Failed:</span>
                    <span className="font-medium text-red-300">{failedItems.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
