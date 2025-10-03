'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
    error: null,
    authenticated: false,
    isAdmin: false
  })

  const checkAdminStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // First check if we have a global session
      if (status === 'loading') {
        return // Still loading global session
      }

      if (!session?.user) {
        setState({
          user: null,
          loading: false,
          error: null,
          authenticated: false,
          isAdmin: false
        })
        return
      }

      // Check if the global session user is an admin
      const userRole = (session.user as any).role
      const isAdminRole = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
      
      if (!isAdminRole) {
        setState({
          user: null,
          loading: false,
          error: 'Access denied. Admin privileges required.',
          authenticated: false,
          isAdmin: false
        })
        return
      }

      // Only verify admin authentication with backend if we have a session
      // and the user appears to be an admin
      try {
        const response = await fetch('/api/admin/auth-test', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setState({
              user: data.user,
              loading: false,
              error: null,
              authenticated: true,
              isAdmin: true
            })
          } else {
            setState({
              user: null,
              loading: false,
              error: 'Admin authentication required',
              authenticated: false,
              isAdmin: false
            })
          }
        } else {
          setState({
            user: null,
            loading: false,
            error: 'Admin authentication failed',
            authenticated: false,
            isAdmin: false
          })
        }
      } catch (apiError) {
        // If API call fails, still show the user as not authenticated
        // but don't show an error - they just need to log in
        setState({
          user: null,
          loading: false,
          error: null,
          authenticated: false,
          isAdmin: false
        })
      }
    } catch (error) {
      console.error('Admin auth check error:', error)
      setState({
        user: null,
        loading: false,
        error: null, // Don't show error on login page
        authenticated: false,
        isAdmin: false
      })
    }
  }, [session, status])

  useEffect(() => {
    checkAdminStatus()
  }, [checkAdminStatus])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Check if user has admin role
        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          setState({
            user: data.user,
            loading: false,
            error: null,
            authenticated: true,
            isAdmin: true
          })
          toast.success('Admin login successful!')
          return true
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Access denied. Admin privileges required.'
          }))
          return false
        }
      } else {
        const errorMessage = data.error || 'Login failed'
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }))
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error during login'
      }))
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
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
  }

  const refresh = async (): Promise<void> => {
    await checkAdminStatus()
  }

  const value: AdminAuthContextType = {
    ...state,
    login,
    logout,
    refresh
  }

  return (
    <AdminAuthContext.Provider value={value}>
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
