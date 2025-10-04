'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Globe, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter,
  Settings,
  ArrowLeft,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import PlatformLogo from '@/components/ui/PlatformLogo'
import WebsiteStatusBadge from '@/components/landing/WebsiteStatusBadge'
import PlatformManagementModal from '@/components/modals/PlatformManagementModal'

interface WebsiteStatus {
  id: string
  name: string
  displayName: string
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DISABLED'
  maintenanceMessage?: string
  lastStatusChange?: string
  category: string
  isActive: boolean
  statusChangedByUser?: {
    name: string
    email: string
  }
}



export default function WebsiteStatusClient() {
  const [sites, setSites] = useState<WebsiteStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedPlatform, setSelectedPlatform] = useState<WebsiteStatus | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchSites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/website-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSites(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch website statuses:', error)
    } finally {
      setLoading(false)
    }
  }

  const seedDatabase = async () => {
    try {
      setIsSeeding(true)
      const response = await fetch('/api/admin/seed-stock-sites', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Seeding successful:', data)
        // Refresh the sites list
        await fetchSites()
        alert(`Successfully seeded ${data.count} stock sites!`)
      } else {
        const errorData = await response.json()
        console.error('Seeding failed:', errorData)
        alert(`Seeding failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error seeding database:', error)
      alert('Error seeding database. Please try again.')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleAddPlatform = () => {
    setModalMode('add')
    setSelectedPlatform(null)
    setIsModalOpen(true)
  }

  const handleEditPlatform = (platform: WebsiteStatus) => {
    setModalMode('edit')
    setSelectedPlatform(platform)
    setIsModalOpen(true)
  }

  const handleSavePlatform = async (platformData: any) => {
    try {
      const url = modalMode === 'add' ? '/api/admin/platforms' : '/api/admin/platforms'
      const method = modalMode === 'add' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modalMode === 'edit' ? { id: selectedPlatform?.id, ...platformData } : platformData)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Platform saved:', data)
        await fetchSites()
        alert(`Platform ${modalMode === 'add' ? 'added' : 'updated'} successfully!`)
        setIsModalOpen(false)
      } else {
        const errorData = await response.json()
        console.error('Save failed:', errorData)
        alert(`Failed to ${modalMode === 'add' ? 'add' : 'update'} platform: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving platform:', error)
      alert('Error saving platform. Please try again.')
    }
  }

  const handleDeletePlatform = async (platformId: string, platformName: string) => {
    if (!confirm(`Are you sure you want to delete "${platformName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setIsDeleting(platformId)
      const response = await fetch(`/api/admin/platforms?id=${platformId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchSites()
        alert('Platform deleted successfully!')
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        alert(`Failed to delete platform: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting platform:', error)
      alert('Error deleting platform. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  const updateSiteStatus = async (siteId: string, status: string, maintenanceMessage?: string) => {
    try {
      setIsUpdating(siteId)
      const response = await fetch('/api/admin/website-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          siteId,
          status,
          maintenanceMessage
        })
      })

      if (response.ok) {
        await fetchSites() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update website status:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    total: sites.length,
    available: sites.filter(s => s.status === 'AVAILABLE').length,
    maintenance: sites.filter(s => s.status === 'MAINTENANCE').length,
    disabled: sites.filter(s => s.status === 'DISABLED').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading website statuses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Globe className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Website Status</h1>
                <p className="text-gray-400">Manage website availability and maintenance</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleAddPlatform}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
            <Button
              onClick={fetchSites}
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/dashboard'}
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Sites</p>
                  <p className="text-3xl font-bold text-white">{statusCounts.total}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available</p>
                  <p className="text-3xl font-bold text-green-400">{statusCounts.available}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Maintenance</p>
                  <p className="text-3xl font-bold text-yellow-400">{statusCounts.maintenance}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Disabled</p>
                  <p className="text-3xl font-bold text-red-400">{statusCounts.disabled}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sites List */}
        {filteredSites.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">No sites found</h3>
              <p className="text-gray-400 mb-6">
                {sites.length === 0 
                  ? "No websites are currently configured." 
                  : "No websites match your search criteria."
                }
              </p>
              {sites.length === 0 && (
                <Button 
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSeeding ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Seed Database with Stock Sites
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
                <Card key={site.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <PlatformLogo name={site.displayName} size="md" />
                        <div>
                          <CardTitle className="text-lg text-white">{site.displayName}</CardTitle>
                          <p className="text-sm text-gray-400 capitalize">{site.category}</p>
                        </div>
                      </div>
                      <WebsiteStatusBadge 
                        status={site.status} 
                        maintenanceMessage={site.maintenanceMessage}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {site.maintenanceMessage && (
                      <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-200">{site.maintenanceMessage}</p>
                      </div>
                    )}

                    {site.lastStatusChange && (
                      <div className="text-xs text-gray-400">
                        Last updated: {new Date(site.lastStatusChange).toLocaleString()}
                      </div>
                    )}

                    {site.statusChangedByUser && (
                      <div className="text-xs text-gray-400">
                        Changed by: {site.statusChangedByUser.name} ({site.statusChangedByUser.email})
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Status Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSiteStatus(site.id, 'AVAILABLE')}
                          disabled={isUpdating === site.id || site.status === 'AVAILABLE'}
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Available
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSiteStatus(site.id, 'MAINTENANCE', 'Scheduled maintenance')}
                          disabled={isUpdating === site.id || site.status === 'MAINTENANCE'}
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Maintenance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSiteStatus(site.id, 'DISABLED')}
                          disabled={isUpdating === site.id || site.status === 'DISABLED'}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Disable
                        </Button>
                      </div>

                      {/* Management Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPlatform(site)}
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePlatform(site.id, site.displayName)}
                          disabled={isDeleting === site.id}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          {isDeleting === site.id ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>

                    {isUpdating === site.id && (
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>

      {/* Platform Management Modal */}
      <PlatformManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlatform}
        platform={selectedPlatform}
        mode={modalMode}
      />
    </div>
  )
}