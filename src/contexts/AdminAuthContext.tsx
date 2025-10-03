'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface AdminAuthState {
  user: AdminUser | null
  loading: boolean
  error: string | null
  authenticated: boolean
  isAdmin: boolean
}

interface AdminAuthContextType extends AdminAuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
    error: null,
    authenticated: false,
    isAdmin: false
  })

  const pathname = usePathname()
  
  const checkAdminStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Don't make API calls on the login page
      if (pathname === '/admin/login') {
        setState({
          user: null,
          loading: false,
          error: null,
          authenticated: false,
          isAdmin: false
        })
        return
      }
      
      // Check admin authentication via our custom API
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          setState({
            user: data.user,
            loading: false,
            error: null,
            authenticated: true,
            isAdmin: data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN'
          })
          return
        }
      }

      // Not authenticated
      setState({
        user: null,
        loading: false,
        error: null,
        authenticated: false,
        isAdmin: false
      })
    } catch (error) {
      console.error('Admin auth check failed:', error)
      setState({
        user: null,
        loading: false,
        error: 'Authentication check failed',
        authenticated: false,
        isAdmin: false
      })
    }
  }, [pathname])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState({
          user: data.user,
          loading: false,
          error: null,
          authenticated: true,
          isAdmin: data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN'
        })
        toast.success('Login successful!')
        return true
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Login failed',
          authenticated: false,
          isAdmin: false
        }))
        toast.error(data.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error',
        authenticated: false,
        isAdmin: false
      }))
      toast.error('Network error')
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setState({
        user: null,
        loading: false,
        error: null,
        authenticated: false,
        isAdmin: false
      })
      toast.success('Logged out successfully')
      router.push('/admin/login')
    }
  }, [router])

  const refresh = useCallback(async () => {
    await checkAdminStatus()
  }, [checkAdminStatus])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  return (
    <AdminAuthContext.Provider value={{
      ...state,
      login,
      logout,
      refresh
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}