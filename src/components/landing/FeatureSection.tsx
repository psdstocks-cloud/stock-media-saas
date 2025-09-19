'use client'

import React from 'react'
import { Card, CardContent, Typography } from '@/components/ui'
import { 
  Zap, 
  Shield, 
  Globe, 
  Download, 
  Search, 
  Clock,
  Users,
  Star,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Zap,
    title: "Instant Downloads",
    description: "Get your assets immediately after purchase. No waiting, no delays, just instant access to premium content.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find exactly what you need with our AI-powered search. Filter by type, category, color, and more.",
    color: "from-blue-500 to-purple-500"
  },
  {
    icon: Shield,
    title: "Royalty-Free License",
    description: "Use your downloads anywhere, anytime. Commercial use included with every purchase.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Globe,
    title: "Global Collection",
    description: "Access content from 50+ premium stock sites worldwide. From Getty to Shutterstock and beyond.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Download whenever inspiration strikes. Our platform never sleeps, and neither does your creativity.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share downloads with your team. Perfect for agencies, studios, and creative collectives.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Only the highest quality assets. Curated collections from professional photographers and artists.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Download in your preferred format. High-res images, 4K videos, and lossless audio files.",
    color: "from-teal-500 to-cyan-500"
  },
  {
    icon: CheckCircle,
    title: "No Subscriptions",
    description: "Pay only for what you use. No monthly fees, no hidden costs, just transparent pricing.",
    color: "from-emerald-500 to-green-500"
  }
]

export const FeatureSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our Platform?
          </Typography>
          <Typography variant="h4" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to bring your creative vision to life, 
            powered by cutting-edge technology and premium content.
          </Typography>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r mb-6 group-hover:scale-110 transition-transform duration-300",
                    feature.color
                  )}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <Typography variant="h4" className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body" className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Typography variant="h3" className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to unlock unlimited creative potential?
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-8">
            Join thousands of creators who trust our platform for their content needs.
          </Typography>
        </div>
      </div>
    </section>
  )
}
