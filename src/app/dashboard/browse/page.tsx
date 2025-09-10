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
  Download,
  ExternalLink,
  RotateCcw,
  Star,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  CreditCard
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
  existingOrder?: boolean
  order?: {
    id: string
    status: string
    title: string
    cost: number
    createdAt: string
    downloadUrl?: string
  }
  error?: string
  currentPoints?: number
  requiredPoints?: number
  message?: string
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
  const [estimatedTime, setEstimatedTime] = useState<number>(0)
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [existingOrder, setExistingOrder] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [orderProgress, setOrderProgress] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSites, setFilteredSites] = useState<SupportedSite[]>([])
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({
    siteName: '',
    siteUrl: '',
    reason: '',
    userEmail: ''
  })
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Function to refresh user balance from database
  const refreshUserBalance = async () => {
    if (!session?.user?.id) return
    
    try {
      const balanceResponse = await fetch(`/api/points?userId=${session.user.id}`)
      const balanceData = await balanceResponse.json()
      setUserBalance(balanceData.balance?.currentPoints || 0)
      console.log('Balance refreshed:', balanceData.balance?.currentPoints)
    } catch (error) {
      console.error('Error refreshing balance:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  useEffect(() => {
    console.log('Browse page useEffect - status:', status, 'session:', session)
    
    if (status === 'loading') {
      console.log('Session still loading...')
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Session loading timeout - forcing redirect to login')
        setSessionTimeout(true)
        router.push('/login')
      }, 10000) // 10 second timeout
      
      return () => clearTimeout(timeout)
    }
    
    if (!session?.user?.id) {
      console.log('No session user ID, redirecting to login')
      router.push('/login')
      return
    }
    
    console.log('Session valid, proceeding with data fetch')

    const fetchData = async () => {
      try {
        const [balanceResponse, sitesResponse] = await Promise.all([
          fetch(`/api/points?userId=${session.user.id}`),
          fetch('/api/stock-sites')
        ])

        const balanceData = await balanceResponse.json()
        const sitesData = await sitesResponse.json()

        setUserBalance(balanceData.balance?.currentPoints || 0)
        setSupportedSites(sitesData.stockSites || [])
        setFilteredSites(sitesData.stockSites || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [session, status, router])

  // Handle search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSites(supportedSites)
    } else {
      const filtered = supportedSites.filter(site =>
        site.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSites(filtered)
    }
  }, [searchQuery, supportedSites])

  const handleGetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError('')
    setStockInfo(null)
    setExistingOrder(null)

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
        console.log('Stock info received:', data.data)
        console.log('Cost from API:', data.data.cost)
        console.log('User balance:', userBalance)
        setStockInfo(data.data)
        
        // Check points balance immediately after getting stock info
        if (userBalance < data.data.cost) {
          setError(`Insufficient points. You have ${userBalance} points but need ${data.data.cost} points to download this file.`)
        } else {
          setError('') // Clear any previous errors if user has enough points
        }
        
        // Check if this item was already ordered
        await checkExistingOrder(data.data.site, data.data.id)
      } else {
        setError(data.error || 'Failed to process URL. Please check if the URL is from a supported site and try again.')
      }
    } catch (error) {
      setError('An error occurred while processing the URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const checkExistingOrder = async (site: string, id: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/check-existing-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ site, id }),
      })

      const data = await response.json()
      if (data.success && data.existingOrder) {
        setExistingOrder(data.order)
      }
    } catch (error) {
      console.error('Error checking existing order:', error)
    }
  }

  // Real-time order monitoring with Server-Sent Events
  const startOrderMonitoring = (orderId: string) => {
    console.log('Starting real-time order monitoring for:', orderId)
    
    // Close existing EventSource if any
    if (eventSource) {
      eventSource.close()
    }
    
    // Create EventSource for real-time updates
    const newEventSource = new EventSource(`/api/orders/${orderId}/stream`)
    setEventSource(newEventSource)
    
    newEventSource.onopen = () => {
      console.log('EventSource connection opened')
      setOrderProgress('Connected to processing service...')
    }
    
    newEventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data)
        console.log('Received order update:', update)
        
        // Update order status
        setOrderStatus(update.status)
        
        if (update.status === 'COMPLETED' && update.downloadUrl) {
          setDownloadUrl(update.downloadUrl)
          setOrderProgress('File is ready!')
          setOrderStatus('READY')
          setProcessingTime(estimatedTime) // Set to 100% complete
          console.log('Order completed, download URL:', update.downloadUrl)
          newEventSource.close()
          setEventSource(null)
        } else if (update.status === 'FAILED') {
          setOrderProgress(update.message || 'Order failed. Please try again.')
          setOrderStatus('FAILED')
          console.log('Order failed:', update.message)
          newEventSource.close()
          setEventSource(null)
        } else if (update.status === 'PROCESSING') {
          // Update progress and calculate remaining time
          const progress = update.progress || 0
          const currentProcessingTime = Math.round((progress / 100) * estimatedTime)
          const remaining = Math.max(0, estimatedTime - currentProcessingTime)
          
          setCurrentProgress(progress)
          setProcessingTime(currentProcessingTime)
          setRemainingTime(remaining)
          setOrderProgress(`Processing... ${progress}% complete`)
        } else {
          // Default processing message
          setOrderProgress(update.message || 'Processing your order...')
        }
      } catch (error) {
        console.error('Error parsing order update:', error)
        setOrderProgress('Error processing update. Please refresh the page.')
      }
    }
    
    newEventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      setOrderProgress('Connection lost. Please refresh to check your order status.')
      newEventSource.close()
      setEventSource(null)
    }
  }

  // Cleanup EventSource on component unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [eventSource])

  // Timer effect for real-time countdown
  useEffect(() => {
    if (orderStatus === 'PROCESSING' && remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setTimerInterval(interval)
      
      return () => {
        clearInterval(interval)
        setTimerInterval(null)
      }
    } else if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }, [orderStatus, remainingTime])

  const handlePlaceOrder = async () => {
    if (!stockInfo || !session?.user?.id) return

    // First, validate points BEFORE placing order
    if (userBalance < stockInfo.cost) {
      setError(`Insufficient points. You have ${userBalance} points but need ${stockInfo.cost} points to download this file.`)
      return
    }

    setIsOrdering(true)
    setError('')

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: stockInfo.url,
          site: stockInfo.site,
          id: stockInfo.id,
          title: `${stockInfo.site}-${stockInfo.id}`,
          cost: stockInfo.cost,
          imageUrl: stockInfo.imageUrl
        }),
      })

      const data: OrderResponse = await response.json()

      if (data.success && data.existingOrder && data.order) {
        console.log('Existing order found - free download:', data.order)
        setExistingOrder(data.order)
        setCurrentOrder(null)
        setOrderStatus('')
      } else if (data.success && data.order) {
        console.log('New order placed successfully:', data.order)
        setCurrentOrder(data.order)
        setOrderStatus('PENDING')
        setProcessingTime(0)
        setEstimatedTime(60) // 1 minute estimated time (ultra-optimized)
        setCurrentProgress(0)
        setRemainingTime(60)
        setOrderProgress('Processing your order...')
        
        // Start real-time order monitoring
        startOrderMonitoring(data.order.id)
        
        // Refetch balance from database to ensure accuracy
        await refreshUserBalance()
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
    window.open(site.url, '_blank')
  }

  const handleRequestSite = () => {
    setShowRequestModal(true)
    setRequestData({
      siteName: '',
      siteUrl: '',
      reason: '',
      userEmail: session?.user?.email || ''
    })
    setRequestSubmitted(false)
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingRequest(true)

    try {
      // Simulate API call - in real implementation, this would send to backend
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setRequestSubmitted(true)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowRequestModal(false)
        setRequestSubmitted(false)
        setRequestData({
          siteName: '',
          siteUrl: '',
          reason: '',
          userEmail: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Request submission error:', error)
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const handleRequestInputChange = (field: string, value: string) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value
    }))
  }


  if (status === 'loading' || sessionTimeout) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <Loader2 size={32} className="animate-spin" />
          <p>Loading your dashboard...</p>
          {sessionTimeout && (
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              Taking longer than expected. Redirecting to login...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `
      }} />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
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
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                SM
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0
              }}>
                Download Media
              </h1>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Points Balance - Primary Focus */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '25px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
              minWidth: 'fit-content'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: 'white',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              <span>{userBalance}</span>
              <span style={{ 
                opacity: 0.9,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                points available
              </span>
              
              {/* Refresh Button */}
              <button
                onClick={refreshUserBalance}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'rotate(180deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'rotate(0deg)'
                }}
                title="Refresh Balance"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* My Orders Button */}
              <button
                onClick={() => router.push('/dashboard/orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  minWidth: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Download size={16} />
                My Orders
              </button>

              {/* Browse All Sites Button */}
              <button
                onClick={() => setShowSupportedSites(!showSupportedSites)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '600',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)',
                  minWidth: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <ExternalLink size={16} />
                {showSupportedSites ? 'Hide Sites' : 'Browse Sites'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Left Column - Main Content */}
          <div>
            {/* Hero Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '12px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Download Any Stock Media
                </h2>
                <p style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  Paste any stock media URL and download instantly with your points
                </p>
              </div>

              {/* URL Input */}
              <form onSubmit={handleGetLink} style={{ marginBottom: '24px' }}>
                <div style={{
                  position: 'relative',
                  marginBottom: '16px'
                }}>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste your stock media URL here..."
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      paddingRight: '120px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !url.trim()}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '8px 20px',
                      background: isLoading || !url.trim() 
                        ? '#9ca3af' 
                        : 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Zap size={16} />
                        Get Link
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Supported Sites */}
              <div style={{
                textAlign: 'center'
              }}>
                <button
                  onClick={() => setShowSupportedSites(!showSupportedSites)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '12px',
                    color: '#667eea',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Shield size={16} />
                  Supported Sites
                  {showSupportedSites ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Supported Sites Grid */}
            {showSupportedSites && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '32px'
                }}>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Choose from {supportedSites.length}+ Stock Sites
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Access premium content from all major stock media platforms
                  </p>
                </div>

                {/* Search */}
                <div style={{
                  marginBottom: '24px'
                }}>
                  <div style={{
                    position: 'relative',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    <input
                      type="text"
                      placeholder="Search stock sites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: '40px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af'
                    }}>
                      🔍
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* All Stock Sites Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredSites.length > 0 ? filteredSites.map((site) => {
                    // Generate website URL based on site name
                    const getWebsiteUrl = (siteName: string) => {
                      const urlMap: { [key: string]: string } = {
                        'shutterstock': 'https://www.shutterstock.com',
                        'vshutter': 'https://www.shutterstock.com/video',
                        'mshutter': 'https://www.shutterstock.com/music',
                        'adobestock': 'https://stock.adobe.com',
                        'adobe': 'https://stock.adobe.com',
                        'depositphotos': 'https://depositphotos.com',
                        'depositphotos_video': 'https://depositphotos.com/video',
                        'istockphoto': 'https://www.istockphoto.com',
                        'istock': 'https://www.istockphoto.com',
                        'gettyimages': 'https://www.gettyimages.com',
                        'freepik': 'https://www.freepik.com',
                        'vfreepik': 'https://www.freepik.com/videos',
                        'flaticon': 'https://www.flaticon.com',
                        'flaticonpack': 'https://www.flaticon.com/packs',
                        '123rf': 'https://www.123rf.com',
                        'dreamstime': 'https://www.dreamstime.com',
                        'vectorstock': 'https://www.vectorstock.com',
                        'alamy': 'https://www.alamy.com',
                        'storyblocks': 'https://www.storyblocks.com',
                        'vecteezy': 'https://www.vecteezy.com',
                        'creativefabrica': 'https://www.creativefabrica.com',
                        'rawpixel': 'https://www.rawpixel.com',
                        'motionarray': 'https://motionarray.com',
                        'envato': 'https://elements.envato.com',
                        'pixelsquid': 'https://www.pixelsquid.com',
                        'ui8': 'https://ui8.net',
                        'iconscout': 'https://iconscout.com',
                        'lovepik': 'https://www.lovepik.com',
                        'pngtree': 'https://pngtree.com',
                        'deeezy': 'https://www.deeezy.com',
                        'footagecrate': 'https://footagecrate.com',
                        'artgrid_hd': 'https://artgrid.io',
                        'yellowimages': 'https://www.yellowimages.com',
                        'epidemicsound': 'https://www.epidemicsound.com',
                        'pixeden': 'https://www.pixeden.com',
                        'pixelbuddha': 'https://pixelbuddha.net',
                        'mockupcloud': 'https://mockupcloud.com',
                        'designi': 'https://designi.com.br',
                        'craftwork': 'https://craftwork.design',
                        'soundstripe': 'https://www.soundstripe.com',
                        'artlist_footage': 'https://artlist.io',
                        'artlist_sound': 'https://artlist.io',
                        'motionelements': 'https://www.motionelements.com'
                      }
                      return urlMap[siteName] || `https://www.${siteName}.com`
                    }

                    return (
                      <div
                        key={site.name}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          border: '1px solid #e5e7eb',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#667eea'
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)'
                          e.currentTarget.style.transform = 'translateY(-4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        {/* Site Header */}
                        <div style={{
                          padding: '20px 20px 16px',
                          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}>
                            <h5 style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#1f2937',
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {site.displayName.charAt(0)}
                              </div>
                              {site.displayName}
                            </h5>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#10b981',
                                fontWeight: '600',
                                background: '#dcfce7',
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}>
                                {site.cost} pts
                              </span>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                background: '#10b981',
                                borderRadius: '50%'
                              }} />
                            </div>
                          </div>
                          
                          <p style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            margin: 0,
                            lineHeight: '1.4'
                          }}>
                            Premium {site.category} content • {getWebsiteUrl(site.name).replace('https://', '')}
                          </p>
                        </div>

                        {/* Site Action */}
                        <div style={{
                          padding: '16px 20px'
                        }}>
                          <button
                            onClick={() => window.open(getWebsiteUrl(site.name), '_blank')}
                            style={{
                              width: '100%',
                              padding: '12px 20px',
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            🌐 Visit {site.displayName}
                          </button>
                        </div>
                      </div>
                    )
                  }) : (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '40px 20px',
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                      }}>
                        🔍
                      </div>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        No sites found
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0 0 16px 0'
                      }}>
                        Try searching with different keywords or clear your search
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer CTA */}
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  marginTop: '32px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px'
                  }}>
                    Can't find your site?
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 16px 0'
                  }}>
                    We're constantly adding new stock sites. Contact us to request support for your favorite platform.
                  </p>
                  <button 
                    onClick={handleRequestSite}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    💬 Request New Site
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(254, 242, 242, 0.95)',
                border: '1px solid #fecaca',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: error.includes('Insufficient points') ? '16px' : '0'
                }}>
                  <XCircle size={20} style={{ color: '#dc2626', marginTop: '2px' }} />
                  <p style={{ color: '#dc2626', margin: 0, fontWeight: '500', flex: 1 }}>{error}</p>
                </div>
                {error.includes('Insufficient points') && (
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginTop: '12px'
                  }}>
                    <button
                      onClick={() => router.push('/dashboard/pricing')}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <CreditCard size={16} />
                      Get More Points
                    </button>
                    <button
                      onClick={() => setError('')}
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stock Info Preview */}
            {stockInfo && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  padding: '24px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <Sparkles size={24} />
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      Ready to Download
                    </h3>
                  </div>
                  <p style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: '16px'
                  }}>
                    Review your order and confirm to proceed
                  </p>
                </div>

                <div style={{ padding: '24px' }}>
                  {/* File Info */}
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '24px'
                  }}>
                    {/* Image Preview */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      border: '2px solid #e5e7eb',
                      flexShrink: 0
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
                    </div>

                    {/* File Details */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {stockInfo.title}
                      </h4>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#f1f5f9',
                          borderRadius: '20px',
                          fontSize: '14px',
                          color: '#475569',
                          fontWeight: '500'
                        }}>
                          <span style={{ textTransform: 'capitalize' }}>{stockInfo.site}</span>
                        </div>
                        
                        <button
                          onClick={() => copyToClipboard(stockInfo.url)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '20px',
                            fontSize: '13px',
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy URL'}
                        </button>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          <Shield size={16} />
                          <span>Secure Download</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          <Zap size={16} />
                          <span>Instant Access</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  {!currentOrder && !existingOrder && (
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          Order Cost
                        </div>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#1f2937'
                        }}>
                          {stockInfo.cost} points
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: userBalance < stockInfo.cost ? '#dc2626' : '#6b7280',
                          marginTop: '2px',
                          fontWeight: userBalance < stockInfo.cost ? '600' : 'normal'
                        }}>
                          Your balance: {userBalance} points
                          {userBalance < stockInfo.cost && (
                            <span style={{ display: 'block', marginTop: '4px', fontSize: '11px' }}>
                              ⚠️ Insufficient points
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handlePlaceOrder}
                        disabled={isOrdering || userBalance < stockInfo.cost}
                        style={{
                          padding: '16px 32px',
                          background: isOrdering || userBalance < stockInfo.cost
                            ? '#9ca3af'
                            : 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: isOrdering || userBalance < stockInfo.cost ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: isOrdering || userBalance < stockInfo.cost
                            ? 'none'
                            : '0 8px 25px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isOrdering && userBalance >= stockInfo.cost) {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isOrdering && userBalance >= stockInfo.cost) {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)'
                          }
                        }}
                      >
                        {isOrdering ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <Download size={20} />
                            Confirm Order
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Order Status Display */}
                  {currentOrder && (
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                      borderRadius: '16px',
                      border: '1px solid #0ea5e9',
                      marginTop: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h3 style={{
                            margin: '0 0 4px 0',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#0c4a6e'
                          }}>
                            Order Placed Successfully!
                          </h3>
                          <p style={{
                            margin: '0',
                            fontSize: '14px',
                            color: '#0369a1'
                          }}>
                            File ID: {stockInfo?.id || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        padding: '12px',
                        background: 'rgba(14, 165, 233, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(14, 165, 233, 0.2)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <Clock size={16} color="#0369a1" />
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#0c4a6e'
                          }}>
                            Status: {orderStatus || 'PENDING'}
                          </span>
                        </div>
                        {orderStatus === 'READY' && downloadUrl ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}>
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)'
                              }}
                            >
                              <Download size={16} />
                              Download File
                            </a>
                            <div style={{
                              fontSize: '12px',
                              color: '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#22c55e',
                                borderRadius: '50%'
                              }} />
                              Ready for download
                            </div>
                          </div>
                        ) : orderStatus === 'FAILED' ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#dc2626'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#dc2626',
                                borderRadius: '50%'
                              }} />
                              Processing failed
                            </div>
                            <button
                              onClick={() => {
                                setCurrentOrder(null)
                                setOrderStatus('')
                                setOrderProgress('')
                                setDownloadUrl('')
                                setProcessingTime(0)
                              }}
                              style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Try Again
                            </button>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#0369a1'
                            }}>
                              <div style={{
                                width: '12px',
                                height: '12px',
                                border: '2px solid #0ea5e9',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%'
                              }} className="animate-spin" />
                              {orderProgress}
                            </div>
                            <div style={{
                              width: '100%',
                              height: '4px',
                              backgroundColor: 'rgba(14, 165, 233, 0.2)',
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                backgroundColor: '#0ea5e9',
                                borderRadius: '2px',
                                width: `${Math.min(100, Math.max(0, currentProgress))}%`,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#64748b',
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%'
                            }}>
                              <span>{currentProgress}% complete</span>
                              <span>{remainingTime}s remaining</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Existing Order Display */}
                  {existingOrder && (
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                      borderRadius: '16px',
                      border: '1px solid #22c55e',
                      marginTop: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <Download size={20} />
                        </div>
                        <div>
                          <h3 style={{
                            margin: '0 0 4px 0',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#14532d'
                          }}>
                            Free Download Available!
                          </h3>
                          <p style={{
                            margin: '0',
                            fontSize: '14px',
                            color: '#166534'
                          }}>
                            You've already ordered this item before.
                          </p>
                        </div>
                      </div>
                      
                      {existingOrder.downloadUrl && (
                        <a
                          href={existingOrder.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <Download size={16} />
                          Download Now
                        </a>
                      )}
                    </div>
                  )}

                  {/* Insufficient Points */}
                  {userBalance < stockInfo.cost && (
                    <div style={{
                      padding: '16px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px',
                      textAlign: 'center',
                      marginTop: '16px'
                    }}>
                      <p style={{
                        color: '#dc2626',
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        Insufficient points. You need {stockInfo.cost - userBalance} more points to complete this order.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Stats Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TrendingUp size={20} />
                Your Stats
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '12px'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Available Points</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{userBalance}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '12px'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Downloads Available</span>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{Math.floor(userBalance / 10)}</span>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Star size={20} />
                Why Choose Us
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                      Instant Downloads
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      Get your files immediately
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                      Secure & Legal
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      Licensed downloads only
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                      40+ Stock Sites
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      Access all major platforms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request New Site Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowRequestModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6'
                e.currentTarget.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = '#6b7280'
              }}
            >
              ×
            </button>

            {!requestSubmitted ? (
              <>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '28px'
                  }}>
                    💬
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1e293b'
                  }}>
                    Request New Site
                  </h3>
                  <p style={{
                    margin: '0',
                    fontSize: '16px',
                    color: '#64748b',
                    lineHeight: '1.5'
                  }}>
                    Help us expand our platform support by requesting your favorite stock site
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRequestSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Site Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Site Name *
                      </label>
                      <input
                        type="text"
                        value={requestData.siteName}
                        onChange={(e) => handleRequestInputChange('siteName', e.target.value)}
                        placeholder="e.g., Getty Images, Unsplash, Pexels"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Site URL */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Website URL *
                      </label>
                      <input
                        type="url"
                        value={requestData.siteUrl}
                        onChange={(e) => handleRequestInputChange('siteUrl', e.target.value)}
                        placeholder="https://www.example.com"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Why do you need this site? *
                      </label>
                      <textarea
                        value={requestData.reason}
                        onChange={(e) => handleRequestInputChange('reason', e.target.value)}
                        placeholder="Tell us why this site would be valuable for our users..."
                        required
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '100px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={requestData.userEmail}
                        onChange={(e) => handleRequestInputChange('userEmail', e.target.value)}
                        placeholder="your@email.com"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      style={{
                        width: '100%',
                        padding: '16px 24px',
                        background: isSubmittingRequest 
                          ? '#9ca3af' 
                          : 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmittingRequest ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmittingRequest) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {isSubmittingRequest ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          💬 Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success State */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '36px'
                }}>
                  ✅
                </div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e293b'
                }}>
                  Request Submitted!
                </h3>
                <p style={{
                  margin: '0 0 24px 0',
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  Thank you for your request! We'll review it and get back to you within 2-3 business days.
                </p>
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  color: '#0369a1'
                }}>
                  <strong>What happens next?</strong><br />
                  • We'll evaluate the site's compatibility<br />
                  • Check licensing and technical requirements<br />
                  • Add it to our roadmap if approved<br />
                  • Notify you when it's available
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  )
}
