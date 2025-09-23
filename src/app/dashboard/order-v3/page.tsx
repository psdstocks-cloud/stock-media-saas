'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
import useUserStore from '@/stores/userStore';
import { toast } from 'react-hot-toast';
import { SUPPORTED_SITES } from '@/lib/supported-sites';
import { officialParseStockUrl } from '@/lib/official-url-parser';
import { 
  ShoppingCart, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react';
import PointsOverview from '@/components/dashboard/PointsOverview';
import { useOrderStore } from '@/stores/orderStore';

interface OrderItem {
  id: string;
  url: string;
  site: string;
  siteId: string;
  title: string;
  cost: number;
  imageUrl: string;
  status: 'ready' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  fileName?: string;
  error?: string;
  isPreviouslyOrdered?: boolean;
  existingOrderId?: string;
}

export default function OrderV3Page() {
  const { points: currentPoints, isLoading: pointsLoading } = useUserStore();
  const [urls, setUrls] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // v3 store (lightweight cart)
  const addUrl = useOrderStore((s) => s.addUrl)
  const updateItemStatus = useOrderStore((s) => s.updateItemStatus)
  const removeCartItem = useOrderStore((s) => s.removeItem)
  const resetCart = useOrderStore((s) => s.resetOrder)
  const cartItems = useOrderStore((s) => s.orderItems) || []

  const enrichItemWithStockInfo = async (item: OrderItem) => {
    try {
      updateItemStatus?.(item.id, 'processing')
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' as const } : i))
      const resp = await fetch('/api/stock-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url })
      })
      const json = await resp.json()
      if (json && json.success) {
        const stockInfo = json.data?.stockInfo
        const platform = json.data?.stockSite?.displayName || item.site
        const points = Number(stockInfo?.points ?? 10)
        const image = stockInfo?.image || item.imageUrl
        updateItemStatus?.(item.id, 'ready', { data: { title: item.title, thumbnail: image, points, platform } })
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'ready' as const, imageUrl: image, cost: points } : i))
      } else {
        const errMsg = json?.message || 'Failed to fetch stock info'
        updateItemStatus?.(item.id, 'error', { errorMessage: errMsg })
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'failed' as const, error: errMsg } : i))
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Network error'
      updateItemStatus?.(item.id, 'error', { errorMessage: errMsg })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'failed' as const, error: errMsg } : i))
    }
  }

  // Filter sites based on search term
  const filteredSites = SUPPORTED_SITES.filter(site => 
    site.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parseUrls = async () => {
    if (!urls.trim()) {
      toast.error('Please enter at least one URL');
      return;
    }

    setIsLoading(true);
    const urlList = urls.split('\n').filter(url => url.trim());
    
    if (urlList.length > 5) {
      toast.error('Maximum 5 URLs allowed at once');
      setIsLoading(false);
      return;
    }

    try {
      const newItems: OrderItem[] = [];
      
      for (const url of urlList) {
        try {
          // Parse URL to get site and ID
          const parseResult = officialParseStockUrl(url);
          
          if (!parseResult) {
            toast.error(`Unsupported URL format: ${url}`);
            continue;
          }

          // Check if this file has been ordered before
          const historyResponse = await fetch('/api/orders');
          const historyData = await historyResponse.json();
          const existingOrder = historyData.success ? 
            historyData.orders.find((order: any) => 
              order.stockItemId === parseResult.id && 
              order.stockSite?.name === parseResult.source &&
              (order.status === 'COMPLETED' || order.status === 'READY')
            ) : null;
          
          const isPreviouslyOrdered = !!existingOrder;
          
          // Create item
          const item: OrderItem = {
            id: `${parseResult.source}-${parseResult.id}-${Date.now()}`,
            url: url,
            site: parseResult.source,
            siteId: parseResult.id,
            title: `${parseResult.source.charAt(0).toUpperCase() + parseResult.source.slice(1)} - ${parseResult.id}`,
            cost: isPreviouslyOrdered ? 0 : 10,
            imageUrl: `https://picsum.photos/400/400?random=${parseResult.id}&sig=${parseResult.source}`,
            status: 'processing',
            isPreviouslyOrdered: isPreviouslyOrdered,
            existingOrderId: existingOrder?.id
          };
          
          newItems.push(item);
          // v3 store entry as pending until explicit order
          addUrl?.(url)
          
          if (isPreviouslyOrdered) {
            toast.success(`Found previously ordered file - Download for FREE!`);
          } else {
            toast.success(`Successfully parsed ${parseResult.source} URL`);
          }

          addUrl?.(url, item.id)
          void enrichItemWithStockInfo(item)
        } catch (error) {
          toast.error(`Error processing URL: ${url}`);
        }
      }

      setItems(newItems);
      setUrls('');
    } catch (error) {
      toast.error('Failed to parse URLs');
    } finally {
      setIsLoading(false);
    }
  };

  const processOrder = async (item: OrderItem) => {
    try {
      // Update status to processing
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'processing' as const } : i
      ));

      // Generate fresh download link from API
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          url: item.url,
          site: item.site,
          id: item.siteId,
          title: item.title,
          cost: item.cost,
          imageUrl: item.imageUrl,
          isRedownload: true // Always generate fresh link
        }])
      });

      const data = await response.json();
      
      if (data.success) {
        // Start polling for status updates
        pollOrderStatus(item.id, data.orders[0].id);
        toast.success('Generating download link...');
      } else {
        throw new Error(data.error || 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      setItems(prev => prev.map(i => 
        i.id === item.id ? { 
          ...i, 
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Failed to process order'
        } : i
      ));
      toast.error('Failed to process order');
    }
  };

  const pollOrderStatus = async (itemId: string, orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`);
        const data = await response.json();
        
        if (data.success) {
          const status = data.order.status;
          const isCompleted = status === 'READY' || status === 'COMPLETED';
          const isFailed = status === 'FAILED';
          
          if (isCompleted) {
            setItems(prev => prev.map(i => 
              i.id === itemId ? { 
                ...i, 
                status: 'completed' as const,
                downloadUrl: data.order.downloadUrl,
                fileName: data.order.fileName
              } : i
            ));
            clearInterval(pollInterval);
            
            // Automatically trigger download
            if (data.order.downloadUrl) {
              if (data.order.downloadUrl.includes('example.com')) {
                toast.success('This is a demo download. In production, this would download the actual file.');
              } else {
                window.open(data.order.downloadUrl, '_blank');
                toast.success('Download started!');
              }
            } else {
              toast.success('Download link ready!');
            }
          } else if (isFailed) {
            setItems(prev => prev.map(i => 
              i.id === itemId ? { 
                ...i, 
                status: 'failed' as const,
                error: 'Order processing failed'
              } : i
            ));
            clearInterval(pollInterval);
            toast.error('Order processing failed');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const startOrderStream = (orderId: string, itemId: string) => {
    try {
      const es = new EventSource(`/api/orders/${orderId}/stream`)
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data || '{}')
          const status: string | undefined = data.status
          const percentage: number | undefined = data.percentage
          const downloadUrl: string | undefined = data.downloadUrl

          if (status === 'progress' && typeof percentage === 'number') {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'processing' as const } : i))
          } else if (status === 'COMPLETED' || status === 'READY' || status === 'complete') {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'completed' as const, downloadUrl } : i))
            es.close()
          } else if (status === 'FAILED' || status === 'failed') {
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'failed' as const } : i))
            es.close()
          }
        } catch (e) {
          // Ignore malformed SSE data
        }
      }
      es.onerror = () => {
        es.close()
      }
    } catch (e) {
      // SSE unavailable; skip streaming in this environment
    }
  }

  const confirmOrdersBatch = async () => {
    const readyItems = items.filter(item => item.status === 'ready');
    const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);
    
    if (!currentPoints || currentPoints < totalCost) {
      toast.error('Insufficient points for all orders');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = readyItems.map((item) => ({
        url: item.url,
        site: item.site,
        id: item.siteId,
        title: item.title,
        cost: item.cost,
        imageUrl: item.imageUrl,
        isRedownload: !!item.isPreviouslyOrdered
      }))

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()

      if (!data?.success || !Array.isArray(data.orders)) {
        throw new Error(data?.error || 'Failed to place orders')
      }

      setItems(prev => prev.map(i => readyItems.find(r => r.id === i.id) ? { ...i, status: 'processing' as const } : i))

      data.orders.forEach((order: any, idx: number) => {
        const item = readyItems[idx]
        if (order?.id && item) {
          startOrderStream(order.id, item.id)
        }
      })

      toast.success('Orders placed. Tracking progress...')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to place orders')
    } finally {
      setIsProcessing(false)
    }
  }

  const processAllOrders = async () => {
    const readyItems = items.filter(item => item.status === 'ready');
    const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);
    
    if (!currentPoints || currentPoints < totalCost) {
      toast.error('Insufficient points for all orders');
      return;
    }

    setIsProcessing(true);
    
    // Process all items
    for (const item of readyItems) {
      await processOrder(item);
      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsProcessing(false);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    removeCartItem?.(itemId)
  };

  const getStatusIcon = (status: OrderItem['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const readyItems = items.filter(item => item.status === 'ready');
  const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Stock Media
          </h1>
          <p className="text-lg text-gray-600">
            Download premium stock media from 50+ platforms
          </p>
        </div>

        {/* Points Overview */}
        <div className="flex justify-end">
          <div className="max-w-sm w-full">
            <PointsOverview />
          </div>
        </div>

        {/* URL Input */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Stock Media URLs</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Paste your stock media URLs here (one per line, max 5 URLs)
            </p>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Paste your stock media URLs here (one per line, max 5 URLs)..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <p className={`text-sm ${urls.split('\n').filter(url => url.trim()).length > 5 ? 'text-red-500' : 'text-gray-500'}`}>
                  {urls.split('\n').filter(url => url.trim()).length}/5 URLs • Each item costs 10 points
                </p>
                {urls.split('\n').filter(url => url.trim()).length > 5 && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ Maximum 5 URLs allowed. Please remove extra URLs to proceed.
                  </p>
                )}
              </div>
              <Button 
                onClick={parseUrls} 
                disabled={isLoading || !urls.trim() || urls.split('\n').filter(url => url.trim()).length > 5}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Parse URLs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {items.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Your Items ({items.length})</span>
                </CardTitle>
                {readyItems.length > 0 && (
                    <Button
                      onClick={confirmOrdersBatch}
                    disabled={isProcessing || !currentPoints || currentPoints < totalCost}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Order All ({totalCost} points)
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.site}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </Badge>
                      <span className="font-semibold text-gray-700">
                        {item.isPreviouslyOrdered ? 'FREE' : `${item.cost} pts`}
                      </span>
                      {item.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => processOrder(item)}
                          disabled={!item.isPreviouslyOrdered && (!currentPoints || currentPoints < item.cost)}
                          className={item.isPreviouslyOrdered 
                            ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            : "bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                          }
                        >
                          {item.isPreviouslyOrdered ? 'Download for Free' : 'Order'}
                        </Button>
                      )}
                      {item.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processOrder(item)}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download Now
                        </Button>
                      )}
                      {item.status === 'processing' && (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="text-sm text-blue-600">Generating link...</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        disabled={item.status !== 'ready'}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        {items.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {readyItems.length} item(s) • Total {totalCost} points
                  </p>
                </div>
                {(() => {
                  const hasBlocking = items.some(i => i.status === 'processing' || i.status === 'failed')
                  const canConfirm = items.length > 0 && !hasBlocking && readyItems.length > 0
                  return (
                    <Button
                      onClick={confirmOrdersBatch}
                      disabled={!canConfirm || !currentPoints || currentPoints < totalCost}
                      className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Order
                    </Button>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported Sites */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-orange-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <span>Supported Platforms</span>
                </CardTitle>
                <p className="text-purple-100 mt-2 text-lg">
                  {filteredSites.length} premium stock media platforms • All at 10 points per download
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{filteredSites.length}</div>
                <div className="text-purple-200 text-sm">Platforms</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search platforms by name or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-purple-200 focus:ring-2 focus:ring-white/50 focus:border-transparent focus:bg-white/30 transition-all duration-200"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {filteredSites.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No platforms found</h3>
                <p className="text-gray-500">Try adjusting your search terms to find more platforms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSites.map((site, index) => (
                  <a
                    key={site.id}
                    href={site.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg font-bold">
                            {site.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-orange-100 text-purple-700 rounded-full text-xs font-semibold">
                          {site.cost} pts
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                        {site.displayName}
                      </h3>
                      
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {site.description}
                      </p>
                      
                      <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700 transition-colors">
                        <span>Visit Platform</span>
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
