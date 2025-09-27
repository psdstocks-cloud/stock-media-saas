'use client'

import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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
import { usePermissions } from '@/lib/hooks/usePermissions'

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
  notes?: string
}

export default function OrderManagementClient() {
  const { has } = usePermissions()
  const canView = has('orders.view')
  const canManage = has('orders.manage')
  const canRefund = has('orders.refund')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  // Dual-control: Refund modal
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [refundReason, setRefundReason] = useState<string>('')
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [refundMessage, setRefundMessage] = useState<string>('')

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
          {(row.getValue('id') as string).slice(0, 8)}...
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
              disabled={!canView}
              title={!canView ? 'Requires orders.view' : undefined}
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
              disabled={!canManage}
              title={!canManage ? 'Requires orders.manage' : undefined}
            >
              <FileText className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(order)
                setRefundAmount(String(order.cost ?? ''))
                setRefundReason('')
                setRefundMessage('')
                setRefundModalOpen(true)
              }}
              disabled={!canRefund}
              title={!canRefund ? 'Requires orders.refund' : undefined}
            >
              Request refund
            </Button>
            {order.assetUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(order.assetUrl!, '_blank')}
                disabled={!canView}
                title={!canView ? 'Requires orders.view' : undefined}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        )
      },
    },
  ], [canView, canManage])

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

  const handleFilterChange = (filters: Record<string, string>) => {
    console.log('Filter changed:', filters)
  }

  // Generate filter options based on current data
  const filterOptions = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'PENDING', label: 'Pending', count: statusCounts.PENDING || 0 },
          { value: 'PROCESSING', label: 'Processing', count: statusCounts.PROCESSING || 0 },
          { value: 'COMPLETED', label: 'Completed', count: statusCounts.COMPLETED || 0 },
          { value: 'FAILED', label: 'Failed', count: statusCounts.FAILED || 0 },
        ]
      }
    ]
  }, [orders])

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
          <Button onClick={handleExport} variant="outline" size="sm" disabled={!canView}>
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
        searchPlaceholder="Search orders by user, email, or asset..."
        showSearch={true}
        showFilters={true}
        filterOptions={filterOptions}
        showBulkActions={canManage}
        showPagination={true}
        pageSize={20}
        emptyMessage="No orders found"
        emptyIcon={<ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onRefresh={fetchOrders}
        onExport={canView ? handleExport : undefined}
        onBulkAction={canManage ? handleBulkAction : undefined}
        onFilterChange={handleFilterChange}
        selectedRowIds={canManage ? selectedOrders : []}
        onSelectionChange={canManage ? setSelectedOrders : undefined}
        enableRowSelection={canManage}
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

      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent aria-describedby="refund-desc">
          <DialogHeader>
            <DialogTitle>Request refund</DialogTitle>
            <DialogDescription id="refund-desc">
              Create an approval request to refund order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="refund-amount" className="text-sm">Amount</label>
              <Input id="refund-amount" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="refund-reason" className="text-sm">Reason</label>
              <Input id="refund-reason" value={refundReason} onChange={e => setRefundReason(e.target.value)} placeholder="Why refund?" />
            </div>
            {refundMessage && (
              <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
                {refundMessage} {refundMessage.includes('approval requested') || refundMessage.includes('Approval requested') ? (
                  <a href="/admin/approvals" className="underline">View in Approvals</a>
                ) : null}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundModalOpen(false)} disabled={refundSubmitting}>Cancel</Button>
            <Button onClick={async () => {
              if (!selectedOrder) return
              const amt = Number(refundAmount)
              if (Number.isNaN(amt)) {
                setRefundMessage('Please enter a valid amount')
                return
              }
              setRefundSubmitting(true)
              setRefundMessage('Submitting…')
              try {
                const res = await fetch('/api/admin/orders/refund', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId: selectedOrder.id, amount: amt, reason: refundReason })
                })
                if (res.status === 202) {
                  setRefundMessage('Refund approval requested. Track it in Approvals.')
                } else if (res.ok) {
                  setRefundMessage('Refund processed')
                } else {
                  const j = await res.json().catch(() => ({}))
                  setRefundMessage(j.error || 'Request failed')
                }
              } finally {
                setRefundSubmitting(false)
              }
            }} disabled={refundSubmitting || !canRefund} title={!canRefund ? 'Requires orders.refund' : undefined}>
              {refundSubmitting ? 'Submitting…' : 'Request approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
