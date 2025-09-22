'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function OrderItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-white/20 bg-white/5">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* Thumbnail skeleton */}
        <div className="w-16 h-16 bg-white/10 rounded-lg flex-shrink-0">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4 bg-white/20" />
          <Skeleton className="h-3 w-1/2 bg-white/15" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <Skeleton className="h-6 w-16 bg-white/20" />
        <Skeleton className="h-8 w-24 bg-white/20" />
      </div>
    </div>
  )
}
