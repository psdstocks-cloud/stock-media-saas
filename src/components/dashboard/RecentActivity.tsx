'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Download, RotateCcw, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface RecentOrderItem {
  id: string
  title: string | null
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | string
  downloadUrl?: string | null
  createdAt: string
  stockSite?: { displayName?: string | null } | null
}

export default function RecentActivity() {
  const [items, setItems] = useState<RecentOrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/orders?limit=5&page=1', { cache: 'no-store' as any })
        if (!res.ok) throw new Error('Failed to load recent activity')
        const data = await res.json()
        if (data.success && Array.isArray(data.orders)) {
          setItems(data.orders)
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecent()
  }, [])

  const handleRedownload = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/regenerate-download`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && (data.downloadUrl || data.order?.downloadUrl)) {
        const url = data.downloadUrl || data.order.downloadUrl
        window.open(url, '_blank')
      }
    } catch {}
  }

  const handleRetry = async (orderId: string) => {
    // Simple retry: navigate user to Orders tab filtered, or re-open order page
    window.location.href = '/dashboard/order?retry=' + encodeURIComponent(orderId)
  }

  return (
    <Card className="surface-card shadow-2xl">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--card-foreground))]">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-[hsl(var(--muted))] animate-pulse rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center text-red-500 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            {error}
          </div>
        ) : items.length === 0 ? (
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">No recent activity</Typography>
        ) : (
          <ul className="divide-y divide-[hsl(var(--border))]">
            {items.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[hsl(var(--card-foreground))]">
                    {o.status === 'COMPLETED' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                    ) : o.status === 'FAILED' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                    )}
                    <span className="font-medium truncate max-w-[28ch]">
                      {o.title || o.stockSite?.displayName || 'Stock Item'}
                    </span>
                  </div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {new Date(o.createdAt).toLocaleString()} • {o.status}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {o.status === 'COMPLETED' && (
                    <Button size="sm" onClick={() => handleRedownload(o.id)} className="bg-green-600 hover:bg-green-700 text-white">
                      <Download className="h-4 w-4 mr-1" aria-hidden="true" />
                      Re-download
                    </Button>
                  )}
                  {o.status === 'FAILED' && (
                    <Button size="sm" variant="outline" onClick={() => handleRetry(o.id)}>
                      <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
                      Retry
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}


