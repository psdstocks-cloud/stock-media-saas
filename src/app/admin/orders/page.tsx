import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import OrdersManagementClient from './OrdersManagementClient'
import './styles.css'

export default async function AdminOrdersPage() {
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

  // Fetch initial order data and stats
  const [orders, totalOrders, pendingOrders, completedOrders, failedOrders, totalRevenue] = await Promise.all([
    prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        stockSite: true,
      },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: 'PENDING' }
    }),
    prisma.order.count({
      where: { status: 'COMPLETED' }
    }),
    prisma.order.count({
      where: { status: 'FAILED' }
    }),
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { cost: true }
    })
  ])

  const orderStats = {
    totalOrders,
    pendingOrders,
    completedOrders,
    failedOrders,
    totalRevenue: totalRevenue._sum.cost || 0,
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
          {/* Header Section */}
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
            }}>Orders Management</h1>
            <p className="admin-subtitle" style={{
              fontSize: '1.1rem',
              color: '#1f2937',
              opacity: 0.8,
              marginBottom: 0
            }}>Monitor and manage all stock media download orders across 25+ platforms.</p>
          </div>

          {/* Stats Cards */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
              }}>{orderStats.totalOrders}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Orders</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              }}>{orderStats.pendingOrders}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Pending Orders</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              }}>{orderStats.completedOrders}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Completed Orders</div>
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
              }}>${orderStats.totalRevenue.toFixed(2)}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Total Revenue</div>
            </div>
          </div>

          {/* Orders Management Client Component */}
          <OrdersManagementClient initialOrders={orders} />
        </div>
      </div>
    </AdminLayout>
  )
}
