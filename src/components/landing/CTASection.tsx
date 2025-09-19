'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Typography } from '@/components/ui'
import { ArrowRight, Sparkles, Users, Download, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export const CTASection: React.FC = () => {
  const router = useRouter()

  const handleSignUp = () => {
    router.push('/register')
  }

  const handleLearnMore = () => {
    router.push('/about')
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-orange-600/50" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main CTA Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
              <Typography variant="body-sm" className="text-white/90 font-medium">
                Join the Creative Revolution
              </Typography>
            </div>

            <Typography 
              variant="h2" 
              className="text-4xl md:text-6xl font-bold text-white leading-tight"
            >
              Ready to{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Transform
              </span>{' '}
              Your Creative Workflow?
            </Typography>

            <Typography 
              variant="h4" 
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of creators, designers, and marketers who trust our platform 
              for their content needs. Start your creative journey today.
            </Typography>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 border-2 border-white flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 text-white" />
                  </div>
                ))}
              </div>
              <Typography variant="body-sm" className="text-white/80">
                10,000+ active creators
              </Typography>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Typography variant="body-sm" className="text-white/80">
                4.9/5 average rating
              </Typography>
            </div>

            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-400" />
              <Typography variant="body-sm" className="text-white/80">
                2M+ downloads completed
              </Typography>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={handleSignUp}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Sign Up Now - It's Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleLearnMore}
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
            >
              Learn More About Us
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 border-t border-white/20">
            <Typography variant="body-sm" className="text-white/60 mb-6">
              Trusted by leading companies worldwide
            </Typography>
            
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-white/40 font-semibold text-lg">Netflix</div>
              <div className="text-white/40 font-semibold text-lg">Spotify</div>
              <div className="text-white/40 font-semibold text-lg">Airbnb</div>
              <div className="text-white/40 font-semibold text-lg">Uber</div>
              <div className="text-white/40 font-semibold text-lg">Slack</div>
            </div>
          </div>

          {/* Final Message */}
          <div className="pt-8">
            <Typography variant="body-sm" className="text-white/70">
              No credit card required • Start with 50 free points • Cancel anytime
            </Typography>
          </div>
        </div>
      </div>
    </section>
  )
}
