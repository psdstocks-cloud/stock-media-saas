export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
import { auth } from '@/lib/auth-admin'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import './styles.css'

// Define types based on the actual data structure
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
  try {
    console.log('🔍 Admin dashboard: Checking authentication...');
    const session = await auth()
    console.log('👤 Admin user:', session?.user ? { id: session.user.id, email: session.user.email, role: session.user.role } : 'Not found');
    
    if (!session?.user?.id) {
      console.log('❌ No admin user found, redirecting to login');
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

    console.log('✅ Admin user authenticated, loading dashboard');

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
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Points in Circulation</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalPointsInCirculation.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Points Used</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalPointsUsed.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.recentTransactions.length}</p>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
            </div>
            <div className="p-6">
              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user: UserWithRelations) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {user.pointsBalance?.currentPoints || 0} points
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(recentOrders as OrderWithRelations[]).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {order.imageUrl ? (
                            <img src={order.imageUrl} alt={order.title || 'Order'} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-xs text-gray-500">No image</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.title || 'Untitled'}</p>
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${order.cost}</p>
                        <p className="text-xs text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscription Plans Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Subscription Plans</h2>
            </div>
            <div className="p-6">
              {subscriptionPlans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No subscription plans found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan: SubscriptionPlanType) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-blue-600">${plan.price}</p>
                        <p className="text-sm text-gray-500">{plan.points} points</p>
                        <p className="text-sm text-gray-500">Rollover limit: {plan.rolloverLimit}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock Sites Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Stock Sites</h2>
            </div>
            <div className="p-6">
              {stockSites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No stock sites found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stockSites.map((site: StockSiteType) => (
                    <div key={site.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{site.displayName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{site.name}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Cost: ${site.cost}</p>
                        <p className="text-sm text-gray-500">Category: {site.category || 'N/A'}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          site.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {site.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    );

  } catch (error) {
    console.error("🔴 Failed to fetch admin dashboard data:", error);
    
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h1>
          <p className="text-gray-700">An error occurred while fetching data. Please check the server logs.</p>
        </div>
      </AdminLayout>
    );
  }
}
