'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { 
  Link as LinkIcon, 
  FileImage, 
  AlertCircle
} from 'lucide-react'

interface EmptyStateProps {
  type?: 'no-urls' | 'no-items' | 'all-failed' | 'all-ordered'
  onAction?: () => void
  actionText?: string
  title?: string
  description?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export default function EmptyState({ type = 'no-items', onAction, actionText, title: customTitle, description: customDesc, primaryCta, secondaryCta }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-urls':
        return {
          icon: <LinkIcon className="h-12 w-12 text-white/40" aria-hidden="true" />,
          title: 'No URLs Entered',
          description: 'Paste your stock media URLs above to get started',
          actionText: actionText || 'Enter URLs',
          showAction: true
        }
      
      case 'no-items':
        return {
          icon: <FileImage className="h-12 w-12 text-white/40" aria-hidden="true" />,
          title: 'No Items to Display',
          description: 'Your processed links will appear here once you enter some URLs',
          actionText: actionText || 'Add URLs',
          showAction: true
        }
      
      case 'all-failed':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-400" aria-hidden="true" />,
          title: 'All URLs Failed to Process',
          description: 'None of the URLs could be processed. Please check the URLs and try again.',
          actionText: actionText || 'Try Again',
          showAction: true
        }
      
      case 'all-ordered':
        return {
          icon: <FileImage className="h-12 w-12 text-green-400" aria-hidden="true" />,
          title: 'All Items Ordered',
          description: 'All your items have been successfully ordered and are being processed.',
          actionText: actionText || 'Add More URLs',
          showAction: true
        }
      
      default:
        return {
          icon: <FileImage className="h-12 w-12 text-white/40" aria-hidden="true" />,
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
          {customTitle || title}
        </Typography>
        
        <Typography variant="body" className="text-white/70 mb-6 max-w-md">
          {customDesc || description}
        </Typography>
        
        {showAction && onAction && (
          <Button
            onClick={onAction}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {text}
          </Button>
        )}
        {!onAction && (primaryCta || secondaryCta) && (
          <div className="flex gap-3 mt-2">
            {primaryCta && (
              <a href={primaryCta.href} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a href={secondaryCta.href} className="px-4 py-2 rounded-md border border-white/30 text-white hover:bg-white/10">
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
