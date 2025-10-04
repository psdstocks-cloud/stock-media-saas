'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { 
  LogOut, 
  User, 
  Users, 
  ShoppingCart, 
  Settings, 
  BarChart3, 
  Flag,
  Menu,
  X,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import KPICards from '@/components/admin/KPICards'
import RevenueChart from '@/components/admin/RevenueChart'
import RecentOrdersList from '@/components/admin/RecentOrdersList'
import RecentUsersList from '@/components/admin/RecentUsersList'

interface Props {
  user: {
    id: string
    email: string
    name?: string
    role: string
  }
}

const navigationItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/approvals', label: 'Approvals', icon: Flag },
]

export default function AdminDashboardClient({ user }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      console.log('🚪 Dashboard: Logging out...')
      
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        console.log('✅ Dashboard: Logout successful')
        router.push('/')
      } else {
        console.error('❌ Dashboard: Logout failed')
      }
    } catch (error) {
      console.error('❌ Dashboard: Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link href="/" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Back to Site</span>
              </Link>
              
              <div className="hidden lg:block w-px h-6 bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                  {user.role}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          w-64 bg-white border-r border-gray-200 min-h-screen
          fixed lg:static inset-y-0 left-0 z-40 pt-16 lg:pt-0
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
        `}>
          <nav className="p-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <Typography variant="h2" className="text-2xl font-bold">
              Dashboard Overview
            </Typography>
            <Typography variant="body" color="muted" className="mt-2">
              Welcome back, {user.name || user.email}! Here's your platform overview.
            </Typography>
          </div>

          {/* KPI Cards */}
          <KPICards />

          {/* Revenue Chart */}
          <RevenueChart />

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentOrdersList />
            <RecentUsersList />
          </div>
        </main>
      </div>
    </div>
  )
}