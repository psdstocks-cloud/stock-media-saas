import React from 'react'
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react'

interface WebsiteStatusBadgeProps {
  status: 'AVAILABLE' | 'MAINTENANCE' | 'DISABLED'
  maintenanceMessage?: string
}

export default function WebsiteStatusBadge({ status, maintenanceMessage }: WebsiteStatusBadgeProps) {
  switch (status) {
    case 'AVAILABLE':
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400 font-medium">Available</span>
        </div>
      )
    
    case 'MAINTENANCE':
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <Clock className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-medium">
            {maintenanceMessage ? 'Maintenance' : 'Maintenance'}
          </span>
        </div>
      )
    
    case 'DISABLED':
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
          <XCircle className="w-3 h-3 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Disabled</span>
        </div>
      )
    
    default:
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded-lg">
          <AlertTriangle className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Unknown</span>
        </div>
      )
  }
}