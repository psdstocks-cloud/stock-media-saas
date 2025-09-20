'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { User } from 'next-auth'
import { 
  Download, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  MoreVertical,
  RefreshCw
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Typography, 
  Badge, 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Skeleton,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { OrderRow } from '@/components/downloads/OrderRow'

interface OrderWithDetails {
  id: string
  title: string | null
  imageUrl: string | null
  cost: number
  status: string
  downloadUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: Date
  updatedAt: Date
  stockSite: {
    id: string
    name: string
    displayName: string
  }
}

interface PointsBalance {
  currentPoints: number
  totalUsed: number
}

interface DownloadStats {
  totalDownloads: number
  totalPointsSpent: number
  currentPoints: number
}

interface DownloadsClientProps {
  user: User
  initialOrders: OrderWithDetails[]
  pointsBalance: PointsBalance | null
  stats: DownloadStats
  error?: string
}

type ViewMode = 'grid' | 'list'
type SortBy = 'newest' | 'oldest' | 'title' | 'cost' | 'status'
type FilterBy = 'all' | 'completed' | 'processing' | 'failed'

const STATUS_CONFIG = {
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  PROCESSING: {
    label: 'Processing',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  }
}

const getFileTypeIcon = (fileName: string | null) => {
  if (!fileName) return FileText
  
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return Image
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'webm':
      return Video
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'flac':
      return Music
    case 'zip':
    case 'rar':
    case '7z':
      return Archive
    default:
      return FileText
  }
}

import { formatFileSize, formatDate } from '@/lib/date-utils'

