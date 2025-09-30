'use client'

import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  Clock
} from 'lucide-react'
// Define the OrderStatus type locally to avoid circular imports
type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED' | 'INITIAL' | 'LOADING_INFO'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: 'Pending',
          className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        }
      case 'PROCESSING':
        return {
          icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
          text: 'Processing',
          className: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        }
      case 'READY':
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: 'Ready',
          className: 'bg-green-500/20 text-green-300 border-green-500/30'
        }
      case 'FAILED':
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          text: 'Failed',
          className: 'bg-red-500/20 text-red-300 border-red-500/30'
        }
      default:
        return {
          icon: null,
          text: 'Unknown',
          className: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        }
    }
  }

  const { icon, text, className: statusClassName } = getStatusConfig()

  return (
    <Badge className={`${statusClassName} ${className} transition-all duration-200 hover:scale-105`}>
      {icon}
      {text}
    </Badge>
  )
}
