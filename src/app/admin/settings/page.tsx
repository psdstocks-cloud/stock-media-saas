'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  Settings, 
  Shield, 
  CreditCard, 
  Mail, 
  Webhook, 
  BarChart3, 
  Activity, 
  ToggleLeft,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  Globe,
  Database,
  Server,
  Bell,
  Users,
  TrendingUp,
  Clock,
  ShieldCheck,
  Key,
  Globe2,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react'

interface Setting {
  id: string
  category: string
  key: string
  value: string
  type: string
  description?: string
  isEncrypted: boolean
  isRequired: boolean
  validation?: string
  options?: string
  order: number
  isActive: boolean
}

interface Category {
  key: string
  name: string
  description: string
  icon: string
  color: string
  order: number
  count: number
}

interface SystemHealth {
  status: string
  services: Array<{
    service: string
    status: string
    message: string
    lastChecked: string
  }>
  metrics: {
    totalUsers: number
    totalOrders: number
    activeSubscriptions: number
    totalRevenue: number
  }
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [settings, setSettings] = useState<Setting[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEncrypted, setShowEncrypted] = useState<Record<string, boolean>>({})
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Icon mapping
  const iconMap = {
    Settings,
    Shield,
    CreditCard,
    Mail,
    Webhook,
    BarChart3,
    Activity,
    ToggleLeft,
    Globe,
    Database,
    Server,
    Bell,
    Users,
    TrendingUp,
    Clock,
    ShieldCheck,
    Key,
    Globe2,
    Monitor,
    Smartphone,
    Wifi,
    HardDrive,
    Cpu,
    MemoryStick
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      router.push('/admin/login')
      return
    }

    loadData()
  }, [session, status, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        loadCategories(),
        loadSettings(selectedCategory),
        loadSystemHealth()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      showNotification('error', 'Failed to load settings data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    const response = await fetch('/api/admin/settings/categories')
    if (response.ok) {
      const data = await response.json()
      setCategories(data.categories)
    }
  }

  const loadSettings = async (category: string) => {
    const response = await fetch(`/api/admin/settings/${category}`)
    if (response.ok) {
      const data = await response.json()
      setSettings(data.settings)
    }
  }

  const loadSystemHealth = async () => {
    const response = await fetch('/api/admin/system/health')
    if (response.ok) {
      const data = await response.json()
      setSystemHealth(data)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    loadSettings(category)
  }

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ))
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/admin/settings/${selectedCategory}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        showNotification('success', 'Settings saved successfully!')
        await loadSettings(selectedCategory) // Reload to get updated values
      } else {
        const error = await response.json()
        showNotification('error', error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showNotification('error', 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const toggleEncrypted = (key: string) => {
    setShowEncrypted(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const filteredSettings = settings.filter(setting =>
    setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage your platform configuration and system settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadSystemHealth}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Health
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  systemHealth.status === 'healthy' ? 'bg-green-100' :
                  systemHealth.status === 'warning' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <Activity className={`w-6 h-6 ${
                    systemHealth.status === 'healthy' ? 'text-green-600' :
                    systemHealth.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className={`text-2xl font-semibold capitalize ${
                    systemHealth.status === 'healthy' ? 'text-green-600' :
                    systemHealth.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {systemHealth.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {systemHealth.metrics.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {systemHealth.metrics.activeSubscriptions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${systemHealth.metrics.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Settings
                  return (
                    <button
                      key={category.key}
                      onClick={() => handleCategoryChange(category.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.key
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          selectedCategory === category.key
                            ? `bg-${category.color}-100`
                            : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-4 h-4 ${
                            selectedCategory === category.key
                              ? `text-${category.color}-600`
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        selectedCategory === category.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {categories.find(c => c.key === selectedCategory)?.name || 'Settings'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {categories.find(c => c.key === selectedCategory)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {filteredSettings.length} settings
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredSettings.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? 'Try adjusting your search terms' : 'No settings available for this category'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredSettings.map((setting) => (
                      <div key={setting.key} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h3>
                              {setting.isRequired && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                                  Required
                                </span>
                              )}
                              {setting.isEncrypted && (
                                <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                                  Encrypted
                                </span>
                              )}
                            </div>
                            
                            {setting.description && (
                              <p className="text-sm text-gray-600 mb-4">{setting.description}</p>
                            )}

                            <div className="flex items-center space-x-4">
                              {setting.type === 'boolean' ? (
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={setting.value === 'true'}
                                    onChange={(e) => handleSettingChange(setting.key, e.target.checked.toString())}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              ) : setting.type === 'password' || (setting.isEncrypted && setting.value !== '••••••••') ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type={showEncrypted[setting.key] ? 'text' : 'password'}
                                    value={setting.value}
                                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleEncrypted(setting.key)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    {showEncrypted[setting.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              ) : setting.options ? (
                                <select
                                  value={setting.value}
                                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {JSON.parse(setting.options).map((option: string) => (
                                    <option key={option} value={option}>
                                      {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={setting.type === 'number' ? 'number' : setting.type === 'email' ? 'email' : setting.type === 'url' ? 'url' : 'text'}
                                  value={setting.value}
                                  onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                <Bell className="w-5 h-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
