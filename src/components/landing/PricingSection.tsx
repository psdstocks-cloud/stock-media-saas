'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Typography, Badge } from '@/components/ui'
import { BrandButton } from '@/components/ui/brand-button'
import { Check, Zap, Crown, Star, ArrowRight, User, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import VirtualPurchaseModal from '@/components/modals/VirtualPurchaseModal'

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
      // User is logged in, show virtual purchase modal
      setSelectedPack(pack)
      setShowVirtualModal(true)
    } else {
      // User is not logged in, redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`)
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
          {pointPacks.map((pack, index) => {
            const Icon = getPackIcon(pack)
            const colorClass = getPackColor(pack)
            
            return (
              <Card 
                key={pack.id}
                className={cn(
                  "relative group hover:shadow-2xl transition-all duration-300 border-2 bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
                  pack.isPopular 
                    ? "border-orange-500 shadow-xl scale-105" 
                    : "border-gray-200 hover:border-orange-300 hover:-translate-y-2"
                )}
              >
                {/* Popular Badge */}
                {pack.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r mx-auto mb-4",
                    colorClass
                  )}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {pack.name}
                  </CardTitle>
                  
                  {pack.description && (
                    <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mt-2">
                      {pack.description}
                    </Typography>
                  )}
                </CardHeader>

                <CardContent className="text-center space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-[hsl(var(--foreground))]">${pack.price}</span>
                      <span className="text-lg text-[hsl(var(--muted-foreground))] ml-2">one-time</span>
                    </div>
                    <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mt-2">
                      {pack.points} premium points
                    </Typography>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {pack.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <BrandButton
                    onClick={() => handlePurchase(pack)}
                    disabled={isAuthLoading}
                    className="w-full"
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
