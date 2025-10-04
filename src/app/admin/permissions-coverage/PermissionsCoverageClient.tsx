'use client'

import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Complete coverage for all your admin pages
const COVERAGE: { area: string; route: string; permissions: string[]; description: string }[] = [
  { 
    area: 'Dashboard', 
    route: '/admin/dashboard', 
    permissions: [], 
    description: 'Admin overview and analytics' 
  },
  { 
    area: 'Users', 
    route: '/admin/users', 
    permissions: ['users.view', 'users.edit'], 
    description: 'User account management' 
  },
  { 
    area: 'Orders', 
    route: '/admin/orders', 
    permissions: ['orders.view', 'orders.manage'], 
    description: 'Order processing and management' 
  },
  { 
    area: 'Support Tickets', 
    route: '/admin/tickets', 
    permissions: ['tickets.manage'], 
    description: 'Customer support ticketing system' 
  },
  { 
    area: 'Approvals', 
    route: '/admin/approvals', 
    permissions: ['approvals.manage'], 
    description: 'Dual-control approval workflow' 
  },
  { 
    area: 'RBAC Roles', 
    route: '/admin/rbac', 
    permissions: ['settings.write'], 
    description: 'Role-based access control management' 
  },
  { 
    area: 'Audit Logs', 
    route: '/admin/audit-logs', 
    permissions: ['users.view'], 
    description: 'System activity audit trail' 
  },
  { 
    area: 'Website Status', 
    route: '/admin/website-status', 
    permissions: ['website_status.manage'], 
    description: 'Platform health monitoring' 
  },
  { 
    area: 'Permissions Coverage', 
    route: '/admin/permissions-coverage', 
    permissions: ['users.view'], 
    description: 'Permission analysis and coverage report' 
  },
  { 
    area: 'Settings', 
    route: '/admin/settings', 
    permissions: ['settings.write'], 
    description: 'System configuration and preferences' 
  },
  { 
    area: 'Feature Flags', 
    route: '/admin/settings/feature-flags', 
    permissions: ['flags.view', 'flags.manage'], 
    description: 'Feature toggle management' 
  },
]

export default function PermissionsCoverageClient() {
  const { permissions, has, loading, error, user } = useAdminPermissions()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-orange-600" />
          <div>
            <Typography variant="h1" className="text-2xl font-bold text-gray-900">
              Permissions Coverage
            </Typography>
            <Typography variant="body" className="text-gray-600">
              Loading permissions data...
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <Typography variant="body" className="text-gray-600">
              Analyzing permissions...
            </Typography>
          </div>
        </div>
      </div>
    )
  }

  // Safe conversion of permissions Set to Array
  const permissionsArray = permissions ? Array.from(permissions) : []
  
  // Calculate access stats
  const accessibleAreas = COVERAGE.filter(row => 
    row.permissions.length === 0 || row.permissions.some(p => has(p))
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        
        <div className="text-right">
          <Typography variant="body" className="text-sm text-gray-600">
            Logged in as: <span className="font-medium text-orange-600">{user?.email}</span>
          </Typography>
          <Typography variant="body" className="text-xs text-gray-500">
            Role: {user?.role}
          </Typography>
        </div>
      </div>

      {/* Error Display (if any) */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <Typography variant="body" className="text-yellow-800">
                  Using fallback permissions: {error}
                </Typography>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              {accessibleAreas}/{COVERAGE.length}
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
                        <div>
                          <div className="font-medium text-gray-900">{row.area}</div>
                          <div className="text-xs text-gray-500 mt-1">{row.description}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {row.route}
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="space-x-1">
                          {row.permissions.length === 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              No permissions required
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.permissions.map(p => (
                                <Badge key={p} variant="outline" className="text-xs">
                                  {p}
                                </Badge>
                              ))}
                            </div>
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
              <Typography variant="body" className="text-gray-600 mb-4">
                No explicit permissions found. Using role-based defaults.
              </Typography>
              <Typography variant="body" className="text-xs text-gray-500">
                Contact your system administrator if you believe this is incorrect.
              </Typography>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {permissionsArray.map(permission => (
                  <Badge key={permission} variant="secondary" className="text-xs font-mono">
                    {permission}
                  </Badge>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Typography variant="body" className="text-xs text-gray-500">
                  Total: {permissionsArray.length} permission{permissionsArray.length !== 1 ? 's' : ''} • Role: {user?.role}
                </Typography>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}