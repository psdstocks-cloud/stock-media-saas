'use client'

import React, { useState, useEffect } from 'react'
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
  Shield,
  Mail,
  Clock
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  currentPoints: number
  totalUsed: number
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

interface RecentUsersListProps {
  className?: string
  limit?: number
}

export function RecentUsersList({ className, limit = 5 }: RecentUsersListProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRecentUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/users?limit=${limit}&sort=createdAt&order=desc`)
      if (response.ok) {
        const result = await response.json()
        setUsers(result.users || [])
      } else {
        setError('Failed to fetch recent users')
      }
    } catch (error) {
      setError('An error occurred while fetching recent users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentUsers()
  }, [limit])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'ADMIN':
        return <Badge variant="destructive" className="bg-red-500"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case 'SUPER_ADMIN':
        return <Badge variant="destructive" className="bg-purple-500"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
      case 'user':
      case 'USER':
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            New Users
          </CardTitle>
          <CardDescription>
            Recently registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchRecentUsers}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              New Users
            </CardTitle>
            <CardDescription>
              Latest {limit} registered users
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentUsers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
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
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <Typography variant="h3" className="mb-2">
              No Recent Users
            </Typography>
            <Typography variant="body" color="muted">
              New user registrations will appear here
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Typography variant="caption" className="font-medium text-primary">
                        {getInitials(user.name, user.email)}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Typography variant="body" className="font-medium truncate">
                        {user.name || 'No name'}
                      </Typography>
                      {!user.emailVerified && (
                        <Badge variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                    <Typography variant="caption" color="muted" className="block">
                      {user.email}
                    </Typography>
                    <div className="flex items-center space-x-2 mt-1">
                      <Typography variant="caption" color="muted">
                        {user.currentPoints.toLocaleString()} pts
                      </Typography>
                      <Typography variant="caption" color="muted">•</Typography>
                      <Typography variant="caption" color="muted">
                        {formatDate(user.createdAt)}
                      </Typography>
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
          <div className="mt-4 pt-4 border-t">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
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
