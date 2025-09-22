'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  MoreHorizontal,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { OrderStatus } from '@/components/dashboard/UnifiedOrderItem';

interface Order {
  id: string;
  title: string;
  stockSite: {
    name: string;
    displayName: string;
  };
  status: OrderStatus;
  cost: number;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  fileName?: string;
  imageUrl?: string;
  taskId?: string;
}

interface OrderHistoryClientProps {
  initialOrders?: Order[];
}

export default function OrderHistoryClient({ initialOrders = [] }: OrderHistoryClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrders.length === 0) {
      fetchOrders();
    }
  }, [initialOrders.length]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.stockSite.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'cost':
          return b.cost - a.cost;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy]);

  // Get status badge variant
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'ready':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Ready</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  // Handle download
  const handleDownload = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/regenerate-download`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate download link');
      }
      
      const data = await response.json();
      
      if (data.success && data.downloadUrl) {
        // Open download link in new tab
        window.open(data.downloadUrl, '_blank');
        toast.success('Download started!');
      } else {
        throw new Error(data.message || 'Failed to generate download link');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  // Handle retry
  const handleRetry = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/retry`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to retry order');
      }
      
      toast.success('Order retry initiated');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry order');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get total stats
  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const failed = orders.filter(o => o.status === 'failed').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.cost, 0);

    return { total, completed, processing, failed, totalSpent };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Order History</h1>
          <p className="text-white/70 mt-1">Track and manage your stock media orders</p>
        </div>
        <Button 
          onClick={fetchOrders} 
          disabled={isLoading}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total Orders</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Completed</p>
                <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Processing</p>
                <p className="text-2xl font-bold text-blue-400">{stats.processing}</p>
              </div>
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total Spent</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalSpent} pts</p>
              </div>
              <ExternalLink className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/30 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/30 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 bg-white/5 border-white/30 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
                <SelectItem value="cost">By Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white/70">Order</TableHead>
                    <TableHead className="text-white/70">Source</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Cost</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {order.imageUrl && (
                            <img
                              src={order.imageUrl}
                              alt={order.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-white truncate max-w-xs">
                              {order.title}
                            </p>
                            <p className="text-sm text-white/50">
                              {order.fileName || 'No filename'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/30 text-white">
                          {order.stockSite.displayName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-orange-400 font-medium">
                          {order.cost} pts
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-white/70">
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === 'completed' && order.downloadUrl && (
                              <DropdownMenuItem onClick={() => window.open(order.downloadUrl, '_blank')}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            )}
                            {order.status === 'completed' && !order.downloadUrl && (
                              <DropdownMenuItem onClick={() => handleDownload(order.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Generate Download
                              </DropdownMenuItem>
                            )}
                            {order.status === 'failed' && (
                              <DropdownMenuItem onClick={() => handleRetry(order.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry Order
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Copy Order ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
