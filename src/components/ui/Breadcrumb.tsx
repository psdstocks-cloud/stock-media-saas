'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm text-gray-500', className)}
      aria-label="Breadcrumb"
    >
      <Link 
        href="/" 
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home size={16} className="mr-1" />
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          {item.current ? (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          ) : item.href ? (
            <Link 
              href={item.href}
              className="hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  dashboard: [
    { label: 'Dashboard', current: true }
  ],
  browse: [
    { label: 'Browse', current: true }
  ],
  search: (query: string) => [
    { label: 'Browse', href: '/dashboard/browse' },
    { label: `Search: "${query}"`, current: true }
  ],
  category: (category: string) => [
    { label: 'Browse', href: '/dashboard/browse' },
    { label: category, current: true }
  ],
  profile: [
    { label: 'Profile', current: true }
  ],
  settings: [
    { label: 'Settings', current: true }
  ],
  downloads: [
    { label: 'My Downloads', current: true }
  ],
  favorites: [
    { label: 'Favorites', current: true }
  ]
} as const
