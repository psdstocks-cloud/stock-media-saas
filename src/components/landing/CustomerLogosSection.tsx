'use client'

import { Typography } from '@/components/ui'
import { useState } from 'react'

// Customer logos - can be replaced with real logos later
const customers = [
  { name: 'TechCorp', logo: 'https://via.placeholder.com/120x40/6366f1/ffffff?text=TechCorp' },
  { name: 'DesignStudio', logo: 'https://via.placeholder.com/120x40/8b5cf6/ffffff?text=DesignStudio' },
  { name: 'Creative Agency', logo: 'https://via.placeholder.com/120x40/ec4899/ffffff?text=CreativeAgency' },
  { name: 'Media House', logo: 'https://via.placeholder.com/120x40/f59e0b/ffffff?text=MediaHouse' },
  { name: 'StartupCo', logo: 'https://via.placeholder.com/120x40/10b981/ffffff?text=StartupCo' },
  { name: 'BrandWorks', logo: 'https://via.placeholder.com/120x40/3b82f6/ffffff?text=BrandWorks' },
  { name: 'ProductionHQ', logo: 'https://via.placeholder.com/120x40/ef4444/ffffff?text=ProductionHQ' },
  { name: 'Innovation Labs', logo: 'https://via.placeholder.com/120x40/14b8a6/ffffff?text=InnovationLabs' },
]

export function CustomerLogosSection() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section className="py-16 border-y border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-12">
          <Typography variant="body" className="text-[hsl(var(--muted-foreground))] font-semibold mb-2">
            TRUSTED BY LEADING BRANDS
          </Typography>
          <Typography variant="h3" className="text-2xl md:text-3xl font-bold">
            Join 10,000+ Happy Customers
          </Typography>
        </div>

        {/* Logos Carousel */}
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-12 items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* First set of logos */}
            <div className={`flex gap-12 items-center min-w-full justify-around ${!isPaused ? 'animate-scroll' : ''}`}>
              {customers.map((customer, index) => (
                <div
                  key={`first-${index}`}
                  className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                    <Typography variant="body" className="font-bold text-lg whitespace-nowrap">
                      {customer.name}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Duplicate for seamless loop */}
            <div className={`flex gap-12 items-center min-w-full justify-around ${!isPaused ? 'animate-scroll' : ''}`}>
              {customers.map((customer, index) => (
                <div
                  key={`second-${index}`}
                  className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
                    <Typography variant="body" className="font-bold text-lg whitespace-nowrap">
                      {customer.name}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <Typography variant="h2" className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              10K+
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Active Users
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h2" className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              500K+
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Downloads
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h2" className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              4.8/5
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              User Rating
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="h2" className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              99.9%
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              Uptime
            </Typography>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  )
}