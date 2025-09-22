'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function PointsSkeleton() {
  return (
    <Card className="bg-indigo-700 text-white shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-32 bg-white/20" />
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <Skeleton className="h-12 w-24 mx-auto mb-2 bg-white/20" />
          <Skeleton className="h-4 w-16 mx-auto bg-white/15" />
        </div>
      </CardContent>
    </Card>
  )
}
