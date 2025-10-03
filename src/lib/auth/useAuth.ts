import { useEffect } from 'react'
import { useAuthStore } from './store'
import { useRouter } from 'next/navigation'

export function useAuth(requireAuth = false) {
  const store = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount
    if (!store.user && !store.isLoading) {
      store.checkAuth()
    }
  }, [])

  useEffect(() => {
    // Redirect if auth is required but user is not authenticated
    if (requireAuth && !store.isLoading && !store.isAuthenticated) {
      router.push('/admin/login')
    }
  }, [requireAuth, store.isAuthenticated, store.isLoading, router])

  return store
}
