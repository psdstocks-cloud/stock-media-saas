'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import useUserStore from '@/stores/userStore';
import { toast } from 'react-hot-toast';
// import { SUPPORTED_SITES } from '@/lib/supported-sites'; // Unused
import { 
  Download, 
  // ExternalLink, // Unused
  CheckCircle, 
  Clock, 
  AlertCircle,
  // RefreshCw, // Unused
  Search,
  // Filter, // Unused
  // Calendar, // Unused
  FileText,
  Copy as CopyIcon,
  Check as CheckIcon
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
  stockItemId?: string;
  stockItemUrl?: string;
  taskId?: string;
}

export default function HistoryV2Page() {
  const { points: _currentPoints } = useUserStore();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'FAILED' | 'PROCESSING'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
        setOrders(data.orders);
      } else {
        toast.error('Failed to load order history');
      }
    } catch (error) {
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed re-order logic; we only generate fresh links for free redownloads

  const downloadFile = async (order: OrderHistory) => {
    try {
      setDownloadingId(order.id);

      // Call regenerate endpoint to get a fresh link for FREE (no points deduction)
      const response = await fetch(`/api/orders/${order.id}/regenerate-download`, {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok && data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl; // open in same tab
      } else if (response.ok && data.order?.downloadUrl) {
        window.location.href = data.order.downloadUrl; // open in same tab
      } else {
        toast.error(data.error || 'Failed to regenerate download link');
      }
    } catch (error) {
      toast.error('Failed to generate download link');
    } finally {
      setDownloadingId(null);
    }
  };

  const normalizeStatus = (status: OrderHistory['status']): 'COMPLETED' | 'PROCESSING' | 'FAILED' => {
    if (status === 'READY' || status === 'COMPLETED') return 'COMPLETED'
    if (status === 'PROCESSING') return 'PROCESSING'
    return 'FAILED'
  }

  const getStatusIcon = (status: OrderHistory['status']) => {
    switch (normalizeStatus(status)) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: OrderHistory['status']) => {
    switch (normalizeStatus(status)) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
    }
  };

  // Deduplicate by stock item (show latest only) and allow searching by ID
  const uniqueByStock: Record<string, OrderHistory> = {};
  for (const o of orders) {
    const key = `${o.site}-${o.stockItemId || ''}`;
    const existing = uniqueByStock[key];
    if (!existing) {
      uniqueByStock[key] = o;
    } else {
      const existingDate = new Date(existing.createdAt).getTime();
      const currentDate = new Date(o.createdAt).getTime();
      if (currentDate > existingDate) uniqueByStock[key] = o;
    }
  }

  const dedupedOrders = Object.values(uniqueByStock).filter(o => o.status === 'READY' || o.status === 'COMPLETED');

  const filteredOrders = dedupedOrders.filter(order => {
    // Text search
    const idText = (order.stockItemId || order.title.split(' - ').pop() || '').toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm = !term || (
      order.title.toLowerCase().includes(term) ||
      idText.includes(term) ||
      (order.stockItemUrl?.toLowerCase().includes(term) ?? false) ||
      (order.taskId?.toLowerCase().includes(term) ?? false)
    );

    // Site filter
    const matchesSite = siteFilter === 'all' || order.site === siteFilter;

    // Status filter (normalized)
    const normalized = normalizeStatus(order.status);
    const matchesStatus = statusFilter === 'all' || normalized === statusFilter;

    // Date range filter
    const created = new Date(order.createdAt).getTime();
    const fromOk = dateFrom ? created >= new Date(dateFrom).getTime() : true;
    const toOk = dateTo ? created <= new Date(dateTo).getTime() : true;

    return matchesTerm && matchesSite && matchesStatus && fromOk && toOk;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const completedOrders = orders.filter(order => order.status === 'READY' || order.status === 'COMPLETED');
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.cost, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-10 w-80 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Live region for accessibility */}
        <div className="sr-only" aria-live="polite" role="status">
          {isLoading ? 'Loading order history' : `${filteredOrders.length} orders shown`}
        </div>
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
            Order History
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage your completed orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Completed Orders</h3>
                  <p className="text-2xl font-bold text-gray-800">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Total Spent</h3>
                  <p className="text-2xl font-bold text-gray-800">{totalSpent} pts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
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
        </div>

        {/* Filters + Search */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search shown orders (ID, link, title, debug)"
                    value={searchTerm}
                    onChange={(e) => { setPage(1); setSearchTerm(e.target.value) }}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--brand-purple-20)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              {/* Site */}
              <div className="w-full lg:w-48">
                <label className="block text-xs text-gray-500 mb-1">Site</label>
                <select
                  value={siteFilter}
                  onChange={(e) => { setPage(1); setSiteFilter(e.target.value) }}
                  className="w-full py-2 px-3 border border-[var(--brand-purple-20)] rounded-lg bg-white"
                >
                  <option value="all">All</option>
                  {[...new Set(dedupedOrders.map(o => o.site))].sort().map(site => (
                    <option key={site} value={site}>{site}</option>
                  ))}
                </select>
              </div>
              {/* Status */}
              <div className="w-full lg:w-48">
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setPage(1); setStatusFilter(e.target.value as any) }}
                  className="w-full py-2 px-3 border border-[var(--brand-purple-20)] rounded-lg bg-white"
                >
                  <option value="all">All</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              {/* Date range */}
              <div className="flex items-end gap-2 w-full lg:w-auto">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input type="date" value={dateFrom} onChange={(e) => { setPage(1); setDateFrom(e.target.value) }} className="py-2 px-3 border border-[var(--brand-purple-20)] rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input type="date" value={dateTo} onChange={(e) => { setPage(1); setDateTo(e.target.value) }} className="py-2 px-3 border border-[var(--brand-purple-20)] rounded-lg bg-white" />
                </div>
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
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? 'Try adjusting your search term'
                    : 'You haven\'t placed any orders yet'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {order.imageUrl && (
                      <a href={order.stockItemUrl || '#'} target="_self" rel="noopener noreferrer">
                        <img
                          src={order.imageUrl}
                          alt={order.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </a>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        <a href={order.stockItemUrl || '#'} target="_self" rel="noopener noreferrer">
                          {order.title.replace(/\s*\(Re-download\)$/,'')}
                        </a>
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 capitalize">{order.site}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        {order.taskId && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(order.taskId || '')
                                setCopiedId(order.id)
                                setTimeout(() => setCopiedId(null), 1200)
                              } catch {
                                // Silently handle clipboard errors
                              }
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition"
                            title={`Copy Debug ID: ${order.taskId}`}
                          >
                            <span className={`truncate max-w-[180px] ${copiedId === order.id ? 'text-green-600' : ''}`}>
                              Debug: {order.taskId}
                            </span>
                            {copiedId === order.id ? (
                              <CheckIcon className="w-3 h-3 animate-bounce" />
                            ) : (
                              <CopyIcon className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                      <span className="font-semibold text-gray-700">{order.cost} pts</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      {(order.status === 'READY' || order.status === 'COMPLETED') && (
                        <Button
                          size="sm"
                          onClick={() => downloadFile(order)}
                          disabled={downloadingId === order.id}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 min-w-[120px]"
                        >
                          {downloadingId === order.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                              Generating...
                            </span>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </>
                          )}
                        </Button>
                      )}
                      {/* Removed Re-order button; Download regenerates fresh link */}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination */}
            {filteredOrders.length > pageSize && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  className="px-3 py-2 rounded-md border border-[var(--brand-purple-20)] text-[var(--brand-purple-hex)] disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
                <button
                  className="px-3 py-2 rounded-md border border-[var(--brand-purple-20)] text-[var(--brand-purple-hex)] disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
