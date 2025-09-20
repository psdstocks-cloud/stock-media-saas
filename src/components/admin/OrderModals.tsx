'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ShoppingCart, 
  Eye, 
  Download, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  FileText
} from 'lucide-react'

interface OrderData {
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

interface ViewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderData | null
}

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderData | null
  onSuccess: (order: OrderData) => void
}

interface BulkStatusModalProps {
  isOpen: boolean
  onClose: () => void
  orderIds: string[]
  onConfirm: (orderIds: string[], status: string, notes?: string) => void
}

export function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  if (!order) return null

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

  const handleDownloadAsset = () => {
    if (order.assetUrl) {
      window.open(order.assetUrl, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Order Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Order #{order.id.slice(0, 8)}...
                {getStatusBadge(order.status)}
              </CardTitle>
              <CardDescription>
                Created on {formatDate(order.createdAt)}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <Typography variant="body">{order.userName || 'No name provided'}</Typography>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <Typography variant="body">{order.userEmail}</Typography>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <Typography variant="body" className="font-mono text-sm">{order.userId}</Typography>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost</Label>
                  <Typography variant="body" className="font-medium">
                    {order.cost.toLocaleString()} pts
                  </Typography>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Asset Title</Label>
                <Typography variant="body" className="font-medium">
                  {order.assetTitle || 'Unknown Asset'}
                </Typography>
              </div>
              {order.assetUrl && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Asset URL</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Typography variant="body" className="font-mono text-sm truncate flex-1">
                      {order.assetUrl}
                    </Typography>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(order.assetUrl!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAsset}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              {order.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <Typography variant="body" className="mt-1 p-3 bg-muted rounded-md">
                    {order.notes}
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <Typography variant="body" className="font-medium">Order Created</Typography>
                    <Typography variant="caption" color="muted">{formatDate(order.createdAt)}</Typography>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <Typography variant="body" className="font-medium">Last Updated</Typography>
                    <Typography variant="caption" color="muted">{formatDate(order.updatedAt)}</Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EditOrderModal({ isOpen, onClose, order, onSuccess }: EditOrderModalProps) {
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        notes: order.notes || ''
      })
    }
  }, [order])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          notes: formData.notes
        }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        onSuccess(updatedOrder)
        onClose()
        toast.success('Order updated successfully!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update order')
        toast.error(errorData.error || 'Failed to update order')
      }
    } catch (error) {
      setError('An error occurred while updating order')
      toast.error('An error occurred while updating order')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!order) return null

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-blue-500' },
    { value: 'PROCESSING', label: 'Processing', color: 'bg-yellow-500' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
    { value: 'FAILED', label: 'Failed', color: 'bg-red-500' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Edit Order
          </DialogTitle>
          <DialogDescription>
            Update order status and add notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Order ID</Label>
            <Input
              value={order.id}
              disabled
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${option.color} mr-2`}></div>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this order..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function BulkStatusModal({ isOpen, onClose, orderIds, onConfirm }: BulkStatusModalProps) {
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!status || orderIds.length === 0) return

    setIsLoading(true)
    try {
      await onConfirm(orderIds, status, notes)
      onClose()
      setStatus('')
      setNotes('')
    } catch (error) {
      console.error('Error updating orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStatus('')
    setNotes('')
    onClose()
  }

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'bg-blue-500' },
    { value: 'PROCESSING', label: 'Processing', color: 'bg-yellow-500' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
    { value: 'FAILED', label: 'Failed', color: 'bg-red-500' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Bulk Update Orders
          </DialogTitle>
          <DialogDescription>
            Update status for {orderIds.length} selected orders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will update the status of {orderIds.length} orders. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${option.color} mr-2`}></div>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for all orders..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !status}>
              {isLoading ? 'Updating...' : `Update ${orderIds.length} Orders`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
