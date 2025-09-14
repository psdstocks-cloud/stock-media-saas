'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail,
  Calendar,
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Settings
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  image?: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date | null
  loginAttempts: number
  lockedUntil?: Date | null
  pointsBalance?: {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    currentPoints: number
    totalPurchased: number
    totalUsed: number
    lastRollover: Date | null
  } | null
  subscriptions?: Array<{
    id: string
    userId: string
    planId: string
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    status: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
    canceledAt: Date | null
    createdAt: Date
    updatedAt: Date
    plan: {
      id: string
      name: string
      description: string | null
      price: number
      points: number
      rolloverLimit: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }
  }>
  _count: {
    orders: number
  }
}

interface UsersManagementClientProps {
  initialUsers: User[]
}

export default function UsersManagementClient({ initialUsers }: UsersManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const itemsPerPage = 20

  // Fetch users with filters and pagination
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
        setTotalUsers(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery, roleFilter, statusFilter, sortBy, sortOrder])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1)
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length 
        ? [] 
        : users.map(user => user.id)
    )
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }
      case 'ADMIN':
        return {
          background: 'rgba(139, 92, 246, 0.1)',
          color: '#8b5cf6',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }
      default:
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }
    }
  }

  const getStatusBadgeStyle = (user: User) => {
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        text: 'Locked'
      }
    }
    if (user.lastLoginAt && new Date(user.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        text: 'Active'
      }
    }
    return {
      background: 'rgba(107, 114, 128, 0.1)',
      color: '#6b7280',
      border: '1px solid rgba(107, 114, 128, 0.3)',
      text: 'Inactive'
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleCloseModals = () => {
    setShowUserModal(false)
    setShowEditModal(false)
    setSelectedUser(null)
    setEditingUser(null)
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Search and Filter Bar */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ marginLeft: '1rem', fontSize: '1rem' }}>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ fontSize: '1rem', margin: 0 }}>No users found</p>
            <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', opacity: 0.7 }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 120px 120px 120px 80px',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  style={{ margin: 0 }}
                />
              </div>
              <div>User</div>
              <div 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => handleSort('role')}
              >
                Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => handleSort('createdAt')}
              >
                Joined {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </div>
              <div>Status</div>
              <div>Points</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 120px 120px 120px 80px',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      style={{ margin: 0 }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name || user.email}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <UserCheck size={16} />
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '0.95rem',
                        marginBottom: '0.25rem'
                      }}>
                        {user.name || 'No Name'}
                      </div>
                      <div style={{
                        color: '#64748b',
                        fontSize: '0.85rem'
                      }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      ...getRoleBadgeStyle(user.role)
                    }}>
                      {user.role}
                    </span>
                  </div>

                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {formatDate(user.createdAt)}
                  </div>

                  <div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      ...getStatusBadgeStyle(user)
                    }}>
                      {getStatusBadgeStyle(user).text}
                    </span>
                  </div>

                  <div style={{ color: '#667eea', fontWeight: '600', fontSize: '0.85rem' }}>
                    {user.pointsBalance?.currentPoints || 0}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleViewUser(user)}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === 1 ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === 1 ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronsLeft size={16} />
                </button>
                
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === 1 ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === 1 ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <span style={{
                  padding: '0.5rem 1rem',
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === totalPages ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(107, 114, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: currentPage === totalPages ? '#9ca3af' : '#1f2937',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>User Details</h2>
              <button
                onClick={handleCloseModals}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  {selectedUser.image ? (
                    <img 
                      src={selectedUser.image} 
                      alt={selectedUser.name || selectedUser.email}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <UserCheck size={24} />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                    {selectedUser.name || 'No Name'}
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Role</label>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      ...getRoleBadgeStyle(selectedUser.role)
                    }}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Status</label>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      ...getStatusBadgeStyle(selectedUser)
                    }}>
                      {getStatusBadgeStyle(selectedUser).text}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Points</label>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', fontWeight: '600', color: '#667eea' }}>
                    {selectedUser.pointsBalance?.currentPoints || 0}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Orders</label>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                    {selectedUser._count.orders}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Joined</label>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Last Login</label>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                    {formatDate(selectedUser.lastLoginAt)}
                  </p>
                </div>
              </div>

              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Active Subscriptions</label>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUser.subscriptions.map((sub) => (
                      <div key={sub.id} style={{
                        padding: '0.75rem',
                        background: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>
                          {sub.plan.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Status: {sub.status} • ${sub.plan.price}/month
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>Edit User</h2>
              <button
                onClick={handleCloseModals}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={editingUser.name || ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={editingUser.email}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                  Role
                </label>
                <select
                  defaultValue={editingUser.role}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleCloseModals}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement save functionality
                    handleCloseModals()
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
