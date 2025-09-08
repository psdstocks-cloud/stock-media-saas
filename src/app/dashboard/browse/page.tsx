'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  Download
} from 'lucide-react'

interface StockInfo {
  site: string
  id: string
  url: string
  title: string
  cost: number
  imageUrl: string
  description: string
}

interface OrderResponse {
  success: boolean
  order?: {
    id: string
    status: string
    title: string
    cost: number
    createdAt: string
  }
  error?: string
  currentPoints?: number
  requiredPoints?: number
}

interface SupportedSite {
  name: string
  displayName: string
  url: string
  cost: number
  description: string
  category: string
  isActive: boolean
}

export default function BrowsePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [url, setUrl] = useState('')
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [userBalance, setUserBalance] = useState<number>(0)
  const [error, setError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [supportedSites, setSupportedSites] = useState<SupportedSite[]>([])
  const [showSupportedSites, setShowSupportedSites] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [orderStatus, setOrderStatus] = useState<string>('')
  const [downloadUrl, setDownloadUrl] = useState<string>('')
  const [processingTime, setProcessingTime] = useState<number>(0)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Fetch user balance and supported sites
    const fetchData = async () => {
      try {
        const [balanceResponse, sitesResponse] = await Promise.all([
          fetch(`/api/points?userId=${session.user.id}`),
          fetch('/api/supported-sites')
        ])

        const balanceData = await balanceResponse.json()
        const sitesData = await sitesResponse.json()

        setUserBalance(balanceData.balance?.currentPoints || 0)
        setSupportedSites(sitesData.sites || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [session, status, router])

  // Poll order status when there's a current order
  useEffect(() => {
    if (!currentOrder || !session?.user?.id) return

    let pollCount = 0
    const maxPolls = 150 // 5 minutes of polling (150 * 2 seconds)
    let timeoutId: NodeJS.Timeout

    const pollOrderStatus = async () => {
      try {
        pollCount++
        console.log(`Polling order status for order: ${currentOrder.id} (attempt ${pollCount}/${maxPolls})`)
        
        // First, try to check the order status with the Nehtw API
        const statusResponse = await fetch(`/api/orders/${currentOrder.id}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          console.log('Order status check response:', statusData)
          
          if (statusData.success && statusData.order) {
            const order = statusData.order
            console.log('Order status updated to:', order.status)
            setOrderStatus(order.status)
            
            if (order.downloadUrl) {
              console.log('Download URL found:', order.downloadUrl)
              setDownloadUrl(order.downloadUrl)
              setOrderSuccess(true)
              return // Stop polling when download URL is found
            }
            
            // Stop polling if order is completed or failed
            if (order.status === 'READY' || order.status === 'COMPLETED' || order.status === 'FAILED') {
              console.log('Order reached final status:', order.status)
              return
            }
          }
        }
        
        // Also check the orders list as a fallback
        const response = await fetch(`/api/orders?userId=${session.user.id}`)
        const data = await response.json()
        
        console.log('Order status response:', data)
        
        if (data.orders) {
          const order = data.orders.find((o: any) => o.id === currentOrder.id)
          console.log('Found order in response:', order)
          
          if (order) {
            console.log('Updating order status to:', order.status)
            setOrderStatus(order.status)
            
            if (order.downloadUrl) {
              console.log('Download URL found:', order.downloadUrl)
              setDownloadUrl(order.downloadUrl)
              setOrderSuccess(true)
              return // Stop polling when download URL is found
            }
            
            // Stop polling if order is completed or failed
            if (order.status === 'READY' || order.status === 'COMPLETED' || order.status === 'FAILED') {
              console.log('Order reached final status:', order.status)
              return
            }
          } else {
            console.log('Order not found in response')
          }
        }
        
        // Check if we've exceeded max polls
        if (pollCount >= maxPolls) {
          console.log('Max polling attempts reached, stopping polling')
          setError('Order is taking longer than expected. Please check your orders page for updates.')
          setOrderStatus('FAILED')
          return
        }
      } catch (error) {
        console.error('Error polling order status:', error)
        pollCount++ // Count errors as attempts
      }
    }

    const interval = setInterval(pollOrderStatus, 2000) // Poll every 2 seconds
    
    // Set a timeout to stop polling after 5 minutes
    timeoutId = setTimeout(() => {
      console.log('Polling timeout reached, stopping polling')
      clearInterval(interval)
      setError('Order is taking longer than expected. Please check your orders page for updates.')
    }, 300000) // 5 minutes

    return () => {
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [currentOrder, session?.user?.id])

  // Update processing time
  useEffect(() => {
    if (orderStatus === 'PROCESSING' || orderStatus === 'PENDING') {
      const interval = setInterval(() => {
        setProcessingTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [orderStatus])

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError('')
    setStockInfo(null)

    try {
      const response = await fetch('/api/stock-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setStockInfo(data.data)
      } else {
        setError(data.error || 'Failed to process URL. Please check if the URL is from a supported site and try again.')
      }
    } catch (error) {
      setError('An error occurred while processing the URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called', { stockInfo, url })
    
    if (!stockInfo) {
      console.log('No stockInfo available')
      return
    }

    setIsOrdering(true)
    setError('')

    try {
      console.log('Sending order request:', {
        url,
        site: stockInfo.site,
        id: stockInfo.id,
        title: stockInfo.title,
        cost: stockInfo.cost,
        imageUrl: stockInfo.imageUrl
      })

      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          site: stockInfo.site,
          id: stockInfo.id,
          title: stockInfo.title,
          cost: stockInfo.cost,
          imageUrl: stockInfo.imageUrl
        }),
      })

      console.log('Order response status:', response.status)
      
      // Check if the response is not ok
      if (!response.ok) {
        console.error('Order API returned error status:', response.status)
        const errorText = await response.text()
        console.error('Response text:', errorText)
        setError(`Order failed with status ${response.status}: ${errorText}`)
        return
      }
      
      const data: OrderResponse = await response.json()
      console.log('Order response data:', data)

      if (data.success && data.order) {
        console.log('Order placed successfully:', data.order)
        setCurrentOrder(data.order)
        setOrderStatus('PENDING')
        setProcessingTime(0)
        setUserBalance(prev => prev - stockInfo.cost)
        // Don't redirect - show timer on same page
      } else {
        console.log('Order failed:', data.error)
        setError(data.error || 'Failed to place order')
        if (data.currentPoints !== undefined && data.requiredPoints !== undefined) {
          setError(`Insufficient points. You have ${data.currentPoints} points but need ${data.requiredPoints} points.`)
        }
      }
    } catch (error) {
      console.error('Order error:', error)
      setError('An error occurred while placing the order')
    } finally {
      setIsOrdering(false)
    }
  }

  const handleSiteClick = (site: SupportedSite) => {
    // Open the site in a new tab
    window.open(site.url, '_blank')
  }

  const handleSiteUrlClick = (site: SupportedSite) => {
    setUrl(site.url)
    setError('')
    setStockInfo(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  if (status === 'loading') {
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
            width: '128px',
            height: '128px',
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
          }}>Loading...</p>
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
              <button
                onClick={() => router.back()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Back
              </button>
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
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Download Media</h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                <span style={{ fontWeight: '500' }}>{userBalance}</span> points available
              </div>
              <button
                onClick={() => router.push('/dashboard/orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                👁️ My Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 1rem'
      }}>
        {/* Success Message */}
        {orderSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '1px solid #86efac',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#166534',
              marginBottom: '8px'
            }}>Order Placed Successfully!</h3>
            <p style={{ color: '#15803d', margin: 0 }}>
              Your order is being processed. Redirecting to orders page...
            </p>
          </div>
        )}

        {/* URL Input Form */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '8px'
            }}>Paste Your Media URL</h2>
            <p style={{
              color: '#64748b',
              fontSize: '16px'
            }}>
              Enter a link from Shutterstock, Getty Images, Adobe Stock, or other supported sites
            </p>
          </div>

          <form onSubmit={handleUrlSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="url"
                placeholder="https://www.shutterstock.com/image-vector/letter-m-love-monogram-modern-logo-2275780825"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: isLoading || !url.trim() ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? '⏳' : '🔗'} {isLoading ? 'Processing...' : 'Get Link'}
            </button>
          </form>

          {/* Supported Sites Toggle */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowSupportedSites(!showSupportedSites)}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {showSupportedSites ? 'Hide' : 'Show'} Supported Sites ({supportedSites.length})
            </button>
          </div>

          {/* Supported Sites List */}
          {showSupportedSites && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '16px',
                textAlign: 'center'
              }}>Supported Sites & Point Costs</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '16px'
              }}>
                {supportedSites.map((site) => (
                  <div
                    key={site.name}
                    style={{
                      padding: '20px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          marginBottom: '4px'
                        }}>{site.displayName}</h4>
                        <p style={{
                          fontSize: '13px',
                          color: '#64748b',
                          margin: 0
                        }}>{site.description}</p>
                      </div>
                      <div style={{
                        textAlign: 'right',
                        marginLeft: '12px'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#2563eb'
                        }}>{site.cost} pts</div>
                        <div style={{
                          fontSize: '11px',
                          color: '#64748b'
                        }}>per download</div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => handleSiteClick(site)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        🌐 Visit Site
                      </button>
                      <button
                        onClick={() => handleSiteUrlClick(site)}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          background: 'white',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        🔗 Use URL
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '20px' }}>⚠️</div>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Stock Info Preview */}
        {stockInfo && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: '8px'
              }}>Preview & Confirm Order</h3>
              <p style={{ color: '#1e3a8a', margin: 0 }}>
                Review the details below and confirm your order
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '24px',
                marginBottom: '24px'
              }}>
                {/* Image Preview */}
                <div style={{
                  aspectRatio: '1',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={stockInfo.imageUrl}
                    alt={stockInfo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    📷 IMAGE
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h4 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}>{stockInfo.title}</h4>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#64748b', minWidth: '80px' }}>Source:</span>
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500', textTransform: 'capitalize' }}>{stockInfo.site}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#64748b', minWidth: '80px' }}>Description:</span>
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{stockInfo.description}</span>
                    </div>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: '500', color: '#374151' }}>Cost:</span>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{stockInfo.cost} points</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>Your balance:</span>
                      <span style={{ fontSize: '16px', fontWeight: '500', color: userBalance >= stockInfo.cost ? '#059669' : '#dc2626' }}>
                        {userBalance} points
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setStockInfo(null)
                    setUrl('')
                    setError('')
                  }}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Confirm Order button clicked', { 
                      isOrdering, 
                      userBalance, 
                      cost: stockInfo.cost,
                      disabled: isOrdering || userBalance < stockInfo.cost 
                    })
                    handlePlaceOrder()
                  }}
                  disabled={isOrdering || userBalance < stockInfo.cost}
                  style={{
                    padding: '12px 24px',
                    background: isOrdering || userBalance < stockInfo.cost 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isOrdering || userBalance < stockInfo.cost 
                      ? 'not-allowed' 
                      : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isOrdering ? '⏳' : '✅'} {isOrdering ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>

              {userBalance < stockInfo.cost && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>
                    Insufficient points. You need {stockInfo.cost - userBalance} more points to complete this order.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Processing Timer and Download Section */}
        {currentOrder && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            marginTop: '32px',
            textAlign: 'center'
          }}>
            {orderStatus === 'PENDING' || orderStatus === 'PROCESSING' ? (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 24px'
                }}></div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Processing Your Order
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  marginBottom: '16px'
                }}>
                  {orderStatus === 'PENDING' ? 'Order placed, waiting to start...' : 'Downloading from stock site...'}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#92400e',
                  marginBottom: '16px'
                }}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  Processing: {Math.floor(processingTime / 60)}m {processingTime % 60}s
                </div>
                <div>
                  <button
                    onClick={() => {
                      setOrderStatus('FAILED')
                      setError('Order processing cancelled by user')
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            ) : orderStatus === 'READY' || orderStatus === 'COMPLETED' ? (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircle style={{ width: '40px', height: '40px', color: '#059669' }} />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Download Ready!
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  marginBottom: '24px'
                }}>
                  Your file has been processed and is ready for download.
                </p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Download style={{ width: '20px', height: '20px' }} />
                    Download File
                  </a>
                )}
              </div>
            ) : orderStatus === 'FAILED' ? (
              <div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#fee2e2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <XCircle style={{ width: '40px', height: '40px', color: '#dc2626' }} />
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Order Failed
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  marginBottom: '24px'
                }}>
                  Sorry, there was an issue processing your order. Please try again.
                </p>
                <button
                  onClick={() => {
                    setCurrentOrder(null)
                    setOrderStatus('')
                    setDownloadUrl('')
                    setProcessingTime(0)
                    setError('')
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}