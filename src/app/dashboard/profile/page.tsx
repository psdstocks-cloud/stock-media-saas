'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
}

interface Subscription {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    id: string
    name: string
    description: string | null
    price: number
    points: number
    rolloverLimit: number
  }
}

interface ApiKey {
  id: string
  key: string
  isActive: boolean
  lastUsed: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'api-keys'>('profile')
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        const [profileResponse, subscriptionResponse, apiKeysResponse] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/subscription'),
          fetch('/api/api-keys')
        ])

        const profileData = await profileResponse.json()
        const subscriptionData = await subscriptionResponse.json()
        const apiKeysData = await apiKeysResponse.json()

        setProfile(profileData.profile)
        setSubscription(subscriptionData.subscription)
        setApiKeys(apiKeysData.apiKeys || [])
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [session, status, router])

  const generateApiKey = async () => {
    setIsGeneratingKey(true)
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh API keys
        const apiKeysResponse = await fetch('/api/api-keys')
        const apiKeysData = await apiKeysResponse.json()
        setApiKeys(apiKeysData.apiKeys || [])
      } else {
        alert(data.error || 'Failed to generate API key')
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      alert('Failed to generate API key')
    } finally {
      setIsGeneratingKey(false)
    }
  }

  const toggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh API keys
        const apiKeysResponse = await fetch('/api/api-keys')
        const apiKeysData = await apiKeysResponse.json()
        setApiKeys(apiKeysData.apiKeys || [])
      } else {
        alert(data.error || 'Failed to update API key')
      }
    } catch (error) {
      console.error('Error updating API key:', error)
      alert('Failed to update API key')
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open subscription management')
      }
    } catch (error) {
      console.error('Error opening subscription portal:', error)
      alert('Failed to open subscription management')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-500 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', name: 'Profile', icon: '👤' },
              { id: 'subscription', name: 'Subscription', icon: '💳' },
              { id: 'api-keys', name: 'API Keys', icon: '🔑' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profile.role}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(profile.createdAt).toLocaleDateString()}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Details</h3>
            {subscription ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Plan
                    </label>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {subscription.plan.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {subscription.plan.description}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Price
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      ${subscription.plan.price}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points per Month
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {subscription.plan.points}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rollover Limit
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {subscription.plan.rolloverLimit}%
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        subscription.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Next Billing Date
                      </label>
                      <div className="text-gray-900">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <button 
                    onClick={handleManageSubscription}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-4"
                  >
                    Manage Subscription
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                    Cancel Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No active subscription</div>
                <Link 
                  href="/" 
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Plans
                </Link>
              </div>
            )}
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
              <button
                onClick={generateApiKey}
                disabled={isGeneratingKey}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingKey ? 'Generating...' : 'Generate New Key'}
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-6">
              API keys allow you to integrate with our service programmatically. Keep your keys secure and don't share them publicly.
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No API keys generated yet</div>
                <div className="text-gray-400 text-sm mt-2">Generate your first API key to get started</div>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-sm text-gray-900 mb-1">
                          {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(key.createdAt).toLocaleDateString()}
                          {key.lastUsed && (
                            <span className="ml-4">
                              Last used: {new Date(key.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          key.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => toggleApiKey(key.id, key.isActive)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            key.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {key.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
