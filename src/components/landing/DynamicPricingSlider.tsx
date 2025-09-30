'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Typography } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Calculator, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingTier {
  min: number
  max: number
  pricePerPoint: number
  color: string
  label: string
  popular?: boolean
  savings?: number
  icon: React.ComponentType<{ className?: string }>
}

interface ValidityOption {
  days: number
  multiplier: number
  label: string
  popular?: boolean
  description: string
}

const pricingTiers: PricingTier[] = [
  {
    min: 1,
    max: 10,
    pricePerPoint: 0.50,
    color: 'from-red-500 to-red-600',
    label: 'Starter',
    icon: Zap,
    savings: 0
  },
  {
    min: 11,
    max: 50,
    pricePerPoint: 0.40,
    color: 'from-orange-500 to-orange-600',
    label: 'Growth',
    icon: TrendingUp,
    savings: 20
  },
  {
    min: 51,
    max: 100,
    pricePerPoint: 0.30,
    color: 'from-yellow-500 to-yellow-600',
    label: 'Popular',
    popular: true,
    icon: Star,
    savings: 40
  },
  {
    min: 101,
    max: 170,
    pricePerPoint: 0.294,
    color: 'from-green-500 to-green-600',
    label: 'Business',
    icon: Users,
    savings: 41.2
  },
  {
    min: 171,
    max: 400,
    pricePerPoint: 0.26,
    color: 'from-blue-500 to-blue-600',
    label: 'Pro',
    icon: Crown,
    savings: 48
  },
  {
    min: 401,
    max: 500,
    pricePerPoint: 0.24,
    color: 'from-purple-500 to-purple-600',
    label: 'Enterprise',
    icon: Crown,
    savings: 52
  }
]

const validityOptions: ValidityOption[] = [
  {
    days: 30,
    multiplier: 1.0,
    label: '30 Days',
    popular: true,
    description: 'Standard validity'
  },
  {
    days: 60,
    multiplier: 1.15,
    label: '60 Days',
    description: 'Extended validity (+15%)'
  },
  {
    days: 90,
    multiplier: 1.25,
    label: '90 Days',
    description: 'Long-term option (+25%)'
  },
  {
    days: 365,
    multiplier: 1.40,
    label: '1 Year',
    description: 'Annual commitment (+40%)'
  }
]

interface DynamicPricingSliderProps {
  onPurchase?: (points: number, validity: number, totalPrice: number) => void
  className?: string
}

