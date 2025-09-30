'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  RefreshCw,
  ExternalLink,
  Crown,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  monthlyPoints: number
  rolloverPercentage: number
  features: string[]
  isPopular?: boolean
}

interface Subscription {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: SubscriptionPlan
}

interface SubscriptionManagementProps {
  className?: string
}

export function SubscriptionManagement({ className }: SubscriptionManagementProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUpgrading, setIsUpgrading] = useState(false)

  const fetchSubscriptionData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [subscriptionResponse, plansResponse] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/subscription-plans')
      ])

      if (subscriptionResponse.ok) {
        const subscriptionResult = await subscriptionResponse.json()
        setSubscription(subscriptionResult.subscription || subscriptionResult)
      } else {
        setError('Failed to fetch subscription data')
      }

      if (plansResponse.ok) {
        const plansResult = await plansResponse.json()
        setAvailablePlans(plansResult.plans || plansResult)
      }
    } catch (error) {
      setError('An error occurred while fetching subscription data')
      console.error('Subscription fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'CANCELED':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Canceled</Badge>
      case 'PAST_DUE':
        return <Badge className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Past Due</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.url) {
          window.open(result.url, '_blank')
        }
      } else {
        toast.error('Failed to open billing portal')
      }
    } catch (error) {
      toast.error('An error occurred while opening billing portal')
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!subscription) return

    setIsUpgrading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: planId,
          mode: 'subscription'
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.url) {
          window.location.href = result.url
        }
      } else {
        toast.error('Failed to start upgrade process')
      }
    } catch (error) {
      toast.error('An error occurred while upgrading')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to your points and features at the end of the current billing period.')) {
      return
    }

    try {
      const response = await fetch('/api/subscription', {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Subscription canceled successfully')
        fetchSubscriptionData()
      } else {
        toast.error('Failed to cancel subscription')
      }
    } catch (error) {
      toast.error('An error occurred while canceling subscription')
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={fetchSubscriptionData}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptionData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : subscription ? (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <Typography variant="body" className="font-semibold">
                      {subscription.plan.name}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {subscription.plan.monthlyPoints} points/month
                    </Typography>
                  </div>
                </div>
                {getStatusBadge(subscription.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Typography variant="caption" color="muted">
                    Monthly Cost
                  </Typography>
                  <Typography variant="body" className="font-semibold">
                    {formatCurrency(subscription.plan.price)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="muted">
                    Rollover
                  </Typography>
                  <Typography variant="body" className="font-semibold">
                    {subscription.plan.rolloverPercentage}%
                  </Typography>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="caption" color="muted">
                    Next billing: {formatDate(subscription.currentPeriodEnd)}
                  </Typography>
                  {subscription.cancelAtPeriodEnd && (
                    <Typography variant="caption" className="text-red-500 block">
                      Cancels at period end
                    </Typography>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageBilling}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              </div>
            </div>

            {/* Plan Features */}
            <div>
              <Typography variant="body" className="font-medium mb-3">
                Plan Features
              </Typography>
              <div className="space-y-2">
                {subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Typography variant="caption">{feature}</Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Plans */}
            {availablePlans.length > 0 && (
              <div>
                <Typography variant="body" className="font-medium mb-4">
                  Available Plans
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePlans
                    .filter(plan => plan.id !== subscription.plan.id)
                    .map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4 relative">
                      {plan.isPopular && (
                        <Badge className="absolute -top-2 left-4 bg-primary">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      <div className="mb-3">
                        <Typography variant="body" className="font-semibold">
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" className="font-bold">
                          {formatCurrency(plan.price)}
                          <Typography variant="caption" color="muted" className="font-normal">
                            /month
                          </Typography>
                        </Typography>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                          <Typography variant="caption">
                            {plan.monthlyPoints} points/month
                          </Typography>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Typography variant="caption">
                            {plan.rolloverPercentage}% rollover
                          </Typography>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isUpgrading}
                      >
                        {plan.price > subscription.plan.price ? 'Upgrade' : 'Downgrade'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel Subscription */}
            {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelSubscription}
                  className="w-full"
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Typography variant="h3" className="mb-2">
              No Active Subscription
            </Typography>
            <Typography variant="body" color="muted" className="mb-4">
              You don't have an active subscription. Choose a plan to get started.
            </Typography>
            
            {/* Available Plans for New Users */}
            {availablePlans.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {availablePlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4 relative">
                    {plan.isPopular && (
                      <Badge className="absolute -top-2 left-4 bg-primary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    <div className="mb-3">
                      <Typography variant="body" className="font-semibold">
                        {plan.name}
                      </Typography>
                      <Typography variant="h4" className="font-bold">
                        {formatCurrency(plan.price)}
                        <Typography variant="caption" color="muted" className="font-normal">
                          /month
                        </Typography>
                      </Typography>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Typography variant="caption">
                        {plan.monthlyPoints} points/month
                      </Typography>
                      <Typography variant="caption">
                        {plan.rolloverPercentage}% rollover
                      </Typography>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isUpgrading}
                    >
                      Subscribe
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SubscriptionManagement
