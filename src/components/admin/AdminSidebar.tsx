'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings,
  LogOut,
  Shield,
  CheckSquare,
  Flag,
  MessageSquare,
  Globe,
  Activity
} from 'lucide-react'
import { useAdminPermissions } from '@/lib/hooks/useAdminPermissions'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'users.view',
    description: 'User Management'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: 'orders.view',
  },
  {
    name: 'Support Tickets',
    href: '/admin/tickets',
    icon: MessageSquare,
    permission: 'tickets.view',
  },
  {
    name: 'Approvals',
    href: '/admin/approvals',
    icon: CheckSquare,
    permission: 'approvals.manage',
  },
  {
    name: 'RBAC Roles',
    href: '/admin/rbac',
    icon: Shield,
    permission: 'rbac.manage',
  },
  {
    name: 'Effective Perms',
    href: '/admin/rbac/effective',
    icon: Shield,
    permission: 'users.view',
  },
  {
    name: 'Permissions',
    href: '/admin/permissions-coverage',
    icon: Shield,
    permission: 'users.view',
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: Shield,
    permission: 'users.view',
  },
  {
    name: 'Website Status',
    href: '/admin/website-status',
    icon: Globe,
    permission: 'settings.write',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.write',
  },
  {
    name: 'Feature Flags',
    href: '/admin/settings/feature-flags',
    icon: Flag,
    permission: 'flags.view',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { has, loading, permissions } = useAdminPermissions()

  const handleLogout = () => {
    // Clear auth token and redirect to login
    document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.href = '/admin/login'
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Shield className="h-8 w-8 text-primary" />
          <Typography variant="h3" className="ml-2 font-bold">
            Admin Panel
          </Typography>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation
              .filter(item => (!item.permission || has(item.permission)) || (!permissions && !loading))
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} aria-disabled={item.permission ? !has(item.permission) : false}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left h-auto py-3 px-3",
                        isActive
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      )}
                      disabled={item.permission ? !has(item.permission) : false}
                    >
                      <div className="flex items-center w-full">
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{item.name}</div>
                          {item.description && (
                            <div className={cn(
                              "text-xs mt-0.5",
                              isActive ? "text-orange-100" : "text-gray-500"
                            )}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            {loading && (
              <div className="text-xs text-muted-foreground px-2">Loading permissions…</div>
            )}
          </nav>
          
          <div className="flex-shrink-0 flex border-t border-border p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
