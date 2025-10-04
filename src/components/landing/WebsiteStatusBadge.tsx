'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

interface WebsiteStatusBadgeProps {
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DISABLED'
  maintenanceMessage?: string
  className?: string
}

const STATUS_CONFIG = {
  AVAILABLE: {
    icon: CheckCircle2,
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    label: 'Available'
  },
  MAINTENANCE: {
    icon: Clock,
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    label: 'Maintenance'
  },
  DISABLED: {
    icon: XCircle,
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'Disabled'
  }
}

export default function WebsiteStatusBadge({ 
  status, 
  maintenanceMessage, 
  className = '' 
}: WebsiteStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
      {status === 'MAINTENANCE' && maintenanceMessage && (
        <div className="group relative">
          <AlertTriangle className="w-3 h-3 text-yellow-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
            {maintenanceMessage}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}