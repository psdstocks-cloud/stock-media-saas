'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, RefreshCw, Shield, Plus, Search } from 'lucide-react'
import { ThemedIcon } from '@/components/admin/ThemedIcon'

interface Role { 
  id: string
  name: string
  description?: string | null
  permissionCount?: number
  userCount?: number
}

export default function RolesClient() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Role | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])
  const [allPermissions, setAllPermissions] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)

  async function load() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading roles...')
      
      // Load roles
      const rolesResponse = await fetch(`/api/admin/rbac/roles?search=${encodeURIComponent(search)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!rolesResponse.ok) {
        const errorData = await rolesResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${rolesResponse.status}: ${rolesResponse.statusText}`)
      }
      
      const rolesData = await rolesResponse.json()
      console.log('✅ Roles loaded:', rolesData)
      
      if (!rolesData.success) {
        throw new Error(rolesData.error || 'Failed to load roles')
      }
      
      setRoles(rolesData.roles || [])
      
      // Load permissions
      console.log('🔄 Loading permissions...')
      const permResponse = await fetch('/api/admin/rbac/permissions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (permResponse.ok) {
        const permData = await permResponse.json()
        console.log('✅ Permissions loaded:', permData)
        setAllPermissions(permData.permissions || [])
      } else {
        console.warn('⚠️ Failed to load permissions, using fallback')
        setAllPermissions([
          'users.view', 'users.edit', 'orders.view', 'orders.manage', 
          'settings.write', 'flags.view', 'flags.manage', 'rbac.manage'
        ])
      }
      
    } catch (e: any) {
      console.error('❌ Load error:', e)
      setError(e?.message || 'Error loading roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() 
  }, [search])

  const onSelectRole = async (role: Role) => {
    setSelected(role)
    try {
      const res = await fetch(`/api/admin/rbac/roles/${role.id}/permissions`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setPermissions(data.permissions || [])
      } else {
        setPermissions([])
      }
    } catch {
      setPermissions([])
    }
  }

  const togglePerm = (key: string) => {
    setPermissions(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    )
  }

  const savePerms = async () => {
    if (!selected) return
    try {
      const res = await fetch(`/api/admin/rbac/roles/${selected.id}/permissions`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ permissions })
      })
      if (!res.ok) {
        throw new Error('Failed to save permissions')
      }
      alert('✅ Permissions saved successfully!')
    } catch (error) {
      alert('❌ Failed to save permissions: ' + error)
    }
  }

  const createRole = async () => {
    if (!newName.trim()) return
    
    try {
      const res = await fetch('/api/admin/rbac/roles', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include',
        body: JSON.stringify({ 
          name: newName.trim(), 
          description: newDesc.trim() || null 
        })
      })
      
      if (res.ok) { 
        const data = await res.json()
        if (data.success) {
          setNewName('')
          setNewDesc('')
          setCreateOpen(false)
          load()
          alert('✅ Role created successfully!')
        } else {
          throw new Error(data.error || 'Failed to create role')
        }
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create role')
      }
    } catch (error) {
      alert('❌ Failed to create role: ' + error)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    load()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Loading roles and permissions...
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <ThemedIcon 
            icon={Shield}
            className="h-8 w-8" 
            style={{ color: 'var(--admin-accent)' }}
          />
          <div>
            <Typography 
              variant="h1" 
              className="text-3xl font-bold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Roles & Permissions
            </Typography>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Error loading roles
            </Typography>
          </div>
        </div>

        <Card 
          className="p-6 border-red-200 bg-red-50"
          style={{
            backgroundColor: '#FEF2F2',
            borderColor: '#FECACA',
            color: 'var(--admin-text-primary)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <Typography 
                  variant="h3" 
                  className="text-red-700 font-semibold"
                >
                  Failed to load roles
                </Typography>
                <Typography 
                  variant="body" 
                  className="text-red-600 text-sm mt-1"
                >
                  {error}
                </Typography>
              </div>
            </div>
            <Button 
              onClick={handleRetry}
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <ThemedIcon 
                icon={RefreshCw}
                className="h-4 w-4 mr-2"
                style={{ color: '#DC2626' }}
              />
              Retry ({retryCount})
            </Button>
          </div>
          
          <div 
            className="mt-4 p-4 bg-red-100 rounded-md"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Typography 
              variant="body" 
              className="text-red-700 text-xs"
            >
              <strong>Troubleshooting:</strong><br />
              1. Check if you have admin permissions<br />
              2. Verify database connection<br />
              3. Ensure RBAC tables are seeded<br />
              4. Check browser console for detailed errors
            </Typography>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography 
            variant="h1" 
            className="text-3xl font-bold"
            style={{ color: 'var(--admin-text-primary)' }}
          >
            Roles & Permissions
          </Typography>
          <Typography 
            variant="body" 
            className="mt-2"
            style={{ color: 'var(--admin-text-secondary)' }}
          >
            Create roles, toggle permissions, and assign to users
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <ThemedIcon 
              icon={Search}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
              style={{ color: 'var(--admin-text-muted)' }}
            />
            <Input 
              placeholder="Search roles..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-60 pl-10"
              style={{
                backgroundColor: 'var(--admin-bg-secondary)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text-primary)'
              }}
            />
          </div>
          <Button 
            onClick={() => setCreateOpen(true)} 
            className="flex items-center space-x-2"
            style={{
              backgroundColor: 'var(--admin-accent)',
              color: 'white'
            }}
          >
            <ThemedIcon 
              icon={Plus}
              className="h-4 w-4"
              style={{ color: 'white' }}
            />
            <span>New Role</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('/api/admin/rbac/export?includeUsers=1', '_blank')}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--admin-text-primary)',
              borderColor: 'var(--admin-border)'
            }}
          >
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <Card 
          className="lg:col-span-1"
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardHeader>
            <CardTitle 
              className="flex items-center space-x-2"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              <ThemedIcon 
                icon={Shield}
                className="h-5 w-5" 
                style={{ color: 'var(--admin-accent)' }}
              />
              <span>Roles ({roles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <div className="text-center py-8">
                <ThemedIcon 
                  icon={Shield}
                  className="h-12 w-12 mx-auto mb-4"
                  style={{ color: 'var(--admin-text-muted)' }}
                />
                <Typography 
                  variant="body" 
                  className="mb-4"
                  style={{ color: 'var(--admin-text-secondary)' }}
                >
                  No roles found
                </Typography>
                <Button 
                  onClick={() => setCreateOpen(true)} 
                  size="sm"
                  style={{
                    backgroundColor: 'var(--admin-accent)',
                    color: 'white'
                  }}
                >
                  Create First Role
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => onSelectRole(r)} 
                    className={`w-full text-left px-3 py-3 rounded-md transition-all duration-200 ${
                      selected?.id === r.id ? 'ring-2 ring-orange-500' : 'border'
                    }`}
                    style={{
                      backgroundColor: selected?.id === r.id ? 'var(--admin-accent)' + '20' : 'transparent',
                      borderColor: selected?.id === r.id ? 'var(--admin-accent)' : 'var(--admin-border)',
                      color: 'var(--admin-text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (selected?.id !== r.id) {
                        e.currentTarget.style.backgroundColor = 'var(--admin-bg-secondary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selected?.id !== r.id) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <div 
                      className="font-medium"
                      style={{ 
                        color: selected?.id === r.id ? 'var(--admin-accent)' : 'var(--admin-text-primary)' 
                      }}
                    >
                      {r.name}
                    </div>
                    {r.description && (
                      <div 
                        className="text-xs mt-1"
                        style={{ color: 'var(--admin-text-secondary)' }}
                      >
                        {r.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{
                          backgroundColor: 'var(--admin-bg-secondary)',
                          color: 'var(--admin-text-primary)',
                          borderColor: 'var(--admin-border)'
                        }}
                      >
                        {r.permissionCount || 0} perms
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--admin-text-primary)',
                          borderColor: 'var(--admin-border)'
                        }}
                      >
                        {r.userCount || 0} users
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role detail */}
        <Card 
          className="lg:col-span-2"
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: 'var(--admin-text-primary)' }}>
              Role Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-center py-12">
                <ThemedIcon 
                  icon={Shield}
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: 'var(--admin-text-muted)' }}
                />
                <Typography 
                  variant="body"
                  style={{ color: 'var(--admin-text-secondary)' }}
                >
                  Select a role to edit permissions
                </Typography>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div 
                      className="text-lg font-semibold"
                      style={{ color: 'var(--admin-text-primary)' }}
                    >
                      {selected.name}
                    </div>
                    {selected.description && (
                      <div 
                        className="text-sm mt-1"
                        style={{ color: 'var(--admin-text-secondary)' }}
                      >
                        {selected.description}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-sm"
                    style={{
                      backgroundColor: 'var(--admin-bg-secondary)',
                      color: 'var(--admin-text-primary)',
                      borderColor: 'var(--admin-border)'
                    }}
                  >
                    {permissions.length} permissions
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Typography 
                    variant="h4" 
                    className="text-sm font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Permissions
                  </Typography>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1 border rounded-md p-3"
                    style={{
                      borderColor: 'var(--admin-border)',
                      backgroundColor: 'var(--admin-bg-secondary)'
                    }}
                  >
                    {allPermissions.map(key => (
                      <label 
                        key={key} 
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={permissions.includes(key)} 
                          onChange={() => togglePerm(key)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span 
                          className="text-sm"
                          style={{ color: 'var(--admin-text-primary)' }}
                        >
                          {key}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div 
                  className="flex items-center gap-2 pt-4 border-t"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <Button 
                    onClick={savePerms} 
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!selected}
                    style={{
                      backgroundColor: 'var(--admin-accent)',
                      color: 'white'
                    }}
                  >
                    Save Permissions
                  </Button>
                  <a 
                    href={`/admin/rbac/effective?role=${encodeURIComponent(selected.name)}`} 
                    className="text-sm underline"
                    style={{ 
                      color: 'var(--admin-accent)',
                      textDecorationColor: 'var(--admin-accent)'
                    }}
                  >
                    View effective access
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create role modal */}
      {createOpen && (
        <Card 
          className="p-6 space-y-4 border-orange-200"
          style={{
            backgroundColor: 'var(--admin-accent)' + '10',
            borderColor: 'var(--admin-accent)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <div className="flex items-center space-x-2">
            <ThemedIcon 
              icon={Plus}
              className="h-5 w-5" 
              style={{ color: 'var(--admin-accent)' }}
            />
            <Typography 
              variant="h3" 
              className="text-lg font-semibold"
              style={{ color: 'var(--admin-accent)' }}
            >
              Create New Role
            </Typography>
          </div>
          
          <div className="space-y-3">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Role Name *
              </label>
              <Input 
                placeholder="e.g., Content Manager, Support Lead" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="w-full"
                style={{
                  backgroundColor: 'var(--admin-bg-secondary)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)'
                }}
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--admin-text-primary)' }}
              >
                Description (Optional)
              </label>
              <Input 
                placeholder="Brief description of this role's purpose" 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
                className="w-full"
                style={{
                  backgroundColor: 'var(--admin-bg-secondary)',
                  borderColor: 'var(--admin-border)',
                  color: 'var(--admin-text-primary)'
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={createRole} 
              disabled={!newName.trim()}
              className="bg-orange-600 hover:bg-orange-700"
              style={{
                backgroundColor: 'var(--admin-accent)',
                color: 'white'
              }}
            >
              Create Role
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setCreateOpen(false)}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--admin-text-primary)',
                borderColor: 'var(--admin-border)'
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}