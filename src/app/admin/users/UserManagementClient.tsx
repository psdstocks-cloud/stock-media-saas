'use client'

import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Edit, 
  Trash2, 
  Shield,
  User,
  Eye,
  Plus,
  Download
} from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/admin/DataTable'
import { 
  CreateUserModal, 
  EditUserModal, 
  DeleteUserModal, 
  ViewUserModal 
} from '@/components/admin/UserModals'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface UserData {
  id: string
  email: string
  name: string | null
  currentPoints: number
  totalUsed: number
  role: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export default function UserManagementClient() {
  const { has } = usePermissions()
  const canView = has('users.view')
  const canEdit = has('users.edit')
  const canImpersonate = has('users.impersonate')
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setError('Failed to fetch users')
      }
    } catch (error) {
      setError('An error occurred while fetching users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'ADMIN':
        return <Badge variant="destructive" className="bg-red-500"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case 'SUPER_ADMIN':
        return <Badge variant="destructive" className="bg-purple-500"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
      case 'user':
      case 'USER':
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  // Define table columns
  const columns: ColumnDef<UserData>[] = useMemo(() => [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div>
            <Typography variant="body" className="font-medium">
              {user.name || 'No name'}
            </Typography>
            <Typography variant="caption" color="muted">
              {user.email}
            </Typography>
          </div>
        )
      },
    },
    {
      accessorKey: 'points',
      header: 'Points',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div>
            <Typography variant="body" className="font-medium">
              {user.currentPoints.toLocaleString()} pts
            </Typography>
            <Typography variant="caption" color="muted">
              Used: {user.totalUsed.toLocaleString()}
            </Typography>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => getRoleBadge(row.getValue('role')),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => (
        <Typography variant="body" className="text-sm">
          {formatDate(row.getValue('createdAt'))}
        </Typography>
      ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => (
        <Typography variant="body" className="text-sm">
          {formatDate(row.getValue('lastLoginAt'))}
        </Typography>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setViewModalOpen(true)
              }}
              disabled={!canView}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUser(user)
                setEditModalOpen(true)
              }}
              disabled={!canEdit}
            >
              <Edit className="h-3 w-3" />
            </Button>
            {user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUser(user)
                  setDeleteModalOpen(true)
                }}
                className="text-red-600 hover:text-red-700"
                disabled={!canEdit}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )
      },
    },
  ], [])

  const handleCreateSuccess = (newUser: UserData) => {
    setUsers(prev => [newUser, ...prev])
    setCreateModalOpen(false)
  }

  const handleEditSuccess = (updatedUser: UserData) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user))
    setEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id))
        setSelectedUsers(prev => prev.filter(id => id !== selectedUser.id))
        setDeleteModalOpen(false)
        setSelectedUser(null)
        toast.success('User deleted successfully!')
      } else {
        setError('Failed to delete user')
        toast.error('Failed to delete user')
      }
    } catch (error) {
      setError('An error occurred while deleting user')
      toast.error('An error occurred while deleting user')
    }
  }

  const handleBulkAction = (selectedIds: string[], action: string) => {
    if (action === 'delete') {
      // TODO: Implement bulk delete
      console.log('Bulk delete users:', selectedIds)
    } else if (action === 'export') {
      // TODO: Implement bulk export
      console.log('Bulk export users:', selectedIds)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export all users')
  }

  const handleFilterChange = (filters: Record<string, string>) => {
    console.log('Filter changed:', filters)
  }

  // Generate filter options based on current data
  const filterOptions = useMemo(() => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      {
        key: 'role',
        label: 'Role',
        options: [
          { value: 'user', label: 'User', count: roleCounts.user || 0 },
          { value: 'admin', label: 'Admin', count: roleCounts.admin || 0 },
          { value: 'SUPER_ADMIN', label: 'Super Admin', count: roleCounts.SUPER_ADMIN || 0 },
        ]
      }
    ]
  }, [users])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">
            User Management
          </Typography>
          <Typography variant="body" color="muted" className="mt-2">
            Manage users, roles, and permissions
          </Typography>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport} variant="outline" size="sm" disabled={!canView}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} disabled={!canEdit}>
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error}
        searchPlaceholder="Search users by name or email..."
        showSearch={true}
        showFilters={true}
        filterOptions={filterOptions}
        showBulkActions={canEdit}
        showPagination={true}
        pageSize={20}
        emptyMessage="No users found"
        emptyIcon={<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        onRefresh={fetchUsers}
        onExport={canView ? handleExport : undefined}
        onBulkAction={canEdit ? handleBulkAction : undefined}
        onFilterChange={handleFilterChange}
        selectedRowIds={canEdit ? selectedUsers : []}
        onSelectionChange={canEdit ? setSelectedUsers : undefined}
        enableRowSelection={canEdit}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditUserModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSuccess={handleEditSuccess}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onConfirm={handleDeleteConfirm}
      />

      <ViewUserModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />
    </div>
  )
}
