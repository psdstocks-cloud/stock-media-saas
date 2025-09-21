'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Typography, Badge } from '@/components/ui'
import { Check, Zap, Crown, Star, ArrowRight, User, LogIn, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

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

export const SubscriptionPlansSection: React.FC = () => {
  const router = useRouter()
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify-token')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/subscription-plans')
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans')
        }
        
        const data = await response.json()
        console.log('Subscription Plans Data:', data)
        console.log('Plans array:', data.plans)
        setSubscriptionPlans(data.plans || [])
      } catch (error) {
        console.error('Error fetching subscription plans:', error)
        setError('Failed to load subscription plans')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (isAuthLoading) return // Don't allow clicks while checking auth
    
    if (user) {
      // User is logged in, create subscription
      try {
        setIsProcessing(true)
        
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId: plan.id })
        })

        const data = await response.json()

        if (data.success) {
          toast.success(data.message, {
            duration: 4000,
            icon: '🎉'
          })
          // Redirect to dashboard to see the new subscription
          router.push('/dashboard')
        } else {
          toast.error(data.error || 'Subscription failed', {
            duration: 5000,
            icon: '❌'
          })
        }
      } catch (error) {
        console.error('Subscription error:', error)
        toast.error('Failed to create subscription. Please try again.', {
          duration: 5000,
          icon: '❌'
        })
      } finally {
        setIsProcessing(false)
      }
    } else {
      // User is not logged in, redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`)
    }
  }

  const getPlanIcon = (planName: string) => {
    if (!planName) return Zap
    const name = planName.toLowerCase()
    if (name.includes('pro')) return Crown
    if (name.includes('team')) return Star
    if (name.includes('enterprise')) return Zap
    return Zap
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getBillingCycleText = (cycle: string) => {
    if (!cycle) return 'month'
    const cycleLower = cycle.toLowerCase()
    return cycleLower === 'monthly' ? 'month' : cycleLower
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <Typography variant="body" className="text-muted-foreground">
            Loading subscription plans...
          </Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Typography variant="h3" className="text-red-600 mb-4">
          Failed to Load Plans
        </Typography>
        <Typography variant="body" className="text-muted-foreground mb-4">
          {error}
        </Typography>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Typography variant="h2" className="text-3xl font-bold mb-4">
          Monthly Subscription Plans
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground max-w-2xl mx-auto">
          Get monthly points automatically delivered to your account. Perfect for regular users who want consistent access to premium content.
        </Typography>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => {
          const IconComponent = getPlanIcon(plan.name)
          const isPopular = plan.name?.toLowerCase().includes('pro') || false
          
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative group hover:shadow-lg transition-all duration-200 cursor-pointer",
                isPopular && "ring-2 ring-orange-500 shadow-lg scale-105"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-3 rounded-full",
                    isPopular 
                      ? "bg-orange-100 text-orange-600" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold">
                  {plan.name}
                </CardTitle>
                
                <div className="mt-4">
                  <Typography variant="h3" className="text-3xl font-bold">
                    {formatCurrency(plan.price, plan.currency)}
                  </Typography>
                  <Typography variant="body" className="text-muted-foreground">
                    per {getBillingCycleText(plan.billingCycle)}
                  </Typography>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.description && (
                  <Typography variant="body" className="text-muted-foreground text-center">
                    {plan.description}
                  </Typography>
                )}

                {/* Points Display */}
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <Typography variant="h4" className="font-bold text-orange-600">
                    {plan.points.toLocaleString()} Points
                  </Typography>
                  <Typography variant="body-sm" className="text-muted-foreground">
                    Monthly allocation
                  </Typography>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <Typography variant="body-sm">
                      {plan.points.toLocaleString()} premium points
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <Typography variant="body-sm">
                      Access to all stock sites
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <Typography variant="body-sm">
                      Commercial license included
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <Typography variant="body-sm">
                      {plan.rolloverLimit}% rollover limit
                    </Typography>
                  </div>
                  {isPopular && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <Typography variant="body-sm">
                        Priority support
                      </Typography>
                    </div>
                  )}
                </div>

                {/* Subscribe Button */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isAuthLoading || isProcessing}
                  className={cn(
                    "w-full group-hover:scale-105 transition-transform duration-200",
                    isPopular
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  )}
                >
                  {isAuthLoading || isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isProcessing ? 'Processing...' : 'Loading...'}
                    </>
                  ) : user ? (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In to Subscribe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Benefits Section */}
      <div className="mt-12 bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <Typography variant="h3" className="text-2xl font-bold mb-4">
            Why Choose Monthly Subscriptions?
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <Typography variant="h4" className="font-semibold mb-2">
              Automatic Renewal
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Never run out of points. Get fresh points delivered to your account every month automatically.
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <Typography variant="h4" className="font-semibold mb-2">
              Better Value
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Save money compared to one-time purchases. Get more points for less with our subscription plans.
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-orange-600" />
            </div>
            <Typography variant="h4" className="font-semibold mb-2">
              Cancel Anytime
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              No long-term commitments. Cancel or change your plan anytime from your dashboard.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}
