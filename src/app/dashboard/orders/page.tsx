'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video,
  Music
} from 'lucide-react'

interface Order {
  id: string
  stockItemId: string
  stockItemUrl: string | null
  title: string | null
  cost: number
  status: string
  taskId: string | null
  downloadUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: string
  updatedAt: string
  stockSite: {
    id: string
    name: string
    displayName: string
    cost: number
    category: string | null
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'ready' | 'completed' | 'failed'>('ready')
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    fetchOrders()
  }, [session, status, router])

  // No more polling - orders page is static

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?userId=${session?.user?.id}`)
      const data = await response.json()
      
      if (data.orders) {
        setOrders(data.orders)
        // Track processing orders
        const processing = data.orders.filter((o: Order) => o.status === 'PROCESSING' || o.status === 'PENDING')
        setProcessingOrders(new Set(processing.map((o: Order) => o.id)))
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    // Always exclude processing orders
    if (order.status === 'PROCESSING' || order.status === 'PENDING') return false
    
    if (filter === 'all') return true
    if (filter === 'ready') return order.status === 'READY' || order.status === 'COMPLETED'
    return order.status.toLowerCase() === filter.toLowerCase()
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#059669' }} />
      case 'READY':
        return <Download style={{ width: '16px', height: '16px', color: '#2563eb' }} />
      case 'PROCESSING':
        return <RefreshCw style={{ width: '16px', height: '16px', color: '#d97706', animation: 'spin 1s linear infinite' }} />
      case 'PENDING':
        return <Clock style={{ width: '16px', height: '16px', color: '#6b7280' }} />
      case 'FAILED':
        return <XCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
      case 'CANCELED':
        return <XCircle style={{ width: '16px', height: '16px', color: '#6b7280' }} />
      default:
        return <AlertCircle style={{ width: '16px', height: '16px', color: '#6b7280' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
      case 'READY':
        return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
      case 'PROCESSING':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
      case 'PENDING':
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
      case 'FAILED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }
      case 'CANCELED':
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' }
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' }
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (fileName: string | null) => {
    if (!fileName) return <FileText style={{ width: '16px', height: '16px', color: '#6b7280' }} />
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <Video style={{ width: '16px', height: '16px', color: '#ef4444' }} />
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <Music style={{ width: '16px', height: '16px', color: '#22c55e' }} />
      default:
        return <FileText style={{ width: '16px', height: '16px', color: '#6b7280' }} />
    }
  }

  const getProcessingTime = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`
    }
    return `${diffSecs}s`
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{
            marginTop: '16px',
            color: '#64748b',
            fontSize: '18px'
          }}>Loading orders...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Dashboard
              </Link>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>SM</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>My Orders</h1>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 1rem'
      }}>
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <XCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
            <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', name: 'All Orders', count: orders.filter(o => o.status !== 'PROCESSING' && o.status !== 'PENDING').length },
              { id: 'ready', name: 'Ready', count: orders.filter(o => o.status === 'READY' || o.status === 'COMPLETED').length },
              { id: 'completed', name: 'Completed', count: orders.filter(o => o.status === 'COMPLETED').length },
              { id: 'failed', name: 'Failed', count: orders.filter(o => o.status === 'FAILED').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ...(filter === tab.id
                    ? {
                        background: '#2563eb',
                        color: 'white',
                        borderColor: '#2563eb'
                      }
                    : {
                        background: 'white',
                        color: '#6b7280',
                        borderColor: '#d1d5db'
                      }
                  )
                }}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 32px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              {filter === 'all' ? 'No orders yet' : 
               filter === 'ready' ? 'No ready orders yet' : 
               `No ${filter} orders`}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              marginBottom: '24px'
            }}>
              {filter === 'all' 
                ? 'Start browsing stock media to place your first order'
                : filter === 'ready'
                ? 'Your completed orders will appear here. Place an order to get started!'
                : 'Try a different filter or check back later'
              }
            </div>
            {filter === 'all' && (
              <Link 
                href="/dashboard/browse"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Browse Stock Media
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((order) => {
              const statusColors = getStatusColor(order.status)
              const isProcessing = order.status === 'PROCESSING' || order.status === 'PENDING'
              
              return (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {order.stockSite.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: '0 0 4px 0',
                            lineHeight: '1.3'
                          }}>
                            {order.stockSite.displayName} #{order.stockItemId}
                          </h3>
                          {order.title && (
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: 0,
                              fontWeight: '500'
                            }}>
                              {order.title}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '16px',
                        fontSize: '14px',
                        color: '#6b7280',
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            background: '#2563eb',
                            borderRadius: '50%'
                          }}></div>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Source:</span>
                          <span style={{ color: '#6b7280' }}>{order.stockSite.displayName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            background: '#059669',
                            borderRadius: '50%'
                          }}></div>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Cost:</span>
                          <span style={{ color: '#6b7280' }}>{order.cost} points</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            background: '#7c3aed',
                            borderRadius: '50%'
                          }}></div>
                          <span style={{ fontWeight: '600', color: '#374151' }}>Ordered:</span>
                          <span style={{ color: '#6b7280' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        {order.fileName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              background: '#dc2626',
                              borderRadius: '50%'
                            }}></div>
                            <span style={{ fontWeight: '600', color: '#374151' }}>File:</span>
                            <span style={{ color: '#6b7280' }}>{order.fileName}</span>
                          </div>
                        )}
                        {order.fileSize && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              background: '#ea580c',
                              borderRadius: '50%'
                            }}></div>
                            <span style={{ fontWeight: '600', color: '#374151' }}>Size:</span>
                            <span style={{ color: '#6b7280' }}>{formatFileSize(order.fileSize)}</span>
                          </div>
                        )}
                        {isProcessing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              background: '#f59e0b',
                              borderRadius: '50%'
                            }}></div>
                            <span style={{ fontWeight: '600', color: '#374151' }}>Processing:</span>
                            <span style={{ color: '#6b7280' }}>{getProcessingTime(order.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`,
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {order.downloadUrl && (order.status === 'READY' || order.status === 'COMPLETED') && (
                          <a
                            href={order.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #059669, #047857)',
                              color: 'white',
                              borderRadius: '10px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                            }}
                          >
                            <Download style={{ width: '16px', height: '16px' }} />
                            Download for Free
                          </a>
                        )}
                        
                        {order.stockItemUrl && (
                          <a
                            href={order.stockItemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                              color: '#374151',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <ExternalLink style={{ width: '16px', height: '16px' }} />
                            View Image Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
