"use client"

import { useEffect, useState } from 'react'

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
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    loading: true,
    error: null,
    authenticated: false
  })

  useEffect(() => {
    let aborted = false
    
    async function checkAuth() {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        
        const response = await fetch('/api/admin/auth/me', {
          cache: 'no-store',
          credentials: 'include'
        })
        
        if (!aborted) {
          if (response.ok) {
            const data = await response.json()
            setState({
              user: data.user,
              loading: false,
              error: null,
              authenticated: data.authenticated
            })
          } else {
            const errorData = await response.json().catch(() => ({}))
            setState({
              user: null,
              loading: false,
              error: errorData.error || 'Authentication failed',
              authenticated: false
            })
          }
        }
      } catch (error) {
        if (!aborted) {
          setState({
            user: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Network error',
            authenticated: false
          })
        }
      }
    }

    checkAuth()
    return () => { aborted = true }
  }, [])

  const refresh = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/admin/auth/me', {
        cache: 'no-store',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setState({
          user: data.user,
          loading: false,
          error: null,
          authenticated: data.authenticated
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        setState({
          user: null,
          loading: false,
          error: errorData.error || 'Authentication failed',
          authenticated: false
        })
      }
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Network error',
        authenticated: false
      })
    }
  }

  return {
    ...state,
    refresh
  }
}
