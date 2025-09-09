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
  Music,
  Search
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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Order[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [regeneratingLinks, setRegeneratingLinks] = useState<Set<string>>(new Set())

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
        // Deduplicate orders by stockItemId and stockSite.id
        const uniqueOrders = data.orders.reduce((acc: Order[], current: Order) => {
          const existingIndex = acc.findIndex(order => 
            order.stockItemId === current.stockItemId && 
            order.stockSite.id === current.stockSite.id
          )
          
          if (existingIndex === -1) {
            // No duplicate found, add the order
            acc.push(current)
          } else {
            // Duplicate found, keep the one with the latest status or most recent
            const existing = acc[existingIndex]
            if (current.status === 'COMPLETED' || current.status === 'READY' || 
                (current.status === 'PROCESSING' && existing.status !== 'COMPLETED' && existing.status !== 'READY') ||
                new Date(current.updatedAt) > new Date(existing.updatedAt)) {
              acc[existingIndex] = current
            }
          }
          return acc
        }, [])
        
        setOrders(uniqueOrders)
        // Track processing orders
        const processing = uniqueOrders.filter((o: Order) => o.status === 'PROCESSING' || o.status === 'PENDING')
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

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    // Search in orders by ID or image link
    const results = orders.filter(order => {
      const searchLower = query.toLowerCase()
      return (
        order.stockItemId.toLowerCase().includes(searchLower) ||
        (order.stockItemUrl && order.stockItemUrl.toLowerCase().includes(searchLower)) ||
        (order.title && order.title.toLowerCase().includes(searchLower)) ||
        order.stockSite.displayName.toLowerCase().includes(searchLower)
      )
    })
    
    setSearchResults(results)
    setIsSearching(false)
  }

  // Smart download functionality that handles expired links automatically
  const handleSmartDownload = async (order: Order) => {
    try {
      setRegeneratingLinks(prev => new Set(prev).add(order.id))
      
      // If link is expired or doesn't exist, regenerate it first
      if (isDownloadLinkExpired(order) || !order.downloadUrl) {
        console.log('Link expired or missing, regenerating for order:', order.id)
        
        const response = await fetch(`/api/orders/${order.id}/regenerate-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (data.success && data.order) {
          // Update the order in the local state
          setOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === order.id ? data.order : o
            )
          )
          
          // Open the new download link
          if (data.order.downloadUrl) {
            window.open(data.order.downloadUrl, '_blank', 'noopener,noreferrer')
          }
        } else {
          throw new Error(data.error || 'Failed to regenerate download link')
        }
      } else {
        // Link is fresh, download directly
        window.open(order.downloadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error handling download:', error)
      alert(`Failed to prepare download: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRegeneratingLinks(prev => {
        const newSet = new Set(prev)
        newSet.delete(order.id)
        return newSet
      })
    }
  }

  // Check if download link is likely expired (older than 2 hours)
  const isDownloadLinkExpired = (order: Order) => {
    if (!order.downloadUrl) return false
    
    const now = new Date()
    const updatedAt = new Date(order.updatedAt)
    const hoursSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceUpdate > 2 // Consider expired after 2 hours
  }

  const filteredOrders = orders.filter(order => {
    // Only show succeeded orders (READY and COMPLETED)
    if (order.status !== 'READY' && order.status !== 'COMPLETED') return false
    
    if (filter === 'all') return true
    if (filter === 'ready') return order.status === 'READY' || order.status === 'COMPLETED'
    return order.status.toLowerCase() === filter.toLowerCase()
  })

  // Use search results if searching, otherwise use filtered orders
  const displayOrders = searchQuery.trim() ? searchResults : filteredOrders

  const getWebsiteLogo = (siteName: string): string | undefined => {
    const logos: { [key: string]: string } = {
      'shutterstock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Shutterstock_logo.svg/200px-Shutterstock_logo.svg.png',
      'depositphotos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Depositphotos_logo.svg/200px-Depositphotos_logo.svg.png',
      'istockphoto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Adobe_Stock_logo.svg/200px-Adobe_Stock_logo.svg.png',
      'adobestock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Adobe_Stock_logo.svg/200px-Adobe_Stock_logo.svg.png',
      'gettyimages': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png',
      'unsplash': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Unsplash_logo_2014.svg/200px-Unsplash_logo_2014.svg.png',
      'pexels': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Pexels_logo.svg/200px-Pexels_logo.svg.png',
      'pixabay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pixabay_logo.svg/200px-Pixabay_logo.svg.png'
    }
    return logos[siteName.toLowerCase()]
  }

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
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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

        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔍 Search Orders
            </h3>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by ID, image link, title, or website..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.background = '#f8fafc'
                  }}
                />
                {isSearching && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #2563eb',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
              </div>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setIsSearching(false)
                  }}
                  style={{
                    padding: '12px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery && (
              <div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {searchResults.length > 0 ? (
                  <span style={{ color: '#059669', fontWeight: '500' }}>
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{ color: '#dc2626' }}>
                    No results found for "{searchQuery}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', name: 'All Orders', count: orders.filter(o => o.status === 'READY' || o.status === 'COMPLETED').length },
              { id: 'ready', name: 'Ready', count: orders.filter(o => o.status === 'READY' || o.status === 'COMPLETED').length },
              { id: 'completed', name: 'Completed', count: orders.filter(o => o.status === 'COMPLETED').length },
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
        {displayOrders.length === 0 ? (
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
              {searchQuery ? 'No search results found' :
               filter === 'all' ? 'No orders yet' : 
               filter === 'ready' ? 'No ready orders yet' : 
               `No ${filter} orders`}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              marginBottom: '24px'
            }}>
              {searchQuery 
                ? 'Try a different search term or check your spelling'
                : filter === 'all' 
                ? 'Start browsing stock media to place your first order'
                : filter === 'ready'
                ? 'Your completed orders will appear here. Place an order to get started!'
                : 'Try a different filter or check back later'
              }
            </div>
            {!searchQuery && filter === 'all' && (
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
            {displayOrders.map((order) => {
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
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden'
                        }}>
                          {getWebsiteLogo(order.stockSite.name) ? (
                            <img 
                              src={getWebsiteLogo(order.stockSite.name)} 
                              alt={order.stockSite.displayName}
                              style={{
                                width: '32px',
                                height: '32px',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div style="color: #6b7280; font-size: 14px; font-weight: bold;">${order.stockSite.displayName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>
                              {order.stockSite.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
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
                              margin: '0 0 4px 0',
                              fontWeight: '500'
                            }}>
                              {order.title}
                            </p>
                          )}
                          {order.taskId && (
                            <p style={{
                              fontSize: '12px',
                              color: '#9ca3af',
                              margin: 0,
                              fontFamily: 'monospace',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}>
                              Debug ID: {order.taskId}
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
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: '140px'
                      }}>
                        {(order.status === 'READY' || order.status === 'COMPLETED') && (
                          <button
                            onClick={() => handleSmartDownload(order)}
                            disabled={regeneratingLinks.has(order.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '12px 20px',
                              background: regeneratingLinks.has(order.id) 
                                ? '#f3f4f6' 
                                : 'linear-gradient(135deg, #059669, #047857)',
                              color: regeneratingLinks.has(order.id) ? '#9ca3af' : 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: regeneratingLinks.has(order.id) ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: regeneratingLinks.has(order.id) 
                                ? 'none' 
                                : '0 4px 12px rgba(5, 150, 105, 0.3)',
                              minWidth: '160px'
                            }}
                            onMouseEnter={(e) => {
                              if (!regeneratingLinks.has(order.id)) {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!regeneratingLinks.has(order.id)) {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)'
                              }
                            }}
                          >
                            {regeneratingLinks.has(order.id) ? (
                              <>
                                <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                Preparing Download...
                              </>
                            ) : (
                              <>
                                <Download style={{ width: '16px', height: '16px' }} />
                                Download for Free
                              </>
                            )}
                          </button>
                        )}
                        
                        {order.stockItemUrl && (
                          <a
                            href={order.stockItemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
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
