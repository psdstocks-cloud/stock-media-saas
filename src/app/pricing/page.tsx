import { Typography, Button } from "@/components/ui"
import { Check, Star, Users, Zap, Crown } from "lucide-react"
import { PricingSection } from "@/components/landing/PricingSection"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h4" className="font-bold">
                Stock Media SaaS
              </Typography>
            </div>
            <div className="flex items-center space-x-4">
              <Typography variant="body-sm" className="text-muted-foreground">
                Pricing
              </Typography>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-4xl md:text-6xl font-bold mb-6">
            Simple, <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Transparent</span> Pricing
          </Typography>
          <Typography variant="h3" className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Pay only for what you use. No subscriptions, no hidden fees, just straightforward pricing that scales with your needs.
          </Typography>
          <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
            <Star className="h-4 w-4 text-orange-500 mr-2" />
            <Typography variant="body-sm" className="text-orange-700 font-medium">
              Most Popular: Professional Pack
            </Typography>
          </div>
        </div>

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <section className="mt-24">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </Typography>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                How does the point system work?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Each point pack gives you a certain number of points that you can use to download premium content. 
                Points never expire and you can purchase additional packs anytime. Most images cost 10-50 points, 
                videos cost 50-200 points, and audio files cost 20-100 points.
              </Typography>
            </div>
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                What's included with my purchase?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Every download includes commercial licensing, allowing you to use the content in client projects, 
                marketing materials, and commercial applications. You also get access to high-resolution files 
                and multiple format options.
              </Typography>
            </div>
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Can I share downloads with my team?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Yes! With Professional and Enterprise packs, you can share your downloads with team members. 
                Enterprise plans include advanced team management features and custom integrations.
              </Typography>
            </div>
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Do points expire?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                No, your points never expire. You can use them whenever you need them, making our system perfect 
                for both regular users and occasional creators.
              </Typography>
            </div>
            <div className="border-b pb-6">
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                What if I need more points?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                You can purchase additional point packs anytime. We also offer bulk discounts for large orders 
                and custom enterprise solutions for high-volume users.
              </Typography>
            </div>
            <div>
              <Typography variant="h3" className="text-xl font-semibold mb-3">
                Is there a free trial?
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Yes! New users get 50 free points to try our platform. You can explore our entire library and 
                download content without any commitment. No credit card required.
              </Typography>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mt-24">
          <Typography variant="h2" className="text-3xl font-bold text-center mb-12">
            Compare Plans
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Features</th>
                  <th className="border border-gray-200 px-6 py-4 text-center font-semibold">Starter</th>
                  <th className="border border-gray-200 px-6 py-4 text-center font-semibold bg-orange-50">Professional</th>
                  <th className="border border-gray-200 px-6 py-4 text-center font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Premium Points</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">100</td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">500</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">1,000</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Access to All Sites</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Commercial License</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Team Sharing</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Priority Support</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Bulk Downloads</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Dedicated Manager</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-6 py-4 font-medium">Custom Integrations</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center bg-orange-50">-</td>
                  <td className="border border-gray-200 px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 text-center bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-12">
          <Typography variant="h2" className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who trust our platform for their content needs. 
            Start with 50 free points and see the difference.
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/register" 
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Free Trial
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <Users className="h-5 w-5 mr-2" />
              Contact Sales
            </a>
          </div>
        </section>
      </main>

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

