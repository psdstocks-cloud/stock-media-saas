'use client'

import { usePermissions } from '@/lib/hooks/usePermissions'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'

const COVERAGE: { area: string; route: string; permissions: string[] }[] = [
  { area: 'Users', route: '/admin/users', permissions: ['users.view', 'users.edit'] },
  { area: 'Orders', route: '/admin/orders', permissions: ['orders.view', 'orders.manage'] },
  { area: 'Settings', route: '/admin/settings', permissions: ['settings.write'] },
  { area: 'Feature Flags', route: '/admin/settings/feature-flags', permissions: ['flags.view', 'flags.manage'] },
  { area: 'Approvals', route: '/admin/approvals', permissions: ['approvals.manage'] },
]

export default function PermissionsCoverageClient() {
  const { permissions, has, loading, error } = usePermissions()

  return (
    <div className="p-6 space-y-6">
      <Typography variant="h2">Permissions Coverage</Typography>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Admin permissions coverage by screen</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left p-2">Area</th>
              <th scope="col" className="text-left p-2">Route</th>
              <th scope="col" className="text-left p-2">Required Permissions</th>
              <th scope="col" className="text-left p-2">Your Access</th>
            </tr>
          </thead>
          <tbody>
            {COVERAGE.map(row => (
              <tr key={row.route} className="border-b border-border">
                <th scope="row" className="p-2 font-medium">{row.area}</th>
                <td className="p-2">{row.route}</td>
                <td className="p-2 space-x-2">
                  {row.permissions.map(p => (
                    <Badge key={p} variant="secondary">{p}</Badge>
                  ))}
                </td>
                <td className="p-2 space-x-2">
                  {row.permissions.map(p => (
                    <Badge key={`${row.route}-${p}`} variant={has(p) ? 'success' : 'destructive'}>{has(p) ? 'Yes' : 'No'}</Badge>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-muted-foreground">
        Effective permissions: {permissions ? Array.from(permissions).join(', ') : '—'}
      </div>
    </div>
  )
}
