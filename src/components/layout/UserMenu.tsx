'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, LogOut, CreditCard, History, ShoppingCart, Download } from 'lucide-react'

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="inline-flex items-center relative z-[51]">
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mr-2">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">{user.name || 'Account'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg min-w-[200px] mt-2"
          sideOffset={5}
        >
        <DropdownMenuItem onClick={() => (window.location.href = '/dashboard')}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem onClick={() => (window.location.href = '/dashboard/order-v3')}>
          <ShoppingCart className="h-4 w-4 mr-2" /> Order from URL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => (window.location.href = '/dashboard/history-v3')}>
          <History className="h-4 w-4 mr-2" /> History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => (window.location.href = '/dashboard/billing')}>
          <CreditCard className="h-4 w-4 mr-2" /> Billing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => (window.location.href = '/dashboard/downloads')}>
          <Download className="h-4 w-4 mr-2" /> Downloads
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ redirect: false }).then(() => (window.location.href = '/'))}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