export const DynamicPricingSlider: React.FC<DynamicPricingSliderProps> = ({
  onPurchase,
  className
}) => {
  const [points, setPoints] = useState(100)
  const [validity, setValidity] = useState(30)
  const [isEnterprise, setIsEnterprise] = useState(false)

  // Calculate current tier and pricing
  const currentTier = pricingTiers.find(tier => points >= tier.min && points <= tier.max)
  const validityOption = validityOptions.find(option => option.days === validity)
  
  const basePrice = currentTier ? points * currentTier.pricePerPoint : 0
  const validityMultiplier = validityOption?.multiplier || 1.0
  const totalPrice = basePrice * validityMultiplier
  const savings = currentTier ? (basePrice * (currentTier.savings || 0) / 100) : 0

  // Handle points change
  const handlePointsChange = useCallback((newPoints: number) => {
    if (newPoints < 1) {
      setPoints(1)
    } else if (newPoints > 500) {
      setIsEnterprise(true)
      setPoints(500)
    } else {
      setIsEnterprise(false)
      setPoints(newPoints)
    }
  }, [])

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPoints = parseInt(event.target.value)
    handlePointsChange(newPoints)
  }

  // Handle manual input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPoints = parseInt(event.target.value) || 0
    handlePointsChange(newPoints)
  }

  // Handle purchase
  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(points, validity, totalPrice)
    }
  }

  // Get tier color for slider
  const getSliderColor = () => {
    if (!currentTier) return 'bg-gray-300'
    return `bg-gradient-to-r ${currentTier.color}`
  }

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <Card className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 border-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
        
        <CardHeader className="text-center pb-8 pt-12 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Calculator className="h-10 w-10 drop-shadow-sm" />
            </div>
          </div>
          <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-blue-600 dark:from-white dark:via-orange-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Dynamic Point Pricing
          </CardTitle>
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-xl max-w-2xl mx-auto leading-relaxed">
            Choose your points and validity period. The more you buy, the less you pay per point!
          </Typography>
        </CardHeader>

        <CardContent className="space-y-10 px-8 pb-12 relative z-10">
          {/* Points Selection */}
          <div className="space-y-8">
            <div className="text-center">
              <Label htmlFor="points-slider" className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3 block">
                How many points do you need?
              </Label>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-lg">
                Drag the slider or enter a number directly
              </Typography>
            </div>

            {/* Slider */}
            <div className="space-y-6">
              <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-inner">
                <input
                  id="points-slider"
                  type="range"
                  min="1"
                  max="500"
                  value={points}
                  onChange={handleSliderChange}
                  className={cn(
                    "w-full h-4 rounded-xl appearance-none cursor-pointer",
                    "bg-transparent",
                    "focus:outline-none focus:ring-4 focus:ring-orange-500/30"
                  )}
                  style={{
                    background: `linear-gradient(to right, ${getSliderColor()} 0%, ${getSliderColor()} ${(points / 500) * 100}%, transparent ${(points / 500) * 100}%, transparent 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    1 point
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    500+ points
                  </span>
                </div>
              </div>

              {/* Manual Input */}
              <div className="flex items-center justify-center space-x-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <Label htmlFor="points-input" className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Points:
                </Label>
                <Input
                  id="points-input"
                  type="number"
                  min="1"
                  max="500"
                  value={points}
                  onChange={handleInputChange}
                  className="w-32 text-center font-bold text-xl border-2 border-orange-200 dark:border-orange-800 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg"
                />
                <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] font-medium">
                  points
                </Typography>
              </div>
            </div>

            {/* Current Tier Display */}
            {currentTier && (
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300",
                  currentTier.popular && "animate-pulse scale-105",
                  `bg-gradient-to-r ${currentTier.color} text-white`
                )}>
                  {currentTier.popular && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5" />
                      <span>Most Popular</span>
                    </div>
                  )}
                  <span>{currentTier.label} Tier</span>
                  {currentTier.savings && currentTier.savings > 0 && (
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {currentTier.savings}% savings
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Validity Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <Label className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3 block">
                How long should your points be valid?
              </Label>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-lg">
                Choose the validity period that works best for your needs
              </Typography>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {validityOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => setValidity(option.days)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all duration-300 text-center group relative overflow-hidden",
                    "hover:scale-105 hover:shadow-xl",
                    validity === option.days
                      ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                  )}
                >
                  {/* Background gradient for selected option */}
                  {validity === option.days && (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-3">
                      <div className={cn(
                        "p-3 rounded-xl transition-colors duration-200",
                        validity === option.days
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-600"
                      )}>
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                    <Typography variant="body-lg" className="font-bold mb-2">
                      {option.label}
                    </Typography>
                    {option.popular && (
                      <div className="inline-flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        <Star className="h-3 w-3" />
                        Popular
                      </div>
                    )}
                    <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {option.description}
                    </Typography>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Display */}
          <div className="bg-gradient-to-br from-white via-orange-50 to-blue-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-blue-900/20 rounded-3xl p-8 border-2 border-orange-200 dark:border-orange-800 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
            
            <div className="text-center space-y-6 relative z-10">
              <div className="flex items-center justify-center space-x-3">
                <Typography variant="h2" className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  ${totalPrice.toFixed(2)}
                </Typography>
                <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] text-xl font-medium">
                  total
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] mb-2 font-medium">
                    Price per point
                  </Typography>
                  <Typography variant="h4" className="font-bold text-orange-600 dark:text-orange-400">
                    ${currentTier?.pricePerPoint.toFixed(3) || '0.000'}
                  </Typography>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] mb-2 font-medium">
                    Validity period
                  </Typography>
                  <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                    {validity} days
                  </Typography>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] mb-2 font-medium">
                    You save
                  </Typography>
                  <Typography variant="h4" className="font-bold text-green-600 dark:text-green-400">
                    ${savings.toFixed(2)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Contact */}
          {isEnterprise && (
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 border-2 border-purple-200 dark:border-purple-800 text-center shadow-2xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full translate-y-16 -translate-x-16" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-2xl">
                    <Crown className="h-12 w-12" />
                  </div>
                </div>
                <Typography variant="h3" className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
                  Need 500+ Points?
                </Typography>
                <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] mb-6 max-w-2xl mx-auto">
                  Contact our sales team for custom enterprise pricing and dedicated support.
                </Typography>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Contact Sales
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          {!isEnterprise && (
            <div className="text-center">
              <Button
                onClick={handlePurchase}
                className="w-full md:w-auto px-12 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                <Zap className="h-6 w-6 mr-3" />
                Purchase {points} Points
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DynamicPricingSlider
