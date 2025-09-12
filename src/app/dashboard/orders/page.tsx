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
  ExternalLink,
  Grid,
  List
} from 'lucide-react'

interface Order {
  id: string
  status: 'READY' | 'PROCESSING' | 'PENDING' | 'FAILED' | 'CANCELED' | 'COMPLETED' | 'REFUNDED'
  taskId: string | null
  downloadUrl: string | null
  fileName: string | null
  stockItemUrl: string | null
  imageUrl: string | null
  title: string | null
  stockItemId: string | null
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
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAnyDownloadActive, setIsAnyDownloadActive] = useState(false)
  const [downloadingOrders, setDownloadingOrders] = useState<Set<string>>(new Set())

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
    if (session?.user?.id && status === 'authenticated') {
      console.log('🔄 useEffect: Fetching orders for user:', session.user.id)
      fetchOrders()
    }
  }, [session?.user?.id, status])

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

  // Direct download functionality - no API calls, just open existing URL
  const handleSmartDownload = async (order: Order) => {
    console.log('🔄 handleSmartDownload called for order:', order.id)
    
    // Prevent multiple simultaneous downloads globally
    if (isAnyDownloadActive) {
      console.log('⏳ Another download is already in progress. Please wait...')
      return
    }
    
    // Prevent multiple simultaneous downloads of the same order
    if (downloadingOrders.has(order.id)) {
      console.log('⏳ Download already in progress for order:', order.id)
      return
    }
    
    // Check if order has a download URL
    if (!order.downloadUrl) {
      console.error('❌ No download URL available for order:', order.id)
      return
    }
    
    try {
      console.log('🚀 Starting direct download for order:', order.id)
      setIsAnyDownloadActive(true)
      setDownloadingOrders(prev => new Set(prev).add(order.id))
      
      console.log('🔗 Opening existing download URL:', order.downloadUrl)
      
      // Method 1: Direct window.open (bypasses popup blockers when triggered by user action)
      console.log('🔧 Opening download in new tab...')
      const newWindow = window.open(order.downloadUrl, '_blank', 'noopener,noreferrer')
      
      if (newWindow) {
        console.log('✅ Download opened in new tab successfully')
        // Focus the new window
        newWindow.focus()
      } else {
        console.warn('⚠️ Popup blocked, trying fallback method...')
        
        // Method 2: Fallback - create temporary link
        console.log('🔧 Creating temporary link element as fallback...')
        const link = document.createElement('a')
        link.href = order.downloadUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.style.display = 'none'
        
        console.log('📎 Adding link to DOM...')
        document.body.appendChild(link)
        console.log('✅ Link added to DOM')
        
        console.log('🖱️ Clicking link...')
        link.click()
        console.log('✅ Link clicked')
        
        console.log('🗑️ Removing link from DOM...')
        document.body.removeChild(link)
        console.log('✅ Link removed from DOM')
      }
      
      // Prevent any further download attempts for this order
      console.log('✅ Download initiated successfully for order:', order.id)
    } catch (error) {
      console.error('💥 Download error:', error)
      // Silent fail - no popup, just log the error
      console.warn('Download failed silently')
    } finally {
      console.log('🧹 Cleaning up download state for order:', order.id)
      setIsAnyDownloadActive(false)
      setDownloadingOrders(prev => {
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

  // Generate preview image URL from stockItemUrl for all supported sites
  const getPreviewImageUrl = (order: Order) => {
    // If imageUrl exists, use it
    if (order.imageUrl) {
      return order.imageUrl
    }

    // If no imageUrl, try to generate from stockItemId and site
    if (order.stockItemId) {
      const siteName = order.stockSite.name.toLowerCase()
      
      // Shutterstock: Standard preview format
      if (siteName === 'shutterstock' || siteName === 'vshutter' || siteName === 'mshutter') {
        return `https://image.shutterstock.com/image-photo/${order.stockItemId}-260nw-${order.stockItemId}.jpg`
      }
      
      // Adobe Stock: Multiple preview formats
      if (siteName === 'adobestock' || siteName === 'adobe') {
        // Try different Adobe Stock preview formats
        const id = order.stockItemId
        if (id.length >= 4) {
          return `https://as1.ftcdn.net/v2/jpg/${id.slice(0, 2)}/${id.slice(2, 4)}/${id}_1.jpg`
        }
        return `https://as1.ftcdn.net/v2/jpg/00/00/${id}_1.jpg`
      }
      
      // iStock/Getty Images: Standard preview format
      if (siteName === 'istockphoto' || siteName === 'istock' || siteName === 'gettyimages') {
        return `https://media.istockphoto.com/id/${order.stockItemId}/photo/stock-photo.jpg`
      }
      
      // Depositphotos: Multiple preview formats
      if (siteName === 'depositphotos' || siteName === 'depositphotos_video') {
        return `https://st2.depositphotos.com/${order.stockItemId}/photo.jpg`
      }
      
      // Freepik: Standard preview format
      if (siteName === 'freepik' || siteName === 'vfreepik') {
        return `https://img.freepik.com/free-photo/${order.stockItemId}.jpg`
      }
      
      // Flaticon: Icon preview format
      if (siteName === 'flaticon' || siteName === 'flaticonpack') {
        return `https://cdn-icons-png.flaticon.com/512/${order.stockItemId}/${order.stockItemId}.png`
      }
      
      // 123RF: Standard preview format
      if (siteName === '123rf') {
        return `https://us.123rf.com/450wm/${order.stockItemId}/${order.stockItemId}.jpg`
      }
      
      // Dreamstime: Standard preview format
      if (siteName === 'dreamstime') {
        return `https://thumbs.dreamstime.com/z/${order.stockItemId}.jpg`
      }
      
      // Vectorstock: Vector preview format
      if (siteName === 'vectorstock') {
        return `https://cdn3.vectorstock.com/i/1000x1000/${order.stockItemId}/vector-stock.jpg`
      }
      
      // Alamy: Standard preview format
      if (siteName === 'alamy') {
        return `https://c8.alamy.com/comp/${order.stockItemId}/stock-photo.jpg`
      }
      
      // Storyblocks: Video/Image preview format
      if (siteName === 'storyblocks') {
        return `https://dm0qx8t0i0gc9.cloudfront.net/thumbnails/video/${order.stockItemId}/stock-video.jpg`
      }
      
      // Vecteezy: Vector preview format
      if (siteName === 'vecteezy') {
        return `https://static.vecteezy.com/system/resources/previews/${order.stockItemId}/vector.jpg`
      }
      
      // Creative Fabrica: Product preview format
      if (siteName === 'creativefabrica') {
        return `https://cf.shopify.com/images/products/${order.stockItemId}/preview.jpg`
      }
      
      // Rawpixel: Image preview format
      if (siteName === 'rawpixel') {
        return `https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvcm00MjgtYy0xLmpwZw==.png`
      }
      
      // Motion Array: Video preview format
      if (siteName === 'motionarray') {
        return `https://motionarray.imgix.net/preview-${order.stockItemId}.jpg`
      }
      
      // Envato Elements: Product preview format
      if (siteName === 'envato') {
        return `https://elements-cover-images-0.imgix.net/${order.stockItemId}/preview.jpg`
      }
      
      // Pixelsquid: 3D preview format
      if (siteName === 'pixelsquid') {
        return `https://cdn.pixelsquid.com/stock-photos/${order.stockItemId}/preview.jpg`
      }
      
      // UI8: Design preview format
      if (siteName === 'ui8') {
        return `https://ui8.net/images/${order.stockItemId}/preview.jpg`
      }
      
      // IconScout: Icon preview format
      if (siteName === 'iconscout') {
        return `https://iconscout.com/icon/${order.stockItemId}/preview`
      }
      
      // Lovepik: Image preview format
      if (siteName === 'lovepik') {
        return `https://img.lovepik.com/photo/${order.stockItemId}.jpg`
      }
      
      // Pngtree: Image preview format
      if (siteName === 'pngtree') {
        return `https://png.pngtree.com/png-vector/${order.stockItemId}/preview.png`
      }
      
      // Deezy: Product preview format
      if (siteName === 'deeezy') {
        return `https://deeezy.com/images/products/${order.stockItemId}/preview.jpg`
      }
      
      // Footage Crate: Video preview format
      if (siteName === 'footagecrate') {
        return `https://footagecrate.com/videos/${order.stockItemId}/preview.jpg`
      }
      
      // Art Grid: Video preview format
      if (siteName === 'artgrid_hd') {
        return `https://artgrid.io/clips/${order.stockItemId}/preview.jpg`
      }
      
      // Yellow Images: Product preview format
      if (siteName === 'yellowimages') {
        return `https://yellowimages.com/stock/${order.stockItemId}/preview.jpg`
      }
      
      // Epidemic Sound: Audio preview format (waveform)
      if (siteName === 'epidemicsound') {
        return `https://epic7static.s3.amazonaws.com/audio/${order.stockItemId}/waveform.png`
      }
    }

    return null
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
      case 'COMPLETED':
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
      case 'COMPLETED':
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

  // Filter orders (show all completed/ready orders)
  const filteredOrders = orders.filter(order => 
    order.status === 'READY' || 
    order.status === 'COMPLETED' || 
    order.status === 'PROCESSING' ||
    order.status === 'PENDING'
  )
  
  // Use search results if searching, otherwise use filtered orders
  const displayOrders = searchQuery.trim() ? searchResults.filter(order => 
    order.status === 'READY' || 
    order.status === 'COMPLETED' || 
    order.status === 'PROCESSING' ||
    order.status === 'PENDING'
  ) : filteredOrders

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
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Page Header */}
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
            My Orders
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '18px',
            margin: '0 0 24px 0'
          }}>
            Manage and download your requested files
          </p>
          
          {/* View Toggle and Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* View Toggle */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '4px',
              backdropFilter: 'blur(10px)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                <Grid style={{ width: '16px', height: '16px' }} />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                <List style={{ width: '16px', height: '16px' }} />
                List
              </button>
            </div>

            {/* Search Bar */}
            <div style={{
              position: 'relative',
              maxWidth: '400px',
              width: '100%'
            }}>
              <Search style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: 'rgba(255,255,255,0.6)',
                zIndex: 1
              }} />
              <input
                type="text"
                placeholder="Search orders by ID, website, or image link..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)'
                  e.target.style.border = '1px solid rgba(255,255,255,0.4)'
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.border = '1px solid rgba(255,255,255,0.2)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Orders Content */}
        {displayOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'rgba(255,255,255,0.6)'
            }}>
              <Download style={{ width: '32px', height: '32px' }} />
            </div>
            <h3 style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: '600',
              margin: '0 0 12px 0'
            }}>
              {searchQuery.trim() ? 'No orders found' : 'No orders yet'}
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '16px',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              {searchQuery.trim() 
                ? 'Try adjusting your search terms or browse our media collection.'
                : 'Start by browsing our media collection and placing your first order.'
              }
            </p>
            {!searchQuery.trim() && (
              <button
                onClick={() => router.push('/dashboard/browse')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Download Media
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Orders Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {displayOrders.length} {displayOrders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
                {isSearching && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px'
                  }}>
                    <RefreshCw style={{ 
                      width: '16px', 
                      height: '16px', 
                      animation: 'spin 1s linear infinite' 
                    }} />
                    Searching...
                  </div>
                )}
              </div>
              
              <button
                onClick={fetchOrders}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <RefreshCw style={{ 
                  width: '16px', 
                  height: '16px',
                  animation: loading ? 'spin 1s linear infinite' : 'none'
                }} />
                Refresh
              </button>
            </div>

            {/* Orders Grid/List */}
            {viewMode === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {displayOrders.map((order) => {
                  const statusColor = getStatusColor(order.status)
                  const dateInfo = formatOrderDate(order.createdAt)
                  const isDownloading = downloadingOrders.has(order.id)
                  
                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: statusColor.bg,
                        border: `1px solid ${statusColor.border}`,
                        color: statusColor.text,
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>

                      {/* Preview Image */}
                      <div style={{
                        width: '100%',
                        height: '180px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getPreviewImageUrl(order) && (
                          <img
                            src={getPreviewImageUrl(order) || ''}
                            alt="Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        {!getPreviewImageUrl(order) && (
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}>
                            No preview available
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1e293b',
                          margin: '0 0 8px 0',
                          lineHeight: '1.4'
                        }}>
                          {order.stockSite.displayName} #{order.stockItemId || 'N/A'}
                        </h3>
                        
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#f1f5f9'
                          }}>
                            {getSiteLogo(order.stockSite.name) && (
                              <img
                                src={getSiteLogo(order.stockSite.name)}
                                alt={order.stockSite.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            )}
                          </div>
                          <span style={{
                            fontSize: '14px',
                            color: '#64748b',
                            fontWeight: '500'
                          }}>
                            {order.stockSite.name}
                          </span>
                        </div>

                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '4px'
                        }}>
                          Debug ID: {order.id}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '8px'
                        }}>
                          Order: {order.taskId || 'N/A'}
                        </div>
                      </div>

                      {/* Date */}
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '16px',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        Ordered: {dateInfo.date} at {dateInfo.time} ({dateInfo.timezone})
                      </div>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                      }}>
                        {order.stockItemUrl && (
                          <a
                            href={order.stockItemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              color: '#6b7280',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ExternalLink style={{ width: '14px', height: '14px' }} />
                            View Original
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleSmartDownload(order)}
                          disabled={isAnyDownloadActive || isDownloading || !order.downloadUrl}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            background: isAnyDownloadActive || isDownloading || !order.downloadUrl
                              ? '#e5e7eb'
                              : '#10b981',
                            border: 'none',
                            borderRadius: '8px',
                            color: isAnyDownloadActive || isDownloading || !order.downloadUrl
                              ? '#9ca3af'
                              : 'white',
                            cursor: isAnyDownloadActive || isDownloading || !order.downloadUrl
                              ? 'not-allowed'
                              : 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '14px',
                            fontWeight: '600',
                            opacity: isAnyDownloadActive || isDownloading || !order.downloadUrl ? 0.6 : 1
                          }}
                        >
                          <Download style={{ width: '16px', height: '16px' }} />
                          {isAnyDownloadActive
                            ? 'Download in Progress...'
                            : isDownloading
                            ? 'Preparing...'
                            : 'Download for Free'
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {displayOrders.map((order) => {
                  const statusColor = getStatusColor(order.status)
                  const dateInfo = formatOrderDate(order.createdAt)
                  const isDownloading = downloadingOrders.has(order.id)
                  
                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr auto',
                        gap: '20px',
                        alignItems: 'center'
                      }}>
                        {/* Preview Image */}
                        <div style={{
                          width: '120px',
                          height: '80px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getPreviewImageUrl(order) && (
                            <img
                              src={getPreviewImageUrl(order) || ''}
                              alt="Preview"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {!getPreviewImageUrl(order) && (
                            <div style={{
                              color: '#94a3b8',
                              fontSize: '12px',
                              textAlign: 'center'
                            }}>
                              No preview
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                          }}>
                            <h3 style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              color: '#1e293b',
                              margin: 0,
                              lineHeight: '1.4'
                            }}>
                              {order.stockSite.displayName} #{order.stockItemId || 'N/A'}
                            </h3>
                            
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: statusColor.bg,
                              border: `1px solid ${statusColor.border}`,
                              color: statusColor.text,
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              background: '#f1f5f9'
                            }}>
                              {getSiteLogo(order.stockSite.name) && (
                                <img
                                  src={getSiteLogo(order.stockSite.name)}
                                  alt={order.stockSite.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                  }}
                                />
                              )}
                            </div>
                            <span style={{
                              fontSize: '14px',
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              {order.stockSite.name}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#94a3b8'
                            }}>
                              •
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#64748b'
                            }}>
                              {dateInfo.date} at {dateInfo.time}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            fontSize: '11px',
                            color: '#64748b'
                          }}>
                            <span>Debug ID: {order.id}</span>
                            <span>Order: {order.taskId || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          flexShrink: 0
                        }}>
                          {order.stockItemUrl && (
                            <a
                              href={order.stockItemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                color: '#6b7280',
                                textDecoration: 'none',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <ExternalLink style={{ width: '14px', height: '14px' }} />
                              View Original
                            </a>
                          )}
                          
                          <button
                            onClick={() => handleSmartDownload(order)}
                            disabled={isAnyDownloadActive || isDownloading || !order.downloadUrl}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px 20px',
                              background: isAnyDownloadActive || isDownloading || !order.downloadUrl
                                ? '#e5e7eb'
                                : '#10b981',
                              border: 'none',
                              borderRadius: '8px',
                              color: isAnyDownloadActive || isDownloading || !order.downloadUrl
                                ? '#9ca3af'
                                : 'white',
                              cursor: isAnyDownloadActive || isDownloading || !order.downloadUrl
                                ? 'not-allowed'
                                : 'pointer',
                              transition: 'all 0.2s ease',
                              fontSize: '14px',
                              fontWeight: '600',
                              opacity: isAnyDownloadActive || isDownloading || !order.downloadUrl ? 0.6 : 1
                            }}
                          >
                            <Download style={{ width: '16px', height: '16px' }} />
                            {isAnyDownloadActive
                              ? 'Download in Progress...'
                              : isDownloading
                              ? 'Preparing...'
                              : 'Download for Free'
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
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