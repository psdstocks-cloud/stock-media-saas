import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { auth } from '@/lib/auth-admin'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import './styles.css'
// FIX 1: Define types based on the actual data structure
type UserWithRelations = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  password: string | null;
  role: string;
  emailVerified: Date | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  pointsBalance: {
    id: string;
    userId: string;
    currentPoints: number;
    totalPurchased: number;
    totalUsed: number;
    lastRollover: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  subscriptions: Array<{
    id: string;
    userId: string;
    planId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    createdAt: Date;
    updatedAt: Date;
    plan: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      points: number;
      rolloverLimit: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
}

type OrderWithRelations = {
  id: string;
  userId: string;
  stockSiteId: string;
  stockItemId: string;
  stockItemUrl: string | null;
  imageUrl: string | null;
  title: string | null;
  cost: number;
  status: string;
  taskId: string | null;
  downloadUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  stockSite: {
    id: string;
    name: string;
    displayName: string;
    url: string;
    cost: number;
    isActive: boolean;
    category: string | null;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

type SubscriptionPlanType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  points: number;
  rolloverLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type StockSiteType = {
  id: string;
  name: string;
  displayName: string;
  cost: number;
  isActive: boolean;
  category: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default async function AdminDashboard() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/admin/login')
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard')
  }

  const [
    stats,
    recentUsers,
    recentOrders,
    subscriptionPlans,
    stockSites,
  ] = await Promise.all([
    PointsManager.getStats(),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        pointsBalance: true,
        subscriptions: {
          include: { plan: true },
        },
      },
    }),
    prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        stockSite: true,
      },
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    }),
    prisma.stockSite.findMany({
      orderBy: { cost: 'asc' },
    }),
  ])

  return (
    <AdminLayout>
      <div className="admin-container" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative'
      }}>
        <div className="admin-content" style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div className="admin-header" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem',
            transition: 'all 0.3s ease'
          }}>
            <h1 className="admin-title" style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '0.5rem',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Admin Dashboard</h1>
            <p className="admin-subtitle" style={{
              fontSize: '1.1rem',
              color: '#1f2937',
              opacity: 0.8,
              marginBottom: 0
            }}>Welcome back! Here's what's happening with your platform.</p>
          </div>

        {/* Stats Overview */}
          <div className="admin-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="admin-stat-card admin-hover-lift" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="admin-stat-icon" style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                width: '3rem',
                height: '3rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <svg className="w-6 h-6" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="admin-stat-value" style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#1f2937',
                marginBottom: '0.25rem',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stats.totalUsers}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Users</div>
          </div>

            <div className="admin-stat-card admin-hover-lift" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="admin-stat-icon" style={{ 
                background: 'rgba(16, 185, 129, 0.1)',
                width: '3rem',
                height: '3rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <svg className="w-6 h-6" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="admin-stat-value" style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#1f2937',
                marginBottom: '0.25rem',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stats.totalPointsInCirculation}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Points in Circulation</div>
          </div>

            <div className="admin-stat-card admin-hover-lift" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="admin-stat-icon" style={{ 
                background: 'rgba(245, 158, 11, 0.1)',
                width: '3rem',
                height: '3rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <svg className="w-6 h-6" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="admin-stat-value" style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#1f2937',
                marginBottom: '0.25rem',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stats.totalPointsUsed}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Points Used</div>
          </div>

            <div className="admin-stat-card admin-hover-lift" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="admin-stat-icon" style={{ 
                background: 'rgba(139, 92, 246, 0.1)',
                width: '3rem',
                height: '3rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <svg className="w-6 h-6" style={{ color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="admin-stat-value" style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#1f2937',
                marginBottom: '0.25rem',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{recentOrders.length}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Orders</div>
            </div>
          </div>

          {/* Modern Analytics Dashboard */}
          <div className="admin-card" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem',
            transition: 'all 0.3s ease'
          }}>
            <div className="admin-card-header" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '20px 20px 0 0',
              margin: '-2rem -2rem 2rem -2rem'
            }}>
              <h2 className="admin-card-title" style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Analytics Dashboard
              </h2>
            </div>
            
            {/* Analytics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{stats.totalUsers}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Users</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{stats.totalPointsInCirculation}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Points in Circulation</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{stats.totalPointsUsed}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Points Used</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{recentOrders.length}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Orders</div>
          </div>
        </div>

            {/* Chart Placeholder */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              border: '2px dashed #cbd5e1',
              borderRadius: '15px',
              padding: '3rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                Interactive Analytics Chart
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Real-time data visualization coming soon
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Recent Users */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  👥 Recent Users
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
              {recentUsers.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                    <p style={{ fontSize: '1rem', margin: 0 }}>No users yet</p>
                    <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                      Users will appear here once they register
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentUsers.map((user: UserWithRelations) => (
                      <div key={user.id} style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '1rem',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: '600',
                              color: '#1f2937',
                              fontSize: '0.95rem',
                              marginBottom: '0.25rem'
                            }}>
                          {user.name || user.email}
                        </div>
                            <div style={{
                              color: '#64748b',
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem'
                            }}>
                          {user.email}
                        </div>
                            <div style={{
                              color: '#9ca3af',
                              fontSize: '0.75rem'
                            }}>
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontWeight: '600',
                              color: '#667eea',
                              fontSize: '0.9rem',
                              marginBottom: '0.25rem'
                            }}>
                          {user.pointsBalance?.currentPoints || 0} points
                        </div>
                            <div style={{
                              color: '#64748b',
                              fontSize: '0.75rem'
                            }}>
                          {user.subscriptions.length} subscription(s)
                            </div>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🛒 Recent Orders
                </h3>
            </div>
              <div style={{ padding: '1.5rem' }}>
              {recentOrders.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <p style={{ fontSize: '1rem', margin: 0 }}>No orders yet</p>
                    <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                      Orders will appear here once users make purchases
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(recentOrders as OrderWithRelations[]).map((order) => (
                      <div key={order.id} style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '1rem',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15v-5h4v5H8z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: '600',
                              color: '#1f2937',
                              fontSize: '0.95rem',
                              marginBottom: '0.25rem'
                            }}>
                          {order.user.name || order.user.email}
                        </div>
                            <div style={{
                              color: '#64748b',
                              fontSize: '0.85rem',
                              marginBottom: '0.25rem'
                            }}>
                          {order.stockSite.displayName} • {order.cost} points
                        </div>
                            <div style={{
                              color: '#9ca3af',
                              fontSize: '0.75rem'
                            }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              ...(order.status === 'COMPLETED' ? {
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              } : order.status === 'PROCESSING' ? {
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                              } : order.status === 'FAILED' ? {
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              } : {
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                              })
                            }}>
                          {order.status}
                        </span>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Plans Management */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            marginBottom: '2rem',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💳 Subscription Plans
              </h3>
            </div>
            <div style={{ padding: '2rem' }}>
              {subscriptionPlans.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                  <p style={{ fontSize: '1rem', margin: 0 }}>No subscription plans configured</p>
                  <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                    Create subscription plans to start earning revenue
                  </p>
          </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}>
              {subscriptionPlans.map((plan: SubscriptionPlanType) => (
                    <div key={plan.id} style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: plan.isActive ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'
                      }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0,
                          textTransform: 'capitalize'
                        }}>{plan.name}</h4>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          ...(plan.isActive ? {
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          } : {
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          })
                        }}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#667eea',
                        marginBottom: '0.5rem'
                      }}>${plan.price}</div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        marginBottom: '1rem'
                      }}>{plan.description}</div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        lineHeight: '1.4'
                      }}>
                    <div>{plan.points} points/month</div>
                    <div>Rollover: {plan.rolloverLimit}%</div>
                  </div>
                </div>
              ))}
                </div>
              )}
          </div>
        </div>

        {/* Stock Sites Management */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            marginBottom: '2rem',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🖼️ Stock Sites
              </h3>
            </div>
            <div style={{ padding: '2rem' }}>
              {stockSites.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                  <p style={{ fontSize: '1rem', margin: 0 }}>No stock sites configured</p>
                  <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
                    Add stock sites to start offering content to users
                  </p>
          </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
              {stockSites.map((site: StockSiteType) => (
                    <div key={site.id} style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '1rem',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: site.isActive ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'
                      }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h4 style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0
                        }}>{site.displayName}</h4>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          ...(site.isActive ? {
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          } : {
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          })
                        }}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        lineHeight: '1.4'
                      }}>
                        <div style={{ fontWeight: '600', color: '#667eea' }}>{site.cost} points</div>
                        <div style={{ textTransform: 'capitalize' }}>{site.category}</div>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}