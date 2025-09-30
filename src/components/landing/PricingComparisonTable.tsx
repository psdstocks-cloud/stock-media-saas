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

const tierFeatures = {
  'Starter': [
    '1-10 points',
    'Basic support',
    'Standard downloads',
    'Commercial license'
  ],
  'Growth': [
    '11-50 points',
    'Email support',
    'Priority downloads',
    'Commercial license',
    'Download history'
  ],
  'Popular': [
    '51-100 points',
    'Priority support',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads'
  ],
  'Business': [
    '101-170 points',
    'Priority support',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    'Team sharing'
  ],
  'Pro': [
    '171-400 points',
    'Priority support',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    'Team sharing',
    'API access'
  ],
  'Enterprise': [
    '401-500 points',
    'Dedicated support',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    'Team sharing',
    'API access',
    'Custom integrations'
  ]
}

export const PricingComparisonTable: React.FC<PricingComparisonTableProps> = ({
  className
}) => {
  // Define all unique features across all tiers
  const allFeatures = [
    'Basic support',
    'Email support', 
    'Priority support',
    'Dedicated support',
    'Standard downloads',
    'Priority downloads',
    'Fast downloads',
    'Commercial license',
    'Download history',
    'Bulk downloads',
    'Team sharing',
    'API access',
    'Custom integrations'
  ]

  // Check if a tier has a specific feature
  const hasFeature = (tierLabel: string, feature: string) => {
    const tierFeatureList = tierFeatures[tierLabel as keyof typeof tierFeatures] || []
    return tierFeatureList.includes(feature)
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
            Compare All Pricing Tiers
          </CardTitle>
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-xl max-w-3xl mx-auto leading-relaxed">
            See exactly what's included in each tier at a glance
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
                  {PRICING_TIERS.map((tier) => {
                    const IconComponent = tierIcons[tier.label as keyof typeof tierIcons]
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
                    {PRICING_TIERS.map((tier) => {
                      const hasThisFeature = hasFeature(tier.label, feature)
                      
                      return (
                        <td key={`${tier.label}-${feature}`} className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            {hasThisFeature ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                              </div>
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
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400 mr-3" />
                <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))]">
                  Best Value
                </Typography>
              </div>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                The <strong>Popular</strong> tier offers the best balance of features and savings for most users.
              </Typography>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))]">
                  Team Features
                </Typography>
              </div>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                <strong>Business</strong> and higher tiers include team sharing and collaboration features.
              </Typography>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-4">
                <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                <Typography variant="h4" className="font-bold text-[hsl(var(--foreground))]">
                  Enterprise
                </Typography>
              </div>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Need 500+ points? Contact our sales team for custom enterprise pricing.
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
