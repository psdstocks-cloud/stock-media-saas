'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  ExternalLink, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface Subscription {
  id: string
  planName: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  pointsIncluded: number
  pointsUsed: number
  price: number
}

interface BillingInfo {
  subscription: Subscription | null
  pointsBalance: number
  totalSpent: number
  nextBillingDate: string | null
}

export function BillingManager() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [error, setError] = useState('')
  const [_success, _setSuccess] = useState('')

  const fetchBillingInfo = async () => {
    setIsLoading(true)
    setError('')
    try {
      // Fetch subscription info
      const subscriptionResponse = await fetch('/api/subscription')
      const subscriptionData = await subscriptionResponse.ok ? await subscriptionResponse.json() : null

      // Fetch points balance
      const pointsResponse = await fetch('/api/points')
      const pointsData = await pointsResponse.ok ? await pointsResponse.json() : { currentPoints: 0, totalUsed: 0 }

      setBillingInfo({
        subscription: subscriptionData?.subscription || null,
        pointsBalance: pointsData.currentPoints || 0,
        totalSpent: pointsData.totalUsed || 0,
        nextBillingDate: subscriptionData?.subscription?.currentPeriodEnd || null
      })
    } catch (error) {
      setError('Failed to load billing information')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingInfo()
  }, [])

  const handleManageBilling = async () => {
    setIsLoadingPortal(true)
    setError('')
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        } else {
          setError('Failed to generate billing portal URL')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to access billing portal')
      }
    } catch (error) {
      setError('An error occurred while accessing billing portal')
    } finally {
      setIsLoadingPortal(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'past_due':
        return <Badge className="bg-red-500">Past Due</Badge>
      case 'unpaid':
        return <Badge className="bg-red-500">Unpaid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="text-2xl font-bold">
            Billing & Subscription
          </Typography>
          <Typography variant="body" color="muted" className="mt-1">
            Manage your subscription, billing information, and payment methods
          </Typography>
        </div>
        <Button
          onClick={handleManageBilling}
          disabled={isLoadingPortal}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          {isLoadingPortal ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          {isLoadingPortal ? 'Loading...' : 'Manage Billing'}
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Current Subscription</span>
          </CardTitle>
          <CardDescription>
            Your current subscription plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ) : billingInfo?.subscription ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" className="text-xl font-semibold">
                    {billingInfo.subscription.planName}
                  </Typography>
                  <Typography variant="body" color="muted" className="mt-1">
                    {formatCurrency(billingInfo.subscription.price)}/month
                  </Typography>
                </div>
                {getStatusBadge(billingInfo.subscription.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Typography variant="body" className="font-medium text-sm text-muted-foreground">
                    Points Included
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold">
                    {billingInfo.subscription.pointsIncluded.toLocaleString()}
                  </Typography>
                </div>
                <div className="space-y-2">
                  <Typography variant="body" className="font-medium text-sm text-muted-foreground">
                    Points Used
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold">
                    {billingInfo.subscription.pointsUsed.toLocaleString()}
                  </Typography>
                </div>
                <div className="space-y-2">
                  <Typography variant="body" className="font-medium text-sm text-muted-foreground">
                    Remaining
                  </Typography>
                  <Typography variant="h4" className="text-2xl font-bold">
                    {(billingInfo.subscription.pointsIncluded - billingInfo.subscription.pointsUsed).toLocaleString()}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {billingInfo.subscription.cancelAtPeriodEnd 
                      ? `Cancels on ${formatDate(billingInfo.subscription.currentPeriodEnd)}`
                      : `Next billing: ${formatDate(billingInfo.subscription.currentPeriodEnd)}`
                    }
                  </span>
                </div>
              </div>

              {billingInfo.subscription.cancelAtPeriodEnd && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-200">
                    Your subscription will be canceled at the end of the current billing period.
                    You can reactivate it anytime before then.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="h3" className="mb-2">
                No Active Subscription
              </Typography>
              <Typography variant="body" color="muted" className="mb-4">
                You don't have an active subscription. Purchase a plan to start using our services.
              </Typography>
              <Button asChild>
                <a href="/pricing">
                  View Plans
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Points Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <Typography variant="h2" className="text-3xl font-bold">
                {billingInfo?.pointsBalance.toLocaleString() || 0}
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Total Spent</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <Typography variant="h2" className="text-3xl font-bold">
                {billingInfo?.totalSpent.toLocaleString() || 0}
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your billing history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Typography variant="body" color="muted" className="mb-4">
              Access your complete billing history, download invoices, and manage payment methods through the Stripe Customer Portal.
            </Typography>
            <Button
              onClick={handleManageBilling}
              disabled={isLoadingPortal}
              variant="outline"
            >
              {isLoadingPortal ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Open Billing Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
