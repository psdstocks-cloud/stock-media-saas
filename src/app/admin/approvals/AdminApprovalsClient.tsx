'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Flag, Check, X, Clock, LogOut, User, Home, Menu, X as XIcon } from 'lucide-react'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
}

interface ApprovalRequest {
  id: string
  type: string
  description: string
  requestedBy: string
  requestedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

const navigationItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Flag },
  { href: '/admin/users', label: 'Users', icon: Flag },
  { href: '/admin/orders', label: 'Orders', icon: Flag },
  { href: '/admin/settings', label: 'Settings', icon: Flag },
  { href: '/admin/approvals', label: 'Approvals', icon: Flag },
]

export default function AdminApprovalsClient() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
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

  const [approvals] = useState<ApprovalRequest[]>([
    {
      id: '1',
      type: 'User Registration',
      description: 'New user registration for john.doe@example.com',
      requestedBy: 'System',
      requestedAt: '2024-01-15T10:30:00Z',
      status: 'PENDING',
      priority: 'MEDIUM'
    },
    {
      id: '2',
      type: 'Order Refund',
      description: 'Refund request for order #12345 - $25.00',
      requestedBy: 'Customer Service',
      requestedAt: '2024-01-15T09:15:00Z',
      status: 'PENDING',
      priority: 'HIGH'
    },
    {
      id: '3',
      type: 'Feature Request',
      description: 'Add support for new file format: SVG',
      requestedBy: 'Development Team',
      requestedAt: '2024-01-14T16:45:00Z',
      status: 'APPROVED',
      priority: 'LOW'
    }
  ])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = (id: string) => {
    console.log('Approving request:', id)
    // Implement approval logic
  }

  const handleReject = (id: string) => {
    console.log('Rejecting request:', id)
    // Implement rejection logic
  }

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
                {isSidebarOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                Approvals Management
              </Typography>
              <Typography variant="body" color="muted" className="mt-1">
                Review and approve pending requests
              </Typography>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <Typography variant="h3" className="text-2xl font-bold">
                      {approvals.filter(a => a.status === 'PENDING').length}
                    </Typography>
                    <Typography variant="body" color="muted">
                      Pending Requests
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <Typography variant="h3" className="text-2xl font-bold">
                      {approvals.filter(a => a.status === 'APPROVED').length}
                    </Typography>
                    <Typography variant="body" color="muted">
                      Approved Today
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-500" />
                  <div>
                    <Typography variant="h3" className="text-2xl font-bold">
                      {approvals.filter(a => a.status === 'REJECTED').length}
                    </Typography>
                    <Typography variant="body" color="muted">
                      Rejected Today
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approvals List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flag className="h-5 w-5" />
                <span>Pending Approvals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <div key={approval.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Typography variant="h4" className="text-lg font-semibold">
                            {approval.type}
                          </Typography>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(approval.status)}`}>
                            {approval.status}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                            {approval.priority}
                          </span>
                        </div>
                        <Typography variant="body" color="muted" className="mb-2">
                          {approval.description}
                        </Typography>
                        <div className="text-sm text-gray-500">
                          Requested by: {approval.requestedBy} • {new Date(approval.requestedAt).toLocaleString()}
                        </div>
                      </div>
                      
                      {approval.status === 'PENDING' && (
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(approval.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(approval.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}