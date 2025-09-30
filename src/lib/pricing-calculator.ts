export interface PricingTier {
  min: number
  max: number
  pricePerPoint: number
  color: string
  label: string
  popular?: boolean
  savings?: number
}

export interface ValidityOption {
  days: number
  multiplier: number
  label: string
  popular?: boolean
  description: string
}

export interface PricingCalculation {
  points: number
  tier: PricingTier | null
  basePrice: number
  validityMultiplier: number
  totalPrice: number
  savings: number
  pricePerPoint: number
  isEnterprise: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    min: 1,
    max: 10,
    pricePerPoint: 0.50,
    color: 'from-red-500 to-red-600',
    label: 'Starter',
    savings: 0
  },
  {
    min: 11,
    max: 50,
    pricePerPoint: 0.40,
    color: 'from-orange-500 to-orange-600',
    label: 'Growth',
    savings: 20
  },
  {
    min: 51,
    max: 100,
    pricePerPoint: 0.30,
    color: 'from-yellow-500 to-yellow-600',
    label: 'Popular',
    popular: true,
    savings: 40
  },
  {
    min: 101,
    max: 170,
    pricePerPoint: 0.294,
    color: 'from-green-500 to-green-600',
    label: 'Business',
    savings: 41.2
  },
  {
    min: 171,
    max: 400,
    pricePerPoint: 0.26,
    color: 'from-blue-500 to-blue-600',
    label: 'Pro',
    savings: 48
  },
  {
    min: 401,
    max: 500,
    pricePerPoint: 0.24,
    color: 'from-purple-500 to-purple-600',
    label: 'Enterprise',
    savings: 52
  }
]

export const VALIDITY_OPTIONS: ValidityOption[] = [
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

export function calculatePricing(
  points: number,
  validityDays: number = 30
): PricingCalculation {
  // Find the appropriate tier
  const tier = PRICING_TIERS.find(t => points >= t.min && points <= t.max) || null
  
  // Check if it's enterprise (500+ points)
  const isEnterprise = points > 500
  
  // Calculate base price
  const basePrice = tier ? points * tier.pricePerPoint : 0
  
  // Find validity option
  const validityOption = VALIDITY_OPTIONS.find(option => option.days === validityDays)
  const validityMultiplier = validityOption?.multiplier || 1.0
  
  // Calculate total price
  const totalPrice = basePrice * validityMultiplier
  
  // Calculate savings
  const savings = tier ? (basePrice * (tier.savings || 0) / 100) : 0
  
  return {
    points,
    tier,
    basePrice,
    validityMultiplier,
    totalPrice,
    savings,
    pricePerPoint: tier?.pricePerPoint || 0,
    isEnterprise
  }
}

export function getTierForPoints(points: number): PricingTier | null {
  return PRICING_TIERS.find(tier => points >= tier.min && points <= tier.max) || null
}

export function getValidityOption(days: number): ValidityOption | null {
  return VALIDITY_OPTIONS.find(option => option.days === days) || null
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function calculateSavingsPercentage(points: number): number {
  const tier = getTierForPoints(points)
  return tier?.savings || 0
}

export function getRecommendedTier(usagePattern: 'light' | 'medium' | 'heavy'): PricingTier {
  switch (usagePattern) {
    case 'light':
      return PRICING_TIERS[0] // Starter
    case 'medium':
      return PRICING_TIERS[2] // Popular
    case 'heavy':
      return PRICING_TIERS[4] // Pro
    default:
      return PRICING_TIERS[2] // Popular
  }
}
