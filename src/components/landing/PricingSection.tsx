'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Typography, Badge } from '@/components/ui'
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
        const response = await fetch('/api/point-packs')
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
    // Optionally refresh user data or show success message
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h4" className="text-xl text-gray-600">
              Loading pricing options...
            </Typography>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h4" className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                  "relative group hover:shadow-2xl transition-all duration-300 border-2",
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
                  
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {pack.name}
                  </CardTitle>
                  
                  {pack.description && (
                    <Typography variant="body" className="text-gray-600 mt-2">
                      {pack.description}
                    </Typography>
                  )}
                </CardHeader>

                <CardContent className="text-center space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">${pack.price}</span>
                      <span className="text-lg text-gray-600 ml-2">one-time</span>
                    </div>
                    <Typography variant="body" className="text-gray-600 mt-2">
                      {pack.points} premium points
                    </Typography>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {pack.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <Typography variant="body-sm" className="text-gray-600">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    onClick={() => handlePurchase(pack)}
                    disabled={isAuthLoading}
                    className={cn(
                      "w-full group-hover:scale-105 transition-transform duration-200",
                      pack.isPopular
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    )}
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
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-16">
          <Typography variant="body" className="text-gray-600 mb-4">
            All plans include unlimited access to our entire collection of premium stock assets.
          </Typography>
          <Typography variant="body-sm" className="text-gray-500">
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
