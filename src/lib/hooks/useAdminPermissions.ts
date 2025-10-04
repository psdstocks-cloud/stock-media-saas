"use client"

import { useEffect, useState } from 'react'
import { useAdminAuth } from './useAdminAuth'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

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
            
            // Handle different response formats
            let permissionsArray: string[] = []
            
            if (data.success && data.permissions) {
              if (Array.isArray(data.permissions)) {
                // If it's already an array
                permissionsArray = data.permissions
              } else if (typeof data.permissions === 'object') {
                // If it's an object with boolean values, extract keys where value is true
                permissionsArray = Object.keys(data.permissions).filter(key => 
                  data.permissions[key] === true
                )
              } else if (typeof data.permissions === 'string') {
                // If it's a single string
                permissionsArray = [data.permissions]
              }
            } else if (Array.isArray(data)) {
              // If the response is directly an array
              permissionsArray = data
            }

            // Ensure we have a valid array
            if (!Array.isArray(permissionsArray)) {
              console.warn('Permissions data is not in expected format, using defaults')
              permissionsArray = getDefaultPermissions(user.role)
            }

            setPermissions(new Set(permissionsArray))
            setError(null)
          } else {
            const errorData = await res.json().catch(() => ({}))
            console.warn('Permissions API failed, using defaults:', errorData.error)
            
            // Fallback to default permissions based on role
            const defaultPermissions = getDefaultPermissions(user.role)
            setPermissions(new Set(defaultPermissions))
            setError(null) // Don't show error for fallback
          }
        }
      } catch (e: any) {
        if (!aborted) {
          console.warn('Permissions fetch failed, using defaults:', e?.message)
          
          // Fallback to default permissions based on role
          const defaultPermissions = getDefaultPermissions(user.role)
          setPermissions(new Set(defaultPermissions))
          setError(null) // Don't show error for fallback
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
    error,
    user
  }
}

// Fallback permissions based on role
function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return [
        'users.view', 'users.edit', 'users.impersonate',
        'orders.view', 'orders.manage', 'orders.refund',
        'points.adjust', 'billing.view',
        'flags.view', 'flags.manage',
        'settings.write', 'approvals.manage',
        'platforms.manage', 'website_status.manage',
        'tickets.manage', 'analytics.view'
      ]
    case 'ADMIN':
      return [
        'users.view', 'users.edit',
        'orders.view', 'orders.manage',
        'points.adjust', 'billing.view',
        'flags.view', 'settings.write',
        'platforms.manage', 'website_status.manage',
        'tickets.manage', 'analytics.view'
      ]
    default:
      return ['users.view', 'orders.view']
  }
}