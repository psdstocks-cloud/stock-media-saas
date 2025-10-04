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
  Activity,
  UserCheck,
  Eye
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
    description: 'User Management'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Order Management'
  },
  {
    name: 'Support Tickets',
    href: '/admin/tickets',
    icon: MessageSquare,
    description: 'Customer Support'
  },
  {
    name: 'Approvals',
    href: '/admin/approvals',
    icon: CheckSquare,
    description: 'Dual-Control Approvals'
  },
  {
    name: 'RBAC Roles',
    href: '/admin/rbac',
    icon: Shield,
    description: 'Role Management'
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: Activity,
    description: 'System Audit Trail'
  },
  {
    name: 'Website Status',
    href: '/admin/website-status',
    icon: Globe,
    description: 'Site Health Monitor'
  },
  {
    name: 'Permissions Coverage',
    href: '/admin/permissions-coverage',
    icon: UserCheck,
    description: 'Permission Analysis'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System Configuration'
  },
  {
    name: 'Feature Flags',
    href: '/admin/settings/feature-flags',
    icon: Flag,
    description: 'Feature Toggles'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        window.location.href = '/'
      } else {
        // Fallback: clear cookies manually
        document.cookie = 'admin_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'admin_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Fallback: clear cookies and redirect
      document.cookie = 'admin_access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'admin_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.location.href = '/'
    }
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
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-auto py-3 px-3 rounded-lg",
                      isActive
                        ? "bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center w-full">
                      <item.icon className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-white" : "text-gray-500"
                      )} />
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium text-sm",
                          isActive ? "text-white" : "text-gray-900"
                        )}>
                          {item.name}
                        </div>
                        <div className={cn(
                          "text-xs mt-0.5",
                          isActive ? "text-orange-100" : "text-gray-500"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              )
            })}
          </nav>
          
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 py-3"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
