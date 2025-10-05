'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  Home,
  Loader2,
  Menu,
  Coins
} from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  isAdmin: boolean
  isUser: boolean
}

export default function SmartHeader() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()

  // Don't show header on these routes
  const noHeaderRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const shouldShowHeader = !noHeaderRoutes.some(route => pathname.startsWith(route))
  
  // Check if we're in dashboard area
  const isDashboardArea = pathname.startsWith('/dashboard')

  useEffect(() => {
    if (shouldShowHeader) {
      checkAuth()
    } else {
      setIsLoading(false)
    }
  }, [shouldShowHeader, pathname])

  const checkAuth = async () => {
    try {
      console.log('🔍 [Smart Header] Checking unified authentication...')
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-cache'
      })
      
      // Always expect 200 response from auth/me
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          console.log('✅ [Smart Header] User authenticated:', data.user.email)
          setUser(data.user)
          setIsAuthenticated(true)
          
          // Load user points if authenticated - with error handling
          await loadUserPoints()
        } else {
          console.log('ℹ️ [Smart Header] User not authenticated')
          setIsAuthenticated(false)
          setUser(null)
          setUserPoints(0)
        }
      } else {
        console.log('❌ [Smart Header] Auth check failed:', response.status)
        setIsAuthenticated(false)
        setUser(null)
        setUserPoints(0)
      }
    } catch (error) {
      console.log('❌ [Smart Header] Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
      setUserPoints(0)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserPoints = async () => {
    try {
      const response = await fetch('/api/points', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.summary) {
          setUserPoints(data.summary.currentPoints || 0)
          console.log('✅ [Smart Header] Points loaded:', data.summary.currentPoints)
        } else {
          console.log('ℹ️ [Smart Header] Points API returned no data')
          setUserPoints(0)
        }
      } else {
        console.log('ℹ️ [Smart Header] Points API failed:', response.status)
        setUserPoints(0)
      }
    } catch (error) {
      console.log('ℹ️ [Smart Header] Points check error (non-critical):', error)
      setUserPoints(0)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 [Smart Header] Logging out...')
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      console.log('✅ [Smart Header] Logout successful')
      setIsAuthenticated(false)
      setUser(null)
      setSidebarOpen(false)
      router.push('/')
    } catch (error) {
      console.error('❌ [Smart Header] Logout error:', error)
    }
  }

  // Don't render header on excluded routes
  if (!shouldShowHeader) {
    return null
  }

  return (
    <>
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-3">
              {/* Dashboard Menu Button - Only show in dashboard area when authenticated */}
              {isDashboardArea && isAuthenticated && (
                <Button
                  id="dashboard-menu-button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}

              {/* Logo */}
              <Link 
                href="/" 
                className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                StockMedia Pro
              </Link>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isAuthenticated && user ? (
                // User is logged in
                <div className="flex items-center space-x-3">
                  {/* Points Display - Only on non-dashboard pages */}
                  {!isDashboardArea && (
                    <div className="hidden sm:flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-lg">
                      <Coins className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-semibold text-orange-700">{userPoints} points</span>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isAdmin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Home Button - Only if not on homepage */}
                    {pathname !== '/' && (
                      <Link href="/">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <Home className="h-4 w-4" />
                          <span className="hidden sm:inline">Home</span>
                        </Button>
                      </Link>
                    )}

                    {/* Dashboard Button - Only if not in dashboard area */}
                    {!isDashboardArea && user.isUser && (
                      <Link href="/dashboard">
                        <Button 
                          size="sm" 
                          className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
                        >
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                      </Link>
                    )}
                    
                    {/* Admin Panel - Only for admins and not in admin area */}
                    {user.isAdmin && !pathname.startsWith('/admin') && (
                      <Link href="/admin">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Shield className="h-4 w-4" />
                          <span className="hidden sm:inline">Admin</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {/* Logout */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                // Not authenticated
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button size="sm">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Sidebar - Only show in dashboard area when authenticated */}
      {isDashboardArea && isAuthenticated && (
        <DashboardSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onClose={() => setSidebarOpen(false)}
          userPoints={userPoints}
        />
      )}
    </>
  )
}