'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import useUserStore from '@/stores/userStore';
import { toast } from 'react-hot-toast';
import { SUPPORTED_SITES, getSitesByCategory } from '@/lib/supported-sites';
import { officialParseStockUrl } from '@/lib/official-url-parser';
import { 
  ShoppingCart, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react';

interface StockSite {
  id: string;
  name: string;
  displayName: string;
  cost: number;
  isActive: boolean;
  category: string;
  icon: string;
}

interface OrderItem {
  id: string;
  url: string;
  site: string;
  siteId: string;
  title: string;
  cost: number;
  imageUrl: string;
  status: 'ready' | 'ordering' | 'processing' | 'completed' | 'failed';
  progress?: number;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
  isPreviouslyOrdered?: boolean;
  existingOrderId?: string;
}

export default function OrderV2Page() {
  const { points: currentPoints, isLoading: pointsLoading } = useUserStore();
  const [urls, setUrls] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use the comprehensive supported sites list
  const supportedSites = SUPPORTED_SITES;
  
  // Filter sites based on search term
  const filteredSites = supportedSites.filter(site => 
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
          // First check if URL is parseable
          const parseResult = officialParseStockUrl(url);
          
          if (!parseResult) {
            toast.error(`Unsupported URL format: ${url}`);
            continue;
          }

          // Fetch detailed information from API
          const response = await fetch(`/api/stock-info?url=${encodeURIComponent(url)}`);
          const data = await response.json();
          
          if (data.success) {
            const site = SUPPORTED_SITES.find(s => s.name === data.data.parsedData.source);
            
            // Check if this file has been ordered before
            const historyResponse = await fetch('/api/orders');
            const historyData = await historyResponse.json();
            const existingOrder = historyData.success ? 
              historyData.orders.find((order: any) => 
                order.stockItemId === data.data.parsedData.id && 
                order.stockSite?.name === data.data.parsedData.source &&
                (order.status === 'COMPLETED' || order.status === 'READY')
              ) : null;
            
            const isPreviouslyOrdered = !!existingOrder;
            
            const item: OrderItem = {
              id: `${data.data.parsedData.source}-${data.data.parsedData.id}-${Date.now()}`,
              url: url,
              site: data.data.parsedData.source,
              siteId: data.data.parsedData.id,
              title: `${site?.displayName || data.data.parsedData.source} - ${data.data.parsedData.id}`, // Format: Website Name - Stock ID
              cost: isPreviouslyOrdered ? 0 : data.data.stockInfo.points, // Free if previously ordered
              imageUrl: data.data.stockInfo.image, // Use the actual preview image from API
              status: 'ready',
              isPreviouslyOrdered: isPreviouslyOrdered, // Add flag for UI display
              existingOrderId: existingOrder?.id // Store existing order ID for free download
            };
            newItems.push(item);
            
            if (isPreviouslyOrdered) {
              toast.success(`Found previously ordered file - Download for FREE!`);
            } else {
              toast.success(`Successfully parsed ${site?.displayName || data.data.parsedData.source} URL`);
            }
          } else {
            toast.error(`Failed to fetch details for URL: ${url}`);
          }
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

  const placeOrder = async (item: OrderItem) => {
    // Handle free download for previously ordered files
    if (item.isPreviouslyOrdered && item.existingOrderId) {
      try {
        // Get the existing order details for free download
        const response = await fetch(`/api/orders/${item.existingOrderId}`);
        const data = await response.json();
        
        if (data.success && data.order.downloadUrl) {
          setItems(prev => prev.map(i => 
            i.id === item.id ? { 
              ...i, 
              status: 'completed' as const,
              downloadUrl: data.order.downloadUrl,
              fileName: data.order.fileName || `${item.site}-${item.siteId}.zip`
            } : i
          ));
          toast.success('Free download ready!');
        } else {
          throw new Error('Download link not available');
        }
      } catch (error) {
        console.error('Free download error:', error);
        toast.error('Failed to get free download link');
      }
      return;
    }

    // Regular order flow for new files
    if (!currentPoints || currentPoints < item.cost) {
      toast.error('Insufficient points');
      return;
    }

    // Update item status to ordering
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: 'ordering' as const } : i
    ));

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          url: item.url,
          site: item.site,
          id: item.siteId,
          title: item.title,
          cost: item.cost,
          imageUrl: item.imageUrl
        }])
      });

      const data = await response.json();
      
      if (data.success) {
        // Update item status to processing
        setItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'processing' as const } : i
        ));
        
        // Start polling for status updates
        pollOrderStatus(item.id, data.orders[0].id);
        
        toast.success('Order placed successfully');
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (error) {
      setItems(prev => prev.map(i => 
        i.id === item.id ? { 
          ...i, 
          status: 'failed' as const, 
          error: error instanceof Error ? error.message : 'Unknown error'
        } : i
      ));
      toast.error('Failed to place order');
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
            toast.success('Order completed!');
          } else if (isFailed) {
            setItems(prev => prev.map(i => 
              i.id === itemId ? { 
                ...i, 
                status: 'failed' as const,
                error: 'Order processing failed'
              } : i
            ));
            clearInterval(pollInterval);
            toast.error('Order failed');
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const placeAllOrders = async () => {
    const readyItems = items.filter(item => item.status === 'ready');
    const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);
    
    if (!currentPoints || currentPoints < totalCost) {
      toast.error('Insufficient points for all orders');
      return;
    }

    setIsProcessing(true);
    
    for (const item of readyItems) {
      await placeOrder(item);
      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsProcessing(false);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getStatusIcon = (status: OrderItem['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ordering': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <Download className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: OrderItem['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'ordering': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
    }
  };

  const readyItems = items.filter(item => item.status === 'ready');
  const totalCost = readyItems.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
            Stock Media Order System
          </h1>
          <p className="text-gray-600 text-lg">
            Order high-quality stock media from 25+ supported platforms
          </p>
        </div>

        {/* Points Display */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Points</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {pointsLoading ? <Skeleton className="w-20 h-8" /> : currentPoints?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Available Balance
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* URL Input */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Stock Media URLs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your stock media URLs here (one per line, max 5 URLs)..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {urls.split('\n').filter(url => url.trim()).length}/5 URLs • Each item costs 10 points
              </p>
              <Button 
                onClick={parseUrls} 
                disabled={isLoading || !urls.trim()}
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
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

        {/* Order Items */}
        {items.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Your Items ({items.length})</span>
                </span>
                {readyItems.length > 0 && (
                  <Button
                    onClick={placeAllOrders}
                    disabled={isProcessing || !currentPoints || currentPoints < totalCost}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Order All ({totalCost} points)
                  </Button>
                )}
              </CardTitle>
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="text-sm text-gray-500 capitalize">{item.site}</p>
                      {item.error && (
                        <p className="text-sm text-red-600">{item.error}</p>
                      )}
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
                          onClick={() => placeOrder(item)}
                          disabled={!item.isPreviouslyOrdered && (!currentPoints || currentPoints < item.cost)}
                          className={item.isPreviouslyOrdered 
                            ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            : "bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                          }
                        >
                          {item.isPreviouslyOrdered ? 'Download for Free' : 'Order'}
                        </Button>
                      )}
                      {item.status === 'completed' && item.downloadUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (item.downloadUrl?.includes('example.com')) {
                              toast.success('This is a demo download. In production, this would download the actual file.');
                            } else {
                              window.open(item.downloadUrl, '_blank');
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        disabled={item.status === 'ordering' || item.status === 'processing'}
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

        {/* Supported Sites */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5" />
              <span>Supported Websites ({filteredSites.length} sites)</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              All sites cost 10 points per download. Click on any site to visit their website.
            </p>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search websites by name or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredSites.map((site) => (
                <a
                  key={site.id}
                  href={site.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-orange-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {site.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{site.displayName}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {site.cost} pts
                  </Badge>
                </a>
              ))}
            </div>
            {filteredSites.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No websites found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
