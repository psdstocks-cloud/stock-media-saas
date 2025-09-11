'use client'

import { DashboardPreview } from './ui/DashboardPreview'

interface DashboardPreviewWrapperProps {
  className?: string
}

export function DashboardPreviewWrapper({ className }: DashboardPreviewWrapperProps) {
  return <DashboardPreview className={className} />
}
