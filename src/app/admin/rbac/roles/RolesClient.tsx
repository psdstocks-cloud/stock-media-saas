'use client'

import { useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, RefreshCw, Shield, Plus, Search } from 'lucide-react'

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <Typography variant="body" className="text-gray-600">
              Loading roles and permissions...
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-orange-600" />
          <div>
            <Typography variant="h1" className="text-3xl font-bold">Roles & Permissions</Typography>
            <Typography variant="body" className="text-gray-600">Error loading roles</Typography>
          </div>
        </div>

        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <Typography variant="h3" className="text-red-700 font-semibold">
                  Failed to load roles
                </Typography>
                <Typography variant="body" className="text-red-600 text-sm mt-1">
                  {error}
                </Typography>
              </div>
            </div>
            <Button 
              onClick={handleRetry}
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry ({retryCount})
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-red-100 rounded-md">
            <Typography variant="body" className="text-red-700 text-xs">
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-3xl font-bold">Roles & Permissions</Typography>
          <Typography variant="body" className="text-gray-600 mt-2">Create roles, toggle permissions, and assign to users</Typography>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search roles..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-60 pl-10" 
            />
          </div>
          <Button onClick={() => setCreateOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Role</span>
          </Button>
          <Button variant="outline" onClick={() => window.open('/api/admin/rbac/export?includeUsers=1', '_blank')}>
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Roles ({roles.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="body" className="text-gray-600 mb-4">
                  No roles found
                </Typography>
                <Button onClick={() => setCreateOpen(true)} size="sm">
                  Create First Role
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map(r => (
                  <button 
                    key={r.id} 
                    onClick={() => onSelectRole(r)} 
                    className={`w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors ${
                      selected?.id === r.id ? 'ring-2 ring-orange-500 bg-orange-50' : 'border border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{r.name}</div>
                    {r.description && (
                      <div className="text-xs text-gray-500 mt-1">{r.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {r.permissionCount || 0} perms
                      </Badge>
                      <Badge variant="outline" className="text-xs">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <Typography variant="body" className="text-gray-600">
                  Select a role to edit permissions
                </Typography>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{selected.name}</div>
                    {selected.description && (
                      <div className="text-sm text-gray-600 mt-1">{selected.description}</div>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {permissions.length} permissions
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Typography variant="h4" className="text-sm font-medium text-gray-700">
                    Permissions
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-auto pr-1 border rounded-md p-3">
                    {allPermissions.map(key => (
                      <label 
                        key={key} 
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          checked={permissions.includes(key)} 
                          onChange={() => togglePerm(key)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button 
                    onClick={savePerms} 
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!selected}
                  >
                    Save Permissions
                  </Button>
                  <a 
                    href={`/admin/rbac/effective?role=${encodeURIComponent(selected.name)}`} 
                    className="text-sm text-orange-600 hover:text-orange-700 underline"
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
        <Card className="p-6 space-y-4 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-orange-600" />
            <Typography variant="h3" className="text-lg font-semibold text-orange-800">
              Create New Role
            </Typography>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <Input 
                placeholder="e.g., Content Manager, Support Lead" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <Input 
                placeholder="Brief description of this role's purpose" 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={createRole} 
              disabled={!newName.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Create Role
            </Button>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}