'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Download, 
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  title: string
  status: string
  cost: number
  createdAt: string
  downloadUrl: string | null
  stockSite: {
    id: string
    name: string
    displayName: string
  }
}

interface OrdersManagementProps {
  className?: string
}

export function OrdersManagement({ className }: OrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async (page = 1, search = '', status = 'all') => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (search) params.append('search', search)
      if (status !== 'all') params.append('status', status)

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const result = await response.json()
        setOrders(result.orders || [])
        setTotalPages(result.pagination?.totalPages || 1)
      } else {
        setError('Failed to fetch orders')
      }
    } catch (error) {
      setError('An error occurred while fetching orders')
      console.error('Orders fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(currentPage, searchTerm, statusFilter)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchOrders(1, searchTerm, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
    fetchOrders(1, searchTerm, status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'READY':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />{status}</Badge>
    }
  }

  const handleDownload = async (order: Order) => {
    if (!order.downloadUrl) {
      toast.error('Download link not available')
      return
    }

    try {
      // Open download link in new tab
      window.open(order.downloadUrl, '_blank')
      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to start download')
    }
  }

  const handleRegenerateDownload = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/regenerate-download`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Download link regenerated!')
        fetchOrders(currentPage, searchTerm, statusFilter)
      } else {
        toast.error('Failed to regenerate download link')
      }
    } catch (error) {
      toast.error('An error occurred while regenerating download link')
    }
  }

  const handleReorder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/order-status`)
      const data = await res.json()
      if (!res.ok || !data?.order?.stockItemUrl) {
        toast.error('Unable to reorder this item')
        return
      }
      const url = data.order.stockItemUrl
      const encoded = encodeURIComponent(JSON.stringify([url]))
      window.location.href = `/dashboard/order?urls=${encoded}`
    } catch (e: any) {
      toast.error(e.message || 'Failed to prepare reorder')
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'READY', label: 'Ready' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' }
  ]

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => fetchOrders(currentPage, searchTerm, statusFilter)}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Order History
            </CardTitle>
            <CardDescription>
              View and manage your download orders
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(currentPage, searchTerm, statusFilter)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <Typography variant="h3" className="text-white mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No Orders Found'
                : 'No Orders Yet'
              }
            </Typography>
            <Typography variant="body" className="text-white/70 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'No orders match your search criteria. Try adjusting your filters.'
                : 'You haven\'t placed any orders yet. Get started by ordering your first image!'
              }
            </Typography>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                onClick={() => window.location.href = '/dashboard/order'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order Your First Image
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Typography variant="body" className="font-medium">
                          {order.title}
                        </Typography>
                        <Typography variant="caption" color="muted">
                          {order.stockSite.displayName} • {order.cost} points
                        </Typography>
                        <Typography variant="caption" color="muted" className="block">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Typography variant="caption" color="muted" className="font-mono">
                    Order #{order.id.slice(0, 8)}
                  </Typography>
                  
                  <div className="flex items-center space-x-2">
                    {(order.status === 'COMPLETED' || order.status === 'READY') && order.downloadUrl && (
                      <Button
                        size="sm"
                        onClick={() => handleDownload(order)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}

                    {(order.status === 'COMPLETED' || order.status === 'READY') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(order.id)}
                      >
                        Reorder
                      </Button>
                    )}
                    
                    {order.status === 'FAILED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerateDownload(order.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry link
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/api/orders/${order.id}/status`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Typography variant="caption" color="muted">
              Page {currentPage} of {totalPages}
            </Typography>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OrdersManagement
