"use client"

import { useEffect, useState } from 'react'
import { useAdminAuth } from './useAdminAuth'

export function useAdminPermissions() {
  const { user, authenticated, loading: authLoading } = useAdminAuth()
  const [permissions, setPermissions] = useState<Set<string> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false
    
    async function loadPermissions() {
      if (!authenticated || !user) {
        setPermissions(new Set())
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch('/api/admin/permissions', { 
          cache: 'no-store',
          credentials: 'include'
        })
        
        if (!aborted) {
          if (res.ok) {
            const data = await res.json()
            setPermissions(new Set<string>(data.permissions || []))
            setError(null)
          } else {
            const errorData = await res.json().catch(() => ({}))
            setError(errorData.error || 'Failed to fetch permissions')
            setPermissions(new Set())
          }
        }
      } catch (e: any) {
        if (!aborted) {
          setError(e?.message || 'Error loading permissions')
          setPermissions(new Set())
        }
      } finally {
        if (!aborted) {
          setLoading(false)
        }
      }
    }

    loadPermissions()
    return () => { aborted = true }
  }, [authenticated, user])

  const has = (key: string) => {
    if (!permissions) return false
    return permissions.has(key)
  }

  const hasAny = (keys: string[]) => {
    if (!permissions) return false
    return keys.some(key => permissions.has(key))
  }

  const hasAll = (keys: string[]) => {
    if (!permissions) return false
    return keys.every(key => permissions.has(key))
  }

  return { 
    permissions, 
    has, 
    hasAny, 
    hasAll, 
    loading: authLoading || loading, 
    error 
  }
}
