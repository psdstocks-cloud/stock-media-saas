'use client'

import { prisma } from '@/lib/prisma'
import { PointsManager } from '@/lib/points'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id || !data) {
    return null
  }

  const { balance, history, orders, stockSites } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, {session.user.name || session.user.email}!
              </div>
              <Link 
                href="/dashboard/orders"
                className="text-gray-500 hover:text-gray-900"
              >
                Orders
              </Link>
              <Link 
                href="/dashboard/profile"
                className="text-gray-500 hover:text-gray-900"
              >
                Profile
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-500 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Points Balance Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Points Balance</h2>
              <p className="text-gray-600">Your current points and usage</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {balance?.currentPoints || 0}
              </div>
              <div className="text-sm text-gray-500">points available</div>
            </div>
          </div>
          
          {balance && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {balance.totalPurchased}
                </div>
                <div className="text-sm text-gray-500">Total Purchased</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {balance.totalUsed}
                </div>
                <div className="text-sm text-gray-500">Total Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {balance.lastRollover ? new Date(balance.lastRollover).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-sm text-gray-500">Last Rollover</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.title || `${order.stockSite.displayName} #${order.stockItemId}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.stockSite.displayName} • {order.cost} points
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
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Points History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Points History</h3>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No history yet</p>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {entry.description || entry.type}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-medium ${
                        entry.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Sites */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Stock Sites</h3>
            <p className="text-gray-600">Click on any site to start downloading</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stockSites.map((site) => (
                <Link
                  key={site.id}
                  href={`/dashboard/browse?site=${site.name}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="font-medium text-gray-900 text-sm">
                      {site.displayName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {site.cost} points
                    </div>
                    <div className="text-xs text-gray-400 mt-1 capitalize">
                      {site.category}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
