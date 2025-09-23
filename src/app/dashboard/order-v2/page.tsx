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
          
          console.log('🔍 Stock Info API Response:', data);
          
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
            
            console.log('🔍 Created item:', {
              cost: item.cost,
              isPreviouslyOrdered,
              stockInfoPoints: data.data.stockInfo.points,
              site: item.site,
              id: item.siteId
            });
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
    // Handle free download for previously ordered files OR completed items
    if ((item.isPreviouslyOrdered && item.existingOrderId) || item.status === 'completed') {
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
            cost: item.cost || 0,
            imageUrl: item.imageUrl,
            isRedownload: true // Always generate fresh link
          }])
        });

        const data = await response.json();
        
        if (data.success) {
          // Start polling for status updates to get the fresh download link
          pollOrderStatus(item.id, data.orders[0].id);
          toast.success('Generating fresh download link...');
        } else {
          throw new Error(data.error || 'Failed to generate download link');
        }
      } catch (error) {
        console.error('Download link generation error:', error);
        setItems(prev => prev.map(i => 
          i.id === item.id ? { 
            ...i, 
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Failed to generate download link'
          } : i
        ));
        toast.error('Failed to generate download link');
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
      const orderPayload = [{
        url: item.url,
        site: item.site,
        id: item.siteId,
        title: item.title,
        cost: item.cost || 0, // Ensure cost is always a number
        imageUrl: item.imageUrl
      }];
      
      console.log('🔍 Sending order payload:', orderPayload);
      
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update item status to processing
        setItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'processing' as const } : i
        ));
        
        // Start polling for status updates
        pollOrderStatus(item.id, data.orders[0].id);
        
        // Refresh user points after successful order
        // The user store will automatically update when the API responds
        
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
            
            // Automatically trigger download
            if (data.order.downloadUrl) {
              if (data.order.downloadUrl.includes('example.com')) {
                toast.success('This is a demo download. In production, this would download the actual file.');
              } else {
                window.open(data.order.downloadUrl, '_blank');
                toast.success('Download started!');
              }
            } else {
              toast.success('Fresh download link ready!');
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
    
    // Update all items to ordering status
    setItems(prev => prev.map(item => 
      readyItems.some(readyItem => readyItem.id === item.id) 
        ? { ...item, status: 'ordering' as const }
        : item
    ));

    try {
      // Prepare all orders for batch processing
      const orderPayload = readyItems.map(item => ({
        url: item.url,
        site: item.site,
        id: item.siteId,
        title: item.title,
        cost: item.cost || 0, // Ensure cost is always a number
        imageUrl: item.imageUrl,
        isRedownload: item.isPreviouslyOrdered || false
      }));

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update all items to processing status
        setItems(prev => prev.map(item => 
          readyItems.some(readyItem => readyItem.id === item.id) 
            ? { ...item, status: 'processing' as const }
            : item
        ));
        
        // Start polling for all orders
        data.orders.forEach((order: any, index: number) => {
          const item = readyItems[index];
          if (item) {
            pollOrderStatus(item.id, order.id);
          }
        });
        
        // Refresh user points after successful batch order
        // The user store will automatically update when the API responds
        
        toast.success(`Processing ${readyItems.length} orders...`);
      } else {
        throw new Error(data.error || 'Failed to place orders');
      }
    } catch (error) {
      console.error('Batch order error:', error);
      setItems(prev => prev.map(item => 
        readyItems.some(readyItem => readyItem.id === item.id) 
          ? { 
              ...item, 
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Failed to place order'
            }
          : item
      ));
      toast.error('Failed to place orders');
    } finally {
      setIsProcessing(false);
    }
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
                      {item.status === 'ready' && !item.isPreviouslyOrdered && (
                        <Button
                          size="sm"
                          onClick={() => placeOrder(item)}
                          disabled={!currentPoints || currentPoints < item.cost}
                          className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                        >
                          Order
                        </Button>
                      )}
                      {item.status === 'ready' && item.isPreviouslyOrdered && (
                        <Button
                          size="sm"
                          onClick={() => placeOrder(item)}
                          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download for Free
                        </Button>
                      )}
                      {item.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => placeOrder(item)}
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

        {/* Supported Sites - Modern 2024/2025 Design */}
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
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      {/* Platform icon */}
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
                      
                      {/* Platform name */}
                      <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                        {site.displayName}
                      </h3>
                      
                      {/* Platform description */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {site.description}
                      </p>
                      
                      {/* Visit indicator */}
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
