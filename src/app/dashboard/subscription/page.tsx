'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle } from 'lucide-react'

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your subscription plan and billing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Free Plan</h3>
              <p className="text-gray-600">100 points included</p>
            </div>
            <Badge>Active</Badge>
          </div>
          <Button className="mt-4">
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

