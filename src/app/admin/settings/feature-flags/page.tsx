'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  ToggleLeft,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react'

interface FeatureFlag {
  id: string
  name: string
  description?: string
  isEnabled: boolean
  rolloutPercentage: number
  targetUsers?: string
  conditions?: string
  createdAt: string
  updatedAt: string
}

export default function FeatureFlagsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isEnabled: false,
    rolloutPercentage: 0,
    targetUsers: '',
    conditions: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login')
      return
    }

    loadFeatureFlags()
  }, [session, status, router])

  const loadFeatureFlags = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/feature-flags')
      if (response.ok) {
        const data = await response.json()
        setFeatureFlags(data.featureFlags)
      }
    } catch (error) {
      console.error('Error loading feature flags:', error)
      showNotification('error', 'Failed to load feature flags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      setIsCreating(true)
      
      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetUsers: formData.targetUsers ? JSON.parse(formData.targetUsers) : null,
          conditions: formData.conditions ? JSON.parse(formData.conditions) : null
        })
      })

      if (response.ok) {
        showNotification('success', 'Feature flag created successfully!')
        setShowCreateModal(false)
        resetForm()
        loadFeatureFlags()
      } else {
        const error = await response.json()
        showNotification('error', error.error || 'Failed to create feature flag')
      }
    } catch (error) {
      console.error('Error creating feature flag:', error)
      showNotification('error', 'Failed to create feature flag')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/feature-flags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetUsers: formData.targetUsers ? JSON.parse(formData.targetUsers) : null,
          conditions: formData.conditions ? JSON.parse(formData.conditions) : null
        })
      })

      if (response.ok) {
        showNotification('success', 'Feature flag updated successfully!')
        setIsEditing(null)
        resetForm()
        loadFeatureFlags()
      } else {
        const error = await response.json()
        showNotification('error', error.error || 'Failed to update feature flag')
      }
    } catch (error) {
      console.error('Error updating feature flag:', error)
      showNotification('error', 'Failed to update feature flag')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return

    try {
      const response = await fetch(`/api/admin/feature-flags/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showNotification('success', 'Feature flag deleted successfully!')
        loadFeatureFlags()
      } else {
        const error = await response.json()
        showNotification('error', error.error || 'Failed to delete feature flag')
      }
    } catch (error) {
      console.error('Error deleting feature flag:', error)
      showNotification('error', 'Failed to delete feature flag')
    }
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    const flag = featureFlags.find(f => f.id === id)
    if (!flag) return

    setFormData({
      name: flag.name,
      description: flag.description || '',
      isEnabled: !isEnabled,
      rolloutPercentage: flag.rolloutPercentage,
      targetUsers: flag.targetUsers || '',
      conditions: flag.conditions || ''
    })

    await handleUpdate(id)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isEnabled: false,
      rolloutPercentage: 0,
      targetUsers: '',
      conditions: ''
    })
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flag.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'enabled' && flag.isEnabled) ||
                         (statusFilter === 'disabled' && !flag.isEnabled)
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return null
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
              <p className="text-gray-600 mt-2">
                Manage feature rollouts and A/B testing
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Feature Flag
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search feature flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Flags List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredFlags.length === 0 ? (
            <div className="text-center py-12">
              <ToggleLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feature flags found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first feature flag'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Feature Flag
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFlags.map((flag) => (
                <div key={flag.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{flag.name}</h3>
                        <div className="ml-3 flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            flag.isEnabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {flag.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          {flag.rolloutPercentage > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {flag.rolloutPercentage}% rollout
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {flag.description && (
                        <p className="text-sm text-gray-600 mb-4">{flag.description}</p>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {flag.targetUsers ? JSON.parse(flag.targetUsers).length : 0} target users
                        </div>
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 mr-1" />
                          {flag.rolloutPercentage}% rollout
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Created {new Date(flag.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggle(flag.id, flag.isEnabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          flag.isEnabled
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {flag.isEnabled ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsEditing(flag.id)
                          setFormData({
                            name: flag.name,
                            description: flag.description || '',
                            isEnabled: flag.isEnabled,
                            rolloutPercentage: flag.rolloutPercentage,
                            targetUsers: flag.targetUsers || '',
                            conditions: flag.conditions || ''
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(flag.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || isEditing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Feature Flag' : 'Create Feature Flag'}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="feature_name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what this feature flag controls..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Enabled</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rollout Percentage (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rolloutPercentage}
                    onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Users (JSON array)
                  </label>
                  <textarea
                    value={formData.targetUsers}
                    onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder='["user1@example.com", "user2@example.com"]'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions (JSON object)
                  </label>
                  <textarea
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder='{"userRole": "premium", "region": "US"}'
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setIsEditing(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? () => handleUpdate(isEditing) : handleCreate}
                  disabled={isCreating || !formData.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <Settings className="w-5 h-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
