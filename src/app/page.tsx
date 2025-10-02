import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Typography } from "@/components/ui"
import { User, LogIn } from "lucide-react"
import { HeroSection } from "@/components/landing/HeroSection"
import { TrustBadgesSection } from "@/components/landing/TrustBadgesSection"
import { CustomerLogosSection } from "@/components/landing/CustomerLogosSection"
import { NewsletterSection } from "@/components/landing/NewsletterSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { ExitIntentPopup } from "@/components/ExitIntentPopup"
import { SocialProofTicker } from "@/components/SocialProofTicker"

// Lazy load below-the-fold components for better initial load performance
const HowItWorksSection = dynamic(() => import('@/components/landing/HowItWorksSection').then(mod => ({ default: mod.HowItWorksSection })), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>
})

const FeatureSection = dynamic(() => import('@/components/landing/FeatureSection').then(mod => ({ default: mod.FeatureSection })), {
  loading: () => <div className="min-h-[400px]"></div>
})

const ProductShowcaseSection = dynamic(() => import('@/components/landing/ProductShowcaseSection').then(mod => ({ default: mod.ProductShowcaseSection })), {
  loading: () => <div className="min-h-[400px]"></div>
})

const PricingSection = dynamic(() => import('@/components/landing/PricingSection').then(mod => ({ default: mod.PricingSection })), {
  loading: () => <div className="min-h-[600px]"></div>
})

const FAQSection = dynamic(() => import('@/components/landing/FAQSection').then(mod => ({ default: mod.FAQSection })), {
  loading: () => <div className="min-h-[400px]"></div>
})

const CTASection = dynamic(() => import('@/components/landing/CTASection').then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="min-h-[300px]"></div>
})

const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <div className="min-h-[200px]"></div>
})

export const revalidate = 120

// Enhanced SEO Metadata for Homepage
export const metadata: Metadata = {
  title: "Stock Media SaaS - Access 25+ Premium Stock Sites with One Subscription",
  description: "Download premium stock photos, videos, vectors, and music from 25+ sites including Shutterstock, Adobe Stock, and Freepik. Point-based system with smart rollover. Start free!",
  keywords: [
    "stock media",
    "stock photos",
    "stock videos",
    "stock music",
    "shutterstock alternative",
    "adobe stock",
    "freepik",
    "subscription",
    "point system",
    "creative assets",
    "royalty free",
    "commercial license"
  ],
  authors: [{ name: "Stock Media SaaS Team" }],
  creator: "Stock Media SaaS",
  publisher: "Stock Media SaaS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://stock-media-saas.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Stock Media SaaS - Access 25+ Premium Stock Sites",
    description: "Download premium stock photos, videos, vectors from Shutterstock, Adobe Stock, Freepik & more. Point-based subscription with smart rollover. Try free!",
    url: '/',
    siteName: 'Stock Media SaaS',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Stock Media SaaS - Access Premium Stock Media',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Stock Media SaaS - 25+ Premium Stock Sites",
    description: "Download from Shutterstock, Adobe Stock, Freepik & more with one subscription. Smart point system with rollover.",
    images: ['/og-image.jpg'],
    creator: '@stockmediasaas',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual code
    // yandex: 'your-yandex-code',
    // bing: 'your-bing-code',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Exit Intent Popup */}
      <ExitIntentPopup />
      
      {/* Social Proof Ticker */}
      <SocialProofTicker />
      

      {/* Landing Page Sections */}
      <HeroSection />
      <TrustBadgesSection />
      <CustomerLogosSection />
      <HowItWorksSection />
      <FeatureSection />
      <ProductShowcaseSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <NewsletterSection />
      <CTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}