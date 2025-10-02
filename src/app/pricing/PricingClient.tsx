'use client'

import { useState, KeyboardEvent } from 'react'
import { Typography, Button } from "@/components/ui"
import { Check, Star, Users, Zap, Crown, CreditCard, Calendar } from "lucide-react"
import { PricingSection } from "@/components/landing/PricingSection"
import { SubscriptionPlansSection } from "@/components/landing/SubscriptionPlansSection"
import { DynamicPricingSlider } from "@/components/landing/DynamicPricingSlider"
import PricingComparisonTable from "@/components/landing/PricingComparisonTable"

export default function PricingClient() {
  const [pricingMode, setPricingMode] = useState<'pay-as-you-go' | 'subscriptions' | 'dynamic'>('dynamic')

  const handleToggleKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setPricingMode((m) => {
        if (m === 'dynamic') return 'pay-as-you-go'
        if (m === 'pay-as-you-go') return 'subscriptions'
        return 'dynamic'
      })
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setPricingMode((m) => {
        if (m === 'dynamic') return 'subscriptions'
        if (m === 'subscriptions') return 'pay-as-you-go'
        return 'dynamic'
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-16">
          <Typography variant="h1" className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6">
            Simple, <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Transparent</span> Pricing
          </Typography>
          <Typography variant="h3" className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-8 px-4">
            Choose the pricing model that works best for you. Dynamic pricing, pay as you go, or subscribe for monthly savings.
          </Typography>

          {/* Pricing Mode Toggle */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div
              className="bg-[hsl(var(--muted))] p-1 rounded-lg inline-flex w-full max-w-2xl"
              role="radiogroup"
              aria-label="Pricing mode"
              onKeyDown={handleToggleKeys}
            >
              <Button
                role="radio"
                aria-checked={pricingMode === 'dynamic'}
                aria-controls="dynamic-panel"
                variant={pricingMode === 'dynamic' ? 'default' : 'ghost'}
                onClick={() => setPricingMode('dynamic')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all duration-200 flex-1 text-sm sm:text-base ${
                  pricingMode === 'dynamic'
                    ? 'bg-[hsl(var(--card))] shadow-sm text-[hsl(var(--card-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
                Dynamic Pricing
              </Button>
              <Button
                role="radio"
                aria-checked={pricingMode === 'pay-as-you-go'}
                aria-controls="payg-panel"
                variant={pricingMode === 'pay-as-you-go' ? 'default' : 'ghost'}
                onClick={() => setPricingMode('pay-as-you-go')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all duration-200 flex-1 text-sm sm:text-base ${
                  pricingMode === 'pay-as-you-go'
                    ? 'bg-[hsl(var(--card))] shadow-sm text-[hsl(var(--card-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                Pay As You Go
              </Button>
              <Button
                role="radio"
                aria-checked={pricingMode === 'subscriptions'}
                aria-controls="subs-panel"
                variant={pricingMode === 'subscriptions' ? 'default' : 'ghost'}
                onClick={() => setPricingMode('subscriptions')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all duration-200 flex-1 text-sm sm:text-base ${
                  pricingMode === 'subscriptions'
                    ? 'bg-[hsl(var(--card))] shadow-sm text-[hsl(var(--card-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
                Monthly Subscriptions
              </Button>
            </div>
          </div>

          {pricingMode === 'dynamic' && (
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-full" aria-live="polite">
              <Zap className="h-4 w-4 text-purple-500 mr-2" aria-hidden="true" />
              <Typography variant="body-sm" className="text-purple-700 dark:text-purple-300 font-medium">
                New: Dynamic Pricing - The more you buy, the less you pay!
              </Typography>
            </div>
          )}

          {pricingMode === 'pay-as-you-go' && (
            <div className="inline-flex items-center px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full" aria-live="polite">
              <Star className="h-4 w-4 text-orange-500 mr-2" aria-hidden="true" />
              <Typography variant="body-sm" className="text-orange-700 dark:text-orange-300 font-medium">
                Most Popular: Professional Pack
              </Typography>
            </div>
          )}
          
          {pricingMode === 'subscriptions' && (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full" aria-live="polite">
              <Crown className="h-4 w-4 text-blue-500 mr-2" aria-hidden="true" />
              <Typography variant="body-sm" className="text-blue-700 dark:text-blue-300 font-medium">
                Best Value: Pro Monthly Plan
              </Typography>
            </div>
          )}

          {/* Trial Banner */}
          <div className="mt-6 md:mt-8 max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 md:p-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-2 sm:mb-0 sm:mr-4">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Typography variant="h3" className="text-xl md:text-2xl font-bold text-green-800 dark:text-green-200">
                    Start with 10 Free Points
                  </Typography>
                  <Typography variant="body" className="text-green-700 dark:text-green-300 text-sm md:text-base">
                    No credit card required • Try all features
                  </Typography>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">1 free download</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Access to all platforms</span>
                </div>
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Commercial license included</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id={pricingMode === 'dynamic' ? 'dynamic-panel' : pricingMode === 'pay-as-you-go' ? 'payg-panel' : 'subs-panel'} aria-live="polite">
          {pricingMode === 'dynamic' ? (
            <DynamicPricingSlider />
          ) : pricingMode === 'pay-as-you-go' ? (
            <PricingSection />
          ) : (
            <SubscriptionPlansSection />
          )}
        </div>

        {/* Pricing Comparison Table */}
        <section className="mt-24">
          <PricingComparisonTable />
        </section>

        {/* FAQ Section */}
        <section className="mt-24">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12 text-[hsl(var(--foreground))]">
            Frequently Asked Questions
          </Typography>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                What's the difference between Pay As You Go and Subscriptions?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Pay As You Go lets you buy points when you need them - perfect for occasional users. 
                Monthly subscriptions give you points automatically every month at a better value - ideal for regular users. 
                Both include the same features and commercial licensing.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                How does the point system work?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Each download costs 10 points regardless of the original price. Points never expire and you can 
                purchase additional packs anytime. With subscriptions, you get fresh points delivered monthly.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Can I cancel my subscription anytime?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Yes! You can cancel or change your subscription anytime from your dashboard. Your points will 
                remain in your account and you can continue using them even after cancellation.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                What's included with my purchase?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Every download includes commercial licensing, allowing you to use the content in client projects, 
                marketing materials, and commercial applications. You also get access to high-resolution files 
                and multiple format options.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Can I switch between Pay As You Go and Subscriptions?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Absolutely! You can have both point packs and subscriptions. Your points are combined in one account, 
                and you can manage everything from your dashboard.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                How does dynamic pricing work?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Dynamic pricing offers volume discounts - the more points you buy, the less you pay per point. 
                You can choose from 1-500 points with 6 different pricing tiers, plus flexible validity periods 
                (30, 60, 90 days, or 1 year). For 500+ points, contact our sales team for custom enterprise pricing.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                What's the difference between validity periods?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Standard 30-day validity is included at no extra cost. Extended periods add a small premium: 
                60 days (+15%), 90 days (+25%), or 1 year (+40%). This gives you more time to use your points 
                without pressure, perfect for long-term projects.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Is there a free trial?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Yes! New users get 10 free points to try our platform. You can explore our entire library and
                download content without any commitment. No credit card required.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                What payment methods do you accept?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. 
                All payments are processed securely through Stripe with 256-bit SSL encryption.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Do you offer refunds?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Yes, we offer a 30-day money-back guarantee for all purchases. If you're not satisfied with our service, 
                contact our support team within 30 days for a full refund.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Can I upgrade or downgrade my plan?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Absolutely! You can change your subscription plan anytime from your dashboard. Upgrades take effect immediately, 
                while downgrades take effect at your next billing cycle.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Are there any hidden fees?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                No hidden fees! The price you see is the price you pay. All taxes are included in the displayed price, 
                and there are no setup fees, cancellation fees, or surprise charges.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                Do you offer enterprise pricing?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Yes! For teams of 10+ users or high-volume needs, we offer custom enterprise pricing with dedicated support, 
                custom integrations, and volume discounts. Contact our sales team for a personalized quote.
              </Typography>
            </div>
            <div className="border-b border-[hsl(var(--border))] pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                How does the rollover system work?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                Unused points from your monthly subscription roll over to the next month up to your plan's rollover limit. 
                For example, if you have 100 points left and a 50% rollover limit, 50 points will carry over to next month.
              </Typography>
            </div>
            <div>
              <Typography variant="h3" className="text-xl font-semibold mb-3 text-[hsl(var(--foreground))]">
                What happens if I exceed my point limit?
              </Typography>
              <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
                If you run out of points, you can purchase additional point packs or upgrade your plan. We'll notify you 
                when you're running low on points so you can plan accordingly.
              </Typography>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mt-16 md:mt-24">
          <Typography variant="h2" className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-[hsl(var(--foreground))] px-4">
            Compare Plans
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--card))] min-w-[600px]">
              <caption className="sr-only">Feature comparison of Starter, Professional and Enterprise plans</caption>
              <thead>
                <tr className="bg-[hsl(var(--muted))]">
                  <th scope="col" className="border border-[hsl(var(--border))] px-3 md:px-6 py-4 text-left font-semibold text-[hsl(var(--foreground))] text-sm md:text-base">Features</th>
                  <th scope="col" className="border border-[hsl(var(--border))] px-3 md:px-6 py-4 text-center font-semibold text-[hsl(var(--foreground))] text-sm md:text-base">Starter</th>
                  <th scope="col" className="border border-[hsl(var(--border))] px-3 md:px-6 py-4 text-center font-semibold bg-orange-50 dark:bg-orange-900/20 text-[hsl(var(--foreground))] text-sm md:text-base">Professional</th>
                  <th scope="col" className="border border-[hsl(var(--border))] px-3 md:px-6 py-4 text-center font-semibold text-[hsl(var(--foreground))] text-sm md:text-base">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Premium Points</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--foreground))]">100</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20 text-[hsl(var(--foreground))]">500</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--foreground))]">1,000</td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Access to All Sites</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Commercial License</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Team Sharing</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Priority Support</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Bulk Downloads</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Dedicated Manager</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20 text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="border border-[hsl(var(--border))] px-6 py-4 font-medium text-[hsl(var(--foreground))]">Custom Integrations</th>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center bg-orange-50 dark:bg-orange-900/20 text-[hsl(var(--muted-foreground))]">-</td>
                  <td className="border border-[hsl(var(--border))] px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" aria-hidden="true" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 md:mt-24 text-center bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl p-6 md:p-12 mx-4 md:mx-0">
          <Typography variant="h2" className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-[hsl(var(--foreground))]">
            Ready to Get Started?
          </Typography>
          <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            Join thousands of creators who trust our platform for their content needs. 
            Start with 10 free points and see the difference.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <a 
              href="/register" 
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm md:text-base"
            >
              <Zap className="h-4 w-4 md:h-5 md:w-5 mr-2" aria-hidden="true" />
              Start Free Trial
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-semibold rounded-lg hover:bg-[hsl(var(--muted))] transition-all duration-200 text-sm md:text-base"
            >
              <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" aria-hidden="true" />
              Contact Sales
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Typography variant="body-sm" className="text-muted-foreground">
              © 2024 Stock Media SaaS. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  )
}


