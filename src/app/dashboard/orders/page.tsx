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
  fileName: string | null
  fileSize: number | null
  downloadUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
  stockSite: {
    id: string
    name: string
    displayName: string
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'ready'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Order[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [regeneratingLinks, setRegeneratingLinks] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
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

  // Deduplicate orders (keep the latest version of each unique order)
  const deduplicateOrders = (orders: Order[]) => {
    return orders.reduce((acc: Order[], current: Order) => {
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
        if (current.status === 'READY' || 
            (current.status === 'PROCESSING' && existing.status !== 'READY') ||
            new Date(current.updatedAt) > new Date(existing.updatedAt)) {
          acc[existingIndex] = current
        }
      }
      return acc
    }, [])
  }

  const filteredOrders = orders.filter(order => {
    // Only show succeeded orders (READY)
    if (order.status !== 'READY') return false
    
    if (filter === 'all') return true
    if (filter === 'ready') return order.status === 'READY'
    return false
  })

  // Use search results if searching, otherwise use filtered orders
  const displayOrders = searchQuery.trim() ? searchResults : filteredOrders

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const results = orders.filter(order => {
      const searchTerm = query.toLowerCase()
      return (
        order.id.toLowerCase().includes(searchTerm) ||
        order.stockItemId.toLowerCase().includes(searchTerm) ||
        (order.title && order.title.toLowerCase().includes(searchTerm)) ||
        (order.stockItemUrl && order.stockItemUrl.toLowerCase().includes(searchTerm)) ||
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
      'shutterstock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Shutterstock_logo.svg/200px-Shutterstock_logo.svg.png',
      'adobe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/200px-Adobe_Systems_logo_and_wordmark.svg.png',
      'istockphoto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Adobe_Stock_logo.svg/200px-Adobe_Stock_logo.svg.png',
      'depositphotos': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Depositphotos_logo.svg/200px-Depositphotos_logo.svg.png',
      'freepik': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Freepik_logo.svg/200px-Freepik_logo.svg.png',
      'unsplash': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Unsplash_logo.svg/200px-Unsplash_logo.svg.png',
      'pixabay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pixabay_logo.svg/200px-Pixabay_logo.svg.png',
      'pexels': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Pexels_logo.svg/200px-Pexels_logo.svg.png',
      'pixabay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pixabay_logo.svg/200px-Pixabay_logo.svg.png'
    }
    return logos[siteName.toLowerCase()]
  }

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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date and time with timezone
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '32px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <RefreshCw style={{ width: '32px', height: '32px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Loading your orders...</p>
        </div>
      </div>
    )
  }

  const deduplicatedOrders = deduplicateOrders(displayOrders)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '8px',
              color: '#64748b',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid #e2e8f0'
            }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} />
              Back to Dashboard
            </Link>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                My Orders
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>
                Manage and download your requested files
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            <Download style={{ width: '20px', height: '20px' }} />
            {deduplicatedOrders.length} Order{deduplicatedOrders.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Search style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                Search Orders
              </h3>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by order ID, image link, title, or website..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white',
                    color: '#1e293b',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                />
                {isSearching && (
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #e2e8f0',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
              </div>
              
              {searchQuery && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                  }}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setIsSearching(false)
                    }}
                    style={{
                      padding: '12px 16px',
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#f87171'
                      e.currentTarget.style.color = '#dc2626'
                      e.currentTarget.style.background = '#fef2f2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.color = '#64748b'
                      e.currentTarget.style.background = 'white'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', name: 'All Orders', count: orders.filter(o => o.status === 'READY').length },
              { id: 'ready', name: 'Ready', count: orders.filter(o => o.status === 'READY').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  padding: '12px 20px',
                  background: filter === tab.id 
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                    : '#f8fafc',
                  color: filter === tab.id ? 'white' : '#64748b',
                  border: filter === tab.id 
                    ? 'none' 
                    : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: filter === tab.id 
                    ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                    : '0 1px 2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (filter !== tab.id) {
                    e.currentTarget.style.background = '#f1f5f9'
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== tab.id) {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }
                }}
              >
                {tab.name}
                <span style={{
                  padding: '2px 8px',
                  background: filter === tab.id 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : '#e2e8f0',
                  color: filter === tab.id 
                    ? 'white' 
                    : '#64748b',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {deduplicatedOrders.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 24px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '50%',
              marginBottom: '24px'
            }}>
              <FileText style={{ width: '48px', height: '48px', color: '#94a3b8' }} />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0'
            }}>
              {searchQuery ? 'No Results Found' : 'No Orders Yet'}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: '0 0 24px 0',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              {searchQuery 
                ? `No orders found matching "${searchQuery}". Try a different search term.`
                : 'Start requesting files from supported stock media sites to see your orders here.'
              }
            </p>
            {!searchQuery && (
              <Link href="/browse" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}>
                <Download style={{ width: '20px', height: '20px' }} />
                Start Requesting Files
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
          }}>
            {deduplicatedOrders.map((order) => {
              const statusColors = getStatusColor(order.status)
              const orderDate = formatOrderDate(order.createdAt)
              
              return (
                <div
                  key={order.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e2e8f0'
                      }}>
                        <img
                          src={getSiteLogo(order.stockSite.name)}
                          alt={order.stockSite.displayName}
                          style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'flex'
                          }}
                        />
                        <div style={{
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '700'
                        }}>
                          {order.stockSite.displayName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1e293b',
                          margin: '0 0 4px 0'
                        }}>
                          {order.stockSite.displayName}
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0
                        }}>
                          ID: {order.stockItemId}
                        </p>
                      </div>
                    </div>
                    
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
                      {order.status === 'READY' 
                        ? 'Ready' 
                        : order.status === 'PROCESSING' 
                        ? 'Processing' 
                        : 'Failed'}
                    </div>
                  </div>

                  {/* File Preview */}
                  {order.stockItemUrl && (
                    <div style={{
                      marginBottom: '20px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '120px',
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={order.stockItemUrl}
                          alt="File preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'flex'
                          }}
                        />
                        <div style={{
                          display: 'none',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          color: '#94a3b8'
                        }}>
                          {getFileTypeIcon(order.fileName)}
                          <span style={{ fontSize: '12px', fontWeight: '500' }}>
                            {order.fileName ? order.fileName.split('.').pop()?.toUpperCase() : 'FILE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <Clock style={{ width: '16px', height: '16px', color: '#64748b' }} />
                      <span style={{ fontWeight: '600', color: '#374151' }}>Ordered:</span>
                      <span style={{ color: '#64748b' }}>{orderDate.date}</span>
                      <span style={{ color: '#64748b' }}>at</span>
                      <span style={{ color: '#64748b' }}>{orderDate.time}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#94a3b8',
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {orderDate.timezone}
                      </span>
                    </div>
                    
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
                  </div>
                  
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
                          gap: '8px',
                          padding: '10px 16px',
                          background: 'white',
                          color: '#64748b',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.color = '#3b82f6'
                          e.currentTarget.style.background = '#f8fafc'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.color = '#64748b'
                          e.currentTarget.style.background = 'white'
                        }}
                      >
                        <ExternalLink style={{ width: '16px', height: '16px' }} />
                        View Original
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CSS for animations */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}