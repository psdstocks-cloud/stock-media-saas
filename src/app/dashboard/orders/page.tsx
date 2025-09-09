'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  ImageIcon,
  Video,
  Music,
  FileText,
  ExternalLink
} from 'lucide-react'

interface Order {
  id: string
  status: 'READY' | 'PROCESSING' | 'PENDING' | 'FAILED' | 'CANCELED'
  taskId: string | null
  downloadUrl: string | null
  fileName: string | null
  stockItemUrl: string | null
  title: string | null
  createdAt: string
  updatedAt: string
  stockSite: {
    id: string
    name: string
    displayName: string
    cost: number
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Order[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [regeneratingLinks, setRegeneratingLinks] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
  }, [session, status, router])

  // Fetch orders
  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders()
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching orders...')
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📦 Orders fetched:', data.orders?.length || 0, 'orders')
      
      if (data.orders) {
        setOrders(data.orders)
      } else {
        console.warn('⚠️ No orders in response')
        setOrders([])
      }
    } catch (error) {
      console.error('💥 Error fetching orders:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  // Smart download functionality
  const handleSmartDownload = async (order: Order) => {
    try {
      setRegeneratingLinks(prev => new Set(prev).add(order.id))
      
      console.log('🔄 Regenerating download link for order:', {
        orderId: order.id,
        status: order.status,
        taskId: order.taskId,
        hasDownloadUrl: !!order.downloadUrl
      })
      
      const response = await fetch(`/api/orders/${order.id}/regenerate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('📡 API response data:', data)

      if (data.success && data.order) {
        console.log('✅ Download link regenerated successfully')
        
        // Update the order in local state
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === order.id ? data.order : o
          )
        )
        
        // Open the download link
        if (data.order.downloadUrl) {
          console.log('🔗 Opening download URL:', data.order.downloadUrl)
          window.open(data.order.downloadUrl, '_blank', 'noopener,noreferrer')
        } else {
          console.warn('⚠️ No download URL in response')
          alert('Download link not available yet. Please try again later.')
        }
      } else {
        throw new Error(data.error || 'Failed to regenerate download link')
      }
    } catch (error) {
      console.error('💥 Error handling download:', error)
      alert(`Failed to prepare download: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setRegeneratingLinks(prev => {
        const newSet = new Set(prev)
        newSet.delete(order.id)
        return newSet
      })
    }
  }

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    const results = orders.filter(order => {
      const searchTerm = query.toLowerCase()
      return (
        order.id.toLowerCase().includes(searchTerm) ||
        order.stockItemUrl?.toLowerCase().includes(searchTerm) ||
        order.title?.toLowerCase().includes(searchTerm) ||
        order.stockSite.name.toLowerCase().includes(searchTerm) ||
        order.stockSite.displayName.toLowerCase().includes(searchTerm)
      )
    })
    
    setSearchResults(results)
    setIsSearching(false)
  }

  // Get site logo
  const getSiteLogo = (siteName: string) => {
    const logos: { [key: string]: string } = {
      'shutterstock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Shutterstock_logo.svg/200px-Shutterstock_logo.svg.png',
      'adobe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo.svg/200px-Adobe_Systems_logo.svg.png',
      'istockphoto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Adobe_Stock_logo.svg/200px-Adobe_Stock_logo.svg.png',
      'depositphotos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Depositphotos_logo.svg/200px-Depositphotos_logo.svg.png',
      'freepik': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Freepik_logo.svg/200px-Freepik_logo.svg.png',
      'unsplash': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Unsplash_logo.svg/200px-Unsplash_logo.svg.png',
      'pixabay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pixabay_logo.svg/200px-Pixabay_logo.svg.png',
      'pexels': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Pexels_logo.svg/200px-Pexels_logo.svg.png'
    }
    return logos[siteName.toLowerCase()]
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#059669' }} />
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }
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

  // Format order date
  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  // Get file type icon
  const getFileTypeIcon = (fileName: string | null) => {
    if (!fileName) return <FileText style={{ width: '16px', height: '16px', color: '#6b7280' }} />
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon style={{ width: '16px', height: '16px', color: '#059669' }} />
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'webm':
        return <Video style={{ width: '16px', height: '16px', color: '#dc2626' }} />
      case 'mp3':
      case 'wav':
      case 'aac':
        return <Music style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
      default:
        return <FileText style={{ width: '16px', height: '16px', color: '#6b7280' }} />
    }
  }

  // Filter orders (only show successful ones)
  const filteredOrders = orders.filter(order => order.status === 'READY')
  
  // Use search results if searching, otherwise use filtered orders
  const displayOrders = searchQuery.trim() ? searchResults.filter(order => order.status === 'READY') : filteredOrders

  if (status === 'loading' || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <RefreshCw style={{ 
            width: '48px', 
            height: '48px', 
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Loading Orders...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          maxWidth: '500px',
          padding: '32px'
        }}>
          <XCircle style={{ 
            width: '48px', 
            height: '48px', 
            color: '#ef4444',
            marginBottom: '16px'
          }} />
          <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', fontWeight: '600' }}>Error Loading Orders</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '16px', opacity: 0.9 }}>{error}</p>
          <button
            onClick={fetchOrders}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '36px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            My Orders - Reconstructed
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '18px',
            margin: '0 0 24px 0'
          }}>
            Manage and download your requested files - Completely rebuilt for reliability
          </p>
          
          {/* Search Bar */}
          <div style={{
            position: 'relative',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search style={{
                position: 'absolute',
                left: '16px',
                width: '20px',
                height: '20px',
                color: '#6b7280',
                zIndex: 1
              }} />
              <input
                type="text"
                placeholder="Search orders by ID, website, or image link..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setIsSearching(false)
                  }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px'
                  }}
                >
                  <XCircle style={{ width: '20px', height: '20px' }} />
                </button>
              )}
            </div>
            
            {searchQuery && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                marginTop: '8px',
                padding: '16px',
                zIndex: 10
              }}>
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {isSearching ? 'Searching...' : `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div style={{
          display: 'grid',
          gap: '24px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
        }}>
          {displayOrders.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '64px 24px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <FileText style={{
                width: '64px',
                height: '64px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '16px'
              }} />
              <h3 style={{
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                {searchQuery ? 'No matching orders found' : 'No orders yet'}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '16px',
                margin: '0'
              }}>
                {searchQuery ? 'Try a different search term' : 'Start requesting files to see them here'}
              </p>
            </div>
          ) : (
            displayOrders.map((order) => {
              const statusColors = getStatusColor(order.status)
              const orderDate = formatOrderDate(order.createdAt)
              
              return (
                <div
                  key={order.id}
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <img
                        src={getSiteLogo(order.stockSite.name)}
                        alt={order.stockSite.displayName}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div>
                        <h3 style={{
                          margin: '0 0 4px 0',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {order.stockSite.displayName}
                        </h3>
                        <p style={{
                          margin: '0',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          ID: {order.id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      background: statusColors.bg,
                      color: statusColors.text,
                      borderRadius: '20px',
                      border: `1px solid ${statusColors.border}`,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      {getFileTypeIcon(order.fileName)}
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {order.fileName || 'Unknown file type'}
                      </span>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '8px'
                    }}>
                      Ordered: {orderDate.date} at {orderDate.time} ({orderDate.timezone})
                    </div>
                    
                    {order.stockItemUrl && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <ExternalLink style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                        <a
                          href={order.stockItemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '12px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          View Original
                        </a>
                      </div>
                    )}
                  </div>

                  {/* File Preview */}
                  {order.stockItemUrl && (
                    <div style={{
                      marginBottom: '16px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb'
                    }}>
                      <img
                        src={order.stockItemUrl}
                        alt="File preview"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'contain',
                          background: '#f9fafb'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {order.status === 'READY' && (
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
                            : '0 4px 12px rgba(5, 150, 105, 0.3)'
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
                            Get Fresh Download Link
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px'
          }}>
            <strong>Debug Info:</strong> Total orders: {orders.length}, Filtered: {filteredOrders.length}, Displaying: {displayOrders.length}
          </div>
        )}
      </div>
    </div>
  )
}