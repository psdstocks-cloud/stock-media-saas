'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  Eye,
  Download,
  ExternalLink,
  Filter,
  FileText
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import { 
  ViewOrderModal, 
  EditOrderModal, 
  BulkStatusModal 
} from '@/components/admin/OrderModals'

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
  const [error, setError] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

  // Define table columns
  const columns: ColumnDef<Order>[] = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <Typography variant="body" className="font-mono text-sm">
          {row.getValue('id').toString().slice(0, 8)}...
        </Typography>
      ),
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <Typography variant="body" className="font-medium">
              {order.userName || 'No name'}
            </Typography>
            <Typography variant="caption" color="muted">
              {order.userEmail}
            </Typography>
          </div>
        )
      },
    },
    {
      accessorKey: 'asset',
      header: 'Asset',
      cell: ({ row }) => {
        const order = row.original
        return (
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
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => (
        <Typography variant="body" className="font-medium">
          {row.getValue('cost')} pts
        </Typography>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <Typography variant="body" className="text-sm">
          {formatDate(row.getValue('createdAt'))}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(order)
                setViewModalOpen(true)
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(order)
                setEditModalOpen(true)
              }}
            >
              <FileText className="h-3 w-3" />
            </Button>
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
        )
      },
    },
  ], [])

  const handleEditSuccess = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => order.id === updatedOrder.id ? updatedOrder : order))
    setEditModalOpen(false)
    setSelectedOrder(null)
  }

  const handleBulkStatusUpdate = async (orderIds: string[], status: string, notes?: string) => {
    try {
      // TODO: Implement bulk status update API call
      console.log('Bulk update orders:', { orderIds, status, notes })
      
      // For now, just update the local state
      setOrders(prev => prev.map(order => 
        orderIds.includes(order.id) 
          ? { ...order, status, notes: notes || order.notes }
          : order
      ))
      
      setBulkStatusModalOpen(false)
    } catch (error) {
      console.error('Error updating orders:', error)
      setError('Failed to update orders')
    }
  }

  const handleBulkAction = (selectedIds: string[], action: string) => {
    if (action === 'export') {
      // TODO: Implement bulk export
      console.log('Bulk export orders:', selectedIds)
    } else if (action === 'status') {
      setBulkStatusModalOpen(true)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export all orders')
  }

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
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        error={error}
        searchPlaceholder="Search orders..."
        showSearch={true}
        showBulkActions={true}
        showPagination={true}
        pageSize={20}
        emptyMessage="No orders found"
        emptyIcon={<ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onRefresh={fetchOrders}
        onExport={handleExport}
        onBulkAction={handleBulkAction}
        selectedRowIds={selectedOrders}
        onSelectionChange={setSelectedOrders}
        enableRowSelection={true}
      />

      {/* Modals */}
      <ViewOrderModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />

      <EditOrderModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onSuccess={handleEditSuccess}
      />

      <BulkStatusModal
        isOpen={bulkStatusModalOpen}
        onClose={() => setBulkStatusModalOpen(false)}
        orderIds={selectedOrders}
        onConfirm={handleBulkStatusUpdate}
      />
    </div>
  )
}
