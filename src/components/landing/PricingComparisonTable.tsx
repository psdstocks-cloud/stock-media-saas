'use client'

import React from 'react'
import { Typography } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Check, Star, Crown, Zap, Users, TrendingUp, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRICING_TIERS } from '@/lib/pricing-calculator'

interface PricingComparisonTableProps {
  className?: string
}

const tierIcons = {
  'Starter': Zap,
  'Growth': TrendingUp,
  'Popular': Star,
  'Business': Users,
  'Pro': Crown,
  'Enterprise': Building2
}

// Focus on 3 key tiers for easier comparison
const keyTiers = [
  { label: 'Starter', min: 1, max: 10, pricePerPoint: 0.50, savings: 0, color: 'from-red-500 to-red-600', icon: Zap, description: 'Perfect for individual creators' },
  { label: 'Popular', min: 51, max: 100, pricePerPoint: 0.30, savings: 40, color: 'from-yellow-500 to-yellow-600', icon: Star, description: 'Best for regular users', popular: true },
  { label: 'Pro', min: 171, max: 400, pricePerPoint: 0.26, savings: 48, color: 'from-blue-500 to-blue-600', icon: Crown, description: 'Ideal for professional teams' }
]

const tierFeatures = {
  'Starter': [
    '1-10 points',
    'Basic support',
    'Standard downloads',
    'Commercial license',
    '30-day validity'
  ],
  'Popular': [
    '51-100 points',
    'Priority support',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    '30-day validity'
  ],
  'Pro': [
    '171-400 points',
    'Priority support',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    'Team sharing',
    'API access',
    '60-day validity'
  ]
}

export const PricingComparisonTable: React.FC<PricingComparisonTableProps> = ({
  className
}) => {
  // Define features for the 3 key tiers
  const allFeatures = [
    'Points range',
    'Support level',
    'Download speed',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    'Team sharing',
    'API access',
    'Validity period'
  ]

  // Get feature value for a specific tier
  const getFeatureValue = (tierLabel: string, feature: string) => {
    const tier = keyTiers.find(t => t.label === tierLabel)
    if (!tier) return ''
    
    switch (feature) {
      case 'Points range':
        return `${tier.min}-${tier.max} points`
      case 'Support level':
        return tierLabel === 'Starter' ? 'Basic' : 'Priority'
      case 'Download speed':
        return tierLabel === 'Starter' ? 'Standard' : 'Fast'
      case 'Commercial license':
        return '✓'
      case 'Download history':
        return tierLabel === 'Starter' ? '✗' : '✓'
      case 'Bulk downloads':
        return tierLabel === 'Starter' ? '✗' : '✓'
      case 'Team sharing':
        return tierLabel === 'Pro' ? '✓' : '✗'
      case 'API access':
        return tierLabel === 'Pro' ? '✓' : '✗'
      case 'Validity period':
        return tierLabel === 'Pro' ? '60 days' : '30 days'
      default:
        return ''
    }
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl">
              <Building2 className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-blue-600 dark:from-white dark:via-orange-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Choose Your Perfect Plan
          </CardTitle>
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-xl max-w-3xl mx-auto leading-relaxed">
            Compare our 3 main tiers and find the one that fits your needs
          </Typography>
        </CardHeader>

        <CardContent className="px-6 pb-12">
          {/* Clean Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header Row */}
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-[hsl(var(--foreground))]">
                    Features
                  </th>
                  {keyTiers.map((tier) => {
                    const IconComponent = tier.icon
                    const isPopular = tier.popular
                    
                    return (
                      <th key={tier.label} className="text-center p-4">
                        <div className={cn(
                          "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl",
                          isPopular 
                            ? "border-orange-500 dark:border-orange-400 scale-105" 
                            : "border-gray-200 dark:border-gray-600"
                        )}>
                          <div className="flex items-center justify-center mb-3">
                            <div className={cn(
                              "p-3 rounded-xl shadow-lg",
                              `bg-gradient-to-r ${tier.color} text-white`
                            )}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                          </div>
                          
                          <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))] mb-2">
                            {tier.label}
                          </Typography>
                          
                          {isPopular && (
                            <Badge className="bg-orange-500 text-white px-3 py-1 mb-3 text-xs">
                              ⭐ Most Popular
                            </Badge>
                          )}
                          
                          <div className="space-y-1">
                            <Typography variant="h3" className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              ${tier.pricePerPoint.toFixed(3)}
                            </Typography>
                            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                              per point
                            </Typography>
                            <Typography variant="body-sm" className="text-green-600 dark:text-green-400 font-semibold">
                              {tier.savings}% savings
                            </Typography>
                            <Typography variant="body-xs" className="text-[hsl(var(--muted-foreground))] mt-2">
                              {tier.description}
                            </Typography>
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              {/* Feature Rows */}
              <tbody>
                {allFeatures.map((feature, index) => (
                  <tr key={feature} className={cn(
                    "border-b border-gray-200 dark:border-gray-700",
                    index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/50" : ""
                  )}>
                    <td className="p-4 font-medium text-[hsl(var(--foreground))]">
                      {feature}
                    </td>
                    {keyTiers.map((tier) => {
                      const featureValue = getFeatureValue(tier.label, feature)
                      const isCheckmark = featureValue === '✓'
                      const isXMark = featureValue === '✗'
                      
                      return (
                        <td key={`${tier.label}-${feature}`} className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            {isCheckmark ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            ) : isXMark ? (
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                              </div>
                            ) : (
                              <Typography variant="body-sm" className="font-medium text-[hsl(var(--foreground))]">
                                {featureValue}
                              </Typography>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))]">
                  Starter
                </Typography>
              </div>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Perfect for <strong>individual creators</strong> who need occasional downloads. Great for testing our platform.
              </Typography>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
                <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))]">
                  Popular ⭐
                </Typography>
              </div>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                <strong>Most popular choice</strong> for regular users. Best balance of features and savings with 40% off.
              </Typography>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))]">
                  Pro
                </Typography>
              </div>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Ideal for <strong>professional teams</strong> with team sharing, API access, and extended validity.
              </Typography>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <Typography variant="h3" className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
                Ready to Get Started?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mb-6">
                Use our dynamic pricing slider to find the perfect tier for your needs
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Zap className="h-5 w-5 inline mr-2" />
                  Try Dynamic Pricing
                </button>
                <button className="px-8 py-4 border-2 border-orange-500 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-300">
                  <Users className="h-5 w-5 inline mr-2" />
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PricingComparisonTable
