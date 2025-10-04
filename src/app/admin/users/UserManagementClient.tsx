'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { Search, Plus, Users as UsersIcon, LogOut, User, Home, Menu, X } from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  orderCount: number
}

const navigationItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: UsersIcon },
  { href: '/admin/users', label: 'Users', icon: UsersIcon },
  { href: '/admin/orders', label: 'Orders', icon: UsersIcon },
  { href: '/admin/settings', label: 'Settings', icon: UsersIcon },
  { href: '/admin/approvals', label: 'Approvals', icon: UsersIcon },
]

export default function UserManagementClient() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/me', {
          credentials: 'include',
          cache: 'no-cache'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated && data.user) {
            setUser(data.user)
          } else {
            router.replace('/admin/login')
          }
        } else {
          router.replace('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  useEffect(() => {
    if (user) {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const filteredUsers = users.filter(userData =>
    userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userData.name && userData.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="text-2xl font-bold">
            Users Management
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Manage user accounts, roles, and permissions
          </Typography>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UsersIcon className="h-5 w-5" />
            <span>User Directory ({users.length} users)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Orders</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((userData) => (
                    <tr key={userData.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{userData.name || 'Unnamed User'}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {userData.role}
                        </span>
                      </td>
                      <td className="py-3">{userData.orderCount}</td>
                      <td className="py-3">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}