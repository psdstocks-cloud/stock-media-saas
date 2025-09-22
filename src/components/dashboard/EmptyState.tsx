'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { 
  Link as LinkIcon, 
  FileImage, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface EmptyStateProps {
  type: 'no-urls' | 'no-items' | 'all-failed' | 'all-ordered'
  onAction?: () => void
  actionText?: string
}

export default function EmptyState({ type, onAction, actionText }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-urls':
        return {
          icon: <LinkIcon className="h-12 w-12 text-white/40" />,
          title: 'No URLs Entered',
          description: 'Paste your stock media URLs above to get started',
          actionText: actionText || 'Enter URLs',
          showAction: true
        }
      
      case 'no-items':
        return {
          icon: <FileImage className="h-12 w-12 text-white/40" />,
          title: 'No Items to Display',
          description: 'Your processed links will appear here once you enter some URLs',
          actionText: actionText || 'Add URLs',
          showAction: true
        }
      
      case 'all-failed':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-400" />,
          title: 'All URLs Failed to Process',
          description: 'None of the URLs could be processed. Please check the URLs and try again.',
          actionText: actionText || 'Try Again',
          showAction: true
        }
      
      case 'all-ordered':
        return {
          icon: <FileImage className="h-12 w-12 text-green-400" />,
          title: 'All Items Ordered',
          description: 'All your items have been successfully ordered and are being processed.',
          actionText: actionText || 'Add More URLs',
          showAction: true
        }
      
      default:
        return {
          icon: <FileImage className="h-12 w-12 text-white/40" />,
          title: 'No Items',
          description: 'No items to display',
          actionText: actionText || 'Refresh',
          showAction: false
        }
    }
  }

  const { icon, title, description, actionText: text, showAction } = getContent()

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          {icon}
        </div>
        
        <Typography variant="h3" className="text-white mb-2">
          {title}
        </Typography>
        
        <Typography variant="body" className="text-white/70 mb-6 max-w-md">
          {description}
        </Typography>
        
        {showAction && onAction && (
          <Button
            onClick={onAction}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {text}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
