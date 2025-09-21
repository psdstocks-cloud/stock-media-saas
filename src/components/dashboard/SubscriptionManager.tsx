'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Crown,
  Star,
  Zap,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  points: number
  rolloverLimit: number
  billingCycle: string
  isActive: boolean
}

interface Subscription {
  id: string
  planId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  nextBillingDate?: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  plan: SubscriptionPlan
}

interface BillingSummary {
  totalAmount: number
  totalTransactions: number
  statusBreakdown: Array<{
    status: string
    _count: { id: number }
    _sum: { amount: number }
  }>
}

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [subscriptionsRes, billingRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/billing')
      ])

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json()
        setSubscriptions(subscriptionsData.subscriptions || [])
      }

      if (billingRes.ok) {
        const billingData = await billingRes.json()
        setBillingSummary(billingData.summary)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      setError('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscriptionAction = async (subscriptionId: string, action: string, newPlanId?: string) => {
    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          action,
          newPlanId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          duration: 4000,
          icon: '✅'
        })
        await fetchData() // Refresh data
      } else {
        toast.error(data.error || 'Action failed', {
          duration: 5000,
          icon: '❌'
        })
      }
    } catch (error) {
      console.error('Error processing subscription action:', error)
      toast.error('Failed to process action', {
        duration: 5000,
        icon: '❌'
      })
    } finally {
      setIsProcessing(false)
    }
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>
      case 'CANCELED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Canceled</Badge>
      case 'PAST_DUE':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Past Due</Badge>
      case 'INCOMPLETE':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Incomplete</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('pro')) return Crown
    if (planName.toLowerCase().includes('team')) return Star
    return Zap
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'ACTIVE')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h3" className="text-white mb-2">
            Subscription Management
          </Typography>
          <Typography variant="body" className="text-white/60">
            Manage your subscription plans and billing
          </Typography>
        </div>
        <Button
          onClick={fetchData}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Subscription Status */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {React.createElement(getPlanIcon(activeSubscription.plan.name), {
                    className: "h-6 w-6 text-blue-400"
                  })}
                  <div>
                    <Typography variant="h5" className="text-white">
                      {activeSubscription.plan.name}
                    </Typography>
                    <Typography variant="body" className="text-white/60">
                      {activeSubscription.plan.description}
                    </Typography>
                  </div>
                </div>
                {getStatusBadge(activeSubscription.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <Typography variant="caption" className="text-white/60">
                    Monthly Cost
                  </Typography>
                  <Typography variant="h5" className="text-white">
                    {formatCurrency(activeSubscription.plan.price, activeSubscription.plan.currency)}
                  </Typography>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <Typography variant="caption" className="text-white/60">
                    Monthly Points
                  </Typography>
                  <Typography variant="h5" className="text-white">
                    {activeSubscription.plan.points.toLocaleString()}
                  </Typography>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <Typography variant="caption" className="text-white/60">
                    Next Billing
                  </Typography>
                  <Typography variant="h5" className="text-white">
                    {activeSubscription.nextBillingDate 
                      ? formatDate(activeSubscription.nextBillingDate)
                      : 'N/A'
                    }
                  </Typography>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {activeSubscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={() => handleSubscriptionAction(activeSubscription.id, 'reactivate')}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscriptionAction(activeSubscription.id, 'cancel')}
                    disabled={isProcessing}
                    variant="destructive"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <Typography variant="h5" className="text-white mb-2">
                Pay As You Go Plan
              </Typography>
              <Typography variant="body" className="text-white/60 mb-6">
                You are currently on the Pay As You Go plan. Purchase points as needed or explore subscription options for monthly savings.
              </Typography>
              <Button
                onClick={() => window.open('/pricing', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explore Subscription Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Billing Summary */}
      {billingSummary && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <Typography variant="caption" className="text-white/60">
                  Total Spent
                </Typography>
                <Typography variant="h5" className="text-white">
                  {formatCurrency(billingSummary.totalAmount)}
                </Typography>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <Typography variant="caption" className="text-white/60">
                  Total Transactions
                </Typography>
                <Typography variant="h5" className="text-white">
                  {billingSummary.totalTransactions}
                </Typography>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <Typography variant="caption" className="text-white/60">
                  Status Breakdown
                </Typography>
                <div className="space-y-1 mt-2">
                  {billingSummary.statusBreakdown.map((item) => (
                    <div key={item.status} className="flex justify-between text-sm">
                      <span className="text-white/80 capitalize">{item.status.toLowerCase()}</span>
                      <span className="text-white">{item._count.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
