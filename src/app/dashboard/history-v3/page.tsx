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
  id: string; // order id (db)
  title: string;
  cost: number;
  status: 'READY' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  downloadUrl?: string | null;
  fileName?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  completedAt?: string | null;
  stockItemId: string; // asset id per platform
  stockItemUrl: string;
  stockSite?: { name: string; displayName: string } | null;
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
        // Normalize, dedupe by site+stockItemId, keeping most recent (already desc)
        const raw: OrderHistory[] = data.orders || []
        const seen = new Set<string>()
        const deduped: OrderHistory[] = []
        for (const o of raw) {
          const site = o.stockSite?.name || 'unknown'
          const key = `${site}:${o.stockItemId}`
          if (!seen.has(key)) {
            seen.add(key)
            deduped.push(o)
          }
        }
        setOrders(deduped)
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
      
      // Generate fresh download link from API (free re-download)
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          url: order.stockItemUrl,
          site: order.stockSite?.name || 'unknown',
          id: order.stockItemId,
          title: order.title || `${order.stockSite?.displayName || 'Item'} - ${order.stockItemId}`,
          cost: 0, // Free download for history items
          imageUrl: order.imageUrl || '',
          isRedownload: true // Always generate fresh link, backend skips points
        }])
      });

      const data = await response.json();
      
      if (data.success) {
        // Poll for the fresh download link
        const pollForDownloadLink = async () => {
          try {
            const statusResponse = await fetch(`/api/orders/${data.orders[0].id}/status`);
            const statusData = await statusResponse.json();
            
            if (statusData.success && (statusData.order.status === 'COMPLETED' || statusData.order.status === 'READY') && statusData.order.downloadUrl) {
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

  // Single action now handles redownloads; remove reorderItem

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
        return 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success-foreground))]';
      case 'PROCESSING':
        return 'bg-[hsl(var(--ring))]/20 text-[hsl(var(--ring))]';
      case 'FAILED':
        return 'bg-[hsl(var(--destructive))]/20 text-[hsl(var(--destructive-foreground))]';
      default:
        return 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]';
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
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="surface-card shadow-lg">
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
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            Order History
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            View and manage your download history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="surface-card shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[hsl(var(--muted))] rounded-full">
                  <FileText className="w-6 h-6 text-[hsl(var(--foreground))]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Orders</h3>
                  <p className="text-2xl font-bold">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[hsl(var(--muted))] rounded-full">
                  <Download className="w-6 h-6 text-[hsl(var(--foreground))]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Available Downloads</h3>
                  <p className="text-2xl font-bold">
                    {completedOrders.filter(o => o.downloadUrl).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[hsl(var(--muted))] rounded-full">
                  <CheckCircle className="w-6 h-6 text-[hsl(var(--foreground))]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Spent</h3>
                  <p className="text-2xl font-bold">
                    {totalSpent} pts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="surface-card shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
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
                  className="px-4 py-2 rounded-lg border bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                >
                  <option value="all">All Sites</option>
                  {Array.from(new Set(orders.map(o => o.stockSite?.name || 'unknown'))).map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="surface-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Your Orders ({filteredOrders.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No orders found</h3>
                <p className="text-[hsl(var(--muted-foreground))]">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4 p-4 rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] border border-[hsl(var(--border))]">
                    {(() => {
                      const img = order.imageUrl ? `/api/proxy-image?url=${encodeURIComponent(order.imageUrl)}` : `https://picsum.photos/400/400?random=${order.stockItemId}`
                      return (
                        <img
                          src={img}
                          alt={order.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )
                    })()}
                    <div className="flex-1">
                      <h3 className="font-semibold">{order.title}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.stockSite?.displayName || order.stockSite?.name || 'Unknown'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
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
                      <span className="font-semibold">{order.cost} pts</span>
                      {(order.status === 'READY' || order.status === 'COMPLETED') && (
                        <Button
                          size="sm"
                          onClick={() => downloadFile(order)}
                          className="glass-hover bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-95"
                          aria-label="Generate fresh download link"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Redownload (Free)
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
