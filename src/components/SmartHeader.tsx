'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings, Home, Shield } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

interface AuthState {
  isAuthenticated: boolean
  user: AdminUser | null
  isLoading: boolean
}

export function SmartHeader() {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  })

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      // Only check auth if we're in admin routes and not on login page
      if (!isAdminRoute || isAdminLogin) {
        setAuthState({ isAuthenticated: false, user: null, isLoading: false })
        return
      }

      try {
        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setAuthState({
              isAuthenticated: true,
              user: data.user,
              isLoading: false
            })
            return
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error)
      }

      setAuthState({ isAuthenticated: false, user: null, isLoading: false })
    }

    checkAuth()
  }, [pathname, isAdminRoute, isAdminLogin])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't show header on login page
  if (isAdminLogin) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
            {isAdminRoute && authState.isAuthenticated && authState.user ? (
              // Admin authenticated view
              <div className="flex items-center space-x-4">
                {/* Welcome Message */}
                <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Welcome back!</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-lg">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-800">{authState.user.email}</span>
                    <span className="px-2 py-0.5 bg-orange-200 text-orange-900 rounded text-xs font-medium">
                      {authState.user.role}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <Link href="/">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Back to Site</span>
                  </Button>
                </Link>
                
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
              // Public view
              <div className="flex items-center space-x-3">
                <Link href="/admin/login">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Admin Login
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
