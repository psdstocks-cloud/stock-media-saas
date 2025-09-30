'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, Typography, Button, Badge } from '@/components/ui'
import { Check, Star, Zap, Crown, Users, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define the 3 key tiers for comparison
const keyTiers = [
  {
    label: 'Starter',
    icon: Zap,
    color: 'from-red-500 to-red-600',
    pricePerPoint: 0.50,
    savings: 0,
    popular: false,
    description: '1-10 points'
  },
  {
    label: 'Popular',
    icon: Star,
    color: 'from-yellow-500 to-yellow-600',
    pricePerPoint: 0.30,
    savings: 40,
    popular: true,
    description: '51-100 points'
  },
  {
    label: 'Pro',
    icon: Crown,
    color: 'from-blue-500 to-blue-600',
    pricePerPoint: 0.26,
    savings: 48,
    popular: false,
    description: '171-400 points'
  }
]

// Define features to compare
const allFeatures = [
  'Points Range',
  'Price per Point',
  'Support Level',
  'Download Speed',
  'Download History',
  'Bulk Downloads',
  'Team Sharing',
  'API Access',
  'Validity Period',
  'Priority Processing'
]

// Function to get feature value for each tier
const getFeatureValue = (tierLabel: string, feature: string): string => {
  const tier = keyTiers.find(t => t.label === tierLabel)
  if (!tier) return '✗'

  switch (feature) {
    case 'Points Range':
      if (tierLabel === 'Starter') return '1-10'
      if (tierLabel === 'Popular') return '51-100'
      if (tierLabel === 'Pro') return '171-400'
      return '✗'
    
    case 'Price per Point':
      return `$${tier.pricePerPoint.toFixed(3)}`
    
    case 'Support Level':
      if (tierLabel === 'Starter') return 'Basic'
      return 'Priority'
    
    case 'Download Speed':
      if (tierLabel === 'Starter') return 'Standard'
      return 'Fast'
    
    case 'Download History':
      if (tierLabel === 'Starter') return '✗'
      return '✓'
    
    case 'Bulk Downloads':
      if (tierLabel === 'Starter') return '✗'
      return '✓'
    
    case 'Team Sharing':
      if (tierLabel === 'Starter') return '✗'
      if (tierLabel === 'Popular') return '✗'
      return '✓'
    
    case 'API Access':
      if (tierLabel === 'Starter') return '✗'
      if (tierLabel === 'Popular') return '✗'
      return '✓'
    
    case 'Validity Period':
      if (tierLabel === 'Starter') return '30 days'
      if (tierLabel === 'Popular') return '30 days'
      return '60 days'
    
    case 'Priority Processing':
      if (tierLabel === 'Starter') return '✗'
      return '✓'
    
    default:
      return '✗'
  }
}

const PricingComparisonTable: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 border-2 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
      <CardHeader className="text-center pb-8 pt-12">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl">
            <Users className="h-10 w-10 drop-shadow-sm" />
          </div>
        </div>
        <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-blue-600 dark:from-white dark:via-orange-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
          Compare Plans
        </CardTitle>
        <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-xl max-w-2xl mx-auto leading-relaxed">
          Choose the perfect plan for your needs. Compare features and find your ideal pricing tier.
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
                          <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] mt-2">
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
            <Typography variant="body" className="text-[hsl(var(--muted-foreground))] mb-6 max-w-2xl mx-auto">
              Choose your plan and start downloading high-quality stock media from 25+ platforms. 
              All plans include commercial licensing and access to our entire library.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start with 10 Free Points
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PricingComparisonTable
