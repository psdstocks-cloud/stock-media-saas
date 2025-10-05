'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard,
  Search,
  Download,
  ShoppingCart,
  Coins,
  CreditCard,
  Settings,
  Key,
  HelpCircle,
  ChevronLeft,
  X,
  Menu
} from 'lucide-react'

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  userPoints?: number
}

const dashboardMenuItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard home'
  },
  {
    title: 'Browse Media',
    href: '/dashboard/browse',
    icon: Search,
    description: 'Search stock assets'
  },
  {
    title: 'My Downloads',
    href: '/dashboard/downloads',
    icon: Download,
    description: 'Download history'
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    description: 'Order management'
  },
  {
    title: 'Points & Billing',
    href: '/dashboard/points',
    icon: Coins,
    description: 'Points and usage'
  },
  {
    title: 'Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
    description: 'Manage plan'
  },
  {
    title: 'API Keys',
    href: '/dashboard/api-keys',
    icon: Key,
    description: 'API management'
  },
  {
    title: 'Account Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Profile & preferences'
  },
  {
    title: 'Support',
    href: '/dashboard/support',
    icon: HelpCircle,
    description: 'Help & contact'
  }
]

export default function DashboardSidebar({ isOpen, onToggle, onClose, userPoints = 0 }: DashboardSidebarProps) {
  const pathname = usePathname()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('dashboard-sidebar')
      const menuButton = document.getElementById('dashboard-menu-button')
      
      if (isOpen && sidebar && menuButton && 
          !sidebar.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`
          fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Points Display */}
          <div className="p-4 border-b border-gray-100">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Available Points</div>
                  <div className="text-lg font-bold text-orange-600">{userPoints}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {dashboardMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      // Close mobile menu when item is clicked
                      if (window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div>{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Stock Media SaaS</div>
              <div>Version 2.0.0</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
