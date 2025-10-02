'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Typography, Badge } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BrandButton } from '@/components/ui/brand-button'
import { Check, Zap, Crown, Star, User, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import VirtualPurchaseModal from '@/components/modals/VirtualPurchaseModal'
import PricingTestimonials from '@/components/landing/PricingTestimonials'

interface PointPack {
  id: string
  name: string
  points: number
  price: number
  description?: string
  isPopular?: boolean
  features?: string[]
}

export const PricingSection: React.FC = () => {
  const router = useRouter()
  const [pointPacks, setPointPacks] = useState<PointPack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [selectedPack, setSelectedPack] = useState<PointPack | null>(null)
  const [showVirtualModal, setShowVirtualModal] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify-token')
        if (response.ok) {
          const data = await response.json()
          if (data.valid && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    const fetchPointPacks = async () => {
      try {
        const response = await fetch('/api/point-packs', { next: { revalidate: 120 } })
        const data = await response.json()
        
        if (data.success && data.pointPacks) {
          setPointPacks(data.pointPacks)
        } else {
          // Fallback to mock data if API fails
          setPointPacks([
            {
              id: 'starter',
              name: 'Starter Pack',
              points: 100,
              price: 9.99,
              description: 'Perfect for small projects',
              features: [
                '100 premium points',
                'Access to all stock sites',
                'Instant downloads',
                'Commercial license included'
              ]
            },
            {
              id: 'professional',
              name: 'Professional Pack',
              points: 500,
              price: 39.99,
              description: 'Most popular choice',
              isPopular: true,
              features: [
                '500 premium points',
                'Access to all stock sites',
                'Priority support',
                'Team sharing features',
                'Bulk download options',
                'Commercial license included'
              ]
            },
            {
              id: 'enterprise',
              name: 'Enterprise Pack',
              points: 1000,
              price: 69.99,
              description: 'For large teams and agencies',
              features: [
                '1000 premium points',
                'Access to all stock sites',
                'Dedicated account manager',
                'Advanced team features',
                'Custom integrations',
                'White-label options',
                'Commercial license included'
              ]
            }
          ])
        }
      } catch (err) {
        console.error('Failed to fetch point packs:', err)
        setError('Failed to load pricing information')
        // Use fallback data
        setPointPacks([
          {
            id: 'starter',
            name: 'Starter Pack',
            points: 100,
            price: 9.99,
            description: 'Perfect for small projects',
            features: [
              '100 premium points',
              'Access to all stock sites',
              'Instant downloads',
              'Commercial license included'
            ]
          },
          {
            id: 'professional',
            name: 'Professional Pack',
            points: 500,
            price: 39.99,
            description: 'Most popular choice',
            isPopular: true,
            features: [
              '500 premium points',
              'Access to all stock sites',
              'Priority support',
              'Team sharing features',
              'Bulk download options',
              'Commercial license included'
            ]
          },
          {
            id: 'enterprise',
            name: 'Enterprise Pack',
            points: 1000,
            price: 69.99,
            description: 'For large teams and agencies',
            features: [
              '1000 premium points',
              'Access to all stock sites',
              'Dedicated account manager',
              'Advanced team features',
              'Custom integrations',
              'White-label options',
              'Commercial license included'
            ]
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPointPacks()
  }, [])

  const handlePurchase = (pack: PointPack) => {
    if (isAuthLoading) return // Don't allow clicks while checking auth
    
    if (user) {
      // User is authenticated, redirect to payment page
      const params = new URLSearchParams({
        points: pack.points.toString(),
        validity: '30' // Default validity for point packs
      })
      router.push(`/payment?${params.toString()}`)
    } else {
      // User is not authenticated, redirect to login with return URL
      const returnUrl = encodeURIComponent(`/pricing?pack=${pack.id}`)
      router.push(`/login?redirect=${returnUrl}`)
    }
  }

  const handleVirtualPurchaseSuccess = () => {
    setShowVirtualModal(false)
    setSelectedPack(null)
    // Redirect to order page to use the newly purchased points
    router.push('/dashboard/order')
  }

  const getPackIcon = (pack: PointPack) => {
    if (pack.isPopular) return Crown
    if (pack.points >= 1000) return Star
    return Zap
  }

  const getPackColor = (pack: PointPack) => {
    if (pack.isPopular) return "from-orange-500 to-red-500"
    if (pack.points >= 1000) return "from-purple-500 to-pink-500"
    return "from-blue-500 to-cyan-500"
  }

  if (isLoading) {
    return (
    <section className="py-20 bg-[hsl(var(--background))]" aria-busy={true} aria-live="polite" role="status">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-2">
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h4" className="text-xl text-[hsl(var(--muted-foreground))]">
              Loading pricing options...
            </Typography>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[0,1,2].map((i)=> (
              <div key={i} className="p-6 rounded-2xl border border-[var(--brand-purple-20)] bg-white animate-pulse">
                <div className="h-8 w-32 bg-[var(--brand-purple-6)] rounded mb-4" />
                <div className="h-10 w-40 bg-[var(--brand-purple-6)] rounded mb-6" />
                <div className="space-y-3 mb-6">
                  <div className="h-4 w-full bg-[var(--brand-purple-6)] rounded" />
                  <div className="h-4 w-5/6 bg-[var(--brand-purple-6)] rounded" />
                  <div className="h-4 w-4/6 bg-[var(--brand-purple-6)] rounded" />
                </div>
                <div className="h-10 w-full bg-[var(--brand-purple-6)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20 bg-[hsl(var(--background))]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))] mb-6">
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h4" className="text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
            Pay only for what you use. No subscriptions, no hidden fees, 
            just straightforward pricing that scales with your needs.
          </Typography>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-8">
            <Typography variant="body" className="text-red-600">
              {error}
            </Typography>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pointPacks.map((pack, _index) => {
            const Icon = getPackIcon(pack)
            const colorClass = getPackColor(pack)
            
            return (
              <Card 
                key={pack.id}
                className={cn(
                  "relative group hover:shadow-2xl transition-all duration-500 border-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 text-[hsl(var(--card-foreground))] overflow-hidden",
                  pack.isPopular 
                    ? "border-orange-500 shadow-2xl scale-105 ring-4 ring-orange-100 dark:ring-orange-900/30" 
                    : "border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:-translate-y-3 hover:shadow-xl"
                )}
              >
                {/* Popular Badge */}
                {pack.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-bold shadow-lg animate-pulse">
                      ⭐ Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 pt-8">
                  <div className={cn(
                    "inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300",
                    colorClass
                  )}>
                    <Icon className="h-10 w-10 text-white drop-shadow-sm" />
                  </div>
                  
                  <CardTitle className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                    {pack.name}
                  </CardTitle>
                  
                  {pack.description && (
                    <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-sm font-medium">
                      {pack.description}
                    </Typography>
                  )}
                </CardHeader>

                <CardContent className="text-center space-y-8 px-6">
                  {/* Price */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">${pack.price}</span>
                      <span className="text-lg text-[hsl(var(--muted-foreground))] ml-2 font-medium">one-time</span>
                    </div>
                    <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-lg font-semibold">
                      {pack.points.toLocaleString()} premium points
                    </Typography>
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      {Math.round(pack.points / pack.price)} points per dollar
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <Typography variant="h4" className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
                      What's Included
                    </Typography>
                    {pack.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Typography variant="body-sm" className="text-[hsl(var(--foreground))] cursor-help font-medium">
                                {feature}
                              </Typography>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {feature.includes('points') && 'Each download costs 10 points. Points never expire and can be used anytime.'}
                                {feature.includes('stock sites') && 'Download from 25+ premium stock sites including Shutterstock, Adobe Stock, Freepik, and more.'}
                                {feature.includes('Commercial license') && 'Use downloaded content in client projects, marketing materials, and commercial applications without restrictions.'}
                                {feature.includes('Priority support') && 'Get faster response times and dedicated support for your account.'}
                                {feature.includes('Team sharing') && 'Share your account with team members and manage permissions.'}
                                {feature.includes('Bulk download') && 'Download multiple files at once for faster workflow.'}
                                {feature.includes('Dedicated account manager') && 'Get a personal account manager for enterprise support.'}
                                {feature.includes('Custom integrations') && 'Integrate with your existing tools and workflows.'}
                                {feature.includes('White-label') && 'Customize the platform with your branding.'}
                                {feature.includes('Instant downloads') && 'Download files immediately after purchase without waiting.'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <BrandButton
                    onClick={() => handlePurchase(pack)}
                    disabled={isAuthLoading}
                    className={cn(
                      "w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl",
                      pack.isPopular 
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" 
                        : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white"
                    )}
                    variant={pack.isPopular ? 'dark' : 'light'}
                  >
                    {isAuthLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : user ? (
                      pack.isPopular ? (
                        <>
                          <Crown className="h-5 w-5 mr-2" />
                          Purchase Now
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 mr-2" />
                          Purchase Now
                        </>
                      )
                    ) : (
                      pack.isPopular ? (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In to Purchase
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In to Purchase
                        </>
                      )
                    )}
                  </BrandButton>

                  {/* Customer Testimonial */}
                  <PricingTestimonials 
                    planType={pack.id as 'starter' | 'professional' | 'enterprise'} 
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-16">
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mb-4">
            All plans include unlimited access to our entire collection of premium stock assets.
          </Typography>
          <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
            Points never expire • No monthly fees • Cancel anytime
          </Typography>
        </div>
      </div>

      {/* Virtual Purchase Modal */}
      {showVirtualModal && selectedPack && (
        <VirtualPurchaseModal
          pointPack={selectedPack}
          onClose={() => setShowVirtualModal(false)}
          onSuccess={handleVirtualPurchaseSuccess}
        />
      )}
    </section>
  )
}
