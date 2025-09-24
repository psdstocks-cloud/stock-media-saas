'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, LogOut, CreditCard, History, ShoppingCart, Download } from 'lucide-react'

export default function UserMenu() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/verify-token')
        if (res.ok) {
          const data = await res.json()
          if (data?.user) setUser(data.user)
        }
      } catch (_err) {
        // Ignore network/auth errors silently for unauthenticated users
        return
      }
    }
    check()
  }, [])

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="inline-flex items-center">
          <div className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mr-2">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{user.name || 'Account'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
        <DropdownMenuItem onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => (window.location.href = '/login'))}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


