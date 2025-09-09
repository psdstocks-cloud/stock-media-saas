'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Calendar, CreditCard, Settings, Save, Edit3 } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  pointsBalance: number
  totalOrders: number
  successfulDownloads: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const [balanceResponse, ordersResponse] = await Promise.all([
          fetch(`/api/points?userId=${session.user.id}`),
          fetch(`/api/orders?userId=${session.user.id}`)
        ])

        const balanceData = await balanceResponse.json()
        const ordersData = await ordersResponse.json()

        const userProfile: UserProfile = {
          id: session.user.id,
          name: session.user.name || 'User',
          email: session.user.email || '',
          createdAt: new Date().toISOString(), // You might want to get this from the database
          pointsBalance: balanceData.balance?.currentPoints || 0,
          totalOrders: ordersData.orders?.length || 0,
          successfulDownloads: ordersData.orders?.filter((order: any) => 
            order.status === 'COMPLETED' || order.status === 'READY'
          ).length || 0
        }

        setProfile(userProfile)
        setFormData({
          name: userProfile.name,
          email: userProfile.email
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, status, router])

  const handleSave = async () => {
    // Here you would typically update the user profile in the database
    // For now, we'll just update the local state
    if (profile) {
      setProfile({
        ...profile,
        name: formData.name,
        email: formData.email
      })
    }
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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

  if (!session?.user?.id || !profile) {
    return null
  }

  return (
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px'
        }}>
          {/* Main Profile Content */}
          <div>
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
                justifyContent: 'space-between',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  margin: 0
                }}>
                  Account Information
                </h2>
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
                  {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

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
                        border: '2px solid #e2e8f0',
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
                      {profile.name}
                    </div>
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
                        border: '2px solid #e2e8f0',
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
                      {profile.email}
                    </div>
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
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
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
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: profile.name,
                        email: profile.email
                      })
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

            {/* Account Statistics */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginBottom: '24px'
              }}>
                Account Statistics
              </h3>
              
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
                    {profile.pointsBalance}
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
                    {profile.totalOrders}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#166534',
                    margin: 0
                  }}>
                    Total Orders
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
                    ⬇️
                  </div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#6b21a8',
                    margin: '0 0 4px 0'
                  }}>
                    {profile.successfulDownloads}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b21a8',
                    margin: 0
                  }}>
                    Downloads
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Settings size={20} />
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => router.push('/dashboard/browse')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔍 Request Files
                </button>
                <button
                  onClick={() => router.push('/dashboard/orders')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  📋 My Orders
                </button>
                <button
                  onClick={() => router.push('/dashboard/support')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🎧 Get Support
                </button>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CreditCard size={20} />
                Account Status
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%'
                }}></div>
                <span style={{
                  fontSize: '14px',
                  color: '#166534',
                  fontWeight: '500'
                }}>
                  Active Account
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0
              }}>
                Your account is in good standing with full access to all features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}