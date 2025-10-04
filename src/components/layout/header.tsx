'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Header: Checking auth status...')
      
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          console.log('✅ Header: Admin authenticated:', data.user.email)
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          console.log('ℹ️ Header: Not authenticated')
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        console.log('❌ Header: Auth check failed:', response.status)
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.log('❌ Header: Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Header: Logging out...')
      
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        console.log('✅ Header: Logout successful')
        setIsAuthenticated(false)
        setUser(null)
        // Redirect to home page
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ Header: Logout error:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
            StockMedia Pro
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="text-sm text-gray-500 animate-pulse">Loading...</div>
            ) : isAuthenticated && user ? (
              // Admin is logged in
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                    {user.role}
                  </span>
                </div>
                
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Admin Panel</span>
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
              // Not authenticated
              <div className="flex items-center space-x-3">
                <Link href="/admin/login">
                  <Button size="sm">Admin Login</Button>
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
