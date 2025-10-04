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

interface Props {
  user: AdminUser
}

export default function UserManagementClient({ user }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link href="/" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Back to Site</span>
              </Link>
              
              <div className="hidden lg:block w-px h-6 bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                  {user.role}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`
          w-64 bg-white border-r border-gray-200 min-h-screen
          fixed lg:static inset-y-0 left-0 z-40 pt-16 lg:pt-0
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
        `}>
          <nav className="p-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = window.location.pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
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
        </main>
      </div>
    </div>
  )
}