import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/login')
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points in Circulation</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPointsInCirculation}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Used</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPointsUsed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{recentOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name || user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {user.pointsBalance?.currentPoints || 0} points
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.subscriptions.length} subscription(s)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.user.name || order.user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.stockSite.displayName} • {order.cost} points
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Plans Management */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Plans</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">{plan.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">${plan.price}</div>
                  <div className="text-sm text-gray-600 mb-2">{plan.description}</div>
                  <div className="text-sm text-gray-500">
                    <div>{plan.points} points/month</div>
                    <div>Rollover: {plan.rolloverLimit}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Sites Management */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Stock Sites</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stockSites.map((site) => (
                <div key={site.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{site.displayName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      site.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div>{site.cost} points</div>
                    <div className="capitalize">{site.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
