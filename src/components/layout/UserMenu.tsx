'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, LogOut, CreditCard, History, ShoppingCart, Download } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
}

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to sign out:', error)
      window.location.href = '/'
    }
  }

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

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
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


