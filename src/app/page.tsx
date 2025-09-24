import { Button, Typography } from "@/components/ui"
import { User, LogIn } from "lucide-react"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeatureSection } from "@/components/landing/FeatureSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTASection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { ProductShowcaseSection } from "@/components/landing/ProductShowcaseSection"
import { FAQSection } from "@/components/landing/FAQSection"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <Typography variant="h4" className="text-white font-bold">
                Stock Media SaaS
              </Typography>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#how-it-works" className="text-white/90 text-sm hover:text-white transition-colors">How it works</a>
              <a href="#pricing" className="text-white/90 text-sm hover:text-white transition-colors">Pricing</a>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Landing Page Sections */}
      <HeroSection />
      <HowItWorksSection />
      <FeatureSection />
      <ProductShowcaseSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}