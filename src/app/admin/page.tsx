import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Analytics3D from '@/components/admin/3d/Analytics3D'
import SystemHealth3D from '@/components/admin/3d/SystemHealth3D'
import './styles.css'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/admin/login')
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  console.log('Admin page - User role check:', { 
    userId: session.user.id, 
    userRole: user?.role,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    console.log('User is not admin, redirecting to dashboard')
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

  // Mock system health data for 3D visualization
  const systemHealthData = {
    database: {
      status: 'healthy',
      responseTime: 45,
      lastChecked: new Date().toISOString()
    },
    api: {
      status: 'healthy',
      responseTime: 120,
      lastChecked: new Date().toISOString()
    },
    payment: {
      status: 'warning',
      responseTime: 800,
      lastChecked: new Date().toISOString()
    },
    email: {
      status: 'healthy',
      responseTime: 200,
      lastChecked: new Date().toISOString()
    }
  }

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

          {/* Service Status */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">System Status</h3>
            </div>
            <div className="admin-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="admin-service-status">
                  <div className="admin-service-name">
                    <div className="admin-service-status-indicator"></div>
                    Database
                  </div>
                  <div className="admin-service-metrics">
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">99.9%</div>
                      <div className="admin-service-metric-label">Uptime</div>
                    </div>
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">45ms</div>
                      <div className="admin-service-metric-label">Response</div>
                    </div>
                  </div>
                </div>
                
                <div className="admin-service-status">
                  <div className="admin-service-name">
                    <div className="admin-service-status-indicator"></div>
                    API Server
                  </div>
                  <div className="admin-service-metrics">
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">99.8%</div>
                      <div className="admin-service-metric-label">Uptime</div>
                    </div>
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">120ms</div>
                      <div className="admin-service-metric-label">Response</div>
                    </div>
                  </div>
                </div>
                
                <div className="admin-service-status">
                  <div className="admin-service-name">
                    <div className="admin-service-status-indicator"></div>
                    Payment Gateway
                  </div>
                  <div className="admin-service-metrics">
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">100%</div>
                      <div className="admin-service-metric-label">Uptime</div>
                    </div>
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">200ms</div>
                      <div className="admin-service-metric-label">Response</div>
                    </div>
                  </div>
                </div>
                
                <div className="admin-service-status">
                  <div className="admin-service-name">
                    <div className="admin-service-status-indicator"></div>
                    Email Service
                  </div>
                  <div className="admin-service-metrics">
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">99.5%</div>
                      <div className="admin-service-metric-label">Uptime</div>
                    </div>
                    <div className="admin-service-metric">
                      <div className="admin-service-metric-value">300ms</div>
                      <div className="admin-service-metric-label">Response</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Visualizations */}
          <div className="admin-3d-container">
            <h2 className="admin-card-title">3D Analytics Dashboard</h2>
            <Analytics3D 
              data={{
                users: stats.totalUsers,
                orders: recentOrders.length,
                revenue: 0, // We don't have revenue data in the current schema
                subscriptions: recentUsers.reduce((sum, user) => sum + user.subscriptions.length, 0)
              }}
              className="mb-8"
            />
            
            <SystemHealth3D 
              healthData={systemHealthData}
              className="mb-8"
            />
          </div>

          <div className="admin-data-grid">
            {/* Recent Users */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Users</h3>
              </div>
              <div className="admin-card-content">
                {recentUsers.length === 0 ? (
                  <p className="text-center py-4" style={{ color: 'var(--admin-dark)', opacity: 0.7 }}>No users yet</p>
                ) : (
                  <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="admin-user-item">
                      <div className="flex items-center space-x-3">
                        <div className="admin-user-avatar">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="admin-user-name">
                            {user.name || user.email}
                          </div>
                          <div className="admin-user-email">
                            {user.email}
                          </div>
                          <div className="admin-user-date">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="admin-user-points">
                            {user.pointsBalance?.currentPoints || 0} points
                          </div>
                          <div className="admin-user-subscriptions">
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
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Recent Orders</h3>
              </div>
              <div className="admin-card-content">
                {recentOrders.length === 0 ? (
                  <p className="text-center py-4" style={{ color: 'var(--admin-dark)', opacity: 0.7 }}>No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="admin-order-item">
                        <div className="flex items-center space-x-3">
                          <div className="admin-order-icon">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15v-5h4v5H8z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="admin-order-user">
                              {order.user.name || order.user.email}
                            </div>
                            <div className="admin-order-details">
                              {order.stockSite.displayName} • {order.cost} points
                            </div>
                            <div className="admin-order-date">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`admin-badge ${
                              order.status === 'COMPLETED' ? 'admin-badge-success' :
                              order.status === 'PROCESSING' ? 'admin-badge-warning' :
                              order.status === 'FAILED' ? 'admin-badge-error' :
                              'admin-badge-info'
                            }`}>
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
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Subscription Plans</h3>
            </div>
            <div className="admin-card-content">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className="admin-stat-card admin-hover-lift">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="admin-gradient-text capitalize" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{plan.name}</h4>
                    <span className={`admin-badge ${
                      plan.isActive ? 'admin-badge-success' : 'admin-badge-error'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="admin-stat-value" style={{ fontSize: '1.5rem' }}>${plan.price}</div>
                  <div className="admin-stat-label" style={{ marginBottom: '0.5rem' }}>{plan.description}</div>
                  <div className="admin-stat-label">
                    <div>{plan.points} points/month</div>
                    <div>Rollover: {plan.rolloverLimit}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Stock Sites Management */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Stock Sites</h3>
            </div>
            <div className="admin-card-content">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stockSites.map((site) => (
                <div key={site.id} className="admin-stat-card admin-hover-lift">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="admin-gradient-text" style={{ fontSize: '0.9rem', fontWeight: '600' }}>{site.displayName}</h4>
                    <span className={`admin-badge ${
                      site.isActive ? 'admin-badge-success' : 'admin-badge-error'
                    }`}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="admin-stat-label">
                    <div>{site.cost} points</div>
                    <div className="capitalize">{site.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  )
}
