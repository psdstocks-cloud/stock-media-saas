'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Menu, X, Shield, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings,
  CheckSquare,
  Flag,
  MessageSquare,
  Globe,
  Activity,
  UserCheck
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Support Tickets', href: '/admin/tickets', icon: MessageSquare },
  { name: 'Approvals', href: '/admin/approvals', icon: CheckSquare },
  { name: 'RBAC Roles', href: '/admin/rbac', icon: Shield },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
  { name: 'Website Status', href: '/admin/website-status', icon: Globe },
  { name: 'Permissions Coverage', href: '/admin/permissions-coverage', icon: UserCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Feature Flags', href: '/admin/settings/feature-flags', icon: Flag },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/'
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-80 h-full max-w-none m-0 p-0 border-0">
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-orange-600" />
                <span className="ml-2 font-bold text-gray-900">Admin Panel</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-orange-600 text-white hover:bg-orange-700"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t p-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
