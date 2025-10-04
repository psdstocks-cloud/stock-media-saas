'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  RefreshCw, 
  ExternalLink,
  User,
  Mail,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ThemedIcon } from './ThemedIcon'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

interface RecentUsersListProps {
  className?: string
  limit?: number
}

interface RoleConfig {
  label: string
  className: string
}

export function RecentUsersList({ className, limit = 5 }: RecentUsersListProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchRecentUsers = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1)
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/users?limit=${limit}&sort=createdAt&order=desc`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions to view users.')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Failed to fetch recent users (${response.status})`)
        }
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch recent users')
      }

      setUsers(result.users || [])
      setError(null)
      
      if (isRetry) {
        toast.success('Recent users refreshed successfully!')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching recent users:', err)
      
      if (!isRetry) {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchRecentUsers()
  }, [fetchRecentUsers])

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const formatLastLogin = useCallback((dateString: string | null): string => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const getRoleConfig = useCallback((role: string): RoleConfig => {
    switch (role.toUpperCase()) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          className: 'bg-red-500 text-white'
        }
      case 'ADMIN':
        return {
          label: 'Admin',
          className: 'bg-purple-500 text-white'
        }
      case 'USER':
        return {
          label: 'User',
          className: 'bg-blue-500 text-white'
        }
      default:
        return {
          label: role,
          className: 'bg-gray-500 text-white'
        }
    }
  }, [])

  const getRoleBadge = useCallback((role: string) => {
    const config = getRoleConfig(role)
    
    return (
      <Badge className={config.className}>
        <Shield className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }, [getRoleConfig])

  const handleRetry = useCallback(() => {
    fetchRecentUsers(true)
  }, [fetchRecentUsers])

  const userItems = useMemo(() => {
    return users.map((user) => ({
      ...user,
      formattedCreatedAt: formatDate(user.createdAt),
      formattedLastLogin: formatLastLogin(user.lastLoginAt),
      roleConfig: getRoleConfig(user.role)
    }))
  }, [users, formatDate, formatLastLogin, getRoleConfig])

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Recent Users
          </CardTitle>
          <CardDescription>
            Latest {limit} registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                disabled={isLoading}
                className="ml-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Retry {retryCount > 0 && `(${retryCount})`}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={className}
      style={{
        backgroundColor: 'var(--admin-bg-card)',
        borderColor: 'var(--admin-border)',
        color: 'var(--admin-text-primary)'
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle 
              className="flex items-center"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              <ThemedIcon 
                icon={Users}
                className="h-5 w-5 mr-2" 
                style={{ color: 'var(--admin-accent)' }}
              />
              Recent Users
            </CardTitle>
            <CardDescription style={{ color: 'var(--admin-text-secondary)' }}>
              Latest {limit} registered users
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--admin-text-primary)',
                borderColor: 'var(--admin-border)'
              }}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/admin/users">
              <Button 
                variant="outline" 
                size="sm"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--admin-text-primary)',
                  borderColor: 'var(--admin-border)'
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ThemedIcon 
              icon={Users}
              className="h-12 w-12 mb-4" 
              style={{ color: 'var(--admin-text-muted)' }}
            />
            <Typography 
              variant="h3" 
              className="mb-2"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              No Recent Users
            </Typography>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Users will appear here once they register
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {userItems.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: 'var(--admin-border)',
                  backgroundColor: 'var(--admin-bg-secondary)'
                }}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--admin-accent)' + '20' }}
                    >
                      <ThemedIcon 
                        icon={User}
                        className="h-5 w-5" 
                        style={{ color: 'var(--admin-accent)' }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Typography 
                        variant="body" 
                        className="font-medium truncate"
                        style={{ color: 'var(--admin-text-primary)' }}
                      >
                        {user.name || 'Unnamed User'}
                      </Typography>
                      {user.emailVerified && (
                        <Badge 
                          variant="outline" 
                          className="text-green-600 border-green-600"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Typography 
                      variant="caption" 
                      className="block"
                      style={{ color: 'var(--admin-text-secondary)' }}
                    >
                      {user.email}
                    </Typography>
                    <div className="flex items-center space-x-2 mt-1">
                      <ThemedIcon 
                        icon={Calendar}
                        className="h-3 w-3" 
                        style={{ color: 'var(--admin-text-muted)' }}
                      />
                      <Typography 
                        variant="caption"
                        style={{ color: 'var(--admin-text-muted)' }}
                      >
                        Joined {user.formattedCreatedAt}
                      </Typography>
                      {user.lastLoginAt && (
                        <>
                          <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                          <Typography 
                            variant="caption"
                            style={{ color: 'var(--admin-text-muted)' }}
                          >
                            Last login {user.formattedLastLogin}
                          </Typography>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getRoleBadge(user.role)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div 
            className="mt-4 pt-4 border-t"
            style={{ borderColor: 'var(--admin-border)' }}
          >
            <Link href="/admin/users">
              <Button 
                variant="outline" 
                className="w-full"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--admin-text-primary)',
                  borderColor: 'var(--admin-border)'
                }}
              >
                View All Users
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentUsersList