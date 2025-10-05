'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  Home,
  Loader2
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
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()

  // Don't show header on these routes
  const noHeaderRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const shouldShowHeader = !noHeaderRoutes.some(route => pathname.startsWith(route))

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
      
      // Try unified auth first
      let response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })
      
      let authenticated = false
      let userData = null
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          authenticated = true
          userData = data.user
          console.log('✅ [Smart Header] Unified auth successful:', userData.email)
        }
      }
      
      // Fallback to admin auth if unified fails (for backward compatibility)
      if (!authenticated) {
        response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            authenticated = true
            // Convert admin response to unified format
            userData = {
              ...data.user,
              isAdmin: data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN',
              isUser: true // Admins can access user features
            }
            console.log('✅ [Smart Header] Admin auth fallback successful:', userData.email)
          }
        }
      }
      
      if (authenticated && userData) {
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        console.log('ℹ️ [Smart Header] No authentication found')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.log('❌ [Smart Header] Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 [Smart Header] Logging out...')
      
      // Call both logout endpoints to ensure complete logout
      await Promise.all([
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }),
        fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' })
      ])
      
      console.log('✅ [Smart Header] Logout successful')
      setIsAuthenticated(false)
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('❌ [Smart Header] Logout error:', error)
    }
  }

  // Don't render header on excluded routes
  if (!shouldShowHeader) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              StockMedia Pro
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            StockMedia Pro
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              // User is logged in - show single header with role-based features
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
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
                  {/* Home Button */}
                  <Link href="/">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Button>
                  </Link>

                  {/* User Dashboard - Always available */}
                  {user.isUser && (
                    <Link href="/dashboard">
                      <Button 
                        variant={pathname === '/dashboard' ? "default" : "outline"} 
                        size="sm" 
                        className="flex items-center space-x-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  
                  {/* Admin Panel - Only for admins */}
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button 
                        variant={pathname.startsWith('/admin') ? "default" : "outline"} 
                        size="sm"
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Panel</span>
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
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              // Not authenticated - show login/signup buttons
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button size="sm">Sign In</Button>
                </Link>
                <Button variant="outline" size="sm">Get Started</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
