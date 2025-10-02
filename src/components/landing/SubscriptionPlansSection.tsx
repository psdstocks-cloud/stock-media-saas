'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Typography, Badge } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Check, Zap, Crown, Star, LogIn, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import PricingTestimonials from '@/components/landing/PricingTestimonials'

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
  const [_selectedPlan, _setSelectedPlan] = useState<SubscriptionPlan | null>(null)
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
      // User is logged in, redirect to payment page for subscription
      const params = new URLSearchParams({
        points: plan.points.toString(),
        validity: '30', // Monthly subscriptions
        type: 'subscription',
        planId: plan.id
      })
      router.push(`/payment?${params.toString()}`)
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
        <Typography variant="h2" className="text-3xl font-bold mb-4 text-[hsl(var(--foreground))]">
          Monthly Subscription Plans
        </Typography>
        <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
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
                "relative group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-[hsl(var(--card-foreground))] border-2 overflow-hidden",
                isPopular 
                  ? "border-orange-500 shadow-2xl scale-105 ring-4 ring-orange-100 dark:ring-orange-900/30" 
                  : "border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:-translate-y-3 hover:shadow-xl"
              )}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-bold shadow-lg animate-pulse">
                    ⭐ Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6 pt-8">
                <div className="flex justify-center mb-6">
                  <div className={cn(
                    "p-4 rounded-3xl shadow-lg group-hover:scale-110 transition-transform duration-300",
                    isPopular 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                      : "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                  )}>
                    <IconComponent className="h-8 w-8 drop-shadow-sm" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Typography variant="h3" className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      {formatCurrency(plan.price, plan.currency)}
                    </Typography>
                    {/* Annual Discount Badge */}
                    {plan.name?.toLowerCase().includes('pro') && (
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                        Save 20%
                      </Badge>
                    )}
                  </div>
                  <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-lg font-semibold">
                    per {getBillingCycleText(plan.billingCycle)}
                  </Typography>
                  {/* Annual Pricing Display */}
                  {plan.name?.toLowerCase().includes('pro') && (
                    <Typography variant="body-sm" className="text-green-600 dark:text-green-400 mt-1 font-medium">
                      ${(plan.price * 12 * 0.8).toFixed(0)}/year (20% off)
                    </Typography>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6">
                {plan.description && (
                  <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-center text-sm font-medium">
                    {plan.description}
                  </Typography>
                )}

                {/* Points Display */}
                <div className="text-center py-6 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <Typography variant="h4" className="font-bold text-3xl text-orange-600 dark:text-orange-400 mb-2">
                    {plan.points.toLocaleString()} Points
                  </Typography>
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] font-semibold">
                    Monthly allocation
                  </Typography>
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    {Math.round(plan.points / plan.price)} points per dollar
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <Typography variant="h4" className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                    What's Included
                  </Typography>
                  <div className="space-y-3">
                    <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Typography variant="body-sm" className="text-[hsl(var(--foreground))] cursor-help font-medium">
                              {plan.points.toLocaleString()} premium points
                            </Typography>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Each download costs 10 points. Points never expire and can be used anytime.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Typography variant="body-sm" className="text-[hsl(var(--foreground))] cursor-help font-medium">
                              Access to all stock sites
                            </Typography>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download from 25+ premium stock sites including Shutterstock, Adobe Stock, Freepik, and more.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Typography variant="body-sm" className="text-[hsl(var(--foreground))] cursor-help font-medium">
                              Commercial license included
                            </Typography>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Use downloaded content in client projects, marketing materials, and commercial applications without restrictions.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Typography variant="body-sm" className="text-[hsl(var(--foreground))] cursor-help font-medium">
                              {plan.rolloverLimit}% rollover limit
                            </Typography>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Unused points roll over to the next month up to {plan.rolloverLimit}% of your monthly allocation.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {isPopular && (
                      <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Typography variant="body-sm" className="text-[hsl(var(--foreground))] cursor-help font-medium">
                                Priority support
                              </Typography>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Get faster response times and dedicated support for your account.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subscribe Button */}
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isAuthLoading || isProcessing}
                  className={cn(
                    "w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
                    isPopular
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white"
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

                {/* Customer Testimonial */}
                <PricingTestimonials 
                  planType={plan.name?.toLowerCase().includes('pro') ? 'professional' : 
                           plan.name?.toLowerCase().includes('enterprise') ? 'enterprise' : 'starter'} 
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Benefits Section */}
      <div className="mt-12 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-900/20 dark:to-purple-900/20 rounded-2xl p-8">
        <div className="text-center mb-8">
          <Typography variant="h3" className="text-2xl font-bold mb-4 text-[hsl(var(--foreground))]">
            Why Choose Monthly Subscriptions?
          </Typography>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Typography variant="h4" className="font-semibold mb-2 text-[hsl(var(--foreground))]">
              Automatic Renewal
            </Typography>
            <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
              Never run out of points. Get fresh points delivered to your account every month automatically.
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Typography variant="h4" className="font-semibold mb-2 text-[hsl(var(--foreground))]">
              Better Value
            </Typography>
            <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
              Save money compared to one-time purchases. Get more points for less with our subscription plans.
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Typography variant="h4" className="font-semibold mb-2 text-[hsl(var(--foreground))]">
              Cancel Anytime
            </Typography>
            <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
              No long-term commitments. Cancel or change your plan anytime from your dashboard.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}
