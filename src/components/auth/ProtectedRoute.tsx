'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/useAuth'
import { Loader2, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: 'ADMIN' | 'SUPER_ADMIN'
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (requireRole && user && user.role !== requireRole && user.role !== 'SUPER_ADMIN') {
      router.push('/admin/login')
    }
  }, [user, requireRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="shadow-lg">
          <CardContent className="flex items-center space-x-4 p-8">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            <div>
              <h4 className="font-semibold text-lg">Loading...</h4>
              <p className="text-gray-600 mt-1">Verifying your access</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="shadow-lg">
          <CardContent className="flex items-center space-x-4 p-8">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h4 className="font-semibold text-lg">Access Denied</h4>
              <p className="text-gray-600 mt-1">Redirecting to login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (requireRole && user.role !== requireRole && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="shadow-lg">
          <CardContent className="flex items-center space-x-4 p-8">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h4 className="font-semibold text-lg">Insufficient Privileges</h4>
              <p className="text-gray-600 mt-1">You don't have permission to access this area</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
