'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Settings, 
  RefreshCw,
  Search,
  Filter,
  Globe,
  Wrench,
  XCircle
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface StockSite {
  id: string
  name: string
  displayName: string
  cost: number
  isActive: boolean
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DISABLED'
  maintenanceMessage?: string
  lastStatusChange?: string
  category?: string
  icon?: string
  statusChangedByUser?: {
    name?: string
    email: string
  }
}

export default function WebsiteStatusClient() {
  const [user, setUser] = useState<{
    id: string
    email: string
    name?: string
    role: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sites, setSites] = useState<StockSite[]>([])
  const [filteredSites, setFilteredSites] = useState<StockSite[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [maintenanceMessages, setMaintenanceMessages] = useState<Record<string, string>>({})
  const router = useRouter()

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
      fetchSites()
    }
  }, [user])

  useEffect(() => {
    filterSites()
  }, [sites, searchTerm, statusFilter])

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/admin/website-status', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSites(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    }
  }

  const filterSites = () => {
    let filtered = sites

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter)
    }

    setFilteredSites(filtered)
  }

  const updateSiteStatus = async (siteId: string, newStatus: string) => {
    setIsUpdating(siteId)
    
    try {
      const maintenanceMessage = maintenanceMessages[siteId] || ''
      
      const response = await fetch('/api/admin/website-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          siteId,
          status: newStatus,
          maintenanceMessage: newStatus === 'MAINTENANCE' ? maintenanceMessage : null
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update the site in the local state
          setSites(prevSites =>
            prevSites.map(site =>
              site.id === siteId
                ? { ...site, status: newStatus as any, maintenanceMessage: data.data.maintenanceMessage }
                : site
            )
          )
        }
      }
    } catch (error) {
      console.error('Failed to update site status:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'MAINTENANCE':
        return <Wrench className="h-4 w-4 text-yellow-500" />
      case 'DISABLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>
      case 'MAINTENANCE':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
      case 'DISABLED':
        return <Badge variant="default" className="bg-red-100 text-red-800">Disabled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusCounts = () => {
    const counts = {
      available: sites.filter(s => s.status === 'AVAILABLE').length,
      maintenance: sites.filter(s => s.status === 'MAINTENANCE').length,
      disabled: sites.filter(s => s.status === 'DISABLED').length,
      total: sites.length
    }
    return counts
  }

  const counts = getStatusCounts()

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Globe className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website Status</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage website availability and maintenance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSites}
                disabled={isUpdating !== null}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts.total}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-green-600">{counts.available}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">{counts.maintenance}</p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disabled</p>
                  <p className="text-2xl font-bold text-red-600">{counts.disabled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Sites</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === 'all' ? 'All Statuses' : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('AVAILABLE')}>
                      Available
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('MAINTENANCE')}>
                      Maintenance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('DISABLED')}>
                      Disabled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sites List */}
        <div className="grid gap-4">
          {filteredSites.map((site) => (
            <Card key={site.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(site.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {site.displayName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {site.name} • {site.cost} points
                        </p>
                        {site.maintenanceMessage && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                            {site.maintenanceMessage}
                          </p>
                        )}
                        {site.lastStatusChange && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last changed: {new Date(site.lastStatusChange).toLocaleString()}
                            {site.statusChangedByUser && ` by ${site.statusChangedByUser.name || site.statusChangedByUser.email}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(site.status)}
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`toggle-${site.id}`} className="text-sm">
                        Available
                      </Label>
                      <Switch
                        id={`toggle-${site.id}`}
                        checked={site.status === 'AVAILABLE'}
                        onCheckedChange={(checked) => {
                          const newStatus = checked ? 'AVAILABLE' : 'MAINTENANCE'
                          updateSiteStatus(site.id, newStatus)
                        }}
                        disabled={isUpdating === site.id}
                      />
                    </div>

                    {site.status === 'MAINTENANCE' && (
                      <div className="w-64">
                        <Label htmlFor={`message-${site.id}`} className="text-sm">
                          Maintenance Message
                        </Label>
                        <Textarea
                          id={`message-${site.id}`}
                          placeholder="Enter maintenance message..."
                          value={maintenanceMessages[site.id] || site.maintenanceMessage || ''}
                          onChange={(e) => setMaintenanceMessages(prev => ({
                            ...prev,
                            [site.id]: e.target.value
                          }))}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSites.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No sites found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No websites are currently configured.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
