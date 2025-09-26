'use client'

import React from "react"
import { Typography } from "@/components/ui"
import { ArrowRight, ShoppingCart, Play } from "lucide-react"
import DemoVideoModal from "@/components/modals/DemoVideoModal"

export default function HowItWorksClient() {
  const [isDemoOpen, setIsDemoOpen] = React.useState(false)

  return (
    <section className="container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="text-center max-w-3xl mx-auto">
        <Typography variant="h1" className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">How It Works</span>
        </Typography>
        <Typography variant="h3" className="text-[hsl(var(--muted-foreground))] text-lg md:text-xl mb-8">
          Paste a stock media URL, confirm points, and download. Three simple steps with fresh links every time.
        </Typography>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setIsDemoOpen(true)} className="inline-flex items-center px-5 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors" aria-label="Watch quick demo">
            <Play className="h-4 w-4 mr-2" aria-hidden="true" />
            Watch demo
          </button>
          <a href="/dashboard/order-v3" className="inline-flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-colors">
            <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
            Start Ordering
          </a>
          <a href="/pricing" className="inline-flex items-center px-5 py-3 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
            View Pricing
            <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </a>
        </div>
      </div>
      <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  )
}


