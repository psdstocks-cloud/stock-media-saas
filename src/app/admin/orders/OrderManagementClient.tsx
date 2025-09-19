'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  Search, 
  RefreshCw,
  Eye,
  Download,
  ExternalLink,
  Filter
} from 'lucide-react'

interface Order {
  id: string
  userId: string
  userEmail: string
  userName: string | null
  status: string
  cost: number
  assetUrl: string | null
  assetTitle: string | null
  createdAt: string
  updatedAt: string
}

export default function OrderManagementClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError('Failed to fetch orders')
      }
    } catch (error) {
      setError('An error occurred while fetching orders')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.userName && order.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (order.assetTitle && order.assetTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const selectAllOrders = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length
        ? []
        : filteredOrders.map(order => order.id)
    )
  }

  const handleViewOrder = (orderId: string) => {
    // TODO: Implement view order details
    console.log('View order:', orderId)
  }

  const handleDownloadAsset = (assetUrl: string) => {
    if (assetUrl) {
      window.open(assetUrl, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-yellow-500">Processing</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            Order Management
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Monitor and manage all platform orders
          </Typography>
        </div>
        <Button
          onClick={fetchOrders}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>
                Search and filter orders by status and user
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={selectAllOrders}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Asset</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Cost</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-8 w-24" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <Typography variant="h3" className="mb-2">
                        No orders found
                      </Typography>
                      <Typography variant="body" color="muted">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'No orders have been placed yet'
                        }
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-4">
                        <Typography variant="body" className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </Typography>
                      </td>
                      <td className="p-4">
                        <div>
                          <Typography variant="body" className="font-medium">
                            {order.userName || 'No name'}
                          </Typography>
                          <Typography variant="caption" color="muted">
                            {order.userEmail}
                          </Typography>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <Typography variant="body" className="font-medium truncate max-w-40">
                            {order.assetTitle || 'Unknown Asset'}
                          </Typography>
                          {order.assetUrl && (
                            <Typography variant="caption" color="muted" className="truncate max-w-40 block">
                              {order.assetUrl}
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        <Typography variant="body" className="font-medium">
                          {order.cost} pts
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography variant="body" className="text-sm">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {order.assetUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAsset(order.assetUrl!)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                          {order.assetUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(order.assetUrl!, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <Typography variant="body" className="font-medium">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </Typography>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    Bulk Update Status
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
