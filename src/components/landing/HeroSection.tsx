'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Typography } from '@/components/ui'
import { BrandButton } from '@/components/ui/brand-button'
import { ArrowRight, Play, Download, Zap } from 'lucide-react'
import DemoVideoModal from '@/components/modals/DemoVideoModal'

export const HeroSection: React.FC = () => {
  const router = useRouter()
  const [isDemoOpen, setIsDemoOpen] = React.useState(false)

  const handleGetStarted = () => {
    router.push('/register')
  }

  const _handleViewPricing = () => {
    router.push('/pricing')
  }

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center bg-[hsl(var(--background))] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-orange-500/10 dark:from-purple-900/25 dark:to-orange-700/20" />
      
      {/* Animated Background Elements */}
      <div className={"absolute top-20 left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl " + (prefersReduced ? '' : 'animate-pulse')} />
      <div className={"absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl " + (prefersReduced ? '' : 'animate-pulse delay-1000')} />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
            <Zap className="h-4 w-4 text-orange-500 dark:text-orange-400 mr-2" />
            <Typography variant="body-sm" className="text-[hsl(var(--foreground))] font-medium">
              Trusted by 10,000+ creators worldwide
            </Typography>
          </div>

          {/* Main Headline */}
          <Typography 
            variant="h1" 
            className="text-5xl md:text-7xl font-bold text-[hsl(var(--foreground))] leading-tight"
          >
            Unlock{' '}
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Millions
            </span>{' '}
            of Stock Assets,{' '}
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Instantly
            </span>
          </Typography>

          {/* Subheadline */}
          <Typography 
            variant="h3" 
            className="text-xl md:text-2xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto leading-relaxed"
          >
            Access premium stock photos, videos, and audio from top providers. 
            Download instantly with our revolutionary point-based system. 
            No subscriptions, no limits, just pure creativity.
          </Typography>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <BrandButton
              onClick={handleGetStarted}
              aria-label="Get started for free"
              className="px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Get Started for Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </BrandButton>
            
            <Button
              variant="outline"
              size="lg"
            onClick={() => setIsDemoOpen(true)}
            aria-label="Watch quick demo"
              className="px-8 py-4 text-lg font-semibold"
            >
            <Play className="h-5 w-5 mr-2" />
            Watch demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
                2M+
              </Typography>
              <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                Stock Assets
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
                50+
              </Typography>
              <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                Premium Sites
              </Typography>
            </div>
            <div className="text-center">
              <Typography variant="h2" className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
                24/7
              </Typography>
              <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
                Instant Access
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={"absolute bottom-8 left-1/2 transform -translate-x-1/2 " + (prefersReduced ? '' : 'animate-bounce')}>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
    <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </>
  )
}
