'use client'

import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, XCircle, Shield, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemedIcon } from '@/components/admin/ThemedIcon'

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
          <ThemedIcon 
            icon={Shield}
            className="h-8 w-8" 
            style={{ color: 'var(--admin-accent)' }}
          />
          <div>
            <Typography 
              variant="h1" 
              className="text-2xl font-bold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Permissions Coverage
            </Typography>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Loading permissions data...
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
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
          <ThemedIcon 
            icon={Shield}
            className="h-8 w-8" 
            style={{ color: 'var(--admin-accent)' }}
          />
          <div>
            <Typography 
              variant="h1" 
              className="text-2xl font-bold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Permissions Coverage
            </Typography>
            <Typography 
              variant="body"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Review required permissions for each admin area and your current access levels
            </Typography>
          </div>
        </div>
        
        <div className="text-right">
          <Typography 
            variant="body" 
            className="text-sm"
            style={{ color: 'var(--admin-text-secondary)' }}
          >
            Logged in as: <span 
              className="font-medium"
              style={{ color: 'var(--admin-accent)' }}
            >
              {user?.email}
            </span>
          </Typography>
          <Typography 
            variant="body" 
            className="text-xs"
            style={{ color: 'var(--admin-text-muted)' }}
          >
            Role: {user?.role}
          </Typography>
        </div>
      </div>

      {/* Error Display (if any) */}
      {error && (
        <Card 
          className="border-yellow-200 bg-yellow-50"
          style={{
            backgroundColor: '#FEF3C7',
            borderColor: '#FDE68A',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <Typography 
                  variant="body" 
                  className="text-yellow-800"
                >
                  Using fallback permissions: {error}
                </Typography>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <ThemedIcon 
                  icon={RefreshCw}
                  className="h-4 w-4 mr-2"
                  style={{ color: '#D97706' }}
                />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Total Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              {COVERAGE.length}
            </div>
            <p 
              className="text-xs"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Admin sections
            </p>
          </CardContent>
        </Card>
        
        <Card
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Your Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--admin-accent)' }}
            >
              {permissionsArray.length}
            </div>
            <p 
              className="text-xs"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Active permissions
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            backgroundColor: 'var(--admin-bg-card)',
            borderColor: 'var(--admin-border)',
            color: 'var(--admin-text-primary)'
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle 
              className="text-sm font-medium"
              style={{ color: 'var(--admin-text-primary)' }}
            >
              Access Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-2xl font-bold"
              style={{ color: '#10B981' }}
            >
              {accessibleAreas}/{COVERAGE.length}
            </div>
            <p 
              className="text-xs"
              style={{ color: 'var(--admin-text-secondary)' }}
            >
              Areas accessible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Table */}
      <Card
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)'
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'var(--admin-text-primary)' }}>
            Admin Areas & Required Permissions
          </CardTitle>
          <CardDescription style={{ color: 'var(--admin-text-secondary)' }}>
            Overview of all administrative areas and their permission requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr 
                  className="border-b"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <th 
                    className="text-left p-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Area
                  </th>
                  <th 
                    className="text-left p-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Route
                  </th>
                  <th 
                    className="text-left p-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Required Permissions
                  </th>
                  <th 
                    className="text-left p-3 font-medium"
                    style={{ color: 'var(--admin-text-primary)' }}
                  >
                    Your Access
                  </th>
                </tr>
              </thead>
              <tbody>
                {COVERAGE.map((row, index) => {
                  const hasAccess = row.permissions.length === 0 || row.permissions.some(p => has(p))
                  
                  return (
                    <tr 
                      key={row.route} 
                      className="border-b"
                      style={{ 
                        borderColor: 'var(--admin-border)',
                        backgroundColor: index % 2 === 0 ? 'var(--admin-bg-secondary)' : 'var(--admin-bg-card)'
                      }}
                    >
                      <td className="p-3">
                        <div>
                          <div 
                            className="font-medium"
                            style={{ color: 'var(--admin-text-primary)' }}
                          >
                            {row.area}
                          </div>
                          <div 
                            className="text-xs mt-1"
                            style={{ color: 'var(--admin-text-secondary)' }}
                          >
                            {row.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <code 
                          className="text-xs px-2 py-1 rounded font-mono"
                          style={{ 
                            backgroundColor: 'var(--admin-bg-secondary)',
                            color: 'var(--admin-text-primary)',
                            border: '1px solid var(--admin-border)'
                          }}
                        >
                          {row.route}
                        </code>
                      </td>
                      <td className="p-3">
                        <div className="space-x-1">
                          {row.permissions.length === 0 ? (
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{
                                backgroundColor: 'var(--admin-bg-secondary)',
                                color: 'var(--admin-text-primary)',
                                borderColor: 'var(--admin-border)'
                              }}
                            >
                              No permissions required
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {row.permissions.map(p => (
                                <Badge 
                                  key={p} 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: 'transparent',
                                    color: 'var(--admin-text-primary)',
                                    borderColor: 'var(--admin-border)'
                                  }}
                                >
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
                              <Badge 
                                variant="default" 
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                Access Granted
                              </Badge>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <Badge 
                                variant="destructive" 
                                className="text-xs"
                              >
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
      <Card
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          borderColor: 'var(--admin-border)',
          color: 'var(--admin-text-primary)'
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: 'var(--admin-text-primary)' }}>
            Your Effective Permissions
          </CardTitle>
          <CardDescription style={{ color: 'var(--admin-text-secondary)' }}>
            Complete list of permissions currently assigned to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionsArray.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle 
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: 'var(--admin-text-muted)' }}
              />
              <Typography 
                variant="body" 
                className="mb-4"
                style={{ color: 'var(--admin-text-secondary)' }}
              >
                No explicit permissions found. Using role-based defaults.
              </Typography>
              <Typography 
                variant="body" 
                className="text-xs"
                style={{ color: 'var(--admin-text-muted)' }}
              >
                Contact your system administrator if you believe this is incorrect.
              </Typography>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {permissionsArray.map(permission => (
                  <Badge 
                    key={permission} 
                    variant="secondary" 
                    className="text-xs font-mono"
                    style={{
                      backgroundColor: 'var(--admin-bg-secondary)',
                      color: 'var(--admin-text-primary)',
                      borderColor: 'var(--admin-border)'
                    }}
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
              <div 
                className="pt-4 border-t"
                style={{ borderColor: 'var(--admin-border)' }}
              >
                <Typography 
                  variant="body" 
                  className="text-xs"
                  style={{ color: 'var(--admin-text-muted)' }}
                >
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