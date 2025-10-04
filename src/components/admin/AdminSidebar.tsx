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
import { ThemedIcon } from './ThemedIcon'

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
      <div 
        className="flex flex-col flex-grow pt-5 overflow-y-auto border-r"
        style={{
          backgroundColor: 'var(--admin-bg-secondary)',
          borderColor: 'var(--admin-border)'
        }}
      >
        <div className="flex items-center flex-shrink-0 px-4">
          <ThemedIcon 
            icon={Shield}
            className="h-8 w-8" 
            style={{ color: 'var(--admin-accent)' }}
          />
          <Typography variant="h3" className="ml-2 font-bold" style={{ color: 'var(--admin-text-primary)' }}>
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
                      "w-full justify-start text-left h-auto py-3 px-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "shadow-sm"
                        : "hover:opacity-80"
                    )}
                    style={{
                      backgroundColor: isActive ? 'var(--admin-accent)' : 'transparent',
                      color: isActive ? 'white' : 'var(--admin-text-primary)',
                      border: isActive ? 'none' : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)'
                        e.currentTarget.style.borderColor = 'var(--admin-border)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = 'transparent'
                      }
                    }}
                  >
                    <div className="flex items-center w-full">
                      <ThemedIcon 
                        icon={item.icon}
                        className="mr-3 h-5 w-5 flex-shrink-0"
                        style={{ color: isActive ? 'white' : 'var(--admin-text-secondary)' }}
                      />
                      <div className="flex-1 text-left">
                        <div 
                          className="font-medium text-sm"
                          style={{ 
                            color: isActive ? 'white' : 'var(--admin-text-primary)' 
                          }}
                        >
                          {item.name}
                        </div>
                        <div 
                          className="text-xs mt-0.5"
                          style={{ 
                            color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--admin-text-muted)' 
                          }}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              )
            })}
          </nav>
          
          <div 
            className="flex-shrink-0 border-t p-4"
            style={{ borderColor: 'var(--admin-border)' }}
          >
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start py-3 transition-all duration-200"
              style={{
                color: '#EF4444',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2'
                e.currentTarget.style.color = '#DC2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#EF4444'
              }}
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
