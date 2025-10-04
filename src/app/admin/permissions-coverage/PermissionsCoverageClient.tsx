'use client'

import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle, Shield } from 'lucide-react'

// Complete coverage for all your admin pages
const COVERAGE: { area: string; route: string; permissions: string[] }[] = [
  { area: 'Dashboard', route: '/admin/dashboard', permissions: [] }, // Usually no permissions needed for dashboard
  { area: 'Users', route: '/admin/users', permissions: ['users.view', 'users.edit'] },
  { area: 'Orders', route: '/admin/orders', permissions: ['orders.view', 'orders.manage'] },
  { area: 'Support Tickets', route: '/admin/tickets', permissions: ['tickets.view'] },
  { area: 'Approvals', route: '/admin/approvals', permissions: ['approvals.manage'] },
  { area: 'RBAC Roles', route: '/admin/rbac', permissions: ['rbac.manage'] },
  { area: 'Audit Logs', route: '/admin/audit-logs', permissions: ['users.view'] },
  { area: 'Website Status', route: '/admin/website-status', permissions: ['settings.write'] },
  { area: 'Permissions Coverage', route: '/admin/permissions-coverage', permissions: ['users.view'] },
  { area: 'Settings', route: '/admin/settings', permissions: ['settings.write'] },
  { area: 'Feature Flags', route: '/admin/settings/feature-flags', permissions: ['flags.view', 'flags.manage'] },
]

export default function PermissionsCoverageClient() {
  const { permissions, has, loading, error } = useAdminPermissions()

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <Typography variant="body" className="text-gray-600">
              Loading permissions data...
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <Typography variant="body" className="text-red-700">
                Error loading permissions: {error}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Safe conversion of permissions Set to Array
  const permissionsArray = permissions ? Array.from(permissions) : []
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-orange-600" />
        <div>
          <Typography variant="h1" className="text-2xl font-bold text-gray-900">
            Permissions Coverage
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Review required permissions for each admin area and your current access levels
          </Typography>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{COVERAGE.length}</div>
            <p className="text-xs text-gray-600">Admin sections</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{permissionsArray.length}</div>
            <p className="text-xs text-gray-600">Active permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Access Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {COVERAGE.filter(row => row.permissions.length === 0 || row.permissions.some(p => has(p))).length}/{COVERAGE.length}
            </div>
            <p className="text-xs text-gray-600">Areas accessible</p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Areas & Required Permissions</CardTitle>
          <CardDescription>
            Overview of all administrative areas and their permission requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-gray-900">Area</th>
                  <th className="text-left p-3 font-medium text-gray-900">Route</th>
                  <th className="text-left p-3 font-medium text-gray-900">Required Permissions</th>
                  <th className="text-left p-3 font-medium text-gray-900">Your Access</th>
                </tr>
              </thead>
              <tbody>
                {COVERAGE.map((row, index) => {
                  const hasAccess = row.permissions.length === 0 || row.permissions.some(p => has(p))
                  
                  return (
                    <tr key={row.route} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{row.area}</div>
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.route}</code>
                      </td>
                      <td className="p-3">
                        <div className="space-x-1">
                          {row.permissions.length === 0 ? (
                            <Badge variant="secondary" className="text-xs">No permissions required</Badge>
                          ) : (
                            row.permissions.map(p => (
                              <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {hasAccess ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                Access Granted
                              </Badge>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <Badge variant="destructive" className="text-xs">
                                Access Denied
                              </Badge>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Effective Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Effective Permissions</CardTitle>
          <CardDescription>
            Complete list of permissions currently assigned to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionsArray.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="body" className="text-gray-600">
                No permissions found. Contact your system administrator.
              </Typography>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {permissionsArray.map(permission => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
              <Typography variant="body" className="text-xs text-gray-500 mt-4">
                Total: {permissionsArray.length} permission{permissionsArray.length !== 1 ? 's' : ''}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}