"use client"

import { useEffect, useState } from 'react'

export function usePermissions() {
  const [permissions, setPermissions] = useState<Set<string> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/permissions', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('Failed to fetch permissions')
        }
        const data = await res.json()
        if (!aborted) {
          setPermissions(new Set<string>(data.permissions || []))
        }
      } catch (e: any) {
        if (!aborted) setError(e?.message || 'Error loading permissions')
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    load()
    return () => { aborted = true }
  }, [])

  const has = (key: string) => {
    if (!permissions) return false
    return permissions.has(key)
  }

  return { permissions, has, loading, error }
}
