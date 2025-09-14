'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import './styles.css'
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
  MemoryStick,
  ArrowLeft
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
    <div className="admin-settings-container">
      <div className="admin-settings-card">
        {/* Header */}
        <div className="admin-settings-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              <div>
                <h1 className="admin-settings-title">Settings</h1>
                <p className="admin-settings-subtitle">
                  Manage your platform configuration and system settings
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={loadSystemHealth}
                className="admin-settings-button secondary"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Health
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="admin-settings-button"
                style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="admin-settings-metrics">
            <div className="admin-settings-metric-card">
              <div className="flex items-center">
                <div className={`admin-settings-metric-icon ${
                  systemHealth.status === 'healthy' ? 'healthy' :
                  systemHealth.status === 'warning' ? 'warning' :
                  'critical'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="admin-settings-metric-label">System Status</p>
                  <p className={`admin-settings-metric-value capitalize ${
                    systemHealth.status === 'healthy' ? 'text-green-600' :
                    systemHealth.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {systemHealth.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-settings-metric-card">
              <div className="flex items-center">
                <div className="admin-settings-metric-icon blue">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="admin-settings-metric-label">Total Users</p>
                  <p className="admin-settings-metric-value text-gray-900">
                    {systemHealth.metrics.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-settings-metric-card">
              <div className="flex items-center">
                <div className="admin-settings-metric-icon purple">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="admin-settings-metric-label">Active Subscriptions</p>
                  <p className="admin-settings-metric-value text-gray-900">
                    {systemHealth.metrics.activeSubscriptions.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-settings-metric-card">
              <div className="flex items-center">
                <div className="admin-settings-metric-icon green">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="admin-settings-metric-label">Total Revenue</p>
                  <p className="admin-settings-metric-value text-gray-900">
                    ${systemHealth.metrics.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="admin-settings-layout">
          {/* Categories Sidebar */}
          <div className="admin-settings-sidebar">
            <h3 className="admin-settings-sidebar-title">Categories</h3>
            <div className="admin-settings-search">
              <Search className="admin-settings-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Settings
                return (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`admin-settings-category ${
                      selectedCategory === category.key ? 'active' : ''
                    }`}
                  >
                    <div className="admin-settings-category-icon">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="admin-settings-category-info">
                      <p className="admin-settings-category-name">{category.name}</p>
                      <p className="admin-settings-category-description">{category.description}</p>
                    </div>
                    <span className="admin-settings-category-count">
                      {category.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="admin-settings-content">
            <div className="admin-settings-content-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 className="admin-settings-content-title">
                    {categories.find(c => c.key === selectedCategory)?.name || 'Settings'}
                  </h2>
                  <p className="admin-settings-content-subtitle">
                    {categories.find(c => c.key === selectedCategory)?.description}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {filteredSettings.length} settings
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-settings-content-body">
              {filteredSettings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms' : 'No settings available for this category'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredSettings.map((setting) => (
                    <div key={setting.key} className="admin-settings-item">
                      <div className="admin-settings-item-header">
                        <h3 className="admin-settings-item-title">
                          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <div className="admin-settings-item-badges">
                          {setting.isRequired && (
                            <span className="admin-settings-item-badge required">Required</span>
                          )}
                          {setting.isEncrypted && (
                            <span className="admin-settings-item-badge encrypted">Encrypted</span>
                          )}
                        </div>
                      </div>
                      
                      {setting.description && (
                        <p className="admin-settings-item-description">{setting.description}</p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {setting.type === 'boolean' ? (
                          <label className="admin-settings-item-toggle">
                            <input
                              type="checkbox"
                              checked={setting.value === 'true'}
                              onChange={(e) => handleSettingChange(setting.key, e.target.checked.toString())}
                            />
                            <span className="admin-settings-item-slider"></span>
                          </label>
                        ) : setting.type === 'password' || (setting.isEncrypted && setting.value !== '••••••••') ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <input
                              type={showEncrypted[setting.key] ? 'text' : 'password'}
                              value={setting.value}
                              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                              className="admin-settings-item-input"
                              placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                            />
                            <button
                              type="button"
                              onClick={() => toggleEncrypted(setting.key)}
                              style={{ padding: '0.5rem', color: '#9ca3af' }}
                            >
                              {showEncrypted[setting.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : setting.options ? (
                          <select
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                            className="admin-settings-item-input"
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
                            className="admin-settings-item-input"
                            placeholder={`Enter ${setting.key.replace(/_/g, ' ')}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`admin-settings-notification ${notification.type}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}
      </div>
    </div>
  )
}
