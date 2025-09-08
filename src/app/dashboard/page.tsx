'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardData {
  balance: any
  history: any[]
  orders: any[]
  stockSites: any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSupportedSites, setShowSupportedSites] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Fetch dashboard data
    const fetchData = async () => {
      try {
  const [balance, history, orders, stockSites] = await Promise.all([
          fetch(`/api/points?userId=${session.user.id}`).then(res => res.json()).then(data => data.balance),
          fetch(`/api/points?userId=${session.user.id}`).then(res => res.json()).then(data => data.history),
          fetch(`/api/orders?userId=${session.user.id}`).then(res => res.json()).then(data => data.orders),
          fetch('/api/stock-sites').then(res => res.json()).then(data => data.stockSites || [])
        ])

        setData({ balance, history, orders, stockSites })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

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
          }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id || !data) {
    return null
  }

  const { balance, history, orders, stockSites } = data
  const recentOrders = orders?.slice(0, 5) || []
  const recentHistory = history?.slice(0, 5) || []

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
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Dashboard</h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Link href="/dashboard/browse">
                <button style={{
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
                }}>
                  🔍 Request Files
                </button>
              </Link>
              <button 
                onClick={() => signOut()}
                style={{
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
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 1rem'
      }}>
        {/* Hero Section with Value Proposition */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '48px',
          marginBottom: '40px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              marginBottom: '16px',
              lineHeight: '1.1'
            }}>
              Download Premium Stock Media
              <span style={{ display: 'block', fontSize: '32px', fontWeight: '400', opacity: 0.9 }}>
                for a fraction of the cost
              </span>
            </h1>
            <p style={{
              fontSize: '20px',
              marginBottom: '32px',
              opacity: 0.9,
              maxWidth: '600px'
            }}>
              Access millions of high-quality images, videos, and graphics from top stock sites. 
              Pay once, download forever - no recurring fees.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/dashboard/browse">
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  🔍 Request Files Now
                </button>
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                📺 Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>
                10,000+
            </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Happy Customers</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>
                50M+
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Downloads</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '8px' }}>
                99.9%
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Uptime</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>
                24/7
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>Support</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            border: '1px solid #93c5fd',
            borderRadius: '16px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1
            }}>
            <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '8px'
                }}>Your Balance</p>
                <p style={{
                  fontSize: '40px',
                  fontWeight: '800',
                  color: '#1e3a8a',
                  marginBottom: '4px'
                }}>
                {balance?.currentPoints || 0}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#1e40af',
                  opacity: 0.8
                }}>Points Available</p>
              </div>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                ⚡
              </div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '1px solid #86efac',
            borderRadius: '16px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#166534',
                  marginBottom: '8px'
                }}>Successful Downloads</p>
                <p style={{
                  fontSize: '40px',
                  fontWeight: '800',
                  color: '#14532d',
                  marginBottom: '4px'
                }}>
                  {orders?.filter((order: any) => order.status === 'COMPLETED' || order.status === 'READY').length || 0}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#166534',
                  opacity: 0.8
                }}>Files Downloaded</p>
                </div>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                ⬇️
              </div>
                </div>
              </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
            border: '1px solid #c4b5fd',
            borderRadius: '16px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(124, 58, 237, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1
            }}>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#7c3aed',
                  marginBottom: '8px'
                }}>Total Requests</p>
                <p style={{
                  fontSize: '40px',
                  fontWeight: '800',
                  color: '#6b21a8',
                  marginBottom: '4px'
                }}>
                  {orders?.length || 0}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#7c3aed',
                  opacity: 0.8
                }}>All Time Orders</p>
                </div>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(124, 58, 237, 0.2)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                📈
              </div>
            </div>
        </div>

          <div style={{
            background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
            border: '1px solid #fb923c',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#c2410c',
                  marginBottom: '4px'
                }}>Active Sites</p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#9a3412'
                }}>
                  {stockSites?.filter((site: any) => site.isActive).length || 0}
                </p>
            </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#fed7aa',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                👥
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Ready to Download Premium Content?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
          }}>
            Paste any stock media URL and get instant access to high-quality downloads
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard/browse">
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 36px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
              }}>
                🔍 Request Files
              </button>
            </Link>
            <Link href="/dashboard/orders">
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 36px',
                background: 'white',
                color: '#374151',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                📋 View My Orders
              </button>
            </Link>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {/* Quick Actions */}
                      <div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid #f1f5f9'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  ⚡
                        </div>
                Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <Link href="/dashboard/browse" style={{ display: 'block' }}>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
                    e.currentTarget.style.borderColor = '#2563eb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🔍
                        </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: '0 0 4px 0'
                        }}>Request Files</h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0
                        }}>Paste any stock media URL to download</p>
                      </div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: '#e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        →
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/orders" style={{ display: 'block' }}>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                    border: '2px solid #bae6fd',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
                    e.currentTarget.style.borderColor = '#0ea5e9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = '#bae6fd'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        📋
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: '0 0 4px 0'
                        }}>My Orders</h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0
                        }}>View and download your files</p>
                      </div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: '#e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        →
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/profile" style={{ display: 'block' }}>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '2px solid #86efac',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
                    e.currentTarget.style.borderColor = '#22c55e'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.borderColor = '#86efac'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        👤
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#0f172a',
                          margin: '0 0 4px 0'
                        }}>My Profile</h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0
                        }}>Manage account settings</p>
                      </div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: '#e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Available Sites */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👥 Available Sites
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '16px'
              }}>
                {stockSites?.length || 0} stock sites ready for downloads
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stockSites?.slice(0, 5).map((site: any) => (
                  <div key={site.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <p style={{
                        fontWeight: '500',
                        color: '#0f172a',
                        margin: 0
                      }}>{site.displayName}</p>
                      <p style={{
                        fontSize: '12px',
                        color: '#64748b',
                        margin: 0
                      }}>{site.category}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0
                      }}>{site.cost} pts</p>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: site.isActive ? '#dcfce7' : '#f1f5f9',
                        color: site.isActive ? '#166534' : '#64748b'
                      }}>
                        {site.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <button 
                  onClick={() => setShowSupportedSites(!showSupportedSites)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {showSupportedSites ? 'Hide All Sites' : 'View All Sites'} 
                  {showSupportedSites ? '↑' : '↓'}
                </button>
              </div>
              
              {showSupportedSites && (
                <div style={{ 
                  marginTop: '16px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#f8fafc'
                }}>
                  {stockSites?.map((site: any) => (
                    <div key={site.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderBottom: '1px solid #e2e8f0',
                      background: 'white',
                      margin: '4px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => window.open(site.url, '_blank')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {site.displayName.charAt(0)}
                        </div>
                        <div>
                          <p style={{
                            fontWeight: '600',
                            color: '#0f172a',
                            margin: 0,
                            fontSize: '14px'
                          }}>{site.displayName}</p>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: 0
                          }}>{site.category}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <p style={{
                            fontWeight: '600',
                            color: '#0f172a',
                            margin: 0,
                            fontSize: '14px'
                          }}>{site.cost} pts</p>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: site.isActive ? '#dcfce7' : '#f1f5f9',
                            color: site.isActive ? '#166534' : '#64748b'
                          }}>
                            {site.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          background: '#e2e8f0',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}>
                          ↗
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🕐 Recent Orders
              </h3>
              {recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⬇️</div>
                  <p style={{ color: '#64748b', marginBottom: '16px' }}>No orders yet</p>
                  <Link href="/dashboard/browse">
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      margin: '0 auto'
                    }}>
                      ➕ Start Browsing
                    </button>
                  </Link>
            </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentOrders.map((order: any) => (
                    <div key={order.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: order.status === 'COMPLETED' ? '#10b981' :
                                     order.status === 'PROCESSING' ? '#f59e0b' :
                                     order.status === 'FAILED' ? '#ef4444' : '#6b7280'
                        }} />
                      <div>
                          <p style={{
                            fontWeight: '500',
                            color: '#0f172a',
                            margin: 0
                          }}>{order.title}</p>
                          <p style={{
                            fontSize: '12px',
                            color: '#64748b',
                            margin: 0
                          }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: order.status === 'COMPLETED' ? '#dcfce7' :
                                     order.status === 'PROCESSING' ? '#fef3c7' :
                                     order.status === 'FAILED' ? '#fecaca' : '#f1f5f9',
                          color: order.status === 'COMPLETED' ? '#166534' :
                                 order.status === 'PROCESSING' ? '#92400e' :
                                 order.status === 'FAILED' ? '#991b1b' : '#64748b'
                        }}>
                          {order.status}
                        </span>
                        <p style={{
                          fontSize: '12px',
                          color: '#64748b',
                          margin: '4px 0 0 0'
                        }}>{order.cost} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support & Help */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '32px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                🎧 Support & Help
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Money Saved Calculator */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#0ea5e9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      💰
                    </div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0c4a6e',
                      margin: 0
                    }}>Money Saved</h4>
                  </div>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#0c4a6e',
                    margin: '0 0 8px 0'
                  }}>
                    ${((orders?.filter((order: any) => order.status === 'COMPLETED' || order.status === 'READY').length || 0) * 15).toLocaleString()}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#0369a1',
                    margin: 0
                  }}>
                    Estimated savings vs. direct purchases
                  </p>
                </div>

                {/* Support */}
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '1px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎧</div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#92400e',
                    margin: '0 0 8px 0'
                  }}>Need Help?</h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#a16207',
                    margin: '0 0 16px 0'
                  }}>
                    Our support team is here 24/7
                  </p>
                  <Link href="/dashboard/support">
                    <button style={{
                      padding: '8px 16px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Contact Support
                    </button>
                  </Link>
                </div>
              </div>
            </div>
      </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        marginTop: '80px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '48px 1rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
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
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  margin: 0
                }}>Stock Media SaaS</h3>
              </div>
              <p style={{
                color: '#cbd5e1',
                marginBottom: '16px',
                lineHeight: '1.6'
              }}>
                Access millions of high-quality stock media files from top providers at a fraction of the cost.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}>
                  📧
                </div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}>
                  🐦
                </div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}>
                  💼
                </div>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Dashboard
                </Link>
                <Link href="/dashboard/browse" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Request Files
                </Link>
                <Link href="/dashboard/orders" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  My Orders
                </Link>
                <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Help Center
                </Link>
                <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Contact Us
                </Link>
                <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  FAQ
                </Link>
                <Link href="/dashboard/support" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Status Page
                </Link>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Terms of Service
                </Link>
                <Link href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Privacy Policy
                </Link>
                <Link href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Cookie Policy
                </Link>
                <Link href="#" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #475569',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <p style={{
              color: '#94a3b8',
              margin: 0,
              fontSize: '14px'
            }}>
              © 2024 Stock Media SaaS. All rights reserved.
            </p>
            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center'
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '14px'
              }}>
                Made with ❤️ for creators
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowDemo(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              ×
            </button>
            
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              How It Works - Quick Demo
            </h2>
            
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                marginBottom: '20px'
              }}>
                Watch this quick demo to see how easy it is to download premium stock media
              </p>
              <div style={{
                background: '#1f2937',
                borderRadius: '8px',
                padding: '40px',
                color: 'white',
                fontSize: '14px',
                fontFamily: 'monospace',
                textAlign: 'left',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#10b981' }}>// Step 1: Copy any stock media URL</div>
                <div style={{ color: '#fbbf24', margin: '8px 0' }}>const url = "https://www.shutterstock.com/image-vector/..."</div>
                <div style={{ color: '#10b981', marginTop: '16px' }}>// Step 2: Paste in our request box</div>
                <div style={{ color: '#fbbf24', margin: '8px 0' }}>await requestFile(url)</div>
                <div style={{ color: '#10b981', marginTop: '16px' }}>// Step 3: Download high-quality file instantly</div>
                <div style={{ color: '#fbbf24', margin: '8px 0' }}>✅ File downloaded successfully!</div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>1️⃣</div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0c4a6e',
                  margin: '0 0 8px 0'
                }}>Copy URL</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#0369a1',
                  margin: 0
                }}>Copy any stock media URL from supported sites</p>
              </div>
              
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>2️⃣</div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#14532d',
                  margin: '0 0 8px 0'
                }}>Paste & Request</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#166534',
                  margin: 0
                }}>Paste URL in our request box and click confirm</p>
              </div>
              
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>3️⃣</div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#92400e',
                  margin: '0 0 8px 0'
                }}>Download</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#a16207',
                  margin: 0
                }}>Get high-quality file delivered instantly</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/dashboard/browse">
                <button style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}>
                  Try It Now
                </button>
              </Link>
              <button
                onClick={() => setShowDemo(false)}
                style={{
                  padding: '16px 32px',
                  background: 'white',
                  color: '#374151',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}