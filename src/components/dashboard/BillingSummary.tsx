'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { CreditCard, CalendarDays, ArrowRight } from 'lucide-react'

interface SubscriptionInfo {
  planName?: string
  status?: string
  nextBillingDate?: string
  pointsIncluded?: number
}

export default function BillingSummary() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('/api/subscription', { cache: 'no-store' as any })
        if (!res.ok) throw new Error('Failed to load subscription')
        const data = await res.json()
        setInfo({
          planName: data?.subscription?.plan?.name,
          status: data?.subscription?.status,
          nextBillingDate: data?.subscription?.nextBillingDate || data?.subscription?.currentPeriodEnd,
          pointsIncluded: data?.subscription?.plan?.points
        })
      } catch (e: any) {
        setError(e.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInfo()
  }, [])

  const openPortal = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data?.url) {
        window.location.href = data.url
      }
    } catch { /* no-op */ }
  }

  return (
    <Card className="surface-card shadow-2xl" aria-busy={isLoading}>
      <CardHeader>
        <CardTitle className="text-[hsl(var(--card-foreground))] flex items-center">
          <CreditCard className="h-5 w-5 mr-2" aria-hidden="true" />
          Billing Summary
        </CardTitle>
        <CardDescription>Current plan and next billing</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-48 bg-[hsl(var(--muted))] animate-pulse rounded" />
            <div className="h-3 w-64 bg-[hsl(var(--muted))] animate-pulse rounded" />
          </div>
        ) : error ? (
          <Typography variant="body" className="text-red-500 text-sm">{error}</Typography>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">Plan</div>
              <div className="text-base font-medium text-[hsl(var(--card-foreground))]">
                {info?.planName || 'No active plan'}
              </div>
              <div className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">
                Status: {info?.status || 'N/A'}
              </div>
              {info?.nextBillingDate && (
                <div className="text-xs mt-2 flex items-center text-[hsl(var(--muted-foreground))]">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  Next billing: {new Date(info.nextBillingDate).toLocaleDateString()}
                </div>
              )}
              {typeof info?.pointsIncluded === 'number' && (
                <div className="text-xs mt-1 text-[hsl(var(--muted-foreground))]">Includes {info.pointsIncluded} points / cycle</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={openPortal} variant="outline" title="Manage billing in Stripe portal">
                Manage Billing
              </Button>
              <Button onClick={() => (window.location.href = '/pricing')} className="bg-orange-600 hover:bg-orange-700 text-white" title="Buy more points">
                Buy Points <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


