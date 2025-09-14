import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import UsersManagementClient from './UsersManagementClient'
import './styles.css'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
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

  // Fetch initial user data and stats
  const [users, totalUsers, adminUsers, newUsersThisMonth, activeUsers] = await Promise.all([
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        pointsBalance: true,
        subscriptions: {
          include: { plan: true },
        },
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const userStats = {
    totalUsers,
    adminUsers,
    newUsersThisMonth,
    activeUsers,
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
            }}>Users Management</h1>
            <p className="admin-subtitle" style={{
              fontSize: '1.1rem',
              color: '#1f2937',
              opacity: 0.8,
              marginBottom: 0
            }}>Manage and monitor all platform users, their subscriptions, and activity.</p>
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
              }}>{userStats.totalUsers}</div>
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
              }}>{userStats.activeUsers}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Active Users</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
              }}>{userStats.newUsersThisMonth}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>New This Month</div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 14.176-1.332 21-6.03 21-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
              }}>{userStats.adminUsers}</div>
              <div className="admin-stat-label" style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                opacity: 0.7,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Admin Users</div>
            </div>
          </div>

          {/* Users Management Client Component */}
          <UsersManagementClient initialUsers={users} />
        </div>
      </div>
    </AdminLayout>
  )
}
