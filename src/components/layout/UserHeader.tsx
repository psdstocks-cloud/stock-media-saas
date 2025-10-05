'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings, Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  role: string
}

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkUserAuth()
  }, [])

  const checkUserAuth = async () => {
    try {
      console.log('🔍 [User Header] Checking user authentication...')
      
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          console.log('✅ [User Header] User authenticated:', data.user.email)
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          console.log('ℹ️ [User Header] No user authentication')
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        console.log('❌ [User Header] Auth check failed:', response.status)
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.log('❌ [User Header] Auth check error:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 [User Header] Logging out...')
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        console.log('✅ [User Header] Logout successful')
        setIsAuthenticated(false)
        setUser(null)
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('❌ [User Header] Logout error:', error)
    }
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
            {isLoading ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              // User is logged in
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    USER
                  </span>
                </div>
                
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
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
