'use client'

import { CheckCircle, Wrench, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface WebsiteStatusBadgeProps {
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DISABLED'
  maintenanceMessage?: string
  className?: string
}

export default function WebsiteStatusBadge({ 
  status, 
  maintenanceMessage, 
  className = '' 
}: WebsiteStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'AVAILABLE':
        return {
          icon: CheckCircle,
          text: 'Available',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
          iconClassName: 'text-green-600 dark:text-green-400'
        }
      case 'MAINTENANCE':
        return {
          icon: Wrench,
          text: 'Maintenance',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
          iconClassName: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'DISABLED':
        return {
          icon: XCircle,
          text: 'Unavailable',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
          iconClassName: 'text-red-600 dark:text-red-400'
        }
      default:
        return {
          icon: AlertCircle,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
          iconClassName: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${config.className} text-xs font-medium`}
      >
        <Icon className={`w-3 h-3 mr-1 ${config.iconClassName}`} />
        {config.text}
      </Badge>
      {status === 'MAINTENANCE' && maintenanceMessage && (
        <div className="group relative">
          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap z-10 transition-opacity duration-200">
            {maintenanceMessage}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
          </div>
        </div>
      )}
    </div>
  )
}
