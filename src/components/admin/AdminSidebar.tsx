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
  Shield
} from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'users.view',
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: 'orders.view',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.write',
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { has, loading } = usePermissions()

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
              .filter(item => !item.permission || has(item.permission))
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} aria-disabled={item.permission ? !has(item.permission) : false}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      disabled={item.permission ? !has(item.permission) : false}
                    >
                      <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                      {item.name}
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
