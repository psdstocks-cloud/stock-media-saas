'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Settings, 
  Save, 
  Edit3, 
  Lock, 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Clock,
  Activity,
  Bell,
  Globe,
  Key,
  LogOut,
  Camera,
  Upload,
  X
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  role: string
  createdAt: string
  updatedAt: string
  pointsBalance?: {
    currentPoints: number
    totalPurchased: number
    totalUsed: number
    lastRollover?: string
  }
  subscriptions?: Array<{
    id: string
    status: string
    currentPeriodEnd: string
    plan: {
      name: string
      price: number
      points: number
    }
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'subscription' | 'privacy'>('overview')
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching profile for user:', session?.user?.id)
      
      const response = await fetch('/api/profile')
      console.log('Profile API response status:', response.status)
      
      const data = await response.json()
      console.log('Profile API response data:', data)
      
      if (data.profile) {
        console.log('Setting profile data:', data.profile)
        setProfile(data.profile)
        setFormData({
          name: data.profile.name || '',
          email: data.profile.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        console.error('No profile data received:', data)
        setErrors({ general: data.error || 'Failed to load profile data' })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setErrors({ general: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required'
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters'
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setIsUpdating(true)
      setErrors({})
      setSuccess('')

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        setErrors({ general: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while updating profile' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!formData.currentPassword) {
      setErrors({ deletePassword: 'Password is required to delete account' })
      return
    }

    try {
      setIsUpdating(true)
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.currentPassword })
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setErrors({ deletePassword: data.error || 'Failed to delete account' })
      }
    } catch (error) {
      setErrors({ deletePassword: 'An error occurred while deleting account' })
    } finally {
      setIsUpdating(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ]

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return null
  }

  if (!profile && !loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', margin: '0 0 8px 0' }}>
            Profile Not Found
          </h2>
          <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>
            Unable to load your profile data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={() => router.back()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>My Profile</h1>
              </div>
            </div>
          </div>
        </header>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 1rem'
        }}>
          {/* Profile Header */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Avatar */}
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {profile?.name?.charAt(0) || 'U'}
                <button
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '24px',
                    height: '24px',
                    background: '#10b981',
                    border: '2px solid white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  margin: '0 0 8px 0'
                }}>
                  {profile?.name}
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: '0 0 8px 0'
                }}>
                  {profile?.email}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%'
                  }}></div>
                  <span style={{
                    fontSize: '14px',
                    color: '#10b981',
                    fontWeight: '500'
                  }}>
                    Active Account
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: isEditing ? '#ef4444' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                border: '1px solid #93c5fd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#2563eb',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  fontSize: '24px'
                }}>
                  ⚡
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e40af',
                  margin: '0 0 4px 0'
                }}>
                  {profile?.pointsBalance?.currentPoints || 0}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#1e40af',
                  margin: 0
                }}>
                  Available Points
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                border: '1px solid #86efac',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#10b981',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  fontSize: '24px'
                }}>
                  📋
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#166534',
                  margin: '0 0 4px 0'
                }}>
                  {profile?.pointsBalance?.totalUsed || 0}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#166534',
                  margin: 0
                }}>
                  Downloads Used
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                border: '1px solid #c4b5fd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#7c3aed',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  fontSize: '24px'
                }}>
                  🏆
                </div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#6b21a8',
                  margin: '0 0 4px 0'
                }}>
                  {profile?.role}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#6b21a8',
                  margin: 0
                }}>
                  Account Type
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '32px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '16px'
            }}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: isActive ? '#f0f9ff' : 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      color: isActive ? '#2563eb' : '#64748b',
                      fontSize: '14px',
                      fontWeight: isActive ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Success Message */}
            {success && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ color: '#166534', fontSize: '14px' }}>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} color="#ef4444" />
                <span style={{ color: '#dc2626', fontSize: '14px' }}>{errors.general}</span>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '24px'
                }}>
                  Personal Information
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${errors.name ? '#ef4444' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'border-color 0.2s ease'
                        }}
                      />
                    ) : (
                      <div style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#374151'
                      }}>
                        {profile?.name}
                      </div>
                    )}
                    {errors.name && (
                      <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: `2px solid ${errors.email ? '#ef4444' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'border-color 0.2s ease'
                        }}
                      />
                    ) : (
                      <div style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#374151'
                      }}>
                        {profile?.email}
                      </div>
                    )}
                    {errors.email && (
                      <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Member Since
                    </label>
                    <div style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#374151'
                    }}>
                      {new Date(profile?.createdAt || new Date()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '32px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      style={{
                        padding: '12px 24px',
                        background: isUpdating ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={16} />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: profile?.name || '',
                          email: profile?.email || '',
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                        setErrors({})
                      }}
                      style={{
                        padding: '12px 24px',
                        background: 'white',
                        color: '#374151',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '24px'
                }}>
                  Security Settings
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          paddingRight: '48px',
                          border: `2px solid ${errors.currentPassword ? '#ef4444' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'border-color 0.2s ease'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${errors.newPassword ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                    {errors.newPassword && (
                      <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: `2px solid ${errors.confirmPassword ? '#ef4444' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                    {errors.confirmPassword && (
                      <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    style={{
                      padding: '12px 24px',
                      background: isUpdating ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Save size={16} />
                    {isUpdating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '24px'
                }}>
                  Subscription Details
                </h3>
                
                {profile?.subscriptions && profile.subscriptions.length > 0 ? (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0
                      }}>
                        {profile.subscriptions[0].plan.name}
                      </h4>
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Active
                      </span>
                    </div>
                    <p style={{
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      ${profile.subscriptions[0].plan.price}/month • {profile.subscriptions[0].plan.points} points included
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '14px',
                      margin: 0
                    }}>
                      Next billing: {new Date(profile.subscriptions[0].currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#dc2626',
                      margin: '0 0 8px 0'
                    }}>
                      No Active Subscription
                    </h4>
                    <p style={{
                      color: '#64748b',
                      margin: '0 0 16px 0'
                    }}>
                      You don't have an active subscription. Choose a plan to get started.
                    </p>
                    <button
                      onClick={() => router.push('/register')}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      View Plans
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '24px'
                }}>
                  Privacy & Data
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Download size={16} />
                      Export Data
                    </h4>
                    <p style={{
                      color: '#64748b',
                      margin: '0 0 16px 0',
                      fontSize: '14px'
                    }}>
                      Download a copy of your personal data including profile information, order history, and account activity.
                    </p>
                    <button
                      style={{
                        padding: '8px 16px',
                        background: 'white',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Request Data Export
                    </button>
                  </div>

                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#dc2626',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Trash2 size={16} />
                      Delete Account
                    </h4>
                    <p style={{
                      color: '#64748b',
                      margin: '0 0 16px 0',
                      fontSize: '14px'
                    }}>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#dc2626',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle size={24} />
                Delete Account
              </h3>
              <p style={{
                color: '#64748b',
                margin: '0 0 24px 0',
                lineHeight: '1.6'
              }}>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  name="deletePassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${errors.deletePassword ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                {errors.deletePassword && (
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.deletePassword}</p>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setErrors({})
                    setFormData(prev => ({ ...prev, currentPassword: '' }))
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    color: '#374151',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isUpdating}
                  style={{
                    padding: '12px 24px',
                    background: isUpdating ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isUpdating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdating ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}