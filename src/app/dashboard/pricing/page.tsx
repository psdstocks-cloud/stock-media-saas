'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Zap, Shield, Clock, CheckCircle, Star, ShoppingCart } from 'lucide-react'
import { PointPackSelector } from '@/components/PointPackSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface PricingPlan {
  id: string
  name: string
  points: number
  price: number
  popular?: boolean
  features: string[]
  savings?: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    points: 50,
    price: 9.99,
    features: [
      '50 download points',
      'High-quality stock media',
      'Instant downloads',
      'Commercial license included'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    points: 150,
    price: 24.99,
    popular: true,
    features: [
      '150 download points',
      'High-quality stock media',
      'Instant downloads',
      'Commercial license included',
      'Priority support',
      'Bulk download discounts'
    ],
    savings: 'Save 17%'
  },
  {
    id: 'business',
    name: 'Business',
    points: 500,
    price: 69.99,
    features: [
      '500 download points',
      'High-quality stock media',
      'Instant downloads',
      'Commercial license included',
      'Priority support',
      'Bulk download discounts',
      'Team collaboration',
      'Advanced analytics'
    ],
    savings: 'Save 30%'
  }
]

export default function PricingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [userBalance, setUserBalance] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [balanceError, setBalanceError] = useState<string>('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    
    fetchUserBalance()
  }, [session, status, router])

  const fetchUserBalance = async () => {
    try {
      setBalanceLoading(true)
      setBalanceError('')
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.balance?.currentPoints || 0)
      } else {
        setBalanceError('Failed to load balance')
        setUserBalance(0)
      }
    } catch (error) {
      console.error('Error fetching user balance:', error)
      setBalanceError('Failed to load balance')
      setUserBalance(0)
    } finally {
      setBalanceLoading(false)
    }
  }

  const handlePointPackPurchase = (pointPack: any) => {
    toast({
      title: 'Redirecting to Checkout',
      description: `Starting purchase of ${pointPack.name}...`,
    })
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Get more points to download premium stock media
          </p>
          
          {/* Current Balance */}
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Current Balance:</span>
            {balanceLoading ? (
              <span className="text-gray-500">Loading...</span>
            ) : balanceError ? (
              <span className="text-red-500">Error loading</span>
            ) : (
              <span className="text-blue-600 font-bold">{userBalance} points</span>
            )}
          </div>
        </div>

        {/* Tabs for different purchase options */}
        <Tabs defaultValue="point-packs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="point-packs" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Point Packs
            </TabsTrigger>
            <TabsTrigger value="virtual-plans" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Virtual Plans
            </TabsTrigger>
          </TabsList>

          {/* Point Packs Tab */}
          <TabsContent value="point-packs">
            <PointPackSelector onPurchase={handlePointPackPurchase} />
          </TabsContent>

          {/* Virtual Plans Tab */}
          <TabsContent value="virtual-plans">
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Virtual Testing Plans
                </h3>
                <p className="text-gray-600">
                  These are virtual plans for testing purposes. No real payment required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pricingPlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative transition-all duration-200 hover:shadow-lg ${
                      plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-600 text-white px-4 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {plan.savings && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {plan.savings}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-blue-600">
                          ${plan.price}
                        </div>
                        <div className="text-lg text-gray-600">
                          {plan.points} points
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => {
                          toast({
                            title: 'Virtual Plan Selected',
                            description: `You selected the ${plan.name} plan for testing.`,
                          })
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Get {plan.points} Points - ${plan.price}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Our Service?
                </h2>
                <p className="text-gray-600">
                  Get the best stock media with our flexible point system
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Instant Access
                  </h3>
                  <p className="text-gray-600">
                    Download your files immediately after purchase with our point system
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Secure & Licensed
                  </h3>
                  <p className="text-gray-600">
                    All downloads come with commercial licenses for your projects
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Lifetime Access
                  </h3>
                  <p className="text-gray-600">
                    Keep your downloads forever, points never expire
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="bg-white/80 hover:bg-white"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}