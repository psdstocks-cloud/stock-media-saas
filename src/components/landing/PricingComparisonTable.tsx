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
  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      <style jsx>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .glassmorphism-dark {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .table-3d {
          transform: perspective(1000px) rotateX(5deg);
        }
        .tier-card-3d {
          transform: perspective(1000px) rotateY(0deg);
          transition: all 0.3s ease;
        }
        .tier-card-3d:hover {
          transform: perspective(1000px) rotateY(5deg) translateZ(20px);
        }
        .feature-row-3d {
          transform: perspective(1000px) rotateX(2deg);
        }
        .shadow-3d {
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 10px 20px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .shadow-3d-dark {
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 10px 20px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <Card className="glassmorphism dark:glassmorphism-dark shadow-3d dark:shadow-3d-dark rounded-3xl overflow-hidden border-0">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl">
              <Building2 className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-blue-600 dark:from-white dark:via-orange-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Pricing Tiers Comparison
          </CardTitle>
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] text-xl max-w-3xl mx-auto leading-relaxed">
            Compare all pricing tiers and find the perfect plan for your needs
          </Typography>
        </CardHeader>

        <CardContent className="px-8 pb-12">
          {/* 3D Comparison Table */}
          <div className="table-3d">
            {/* Header Row */}
            <div className="grid grid-cols-7 gap-4 mb-6">
              <div className="col-span-2"></div>
              {PRICING_TIERS.map((tier) => {
                const IconComponent = tierIcons[tier.label as keyof typeof tierIcons]
                const isPopular = tier.popular
                
                return (
                  <div
                    key={tier.label}
                    className={cn(
                      "tier-card-3d glassmorphism dark:glassmorphism-dark rounded-2xl p-6 text-center shadow-3d dark:shadow-3d-dark",
                      isPopular && "ring-2 ring-orange-400 dark:ring-orange-500 scale-105"
                    )}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl shadow-lg",
                        `bg-gradient-to-r ${tier.color} text-white`
                      )}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <Typography variant="h4" className="font-bold text-white dark:text-white mb-2">
                      {tier.label}
                    </Typography>
                    
                    {isPopular && (
                      <Badge className="bg-orange-500 text-white px-3 py-1 mb-3 animate-pulse">
                        ⭐ Most Popular
                      </Badge>
                    )}
                    
                    <div className="space-y-2">
                      <Typography variant="h3" className="text-2xl font-bold text-orange-400 dark:text-orange-300">
                        ${tier.pricePerPoint.toFixed(3)}
                      </Typography>
                      <Typography variant="body-sm" className="text-gray-300 dark:text-gray-300">
                        per point
                      </Typography>
                      <Typography variant="body-sm" className="text-green-400 dark:text-green-300 font-semibold">
                        {tier.savings}% savings
                      </Typography>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Feature Rows */}
            <div className="space-y-4">
              {Object.entries(tierFeatures).map(([tierName, features], featureIndex) => (
                <div key={tierName} className="feature-row-3d">
                  <div className="grid grid-cols-7 gap-4">
                    {/* Feature Label */}
                    <div className="col-span-2 flex items-center">
                      <Typography variant="h4" className="text-lg font-semibold text-white dark:text-white">
                        {tierName} Features
                      </Typography>
                    </div>
                    
                    {/* Feature Checkmarks */}
                    {PRICING_TIERS.map((tier) => {
                      const tierFeatureList = tierFeatures[tier.label as keyof typeof tierFeatures] || []
                      const isCurrentTier = tier.label === tierName
                      
                      return (
                        <div
                          key={`${tier.label}-${tierName}`}
                          className={cn(
                            "tier-card-3d glassmorphism dark:glassmorphism-dark rounded-xl p-4 text-center shadow-3d dark:shadow-3d-dark",
                            isCurrentTier && "ring-2 ring-orange-400 dark:ring-orange-500"
                          )}
                        >
                          {tierFeatureList.map((feature, index) => (
                            <div key={index} className="flex items-center justify-center mb-2">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2 shadow-lg">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                              <Typography variant="body-sm" className="text-gray-300 dark:text-gray-300 font-medium">
                                {feature}
                              </Typography>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary Row */}
            <div className="mt-8 feature-row-3d">
              <div className="grid grid-cols-7 gap-4">
                <div className="col-span-2 flex items-center">
                  <Typography variant="h4" className="text-lg font-semibold text-white dark:text-white">
                    Best For
                  </Typography>
                </div>
                
                {PRICING_TIERS.map((tier) => {
                  const descriptions = {
                    'Starter': 'Individual creators',
                    'Growth': 'Small businesses',
                    'Popular': 'Regular users',
                    'Business': 'Growing teams',
                    'Pro': 'Professional teams',
                    'Enterprise': 'Large organizations'
                  }
                  
                  return (
                    <div
                      key={tier.label}
                      className="tier-card-3d glassmorphism dark:glassmorphism-dark rounded-xl p-4 text-center shadow-3d dark:shadow-3d-dark"
                    >
                      <Typography variant="body-sm" className="text-gray-300 dark:text-gray-300 font-medium">
                        {descriptions[tier.label as keyof typeof descriptions]}
                      </Typography>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="glassmorphism dark:glassmorphism-dark rounded-2xl p-8 shadow-3d dark:shadow-3d-dark">
              <Typography variant="h3" className="text-2xl font-bold text-white dark:text-white mb-4">
                Ready to Choose Your Plan?
              </Typography>
              <Typography variant="body" className="text-gray-300 dark:text-gray-300 mb-6">
                Start with our dynamic pricing slider to find the perfect tier for your needs
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Zap className="h-5 w-5 inline mr-2" />
                  Try Dynamic Pricing
                </button>
                <button className="px-8 py-4 glassmorphism dark:glassmorphism-dark text-white dark:text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-orange-400 dark:border-orange-500">
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