export default function DownloadsClient({ 
  user, 
  initialOrders, 
  pointsBalance, 
  stats, 
  error 
}: DownloadsClientProps) {
  // State
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isPolling, setIsPolling] = useState(false)

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        (order.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        order.stockSite.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(order => order.status === filterBy.toUpperCase())
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'cost':
          return b.cost - a.cost
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [orders, searchQuery, sortBy, filterBy])

  // Real-time polling for pending orders
  useEffect(() => {
    // Check if there are any pending or processing orders
    const hasPendingOrders = orders.some(order => 
      order.status === 'PENDING' || order.status === 'PROCESSING'
    )

    if (!hasPendingOrders) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)

    // Polling function to check order status
    const pollOrderStatus = async () => {
      const pendingOrders = orders.filter(order => 
        order.status === 'PENDING' || order.status === 'PROCESSING'
      )

      if (pendingOrders.length === 0) {
        setIsPolling(false)
        return
      }

      try {
        // Check status for each pending order
        const statusChecks = await Promise.allSettled(
          pendingOrders.map(async (order) => {
            const response = await fetch(`/api/orders/${order.id}/status`)
            if (!response.ok) {
              throw new Error(`Failed to check status for order ${order.id}`)
            }
            const data = await response.json()
            return { orderId: order.id, statusData: data }
          })
        )

        // Update orders with new status
        let hasUpdates = false
        setOrders(currentOrders => {
          const updatedOrders = currentOrders.map(order => {
            const statusCheck = statusChecks.find(
              (check, index) => 
                check.status === 'fulfilled' && 
                check.value.orderId === order.id
            )

            if (statusCheck && statusCheck.status === 'fulfilled') {
              const { statusData } = statusCheck.value
              if (statusData.success && statusData.order) {
                const newStatus = statusData.order.status
                const newDownloadUrl = statusData.order.downloadUrl
                
                // Check if status or download URL has changed
                if (order.status !== newStatus || order.downloadUrl !== newDownloadUrl) {
                  hasUpdates = true
                  console.log(`Order ${order.id} status updated: ${order.status} -> ${newStatus}`)
                  
                  return {
                    ...order,
                    status: newStatus,
                    downloadUrl: newDownloadUrl,
                    fileName: statusData.order.fileName || order.fileName,
                    title: statusData.order.title || order.title
                  }
                }
              }
            }
            return order
          })
          return updatedOrders
        })

        // If no updates were made, we can stop polling
        if (!hasUpdates) {
          console.log('No status updates found, continuing to poll...')
        }

      } catch (error) {
        console.error('Error polling order status:', error)
      }
    }

    // Start polling immediately
    pollOrderStatus()

    // Set up interval for polling (every 5 seconds)
    const pollInterval = setInterval(pollOrderStatus, 5000)

    // Cleanup function
    return () => {
      clearInterval(pollInterval)
      setIsPolling(false)
    }
  }, [orders]) // Re-run when orders change

  // Handle download
  const handleDownload = async (order: OrderWithDetails) => {
    try {
      // If we have a direct download URL, use it
      if (order.downloadUrl) {
        window.open(order.downloadUrl, '_blank')
        return
      }
      
      // Otherwise, regenerate the download URL
      const response = await fetch(`/api/orders/${order.id}/regenerate-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download link')
      }
      
      if (data.success && data.downloadUrl) {
        // Open the fresh download URL
        window.open(data.downloadUrl, '_blank')
        
        // Show warning if there was a fallback
        if (data.warning) {
          console.warn('Download warning:', data.warning)
        }
      } else {
        throw new Error('No download URL received')
      }
    } catch (error) {
      console.error('Download failed:', error)
      // TODO: Show error toast notification
    }
  }

  // Handle bulk download
  const handleBulkDownload = async () => {
    const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id))
    const completedOrders = selectedOrdersData.filter(order => order.status === 'COMPLETED' && order.downloadUrl)
    
    if (completedOrders.length === 0) {
      console.warn('No completed orders selected for download')
      return
    }

    // Download each file
    completedOrders.forEach(order => {
      if (order.downloadUrl) {
        window.open(order.downloadUrl, '_blank')
      }
    })
  }

  // Refresh orders
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedOrders([])
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="h1" className="mb-2">
                My Downloads
              </Typography>
              <Typography variant="body" color="muted">
                Manage your purchased media and download history
              </Typography>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              {selectedOrders.length > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected ({selectedOrders.length})
                </Button>
              )}
            </div>
          </div>

          {/* Polling Status Indicator */}
          {isPolling && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <Typography variant="body-sm" className="text-blue-600">
                  Checking for updates on pending orders...
                </Typography>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" color="muted">
                      Total Downloads
                    </Typography>
                    <Typography variant="h3" className="font-semibold">
                      {stats.totalDownloads}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" color="muted">
                      Points Spent
                    </Typography>
                    <Typography variant="h3" className="font-semibold">
                      {stats.totalPointsSpent.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" color="muted">
                      Current Points
                    </Typography>
                    <Typography variant="h3" className="font-semibold">
                      {stats.currentPoints.toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" color="muted">
                      Pending Orders
                    </Typography>
                    <Typography variant="h3" className="font-semibold">
                      {orders.filter(order => order.status === 'PENDING' || order.status === 'PROCESSING').length}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="cost">Cost High-Low</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-6">
            <Typography variant="body-sm">
              {selectedOrders.length} item{selectedOrders.length !== 1 ? 's' : ''} selected
            </Typography>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={clearSelections}>
                Clear Selection
              </Button>
              <Button size="sm" onClick={handleBulkDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Selected
              </Button>
            </div>
          </div>
        )}

        {/* Orders Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="h3" className="mb-2">
                No downloads found
              </Typography>
              <Typography variant="body" color="muted" className="mb-4">
                {searchQuery || filterBy !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by purchasing some media to see your downloads here'
                }
              </Typography>
              {!searchQuery && filterBy === 'all' && (
                <Button asChild>
                  <a href="/dashboard/browse">Browse Media</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {filteredOrders.map((order) => {
              if (viewMode === 'list') {
                return (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onDownload={handleDownload}
                    onSelect={toggleOrderSelection}
                    isSelected={selectedOrders.includes(order.id)}
                    showSelection={selectedOrders.length > 0 || true}
                  />
                )
              }

              // Grid view (existing card implementation)
              const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.FAILED
              const StatusIcon = statusConfig.icon
              const FileIcon = getFileTypeIcon(order.fileName)

              return (
                <Card key={order.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={order.imageUrl || '/placeholder-image.jpg'}
                        alt={order.title || 'Media item'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-3 left-3 flex space-x-2">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className={cn("h-3 w-3 mr-1", statusConfig.iconColor)} />
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className="bg-white/90">
                          {order.cost} pts
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderSelection(order.id)}
                          className={cn(
                            "h-8 w-8 p-0 bg-white/90 hover:bg-white",
                            selectedOrders.includes(order.id) && "bg-primary text-primary-foreground"
                          )}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <Typography variant="h4" className="truncate mb-1">
                            {order.title || 'Untitled Media'}
                          </Typography>
                          <Typography variant="body-sm" color="muted">
                            {order.stockSite.displayName}
                          </Typography>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* File Info */}
                      {order.fileName && (
                        <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                          <FileIcon className="h-4 w-4" />
                          <span className="truncate">{order.fileName}</span>
                          {order.fileSize && (
                            <span>({formatFileSize(order.fileSize)})</span>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {order.status === 'COMPLETED' && order.downloadUrl ? (
                          <Button
                            size="sm"
                            onClick={() => handleDownload(order)}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        ) : order.status === 'PROCESSING' ? (
                          <Button size="sm" disabled className="flex-1">
                            <Clock className="h-4 w-4 mr-2" />
                            Processing...
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" />
                            Download Unavailable
                          </Button>
                        )}
                        
                        {order.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(order.downloadUrl!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination would go here in a real implementation */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <Typography variant="body-sm" color="muted">
              Showing {filteredOrders.length} of {orders.length} downloads
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}
