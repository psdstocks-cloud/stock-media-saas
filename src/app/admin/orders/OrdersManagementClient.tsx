'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Download, 
  RefreshCw, 
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
  User,
  Calendar,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface Order {
  id: string
  userId: string
  stockSiteId: string
  stockItemId: string
  stockItemUrl?: string | null
  title?: string | null
  cost: number
  status: string
  taskId?: string | null
  downloadUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image?: string | null
  }
  stockSite: {
    id: string
    name: string
    displayName: string
    cost: number
    category?: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    icon?: string | null
  }
}

interface OrdersManagementClientProps {
  initialOrders: Order[]
}

export default function OrdersManagementClient({ initialOrders }: OrdersManagementClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [siteFilter, setSiteFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const itemsPerPage = 20

  // Fetch orders with filters and pagination
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(siteFilter && { siteId: siteFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders)
        setTotalPages(data.pagination.pages)
        setTotalOrders(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchQuery, statusFilter, siteFilter, sortBy, sortOrder])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1)
        fetchOrders()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    setSelectedOrders(
      selectedOrders.length === orders.length 
        ? [] 
        : orders.map(order => order.id)
    )
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          icon: Clock
        }
      case 'PROCESSING':
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          icon: RefreshCw
        }
      case 'READY':
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          icon: CheckCircle
        }
      case 'COMPLETED':
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          icon: CheckCircle
        }
      case 'FAILED':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          icon: XCircle
        }
      case 'CANCELED':
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: '1px solid rgba(107, 114, 128, 0.3)',
          icon: X
        }
      case 'REFUNDED':
        return {
          background: 'rgba(139, 92, 246, 0.1)',
          color: '#8b5cf6',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          icon: RotateCcw
        }
      default:
        return {
          background: 'rgba(107, 114, 128, 0.1)',
          color: '#6b7280',
          border: '1px solid rgba(107, 114, 128, 0.3)',
          icon: Clock
        }
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Never'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      })
      
      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleCloseModal = () => {
    setShowOrderModal(false)
    setSelectedOrder(null)
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Search and Filter Bar */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search orders by user, title, or stock site..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELED">Canceled</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="">All Sites</option>
              <option value="shutterstock">Shutterstock</option>
              <option value="adobe-stock">Adobe Stock</option>
              <option value="freepik">Freepik</option>
              <option value="vecteezy">Vecteezy</option>
              <option value="rawpixel">Rawpixel</option>
            </select>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ marginLeft: '1rem', fontSize: '1rem' }}>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <p style={{ fontSize: '1rem', margin: 0 }}>No orders found</p>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 120px 100px 120px 80px',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div>
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  style={{ margin: 0 }}
                />
              </div>
              <div>Order Details</div>
              <div 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => handleSort('status')}
              >
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => handleSort('createdAt')}
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div>Cost</div>
              <div>Stock Site</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {orders.map((order) => {
                const statusStyle = getStatusBadgeStyle(order.status)
                const StatusIcon = statusStyle.icon
                
                return (
                  <div
                    key={order.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 120px 120px 100px 120px 80px',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        style={{ margin: 0 }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#1f2937',
                          fontSize: '0.95rem',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {order.title || `Order #${order.id.slice(-8)}`}
                        </div>
                        <div style={{
                          color: '#64748b',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <User size={12} />
                          {order.user.name || order.user.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        ...statusStyle
                      }}>
                        <StatusIcon size={12} />
                        {order.status}
                      </span>
                    </div>

                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {formatDate(order.createdAt)}
                    </div>

                    <div style={{ color: '#667eea', fontWeight: '600', fontSize: '0.85rem' }}>
                      {order.cost} pts
                    </div>

                    <div style={{ color: '#1f2937', fontSize: '0.85rem', fontWeight: '500' }}>
                      {order.stockSite.displayName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleViewOrder(order)}
                        style={{
                          padding: '0.5rem',
                          border: 'none',
                          borderRadius: '8px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {order.downloadUrl && (
                        <button
                          onClick={() => window.open(order.downloadUrl!, '_blank')}
                          style={{
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === 1 ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === 1 ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronsLeft size={16} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === 1 ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === 1 ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <span style={{
                  padding: '0.5rem 1rem',
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === totalPages ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === totalPages ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>Order Details</h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Order Info */}
              <div style={{
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  Order Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Order ID</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontFamily: 'monospace' }}>
                      {selectedOrder.id}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Status</label>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        ...getStatusBadgeStyle(selectedOrder.status)
                      }}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Cost</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#667eea', fontWeight: '600' }}>
                      {selectedOrder.cost} points
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Created</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div style={{
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  Customer Information
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                      {selectedOrder.user.name || 'No Name'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {selectedOrder.user.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Site Info */}
              <div style={{
                padding: '1rem',
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  Stock Media Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Stock Site</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#1f2937', fontWeight: '500' }}>
                      {selectedOrder.stockSite.displayName}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Item ID</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontFamily: 'monospace' }}>
                      {selectedOrder.stockItemId}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Title</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                      {selectedOrder.title || 'No title provided'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>File Size</label>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                      {formatFileSize(selectedOrder.fileSize)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Section */}
              {selectedOrder.downloadUrl && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.1)'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                    Download
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => window.open(selectedOrder.downloadUrl!, '_blank')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Download size={16} />
                      Download File
                    </button>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {selectedOrder.fileName || 'Download available'}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div style={{
                padding: '1rem',
                background: 'rgba(245, 158, 11, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.1)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                  Status Management
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'FAILED', 'CANCELED', 'REFUNDED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: selectedOrder.status === status ? '#3b82f6' : 'white',
                        color: selectedOrder.status === status ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
