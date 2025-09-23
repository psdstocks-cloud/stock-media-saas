'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useUserStore from '@/stores/userStore';
import { toast } from 'react-hot-toast';
import { SUPPORTED_SITES } from '@/lib/supported-sites';
import { 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  FileText
} from 'lucide-react';

interface OrderHistory {
  id: string;
  title: string;
  site: string;
  cost: number;
  status: 'READY' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  downloadUrl?: string;
  fileName?: string;
  imageUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export default function HistoryV3Page() {
  const { points: currentPoints } = useUserStore();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');

  useEffect(() => {
    loadOrderHistory();
  }, []);

  const loadOrderHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error('Failed to load order history');
      }
    } catch (error) {
      console.error('Error loading order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (order: OrderHistory) => {
    try {
      toast.loading('Preparing download...');
      
      // Generate fresh download link from API
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          url: `https://example.com/${order.site}/${order.id}`, // Construct URL from order data
          site: order.site,
          id: order.id,
          title: order.title,
          cost: 0, // Free download for history items
          imageUrl: order.imageUrl || '',
          isRedownload: true // Always generate fresh link
        }])
      });

      const data = await response.json();
      
      if (data.success) {
        // Poll for the fresh download link
        const pollForDownloadLink = async () => {
          try {
            const statusResponse = await fetch(`/api/orders/${data.orders[0].id}/status`);
            const statusData = await statusResponse.json();
            
            if (statusData.success && statusData.order.status === 'COMPLETED' && statusData.order.downloadUrl) {
              // Download the fresh file
              if (statusData.order.downloadUrl.includes('example.com')) {
                toast.success('This is a demo download. In production, this would download the actual file.');
              } else {
                window.open(statusData.order.downloadUrl, '_blank');
                toast.success('Download started!');
              }
            } else if (statusData.success && statusData.order.status === 'FAILED') {
              toast.error('Failed to generate download link');
            } else {
              // Continue polling
              setTimeout(pollForDownloadLink, 2000);
            }
          } catch (error) {
            console.error('Polling error:', error);
            toast.error('Failed to get download link');
          }
        };
        
        // Start polling
        setTimeout(pollForDownloadLink, 2000);
      } else {
        throw new Error(data.error || 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Download link generation error:', error);
      toast.error('Failed to generate download link');
    }
  };

  const reorderItem = async (order: OrderHistory) => {
    try {
      // Navigate to order page with pre-filled URL
      const orderUrl = `/dashboard/order-v3?url=${encodeURIComponent(order.title)}`;
      window.location.href = orderUrl;
    } catch (error) {
      toast.error('Failed to re-order item');
    }
  };

  const getStatusIcon = (status: OrderHistory['status']) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PROCESSING':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderHistory['status']) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.site.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSite = siteFilter === 'all' || order.site === siteFilter;
    
    return matchesSearch && matchesStatus && matchesSite;
  });

  const completedOrders = orders.filter(order => order.status === 'COMPLETED' || order.status === 'READY');
  const totalSpent = orders.reduce((sum, order) => sum + order.cost, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order History
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your download history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Available Downloads</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {completedOrders.filter(o => o.downloadUrl).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Spent</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {totalSpent} pts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="READY">Ready</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="FAILED">Failed</option>
                </select>
                <select
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Sites</option>
                  {Array.from(new Set(orders.map(o => o.site))).map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Your Orders ({filteredOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={order.imageUrl || `https://picsum.photos/400/400?random=${order.id}`}
                      alt={order.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{order.title}</h3>
                      <p className="text-sm text-gray-600">{order.site}</p>
                      <p className="text-xs text-gray-500">
                        Ordered: {formatDate(order.createdAt)}
                        {order.completedAt && (
                          <span> • Completed: {formatDate(order.completedAt)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                      <span className="font-semibold text-gray-700">{order.cost} pts</span>
                      {(order.status === 'READY' || order.status === 'COMPLETED') && (
                        <Button
                          size="sm"
                          onClick={() => downloadFile(order)}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {(order.status === 'READY' || order.status === 'COMPLETED') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reorderItem(order)}
                          disabled={!currentPoints || currentPoints < order.cost}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Re-order
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
