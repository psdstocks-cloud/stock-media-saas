'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useUserStore from '@/stores/userStore';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Search,
  FileText,
  Copy
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
  debugId?: string | null;
  taskId?: string | null;
}

export default function HistoryV3Page() {
  const { points: currentPoints } = useUserStore();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [redownloadState, setRedownloadState] = useState<Record<string, 'idle' | 'loading' | 'ready' | 'failed'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        // Determine original (first) non-zero cost per asset
        const firstCostByKey: Record<string, number> = {}
        for (let i = raw.length - 1; i >= 0; i--) {
          const o = raw[i]
          const siteName = o.stockSite?.name || 'unknown'
          const key = `${siteName}:${o.stockItemId}`
          if (o.cost > 0 && firstCostByKey[key] === undefined) {
            firstCostByKey[key] = o.cost
          }
        }
        const seen = new Set<string>()
        const deduped: OrderHistory[] = []
        for (const o of raw) {
          const site = o.stockSite?.name || 'unknown'
          const key = `${site}:${o.stockItemId}`
          if (!seen.has(key)) {
            seen.add(key)
            deduped.push({ ...o, cost: firstCostByKey[key] ?? o.cost })
          }
        }
        // Enrich missing previews/titles from stock-info
        const enriched = await Promise.all(deduped.map(async (o) => {
          if (o.imageUrl && o.title) return o
          try {
            const res = await fetch('/api/stock-info', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: o.stockItemUrl || '', id: o.stockItemId })
            })
            const js = await res.json()
            const img = js?.data?.stockInfo?.image || js?.data?.image
            const image = img ? `/api/proxy-image?url=${encodeURIComponent(img)}` : o.imageUrl
            const platform = js?.data?.stockSite?.displayName || o.stockSite?.displayName || o.stockSite?.name
            const apiId: string | undefined = js?.data?.stockInfo?.id || js?.data?.parsedData?.id || o.stockItemId
            const title = `${platform} - ${apiId}`
            return { ...o, imageUrl: image || o.imageUrl, title }
          } catch {
            return o
          }
        }))
        setOrders(enriched)
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
      setRedownloadState(prev => ({ ...prev, [order.id]: 'loading' }))
      toast.loading('Preparing download...');
      
      // Generate fresh download link from API (free re-download)
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          url: order.stockItemUrl || getPublicItemUrl(order),
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
                setRedownloadState(prev => ({ ...prev, [order.id]: 'ready' }))
                // Open in same tab to avoid popup blockers
                window.location.href = statusData.order.downloadUrl
                toast.success('Download started!');
              }
            } else if (statusData.success && statusData.order.status === 'FAILED') {
              toast.error('Failed to generate download link');
              setRedownloadState(prev => ({ ...prev, [order.id]: 'failed' }))
            } else {
              // Continue polling
              setTimeout(pollForDownloadLink, 2000);
            }
          } catch (error) {
            console.error('Polling error:', error);
            toast.error('Failed to get download link');
            setRedownloadState(prev => ({ ...prev, [order.id]: 'failed' }))
          }
        };
        
        // Start polling
        setTimeout(pollForDownloadLink, 500);
      } else {
        throw new Error(data.error || 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Download link generation error:', error);
      toast.error('Failed to generate download link');
    } finally {
      if (redownloadState[order.id] !== 'ready') {
        setRedownloadState(prev => ({ ...prev, [order.id]: prev[order.id] === 'failed' ? 'failed' : 'idle' }))
      }
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
    const siteName = (order.stockSite?.name || order.stockSite?.displayName || '').toLowerCase()
    const term = searchTerm.trim().toLowerCase()
    const isUrl = term.startsWith('http')
    const isDebugId = /[a-f0-9]{32}/i.test(term)
    const isNumericId = /^\d{3,}$/.test(term)
    const matchesSearch =
      term === '' ||
      getDisplayTitle(order).toLowerCase().includes(term) ||
      siteName.includes(term) ||
      (isUrl && (order.stockItemUrl || '').toLowerCase().includes(term)) ||
      (isDebugId && ((extractDebugId(order)?.toLowerCase() || order.taskId?.toLowerCase() || ''))) ||
      (isNumericId && order.stockItemId.includes(term))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSite = siteFilter === 'all' || (order.stockSite?.name || 'unknown') === siteFilter;
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
                      <h3 className="font-semibold">
                        {getPublicItemUrl(order) ? (
                          <a href={getPublicItemUrl(order)} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-90">
                            {getDisplayTitle(order)}
                          </a>
                        ) : (
                          getDisplayTitle(order)
                        )}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.stockSite?.displayName || order.stockSite?.name || 'Unknown'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Ordered: {formatDate(order.createdAt)}
                        {order.completedAt && (
                          <span> • Completed: {formatDate(order.completedAt)}</span>
                        )}
                      </p>
                      {extractDebugId(order) && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Debug ID:</span>
                          <code className="text-[10px] px-1 py-0.5 rounded bg-[hsl(var(--muted))]">{extractDebugId(order)}</code>
                          <button
                            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors relative"
                            onClick={() => {
                              navigator.clipboard.writeText(extractDebugId(order) || '')
                              setCopiedId(order.id)
                              setTimeout(() => setCopiedId(null), 1200)
                            }}
                            aria-label="Copy debug ID"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                            {copiedId === order.id && (
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 shadow-sm">Copied!</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                      <span className="font-semibold">{order.cost} pts</span>
                      {(order.status === 'READY' || order.status === 'COMPLETED') && (
                        redownloadState[order.id] === 'loading' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1 bg-[hsl(var(--muted))] rounded overflow-hidden">
                              <div className="h-full w-1/2 bg-[hsl(var(--ring))] animate-pulse"></div>
                            </div>
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">Processing…</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => downloadFile(order)}
                            className={
                              "glass-hover text-[hsl(var(--primary-foreground))] hover:opacity-95 " +
                              (redownloadState[order.id] === 'ready' ? 'bg-green-600' : 'bg-[hsl(var(--primary))]')
                            }
                            aria-label="Generate fresh download link"
                          >
                            {redownloadState[order.id] === 'ready' ? <Download className="w-4 h-4 mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                            {redownloadState[order.id] === 'ready' ? 'Download now' : 'Download (Free)'}
                          </Button>
                        )
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

function extractDebugId(order: OrderHistory): string | null {
  if (order.debugId) return order.debugId
  const url = order.downloadUrl || ''
  const m = url.match(/[a-f0-9]{32}/i)
  return m ? m[0] : null
}

function getPublicItemUrl(order: OrderHistory): string | '' {
  if (order.stockItemUrl) return order.stockItemUrl
  const site = order.stockSite?.name
  if (site === 'shutterstock') {
    return `https://www.shutterstock.com/image-photo/${order.stockItemId}`
  }
  return ''
}

function getDisplayTitle(order: OrderHistory): string {
  const t = order.title || `${order.stockSite?.displayName || order.stockSite?.name || 'Item'} - ${order.stockItemId}`
  return t.replace(/\(Re-download\)/gi, '').replace(/\s+\(\s*\)/g, '').trim()
}
